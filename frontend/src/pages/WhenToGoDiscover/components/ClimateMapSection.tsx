import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson'
import {
  CITY_MARKERS,
  CLIMATE_REGIONS,
  type ClimateRegionId,
} from '../data/climateRegions'
import vietnamProvincesRaw from '../data/geo/vietnam-provinces.json'
import {
  getMonthClimate,
  getRegionClimate,
  rainToColor,
  tempToColor,
  TEMP_SCALE,
  type RegionMonthClimate,
} from '../data/monthlyClimate'
import { getMonthProfile, type Level, type MonthId, MONTH_PROFILES } from '../data/months'
import { getMonthBestThings } from '../data/monthBestThings'

type ClimateLayer = 'temperature' | 'rainfall'

type ProvinceProps = {
  id: string
  province: string
  regionId: ClimateRegionId
  regionName: string
}

type Props = {
  selectedMonth: MonthId
  onSelectMonth: (month: MonthId) => void
  recommendedMonths?: MonthId[]
  /** External request to switch climate layer (e.g. from temperature metric). */
  requestedLayer?: ClimateLayer | null
  layerRequestKey?: number
}

type ViewTransform = { x: number; y: number; k: number }

const MAP_W = 640
const MAP_H = 780
const PAD = 28

const VIETNAM_GEOJSON = vietnamProvincesRaw as FeatureCollection<
  Polygon | MultiPolygon,
  ProvinceProps
>

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

function validateGeoJson(fc: FeatureCollection): string | null {
  if (!fc || fc.type !== 'FeatureCollection') {
    return 'GeoJSON root is not a FeatureCollection'
  }
  if (!Array.isArray(fc.features) || fc.features.length === 0) {
    return 'GeoJSON FeatureCollection is empty'
  }
  const g = fc.features[0]?.geometry
  if (!g || (g.type !== 'Polygon' && g.type !== 'MultiPolygon')) {
    return `Invalid geometry type: ${g?.type ?? 'missing'}`
  }
  return null
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
): string {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => ringToPath(ring, project)).join(' ')
  }
  return geometry.coordinates
    .map((poly) => poly.map((ring) => ringToPath(ring, project)).join(' '))
    .join(' ')
}

const GEO_ERROR = validateGeoJson(VIETNAM_GEOJSON)
const GEO_BOUNDS = GEO_ERROR ? null : computeBounds(VIETNAM_GEOJSON)
const PROJECT = GEO_BOUNDS ? createProjector(GEO_BOUNDS) : null

const PROVINCE_PATHS =
  PROJECT && !GEO_ERROR
    ? VIETNAM_GEOJSON.features.map((f) => ({
        id: f.properties.id,
        regionId: f.properties.regionId,
        regionName: f.properties.regionName,
        province: f.properties.province,
        d: geometryToPath(f.geometry, PROJECT),
      }))
    : []

const CITY_POINTS =
  PROJECT && !GEO_ERROR
    ? CITY_MARKERS.map((c) => {
        const [x, y] = PROJECT(c.lng, c.lat)
        return { ...c, x, y }
      })
    : []

const IDENTITY: ViewTransform = { x: 0, y: 0, k: 1 }
const DEFAULT_REGION: ClimateRegionId = 'south-central-coast'

type BarCategory = 'Low' | 'Moderate' | 'Heavy' | 'Strong'

function rainCategoryLabel(level: Level): BarCategory {
  if (level <= 2) return 'Low'
  if (level === 3) return 'Moderate'
  return 'Heavy'
}

function barFillPercent(category: BarCategory): number {
  if (category === 'Low') return 28
  if (category === 'Moderate') return 58
  return 92
}

function barAccent(category: BarCategory): string {
  if (category === 'Low') return '#6f8f6a'
  if (category === 'Moderate') return '#c17a4a'
  return '#9a3f32'
}

function windCategory(rain: Level, label: string): BarCategory {
  if (rain >= 5 || /strong|gust/i.test(label)) return 'Strong'
  if (rain >= 3 || /moderate|breezy/i.test(label)) return 'Moderate'
  return 'Low'
}

function humidityCategory(rain: Level, label: string): BarCategory {
  const t = label.toLowerCase()
  if (t.includes('very humid') || rain >= 5) return 'Heavy'
  if (t === 'humid' || rain >= 4) return 'Heavy'
  if (t.includes('moderately') || t.includes('moderate') || rain >= 3) return 'Moderate'
  return 'Low'
}

function windCategoryLabel(category: BarCategory): string {
  if (category === 'Strong') return 'Strong'
  if (category === 'Moderate') return 'Moderate'
  return 'Light'
}

function cityPackingTip(data: RegionMonthClimate): string {
  if (data.rainfallLevel >= 4) {
    return 'Pack a compact rain jacket — showers are likely this month.'
  }
  if (data.averageTemperature >= 30) {
    return 'Be sure to carry lighter clothes and stay hydrated!'
  }
  if (data.averageTemperature <= 18) {
    return 'Bring a light jacket for cooler mornings and evenings.'
  }
  if (data.rainfallLevel <= 1 && data.averageTemperature >= 26) {
    return 'Dry and warm — sunscreen, a hat, and breathable layers help a lot.'
  }
  if (data.rainfallLevel <= 2) {
    return 'Great travel days ahead — comfortable shoes and a refillable bottle go far.'
  }
  return 'Conditions shift by day — pack one flexible layer and a small umbrella just in case.'
}

export function ClimateMapSection({
  selectedMonth,
  onSelectMonth,
  recommendedMonths = [],
  requestedLayer = null,
  layerRequestKey = 0,
}: Props) {
  const monthMeta = getMonthProfile(selectedMonth)
  const climate = useMemo(() => getMonthClimate(selectedMonth), [selectedMonth])
  const bestMonthSet = useMemo(() => new Set(recommendedMonths), [recommendedMonths])

  const [layer, setLayer] = useState<ClimateLayer>('temperature')
  const [selectedRegion, setSelectedRegion] = useState<ClimateRegionId>(DEFAULT_REGION)
  const [hover, setHover] = useState<{
    id: ClimateRegionId
    x: number
    y: number
  } | null>(null)
  const [hintVisible, setHintVisible] = useState(true)
  const [cityTip, setCityTip] = useState<{
    name: string
    x: number
    y: number
    regionId: ClimateRegionId
  } | null>(null)
  const [view, setView] = useState<ViewTransform>(IDENTITY)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    if (requestedLayer) setLayer(requestedLayer)
  }, [requestedLayer, layerRequestKey])

  useEffect(() => {
    setCityTip(null)
    setSelectedRegion(DEFAULT_REGION)
    setHover(null)
  }, [selectedMonth])

  useEffect(() => {
    if (GEO_ERROR) {
      console.error('[ClimateMap] geometry failure:', GEO_ERROR)
      return
    }
    console.info(
      '[ClimateMap] SVG map ready:',
      PROVINCE_PATHS.length,
      'province paths from local GeoJSON',
    )
  }, [])

  // Non-passive wheel so zoom works without page scroll fighting the map
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const cx = ((e.clientX - rect.left) / rect.width) * MAP_W
      const cy = ((e.clientY - rect.top) / rect.height) * MAP_H
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18
      setView((v) => {
        const nextK = Math.min(8, Math.max(1, v.k * factor))
        if (nextK === v.k) return v
        const ratio = nextK / v.k
        return {
          k: nextK,
          x: cx - (cx - v.x) * ratio,
          y: cy - (cy - v.y) * ratio,
        }
      })
    }
    el.addEventListener('wheel', onWheelNative, { passive: false })
    return () => el.removeEventListener('wheel', onWheelNative)
  }, [])

  const colorByRegion = useMemo(() => {
    const map = {} as Record<ClimateRegionId, string>
    const bundle = getMonthClimate(selectedMonth)
    for (const r of CLIMATE_REGIONS) {
      const data = bundle.regions[r.id]
      map[r.id] =
        layer === 'temperature'
          ? tempToColor(data.averageTemperature)
          : rainToColor(data.rainfallLevel)
    }
    return map
  }, [selectedMonth, layer])

  const zoomBy = useCallback((factor: number, cx = MAP_W / 2, cy = MAP_H / 2) => {
    setView((v) => {
      const nextK = Math.min(8, Math.max(1, v.k * factor))
      if (nextK === v.k) return v
      const ratio = nextK / v.k
      return {
        k: nextK,
        x: cx - (cx - v.x) * ratio,
        y: cy - (cy - v.y) * ratio,
      }
    })
  }, [])

  function fitVietnam() {
    setView(IDENTITY)
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return
    const target = e.target as Element
    if (target.closest('[data-map-ui]')) return
    if (target.closest('path') || target.closest('[data-map-marker]')) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragging.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: view.x,
      originY: view.y,
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragging.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = ((e.clientX - drag.startX) / rect.width) * MAP_W
    const dy = ((e.clientY - drag.startY) / rect.height) * MAP_H
    setView((v) => ({ ...v, x: drag.originX + dx, y: drag.originY + dy }))
  }

  function onPointerUp(e: React.PointerEvent) {
    if (dragging.current?.pointerId === e.pointerId) dragging.current = null
  }

  const cityClimate = cityTip
    ? getRegionClimate(selectedMonth, cityTip.regionId)
    : null

  const mapBroken = Boolean(GEO_ERROR) || PROVINCE_PATHS.length === 0
  const regionData = selectedRegion
    ? getRegionClimate(selectedMonth, selectedRegion)
    : null
  const regionMeta = selectedRegion
    ? CLIMATE_REGIONS.find((r) => r.id === selectedRegion)
    : null

  return (
    <section className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold text-ink">
            Temperature and Rainfall in Vietnam
          </h2>
          <p className="mt-1 text-[0.88rem] text-muted">
            See how conditions shift across the country.
          </p>
        </div>
        <p className="rounded-full bg-terracotta/12 px-3.5 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-terracotta">
          {monthMeta.name}
        </p>
      </div>

      <p className="mt-3 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink/80">
        {climate.countrySummary}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Map layer
        </span>
        <LayerChip active={layer === 'temperature'} onClick={() => setLayer('temperature')}>
          <span aria-hidden>🌡</span> Temperature
        </LayerChip>
        <LayerChip active={layer === 'rainfall'} onClick={() => setLayer('rainfall')}>
          <span aria-hidden>🌧</span> Rainfall
        </LayerChip>
      </div>

      <div className="mt-4 grid items-start gap-3 lg:grid-cols-[5.75rem_minmax(0,1fr)_minmax(250px,0.92fr)]">
        {/* Month rail */}
        <aside className="rounded-[18px] bg-paper p-2 shadow-soft lg:sticky lg:top-[88px]">
          <p className="px-1.5 pb-1.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
            Month
          </p>
          <div className="flex gap-1 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-visible lg:pb-0">
            {MONTH_PROFILES.map((m) => {
              const active = m.month === selectedMonth
              const isBest = bestMonthSet.has(m.month)
              return (
                <button
                  key={m.month}
                  type="button"
                  onClick={() => onSelectMonth(m.month)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-[10px] px-2.5 py-2 text-left transition lg:w-full ${
                    active
                      ? isBest
                        ? 'bg-terracotta text-paper shadow-soft'
                        : 'bg-ink text-paper'
                      : isBest
                        ? 'bg-terracotta/15 text-terracotta ring-1 ring-terracotta/35 hover:bg-terracotta/25'
                        : 'bg-cream text-muted hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  <span className="flex items-center justify-between gap-1">
                    <span className="block text-[0.72rem] font-bold tracking-wide">{m.short}</span>
                    {isBest && (
                      <span
                        className={`text-[0.55rem] font-bold ${
                          active ? 'text-paper/80' : 'text-terracotta'
                        }`}
                      >
                        ✦
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          {recommendedMonths.length > 0 && (
            <p className="mt-2 px-1.5 text-[0.58rem] leading-snug text-muted">
              <span className="font-bold text-terracotta">✦</span> Best overall window
            </p>
          )}
        </aside>

        {/* Map */}
        <div className="relative min-w-0 overflow-hidden rounded-[24px] bg-[#c8d6ce] shadow-soft">
          <div
            ref={containerRef}
            className="relative h-[min(58vh,520px)] w-full min-h-[340px] touch-none lg:h-[min(68vh,620px)]"
            role="application"
            aria-label="Interactive Vietnam climate map"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {mapBroken ? (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <p className="max-w-[36ch] text-[0.95rem] font-semibold text-ink">
                  Map data could not be loaded.
                </p>
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                className="h-full w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <rect
                  width={MAP_W}
                  height={MAP_H}
                  fill="#c8d6ce"
                  onClick={() => {
                    setSelectedRegion(DEFAULT_REGION)
                    setCityTip(null)
                  }}
                />
                <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
                  {PROVINCE_PATHS.map((p) => {
                    const isSelected = selectedRegion === p.regionId
                    const isHover = hover?.id === p.regionId
                    return (
                      <path
                        key={p.id}
                        d={p.d}
                        fill={colorByRegion[p.regionId]}
                        fillOpacity={
                          isSelected || isHover ? 0.96 : selectedRegion ? 0.38 : 0.9
                        }
                        stroke={isSelected ? '#c45c3a' : '#2f2a26'}
                        strokeWidth={(isSelected ? 2.4 : isHover ? 1.4 : 0.7) / view.k}
                        strokeOpacity={isSelected ? 1 : 0.55}
                        className="cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                          const rect = containerRef.current?.getBoundingClientRect()
                          if (!rect) return
                          setHover({
                            id: p.regionId,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          })
                          setCityTip(null)
                        }}
                        onMouseMove={(e) => {
                          const rect = containerRef.current?.getBoundingClientRect()
                          if (!rect) return
                          setHover({
                            id: p.regionId,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          })
                        }}
                        onMouseLeave={() => setHover(null)}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRegion(p.regionId)
                          setHintVisible(false)
                        }}
                      />
                    )
                  })}

                  {CITY_POINTS.map((c) => {
                    const pinScale = 1 / Math.sqrt(view.k)
                    const selected = cityTip?.name === c.name
                    return (
                      <g
                        key={c.id}
                        data-map-marker
                        className="cursor-pointer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = containerRef.current?.getBoundingClientRect()
                          if (!rect) return
                          setCityTip({
                            name: c.name,
                            regionId: c.regionId,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          })
                          setHover(null)
                          setHintVisible(false)
                          setSelectedRegion(c.regionId)
                        }}
                      >
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={(selected ? 14 : 11) * pinScale}
                          fill={selected ? 'rgba(196,92,58,0.22)' : 'rgba(250,243,232,0.55)'}
                          stroke="none"
                        />
                        <text
                          x={c.x}
                          y={c.y + 1 * pinScale}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={selected ? 22 * pinScale : 18 * pinScale}
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          📍
                        </text>
                        <text
                          x={c.x}
                          y={c.y + 16 * pinScale}
                          textAnchor="middle"
                          fill="#2f2a26"
                          fontSize={10.5 * pinScale}
                          fontWeight={700}
                          style={{ pointerEvents: 'none' }}
                        >
                          {c.name}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </svg>
            )}

            {!mapBroken && (
              <div
                data-map-ui
                className="absolute right-3 top-3 z-10 flex flex-col overflow-hidden rounded-[4px] bg-paper shadow-soft"
              >
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => zoomBy(1.35)}
                  className="flex h-8 w-8 items-center justify-center text-[1.1rem] font-bold text-ink hover:bg-cream"
                >
                  +
                </button>
                <div className="h-px bg-ink/10" />
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => zoomBy(1 / 1.35)}
                  className="flex h-8 w-8 items-center justify-center text-[1.1rem] font-bold text-ink hover:bg-cream"
                >
                  −
                </button>
              </div>
            )}

            {!mapBroken && hintVisible && (
              <p className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1.5 text-[0.72rem] font-semibold text-paper backdrop-blur-sm">
                Click a region for local conditions.
              </p>
            )}

            {cityTip && cityClimate && (
              <div
                className="absolute z-20 w-[min(230px,78%)] rounded-[16px] bg-paper px-3.5 py-3 shadow-hero"
                style={{
                  left: Math.min(cityTip.x + 12, (containerRef.current?.clientWidth ?? 320) - 240),
                  top: Math.min(
                    Math.max(8, cityTip.y + 10),
                    (containerRef.current?.clientHeight ?? 360) - 170,
                  ),
                }}
                data-map-ui
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[0.9rem] font-bold text-ink">
                    <span aria-hidden>📍 </span>
                    {cityTip.name}
                  </p>
                  <button
                    type="button"
                    className="text-[0.9rem] font-bold leading-none text-muted hover:text-ink"
                    onClick={() => setCityTip(null)}
                    aria-label="Close city card"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-[10px] bg-cream px-2 py-1.5">
                    <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted">
                      Temp
                    </p>
                    <p className="text-[0.82rem] font-semibold text-ink">
                      {cityClimate.temperatureRange}
                    </p>
                  </div>
                  <div className="rounded-[10px] bg-cream px-2 py-1.5">
                    <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted">
                      Rain
                    </p>
                    <p className="text-[0.82rem] font-semibold text-ink">
                      {cityClimate.rainfallLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-[0.78rem] leading-snug text-ink/80">
                  {cityPackingTip(cityClimate)}
                </p>
              </div>
            )}

            <div className="absolute bottom-3 left-3 z-10 flex gap-1.5" data-map-ui>
              <button
                type="button"
                onClick={fitVietnam}
                className="rounded-full bg-paper/95 px-3 py-1.5 text-[0.72rem] font-bold text-ink shadow-soft backdrop-blur-sm hover:bg-ink hover:text-paper"
              >
                Fit Vietnam
              </button>
            </div>
          </div>
          <div className="border-t border-ink/8 bg-paper/80 px-3 py-2">
            <Legend layer={layer} />
          </div>
        </div>

        {/* Selected region card */}
        <aside className="rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/[0.06] lg:sticky lg:top-[88px] lg:max-h-[min(68vh,620px)] lg:overflow-y-auto">
          {regionData && regionMeta ? (
            <RegionClimatePanel
              month={selectedMonth}
              monthName={monthMeta.name}
              regionName={regionMeta.name}
              data={regionData}
              onClear={() => {
                setSelectedRegion(DEFAULT_REGION)
                setCityTip(null)
              }}
            />
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function RegionClimatePanel({
  month,
  monthName,
  regionName,
  data,
  onClear,
}: {
  month: MonthId
  monthName: string
  regionName: string
  data: RegionMonthClimate
  onClear: () => void
}) {
  const precipCategory = rainCategoryLabel(data.rainfallLevel)
  const windCat = windCategory(data.rainfallLevel, data.windLabel)
  const humidityCat = humidityCategory(data.rainfallLevel, data.humidityLabel)
  const bestThings = getMonthBestThings(month)

  return (
    <div className="relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sage/60 via-terracotta/50 to-sage/30"
      />

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-sage">
            {monthName}
          </p>
          <h3 className="mt-1 font-serif text-[1.25rem] font-semibold leading-tight text-ink">
            {regionName}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full px-2.5 py-1 text-[0.68rem] font-bold text-muted ring-1 ring-ink/10 transition hover:text-ink"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <ClimateMetricCard icon="🌡" label="Temperature" value={data.temperatureRange} note={data.climateLabel} />
        <ClimateBarMetricCard
          icon="💧"
          label="Precipitation"
          category={precipCategory}
          fill={barFillPercent(precipCategory)}
          accent={barAccent(precipCategory)}
          animateKey={`precip-${precipCategory}`}
        />
        <ClimateBarMetricCard
          icon="💨"
          label="Wind"
          category={windCategoryLabel(windCat)}
          fill={barFillPercent(windCat)}
          accent={barAccent(windCat)}
          animateKey={`wind-${windCat}`}
        />
        <ClimateBarMetricCard
          icon="💦"
          label="Humidity"
          category={humidityCat}
          fill={barFillPercent(humidityCat)}
          accent={barAccent(humidityCat)}
          animateKey={`humidity-${humidityCat}`}
        />
      </div>

      <p className="mt-3 rounded-[14px] bg-cream/80 px-3.5 py-3 text-[0.68rem] text-muted ring-1 ring-ink/[0.05]">
        {data.travelNote}
      </p>

      <div className="mt-3 rounded-[14px] bg-gradient-to-br from-cream to-cream/40 px-3.5 py-3 ring-1 ring-ink/[0.05]">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
          Best things to do
        </p>
        <p className="mt-2 font-serif text-[0.95rem] font-semibold leading-snug text-ink">
          {bestThings.featuredCity}
        </p>
        <p className="mt-1 text-[0.7rem] leading-snug text-ink/80">{bestThings.cityWhy}</p>
        {bestThings.bestRegions.length > 0 ? (
          <p className="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-wide text-terracotta">
            {bestThings.bestRegions.join(' · ')}
          </p>
        ) : null}

        <p className="mt-3 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-sage">
          Places to visit
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {bestThings.places.map((place) => (
            <li key={place.name} className="text-[0.72rem] leading-snug text-ink/85">
              <span className="font-semibold text-ink">{place.name}</span>
              <span className="text-muted"> · {place.city}</span>
              <span className="mt-0.5 block text-[0.68rem] text-ink/75">{place.note}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-sage">
          Experiences
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {bestThings.experiences.map((exp) => (
            <li key={exp.name} className="text-[0.72rem] leading-snug text-ink/85">
              <span className="font-semibold text-ink">{exp.name}</span>
              <span className="mt-0.5 block text-[0.68rem] text-ink/75">{exp.note}</span>
            </li>
          ))}
        </ul>

        {bestThings.bestFor.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {bestThings.bestFor.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/80"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ClimateBarMetricCard({
  icon,
  label,
  category,
  fill,
  accent,
  animateKey,
}: {
  icon: string
  label: string
  category: string
  fill: number
  accent: string
  animateKey: string
}) {
  return (
    <div className="rounded-[14px] bg-gradient-to-br from-cream to-cream/40 px-3 py-2.5 ring-1 ring-ink/[0.05]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
          <span aria-hidden>{icon} </span>
          {label}
        </p>
        <p className="text-[0.78rem] font-bold tracking-wide" style={{ color: accent }}>
          {category}
        </p>
      </div>
      <div
        className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-ink/[0.07]"
        role="meter"
        aria-label={`${label}: ${category}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={fill}
      >
        <motion.div
          key={animateKey}
          initial={{ width: 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
          }}
        />
      </div>
    </div>
  )
}

function ClimateMetricCard({
  icon,
  label,
  value,
  note,
}: {
  icon: string
  label: string
  value: string
  note: string
}) {
  return (
    <div className="rounded-[14px] bg-gradient-to-br from-cream to-cream/40 px-3 py-2.5 ring-1 ring-ink/[0.05]">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
        <span aria-hidden>{icon} </span>
        {label}
      </p>
      <p className="mt-1 text-[0.95rem] font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-[0.68rem] font-medium text-muted">{note}</p>
    </div>
  )
}

function LayerChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-bold transition ring-1 ${
        active
          ? 'bg-ink text-paper shadow-soft ring-ink'
          : 'bg-paper text-ink ring-ink/15 shadow-soft hover:bg-cream hover:ring-ink/25'
      }`}
    >
      {children}
    </button>
  )
}

function Legend({ layer }: { layer: ClimateLayer }) {
  if (layer === 'temperature') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">
          Cooler
        </span>
        <div
          className="h-2.5 w-[min(220px,50vw)] rounded-full"
          style={{
            background:
              'linear-gradient(90deg,#3b82a0,#2f9e8f,#6aaa5a,#d4c04a,#e08a3c,#c45c3a)',
          }}
        />
        <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">
          Hotter
        </span>
        <span className="text-[0.72rem] text-muted">
          {TEMP_SCALE.min}–{TEMP_SCALE.max}°C typical averages
        </span>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">Drier</span>
      <div
        className="h-2.5 w-[min(220px,50vw)] rounded-full"
        style={{
          background: 'linear-gradient(90deg,#7a9e62,#b5b85a,#d4a84b,#5b8fb8,#3a6ea5)',
        }}
      />
      <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">Wetter</span>
      <span className="text-[0.72rem] text-muted">Seasonal rainfall pattern</span>
    </div>
  )
}
