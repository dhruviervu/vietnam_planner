import type { DayPeriod, ItineraryItem, PeriodId } from './types'
import { DAY_CLOSE, DAY_OPEN, PERIOD_WINDOW } from './dayWindows'
import { coordForItem, type PinCoord } from './sightOrder'
import { hopHoursBetween } from './osrmRoute'
import { earliestOpenAt, type PlaceHours, sightClosedAtTime, visitDeadline } from './openingHours'
import { allowedWindowFor, canFlexToAfternoon, timePreferenceForItem } from './sightTiming'
import { MEAL_BREAKS } from './planningProfile'
import { isTimedLanding, parentTourId } from './sightPlanning'
import { landingStartHour } from './sightIntelligence'
import { snapVisitHours } from './visitHours'

const ROUND_MINUTES = 5
/** How long the day may idle waiting for a stop to open before it is deferred. */
const MAX_WAIT_HOURS = 5
const SEQUENCE: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']

function isSight(it: ItineraryItem) {
  return it.kind === 'experience' || it.kind === 'activity' || it.kind === 'shopping'
}

/** Sit-down and food stops are where a large group loses the most time. */
function isMealStop(it: ItineraryItem): boolean {
  return /food|lunch|dinner|brunch|breakfast|restaurant|eatery|market crawl|cooking class/i.test(
    it.name ?? '',
  )
}

/** Round a clock time to the nearest 5 minutes. */
export function roundToNearestMinutes(hours: number, step = ROUND_MINUTES): number {
  const mins = hours * 60
  return Math.round(mins / step) * step / 60
}

export function formatClock(hours: number): string {
  let totalMins = Math.round((((hours % 24) + 24) % 24) * 60)
  if (totalMins >= 24 * 60) totalMins = 0
  const h = Math.floor(totalMins / 60) % 24
  const m = totalMins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function clockRangeLabel(startHour: number, durationHours: number): string {
  const start = roundToNearestMinutes(startHour)
  const end = roundToNearestMinutes(start + Math.max(0.5, durationHours))
  return `${formatClock(start)}–${formatClock(end)}`
}

export function clockRange(startHour: number, endHour: number): string {
  return `${formatClock(startHour)}–${formatClock(endHour)}`
}

export type ContinuationChip = {
  id: string
  name: string
  range: string
}

/** Bucket is decided only by when the activity starts. */
export function bucketFromStart(startHour: number): PeriodId {
  const t = ((startHour % 24) + 24) % 24
  if (t >= PERIOD_WINDOW.night.start) return 'night'
  if (t < PERIOD_WINDOW.afternoon.start) return 'morning'
  if (t < PERIOD_WINDOW.evening.start) return 'afternoon'
  return 'evening'
}

/**
 * Walk the ordered tour assigning start/end clocks sequentially:
 * `start = previous end + transit`. Opening hours are a sliding window, not a
 * fixed start. Anything whose duration strictly exceeds remaining time before
 * closing (or `dayEnd` when hours are unknown) comes back as `unscheduledIds`.
 */
export function clocksForTour(
  ordered: ItineraryItem[],
  durationOf: (item: ItineraryItem) => number,
  hoursOf: (item: ItineraryItem) => PlaceHours,
  dayStart = DAY_OPEN,
  dayEnd = DAY_CLOSE,
  pacing: {
    /** Scales door-to-door travel: >1 walking/transit, <1 taxi/private. */
    transitMultiplier?: number
    /** Group hand-over time added between consecutive stops. */
    groupBuffer?: number
    /** Used instead of `groupBuffer` after a sit-down or food stop. */
    mealBuffer?: number
    /**
     * Honour each sight's `timePreference` (evening sights after 17:30,
     * daylight sights before 17:00). Off only for legacy period-local clocking.
     */
    respectPreference?: boolean
    /** Skip breakfast/lunch/dinner windows. Off for the compact day board, which has its own breaks. */
    respectMeals?: boolean
    /**
     * Source ids the traveller placed by hand. Their slot is honoured as dropped
     * even when it fights `timePreference` — the board warns instead of moving it.
     */
    pinnedSourceIds?: Set<string>
    /** Breakfast / hotel pin — first sight includes travel from here. */
    startCoord?: PinCoord | null
    /** Clock when breakfast ends; first sight cannot start before this plus travel. */
    resumeAt?: number
  } = {},
): {
  clockById: Record<string, string>
  startHourById: Record<string, number>
  unscheduledIds: string[]
  continuations: Partial<Record<PeriodId, ContinuationChip[]>>
} {
  const clockById: Record<string, string> = {}
  const startHourById: Record<string, number> = {}
  const startHourBySource: Record<string, number> = {}
  const unscheduledIds: string[] = []
  const transitMultiplier = pacing.transitMultiplier ?? 1
  const groupBuffer = Math.max(0, pacing.groupBuffer ?? 0)
  const mealBuffer = Math.max(groupBuffer, pacing.mealBuffer ?? 0)
  const respectPreference = pacing.respectPreference ?? true
  const respectMeals = pacing.respectMeals ?? true
  const pinnedSourceIds = pacing.pinnedSourceIds
  const flexAsAny = new Set<string>()
  let cursor: number | null = pacing.resumeAt != null ? pacing.resumeAt : null
  let prev = (pacing.startCoord ?? null) as ReturnType<typeof coordForItem>
  let pendingBuffer = pacing.startCoord && pacing.resumeAt != null ? 5 / 60 : 0

  /**
   * Opening hours slide. Evening-tagged stops still wait until dusk so they
   * do not land in the morning walk; morning/afternoon tags are not fixed starts.
   */
  const windowFor = (item: ItineraryItem) => {
    const pinned = item.sourceId ? pinnedSourceIds?.has(item.sourceId) : false
    const raw = respectPreference && !pinned ? timePreferenceForItem(item) : 'ANY'
    const pref = raw === 'EVENING' ? 'EVENING' : 'ANY'
    if (item.sourceId && flexAsAny.has(item.sourceId)) {
      return { pref: 'ANY' as const, ...allowedWindowFor('ANY', dayStart, dayEnd) }
    }
    return { pref, ...allowedWindowFor(pref, dayStart, dayEnd) }
  }

  /**
   * Check whether a proposed start/end window overlaps a meal break.
   * If it does, push the start past the meal so sights don't run through meals.
   */
  const selectedIds = ordered
    .map((it) => it.sourceId)
    .filter((id): id is string => Boolean(id))

  const skipOverMeals = (proposedStart: number, dur: number): number => {
    let s = proposedStart
    for (const [key, meal] of Object.entries(MEAL_BREAKS)) {
      const mealEnd = meal.start + meal.duration
      if (s >= meal.start && s < mealEnd) {
        s = roundToNearestMinutes(mealEnd)
      } else if (
        (key === 'breakfast' || key === 'lunch') &&
        dur <= 3.5 &&
        s < meal.start &&
        s + dur > meal.start + 0.05
      ) {
        s = roundToNearestMinutes(mealEnd)
      }
    }
    return s
  }

  const placeIncluded = (item: ItineraryItem): boolean => {
    if (!item.sourceId || !isTimedLanding(item.sourceId, selectedIds)) return false
    const parentId = parentTourId(item.sourceId)
    const parentStart = parentId ? startHourBySource[parentId] : undefined
    if (parentStart == null) return false
    const dur = Math.max(snapVisitHours(20 / 60), durationOf(item))
    const start = landingStartHour(item.sourceId, parentStart)
    const end = roundToNearestMinutes(start + dur)
    if (end > dayEnd + 0.01) return false
    clockById[item.id] = clockRange(start, end)
    startHourById[item.id] = start
    startHourBySource[item.sourceId] = start
    return true
  }

  const place = (item: ItineraryItem, allowWait: boolean): boolean => {
    if (item.sourceId && isTimedLanding(item.sourceId, selectedIds)) {
      return placeIncluded(item)
    }
    const dur = Math.max(5 / 60, durationOf(item))
    const hours = hoursOf(item)
    const pinned = item.sourceId ? pinnedSourceIds?.has(item.sourceId) : false
    const { earliest, latest } = windowFor(item)
    const travel = hopHoursBetween(prev, coordForItem(item), transitMultiplier)
    const travelAfter = cursor == null ? dayStart : cursor + travel + pendingBuffer
    const after = Math.max(earliest, travelAfter)
    const until = Math.max(latest, visitDeadline(hours, dayEnd))
    let start = earliestOpenAt(hours, after, dur, until)
    if (!Number.isFinite(start) || hours.closedToday) {
      return false
    }
    if (!(start < 8 && start < after)) {
      start = roundToNearestMinutes(Math.max(start, after))
    } else {
      start = roundToNearestMinutes(start)
    }
    if (respectMeals && !pinned) start = skipOverMeals(start, dur)
    if (!Number.isFinite(start)) return false
    // Wait is time idle after arriving, not evening-tag earliest.
    if (!allowWait && !pinned && start > travelAfter + MAX_WAIT_HOURS) return false
    start = earliestOpenAt(hours, start, dur, until)
    if (!Number.isFinite(start)) return false
    const end = roundToNearestMinutes(start + dur)
    if (end <= start) return false
    if (sightClosedAtTime(hours, start)) return false
    if (!pinned && end > until + 0.01) return false
    if (start < dayStart - 0.01 && start < 5) return false

    clockById[item.id] = clockRange(start, end)
    startHourById[item.id] = start
    if (item.sourceId) startHourBySource[item.sourceId] = start
    cursor = end
    prev = coordForItem(item) ?? prev
    pendingBuffer = isMealStop(item) ? mealBuffer : groupBuffer
    return true
  }

  // Follow the packed / greedy tour. Skip a stop that is shut for more than an
  // hour so a 15:00 park does not strand a morning museum behind it.
  const leftover: ItineraryItem[] = []
  for (const item of ordered) {
    if (!place(item, false)) leftover.push(item)
  }
  const still: ItineraryItem[] = []
  for (const item of leftover) {
    if (item.sourceId && canFlexToAfternoon(item.sourceId)) {
      flexAsAny.add(item.sourceId)
    }
    if (place(item, true)) continue
    still.push(item)
  }
  for (const item of still) {
    unscheduledIds.push(item.id)
  }

  return { clockById, startHourById, unscheduledIds, continuations: {} }
}

export function clocksForLaidDay(
  periods: DayPeriod[],
  durationOf: (item: ItineraryItem) => number,
  hoursOf: (item: ItineraryItem) => PlaceHours,
): {
  clockById: Record<string, string>
  startHourById: Record<string, number>
  unscheduledIds: string[]
  continuations: Partial<Record<PeriodId, ContinuationChip[]>>
} {
  const byId = new Map(periods.map((p) => [p.id, p]))
  const ordered = SEQUENCE.flatMap((id) => (byId.get(id)?.items ?? []).filter(isSight))
  const firstPeriod = SEQUENCE.find((id) => (byId.get(id)?.items ?? []).some(isSight))
  const dayStart = Math.max(
    DAY_OPEN,
    firstPeriod ? PERIOD_WINDOW[firstPeriod].start : PERIOD_WINDOW.morning.start,
  )
  return clocksForTour(ordered, durationOf, hoursOf, dayStart)
}

/** Fallback stack inside one period window. */
export function clockRangesForSights(
  sights: ItineraryItem[],
  period: PeriodId,
  durationOf: (item: ItineraryItem) => number,
): Map<string, string> {
  const win = PERIOD_WINDOW[period]
  let cursor = roundToNearestMinutes(win.start)
  const out = new Map<string, string>()
  for (const it of sights) {
    const hrs = Math.max(0.5, durationOf(it))
    const start = cursor
    let end = roundToNearestMinutes(start + hrs)
    if (end <= start) end = roundToNearestMinutes(start + ROUND_MINUTES / 60)
    out.set(it.id, clockRange(start, end))
    cursor = roundToNearestMinutes(end + 10 / 60)
  }
  return out
}
