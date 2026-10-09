/** Shared Google Places photo lookup. Bytes are cached by the host (Vite or Cloudflare) for ≤30 days. */

export const PLACE_PHOTO_SLOTS = 10
export const PLACE_PHOTO_TTL_SEC = 30 * 24 * 60 * 60
export const PLACE_PHOTO_MAX_PX = 1200

export type PlaceIndexRow = {
  name: string
  city: string
  lat: number | null
  lng: number | null
  placeId?: string | null
  fallbacks?: string[]
}

export type PlacePhotoMeta = {
  placeId: string
  displayName: string
  googleMapsUri: string | null
  photoNames: string[]
  attributions: string[]
  fetchedAt: number
}

function fold(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function namesAlign(want: string, got: string) {
  const a = fold(want)
  const b = fold(got)
  if (!a || !b) return false
  if (a === b || b.includes(a) || a.includes(b)) return true
  const stop = new Set(['the', 'and', 'of', 'a', 'an', 'in', 'at', 'to', 'for', 'vietnam'])
  const toks = a.split(' ').filter((w) => w.length > 2 && !stop.has(w))
  if (!toks.length) return false
  const hits = toks.filter((w) => b.includes(w)).length
  return hits >= Math.min(2, toks.length)
}

export function googleApiKey(env: Record<string, string | undefined> = process.env) {
  return (env.GOOGLE_PLACES_API_KEY || env.VITE_GOOGLE_PLACES_API_KEY || '').trim()
}

export async function resolvePlaceMeta(
  row: PlaceIndexRow,
  key: string,
): Promise<PlacePhotoMeta | null> {
  const placeId = row.placeId || (await searchPlaceId(row, key))
  if (!placeId) return null
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=en`, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'id,displayName,googleMapsUri,photos',
    },
  })
  if (!res.ok) return null
  const json = (await res.json()) as {
    id?: string
    displayName?: { text?: string }
    googleMapsUri?: string
    photos?: Array<{
      name?: string
      authorAttributions?: Array<{ displayName?: string }>
    }>
  }
  const photos = json.photos ?? []
  const photoNames = photos.map((p) => p.name).filter((n): n is string => Boolean(n))
  const attributions = [
    ...new Set(
      photos.flatMap((p) => (p.authorAttributions ?? []).map((a) => a.displayName).filter(Boolean)),
    ),
  ] as string[]
  return {
    placeId: json.id || placeId,
    displayName: json.displayName?.text || row.name,
    googleMapsUri: json.googleMapsUri ?? null,
    photoNames,
    attributions,
    fetchedAt: Date.now(),
  }
}

async function searchPlaceId(row: PlaceIndexRow, key: string): Promise<string | null> {
  const body: Record<string, unknown> = {
    textQuery: `${row.name} ${row.city} Vietnam`,
    languageCode: 'en',
    maxResultCount: 5,
  }
  if (row.lat != null && row.lng != null) {
    body.locationBias = {
      circle: { center: { latitude: row.lat, longitude: row.lng }, radius: 800 },
    }
  }
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  const json = (await res.json()) as {
    places?: Array<{ id?: string; displayName?: { text?: string }; formattedAddress?: string }>
  }
  const places = json.places ?? []
  const hit =
    places.find((p) => namesAlign(row.name, p.displayName?.text ?? '')) ??
    places.find((p) => fold(p.formattedAddress ?? '').includes(fold(row.city))) ??
    places[0]
  return hit?.id ?? null
}

export async function fetchGooglePhotoBytes(photoName: string, key: string) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${PLACE_PHOTO_MAX_PX}&key=${encodeURIComponent(key)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) return null
  const bytes = new Uint8Array(await res.arrayBuffer())
  return { bytes, contentType }
}

export async function fetchFallbackBytes(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VietnamPlannerPlacePhotos/1.0' },
  })
  if (!res.ok) return null
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) return null
  return { bytes: new Uint8Array(await res.arrayBuffer()), contentType }
}

export function pickPhotoSource(meta: PlacePhotoMeta | null, row: PlaceIndexRow, index: number) {
  const google = meta?.photoNames ?? []
  if (index < google.length) return { kind: 'google' as const, photoName: google[index] }
  const fallbacks = row.fallbacks ?? []
  const extra = fallbacks[index - google.length] ?? fallbacks[index % Math.max(fallbacks.length, 1)]
  if (extra) return { kind: 'fallback' as const, url: extra }
  if (google.length) return { kind: 'google' as const, photoName: google[index % google.length] }
  return null
}
