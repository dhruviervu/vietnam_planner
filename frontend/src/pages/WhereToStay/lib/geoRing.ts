import type { GeoRing } from '../data/types'

export function closeRing(ring: GeoRing): GeoRing {
  if (ring.length < 2) return ring
  const a = ring[0]
  const b = ring[ring.length - 1]
  if (a[0] === b[0] && a[1] === b[1]) return ring
  return [...ring, [a[0], a[1]]]
}

export function openRing(ring: GeoRing): GeoRing {
  if (ring.length < 2) return ring
  const a = ring[0]
  const b = ring[ring.length - 1]
  if (a[0] === b[0] && a[1] === b[1]) return ring.slice(0, -1)
  return ring
}

/** Street-following neighbourhoods: close the ring, do not Chaikin-smooth. */
export function landRing(ring: GeoRing): GeoRing {
  return closeRing(openRing(ring))
}

/**
 * Broad stay-zone: a superellipse (rounded rectangle), not a jagged coast
 * trace and not a sharp box. rxM / ryM are half-width / half-height in metres.
 * rotDeg rotates the +x axis counter-clockwise from east.
 */
export function zone(
  lng: number,
  lat: number,
  rxM: number,
  ryM: number,
  rotDeg = 0,
  n = 3.15,
  steps = 28,
): GeoRing {
  const rot = (rotDeg * Math.PI) / 180
  const cosR = Math.cos(rot)
  const sinR = Math.sin(rot)
  const mx = mPerDegLng(lat)
  const ring: GeoRing = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    const f = 1 / Math.pow(Math.abs(c) ** n + Math.abs(s) ** n, 1 / n)
    const x = f * c * rxM
    const y = f * s * ryM
    ring.push([lng + (x * cosR - y * sinR) / mx, lat + (x * sinR + y * cosR) / M_PER_DEG_LAT])
  }
  return closeRing(ring)
}

/**
 * Optional Chaikin corner-cut. Default 0 — extra iterations turn street
 * outlines into ellipses. Use 1 only on already-dense natural curves.
 */
export function curveRing(ring: GeoRing, iterations = 0): GeoRing {
  let pts = openRing(ring)
  if (pts.length < 3 || iterations <= 0) return closeRing(pts)
  for (let n = 0; n < iterations; n++) {
    const next: GeoRing = []
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      next.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]])
      next.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]])
    }
    pts = next
  }
  return closeRing(pts)
}

const M_PER_DEG_LAT = 111_320

function mPerDegLng(lat: number) {
  return M_PER_DEG_LAT * Math.max(Math.cos((lat * Math.PI) / 180), 0.2)
}

/** Insert vertices so offsets follow the line instead of skipping bays. */
export function densifyLine(pts: GeoRing, spacingM = 70): GeoRing {
  const src = openRing(pts)
  if (src.length < 2) return src
  const out: GeoRing = [[src[0][0], src[0][1]]]
  for (let i = 1; i < src.length; i++) {
    const a = src[i - 1]
    const b = src[i]
    const lat = (a[1] + b[1]) / 2
    const dist = Math.hypot((b[0] - a[0]) * mPerDegLng(lat), (b[1] - a[1]) * M_PER_DEG_LAT)
    const n = Math.max(1, Math.round(dist / spacingM))
    for (let k = 1; k <= n; k++) {
      const t = k / n
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
    }
  }
  return out
}

/**
 * Offset a polyline to the right (side = +1) or left (side = -1) when walking
 * from the first point to the last. Coordinates are [lng, lat].
 * Vertex normals are averaged from adjoining segments so sharp coast hooks
 * do not spike into the water.
 */
export function offsetLine(pts: GeoRing, meters: number, side: 1 | -1): GeoRing {
  const src = openRing(pts)
  if (src.length === 0) return []
  const segs: { nx: number; ny: number }[] = []
  for (let i = 0; i < src.length - 1; i++) {
    const lat = (src[i][1] + src[i + 1][1]) / 2
    const mx = (src[i + 1][0] - src[i][0]) * mPerDegLng(lat)
    const my = (src[i + 1][1] - src[i][1]) * M_PER_DEG_LAT
    const len = Math.hypot(mx, my) || 1
    segs.push({ nx: (my / len) * side, ny: (-mx / len) * side })
  }
  if (!segs.length) return src.map((p) => [p[0], p[1]] as [number, number])
  const out: GeoRing = []
  for (let i = 0; i < src.length; i++) {
    const a = segs[Math.max(0, i - 1)]
    const b = segs[Math.min(segs.length - 1, i)]
    let nx = a.nx + b.nx
    let ny = a.ny + b.ny
    const nlen = Math.hypot(nx, ny) || 1
    nx /= nlen
    ny /= nlen
    const lat = src[i][1]
    out.push([
      src[i][0] + (nx * meters) / mPerDegLng(lat),
      src[i][1] + (ny * meters) / M_PER_DEG_LAT,
    ])
  }
  return out
}

/**
 * Closed stay-strip along a shoreline. Walk the coast in `coast` order;
 * `inlandSide` is +1 for land on the right, -1 for land on the left.
 * No Chaikin — the coast vertices themselves carry the shape.
 */
export function coastStrip(
  coast: GeoRing,
  seawardInsetM: number,
  inlandWidthM: number,
  inlandSide: 1 | -1 = 1,
  spacingM = 80,
): GeoRing {
  const dense = densifyLine(coast, spacingM)
  const sea = offsetLine(dense, seawardInsetM, inlandSide)
  const inland = offsetLine(dense, inlandWidthM, inlandSide)
  return closeRing([...sea, ...inland.slice().reverse()])
}
