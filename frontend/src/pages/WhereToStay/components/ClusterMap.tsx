import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { costLevelLabel } from '../data/ranking'
import type { RankedCluster } from '../data/ranking'
import type { StayCity } from '../data/types'
import { HoiAnStayMap } from './HoiAnStayMap'

type Props = {
  city: StayCity
  ranked: RankedCluster[]
  selectedId: string
  onSelect: (clusterId: string) => void
}

function FitCityBounds({
  bounds,
}: {
  bounds: [[number, number], [number, number]]
}) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 })
  }, [map, bounds])
  return null
}

function ringToLatLngs(ring: [number, number][]): [number, number][] {
  // stored as [lng, lat] → Leaflet wants [lat, lng]
  return ring.map(([lng, lat]) => [lat, lng])
}

/** Hoi An uses local OSM-derived geography; other cities keep the Leaflet cluster map. */
export function ClusterMap({ city, ranked, selectedId, onSelect }: Props) {
  if (city.id === 'hoi-an') {
    return (
      <HoiAnStayMap ranked={ranked} selectedId={selectedId} onSelect={onSelect} />
    )
  }
  return (
    <LegacyClusterMap
      city={city}
      ranked={ranked}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  )
}

function LegacyClusterMap({ city, ranked, selectedId, onSelect }: Props) {
  const fitBounds = useMemo((): [[number, number], [number, number]] => {
    const { west, south, east, north } = city.bounds
    return [
      [south, west],
      [north, east],
    ]
  }, [city.bounds])

  const center = useMemo((): [number, number] => {
    const { west, south, east, north } = city.bounds
    return [(south + north) / 2, (west + east) / 2]
  }, [city.bounds])

  const selected = ranked.find((r) => r.cluster.id === selectedId)

  return (
    <div className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[3px] border border-ink/10 bg-[#e8eef1] lg:min-h-0">
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[240px] rounded-[3px] bg-paper/95 px-3 py-2 shadow-md ring-1 ring-ink/10">
        <p className="font-serif text-[0.95rem] font-semibold leading-snug text-[#8B2E2E]">
          Where to stay in {city.label}: Best areas
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug text-muted">
          Live street map · coloured areas are rough stay clusters with rough cost cues
        </p>
      </div>

      {selected ? (
        <div className="pointer-events-none absolute right-3 top-3 z-[1000] max-w-[200px] rounded-[3px] bg-paper/95 px-2.5 py-2 shadow-md ring-1 ring-ink/10">
          <p className="text-[0.78rem] font-bold text-ink">{selected.cluster.name}</p>
          <p className="mt-0.5 text-[0.68rem] text-muted">
            {costLevelLabel(selected.cluster.costLevel)}
            {selected.cluster.typicalNightlyRange
              ? ` · ~$${selected.cluster.typicalNightlyRange[0]}–$${selected.cluster.typicalNightlyRange[1]}`
              : ''}
          </p>
          <p className="mt-1 text-[0.62rem] text-ink/70">
            Tap a coloured area · see stays below
          </p>
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        <MapContainer
          key={city.id}
          center={center}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom
          zoomControl={false}
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />
          <FitCityBounds bounds={fitBounds} />

          {ranked.map(({ cluster }) => {
            const isSelected = cluster.id === selectedId
            const positions = ringToLatLngs(cluster.polygon)
            const { stroke } = cluster.mapColor
            return (
              <Polygon
                key={cluster.id}
                positions={positions}
                pathOptions={{
                  color: stroke,
                  weight: isSelected ? 3 : 2,
                  fillColor: stroke,
                  fillOpacity: isSelected ? 0.48 : 0.32,
                  opacity: 0.95,
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  click: () => onSelect(cluster.id),
                  mouseover: (e) => {
                    const layer = e.target as L.Path
                    layer.setStyle({ fillOpacity: 0.55, weight: 3 })
                  },
                  mouseout: (e) => {
                    const layer = e.target as L.Path
                    layer.setStyle({
                      fillOpacity: isSelected ? 0.48 : 0.32,
                      weight: isSelected ? 3 : 2,
                    })
                  },
                }}
              >
                <Tooltip
                  permanent
                  direction="center"
                  className="stay-cluster-label"
                  opacity={1}
                >
                  <span
                    style={{
                      color: stroke,
                      fontWeight: 800,
                      fontSize: isSelected ? 13 : 12,
                      textShadow:
                        '0 0 3px #fff, 0 0 3px #fff, 1px 1px 0 #fff, -1px -1px 0 #fff',
                    }}
                  >
                    {cluster.name}
                  </span>
                </Tooltip>
              </Polygon>
            )
          })}
        </MapContainer>
      </div>

      <div className="shrink-0 border-t border-ink/8 bg-paper/95 px-3 py-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {ranked.map(({ cluster }) => (
            <button
              key={`leg-${cluster.id}`}
              type="button"
              onClick={() => onSelect(cluster.id)}
              className={`inline-flex items-center gap-1.5 text-[0.68rem] font-bold transition ${
                cluster.id === selectedId ? 'text-ink' : 'text-ink/70 hover:text-ink'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full ring-1 ring-white"
                style={{ background: cluster.mapColor.stroke }}
              />
              {cluster.name}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[0.62rem] text-muted">
          Clusters are approximate tourist areas — zoom and pan the street map for landmarks,
          markets and beaches.
        </p>
      </div>

      <style>{`
        .leaflet-container { background: #e8eef1; font-family: inherit; }
        .stay-cluster-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .stay-cluster-label::before { display: none !important; }
        .leaflet-tooltip-top:before,
        .leaflet-tooltip-bottom:before,
        .leaflet-tooltip-left:before,
        .leaflet-tooltip-right:before { display: none !important; }
      `}</style>
    </div>
  )
}
