import { geoMercator } from 'd3-geo'
import type { MapProjectionMeta } from '../../GettingAround/maps/mapMeta'
import { createProjector, type Projector } from '../../GettingAround/maps/project'
import { MAP_META } from '../../GettingAround/maps/mapMeta'
import type { GeoBounds, StayCity } from './types'

export function getCityMapMeta(city: StayCity): MapProjectionMeta | null {
  if (!city.mapCityId) return null
  return MAP_META.cities[city.mapCityId] ?? null
}

/** Build a mercator projector that fits curated city bounds into the stay map frame. */
export function createBoundsProjector(bounds: GeoBounds): Projector {
  const { west, south, east, north } = bounds
  const feature = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
  }
  const projection = geoMercator().fitExtent(
    [
      [36, 28],
      [684, 532],
    ],
    feature,
  )

  const project = ((lng: number, lat: number) => {
    const pt = projection([lng, lat])
    if (!pt) return null
    return { x: pt[0], y: pt[1] }
  }) as Projector

  project.invert = (x: number, y: number) => {
    const ll = projection.invert?.([x, y])
    if (!ll || Number.isNaN(ll[0]) || Number.isNaN(ll[1])) return null
    return { lng: ll[0], lat: ll[1] }
  }

  return project
}

export function projectorForCity(city: StayCity): {
  project: Projector
  meta: MapProjectionMeta | null
  width: number
  height: number
} {
  const meta = getCityMapMeta(city)
  if (meta) {
    return {
      project: createProjector(meta),
      meta,
      width: meta.viewBox[2],
      height: meta.viewBox[3],
    }
  }
  return {
    project: createBoundsProjector(city.bounds),
    meta: null,
    width: 720,
    height: 560,
  }
}

export function ringToSvgPath(
  ring: [number, number][],
  project: Projector,
): string | null {
  const points = ring
    .map(([lng, lat]) => project(lng, lat))
    .filter(Boolean) as { x: number; y: number }[]
  if (points.length < 3) return null
  return (
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ') + ' Z'
  )
}

export function ringCentroid(ring: [number, number][]): { lng: number; lat: number } {
  const pts = ring.slice(0, -1)
  if (!pts.length) return { lng: ring[0]?.[0] ?? 0, lat: ring[0]?.[1] ?? 0 }
  const lng = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const lat = pts.reduce((s, p) => s + p[1], 0) / pts.length
  return { lng, lat }
}
