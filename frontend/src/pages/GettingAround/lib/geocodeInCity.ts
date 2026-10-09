export type CityBounds = {
  west: number
  south: number
  east: number
  north: number
}

export type GeocodeHit = {
  lat: number
  lng: number
  displayName: string
}

export type GeocodeResult =
  | { ok: true; hit: GeocodeHit }
  | { ok: false; reason: 'outside-city' | 'not-found' | 'empty' }

type NominatimHit = {
  lat: string
  lon: string
  display_name?: string
}

const SESSION_CACHE = new Map<string, GeocodeResult>()
const MIN_GAP_MS = 1100

let queue: Promise<unknown> = Promise.resolve()
let lastRequestAt = 0

function cacheKey(query: string, cityLabel: string, bounds: CityBounds): string {
  return `${cityLabel}::${query.trim().toLowerCase()}::${bounds.west.toFixed(3)},${bounds.south.toFixed(3)}`
}

export function pointInCityBounds(
  lat: number,
  lng: number,
  bounds: CityBounds,
  padFrac = 0,
): boolean {
  const padLng = (bounds.east - bounds.west) * padFrac
  const padLat = (bounds.north - bounds.south) * padFrac
  return (
    lng >= bounds.west - padLng &&
    lng <= bounds.east + padLng &&
    lat >= bounds.south - padLat &&
    lat <= bounds.north + padLat
  )
}

export function outsideCityMessage(cityLabel: string): string {
  return `Check if this area is in ${cityLabel}`
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function nominatimSearch(url: string): Promise<NominatimHit[]> {
  const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastRequestAt))
  if (wait) await sleep(wait)
  lastRequestAt = Date.now()
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return []
  const data = (await res.json()) as NominatimHit[]
  return Array.isArray(data) ? data : []
}

function pickInBounds(hits: NominatimHit[], bounds: CityBounds): GeocodeHit | 'outside-city' | null {
  let sawAny = false
  for (const hit of hits) {
    const lat = Number(hit.lat)
    const lng = Number(hit.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    sawAny = true
    if (pointInCityBounds(lat, lng, bounds, 0.02)) {
      return {
        lat,
        lng,
        displayName: hit.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      }
    }
  }
  if (sawAny) return 'outside-city'
  return null
}

/**
 * Geocode a free-text place inside a city's mapped bounds (Nominatim).
 * Session-cached; requests are serialised at ~1/s.
 */
export async function geocodeInCity(
  query: string,
  cityLabel: string,
  bounds: CityBounds,
): Promise<GeocodeResult> {
  const trimmed = query.trim()
  if (!trimmed) return { ok: false, reason: 'empty' }

  const key = cacheKey(trimmed, cityLabel, bounds)
  const cached = SESSION_CACHE.get(key)
  if (cached) return cached

  const result = await enqueue(async (): Promise<GeocodeResult> => {
    const again = SESSION_CACHE.get(key)
    if (again) return again

    const q = encodeURIComponent(`${trimmed}, ${cityLabel}, Vietnam`)
    const viewbox = `${bounds.west},${bounds.north},${bounds.east},${bounds.south}`
    const base = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=vn&addressdetails=0&q=${q}`

    try {
      const boundedHits = await nominatimSearch(`${base}&viewbox=${viewbox}&bounded=1`)
      let picked = pickInBounds(boundedHits, bounds)

      if (picked === null) {
        const looseHits = await nominatimSearch(base)
        picked = pickInBounds(looseHits, bounds)
      }

      if (picked === 'outside-city') return { ok: false, reason: 'outside-city' }
      if (!picked) return { ok: false, reason: 'not-found' }
      return { ok: true, hit: picked }
    } catch {
      return { ok: false, reason: 'not-found' }
    }
  })

  SESSION_CACHE.set(key, result)
  return result
}

function inVietnam(lat: number, lng: number) {
  return lat >= 8.2 && lat <= 23.5 && lng >= 102.1 && lng <= 109.7
}

/** Maps-style autocomplete: several Vietnam hits, no single-result cache. */
export async function searchVietnamPlaces(query: string, limit = 6): Promise<GeocodeHit[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=${limit}&countrycodes=vn&addressdetails=0&q=${encodeURIComponent(trimmed)}`
  try {
    const hits = await nominatimSearch(url)
    const seen = new Set<string>()
    const out: GeocodeHit[] = []
    for (const hit of hits) {
      const lat = Number(hit.lat)
      const lng = Number(hit.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !inVietnam(lat, lng)) continue
      const displayName = hit.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ lat, lng, displayName })
    }
    return out
  } catch {
    return []
  }
}

/** Parallel-friendly Photon lookup (no Nominatim 1 req/s queue). */
export async function geocodePhoton(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim()
  if (!trimmed) return { ok: false, reason: 'empty' }

  const key = `ph::${trimmed.toLowerCase()}`
  const cached = SESSION_CACHE.get(key)
  if (cached) return cached

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=8&lang=en`
    const res = await fetch(url)
    if (!res.ok) return { ok: false, reason: 'not-found' }
    const data = (await res.json()) as {
      features?: { geometry?: { coordinates?: number[] }; properties?: { name?: string } }[]
    }
    for (const f of data.features ?? []) {
      const coords = f.geometry?.coordinates
      if (!coords || coords.length < 2) continue
      const lng = Number(coords[0])
      const lat = Number(coords[1])
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
      if (!inVietnam(lat, lng)) continue
      const result: GeocodeResult = {
        ok: true,
        hit: {
          lat,
          lng,
          displayName: f.properties?.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        },
      }
      SESSION_CACHE.set(key, result)
      return result
    }
    const miss: GeocodeResult = { ok: false, reason: 'not-found' }
    SESSION_CACHE.set(key, miss)
    return miss
  } catch {
    return { ok: false, reason: 'not-found' }
  }
}

/** Nominatim with a full query string (address already includes city). */
export async function geocodeFreeText(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim()
  if (!trimmed) return { ok: false, reason: 'empty' }

  const key = `ft::${trimmed.toLowerCase()}`
  const cached = SESSION_CACHE.get(key)
  if (cached) return cached

  const result = await enqueue(async (): Promise<GeocodeResult> => {
    const again = SESSION_CACHE.get(key)
    if (again) return again
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=vn&addressdetails=0&q=${encodeURIComponent(trimmed)}`
    try {
      const hits = await nominatimSearch(url)
      for (const hit of hits) {
        const lat = Number(hit.lat)
        const lng = Number(hit.lon)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
        if (!inVietnam(lat, lng)) continue
        return {
          ok: true,
          hit: {
            lat,
            lng,
            displayName: hit.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          },
        }
      }
      return { ok: false, reason: 'not-found' }
    } catch {
      return { ok: false, reason: 'not-found' }
    }
  })

  SESSION_CACHE.set(key, result)
  return result
}

/**
 * Itinerary pins: one Nominatim lookup, keep the first Vietnam hit even when
 * it sits outside the city map frame (Mỹ Sơn from Hội An, Bái Đính from Ninh Bình).
 */
export async function geocodeItineraryPin(
  name: string,
  cityLabel: string,
  bounds?: CityBounds,
): Promise<GeocodeResult> {
  const trimmed = name.trim()
  if (!trimmed) return { ok: false, reason: 'empty' }

  const key = `itn::${cityLabel}::${trimmed.toLowerCase()}`
  const cached = SESSION_CACHE.get(key)
  if (cached) return cached

  const result = await enqueue(async (): Promise<GeocodeResult> => {
    const again = SESSION_CACHE.get(key)
    if (again) return again

    const q = encodeURIComponent(`${trimmed}, ${cityLabel}, Vietnam`)
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=vn&addressdetails=0&q=${q}`

    try {
      const hits = await nominatimSearch(url)
      if (bounds) {
        const inBounds = pickInBounds(hits, bounds)
        if (inBounds && inBounds !== 'outside-city') return { ok: true, hit: inBounds }
      }
      for (const hit of hits) {
        const lat = Number(hit.lat)
        const lng = Number(hit.lon)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
        return {
          ok: true,
          hit: {
            lat,
            lng,
            displayName: hit.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          },
        }
      }
      return { ok: false, reason: 'not-found' }
    } catch {
      return { ok: false, reason: 'not-found' }
    }
  })

  SESSION_CACHE.set(key, result)
  return result
}
