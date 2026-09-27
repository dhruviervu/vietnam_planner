import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GOOGLE_ROADMAP_TILES } from '../../WhereToStay/lib/googleMapTiles'
import {
  fetchOsrmAlternatives,
  type OsrmAlternative,
} from '../../GettingAround/lib/osrmRoute'
import {
  formatCostCompact,
  formatTimeRange,
} from '../data/catalog'
import {
  AIRPORT_COORDS,
  destinationCoord,
  mapsDirUrl,
} from '../data/transferGeo'
import type {
  Airport,
  Destination,
  ModeEvaluation,
  TransferDirection,
  TransportModeId,
} from '../data/types'

type Props = {
  airport: Airport
  destination: Destination
  direction: TransferDirection
  evaluations: ModeEvaluation[]
  selectedModeId: TransportModeId | null
  recommendedModeId: TransportModeId | null
  onSelectMode: (id: TransportModeId) => void
  onDirectionChange: (d: TransferDirection) => void
}

const MODE_COLOR: Record<TransportModeId, string> = {
  'private-transfer': '#c45c3e',
  'car-taxi': '#2f2a26',
  'ride-hailing': '#1f6f4a',
  'shared-transfer': '#5a7d5a',
  'public-bus': '#3b6ea5',
  'rental-driver': '#8a6a4f',
}

const MODE_OFFSET_M: Record<TransportModeId, number> = {
  'private-transfer': -40,
  'car-taxi': -16,
  'ride-hailing': 8,
  'shared-transfer': 16,
  'public-bus': 44,
  'rental-driver': 72,
}

function pinIcon(color: string, glyph: string) {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${color};color:#fff;font-size:13px;font-weight:700;box-shadow:0 2px 10px rgba(28,22,18,.28);border:2px solid #fff">${glyph}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

const airportPin = pinIcon('#1c1612', '✈')
const destPin = pinIcon('#c45c3e', '●')

function offsetPath(path: [number, number][], meters: number): [number, number][] {
  if (path.length < 2 || meters === 0) return path
  return path.map(([lat, lng], i) => {
    const prev = path[Math.max(0, i - 1)]
    const next = path[Math.min(path.length - 1, i + 1)]
    const dLat = next[0] - prev[0]
    const dLng = next[1] - prev[1]
    const len = Math.hypot(dLat, dLng) || 1
    const latM = 111_320
    const lngM = 111_320 * Math.cos((lat * Math.PI) / 180)
    return [
      lat + (-dLng / len) * (meters / latM),
      lng + (dLat / len) * (meters / lngM),
    ] as [number, number]
  })
}

function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => {
      const size = map.getSize()
      if (size.x < 40 || size.y < 40) return
      map.invalidateSize({ animate: false })
    })
    ro.observe(el)
    const timer = window.setTimeout(() => map.invalidateSize({ animate: false }), 120)
    return () => {
      ro.disconnect()
      window.clearTimeout(timer)
    }
  }, [map])
  return null
}

function FitRoute({
  origin,
  dest,
}: {
  origin: [number, number]
  dest: [number, number]
}) {
  const map = useMap()
  const key = `${origin.join(',')}-${dest.join(',')}`
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds([origin, dest]), {
        padding: [48, 56],
        maxZoom: 12,
        animate: false,
      })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [map, key])
  return null
}

function pickGeometry(
  id: TransportModeId,
  alts: OsrmAlternative[],
): [number, number][] | null {
  if (!alts.length) return null
  const byTime = [...alts].sort((a, b) => a.minutes - b.minutes)
  if (id === 'public-bus') return byTime[byTime.length - 1].geometry
  if (id === 'shared-transfer') return byTime[Math.min(1, byTime.length - 1)].geometry
  return byTime[0].geometry
}

export function TransferRouteBoard({
  airport,
  destination,
  direction,
  evaluations,
  selectedModeId,
  recommendedModeId,
  onSelectMode,
  onDirectionChange,
}: Props) {
  const inbound = direction === 'inbound'
  const airportGeo = AIRPORT_COORDS[airport.id]
  const destGeo = destinationCoord(destination.id)
  const origin = inbound ? airportGeo : destGeo
  const dest = inbound ? destGeo : airportGeo
  const googleUrl =
    origin && dest
      ? mapsDirUrl(origin, dest)
      : mapsDirUrl(airportGeo, airportGeo)

  const [alts, setAlts] = useState<OsrmAlternative[]>([])
  const fetchId = useRef(0)

  useEffect(() => {
    if (!origin || !dest) {
      setAlts([])
      return
    }
    const id = ++fetchId.current
    setAlts([])
    void fetchOsrmAlternatives(origin, dest).then((next) => {
      if (fetchId.current === id) setAlts(next)
    })
  }, [origin?.lat, origin?.lng, dest?.lat, dest?.lng])

  const drawn = useMemo(() => {
    return evaluations.map((ev, i) => {
      const raw = pickGeometry(ev.mode.id, alts)
      const fallback: [number, number][] | null =
        origin && dest ? [[origin.lat, origin.lng], [dest.lat, dest.lng]] : null
      const base = raw ?? fallback
      const path = base
        ? offsetPath(base, MODE_OFFSET_M[ev.mode.id] ?? i * 20)
        : null
      return { ev, path, color: MODE_COLOR[ev.mode.id] }
    })
  }, [evaluations, alts, origin?.lat, origin?.lng, dest?.lat, dest?.lng])

  const originPt: [number, number] | null = origin ? [origin.lat, origin.lng] : null
  const destPt: [number, number] | null = dest ? [dest.lat, dest.lng] : null
  const mapKey = `${airport.id}-${destination.id}-${direction}`

  return (
    <section className="scroll-mt-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-serif text-[clamp(1.35rem,2.6vw,1.7rem)] font-semibold leading-tight text-ink">
          {inbound
            ? `${airport.code} to ${destination.label}`
            : `${destination.label} to ${airport.code}`}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Transfer direction"
            className="inline-flex rounded-full bg-cream p-0.5 ring-1 ring-ink/8"
          >
            <button
              type="button"
              role="tab"
              aria-selected={inbound}
              onClick={() => onDirectionChange('inbound')}
              className={`rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold transition ${
                inbound ? 'bg-terracotta text-paper shadow-soft' : 'text-ink/70 hover:text-ink'
              }`}
            >
              Airport → city
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!inbound}
              onClick={() => onDirectionChange('outbound')}
              className={`rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold transition ${
                !inbound ? 'bg-terracotta text-paper shadow-soft' : 'text-ink/70 hover:text-ink'
              }`}
            >
              City → airport
            </button>
          </div>
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-paper px-3.5 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/10 transition hover:text-terracotta"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>

      <div className="mt-3 grid overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8 lg:grid-cols-[minmax(0,1.35fr)_minmax(17.5rem,21rem)] lg:items-stretch">
        <div className="relative h-full min-h-[28rem] self-stretch bg-[#e8eef1] lg:min-h-[32rem]">
          {originPt && destPt ? (
            <MapContainer
              key={mapKey}
              center={originPt}
              zoom={11}
              className="absolute inset-0 h-full w-full"
              scrollWheelZoom
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                attribution={GOOGLE_ROADMAP_TILES.attribution}
                url={GOOGLE_ROADMAP_TILES.url}
                subdomains={GOOGLE_ROADMAP_TILES.subdomains}
                maxZoom={GOOGLE_ROADMAP_TILES.maxZoom}
              />
              <InvalidateSize />
              <FitRoute origin={originPt} dest={destPt} />
              {drawn.map(({ ev, path, color }) => {
                if (!path) return null
                const on = ev.mode.id === selectedModeId
                return (
                  <Polyline
                    key={ev.mode.id}
                    positions={path}
                    pathOptions={{
                      color,
                      weight: on ? 6 : 3.4,
                      opacity: on ? 0.95 : 0.55,
                      lineCap: 'round',
                      lineJoin: 'round',
                      dashArray: ev.mode.id === 'public-bus' ? '10 8' : undefined,
                    }}
                    eventHandlers={{
                      click: () => onSelectMode(ev.mode.id),
                    }}
                  >
                    <Tooltip sticky>
                      {ev.mode.symbol} {ev.mode.label}
                    </Tooltip>
                  </Polyline>
                )
              })}
              <Marker
                position={inbound ? originPt : destPt}
                icon={airportPin}
                zIndexOffset={800}
              >
                <Tooltip direction="top" offset={[0, -10]} permanent>
                  {airport.code}
                </Tooltip>
              </Marker>
              <Marker
                position={inbound ? destPt : originPt}
                icon={destPin}
                zIndexOffset={900}
              >
                <Tooltip direction="bottom" offset={[0, 10]} permanent>
                  {destination.label}
                </Tooltip>
              </Marker>
            </MapContainer>
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-[0.88rem] text-muted">
              Map pins for this area are still landing — use Google Maps for the live route.
            </div>
          )}
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap gap-1.5">
            {evaluations.map((ev) => (
              <span
                key={ev.mode.id}
                className="pointer-events-none rounded-full bg-paper/92 px-2 py-0.5 text-[0.58rem] font-bold text-ink shadow-sm ring-1 ring-ink/8"
              >
                <span
                  className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: MODE_COLOR[ev.mode.id] }}
                />
                {ev.mode.shortLabel}
              </span>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col border-t border-ink/8 lg:border-l lg:border-t-0">
          <div className="px-4 pt-4 sm:px-5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
              All ways to travel
            </p>
            <p className="mt-1 text-[0.8rem] text-muted">
              Every mode on this route — tap one to highlight it on the map.
            </p>
          </div>
          <ul className="mt-3 flex-1 space-y-2 overflow-y-auto px-3 pb-4 sm:px-4">
            {evaluations.map((ev) => {
              const on = ev.mode.id === selectedModeId
              const rec = ev.mode.id === recommendedModeId
              const unavailable = ev.availability.status === 'unavailable'
              return (
                <li key={ev.mode.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMode(ev.mode.id)}
                    className={`w-full rounded-[16px] px-3.5 py-3 text-left transition ${
                      on
                        ? 'bg-terracotta/10 ring-2 ring-terracotta'
                        : 'bg-cream/55 ring-1 ring-ink/8 hover:ring-ink/16'
                    } ${unavailable ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[12px] text-[1.05rem]"
                        style={{ background: `${MODE_COLOR[ev.mode.id]}18` }}
                      >
                        {ev.mode.symbol}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <p className="font-serif text-[1.05rem] font-semibold text-ink">
                            {ev.mode.label}
                          </p>
                          {rec ? (
                            <span className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-terracotta">
                              ★ Best fit
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[0.78rem] font-semibold text-ink/75">
                          {formatTimeRange(ev.mode.timeMin)}
                          <span className="mx-1.5 text-ink/25">·</span>
                          {formatCostCompact(ev.mode)}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-[0.78rem] font-medium leading-snug text-ink/80">
                          {ev.mode.whyChoose[0] ?? ev.mode.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
