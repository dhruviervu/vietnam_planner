import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GOOGLE_ROADMAP_TILES } from '../../WhereToStay/lib/googleMapTiles'
import { fetchOsrmAlternatives, type OsrmAlternative } from '../../GettingAround/lib/osrmRoute'
import { AIRPORT_COORDS, mapsDirUrl, type TransferCoord } from '../data/transferGeo'
import type { Airport, TransferDirection } from '../data/types'

type Props = {
  airport: Airport
  destLabel: string
  destCoord: TransferCoord
  direction: TransferDirection
  onDirection: (d: TransferDirection) => void
}

function Invalidate({ open }: { open: boolean }) {
  const map = useMap()
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize({ animate: false }), open ? 80 : 0)
    return () => window.clearTimeout(t)
  }, [map, open])
  return null
}

function Fit({ a, b }: { a: [number, number]; b: [number, number] }) {
  const map = useMap()
  const key = `${a.join(',')}-${b.join(',')}`
  useEffect(() => {
    const t = window.setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds([a, b]), { padding: [44, 52], maxZoom: 13, animate: false })
    }, 90)
    return () => window.clearTimeout(t)
  }, [map, key])
  return null
}

function pin(color: string, glyph: string) {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${color};color:#fff;font-size:13px;font-weight:700;box-shadow:0 2px 10px rgba(28,22,18,.28);border:2px solid #fff">${glyph}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

const airportPin = pin('#1c1612', '✈')
const destPin = pin('#c45c3e', '●')

export function CollapsibleRouteMap({
  airport,
  destLabel,
  destCoord,
  direction,
  onDirection,
}: Props) {
  const inbound = direction === 'inbound'
  const air = AIRPORT_COORDS[airport.id]
  const origin = inbound ? air : destCoord
  const dest = inbound ? destCoord : air
  const originPt: [number, number] = [origin.lat, origin.lng]
  const destPt: [number, number] = [dest.lat, dest.lng]
  const [open, setOpen] = useState(true)
  const [best, setBest] = useState<OsrmAlternative | null>(null)
  const fetchId = useRef(0)

  useEffect(() => {
    const id = ++fetchId.current
    setBest(null)
    void fetchOsrmAlternatives(origin, dest).then((alts) => {
      if (fetchId.current !== id) return
      const ranked = [...alts].sort((a, b) => a.minutes - b.minutes)
      setBest(ranked[0] ?? null)
    })
  }, [origin.lat, origin.lng, dest.lat, dest.lng])

  const mins = best ? Math.round(best.minutes) : null
  const km = best ? best.km.toFixed(1) : null
  const path = best?.geometry ?? [originPt, destPt]
  const maps = mapsDirUrl(origin, dest)

  return (
    <section className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
            Best driving route
          </p>
          <h2 className="mt-0.5 font-serif text-[clamp(1.2rem,2.4vw,1.55rem)] font-semibold text-ink">
            {inbound ? `${airport.code} → ${destLabel}` : `${destLabel} → ${airport.code}`}
          </h2>
          <p className="mt-1 text-[0.82rem] font-medium text-ink/70">
            {mins != null && km ? (
              <>
                About {mins} min · {km} km on the fastest road route
              </>
            ) : (
              'Tracing the fastest road route…'
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-cream p-0.5 ring-1 ring-ink/8">
            <button
              type="button"
              onClick={() => onDirection('inbound')}
              className={`rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold ${
                inbound ? 'bg-terracotta text-paper' : 'text-ink/70'
              }`}
            >
              Airport → city
            </button>
            <button
              type="button"
              onClick={() => onDirection('outbound')}
              className={`rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold ${
                !inbound ? 'bg-terracotta text-paper' : 'text-ink/70'
              }`}
            >
              City → airport
            </button>
          </div>
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-cream px-3.5 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/10 hover:text-terracotta"
          >
            Google Maps →
          </a>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-ink px-3.5 py-1.5 text-[0.72rem] font-bold text-paper"
          >
            {open ? 'Collapse map' : 'Expand map'}
          </button>
        </div>
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative h-[22rem] bg-[#e8eef1] sm:h-[28rem] lg:h-[32rem]">
            <MapContainer
              key={`${airport.id}-${destCoord.lat}-${destCoord.lng}-${direction}`}
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
              <Invalidate open={open} />
              <Fit a={originPt} b={destPt} />
              <Polyline
                positions={path}
                pathOptions={{
                  color: '#c45c3e',
                  weight: 5.5,
                  opacity: 0.92,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              <Marker position={inbound ? originPt : destPt} icon={airportPin} zIndexOffset={800}>
                <Tooltip direction="top" offset={[0, -10]} permanent>
                  {airport.code}
                </Tooltip>
              </Marker>
              <Marker position={inbound ? destPt : originPt} icon={destPin} zIndexOffset={900}>
                <Tooltip direction="bottom" offset={[0, 10]} permanent>
                  {destLabel}
                </Tooltip>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
