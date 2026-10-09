import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { SHOPPING_ITEMS } from '../../data/shopping'
import {
  alternativesOf,
  atomicBundleId,
  bundleMembersOf,
  canonicalSightId,
  complexFor,
  includedClockOf,
  intelligenceUnits,
  isAtomicExclusive,
  parentTourIdOf,
  sequenceOf,
  sightAccess,
  walkClusterId,
} from './sightIntelligence'

/**
 * Planner context for every catalog sight. Overlay facts are the ones a desk
 * agent uses (same-tour stops, best clock) — sourced from published day-cruise
 * and city itineraries (Ha Long day boats list Sung Sot then Ti Top after
 * onboard lunch; Sapa is reached overland from HAN, not by its own airport).
 * Catalog copy fills what / when for everything else.
 */
export type SightPlanningContext = {
  id: string
  what: string
  bestWhen: string
  bundleId: string | null
  bundledWith: string[]
  /** Already inside a parent tour selected the same day — do not add a second outing. */
  includedInParent: boolean
  /** Clock shown when this stop rides inside a parent tour. */
  includedClock?: string
  note: string
}

export function bundleIdFor(id: string): string | null {
  return atomicBundleId(id)
}

export function bundleMembers(bundleId: string): string[] {
  return bundleMembersOf(bundleId)
}

export function parentTourId(id: string): string | null {
  return parentTourIdOf(id)
}

function selectedCanon(selectedIds: string[]): Set<string> {
  return new Set(selectedIds.map(canonicalSightId))
}

function effectiveParent(id: string, selectedIds: string[]): string | null {
  const parent = parentTourId(id)
  const selected = selectedCanon(selectedIds)
  if (parent && selected.has(canonicalSightId(parent))) return parent
  const complex = complexFor(id)
  if (!complex) return null
  if (complex.kind !== 'contains' && complex.kind !== 'same-ticket' && complex.kind !== 'same-park') {
    return null
  }
  const unit = intelligenceUnits(selectedIds).find((row) => row.includes(id) || row.some((sid) => canonicalSightId(sid) === canonicalSightId(id)))
  if (!unit || unit.length < 2) return null
  const head = unit[0]
  if (canonicalSightId(head) === canonicalSightId(id)) return null
  if (sequenceOf(id) <= sequenceOf(head)) return null
  // Standing in for an unselected parent, a short stop cannot carry a longer visit (harbour vs. theme park).
  if (catalogDurationHours(id) > catalogDurationHours(head)) return null
  return head
}

const RELATED_MEMO = new Map<string, Set<string>>()

function relatedIds(id: string): Set<string> {
  const hit = RELATED_MEMO.get(id)
  if (hit) return hit
  const out = new Set<string>([canonicalSightId(id)])
  const parent = parentTourId(id)
  if (parent) out.add(canonicalSightId(parent))
  const complex = complexFor(id)
  if (complex) {
    out.add(canonicalSightId(complex.parentId))
    for (const member of complex.members) out.add(canonicalSightId(member.id))
  }
  RELATED_MEMO.set(id, out)
  return out
}

/**
 * Cache key for answers about `id` that depend on the selection: only its own
 * outing, parent tour and complex mates can change them.
 */
export function selectionKeyFor(id: string, selectedIds: string[]): string {
  return selectionEntry(id, selectedIds).key
}

type SelectionEntry = { key: string; at: number[]; ids: string[]; memo: Map<string, unknown> }

/**
 * Per-selection scratch space for answers about `id`. Cheaper than hashing the
 * selection key again when a big walk cluster makes that key long.
 */
export function selectionMemo<T>(id: string, selectedIds: string[], name: string, compute: () => T): T {
  const memo = selectionEntry(id, selectedIds).memo
  if (memo.has(name)) return memo.get(name) as T
  const out = compute()
  memo.set(name, out)
  return out
}

function selectionEntry(id: string, selectedIds: string[]): SelectionEntry {
  let sel = selectionIndex(selectedIds)
  const hit = sel.keys.get(id)
  if (hit) {
    if (hit.at.every((i, k) => selectedIds[i] === hit.ids[k])) return hit
    // The array was edited in place since it was indexed.
    sel = selectionIndex(selectedIds, true)
  }
  const found = new Set<number>()
  for (const canon of relatedIds(id)) for (const i of sel.byCanon.get(canon) ?? []) found.add(i)
  const cluster = walkClusterId(id)
  if (cluster != null) for (const i of sel.byCluster.get(cluster) ?? []) found.add(i)
  const at = [...found].sort((a, b) => a - b)
  const ids = at.map((i) => selectedIds[i])
  const entry: SelectionEntry = { key: `${id}\u0001${ids.join(',')}`, at, ids, memo: new Map() }
  sel.keys.set(id, entry)
  return entry
}

type SelectionIndex = {
  length: number
  byCanon: Map<string, number[]>
  byCluster: Map<string, number[]>
  keys: Map<string, SelectionEntry>
}
/** Selections are asked about thousands of times while a trip is fitted; index each one once. */
const SELECTION_INDEX = new WeakMap<string[], SelectionIndex>()

function selectionIndex(selectedIds: string[], rebuild = false): SelectionIndex {
  const hit = SELECTION_INDEX.get(selectedIds)
  if (hit && !rebuild && hit.length === selectedIds.length) return hit
  const byCanon = new Map<string, number[]>()
  const byCluster = new Map<string, number[]>()
  selectedIds.forEach((sid, i) => {
    const canon = canonicalSightId(sid)
    byCanon.set(canon, [...(byCanon.get(canon) ?? []), i])
    const cluster = walkClusterId(sid)
    if (cluster != null) byCluster.set(cluster, [...(byCluster.get(cluster) ?? []), i])
  })
  const out: SelectionIndex = { length: selectedIds.length, byCanon, byCluster, keys: new Map() }
  SELECTION_INDEX.set(selectedIds, out)
  return out
}

const COMPANION_MEMO = new Map<string, boolean>()

export function isIncludedCompanion(id: string, selectedIds: string[]): boolean {
  return selectionMemo(id, selectedIds, 'companion', () => memoCompanion(id, selectedIds))
}

function memoCompanion(id: string, selectedIds: string[]): boolean {
  const key = selectionKeyFor(id, selectedIds)
  const hit = COMPANION_MEMO.get(key)
  if (hit !== undefined) return hit
  if (COMPANION_MEMO.size > 50_000) COMPANION_MEMO.clear()
  const out =
    selectedIds.some((sid) => sid === id || canonicalSightId(sid) === canonicalSightId(id)) &&
    Boolean(effectiveParent(id, selectedIds))
  COMPANION_MEMO.set(key, out)
  return out
}

const DURATION_MEMO = new Map<string, number>()

function catalogDurationHours(id: string): number {
  const hit = DURATION_MEMO.get(id)
  if (hit !== undefined) return hit
  const canon = canonicalSightId(id)
  const out = EXPERIENCES.find((e) => e.id === id || e.id === canon)?.durationHours ?? 0
  DURATION_MEMO.set(id, out)
  return out
}

/** Landings on a trek / boat / cable / exclusive day-trip — clocks sit on the parent outing. */
export function isTimedLanding(id: string, selectedIds: string[]): boolean {
  if (!isIncludedCompanion(id, selectedIds)) return false
  // A full-day park the traveller added is a real visit, not a 20-minute overlay.
  // Trek villages and cave landings stay on the parent outing.
  if (catalogDurationHours(id) >= 6) return false
  const complex = complexFor(id)
  const access = complex?.access ?? sightAccess(id)
  return Boolean(
    complex?.exclusive ||
      access === 'trek' ||
      access === 'boat' ||
      access === 'cable' ||
      access === 'day-trip',
  )
}

export function includedStopClock(id: string): string | undefined {
  return includedClockOf(id)
}

function firstSentence(text?: string): string {
  if (!text) return ''
  const match = text.match(/^.+?(?<!\b(?:St|Mr|Mrs|Ms|Dr|vs|No|Mt))\.(?:\s|$)/)
  const cut = (match?.[0] ?? text).replace(/\s+/g, ' ').trim()
  if (cut.length >= 12) return cut
  return text.replace(/\s+/g, ' ').trim().slice(0, 180)
}

function catalogName(id: string): string {
  const canon = canonicalSightId(id)
  return (
    EXPERIENCES.find((e) => e.id === id || e.id === canon)?.name ??
    CITY_ACTIVITIES.find((a) => a.id === id || a.id === canon)?.name ??
    SHOPPING_ITEMS.find((s) => s.id === id)?.name ??
    id
  )
}

function catalogCopy(id: string): { what: string; bestWhen: string } {
  const canon = canonicalSightId(id)
  const exp = EXPERIENCES.find((e) => e.id === id) ?? EXPERIENCES.find((e) => e.id === canon)
  const act = CITY_ACTIVITIES.find((a) => a.id === id) ?? CITY_ACTIVITIES.find((a) => a.id === canon)
  const shop = SHOPPING_ITEMS.find((s) => s.id === id)
  const what =
    firstSentence(exp?.cardSummary) ||
    firstSentence(exp?.about) ||
    exp?.hook ||
    firstSentence(act?.cardSummary) ||
    act?.hook ||
    firstSentence(shop?.blurb) ||
    shop?.name ||
    'Sightseeing stop'
  const bestWhen = exp?.bestTime ?? act?.bestTime ?? 'Daytime, when it is open'
  return { what, bestWhen }
}

function accessNote(id: string): string | null {
  const access = sightAccess(id)
  if (access === 'boat') return 'Reached by boat — not a taxi stop from town'
  if (access === 'trek') return 'Needs a licensed trek / loop day, not a short city hop'
  if (access === 'cable') return 'Cable-car / funicular outing — allow a half day at the station'
  if (access === 'day-trip') return 'Owns a countryside block; do not treat as a downtown walk'
  return null
}

function relationNote(id: string, selectedIds: string[]): string {
  const included = isIncludedCompanion(id, selectedIds)
  const parent = effectiveParent(id, selectedIds) ?? parentTourId(id)
  const alts = alternativesOf(id)
  const complex = complexFor(id)
  const access = accessNote(id)

  if (included && parent) {
    return `Done on the same outing as ${catalogName(parent)} — not a separate trip`
  }
  if (parent && complex?.kind === 'contains') {
    return `Landing on the ${catalogName(parent)} outing when that card is also selected`
  }
  if (parent && (complex?.kind === 'same-ticket' || complex?.kind === 'same-park')) {
    return `Inside the same ticketed complex as ${catalogName(parent)} — walk it on that visit`
  }
  if (alts.length) {
    return `Same-role alternative to ${alts.map(catalogName).join(' / ')} — pick one outing, not both`
  }
  if (complex?.kind === 'same-day') {
    const mates = complex.members
      .map((row) => row.id)
      .filter((other) => other !== canonicalSightId(id))
      .slice(0, 3)
      .map(catalogName)
    if (mates.length) return `Same countryside / walking day as ${mates.join(', ')}`
  }
  if (access) return access
  return ''
}

export function sightPlanning(id: string, selectedIds: string[] = []): SightPlanningContext {
  const { what, bestWhen } = catalogCopy(id)
  const bundleId = bundleIdFor(id)
  const bundledWith = bundleId
    ? bundleMembers(bundleId).filter((other) => canonicalSightId(other) !== canonicalSightId(id))
    : []
  const includedInParent = isIncludedCompanion(id, selectedIds)
  const related = relationNote(id, selectedIds)
  const note = related || (bestWhen ? `Best: ${bestWhen}` : what)
  return {
    id,
    what,
    bestWhen,
    bundleId,
    bundledWith,
    includedInParent,
    includedClock: includedStopClock(id),
    note: includedInParent ? related || note : note,
  }
}

export function planningNoteFor(id: string, selectedIds: string[] = []): string {
  const ctx = sightPlanning(id, selectedIds)
  if (ctx.includedInParent) return ctx.note
  const bits = [ctx.what, ctx.note && ctx.note !== ctx.what ? ctx.note : `Best: ${ctx.bestWhen}`]
  return bits.filter(Boolean).join('. ').replace(/\.\./g, '.')
}

export { isAtomicExclusive, intelligenceUnits }
