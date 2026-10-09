import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
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
} from './server/googlePlacePhotos.ts'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const INDEX_PATH = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data', 'googlePlaceIndex.json')
const CACHE_DIR = path.join(ROOT, '.cache', 'place-photos')
const TTL_MS = PLACE_PHOTO_TTL_SEC * 1000

type Index = Record<string, PlaceIndexRow>
const inflight = new Map<string, Promise<PlacePhotoMeta | null>>()

function loadIndex(): Index {
  if (!fs.existsSync(INDEX_PATH)) return {}
  return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as Index
}

function cachePath(name: string) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
  return path.join(CACHE_DIR, name)
}

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as T & { fetchedAt?: number }
    if (raw.fetchedAt && Date.now() - raw.fetchedAt > TTL_MS) return null
    return raw
  } catch {
    return null
  }
}

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, JSON.stringify(value))
}

async function metaFor(id: string, row: PlaceIndexRow, key: string) {
  const file = cachePath(`${id}.meta.json`)
  const cached = readJson<PlacePhotoMeta>(file)
  if (cached?.photoNames?.length) return cached
  const hit = inflight.get(id)
  if (hit) return hit
  const pending = resolvePlaceMeta(row, key).then((meta) => {
    if (meta) writeJson(file, meta)
    inflight.delete(id)
    return meta
  })
  inflight.set(id, pending)
  return pending
}

function send(res: ServerResponse, status: number, body: unknown, type = 'application/json') {
  res.statusCode = status
  res.setHeader('Content-Type', type)
  res.setHeader('Cache-Control', `public, max-age=${PLACE_PHOTO_TTL_SEC}`)
  res.end(typeof body === 'string' || body instanceof Uint8Array ? body : JSON.stringify(body))
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', 'http://local')
  const parts = url.pathname.replace(/^\/api\/place-photos\/?/, '').split('/').filter(Boolean)
  const id = decodeURIComponent(parts[0] || '')
  const indexRaw = parts[1]
  const index = loadIndex()
  const row = index[id]
  if (!row) {
    send(res, 404, { error: 'unknown sight' })
    return
  }
  const key = googleApiKey()
  if (url.searchParams.get('meta') === '1' || indexRaw === 'meta') {
    const meta = key ? await metaFor(id, row, key) : null
    send(res, 200, {
      displayName: meta?.displayName ?? row.name,
      googleMapsUri: meta?.googleMapsUri ?? null,
      attributions: meta?.attributions ?? [],
      credit: 'Photos © Google / contributing photographers. Used with attribution.',
      googleCount: meta?.photoNames.length ?? 0,
      slots: PLACE_PHOTO_SLOTS,
    })
    return
  }
  const slot = Number(indexRaw)
  if (!Number.isInteger(slot) || slot < 0 || slot >= PLACE_PHOTO_SLOTS) {
    send(res, 400, { error: 'slot 0-9' })
    return
  }
  const imgFile = cachePath(`${id}.${slot}.bin`)
  const typeFile = cachePath(`${id}.${slot}.type`)
  if (fs.existsSync(imgFile) && fs.existsSync(typeFile)) {
    const age = Date.now() - fs.statSync(imgFile).mtimeMs
    if (age < TTL_MS) {
      res.statusCode = 200
      res.setHeader('Content-Type', fs.readFileSync(typeFile, 'utf8'))
      res.setHeader('Cache-Control', `public, max-age=${PLACE_PHOTO_TTL_SEC}`)
      res.end(fs.readFileSync(imgFile))
      return
    }
  }
  const meta = key ? await metaFor(id, row, key) : null
  const source = pickPhotoSource(meta, row, slot)
  let packed: { bytes: Uint8Array; contentType: string } | null = null
  if (source?.kind === 'google' && key) packed = await fetchGooglePhotoBytes(source.photoName, key)
  if (!packed && source?.kind === 'fallback') packed = await fetchFallbackBytes(source.url)
  if (!packed && (row.fallbacks?.[0] || row.fallbacks?.[slot])) {
    packed = await fetchFallbackBytes(row.fallbacks[slot] ?? row.fallbacks[0]!)
  }
  if (!packed) {
    send(res, 404, { error: 'no photo' })
    return
  }
  fs.writeFileSync(imgFile, packed.bytes)
  fs.writeFileSync(typeFile, packed.contentType)
  res.statusCode = 200
  res.setHeader('Content-Type', packed.contentType)
  res.setHeader('Cache-Control', `public, max-age=${PLACE_PHOTO_TTL_SEC}`)
  res.end(Buffer.from(packed.bytes))
}

export function placePhotosPlugin(): Plugin {
  return {
    name: 'place-photos',
    configureServer(server) {
      server.middlewares.use('/api/place-photos', (req, res) => {
        void handle(req, res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/place-photos', (req, res) => {
        void handle(req, res)
      })
    },
  }
}
