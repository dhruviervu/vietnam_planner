import { useEffect, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ALSO_ON_THE_WATER,
  getIslandCorridor,
  ISLAND_CORRIDORS,
  WATER_SCOPE_PARAGRAPH,
  type IslandCorridor,
  type IslandId,
  type IslandRoute,
} from '../data/islandCorridors'

const BADGE: Record<IslandRoute['badge'], string> = {
  best: 'Best overall',
  value: 'Best mix',
  scenic: 'Scenic / backup',
  only: 'The crossing',
}

function pin(color: string, glyph: string) {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};color:#fff;font-size:13px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.28);border:2px solid #fff">${glyph}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const islandIcon = pin('#c45c3e', '🏝')
const portIcon = pin('#1f2937', '⚓')

function FitIsland({ corridor }: { corridor: IslandCorridor }) {
  const map = useMap()
  useEffect(() => {
    const pts: [number, number][] = [
      [corridor.lat, corridor.lng],
      ...corridor.mainlandPorts.map((p) => [p.lat, p.lng] as [number, number]),
    ]
    const bounds = L.latLngBounds(pts)
    const t = window.setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 9 })
    }, 80)
    return () => window.clearTimeout(t)
  }, [map, corridor.id, corridor.lat, corridor.lng])
  return null
}

export function IslandWaterDesk() {
  const [islandId, setIslandId] = useState<IslandId>('phu-quoc')
  const [routeId, setRouteId] = useState<string | null>(null)
  const corridor = getIslandCorridor(islandId)
  const route = corridor.routes.find((r) => r.id === routeId) ?? corridor.routes[0]
  const providers = (route?.providerIds ?? [])
    .map((id) => corridor.providers.find((p) => p.id === id))
    .filter(Boolean) as IslandCorridor['providers']

  const lines = corridor.mainlandPorts.map(
    (port) =>
      [
        [corridor.lat, corridor.lng],
        [port.lat, port.lng],
      ] as [number, number][],
  )

  return (
    <div>
      <p className="text-[0.92rem] leading-[1.8] text-ink/90 whitespace-pre-line">{WATER_SCOPE_PARAGRAPH}</p>

      <div className="mt-8">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Island crossings
        </p>
        <h3 className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">Choose an island</h3>
        <p className="mt-1 text-[0.82rem] text-muted">
          Then read the realistic mix — taxi or scooter only to the pier, ferry or flight for the sea.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ISLAND_CORRIDORS.map((c) => {
            const on = c.id === islandId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setIslandId(c.id)
                  setRouteId(c.routes[0]?.id ?? null)
                }}
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

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,1fr)] lg:items-stretch lg:gap-5">
        <div className="relative min-h-[420px] overflow-hidden rounded-[18px] ring-1 ring-ink/10 lg:h-[520px]">
          <MapContainer
            key={corridor.id}
            center={[corridor.lat, corridor.lng]}
            zoom={8}
            className="h-full min-h-[420px] w-full lg:h-[520px]"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitIsland corridor={corridor} />
            <Marker position={[corridor.lat, corridor.lng]} icon={islandIcon} zIndexOffset={800}>
              <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                <span className="text-[0.72rem] font-bold">{corridor.label}</span>
              </Tooltip>
            </Marker>
            {corridor.mainlandPorts.map((port) => (
              <Marker
                key={port.label}
                position={[port.lat, port.lng]}
                icon={portIcon}
                zIndexOffset={500}
              >
                <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                  <span className="text-[0.72rem] font-bold">{port.label}</span>
                </Tooltip>
              </Marker>
            ))}
            {lines.map((line, i) => (
              <Polyline
                key={i}
                positions={line}
                pathOptions={{ color: '#c45c3e', weight: 3, dashArray: '8 7', opacity: 0.85 }}
              />
            ))}
          </MapContainer>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] bg-gradient-to-b from-ink/55 to-transparent px-4 py-3">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-paper/75">
              {corridor.region} · {corridor.hasAirport ? 'Airport + ferries' : 'Ferry island'}
            </p>
            <p className="mt-0.5 text-[0.84rem] font-semibold text-paper">{corridor.label}</p>
          </div>
        </div>

        <aside className="mt-5 flex min-h-[420px] flex-col overflow-hidden rounded-[18px] bg-paper ring-1 ring-ink/8 lg:mt-0 lg:h-[520px]">
          <div className="shrink-0 border-b border-ink/8 px-4 py-3">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
              Best ways on and off
            </p>
            <h4 className="mt-0.5 font-serif text-[1.12rem] font-semibold text-ink">{corridor.label}</h4>
            <p className="mt-1 text-[0.78rem] leading-snug text-muted">{corridor.summary}</p>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {corridor.routes.map((r) => {
              const on = r.id === route.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRouteId(r.id)}
                  className={`w-full rounded-[14px] px-3 py-2.5 text-left ring-1 transition ${
                    on
                      ? 'bg-terracotta/10 ring-terracotta/35'
                      : 'bg-cream/60 ring-ink/8 hover:ring-terracotta/25'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.82rem] font-bold text-ink">{r.title}</p>
                    <span className="shrink-0 rounded-full bg-paper px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-ink ring-1 ring-ink/8">
                      {BADGE[r.badge]}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.72rem] font-medium text-ink/75">
                    {r.durationLabel} · {r.costLabel}
                  </p>
                  <p className="mt-1 text-[0.7rem] leading-snug text-muted">{r.why}</p>
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      {route ? (
        <div className="mt-6 rounded-[18px] bg-cream/60 px-5 py-4 ring-1 ring-ink/8">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
            How this actually works
          </p>
          <h4 className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">{route.title}</h4>
          <ol className="mt-3 space-y-2">
            {route.steps.map((step, i) => (
              <li key={step} className="flex gap-2.5 text-[0.88rem] leading-snug text-ink/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta text-[0.68rem] font-bold text-paper">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          {route.weatherNote ? (
            <p className="mt-3 text-[0.78rem] font-medium text-terracotta">{route.weatherNote}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8">
        <h4 className="font-serif text-[1.2rem] font-semibold text-ink">Book this crossing</h4>
        <p className="mt-1 text-[0.8rem] text-muted">
          Each link opens the operator or marketplace already searched for {corridor.label} — not a
          blank homepage.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {providers.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-[16px] bg-paper p-4 ring-1 ring-ink/8"
            >
              <p className="text-[0.58rem] font-bold uppercase tracking-wide text-terracotta">
                {p.operator}
              </p>
              <h5 className="mt-1 font-serif text-[1.02rem] font-semibold text-ink">{p.name}</h5>
              <p className="mt-1.5 flex-1 text-[0.78rem] leading-snug text-muted">{p.note}</p>
              <p className="mt-2 text-[0.72rem] font-bold text-ink">{p.priceLabel}</p>
              <a
                href={p.bookingUrl}
                target="_blank"
                rel="noreferrer"
                data-outbound-label={p.name}
                className="mt-3 inline-flex items-center justify-center rounded-full bg-terracotta px-3 py-2 text-[0.78rem] font-bold text-paper"
              >
                See travel options →
              </a>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Also on Vietnam’s water
        </p>
        <h3 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
          Bays, canals, and day boats — not island ferries
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ALSO_ON_THE_WATER.map((item) => (
            <article key={item.id} className="rounded-[16px] bg-cream/70 px-4 py-4 ring-1 ring-ink/8">
              <h4 className="font-serif text-[1.05rem] font-semibold text-ink">{item.title}</h4>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink/85">{item.body}</p>
              <a
                href={item.bookingUrl}
                target="_blank"
                rel="noreferrer"
                data-outbound-label={item.title}
                className="mt-3 inline-flex text-[0.78rem] font-bold text-terracotta"
              >
                Open a searched booking page →
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
