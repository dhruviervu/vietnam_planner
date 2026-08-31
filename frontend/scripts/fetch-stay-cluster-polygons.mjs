/**
 * Fetch Nominatim polygons for stay clusters, clip to city bounds, simplify.
 * Writes frontend/scripts/_cluster-osm.json
 */
const UA = 'vietnam-planner/1.0 (stay-cluster polygons)'

const QUERIES = [
  { id: 'hanoi-old-quarter', q: 'Hanoi Old Quarter, Vietnam', city: 'hanoi' },
  { id: 'hanoi-tay-ho', q: 'Tay Ho, Hanoi, Vietnam', city: 'hanoi' },
  { id: 'hanoi-ba-dinh', q: 'Ba Dinh, Hanoi, Vietnam', city: 'hanoi' },
  { id: 'hcmc-district-1', q: 'District 1, Ho Chi Minh City, Vietnam', city: 'hcmc' },
  { id: 'hcmc-district-3', q: 'District 3, Ho Chi Minh City, Vietnam', city: 'hcmc' },
  { id: 'hcmc-phu-nhuan', q: 'Phu Nhuan, Ho Chi Minh City, Vietnam', city: 'hcmc' },
  { id: 'hcmc-thao-dien', q: 'Thao Dien, Ho Chi Minh City, Vietnam', city: 'hcmc' },
  { id: 'danang-hai-chau', q: 'Hai Chau, Da Nang, Vietnam', city: 'da-nang' },
  { id: 'danang-son-tra', q: 'Son Tra, Da Nang, Vietnam', city: 'da-nang' },
  { id: 'hoian-cam-chau', q: 'Cam Chau, Hoi An, Vietnam', city: 'hoi-an' },
  { id: 'hoian-cam-thanh', q: 'Cam Thanh, Hoi An, Vietnam', city: 'hoi-an' },
  { id: 'hoian-cam-pho', q: 'Cam Pho, Hoi An, Vietnam', city: 'hoi-an' },
  { id: 'hoian-cam-nam', q: 'Cam Nam, Hoi An, Vietnam', city: 'hoi-an' },
  { id: 'hue-citadel', q: 'Imperial City, Hue, Vietnam', city: 'hue' },
  { id: 'phuquoc-duong-dong', q: 'Duong Dong, Phu Quoc, Vietnam', city: 'phu-quoc' },
]

const BOUNDS = {
  hanoi: { west: 105.814, south: 21.016, east: 105.868, north: 21.076 },
  hcmc: { west: 106.66, south: 10.76, east: 106.76, north: 10.83 },
  'da-nang': { west: 108.204, south: 16.038, east: 108.296, north: 16.118 },
  'hoi-an': { west: 108.308, south: 15.861, east: 108.352, north: 15.92 },
  hue: { west: 107.54, south: 16.45, east: 107.63, north: 16.495 },
  'phu-quoc': { west: 103.915, south: 10.148, east: 104.005, north: 10.328 },
}

function ringArea(ring) {
  let a = 0
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return Math.abs(a / 2)
}

function extractOuter(geo) {
  if (!geo) return null
  if (geo.type === 'Polygon') return geo.coordinates[0]
  if (geo.type === 'MultiPolygon') {
    let best = null
    let bestA = -1
    for (const poly of geo.coordinates) {
      const ring = poly[0]
      const a = ringArea(ring)
      if (a > bestA) {
        bestA = a
        best = ring
      }
    }
    return best
  }
  return null
}

function close(ring) {
  if (!ring?.length) return ring
  const a = ring[0]
  const b = ring[ring.length - 1]
  if (a[0] === b[0] && a[1] === b[1]) return ring
  return [...ring, [a[0], a[1]]]
}

function dist2(a, b) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return dx * dx + dy * dy
}

function perpDist(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.sqrt(dist2(p, a))
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function douglasPeucker(pts, eps) {
  if (pts.length <= 2) return pts
  let maxD = 0
  let idx = 0
  const last = pts.length - 1
  for (let i = 1; i < last; i++) {
    const d = perpDist(pts[i], pts[0], pts[last])
    if (d > maxD) {
      maxD = d
      idx = i
    }
  }
  if (maxD > eps) {
    const left = douglasPeucker(pts.slice(0, idx + 1), eps)
    const right = douglasPeucker(pts.slice(idx), eps)
    return [...left.slice(0, -1), ...right]
  }
  return [pts[0], pts[last]]
}

function simplify(ring, target = 110) {
  const open = ring.slice()
  if (open.length >= 2) {
    const a = open[0]
    const b = open[open.length - 1]
    if (a[0] === b[0] && a[1] === b[1]) open.pop()
  }
  if (open.length <= target) return close(open)
  let eps = 0.00008
  let out = open
  for (let i = 0; i < 18; i++) {
    out = douglasPeucker(open, eps)
    if (out.length <= target && out.length >= 24) break
    if (out.length > target) eps *= 1.45
    else eps *= 0.7
  }
  if (out.length > target + 40) out = douglasPeucker(open, eps * 1.8)
  return close(out)
}

function inside(p, edge, b) {
  const [lng, lat] = p
  switch (edge) {
    case 'left':
      return lng >= b.west
    case 'right':
      return lng <= b.east
    case 'bottom':
      return lat >= b.south
    case 'top':
      return lat <= b.north
  }
}

function intersect(a, bpt, edge, box) {
  const [x1, y1] = a
  const [x2, y2] = bpt
  const dx = x2 - x1
  const dy = y2 - y1
  if (edge === 'left') {
    const t = (box.west - x1) / (dx || 1e-12)
    return [box.west, y1 + t * dy]
  }
  if (edge === 'right') {
    const t = (box.east - x1) / (dx || 1e-12)
    return [box.east, y1 + t * dy]
  }
  if (edge === 'bottom') {
    const t = (box.south - y1) / (dy || 1e-12)
    return [x1 + t * dx, box.south]
  }
  const t = (box.north - y1) / (dy || 1e-12)
  return [x1 + t * dx, box.north]
}

function clipEdge(ring, edge, box) {
  const out = []
  if (!ring.length) return out
  let prev = ring[ring.length - 1]
  for (const cur of ring) {
    const cin = inside(cur, edge, box)
    const pin = inside(prev, edge, box)
    if (cin) {
      if (!pin) out.push(intersect(prev, cur, edge, box))
      out.push(cur)
    } else if (pin) {
      out.push(intersect(prev, cur, edge, box))
    }
    prev = cur
  }
  return out
}

function clipToBounds(ring, box) {
  let r = ring.map((p) => [p[0], p[1]])
  if (r.length >= 2) {
    const a = r[0]
    const b = r[r.length - 1]
    if (a[0] === b[0] && a[1] === b[1]) r.pop()
  }
  for (const edge of ['left', 'right', 'bottom', 'top']) {
    r = clipEdge(r, edge, box)
    if (r.length < 3) return null
  }
  return close(r)
}

async function search(q) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q,
    format: 'json',
    polygon_geojson: '1',
    limit: '3',
    countrycodes: 'vn',
  })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${q}`)
  return res.json()
}

function pickResult(rows) {
  const withPoly = rows.filter((r) => r.geojson && (r.geojson.type === 'Polygon' || r.geojson.type === 'MultiPolygon'))
  if (!withPoly.length) return null
  withPoly.sort((a, b) => Number(b.importance || 0) - Number(a.importance || 0))
  return withPoly[0]
}

const out = {}
for (const item of QUERIES) {
  await new Promise((r) => setTimeout(r, 1100))
  try {
    const rows = await search(item.q)
    const hit = pickResult(rows)
    if (!hit) {
      console.log('NO POLY', item.id, rows.map((r) => `${r.type}:${r.class}:${r.display_name?.slice(0, 60)}`))
      continue
    }
    const raw = extractOuter(hit.geojson)
    if (!raw) {
      console.log('NO RING', item.id)
      continue
    }
    const clipped = clipToBounds(raw, BOUNDS[item.city])
    if (!clipped || clipped.length < 4) {
      console.log('CLIP EMPTY', item.id, 'raw', raw.length)
      continue
    }
    const simple = simplify(clipped, 120)
    out[item.id] = simple.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))])
    console.log('OK', item.id, 'raw', raw.length, 'clip', clipped.length, 'simp', out[item.id].length, hit.display_name.slice(0, 70))
  } catch (err) {
    console.log('ERR', item.id, err.message)
  }
}

const fs = await import('node:fs')
const path = await import('node:path')
const dest = path.join(process.cwd(), 'scripts', '_cluster-osm.json')
fs.writeFileSync(dest, JSON.stringify(out, null, 2))
console.log('wrote', dest, Object.keys(out).length)
