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
  return head
}

export function isIncludedCompanion(id: string, selectedIds: string[]): boolean {
  if (!selectedIds.some((sid) => sid === id || canonicalSightId(sid) === canonicalSightId(id))) {
    return false
  }
  return Boolean(effectiveParent(id, selectedIds))
}

function catalogDurationHours(id: string): number {
  const canon = canonicalSightId(id)
  return (
    EXPERIENCES.find((e) => e.id === id || e.id === canon)?.durationHours ??
    CITY_ACTIVITIES.find((a) => a.id === id || a.id === canon)?.durationHours ??
    0
  )
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
