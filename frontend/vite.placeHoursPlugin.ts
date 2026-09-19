import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

type PlaceIn = {
  sourceId: string
  name: string
  city: string
  lat?: number
  lng?: number
}

type Interval = { open: number; close: number }

type PlaceOut = {
  sourceId: string
  raw?: string
  source: 'google' | 'osm'
  alwaysOpen?: boolean
  weekdayIntervals?: Record<number, Interval[]>
  closedWeekdays?: number[]
}

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

type OverpassEl = {
  tags?: Record<string, string>
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
}

const NAME_STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'vietnam', 'vietnamese', 'hanoi', 'saigon', 'hue',
  'tour', 'visit', 'street', 'city', 'town', 'village', 'island', 'beach', 'park',
])

function significantTokens(s: string) {
  return normalizeName(s)
    .split(' ')
    .filter((w) => w.length > 3 && !NAME_STOP.has(w))
}

function namesAlign(placeName: string, candidate: string) {
  const want = normalizeName(placeName)
  const got = normalizeName(candidate)
  if (!got || !want) return false
  if (got === want) return true
  const wantTokens = significantTokens(placeName)
  const gotTokens = significantTokens(candidate)
  if (wantTokens.length === 0 || gotTokens.length === 0) return false
  const hits = wantTokens.filter((w) => gotTokens.includes(w) || got.includes(w)).length
  return hits >= Math.min(2, wantTokens.length)
}

function matchOverpass(place: PlaceIn, els: OverpassEl[]): string | null {
  const want = normalizeName(place.name)
  let best: { hours: string; score: number } | null = null
  for (const el of els) {
    const hours = el.tags?.opening_hours
    if (!hours) continue
    const lat = el.lat ?? el.center?.lat
    const lng = el.lon ?? el.center?.lon
    const names = [el.tags?.name, el.tags?.['name:en'], el.tags?.['name:vi']].filter(Boolean) as string[]
    const nameHit = names.some((n) => namesAlign(place.name, n) || normalizeName(n) === want)
    if (!nameHit) continue
    let dist = 0.4
    if (place.lat != null && place.lng != null && lat != null && lng != null) {
      const dLat = ((lat - place.lat) * Math.PI) / 180
      const dLng = ((lng - place.lng) * Math.PI) / 180
      const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((place.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
      dist = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)))
    }
    const score = 10 - dist
    if (!best || score > best.score) best = { hours, score }
  }
  return best?.hours ?? null
}

async function overpassAll(places: PlaceIn[]): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  const withPin = places.filter((p) => p.lat != null && p.lng != null)
  if (withPin.length === 0) return out
  const q =
    `[out:json][timeout:18];(\n` +
    withPin.map((p) => `nwr(around:420,${p.lat},${p.lng})["opening_hours"];`).join('\n') +
    `\n);out tags center;`
  let elements: OverpassEl[] = []
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'vietnam-planner/1.0 (itinerary opening hours)',
        },
        body: `data=${encodeURIComponent(q)}`,
      })
      if (!res.ok) continue
      const data = (await res.json()) as { elements?: OverpassEl[] }
      if (data.elements?.length) {
        elements = data.elements
        break
      }
    } catch {
      /* next */
    }
  }
  for (const place of withPin) {
    const hours = matchOverpass(place, elements)
    if (hours) out.set(place.sourceId, hours)
  }
  return out
}

type GooglePeriod = {
  open?: { day?: number; hour?: number; minute?: number }
  close?: { day?: number; hour?: number; minute?: number }
}

function googleToIntervals(periods: GooglePeriod[] | undefined): {
  weekdayIntervals: Record<number, Interval[]>
  alwaysOpen?: boolean
  closedWeekdays: number[]
} {
  const weekdayIntervals: Record<number, Interval[]> = {}
  const seen = new Set<number>()
  for (const p of periods ?? []) {
    if (p.open?.day == null || p.open.hour == null) continue
    const day = p.open.day
    seen.add(day)
    if (!p.close) {
      return { weekdayIntervals: {}, alwaysOpen: true, closedWeekdays: [] }
    }
    const open = p.open.hour + (p.open.minute ?? 0) / 60
    let close = (p.close.hour ?? 0) + (p.close.minute ?? 0) / 60
    if (p.close.day != null && p.close.day !== day) close += 24
    if (close <= open) close += 24
    ;(weekdayIntervals[day] ??= []).push({ open, close })
  }
  const closedWeekdays: number[] = []
  if (periods?.length) {
    for (let d = 0; d < 7; d++) if (!seen.has(d)) closedWeekdays.push(d)
  }
  return { weekdayIntervals, closedWeekdays }
}

async function googleHours(place: PlaceIn): Promise<PlaceOut | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY
  if (!key) return null
  const body: Record<string, unknown> = {
    textQuery: `${place.name} ${place.city} Vietnam`,
    languageCode: 'en',
    maxResultCount: 3,
  }
  if (place.lat != null && place.lng != null) {
    body.locationBias = {
      circle: { center: { latitude: place.lat, longitude: place.lng }, radius: 900 },
    }
  }
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.displayName,places.regularOpeningHours,places.currentOpeningHours',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      places?: Array<{
        displayName?: { text?: string }
        regularOpeningHours?: { periods?: GooglePeriod[]; weekdayDescriptions?: string[] }
        currentOpeningHours?: { periods?: GooglePeriod[] }
      }>
    }
    const ranked = [...(json.places ?? [])].sort((a, b) => {
      const as = namesAlign(place.name, a.displayName?.text ?? '') ? 1 : 0
      const bs = namesAlign(place.name, b.displayName?.text ?? '') ? 1 : 0
      return bs - as
    })
    const hit = ranked.find((p) => namesAlign(place.name, p.displayName?.text ?? '')) ?? null
    if (!hit) return null
    const hours = hit?.regularOpeningHours ?? hit?.currentOpeningHours
    if (!hours) return null
    const parsed = googleToIntervals(hours.periods)
    return {
      sourceId: place.sourceId,
      source: 'google',
      raw: (hit?.regularOpeningHours?.weekdayDescriptions ?? []).join('; ') || 'Google hours',
      alwaysOpen: parsed.alwaysOpen,
      weekdayIntervals: parsed.weekdayIntervals,
      closedWeekdays: parsed.closedWeekdays,
    }
  } catch {
    return null
  }
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method !== 'POST') {
    json(res, 405, { error: 'POST only' })
    return
  }
  try {
    const parsed = JSON.parse(await readBody(req)) as { places?: PlaceIn[] }
    const places = (parsed.places ?? []).filter((p) => p.sourceId && p.name)
    const out: PlaceOut[] = []
    const hasGoogle = Boolean(process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY)
    if (hasGoogle) {
      const rows = await Promise.all(places.map((p) => googleHours(p)))
      for (const row of rows) if (row) out.push(row)
    }
    const missing = places.filter((p) => !out.some((r) => r.sourceId === p.sourceId))
    if (missing.length) {
      const osm = await overpassAll(missing)
      for (const [sourceId, raw] of osm) {
        out.push({ sourceId, raw, source: 'osm' })
      }
    }
    json(res, 200, { places: out })
  } catch {
    json(res, 500, { places: [] })
  }
}

export function placeHoursPlugin(): Plugin {
  return {
    name: 'place-hours',
    configureServer(server) {
      server.middlewares.use('/api/place-hours', (req, res) => {
        void handle(req, res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/place-hours', (req, res) => {
        void handle(req, res)
      })
    },
  }
}
