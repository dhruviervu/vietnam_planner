import type { ItineraryItem } from './types'
import { coordForItem, orderIdsBySightIntelligence, type PinCoord } from './sightOrder'
import {
  durationMatrixSync,
  getDurationMatrix,
  travelMinutesBetween,
} from './osrmRoute'
import { intelligenceUnits } from './sightIntelligence'

export type GreedyTourResult<T> = {
  order: T[]
  totalTravelMinutes: number
}

/**
 * Greedy nearest-neighbour: from `startIndex`, always walk to the unvisited
 * stop with the shortest travel time. Returns visit order and total minutes.
 */
export function greedyNearestNeighbor(
  durationMins: number[][],
  startIndex: number,
): { order: number[]; totalTravelMinutes: number } {
  const n = durationMins.length
  if (n === 0) return { order: [], totalTravelMinutes: 0 }
  const start = Math.max(0, Math.min(Math.floor(startIndex) || 0, n - 1))
  const used = new Set<number>([start])
  const order = [start]
  let totalTravelMinutes = 0
  while (order.length < n) {
    const last = order[order.length - 1]
    let best = -1
    let bestMins = Number.POSITIVE_INFINITY
    for (let j = 0; j < n; j++) {
      if (used.has(j)) continue
      const mins = durationMins[last]?.[j] ?? Number.POSITIVE_INFINITY
      if (mins < bestMins) {
        bestMins = mins
        best = j
      }
    }
    if (best < 0) break
    used.add(best)
    totalTravelMinutes += Number.isFinite(bestMins) ? bestMins : 0
    order.push(best)
  }
  return { order, totalTravelMinutes }
}

/** Designated first sight: closest unvisited pin to the day's start (hotel / city). */
export function pickStartIndex(coords: (PinCoord | null)[], start?: PinCoord | null): number {
  if (coords.length === 0) return 0
  if (!start) return 0
  let best = 0
  let bestMins = Number.POSITIVE_INFINITY
  for (let i = 0; i < coords.length; i++) {
    const mins = travelMinutesBetween(start, coords[i])
    if (mins < bestMins) {
      bestMins = mins
      best = i
    }
  }
  return best
}

function applyOrder<T>(items: T[], indices: number[]): T[] {
  const seen = new Set<number>()
  const out: T[] = []
  for (const i of indices) {
    if (i < 0 || i >= items.length || seen.has(i)) continue
    seen.add(i)
    out.push(items[i])
  }
  for (let i = 0; i < items.length; i++) {
    if (!seen.has(i)) out.push(items[i])
  }
  return out
}

function greedyFromMatrix<T>(
  items: T[],
  coords: (PinCoord | null)[],
  matrix: number[][],
  start?: PinCoord | null,
): GreedyTourResult<T> {
  const { order, totalTravelMinutes } = greedyNearestNeighbor(
    matrix,
    pickStartIndex(coords, start),
  )
  return { order: applyOrder(items, order), totalTravelMinutes }
}

function applyIntelligenceOrder<T>(
  items: T[],
  idOf: (item: T) => string | undefined,
  orderHeads: (heads: T[], coords: (PinCoord | null)[]) => T[],
): T[] {
  const withId = items.filter((item) => Boolean(idOf(item)))
  const noId = items.filter((item) => !idOf(item))
  if (withId.length <= 1) return items
  const ids = withId.map((item) => idOf(item)!)
  const units = intelligenceUnits(ids)
  const byId = new Map(withId.map((item) => [idOf(item)!, item]))
  const heads = units
    .map((unit) => byId.get(unit[0]))
    .filter((item): item is T => Boolean(item))
  const headCoords = heads.map((item) => coordForItem(item as ItineraryItem))
  const orderedHeads = orderHeads(heads, headCoords)
  const seen = new Set<string>()
  const expanded: T[] = []
  for (const head of orderedHeads) {
    const headId = idOf(head)
    const unit = units.find((row) => row[0] === headId) ?? [headId!]
    for (const id of unit) {
      if (seen.has(id)) continue
      const item = byId.get(id)
      if (!item) continue
      seen.add(id)
      expanded.push(item)
    }
  }
  for (const item of withId) {
    const id = idOf(item)!
    if (!seen.has(id)) expanded.push(item)
  }
  return [...expanded, ...noId]
}

/** Sync greedy tour (cached OSRM hops, else Haversine road minutes). */
export function orderSightsByGreedyTravel(
  items: ItineraryItem[],
  start?: PinCoord | null,
): GreedyTourResult<ItineraryItem> {
  if (items.length <= 1) return { order: items, totalTravelMinutes: 0 }
  const order = applyIntelligenceOrder(items, (it) => it.sourceId, (heads, coords) => {
    if (heads.length <= 1) return heads
    return greedyFromMatrix(heads, coords, durationMatrixSync(coords), start).order
  })
  let totalTravelMinutes = 0
  for (let i = 1; i < order.length; i++) {
    totalTravelMinutes += travelMinutesBetween(coordForItem(order[i - 1]), coordForItem(order[i]))
  }
  return { order, totalTravelMinutes }
}

/** Same greedy tour after an OSRM duration/distance table for the day's pins. */
export async function orderSightsByGreedyTravelAsync(
  items: ItineraryItem[],
  start?: PinCoord | null,
): Promise<GreedyTourResult<ItineraryItem>> {
  if (items.length <= 1) return { order: items, totalTravelMinutes: 0 }
  const withId = items.filter((it) => Boolean(it.sourceId))
  if (withId.length <= 1) return { order: items, totalTravelMinutes: 0 }
  const ids = withId.map((it) => it.sourceId!)
  const units = intelligenceUnits(ids)
  const byId = new Map(withId.map((it) => [it.sourceId!, it]))
  const heads = units.map((unit) => byId.get(unit[0])).filter((it): it is ItineraryItem => Boolean(it))
  const missing = items.filter((it) => !it.sourceId)
  if (heads.length <= 1) {
    const order = orderIdsBySightIntelligence(ids, start)
      .map((id) => byId.get(id))
      .filter((it): it is ItineraryItem => Boolean(it))
    return { order: [...order, ...missing], totalTravelMinutes: 0 }
  }
  const headCoords = heads.map((it) => coordForItem(it))
  const matrix = headCoords.every((c): c is PinCoord => Boolean(c))
    ? await getDurationMatrix(headCoords)
    : durationMatrixSync(headCoords)
  const headResult = greedyFromMatrix(heads, headCoords, matrix, start)
  const seen = new Set<string>()
  const expanded: ItineraryItem[] = []
  for (const head of headResult.order) {
    const unit = units.find((row) => row[0] === head.sourceId) ?? [head.sourceId!]
    for (const id of unit) {
      if (seen.has(id)) continue
      const item = byId.get(id)
      if (!item) continue
      seen.add(id)
      expanded.push(item)
    }
  }
  for (const item of withId) {
    if (item.sourceId && !seen.has(item.sourceId)) expanded.push(item)
  }
  return { order: [...expanded, ...missing], totalTravelMinutes: headResult.totalTravelMinutes }
}
