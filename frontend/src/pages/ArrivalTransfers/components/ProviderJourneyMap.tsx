import { useEffect, useMemo, useRef, useState } from 'react'
import type { Airport, Destination, TransferDirection, TransportModeId } from '../data/types'
import { AIRPORT_COORDS, destinationCoord } from '../data/transferGeo'
import { busLineForProvider, busNetworkFor, type BusLine } from '../data/busNetwork'
import { fetchOsrmAlternatives } from '../../GettingAround/lib/osrmRoute'
import { BusRoutesMap } from './BusRoutesMap'

type Props = {
  airport: Airport
  destination: Destination
  direction: TransferDirection
  providerId: string
  modeId: TransportModeId
}

export function ProviderJourneyMap({
  airport,
  destination,
  direction,
  providerId,
  modeId,
}: Props) {
  const lines = busNetworkFor(airport.id)
  const focused = busLineForProvider(providerId, airport.id)
  const [activeId, setActiveId] = useState<string | null>(focused?.id ?? null)
  const inbound = direction === 'inbound'
  const airportGeo = AIRPORT_COORDS[airport.id]
  const destGeo = destinationCoord(destination.id)
  const origin = inbound ? airportGeo : destGeo
  const dest = inbound ? destGeo : airportGeo

  const [drive, setDrive] = useState<[number, number][] | null>(null)
  const fetchId = useRef(0)

  useEffect(() => {
    setActiveId(focused?.id ?? null)
  }, [focused?.id, providerId])

  useEffect(() => {
    if (!origin || !dest) {
      setDrive(null)
      return
    }
    const id = ++fetchId.current
    void fetchOsrmAlternatives(origin, dest).then((alts) => {
      if (fetchId.current !== id) return
      setDrive(alts[0]?.geometry ?? [[origin.lat, origin.lng], [dest.lat, dest.lng]])
    })
  }, [origin?.lat, origin?.lng, dest?.lat, dest?.lng])

  const extras = useMemo(() => {
    if (!drive || drive.length < 2) return []
    return [
      {
        id: 'hotel',
        label: inbound
          ? `${airport.code} → ${destination.label}`
          : `${destination.label} → ${airport.code}`,
        color: '#1c1612',
        dashed: true,
        path: drive,
      },
    ]
  }, [drive, inbound, airport.code, destination.label])

  const active: BusLine | null = activeId
    ? (lines.find((l) => l.id === activeId) ?? null)
    : null
  const showBuses = modeId === 'public-bus' && lines.length > 0
  const heading = showBuses ? 'Every route off this airport' : 'Your road to the door'

  if (!showBuses && extras.length === 0) return null

  return (
    <section id="provider-map" className="scroll-mt-28">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">The map</p>
      <h2 className="mt-2 font-serif text-[clamp(1.7rem,3vw,2.15rem)] font-semibold leading-tight text-ink">
        {heading}
      </h2>
      <p className="mt-2 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink/75">
        {showBuses
          ? `These are the distinct corridors out of ${airport.name} — not one line drawn twice. ${
              focused
                ? `${focused.number} is the one this page is about; the others are here so you do not board the wrong city.`
                : 'Pick a line on the map to see its stops.'
            }`
          : `The dashed line is the driving route between ${airport.code} and ${destination.label}.`}
      </p>
      <div className="mt-5">
        <BusRoutesMap
          lines={showBuses ? lines : []}
          activeId={showBuses ? activeId : null}
          onSelect={showBuses ? setActiveId : () => undefined}
          extras={extras}
        />
      </div>
      {active && showBuses ? (
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {active.stops.map((stop, i) => (
            <li
              key={stop.id}
              className="flex gap-3 rounded-[16px] bg-cream/70 px-4 py-3 ring-1 ring-ink/6"
            >
              <span className="mt-0.5 font-serif text-[1.15rem] font-semibold leading-none text-terracotta">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <span className="block text-[0.92rem] font-semibold text-ink">{stop.name}</span>
                <span className="text-[0.75rem] uppercase tracking-[0.08em] text-muted">
                  {stop.role === 'airport'
                    ? 'Airport'
                    : stop.role === 'terminus'
                      ? 'Last stop'
                      : 'Useful stop'}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
