import type { PlaceId } from '../../../GettingAround/data/types'
import { MACRO_REGION, orderTripCities } from './cityPlanning'

/**
 * Macro pacing: days follow sight volume and geography, not leftover stubs
 * and not an even split across cities.
 *
 *   ≤2 sights → 1 day (2 if a regional connector)
 *   3–8 → 2
 *   9–18 → 3
 *   19–28 → 4
 *   29+ → 5
 */
export function volumeStayDays(sightCount: number): number {
  if (sightCount <= 0) return 0
  if (sightCount <= 2) return 1
  if (sightCount <= 8) return 2
  if (sightCount <= 18) return 3
  if (sightCount <= 28) return 4
  return 5
}

/**
 * A thin highland / in-between stop whose neighbours sit in different
 * macro-regions (Da Lat between Nha Trang and Phu Quoc). Used as a 2-day
 * climate breaker rather than a 1-day stub.
 */
export function isRegionalConnector(placeId: PlaceId, tripPlaceIds: PlaceId[]): boolean {
  const ordered = orderTripCities(tripPlaceIds)
  const i = ordered.indexOf(placeId)
  if (i <= 0 || i >= ordered.length - 1) return false
  const prev = MACRO_REGION[ordered[i - 1]]
  const here = MACRO_REGION[placeId]
  const next = MACRO_REGION[ordered[i + 1]]
  if (!prev || !here || !next) return false
  return here !== prev && here !== next
}

export type StayDayBounds = { min: number; max: number }

/**
 * Planned stay length for one city. `max` is the compression ceiling (Hanoi
 * 17 sights → 3, not a leftover day per cluster). `min` pads only regional
 * connectors that have at least two distinct sights — never by repeating a card.
 */
export function stayDayBounds(
  placeId: PlaceId | string | null | undefined,
  ids: string[],
  tripPlaceIds: PlaceId[] = [],
): StayDayBounds {
  const unique = [...new Set(ids.filter(Boolean))]
  const n = unique.length
  if (n === 0) return { min: 0, max: 0 }
  let min = 1
  let max = volumeStayDays(n)
  const pid = placeId as PlaceId
  if (
    n >= 2 &&
    tripPlaceIds.length >= 3 &&
    pid &&
    isRegionalConnector(pid, tripPlaceIds)
  ) {
    min = Math.max(min, 2)
    max = Math.max(max, 2)
  }
  return { min, max: Math.max(min, max) }
}
