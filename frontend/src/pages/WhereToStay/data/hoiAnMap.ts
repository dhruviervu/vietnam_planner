import type { FeatureCollection, Geometry } from 'geojson'

export type HoiAnMapBounds = {
  west: number
  south: number
  east: number
  north: number
}

export type HoiAnMapMeta = {
  cityId: 'hoi-an'
  cityLabel: string
  bounds: HoiAnMapBounds
  projection: string
  source: string
  generatedAt: string
  layers: string[]
  counts: Record<string, number>
}

export type HoiAnMapBundle = {
  meta: HoiAnMapMeta
  roads: FeatureCollection
  bridges: FeatureCollection
  waterways: FeatureCollection
  urban: FeatureCollection
  places: FeatureCollection
  areas: FeatureCollection
}

const BASE = '/maps/where-to-stay/hoi-an'

async function loadFc(name: string): Promise<FeatureCollection> {
  const res = await fetch(`${BASE}/${name}.geojson`)
  if (!res.ok) throw new Error(`Missing Hoi An layer: ${name}`)
  return (await res.json()) as FeatureCollection
}

async function loadFcOptional(name: string): Promise<FeatureCollection> {
  const res = await fetch(`${BASE}/${name}.geojson`)
  if (!res.ok) return { type: 'FeatureCollection', features: [] }
  return (await res.json()) as FeatureCollection
}

let cache: HoiAnMapBundle | null = null

export async function loadHoiAnStayMap(): Promise<HoiAnMapBundle> {
  if (cache) return cache
  const [metaRes, roads, bridges, waterways, urban, places, areas] = await Promise.all([
    fetch(`${BASE}/meta.json`).then((r) => {
      if (!r.ok) throw new Error('Missing Hoi An map meta')
      return r.json() as Promise<HoiAnMapMeta>
    }),
    loadFc('roads'),
    loadFc('bridges'),
    loadFc('waterways'),
    loadFcOptional('urban'),
    loadFc('places'),
    loadFc('areas'),
  ])
  cache = { meta: metaRes, roads, bridges, waterways, urban, places, areas }
  return cache
}

export function geomToPath(
  geometry: Geometry,
  project: (lng: number, lat: number) => { x: number; y: number } | null,
): string | null {
  if (geometry.type === 'LineString') {
    const pts = geometry.coordinates
      .map(([lng, lat]) => project(lng, lat))
      .filter(Boolean) as { x: number; y: number }[]
    if (pts.length < 2) return null
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  }
  if (geometry.type === 'MultiLineString') {
    const parts = geometry.coordinates
      .map((line) => {
        const pts = line
          .map(([lng, lat]) => project(lng, lat))
          .filter(Boolean) as { x: number; y: number }[]
        if (pts.length < 2) return null
        return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
      })
      .filter(Boolean)
    return parts.length ? parts.join(' ') : null
  }
  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0]
    if (!ring) return null
    const pts = ring
      .map(([lng, lat]) => project(lng, lat))
      .filter(Boolean) as { x: number; y: number }[]
    if (pts.length < 3) return null
    return (
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ' Z'
    )
  }
  if (geometry.type === 'MultiPolygon') {
    const parts = geometry.coordinates
      .map((poly) => {
        const ring = poly[0]
        if (!ring) return null
        const pts = ring
          .map(([lng, lat]) => project(lng, lat))
          .filter(Boolean) as { x: number; y: number }[]
        if (pts.length < 3) return null
        return (
          pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
          ' Z'
        )
      })
      .filter(Boolean)
    return parts.length ? parts.join(' ') : null
  }
  return null
}
