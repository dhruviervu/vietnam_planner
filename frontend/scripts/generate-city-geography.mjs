/**
 * Generate per-city geographic resolution data from OpenStreetMap.
 * Strict bbox filtering avoids invalid world-wrapping multipolygons.
 *
 * Run: npm run generate:city-geo
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { geoMercator, geoPath, geoContains } from 'd3-geo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const GEO_OUT = path.join(ROOT, 'public', 'maps', 'geo')
const CITIES_OUT = path.join(ROOT, 'public', 'maps', 'cities')
const META_OUT = path.join(ROOT, 'src', 'pages', 'GettingAround', 'maps')

const CITIES = [
  { id: 'hanoi', file: 'hanoi', name: 'Hanoi', west: 105.75, east: 105.92, south: 20.96, north: 21.09 },
  { id: 'da-nang', file: 'da-nang', name: 'Da Nang', west: 108.14, east: 108.3, south: 15.98, north: 16.12 },
  { id: 'hcmc', file: 'ho-chi-minh-city', name: 'Ho Chi Minh City', west: 106.64, east: 106.76, south: 10.73, north: 10.84 },
  { id: 'hoi-an', file: 'hoi-an', name: 'Hoi An', west: 108.3, east: 108.38, south: 15.85, north: 15.93 },
  { id: 'hue', file: 'hue', name: 'Hue', west: 107.52, east: 107.64, south: 16.4, north: 16.5 },
  { id: 'ninh-binh', file: 'ninh-binh', name: 'Ninh Binh', west: 105.85, east: 106.02, south: 20.15, north: 20.3 },
  { id: 'nha-trang', file: 'nha-trang', name: 'Nha Trang', west: 109.14, east: 109.24, south: 12.2, north: 12.3 },
  { id: 'dalat', file: 'dalat', name: 'Da Lat', west: 108.4, east: 108.5, south: 11.9, north: 11.98 },
]

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

async function overpass(query, label) {
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'VietnamCuratedMapGenerator/1.0 (city geography)',
        },
        body: `data=${encodeURIComponent(query)}`,
      })
      if (!res.ok) {
        console.warn(`  ${label} ${url} → ${res.status}`)
        continue
      }
      return await res.json()
    } catch (err) {
      console.warn(`  ${label} failed`, err?.message || err)
    }
  }
  return null
}

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function bboxPolygon(west, south, east, north) {
  // Counter-clockwise exterior ring (GeoJSON / d3-geo)
  return {
    type: 'Polygon',
    coordinates: [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ],
    ],
  }
}

function ensureCcw(ring) {
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  if (area < 0) return [...ring].reverse()
  return ring
}

/** Supported urban extent = inset of the fitted map bounds (same projection as the SVG). */
function supportedBoundary(city, inset = 0.045) {
  const padLng = (city.east - city.west) * inset
  const padLat = (city.north - city.south) * inset
  return bboxPolygon(
    city.west + padLng,
    city.south + padLat,
    city.east - padLng,
    city.north - padLat,
  )
}

function ringInExpandedBBox(ring, city, expand = 0.08) {
  const w = city.west - expand
  const e = city.east + expand
  const s = city.south - expand
  const n = city.north + expand
  const filtered = ring.filter(([lng, lat]) => lng >= w && lng <= e && lat >= s && lat <= n)
  if (filtered.length < 4) return null
  const a = filtered[0]
  const b = filtered[filtered.length - 1]
  if (a[0] !== b[0] || a[1] !== b[1]) filtered.push([...a])
  return filtered
}

function ringAreaApprox(ring) {
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return Math.abs(area / 2)
}

function centroidOfRing(ring) {
  let x = 0
  let y = 0
  const n = Math.max(1, ring.length - 1)
  for (let i = 0; i < n; i++) {
    x += ring[i][0]
    y += ring[i][1]
  }
  return [x / n, y / n]
}

function relationToPolygons(rel, city) {
  const cityArea =
    Math.abs(city.east - city.west) * Math.abs(city.north - city.south)
  const polys = []
  for (const m of rel.members || []) {
    if (m.type !== 'way' || !m.geometry?.length) continue
    if (m.role === 'inner') continue
    const raw = m.geometry.map((g) => [g.lon, g.lat])
    const ring = ringInExpandedBBox(raw, city)
    if (!ring) continue
    const area = ringAreaApprox(ring)
    // Reject near-city-sized or larger "outer" scraps / world wraps
    if (area > cityArea * 0.85) continue
    if (area < cityArea * 0.00005) continue
    const [clng, clat] = centroidOfRing(ring)
    if (
      clng < city.west - 0.02 ||
      clng > city.east + 0.02 ||
      clat < city.south - 0.02 ||
      clat > city.north + 0.02
    ) {
      continue
    }
    polys.push({ type: 'Polygon', coordinates: [ring] })
  }
  return polys
}

function simplifyRing(ring, step = 2) {
  if (ring.length <= 16) return ring
  const out = []
  for (let i = 0; i < ring.length - 1; i += step) out.push(ring[i])
  out.push(ring[0])
  return out
}

function roundGeom(geom, decimals = 5) {
  const r = (n) => Number(n.toFixed(decimals))
  const walk = (c) => (typeof c[0] === 'number' ? [r(c[0]), r(c[1])] : c.map(walk))
  return { type: geom.type, coordinates: walk(geom.coordinates) }
}

function fitCityProjection(west, south, east, north, width, height, pad = 22) {
  const projection = geoMercator()
    .center([(west + east) / 2, (south + north) / 2])
    .translate([width / 2, height / 2])
  let lo = 1e3
  let hi = 1e7
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2
    projection.scale(mid)
    const sw = projection([west, south])
    const ne = projection([east, north])
    if (!sw || !ne) {
      hi = mid
      continue
    }
    const w = Math.abs(ne[0] - sw[0])
    const h = Math.abs(sw[1] - ne[1])
    if (w > width - 2 * pad || h > height - 2 * pad) hi = mid
    else lo = mid
  }
  return projection.scale(lo)
}

function pathRound(d, decimals = 2) {
  if (!d) return ''
  return d.replace(/(-?\d+\.\d+)/g, (n) => Number(n).toFixed(decimals))
}

async function fetchDistricts(city) {
  const { west, south, east, north } = city
  const query = `
[out:json][timeout:180];
(
  relation["boundary"="administrative"]["admin_level"~"^(6|7|8)$"](${south},${west},${north},${east});
);
out geom;
`
  const data = await overpass(query, `${city.id} districts`)
  if (!data?.elements?.length) return []

  const byName = new Map()
  for (const el of data.elements) {
    if (el.type !== 'relation') continue
    const tags = el.tags || {}
    const name = (tags['name:en'] || tags.name || tags['name:vi'] || '').trim()
    if (!name) continue
    const polys = relationToPolygons(el, city)
    if (!polys.length) continue
    // Prefer largest valid polygon for this relation
    polys.sort(
      (a, b) => ringAreaApprox(b.coordinates[0]) - ringAreaApprox(a.coordinates[0]),
    )
    const geom = roundGeom({
      type: 'Polygon',
      coordinates: [simplifyRing(polys[0].coordinates[0], 3)],
    })
    const cleanName = name
      .replace(/^Quận\s+/i, '')
      .replace(/^Huyện\s+/i, '')
      .replace(/^Phường\s+/i, '')
      .replace(/\s+Ward$/i, '')
      .replace(/\s+District$/i, '')
      .replace(/\s+Commune$/i, '')
    const id = slugify(cleanName)
    const existing = byName.get(id)
    if (
      !existing ||
      ringAreaApprox(geom.coordinates[0]) > ringAreaApprox(existing.geometry.coordinates[0])
    ) {
      byName.set(id, {
        id,
        name: cleanName,
        nameLocal: tags['name:vi'] || tags.name || cleanName,
        adminLevel: tags.admin_level,
        geometry: geom,
      })
    }
  }

  const list = [...byName.values()]
  // Keep districts whose centroid is inside supported map bounds
  return list
    .filter((d) => {
      const [lng, lat] = centroidOfRing(d.geometry.coordinates[0])
      return lng >= city.west && lng <= city.east && lat >= city.south && lat <= city.north
    })
    .slice(0, 30)
}

async function fetchNamedWater(city) {
  const { west, south, east, north } = city
  const query = `
[out:json][timeout:90];
(
  way["natural"="water"]["name"](${south},${west},${north},${east});
  way["waterway"="river"]["name"](${south},${west},${north},${east});
);
out geom;
`
  const data = await overpass(query, `${city.id} water`)
  if (!data?.elements?.length) return []
  const out = []
  const seen = new Set()
  for (const el of data.elements) {
    const tags = el.tags || {}
    const name = tags['name:en'] || tags.name
    if (!name || !el.geometry?.length) continue
    const id = slugify(name)
    if (seen.has(id)) continue
    const coords = el.geometry.map((g) => [g.lon, g.lat])
    const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length
    const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length
    if (lng < city.west || lng > city.east || lat < city.south || lat > city.north) continue
    seen.add(id)
    out.push({
      id,
      name,
      kind: tags.waterway === 'river' ? 'river' : 'water',
      lat,
      lng,
    })
  }
  return out.slice(0, 20)
}

function injectDistrictLayer(svgPath, districts, city) {
  if (!fs.existsSync(svgPath)) return
  let svg = fs.readFileSync(svgPath, 'utf8')
  // strip previous district groups
  svg = svg.replace(/<g id="districts"[\s\S]*?<\/g>\n?/g, '')

  const CW = 720
  const CH = 560
  const proj = fitCityProjection(city.west, city.south, city.east, city.north, CW, CH, 22)
  proj.clipExtent([
    [0, 0],
    [CW, CH],
  ])
  const pathFn = geoPath(proj)

  let districtXml = '  <g id="districts" data-layer="districts">\n'
  for (const d of districts) {
    const feature = { type: 'Feature', properties: { name: d.name }, geometry: d.geometry }
    const dPath = pathRound(pathFn(feature), 2)
    if (!dPath || dPath.includes('M0,0L720,0')) continue
    districtXml += `    <path class="district" id="district-${d.id}" data-name="${d.name.replace(/"/g, '')}" data-district-id="${d.id}" d="${dPath}" />\n`
  }
  districtXml += '  </g>\n'

  if (!svg.includes('.district {')) {
    svg = svg.replace(
      '</style>',
      `      .district { fill: rgba(122, 110, 90, 0.05); stroke: #8A7A68; stroke-width: 0.9; stroke-dasharray: 3.5 2.5; opacity: 0.9; }\n    </style>`,
    )
  }

  if (svg.includes('<g id="roads">')) {
    svg = svg.replace('<g id="roads">', `${districtXml}<g id="roads">`)
  } else {
    svg = svg.replace('</svg>', `${districtXml}</svg>`)
  }
  fs.writeFileSync(svgPath, svg)
}

function verifyBoundary(city, boundary) {
  const feature = { type: 'Feature', properties: {}, geometry: boundary }
  const cx = (city.west + city.east) / 2
  const cy = (city.south + city.north) / 2
  const inside = geoContains(feature, [cx, cy])
  const outside = geoContains(feature, [city.west - 0.5, cy])
  console.log(`  boundary check: center=${inside} outsideWest=${outside}`)
  return inside && !outside
}

async function main() {
  fs.mkdirSync(GEO_OUT, { recursive: true })
  const index = {}

  for (const city of CITIES) {
    console.log(`Geography: ${city.name}`)
    await new Promise((r) => setTimeout(r, 1800))
    const districts = await fetchDistricts(city)
    console.log(`  districts: ${districts.length}`)
    await new Promise((r) => setTimeout(r, 1200))
    const namedWater = await fetchNamedWater(city)
    console.log(`  named water: ${namedWater.length}`)

    const boundary = supportedBoundary(city)
    verifyBoundary(city, boundary)

    const payload = {
      cityId: city.id,
      cityLabel: city.name,
      bounds: {
        west: city.west,
        south: city.south,
        east: city.east,
        north: city.north,
      },
      sources: {
        boundarySource: 'Fitted urban map extent (inset) — matches SVG projection',
        districtSource: districts.length
          ? 'OSM administrative relations (bbox-filtered)'
          : 'none',
        waterSource: namedWater.length ? 'OSM named water/rivers' : 'none',
        lastVerified: new Date().toISOString().slice(0, 10),
      },
      boundary,
      districts,
      namedWater,
    }

    fs.writeFileSync(path.join(GEO_OUT, `${city.id}.json`), JSON.stringify(payload))
    injectDistrictLayer(path.join(CITIES_OUT, `${city.file}.svg`), districts, city)
    console.log(`  wrote geo + district overlay`)

    index[city.id] = {
      file: `/maps/geo/${city.id}.json`,
      districtCount: districts.length,
      waterCount: namedWater.length,
      ready: true,
    }
  }

  fs.writeFileSync(
    path.join(META_OUT, 'cityGeographyIndex.ts'),
    `/* Auto-generated by scripts/generate-city-geography.mjs */
export const CITY_GEOGRAPHY_INDEX = ${JSON.stringify(index, null, 2)} as const
`,
  )
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
