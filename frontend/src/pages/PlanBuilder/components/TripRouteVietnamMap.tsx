import { useMemo, useRef, useState } from 'react'
import type { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import {
  CITY_MARKERS,
  type CityMarker,
  type ClimateRegionId,
} from '../../WhenToGoDiscover/data/climateRegions'
import vietnamProvincesRaw from '../../WhenToGoDiscover/data/geo/vietnam-provinces.json'
import type { RouteStop } from '../lib/yourVietnam/types'

type ProvinceProps = {
  id: string
  province: string
  regionId: ClimateRegionId
  regionName: string
}

type Props = {
  route: RouteStop[]
}

const MAP_W = 640
const MAP_H = 780
const PAD = 28

const VIETNAM_GEOJSON = vietnamProvincesRaw as FeatureCollection<
  Polygon | MultiPolygon,
  ProvinceProps
>

/** Extra pins beyond the climate-map set, for common itinerary cities. */
const EXTRA_MARKERS: CityMarker[] = [
  { id: 'sapa', name: 'Sapa', lng: 103.84, lat: 22.34, regionId: 'northern-mountains' },
  { id: 'ha-long', name: 'Ha Long', lng: 107.07, lat: 20.95, regionId: 'northern-delta' },
  { id: 'nha-trang', name: 'Nha Trang', lng: 109.19, lat: 12.24, regionId: 'south-central-coast' },
  { id: 'dalat', name: 'Da Lat', lng: 108.44, lat: 11.94, regionId: 'central-highlands' },
  { id: 'phu-quoc', name: 'Phu Quoc', lng: 103.98, lat: 10.23, regionId: 'mekong-delta' },
]

const ALL_MARKERS = [...CITY_MARKERS, ...EXTRA_MARKERS]

/** City pin id → exact GeoJSON province name(s) to highlight (not whole climate region). */
const CITY_TO_PROVINCES: Record<string, string[]> = {
  hanoi: ['Ha Noi'],
  'ninh-binh': ['Ninh Bình'],
  hue: ['Thừa Thiên - Huế'],
  'da-nang': ['Đà Nẵng'],
  'hoi-an': ['Quàng Nam', 'Quảng Nam'],
  hcmc: ['Hồ Chí Minh city'],
  sapa: ['Lào Cai'],
  'ha-long': ['Quảng Ninh'],
  'nha-trang': ['Khánh Hòa'],
  dalat: ['Lâm Đồng'],
  'phu-quoc': ['Kiên Giang'],
}

function normalizeProvince(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function computeBounds(
  fc: FeatureCollection<Polygon | MultiPolygon, ProvinceProps>,
): [[number, number], [number, number]] {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  const walk = (coords: unknown): void => {
    if (!Array.isArray(coords)) return
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      minLng = Math.min(minLng, coords[0])
      maxLng = Math.max(maxLng, coords[0])
      minLat = Math.min(minLat, coords[1])
      maxLat = Math.max(maxLat, coords[1])
      return
    }
    for (const c of coords) walk(c)
  }

  for (const f of fc.features) {
    if (f.geometry) walk(f.geometry.coordinates)
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

function createProjector(bounds: [[number, number], [number, number]]) {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds
  const geoW = maxLng - minLng || 1
  const geoH = maxLat - minLat || 1
  const availW = MAP_W - PAD * 2
  const availH = MAP_H - PAD * 2
  const scale = Math.min(availW / geoW, availH / geoH)
  const offsetX = PAD + (availW - geoW * scale) / 2
  const offsetY = PAD + (availH - geoH * scale) / 2

  return (lng: number, lat: number): [number, number] => [
    offsetX + (lng - minLng) * scale,
    offsetY + (maxLat - lat) * scale,
  ]
}

function ringToPath(ring: Position[], project: (lng: number, lat: number) => [number, number]) {
  if (!ring.length) return ''
  return ring
    .map((pt, i) => {
      const [x, y] = project(pt[0], pt[1])
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
    .concat(' Z')
}

function geometryToPath(
  geometry: Polygon | MultiPolygon,
  project: (lng: number, lat: number) => [number, number],
) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => ringToPath(ring, project)).join(' ')
  }
  return geometry.coordinates
    .map((poly) => poly.map((ring) => ringToPath(ring, project)).join(' '))
    .join(' ')
}

function matchMarker(city: string, region: string): CityMarker | null {
  const q = `${city} ${region}`.toLowerCase()
  const exact = ALL_MARKERS.find((c) => c.name.toLowerCase() === city.toLowerCase())
  if (exact) return exact

  const rules: Array<[RegExp, string]> = [
    [/hanoi|hà nội|ha noi/, 'hanoi'],
    [/ninh\s*binh/, 'ninh-binh'],
    [/sapa|sa pa/, 'sapa'],
    [/ha\s*long|halong|quang ninh/, 'ha-long'],
    [/hu[eế]/, 'hue'],
    [/da\s*nang|đà\s*nẵng/, 'da-nang'],
    [/hoi\s*an|hội\s*an/, 'hoi-an'],
    [/nha\s*trang/, 'nha-trang'],
    [/da\s*lat|đà\s*lạt/, 'dalat'],
    [/phu\s*quoc|phú\s*quốc/, 'phu-quoc'],
    [/ho\s*chi\s*minh|saigon|sài\s*gòn|hcmc/, 'hcmc'],
  ]

  for (const [re, id] of rules) {
    if (re.test(q)) return ALL_MARKERS.find((c) => c.id === id) ?? null
  }
  return null
}

const BOUNDS = computeBounds(VIETNAM_GEOJSON)
const PROJECT = createProjector(BOUNDS)
const PROVINCE_PATHS = VIETNAM_GEOJSON.features.map((f) => ({
  id: f.properties.id,
  province: f.properties.province,
  provinceKey: normalizeProvince(f.properties.province),
  d: f.geometry ? geometryToPath(f.geometry, PROJECT) : '',
}))

/**
 * Same Vietnam base map as When to go — highlights only provinces for cities on the route.
 */
export function TripRouteVietnamMap({ route }: Props) {
  const [hoverCity, setHoverCity] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const visited = useMemo(() => {
    const markers: Array<CityMarker & { order: number; nights: number }> = []
    const provinceKeys = new Set<string>()
    const seen = new Set<string>()

    route.forEach((stop, order) => {
      const m = matchMarker(stop.city, stop.region)
      if (!m) return
      for (const pName of CITY_TO_PROVINCES[m.id] ?? []) {
        provinceKeys.add(normalizeProvince(pName))
      }
      if (seen.has(m.id)) {
        const existing = markers.find((x) => x.id === m.id)
        if (existing) existing.nights += stop.nights
        return
      }
      seen.add(m.id)
      markers.push({ ...m, order, nights: stop.nights })
    })

    // Keep route order from the trip (not geographic)
    markers.sort((a, b) => a.order - b.order)
    return { markers, provinceKeys }
  }, [route])

  const cityPoints = useMemo(
    () =>
      visited.markers.map((c) => {
        const [x, y] = PROJECT(c.lng, c.lat)
        return { ...c, x, y }
      }),
    [visited.markers],
  )

  const routeLabel = visited.markers.map((m) => m.name).join(' → ')

  return (
    <div className="overflow-hidden rounded-[24px] border border-ink/10 bg-paper shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/8 px-5 py-4 sm:px-6">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Your Vietnam map
          </p>
          <h3 className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">
            Cities on your trip
          </h3>
          <p className="mt-1 max-w-[48ch] text-[0.88rem] text-muted">
            Only the cities you&apos;re visiting are highlighted.
          </p>
        </div>
        {routeLabel ? (
          <p className="max-w-[36ch] text-right font-serif text-[0.95rem] font-semibold leading-snug text-ink">
            {routeLabel}
          </p>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto aspect-[640/780] w-full max-w-[520px] bg-[#c8d6ce] sm:max-w-[560px]"
      >
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Vietnam map showing cities on your itinerary"
        >
          <rect width={MAP_W} height={MAP_H} fill="#c8d6ce" />
          {PROVINCE_PATHS.map((p) => {
            const active = visited.provinceKeys.has(p.provinceKey)
            return (
              <path
                key={p.id}
                d={p.d}
                fill={active ? '#e8c4b0' : '#dfe8e2'}
                fillOpacity={active ? 0.95 : 0.72}
                stroke={active ? '#c45c3a' : '#2f2a26'}
                strokeWidth={active ? 1.6 : 0.55}
                strokeOpacity={active ? 0.9 : 0.35}
              />
            )
          })}

          {/* Soft route lines between stops in visit order */}
          {cityPoints.length > 1 && (
            <polyline
              points={cityPoints.map((c) => `${c.x},${c.y}`).join(' ')}
              fill="none"
              stroke="#c45c3a"
              strokeWidth="2.2"
              strokeOpacity="0.55"
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {cityPoints.map((c, i) => {
            const hot = hoverCity === c.id
            return (
              <g
                key={c.id}
                className="cursor-default"
                onMouseEnter={() => setHoverCity(c.id)}
                onMouseLeave={() => setHoverCity(null)}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={hot ? 16 : 13}
                  fill={hot ? 'rgba(196,92,58,0.28)' : 'rgba(250,243,232,0.7)'}
                />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={hot ? 7 : 5.5}
                  fill="#c45c3a"
                  stroke="#fffaf2"
                  strokeWidth="2"
                />
                <text
                  x={c.x}
                  y={c.y - 14}
                  textAnchor="middle"
                  fill="#3a322c"
                  fontSize="11"
                  fontWeight="700"
                  style={{ pointerEvents: 'none' }}
                >
                  {i + 1}. {c.name}
                </text>
              </g>
            )
          })}
        </svg>

        {visited.markers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/50 px-6 text-center">
            <p className="font-serif text-[1.05rem] text-ink">
              We couldn&apos;t place your stops on the map yet — city names may be outside our pin
              set.
            </p>
          </div>
        )}
      </div>

      {visited.markers.length > 0 && (
        <ul className="flex flex-wrap gap-2 border-t border-ink/8 px-5 py-4 sm:px-6">
          {visited.markers.map((m, i) => (
            <li
              key={m.id}
              className="rounded-full bg-terracotta/10 px-3 py-1.5 text-[0.78rem] font-bold text-ink ring-1 ring-terracotta/25"
            >
              <span className="text-terracotta">{i + 1}.</span> {m.name}
              <span className="ml-1.5 font-medium text-muted">
                · {m.nights} night{m.nights === 1 ? '' : 's'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
