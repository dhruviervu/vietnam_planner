import { PIN_BY_SOURCE_ID, type PinCoord } from './itineraryPinCatalog'
import type { ItineraryItem, PeriodId } from './types'

export function haversineKm(a: PinCoord, b: PinCoord): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function coordForItem(it: ItineraryItem): PinCoord | null {
  if (it.sourceId && PIN_BY_SOURCE_ID[it.sourceId]) return PIN_BY_SOURCE_ID[it.sourceId]
  return null
}

function isSight(it: ItineraryItem) {
  return it.kind === 'experience' || it.kind === 'activity'
}

function nearestNeighbor(items: ItineraryItem[], start: PinCoord | null): ItineraryItem[] {
  const remaining = [...items]
  const ordered: ItineraryItem[] = []
  let cursor = start
  while (remaining.length) {
    let best = 0
    if (cursor) {
      let bestD = Number.POSITIVE_INFINITY
      remaining.forEach((it, i) => {
        const c = coordForItem(it)
        const d = c ? haversineKm(cursor!, c) : 50
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
    }
    const next = remaining.splice(best, 1)[0]
    ordered.push(next)
    cursor = coordForItem(next) ?? cursor
  }
  return ordered
}

/** Keep non-sights in place; fill sight slots with a nearest-neighbour tour of the day. */
export function clusterDaySightsByProximity(
  periodItems: Record<PeriodId, ItineraryItem[]>,
  start: PinCoord | null,
): { names: string[]; hopsKm: number[] } {
  const periods: PeriodId[] = ['morning', 'afternoon', 'evening']
  const counts = periods.map((p) => periodItems[p].filter(isSight).length)
  const allSights = periods.flatMap((p) => periodItems[p].filter(isSight))
  const ordered = nearestNeighbor(allSights, start)
  let idx = 0
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i]
    const chunk = ordered.slice(idx, idx + counts[i])
    idx += counts[i]
    let ci = 0
    periodItems[p] = periodItems[p].map((it) => (isSight(it) ? chunk[ci++] ?? it : it))
  }
  const hopsKm: number[] = []
  let prev = start
  for (const it of ordered) {
    const c = coordForItem(it)
    if (prev && c) hopsKm.push(Math.round(haversineKm(prev, c) * 10) / 10)
    prev = c ?? prev
  }
  return { names: ordered.map((it) => it.name), hopsKm }
}
