import type { PlaceId } from '../../../GettingAround/data/types'
import {
  geocodeFreeText,
  geocodeItineraryPin,
  geocodePhoton,
  type CityBounds,
} from '../../../GettingAround/lib/geocodeInCity'
import { pointsForCity } from '../../../GettingAround/data/urbanPoints'
import { MAP_META } from '../../../GettingAround/maps/mapMeta'
import { HOTELS } from '../../data/hotels'
import { SHOPPING_ITEMS } from '../../data/shopping'
import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { RESTAURANTS as TASTE_RESTAURANTS } from '../../../TasteOfVietnam/data/restaurants'
import { placeCoords, resolvePlaceId } from './cityPins'
import {
  CITY_MARKET_PIN,
  NEIGHBORHOOD_PIN,
  PIN_BY_NAME,
  PIN_BY_SOURCE_ID,
  STREET_PIN,
  type PinCoord,
} from './itineraryPinCatalog'
import type { ItemKind } from './types'

export type DayMapStop = {
  id: string
  name: string
  kind: ItemKind
  query: string
  placeId?: PlaceId
  sourceId?: string
  locationHint?: string
}

export type PinSource = 'catalog' | 'landmark' | 'geocode' | 'street'

export type ResolvedDayPin = DayMapStop & {
  lat: number
  lng: number
  /** 1-based agenda number; 0 = stay/check-in (hotel marker, not on the agenda). */
  n: number
  source: PinSource
}

const AGENDA_PIN_KINDS = new Set<ItemKind>(['experience', 'activity', 'meal', 'shopping'])

export function isAgendaPinKind(kind: ItemKind) {
  return AGENDA_PIN_KINDS.has(kind)
}

/** Agenda-matching pin numbers (stay/check-in omitted so numbers do not skip). */
export function agendaPinNumbers(stops: DayMapStop[]): Record<string, number> {
  const out: Record<string, number> = {}
  let n = 0
  for (const s of stops) {
    if (isAgendaPinKind(s.kind)) out[s.id] = ++n
  }
  return out
}

function pinN(stop: DayMapStop, numbers: Record<string, number>) {
  return numbers[stop.id] ?? 0
}

function byAgendaNumber(a: ResolvedDayPin, b: ResolvedDayPin) {
  const an = a.n === 0 ? 1000 : a.n
  const bn = b.n === 0 ? 1000 : b.n
  return an - bn
}

const GENERIC_LANDMARK = new Set([
  'city centre',
  'town centre',
  'city center',
  'centre market',
  'beach promenade',
  'district 1',
  'district 3',
])

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function kmBetween(a: PinCoord, b: PinCoord) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)))
}

function maxKmForKind(kind: ItemKind) {
  if (kind === 'experience' || kind === 'activity') return 90
  return 28
}

function inCityRange(lat: number, lng: number, placeId: PlaceId | undefined, kind: ItemKind) {
  if (!placeId) return true
  const c = placeCoords(placeId)
  if (!c) return true
  return kmBetween(c, { lat, lng }) <= maxKmForKind(kind)
}

function catalogPlaceId(city?: string, region?: string): PlaceId | null {
  return resolvePlaceId(city, region) ?? resolvePlaceId(region, city)
}

/** Exact catalog pin only — never a name substring, which can mark the wrong place. */
function exactCatalogCoord(stop: DayMapStop): PinCoord | null {
  if (stop.sourceId && PIN_BY_SOURCE_ID[stop.sourceId]) return PIN_BY_SOURCE_ID[stop.sourceId]
  const n = normalize(stop.name)
  return PIN_BY_NAME[n] ?? null
}

function catalogCoord(stop: DayMapStop): PinCoord | null {
  const exact = exactCatalogCoord(stop)
  if (exact) return exact
  const n = normalize(stop.name)
  if (n.length >= 10) {
    for (const [label, coord] of Object.entries(PIN_BY_NAME)) {
      if (label.length >= 10 && n.includes(label)) return coord
    }
  }
  return null
}

/** Bag experiences/activities that belong to this city — nothing else. */
export function bagMapStopsForCity(
  experienceIds: string[],
  activityIds: string[],
  placeId: PlaceId | undefined,
  cityLabel: string,
): DayMapStop[] {
  const expSet = new Set(experienceIds)
  const actSet = new Set(activityIds)
  const stops: DayMapStop[] = []
  for (const e of EXPERIENCES) {
    if (!expSet.has(e.id)) continue
    const pid = catalogPlaceId(e.city, e.region)
    if (placeId) {
      if (!pid || pid !== placeId) continue
    } else if (
      normalize(e.city) !== normalize(cityLabel) &&
      normalize(e.region) !== normalize(cityLabel)
    ) {
      continue
    }
    stops.push({
      id: `exp:${e.id}`,
      name: e.name,
      kind: 'experience',
      query: `${e.name}, ${e.city}, Vietnam`,
      placeId: pid ?? placeId,
      sourceId: e.id,
    })
  }
  for (const a of CITY_ACTIVITIES) {
    if (!actSet.has(a.id)) continue
    const pid = catalogPlaceId(a.cityName, a.cityId)
    if (placeId) {
      if (!pid || pid !== placeId) continue
    } else if (
      normalize(a.cityName) !== normalize(cityLabel) &&
      normalize(a.cityId) !== normalize(cityLabel)
    ) {
      continue
    }
    stops.push({
      id: `act:${a.id}`,
      name: a.name,
      kind: 'activity',
      query: `${a.name}, ${a.cityName}, Vietnam`,
      placeId: pid ?? placeId,
      sourceId: a.id,
    })
  }
  return stops
}

function matchLandmark(name: string, cityId: PlaceId) {
  const n = normalize(name)
  if (n.length < 6) return null
  let best = null as ReturnType<typeof pointsForCity>[number] | null
  let bestLen = 0
  for (const p of pointsForCity(cityId)) {
    const pl = normalize(p.label)
    if (pl.length < 7) continue
    if (GENERIC_LANDMARK.has(pl)) continue
    if (p.type === 'District') continue
    if (n.includes(pl) && pl.length > bestLen) {
      best = p
      bestLen = pl.length
    }
  }
  return best
}

function matchTaste(name: string, cityLabel: string) {
  const n = normalize(name)
  const c = normalize(cityLabel)
  const exact = TASTE_RESTAURANTS.find((r) => normalize(r.name) === n && normalize(r.city) === c)
  if (exact) return exact
  return TASTE_RESTAURANTS.find((r) => normalize(r.name) === n) ?? null
}

function streetCoord(address: string, cityLabel: string): PinCoord | null {
  const full = normalize(`${address} ${cityLabel}`)
  if (STREET_PIN[full]) return STREET_PIN[full]
  const street = normalize(address).replace(/^\d+\w*\s/, '')
  const streetCity = normalize(`${street} ${cityLabel}`)
  if (STREET_PIN[streetCity]) return STREET_PIN[streetCity]
  for (const [key, coord] of Object.entries(STREET_PIN)) {
    if (full.includes(key) || streetCity.includes(key)) return coord
  }
  return null
}

function neighborhoodCoord(hint?: string): PinCoord | null {
  if (!hint) return null
  const n = normalize(hint)
  if (NEIGHBORHOOD_PIN[n]) return NEIGHBORHOOD_PIN[n]
  for (const [key, coord] of Object.entries(NEIGHBORHOOD_PIN)) {
    if (n.includes(key) && key.length >= 6) return coord
  }
  return null
}

function uniqueQueries(list: (string | undefined | null)[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const q of list) {
    const t = q?.trim()
    if (!t) continue
    const k = t.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out
}

function queriesForStop(stop: DayMapStop, cityLabel: string): string[] {
  const taste = matchTaste(stop.name, cityLabel)
  const hotel = stop.sourceId ? HOTELS.find((h) => h.id === stop.sourceId) : undefined
  const shop = stop.sourceId ? SHOPPING_ITEMS.find((s) => s.id === stop.sourceId) : undefined
  return uniqueQueries([
    taste ? `${taste.name}, ${taste.address}, ${taste.city}, Vietnam` : null,
    taste?.address ? `${taste.address}, ${taste.city}, Vietnam` : null,
    hotel?.mapsQuery ? `${hotel.mapsQuery}, Vietnam` : null,
    shop?.shop ? `${shop.shop}, ${shop.city}, Vietnam` : null,
    stop.query,
    `${stop.name}, ${cityLabel}, Vietnam`,
    `${stop.name}, Vietnam`,
  ])
}

async function geocodeQueries(
  queries: string[],
  cityLabel: string,
  placeId: PlaceId | undefined,
  kind: ItemKind,
  bounds?: CityBounds,
) {
  const accept = (lat: number, lng: number) => inCityRange(lat, lng, placeId, kind)
  for (const q of queries) {
    const photon = await geocodePhoton(q)
    if (photon.ok && accept(photon.hit.lat, photon.hit.lng)) return photon
  }
  for (const q of queries) {
    const free = await geocodeFreeText(q)
    if (free.ok && accept(free.hit.lat, free.hit.lng)) return free
  }
  if (queries[0]) {
    const pin = await geocodeItineraryPin(queries[0], cityLabel, bounds)
    if (pin.ok && accept(pin.hit.lat, pin.hit.lng)) return pin
  }
  return { ok: false as const, reason: 'not-found' as const }
}

function cityBounds(placeId?: PlaceId) {
  return placeId ? MAP_META.cities[placeId]?.bounds : undefined
}

function lastResort(
  stop: DayMapStop,
  cityLabel: string,
  placeId?: PlaceId,
): { coord: PinCoord; source: PinSource; via: string } | null {
  const taste = matchTaste(stop.name, cityLabel)
  if (taste) {
    const street = streetCoord(taste.address, taste.city)
    if (street) return { coord: street, source: 'street', via: 'taste-street' }
  }
  const hood = neighborhoodCoord(stop.locationHint)
  if (hood) return { coord: hood, source: 'street', via: 'neighborhood' }
  if (stop.kind === 'meal' && placeId && CITY_MARKET_PIN[placeId]) {
    return { coord: CITY_MARKET_PIN[placeId], source: 'street', via: 'city-market' }
  }
  if (placeId && CITY_MARKET_PIN[placeId] && (stop.kind === 'shopping' || stop.kind === 'meal')) {
    return { coord: CITY_MARKET_PIN[placeId], source: 'street', via: 'city-market' }
  }
  const city = placeId ? placeCoords(placeId) : null
  if (city) return { coord: city, source: 'street', via: 'city-center' }
  return null
}

export async function resolveDayMapPins(
  stops: DayMapStop[],
  cityLabel: string,
  placeId?: PlaceId,
  onPartial?: (pins: ResolvedDayPin[]) => void,
): Promise<ResolvedDayPin[]> {
  const list = stops ?? []
  const numbers = agendaPinNumbers(list)
  const bounds = cityBounds(placeId)
  const resolved: ResolvedDayPin[] = []
  const pending: { stop: DayMapStop; i: number }[] = []

  for (let i = 0; i < list.length; i++) {
    const stop = list[i]
    const n = pinN(stop, numbers)
    const cityId = stop.placeId ?? placeId
    const catalog = catalogCoord(stop)
    if (catalog) {
      resolved.push({ ...stop, lat: catalog.lat, lng: catalog.lng, n, source: 'catalog' })
      continue
    }
    if (stop.kind === 'meal') {
      const taste = matchTaste(stop.name, cityLabel)
      if (taste && !/^\d/.test(taste.address.trim())) {
        const street = streetCoord(taste.address, taste.city)
        if (street) {
          resolved.push({ ...stop, lat: street.lat, lng: street.lng, n, source: 'street' })
          continue
        }
      }
    }
    const hood = neighborhoodCoord(stop.locationHint)
    if (hood && (stop.kind === 'stay' || stop.kind === 'check-in')) {
      resolved.push({ ...stop, lat: hood.lat, lng: hood.lng, n, source: 'street' })
      continue
    }
    if (cityId) {
      const local = matchLandmark(stop.name, cityId)
      if (local) {
        resolved.push({ ...stop, lat: local.lat, lng: local.lng, n, source: 'landmark' })
        continue
      }
    }
    if (!stop.sourceId && stop.kind === 'meal' && placeId && CITY_MARKET_PIN[placeId]) {
      const m = CITY_MARKET_PIN[placeId]
      resolved.push({ ...stop, lat: m.lat, lng: m.lng, n, source: 'street' })
      continue
    }
    pending.push({ stop, i })
  }

  onPartial?.([...resolved].sort(byAgendaNumber))

  const geoPins = await Promise.all(
    pending.map(async ({ stop }) => {
      const queries = queriesForStop(stop, cityLabel)
      const geo = await geocodeQueries(queries, cityLabel, stop.placeId ?? placeId, stop.kind, bounds)
      if (geo.ok) {
        return {
          pin: { ...stop, lat: geo.hit.lat, lng: geo.hit.lng, n: pinN(stop, numbers), source: 'geocode' as const },
          failed: false as const,
          via: 'geocode',
          queries,
        }
      }
      const fb = lastResort(stop, cityLabel, stop.placeId ?? placeId)
      if (fb) {
        return {
          pin: { ...stop, lat: fb.coord.lat, lng: fb.coord.lng, n: pinN(stop, numbers), source: fb.source },
          failed: true as const,
          via: fb.via,
          queries,
        }
      }
      return { pin: null as ResolvedDayPin | null, failed: true as const, via: 'dropped', queries, stopName: stop.name }
    }),
  )

  for (const row of geoPins) {
    if (row.pin) {
      resolved.push(row.pin)
      onPartial?.([...resolved].sort(byAgendaNumber))
    }
  }

  const out = [...resolved].sort(byAgendaNumber)
  return out
}

/**
 * Pins for user-added sights only. Drops a stop rather than guessing city-centre
 * or a similarly named landmark.
 */
export async function resolveBagSightPins(
  stops: DayMapStop[],
  cityLabel: string,
  placeId?: PlaceId,
  onPartial?: (pins: ResolvedDayPin[]) => void,
): Promise<ResolvedDayPin[]> {
  const list = stops ?? []
  const bounds = cityBounds(placeId)
  const resolved: ResolvedDayPin[] = []
  const pending: DayMapStop[] = []

  for (const stop of list) {
    const catalog = exactCatalogCoord(stop)
    if (catalog && inCityRange(catalog.lat, catalog.lng, stop.placeId ?? placeId, stop.kind)) {
      resolved.push({ ...stop, lat: catalog.lat, lng: catalog.lng, n: 0, source: 'catalog' })
      continue
    }
    pending.push(stop)
  }

  onPartial?.([...resolved])

  const geoPins = await Promise.all(
    pending.map(async (stop) => {
      const queries = uniqueQueries([
        stop.query,
        `${stop.name}, ${cityLabel}, Vietnam`,
      ])
      const geo = await geocodeQueries(
        queries,
        cityLabel,
        stop.placeId ?? placeId,
        stop.kind,
        bounds,
      )
      if (!geo.ok) return null
      return {
        ...stop,
        lat: geo.hit.lat,
        lng: geo.hit.lng,
        n: 0,
        source: 'geocode' as const,
      }
    }),
  )

  for (const pin of geoPins) {
    if (!pin) continue
    resolved.push(pin)
    onPartial?.([...resolved])
  }
  return resolved
}
