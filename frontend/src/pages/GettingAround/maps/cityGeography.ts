import { geoContains } from 'd3-geo'
import type { PlaceId } from '../data/types'
import { haversineKm } from './project'
import { pointsForCity, type UrbanPoint } from '../data/urbanPoints'
import { CITY_GEOGRAPHY_INDEX } from './cityGeographyIndex'

export type GeoPolygon =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] }

export type CityDistrict = {
  id: string
  name: string
  nameLocal?: string
  adminLevel?: string
  geometry: GeoPolygon
}

export type NamedWater = {
  id: string
  name: string
  kind: string
  lat: number
  lng: number
}

export type CityGeography = {
  cityId: string
  cityLabel: string
  bounds: { west: number; south: number; east: number; north: number }
  sources: Record<string, string>
  boundary: GeoPolygon
  districts: CityDistrict[]
  namedWater: NamedWater[]
}

export type MapClickResolution =
  | {
      ok: true
      cityId: PlaceId
      cityLabel: string
      lat: number
      lng: number
      districtId: string | null
      districtName: string | null
      label: string
      areaLine: string
      nearPlace: { id: string; label: string; km: number } | null
      nearWater: { id: string; name: string; km: number } | null
      kind: 'landmark' | 'freeform'
      landmarkId: string | null
    }
  | {
      ok: false
      reason: 'outside-city' | 'no-geography'
      cityId: PlaceId
      cityLabel: string
      lat: number
      lng: number
    }

const cache = new Map<string, CityGeography | null>()

export function cityGeographyReady(cityId: PlaceId): boolean {
  return Boolean(CITY_GEOGRAPHY_INDEX[cityId as keyof typeof CITY_GEOGRAPHY_INDEX]?.ready)
}

export async function loadCityGeography(cityId: PlaceId): Promise<CityGeography | null> {
  if (cache.has(cityId)) return cache.get(cityId) ?? null
  const entry = CITY_GEOGRAPHY_INDEX[cityId as keyof typeof CITY_GEOGRAPHY_INDEX]
  if (!entry) {
    cache.set(cityId, null)
    return null
  }
  try {
    const res = await fetch(entry.file)
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as CityGeography
    cache.set(cityId, data)
    return data
  } catch {
    cache.set(cityId, null)
    return null
  }
}

function asFeature(geometry: GeoPolygon) {
  return { type: 'Feature' as const, properties: {}, geometry }
}

export function pointInGeometry(lng: number, lat: number, geometry: GeoPolygon): boolean {
  try {
    return geoContains(asFeature(geometry), [lng, lat])
  } catch {
    return false
  }
}

/** Supported urban extent = inset of fitted map bounds (same as SVG city extent). */
export function pointInSupportedCity(
  bounds: { west: number; south: number; east: number; north: number },
  lng: number,
  lat: number,
  inset = 0.045,
): boolean {
  const padLng = (bounds.east - bounds.west) * inset
  const padLat = (bounds.north - bounds.south) * inset
  return (
    lng >= bounds.west + padLng &&
    lng <= bounds.east - padLng &&
    lat >= bounds.south + padLat &&
    lat <= bounds.north - padLat
  )
}

function ringArea(geometry: GeoPolygon): number {
  const ring =
    geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0]?.[0]
  if (!ring?.length) return Infinity
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return Math.abs(area / 2)
}

export function findDistrict(
  geo: CityGeography,
  lng: number,
  lat: number,
): CityDistrict | null {
  const hits = geo.districts.filter((d) => pointInGeometry(lng, lat, d.geometry))
  if (!hits.length) return null
  // Smallest containing polygon = most local ward/district
  hits.sort((a, b) => ringArea(a.geometry) - ringArea(b.geometry))
  return hits[0]
}

export function resolveMapClick(
  geo: CityGeography | null,
  cityId: PlaceId,
  cityLabel: string,
  lat: number,
  lng: number,
  landmarkHitKm = 0.22,
): MapClickResolution {
  if (!geo) {
    // Without geography assets, only accept clicks clearly inside map bounds inset
    return {
      ok: false,
      reason: 'no-geography',
      cityId,
      cityLabel,
      lat,
      lng,
    }
  }

  const inside = pointInSupportedCity(geo.bounds, lng, lat)
  if (!inside) {
    return {
      ok: false,
      reason: 'outside-city',
      cityId,
      cityLabel,
      lat,
      lng,
    }
  }

  const points = pointsForCity(cityId)
  const districtHits = geo.districts.filter((d) => pointInGeometry(lng, lat, d.geometry))
  districtHits.sort((a, b) => ringArea(a.geometry) - ringArea(b.geometry))
  // Only trust district PIP when the name is known in our curated place dataset
  const knownAreas = new Set(
    points.flatMap((p) =>
      [p.district, p.area, p.label].filter(Boolean).map((s) => s!.toLowerCase()),
    ),
  )
  const district =
    districtHits.find((d) => {
      const n = d.name.toLowerCase()
      return [...knownAreas].some((k) => k.includes(n) || n.includes(k))
    }) ?? null

  let nearest: UrbanPoint | null = null
  let bestKm = Infinity
  for (const p of points) {
    const km = haversineKm({ lat, lng }, p)
    if (km < bestKm) {
      bestKm = km
      nearest = p
    }
  }

  let nearWater: { id: string; name: string; km: number } | null = null
  for (const w of geo.namedWater) {
    const km = haversineKm({ lat, lng }, w)
    if (km <= 0.9 && (!nearWater || km < nearWater.km)) {
      nearWater = { id: w.id, name: w.name, km }
    }
  }

  // Exact landmark hit — use landmark coords/label
  if (nearest && bestKm <= landmarkHitKm) {
    return {
      ok: true,
      cityId,
      cityLabel,
      lat: nearest.lat,
      lng: nearest.lng,
      districtId: district?.id ?? null,
      districtName: district?.name ?? nearest.district ?? nearest.area ?? null,
      label: nearest.label,
      areaLine: cityLabel,
      nearPlace: null,
      nearWater,
      kind: 'landmark',
      landmarkId: nearest.id,
    }
  }

  const nearPlace =
    nearest && bestKm <= 1.8
      ? { id: nearest.id, label: nearest.label, km: bestKm }
      : null

  // Prefer verified district name from PIP whitelist
  if (district) {
    return {
      ok: true,
      cityId,
      cityLabel,
      lat,
      lng,
      districtId: district.id,
      districtName: district.name,
      label: `${district.name} area`,
      areaLine: cityLabel,
      nearPlace,
      nearWater,
      kind: 'freeform',
      landmarkId: null,
    }
  }

  // Fall back to curated nearby area metadata — never "{city} area"
  if (nearest && bestKm <= 2.5) {
    const areaName = nearest.district || nearest.area
    return {
      ok: true,
      cityId,
      cityLabel,
      lat,
      lng,
      districtId: null,
      districtName: areaName ?? null,
      label: areaName ? `${areaName} area` : `Near ${nearest.label}`,
      areaLine: cityLabel,
      nearPlace,
      nearWater,
      kind: 'freeform',
      landmarkId: null,
    }
  }

  return {
    ok: true,
    cityId,
    cityLabel,
    lat,
    lng,
    districtId: null,
    districtName: null,
    label: 'Selected location',
    areaLine: `Within supported ${cityLabel}`,
    nearPlace,
    nearWater,
    kind: 'freeform',
    landmarkId: null,
  }
}

/** Hover context for map pointer — district / water / landmark proximity. */
export function resolveHoverContext(
  geo: CityGeography | null,
  cityId: PlaceId,
  cityLabel: string,
  lat: number,
  lng: number,
): { title: string; subtitle: string; kind: string } | null {
  if (!geo) return null
  if (!pointInSupportedCity(geo.bounds, lng, lat)) {
    return {
      title: `Outside mapped ${cityLabel}`,
      subtitle: 'Choose a point inside the supported city',
      kind: 'outside',
    }
  }

  for (const w of geo.namedWater) {
    const km = haversineKm({ lat, lng }, w)
    if (km < 0.35) {
      return {
        title: w.name,
        subtitle: w.kind === 'river' ? 'River' : 'Water · ' + cityLabel,
        kind: 'water',
      }
    }
  }

  const district = findDistrict(geo, lng, lat)
  const points = pointsForCity(cityId)
  const knownAreas = new Set(
    points.flatMap((p) =>
      [p.district, p.area, p.label].filter(Boolean).map((s) => s!.toLowerCase()),
    ),
  )
  if (
    district &&
    [...knownAreas].some((k) => k.includes(district.name.toLowerCase()) || district.name.toLowerCase().includes(k))
  ) {
    return {
      title: district.name,
      subtitle: `${cityLabel} · District / area`,
      kind: 'district',
    }
  }

  let nearest: UrbanPoint | null = null
  let bestKm = Infinity
  for (const p of points) {
    const km = haversineKm({ lat, lng }, p)
    if (km < bestKm) {
      bestKm = km
      nearest = p
    }
  }
  if (nearest && bestKm < 0.45) {
    return {
      title: nearest.label,
      subtitle: `${cityLabel} · ${nearest.type || 'Place'}`,
      kind: 'place',
    }
  }
  if (nearest && bestKm < 2.2) {
    const areaName = nearest.district || nearest.area
    return {
      title: areaName ? `${areaName} area` : `Near ${nearest.label}`,
      subtitle: `${cityLabel} · Click to select`,
      kind: 'area',
    }
  }

  return {
    title: cityLabel,
    subtitle: 'Within supported city · Click to select',
    kind: 'city',
  }
}
