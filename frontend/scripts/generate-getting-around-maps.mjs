/**
 * Generate locally bundled SVG maps from real geographic datasets.
 *
 * Sources (Natural Earth / world-atlas):
 * - countries-10m (Vietnam national boundary + islands)
 * - ne_10m_rivers_lake_centerlines
 * - ne_10m_lakes
 * - ne_10m_urban_areas
 *
 * Run: npm run generate:maps
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { feature } from 'topojson-client'
import { geoMercator, geoPath, geoContains } from 'd3-geo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'maps')
const CITIES_OUT = path.join(OUT, 'cities')
const META_OUT = path.join(ROOT, 'src', 'pages', 'GettingAround', 'maps')

const COUNTRIES_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json'
const RIVERS_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_rivers_lake_centerlines.geojson'
const LAKES_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_lakes.geojson'
const URBAN_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_urban_areas.geojson'
const ROADS_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_roads.geojson'
const RAIL_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_railroads.geojson'

/** OSM Overpass — denser city corridors (real geography; generate-time only). */
async function fetchOsmHighways(west, south, east, north) {
  const query = `
[out:json][timeout:90];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](${south},${west},${north},${east});
  way["waterway"~"^(river|canal)$"](${south},${west},${north},${east});
);
out geom;
`
  const endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ]
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'VietnamCuratedMapGenerator/1.0 (getting-around city maps)',
        },
        body: `data=${encodeURIComponent(query)}`,
      })
      if (!res.ok) {
        console.warn(`  Overpass ${url} → ${res.status}`)
        continue
      }
      const data = await res.json()
      return osmWaysToFeatures(data.elements || [])
    } catch (err) {
      console.warn(`  Overpass failed ${url}`, err?.message || err)
    }
  }
  return { roads: [], waterways: [] }
}

function osmWaysToFeatures(elements) {
  const roads = []
  const waterways = []
  for (const el of elements) {
    if (el.type !== 'way' || !el.geometry?.length) continue
    const coords = el.geometry.map((g) => [g.lon, g.lat])
    if (coords.length < 2) continue
    const tags = el.tags || {}
    const feature = {
      type: 'Feature',
      properties: {
        name: tags.name || tags.ref || tags.highway || tags.waterway || 'way',
        highway: tags.highway || null,
        waterway: tags.waterway || null,
      },
      geometry: { type: 'LineString', coordinates: coords },
    }
    if (tags.waterway) waterways.push(feature)
    else if (tags.highway) roads.push(feature)
  }
  return { roads, waterways }
}

function roadClass(highway) {
  if (!highway) return 'road-city'
  if (/^(motorway|trunk|primary)$/.test(highway)) return 'road-major'
  if (/^secondary$/.test(highway)) return 'road-city'
  return 'road-minor'
}

/** City extents fitted from real urban point clusters (WGS84). */
const CITIES = [
  {
    id: 'hanoi',
    file: 'hanoi',
    name: 'Hanoi',
    west: 105.75,
    east: 105.92,
    south: 20.96,
    north: 21.09,
  },
  {
    id: 'da-nang',
    file: 'da-nang',
    name: 'Da Nang',
    west: 108.14,
    east: 108.3,
    south: 15.98,
    north: 16.12,
  },
  {
    id: 'hcmc',
    file: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City',
    west: 106.64,
    east: 106.76,
    south: 10.73,
    north: 10.84,
  },
  {
    id: 'hoi-an',
    file: 'hoi-an',
    name: 'Hoi An',
    west: 108.3,
    east: 108.38,
    south: 15.85,
    north: 15.93,
  },
  {
    id: 'hue',
    file: 'hue',
    name: 'Hue',
    west: 107.52,
    east: 107.64,
    south: 16.4,
    north: 16.5,
  },
  {
    id: 'ninh-binh',
    file: 'ninh-binh',
    name: 'Ninh Binh',
    west: 105.85,
    east: 106.02,
    south: 20.15,
    north: 20.3,
  },
  {
    id: 'nha-trang',
    file: 'nha-trang',
    name: 'Nha Trang',
    west: 109.14,
    east: 109.24,
    south: 12.2,
    north: 12.3,
  },
  {
    id: 'dalat',
    file: 'dalat',
    name: 'Da Lat',
    west: 108.4,
    east: 108.5,
    south: 11.9,
    north: 11.98,
  },
]

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`)
  return res.json()
}

/** Mercator fit for small WGS84 bboxes. d3 fitExtent collapses city-scale boxes. */
function fitCityProjection(west, south, east, north, width, height, pad = 28) {
  const cx = (west + east) / 2
  const cy = (south + north) / 2
  const projection = geoMercator().center([cx, cy]).translate([width / 2, height / 2])
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
  projection.scale(lo)
  return projection
}

function bboxFramePath(projection, west, south, east, north) {
  const corners = [
    projection([west, south]),
    projection([east, south]),
    projection([east, north]),
    projection([west, north]),
  ]
  if (corners.some((p) => !p)) return ''
  return `M${corners.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`
}

function roundPath(d, decimals = 1) {
  if (!d) return ''
  return d.replace(/(-?\d+\.\d+)/g, (n) => Number(n).toFixed(decimals))
}

function sanitizeGeometry(geometry, west = 102, south = 8, east = 110.5, north = 23.5) {
  const ok = ([lng, lat]) => lng >= west && lng <= east && lat >= south && lat <= north
  function cleanRing(ring) {
    if (!ring || ring.length < 4) return null
    if (!ring.every(ok)) return null
    return ring
  }
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates.map(cleanRing).filter(Boolean)
    if (!rings.length) return null
    return { type: 'Polygon', coordinates: rings }
  }
  if (geometry.type === 'MultiPolygon') {
    const polys = []
    for (const poly of geometry.coordinates) {
      const rings = poly.map(cleanRing).filter(Boolean)
      if (rings.length) polys.push(rings)
    }
    if (!polys.length) return null
    return { type: 'MultiPolygon', coordinates: polys }
  }
  return geometry
}

function bboxFeature(west, south, east, north) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
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
    },
  }
}

function featureInBBox(f, west, south, east, north) {
  // Sample: any vertex inside, or contains city center
  const geom = f.geometry
  if (!geom) return false
  const cx = (west + east) / 2
  const cy = (south + north) / 2
  try {
    if (geoContains(f, [cx, cy])) return true
  } catch {
    /* ignore */
  }
  const coords = []
  const walk = (c) => {
    if (typeof c[0] === 'number') coords.push(c)
    else c.forEach(walk)
  }
  walk(geom.coordinates)
  return coords.some(([lng, lat]) => lng >= west && lng <= east && lat >= south && lat <= north)
}

function projectionMeta(projection, width, height) {
  return {
    type: 'mercator',
    width,
    height,
    scale: projection.scale(),
    translate: projection.translate(),
    center: projection.center(),
    rotate: projection.rotate(),
  }
}

function svgShell({ viewBox, title, body, metaComment }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated from real geographic data. ${metaComment} -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="vn-regions" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6F9E7A"/>
      <stop offset="14%" stop-color="#8FBF6E"/>
      <stop offset="28%" stop-color="#D4B45A"/>
      <stop offset="42%" stop-color="#5FA8A0"/>
      <stop offset="56%" stop-color="#7A9A52"/>
      <stop offset="72%" stop-color="#E0A66A"/>
      <stop offset="88%" stop-color="#6DBF8E"/>
      <stop offset="100%" stop-color="#4FA88A"/>
    </linearGradient>
    <style>
      .land { fill: #E8DFD2; stroke: #8A7460; stroke-width: 1.15; stroke-linejoin: round; }
      .land-regions { fill: url(#vn-regions); stroke: #5E7358; stroke-width: 1.05; stroke-linejoin: round; }
      .urban { fill: #F2D2B0; stroke: #D4A882; stroke-width: 0.55; stroke-linejoin: round; opacity: 0.92; }
      .lake { fill: #7EB8C9; stroke: #5A9AAB; stroke-width: 0.5; }
      .river { fill: none; stroke: #4A92A8; stroke-width: 1.35; stroke-linecap: round; stroke-linejoin: round; opacity: 0.92; }
      .river-city { fill: none; stroke: #6F9AA8; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; opacity: 0.95; }
      .road { fill: none; stroke: #C4A98E; stroke-width: 1.05; stroke-linecap: round; opacity: 0.7; }
      .road-city { fill: none; stroke: #B7A28E; stroke-width: 1.55; stroke-linecap: round; opacity: 0.82; }
      .road-major { fill: none; stroke: #A8896E; stroke-width: 2.15; stroke-linecap: round; opacity: 0.9; }
      .road-minor { fill: none; stroke: #CDB9A4; stroke-width: 0.85; stroke-linecap: round; opacity: 0.55; }
      .rail { fill: none; stroke: #8F7A6A; stroke-width: 1.2; stroke-linecap: round; stroke-dasharray: 4 2.5; opacity: 0.7; }
      .district { fill: none; stroke: #9A8A78; stroke-width: 0.7; stroke-dasharray: 3 2.5; opacity: 0.35; }
      .water-bg { fill: #A9C8D6; stroke: none; }
      .land-bg { fill: #EDE6DB; stroke: none; }
      .city-frame { fill: none; stroke: #C4B5A5; stroke-width: 1; stroke-dasharray: 4 3; opacity: 0.55; }
    </style>
  </defs>
${body}
</svg>
`
}

function pathsFromFeatures(features, pathFn, className, idPrefix, decimals = 1) {
  let out = ''
  let i = 0
  for (const f of features) {
    const d = roundPath(pathFn(f), decimals)
    if (!d || d.length < 8) continue
    const name = (f.properties?.name || f.properties?.Name || `${idPrefix}-${i}`)
      .toString()
      .replace(/"/g, '')
    const cls = typeof className === 'function' ? className(f) : className
    out += `  <path class="${cls}" id="${idPrefix}-${i}" data-name="${name}" d="${d}" />\n`
    i++
  }
  return out
}

async function main() {
  fs.mkdirSync(CITIES_OUT, { recursive: true })
  fs.mkdirSync(META_OUT, { recursive: true })

  console.log('Fetching Natural Earth / world-atlas datasets…')
  const [topo, riversFc, lakesFc, urbanFc, roadsFc, railFc] = await Promise.all([
    fetchJson(COUNTRIES_URL),
    fetchJson(RIVERS_URL),
    fetchJson(LAKES_URL),
    fetchJson(URBAN_URL),
    fetchJson(ROADS_URL),
    fetchJson(RAIL_URL).catch(() => ({ features: [] })),
  ])

  const countries = feature(topo, topo.objects.countries)
  const vietnamRaw = countries.features.find((f) => f.properties.name === 'Vietnam')
  if (!vietnamRaw) throw new Error('Vietnam feature not found')
  const cleanGeom = sanitizeGeometry(vietnamRaw.geometry)
  if (!cleanGeom) throw new Error('Vietnam geometry failed sanitize')
  const vietnam = { type: 'Feature', properties: vietnamRaw.properties, geometry: cleanGeom }

  const vnWest = 102.1
  const vnSouth = 8.1
  const vnEast = 109.6
  const vnNorth = 23.5

  const riversVn = riversFc.features.filter((f) =>
    featureInBBox(f, vnWest, vnSouth, vnEast, vnNorth),
  )
  const lakesVn = lakesFc.features.filter((f) =>
    featureInBBox(f, vnWest, vnSouth, vnEast, vnNorth),
  )
  const urbanVn = urbanFc.features.filter((f) =>
    featureInBBox(f, vnWest, vnSouth, vnEast, vnNorth),
  )
  const roadsVn = roadsFc.features.filter((f) =>
    featureInBBox(f, vnWest, vnSouth, vnEast, vnNorth),
  )
  console.log(
    `Vietnam context: ${riversVn.length} rivers, ${lakesVn.length} lakes, ${urbanVn.length} urban, ${roadsVn.length} roads`,
  )

  // ——— Vietnam national map ———
  const VW = 440
  const VH = 740
  const vnProj = geoMercator().fitExtent(
    [
      [16, 16],
      [VW - 16, VH - 16],
    ],
    vietnam,
  )
  const vnPath = geoPath(vnProj)
  const landD = roundPath(vnPath(vietnam), 1)

  const vietnamSvg = svgShell({
    viewBox: `0 0 ${VW} ${VH}`,
    title: 'Vietnam',
    metaComment:
      'Natural Earth 10m country + rivers + lakes + urban areas + roads',
    body: `  <rect class="water-bg" width="100%" height="100%" />
  <g id="urban-areas">
${pathsFromFeatures(urbanVn, vnPath, 'urban', 'urban', 1)}  </g>
  <path id="vietnam-land" class="land-regions" data-type="country" data-location-id="vietnam" data-location-name="Vietnam" d="${landD}" />
  <g id="lakes">
${pathsFromFeatures(lakesVn, vnPath, 'lake', 'lake', 1)}  </g>
  <g id="rivers">
${pathsFromFeatures(riversVn, vnPath, 'river', 'river', 1)}  </g>
  <g id="roads">
${pathsFromFeatures(roadsVn.slice(0, 220), vnPath, 'road', 'road', 1)}  </g>
  <g id="locations"></g>
`,
  })
  fs.writeFileSync(path.join(OUT, 'vietnam.svg'), vietnamSvg)
  console.log('Wrote public/maps/vietnam.svg')

  const meta = {
    source: {
      country: 'Natural Earth 10m via world-atlas@2/countries-10m.json',
      rivers: 'Natural Earth 10m rivers_lake_centerlines',
      lakes: 'Natural Earth 10m lakes',
      urban: 'Natural Earth 10m urban_areas',
      roads: 'Natural Earth 10m roads',
      note: 'No regional choropleth. SVG projected with d3-geo mercator from WGS84.',
    },
    vietnam: {
      file: '/maps/vietnam.svg',
      viewBox: [0, 0, VW, VH],
      ...projectionMeta(vnProj, VW, VH),
      layers: ['land', 'urban', 'lakes', 'rivers', 'roads'],
    },
    cities: {},
  }

  // ——— City maps ———
  for (const city of CITIES) {
    const { west, south, east, north } = city
    const CW = 720
    const CH = 560
    const cityProj = fitCityProjection(west, south, east, north, CW, CH, 22)
    cityProj.clipExtent([
      [0, 0],
      [CW, CH],
    ])
    cityProj.precision(0.35)
    const cityPath = geoPath(cityProj)

    const pad = 0.04
    const riversCity = riversVn.filter((f) =>
      featureInBBox(f, west - pad, south - pad, east + pad, north + pad),
    )
    const lakesCity = lakesVn.filter((f) =>
      featureInBBox(f, west - pad, south - pad, east + pad, north + pad),
    )
    const urbanCity = urbanVn.filter((f) =>
      featureInBBox(f, west - pad, south - pad, east + pad, north + pad),
    )
    const roadsNe = roadsVn
      .filter((f) => featureInBBox(f, west - pad, south - pad, east + pad, north + pad))
      .slice(0, 120)
    const railsCity = (railFc.features || [])
      .filter((f) => featureInBBox(f, west - pad, south - pad, east + pad, north + pad))
      .slice(0, 40)

    console.log(`  OSM corridors for ${city.name}…`)
    // Brief pause between cities to reduce Overpass rate-limit failures
    await new Promise((r) => setTimeout(r, 2500))
    const osm = await fetchOsmHighways(west, south, east, north)
    const osmRoads = osm.roads.slice(0, 420)
    const osmWater = osm.waterways.slice(0, 80)
    const useOsmRoads = osmRoads.length > 12

    const coastD = roundPath(cityPath(vietnam), 2)
    const frameD = bboxFramePath(cityProj, west, south, east, north)
    const inlandFill = coastD === `M0,0L${CW},0L${CW},${CH}L0,${CH}Z`
    const isCoastal =
      ['da-nang', 'hoi-an', 'nha-trang'].includes(city.id) || (!inlandFill && coastD)

    let body = `  <rect class="${isCoastal ? 'water-bg' : 'land-bg'}" width="100%" height="100%" />\n`

    if (isCoastal && coastD && !inlandFill) {
      body += `  <path id="city-land" class="land" data-type="city-land" data-location-id="${city.id}" data-location-name="${city.name}" d="${coastD}" />\n`
    } else {
      body += `  <rect id="city-land" class="land" data-type="city-land" data-location-id="${city.id}" data-location-name="${city.name}" x="0" y="0" width="${CW}" height="${CH}" />\n`
    }

    body += `  <g id="urban-areas">\n${pathsFromFeatures(urbanCity, cityPath, 'urban', `${city.id}-urban`, 2)}  </g>\n`

    if (useOsmRoads) {
      body += `  <g id="roads">\n${pathsFromFeatures(
        osmRoads,
        cityPath,
        (f) => roadClass(f.properties?.highway),
        `${city.id}-road`,
        2,
      )}  </g>\n`
    } else {
      body += `  <g id="roads">\n${pathsFromFeatures(roadsNe, cityPath, 'road-city', `${city.id}-road`, 2)}  </g>\n`
    }

    body += `  <g id="rail">\n${pathsFromFeatures(railsCity, cityPath, 'rail', `${city.id}-rail`, 2)}  </g>\n`
    body += `  <g id="lakes">\n${pathsFromFeatures(lakesCity, cityPath, 'lake', `${city.id}-lake`, 2)}  </g>\n`
    body += `  <g id="rivers">\n${pathsFromFeatures(riversCity, cityPath, 'river-city', `${city.id}-river`, 2)}  </g>\n`
    if (osmWater.length) {
      body += `  <g id="osm-waterways">\n${pathsFromFeatures(osmWater, cityPath, 'river-city', `${city.id}-ww`, 2)}  </g>\n`
    }
    if (frameD) {
      body += `  <path class="city-frame" d="${frameD}" />\n`
    }
    body += `  <g id="locations"></g>\n`

    const citySvg = svgShell({
      viewBox: `0 0 ${CW} ${CH}`,
      title: city.name,
      metaComment: `Natural Earth + OSM corridors fitted to ${city.name}`,
      body,
    })

    fs.writeFileSync(path.join(CITIES_OUT, `${city.file}.svg`), citySvg)
    meta.cities[city.id] = {
      file: `/maps/cities/${city.file}.svg`,
      name: city.name,
      viewBox: [0, 0, CW, CH],
      bounds: { west, south, east, north },
      ...projectionMeta(cityProj, CW, CH),
      layers: ['land', 'urban', 'roads', 'rail', 'lakes', 'rivers'],
      coastal: Boolean(isCoastal),
    }
    console.log(
      `Wrote ${city.file}.svg scale=${Math.round(cityProj.scale())} (osmRoads ${osmRoads.length}, neRoads ${roadsNe.length}, rivers ${riversCity.length}, lakes ${lakesCity.length}, urban ${urbanCity.length})`,
    )
  }

  fs.writeFileSync(
    path.join(META_OUT, 'mapMeta.ts'),
    `/* Auto-generated by scripts/generate-getting-around-maps.mjs — do not edit by hand */
export type MapProjectionMeta = {
  file: string
  name?: string
  viewBox: [number, number, number, number]
  type: 'mercator'
  width: number
  height: number
  scale: number
  translate: [number, number]
  center: [number, number]
  rotate: [number, number, number]
  bounds?: { west: number; south: number; east: number; north: number }
  layers?: string[]
  coastal?: boolean
}

export type GettingAroundMapMeta = {
  source: Record<string, string>
  vietnam: MapProjectionMeta
  cities: Record<string, MapProjectionMeta>
}

export const MAP_META = ${JSON.stringify(meta, null, 2)} as GettingAroundMapMeta
`,
  )
  console.log('Wrote mapMeta.ts')
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
