import { haversineKm } from '../maps/project'

export type PlaceSuggestionSource = 'landmark' | 'bag' | 'search'

export type PlaceSuggestion = {
  id: string
  title: string
  subtitle: string
  lat: number
  lng: number
  source: PlaceSuggestionSource
  kind: string
  localId?: string
}

export type AutocompleteLocalPlace = {
  id: string
  label: string
  subtitle?: string
  lat: number
  lng: number
  source: 'landmark' | 'bag'
  popular?: boolean
}

type PhotonFeature = {
  geometry?: { coordinates?: number[] }
  properties?: {
    osm_id?: number
    osm_type?: string
    osm_key?: string
    osm_value?: string
    name?: string
    street?: string
    housenumber?: string
    city?: string
    state?: string
    country?: string
    district?: string
    locality?: string
    county?: string
    postcode?: string
  }
}

const SUGGEST_CACHE = new Map<string, PlaceSuggestion[]>()
const NEAR_KM = 0.08

export function normalizePlaceQuery(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function kindFromOsm(key?: string, value?: string): string {
  if (value === 'aerodrome' || key === 'aeroway') return 'Airport'
  if (value === 'station' || key === 'railway') return 'Station'
  if (key === 'highway') return 'Road'
  if (key === 'tourism' || key === 'historic' || value === 'attraction') return 'Landmark'
  if (key === 'shop') return 'Shop'
  if (key === 'place') return 'Area'
  if (key === 'amenity' || key === 'leisure') return 'Place'
  return 'Place'
}

export function formatPhotonFeature(feature: PhotonFeature): PlaceSuggestion | null {
  const coords = feature.geometry?.coordinates
  if (!coords || coords.length < 2) return null
  const lng = Number(coords[0])
  const lat = Number(coords[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const p = feature.properties ?? {}
  const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ').trim()
  const title = (p.name || streetLine || p.locality || p.city || '').trim()
  if (!title) return null

  const subtitleParts = [streetLine, p.district, p.locality, p.city, p.county, p.state]
    .map((part) => (part || '').trim())
    .filter((part) => part && normalizePlaceQuery(part) !== normalizePlaceQuery(title))
  const seen = new Set<string>()
  const subtitle = subtitleParts
    .filter((part) => {
      const key = normalizePlaceQuery(part)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join(', ')

  const osmId = p.osm_id != null ? `${p.osm_type || 'n'}-${p.osm_id}` : `${lat.toFixed(5)}-${lng.toFixed(5)}`

  return {
    id: `search-${osmId}`,
    title,
    subtitle: subtitle || p.country || '',
    lat,
    lng,
    source: 'search',
    kind: kindFromOsm(p.osm_key, p.osm_value),
  }
}

function localScore(query: string, place: AutocompleteLocalPlace): number {
  const q = normalizePlaceQuery(query)
  if (!q) return place.popular ? 20 : 8
  const label = normalizePlaceQuery(place.label)
  const sub = normalizePlaceQuery(place.subtitle || '')
  if (label === q) return 100
  if (label.startsWith(q)) return 80
  if (` ${label}`.includes(` ${q}`)) return 64
  if (label.includes(q)) return 52
  if (sub.startsWith(q)) return 40
  if (sub.includes(q)) return 28
  return -1
}

export function matchLocalPlaces(
  query: string,
  places: AutocompleteLocalPlace[],
  limit = 6,
): PlaceSuggestion[] {
  const ranked = places
    .map((place) => ({ place, score: localScore(query, place) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score || a.place.label.localeCompare(b.place.label))
    .slice(0, limit)

  return ranked.map(({ place }) => ({
    id: `${place.source}-${place.id}`,
    title: place.label,
    subtitle: place.subtitle || (place.source === 'bag' ? 'In your trip' : ''),
    lat: place.lat,
    lng: place.lng,
    source: place.source,
    kind: place.source === 'bag' ? 'Trip bag' : 'Landmark',
    localId: place.id,
  }))
}

export function suggestionScore(query: string, hit: PlaceSuggestion): number {
  const q = normalizePlaceQuery(query)
  if (!q) return hit.source === 'bag' ? 24 : hit.source === 'landmark' ? 18 : 10
  const title = normalizePlaceQuery(hit.title)
  const sub = normalizePlaceQuery(hit.subtitle)
  let score = 8
  if (title === q) score = 100
  else if (title.startsWith(q)) score = 88
  else if (` ${title}`.includes(` ${q}`)) score = 76
  else if (title.includes(q)) score = 68
  else if (sub === q || sub.startsWith(q)) score = 40
  else if (sub.includes(q)) score = 22
  if (hit.source === 'bag') score += 3
  return score
}

export function mergeSuggestions(
  local: PlaceSuggestion[],
  remote: PlaceSuggestion[],
  query = '',
  limit = 8,
): PlaceSuggestion[] {
  const out: PlaceSuggestion[] = [...local]
  for (const hit of remote) {
    const duplicate = out.some(
      (existing) =>
        haversineKm(existing, hit) < NEAR_KM ||
        (normalizePlaceQuery(existing.title) === normalizePlaceQuery(hit.title) &&
          haversineKm(existing, hit) < 1.2),
    )
    if (duplicate) continue
    out.push(hit)
  }
  return out
    .sort(
      (a, b) =>
        suggestionScore(query, b) - suggestionScore(query, a) || a.title.localeCompare(b.title),
    )
    .slice(0, limit)
}

function cacheKey(query: string, lat: number, lng: number): string {
  return `${query.trim().toLowerCase()}::${lat.toFixed(2)}::${lng.toFixed(2)}`
}

async function photonSearch(
  query: string,
  bias: { lat: number; lng: number } | null,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    limit: '8',
    lang: 'en',
  })
  if (bias) {
    params.set('lat', String(bias.lat))
    params.set('lon', String(bias.lng))
    params.set('location_bias_scale', '0.3')
  }
  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, { signal })
  if (!res.ok) throw new Error(`photon ${res.status}`)
  const data = (await res.json()) as { features?: PhotonFeature[] }
  const out: PlaceSuggestion[] = []
  const seen = new Set<string>()
  for (const feature of data.features ?? []) {
    const hit = formatPhotonFeature(feature)
    if (!hit) continue
    const key = `${hit.lat.toFixed(4)},${hit.lng.toFixed(4)},${normalizePlaceQuery(hit.title)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(hit)
  }
  return out
}

export async function searchPlaceSuggestions(
  query: string,
  bias: { lat: number; lng: number; cityLabel: string },
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const key = cacheKey(trimmed, bias.lat, bias.lng)
  const cached = SUGGEST_CACHE.get(key)
  if (cached) return cached

  try {
    let hits = await photonSearch(trimmed, bias, signal)
    if (signal?.aborted) return []
    if (hits.length === 0) {
      const withCity = trimmed.toLowerCase().includes(bias.cityLabel.toLowerCase())
        ? `${trimmed}, Vietnam`
        : `${trimmed}, ${bias.cityLabel}, Vietnam`
      hits = await photonSearch(withCity, bias, signal)
    }
    if (signal?.aborted) return []
    SUGGEST_CACHE.set(key, hits)
    return hits
  } catch (err) {
    if (signal?.aborted) return []
    if (err instanceof DOMException && err.name === 'AbortError') return []
    throw err
  }
}
