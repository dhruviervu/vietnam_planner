/**
 * Generate Hoi An stay-map geographic layers from OpenStreetMap.
 * Output: public/maps/where-to-stay/hoi-an/*.geojson (local static assets)
 *
 * Run: node scripts/generate-hoi-an-stay-map.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'maps', 'where-to-stay', 'hoi-an')

/** Curated extent covering Old Town → An Bang / Cua Dai coast */
const BOUNDS = {
  west: 108.305,
  south: 15.855,
  east: 108.385,
  north: 15.925,
}

const ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms))
}

async function overpass(query, label) {
  for (const url of ENDPOINTS) {
    try {
      console.log(`  ${label} via ${url}…`)
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'VietnamCuratedHoiAnStayMap/1.0',
        },
        body: `data=${encodeURICommand(query)}`,
      })
      if (!res.ok) {
        console.warn(`  ${label} → ${res.status}`)
        await sleep(2500)
        continue
      }
      const json = await res.json()
      if (!json?.elements?.length) {
        console.warn(`  ${label} → empty result`)
        await sleep(1500)
        continue
      }
      return json
    } catch (err) {
      console.warn(`  ${label} failed`, err?.message || err)
      await sleep(2000)
    }
  }
  return null
}

function inBounds(lon, lat, pad = 0.002) {
  return (
    lon >= BOUNDS.west - pad &&
    lon <= BOUNDS.east + pad &&
    lat >= BOUNDS.south - pad &&
    lat <= BOUNDS.north + pad
  )
}

function wayCoords(way, pad = 0.01) {
  if (!way.geometry?.length) return null
  const coords = way.geometry
    .filter((g) => inBounds(g.lon, g.lat, pad))
    .map((g) => [g.lon, g.lat])
  return coords.length >= 2 ? coords : null
}

function wayToLine(way) {
  const coords = wayCoords(way)
  if (!coords) return null
  return {
    type: 'Feature',
    properties: {
      id: `way-${way.id}`,
      name: way.tags?.name || way.tags?.['name:en'] || null,
      highway: way.tags?.highway || null,
      waterway: way.tags?.waterway || null,
      natural: way.tags?.natural || null,
      bridge: way.tags?.bridge || null,
      tourism: way.tags?.tourism || null,
      amenity: way.tags?.amenity || null,
      place: way.tags?.place || null,
    },
    geometry: { type: 'LineString', coordinates: coords },
  }
}

/** Closed OSM ways → Polygon (water bodies, urban blocks). */
function wayToPolygon(way) {
  const coords = wayCoords(way, 0.015)
  if (!coords || coords.length < 4) return null
  const ring = [...coords]
  const [fx, fy] = ring[0]
  const [lx, ly] = ring[ring.length - 1]
  if (fx !== lx || fy !== ly) ring.push([fx, fy])
  if (ring.length < 4) return null
  return {
    type: 'Feature',
    properties: {
      id: `poly-${way.id}`,
      name: way.tags?.name || way.tags?.['name:en'] || null,
      natural: way.tags?.natural || null,
      landuse: way.tags?.landuse || null,
      waterway: way.tags?.waterway || null,
    },
    geometry: { type: 'Polygon', coordinates: [ring] },
  }
}

function nodeToPoint(node) {
  if (!inBounds(node.lon, node.lat)) return null
  const name = node.tags?.name || node.tags?.['name:en']
  if (!name) return null
  return {
    type: 'Feature',
    properties: {
      id: `node-${node.id}`,
      name,
      kind:
        node.tags?.natural === 'beach'
          ? 'beach'
          : node.tags?.tourism
            ? 'tourism'
            : node.tags?.amenity === 'marketplace' || node.tags?.shop === 'marketplace'
              ? 'market'
              : node.tags?.historic
                ? 'historic'
                : node.tags?.place
                  ? 'place'
                  : node.tags?.highway === 'bus_stop'
                    ? 'transport'
                    : 'poi',
      tourism: node.tags?.tourism || null,
      amenity: node.tags?.amenity || null,
      place: node.tags?.place || null,
      natural: node.tags?.natural || null,
    },
    geometry: { type: 'Point', coordinates: [node.lon, node.lat] },
  }
}

function simplifyLine(coords, minDist = 0.00008) {
  if (coords.length < 3) return coords
  const out = [coords[0]]
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = out[out.length - 1]
    const cur = coords[i]
    const d = Math.hypot(cur[0] - prev[0], cur[1] - prev[1])
    if (d >= minDist) out.push(cur)
  }
  out.push(coords[coords.length - 1])
  return out
}

function fc(features) {
  return { type: 'FeatureCollection', features }
}

function writeLayer(name, features, { allowEmpty = false } = {}) {
  const file = path.join(OUT, `${name}.geojson`)
  if (!features.length && !allowEmpty && fs.existsSync(file)) {
    try {
      const prev = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (prev?.features?.length) {
        console.warn(`  keep existing ${name}.geojson (${prev.features.length}) — new fetch empty`)
        return prev.features.length
      }
    } catch {
      /* rewrite */
    }
  }
  const cleaned = features.map((f) => {
    if (f.geometry.type === 'LineString') {
      return {
        ...f,
        geometry: {
          ...f.geometry,
          coordinates: simplifyLine(f.geometry.coordinates),
        },
      }
    }
    if (f.geometry.type === 'Polygon') {
      return {
        ...f,
        geometry: {
          ...f.geometry,
          coordinates: f.geometry.coordinates.map((ring) => simplifyLine(ring, 0.00012)),
        },
      }
    }
    return f
  })
  fs.writeFileSync(file, JSON.stringify(fc(cleaned)))
  console.log(`  wrote ${name}.geojson (${cleaned.length} features)`)
  return cleaned.length
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const { west, south, east, north } = BOUNDS
  const bbox = `${south},${west},${north},${east}`

  console.log('Fetching Hoi An OSM layers (sequential)…')

  const roadsQuery = `
    [out:json][timeout:180];
    (
      way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street)$"](${bbox});
    );
    out geom;
  `
  const waterQuery = `
    [out:json][timeout:180];
    (
      way["natural"="coastline"](${bbox});
      way["waterway"~"^(river|canal|stream|riverbank)$"](${bbox});
      way["natural"="water"](${bbox});
      way["landuse"="reservoir"](${bbox});
      way["natural"="bay"](${bbox});
    );
    out geom;
  `
  const urbanQuery = `
    [out:json][timeout:120];
    (
      way["landuse"~"^(residential|commercial|retail|industrial)$"](${bbox});
    );
    out geom;
  `
  const placesQuery = `
    [out:json][timeout:90];
    (
      node["place"~"^(suburb|neighbourhood|quarter|village|hamlet)$"](${bbox});
      node["natural"="beach"](${bbox});
      node["tourism"~"^(attraction|museum|viewpoint)$"](${bbox});
      node["historic"](${bbox});
      node["amenity"="marketplace"](${bbox});
      node["tourism"="information"](${bbox});
      node["name"~"Bridge|Cầu|Market|Chợ|Beach|Bãi"](${bbox});
    );
    out body;
  `

  const roadsRaw = await overpass(roadsQuery, 'roads')
  await sleep(3000)
  const waterRaw = await overpass(waterQuery, 'water')
  await sleep(3000)
  const urbanRaw = await overpass(urbanQuery, 'urban')
  await sleep(2000)
  const placesRaw = await overpass(placesQuery, 'places')

  const roadFeatures = []
  const bridgeFeatures = []
  if (roadsRaw?.elements) {
    for (const el of roadsRaw.elements) {
      if (el.type !== 'way') continue
      const f = wayToLine(el)
      if (!f) continue
      const hw = f.properties.highway
      f.properties.class =
        hw === 'motorway' || hw === 'trunk' || hw === 'primary'
          ? 'primary'
          : hw === 'secondary' || hw === 'tertiary'
            ? 'secondary'
            : 'local'
      if (el.tags?.bridge === 'yes' || el.tags?.bridge === 'viaduct') {
        bridgeFeatures.push(f)
      } else {
        roadFeatures.push(f)
      }
    }
  }

  const waterFeatures = []
  if (waterRaw?.elements) {
    for (const el of waterRaw.elements) {
      if (el.type !== 'way') continue
      const tags = el.tags || {}
      const isAreaWater =
        tags.natural === 'water' ||
        tags.natural === 'bay' ||
        tags.landuse === 'reservoir' ||
        tags.waterway === 'riverbank'
      if (isAreaWater) {
        const poly = wayToPolygon(el)
        if (poly) {
          poly.properties.class = 'waterbody'
          waterFeatures.push(poly)
          continue
        }
      }
      const f = wayToLine(el)
      if (!f) continue
      f.properties.class =
        f.properties.natural === 'coastline'
          ? 'coast'
          : f.properties.waterway === 'river'
            ? 'river'
            : f.properties.natural === 'water'
              ? 'waterbody'
              : 'channel'
      waterFeatures.push(f)
    }
  }

  const urbanFeatures = []
  if (urbanRaw?.elements) {
    for (const el of urbanRaw.elements) {
      if (el.type !== 'way') continue
      const poly = wayToPolygon(el)
      if (!poly) continue
      poly.properties.class = 'urban'
      urbanFeatures.push(poly)
    }
  }
  // Cap densest urban wash for readability
  const urbanSample =
    urbanFeatures.length > 420 ? urbanFeatures.filter((_, i) => i % 2 === 0) : urbanFeatures

  const placeFeatures = []
  if (placesRaw?.elements) {
    for (const el of placesRaw.elements) {
      if (el.type !== 'node') continue
      const f = nodeToPoint(el)
      if (f) placeFeatures.push(f)
    }
  }

  // Curated geographic area centroids (real WGS84) for labels that OSM may miss
  const curatedAreas = [
    { id: 'area-old-town', name: 'Old Town', lng: 108.3305, lat: 15.8795 },
    { id: 'area-cam-pho', name: 'Cam Pho', lng: 108.319, lat: 15.885 },
    { id: 'area-an-hoi', name: 'An Hoi', lng: 108.3315, lat: 15.8745 },
    { id: 'area-cam-nam', name: 'Cam Nam', lng: 108.333, lat: 15.866 },
    { id: 'area-cam-chau', name: 'Cam Chau', lng: 108.345, lat: 15.892 },
    { id: 'area-cam-thanh', name: 'Cam Thanh', lng: 108.352, lat: 15.876 },
    { id: 'area-an-bang', name: 'An Bang', lng: 108.338, lat: 15.914 },
    { id: 'area-cua-dai', name: 'Cua Dai', lng: 108.362, lat: 15.896 },
    { id: 'area-cam-kim', name: 'Cam Kim', lng: 108.318, lat: 15.858 },
  ].map((a) => ({
    type: 'Feature',
    properties: { id: a.id, name: a.name, kind: 'area-label', curated: true },
    geometry: { type: 'Point', coordinates: [a.lng, a.lat] },
  }))

  const curatedPois = [
    { id: 'poi-japanese-bridge', name: 'Japanese Covered Bridge', lng: 108.3269, lat: 15.8772, kind: 'historic' },
    { id: 'poi-central-market', name: 'Hoi An Market', lng: 108.3328, lat: 15.8778, kind: 'market' },
    { id: 'poi-an-bang-beach', name: 'An Bang Beach', lng: 108.3385, lat: 15.9145, kind: 'beach' },
    { id: 'poi-cua-dai-beach', name: 'Cua Dai Beach', lng: 108.365, lat: 15.894, kind: 'beach' },
    { id: 'poi-assembly-hall', name: 'Fujian Assembly Hall', lng: 108.3312, lat: 15.8786, kind: 'historic' },
    { id: 'poi-cua-dai-bridge', name: 'Cau Cua Dai', lng: 108.362, lat: 15.885, kind: 'transport' },
  ].map((p) => ({
    type: 'Feature',
    properties: { id: p.id, name: p.name, kind: p.kind, curated: true },
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
  }))

  const roadsCount = writeLayer('roads', roadFeatures)
  const bridgesCount = writeLayer('bridges', bridgeFeatures)
  const waterCount = writeLayer('waterways', waterFeatures)
  const urbanCount = writeLayer('urban', urbanSample)
  const placesCount = writeLayer('places', [...placeFeatures, ...curatedPois])
  const areasCount = writeLayer('areas', curatedAreas)

  if (roadsCount === 0 || waterCount === 0) {
    console.warn(
      'Roads/water empty after Overpass — run: npm run fetch:hoi-an-stay-map',
    )
  }

  const meta = {
    cityId: 'hoi-an',
    cityLabel: 'Hoi An',
    bounds: BOUNDS,
    projection: 'WGS84',
    source: 'OpenStreetMap via Overpass (+ curated area/POI labels)',
    generatedAt: new Date().toISOString(),
    layers: ['roads', 'bridges', 'waterways', 'urban', 'places', 'areas'],
    counts: {
      roads: roadsCount,
      bridges: bridgesCount,
      waterways: waterCount,
      urban: urbanCount,
      places: placesCount,
      areas: areasCount,
    },
  }
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2))
  console.log('Done →', OUT)
  console.log(meta.counts)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
