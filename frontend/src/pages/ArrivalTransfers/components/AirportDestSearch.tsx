import { useEffect, useMemo, useRef, useState } from 'react'
import { AIRPORTS } from '../data/catalog'
import { getDestinationsForAirport } from '../data/catalog'
import { destinationCoord } from '../data/transferGeo'
import { searchVietnamPlaces, type GeocodeHit } from '../../GettingAround/lib/geocodeInCity'
import type { Airport, AirportId } from '../data/types'
import { customPlace, defaultPlaceForAirport, type ChosenPlace } from '../data/plannerRoute'

type Props = {
  airport: Airport
  place: ChosenPlace
  onAirport: (id: AirportId) => void
  onPlace: (place: ChosenPlace) => void
}

export function AirportDestSearch({ airport, place, onAirport, onPlace }: Props) {
  const [airQ, setAirQ] = useState('')
  const [airOpen, setAirOpen] = useState(false)
  const [destQ, setDestQ] = useState(place.label)
  const [destOpen, setDestOpen] = useState(false)
  const [hits, setHits] = useState<GeocodeHit[]>([])
  const [searching, setSearching] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDestQ(place.label)
  }, [place.label, airport.id])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setAirOpen(false)
        setDestOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const airports = useMemo(() => {
    const q = airQ.trim().toLowerCase()
    if (!q) return AIRPORTS
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q),
    )
  }, [airQ])

  const presets = getDestinationsForAirport(airport.id)

  useEffect(() => {
    const q = destQ.trim()
    if (q.length < 2 || q === place.label) {
      setHits([])
      return
    }
    let alive = true
    setSearching(true)
    const t = window.setTimeout(() => {
      void searchVietnamPlaces(`${q}, Vietnam`).then((next) => {
        if (!alive) return
        setHits(next)
        setSearching(false)
      })
    }, 280)
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [destQ, place.label])

  return (
    <div ref={wrapRef} className="grid gap-3 sm:grid-cols-2">
      <label className="relative block">
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
          From · airport
        </span>
        <input
          value={airOpen ? airQ : `${airport.code} · ${airport.name}`}
          onChange={(e) => {
            setAirQ(e.target.value)
            setAirOpen(true)
          }}
          onFocus={() => {
            setAirQ('')
            setAirOpen(true)
          }}
          placeholder="Search any Vietnam airport"
          className="mt-1.5 w-full rounded-[16px] bg-paper px-4 py-3 text-[0.95rem] font-semibold text-ink shadow-soft ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-terracotta"
          autoComplete="off"
        />
        {airOpen ? (
          <ul className="absolute z-[40] mt-1 max-h-72 w-full overflow-auto rounded-[16px] bg-paper py-1 shadow-soft ring-1 ring-ink/12">
            {airports.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left hover:bg-cream"
                  onClick={() => {
                    onAirport(a.id)
                    const next = defaultPlaceForAirport(a.id)
                    if (next) onPlace(next)
                    setAirOpen(false)
                    setAirQ('')
                  }}
                >
                  <span className="mt-0.5 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-bold text-paper">
                    {a.code}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{a.name}</span>
                    <span className="block text-[0.75rem] text-muted">{a.city}</span>
                  </span>
                </button>
              </li>
            ))}
            {!airports.length ? (
              <li className="px-3.5 py-3 text-[0.82rem] text-muted">No airport matches that.</li>
            ) : null}
          </ul>
        ) : null}
      </label>

      <label className="relative block">
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
          To · destination
        </span>
        <input
          value={destQ}
          onChange={(e) => {
            setDestQ(e.target.value)
            setDestOpen(true)
          }}
          onFocus={() => setDestOpen(true)}
          placeholder="Hotel, neighbourhood, or address"
          className="mt-1.5 w-full rounded-[16px] bg-paper px-4 py-3 text-[0.95rem] font-semibold text-ink shadow-soft ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-terracotta"
          autoComplete="off"
        />
        {destOpen ? (
          <ul className="absolute z-[40] mt-1 max-h-80 w-full overflow-auto rounded-[16px] bg-paper py-1 shadow-soft ring-1 ring-ink/12">
            {presets.map((d) => {
              const coord = destinationCoord(d.id)
              if (!coord) return null
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    className="w-full px-3.5 py-2.5 text-left hover:bg-cream"
                    onClick={() => {
                      onPlace({ label: d.label, coord, destination: d })
                      setDestQ(d.label)
                      setDestOpen(false)
                    }}
                  >
                    <span className="block font-semibold text-ink">{d.label}</span>
                    <span className="block text-[0.75rem] text-muted">
                      {d.city} · {d.distanceKm} km
                    </span>
                  </button>
                </li>
              )
            })}
            {searching ? (
              <li className="px-3.5 py-2 text-[0.78rem] text-muted">Searching Vietnam…</li>
            ) : null}
            {hits.map((hit) => (
              <li key={`${hit.lat}-${hit.lng}`}>
                <button
                  type="button"
                  className="w-full px-3.5 py-2.5 text-left hover:bg-cream"
                  onClick={() => {
                    const short = hit.displayName.split(',').slice(0, 3).join(',').trim()
                    onPlace(customPlace(airport, short, { lat: hit.lat, lng: hit.lng }))
                    setDestQ(short)
                    setDestOpen(false)
                  }}
                >
                  <span className="block font-semibold text-ink">
                    {hit.displayName.split(',')[0]}
                  </span>
                  <span className="block text-[0.72rem] leading-snug text-muted">
                    {hit.displayName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </label>
    </div>
  )
}
