/**
 * Fallback: fetch Hoi An OSM via tiled official API 0.6 map export
 * when Overpass is unavailable. Writes roads/bridges/waterways/urban.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../public/maps/where-to-stay/hoi-an')

const BOUNDS = {
  west: 108.305,
  south: 15.855,
  east: 108.385,
  north: 15.925,
}

function tiles(n = 4) {
  const tiles = []
  const dw = (BOUNDS.east - BOUNDS.west) / n
  const dh = (BOUNDS.north - BOUNDS.south) / n
  for (let iy = 0; iy < n; iy++) {
    for (let ix = 0; ix < n; ix++) {
      tiles.push([
        BOUNDS.west + ix * dw,
        BOUNDS.south + iy * dh,
        BOUNDS.west + (ix + 1) * dw,
        BOUNDS.south + (iy + 1) * dh,
      ])
    }
  }
  return tiles
}

async function fetchTileRecursive(bbox, depth = 0) {
  const [w, s, e, n] = bbox
  const url = `https://www.openstreetmap.org/api/0.6/map?bbox=${w},${s},${e},${n}`
  console.log(`${'  '.repeat(depth)}fetch ${w.toFixed(4)},${s.toFixed(4)} → ${e.toFixed(4)},${n.toFixed(4)}`)
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VietnamCuratedHoiAnStayMap/1.0' },
  })
  const text = await res.text()
  if (res.ok) {
    console.log(`${'  '.repeat(depth)}  ok bytes`, text.length)
    return [text]
  }
  if (res.status === 400 && depth < 4) {
    console.warn(`${'  '.repeat(depth)}  split (too dense)`)
    const mx = (w + e) / 2
    const my = (s + n) / 2
    const parts = []
    for (const sub of [
      [w, s, mx, my],
      [mx, s, e, my],
      [w, my, mx, n],
      [mx, my, e, n],
    ]) {
      await new Promise((r) => setTimeout(r, 400))
      parts.push(...(await fetchTileRecursive(sub, depth + 1)))
    }
    return parts
  }
  throw new Error(text)
}

function parseOsmXml(xml) {
  const nodes = new Map()
  const nodeRe = /<node id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"/g
  let m
  while ((m = nodeRe.exec(xml))) {
    nodes.set(m[1], { lat: +m[2], lon: +m[3] })
  }
  const ways = []
  const wayBlocks = xml.split('<way ').slice(1)
  for (const block of wayBlocks) {
    const idm = block.match(/^id="(\d+)"/)
    if (!idm) continue
    const id = idm[1]
    const nds = [...block.matchAll(/<nd ref="(\d+)"\/>/g)].map((x) => x[1])
    const tags = {}
    for (const t of block.matchAll(/<tag k="([^"]+)" v="([^"]*)"\/>/g)) {
      tags[t[1]] = t[2]
    }
    ways.push({ id, nds, tags })
  }
  return { nodes, ways }
}

function inBounds(lon, lat, pad = 0.002) {
  return (
    lon >= BOUNDS.west - pad &&
    lon <= BOUNDS.east + pad &&
    lat >= BOUNDS.south - pad &&
    lat <= BOUNDS.north + pad
  )
}

function simplify(coords, minDist = 0.00008) {
  if (coords.length < 3) return coords
  const out = [coords[0]]
  for (let i = 1; i < coords.length - 1; i++) {
    const p = out[out.length - 1]
    const c = coords[i]
    if (Math.hypot(c[0] - p[0], c[1] - p[1]) >= minDist) out.push(c)
  }
  out.push(coords[coords.length - 1])
  return out
}

const ROAD_HW = new Set([
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'unclassified',
  'residential',
  'living_street',
])

async function main() {
  const roads = []
  const bridges = []
  const waterways = []
  const urban = []
  const seen = new Set()

  const grid = tiles(3)
  for (let i = 0; i < grid.length; i++) {
    console.log(`tile ${i + 1}/${grid.length}`)
    const xmlParts = await fetchTileRecursive(grid[i])
    for (const xml of xmlParts) {
      const { nodes, ways } = parseOsmXml(xml)
      console.log('  parsed nodes', nodes.size, 'ways', ways.length)

      for (const way of ways) {
        if (seen.has(way.id)) continue
        seen.add(way.id)
        const coords = way.nds
          .map((id) => nodes.get(id))
          .filter(Boolean)
          .map((n) => [n.lon, n.lat])
          .filter(([lon, lat]) => inBounds(lon, lat, 0.01))
        if (coords.length < 2) continue
        const tags = way.tags

        if (tags.highway && ROAD_HW.has(tags.highway)) {
          const cls =
            tags.highway === 'motorway' ||
            tags.highway === 'trunk' ||
            tags.highway === 'primary'
              ? 'primary'
              : tags.highway === 'secondary' || tags.highway === 'tertiary'
                ? 'secondary'
                : 'local'
          const f = {
            type: 'Feature',
            properties: {
              id: `way-${way.id}`,
              name: tags.name || tags['name:en'] || null,
              highway: tags.highway,
              class: cls,
            },
            geometry: { type: 'LineString', coordinates: simplify(coords) },
          }
          if (tags.bridge === 'yes' || tags.bridge === 'viaduct') bridges.push(f)
          else roads.push(f)
        }

        if (
          tags.natural === 'coastline' ||
          tags.waterway ||
          tags.natural === 'water' ||
          tags.natural === 'bay' ||
          tags.landuse === 'reservoir'
        ) {
          const isArea =
            tags.natural === 'water' ||
            tags.natural === 'bay' ||
            tags.landuse === 'reservoir' ||
            tags.waterway === 'riverbank'
          const cls =
            tags.natural === 'coastline'
              ? 'coast'
              : tags.waterway === 'river'
                ? 'river'
                : tags.natural === 'water' || tags.natural === 'bay'
                  ? 'waterbody'
                  : 'channel'
          if (isArea && coords.length >= 4) {
            const ring = [...coords]
            if (
              ring[0][0] !== ring[ring.length - 1][0] ||
              ring[0][1] !== ring[ring.length - 1][1]
            ) {
              ring.push(ring[0])
            }
            waterways.push({
              type: 'Feature',
              properties: {
                id: `poly-${way.id}`,
                name: tags.name || null,
                class: 'waterbody',
              },
              geometry: {
                type: 'Polygon',
                coordinates: [simplify(ring, 0.00012)],
              },
            })
          } else {
            waterways.push({
              type: 'Feature',
              properties: {
                id: `way-${way.id}`,
                name: tags.name || null,
                class: cls,
              },
              geometry: { type: 'LineString', coordinates: simplify(coords) },
            })
          }
        }

        if (
          tags.landuse &&
          /^(residential|commercial|retail|industrial)$/.test(tags.landuse) &&
          coords.length >= 4
        ) {
          const ring = [...coords]
          if (
            ring[0][0] !== ring[ring.length - 1][0] ||
            ring[0][1] !== ring[ring.length - 1][1]
          ) {
            ring.push(ring[0])
          }
          urban.push({
            type: 'Feature',
            properties: { id: `poly-${way.id}`, class: 'urban' },
            geometry: {
              type: 'Polygon',
              coordinates: [simplify(ring, 0.00012)],
            },
          })
        }
      }
    }
    await new Promise((r) => setTimeout(r, 800))
  }

  function write(name, features) {
    fs.writeFileSync(
      path.join(OUT, `${name}.geojson`),
      JSON.stringify({ type: 'FeatureCollection', features }),
    )
    console.log('wrote', name, features.length)
  }

  write('roads', roads)
  write('bridges', bridges)
  write('waterways', waterways)
  const urbanSample = urban.length > 420 ? urban.filter((_, i) => i % 2 === 0) : urban
  write('urban', urbanSample)

  const metaPath = path.join(OUT, 'meta.json')
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  meta.generatedAt = new Date().toISOString()
  meta.source = 'OpenStreetMap API 0.6 map export (+ curated labels)'
  meta.layers = ['roads', 'bridges', 'waterways', 'urban', 'places', 'areas']
  meta.counts = {
    ...meta.counts,
    roads: roads.length,
    bridges: bridges.length,
    waterways: waterways.length,
    urban: urbanSample.length,
  }
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2))
  console.log('done', meta.counts)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
