import {
  PLACE_PHOTO_SLOTS,
  PLACE_PHOTO_TTL_SEC,
  fetchFallbackBytes,
  fetchGooglePhotoBytes,
  googleApiKey,
  pickPhotoSource,
  resolvePlaceMeta,
  type PlaceIndexRow,
  type PlacePhotoMeta,
} from '../../../server/googlePlacePhotos'
import indexJson from '../../../src/pages/PlanBuilder/data/googlePlaceIndex.json'

type Env = { GOOGLE_PLACES_API_KEY?: string; VITE_GOOGLE_PLACES_API_KEY?: string }
type Ctx = { request: Request; env: Env; waitUntil: (p: Promise<unknown>) => void }

const INDEX = indexJson as Record<string, PlaceIndexRow>
const inflight = new Map<string, Promise<PlacePhotoMeta | null>>()

function json(status: number, body: unknown, ttl = 300) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${ttl}`,
    },
  })
}

async function metaFor(id: string, row: PlaceIndexRow, key: string, cache: Cache, origin: string) {
  const cacheUrl = new Request(`${origin}/__place-meta/${id}`)
  const hit = await cache.match(cacheUrl)
  if (hit) {
    try {
      return (await hit.json()) as PlacePhotoMeta
    } catch {
      /* miss */
    }
  }
  const pending =
    inflight.get(id) ??
    resolvePlaceMeta(row, key).then(async (meta) => {
      inflight.delete(id)
      if (meta) {
        await cache.put(
          cacheUrl,
          new Response(JSON.stringify(meta), {
            headers: { 'Cache-Control': `public, max-age=${PLACE_PHOTO_TTL_SEC}` },
          }),
        )
      }
      return meta
    })
  inflight.set(id, pending)
  return pending
}

export async function onRequest(ctx: Ctx) {
  const url = new URL(ctx.request.url)
  const parts = url.pathname.replace(/^\/api\/place-photos\/?/, '').split('/').filter(Boolean)
  const id = decodeURIComponent(parts[0] || '')
  const row = INDEX[id]
  if (!row) return json(404, { error: 'unknown sight' })
  const key = googleApiKey(ctx.env)
  const cache = caches.default

  if (url.searchParams.get('meta') === '1' || parts[1] === 'meta') {
    const meta = key ? await metaFor(id, row, key, cache, url.origin) : null
    return json(200, {
      displayName: meta?.displayName ?? row.name,
      googleMapsUri: meta?.googleMapsUri ?? null,
      attributions: meta?.attributions ?? [],
      credit: 'Photos © Google / contributing photographers. Used with attribution.',
      googleCount: meta?.photoNames.length ?? 0,
      slots: PLACE_PHOTO_SLOTS,
    })
  }

  const slot = Number(parts[1])
  if (!Number.isInteger(slot) || slot < 0 || slot >= PLACE_PHOTO_SLOTS) {
    return json(400, { error: 'slot 0-9' })
  }

  const cacheKey = new Request(`${url.origin}/__place-photo/${id}/${slot}`)
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const meta = key ? await metaFor(id, row, key, cache, url.origin) : null
  const source = pickPhotoSource(meta, row, slot)
  let packed: { bytes: Uint8Array; contentType: string } | null = null
  if (source?.kind === 'google' && key) packed = await fetchGooglePhotoBytes(source.photoName, key)
  if (!packed && source?.kind === 'fallback') packed = await fetchFallbackBytes(source.url)
  if (!packed && row.fallbacks?.[0]) packed = await fetchFallbackBytes(row.fallbacks[slot] ?? row.fallbacks[0])
  if (!packed) return json(404, { error: 'no photo' })

  const res = new Response(packed.bytes, {
    headers: {
      'Content-Type': packed.contentType,
      'Cache-Control': `public, max-age=${PLACE_PHOTO_TTL_SEC}`,
    },
  })
  ctx.waitUntil(cache.put(cacheKey, res.clone()))
  return res
}
