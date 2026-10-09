import { useEffect, useMemo, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getAirport } from './data/catalog'
import type { AirportId, ArrivalContext, TransferDirection, TransportModeId } from './data/types'
import { AirportDestSearch } from './components/AirportDestSearch'
import { CollapsibleRouteMap } from './components/CollapsibleRouteMap'
import { TravelProfile } from './components/TravelProfile'
import { ModeRecommendations } from './components/ModeRecommendations'
import { ModeDetailSections } from './components/ModeDetailSections'
import { pickOurMode, sortModes } from './data/recommendation'
import { defaultPlaceForAirport, scaleModesForRoute, type ChosenPlace } from './data/plannerRoute'
import { AIRPORT_COORDS, haversineKm } from './data/transferGeo'
import { fetchOsrmAlternatives } from '../GettingAround/lib/osrmRoute'

export function ArrivalTransfersPage({ embedded = false }: { embedded?: boolean }) {
  const [airportId, setAirportId] = useState<AirportId>('HAN')
  const airport = getAirport(airportId)!
  const [place, setPlace] = useState<ChosenPlace>(() => defaultPlaceForAirport('HAN')!)
  const [direction, setDirection] = useState<TransferDirection>('inbound')
  const [passengers, setPassengers] = useState(2)
  const [luggageLevel, setLuggageLevel] = useState<ArrivalContext['luggageLevel']>('medium')
  const [selectedModeId, setSelectedModeId] = useState<TransportModeId | null>(null)
  const [driveMin, setDriveMin] = useState<number | null>(null)
  const [driveKm, setDriveKm] = useState<number | null>(null)

  useEffect(() => {
    const origin = direction === 'inbound' ? AIRPORT_COORDS[airport.id] : place.coord
    const dest = direction === 'inbound' ? place.coord : AIRPORT_COORDS[airport.id]
    let alive = true
    void fetchOsrmAlternatives(origin, dest).then((alts) => {
      if (!alive) return
      const best = [...alts].sort((a, b) => a.minutes - b.minutes)[0]
      if (best) {
        setDriveMin(best.minutes)
        setDriveKm(best.km)
      } else {
        const km = haversineKm(origin, dest)
        setDriveKm(km)
        setDriveMin(km * 1.6 + 8)
      }
    })
    return () => {
      alive = false
    }
  }, [airport.id, place.coord.lat, place.coord.lng, direction])

  const ctx: ArrivalContext = useMemo(
    () => ({
      passengers,
      luggageLevel,
      lateArrival: false,
      arrivalTime: 'not-set',
      hasAccessibilityNeed: false,
      arrivalLabel: null,
      direction,
      budget: 'typical',
      budgetPriority: false,
      routeAirportCode: airport.id,
      routeDestinationLabel: place.label,
    }),
    [passengers, luggageLevel, direction, airport.id, place.label],
  )

  const km = driveKm ?? place.destination.distanceKm
  const minutes = driveMin ?? place.destination.typicalTimeMin[0]
  const modes = useMemo(
    () => scaleModesForRoute(km, minutes, direction),
    [km, minutes, direction],
  )
  const ranked = useMemo(() => sortModes(modes, ctx), [modes, ctx])
  const recommended = pickOurMode(modes, ctx)

  useEffect(() => {
    if (recommended) setSelectedModeId(recommended.id)
  }, [recommended?.id, passengers, luggageLevel])

  const bookingRoute = {
    airport,
    destination: place.destination,
    direction,
  }

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <header className="mb-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Airport logistics
          </p>
          <h1 className="mt-1.5 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
            Choose an airport, then a door
          </h1>
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-muted">
            Every Vietnamese airport is listed. The city drop-off fills in for you — change it like
            Maps if you are going to a hotel, a neighbourhood, or another town.
          </p>
        </header>

        <AirportDestSearch
          airport={airport}
          place={place}
          onAirport={(id) => {
            setAirportId(id)
            const next = defaultPlaceForAirport(id)
            if (next) setPlace(next)
            setSelectedModeId(null)
          }}
          onPlace={(next) => {
            setPlace(next)
            setSelectedModeId(null)
          }}
        />

        <div className="mt-5">
          <CollapsibleRouteMap
            airport={airport}
            destLabel={place.label}
            destCoord={place.coord}
            direction={direction}
            onDirection={setDirection}
          />
        </div>

        <div className="mt-6">
          <TravelProfile
            passengers={passengers}
            luggageLevel={luggageLevel}
            onPassengers={setPassengers}
            onLuggage={setLuggageLevel}
          />
        </div>

        <div className="mt-8">
          <ModeRecommendations
            ranked={ranked}
            recommendedId={recommended?.id ?? null}
            ctx={ctx}
            route={bookingRoute}
            selectedId={selectedModeId}
            onSelect={(id) => setSelectedModeId((cur) => (cur === id ? null : id))}
          />
        </div>

        <div className="mt-12">
          <ModeDetailSections airport={airport} direction={direction} />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
