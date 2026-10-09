import { useEffect, useState } from 'react'
import { haversineKm, type PinCoord } from './sightOrder'

export type TransportModeId = 'walking' | 'bicycle' | 'grab-bike' | 'grab-car' | 'bus'

/** When set, hops longer than `overKm` use `mode`. Shorter hops stay on auto (walk / bike). */
export type HopTransportRule = {
  overKm: number
  mode: TransportModeId
}

export type OsrmLeg = {
  km: number
  mins: number
  mode: TransportModeId
  label: string
}

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'
const OSRM_TABLE_URL = 'https://router.project-osrm.org/table/v1/driving'
const FETCH_MS = 7000
const TABLE_MS = 10000
const MISSING_MINS = 90
const cache = new Map<string, OsrmLeg>()
const tableCache = new Map<string, number[][]>()

type OsrmJson = {
  code?: string
  routes?: Array<{ distance?: number; duration?: number }>
}

type OsrmTableJson = {
  code?: string
  durations?: Array<Array<number | null>>
  distances?: Array<Array<number | null>>
}

const COORD_KEY = new WeakMap<PinCoord, string>()

function coordKey(p: PinCoord): string {
  let key = COORD_KEY.get(p)
  if (key === undefined) {
    key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`
    COORD_KEY.set(p, key)
  }
  return key
}

export function routeCacheKey(origin: PinCoord, destination: PinCoord): string {
  return `${coordKey(origin)}-${coordKey(destination)}`
}

export const TRANSIT_MODES: {
  mode: TransportModeId
  label: string
  kmh: number
}[] = [
  { mode: 'walking', label: 'Walk', kmh: 4.5 },
  { mode: 'bicycle', label: 'Bike', kmh: 14 },
  { mode: 'grab-bike', label: 'Motorbike', kmh: 22.5 },
  { mode: 'grab-car', label: 'Car / Taxi', kmh: 20 },
  { mode: 'bus', label: 'Bus', kmh: 16 },
]

export function transportMeta(mode: TransportModeId) {
  return TRANSIT_MODES.find((row) => row.mode === mode) ?? TRANSIT_MODES[0]
}

export function recommendTransport(km: number): {
  mode: TransportModeId
  label: string
  kmh: number
} {
  if (km < 2) return transportMeta('walking')
  return transportMeta('grab-bike')
}

function roundKm(km: number): number {
  return Math.round(Math.max(0, km) * 10) / 10
}

export function legFromKm(km: number, mode?: TransportModeId): OsrmLeg {
  const distance = roundKm(km)
  const rec = mode ? transportMeta(mode) : recommendTransport(distance)
  const mins = Math.max(1, Math.round((distance / rec.kmh) * 60))
  return { km: distance, mins, mode: rec.mode, label: rec.label }
}

export function applyTransportMode(leg: OsrmLeg, mode: TransportModeId): OsrmLeg {
  return legFromKm(leg.km, mode)
}

export function applyHopTransportRule(
  leg: OsrmLeg,
  rule: HopTransportRule | null | undefined,
  override?: TransportModeId,
): OsrmLeg {
  if (override) return applyTransportMode(leg, override)
  if (rule && Number.isFinite(rule.overKm) && leg.km > rule.overKm) {
    return applyTransportMode(leg, rule.mode)
  }
  return leg
}

export function haversineRoadKm(origin: PinCoord, destination: PinCoord): number {
  return haversineKm(origin, destination) * 1.3
}

export function fallbackLeg(origin: PinCoord, destination: PinCoord): OsrmLeg {
  return legFromKm(haversineRoadKm(origin, destination))
}

export function peekRoute(origin: PinCoord, destination: PinCoord): OsrmLeg | null {
  return cache.get(routeCacheKey(origin, destination)) ?? null
}

/**
 * Road distance via public OSRM. Displayed transit time uses Vietnam urban
 * speeds from `recommendTransport`, not the raw OSRM duration.
 */
export async function getRoute(origin: PinCoord, destination: PinCoord): Promise<OsrmLeg> {
  const key = routeCacheKey(origin, destination)
  const hit = cache.get(key)
  if (hit) return hit

  const fallback = fallbackLeg(origin, destination)
  const url = `${OSRM_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), FETCH_MS)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`osrm ${res.status}`)
    const data = (await res.json()) as OsrmJson
    const route = data.routes?.[0]
    const meters = route?.distance
    const durationSec = route?.duration
    if (data.code !== 'Ok' || typeof meters !== 'number' || typeof durationSec !== 'number') {
      throw new Error('osrm empty')
    }
    const durationMin = Math.round(durationSec / 60)
    const leg = legFromKm(meters / 1000)
    if (!Number.isFinite(durationMin)) throw new Error('osrm duration')
    cache.set(key, leg)
    return leg
  } catch {
    cache.set(key, fallback)
    return fallback
  }
}

export function travelMinutesBetween(a: PinCoord | null, b: PinCoord | null): number {
  if (!a || !b) return MISSING_MINS
  if (a.lat === b.lat && a.lng === b.lng) return 0
  return peekRoute(a, b)?.mins ?? fallbackLeg(a, b).mins
}

/** Door-to-door hours for packing and clocks. Missing pins use 10 min, not the 90 min table penalty. */
export function hopHoursBetween(
  a: PinCoord | null,
  b: PinCoord | null,
  multiplier = 1,
): number {
  const scale = multiplier > 0 ? multiplier : 1
  if (!a || !b) return (10 / 60) * scale
  if (a.lat === b.lat && a.lng === b.lng) return 0
  return (travelMinutesBetween(a, b) / 60) * scale
}

/** Warm the OSRM table cache; returns a tick that bumps after the matrix arrives. */
export function usePrefetchDurationMatrix(coords: (PinCoord | null)[]): number {
  const known = coords.filter((c): c is PinCoord => Boolean(c))
  const [tick, setTick] = useState(0)
  const sig = known.map((c) => `${c.lat.toFixed(5)},${c.lng.toFixed(5)}`).join('|')

  useEffect(() => {
    if (known.length < 2) return
    let live = true
    void getDurationMatrix(known).then(() => {
      if (live) setTick((n) => n + 1)
    })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])

  return tick
}

/** Minutes from i → j using cached OSRM legs, else Haversine road estimate. */
export function durationMatrixSync(coords: (PinCoord | null)[]): number[][] {
  const n = coords.length
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      m[i][j] = travelMinutesBetween(coords[i], coords[j])
    }
  }
  return m
}

function tableKey(coords: PinCoord[]): string {
  return coords.map((c) => `${c.lat.toFixed(5)},${c.lng.toFixed(5)}`).join('|')
}

function seedPairCache(coords: PinCoord[], distances: Array<Array<number | null>>) {
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      if (i === j) continue
      const meters = distances[i]?.[j]
      if (typeof meters !== 'number' || !Number.isFinite(meters)) continue
      cache.set(routeCacheKey(coords[i], coords[j]), legFromKm(meters / 1000))
    }
  }
}

/**
 * All-pairs travel minutes via OSRM Table (road distance → walk / Grab time).
 * Falls back to the sync Haversine matrix when the table is unavailable.
 */
export async function getDurationMatrix(coords: PinCoord[]): Promise<number[][]> {
  const n = coords.length
  if (n === 0) return []
  if (n === 1) return [[0]]
  const key = tableKey(coords)
  const hit = tableCache.get(key)
  if (hit) return hit

  const fallback = durationMatrixSync(coords)
  if (n > 25) {
    tableCache.set(key, fallback)
    return fallback
  }

  const path = coords.map((c) => `${c.lng},${c.lat}`).join(';')
  const url = `${OSRM_TABLE_URL}/${path}?annotations=duration,distance`

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), TABLE_MS)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`osrm table ${res.status}`)
    const data = (await res.json()) as OsrmTableJson
    if (data.code !== 'Ok' || !data.distances?.length) throw new Error('osrm table empty')
    seedPairCache(coords, data.distances)
    const matrix = data.distances.map((row, i) =>
      row.map((meters, j) => {
        if (i === j) return 0
        if (typeof meters === 'number' && Number.isFinite(meters)) {
          return legFromKm(meters / 1000).mins
        }
        const sec = data.durations?.[i]?.[j]
        if (typeof sec === 'number' && Number.isFinite(sec)) {
          return Math.max(1, Math.round(sec / 60))
        }
        return fallback[i]?.[j] ?? MISSING_MINS
      }),
    )
    tableCache.set(key, matrix)
    return matrix
  } catch {
    return fallback
  }
}

export function useOsrmLegs(
  pairs: Array<{ key: string; from: PinCoord; to: PinCoord }>,
): Record<string, OsrmLeg> {
  const sig = pairs.map((p) => p.key).join('|')
  const [legs, setLegs] = useState<Record<string, OsrmLeg>>({})

  useEffect(() => {
    if (!pairs.length) {
      setLegs({})
      return
    }
    const immediate: Record<string, OsrmLeg> = {}
    for (const p of pairs) {
      immediate[p.key] = peekRoute(p.from, p.to) ?? fallbackLeg(p.from, p.to)
    }
    setLegs(immediate)
    let live = true
    void Promise.all(
      pairs.map(async (p) => {
        const leg = await getRoute(p.from, p.to)
        return [p.key, leg] as const
      }),
    ).then((rows) => {
      if (live) setLegs(Object.fromEntries(rows))
    })
    return () => {
      live = false
    }
    // Pair identity is the cache key signature; `pairs` is rebuilt each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])

  return legs
}
