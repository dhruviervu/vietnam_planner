import { packVisitHours } from './dayAllocation'
import { snapVisitHours } from './visitHours'
import { itemHours } from './dayCapacity'
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
  range: string
  closedToday?: boolean
  closedAtTime?: boolean
  untimed?: boolean
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
}): { blocks: TimelineBlock[]; pairs: RoutePair[]; lastSightOverrun?: boolean; unplaced: ItineraryItem[] } {
  const {
    sights,
    breaks,
    dayStart,
    lastSightEndBy,
    durationOverrides,
    startOverrides,
    legs,
    hoursOf,
    isoDate = '',
  } = opts
  const lastSightEndHour = parseDayEndHour(lastSightEndBy)
  const selectedIds = sights
    .map((it) => it.sourceId)
    .filter((id): id is string => Boolean(id))
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
  const dayCap = DAY_CLOSE
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
  ): { startHour: number; endHour: number } | null {
    const sourceId = item.sourceId
    let durationHours = durationOf(item, durationOverrides, selectedIds, isoDate)
    const hours = hoursOf?.(item)
    if (hours?.closedToday) return null
    const eveningPref = timePreferenceForItem(item) === 'EVENING'
    let startAfter = after
    if (eveningPref && !ignoreEvening) startAfter = Math.max(startAfter, EVENING_EARLIEST_START)
    if (sourceId && startOverrides[sourceId]) {
      startAfter = Math.max(startAfter, parseDayStart(startOverrides[sourceId]))
    }
    if (!allowWait && startAfter > travelAfter + MAX_WAIT_HOURS) return null
    const tryDwell = (need: number): { startHour: number; endHour: number } | null => {
      let startHour = startAfter
      let endHour = startAfter + need
      if (hours) {
        const openNeed = allowShorten ? MIN_VISIT : need
        const openAt = earliestOpenAt(hours, startAfter, openNeed, until)
        if (!Number.isFinite(openAt)) return null
        startHour = Math.max(startAfter, openAt)
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

  function gapSlot(item: ItineraryItem, ignoreEvening = false): { startHour: number; endHour: number } | null {
    const placed = blocks
      .filter((b): b is TimelineSightBlock => b.type === 'sight')
      .sort((a, b) => a.startHour - b.startHour)
    const windows: {
      from: number
      to: number
      afterItem: ItineraryItem | null
      beforeItem: ItineraryItem | null
    }[] = [
      {
        from: packStart,
        to: placed[0]?.startHour ?? dayCap,
        afterItem: null,
        beforeItem: placed[0]?.item ?? null,
      },
    ]
    for (let i = 0; i < placed.length; i++) {
      windows.push({
        from: placed[i].endHour,
        to: placed[i + 1]?.startHour ?? dayCap,
        afterItem: placed[i].item,
        beforeItem: placed[i + 1]?.item ?? null,
      })
    }
    for (const win of windows) {
      let after = win.from
      if (win.afterItem) after += transitHours(win.afterItem, item)
      let until = win.to
      if (win.beforeItem) until -= transitHours(item, win.beforeItem)
      const full = visitWindow(item, after, until, true, ignoreEvening, false, after)
      if (full) return full
    }
    let best: { startHour: number; endHour: number } | null = null
    let bestSpan = 0
    for (const win of windows) {
      let after = win.from
      if (win.afterItem) after += transitHours(win.afterItem, item)
      let until = win.to
      if (win.beforeItem) until -= transitHours(item, win.beforeItem)
      const shortened = visitWindow(item, after, until, true, ignoreEvening, true, after)
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
    for (const block of rest) {
      if (block.type === 'sight' && lastSight) {
        const hop = transitHours(lastSight.item, block.item)
        const transitStart = lastSight.endHour
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
    const durationHours = durationOf(item, durationOverrides, selectedIds, isoDate)
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
  const evening: ItineraryItem[] = []
  const flexible: ItineraryItem[] = []
  for (const item of packable) {
    if (item.sourceId && startOverrides[item.sourceId]) {
      pinned.push(item)
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
  const byTightness = (a: ItineraryItem, b: ItineraryItem) => {
    const span = openSpanHours(a) - openSpanHours(b)
    if (Math.abs(span) > 0.4) return span
    return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0)
  }
  flexible.sort(byTightness)
  evening.sort((a, b) => (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0))
  for (const item of [...pinned, ...flexible, ...evening]) {
    const slot = gapSlot(item) ?? gapSlot(item, true)
    if (!slot) {
      unplaced.push(item)
      continue
    }
    commitSightAt(item, slot.startHour, slot.endHour)
  }
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
