import { useEffect, useMemo, useState } from 'react'
import type { PlaceId, UrbanModeId } from '../data/types'
import { URBAN_MODES } from '../data/modes'
import { getPlace, urbanCities } from '../data/places'
import { urbanModesForContext } from '../data/routes'
import { getUrbanPoint, pointsForCity, type UrbanPoint } from '../data/urbanPoints'
import {
  resolveUrbanJourney,
  selectionFromLandmark,
  selectionFromResolution,
  type UrbanJourneyResult,
  type UrbanSelection,
} from '../data/urbanIntelligence'
import {
  loadCityGeography,
  resolveHoverContext,
  resolveMapClick,
  type CityGeography,
} from '../maps/cityGeography'
import { MAP_META } from '../maps/mapMeta'
import { URBAN_POINT_META } from '../maps/locationMeta'
import { SvgTransportMap } from './SvgTransportMap'
import { ModeJumpNav } from './ModeJumpNav'
import { ModeSection } from './ModeSection'
import { ComparisonStrip } from './ComparisonStrip'

const BACKDROP =
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80'

type Props = {
  activeModeId: string | null
  onActiveMode: (id: string) => void
  selectedOptionId: string | null
  onSelectOption: (id: string) => void
}

export function UrbanWorld({
  activeModeId,
  onActiveMode,
  selectedOptionId,
  onSelectOption,
}: Props) {
  const cities = useMemo(() => urbanCities(), [])
  const [cityId, setCityId] = useState<PlaceId | null>(null)
  const [origin, setOrigin] = useState<UrbanSelection | null>(null)
  const [destination, setDestination] = useState<UrbanSelection | null>(null)
  const [panelModeId, setPanelModeId] = useState<string | null>(null)
  const [geography, setGeography] = useState<CityGeography | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [outsideNotice, setOutsideNotice] = useState<string | null>(null)
  const [mapHover, setMapHover] = useState<{
    title: string
    subtitle: string
    kind: string
  } | null>(null)

  const city = getPlace(cityId)
  const points = useMemo(() => (cityId ? pointsForCity(cityId) : []), [cityId])
  const { modes } = urbanModesForContext(cityId)
  const availableModeIds = useMemo(
    () => modes.map((m) => m.id as UrbanModeId),
    [modes],
  )

  const markers = useMemo(
    () =>
      points.map((p) => {
        const meta = URBAN_POINT_META[p.id]
        return {
          id: p.id,
          label: p.label,
          lat: p.lat,
          lng: p.lng,
          type: meta?.type || p.type,
          hint: meta?.hint || p.transportRelevance || 'Reference place',
          priority: p.priority ?? 2,
        }
      }),
    [points],
  )

  const cityMeta = cityId ? MAP_META.cities[cityId] : null

  useEffect(() => {
    if (!cityId) {
      setGeography(null)
      return
    }
    let cancelled = false
    setGeoLoading(true)
    loadCityGeography(cityId).then((geo) => {
      if (cancelled) return
      setGeography(geo)
      setGeoLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [cityId])

  const journey = useMemo(() => {
    if (!origin || !destination) return null
    return resolveUrbanJourney(origin, destination, availableModeIds)
  }, [origin, destination, availableModeIds])

  useEffect(() => {
    setPanelModeId(null)
  }, [origin?.id, destination?.id])

  function selectCity(id: PlaceId) {
    setCityId(id)
    setOrigin(null)
    setDestination(null)
    setPanelModeId(null)
    setOutsideNotice(null)
    setMapHover(null)
  }

  function applySelection(next: UrbanSelection) {
    setOutsideNotice(null)
    if (!origin || (origin && destination)) {
      setOrigin(next)
      setDestination(null)
      return
    }
    if (next.id === origin.id) return
    const sameSpot =
      Math.abs(next.lat - origin.lat) < 0.00015 && Math.abs(next.lng - origin.lng) < 0.00015
    if (sameSpot) return
    setDestination(next)
  }

  function selectLandmark(id: string) {
    const point = getUrbanPoint(id)
    if (!point) return
    applySelection(selectionFromLandmark(point))
  }

  function selectCoordinate(coord: { lat: number; lng: number }) {
    if (!cityId || !city) return

    let geo = geography
    // While assets load, use an inset of the map bounds so we never label chrome as the city
    if (!geo && cityMeta?.bounds) {
      const b = cityMeta.bounds
      geo = {
        cityId,
        cityLabel: city.label,
        bounds: b,
        sources: { boundarySource: 'Inset map extent (loading fallback)' },
        boundary: {
          type: 'Polygon',
          coordinates: [
            [
              [b.west, b.south],
              [b.east, b.south],
              [b.east, b.north],
              [b.west, b.north],
              [b.west, b.south],
            ],
          ],
        },
        districts: [],
        namedWater: [],
      }
    }

    const res = resolveMapClick(geo, cityId, city.label, coord.lat, coord.lng)
    if (!res.ok) {
      setOutsideNotice(
        res.reason === 'outside-city'
          ? `Outside ${city.label}'s supported area. Choose a point inside the mapped city.`
          : `Geographic boundary data is still loading for ${city.label}. Try again in a moment.`,
      )
      return
    }
    applySelection(selectionFromResolution(res))
  }

  function onMapPointerMove(coord: { lat: number; lng: number } | null) {
    if (!coord || !cityId || !city) {
      setMapHover(null)
      return
    }
    setMapHover(resolveHoverContext(geography, cityId, city.label, coord.lat, coord.lng))
  }

  function clearPoints() {
    setOrigin(null)
    setDestination(null)
    setPanelModeId(null)
    setOutsideNotice(null)
  }

  function jumpToMode(modeId: string, scrollTargetId?: string) {
    // Local experience modes (e.g. cyclo) have no dedicated section — keep A/B + panel only
    if (modeId.startsWith('local-') || !scrollTargetId) {
      setPanelModeId(modeId)
      return
    }
    setPanelModeId(modeId)
    onActiveMode(modeId)
    const el = document.getElementById(scrollTargetId)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const list = (cityId ? modes : URBAN_MODES).map((m) => `mode-urban-${m.id}`)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        onActiveMode(visible.target.id.replace('mode-urban-', ''))
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.15, 0.35] },
    )
    list.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [cityId, modes, onActiveMode])

  const displayModes = cityId ? modes : URBAN_MODES

  const mapStatusHint = !city
    ? null
    : outsideNotice
      ? outsideNotice
      : geoLoading
        ? 'Loading city geography…'
        : !origin
          ? 'Click anywhere inside the mapped city to choose a starting point'
          : !destination
            ? 'Now click anywhere else for your destination'
            : null

  const landmarkOriginId = origin?.kind === 'landmark' ? origin.id : null
  const landmarkDestId = destination?.kind === 'landmark' ? destination.id : null
  const freeOrigin =
    origin?.kind === 'freeform'
      ? { lat: origin.lat, lng: origin.lng, label: origin.label }
      : null
  const freeDest =
    destination?.kind === 'freeform'
      ? { lat: destination.lat, lng: destination.lng, label: destination.label }
      : null

  return (
    <section id="world-urban" className="scroll-mt-28">
      <div className="relative mb-6 overflow-hidden rounded-[20px]">
        <img src={BACKDROP} alt="" className="h-36 w-full object-cover sm:h-44" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">02</p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold text-paper">
            Urban & Short-Distance
          </h2>
        </div>
      </div>

      <p className="max-w-[56ch] text-[0.9rem] text-muted">
        Once you&apos;re in a city, the best transport changes. Distance, traffic, walkability and
        weather matter more than headline speed.
      </p>

      <div className="mt-6">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Choose a city
        </p>
        <h3 className="mt-1 font-serif text-[1.25rem] font-semibold text-ink">
          Which city are you exploring?
        </h3>
        <p className="mt-1 text-[0.82rem] text-muted">
          Open a real city map, click anywhere for Point A and Point B, then get typical transport
          intelligence.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {cities.map((c) => {
            const on = cityId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCity(c.id)}
                className={`rounded-[14px] px-3.5 py-2.5 text-[0.8rem] font-bold transition ${
                  on
                    ? 'bg-terracotta text-paper'
                    : 'bg-cream/80 text-ink ring-1 ring-ink/10 hover:bg-cream'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {!city ? (
        <div className="mt-8 rounded-[18px] bg-cream/70 px-5 py-10 text-center ring-1 ring-ink/8">
          <p className="font-serif text-[1.2rem] font-semibold text-ink">City map waiting</p>
          <p className="mx-auto mt-2 max-w-[42ch] text-[0.85rem] text-muted">
            Select a city above to open its geographic map and choose any two points inside it.
          </p>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,1fr)] lg:items-stretch lg:gap-5">
          <div className="flex min-h-[480px] flex-col lg:h-[560px] lg:min-h-[560px]">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
              Explore the city
            </p>
            <p className="mt-1 mb-2 max-w-[54ch] text-[0.78rem] text-muted">
              Click anywhere to choose a starting point, then click again for your destination. Use
              the controls beside the map for precise selection.
            </p>
            <div className="min-h-0 flex-1">
              {cityMeta ? (
                <SvgTransportMap
                  key={city.id}
                  meta={cityMeta}
                  locations={markers}
                  originId={landmarkOriginId}
                  destinationId={landmarkDestId}
                  onSelectLocation={selectLandmark}
                  enableFreeformSelect
                  onSelectCoordinate={selectCoordinate}
                  freeformOrigin={freeOrigin}
                  freeformDestination={freeDest}
                  landmarksMuted
                  fitLabel="Fit city"
                  connectionLabel="Selected connection · not a driving route"
                  showConnectionArrow
                  statusHint={mapStatusHint}
                  geoHover={mapHover}
                  onMapPointerGeo={onMapPointerMove}
                  size="workspace"
                  className="h-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-[18px] bg-cream/80 px-4 py-16 text-center ring-1 ring-ink/10">
                  <p className="text-[0.85rem] font-medium text-muted">
                    Map unavailable for this city. Use the lists to choose points.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="mt-5 flex min-h-[480px] flex-col lg:mt-0 lg:h-[560px] lg:min-h-[560px] lg:max-h-[560px]">
            <div className="min-h-0 flex-1">
              <UrbanJourneyPanel
                cityLabel={city.label}
                points={points}
                origin={origin}
                destination={destination}
                journey={journey}
                activeModeId={panelModeId ?? activeModeId}
                outsideNotice={outsideNotice}
                onDismissOutside={() => setOutsideNotice(null)}
                onSelectLandmarkFrom={selectLandmark}
                onSetOriginLandmark={(id) => {
                  const point = getUrbanPoint(id)
                  if (!point) return
                  setOrigin(selectionFromLandmark(point))
                  if (destination?.id === id) setDestination(null)
                  setOutsideNotice(null)
                }}
                onSetDestinationLandmark={(id) => {
                  const point = getUrbanPoint(id)
                  if (!point || !origin) return
                  if (id === origin.id) return
                  setDestination(selectionFromLandmark(point))
                  setOutsideNotice(null)
                }}
                onClear={clearPoints}
                onJumpMode={jumpToMode}
              />
            </div>
          </aside>
        </div>
      )}

      <div className="mt-10">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Urban modes{city ? ` · ${city.label}` : ''}
        </p>
        <ModeJumpNav
          modes={displayModes}
          activeId={activeModeId}
          onActive={onActiveMode}
          idPrefix="mode-urban"
        />

        {displayModes.map((m) => (
          <ModeSection
            key={m.id}
            mode={m}
            idPrefix="mode-urban"
            highlighted={activeModeId === m.id}
            selectedOptionId={selectedOptionId}
            onSelectOption={onSelectOption}
          />
        ))}

        <ComparisonStrip modes={displayModes} kind="urban" />
      </div>
    </section>
  )
}

function UrbanJourneyPanel({
  cityLabel,
  points,
  origin,
  destination,
  journey,
  activeModeId,
  outsideNotice,
  onDismissOutside,
  onSelectLandmarkFrom,
  onSetOriginLandmark,
  onSetDestinationLandmark,
  onClear,
  onJumpMode,
}: {
  cityLabel: string
  points: UrbanPoint[]
  origin: UrbanSelection | null
  destination: UrbanSelection | null
  journey: UrbanJourneyResult | null
  activeModeId: string | null
  outsideNotice: string | null
  onDismissOutside: () => void
  onSelectLandmarkFrom: (id: string) => void
  onSetOriginLandmark: (id: string) => void
  onSetDestinationLandmark: (id: string) => void
  onClear: () => void
  onJumpMode: (id: string, scrollTargetId?: string) => void
}) {
  if (outsideNotice && !origin) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-[18px] bg-paper ring-1 ring-terracotta/30">
        <div className="px-4 py-4">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-terracotta">
            Point A
          </p>
          <h3 className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">
            Outside {cityLabel}&apos;s supported area
          </h3>
          <p className="mt-2 text-[0.8rem] text-muted">{outsideNotice}</p>
          <button
            type="button"
            onClick={onDismissOutside}
            className="mt-4 rounded-full bg-terracotta px-3.5 py-2 text-[0.75rem] font-bold text-paper"
          >
            Select again
          </button>
        </div>
      </div>
    )
  }

  if (!origin && !destination) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-[18px] bg-cream/80 ring-1 ring-ink/8">
        <div className="px-4 py-4">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
            Explore the city
          </p>
          <h3 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
            Choose your starting point
          </h3>
          <p className="mt-1 text-[0.8rem] text-muted">
            Click anywhere inside the mapped {cityLabel} area.
          </p>
          <PointSelect
            title="From · precise"
            value={null}
            points={points}
            onChange={onSetOriginLandmark}
            compact
          />
          <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted">
            Popular shortcuts
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {points
              .filter((p) => p.popular)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectLandmarkFrom(p.id)}
                  className="rounded-full bg-paper px-2.5 py-1 text-[0.68rem] font-bold text-ink ring-1 ring-ink/10 hover:text-terracotta"
                >
                  {p.label}
                </button>
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (origin && !destination) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-[18px] bg-paper ring-1 ring-terracotta/25">
        <div className="border-b border-ink/8 px-4 py-3">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-terracotta">
            Point A
          </p>
          <h3 className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">
            📍 {origin.label}
          </h3>
          <p className="mt-0.5 text-[0.75rem] text-muted">{origin.area}</p>
          {origin.nearPlace ? (
            <p className="mt-1.5 text-[0.7rem] font-medium text-ink/80">
              Near: {origin.nearPlace.label} · ~{origin.nearPlace.km.toFixed(1)} km
            </p>
          ) : null}
          {origin.nearWater ? (
            <p className="mt-0.5 text-[0.7rem] font-medium text-ink/80">
              Near water: {origin.nearWater.name} · ~{origin.nearWater.km.toFixed(1)} km
            </p>
          ) : null}
          {outsideNotice ? (
            <p className="mt-2 rounded-[8px] bg-cream px-2 py-1.5 text-[0.7rem] text-terracotta ring-1 ring-terracotta/20">
              {outsideNotice}
            </p>
          ) : (
            <p className="mt-2 text-[0.8rem] text-muted">
              Click again to choose your destination.
            </p>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <PointSelect
            title="To · precise"
            value={null}
            points={points.filter((p) => p.id !== origin.id)}
            onChange={onSetDestinationLandmark}
            compact
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {points
              .filter((p) => p.popular && p.id !== origin.id)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSetDestinationLandmark(p.id)}
                  className="rounded-full bg-cream px-2.5 py-1 text-[0.68rem] font-bold text-ink ring-1 ring-ink/10 hover:text-terracotta"
                >
                  {p.label}
                </button>
              ))}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="mt-4 text-[0.7rem] font-bold text-terracotta hover:underline"
          >
            Clear
          </button>
        </div>
      </div>
    )
  }

  if (!journey || !origin || !destination) {
    return (
      <div className="flex h-full items-center rounded-[18px] bg-cream/80 px-4 py-5 ring-1 ring-ink/8">
        <p className="font-serif text-[1.1rem] font-semibold text-ink">Choose two places</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] bg-paper ring-1 ring-terracotta/25">
      <div className="shrink-0 border-b border-ink/8 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-terracotta">
              Your journey
            </p>
            <h3 className="mt-0.5 font-serif text-[1.1rem] font-semibold leading-tight text-ink">
              {origin.label} → {destination.label}
            </h3>
            <p className="mt-0.5 text-[0.72rem] text-muted">
              ~{journey.distanceKm.toFixed(1)} km approx. geographic distance ·{' '}
              {journey.timeOfDayLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-[8px] bg-cream px-2 py-0.5 text-[0.62rem] font-bold text-ink ring-1 ring-ink/10"
          >
            Clear
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[0.68rem]">
          <div className="rounded-[8px] bg-cream/70 px-2 py-1.5 ring-1 ring-ink/6">
            <p className="text-[0.5rem] font-bold uppercase tracking-wide text-muted">Point A</p>
            <p className="font-bold text-ink">{origin.label}</p>
            <p className="text-muted">{origin.area}</p>
          </div>
          <div className="rounded-[8px] bg-cream/70 px-2 py-1.5 ring-1 ring-ink/6">
            <p className="text-[0.5rem] font-bold uppercase tracking-wide text-muted">Point B</p>
            <p className="font-bold text-ink">{destination.label}</p>
            <p className="text-muted">{destination.area}</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <PointSelect
            title="From"
            value={origin.kind === 'landmark' ? origin.id : ''}
            points={points}
            onChange={onSetOriginLandmark}
            compact
            placeholder={origin.kind === 'freeform' ? origin.label : undefined}
          />
          <PointSelect
            title="To"
            value={destination.kind === 'landmark' ? destination.id : ''}
            points={points.filter((p) => p.id !== origin.id)}
            onChange={onSetDestinationLandmark}
            compact
            placeholder={destination.kind === 'freeform' ? destination.label : undefined}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {journey.recommendations.length ? (
          <div className="mb-3">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
              Best options
            </p>
            <div className="mt-1.5 space-y-1">
              {journey.recommendations.map((r) => {
                const opt = journey.options.find((o) => o.id === r.optionId)
                if (!opt) return null
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onJumpMode(opt.modeId, opt.scrollTargetId)}
                    className="flex w-full flex-col gap-0.5 rounded-[10px] bg-cream/80 px-2.5 py-1.5 text-left ring-1 ring-ink/8 hover:ring-terracotta/30"
                    title={r.note}
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="shrink-0 text-[0.75rem] font-bold text-ink">
                        {r.symbol} {r.label}
                      </span>
                      <span className="truncate text-[0.7rem] text-muted">
                        {opt.mode.symbol} {opt.mode.shortLabel}
                      </span>
                    </div>
                    <p className="text-[0.62rem] leading-snug text-ink/70">{r.note}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
          How you can travel
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {journey.options.map((opt) => {
            const badge =
              journey.recommendations.find((r) => r.optionId === opt.id)?.label ?? null
            const active = activeModeId === opt.modeId
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  disabled={!opt.practical}
                  onClick={() => {
                    if (!opt.practical) return
                    onJumpMode(opt.modeId, opt.scrollTargetId)
                  }}
                  className={`w-full rounded-[12px] px-2.5 py-2 text-left transition ring-1 ${
                    !opt.practical
                      ? 'cursor-default bg-cream/35 text-muted ring-ink/5 opacity-80'
                      : active
                        ? 'bg-terracotta/10 ring-terracotta/40'
                        : 'bg-cream/60 ring-ink/8 hover:bg-cream hover:ring-terracotta/25'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[0.95rem] leading-none">{opt.mode.symbol}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className="truncate text-[0.8rem] font-bold text-ink">
                          {opt.mode.shortLabel}
                        </p>
                        {badge ? (
                          <span className="shrink-0 rounded-full bg-paper px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink ring-1 ring-ink/8">
                            {badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[0.68rem] font-medium text-ink/75">
                        {opt.typicalDurationLabel} · {opt.typicalCostLabel}
                      </p>
                      <p className="mt-0.5 text-[0.62rem] text-muted">
                        {opt.trafficNote} ·{' '}
                        {opt.status === 'typical' ? 'TYPICAL' : opt.status.toUpperCase()}
                      </p>
                    </div>
                    {opt.practical ? (
                      <span className="shrink-0 text-[0.85rem] font-bold text-terracotta">→</span>
                    ) : null}
                  </div>
                  {!opt.practical ? (
                    <p className="mt-1 text-[0.65rem] text-muted">{opt.why}</p>
                  ) : (
                    <p className="mt-1 text-[0.62rem] leading-snug text-ink/65">{opt.why}</p>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {journey.insight ? (
          <div className="mt-3 rounded-[10px] bg-cream/70 px-3 py-2 ring-1 ring-ink/8">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
              What this means
            </p>
            <p className="mt-1 text-[0.72rem] leading-snug text-ink/85">{journey.insight}</p>
          </div>
        ) : null}

        <a
          href={journey.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-terracotta px-3.5 py-2 text-[0.75rem] font-bold text-paper"
        >
          Open route in Google Maps →
        </a>
        <p className="mt-1.5 text-[0.65rem] font-medium text-muted">
          Use Google Maps for live navigation and turn-by-turn directions.
        </p>
      </div>

      <p className="shrink-0 border-t border-ink/8 px-4 py-2 text-[0.68rem] font-medium text-muted">
        Select a mode to open its detailed section below.
      </p>
    </div>
  )
}

function PointSelect({
  title,
  value,
  points,
  onChange,
  disabled,
  compact,
  placeholder,
}: {
  title: string
  value: string | null
  points: UrbanPoint[]
  onChange: (id: string) => void
  disabled?: boolean
  compact?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span
        className={`font-bold uppercase tracking-[0.12em] text-muted ${
          compact ? 'text-[0.5rem]' : 'text-[0.58rem]'
        }`}
      >
        {title}
      </span>
      <select
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-[10px] border-0 bg-paper font-semibold text-ink ring-1 ring-ink/10 disabled:opacity-50 ${
          compact ? 'mt-0.5 px-2 py-1.5 text-[0.75rem]' : 'mt-1.5 px-3 py-2.5 text-[0.85rem]'
        }`}
      >
        <option value="" disabled>
          {placeholder || 'Select…'}
        </option>
        {points.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  )
}
