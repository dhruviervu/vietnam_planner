import type { PlaceId } from '../data/types'
import type { CityBounds } from '../lib/geocodeInCity'
import { MAP_META } from './mapMeta'

export function derivedCityBounds(lat: number, lng: number, mapZoom = 12): CityBounds {
  const span = mapZoom <= 10 ? 0.28 : mapZoom <= 11 ? 0.18 : 0.12
  return {
    west: lng - span,
    south: lat - span,
    east: lng + span,
    north: lat + span,
  }
}

export function boundsForCity(
  cityId: PlaceId | string,
  center?: { lat: number; lng: number; mapZoom?: number } | null,
): CityBounds | null {
  const meta = MAP_META.cities[cityId]?.bounds
  if (meta) return meta
  if (center) return derivedCityBounds(center.lat, center.lng, center.mapZoom)
  return null
}

export function leafletBoundsFromCity(
  cityId: PlaceId | string,
  center: { lat: number; lng: number; mapZoom?: number },
): [[number, number], [number, number]] {
  const b = boundsForCity(cityId, center) ?? derivedCityBounds(center.lat, center.lng, center.mapZoom)
  const latPad = (b.north - b.south) * 0.06
  const lngPad = (b.east - b.west) * 0.06
  return [
    [b.south - latPad, b.west - lngPad],
    [b.north + latPad, b.east + lngPad],
  ]
}
