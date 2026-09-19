import { PIN_BY_SOURCE_ID, type PinCoord } from './itineraryPinCatalog'
import type { ItineraryItem, PeriodId } from './types'
import { bestPeriodForItem, bestPeriodForSourceId } from './sightTiming'
import { placeCoords, resolvePlaceId } from './cityPins'
import { SHOPPING_ITEMS } from '../../data/shopping'
import {
  atomicBundleId,
  canonicalSightId,
  intelligenceUnit,
  intelligenceUnits,
  parentTourIdOf,
  sequenceOf,
} from './sightIntelligence'

export type { PinCoord }

const MISSING_KM = 50
const TWO_OPT_EPS = 0.04

export function haversineKm(a: PinCoord, b: PinCoord): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function coordForSourceId(id: string): PinCoord | null {
  return pinForSourceId(id)
}

function pinForSourceId(id: string): PinCoord | null {
  if (PIN_BY_SOURCE_ID[id]) return PIN_BY_SOURCE_ID[id]
  const canon = canonicalSightId(id)
  if (PIN_BY_SOURCE_ID[canon]) return PIN_BY_SOURCE_ID[canon]
  const shop = SHOPPING_ITEMS.find((s) => s.id === id || s.id === canon)
  if (!shop) return null
  const pid = resolvePlaceId(shop.city, shop.region)
  return pid ? placeCoords(pid) : null
}

export function coordForItem(it: ItineraryItem): PinCoord | null {
  if (it.sourceId) {
    const pin = pinForSourceId(it.sourceId)
    if (pin) return pin
  }
  if (it.kind === 'shopping') {
    const pid = resolvePlaceId(it.city, it.region)
    return pid ? placeCoords(pid) : null
  }
  return null
}

function isSight(it: ItineraryItem) {
  return it.kind === 'experience' || it.kind === 'activity' || it.kind === 'shopping'
}

/**
 * Typical rush-hour stretch on a sightseeing day, aligned with Getting Around
 * city traffic profiles (Hanoi/HCMC heaviest). Mixed with off-peak so a full
 * day is not priced as continuous rush hour.
 */
export function cityTrafficFactor(placeId?: string | null): number {
  const rush: Record<string, number> = {
    hanoi: 1.4,
    hcmc: 1.45,
    'da-nang': 1.2,
    'hoi-an': 1.08,
    hue: 1.15,
    'ninh-binh': 1.05,
    'ha-long': 1.15,
    sapa: 1.12,
    'nha-trang': 1.15,
    'phu-quoc': 1.05,
    dalat: 1.12,
    'can-tho': 1.2,
    'ha-giang': 1.08,
    'phong-nha': 1.05,
    'con-dao': 1.05,
    'ha-tien': 1.1,
    mekong: 1.18,
  }
  const peak = rush[placeId ?? ''] ?? 1.15
  return 1 + (peak - 1) * 0.55
}

/**
 * Door-to-door minutes between two stops. `multiplier` reflects how the
 * traveller gets around: >1 for walking and public transit, <1 for taxis and
 * private transfers over the same distance. Optional `traffic` stretches the
 * same hop in cities where peak congestion is the default.
 */
export function travelHoursBetween(
  a: PinCoord | null,
  b: PinCoord | null,
  multiplier = 1,
  traffic = 1,
): number {
  const scale = (multiplier > 0 ? multiplier : 1) * (traffic > 0 ? traffic : 1)
  if (!a || !b) return (10 / 60) * scale
  const km = haversineKm(a, b)
  if (km < 0.12) return (6 / 60) * scale
  if (km < 0.85) return Math.min(0.45 * scale, (8 / 60 + km / 4.6) * scale)
  return Math.min(1.25 * scale, (8 / 60 + km / 18) * scale)
}

function distCoords(a: PinCoord | null, b: PinCoord | null): number {
  if (!a || !b) return MISSING_KM
  return haversineKm(a, b)
}

function distanceMatrix(coords: (PinCoord | null)[]): number[][] {
  const n = coords.length
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = distCoords(coords[i], coords[j])
      m[i][j] = d
      m[j][i] = d
    }
  }
  return m
}

function pathLength(order: number[], m: number[][]): number {
  let sum = 0
  for (let i = 1; i < order.length; i++) sum += m[order[i - 1]][order[i]]
  return sum
}

function twoOptPath(order: number[], m: number[][], lockStart = false, lockEnd = false): number[] {
  if (order.length < 4) return order
  let best = order
  let bestLen = pathLength(best, m)
  let improved = true
  while (improved) {
    improved = false
    const i0 = lockStart ? 1 : 0
    const kMax = lockEnd ? best.length - 2 : best.length - 1
    for (let i = i0; i <= kMax - 1; i++) {
      for (let k = i + 1; k <= kMax; k++) {
        const next = best.slice(0, i).concat(best.slice(i, k + 1).reverse(), best.slice(k + 1))
        const len = pathLength(next, m)
        if (len + TWO_OPT_EPS < bestLen) {
          best = next
          bestLen = len
          improved = true
        }
      }
    }
  }
  return best
}

function nearestNeighborOrder(start: number, n: number, m: number[][]): number[] {
  const used = new Set<number>([start])
  const order = [start]
  while (order.length < n) {
    const last = order[order.length - 1]
    let best = -1
    let bestD = Number.POSITIVE_INFINITY
    for (let j = 0; j < n; j++) {
      if (used.has(j)) continue
      if (m[last][j] < bestD) {
        bestD = m[last][j]
        best = j
      }
    }
    if (best < 0) break
    used.add(best)
    order.push(best)
  }
  return order
}

function axisStartCoord(coords: PinCoord[]): PinCoord {
  const lats = coords.map((c) => c.lat)
  const lngs = coords.map((c) => c.lng)
  const meanLat = lats.reduce((s, n) => s + n, 0) / coords.length
  const dLatKm = (Math.max(...lats) - Math.min(...lats)) * 111
  const dLngKm = (Math.max(...lngs) - Math.min(...lngs)) * 111 * Math.cos((meanLat * Math.PI) / 180)
  if (dLatKm >= dLngKm) {
    const north = Math.max(...lats)
    return coords.find((c) => c.lat === north) ?? coords[0]
  }
  const west = Math.min(...lngs)
  return coords.find((c) => c.lng === west) ?? coords[0]
}

/**
 * Walking / taxi tour: start at breakfast (or the north/west end of the cluster),
 * then nearest-neighbour with a slight push along the day's axis so the path
 * does not zigzag. 2-opt polishes hops but cannot change the first stop.
 */
export function optimizeRouteIndices(
  coords: (PinCoord | null)[],
  start?: PinCoord | null,
): number[] {
  const n = coords.length
  if (n <= 1) return n === 1 ? [0] : []
  if (n === 2) {
    if (!start || !coords[0] || !coords[1]) return [0, 1]
    return distCoords(start, coords[0]) <= distCoords(start, coords[1]) ? [0, 1] : [1, 0]
  }

  const known = coords.filter((c): c is PinCoord => Boolean(c))
  const origin = start && (start.lat || start.lng) ? start : known.length ? axisStartCoord(known) : null
  const m = distanceMatrix(coords)

  let first = 0
  if (origin) {
    let bestD = Number.POSITIVE_INFINITY
    coords.forEach((c, i) => {
      const d = distCoords(origin, c)
      if (d < bestD) {
        bestD = d
        first = i
      }
    })
  }

  const greedy = nearestNeighborOrder(first, n, m)
  return twoOptPath(greedy, m, true, false)
}

export function routeLengthKm(items: ItineraryItem[]): number {
  let sum = 0
  for (let i = 1; i < items.length; i++) {
    sum += distCoords(coordForItem(items[i - 1]), coordForItem(items[i]))
  }
  return sum
}

export function orderSightsByProximity(
  items: ItineraryItem[],
  start?: PinCoord | null,
): ItineraryItem[] {
  if (items.length <= 1) return items
  const withId = items.filter((it): it is ItineraryItem & { sourceId: string } => Boolean(it.sourceId))
  const noId = items.filter((it) => !it.sourceId)
  if (withId.length <= 1) {
    const idx = optimizeRouteIndices(items.map(coordForItem), start)
    return idx.map((i) => items[i])
  }
  const ordered = orderIdsBySightIntelligence(
    withId.map((it) => it.sourceId),
    start,
  )
  const byId = new Map(withId.map((it) => [it.sourceId, it] as const))
  const orderedItems: ItineraryItem[] = []
  for (const id of ordered) {
    const it = byId.get(id)
    if (it) orderedItems.push(it)
  }
  return [...orderedItems, ...noId]
}

/**
 * Sort a day's stops using sight intelligence first (cruise landings stay on
 * the boat; citadel halls stay inside the walls), then geography between outings.
 */
export function orderIdsBySightIntelligence(ids: string[], start?: PinCoord | null): string[] {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length <= 1) return unique
  const units = intelligenceUnits(unique)
  if (units.length <= 1) return units[0] ?? unique
  const coords = units.map((unit) => {
    const head = unit[0]
    return pinForSourceId(head) ?? unit.map(pinForSourceId).find((pin): pin is PinCoord => Boolean(pin)) ?? null
  })
  const idx = optimizeRouteIndices(coords, start)
  return idx.flatMap((i) => units[i] ?? [])
}

/** Nearest-neighbour + 2-opt tour of catalog source ids (experiences / activities). */
export function orderSourceIdsByProximity(ids: string[], start?: PinCoord | null): string[] {
  return orderIdsBySightIntelligence(ids, start)
}

/** Insert a stop where it adds the least extra travel (manual add into an existing tour). */
export function insertIntoTour<T>(
  tour: T[],
  item: T,
  coordOf: (x: T) => PinCoord | null,
): T[] {
  if (tour.length === 0) return [item]
  const here = coordOf(item)
  if (!here) return [...tour, item]
  const hop = (a: PinCoord | null, b: PinCoord | null) => (a && b ? haversineKm(a, b) : 0)
  let bestAt = tour.length
  let bestExtra = Number.POSITIVE_INFINITY
  for (let i = 0; i <= tour.length; i++) {
    const prev = i === 0 ? null : coordOf(tour[i - 1])
    const next = i === tour.length ? null : coordOf(tour[i])
    const extra = hop(prev, here) + hop(here, next) - hop(prev, next)
    if (extra < bestExtra) {
      bestExtra = extra
      bestAt = i
    }
  }
  const next = tour.slice()
  next.splice(bestAt, 0, item)
  return next
}

export function insertSightIntoTour(tour: ItineraryItem[], item: ItineraryItem): ItineraryItem[] {
  if (!item.sourceId) return insertIntoTour(tour, item, coordForItem)
  const ids = insertSourceIdIntoTour(
    tour.map((it) => it.sourceId).filter((id): id is string => Boolean(id)),
    item.sourceId,
  )
  const byId = new Map(
    [...tour, item].flatMap((it) => (it.sourceId ? [[it.sourceId, it] as const] : [])),
  )
  const ordered = ids.map((id) => byId.get(id)).filter((it): it is ItineraryItem => Boolean(it))
  const leftover = [...tour, item].filter((it) => !it.sourceId)
  return [...ordered, ...leftover]
}

/** Place `sourceId` on the hop between two existing stops, without re-clustering the day. */
export function insertSourceIdBetween(
  tour: string[],
  fromId: string,
  toId: string,
  sourceId: string,
): string[] {
  if (!sourceId) return tour
  const clean = tour.filter((id) => id && id !== sourceId)
  const fromAt = fromId ? clean.indexOf(fromId) : -1
  const toAt = toId ? clean.indexOf(toId) : -1
  if (fromAt >= 0 && toAt === fromAt + 1) {
    const next = clean.slice()
    next.splice(fromAt + 1, 0, sourceId)
    return next
  }
  if (fromAt >= 0) {
    const next = clean.slice()
    next.splice(fromAt + 1, 0, sourceId)
    return next
  }
  if (toAt >= 0) {
    const next = clean.slice()
    next.splice(toAt, 0, sourceId)
    return next
  }
  return insertSourceIdIntoTour(clean, sourceId)
}

export function insertSourceIdIntoTour(tour: string[], sourceId: string): string[] {
  if (!sourceId) return tour
  if (tour.includes(sourceId)) return tour
  const selected = new Set([...tour, sourceId])
  const unit = intelligenceUnit(sourceId, selected)
  const bundle = atomicBundleId(sourceId)
  const parent = parentTourIdOf(sourceId)
  const parentAt = parent
    ? tour.findIndex((id) => id === parent || canonicalSightId(id) === canonicalSightId(parent))
    : -1
  const mateAt = bundle
    ? tour.findIndex((id) => atomicBundleId(id) === bundle)
    : tour.findIndex((id) => unit.includes(id))
  const anchor = parentAt >= 0 ? parentAt : mateAt
  if (anchor >= 0) {
    const seq = sequenceOf(sourceId)
    let at = anchor
    while (
      at < tour.length &&
      (unit.includes(tour[at]) || (bundle != null && atomicBundleId(tour[at]) === bundle)) &&
      sequenceOf(tour[at]) <= seq
    ) {
      at += 1
    }
    const next = tour.slice()
    next.splice(at, 0, sourceId)
    return next
  }
  return insertIntoTour(tour, sourceId, (id) => pinForSourceId(id))
}

export function farHopKm(hops: number[]): number {
  if (hops.length === 0) return 4
  const sorted = [...hops].sort((a, b) => a - b)
  const mid = sorted[Math.floor(sorted.length / 2)] ?? 1.5
  return Math.max(3.2, mid * 2.2)
}

/** K-means++ on lat/lng. k = number of city days. Clusters come back in geographic order. */
export function kMeansClusterIds(ids: string[], k: number): string[][] {
  const unique = [...new Set(ids.filter(Boolean))]
  const units = intelligenceUnits(unique)
  if (units.some((unit) => unit.length > 1)) {
    const heads = units.map((unit) => unit[0])
    const clusteredHeads = clusterPoints(heads, k)
    const byHead = new Map(units.map((unit) => [unit[0], unit]))
    return clusteredHeads.map((cluster) => cluster.flatMap((head) => byHead.get(head) ?? [head]))
  }
  return clusterPoints(unique, k)
}

function clusterPoints(ids: string[], k: number): string[][] {
  const pts = ids
    .map((id) => ({ id, c: pinForSourceId(id) }))
    .filter((p): p is { id: string; c: PinCoord } => Boolean(p.c))
  const orphans = ids.filter((id) => !pinForSourceId(id))
  if (pts.length === 0) return [ids]
  k = Math.max(1, Math.min(Math.floor(k), pts.length))
  if (k === 1) return [ids]

  const mean = {
    lat: pts.reduce((s, p) => s + p.c.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.c.lng, 0) / pts.length,
  }
  const centroids: PinCoord[] = []
  let first = 0
  let firstD = Number.POSITIVE_INFINITY
  pts.forEach((p, i) => {
    const d = haversineKm(mean, p.c)
    if (d < firstD) {
      firstD = d
      first = i
    }
  })
  centroids.push({ lat: pts[first].c.lat, lng: pts[first].c.lng })
  while (centroids.length < k) {
    let far = 0
    let farD = -1
    pts.forEach((p, i) => {
      const d = Math.min(...centroids.map((c) => haversineKm(c, p.c)))
      if (d > farD) {
        farD = d
        far = i
      }
    })
    centroids.push({ lat: pts[far].c.lat, lng: pts[far].c.lng })
  }

  const assign = pts.map(() => 0)
  for (let iter = 0; iter < 32; iter++) {
    let changed = false
    pts.forEach((p, i) => {
      let best = 0
      let bestD = Number.POSITIVE_INFINITY
      centroids.forEach((c, ci) => {
        const d = haversineKm(c, p.c)
        if (d < bestD) {
          bestD = d
          best = ci
        }
      })
      if (assign[i] !== best) {
        assign[i] = best
        changed = true
      }
    })
    const sums = centroids.map(() => ({ lat: 0, lng: 0, n: 0 }))
    pts.forEach((p, i) => {
      sums[assign[i]].lat += p.c.lat
      sums[assign[i]].lng += p.c.lng
      sums[assign[i]].n += 1
    })
    centroids.forEach((c, ci) => {
      if (sums[ci].n === 0) return
      c.lat = sums[ci].lat / sums[ci].n
      c.lng = sums[ci].lng / sums[ci].n
    })
    if (!changed && iter > 0) break
  }

  const clusters: string[][] = Array.from({ length: k }, () => [])
  pts.forEach((p, i) => clusters[assign[i]].push(p.id))

  // Order clusters geographically (south-west corner outward) so the mapping onto
  // day slots is stable between runs. Sizes are balanced later by the allocator.
  const ordered = clusters
    .map((ids, ci) => ({ ids, c: centroids[ci] }))
    .sort((a, b) => a.c.lat + a.c.lng - (b.c.lat + b.c.lng))
    .map((row) => row.ids)
  const nonempty = ordered.filter((c) => c.length > 0)
  while (nonempty.length < k) nonempty.push([])
  if (orphans.length) nonempty[0] = [...nonempty[0], ...orphans]
  return nonempty.slice(0, k)
}

/**
 * One day's tour: breakfast location → nearest morning sights along a line,
 * then afternoon, then evening. Travel stays short because each window is its
 * own directed walk, not a random TSP of the whole bag.
 */
export function recomputeOptimalRoute(
  _dayId: string,
  sourceIds: string[],
  start?: PinCoord | null,
): string[] {
  const ids = [...new Set(sourceIds.filter(Boolean))]
  if (ids.length <= 1) return ids
  return orderSourceIdsByProximity(ids, start)
}

function lastCoord(ids: string[], fallback?: PinCoord | null): PinCoord | null {
  for (let i = ids.length - 1; i >= 0; i--) {
    const c = pinForSourceId(ids[i])
    if (c) return c
  }
  return fallback ?? null
}

/** Morning sights first (context), each group walked from the previous stop. */
export function orderIdsByContextAndProximity(
  ids: string[],
  start?: PinCoord | null,
): string[] {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length <= 1) return unique
  const morning: string[] = []
  const afternoon: string[] = []
  const evening: string[] = []
  const rest: string[] = []
  for (const unit of intelligenceUnits(unique)) {
    const slot = bestPeriodForSourceId(unit[0])
    if (slot === 'evening') evening.push(...unit)
    else if (slot === 'morning') morning.push(...unit)
    else if (slot === 'afternoon') afternoon.push(...unit)
    else rest.push(...unit)
  }
  const morningTour = orderSourceIdsByProximity(morning, start)
  const afterStart = lastCoord(morningTour, start)
  const midday = orderSourceIdsByProximity([...rest, ...afternoon], afterStart)
  const eveStart = lastCoord(midday, afterStart)
  const eveningTour = orderSourceIdsByProximity(evening, eveStart)
  return [...morningTour, ...midday, ...eveningTour]
}

export function orderSightsByContextAndProximity(
  items: ItineraryItem[],
  start?: PinCoord | null,
): ItineraryItem[] {
  if (items.length <= 1) return items
  const byKey = new Map(items.map((it) => [it.sourceId ?? it.id, it]))
  const ids = orderIdsByContextAndProximity(
    items.map((it) => it.sourceId ?? it.id),
    start,
  )
  const tour = ids.map((id) => byKey.get(id)).filter((it): it is ItineraryItem => Boolean(it))
  const extras = items.filter((it) => !tour.some((t) => t.id === it.id))
  return extras.reduce((acc, item) => insertSightIntoTour(acc, item), tour)
}

/**
 * Reorder a day's sights as one geographic tour, then fill morning → afternoon → evening
 * along that tour so consecutive stops stay consecutive (no west↔east backtracking).
 */
export function clusterDaySightsByProximity(
  periodItems: Record<PeriodId, ItineraryItem[]>,
  start: PinCoord | null,
): { names: string[]; hopsKm: number[] } {
  const periods: PeriodId[] = ['morning', 'afternoon', 'evening']
  const rest: Record<PeriodId, ItineraryItem[]> = {
    morning: periodItems.morning.filter((it) => !isSight(it)),
    afternoon: periodItems.afternoon.filter((it) => !isSight(it)),
    evening: periodItems.evening.filter((it) => !isSight(it)),
    night: periodItems.night.filter((it) => !isSight(it)),
  }
  const allSights = periods.flatMap((p) => periodItems[p].filter(isSight))
  const byKey = new Map(allSights.map((it) => [it.sourceId ?? it.id, it]))
  const orderedIds = orderIdsByContextAndProximity(
    allSights.map((it) => it.sourceId ?? it.id),
    start,
  )
  const tour = orderedIds
    .map((id) => byKey.get(id))
    .filter((it): it is ItineraryItem => Boolean(it))
  const leftovers = allSights.filter((it) => !tour.some((t) => t.id === it.id))
  const full = [...tour, ...leftovers]

  const morning: ItineraryItem[] = []
  const afternoon: ItineraryItem[] = []
  const evening: ItineraryItem[] = []
  for (const it of full) {
    const slot = bestPeriodForItem(it)
    if (slot === 'evening') evening.push(it)
    else if (slot === 'morning') morning.push(it)
    else afternoon.push(it)
  }
  periodItems.morning = [...rest.morning, ...morning]
  periodItems.afternoon = [...rest.afternoon, ...afternoon]
  periodItems.evening = [...rest.evening, ...evening]
  periodItems.night = rest.night

  const hopsKm: number[] = []
  let prev = start
  for (const it of full) {
    const c = coordForItem(it)
    if (prev && c) hopsKm.push(Math.round(haversineKm(prev, c) * 10) / 10)
    prev = c ?? prev
  }
  return { names: full.map((it) => it.name), hopsKm }
}

export function tourSightsForDay(
  sights: ItineraryItem[],
  _start?: PinCoord | null,
  _opts?: {
    userOrderByPeriod?: Partial<Record<PeriodId, string[]>>
    periodSights?: Partial<Record<PeriodId, ItineraryItem[]>>
  },
): ItineraryItem[] {
  if (sights.length <= 1) return sights
  return orderSightsByContextAndProximity(sights, _start)
}
