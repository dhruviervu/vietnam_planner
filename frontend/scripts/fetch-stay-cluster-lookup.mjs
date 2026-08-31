const UA = 'vietnam-planner/1.0 (stay-cluster polygons)'
const fs = await import('node:fs')
const path = await import('node:path')

const LOOKUPS = [
  { id: 'hanoi-old-quarter', osm: 'R20663236', city: 'hanoi' },
  { id: 'hcmc-district-1', osm: 'R2587287', city: 'hcmc' },
  { id: 'hcmc-district-3', osm: 'R3819816', city: 'hcmc' },
  { id: 'hue-citadel', osm: 'W1509320731', city: 'hue' },
  { id: 'hoian-ancient-town', osm: 'R7062070', city: 'hoi-an' },
]

const OVERPASS = [
  {
    id: 'hcmc-thao-dien',
    city: 'hcmc',
    ql: `[out:json][timeout:40];
(
  relation["name"="Thảo Điền"]["place"];
  relation["name:en"="Thao Dien"]["place"];
  way["name"="Thảo Điền"]["place"];
  relation["name"="Thảo Điền"]["boundary"];
);
out geom;`,
  },
  {
    id: 'phuquoc-duong-dong',
    city: 'phu-quoc',
    ql: `[out:json][timeout:40];
(
  relation["name"="Dương Đông"]["place"];
  relation["name:en"="Duong Dong"]["place"];
  relation["name"="Dương Đông"]["boundary"];
  way["name"="Dương Đông"]["place"];
);
out geom;`,
  },
  {
    id: 'hoian-cam-chau',
    city: 'hoi-an',
    ql: `[out:json][timeout:40];
(
  relation["name"="Cẩm Châu"];
  relation["name:en"="Cam Chau"]["boundary"];
  way["name"="Cẩm Châu"]["place"];
);
out geom;`,
  },
  {
    id: 'hoian-cam-thanh',
    city: 'hoi-an',
    ql: `[out:json][timeout:40];
(
  relation["name"="Cẩm Thanh"];
  relation["name:en"="Cam Thanh"]["boundary"];
);
out geom;`,
  },
  {
    id: 'hoian-cam-pho',
    city: 'hoi-an',
    ql: `[out:json][timeout:40];
(
  relation["name"="Cẩm Phô"];
  relation["name"="Cẩm Phố"];
);
out geom;`,
  },
  {
    id: 'hoian-cam-nam',
    city: 'hoi-an',
    ql: `[out:json][timeout:40];
(
  relation["name"="Cẩm Nam"];
);
out geom;`,
  },
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
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  return Math.abs(a / 2)
}

function extractOuter(geo) {
  if (!geo) return null
  if (geo.type === 'Polygon') return geo.coordinates[0]
  if (geo.type === 'MultiPolygon') {
    let best = null
    let bestA = -1
    for (const poly of geo.coordinates) {
      const a = ringArea(poly[0])
      if (a > bestA) {
        bestA = a
        best = poly[0]
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

function perpDist(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
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
  return close(out)
}

function inside(p, edge, b) {
  const [lng, lat] = p
  if (edge === 'left') return lng >= b.west
  if (edge === 'right') return lng <= b.east
  if (edge === 'bottom') return lat >= b.south
  return lat <= b.north
}

function intersect(a, bpt, edge, box) {
  const [x1, y1] = a
  const [x2, y2] = bpt
  const dx = x2 - x1
  const dy = y2 - y1
  if (edge === 'left') return [box.west, y1 + ((box.west - x1) / (dx || 1e-12)) * dy]
  if (edge === 'right') return [box.east, y1 + ((box.east - x1) / (dx || 1e-12)) * dy]
  if (edge === 'bottom') return [x1 + ((box.south - y1) / (dy || 1e-12)) * dx, box.south]
  return [x1 + ((box.north - y1) / (dy || 1e-12)) * dx, box.north]
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
    } else if (pin) out.push(intersect(prev, cur, edge, box))
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

function roundRing(ring) {
  return ring.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))])
}

function processRing(id, city, raw) {
  const clipped = clipToBounds(raw, BOUNDS[city])
  if (!clipped || clipped.length < 4) {
    console.log('CLIP EMPTY', id, 'raw', raw.length)
    return null
  }
  return roundRing(simplify(clipped, 120))
}

const prevPath = path.join(process.cwd(), 'scripts', '_cluster-osm.json')
const out = JSON.parse(fs.readFileSync(prevPath, 'utf8'))

async function lookup(osm) {
  const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=${osm}&format=json&polygon_geojson=1`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  return res.json()
}

for (const item of LOOKUPS) {
  await new Promise((r) => setTimeout(r, 1100))
  const rows = await lookup(item.osm)
  const geo = rows[0]?.geojson
  const raw = extractOuter(geo)
  if (!raw) {
    console.log('NO RING', item.id)
    continue
  }
  const ring = processRing(item.id, item.city, raw)
  if (ring) {
    out[item.id] = ring
    console.log('OK lookup', item.id, 'raw', raw.length, 'simp', ring.length)
  }
}

function overpassToRing(data) {
  const els = data.elements || []
  let best = null
  let bestA = -1
  for (const el of els) {
    let ring = null
    if (el.type === 'way' && el.geometry) {
      ring = el.geometry.map((g) => [g.lon, g.lat])
    } else if (el.type === 'relation' && el.members) {
      const outer = el.members.filter((m) => m.role === 'outer' && m.geometry)
      const pts = []
      for (const m of outer) {
        for (const g of m.geometry) pts.push([g.lon, g.lat])
      }
      if (pts.length >= 4) ring = pts
    }
    if (!ring || ring.length < 4) continue
    const a = ringArea(close(ring))
    if (a > bestA) {
      bestA = a
      best = ring
    }
  }
  return best
}

for (const item of OVERPASS) {
  await new Promise((r) => setTimeout(r, 1500))
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'text/plain' },
      body: item.ql,
    })
    const data = await res.json()
    console.log('overpass', item.id, 'els', (data.elements || []).length)
    const raw = overpassToRing(data)
    if (!raw) {
      console.log('NO RING', item.id)
      continue
    }
    const ring = processRing(item.id, item.city, raw)
    if (ring) {
      out[item.id] = ring
      console.log('OK overpass', item.id, 'raw', raw.length, 'simp', ring.length)
    }
  } catch (err) {
    console.log('ERR', item.id, err.message)
  }
}

fs.writeFileSync(prevPath, JSON.stringify(out, null, 2))
console.log('wrote keys', Object.keys(out).sort().join(', '))
