import { useEffect, useMemo, useState } from 'react'
import type { PlaceId } from '../data/types'
import { LONG_MODES } from '../data/modes'
import { getPlace, mapHubPlaces } from '../data/places'
import {
  connectionBadge,
  getHubMarkers,
  resolveIntercityRoute,
  type FeasibleJourney,
  type RouteIntelligenceResult,
} from '../data/routeIntelligence'
import { MAP_META } from '../maps/mapMeta'
import { VIETNAM_LOCATION_META } from '../maps/locationMeta'
import { SvgTransportMap } from './SvgTransportMap'
import { ModeJumpNav } from './ModeJumpNav'
import { ModeSection } from './ModeSection'
import { ComparisonStrip } from './ComparisonStrip'
import { HowToMoveStrip } from './HowToMoveStrip'
import { useTripBagPlaceIds } from '../lib/tripBagPlaces'
import { mapCityPin } from '../data/cityEmojis'
import { getTopology } from '../data/transportNetwork'

const QUICK_PAIRS: { originId: PlaceId; destinationId: PlaceId; label: string }[] = [
  { originId: 'hanoi', destinationId: 'da-nang', label: 'Hanoi → Da Nang' },
  { originId: 'hanoi', destinationId: 'ninh-binh', label: 'Hanoi → Ninh Binh' },
  { originId: 'hcmc', destinationId: 'dalat', label: 'HCMC → Da Lat' },
  { originId: 'da-nang', destinationId: 'hoi-an', label: 'Da Nang → Hoi An' },
  { originId: 'hcmc', destinationId: 'phu-quoc', label: 'HCMC → Phu Quoc' },
  { originId: 'hanoi', destinationId: 'phu-quoc', label: 'Hanoi → Phu Quoc' },
]

const BACKDROP =
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1400&q=80'

type EditFocus = 'auto' | 'origin' | 'destination'

type Props = {
  activeModeId: string | null
  onActiveMode: (id: string) => void
  selectedOptionId: string | null
  onSelectOption: (id: string) => void
}

export function LongDistanceWorld({
  activeModeId,
  onActiveMode,
  selectedOptionId,
  onSelectOption,
}: Props) {
  const [originId, setOriginId] = useState<PlaceId | null>(null)
  const [destinationId, setDestinationId] = useState<PlaceId | null>(null)
  const [editFocus, setEditFocus] = useState<EditFocus>('auto')
  const [snapMiss, setSnapMiss] = useState(false)
  const hubs = useMemo(() => mapHubPlaces(), [])
  const bagPlaceIds = useTripBagPlaceIds()
  const selectHubs = useMemo(() => {
    if (bagPlaceIds.size === 0) return hubs
    const filtered = hubs.filter((h) => bagPlaceIds.has(h.id))
    return filtered.length ? filtered : hubs
  }, [hubs, bagPlaceIds])

  const locations = useMemo(
    () =>
      hubs.map((p) => {
        const meta = VIETNAM_LOCATION_META[p.id]
        const inBag = bagPlaceIds.has(p.id)
        return {
          id: p.id,
          label: p.label,
          lat: p.lat,
          lng: p.lng,
          type: meta?.type,
          hint: inBag ? 'In your trip bag' : meta?.hint || 'Click to select',
          priority: inBag ? 1 : (meta?.priority ?? 3),
          emoji: mapCityPin(),
          highlighted: inBag,
        }
      }),
    [hubs, bagPlaceIds],
  )

  const intelligence = useMemo(
    () => resolveIntercityRoute(originId, destinationId),
    [originId, destinationId],
  )
  const availableModeIds = useMemo(
    () =>
      (intelligence?.journeys ?? [])
        .filter(
          (j) =>
            j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg',
        )
        .map((j) => j.modeId as string),
    [intelligence],
  )
  const origin = getPlace(originId)
  const destination = getPlace(destinationId)
  const bothSelected = Boolean(origin && destination)

  const [panelModeId, setPanelModeId] = useState<string | null>(null)

  useEffect(() => {
    setPanelModeId(null)
  }, [originId, destinationId])

  const activeJourney = useMemo(() => {
    if (!intelligence) return null
    const id = panelModeId ?? activeModeId
    return (
      intelligence.journeys.find((j) => j.modeId === id && j.status !== 'not-available') ??
      intelligence.journeys.find(
        (j) => j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg',
      ) ??
      null
    )
  }, [intelligence, panelModeId, activeModeId])

  const contextMarkers = useMemo(() => {
    const hubIds = activeJourney?.contextHubIds?.length
      ? activeJourney.contextHubIds
      : intelligence?.contextHubIds ?? []
    return getHubMarkers(hubIds).map((h) => ({
      id: h.id,
      label: h.type === 'airport' ? `✈️ ${h.name}` : h.type === 'ferry' ? `⛴️ ${h.name}` : h.name,
      lat: h.lat,
      lng: h.lng,
      type: h.type,
      hint: 'Relevant transport hub',
    }))
  }, [activeJourney, intelligence])

  useEffect(() => {
    if (!activeModeId) return
    if (!bothSelected) return
    if (!availableModeIds.includes(activeModeId)) {
      const next = availableModeIds[0]
      if (next) onActiveMode(next)
    }
  }, [activeModeId, availableModeIds, bothSelected, onActiveMode])

  function selectPlace(id: string) {
    const placeId = id as PlaceId
    setSnapMiss(false)

    if (editFocus === 'origin') {
      if (placeId === destinationId) return
      setOriginId(placeId)
      setEditFocus('auto')
      return
    }
    if (editFocus === 'destination') {
      if (placeId === originId) return
      setDestinationId(placeId)
      setEditFocus('auto')
      return
    }

    if (!originId || (originId && destinationId)) {
      setOriginId(placeId)
      setDestinationId(null)
      return
    }
    if (placeId === originId) return
    setDestinationId(placeId)
  }

  function applyPair(o: PlaceId, d: PlaceId) {
    setOriginId(o)
    setDestinationId(d)
    setEditFocus('auto')
    setSnapMiss(false)
  }

  function clearRoute() {
    setOriginId(null)
    setDestinationId(null)
    setEditFocus('auto')
    setSnapMiss(false)
  }

  function jumpToMode(modeId: string, scrollTargetId?: string) {
    setPanelModeId(modeId)
    onActiveMode(modeId)
    const el = document.getElementById(scrollTargetId ?? `mode-long-${modeId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const ids = LONG_MODES.map((m) => `mode-long-${m.id}`)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const modeId = visible.target.id.replace('mode-long-', '')
        onActiveMode(modeId)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.15, 0.35] },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [onActiveMode])

  const mapStatusHint = snapMiss
    ? 'Choose a nearby marked destination.'
    : editFocus === 'origin'
      ? 'Click the map to change origin'
      : editFocus === 'destination'
        ? 'Click the map to change destination'
        : !originId
          ? 'Click anywhere to choose a starting point'
          : !destinationId
            ? 'Now choose your destination'
            : null

  return (
    <section id="world-long" className="scroll-mt-28">
      <div className="relative mb-6 overflow-hidden rounded-[20px]">
        <img src={BACKDROP} alt="" className="h-36 w-full object-cover sm:h-44" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">01</p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold text-paper">
          Long distance (Inter City)
          </h2>
        </div>
      </div>

      <p className="max-w-[56ch] text-[0.9rem] text-muted">
        How Vietnam connects from north to south — and how to choose between speed, comfort, cost and
        flexibility.
      </p>

      <HowToMoveStrip bagPlaceIds={bagPlaceIds} />

      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)] lg:items-stretch lg:gap-5">
        <div className="flex min-h-[480px] flex-col lg:h-[560px] lg:min-h-[560px]">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
            Explore the map
          </p>
          <p className="mt-1 mb-2 max-w-[54ch] text-[0.78rem] text-muted">
            Every city stays on the map. Trip-bag cities glow with a larger pin. Click anywhere
            to choose a place, or use the selectors beside the map.
          </p>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[20px] bg-gradient-to-br from-sage/15 via-cream to-terracotta/10 shadow-[0_18px_40px_rgba(47,42,38,0.08)] ring-1 ring-ink/10">
            <SvgTransportMap
              meta={MAP_META.vietnam}
              locations={locations}
              originId={originId}
              destinationId={destinationId}
              onSelectLocation={selectPlace}
              connectionLabel="Selected connection"
              enableBackgroundSnap
              snapMaxKm={110}
              onSnapMiss={() => setSnapMiss(true)}
              showConnectionArrow
              statusHint={mapStatusHint}
              contextMarkers={bothSelected ? contextMarkers : []}
              size="workspace"
              markerVariant="pin"
              disableZoomPan
              className="h-full rounded-none ring-0"
            />
            <div className="pointer-events-none absolute bottom-3 left-3 z-[2] rounded-full bg-paper/92 px-3 py-1 text-[0.65rem] font-bold text-ink shadow-soft">
              {bagPlaceIds.size
                ? `✨ ${bagPlaceIds.size} bag ${bagPlaceIds.size === 1 ? 'city' : 'cities'} highlighted`
                : '📍 All cities · none highlighted'}
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 z-[2] rounded-full bg-paper/92 px-3 py-1 text-[0.62rem] font-bold text-ink/80 shadow-soft">
              📍 Pin = city · glow = trip bag
            </div>
          </div>
        </div>

        <aside className="mt-5 flex min-h-[480px] flex-col lg:mt-0 lg:h-[560px] lg:min-h-[560px] lg:max-h-[560px]">
          <div className="min-h-0 flex-1">
          <JourneyPanel
            origin={origin}
            destination={destination}
            originId={originId}
            destinationId={destinationId}
            hubs={selectHubs}
            intelligence={intelligence}
            activeModeId={panelModeId ?? activeModeId}
            editFocus={editFocus}
            onSelectOrigin={(id) => {
              setOriginId(id)
              if (id === destinationId) setDestinationId(null)
              setEditFocus('auto')
              setSnapMiss(false)
            }}
            onSelectDestination={(id) => {
              setDestinationId(id)
              setEditFocus('auto')
              setSnapMiss(false)
            }}
            onChangeOrigin={() => {
              setEditFocus('origin')
              setOriginId(null)
            }}
            onChangeDestination={() => {
              setEditFocus('destination')
              setDestinationId(null)
            }}
            onClear={clearRoute}
            onJumpMode={jumpToMode}
            onQuickPair={applyPair}
          />
          </div>
        </aside>
      </div>

      <div className="mt-10">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Inter-city modes
        </p>
        <ModeJumpNav
          modes={LONG_MODES}
          activeId={activeModeId}
          onActive={onActiveMode}
          idPrefix="mode-long"
        />

        {LONG_MODES.map((m) => (
          <ModeSection
            key={m.id}
            mode={m}
            idPrefix="mode-long"
            highlighted={activeModeId === m.id}
            selectedOptionId={selectedOptionId}
            onSelectOption={onSelectOption}
          />
        ))}

        <ComparisonStrip modes={LONG_MODES} kind="long" />
      </div>
    </section>
  )
}

function JourneyPanel({
  origin,
  destination,
  originId,
  destinationId,
  hubs,
  intelligence,
  activeModeId,
  editFocus,
  onSelectOrigin,
  onSelectDestination,
  onChangeOrigin,
  onChangeDestination,
  onClear,
  onJumpMode,
  onQuickPair,
}: {
  origin: ReturnType<typeof getPlace>
  destination: ReturnType<typeof getPlace>
  originId: PlaceId | null
  destinationId: PlaceId | null
  hubs: { id: PlaceId; label: string }[]
  intelligence: RouteIntelligenceResult | null
  activeModeId: string | null
  editFocus: EditFocus
  onSelectOrigin: (id: PlaceId) => void
  onSelectDestination: (id: PlaceId) => void
  onChangeOrigin: () => void
  onChangeDestination: () => void
  onClear: () => void
  onJumpMode: (id: string, scrollTargetId?: string) => void
  onQuickPair: (o: PlaceId, d: PlaceId) => void
}) {
  if (!origin && !destination) {
    return (
      <div className="flex h-full flex-col rounded-[18px] bg-cream/80 px-4 py-4 ring-1 ring-ink/8">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Choose two places
        </p>
        <h3 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
          Choose a starting point
        </h3>
        <p className="mt-1 text-[0.8rem] text-muted">
          Click the map to choose where you&apos;re leaving from.
        </p>
        <div className="mt-3">
          <PlaceSelect
            title="Origin · precise"
            value={originId}
            places={hubs}
            onChange={onSelectOrigin}
          />
        </div>
        <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted">
          Or try a corridor
        </p>
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
          {QUICK_PAIRS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onQuickPair(p.originId, p.destinationId)}
              className="shrink-0 rounded-full bg-paper px-3 py-1.5 text-[0.7rem] font-bold text-ink ring-1 ring-ink/10 hover:text-terracotta"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (origin && !destination) {
    return (
      <div className="flex h-full flex-col rounded-[18px] bg-paper px-4 py-4 ring-1 ring-terracotta/25">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-terracotta">
          Point 1 · Origin
        </p>
        <h3 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">📍 {origin.label}</h3>
        <p className="mt-1 text-[0.8rem] text-muted">Now choose where you&apos;re going.</p>
        <div className="mt-3">
          <PlaceSelect
            title="Destination · precise"
            value={destinationId}
            places={hubs.filter((p) => p.id !== origin.id)}
            onChange={onSelectDestination}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onChangeOrigin}
            className="rounded-[10px] bg-cream px-2.5 py-1 text-[0.7rem] font-bold text-ink ring-1 ring-ink/10"
          >
            Change origin
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-[10px] bg-cream px-2.5 py-1 text-[0.7rem] font-bold text-ink ring-1 ring-ink/10"
          >
            Clear
          </button>
        </div>
      </div>
    )
  }

  if (!origin && destination) {
    return (
      <div className="flex h-full flex-col rounded-[18px] bg-paper px-4 py-4 ring-1 ring-ink/10">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          {editFocus === 'origin' ? 'Change origin' : 'From'}
        </p>
        <h3 className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">
          Destination kept · 📍 {destination.label}
        </h3>
        <p className="mt-1 text-[0.8rem] text-muted">Click the map to set a new starting point.</p>
        <PlaceSelect
          title="Origin · precise"
          value={originId}
          places={hubs.filter((p) => p.id !== destination.id)}
          onChange={onSelectOrigin}
        />
        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-[0.7rem] font-bold text-terracotta hover:underline"
        >
          Clear
        </button>
      </div>
    )
  }

  if (!intelligence) {
    return (
      <div className="flex h-full items-center rounded-[18px] bg-cream/80 px-4 py-5 ring-1 ring-ink/8">
        <p className="font-serif text-[1.1rem] font-semibold text-ink">Choose two places</p>
      </div>
    )
  }

  const feasibleCount = intelligence.journeys.filter(
    (j) => j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg',
  ).length

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] bg-paper ring-1 ring-terracotta/25">
      <div className="shrink-0 border-b border-ink/8 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-terracotta">
              Your journey
            </p>
            <h3 className="mt-0.5 truncate font-serif text-[1.15rem] font-semibold leading-tight text-ink">
              {intelligence.originLabel} → {intelligence.destinationLabel}
            </h3>
            <p className="mt-0.5 text-[0.72rem] text-muted">
              {feasibleCount} realistic option{feasibleCount === 1 ? '' : 's'}
              {intelligence.geographicKm
                ? ` · ~${Math.round(intelligence.geographicKm).toLocaleString()} km geographic`
                : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={onChangeOrigin}
              className="rounded-[8px] bg-cream px-2 py-0.5 text-[0.62rem] font-bold text-ink ring-1 ring-ink/10"
            >
              Origin
            </button>
            <button
              type="button"
              onClick={onChangeDestination}
              className="rounded-[8px] bg-cream px-2 py-0.5 text-[0.62rem] font-bold text-ink ring-1 ring-ink/10"
            >
              Dest
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-[8px] bg-cream px-2 py-0.5 text-[0.62rem] font-bold text-ink ring-1 ring-ink/10"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <PlaceSelect
            title="Origin"
            value={originId}
            places={hubs}
            onChange={onSelectOrigin}
            compact
          />
          <PlaceSelect
            title="Destination"
            value={destinationId}
            places={hubs.filter((p) => p.id !== originId)}
            onChange={onSelectDestination}
            compact
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {intelligence.recommendations.length ? (
          <div className="mb-3">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
              Best options
            </p>
            <div className="mt-1.5 space-y-1">
              {intelligence.recommendations.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    const j = intelligence.journeys.find((x) => x.id === r.journeyId)
                    if (j) onJumpMode(j.modeId, j.scrollTargetId)
                  }}
                  className="flex w-full items-center gap-2 rounded-[10px] bg-cream/80 px-2.5 py-1.5 text-left ring-1 ring-ink/8 hover:ring-terracotta/30"
                  title={r.note}
                >
                  <span className="shrink-0 text-[0.75rem] font-bold text-ink">
                    {r.symbol} {r.label}
                  </span>
                  <span className="truncate text-[0.7rem] text-muted">{r.journeyTitle}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
          How you can travel
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {intelligence.journeys.map((journey) => (
            <JourneyRow
              key={journey.id}
              journey={journey}
              active={activeModeId === journey.modeId}
              badge={
                intelligence.recommendations.find((r) => r.journeyId === journey.id)?.label ?? null
              }
              onClick={() => {
                if (
                  journey.status === 'not-available' ||
                  journey.status === 'not-applicable' ||
                  journey.status === 'unknown'
                ) {
                  return
                }
                onJumpMode(journey.modeId, journey.scrollTargetId)
              }}
            />
          ))}
        </ul>

        {intelligence.whatThisMeans[0] ? (
          <div className="mt-3 rounded-[10px] bg-cream/70 px-3 py-2 ring-1 ring-ink/8">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
              What this means
            </p>
            <p className="mt-1 text-[0.72rem] leading-snug text-ink/85">
              {intelligence.whatThisMeans[0]}
            </p>
            {originId && destinationId ? (
              <p className="mt-1.5 text-[0.7rem] leading-snug text-ink/75">
                {airportBlurb(originId, destinationId, intelligence.geographicKm)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="shrink-0 border-t border-ink/8 px-4 py-2 text-[0.68rem] font-medium text-muted">
        Select a mode to open its detailed section below.
      </p>
    </div>
  )
}

function JourneyRow({
  journey,
  active,
  badge,
  onClick,
}: {
  journey: FeasibleJourney
  active: boolean
  badge: string | null
  onClick: () => void
}) {
  const unavailable =
    journey.status === 'not-available' ||
    journey.status === 'not-applicable' ||
    journey.status === 'unknown'
  const multi = journey.status === 'one-connection' || journey.status === 'multi-leg'

  return (
    <li>
      <button
        type="button"
        disabled={unavailable}
        onClick={onClick}
        className={`w-full rounded-[12px] px-2.5 py-2 text-left transition ring-1 ${
          unavailable
            ? 'cursor-default bg-cream/35 text-muted ring-ink/5 opacity-80'
            : active
              ? 'bg-terracotta/10 ring-terracotta/40'
              : 'bg-cream/60 ring-ink/8 hover:bg-cream hover:ring-terracotta/25'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[0.95rem] leading-none">{journey.mode.symbol}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="truncate text-[0.8rem] font-bold text-ink">{journey.displayTitle}</p>
              <span className="shrink-0 text-[0.65rem] font-bold text-muted">
                {connectionBadge(journey.status)}
              </span>
              {badge && !unavailable ? (
                <span className="shrink-0 rounded-full bg-paper px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink ring-1 ring-ink/8">
                  {badge}
                </span>
              ) : null}
            </div>
            {!unavailable ? (
              <p className="mt-0.5 text-[0.68rem] font-medium text-ink/75">
                {journey.typicalDurationLabel} · {journey.typicalCostLabel}
              </p>
            ) : (
              <p className="mt-0.5 text-[0.68rem] text-muted">{journey.why}</p>
            )}
          </div>
          {!unavailable ? (
            <span className="shrink-0 text-[0.85rem] font-bold text-terracotta">→</span>
          ) : null}
        </div>

        {multi && journey.legs.length > 0 ? (
          <div className="mt-1.5 rounded-[8px] bg-paper/80 px-2 py-1.5 ring-1 ring-ink/5">
            <div className="flex flex-col gap-0.5 text-[0.65rem] font-semibold text-ink/75">
              {journey.legs.map((leg, i) => (
                <span key={`${leg.fromLabel}-${leg.toLabel}-${i}`} className="flex items-start gap-1">
                  <span className="w-3 shrink-0 text-center text-muted">{i === 0 ? '📍' : '↓'}</span>
                  <span>
                    {i === 0 ? `${leg.fromLabel} → ` : ''}
                    {leg.mode === 'flight'
                      ? '✈️ '
                      : leg.mode === 'ferry'
                        ? '⛴️ '
                        : leg.mode === 'train'
                          ? '🚆 '
                          : '🚌 '}
                    {leg.toLabel}
                  </span>
                </span>
              ))}
            </div>
            {journey.why ? (
              <p className="mt-1 text-[0.62rem] font-medium text-muted">{journey.why}</p>
            ) : null}
          </div>
        ) : null}
      </button>
    </li>
  )
}

function airportBlurb(originId: PlaceId, destinationId: PlaceId, km: number | null) {
  const o = getTopology(originId)
  const d = getTopology(destinationId)
  const distance =
    km != null ? `About ${Math.round(km).toLocaleString()} km as the crow flies. ` : ''
  if (o.hasFlightAccess && d.hasFlightAccess && (km ?? 0) > 280) {
    return `${distance}Both ends have commercial airports — flying is usually the time-saver; train or sleeper coach wins if you want to skip airport process.`
  }
  if (!o.hasFlightAccess && !d.hasFlightAccess) {
    return `${distance}Neither place has a useful passenger airport. Train, coach, or a driver are the realistic tools.`
  }
  if (o.hasFlightAccess !== d.hasFlightAccess) {
    const air = o.hasFlightAccess ? originId : destinationId
    return `${distance}Only ${air.replace(/-/g, ' ')} has a nearby commercial airport, so this hop is mostly a ground link (coach, train, or driver).`
  }
  return `${distance}${o.hasRailAccess && d.hasRailAccess ? 'Rail is on the table for this pair.' : 'Compare coach vs driver on time and comfort.'}`
}

function PlaceSelect({
  title,
  value,
  places,
  onChange,
  disabled,
  compact,
}: {
  title: string
  value: PlaceId | null
  places: { id: PlaceId; label: string }[]
  onChange: (id: PlaceId) => void
  disabled?: boolean
  compact?: boolean
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
        onChange={(e) => onChange(e.target.value as PlaceId)}
        className={`w-full rounded-[10px] border-0 bg-paper font-semibold text-ink ring-1 ring-ink/10 disabled:opacity-50 ${
          compact ? 'mt-0.5 px-2 py-1.5 text-[0.75rem]' : 'mt-1.5 px-3 py-2.5 text-[0.85rem]'
        }`}
      >
        <option value="" disabled>
          Select…
        </option>
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  )
}
