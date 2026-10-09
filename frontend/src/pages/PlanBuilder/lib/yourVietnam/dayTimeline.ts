import { packVisitHours } from './dayAllocation'
import { snapVisitHours } from './visitHours'
import { includesOnboardMeal, itemHours } from './dayCapacity'
import { MEAL_WINDOW, mealKindOf } from './itemKind'
import { DAY_CLOSE, EVENING_EARLIEST_START, parseDayEndHour, parseDayStart } from './dayWindows'
import { formatClock } from './clockTimes'
import { coordForItem, type PinCoord } from './sightOrder'
import { hopHoursBetween, routeCacheKey, type OsrmLeg } from './osrmRoute'
import type { ItineraryBreak, ItineraryItem } from './types'
import { clampVisitEnd, earliestOpenAt, sightClosedAtTime, type PlaceHours } from './openingHours'
import { timePreferenceForItem } from './sightTiming'
import { includedStopClock, isTimedLanding, parentTourId } from './sightPlanning'
import { landingStartHour } from './sightIntelligence'

export type TimelineSightBlock = {
  type: 'sight'
  item: ItineraryItem
  startHour: number
  endHour: number
  durationHours: number
  /** The visit length the stop deserves; more than `durationHours` when the day squeezed it. */
  plannedHours?: number
  range: string
  closedToday?: boolean
  closedAtTime?: boolean
  untimed?: boolean
}

/** The day only fits the stop by cutting its visit far below what it deserves. */
export function isSqueezed(b: TimelineSightBlock): boolean {
  const planned = b.plannedHours ?? 0
  const got = b.endHour - b.startHour
  return planned - got > 0.75 && got < planned * 0.6
}

export type TimelineBreakBlock = {
  type: 'break'
  row: ItineraryBreak
  startHour: number
  endHour: number
  range: string
}

export type TimelineTransitBlock = {
  type: 'transit'
  fromSourceId: string
  toSourceId: string
  pairKey: string
  from: PinCoord | null
  to: PinCoord | null
  startHour: number
  endHour: number
}

export type TimelineBlock = TimelineSightBlock | TimelineBreakBlock | TimelineTransitBlock

export type RoutePair = {
  key: string
  from: PinCoord
  to: PinCoord
}

export function formatDurationLabel(hours: number): string {
  const mins = Math.round(snapVisitHours(hours) * 60)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h <= 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function durationOf(
  item: ItineraryItem,
  durationOverrides: Record<string, number>,
  selectedIds: string[],
  isoDate = '',
): number {
  if (item.sourceId && durationOverrides[item.sourceId] != null) {
    return Math.max(5 / 60, durationOverrides[item.sourceId])
  }
  const meal = mealKindOf(item)
  if (meal) return MEAL_WINDOW[meal].hours
  if (item.tags?.includes('Expedition')) return Math.max(5 / 60, itemHours(item))
  if (item.sourceId) return Math.max(5 / 60, packVisitHours(item.sourceId, selectedIds, isoDate))
  return Math.max(5 / 60, itemHours(item))
}

function rangeLabel(startHour: number, endHour: number): string {
  return `${formatClock(startHour)}–${formatClock(endHour)}`
}

function parseClockHour(label: string | undefined): number | null {
  if (!label) return null
  const parts = /^(\d{1,2}):(\d{2})$/.exec(label.trim())
  if (!parts) return null
  return Number(parts[1]) + Number(parts[2]) / 60
}

function shiftBlocks(blocks: TimelineBlock[], delta: number): TimelineBlock[] {
  if (delta <= 0) return blocks
  return blocks.map((block) => {
    const startHour = block.startHour - delta
    const endHour = block.endHour - delta
    if (block.type === 'sight' || block.type === 'break') {
      return { ...block, startHour, endHour, range: rangeLabel(startHour, endHour) }
    }
    return { ...block, startHour, endHour }
  })
}

/** Pull the day earlier so the last sight ends by `lastSightEndBy`, without starting before `minFirstStart`. */
export function applyLastSightEndCap(
  blocks: TimelineBlock[],
  lastSightEndBy: number,
  minFirstStart: number,
): { blocks: TimelineBlock[]; overrun: boolean } {
  const last = blocks.findLast((b) => b.type === 'sight')
  if (!last || last.type !== 'sight') return { blocks, overrun: false }
  if (last.endHour <= lastSightEndBy + 0.001) return { blocks, overrun: false }

  const first = blocks.find((b) => b.type === 'sight')
  if (!first || first.type !== 'sight') return { blocks, overrun: true }
  const actualShift = Math.min(last.endHour - lastSightEndBy, Math.max(0, first.startHour - minFirstStart))
  const shifted = actualShift > 0 ? shiftBlocks(blocks, actualShift) : blocks
  const finalLast = shifted.findLast((b) => b.type === 'sight')
  const overrun = Boolean(
    finalLast?.type === 'sight' && finalLast.endHour > lastSightEndBy + 0.001,
  )
  return { blocks: shifted, overrun }
}

/**
 * Sequential compact day: each block starts when the previous one ends.
 * Empty period padding is never inserted.
 */
export function buildCompactTimeline(opts: {
  sights: ItineraryItem[]
  breaks: ItineraryBreak[]
  dayStart: string
  /** When set, the last sight of the day must end by this clock ("HH:MM"). */
  lastSightEndBy?: string | null
  durationOverrides: Record<string, number>
  startOverrides: Record<string, string>
  legs: Record<string, OsrmLeg>
  hoursOf?: (item: ItineraryItem) => PlaceHours
  isoDate?: string
  /** Reserve an hour for lunch around midday when nothing on the day already feeds you. */
  autoLunch?: boolean
}): { blocks: TimelineBlock[]; pairs: RoutePair[]; lastSightOverrun?: boolean; unplaced: ItineraryItem[] } {
  const {
    sights,
    breaks,
    dayStart,
    lastSightEndBy,
    durationOverrides,
    startOverrides,
    legs,
    hoursOf: rawHoursOf,
    isoDate = '',
    autoLunch = false,
  } = opts
  const lastSightEndHour = parseDayEndHour(lastSightEndBy)
  const selectedIds = sights
    .map((it) => it.sourceId)
    .filter((id): id is string => Boolean(id))
  // Every lunch position re-places every stop; a stop's hours and length do not change between tries.
  const hoursCache = new Map<ItineraryItem, PlaceHours | undefined>()
  const hoursOf = rawHoursOf
    ? (item: ItineraryItem) => {
        if (!hoursCache.has(item)) hoursCache.set(item, rawHoursOf(item))
        return hoursCache.get(item)
      }
    : undefined
  const durationCache = new Map<ItineraryItem, number>()
  const dur = (item: ItineraryItem) => {
    let hours = durationCache.get(item)
    if (hours === undefined) {
      hours = durationOf(item, durationOverrides, selectedIds, isoDate)
      durationCache.set(item, hours)
    }
    return hours
  }
  const orderedSights = (() => {
    const out: ItineraryItem[] = []
    const seen = new Set<string>()
    for (const it of sights) {
      if (seen.has(it.id)) continue
      out.push(it)
      seen.add(it.id)
    }
    return out
  })()
  const byAfter = new Map<string | null, ItineraryBreak[]>()
  for (const row of breaks) {
    const key = row.afterSourceId
    const list = byAfter.get(key) ?? []
    list.push(row)
    byAfter.set(key, list)
  }

  const pairs: RoutePair[] = []
  const sequential = orderedSights.filter(
    (it) => !(it.sourceId && isTimedLanding(it.sourceId, selectedIds)),
  )
  for (let i = 0; i < sequential.length; i++) {
    for (let j = 0; j < sequential.length; j++) {
      if (i === j) continue
      const fromId = sequential[i].sourceId
      const toId = sequential[j].sourceId
      if (!fromId || !toId) continue
      const from = coordForItem(sequential[i])
      const to = coordForItem(sequential[j])
      if (!from || !to) continue
      const key = routeCacheKey(from, to)
      if (pairs.some((row) => row.key === key)) continue
      pairs.push({ key, from, to })
    }
  }

  const blocks: TimelineBlock[] = []
  const unplaced: ItineraryItem[] = []
  let t = parseDayStart(dayStart)

  function transitHours(from: ItineraryItem, to: ItineraryItem): number {
    const a = coordForItem(from)
    const b = coordForItem(to)
    const pairKey = a && b ? routeCacheKey(a, b) : `${from.sourceId}->${to.sourceId}`
    const cached = legs[pairKey]?.mins
    if (cached != null) return Math.max(1, cached) / 60
    return hopHoursBetween(a, b)
  }

  function pushBreaks(afterSourceId: string | null) {
    for (const row of byAfter.get(afterSourceId) ?? []) {
      const hours = Math.max(5 / 60, row.durationMinutes / 60)
      const startHour = t
      const endHour = t + hours
      blocks.push({
        type: 'break',
        row,
        startHour,
        endHour,
        range: rangeLabel(startHour, endHour),
      })
      t = endHour
    }
  }

  pushBreaks(null)

  const MAX_WAIT_HOURS = 5
  const MIN_VISIT = 15 / 60
  const LATE_AFTERNOON_START = 17
  const EVENING_SHUTS_EARLY_FLOOR = 15
  const EARLIEST_START = 3
  /** Past this much spare opening time a stop is not "tight" and keeps its authored order. */
  const ROOMY_SLACK_HOURS = 4
  const dayCap = DAY_CLOSE
  const LATE_NIGHT_CLOSE = 26
  const packStart = t
  const originalIndex = new Map(orderedSights.map((it, i) => [it.id, i]))

  function openSpanHours(item: ItineraryItem): number {
    const hours = hoursOf?.(item)
    if (!hours || hours.closedToday) return 0
    if (hours.alwaysOpen || hours.unknown || !hours.intervals?.length) return 24
    let span = 0
    for (const iv of hours.intervals) {
      const open = Math.max(iv.open, packStart)
      const close = Math.min(iv.close, dayCap)
      span += Math.max(0, close - open)
    }
    return span
  }

  function visitWindow(
    item: ItineraryItem,
    after: number,
    until: number,
    allowWait: boolean,
    ignoreEvening: boolean,
    allowShorten: boolean,
    travelAfter: number,
    anyTime = false,
  ): { startHour: number; endHour: number } | null {
    const sourceId = item.sourceId
    let durationHours = dur(item)
    const hours = hoursOf?.(item)
    if (hours?.closedToday) return null
    const meal = mealKindOf(item)
    const pinnedStart = Boolean(sourceId && startOverrides[sourceId])
    const eveningPref = !meal && !anyTime && timePreferenceForItem(item) === 'EVENING'
    let startAfter = after
    // Even when evening is full, a night market or sunset stop never drops into the morning.
    if (eveningPref) {
      let floor = ignoreEvening ? LATE_AFTERNOON_START : EVENING_EARLIEST_START
      // A sunset stop that shuts at 18:00 starts early enough to get its full visit.
      if (hours?.intervals?.length && !hours.closedToday && !pickupWindow(hours)) {
        const lastClose = Math.max(...hours.intervals.map((iv) => iv.close))
        floor = Math.min(floor, Math.max(EVENING_SHUTS_EARLY_FLOOR, lastClose - durationHours))
      }
      startAfter = Math.max(startAfter, floor)
    }
    if (meal && !pinnedStart) startAfter = Math.max(startAfter, MEAL_WINDOW[meal].from)
    if (sourceId && startOverrides[sourceId]) {
      startAfter = Math.max(startAfter, parseDayStart(startOverrides[sourceId]))
    }
    if (!allowWait && startAfter > travelAfter + MAX_WAIT_HOURS) return null
    const tryDwell = (need: number): { startHour: number; endHour: number } | null => {
      let startHour = startAfter
      let endHour = startAfter + need
      if (meal && !pinnedStart && startHour > MEAL_WINDOW[meal].latestStart + 0.01) return null
      if (hours && pickupWindow(hours)) {
        const iv = hours.intervals!.find((w) => startAfter < w.close)
        if (!iv) return null
        startHour = Math.max(startAfter, iv.open)
        if (!allowWait && startHour > startAfter + MAX_WAIT_HOURS) return null
        endHour = startHour + need
      } else if (hours) {
        const openNeed = allowShorten ? MIN_VISIT : need
        const openAt = earliestOpenAt(hours, startAfter, openNeed, until)
        if (!Number.isFinite(openAt)) return null
        startHour = Math.max(startAfter, openAt)
        if (meal && !pinnedStart && startHour > MEAL_WINDOW[meal].latestStart + 0.01) return null
        if (!allowWait && startHour > startAfter + MAX_WAIT_HOURS) return null
        if (sightClosedAtTime(hours, startHour)) return null
        endHour = startHour + need
        const closedAt = clampVisitEnd(hours, startHour, endHour)
        if (closedAt + 0.08 < endHour) {
          if (!allowShorten) return null
          endHour = closedAt
        } else {
          endHour = closedAt
        }
      }
      if (endHour > until + 0.08) {
        if (!allowShorten) return null
        endHour = until
      }
      if (endHour <= startHour + MIN_VISIT - 0.01) return null
      if (startHour >= until - MIN_VISIT) return null
      return { startHour, endHour }
    }
    return tryDwell(durationHours)
  }

  /** "Pickup ~04:30–05:30", "Boarding ~16:30": when the outing leaves, not when the place shuts. */
  function pickupWindow(hours: PlaceHours): boolean {
    return (
      Boolean(hours.intervals?.length) &&
      !hours.closedToday &&
      /pick-?up|boarding|meet|launch|depart|~\s*\d/i.test(hours.label)
    )
  }

  function occupied(): (TimelineSightBlock | TimelineBreakBlock)[] {
    return blocks
      .filter((b): b is TimelineSightBlock | TimelineBreakBlock => b.type === 'sight' || b.type === 'break')
      .sort((a, b) => a.startHour - b.startHour)
  }

  /**
   * A stop that is only open before the day would normally start (floating
   * markets, sunrise viewpoints) gets an early start rather than never fitting.
   */
  function earlyOnlyStart(item: ItineraryItem): number | null {
    const hours = hoursOf?.(item)
    if (!hours || hours.closedToday || hours.alwaysOpen || hours.unknown || !hours.intervals?.length) {
      return null
    }
    const open = Math.min(...hours.intervals.map((iv) => iv.open))
    const close = Math.max(...hours.intervals.map((iv) => iv.close))
    if (open >= packStart || close > packStart + 1) return null
    return Math.max(EARLIEST_START, open)
  }

  /** A 2 a.m. flower market only happens after the normal day has closed. */
  function closeFor(item: ItineraryItem): number {
    const hours = hoursOf?.(item)
    const nightOnly =
      Boolean(hours?.intervals?.length) && !hours?.closedToday && hours!.intervals!.every((iv) => iv.open >= 21)
    return nightOnly ? LATE_NIGHT_CLOSE : dayCap
  }

  function gapSlot(
    item: ItineraryItem,
    ignoreEvening = false,
    anyTime = false,
  ): { startHour: number; endHour: number } | null {
    const close = closeFor(item)
    const placed = occupied()
    const sightAt = (i: number) => (placed[i]?.type === 'sight' ? placed[i].item : null)
    const windows: {
      from: number
      to: number
      afterItem: ItineraryItem | null
      beforeItem: ItineraryItem | null
    }[] = [
      {
        from: earlyOnlyStart(item) ?? packStart,
        to: placed[0]?.startHour ?? close,
        afterItem: null,
        beforeItem: sightAt(0),
      },
    ]
    // A break (lunch) sits near the stop before it, so travel is counted from that stop.
    let lastStop: ItineraryItem | null = null
    for (let i = 0; i < placed.length; i++) {
      lastStop = sightAt(i) ?? lastStop
      windows.push({
        from: placed[i].endHour,
        to: placed[i + 1]?.startHour ?? close,
        afterItem: lastStop,
        beforeItem: sightAt(i + 1),
      })
    }
    for (const win of windows) {
      let after = win.from
      if (win.afterItem) after += transitHours(win.afterItem, item)
      let until = win.to
      if (win.beforeItem) until -= transitHours(item, win.beforeItem)
      const full = visitWindow(item, after, until, true, ignoreEvening, false, after, anyTime)
      if (full) return full
    }
    let best: { startHour: number; endHour: number } | null = null
    let bestSpan = 0
    for (const win of windows) {
      let after = win.from
      if (win.afterItem) after += transitHours(win.afterItem, item)
      let until = win.to
      if (win.beforeItem) until -= transitHours(item, win.beforeItem)
      const shortened = visitWindow(item, after, until, true, ignoreEvening, true, after, anyTime)
      if (!shortened) continue
      const span = shortened.endHour - shortened.startHour
      if (span > bestSpan) {
        best = shortened
        bestSpan = span
      }
    }
    return best
  }

  function rebuildTransits() {
    const rest = blocks
      .filter((b) => b.type !== 'transit')
      .sort((a, b) => a.startHour - b.startHour || (a.type === 'break' ? -1 : 1))
    const next: TimelineBlock[] = []
    let lastSight: TimelineSightBlock | null = null
    let lastEnd = Number.NEGATIVE_INFINITY
    for (const block of rest) {
      if (block.type === 'sight' && lastSight) {
        const hop = transitHours(lastSight.item, block.item)
        const transitStart = Math.max(lastSight.endHour, Math.min(lastEnd, block.startHour))
        const transitEnd = Math.min(block.startHour, transitStart + hop)
        if (transitEnd > transitStart + 0.5 / 60) {
          const from = coordForItem(lastSight.item)
          const to = coordForItem(block.item)
          const pairKey =
            from && to ? routeCacheKey(from, to) : `${lastSight.item.sourceId}->${block.item.sourceId}`
          next.push({
            type: 'transit',
            fromSourceId: lastSight.item.sourceId ?? '',
            toSourceId: block.item.sourceId ?? '',
            pairKey,
            from,
            to,
            startHour: transitStart,
            endHour: Math.max(transitStart, transitEnd),
          })
        }
      }
      next.push(block)
      if (block.type === 'sight') lastSight = block
      lastEnd = Math.max(lastEnd, block.endHour)
    }
    blocks.length = 0
    blocks.push(...next)
  }

  function overlaySlot(
    item: ItineraryItem,
    parentStart: number,
  ): { startHour: number; endHour: number } | null {
    if (!item.sourceId || !isTimedLanding(item.sourceId, selectedIds)) return null
    const hours = hoursOf?.(item)
    if (hours?.closedToday) return null
    const label = includedStopClock(item.sourceId)
    const [, endLabel] = label?.split('–') ?? []
    const clockEnd = parseClockHour(endLabel)
    const durationHours = dur(item)
    let startHour = landingStartHour(item.sourceId, parentStart)
    let endHour = startHour + Math.max(20 / 60, durationHours)
    if (clockEnd != null && clockEnd > startHour) endHour = Math.max(endHour, clockEnd)
    if (hours) {
      if (sightClosedAtTime(hours, startHour)) return null
      const closedAt = clampVisitEnd(hours, startHour, endHour)
      if (closedAt <= startHour + 5 / 60) return null
      endHour = closedAt
    }
    return { startHour, endHour }
  }

  function commitOverlay(item: ItineraryItem, startHourFinal: number, endHour: number) {
    blocks.push({
      type: 'sight',
      item,
      startHour: startHourFinal,
      endHour,
      durationHours: Math.max(15 / 60, endHour - startHourFinal),
      range: rangeLabel(startHourFinal, endHour),
      closedToday: false,
      closedAtTime: false,
      untimed: false,
    })
  }

  function commitSightAt(item: ItineraryItem, startHourFinal: number, endHour: number) {
    blocks.push({
      type: 'sight',
      item,
      startHour: startHourFinal,
      endHour,
      durationHours: snapVisitHours(Math.max(MIN_VISIT, endHour - startHourFinal)),
      plannedHours: dur(item),
      range: rangeLabel(startHourFinal, endHour),
      closedToday: false,
      closedAtTime: false,
      untimed: false,
    })
  }

  const landings: ItineraryItem[] = []
  const packable: ItineraryItem[] = []
  for (const item of orderedSights) {
    if (item.sourceId && isTimedLanding(item.sourceId, selectedIds)) {
      landings.push(item)
      continue
    }
    packable.push(item)
  }
  const pinned: ItineraryItem[] = []
  const meals: ItineraryItem[] = []
  const evening: ItineraryItem[] = []
  const flexible: ItineraryItem[] = []
  for (const item of packable) {
    if (item.sourceId && startOverrides[item.sourceId]) {
      pinned.push(item)
      continue
    }
    if (mealKindOf(item)) {
      meals.push(item)
      continue
    }
    if (timePreferenceForItem(item) === 'EVENING') {
      evening.push(item)
      continue
    }
    flexible.push(item)
  }
  pinned.sort((a, b) => {
    const as = parseDayStart(startOverrides[a.sourceId ?? ''] ?? dayStart)
    const bs = parseDayStart(startOverrides[b.sourceId ?? ''] ?? dayStart)
    return as - bs
  })
  // Least slack first: a full-day outing or a short-hours temple claims its time
  // before the stops that could happen whenever.
  // Stops with hours to spare keep their walking order.
  const slack = (it: ItineraryItem) =>
    Math.min(
      ROOMY_SLACK_HOURS,
      openSpanHours(it) - dur(it),
    )
  const byTightness = (a: ItineraryItem, b: ItineraryItem) => {
    const span = slack(a) - slack(b)
    if (Math.abs(span) > 0.4) return span
    return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0)
  }
  flexible.sort(byTightness)
  evening.sort((a, b) => (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0))
  meals.sort((a, b) => MEAL_WINDOW[mealKindOf(a)!].from - MEAL_WINDOW[mealKindOf(b)!].from)

  // Lunch: a chosen lunch restaurant, else an hour the planner holds back. Tours
  // that feed you (cruises, full-day outings) and a lunch break the traveller
  // added themselves both count as lunch already.
  const lunchMeal = meals.find((m) => mealKindOf(m) === 'lunch') ?? null
  const alreadyFed =
    breaks.some((row) => /lunch/i.test(row.label)) ||
    pinned.some((it) => mealKindOf(it) === 'lunch')
  const feeds = (it: ItineraryItem) =>
    !mealKindOf(it) &&
    (includesOnboardMeal(it) || dur(it) >= 5)
  const mayBeFed = packable.some(feeds)
  const daytimeStops = flexible.length + pinned.filter((it) => !mealKindOf(it)).length
  const wantLunch = !alreadyFed && (lunchMeal != null || (autoLunch && daytimeStops > 0))
  /** A long outing only replaces lunch when it is actually running over midday. */
  const fedByOuting = () =>
    blocks.some(
      (b) => b.type === 'sight' && feeds(b.item) && b.startHour <= 12.25 && b.endHour >= 13.25,
    )
  const lunchHours = lunchMeal ? dur(lunchMeal) : 1
  const LUNCH_ROW: ItineraryBreak = {
    id: 'auto-lunch',
    afterSourceId: null,
    label: 'Lunch',
    durationMinutes: Math.round(lunchHours * 60),
    auto: true,
  }
  const leadBlocks = blocks.slice()

  function place(item: ItineraryItem) {
    // A shop is open all afternoon; only its best hour is the evening.
    const slot =
      gapSlot(item) ?? gapSlot(item, true) ?? (item.kind === 'shopping' ? gapSlot(item, true, true) : null)
    if (!slot) {
      unplaced.push(item)
      return
    }
    commitSightAt(item, slot.startHour, slot.endHour)
  }

  function runPass(lunchStart: number | null): boolean {
    blocks.length = 0
    blocks.push(...leadBlocks)
    unplaced.length = 0
    for (const item of pinned) place(item)
    if (lunchStart != null) {
      const end = lunchStart + lunchHours
      const clash = occupied().some((b) => b.startHour < end - 0.01 && b.endHour > lunchStart + 0.01)
      if (clash) return false
      if (lunchMeal) commitSightAt(lunchMeal, lunchStart, end)
      else {
        blocks.push({
          type: 'break',
          row: LUNCH_ROW,
          startHour: lunchStart,
          endHour: end,
          range: rangeLabel(lunchStart, end),
        })
      }
    }
    const rest = lunchStart != null ? meals.filter((m) => m !== lunchMeal) : meals
    // A coffee stop fits around the sights, not the other way round.
    const coffee = rest.filter((m) => mealKindOf(m) === 'coffee')
    const sitDown = rest.filter((m) => mealKindOf(m) !== 'coffee')
    for (const item of [...sitDown, ...flexible, ...evening, ...coffee]) place(item)
    for (const item of landings) {
      const parentId = item.sourceId ? parentTourId(item.sourceId) : null
      const parentBlock = blocks.find(
        (block) => block.type === 'sight' && block.item.sourceId && block.item.sourceId === parentId,
      )
      if (!parentBlock || parentBlock.type !== 'sight') {
        unplaced.push(item)
        continue
      }
      const overlay = overlaySlot(item, parentBlock.startHour)
      if (overlay) {
        commitOverlay(item, overlay.startHour, overlay.endHour)
        continue
      }
      unplaced.push(item)
    }
    for (const block of [...blocks]) {
      if (block.type !== 'sight' || !block.item.sourceId) continue
      let cursor = block.endHour
      for (const row of byAfter.get(block.item.sourceId) ?? []) {
        const hours = Math.max(5 / 60, row.durationMinutes / 60)
        const startHour = cursor
        const endHour = cursor + hours
        blocks.push({
          type: 'break',
          row,
          startHour,
          endHour,
          range: rangeLabel(startHour, endHour),
        })
        cursor = endHour
      }
    }
    return true
  }

  /** Lower is better: nothing left out, then an earlier finish with less standing around. */
  function passScore(lunchStart: number | null): number {
    const busy = occupied()
    let idle = 0
    for (let i = 1; i < busy.length; i++) idle += Math.max(0, busy[i].startHour - busy[i - 1].endHour)
    const lastEnd = busy.reduce((m, b) => Math.max(m, b.endHour), packStart)
    const lunchDrift = lunchStart == null ? 0 : Math.abs(lunchStart - 12.5) * 0.3
    let cut = 0
    for (const b of busy) {
      if (b.type !== 'sight') continue
      cut += Math.max(0, (b.plannedHours ?? 0) - (b.endHour - b.startHour)) * 2
      if (isSqueezed(b)) cut += 300
    }
    return unplaced.length * 1000 + cut + lastEnd + idle * 0.25 + lunchDrift
  }

  if (!wantLunch) {
    runPass(null)
  } else {
    const candidates = [12, 12.5, 13, 11.5, 13.5].filter((h) => h >= packStart - 0.01)
    if (!candidates.length && packStart <= 14) candidates.push(packStart)
    let best: { score: number; blocks: TimelineBlock[]; unplaced: ItineraryItem[] } | null = null
    for (const lunchStart of candidates) {
      if (!runPass(lunchStart)) continue
      const score = passScore(lunchStart)
      if (!best || score < best.score) best = { score, blocks: blocks.slice(), unplaced: unplaced.slice() }
    }
    if (mayBeFed) {
      runPass(null)
      const score = passScore(null) + (fedByOuting() ? -0.5 : 500)
      if (!best || score < best.score) best = { score, blocks: blocks.slice(), unplaced: unplaced.slice() }
    }
    if (best) {
      blocks.length = 0
      blocks.push(...best.blocks)
      unplaced.length = 0
      unplaced.push(...best.unplaced)
    } else {
      runPass(null)
    }
  }
  rebuildTransits()
  blocks.sort((a, b) => a.startHour - b.startHour || (a.type === 'transit' ? -1 : 1))

  if (lastSightEndHour != null) {
    const capped = applyLastSightEndCap(blocks, lastSightEndHour, parseDayStart(dayStart))
    return {
      blocks: capped.blocks,
      pairs,
      lastSightOverrun: capped.overrun,
      unplaced,
    }
  }

  return { blocks, pairs, lastSightOverrun: false, unplaced }
}
