import { PLACES, getPlace } from '../../../GettingAround/data/places'
import type { PlaceId } from '../../../GettingAround/data/types'
import { mapLabelToPlaceId } from '../../../GettingAround/lib/tripBagPlaces'
import { CITY_ACTIVITIES } from '../../data/activities'
import { EXPERIENCES } from '../../data/experiences'

export type CityPin = {
  placeId: PlaceId
  label: string
  lat: number
  lng: number
  activityCount: number
}

/** Transport-leg region strings used in PlanBuilder `TRANSPORT_LEGS`. */
const PLACE_LEG_REGION: Partial<Record<PlaceId, string>> = {
  hanoi: 'Hanoi',
  'ninh-binh': 'Ninh Binh',
  'ha-long': 'Quang Ninh',
  sapa: 'Sapa',
  'ha-giang': 'Ha Giang',
  'phong-nha': 'Phong Nha',
  hue: 'Hue',
  'da-nang': 'Da Nang',
  'hoi-an': 'Hoi An',
  'nha-trang': 'Nha Trang',
  dalat: 'Da Lat',
  hcmc: 'Ho Chi Minh City',
  mekong: 'Mekong',
  'can-tho': 'Mekong',
  'phu-quoc': 'Phu Quoc',
}

export function resolvePlaceId(city?: string, region?: string): PlaceId | null {
  if (city) {
    const fromCity = mapLabelToPlaceId(city)
    if (fromCity) return fromCity
    const folded = fold(city)
    const byLabel = PLACES.find((p) => fold(p.label) === folded)
    if (byLabel) return byLabel.id
  }
  if (region) return mapLabelToPlaceId(region)
  return null
}

export function placeLabel(placeId: PlaceId): string {
  return getPlace(placeId)?.label ?? placeId
}

/** Catalog `Experience.city` for the ranked city experiences page. */
export const EXPERIENCE_CITY_BY_PLACE: Partial<Record<PlaceId, string>> = {
  hanoi: 'Hanoi',
  'ha-long': 'Ha Long',
  'ninh-binh': 'Ninh Binh',
  sapa: 'Sapa',
  hue: 'Hue',
  'da-nang': 'Da Nang',
  'hoi-an': 'Hoi An',
  hcmc: 'Ho Chi Minh City',
  'ha-giang': 'Ha Giang',
  'phong-nha': 'Phong Nha',
  'nha-trang': 'Nha Trang',
  dalat: 'Da Lat',
  'phu-quoc': 'Phu Quoc',
}

export function experienceCityForPlace(placeId: PlaceId, fallback?: string): string {
  return EXPERIENCE_CITY_BY_PLACE[placeId] ?? fallback ?? placeLabel(placeId)
}

export function placeCoords(placeId: PlaceId): { lat: number; lng: number } | null {
  const p = getPlace(placeId)
  if (!p) return null
  return { lat: p.lat, lng: p.lng }
}

export function placeLegRegion(placeId: PlaceId, fallback?: string): string {
  return PLACE_LEG_REGION[placeId] ?? fallback ?? placeLabel(placeId)
}

export function northToSouth(placeIds: PlaceId[]): PlaceId[] {
  return [...placeIds].sort((a, b) => {
    const ca = placeCoords(a)
    const cb = placeCoords(b)
    if (!ca && !cb) return 0
    if (!ca) return 1
    if (!cb) return -1
    return cb.lat - ca.lat
  })
}

export function buildCityPins(
  experienceIds: string[],
  activityIds: string[],
): CityPin[] {
  const counts = new Map<PlaceId, number>()
  const selectedExp = new Set(experienceIds)
  const selectedAct = new Set(activityIds)

  for (const exp of EXPERIENCES) {
    if (!selectedExp.has(exp.id)) continue
    const id = resolvePlaceId(exp.city, exp.region)
    if (!id) continue
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  for (const act of CITY_ACTIVITIES) {
    if (!selectedAct.has(act.id)) continue
    const id = resolvePlaceId(act.cityName, act.cityId)
    if (!id) continue
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  const pins: CityPin[] = []
  for (const [placeId, activityCount] of counts) {
    const coords = placeCoords(placeId)
    if (!coords || activityCount <= 0) continue
    pins.push({
      placeId,
      label: placeLabel(placeId),
      lat: coords.lat,
      lng: coords.lng,
      activityCount,
    })
  }
  return northToSouth(pins.map((p) => p.placeId))
    .map((id) => pins.find((p) => p.placeId === id)!)
    .filter(Boolean)
}

function fold(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
