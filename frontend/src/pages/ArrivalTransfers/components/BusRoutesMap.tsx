import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { GOOGLE_ROADMAP_TILES } from '../../WhereToStay/lib/googleMapTiles'
import type { BusLine } from '../data/busNetwork'

type ExtraPath = {
  id: string
  label: string
  color: string
  dashed?: boolean
  path: [number, number][]
}

type Props = {
  lines: BusLine[]
  activeId: string | null
  onSelect: (id: string | null) => void
  extras?: ExtraPath[]
}

function Fit({ lines, extras }: { lines: BusLine[]; extras: ExtraPath[] }) {
  const map = useMap()
  const key = `${lines.map((l) => l.id).join('|')}|${extras.map((e) => e.id).join('|')}`
  useEffect(() => {
    const pts = [...lines.flatMap((l) => l.path), ...extras.flatMap((e) => e.path)]
    if (pts.length < 2) return
    const t = window.setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds(pts), { padding: [28, 28], maxZoom: 11, animate: false })
    }, 80)
    return () => window.clearTimeout(t)
  }, [map, key])
  return null
}

function Invalidate() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => {
      if (map.getSize().x < 40) return
      map.invalidateSize({ animate: false })
    })
    ro.observe(el)
    const t = window.setTimeout(() => map.invalidateSize({ animate: false }), 120)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [map])
  return null
}

function stopIcon(color: string, terminus: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${terminus ? 13 : 8}px;height:${terminus ? 13 : 8}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 6px rgba(28,22,18,.35)"></div>`,
    iconSize: [terminus ? 13 : 8, terminus ? 13 : 8],
    iconAnchor: [terminus ? 6.5 : 4, terminus ? 6.5 : 4],
  })
}

export function BusRoutesMap({ lines, activeId, onSelect, extras = [] }: Props) {
  if (!lines.length && !extras.length) return null
  const centre = lines[0]?.path[0] ?? extras[0]?.path[0]
  if (!centre) return null
  const active = lines.find((l) => l.id === activeId) ?? null

  return (
    <div className="overflow-hidden rounded-[24px] bg-paper shadow-soft ring-1 ring-ink/8">
      <div className="relative h-[26rem] bg-[#e8eef1] sm:h-[32rem]">
        <MapContainer
          center={centre}
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
          <Invalidate />
          <Fit lines={lines} extras={extras} />
          {lines.map((line) => {
            const on = !activeId || activeId === line.id
            return (
              <Polyline
                key={line.id}
                positions={line.path}
                pathOptions={{
                  color: line.color,
                  weight: activeId === line.id ? 6.5 : 3.5,
                  opacity: on ? 0.95 : 0.22,
                  lineCap: 'round',
                }}
                eventHandlers={{ click: () => onSelect(line.id) }}
              >
                <Tooltip sticky>
                  {line.number} · {line.terminusIn}
                </Tooltip>
              </Polyline>
            )
          })}
          {extras.map((extra) => (
            <Polyline
              key={extra.id}
              positions={extra.path}
              pathOptions={{
                color: extra.color,
                weight: 4,
                opacity: 0.9,
                dashArray: extra.dashed ? '8 10' : undefined,
                lineCap: 'round',
              }}
            >
              <Tooltip sticky>{extra.label}</Tooltip>
            </Polyline>
          ))}
          {lines.flatMap((line) => {
            const on = !activeId || activeId === line.id
            if (!on) return []
            return line.stops.map((s) => (
              <Marker
                key={`${line.id}-${s.id}`}
                position={[s.lat, s.lng]}
                icon={stopIcon(line.color, s.role !== 'key')}
                zIndexOffset={s.role === 'terminus' ? 400 : 200}
                eventHandlers={{ click: () => onSelect(line.id) }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  {line.number} · {s.name}
                </Tooltip>
              </Marker>
            ))
          })}
        </MapContainer>
      </div>

      <div className="border-t border-ink/8 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`rounded-full px-3 py-1 text-[0.68rem] font-bold ring-1 ${
              !activeId ? 'bg-ink text-paper ring-ink' : 'bg-paper text-ink/70 ring-ink/12'
            }`}
          >
            All routes
          </button>
          {lines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => onSelect(line.id === activeId ? null : line.id)}
              className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ring-1 ${
                activeId === line.id ? 'bg-paper ring-ink/25 text-ink' : 'ring-ink/10 text-ink/70'
              }`}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ background: line.color }}
              />
              {line.number}
              <span className="ml-1 font-semibold text-ink/45">
                · {line.durationMin[0]}–{line.durationMin[1]} min
              </span>
            </button>
          ))}
        </div>
        {active ? (
          <p className="mt-3 text-[0.82rem] leading-relaxed text-ink/75">
            <span className="font-semibold text-ink">{active.name}.</span> {active.pickupAtAirport}{' '}
            Ends at {active.terminusIn}. {active.fareUsd} · {active.hours}.
          </p>
        ) : (
          <p className="mt-3 text-[0.82rem] leading-relaxed text-ink/70">
            Every coloured line is a real way off this airport. Tap a number to isolate it. The dashed
            line, if shown, is the road to the neighbourhood you picked — not a bus.
          </p>
        )}
      </div>
    </div>
  )
}
