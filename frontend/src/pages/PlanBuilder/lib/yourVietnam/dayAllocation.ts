import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { shoppingHoursForId } from '../../data/shopping'
import {
  activityHours,
  occupancyConflicts,
  occupancyFamilyActivity,
  occupancyFamilyExperience,
  type OccupancyFamily,
} from './tripIntelligence'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import { haversineRoadKm, hopHoursBetween, peekRoute } from './osrmRoute'
import { placeCoords } from './cityPins'
import type { PlaceId } from '../../../GettingAround/data/types'
import {
  haversineKm,
  kMeansClusterIds,
  orderSourceIdsByProximity,
  type PinCoord,
} from './sightOrder'
import {
  catalogHoursForSource,
  earliestOpenAt,
  latestClose,
  tripIsoDate,
  weekdayFromIso,
} from './openingHours'
import { DAY_CLOSE, DAY_OPEN, EVENING_EARLIEST_START } from './dayWindows'
import { groupIdForSourceId, timePreferenceForSourceId } from './sightTiming'
import { bundleIdFor, bundleMembers, isTimedLanding } from './sightPlanning'
import {
  isAtomicExclusive,
  walkClusterId,
  complexFor,
  canonicalSightId,
  hardOutingId,
  sequenceOf,
  SIGHT_COMPLEXES,
} from './sightIntelligence'
import { defaultVisitHours, snapVisitHours } from './visitHours'
import { stayDayBounds } from './stayShape'

export { DAY_CLOSE, DAY_OPEN }

/**
 * The only hard ceiling on a day: total scheduled sight duration.
 * There is deliberately no per-day or per-period sight *count* limit — a day of
 * five short stops is fine, and counting stops produced false "day is full" reports.
 */
export const DAY_MAX_HOURS = 8

const FAR_KM = 1e4

const EXPERIENCE_BY_ID = new Map(EXPERIENCES.map((e) => [e.id, e]))
const ACTIVITY_BY_ID = new Map(CITY_ACTIVITIES.map((a) => [a.id, a]))

const CATALOG_HOURS_MEMO = new Map<string, number>()

export function catalogHoursForSourceId(id: string): number {
  const hit = CATALOG_HOURS_MEMO.get(id)
  if (hit !== undefined) return hit
  const out = computeCatalogHours(id)
  CATALOG_HOURS_MEMO.set(id, out)
  return out
}

function computeCatalogHours(id: string): number {
  const exp = EXPERIENCE_BY_ID.get(id)
  if (exp) return snapVisitHours(exp.durationHours || 2.5)
  const act = ACTIVITY_BY_ID.get(id)
  if (act) return snapVisitHours(activityHours(act))
  const shopHours = shoppingHoursForId(id)
  if (shopHours != null) return snapVisitHours(shopHours)
  return snapVisitHours(2.5)
}

export function catalogPriorityForSourceId(id: string): number {
  const exp = EXPERIENCE_BY_ID.get(id)
  if (exp) {
    const crowd = exp.rating * Math.log10(1 + (exp.reviewCount ?? 0))
    // Review counts alone rank a busy side street over the city's must-see.
    const picked = (exp.featured ? 3 : 0) + (exp.popularityTag === 'Must do' ? 2 : 0)
    const rank = exp.popularityRank ? Math.max(0, 20 - exp.popularityRank) * 0.15 : 0
    return crowd + picked + rank
  }
  const act = ACTIVITY_BY_ID.get(id)
  if (act) return (act.rating ?? 4.5) * Math.log10(1 + 80)
  return 0
}

function hoursKindForId(id: string): 'experience' | 'activity' | 'shopping' {
  if (EXPERIENCE_BY_ID.has(id)) return 'experience'
  if (ACTIVITY_BY_ID.has(id)) return 'activity'
  return 'shopping'
}

export function isSourceClosedOnDate(id: string, isoDate: string): boolean {
  if (!isoDate) return false
  const hours = catalogHoursForSource(hoursKindForId(id), id, weekdayFromIso(isoDate), isoDate)
  return hours.closedToday
}

function collapseEmptyDays(days: string[][], keepEmpty = false): string[][] {
  if (keepEmpty) return days.map((ids) => [...ids])
  return days.filter((ids) => ids.length > 0)
}

function rowOwnsTheDay(ids: string[], allIds: string[]): boolean {
  return ids.some((id) => isExclusiveDayTrip(id)) && unitTakesWholeDay(
    { ids, exclusive: true },
    allIds,
  )
}

/**
 * Fill day 1, then day 2. Never keep a thin extra day that still fits on the previous clock.
 */
export function compactDaysFillFirst(
  days: string[][],
  allIds: string[],
  calendar?: { startDate: string; firstDayNumber: number },
  startCoord?: PinCoord | null,
): string[][] {
  const unique = [...new Set(allIds.filter(Boolean))]
  const firstDay = Math.max(1, calendar?.firstDayNumber || 1)
  const isoFor = (index: number) =>
    calendar?.startDate ? tripIsoDate(calendar.startDate, firstDay + index) : ''

  let rows = collapseEmptyDays(days.map((row) => [...row]))
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < rows.length && !changed; i++) {
      if (rowOwnsTheDay(rows[i], unique)) continue
      for (let j = i + 1; j < rows.length; j++) {
        if (rowOwnsTheDay(rows[j], unique)) continue
        const iso = isoFor(i)
        const merged = canonicalizeDay([...rows[i], ...rows[j]], unique, iso, startCoord)
        if (merged.fitted.length > rows[i].length) {
          const have = new Set(merged.fitted)
          const rest = [...rows[i], ...rows[j]].filter((id) => !have.has(id))
          rows[i] = merged.fitted
          if (rest.length === 0) rows.splice(j, 1)
          else rows[j] = rest
          changed = true
          break
        }
        const pulled: string[] = []
        let host = rows[i]
        for (const id of [...rows[j]]) {
          if (isExclusiveDayTrip(id)) continue
          const trial = canonicalizeDay([...host, id], unique, iso, startCoord)
          if (trial.leftover.length > 0) continue
          host = trial.fitted
          pulled.push(id)
        }
        if (pulled.length) {
          const take = new Set(pulled)
          rows[i] = host
          rows[j] = rows[j].filter((id) => !take.has(id))
          rows = collapseEmptyDays(rows)
          changed = true
          break
        }
      }
    }
  }
  return collapseEmptyDays(rows)
}

/** Pack from 09:00 through closing (cap 22:00). The day ends when the last visit ends. */
const PACK_DAY_OPEN = DAY_OPEN
const PACK_DAY_END = DAY_CLOSE
const FALLBACK_HOP_HOURS = 10 / 60
/** Hops within this window tie-break toward the venue that closes sooner. */
const NEAR_HOP_HOURS = 5 / 60
/** Do not chain two countryside outings across town on the same clock. */
const FAR_HOP_HOURS = 55 / 60
/** Road km (cached OSRM or 1.3× haversine). Phu Quoc north loop is ~20–25 km. */
const FAR_HOP_KM = 28
/** Wait through a lunch / afternoon-open gap rather than parking that stop on a new day. */
const MAX_PACK_WAIT_HOURS = 5
/** Same-town evening leftover (lanterns after a daytime walk) may idle longer than lunch. */
const MAX_EVENING_WAIT_HOURS = 10
/** Stops that can only start this late compete for the same slice of evening. */
const LATE_ANCHOR = 16

/** True day-trips only — catalog hours of 6–8 on a city walk must not steal a whole day. */
function isExclusiveDayTrip(id: string): boolean {
  if (isAtomicExclusive(id)) return true
  const exp = EXPERIENCE_BY_ID.get(id)
  const hours = catalogHoursForSourceId(id)
  if (hours >= 10) return true
  if (exp?.dna?.includes('FULL DAY') && hours >= 6) return true
  const text = exp
    ? `${exp.name} ${exp.about ?? ''} ${exp.durationLabel ?? ''}`
    : ''
  return (
    hours >= 6 &&
    /cruise|overnight|full[-\s]?day|day[-\s]?trip|trek|trekking/i.test(text)
  )
}

export function agentDwellHours(id: string, selectedIds: string[] = []): number {
  return defaultVisitHours(id, selectedIds, catalogHoursForSourceId(id))
}

/** Catalog dwell, shortened only when the venue is not open that long after 09:00. */
export function packVisitHours(id: string, selectedIds: string[] = [], isoDate = ''): number {
  return feasibleDwellHours(id, selectedIds, isoDate)
}

export function paddedHoursForCity(
  id: string,
  _cityIds: string[],
  _placeId?: string | null,
): number {
  return agentDwellHours(id, _cityIds)
}

type PackUnit = { ids: string[]; exclusive: boolean }

function packUnits(ids: string[]): PackUnit[] {
  const unique = [...new Set(ids.filter(Boolean))]
  const used = new Set<string>()
  const units: PackUnit[] = []

  for (const id of unique) {
    if (used.has(id)) continue
    const bundle = bundleIdFor(id)
    const memberCanon = bundle ? new Set(bundleMembers(bundle).map(canonicalSightId)) : null
    const mates = memberCanon
      ? unique.filter((other) => other === id || (!used.has(other) && memberCanon.has(canonicalSightId(other))))
      : [id]
    const exclusive =
      mates.some((member) => isExclusiveDayTrip(member)) ||
      mates.some((member) => {
        const lock = hardOutingId(member)
        return Boolean(lock?.startsWith('c:'))
      })
    for (const member of mates) used.add(member)
    const ordered = orderSourceIdsByProximity(mates)
    units.push({ ids: ordered, exclusive })
  }

  const heads = units.map((u) => u.ids[0])
  const headOrder = orderSourceIdsByProximity(heads)
  return [...units].sort(
    (a, b) => headOrder.indexOf(a.ids[0]) - headOrder.indexOf(b.ids[0]),
  )
}

/** Day-trips stay atomic. City walks pack one stop at a time so a closed mausoleum cannot block the pagoda next door. */
function packingPieces(units: PackUnit[], allIds: string[]): PackUnit[] {
  const pieces: PackUnit[] = []
  for (const unit of units) {
    if (unitTakesWholeDay(unit, allIds) || unit.ids.length <= 1) {
      pieces.push(unit)
      continue
    }
    for (const id of unit.ids) {
      pieces.push({ ids: [id], exclusive: false })
    }
  }
  return pieces
}

function hopHours(
  fromId: string | null,
  toId: string,
  startCoord?: PinCoord | null,
): number {
  const to = PIN_BY_SOURCE_ID[toId] ?? null
  const from = fromId ? PIN_BY_SOURCE_ID[fromId] ?? null : startCoord ?? null
  if (!from || !to) return fromId ? FALLBACK_HOP_HOURS : 0
  return hopHoursBetween(from, to)
}

/** After a long outing, leftover city stops hop from town — the boat/cable already returned. */
function leftoverFromCity(placed: string[], fromId: string | null, toId: string): boolean {
  if (!fromId || !placed.length) return false
  if (sameTicketedOuting(fromId, toId)) return false
  return dayLocksToSameOuting(placed)
}

function useCityHub(
  placed: string[],
  fromId: string | null,
  toId: string,
  startCoord?: PinCoord | null,
): boolean {
  if (leftoverFromCity(placed, fromId, toId)) return true
  if (!fromId || !startCoord) return false
  if (sameTicketedOuting(fromId, toId)) return false
  const sameCluster =
    Boolean(walkClusterId(fromId)) && walkClusterId(fromId) === walkClusterId(toId)
  if (!sameCluster) return false
  const direct = hopHours(fromId, toId, startCoord)
  return hopTooFar(fromId, toId, direct)
}

function hopToStop(
  fromId: string | null,
  toId: string,
  startCoord: PinCoord | null | undefined,
  placed: string[],
): number {
  if (useCityHub(placed, fromId, toId, startCoord)) {
    const to = PIN_BY_SOURCE_ID[toId] ?? null
    const from = startCoord ?? null
    if (!from || !to) return FALLBACK_HOP_HOURS
    return hopHoursBetween(from, to)
  }
  return hopHours(fromId, toId, startCoord)
}

/** Clock after arriving at `toId`. The first stop of the day starts at 09:00. */
function afterHop(
  fromId: string | null,
  toId: string,
  t: number,
  startCoord?: PinCoord | null,
  _isoDate = '',
  placed: string[] = [],
): number {
  if (!fromId) return PACK_DAY_OPEN
  return t + hopToStop(fromId, toId, startCoord, placed)
}

/** Same hop the timeline uses (OSRM cache or road-km walk/Grab). */
export function packHopHours(fromId: string, toId: string): number {
  return hopHours(fromId, toId)
}

function packUntil(id: string, isoDate: string): number {
  const raw = placeHoursFor(id, isoDate)
  if (raw.closedToday) return Number.NEGATIVE_INFINITY
  if (raw.alwaysOpen || raw.unknown || !raw.intervals?.length) return PACK_DAY_END
  return Math.min(DAY_CLOSE, latestClose(raw))
}

function placeHoursFor(id: string, isoDate: string) {
  const weekday = isoDate ? weekdayFromIso(isoDate) : 3
  return catalogHoursForSource(hoursKindForId(id), id, weekday, isoDate)
}

function longestOpenSpan(hours: ReturnType<typeof placeHoursFor>, from: number, until: number): number {
  if (hours.closedToday) return 0
  if (hours.alwaysOpen || hours.unknown || !hours.intervals?.length) {
    return Math.max(0, until - from)
  }
  let best = 0
  for (const iv of hours.intervals) {
    const start = Math.max(from, iv.open)
    const end = Math.min(until, iv.close)
    best = Math.max(best, end - start)
  }
  return best
}

/**
 * Card visit length, unless the venue is never open that long after 09:00 —
 * then the longest open window is the visit (still never past close).
 */
function feasibleDwellHours(id: string, allIds: string[], isoDate: string): number {
  const dwell = Math.max(5 / 60, agentDwellHours(id, allIds))
  const hours = placeHoursFor(id, isoDate)
  const until = packUntil(id, isoDate)
  if (!Number.isFinite(until) || until <= PACK_DAY_OPEN) return dwell
  const span = longestOpenSpan(hours, PACK_DAY_OPEN, until)
  if (span <= 0 || dwell <= span + 0.05) return dwell
  return snapVisitHours(Math.max(15 / 60, span))
}

function remainingWalkMate(placed: string[], id: string): boolean {
  if (!placed.length) return false
  const cluster = walkClusterId(id)
  if (!cluster) return false
  return placed.some((prev) => walkClusterId(prev) === cluster)
}

function dayContext(placed: string[], remaining: string[], nextId: string): string[] {
  const ids = [...placed, nextId]
  for (const id of remaining) {
    if (id === nextId) continue
    if (ids.some((prev) => sameTicketedOuting(prev, id))) ids.push(id)
  }
  return ids
}

function visitSlot(
  id: string,
  after: number,
  allIds: string[],
  isoDate: string,
  allowShorten = false,
): { start: number; end: number; dwell: number; need: number } | null {
  if (isoDate && isSourceClosedOnDate(id, isoDate) && !isExclusiveDayTrip(id) && !isTimedLanding(id, allIds)) {
    return null
  }
  if (isTimedLanding(id, allIds)) {
    const dwell = feasibleDwellHours(id, allIds, isoDate)
    return { start: after, end: after, dwell, need: 0 }
  }
  const dwell = feasibleDwellHours(id, allIds, isoDate)
  const hours = placeHoursFor(id, isoDate)
  const until = packUntil(id, isoDate)
  const eveningPref = timePreferenceForSourceId(id) === 'EVENING'
  const eveningFits = EVENING_EARLIEST_START + dwell <= until + 0.05
  const evening = eveningPref && eveningFits
  let need = dwell
  let start = earliestOpenAt(hours, after, need, until)
  if (evening) {
    const eve = Math.max(after, EVENING_EARLIEST_START)
    const eveOpen = earliestOpenAt(hours, eve, need, until)
    if (Number.isFinite(eveOpen)) start = eveOpen
  }
  if (!Number.isFinite(start) && (allowShorten || eveningPref)) {
    const remain = longestOpenSpan(hours, after, until)
    if (remain < 15 / 60) return null
    need = snapVisitHours(Math.max(15 / 60, Math.min(dwell, remain)))
    start = earliestOpenAt(hours, after, need, until)
  }
  if (!Number.isFinite(start)) return null
  let end = start + need
  if (end > until + 0.05 && (allowShorten || evening)) {
    const remain = Math.min(until, DAY_CLOSE) - start
    if (remain < 15 / 60) return null
    need = snapVisitHours(Math.max(15 / 60, remain))
    end = start + need
    if (end > until + 0.05) return null
  }
  if (end > until + 0.05) return null
  if (!evening && !isExclusiveDayTrip(id)) {
    if (start >= 19 - 0.01) return null
    if (end > 20 + 0.05) return null
  }
  return { start, end, dwell, need }
}

/**
 * Fill remaining stops by shortest hop from the last pin. A stop that is still
 * shut for more than an hour yields to the next-nearest open neighbor.
 */
function nearestFeasibleWalk(
  ids: string[],
  allIds: string[],
  isoDate: string,
  startCoord?: PinCoord | null,
  resumeAt = PACK_DAY_OPEN,
  resumeFrom: string | null = null,
  allowShorten = false,
): { ok: boolean; ordered: string[]; end: number; prev: string | null } {
  if (ids.length === 0) return { ok: true, ordered: [], end: resumeAt, prev: resumeFrom }
  const remaining = [...ids]
  const ordered: string[] = []
  let t = resumeAt
  let prev: string | null = resumeFrom
  while (remaining.length) {
    const idx = pickNearestFeasible(remaining, prev, t, allIds, isoDate, startCoord, allowShorten, ordered)
    if (idx < 0) return { ok: false, ordered, end: t, prev }
    const id = remaining.splice(idx, 1)[0]
    const ctx = dayContext(ordered, remaining, id)
    const slot = visitSlot(
      id,
      afterHop(prev, id, t, startCoord, isoDate, ordered),
      ctx,
      isoDate,
      allowShorten,
    )
    if (!slot) return { ok: false, ordered, end: t, prev }
    ordered.push(id)
    prev = id
    t = slot.end
  }
  return { ok: true, ordered, end: t, prev }
}

type FeasiblePick = {
  i: number
  hop: number
  wait: number
  deadline: number
  end: number
  evening: boolean
  roi: number
}

function remainingComplexMate(placed: string[], _remaining: string[], id: string): boolean {
  if (!placed.length) return false
  return placed.some((prev) => {
    const complex = complexFor(prev)
    if (!complex) return false
    return complex.members.some((row) => canonicalSightId(row.id) === canonicalSightId(id))
  })
}

function sameTicketedOuting(fromId: string, toId: string): boolean {
  const a = complexFor(fromId)
  const b = complexFor(toId)
  return Boolean(a && b && a.id === b.id)
}

function roadKmBetween(fromId: string, toId: string): number | null {
  const a = PIN_BY_SOURCE_ID[fromId]
  const b = PIN_BY_SOURCE_ID[toId]
  if (!a || !b) return null
  return peekRoute(a, b)?.km ?? haversineRoadKm(a, b)
}

function hopTooFar(fromId: string | null, toId: string, hop: number): boolean {
  if (!fromId) return false
  if (sameTicketedOuting(fromId, toId)) return false
  const sameCluster =
    Boolean(walkClusterId(fromId)) && walkClusterId(fromId) === walkClusterId(toId)
  const hopCap = sameCluster ? 50 / 60 : FAR_HOP_HOURS
  const kmCap = sameCluster ? 22 : FAR_HOP_KM
  if (hop >= hopCap) return true
  const km = roadKmBetween(fromId, toId)
  return km != null && km > kmCap
}

function hopTooFarOnDay(
  fromId: string | null,
  toId: string,
  hop: number,
  startCoord?: PinCoord | null,
  fromCity = false,
): boolean {
  if (fromCity) {
    if (hop >= FAR_HOP_HOURS) return true
    const to = PIN_BY_SOURCE_ID[toId]
    if (startCoord && to) {
      const km = peekRoute(startCoord, to)?.km ?? haversineRoadKm(startCoord, to)
      if (km > FAR_HOP_KM) return true
    }
    return false
  }
  return hopTooFar(fromId, toId, hop)
}

function outingAxis(id: string): string | null {
  const lock = hardOutingId(id)
  if (!lock) return null
  if (lock.startsWith('w:')) return lock
  const complex = SIGHT_COMPLEXES.find((row) => row.id === lock.slice(2))
  if (!complex) return lock
  if (complex.access === 'cable') return `cable:${complex.id}`
  if (complex.access === 'trek') return 'trek'
  if (complex.access === 'day-trip') return `day:${complex.id}`
  if (complex.access === 'boat') return `boat:${complex.id}`
  if (complex.exclusive) return `ex:${complex.id}`
  return lock
}

/** One heavy outing per day. Leftover walks may fill the hours after a boat or safari. */
function axesCompatible(axes: string[]): boolean {
  const uniq = [...new Set(axes.filter(Boolean))]
  if (uniq.length <= 1) return true
  const walks = uniq.filter((ax) => ax.startsWith('w:'))
  const cables = uniq.filter((ax) => ax.startsWith('cable:'))
  const dayTrips = uniq.filter((ax) => ax.startsWith('day:'))
  const boats = uniq.filter((ax) => ax.startsWith('boat:'))
  const exclusive = uniq.filter((ax) => ax.startsWith('ex:'))
  const trek = uniq.includes('trek')
  if (trek && uniq.length > 1) return false
  if (boats.length > 1 || cables.length > 1 || dayTrips.length > 1 || exclusive.length > 1) {
    return false
  }
  if (boats.length && (cables.length || exclusive.length)) return false
  if (exclusive.length && (cables.length || dayTrips.length)) return false
  if (walks.length > 2) return false
  const catPhin =
    walks.length === 2 &&
    walks.includes('w:sapa-cat-cat') &&
    walks.includes('w:sapa-villages')
  if (walks.length === 2 && !catPhin) return false
  if (walks.length && cables.length) return false
  if (catPhin) return true
  if (cables.length && dayTrips.length) return true
  return true
}

function idOwnsWholeDay(id: string, allIds: string[]): boolean {
  return unitTakesWholeDay({ ids: [id], exclusive: true }, allIds)
}

function sameOutingAsPlaced(placed: string[], nextId: string): boolean {
  return placed.every((prev) => sameTicketedOuting(prev, nextId))
}

function outingHours(placed: string[]): number {
  return placed.reduce((n, id) => Math.max(n, idOwnsWholeDay(id, placed) ? agentDwellHours(id, placed) : 0), 0)
}

function isHeavyOutingAxis(ax: string | null): boolean {
  if (!ax) return false
  return (
    ax === 'trek' ||
    ax.startsWith('boat:') ||
    ax.startsWith('cable:') ||
    ax.startsWith('day:') ||
    ax.startsWith('ex:')
  )
}

function leftoverOk(placed: string[], nextId: string): boolean {
  if (!placed.length) return true
  if (placed.some((prev) => sameTicketedOuting(prev, nextId))) return true
  const trek = placed.some((id) => complexFor(id)?.access === 'trek' || outingAxis(id) === 'trek')
  if (trek) return false
  const exclusiveCable = placed.some((id) => {
    const c = complexFor(id)
    return c?.access === 'cable' && Boolean(c.exclusive)
  })
  if (exclusiveCable) return false
  if (!dayLocksToSameOuting(placed)) return true
  if (outingHours(placed) >= 7.5) {
    return timePreferenceForSourceId(nextId) === 'EVENING'
  }
  return true
}

function compatibleOnDay(
  placed: string[],
  nextId: string,
  lastHop: number,
  startCoord?: PinCoord | null,
  fromCity = false,
): boolean {
  if (placed.length) {
    const nextOwns = idOwnsWholeDay(nextId, [...placed, nextId])
    const locked = dayLocksToSameOuting(placed)
    if (locked && nextOwns) return sameOutingAsPlaced(placed, nextId)
    if (nextOwns) return false
    if (isHeavyOutingAxis(outingAxis(nextId)) && !placed.some((prev) => sameTicketedOuting(prev, nextId))) {
      if (!locked) return false
    }
    if (!leftoverOk(placed, nextId)) return false
  }
  const nextAx = outingAxis(nextId)
  const axes = placed.map(outingAxis).filter((lock): lock is string => Boolean(lock))
  const axesOk = axesCompatible(nextAx ? [...axes, nextAx] : axes)
  const eveningLeftover =
    timePreferenceForSourceId(nextId) === 'EVENING' && leftoverOk(placed, nextId)
  if (!axesOk && !eveningLeftover) return false
  if (!placed.length) return true
  const pairHalves =
    nextAx &&
    axesCompatible([...axes, nextAx]) &&
    [...axes, nextAx].includes('w:sapa-cat-cat') &&
    [...axes, nextAx].includes('w:sapa-villages')
  if (pairHalves) return true
  const farWalk = (ax: string) =>
    /nha-trang-nature|nha-trang-coast|phu-quoc-north|phu-quoc-beaches|dalat-waterfalls|phong-nha-nature/.test(
      ax,
    )
  if (axes.some(farWalk) && !nextAx && !dayLocksToSameOuting(placed)) return false
  const prev = placed[placed.length - 1] ?? null
  if (!hopTooFarOnDay(prev, nextId, lastHop, startCoord, fromCity)) return true
  return false
}

function pickNearestFeasible(
  remaining: string[],
  prev: string | null,
  t: number,
  allIds: string[],
  isoDate: string,
  startCoord?: PinCoord | null,
  allowShorten = false,
  placed: string[] = [],
): number {
  const cands: FeasiblePick[] = []
  for (let i = 0; i < remaining.length; i++) {
    const id = remaining[i]
    const hop = hopToStop(prev, id, startCoord, placed)
    const fromCity = useCityHub(placed, prev, id, startCoord)
    if (!compatibleOnDay(placed, id, hop, startCoord, fromCity)) continue
    const after = afterHop(prev, id, t, startCoord, isoDate, placed)
    const slot = visitSlot(id, after, dayContext(placed, remaining, id), isoDate, allowShorten)
    if (!slot) continue
    cands.push({
      i,
      hop,
      wait: Math.max(0, slot.start - after),
      deadline: packUntil(id, isoDate),
      end: slot.end,
      evening: timePreferenceForSourceId(id) === 'EVENING' && EVENING_EARLIEST_START + slot.dwell <= packUntil(id, isoDate) + 0.05,
      roi: catalogPriorityForSourceId(id),
    })
  }
  if (!cands.length) return -1
  const waitOk = (c: FeasiblePick) => {
    if (c.wait <= MAX_PACK_WAIT_HOURS) return true
    if (!c.evening || c.wait > MAX_EVENING_WAIT_HOURS) return false
    const id = remaining[c.i] ?? ''
    return remainingWalkMate(placed, id) || remainingComplexMate(placed, remaining, id)
  }
  const nowish = cands.filter(waitOk)
  const pool = nowish.length ? nowish : cands
  const wholeDay = (c: FeasiblePick) => idOwnsWholeDay(remaining[c.i] ?? '', allIds)
  const sightseeing =
    t < EVENING_EARLIEST_START - 0.01
      ? pool.filter((c) => !c.evening || wholeDay(c))
      : pool
  const base = sightseeing.length ? sightseeing : pool
  const pick = base
  pick.sort((a, b) => {
    if (!placed.length) {
      const seq = (c: FeasiblePick) => sequenceOf(remaining[c.i] ?? '')
      const sameCx = sameTicketedOuting(remaining[a.i] ?? '', remaining[b.i] ?? '')
      if (sameCx && seq(a) !== seq(b)) return seq(a) - seq(b)
      if (wholeDay(a) !== wholeDay(b)) return wholeDay(a) ? -1 : 1
      if (wholeDay(a) && wholeDay(b) && seq(a) !== seq(b)) return seq(a) - seq(b)
      const half = (c: FeasiblePick) => {
        const ax = outingAxis(remaining[c.i] ?? '')
        return ax === 'w:sapa-cat-cat' || ax === 'w:sapa-villages' ? 0 : 1
      }
      if (half(a) !== half(b)) return half(a) - half(b)
      const morning = (c: FeasiblePick) => (c.deadline <= 12.5 + 0.01 ? 0 : 1)
      if (morning(a) !== morning(b)) return morning(a) - morning(b)
    } else {
      const placedWalks = new Set(
        placed.map(outingAxis).filter((ax): ax is string => Boolean(ax?.startsWith('w:'))),
      )
      const pair =
        placedWalks.has('w:sapa-cat-cat') && remaining.some((id) => outingAxis(id) === 'w:sapa-villages')
          ? 'w:sapa-villages'
          : placedWalks.has('w:sapa-villages') && remaining.some((id) => outingAxis(id) === 'w:sapa-cat-cat')
            ? 'w:sapa-cat-cat'
            : null
      if (pair) {
        const mate = (c: FeasiblePick) => (outingAxis(remaining[c.i] ?? '') === pair ? 0 : 1)
        if (mate(a) !== mate(b)) return mate(a) - mate(b)
      }
      const cluster = (c: FeasiblePick) =>
        remainingWalkMate(placed, remaining[c.i] ?? '') ||
        remainingComplexMate(placed, remaining, remaining[c.i] ?? '')
          ? 0
          : 1
      if (cluster(a) !== cluster(b)) return cluster(a) - cluster(b)
    }
    if (a.evening !== b.evening) return a.evening ? 1 : -1
    const mateA = remainingComplexMate(placed, remaining, remaining[a.i] ?? '')
    const mateB = remainingComplexMate(placed, remaining, remaining[b.i] ?? '')
    if (mateA !== mateB) return mateA ? -1 : 1
    if (Math.abs(a.deadline - b.deadline) > 0.25) return a.deadline - b.deadline
    if (Math.abs(a.hop - b.hop) > NEAR_HOP_HOURS) return a.hop - b.hop
    if (Math.abs(a.roi - b.roi) > 0.05) return b.roi - a.roi
    return a.end - b.end
  })
  return pick[0]?.i ?? -1
}

function unitTakesWholeDay(unit: PackUnit, allIds: string[]): boolean {
  return unit.ids.some((id) => {
    const c = complexFor(id)
    if (c?.access === 'trek') return true
    if (c?.access === 'cable') return false
    const dwell = agentDwellHours(id, allIds)
    if (dwell < 5.95) return false
    if (c?.exclusive) return true
    return isExclusiveDayTrip(id)
  })
}

/** Long boat / trek / park days keep a second exclusive outing off the clock. Cable still shares leftover hours with a pass. */
function dayLocksToSameOuting(placed: string[]): boolean {
  return placed.some((id) => {
    const c = complexFor(id)
    if (c?.access === 'trek') return true
    if (c?.access === 'cable') return Boolean(c.exclusive)
    return idOwnsWholeDay(id, placed)
  })
}

function flattenPieces(pieces: PackUnit[], idxs: number[]): string[] {
  const ids: string[] = []
  for (const i of idxs) ids.push(...pieces[i].ids)
  return ids
}

function pieceOpenOnDate(piece: PackUnit, iso: string): boolean {
  if (!iso) return true
  return piece.ids.some((id) => !isSourceClosedOnDate(id, iso) || isExclusiveDayTrip(id))
}

const CANONICAL_DAY_MEMO = new Map<string, { fitted: string[]; leftover: string[] }>()

function canonicalizeDay(
  ids: string[],
  allIds: string[],
  isoDate: string,
  startCoord?: PinCoord | null,
): { fitted: string[]; leftover: string[] } {
  const key = `${ids.join(',')}|${allIds.join(',')}|${isoDate}|${startCoord?.lat ?? ''},${startCoord?.lng ?? ''}`
  const hit = CANONICAL_DAY_MEMO.get(key)
  if (hit) return { fitted: [...hit.fitted], leftover: [...hit.leftover] }
  if (CANONICAL_DAY_MEMO.size > 20_000) CANONICAL_DAY_MEMO.clear()
  const out = computeCanonicalDay(ids, allIds, isoDate, startCoord)
  CANONICAL_DAY_MEMO.set(key, out)
  return { fitted: [...out.fitted], leftover: [...out.leftover] }
}

function computeCanonicalDay(
  ids: string[],
  allIds: string[],
  isoDate: string,
  startCoord?: PinCoord | null,
): { fitted: string[]; leftover: string[] } {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return { fitted: [], leftover: [] }
  const fitted = fillDayFromPool(unique, allIds, isoDate, startCoord)
  const have = new Set(fitted)
  const leftover = unique.filter((id) => !have.has(id))
  const walk = nearestFeasibleWalk(fitted, allIds, isoDate, startCoord)
  return { fitted: walk.ok ? walk.ordered : fitted, leftover }
}

/**
 * Opening hours are a hard gate. Sights that miss a full open visit on their
 * day are fitted onto other same-city days with spare slots (empty first).
 * A new day is created only when no existing day can host the visit.
 */
function absorbIntoExistingDays(
  days: string[][],
  allIds: string[],
  calendar?: { startDate: string; firstDayNumber: number },
  startCoord?: PinCoord | null,
  opts?: {
    keepEmpty?: boolean
    createNewDays?: boolean
    isoFor?: (index: number) => string
  },
): string[][] {
  const unique = [...new Set(allIds.filter(Boolean))]
  const firstDay = Math.max(1, calendar?.firstDayNumber || 1)
  const isoFor =
    opts?.isoFor ??
    ((index: number) =>
      calendar?.startDate ? tripIsoDate(calendar.startDate, firstDay + index) : '')
  const keepEmpty = Boolean(opts?.keepEmpty)
  const createNewDays = opts?.createNewDays !== false

  let rows = collapseEmptyDays(days.map((row) => [...row]), keepEmpty)
  if (rows.length === 0) return rows

  const blocked = (id: string, iso: string) =>
    Boolean(iso && isSourceClosedOnDate(id, iso) && !isExclusiveDayTrip(id))

  const leftover: { id: string; from: number }[] = []
  for (let i = 0; i < rows.length; i++) {
    if (rowOwnsTheDay(rows[i], unique)) continue
    const packed = canonicalizeDay(rows[i], unique, isoFor(i), startCoord)
    for (const id of packed.leftover) leftover.push({ id, from: i })
    rows[i] = packed.fitted
  }

  const placeOnExisting = (id: string, fromIndex?: number) => {
    const ranked = rows
      .map((row, j) => ({ j, n: row.length }))
      .filter(({ j }) => j !== fromIndex && !rowOwnsTheDay(rows[j], unique))
      .sort((a, b) => a.n - b.n || a.j - b.j)
    for (const { j } of ranked) {
      const isoJ = isoFor(j)
      if (blocked(id, isoJ)) continue
      const packed = canonicalizeDay([...rows[j], id], unique, isoJ, startCoord)
      if (packed.leftover.length > 0) continue
      rows[j] = packed.fitted
      return true
    }
    return false
  }

  const unplaced: { id: string; from: number }[] = []
  for (const row of leftover) {
    if (isExclusiveDayTrip(row.id)) {
      unplaced.push(row)
      continue
    }
    if (!placeOnExisting(row.id, row.from)) unplaced.push(row)
  }

  if (!createNewDays) {
    for (const row of unplaced) {
      if (!rows[row.from]?.includes(row.id)) rows[row.from] = [...(rows[row.from] ?? []), row.id]
    }
    return collapseEmptyDays(rows, keepEmpty)
  }

  let cal = rows.length
  let rest = unplaced.map((row) => row.id)
  const limit = unique.length + 16
  for (let guard = 0; rest.length && guard < limit; guard++) {
    const iso = isoFor(cal)
    const walks = rest.filter((id) => !isExclusiveDayTrip(id) && !blocked(id, iso))
    const filled = fillDayFromPool(walks, unique, iso, startCoord)
    if (filled.length) {
      const have = new Set(filled)
      rest = rest.filter((id) => !have.has(id))
      rows.push(filled)
      cal += 1
      continue
    }
    const excl = rest.find((id) => isExclusiveDayTrip(id) && !blocked(id, iso))
    if (excl) {
      rows.push([excl])
      rest = rest.filter((id) => id !== excl)
      cal += 1
      continue
    }
    if (rest.every((id) => blocked(id, iso))) {
      cal += 1
      continue
    }
    const next = rest.shift()
    if (next) {
      const hosted = placeOnExisting(next)
      if (!hosted) {
        rows.push([next])
        cal += 1
      }
    }
  }

  return collapseEmptyDays(rows, keepEmpty)
}

/** Hardwired: closed-hour leftovers go onto other same-city days that still have an open slot. */
export function fitClosedHourSightsOntoOtherDays(
  days: string[][],
  placeId?: string | null,
  calendar?: { startDate: string; firstDayNumber: number },
  opts?: { keepEmpty?: boolean; createNewDays?: boolean; isoFor?: (index: number) => string },
): string[][] {
  const unique = [...new Set(days.flat().filter(Boolean))]
  const startCoord = placeId ? placeCoords(placeId as PlaceId) : null
  return absorbIntoExistingDays(days, unique, calendar, startCoord, {
    keepEmpty: opts?.keepEmpty ?? true,
    createNewDays: opts?.createNewDays ?? false,
    isoFor: opts?.isoFor,
  })
}

function fillDayFromPool(
  pool: string[],
  allIds: string[],
  isoDate: string,
  startCoord?: PinCoord | null,
): string[] {
  const remaining = [...pool]
  const ordered: string[] = []
  let t = PACK_DAY_OPEN
  let prev: string | null = null
  while (remaining.length) {
    const idx = pickNearestFeasible(remaining, prev, t, allIds, isoDate, startCoord, false, ordered)
    if (idx < 0) break
    const id = remaining[idx]
    const slot = visitSlot(
      id,
      afterHop(prev, id, t, startCoord, isoDate, ordered),
      dayContext(ordered, remaining, id),
      isoDate,
      false,
    )
    if (!slot) {
      remaining.splice(idx, 1)
      continue
    }
    remaining.splice(idx, 1)
    ordered.push(id)
    prev = id
    t = slot.end
  }
  return ordered
}

function packCityDays(
  pieces: PackUnit[],
  unique: string[],
  calendar?: { startDate: string; firstDayNumber: number },
  startCoord?: PinCoord | null,
  _targetDays?: number,
): string[][] {
  pieces = [...pieces]
  const n = pieces.length
  if (n === 0) return []

  const firstDay = Math.max(1, calendar?.firstDayNumber || 1)
  const exclusive = pieces.map((unit) => unitTakesWholeDay(unit, unique))
  const isoAt = (cal: number) =>
    calendar?.startDate ? tripIsoDate(calendar.startDate, firstDay + cal) : ''

  let leftover = pieces.map((_, i) => i)
  const days: string[][] = []
  let cal = 0
  const limit = n + 16
  for (let guard = 0; leftover.length && guard < limit; guard++) {
    const iso = isoAt(cal)
    const openIdxs = leftover.filter((i) => pieceOpenOnDate(pieces[i], iso))
    const filled = fillDayFromPool(
      flattenPieces(pieces, openIdxs.length ? openIdxs : leftover),
      unique,
      iso,
      startCoord,
    )
    if (filled.length) {
      const used = new Set(filled)
      const owner = leftover.find(
        (i) => exclusive[i] && pieces[i].ids.some((id) => used.has(id)),
      )
      const bundle = owner != null ? pieces[owner].ids : []
      const extras = filled.filter((id) => !bundle.includes(id))
      const trial = canonicalizeDay(bundle.length ? [...bundle, ...extras] : filled, unique, iso, startCoord)
      const bundleFits = bundle.length === 0 || bundle.every((id) => trial.fitted.includes(id))
      let kept = trial.fitted.length ? trial.fitted : filled
      if (!bundleFits && bundle.length) {
        const only = nearestFeasibleWalk(bundle, unique, iso, startCoord)
        kept = only.ordered.length ? only.ordered : bundle
      }
      // A bundle that only partly fit keeps its other stops in the pool for a later day.
      for (const i of leftover) {
        const rest = pieces[i].ids.filter((id) => !kept.includes(id))
        if (rest.length && rest.length < pieces[i].ids.length) {
          const piece = { ids: rest, exclusive: pieces[i].exclusive }
          pieces.push(piece)
          exclusive.push(unitTakesWholeDay(piece, unique))
          leftover.push(pieces.length - 1)
        }
      }
      leftover = leftover.filter((i) => !pieces[i].ids.some((id) => kept.includes(id)))
      days.push(kept)
      cal += 1
      continue
    }
    if (leftover.every((i) => !pieceOpenOnDate(pieces[i], iso))) {
      cal += 1
      continue
    }
    const forced = leftover[0]
    days.push(pieces[forced].ids)
    leftover = leftover.filter((i) => i !== forced)
    cal += 1
  }
  // Nothing is lost here: whatever never found a date gets a day the clock check can still repair.
  for (const i of leftover) days.push(pieces[i].ids)

  return collapseEmptyDays(days)
}

function dayCentroid(ids: string[]): PinCoord | null {
  const pins = ids.map((id) => PIN_BY_SOURCE_ID[id]).filter((pin): pin is PinCoord => Boolean(pin))
  if (!pins.length) return null
  return {
    lat: pins.reduce((s, p) => s + p.lat, 0) / pins.length,
    lng: pins.reduce((s, p) => s + p.lng, 0) / pins.length,
  }
}

function isTrekSight(id: string): boolean {
  return outingAxis(id) === 'trek' || complexFor(id)?.access === 'trek'
}

function heavyMergeKeys(ids: string[], allIds: string[]): string[] {
  const keys = new Set<string>()
  for (const id of ids) {
    const ax = outingAxis(id)
    if (ax === 'trek') keys.add('trek')
    if (!idOwnsWholeDay(id, allIds) && agentDwellHours(id, allIds) < 7.5) continue
    if (ax?.startsWith('boat:') || ax?.startsWith('ex:') || ax?.startsWith('cable:')) keys.add(ax)
    else if (idOwnsWholeDay(id, allIds)) keys.add(ax ?? `own:${canonicalSightId(id)}`)
  }
  return [...keys]
}

function farOutingKey(id: string): string | null {
  const ax = outingAxis(id)
  if (ax === 'trek' || ax?.startsWith('boat:') || ax?.startsWith('ex:') || ax?.startsWith('cable:') || ax?.startsWith('day:')) {
    return ax
  }
  const cluster = walkClusterId(id)
  if (!cluster) return null
  if (/nature|coast|beaches|north|markets/.test(cluster)) return `w:${cluster}`
  return null
}

/** City vs countryside, or a Sapa pass vs Cat Cat / Tả Phìn, cannot be force-stuffed onto one clock. */
function forceClusterConflict(a: string[], b: string[]): boolean {
  const ids = [...a, ...b]
  const far = [...new Set(ids.map(farOutingKey).filter((key): key is string => Boolean(key)))]
  const hasCityWalk = ids.some((id) => !farOutingKey(id) && Boolean(walkClusterId(id)))
  if (far.some((key) => key.startsWith('day:')) && ids.some((id) => /sapa-(cat-cat|villages)/.test(walkClusterId(id) ?? ''))) {
    return true
  }
  if (far.length && hasCityWalk) {
    const marketOntoVillage =
      far.every((key) => key === 'w:sapa-markets') &&
      ids.some((id) => /sapa-(cat-cat|villages|town)/.test(walkClusterId(id) ?? ''))
    if (!marketOntoVillage) return true
  }
  return false
}

function isHeavyParkDay(ids: string[], allIds: string[]): boolean {
  return ids.some((id) => {
    if (isTrekSight(id)) return true
    const ax = outingAxis(id)
    const dwell = agentDwellHours(id, allIds)
    if (dwell < 7.5) return false
    return Boolean(ax?.startsWith('boat:') || ax?.startsWith('ex:') || ax?.startsWith('cable:'))
  })
}

function cableWithPass(a: string[], b: string[]): boolean {
  const axes = [...a, ...b].map(outingAxis).filter((ax): ax is string => Boolean(ax))
  return axes.some((ax) => ax.startsWith('cable:')) && axes.some((ax) => ax.startsWith('day:')) && axesCompatible(axes)
}

/** Two 8h parks, two boats, or a trek mixed with Cat Cat / pass / market cannot share a day. */
function mergeBlocked(a: string[], b: string[], allIds: string[]): boolean {
  const combined = [...a, ...b]
  const trek = combined.filter(isTrekSight)
  if (trek.length) {
    const complex = complexFor(trek[0] ?? '')
    const extra = combined.some((id) => {
      if (isTrekSight(id)) return false
      return !complex?.members.some((row) => canonicalSightId(row.id) === canonicalSightId(id))
    })
    if (extra) return true
  }
  const keys = heavyMergeKeys(combined, allIds)
  const boats = keys.filter((k) => k.startsWith('boat:') || k.startsWith('ex:'))
  if (new Set(boats).size > 1) return true
  const cables = keys.filter((k) => k.startsWith('cable:'))
  if (new Set(cables).size > 1) return true
  return false
}

function isoAtIndex(
  calendar: { startDate: string; firstDayNumber: number } | undefined,
  index: number,
): string {
  if (!calendar?.startDate) return ''
  return tripIsoDate(calendar.startDate, Math.max(1, calendar.firstDayNumber || 1) + index)
}

/**
 * Stuff leftover stub days back into the planned stay length. Never drops
 * sights. Stops when every remaining pair is two exclusive 8h outings.
 */
function compressToTargetDays(
  days: string[][],
  allIds: string[],
  target: number,
  calendar?: { startDate: string; firstDayNumber: number },
  startCoord?: PinCoord | null,
  placeId?: string | null,
  onlyIfFits = false,
): string[][] {
  let rows = collapseEmptyDays(days.map((row) => [...row]))
  if (rows.length <= target) return rows
  const unique = [...new Set(allIds.filter(Boolean))]

  const tryMerge = (a: string[], b: string[], iso: string): string[] | null => {
    if (mergeBlocked(a, b, unique)) return null
    if (
      onlyIfFits &&
      a.some(isAtomicExclusive) !== b.some(isAtomicExclusive)
    ) {
      return null
    }
    const combined = [...a, ...b]
    const packed = canonicalizeDay(combined, unique, iso, startCoord)
    if (packed.leftover.length === 0) return packed.fitted
    const shortened = nearestFeasibleWalk(combined, unique, iso, startCoord, PACK_DAY_OPEN, null, true)
    if (shortened.ok && shortened.ordered.length === combined.length) return shortened.ordered
    if (onlyIfFits) return null
    if (forceClusterConflict(a, b)) return null
    if (isHeavyParkDay(a, unique) || isHeavyParkDay(b, unique)) {
      if (!cableWithPass(a, b)) return null
    }
    const ordered = orderIdsForOpeningHours(combined, placeId, iso)
    return ordered.length ? ordered : combined
  }

  for (let guard = 0; rows.length > target && guard < unique.length + 8; guard++) {
    let best: { i: number; j: number; score: number; merged: string[] } | null = null
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const iso = isoAtIndex(calendar, i)
        const merged = tryMerge(rows[i], rows[j], iso)
        if (!merged) continue
        const ca = dayCentroid(rows[i])
        const cb = dayCentroid(rows[j])
        const dist = ca && cb ? haversineKm(ca, cb) : 40
        const thin = Math.min(rows[i].length, rows[j].length)
        const honest = cityDayHostsFullVisit(merged, placeId, iso) ? 0 : 25
        const score = honest + dist + thin * 0.15
        if (!best || score < best.score) best = { i, j, score, merged }
      }
    }
    if (!best) break
    rows[best.i] = best.merged
    rows.splice(best.j, 1)
  }
  return collapseEmptyDays(rows)
}

function splitDayByNeighborhood(ids: string[]): [string[], string[]] | null {
  if (ids.length < 2) return null
  const groups = new Map<string, string[]>()
  for (const id of ids) {
    const key = walkClusterId(id) || complexFor(id)?.id || `id:${canonicalSightId(id)}`
    groups.set(key, [...(groups.get(key) ?? []), id])
  }
  if (groups.size >= 2) {
    const parts = [...groups.values()].sort((a, b) => b.length - a.length)
    return [parts[0], parts.slice(1).flat()]
  }
  const ordered = orderSourceIdsByProximity(ids)
  const mid = Math.max(1, Math.floor(ordered.length / 2))
  return [ordered.slice(0, mid), ordered.slice(mid)]
}

/** Highland connectors get a second calendar day by splitting different sights — never by cloning one. */
function padStayToMinDays(
  days: string[][],
  allIds: string[],
  minDays: number,
): string[][] {
  let rows = collapseEmptyDays(days.map((row) => [...row]))
  if (rows.length >= minDays) return rows
  for (let guard = 0; rows.length < minDays && guard < allIds.length + 4; guard++) {
    const idx = rows.reduce((best, row, i) => (row.length > rows[best].length ? i : best), 0)
    const split = splitDayByNeighborhood(rows[idx] ?? [])
    if (!split || split[1].length === 0) break
    rows.splice(idx, 1, split[0], split[1])
  }
  return collapseEmptyDays(rows)
}

/** A sight is scheduled once. Cloning the same cruise/card onto two days is always a bug. */
function uniqueSightsAcrossDays(days: string[][]): string[][] {
  const seen = new Set<string>()
  return collapseEmptyDays(
    days.map((row) => {
      const kept: string[] = []
      for (const id of row) {
        if (!id || seen.has(id)) continue
        seen.add(id)
        kept.push(id)
      }
      return kept
    }),
  )
}

export function planCityStay(
  ids: string[],
  placeId?: string | null,
  calendar?: { startDate: string; firstDayNumber: number },
  opts?: { targetDays?: number; tripPlaceIds?: PlaceId[]; preferMaxDays?: number },
): { days: string[][] } {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return { days: [] }
  const startCoord = placeId ? placeCoords(placeId as PlaceId) : null
  const bounds = stayDayBounds(placeId, unique, opts?.tripPlaceIds ?? [])
  const maxDays = opts?.targetDays ?? bounds.max
  const minDays = opts?.targetDays ?? bounds.min
  const pieces = packingPieces(packUnits(unique), unique)
  const packed = packCityDays(pieces, unique, calendar, startCoord, maxDays)
  const filled = compactDaysFillFirst(collapseEmptyDays(packed), unique, calendar, startCoord)
  const compressTarget = opts?.targetDays ?? Math.min(maxDays, opts?.preferMaxDays ?? maxDays)
  const onlyIfFits =
    opts?.targetDays == null &&
    opts?.preferMaxDays != null &&
    opts.preferMaxDays < bounds.max
  const compressed = compressToTargetDays(
    filled,
    unique,
    compressTarget,
    calendar,
    startCoord,
    placeId,
    onlyIfFits,
  )
  return {
    days: uniqueSightsAcrossDays(padStayToMinDays(compressed, unique, minDays)),
  }
}

export type TripCityPackInput = { placeId: string; ids: string[] }
export type PackedTripCity = { placeId: string; days: string[][] }

/**
 * Trip-level assignment: cities stay geographically contiguous, but day counts
 * are chosen to minimize the whole remaining trip on the real calendar, then
 * each city block is rebalanced. Sights never move to a different city.
 */
export function packTripStay(
  cities: TripCityPackInput[],
  startDate: string,
  firstDayNumber = 1,
  preferredDaysByPlace?: Record<string, number>,
): PackedTripCity[] {
  const filtered = cities
    .map((city) => ({
      placeId: city.placeId,
      ids: [...new Set(city.ids.filter(Boolean))],
    }))
    .filter((city) => city.ids.length > 0)
  if (filtered.length === 0) return []

  const firstDay = Math.max(1, firstDayNumber)
  const tripPlaceIds = filtered.map((city) => city.placeId as PlaceId)
  let dayNum = firstDay
  return filtered.map((city) => {
    const packed = planCityStay(city.ids, city.placeId, {
      startDate,
      firstDayNumber: dayNum,
    }, {
      tripPlaceIds,
      preferMaxDays: preferredDaysByPlace?.[city.placeId],
    })
    const days = collapseEmptyDays(packed.days)
    dayNum += Math.max(1, days.length)
    return { placeId: city.placeId, days }
  })
}

export function daysToFitCitySights(
  ids: string[],
  _maxHours?: number,
  placeId?: string | null,
  calendar?: { startDate: string; firstDayNumber: number },
): number {
  const { days } = planCityStay(ids, placeId, calendar)
  return days.length
}

/** True when this city's day can host every listed stop for a full visit before close. */
export function cityDayHostsFullVisit(
  dayIds: string[],
  placeId?: string | null,
  isoDate = '',
): boolean {
  const unique = [...new Set(dayIds.filter(Boolean))]
  const startCoord = placeId ? placeCoords(placeId as PlaceId) : null
  return nearestFeasibleWalk(unique, unique, isoDate, startCoord, PACK_DAY_OPEN, null, false).ok
}

/** Pin rows are display only — never open a new day while the current clock still fits. */
export function assignIdsToFilledDays(
  ids: string[],
  placeId?: string | null,
  calendar?: { startDate: string; firstDayNumber: number },
  _pinnedSlots?: { slotIds: string[]; pinBySourceId: Record<string, string> },
): string[][] {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return []
  const planned = planCityStay(unique, placeId, calendar).days
  return planned.length > 0 ? planned : unique.length ? [unique] : []
}

/** Opening-hours order for a day’s stops. Leftovers stay last instead of stealing the morning. */
export function orderIdsForOpeningHours(
  ids: string[],
  placeId?: string | null,
  isoDate = '',
): string[] {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return []
  const startCoord = placeId ? placeCoords(placeId as PlaceId) : null
  const packed = canonicalizeDay(unique, unique, isoDate, startCoord)
  return [...packed.fitted, ...packed.leftover]
}

/**
 * True when this sight cannot realistically start before the evening — either
 * it is tagged EVENING or its opening hours say so. Two of these on one day
 * cannot both be scheduled however many hours are spare, so they spread out.
 */
function isLateAnchored(id: string): boolean {
  if (timePreferenceForSourceId(id) === 'EVENING') return true
  const kind = EXPERIENCE_BY_ID.has(id)
    ? 'experience'
    : ACTIVITY_BY_ID.has(id)
      ? 'activity'
      : null
  if (!kind) return false
  const hours = catalogHoursForSource(kind, id, 3)
  if (hours.alwaysOpen || hours.unknown || hours.closedToday || !hours.intervals?.length) return false
  const open = earliestOpenAt(hours, DAY_OPEN, catalogHoursForSourceId(id))
  return Number.isFinite(open) && open >= LATE_ANCHOR
}

function familyForSourceId(id: string): OccupancyFamily | null {
  const exp = EXPERIENCE_BY_ID.get(id)
  if (exp) return occupancyFamilyExperience(exp)
  const act = ACTIVITY_BY_ID.get(id)
  if (act) return occupancyFamilyActivity(act)
  return null
}

type Slot = {
  slotId: string
  ids: string[]
  hours: number
  families: Set<OccupancyFamily>
  locked: Set<string>
  /** groupIds already on this day — a place never appears on it twice. */
  groups: Set<string>
}

function centroidOf(ids: string[]): PinCoord | null {
  const pts = ids
    .map((id) => PIN_BY_SOURCE_ID[id])
    .filter((c): c is PinCoord => Boolean(c))
  if (pts.length === 0) return null
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  }
}

function distToCentroid(id: string, centroid: PinCoord | null): number {
  const here = PIN_BY_SOURCE_ID[id]
  if (!here || !centroid) return FAR_KM
  return haversineKm(centroid, here)
}

/**
 * Over capacity purely on time. A lone sight longer than the cap still owns its
 * day rather than being evicted, since moving it would not help anywhere else.
 */
function slotOverCap(slot: Slot, maxHours: number): boolean {
  return slot.ids.length > 1 && slot.hours > maxHours + 0.05
}

/**
 * Only two things can refuse a sight: the day's hours budget, and already
 * holding another variant of the same place.
 */
function slotCanTake(slot: Slot, hours: number, maxHours: number, id?: string): boolean {
  if (id && slot.groups.has(groupIdForSourceId(id))) return false
  if (slot.ids.length === 0) return true
  return slot.hours + hours <= maxHours + 0.05
}

function slotHoursLeft(slot: Slot, maxHours: number): number {
  return maxHours - slot.hours
}

function addToSlot(slot: Slot, id: string, hours: number) {
  slot.ids.push(id)
  slot.hours += hours
  const fam = familyForSourceId(id)
  if (fam) slot.families.add(fam)
  slot.groups.add(groupIdForSourceId(id))
}

function removeFromSlot(slot: Slot, id: string, hours: number) {
  slot.ids = slot.ids.filter((x) => x !== id)
  slot.hours = Math.max(0, slot.hours - hours)
  slot.families = new Set(
    slot.ids.map(familyForSourceId).filter((f): f is OccupancyFamily => Boolean(f)),
  )
  slot.groups = new Set(slot.ids.map(groupIdForSourceId))
}

export type AllocateCityDaysOpts = {
  ids: string[]
  slotIds: string[]
  /** sourceId -> slotId for sights the traveller placed by hand. Never moved. */
  pinned?: Record<string, string>
  hoursOf?: (id: string) => number
  priorityOf?: (id: string) => number
  /** Hours of sights one day may hold. Comes from the traveller's pace. */
  maxHours?: number
  /** Fill under-used days from leftover sights up to at least this many hours. */
  minHours?: number
}

export type CityDayAllocation = {
  bySlot: Record<string, string[]>
  unscheduled: string[]
  /** The per-day hours cap this allocation was built against. */
  maxHours: number
  /** Variants of a place already in the plan — filtered out, never scheduled. */
  duplicates: { id: string; keptId: string }[]
}

/**
 * Collapse variants of the same place (same `groupId`) down to one.
 * Hand-placed sights always survive, since the traveller asked for them. Failing
 * that the evening variant wins, because only it can fill an evening slot while a
 * daytime one competes for hours the rest of the pool can also use. Ties go to
 * the highest-value variant, and the losers are reported back rather than hidden.
 */
function dedupeByGroup(
  ids: string[],
  pinned: Record<string, string>,
  priorityOf: (id: string) => number,
): { kept: string[]; duplicates: { id: string; keptId: string }[] } {
  const order = [...ids].sort((a, b) => {
    const aPinned = pinned[a] != null
    const bPinned = pinned[b] != null
    if (aPinned !== bPinned) return aPinned ? -1 : 1
    const aEvening = timePreferenceForSourceId(a) === 'EVENING'
    const bEvening = timePreferenceForSourceId(b) === 'EVENING'
    if (aEvening !== bEvening) return aEvening ? -1 : 1
    return priorityOf(b) - priorityOf(a)
  })

  const kept: string[] = []
  const duplicates: { id: string; keptId: string }[] = []
  // groupId -> the slots it already occupies (pinned variants may span days).
  const claimed = new Map<string, { ids: string[]; slots: Set<string> }>()

  for (const id of order) {
    const group = groupIdForSourceId(id)
    const seen = claimed.get(group)
    if (!seen) {
      claimed.set(group, { ids: [id], slots: new Set(pinned[id] ? [pinned[id]] : []) })
      kept.push(id)
      continue
    }
    // A hand-placed variant on a different day was explicitly asked for.
    const slot = pinned[id]
    if (slot && !seen.slots.has(slot)) {
      seen.ids.push(id)
      seen.slots.add(slot)
      kept.push(id)
      continue
    }
    duplicates.push({ id, keptId: seen.ids[0] })
  }
  return { kept, duplicates }
}

/**
 * Spread a city's sight pool evenly over its days: K-means on lat/lng, then a repair
 * pass that pushes over-cap days onto the nearest day with room. Sights that fit
 * nowhere are returned as `unscheduled` rather than silently dropped.
 */
export function allocateCityDays(opts: AllocateCityDaysOpts): CityDayAllocation {
  const hoursOf = opts.hoursOf ?? catalogHoursForSourceId
  const priorityOf = opts.priorityOf ?? catalogPriorityForSourceId
  const slotIds = opts.slotIds.filter(Boolean)
  const maxHours = opts.maxHours && opts.maxHours > 0 ? opts.maxHours : DAY_MAX_HOURS
  const minHours = opts.minHours && opts.minHours > 0 ? Math.min(opts.minHours, maxHours) : 0
  const pinned = opts.pinned ?? {}

  // Variants of one place collapse to a single sight before anything is scheduled.
  const { kept: ids, duplicates } = dedupeByGroup(
    [...new Set(opts.ids.filter(Boolean))],
    pinned,
    priorityOf,
  )
  if (slotIds.length === 0) {
    return { bySlot: {}, unscheduled: ids, maxHours, duplicates }
  }

  const slots: Slot[] = slotIds.map((slotId) => ({
    slotId,
    ids: [],
    hours: 0,
    families: new Set<OccupancyFamily>(),
    locked: new Set<string>(),
    groups: new Set<string>(),
  }))
  const slotByIndex = new Map(slotIds.map((slotId, i) => [slotId, i]))

  // Hand-placed sights claim their day first and are charged against its budget.
  const free: string[] = []
  for (const id of ids) {
    const want = pinned[id]
    const idx = want != null ? slotByIndex.get(want) : undefined
    if (idx == null) {
      free.push(id)
      continue
    }
    addToSlot(slots[idx], id, hoursOf(id))
    slots[idx].locked.add(id)
  }

  // Cluster the rest, then hand each cluster to the day whose existing centre is closest.
  const clusters = free.length ? kMeansClusterIds(free, slots.length) : []
  const takenSlots = new Set<number>()
  const clusterOrder = clusters
    .map((cluster, i) => ({ cluster, i, centroid: centroidOf(cluster) }))
    .sort((a, b) => b.cluster.length - a.cluster.length)
  for (const { cluster, centroid } of clusterOrder) {
    if (cluster.length === 0) continue
    let target = -1
    let bestD = Number.POSITIVE_INFINITY
    slots.forEach((slot, i) => {
      if (takenSlots.has(i)) return
      const own = centroidOf(slot.ids)
      const d = own && centroid ? haversineKm(own, centroid) : slot.ids.length
      if (d < bestD) {
        bestD = d
        target = i
      }
    })
    if (target < 0) target = 0
    takenSlots.add(target)
    for (const id of cluster) addToSlot(slots[target], id, hoursOf(id))
  }

  const unscheduled: string[] = []

  // Repair: while a day busts a cap, hand its cheapest-to-move sight to the nearest day with room.
  for (let guard = 0; guard < ids.length * slots.length + 8; guard++) {
    const over = slots.find((slot) => slotOverCap(slot, maxHours))
    if (!over) break
    const ownCentroid = centroidOf(over.ids)
    const movable = over.ids.filter((id) => !over.locked.has(id))
    if (movable.length === 0) break

    type Move = { id: string; target: number; cost: number }
    let best: Move | null = null
    for (const id of movable) {
      const hours = hoursOf(id)
      const fam = familyForSourceId(id)
      const fromD = distToCentroid(id, ownCentroid)
      slots.forEach((slot, i) => {
        if (slot === over) return
        if (!slotCanTake(slot, hours, maxHours, id)) return
        const toD = distToCentroid(id, centroidOf(slot.ids))
        // Cheapest geographic delta wins; a family clash on the target is a soft penalty.
        let cost = toD - fromD
        if (occupancyConflicts(fam, slot.families)) cost += 2.5
        if (!best || cost < best.cost - 0.001) best = { id, target: i, cost }
      })
    }

    if (best) {
      const move: Move = best
      const hours = hoursOf(move.id)
      removeFromSlot(over, move.id, hours)
      addToSlot(slots[move.target], move.id, hours)
      continue
    }

    // Every other day is full: park the lowest-priority movable sight.
    const drop = [...movable].sort((a, b) => priorityOf(a) - priorityOf(b))[0]
    removeFromSlot(over, drop, hoursOf(drop))
    unscheduled.push(drop)
  }

  spreadLateAnchors(slots, hoursOf, maxHours)
  levelSlotLoad(slots, hoursOf, maxHours, minHours)

  // Backfill: a sight only stays unscheduled if EVERY day is genuinely out of hours.
  // Under-min days and empty windows get first claim, then leftover room.
  const stillUnscheduled = fillFromUnscheduled(
    slots,
    unscheduled,
    hoursOf,
    priorityOf,
    maxHours,
    minHours,
  )

  const bySlot: Record<string, string[]> = {}
  for (const slot of slots) bySlot[slot.slotId] = slot.ids
  return { bySlot, unscheduled: stillUnscheduled, maxHours, duplicates }
}

/**
 * Give each day at most one evening-only stop while a day without one has room.
 * Without this, two late openers share a day and one can never be scheduled even
 * though the day looks half empty.
 */
function spreadLateAnchors(
  slots: Slot[],
  hoursOf: (id: string) => number,
  maxHours: number,
) {
  if (slots.length < 2) return
  const lateOf = (slot: Slot) => slot.ids.filter(isLateAnchored)

  for (let guard = 0; guard < slots.length * 4; guard++) {
    const donor = slots.find((s) => lateOf(s).length > 1)
    if (!donor) return
    const movable = lateOf(donor).filter((id) => !donor.locked.has(id))
    if (movable.length === 0) return

    // Hand over the shortest late stop — it is the easiest to re-home.
    const id = movable.sort((a, b) => hoursOf(a) - hoursOf(b))[0]
    const hours = hoursOf(id)
    const target = slots
      .filter(
        (s) => s !== donor && lateOf(s).length === 0 && slotCanTake(s, hours, maxHours, id),
      )
      .sort(
        (a, b) =>
          distToCentroid(id, centroidOf(a.ids)) - distToCentroid(id, centroidOf(b.ids)),
      )[0]
    if (!target) return

    removeFromSlot(donor, id, hours)
    addToSlot(target, id, hours)
  }
}

function slotNeedsHours(slot: Slot, minHours: number, maxHours: number): boolean {
  if (slot.ids.length === 0) return true
  if (minHours > 0 && slot.hours < minHours - 0.05) return true
  return slot.hours + 0.05 < maxHours
}

function donorShouldGive(
  donor: Slot,
  receiver: Slot,
  minHours: number,
  maxHours: number,
): boolean {
  if (donor === receiver) return false
  if (donor.ids.length === 0) return false
  if (!slotNeedsHours(receiver, minHours, maxHours)) return false
  if (donor.hours > maxHours + 0.05) return true
  if (minHours > 0 && receiver.hours < minHours - 0.05 && donor.hours > minHours + 0.05) {
    return true
  }
  if (donor.ids.length - receiver.ids.length > 1) return true
  return donor.hours - receiver.hours >= 2
}

/**
 * Even out the day loads so one day cannot sit near the hours cap while another
 * is sparse. Each hand-over picks the sight that is cheapest to give away geographically.
 */
function levelSlotLoad(
  slots: Slot[],
  hoursOf: (id: string) => number,
  maxHours: number,
  minHours = 0,
) {
  if (slots.length < 2) return
  const total = slots.reduce((n, s) => n + s.ids.length, 0)
  for (let guard = 0; guard < (total + slots.length) * 4; guard++) {
    const ranked = [...slots].sort(
      (a, b) => b.hours - a.hours || b.ids.length - a.ids.length,
    )
    const receiver = ranked[ranked.length - 1]
    let moved = false

    for (const donor of ranked) {
      if (!donorShouldGive(donor, receiver, minHours, maxHours)) continue
      const donorCentroid = centroidOf(donor.ids)
      const receiverCentroid = centroidOf(receiver.ids)

      let bestId: string | null = null
      let bestCost = Number.POSITIVE_INFINITY
      const receiverHasLate = receiver.ids.some(isLateAnchored)
      for (const id of donor.ids) {
        if (donor.locked.has(id)) continue
        if (!slotCanTake(receiver, hoursOf(id), maxHours, id)) continue
        // Never stack a second evening-only stop on the receiving day.
        if (receiverHasLate && isLateAnchored(id)) continue
        if (minHours > 0 && donor.hours - hoursOf(id) + 0.05 < minHours && donor.hours <= maxHours) {
          if (!(receiver.hours < minHours - 0.05)) continue
        }
        // With an empty receiver, hand over the donor's own outlier so the new day
        // starts as its own cluster instead of splitting the donor's core.
        const cost = receiverCentroid
          ? distToCentroid(id, receiverCentroid) - distToCentroid(id, donorCentroid)
          : -distToCentroid(id, donorCentroid)
        if (cost < bestCost) {
          bestCost = cost
          bestId = id
        }
      }
      if (bestId == null) continue

      const hours = hoursOf(bestId)
      removeFromSlot(donor, bestId, hours)
      addToSlot(receiver, bestId, hours)
      moved = true
      break
    }
    if (!moved) break
  }
}

/**
 * Park leftover sights on days that still have hours left — empty parts of a day
 * and days below the pace floor get first claim.
 */
function fillFromUnscheduled(
  slots: Slot[],
  unscheduled: string[],
  hoursOf: (id: string) => number,
  priorityOf: (id: string) => number,
  maxHours: number,
  minHours: number,
): string[] {
  const remaining = [...unscheduled]
  const placed = new Set<string>()

  const pickTarget = (id: string, hours: number, preferUnderMin: boolean): Slot | null => {
    const late = isLateAnchored(id)
    let target: Slot | null = null
    let bestScore = Number.NEGATIVE_INFINITY
    for (const slot of slots) {
      if (!slotCanTake(slot, hours, maxHours, id)) continue
      if (late && slot.ids.some(isLateAnchored)) continue
      const under = minHours > 0 && slot.hours < minHours - 0.05
      const empty = slot.ids.length === 0
      if (preferUnderMin && !under && !empty) continue
      const score =
        (empty ? 8 : 0) +
        (under ? 6 : 0) +
        slotHoursLeft(slot, maxHours) -
        distToCentroid(id, centroidOf(slot.ids)) / 12
      if (score > bestScore) {
        bestScore = score
        target = slot
      }
    }
    return target
  }

  const order = [...remaining].sort((a, b) => priorityOf(b) - priorityOf(a))
  for (const preferUnderMin of [true, false]) {
    for (const id of order) {
      if (placed.has(id)) continue
      const hours = hoursOf(id)
      const target = pickTarget(id, hours, preferUnderMin)
      if (!target) continue
      addToSlot(target, id, hours)
      placed.add(id)
    }
  }

  return remaining.filter((id) => !placed.has(id))
}

/** Flat sourceId -> slotId map, for callers that only need the day assignment. */
export function allocationToSlotMap(allocation: CityDayAllocation): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [slotId, ids] of Object.entries(allocation.bySlot)) {
    for (const id of ids) out[id] = slotId
  }
  return out
}

/**
 * Trim one day's already-ordered tour to the day's hours budget. Purely
 * duration-driven: the number of stops is never a reason to reject one.
 * `locked` ids (hand-placed) are kept ahead of auto-packed ones.
 */
export function capDayTour<T>(
  tour: T[],
  hoursOf: (item: T) => number,
  isLocked?: (item: T) => boolean,
  maxHours = DAY_MAX_HOURS,
): { kept: T[]; overflow: T[] } {
  const rank = tour.map((item, i) => ({ item, i, locked: Boolean(isLocked?.(item)) }))
  const priority = [...rank].sort((a, b) => {
    if (a.locked !== b.locked) return a.locked ? -1 : 1
    return a.i - b.i
  })
  const keep = new Set<number>()
  let hours = 0
  for (const row of priority) {
    const h = Math.max(0.5, hoursOf(row.item))
    if (keep.size > 0 && hours + h > maxHours + 0.05) continue
    keep.add(row.i)
    hours += h
  }
  const kept: T[] = []
  const overflow: T[] = []
  rank.forEach((row) => (keep.has(row.i) ? kept : overflow).push(row.item))
  return { kept, overflow }
}
