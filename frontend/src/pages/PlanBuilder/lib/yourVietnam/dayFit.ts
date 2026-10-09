import type { TravelStyle } from '../../types'
import { layoutCompactDay, isSight } from './layoutDay'
import { buildCompactTimeline, isSqueezed, type TimelineBlock } from './dayTimeline'
import { catalogHoursForItem, tripIsoDate, weekdayFromIso } from './openingHours'
import { PACE_DAY_HOURS, planningProfile } from './planningProfile'
import { groupIdForItem } from './sightTiming'
import { isTimedLanding, parentTourId } from './sightPlanning'
import { agentDwellHours, catalogPriorityForSourceId } from './dayAllocation'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import { haversineKm, type PinCoord } from './sightOrder'
import { mealKindOf } from './itemKind'
import type { DayPeriod, ItineraryItem, YourVietnamDay } from './types'

/** One hop between consecutive stops longer than this means the day is split across town. */
const LONG_HOP_HOURS = 70 / 60
/** Slack over the pace budget before a day counts as overloaded. */
const CAP_SLACK_HOURS = 0.5
/** How far past the pace budget a day may run to keep a stop that would otherwise close or clash. */
const RELAXED_EXTRA_HOURS = 1.5

/** `far`: strict on the clock, but the stop is out of town wherever it goes. */
type Fit = 'strict' | 'relaxed' | 'loose' | 'far'
/** Travel a new stop can save by reordering the day; the quick hours pre-check allows for it. */
const HOP_MARGIN_HOURS = 0.5
/** An onward move this long leaves no evening out in the city being left. */
const ONWARD_EVENING_HOURS = 2

export type DayCheck = {
  /** Stops the clock cannot hold, or only holds by gutting the visit. */
  unplaced: string[]
  closed: string[]
  /** Sightseeing plus travel between stops, in hours (meals and breaks excluded, evenings at half weight). */
  activeHours: number
  /** The same hours with evenings at full weight. */
  fullHours: number
  longHops: { from: string; to: string; hours: number }[]
  /** Later variants of a place already on the day. */
  sameGroup: string[]
  blocks: TimelineBlock[]
}

export type DayFitEnv = {
  placeId: string
  city: string
  startDate: string
  dayStart: string
  pace: TravelStyle
  hotelId?: string
  startOverrides: Record<string, string>
  pinnedIds: Set<string>
  /** Builds the same card the board renders for a sight on a day with `dayIds`. */
  itemFor: (id: string, dayIds: string[]) => ItineraryItem | null
}

function emptyPeriods(items: ItineraryItem[]): DayPeriod[] {
  return [
    { id: 'morning', label: 'Morning', windowLabel: '', items },
    { id: 'afternoon', label: 'Afternoon', windowLabel: '', items: [] },
    { id: 'evening', label: 'Evening', windowLabel: '', items: [] },
    { id: 'night', label: 'Night', windowLabel: '', items: [] },
  ]
}

/** Evening hours weigh half: a lantern walk after a rest is not a second shift. */
const EVENING_FROM = 18
const EVENING_WEIGHT = 0.5

function weightedHours(intervals: [number, number][]): number {
  const day = intervals
    .map(([s, e]) => [s, Math.min(e, EVENING_FROM)] as [number, number])
    .filter(([s, e]) => e > s)
  const night = intervals
    .map(([s, e]) => [Math.max(s, EVENING_FROM), e] as [number, number])
    .filter(([s, e]) => e > s)
  return mergedHours(day) + mergedHours(night) * EVENING_WEIGHT
}

function mergedHours(intervals: [number, number][]): number {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  let total = 0
  let curStart = Number.NaN
  let curEnd = Number.NaN
  for (const [s, e] of sorted) {
    if (Number.isNaN(curStart) || s > curEnd) {
      if (!Number.isNaN(curStart)) total += curEnd - curStart
      curStart = s
      curEnd = e
    } else {
      curEnd = Math.max(curEnd, e)
    }
  }
  if (!Number.isNaN(curStart)) total += curEnd - curStart
  return total
}

/**
 * Runs a day exactly the way the itinerary board does — same card layout, same
 * timed schedule — and reports everything a traveller would trip over.
 */
export function checkDay(ids: string[], dayNumber: number, env: DayFitEnv, tourOrder?: string[]): DayCheck {
  const items = ids
    .map((id) => env.itemFor(id, ids))
    .filter((it): it is ItineraryItem => Boolean(it))
  const isoDate = tripIsoDate(env.startDate, dayNumber)
  const weekday = weekdayFromIso(isoDate)
  const slotId = 'fit'
  const stub = {
    day: dayNumber,
    dateLabel: '',
    city: env.city,
    region: env.city,
    slotId,
    placeId: env.placeId,
    theme: '',
    blurb: '',
    nightsHere: 1,
    experienceCount: items.length,
    foodCount: 0,
    transferCount: 0,
    agenda: { sights: [], do: [], eat: [] },
    periods: emptyPeriods(items),
    costs: { stay: 0, food: 0, transport: 0, experiences: 0, shopping: 0, other: 0, total: 0 },
    issues: [],
    hotelId: env.hotelId,
    stayGap: !env.hotelId,
  } as unknown as YourVietnamDay
  const profile = planningProfile({ pace: env.pace, userStartTime: env.dayStart })
  const laid = layoutCompactDay({
    day: stub,
    cityDays: [stub],
    slotOverrides: {},
    dayOverrides: {},
    daySlotOverrides: {},
    sightOrder: tourOrder?.length ? { [`${slotId}:tour`]: tourOrder } : {},
    transferSlot: null,
    arrivalSlot: 'morning',
    hoursBySourceId: {},
    isoDate,
    startDate: env.startDate,
    userPinnedIds: env.pinnedIds,
    profile,
    fillPool: [],
  })
  const laidSights = [
    ...laid.periods.flatMap((p) => p.items.filter(isSight)),
    ...laid.overflow.filter(isSight),
  ]
    .filter((it) => it.selectionState !== 'recommended')
    .filter((it, i, all) => !it.sourceId || all.findIndex((row) => row.sourceId === it.sourceId) === i)
  const hoursOf = (item: ItineraryItem) => catalogHoursForItem(item, weekday, isoDate)
  const closed = laidSights.filter((it) => hoursOf(it).closedToday)
  const open = laidSights.filter((it) => !hoursOf(it).closedToday)
  const tl = buildCompactTimeline({
    sights: open,
    breaks: [],
    dayStart: env.dayStart,
    lastSightEndBy: null,
    durationOverrides: {},
    startOverrides: env.startOverrides,
    legs: {},
    hoursOf,
    isoDate,
    autoLunch: false,
  })

  const busy: [number, number][] = []
  const longHops: DayCheck['longHops'] = []
  const squeezed: string[] = []
  for (const b of tl.blocks) {
    if (b.type === 'sight' && !mealKindOf(b.item)) {
      busy.push([b.startHour, b.endHour])
      if (b.item.sourceId && isSqueezed(b)) squeezed.push(b.item.sourceId)
    }
    if (b.type === 'transit') {
      busy.push([b.startHour, b.endHour])
      const hours = b.endHour - b.startHour
      if (hours > LONG_HOP_HOURS) longHops.push({ from: b.fromSourceId, to: b.toSourceId, hours })
    }
  }
  const seenGroups = new Set<string>()
  const sameGroup: string[] = []
  for (const it of open) {
    if (!it.sourceId || mealKindOf(it)) continue
    const g = groupIdForItem(it)
    if (seenGroups.has(g)) sameGroup.push(it.sourceId)
    seenGroups.add(g)
  }
  return {
    unplaced: [
      ...tl.unplaced.map((it) => it.sourceId).filter((id): id is string => Boolean(id)),
      ...squeezed,
    ],
    closed: closed.map((it) => it.sourceId).filter((id): id is string => Boolean(id)),
    activeHours: weightedHours(busy),
    fullHours: mergedHours(busy),
    longHops,
    sameGroup,
    blocks: tl.blocks,
  }
}

export type DayRole = {
  /** First day of the whole trip — the traveller is landing. */
  arrival: boolean
  /** Last day of the whole trip — the traveller is flying out. */
  departure: boolean
  /** Hours of the city-to-city move that follows this day, 0 when staying put. */
  transferHours: number
}

/** Hours of sights and in-town travel this day may hold for this pace and role. */
export function dayCapHours(pace: TravelStyle, role: DayRole): number {
  const base = PACE_DAY_HOURS[pace] ?? PACE_DAY_HOURS.balanced
  let cap = base
  if (role.arrival) cap = Math.min(cap, Math.max(3.5, base - 2))
  if (role.departure) cap = Math.min(cap, Math.max(3.5, base - 1.5))
  // Sights plus the onward drive may run a little past a normal day, not a lot.
  if (role.transferHours > 0) cap = Math.min(cap, Math.max(3, base + 1.5 - role.transferHours))
  return cap
}

function coordOf(id: string): PinCoord | null {
  return PIN_BY_SOURCE_ID[id] ?? null
}

function centroid(ids: string[]): PinCoord | null {
  const pts = ids.map(coordOf).filter((c): c is PinCoord => Boolean(c))
  if (!pts.length) return null
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  }
}

export type CityFitInput = {
  rows: string[][]
  /** Global day number of `rows[0]`. */
  firstDayNumber: number
  env: DayFitEnv
  roleFor: (dayIndexInCity: number, rowCount: number) => DayRole
  /** Day count is fixed (authored template / hand-ordered days): only move between existing days. */
  fixedDays: boolean
  /** Pins may still move off a day where the date makes them impossible (closed, cannot fit). */
  softPins: boolean
  /**
   * With a fixed day count, a stop no day can hold comes off the plan (returned
   * in `unfit`) instead of staying on a day it breaks.
   */
  dropOverflow?: boolean
  tourOrderFor?: (dayIndexInCity: number) => string[] | undefined
  /** Calendar days a row adds after itself (a multi-day expedition keeps the group out). */
  extraDaysAfter?: (row: string[]) => number
}

/**
 * Makes every day of one city genuinely doable on its real date:
 * nothing closed, nothing the clock cannot hold, no second visit to the same
 * place, no cross-town zigzag, and no more hours than the pace allows. Stops
 * that do not fit move to the best other day, or to a new day when none can
 * take them. Nothing is ever dropped silently — impossible stops come back in
 * `unfit` so the board can list them.
 */
export function fitCityDays(input: CityFitInput): { rows: string[][]; unfit: string[]; lastDayHours: number } {
  const { env, fixedDays, softPins } = input
  const allIds = [...new Set(input.rows.flat())]
  const rows = input.rows.map((row) => [...new Set(row)]).filter((row) => row.length > 0)
  if (!rows.length) return { rows: [], unfit: [], lastDayHours: 0 }

  // A timed landing (a stop inside a boat / trek / cable outing) travels with its outing.
  const unitOf = new Map<string, string[]>()
  for (const id of allIds) {
    const parent = parentTourId(id)
    if (parent && allIds.includes(parent) && isTimedLanding(id, allIds)) {
      unitOf.set(parent, [...(unitOf.get(parent) ?? [parent]), id])
      unitOf.set(id, unitOf.get(parent)!)
    }
  }
  const unitFor = (id: string) => unitOf.get(id) ?? [id]
  /** Stops that already had every option tried; they stay put. */
  const settled = new Set<string>()
  const locked = (id: string) => env.pinnedIds.has(id) || settled.has(unitFor(id)[0])

  const dayNumberAt = (index: number) =>
    input.firstDayNumber +
    index +
    (input.extraDaysAfter ? rows.slice(0, index).reduce((sum, row) => sum + input.extraDaysAfter!(row), 0) : 0)

  const cache = new Map<string, DayCheck>()
  const check = (row: string[], index: number): DayCheck => {
    const dayNumber = dayNumberAt(index)
    const key = `${index}|${dayNumber}|${row.join(',')}`
    const hit = cache.get(key)
    if (hit) return hit
    const tour = input.tourOrderFor?.(index)
    const out = checkDay(row, dayNumber, env, tour)
    cache.set(key, out)
    return out
  }
  const capAt = (index: number, count: number) => dayCapHours(env.pace, input.roleFor(index, count))
  /** The evening of a moving-on day belongs to the road, so it counts in full. */
  const loadAt = (c: DayCheck, index: number, count: number) =>
    index === count - 1 && input.roleFor(index, count).transferHours > 0 ? c.fullHours : c.activeHours

  const movable = (id: string) =>
    !settled.has(unitFor(id)[0]) && (!env.pinnedIds.has(id) || softPins)

  /** A stop moves with its outing, so it is worth as much as the best stop it drags along. */
  const worthIn = (id: string, row: string[]) =>
    Math.max(...unitFor(id).filter((x) => x === id || row.includes(x)).map(catalogPriorityForSourceId))

  /** Ids to take off this day, most urgent first. Empty when the day is fine. */
  function problems(row: string[], index: number, count: number): string[] {
    const c = check(row, index)
    const closed = c.closed.filter(movable)
    if (closed.length) return closed
    const unplaced = c.unplaced.filter(movable)
    if (unplaced.length) {
      // The clock ran out: the stop that missed its slot is not always the one to lose.
      const top = [...unplaced].sort((a, b) => worthIn(b, row) - worthIn(a, row))[0]
      const lesser = row
        .filter(
          (id) =>
            movable(id) &&
            !c.unplaced.includes(id) &&
            !unitFor(top).includes(id) &&
            worthIn(id, row) < worthIn(top, row),
        )
        .sort((a, b) => worthIn(a, row) - worthIn(b, row))
      for (const id of lesser.slice(0, 2)) {
        const trial = check(row.filter((x) => !unitFor(id).includes(x)), index)
        if (!trial.unplaced.includes(top) && !trial.closed.length) return [id]
      }
      return unplaced
    }
    const free = row.filter(movable)
    if (c.sameGroup.some(movable)) return c.sameGroup.filter(movable)
    if (!fixedDays && index === count - 1 && input.roleFor(index, count).transferHours >= ONWARD_EVENING_HOURS) {
      // A long move follows this day: the evening out belongs on another night here.
      for (const b of c.blocks) {
        if (b.type !== 'sight' || mealKindOf(b.item) || b.startHour < EVENING_FROM) continue
        if (b.item.sourceId && movable(b.item.sourceId)) return [b.item.sourceId]
      }
    }
    if (row.length > 1 && loadAt(c, index, count) > capAt(index, count) + CAP_SLACK_HOURS && free.length) {
      // Keep the day's anchor (its best-loved stop, longest on a tie); shed the least-loved other stop.
      const ranked = [...free].sort((a, b) => worthIn(a, row) - worthIn(b, row))
      const span = (x: string) =>
        c.blocks.reduce(
          (s, b) => s + (b.type === 'sight' && b.item.sourceId === x ? b.endHour - b.startHour : 0),
          0,
        )
      const anchor = row.reduce((best, id) => {
        const gap = worthIn(id, row) - worthIn(best, row)
        return gap > 0 || (gap === 0 && span(id) > span(best)) ? id : best
      }, row[0])
      const shed = ranked.find((id) => id !== anchor && !unitFor(anchor).includes(id))
      if (shed) return [shed]
    }
    if (c.longHops.length && row.length > 1) {
      const mid = centroid(row)
      for (const hop of c.longHops) {
        const ends = [hop.from, hop.to].filter((id) => id && movable(id))
        if (!ends.length) continue
        const far = ends.sort((a, b) => {
          const ca = coordOf(a)
          const cb = coordOf(b)
          const da = ca && mid ? haversineKm(ca, mid) : 0
          const db = cb && mid ? haversineKm(cb, mid) : 0
          return db - da
        })[0]
        return [far]
      }
    }
    return []
  }

  const unfit: string[] = []
  /**
   * `hard`: cannot happen where it was (closed / no room on the clock);
   * `load`: the day is over the pace budget; `hop`: it made a cross-town zigzag.
   */
  type Reason = 'hard' | 'group' | 'load' | 'hop'
  const queue: { unit: string[]; reason: Reason; homeIndex: number; homeMate: string | null }[] = []

  function evictFrom(index: number) {
    for (let guard = 0; guard < 40; guard++) {
      const bad = problems(rows[index], index, rows.length)
      if (!bad.length) return
      const c = check(rows[index], index)
      const id = bad[0]
      const reason: Reason =
        c.closed.includes(id) || c.unplaced.includes(id)
          ? 'hard'
          : c.unplaced.some(movable)
            ? 'load'
            : c.sameGroup.includes(id)
            ? 'group'
            : c.longHops.some((h) => h.from === id || h.to === id) &&
                loadAt(c, index, rows.length) <= capAt(index, rows.length) + CAP_SLACK_HOURS
              ? 'hop'
              : 'load'
      const unit = unitFor(id)
      rows[index] = rows[index].filter((x) => !unit.includes(x))
      queue.push({ unit, reason, homeIndex: index, homeMate: rows[index][0] ?? null })
      if (!rows[index].length) return
    }
  }

  /**
   * A day can take the stop when everything on it still happens. `strict` also
   * keeps the day inside the pace budget and adds no cross-town hop; `relaxed`
   * allows a somewhat longer day, still without a new hop.
   */
  function takes(j: number, trial: string[], fit: Fit): boolean {
    const extra = fit === 'relaxed' ? RELAXED_EXTRA_HOURS : CAP_SLACK_HOURS
    const before = fit === 'loose' ? null : check(rows[j], j)
    if (before) {
      // Even counted at the evening half-rate, the new stop cannot fit: skip the full timeline.
      const adding = trial
        .filter((id) => !rows[j].includes(id))
        .reduce((sum, id) => sum + agentDwellHours(id, trial), 0)
      if (loadAt(before, j, rows.length) + adding * 0.5 > capAt(j, rows.length) + extra + HOP_MARGIN_HOURS) {
        return false
      }
    }
    const c = check(trial, j)
    if (c.closed.length || c.unplaced.length || c.sameGroup.length) return false
    if (!before) return true
    if (loadAt(c, j, rows.length) > capAt(j, rows.length) + extra) return false
    return fit === 'far' || c.longHops.length <= before.longHops.length
  }

  function placeUnit(unit: string[], from: number | null, fit: Fit = 'strict'): boolean {
    let best: { index: number; score: number } | null = null
    const where = centroid(unit)
    for (let j = 0; j < rows.length; j++) {
      if (j === from || !rows[j].length) continue
      const trial = [...rows[j], ...unit]
      if (!takes(j, trial, fit)) continue
      const c = check(trial, j)
      const mid = centroid(rows[j])
      const dist = where && mid ? haversineKm(where, mid) : 5
      const score = dist + c.activeHours * 0.6
      if (!best || score < best.score) best = { index: j, score }
    }
    if (best) {
      rows[best.index] = [...rows[best.index], ...unit]
      return true
    }
    return false
  }

  for (let pass = 0; pass < 4; pass++) {
    // An emptied day disappears, which moves every later day to a new date: re-check them there.
    for (let i = rows.length - 1; i >= 0; i--) if (!rows[i].length) rows.splice(i, 1)
    for (let i = 0; i < rows.length; i++) evictFrom(i)
    if (!queue.length) break
    const pending = queue.splice(0).sort((a, b) => b.unit.length - a.unit.length)
    for (const entry of pending) {
      const { unit, reason } = entry
      const hard = reason === 'hard'
      if (placeUnit(unit, null)) continue
      // A long drive alone never earns an extra day or costs the stop its place.
      if (reason === 'hop') {
        if (placeUnit(unit, null, 'far')) settled.add(unit[0])
        else putHome(entry)
        continue
      }
      if (!fixedDays && openNewDay(unit)) continue
      // A stop that cannot stay where it is may make another day a little longer.
      if (reason !== 'load' && placeUnit(unit, null, 'relaxed')) continue
      if (fixedDays && input.dropOverflow && unit.every(movable)) {
        if (!displaceLesser(unit)) unfit.push(...unit)
        continue
      }
      // Better a long day than a closed door or a stop the clock cannot hold.
      if (hard && placeUnit(unit, null, 'loose')) continue
      // Nowhere works: leave it where it was so the day lists it under "could not fit".
      putHome(entry)
    }
  }

  /** A fixed-length trip must drop something: let it be the least-loved stop, not the one that moved last. */
  function displaceLesser(unit: string[]): boolean {
    const worth = Math.max(...unit.map(catalogPriorityForSourceId))
    let best: { index: number; trial: string[]; victim: string[]; loss: number } | null = null
    for (let j = 0; j < rows.length; j++) {
      const lesser = rows[j]
        .filter((id) => movable(id) && !unit.includes(id) && worthIn(id, rows[j]) < worth)
        .sort((a, b) => worthIn(a, rows[j]) - worthIn(b, rows[j]))
      for (const id of lesser.slice(0, 2)) {
        const victim = unitFor(id).filter((x) => rows[j].includes(x))
        if (victim.some((x) => !movable(x))) continue
        const loss = Math.max(...victim.map(catalogPriorityForSourceId))
        if (loss >= worth || (best && loss >= best.loss)) continue
        const trial = [...rows[j].filter((x) => !victim.includes(x)), ...unit]
        const c = check(trial, j)
        if (c.closed.length || c.unplaced.length || c.sameGroup.length) continue
        if (loadAt(c, j, rows.length) > capAt(j, rows.length) + CAP_SLACK_HOURS) continue
        if (c.longHops.length > check(rows[j], j).longHops.length) continue
        best = { index: j, trial, victim, loss }
      }
    }
    if (!best) return false
    rows[best.index] = best.trial
    unfit.push(...best.victim)
    return true
  }

  function putHome(entry: { unit: string[]; homeIndex: number; homeMate: string | null }) {
    const byMate = entry.homeMate ? rows.findIndex((row) => row.includes(entry.homeMate!)) : -1
    const home = byMate >= 0 ? byMate : entry.homeIndex
    const target = rows[home] ? home : Math.max(0, rows.length - 1)
    if (!rows[target]) rows.push([])
    rows[target] = [...rows[target], ...entry.unit]
    settled.add(entry.unit[0])
  }

  /**
   * Give the stop a day of its own. Where that day goes changes its date, so
   * try from the end backwards and take the first spot where the new day works
   * and no later day breaks because its date moved.
   */
  function openNewDay(unit: string[]): boolean {
    // An emptied day will be dropped, so it must not count toward the new day's date.
    for (let i = rows.length - 1; i >= 0; i--) if (!rows[i].length) rows.splice(i, 1)
    const okBefore = rows.map((row, j) => problems(row, j, rows.length).length === 0)
    for (let k = rows.length; k >= 0; k--) {
      const trial = [...rows.slice(0, k), [...unit], ...rows.slice(k)]
      const n = trial.length
      if (problems(trial[k], k, n).length) continue
      let ok = true
      for (let j = k + 1; j < n && ok; j++) {
        if (okBefore[j - 1] && problems(trial[j], j, n).length) ok = false
      }
      if (ok) {
        rows.splice(k, 0, [...unit])
        return true
      }
    }
    return false
  }

  if (!fixedDays) compactCity()
  lightenEnds()

  /**
   * Arrival and travel-out days have the smallest budgets. When one is over,
   * swap in whichever other day of the city carries less, provided both days
   * still work on their new dates.
   */
  function lightenEnds() {
    const over = (row: string[], j: number) =>
      Math.max(0, loadAt(check(row, j), j, rows.length) - (capAt(j, rows.length) + CAP_SLACK_HOURS))
    const works = (row: string[], j: number) => {
      const c = check(row, j)
      return !c.closed.length && !c.unplaced.length && !c.sameGroup.length
    }
    for (const end of [rows.length - 1, 0]) {
      if (rows.length < 2 || !rows[end].every(movable)) continue
      const now = over(rows[end], end)
      if (now <= 0) continue
      let best: { j: number; total: number } | null = null
      for (let j = 0; j < rows.length; j++) {
        if (j === end || !rows[j].every(movable)) continue
        if (!works(rows[j], end) || !works(rows[end], j)) continue
        const total = over(rows[j], end) + over(rows[end], j)
        if (total < now + over(rows[j], j) - 0.25 && (!best || total < best.total)) best = { j, total }
      }
      if (best) [rows[end], rows[best.j]] = [rows[best.j], rows[end]]
    }
  }

  function compactCity() {
    // Fold the lightest day into the others when every stop still fits cleanly.
    for (let guard = 0; guard < rows.length + 2 && rows.length > 1; guard++) {
      const order = rows
        .map((row, i) => ({ i, hours: check(row, i).activeHours }))
        .sort((a, b) => a.hours - b.hours)
      let folded = false
      for (const { i } of order) {
        if (rows[i].some(locked)) continue
        // The other days together must have room for this day's hours at all.
        const room = rows.reduce(
          (sum, row, j) =>
            j === i
              ? sum
              : sum + Math.max(0, capAt(j, rows.length) + CAP_SLACK_HOURS - loadAt(check(row, j), j, rows.length)),
          0,
        )
        const need = rows[i].reduce((sum, id) => sum + agentDwellHours(id, rows[i]), 0) * 0.5
        if (need > room + HOP_MARGIN_HOURS) continue
        const snapshot = rows.map((row) => [...row])
        const moving = rows[i]
        rows.splice(i, 1)
        let ok = true
        const units: string[][] = []
        const seen = new Set<string>()
        for (const id of moving) {
          if (seen.has(id)) continue
          const unit = unitFor(id).filter((x) => moving.includes(x))
          unit.forEach((x) => seen.add(x))
          units.push(unit)
        }
        for (const unit of units) {
          if (!placeUnit(unit, null)) {
            ok = false
            break
          }
        }
        // Removing a day shifts every later date; they must all still work.
        if (ok) ok = rows.every((row, j) => problems(row, j, rows.length).length === 0)
        if (ok) {
          folded = true
          break
        }
        rows.length = 0
        rows.push(...snapshot)
      }
      if (!folded) break
    }
  }

  // Later moves can free room a dropped stop was refused earlier.
  if (unfit.length) {
    const seen = new Set<string>()
    const waiting = unfit.splice(0)
    for (const id of waiting) {
      if (seen.has(id)) continue
      const unit = unitFor(id).filter((x) => waiting.includes(x))
      unit.forEach((x) => seen.add(x))
      if (!placeUnit(unit, null)) unfit.push(...unit)
    }
  }

  const kept = rows.filter((row) => row.length > 0)
  const lastDayHours = kept.length ? check(kept[kept.length - 1], kept.length - 1).fullHours : 0
  return { rows: kept, unfit, lastDayHours }
}

/** The onward move cannot follow this day's touring the same evening, so it happens next morning. */
export function transferSpillsToNextMorning(pace: TravelStyle, lastDayHours: number, transferHours: number): boolean {
  const base = PACE_DAY_HOURS[pace] ?? PACE_DAY_HOURS.balanced
  return transferHours > 0 && lastDayHours + transferHours > base + 1.5 + CAP_SLACK_HOURS
}
