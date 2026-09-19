import { useEffect, useMemo, useRef, useState } from 'react'
import type { PlaceId, UrbanModeId } from '../data/types'
import { URBAN_MODES } from '../data/modes'
import { getPlace, urbanCities } from '../data/places'
import { urbanModesForContext } from '../data/routes'
import { getUrbanPoint, pointsForCity, type UrbanPoint } from '../data/urbanPoints'
import {
  resolveUrbanJourney,
  selectionFromBagPin,
  selectionFromLandmark,
  selectionFromResolution,
  selectionFromTypedPlace,
  type UrbanJourneyResult,
  type UrbanSelection,
} from '../data/urbanIntelligence'
import {
  loadCityGeography,
  resolveMapClick,
  type CityGeography,
} from '../maps/cityGeography'
import { URBAN_POINT_META } from '../maps/locationMeta'
import { boundsForCity } from '../maps/cityBounds'
import { UrbanCityMap } from './UrbanCityMap'
import { PlaceAutocomplete } from './PlaceAutocomplete'
import { ModeJumpNav } from './ModeJumpNav'
import { ModeSection } from './ModeSection'
import { useTripBagPlaceIds } from '../lib/tripBagPlaces'
import { useTripBagUrbanPins } from '../lib/tripBagUrbanPins'
import { fetchOsrmRoutes, type OsrmRouteResult } from '../lib/osrmRoute'
import { cityProviderUrl } from '../lib/cityProviderUrl'
import { detectUrbanSeaHop } from '../lib/islandMainland'
import type { AutocompleteLocalPlace, PlaceSuggestion } from '../lib/placeSuggestions'

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
  const bagPlaceIds = useTripBagPlaceIds()
  const [cityId, setCityId] = useState<PlaceId | null>(
    () => urbanCities()[0]?.id ?? 'hanoi',
  )
  const [origin, setOrigin] = useState<UrbanSelection | null>(null)
  const [destination, setDestination] = useState<UrbanSelection | null>(null)
  const [panelModeId, setPanelModeId] = useState<string | null>(null)
  const [geography, setGeography] = useState<CityGeography | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [outsideNotice, setOutsideNotice] = useState<string | null>(null)
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState('')
  const [fromError, setFromError] = useState<string | null>(null)
  const [toError, setToError] = useState<string | null>(null)
  const [osrmRoute, setOsrmRoute] = useState<OsrmRouteResult | null>(null)
  const [osrmFailed, setOsrmFailed] = useState(false)
  const [focusNonce, setFocusNonce] = useState(0)
  const mapSelectGen = useRef(0)

  useEffect(() => {
    if (cities.length === 0) return
    if (!cityId || !cities.some((c) => c.id === cityId)) {
      setCityId(cities[0].id)
    }
  }, [cities, cityId])

  const city = getPlace(cityId)
  const { pins: bagPins, loading: bagPinsLoading, hasBagItems } = useTripBagUrbanPins(
    cityId,
    city?.label ?? null,
  )
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

  const cityBounds = city
    ? boundsForCity(city.id, { lat: city.lat, lng: city.lng, mapZoom: city.mapZoom })
    : null

  const searchLocals = useMemo<AutocompleteLocalPlace[]>(() => {
    const fromBag = bagPins.map((p) => ({
      id: p.id,
      label: p.label,
      subtitle: 'In your trip bag',
      lat: p.lat,
      lng: p.lng,
      source: 'bag' as const,
      popular: true,
    }))
    const fromPoints = points.map((p) => ({
      id: p.id,
      label: p.label,
      subtitle: p.area || p.district || city?.label,
      lat: p.lat,
      lng: p.lng,
      source: 'landmark' as const,
      popular: Boolean(p.popular),
    }))
    return [...fromBag, ...fromPoints]
  }, [bagPins, points, city?.label])

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
    const seaHop = detectUrbanSeaHop(origin, destination)
    return resolveUrbanJourney(
      origin,
      destination,
      availableModeIds,
      undefined,
      seaHop
        ? undefined
        : {
            roadKm: osrmRoute?.drivingKm,
            footKm: osrmRoute?.footKm,
            footMinutes: osrmRoute?.footMinutes,
            drivingMinutes: osrmRoute?.drivingMinutes,
            estimated: !osrmRoute,
          },
    )
  }, [origin, destination, availableModeIds, osrmRoute, osrmFailed])

  useEffect(() => {
    if (origin) setFromQuery(origin.label)
    else setFromQuery('')
  }, [origin?.id, origin?.label])

  useEffect(() => {
    if (destination) setToQuery(destination.label)
    else setToQuery('')
  }, [destination?.id, destination?.label])

  useEffect(() => {
    if (!origin || !destination) {
      setOsrmRoute(null)
      setOsrmFailed(false)
      return
    }
    if (detectUrbanSeaHop(origin, destination)) {
      setOsrmRoute(null)
      setOsrmFailed(false)
      return
    }
    let cancelled = false
    setOsrmRoute(null)
    setOsrmFailed(false)
    fetchOsrmRoutes(origin, destination).then((result) => {
      if (cancelled) return
      if (result) {
        setOsrmRoute(result)
        setOsrmFailed(false)
      } else {
        setOsrmFailed(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng])

  useEffect(() => {
    setPanelModeId(null)
  }, [origin?.id, destination?.id])

  function selectCity(id: PlaceId) {
    setCityId(id)
    setOrigin(null)
    setDestination(null)
    setPanelModeId(null)
    setOutsideNotice(null)
    setFromQuery('')
    setToQuery('')
    setFromError(null)
    setToError(null)
    setOsrmRoute(null)
    setOsrmFailed(false)
    setFocusNonce(0)
  }

  function sameSpot(a: UrbanSelection, b: UrbanSelection) {
    return (
      a.id === b.id ||
      (Math.abs(a.lat - b.lat) < 0.00015 && Math.abs(a.lng - b.lng) < 0.00015)
    )
  }

  function applySelection(next: UrbanSelection) {
    mapSelectGen.current += 1
    setOutsideNotice(null)
    setFromError(null)
    setToError(null)
    if (!origin || (origin && destination)) {
      setOrigin(next)
      setDestination(null)
      return
    }
    if (sameSpot(next, origin)) return
    setDestination(next)
  }

  function selectionFromSuggestion(hit: PlaceSuggestion): UrbanSelection | null {
    if (!cityId || !city) return null
    if (hit.source === 'landmark' && hit.localId) {
      const point = getUrbanPoint(hit.localId)
      if (point) return selectionFromLandmark(point)
    }
    if (hit.source === 'bag' && hit.localId) {
      const bag = bagPins.find((p) => p.id === hit.localId)
      if (bag) return selectionFromBagPin(bag, cityId, city.label)
    }
    return selectionFromTypedPlace(
      hit.title,
      hit.lat,
      hit.lng,
      cityId,
      city.label,
      hit.subtitle || city.label,
    )
  }

  function applyPlacePick(slot: 'from' | 'to', hit: PlaceSuggestion) {
    const sel = selectionFromSuggestion(hit)
    if (!sel) return
    mapSelectGen.current += 1
    setOutsideNotice(null)
    setFromError(null)
    setToError(null)
    if (slot === 'from') {
      setOrigin(sel)
      setFromQuery(sel.label)
      if (destination && sameSpot(sel, destination)) setDestination(null)
    } else {
      if (origin && sameSpot(sel, origin)) {
        setToError('Pick a different place from your start')
        return
      }
      setDestination(sel)
      setToQuery(sel.label)
    }
    setFocusNonce((n) => n + 1)
  }

  function selectLandmark(id: string) {
    const bag = bagPins.find((p) => p.id === id)
    if (bag && cityId && city) {
      applySelection(selectionFromBagPin(bag, cityId, city.label))
      return
    }
    const point = getUrbanPoint(id)
    if (!point) return
    applySelection(selectionFromLandmark(point))
  }

  function selectCoordinate(coord: { lat: number; lng: number }) {
    if (!cityId || !city) return

    let geo = geography
    // While assets load, use an inset of the map bounds so we never label chrome as the city
    if (!geo && cityBounds) {
      const b = cityBounds
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

  function clearPoints() {
    setOrigin(null)
    setDestination(null)
    setPanelModeId(null)
    setOutsideNotice(null)
    setFromQuery('')
    setToQuery('')
    setFromError(null)
    setToError(null)
    setOsrmRoute(null)
    setOsrmFailed(false)
  }

  function jumpToMode(modeId: string, scrollTargetId?: string) {
    // Local experience / walking have no encyclopedia section — keep A/B + panel only
    if (modeId.startsWith('local-') || modeId === 'walking' || !scrollTargetId) {
      setPanelModeId(modeId)
      return
    }
    setPanelModeId(modeId)
    onActiveMode(modeId)
    const el = document.getElementById(scrollTargetId)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const displayModes = (cityId ? modes : URBAN_MODES).filter((m) => m.id !== 'walking')

  useEffect(() => {
    const list = displayModes.map((m) => `mode-urban-${m.id}`)
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
  }, [cityId, displayModes, onActiveMode])

  const mapStatusHint = !city
    ? null
    : outsideNotice
      ? outsideNotice
      : geoLoading
        ? 'Loading city geography…'
        : bagPinsLoading && hasBagItems
          ? 'Placing trip-bag spots on the map…'
          : osrmFailed && origin && destination
            ? 'Routing is estimated — street directions unavailable right now'
            : !origin
              ? hasBagItems
                ? 'Click a trip-bag pin or anywhere inside the mapped city for Point A'
                : 'Click anywhere inside the mapped city to choose a starting point'
              : !destination
                ? 'Now click anywhere else for your destination'
                : null

  const urbanMapMarkers = useMemo(
    () =>
      markers.map((m) => ({
        id: m.id,
        label: m.label,
        lat: m.lat,
        lng: m.lng,
        hint: m.hint,
        role: 'landmark' as const,
      })),
    [markers],
  )

  const urbanBagMarkers = useMemo(
    () =>
      bagPins.map((p) => ({
        id: p.id,
        label: p.label,
        lat: p.lat,
        lng: p.lng,
        role: 'bag' as const,
      })),
    [bagPins],
  )

  const pinOriginId = origin && origin.kind !== 'freeform' ? origin.id : null
  const pinDestId = destination && destination.kind !== 'freeform' ? destination.id : null
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
          Urban and short distance (Inside a city)
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
          Choose a City
        </h3>
        <p className="mt-1 text-[0.82rem] text-muted">
          Every city we cover — pick one, then search any two places or tap the map.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {cities.map((c) => {
            const on = cityId === c.id
            const inBag = bagPlaceIds.has(c.id)
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
                {inBag ? (
                  <span
                    className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                      on ? 'bg-paper/90' : 'bg-terracotta'
                    }`}
                    title="In your trip"
                  />
                ) : null}
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
              {hasBagItems
                ? 'Trip-bag places in this city are marked. Search any address on the right, tap two pins, or click the map.'
                : 'Search any place on the right — hotels, streets, sights — or click the map for Point A, then Point B.'}
            </p>
            <div className="min-h-0 flex-1">
              <UrbanCityMap
                key={city.id}
                cityId={city.id}
                cityLabel={city.label}
                center={{ lat: city.lat, lng: city.lng }}
                zoom={city.mapZoom ?? 13}
                markers={urbanMapMarkers}
                bagPins={urbanBagMarkers}
                originId={pinOriginId}
                destinationId={pinDestId}
                freeformOrigin={freeOrigin}
                freeformDestination={freeDest}
                routePath={osrmRoute?.geometry ?? null}
                routeEstimated={osrmFailed && !osrmRoute}
                statusHint={mapStatusHint}
                onSelectLocation={selectLandmark}
                onSelectCoordinate={selectCoordinate}
                focusNonce={focusNonce}
                focusOrigin={origin ? { lat: origin.lat, lng: origin.lng } : null}
                focusDestination={destination ? { lat: destination.lat, lng: destination.lng } : null}
              />
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
                fromQuery={fromQuery}
                toQuery={toQuery}
                fromError={fromError}
                toError={toError}
                searchLocals={searchLocals}
                searchBias={{ lat: city.lat, lng: city.lng, cityLabel: city.label }}
                routingEstimated={Boolean(journey?.routeEstimated)}
                onFromQuery={setFromQuery}
                onToQuery={setToQuery}
                onPickFrom={(hit) => applyPlacePick('from', hit)}
                onPickTo={(hit) => applyPlacePick('to', hit)}
                onClearFrom={() => {
                  setOrigin(null)
                  setFromError(null)
                }}
                onClearTo={() => {
                  setDestination(null)
                  setToError(null)
                }}
                onDismissOutside={() => setOutsideNotice(null)}
                onSelectLandmarkFrom={selectLandmark}
                onSetOriginLandmark={(id) => {
                  const point = getUrbanPoint(id)
                  if (!point) return
                  setOrigin(selectionFromLandmark(point))
                  if (destination?.id === id) setDestination(null)
                  setOutsideNotice(null)
                  setFromError(null)
                }}
                onSetDestinationLandmark={(id) => {
                  const point = getUrbanPoint(id)
                  if (!point || !origin) return
                  if (id === origin.id) return
                  setDestination(selectionFromLandmark(point))
                  setOutsideNotice(null)
                  setToError(null)
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

        <div className="mt-6 space-y-12">
          {displayModes.map((m) => (
            <ModeSection
              key={m.id}
              mode={m}
              idPrefix="mode-urban"
              highlighted={activeModeId === m.id}
              selectedOptionId={selectedOptionId}
              onSelectOption={onSelectOption}
              bookingHref={
                bagPlaceIds.size > 0 && city
                  ? (option) => cityProviderUrl(option.bookingUrl, city.label)
                  : undefined
              }
            />
          ))}
        </div>
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
  fromQuery,
  toQuery,
  fromError,
  toError,
  searchLocals,
  searchBias,
  routingEstimated,
  onFromQuery,
  onToQuery,
  onPickFrom,
  onPickTo,
  onClearFrom,
  onClearTo,
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
  fromQuery: string
  toQuery: string
  fromError: string | null
  toError: string | null
  searchLocals: AutocompleteLocalPlace[]
  searchBias: { lat: number; lng: number; cityLabel: string }
  routingEstimated: boolean
  onFromQuery: (v: string) => void
  onToQuery: (v: string) => void
  onPickFrom: (hit: PlaceSuggestion) => void
  onPickTo: (hit: PlaceSuggestion) => void
  onClearFrom: () => void
  onClearTo: () => void
  onDismissOutside: () => void
  onSelectLandmarkFrom: (id: string) => void
  onSetOriginLandmark: (id: string) => void
  onSetDestinationLandmark: (id: string) => void
  onClear: () => void
  onJumpMode: (id: string, scrollTargetId?: string) => void
}) {
  const fieldNotice = fromError || toError || outsideNotice

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] bg-paper ring-1 ring-ink/8">
      <div className="shrink-0 border-b border-ink/8 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
              Your journey
            </p>
            <h3 className="mt-0.5 font-serif text-[1.1rem] font-semibold leading-tight text-ink">
              {origin && destination
                ? `${origin.label} → ${destination.label}`
                : origin
                  ? 'Choose a destination'
                  : `Places in ${cityLabel}`}
            </h3>
          </div>
          {origin || destination ? (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 rounded-[8px] bg-cream px-2 py-0.5 text-[0.62rem] font-bold text-ink ring-1 ring-ink/10"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="mt-2 space-y-1.5">
          <PlaceAutocomplete
            title="From"
            value={fromQuery}
            placeholder="Search any place"
            bias={searchBias}
            localPlaces={searchLocals}
            error={fromError}
            onChange={onFromQuery}
            onSelect={onPickFrom}
            onClear={onClearFrom}
          />
          <PlaceAutocomplete
            title="To"
            value={toQuery}
            placeholder="Search any place"
            bias={searchBias}
            localPlaces={searchLocals}
            error={toError}
            onChange={onToQuery}
            onSelect={onPickTo}
            onClear={onClearTo}
          />
        </div>

        {fieldNotice ? (
          <p className="mt-2 rounded-[8px] bg-cream px-2 py-1.5 text-[0.72rem] text-terracotta ring-1 ring-terracotta/20">
            {fieldNotice}
            {outsideNotice && !origin ? (
              <button
                type="button"
                onClick={onDismissOutside}
                className="ml-2 font-bold underline"
              >
                Dismiss
              </button>
            ) : null}
          </p>
        ) : origin && !destination ? (
          <p className="mt-2 text-[0.78rem] text-muted">
            Type a destination, or click a second point on the map.
          </p>
        ) : !origin ? (
          <p className="mt-2 text-[0.78rem] text-muted">
            Search any two places, click trip-bag pins, or tap the map.
          </p>
        ) : journey ? (
          <p className="mt-2 text-[0.72rem] text-muted">
            ~{journey.distanceKm.toFixed(journey.seaCrossing ? 0 : 1)} km
            {journey.seaCrossing
              ? ' across water'
              : routingEstimated
                ? ' estimated'
                : ' by road'}{' '}
            · {journey.timeOfDayLabel}
          </p>
        ) : null}

        {origin && destination ? (
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
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {journey && origin && destination ? (
          <>
            {journey.recommendations.length ? (
              <div className="mb-3">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
                  Best options
                </p>
                {journey.seaCrossing ? (
                  <p className="mt-1 rounded-[8px] bg-terracotta/10 px-2 py-1.5 text-[0.65rem] font-medium leading-snug text-ink ring-1 ring-terracotta/20">
                    This is a water crossing. Scooter, bike, and walking cannot complete it — use a
                    flight, or taxi/scooter only as far as the pier then the ferry.
                  </p>
                ) : routingEstimated ? (
                  <p className="mt-1 text-[0.65rem] text-muted">
                    Routing is estimated — times use a straight-line distance.
                  </p>
                ) : null}
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
                      <p className="mt-1 text-[0.62rem] leading-snug text-ink/65">{opt.why}</p>
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
          </>
        ) : (
          <>
            <PointSelect
              title={origin ? 'To · landmark' : 'From · landmark'}
              value={null}
              points={origin ? points.filter((p) => p.id !== origin.id) : points}
              onChange={origin ? onSetDestinationLandmark : onSetOriginLandmark}
              compact
            />
            <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted">
              Popular shortcuts
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {points
                .filter((p) => p.popular && p.id !== origin?.id)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      origin ? onSetDestinationLandmark(p.id) : onSelectLandmarkFrom(p.id)
                    }
                    className="rounded-full bg-cream px-2.5 py-1 text-[0.68rem] font-bold text-ink ring-1 ring-ink/10 hover:text-terracotta"
                  >
                    {p.label}
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      {journey ? (
        <p className="shrink-0 border-t border-ink/8 px-4 py-2 text-[0.68rem] font-medium text-muted">
          Select a mode to open its detailed section below.
        </p>
      ) : null}
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
