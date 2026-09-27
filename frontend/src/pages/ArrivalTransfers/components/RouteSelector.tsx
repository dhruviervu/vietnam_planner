import { useEffect, useId, useRef, useState } from 'react'
import { getDestination, getDestinationsForAirport } from '../data/catalog'
import type { Airport, AirportId, Destination, TransferDirection } from '../data/types'
import { Chevron } from './TransferContextBar'

type Props = {
  airports: Airport[]
  airportId: AirportId | null
  destinationId: string | null
  direction: TransferDirection
  onSelectAirport: (id: AirportId | null) => void
  onSelectDestination: (id: string) => void
  onSwap: () => void
}

export function RouteSelector({
  airports,
  airportId,
  destinationId,
  direction,
  onSelectAirport,
  onSelectDestination,
  onSwap,
}: Props) {
  const [openAirport, setOpenAirport] = useState(false)
  const [openDest, setOpenDest] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const airport = airportId ? airports.find((a) => a.id === airportId) ?? null : null
  const destination = destinationId ? getDestination(destinationId) ?? null : null
  const neighbourhoods = airportId ? getDestinationsForAirport(airportId) : []
  const inbound = direction === 'inbound'

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenAirport(false)
        setOpenDest(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenAirport(false)
        setOpenDest(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const airportCard = (
    <AirportEndpoint
      airport={airport}
      active={openAirport}
      onOpen={() => {
        setOpenAirport((v) => !v)
        setOpenDest(false)
      }}
    />
  )
  const destinationCard = (
    <DestinationEndpoint
      destination={destination}
      options={neighbourhoods}
      open={openDest}
      onOpen={() => {
        setOpenDest((v) => !v)
        setOpenAirport(false)
      }}
      onSelect={(id) => {
        onSelectDestination(id)
        setOpenDest(false)
      }}
    />
  )

  return (
    <section id="route-selector" aria-labelledby={titleId} ref={rootRef} className="relative z-20 scroll-mt-28">
      <h2
        id={titleId}
        className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted"
      >
        Your route
      </h2>
      <p className="mt-1 max-w-[52ch] text-[0.82rem] text-muted">
        Airport follows the city above. Choose a neighbourhood in Destination.
      </p>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        {inbound ? airportCard : destinationCard}
        <SwapRouteButton onClick={onSwap} />
        {inbound ? destinationCard : airportCard}
      </div>

      {openAirport ? (
        <AirportMenu
          airports={airports}
          airportId={airportId}
          onSelect={(id) => {
            onSelectAirport(id)
            setOpenAirport(false)
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

function AirportEndpoint({
  airport,
  active,
  onOpen,
}: {
  airport: Airport | null
  active: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={active}
      aria-haspopup="listbox"
      aria-label={`Airport: ${airport ? `${airport.name} ${airport.code}` : 'Choose airport'}`}
      className={`flex min-w-0 flex-1 items-start justify-between gap-3 rounded-[16px] px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
        active
          ? 'bg-terracotta/10 ring-2 ring-terracotta'
          : 'bg-cream/70 ring-1 ring-ink/8 hover:bg-cream hover:ring-ink/14'
      }`}
    >
      <span className="min-w-0">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">✈️ Airport</p>
        <p className="mt-1 truncate font-serif text-[1.05rem] font-semibold leading-tight text-ink">
          {airport ? `${airport.name} · ${airport.code}` : 'Choose airport'}
        </p>
        <p className="mt-0.5 truncate text-[0.72rem] font-medium text-muted">
          {airport ? airport.city : 'Vietnam'}
        </p>
      </span>
      <span className="mt-2">
        <Chevron open={active} />
      </span>
    </button>
  )
}

function DestinationEndpoint({
  destination,
  options,
  open,
  onOpen,
  onSelect,
}: {
  destination: Destination | null
  options: Destination[]
  open: boolean
  onOpen: () => void
  onSelect: (id: string) => void
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={onOpen}
        disabled={options.length === 0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Destination: ${destination?.label ?? 'Choose neighbourhood'}`}
        className={`flex w-full items-start justify-between gap-3 rounded-[16px] px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:cursor-not-allowed ${
          open
            ? 'bg-terracotta/10 ring-2 ring-terracotta'
            : 'bg-cream/70 ring-1 ring-ink/8 hover:bg-cream hover:ring-ink/14'
        }`}
      >
        <span className="min-w-0">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
            📍 Destination
          </p>
          <p className="mt-1 truncate font-serif text-[1.05rem] font-semibold leading-tight text-ink">
            {destination?.label ?? 'Choose neighbourhood'}
          </p>
          <p className="mt-0.5 truncate text-[0.72rem] font-medium text-muted">
            {destination?.city ?? 'Neighbourhood in this city'}
          </p>
        </span>
        <span className="mt-2 shrink-0">
          <Chevron open={open} />
        </span>
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Choose neighbourhood"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[16px] bg-paper shadow-soft ring-1 ring-ink/10"
        >
          {options.map((d, i) => {
            const on = destination?.id === d.id
            return (
              <button
                key={d.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => onSelect(d.id)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-cream/80 ${
                  on ? 'bg-terracotta/10' : ''
                } ${i > 0 ? 'border-t border-ink/6' : ''}`}
              >
                <span className="min-w-0">
                  <p className="truncate text-[0.88rem] font-bold text-ink">{d.label}</p>
                  <p className="truncate text-[0.72rem] font-medium text-muted">{d.city}</p>
                </span>
                {on ? (
                  <span className="shrink-0 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-terracotta">
                    Selected
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function AirportMenu({
  airports,
  airportId,
  onSelect,
}: {
  airports: Airport[]
  airportId: AirportId | null
  onSelect: (id: AirportId) => void
}) {
  return (
    <div
      role="listbox"
      aria-label="Select airport"
      className="mt-3 overflow-hidden rounded-[16px] bg-paper ring-1 ring-ink/10"
    >
      {airports.map((a) => {
        const on = airportId === a.id
        return (
          <button
            key={a.id}
            type="button"
            role="option"
            aria-selected={on}
            onClick={() => onSelect(a.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-cream/80 ${
              on ? 'bg-terracotta/10' : ''
            } ${a !== airports[0] ? 'border-t border-ink/6' : ''}`}
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[10px]">
              <img src={a.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.88rem] font-bold text-ink">
                {a.name} · {a.code}
              </p>
              <p className="truncate text-[0.72rem] font-medium text-muted">{a.city}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
