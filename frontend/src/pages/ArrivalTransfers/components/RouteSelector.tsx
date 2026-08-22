import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Airport, AirportId, Destination, TransferDirection } from '../data/types'
import { AIRPORTS, getDestinationsForAirport } from '../data/catalog'

type TripSuggestion = {
  destinationId: string
  label: string
  note: string
}

type Props = {
  airports: Airport[]
  airportId: AirportId | null
  destinationId: string | null
  destinations: Destination[]
  direction: TransferDirection
  tripSuggestions?: TripSuggestion[]
  onSelectAirport: (id: AirportId | null) => void
  onSelectDestination: (id: string) => void
  onSwap: () => void
}

export function RouteSelector({
  airports,
  airportId,
  destinationId,
  destinations,
  direction,
  tripSuggestions = [],
  onSelectAirport,
  onSelectDestination,
  onSwap,
}: Props) {
  const [openSide, setOpenSide] = useState<'airport' | 'destination' | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const airport = airportId ? airports.find((a) => a.id === airportId) ?? null : null
  const destination = destinationId
    ? destinations.find((d) => d.id === destinationId) ?? null
    : null

  const inbound = direction === 'inbound'
  const leftKind: 'airport' | 'destination' = inbound ? 'airport' : 'destination'
  const rightKind: 'airport' | 'destination' = inbound ? 'destination' : 'airport'

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpenSide(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenSide(null)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const popularDestinations = useMemo(() => {
    const pool = airportId ? getDestinationsForAirport(airportId) : destinations
    const popular = pool.filter((d) => d.popularBase)
    return (popular.length ? popular : pool).slice(0, 8)
  }, [airportId, destinations])

  const cityName = airport?.city ?? popularDestinations[0]?.city ?? 'Vietnam'

  return (
    <section id="route-selector" aria-labelledby={titleId} ref={rootRef} className="scroll-mt-28">
      <h2
        id={titleId}
        className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted"
      >
        Your route
      </h2>
      <p className="mt-1 max-w-[52ch] text-[0.82rem] text-muted">
        Optional — pick an airport and destination to personalize times, availability and options.
      </p>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        <RouteEndpoint
          kind={leftKind}
          airport={airport}
          destination={destination}
          active={openSide === leftKind}
          onOpen={() => setOpenSide((s) => (s === leftKind ? null : leftKind))}
          roleLabel={inbound ? 'Origin' : 'Origin'}
        />

        <SwapRouteButton onClick={onSwap} />

        <RouteEndpoint
          kind={rightKind}
          airport={airport}
          destination={destination}
          active={openSide === rightKind}
          onOpen={() => setOpenSide((s) => (s === rightKind ? null : rightKind))}
          roleLabel={inbound ? 'Destination' : 'Destination'}
        />
      </div>

      {airport ? (
        <p className="mt-2 hidden text-[0.72rem] font-medium text-muted sm:block">
          <span className="text-ink/70">
            {airport.code} · {airport.city}
          </span>
          <span className="mx-2 text-ink/25">·</span>
          <span className="text-ink/70">
            {destination ? `${destination.label} · ${destination.city}` : 'Choose a destination'}
          </span>
        </p>
      ) : null}

      {openSide === 'airport' ? (
        <AirportMenu
          airports={airports}
          airportId={airportId}
          onSelect={(id) => {
            onSelectAirport(id)
            setOpenSide(null)
          }}
          onClear={() => {
            onSelectAirport(null)
            setOpenSide(null)
          }}
        />
      ) : null}

      {openSide === 'destination' ? (
        <DestinationMenu
          cityName={cityName}
          airportId={airportId}
          destinationId={destinationId}
          popular={popularDestinations}
          allForAirport={airportId ? getDestinationsForAirport(airportId) : []}
          tripSuggestions={tripSuggestions.filter((t) =>
            airportId
              ? getDestinationsForAirport(airportId).some((d) => d.id === t.destinationId)
              : true,
          )}
          airports={AIRPORTS}
          onSelect={(id, impliedAirport) => {
            if (impliedAirport && impliedAirport !== airportId) onSelectAirport(impliedAirport)
            onSelectDestination(id)
            setOpenSide(null)
          }}
        />
      ) : null}
    </section>
  )
}

function SwapRouteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Swap origin and destination"
      className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-[1.05rem] font-bold text-terracotta ring-1 ring-ink/10 transition hover:bg-terracotta hover:text-paper hover:ring-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta sm:mx-0"
    >
      <span className="sm:hidden" aria-hidden>
        ⇅
      </span>
      <span className="hidden sm:inline" aria-hidden>
        ⇄
      </span>
    </button>
  )
}

function RouteEndpoint({
  kind,
  airport,
  destination,
  active,
  onOpen,
  roleLabel,
}: {
  kind: 'airport' | 'destination'
  airport: Airport | null
  destination: Destination | null
  active: boolean
  onOpen: () => void
  roleLabel: string
}) {
  const isAirport = kind === 'airport'
  const overline = isAirport ? 'Airport' : 'Destination'
  const icon = isAirport ? '✈️' : '📍'
  const title = isAirport
    ? airport
      ? `${airport.name} · ${airport.code}`
      : 'Choose airport'
    : destination
      ? destination.label
      : airport
        ? 'Choose destination'
        : 'Choose destination'
  const support = isAirport
    ? airport
      ? airport.city
      : 'Vietnam · typical'
    : destination
      ? destination.city
      : airport
        ? airport.cityHubLabel
        : 'City / area'

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={active}
      aria-haspopup="listbox"
      aria-label={`${roleLabel}: ${overline}. ${title}`}
      className={`min-w-0 flex-1 rounded-[16px] px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
        active
          ? 'bg-terracotta/10 ring-2 ring-terracotta'
          : 'bg-cream/70 ring-1 ring-ink/8 hover:bg-cream hover:ring-ink/14'
      }`}
    >
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
        {icon} {overline}
      </p>
      <p className="mt-1 truncate font-serif text-[1.05rem] font-semibold leading-tight text-ink">
        {title}
      </p>
      <p className="mt-0.5 truncate text-[0.72rem] font-medium text-muted">{support}</p>
    </button>
  )
}

function AirportMenu({
  airports,
  airportId,
  onSelect,
  onClear,
}: {
  airports: Airport[]
  airportId: AirportId | null
  onSelect: (id: AirportId) => void
  onClear: () => void
}) {
  return (
    <div
      role="listbox"
      aria-label="Select airport"
      className="mt-3 overflow-hidden rounded-[16px] bg-paper ring-1 ring-ink/10"
    >
      <button
        type="button"
        role="option"
        aria-selected={!airportId}
        onClick={onClear}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-cream/80 ${
          !airportId ? 'bg-terracotta/10' : ''
        }`}
      >
        <span className="text-[0.85rem] font-bold text-ink">Vietnam · Typical</span>
        <span className="text-[0.72rem] text-muted">Browse without a specific airport</span>
      </button>
      {airports.map((a) => {
        const on = airportId === a.id
        return (
          <button
            key={a.id}
            type="button"
            role="option"
            aria-selected={on}
            onClick={() => onSelect(a.id)}
            className={`flex w-full items-center gap-3 border-t border-ink/6 px-4 py-3 text-left transition hover:bg-cream/80 ${
              on ? 'bg-terracotta/10' : ''
            }`}
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[10px]">
              <img src={a.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.88rem] font-bold text-ink">
                {a.name} · {a.code}
              </p>
              <p className="truncate text-[0.72rem] font-medium text-muted">{a.transferHint}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function DestinationMenu({
  cityName,
  airportId,
  destinationId,
  popular,
  allForAirport,
  tripSuggestions,
  airports,
  onSelect,
}: {
  cityName: string
  airportId: AirportId | null
  destinationId: string | null
  popular: Destination[]
  allForAirport: Destination[]
  tripSuggestions: TripSuggestion[]
  airports: Airport[]
  onSelect: (id: string, impliedAirport?: AirportId) => void
}) {
  const [showAll, setShowAll] = useState(false)
  const [query, setQuery] = useState('')

  const searchPool = airportId
    ? allForAirport
    : airports.flatMap((a) => getDestinationsForAirport(a.id))

  const filtered = query.trim()
    ? searchPool.filter((d) => {
        const q = query.trim().toLowerCase()
        return (
          d.label.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.area.toLowerCase().includes(q)
        )
      })
    : []

  const rest = allForAirport.filter((d) => !popular.some((p) => p.id === d.id))

  return (
    <div
      role="listbox"
      aria-label="Select destination"
      className="mt-3 overflow-hidden rounded-[16px] bg-paper ring-1 ring-ink/10"
    >
      {tripSuggestions.length ? (
        <div className="border-b border-ink/6 px-4 py-3">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
            From your trip
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tripSuggestions.map((t) => (
              <button
                key={t.destinationId}
                type="button"
                role="option"
                aria-selected={destinationId === t.destinationId}
                onClick={() => {
                  const dest = searchPool.find((d) => d.id === t.destinationId)
                  onSelect(t.destinationId, dest?.airportId)
                }}
                className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold transition ${
                  destinationId === t.destinationId
                    ? 'bg-terracotta text-paper'
                    : 'bg-cream text-ink ring-1 ring-ink/8 hover:text-terracotta'
                }`}
              >
                📍 {t.label}
                <span className="ml-1.5 font-medium text-ink/50">{t.note}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="px-4 py-3">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Popular in {cityName}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {popular.map((d) => (
            <button
              key={d.id}
              type="button"
              role="option"
              aria-selected={destinationId === d.id}
              onClick={() => onSelect(d.id, d.airportId)}
              className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold transition ${
                destinationId === d.id
                  ? 'bg-terracotta text-paper'
                  : 'bg-cream text-ink ring-1 ring-ink/8 hover:text-terracotta'
              }`}
            >
              {d.label}
              {!airportId ? (
                <span className="ml-1 font-medium text-muted">{d.airportId}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-ink/6 px-4 py-3">
        <label className="block">
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
            Search for another area
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="District, area, or city…"
            className="mt-2 w-full rounded-[12px] bg-cream/80 px-3 py-2 text-[0.85rem] font-medium text-ink ring-1 ring-ink/8 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </label>
        {filtered.length ? (
          <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto">
            {filtered.slice(0, 12).map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={destinationId === d.id}
                  onClick={() => onSelect(d.id, d.airportId)}
                  className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left text-[0.8rem] font-bold text-ink hover:bg-cream"
                >
                  <span>
                    {d.label}
                    <span className="ml-1.5 font-medium text-muted">{d.city}</span>
                  </span>
                  <span className="text-[0.68rem] font-semibold text-muted">{d.airportId}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {airportId && rest.length ? (
        <div className="border-t border-ink/6 px-4 py-3">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[0.72rem] font-bold text-terracotta hover:underline"
          >
            {showAll ? 'Hide extra areas' : `More areas in ${cityName} →`}
          </button>
          {showAll ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rest.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="option"
                  aria-selected={destinationId === d.id}
                  onClick={() => onSelect(d.id, d.airportId)}
                  className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold transition ${
                    destinationId === d.id
                      ? 'bg-terracotta text-paper'
                      : 'bg-cream text-ink ring-1 ring-ink/8 hover:text-terracotta'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
