import type { DayPeriod, ItineraryItem, PeriodId, UnscheduledSight, YourVietnamDay } from './types'
import { coordForItem, insertSightIntoTour } from './sightOrder'
import { hopHoursBetween } from './osrmRoute'
import {
  arrivalUsable,
  itemHours,
  intersectPeriods,
  leftoverAfter,
  PERIOD_CAP,
  sumSightHours,
  usablePeriods,
  type ArrivalSlot,
  type TransferSlot,
} from './dayCapacity'
import {
  bucketFromStart,
  clockRange,
  clocksForTour,
  roundToNearestMinutes,
  type ContinuationChip,
} from './clockTimes'
import { catalogHoursForItem, earliestOpenAt, mergeHours, weekdayFromIso, type PlaceHours, CLOSED_AT_THIS_TIME, sightClosedAtTime, visitDeadline } from './openingHours'
import { orderIdsForOpeningHours, packVisitHours } from './dayAllocation'
import { planningNoteFor } from './sightPlanning'
import { PERIOD_FLOW, PERIOD_WINDOW } from './dayWindows'
import { DEFAULT_PROFILE, type PlanningProfile } from './planningProfile'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import { placeCoords } from './cityPins'
import type { PlaceId } from '../../../GettingAround/data/types'
import { timePreferenceForItem, timePreferenceViolation } from './sightTiming'

function sightseeingFirst(tour: ItineraryItem[]): ItineraryItem[] {
  const evening: ItineraryItem[] = []
  const rest: ItineraryItem[] = []
  for (const it of tour) {
    if (it.sourceId && timePreferenceForItem(it) === 'EVENING') evening.push(it)
    else rest.push(it)
  }
  return [...rest, ...evening]
}

export function isSight(
  item: ItineraryItem,
): item is ItineraryItem & { kind: 'experience' | 'activity' | 'shopping' | 'meal' } {
  return (
    item.kind === 'experience' ||
    item.kind === 'activity' ||
    item.kind === 'shopping' ||
    (item.kind === 'meal' && Boolean(item.sourceId))
  )
}

function insertMealIntoTour(tour: ItineraryItem[], meal: ItineraryItem): ItineraryItem[] {
  const without = tour.filter((it) => it.sourceId !== meal.sourceId)
  if (/breakfast/i.test(meal.name)) return [meal, ...without]
  if (/dinner/i.test(meal.name)) return [...without, meal]
  const morningCount = without.filter((it) => it.period === 'morning').length
  const idx = Math.min(without.length, Math.max(morningCount, 1))
  return [...without.slice(0, idx), meal, ...without.slice(idx)]
}

function arrangeMealsInTour(tour: ItineraryItem[]): ItineraryItem[] {
  const breakfast: ItineraryItem[] = []
  const lunch: ItineraryItem[] = []
  const dinner: ItineraryItem[] = []
  const rest: ItineraryItem[] = []
  for (const it of tour) {
    if (it.kind === 'meal' && /breakfast/i.test(it.name)) breakfast.push(it)
    else if (it.kind === 'meal' && /lunch/i.test(it.name)) lunch.push(it)
    else if (it.kind === 'meal' && /dinner/i.test(it.name)) dinner.push(it)
    else rest.push(it)
  }
  if (!breakfast.length && !lunch.length && !dinner.length) return tour
  const morning = rest.filter((it) => it.period === 'morning')
  const afternoon = rest.filter((it) => it.period === 'afternoon')
  const later = rest.filter((it) => it.period === 'evening' || it.period === 'night')
  return [...breakfast, ...morning, ...lunch, ...afternoon, ...later, ...dinner]
}

/** Minimal itinerary row so leftover / Doesn't Fit sights can fill an empty window. */
export function sightItemFromUnscheduled(row: UnscheduledSight): ItineraryItem {
  return {
    id: `fill:${row.kind}:${row.sourceId}`,
    kind: row.kind,
    name: row.name,
    selectionState: 'selected',
    period: 'morning',
    timeLabel: '',
    city: row.city,
    region: row.city,
    costUsd: 0,
    icon: '✨',
    sourceId: row.sourceId,
    planningNote: planningNoteFor(row.sourceId),
  }
}

export function displayPeriodOf(
  item: ItineraryItem,
  overrides: Record<string, PeriodId>,
): PeriodId {
  if (item.sourceId && overrides[item.sourceId]) return overrides[item.sourceId]
  return item.period
}

export function regroupPeriods(
  periods: DayPeriod[],
  overrides: Record<string, PeriodId>,
): DayPeriod[] {
  const buckets: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  for (const period of periods) {
    for (const item of period.items) {
      buckets[displayPeriodOf(item, overrides)].push(item)
    }
  }
  return periods.map((period) => ({ ...period, items: buckets[period.id] }))
}

function itemBelongsToDay(
  item: ItineraryItem,
  day: YourVietnamDay,
  cityDays: YourVietnamDay[],
  dayOverrides: Record<string, number>,
  slotOverrides?: Record<string, string>,
) {
  if (!item.sourceId) return true
  const validSlots = new Set(cityDays.map((d) => d.slotId))
  const validDays = new Set(cityDays.map((d) => d.day))
  const slot = slotOverrides?.[item.sourceId]
  if (slot && validSlots.has(slot)) return slot === day.slotId
  const num = dayOverrides[item.sourceId]
  if (num != null && validDays.has(num)) return num === day.day
  return true
}

export function mergeCityDayPeriods(
  day: YourVietnamDay,
  cityDays: YourVietnamDay[],
  dayOverrides: Record<string, number>,
  slotOverrides?: Record<string, string>,
): DayPeriod[] {
  const kept = day.periods.map((period) => ({
    ...period,
    items: period.items.filter((it) =>
      itemBelongsToDay(it, day, cityDays, dayOverrides, slotOverrides),
    ),
  }))
  const incoming = cityDays
    .filter((d) => d.day !== day.day)
    .flatMap((d) => d.periods.flatMap((p) => p.items))
    .filter((it) => {
      if (!it.sourceId) return false
      const validSlots = new Set(cityDays.map((d) => d.slotId))
      const validDays = new Set(cityDays.map((d) => d.day))
      const slot = slotOverrides?.[it.sourceId]
      if (slot && validSlots.has(slot)) return slot === day.slotId
      const num = dayOverrides[it.sourceId]
      return num != null && validDays.has(num) && num === day.day
    })
  if (incoming.length === 0) return kept
  const extra: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  for (const it of incoming) {
    extra[it.period]?.push(it)
  }
  return kept.map((period) => ({ ...period, items: [...period.items, ...extra[period.id]] }))
}

/** Packed leftover days stay as packed — do not rehome sights onto sibling days. */
export function redistributeClosedHourSights(
  cityDays: YourVietnamDay[],
  _startDate: string,
  _placeId?: string | null,
): YourVietnamDay[] {
  return cityDays
}

export function hidePackedConnectors(items: ItineraryItem[]) {
  return items.filter((it) => it.kind !== 'local-transfer' && it.kind !== 'city-transfer')
}

export function pinSourceIdsFrom(
  periods: DayPeriod[],
  overrides: Record<string, PeriodId>,
  extra?: Set<string>,
) {
  const ids = extra ? new Set(extra) : new Set<string>()
  for (const period of periods) {
    for (const it of period.items) {
      if (isSight(it) && it.sourceId && overrides[it.sourceId]) ids.add(it.sourceId)
    }
  }
  return ids
}

export function applySightOrder(
  periods: DayPeriod[],
  slotId: string,
  orderMap: Record<string, string[]>,
): DayPeriod[] {
  return periods.map((period) => {
    const order = orderMap[`${slotId}:${period.id}`]
    if (!order?.length) return period
    const sights = period.items.filter(isSight)
    const rest = period.items.filter((it) => !isSight(it))
    const byId = new Map(sights.map((it) => [it.sourceId ?? it.id, it]))
    const ordered: ItineraryItem[] = []
    for (const id of order) {
      const it = byId.get(id)
      if (it) {
        ordered.push(it)
        byId.delete(id)
      }
    }
    for (const it of byId.values()) ordered.push(it)
    return { ...period, items: [...ordered, ...rest] }
  })
}

export function sightSourceIds(period: DayPeriod): string[] {
  return period.items.filter(isSight).map((it) => it.sourceId).filter((id): id is string => Boolean(id))
}

export function newDaySlotId() {
  return `slot:${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function derivedSlotsFromDays(days: YourVietnamDay[]) {
  return days.map((d) => ({
    id: d.slotId,
    placeId: d.placeId ?? d.city,
    blank: Boolean(d.blank),
  }))
}

export function occupancyFromLaidPeriods(
  periods: DayPeriod[],
  remaining?: Record<PeriodId, number>,
) {
  const ids: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']
  const byId = new Map(periods.map((p) => [p.id, p]))
  return Object.fromEntries(
    ids.map((id) => {
      const sights = (byId.get(id)?.items ?? []).filter(isSight)
      const leftover =
        remaining && remaining[id] != null
          ? remaining[id]
          : (PERIOD_CAP[id] ?? 0) - sumSightHours(sights)
      return [
        id,
        {
          ids: sights.map((s) => s.sourceId).filter((x): x is string => Boolean(x)),
          leftover,
        },
      ]
    }),
  ) as Record<PeriodId, { ids: string[]; leftover: number }>
}

export function layoutCompactDay(opts: {
  day: YourVietnamDay
  cityDays: YourVietnamDay[]
  slotOverrides: Record<string, PeriodId>
  dayOverrides: Record<string, number>
  daySlotOverrides: Record<string, string>
  sightOrder: Record<string, string[]>
  transferSlot: TransferSlot | null
  prevTransferSlot?: TransferSlot | null
  arrivalSlot: ArrivalSlot
  hoursBySourceId?: Record<string, PlaceHours>
  isoDate?: string
  startDate?: string
  /** Sights the traveller placed by hand — kept ahead of auto-packed ones when capping. */
  userPinnedIds?: Set<string>
  /** Pace, budget, group size and `userStartTime` rolled into one. */
  profile?: PlanningProfile
  /**
   * Doesn't Fit / leftover sights from this city. Used to fill empty morning,
   * afternoon or evening windows while the day is still under its hours budget.
   */
  fillPool?: ItineraryItem[]
}): {
  periods: DayPeriod[]
  remaining: Record<PeriodId, number>
  overflow: ItineraryItem[]
  spanNote: Record<string, string>
  clockById: Record<string, string>
  continuations: Partial<Record<PeriodId, ContinuationChip[]>>
  /** itemId -> why this slot fights the sight's time-of-day tag. */
  timeWarnings: Record<string, string>
} {
  const {
    day,
    cityDays,
    slotOverrides,
    dayOverrides,
    daySlotOverrides,
    sightOrder,
    transferSlot,
    prevTransferSlot,
    arrivalSlot,
    hoursBySourceId,
    isoDate,
    startDate,
    userPinnedIds,
    profile = DEFAULT_PROFILE,
    fillPool = [],
  } = opts
  const cityStart = startDate || isoDate || ''
  const mergedCity = cityDays.map((row) => ({
    ...row,
    periods: mergeCityDayPeriods(row, cityDays, dayOverrides, daySlotOverrides).map((period) => ({
      ...period,
      items: hidePackedConnectors(period.items),
    })),
  }))
  const rehomedCity = redistributeClosedHourSights(mergedCity, cityStart, day.placeId)
  const self = rehomedCity.find((row) => row.slotId === day.slotId) ?? mergedCity.find((row) => row.slotId === day.slotId)
  let periods = regroupPeriods(self?.periods ?? day.periods, slotOverrides)

  if (transferSlot) {
    const hide = new Set(leftoverAfter(transferSlot))
    periods = periods.map((period) =>
      hide.has(period.id)
        ? { ...period, items: period.items.filter((it) => !isSight(it)) }
        : period,
    )
  }
  if (prevTransferSlot) {
    const hide = new Set(leftoverAfter(prevTransferSlot))
    periods = periods.filter((period) => !hide.has(period.id))
  }

  const transferUsable = usablePeriods(transferSlot)
  const usable =
    day.day === 1 ? intersectPeriods(transferUsable, arrivalUsable(arrivalSlot)) : transferUsable
  const windows: PeriodId[] = usable.length ? usable : ['morning', 'afternoon', 'evening']
  const weekday = weekdayFromIso(isoDate ?? '')
  const PERIOD_IDS: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']
  const periodMeta = new Map(periods.map((p) => [p.id, p]))

  const rest: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  const placedSights: ItineraryItem[] = []
  for (const period of periods) {
    for (const item of period.items) {
      if (isSight(item)) {
        if (item.selectionState !== 'recommended') placedSights.push(item)
      } else {
        rest[period.id].push(item)
      }
    }
  }

  const hoursOf = (item: ItineraryItem) => {
    const catalog = catalogHoursForItem(item, weekday, isoDate)
    const venue =
      item.sourceId && hoursBySourceId?.[item.sourceId]
        ? mergeHours(hoursBySourceId[item.sourceId], catalog)
        : catalog
    return venue
  }
  const sourceIds = placedSights
    .map((s) => s.sourceId)
    .filter((id): id is string => Boolean(id))
  const durationOf = (it: ItineraryItem) => {
    if (it.kind === 'meal') return /breakfast/i.test(it.name) ? 1.5 : 1
    if (it.sourceId) return packVisitHours(it.sourceId, sourceIds, isoDate)
    return itemHours(it)
  }
  const clockById: Record<string, string> = {}
  const startHourById: Record<string, number> = {}
  const sightsByStart: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  let overflow: ItineraryItem[] = []
  const dayStart = profile.dayStart
  const startCoord =
    (day.hotelId ? PIN_BY_SOURCE_ID[day.hotelId] : null) ??
    (day.placeId ? placeCoords(day.placeId as PlaceId) : null)

  function layByOpeningHours(tour: ItineraryItem[]) {
    const laid = clocksForTour(
      tour,
      durationOf,
      hoursOf,
      dayStart,
      profile.dayEnd,
      {
        respectPreference: true,
        respectMeals: false,
        pinnedSourceIds: userPinnedIds,
        startCoord,
      },
    )
    Object.assign(clockById, laid.clockById)
    Object.assign(startHourById, laid.startHourById)
    const timed = tour
      .filter((item) => laid.startHourById[item.id] != null)
      .sort((a, b) => (laid.startHourById[a.id] ?? 0) - (laid.startHourById[b.id] ?? 0))
    for (const item of timed) {
      sightsByStart[bucketFromStart(laid.startHourById[item.id])].push(item)
    }
    for (const item of tour) {
      if (laid.startHourById[item.id] != null) continue
      overflow.push(item)
    }
  }

  function tourFromOpeningHours() {
    const byId = new Map(
      placedSights.filter((it): it is ItineraryItem & { sourceId: string } => Boolean(it.sourceId)).map((it) => [it.sourceId, it]),
    )
    const openingOrder = orderIdsForOpeningHours(
      [...byId.keys()],
      day.placeId,
      isoDate,
    )
    const orderedSights = [
      ...openingOrder.map((id) => byId.get(id)).filter((it): it is ItineraryItem & { sourceId: string } => Boolean(it)),
      ...placedSights.filter((it) => !it.sourceId),
    ]
    return arrangeMealsInTour(sightseeingFirst(orderedSights))
  }

  function tourFromSaved() {
    const byId = new Map(withId.map((it) => [it.sourceId, it]))
    let next: ItineraryItem[] = []
    for (const id of savedTour) {
      const it = byId.get(id)
      if (!it) continue
      next.push(it)
      byId.delete(id)
    }
    for (const leftover of byId.values()) {
      next = leftover.kind === 'meal' ? insertMealIntoTour(next, leftover) : insertSightIntoTour(next, leftover)
    }
    return [...next, ...noId]
  }

  const savedTour = sightOrder[`${day.slotId}:tour`]
  const withId = placedSights.filter((it): it is ItineraryItem & { sourceId: string } =>
    Boolean(it.sourceId),
  )
  const noId = placedSights.filter((it) => !it.sourceId)
  let tour = savedTour?.length ? tourFromSaved() : tourFromOpeningHours()
  layByOpeningHours(tour)
  if (overflow.length > 0 && savedTour?.length) {
    overflow = []
    Object.keys(clockById).forEach((key) => delete clockById[key])
    Object.keys(startHourById).forEach((key) => delete startHourById[key])
    for (const id of PERIOD_IDS) sightsByStart[id] = []
    tour = tourFromOpeningHours()
    layByOpeningHours(tour)
  }
  const hoursOverflow = overflow
  if (!savedTour?.length) {
    const onDay = new Set(
      [...tour, ...hoursOverflow].map((it) => it.sourceId ?? it.id).filter(Boolean),
    )
    overflow = fillPool.filter((extra) => {
      const key = extra.sourceId ?? extra.id
      return Boolean(key) && !onDay.has(key)
    })
    overflow = [...hoursOverflow, ...overflow]
    overflow = placeOverflowInEmptyWindows({
      overflow,
      sightsByStart,
      clockById,
      startHourById,
      windows,
      hoursOf,
      durationOf,
      dayStart,
      dayEnd: profile.dayEnd,
      maxHours: 24,
      minHours: 0,
    })
  }
  const shown = new Set(
    PERIOD_IDS.flatMap((id) => sightsByStart[id].map((it) => it.sourceId ?? it.id)),
  )
  overflow = overflow.filter((item) => {
    const key = item.sourceId ?? item.id
    return Boolean(key) && !shown.has(key)
  })

  const bucketed = PERIOD_IDS.map((id) => {
    const existing = periodMeta.get(id)
    return {
      id,
      label: existing?.label ?? id[0].toUpperCase() + id.slice(1),
      windowLabel: existing?.windowLabel ?? '',
      items: [...rest[id], ...sightsByStart[id]],
    }
  })

  const scheduled = PERIOD_IDS.flatMap((id) => sightsByStart[id])

  // Leftover is the shared day budget, not a per-period allowance, so the
  // "add a sight" drawer offers every window that still has time in it.
  const usedHours = sumSightHours(scheduled)
  const dayLeft = Math.max(0, profile.dayMaxHours - usedHours)
  const remaining: Record<PeriodId, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  }
  for (const id of windows) {
    if (id === 'night') continue
    // How much of the day budget is still usable before this window closes.
    const clockLeft = Math.max(0, PERIOD_WINDOW[id].end - Math.max(dayStart, PERIOD_WINDOW[id].start))
    remaining[id] = Math.min(dayLeft, clockLeft)
  }

  // A hand-placed sight is never moved back, but we say when it is off its
  // natural time so the traveller can decide.
  const timeWarnings: Record<string, string> = {}
  for (const item of scheduled) {
    const start = startHourById[item.id]
    if (start == null) continue
    const hours = hoursOf(item)
    if (sightClosedAtTime(hours, start)) {
      timeWarnings[item.id] = CLOSED_AT_THIS_TIME
      continue
    }
    const note = timePreferenceViolation(
      timePreferenceForItem(item),
      start,
      start + itemHours(item),
      item.sourceId,
    )
    if (note) timeWarnings[item.id] = note
  }

  return {
    periods: bucketed,
    remaining,
    overflow,
    spanNote: {},
    clockById,
    continuations: {},
    timeWarnings,
  }
}

/**
 * Pull leftover / Doesn't Fit stops onto this day by cascading from the last
 * placed end + transit. A stop only stays leftover when its duration strictly
 * exceeds remaining time before closing.
 */
function placeOverflowInEmptyWindows(opts: {
  overflow: ItineraryItem[]
  sightsByStart: Record<PeriodId, ItineraryItem[]>
  clockById: Record<string, string>
  startHourById: Record<string, number>
  windows: PeriodId[]
  hoursOf: (item: ItineraryItem) => PlaceHours
  durationOf: (item: ItineraryItem) => number
  dayStart: number
  dayEnd: number
  maxHours: number
  minHours: number
}): ItineraryItem[] {
  const leftover: ItineraryItem[] = []
  const placed = (): ItineraryItem[] => PERIOD_FLOW.flatMap((id) => opts.sightsByStart[id] ?? [])
  let used = sumSightHours(placed())

  const lastPlaced = (): ItineraryItem | null => {
    const all = placed().filter((it) => opts.startHourById[it.id] != null)
    if (all.length === 0) return null
    return [...all].sort((a, b) => (opts.startHourById[b.id] ?? 0) - (opts.startHourById[a.id] ?? 0))[0]
  }

  const tryPlace = (item: ItineraryItem): boolean => {
    const hoursLen = Math.max(0.5, opts.durationOf(item))
    if (used + hoursLen > opts.maxHours + 0.05) return false
    const last = lastPlaced()
    const lastEnd =
      last && opts.startHourById[last.id] != null
        ? opts.startHourById[last.id] + Math.max(0.5, opts.durationOf(last))
        : opts.dayStart
    const after = last
      ? lastEnd + hopHoursBetween(coordForItem(last), coordForItem(item))
      : opts.dayStart
    const placeHours = opts.hoursOf(item)
    const until = visitDeadline(placeHours, opts.dayEnd)
    const start = roundToNearestMinutes(
      earliestOpenAt(placeHours, Math.max(opts.dayStart, after), hoursLen, until),
    )
    if (!Number.isFinite(start)) return false
    const end = roundToNearestMinutes(start + hoursLen)
    if (end > until + 0.01) return false
    const bucket = bucketFromStart(start)
    opts.clockById[item.id] = clockRange(start, end)
    opts.startHourById[item.id] = start
    opts.sightsByStart[bucket].push(item)
    opts.sightsByStart[bucket].sort(
      (a, b) => (opts.startHourById[a.id] ?? 0) - (opts.startHourById[b.id] ?? 0),
    )
    used += hoursLen
    return true
  }

  for (const item of opts.overflow) {
    if (tryPlace(item)) continue
    leftover.push(item)
  }

  return leftover
}
