import { geoMercator } from 'd3-geo'
import type { MapProjectionMeta } from './mapMeta'

export type Projector = {
  (lng: number, lat: number): { x: number; y: number } | null
  invert: (x: number, y: number) => { lng: number; lat: number } | null
}

export function createProjector(meta: MapProjectionMeta): Projector {
  const projection = geoMercator()
    .scale(meta.scale)
    .translate(meta.translate)
    .center(meta.center)
    .rotate(meta.rotate)

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

/** Great-circle-style visual arc in SVG space (not a road route). */
export function curvedSvgPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
): string {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy) || 1
  const bulge = Math.min(80, dist * 0.22)
  const nx = -dy / dist
  const ny = dx / dist
  const cx = mx + nx * bulge
  const cy = my + ny * bulge
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Snap a geographic click to the nearest curated location within maxKm. */
export function nearestLocationId<T extends { id: string; lat: number; lng: number }>(
  click: { lat: number; lng: number },
  locations: T[],
  maxKm: number,
): { id: string; km: number } | null {
  let best: { id: string; km: number } | null = null
  for (const loc of locations) {
    const km = haversineKm(click, loc)
    if (km > maxKm) continue
    if (!best || km < best.km) best = { id: loc.id, km }
  }
  return best
}
