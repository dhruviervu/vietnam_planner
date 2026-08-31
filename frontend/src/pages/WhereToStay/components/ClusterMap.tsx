import { useEffect, useMemo, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { RankedCluster } from '../data/ranking'
import type { StayCity } from '../data/types'
import { GOOGLE_ROADMAP_TILES } from '../lib/googleMapTiles'
import type { StayBagPin } from '../lib/tripBagStayPins'
import { HoiAnStayMap } from './HoiAnStayMap'
import { StayBagFlagLayer } from './StayBagFlagLayer'

type Props = {
  city: StayCity
  ranked: RankedCluster[]
  selectedId: string
  onSelect: (clusterId: string) => void
  bagPins?: StayBagPin[]
}

const FIT_MAX_ZOOM: Record<string, number> = {
  hanoi: 13,
  hcmc: 13,
  'da-nang': 13,
  'hoi-an': 13,
  hue: 14,
  'nha-trang': 13,
  dalat: 14,
  'phu-quoc': 12,
}

function BindCityMap({
  mapRef,
  bounds,
  maxZoom,
}: {
  mapRef: { current: L.Map | null }
  bounds: [[number, number], [number, number]]
  maxZoom: number
}) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
    const timer = window.setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(bounds, { padding: [28, 28], maxZoom, animate: false })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [map, mapRef, bounds, maxZoom])
  return null
}

function ringToLatLngs(ring: [number, number][]): [number, number][] {
  return ring.map(([lng, lat]) => [lat, lng])
}

/** Hoi An keeps its extra geography layers; every city now uses Google Maps tiles. */
export function ClusterMap({ city, ranked, selectedId, onSelect, bagPins = [] }: Props) {
  if (city.id === 'hoi-an') {
    return (
      <HoiAnStayMap
        ranked={ranked}
        selectedId={selectedId}
        onSelect={onSelect}
        bagPins={bagPins}
      />
    )
  }
  return (
    <LegacyClusterMap
      city={city}
      ranked={ranked}
      selectedId={selectedId}
      onSelect={onSelect}
      bagPins={bagPins}
    />
  )
}

function LegacyClusterMap({ city, ranked, selectedId, onSelect, bagPins = [] }: Props) {
  const fitBounds = useMemo(() => {
    const { west, south, east, north } = city.bounds
    const latPad = Math.max((north - south) * 0.05, 0.003)
    const lngPad = Math.max((east - west) * 0.05, 0.003)
    return [
      [south - latPad, west - lngPad],
      [north + latPad, east + lngPad],
    ] as [[number, number], [number, number]]
  }, [city.bounds])

  const center = useMemo((): [number, number] => {
    return [
      (fitBounds[0][0] + fitBounds[1][0]) / 2,
      (fitBounds[0][1] + fitBounds[1][1]) / 2,
    ]
  }, [fitBounds])

  const mapRef = useRef<L.Map | null>(null)
  const fitMaxZoom = FIT_MAX_ZOOM[city.id] ?? 13
  const panBounds = useMemo(() => {
    const midLat = (fitBounds[0][0] + fitBounds[1][0]) / 2
    const midLng = (fitBounds[0][1] + fitBounds[1][1]) / 2
    const latSpan = (fitBounds[1][0] - fitBounds[0][0]) * 0.85
    const lngSpan = (fitBounds[1][1] - fitBounds[0][1]) * 0.85
    return [
      [midLat - latSpan, midLng - lngSpan],
      [midLat + latSpan, midLng + lngSpan],
    ] as [[number, number], [number, number]]
  }, [fitBounds])

  function fitCity() {
    const map = mapRef.current
    if (!map) return
    map.invalidateSize()
    map.fitBounds(fitBounds, { padding: [28, 28], maxZoom: fitMaxZoom })
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-ink/10 bg-[#e8eef1]">
      <div className="relative h-[min(58vw,400px)] min-h-[300px] lg:h-[400px]">
        <MapContainer
          key={city.id}
          center={center}
          zoom={12}
          className="h-full w-full"
          scrollWheelZoom
          zoomControl={false}
          attributionControl
          maxBounds={panBounds}
          maxBoundsViscosity={0.35}
        >
          <TileLayer
            attribution={GOOGLE_ROADMAP_TILES.attribution}
            url={GOOGLE_ROADMAP_TILES.url}
            subdomains={GOOGLE_ROADMAP_TILES.subdomains}
            maxZoom={GOOGLE_ROADMAP_TILES.maxZoom}
          />
          <BindCityMap mapRef={mapRef} bounds={fitBounds} maxZoom={fitMaxZoom} />

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
                  weight: isSelected ? 4 : 2.8,
                  fillColor: stroke,
                  fillOpacity: isSelected ? 0.88 : 0.78,
                  opacity: 1,
                  lineJoin: 'round',
                  lineCap: 'round',
                }}
                eventHandlers={{
                  click: () => onSelect(cluster.id),
                  mouseover: (e) => {
                    const layer = e.target as L.Path
                    layer.setStyle({
                      fillOpacity: isSelected ? 0.92 : 0.84,
                      weight: isSelected ? 4.2 : 3.2,
                    })
                    layer.bringToFront()
                  },
                  mouseout: (e) => {
                    const layer = e.target as L.Path
                    layer.setStyle({
                      fillOpacity: isSelected ? 0.88 : 0.78,
                      weight: isSelected ? 4 : 2.8,
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
                      color: '#1a1714',
                      fontWeight: 800,
                      fontSize: 15,
                      letterSpacing: '0.01em',
                      textShadow:
                        '0 0 5px #fff, 0 0 5px #fff, 1px 1px 0 #fff, -1px -1px 0 #fff',
                    }}
                  >
                    {cluster.name}
                  </span>
                </Tooltip>
              </Polygon>
            )
          })}
          <StayBagFlagLayer pins={bagPins} />
        </MapContainer>
        <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={fitCity}
            className="rounded-[3px] bg-paper/95 px-2.5 py-1.5 text-[0.68rem] font-bold text-ink shadow-md ring-1 ring-ink/10 hover:text-terracotta"
          >
            Fit city
          </button>
          <div className="flex overflow-hidden rounded-[3px] bg-paper/95 shadow-md ring-1 ring-ink/10">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => mapRef.current?.zoomOut()}
              className="px-2.5 py-1.5 text-[0.85rem] font-bold text-ink hover:bg-ink/5"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => mapRef.current?.zoomIn()}
              className="border-l border-ink/10 px-2.5 py-1.5 text-[0.85rem] font-bold text-ink hover:bg-ink/5"
            >
              +
            </button>
          </div>
        </div>
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
          Google Map of {city.label}. Coloured neighbourhoods are stay areas, not
          official cadastral borders. Use Fit city to reset the view.
          {bagPins.length > 0 ? ' 🚩 marks plans from your trip bag.' : ''}
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
          font-weight: 800 !important;
          font-size: 15px !important;
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
