import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { loadHoiAnStayMap, type HoiAnMapBundle } from '../data/hoiAnMap'
import type { RankedCluster } from '../data/ranking'
import { GOOGLE_ROADMAP_TILES } from '../lib/googleMapTiles'
import type { StayBagPin } from '../lib/tripBagStayPins'
import { StayBagFlagLayer } from './StayBagFlagLayer'

type Props = {
  ranked: RankedCluster[]
  selectedId: string
  onSelect: (clusterId: string) => void
  bagPins?: StayBagPin[]
}

type LayerToggles = {
  clusters: boolean
  areas: boolean
  places: boolean
}

/** Hoi An extent — Old Town through An Bang / Cua Dai coast */
const HOI_AN_BOUNDS: [[number, number], [number, number]] = [
  [15.861, 108.308],
  [15.920, 108.352],
]

function FitHoiAn({ trigger }: { trigger: number }) {
  const map = useMap()
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
      map.fitBounds(HOI_AN_BOUNDS, { padding: [24, 24], maxZoom: 14 })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [map, trigger])
  return null
}

function MapZoomButtons() {
  const map = useMap()
  return (
    <div className="absolute right-3 top-12 z-[1000] flex overflow-hidden rounded-[3px] bg-paper/95 shadow-md ring-1 ring-ink/10">
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
        className="px-2.5 py-1.5 text-[0.85rem] font-bold text-ink hover:bg-ink/5"
      >
        −
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
        className="border-l border-ink/10 px-2.5 py-1.5 text-[0.85rem] font-bold text-ink hover:bg-ink/5"
      >
        +
      </button>
    </div>
  )
}

function ringToLatLngs(ring: [number, number][]): [number, number][] {
  return ring.map(([lng, lat]) => [lat, lng])
}

function areaIcon(name: string) {
  return L.divIcon({
    className: 'hoian-area-label',
    html: `<span class="hoian-area-label__text">${name.toUpperCase()}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

function placeIcon(kind: string) {
  const color =
    kind === 'beach' ? '#4A7AA8' : kind === 'historic' ? '#C45C3E' : '#5C7A6E'
  return L.divIcon({
    className: 'hoian-place-dot',
    html: `<span style="display:block;width:9px;height:9px;border-radius:50%;background:${color};border:1.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.15)"></span>`,
    iconSize: [9, 9],
    iconAnchor: [4.5, 4.5],
  })
}

export function HoiAnStayMap({ ranked, selectedId, onSelect, bagPins = [] }: Props) {
  const [bundle, setBundle] = useState<HoiAnMapBundle | null>(null)
  const [layersOpen, setLayersOpen] = useState(false)
  const [fitKey, setFitKey] = useState(0)
  const [layers, setLayers] = useState<LayerToggles>({
    clusters: true,
    areas: false,
    places: false,
  })

  useEffect(() => {
    let cancelled = false
    loadHoiAnStayMap()
      .then((data) => {
        if (!cancelled) setBundle(data)
      })
      .catch(() => {
        /* Base OSM tiles still work without overlay assets */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const center = useMemo((): [number, number] => [15.89, 108.336], [])

  const areaMarks = useMemo(() => {
    if (!bundle || !layers.areas) return []
    return bundle.areas.features
      .map((f, i) => {
        if (f.geometry.type !== 'Point') return null
        const [lng, lat] = f.geometry.coordinates
        return {
          id: `a-${i}`,
          name: String(f.properties?.name || ''),
          position: [lat, lng] as [number, number],
        }
      })
      .filter(Boolean) as { id: string; name: string; position: [number, number] }[]
  }, [bundle, layers.areas])

  const placeMarks = useMemo(() => {
    if (!bundle || !layers.places) return []
    return bundle.places.features
      .filter((f) => f.properties?.curated)
      .map((f, i) => {
        if (f.geometry.type !== 'Point') return null
        const [lng, lat] = f.geometry.coordinates
        return {
          id: `p-${i}`,
          name: String(f.properties?.name || ''),
          kind: String(f.properties?.kind || 'poi'),
          position: [lat, lng] as [number, number],
        }
      })
      .filter(Boolean) as {
      id: string
      name: string
      kind: string
      position: [number, number]
    }[]
  }, [bundle, layers.places])

  function toggle(key: keyof LayerToggles) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function setStayZones(on: boolean) {
    setLayers((prev) => ({ ...prev, clusters: on }))
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[16px] border border-ink/10 bg-[#e8eef1]">
      <div className="relative h-[min(58vw,400px)] min-h-[300px] lg:h-[400px]">
        <button
          type="button"
          onClick={() => setFitKey((k) => k + 1)}
          className="absolute right-3 top-3 z-[1000] rounded-[3px] bg-paper/95 px-2.5 py-1.5 text-[0.68rem] font-bold text-ink shadow-md ring-1 ring-ink/10 hover:text-terracotta"
        >
          Fit city
        </button>
        <MapContainer
          center={center}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom
          zoomControl={false}
          attributionControl
        >
          <TileLayer
            attribution={GOOGLE_ROADMAP_TILES.attribution}
            url={GOOGLE_ROADMAP_TILES.url}
            subdomains={GOOGLE_ROADMAP_TILES.subdomains}
            maxZoom={GOOGLE_ROADMAP_TILES.maxZoom}
          />
          <FitHoiAn trigger={fitKey} />
          <MapZoomButtons />

          {layers.clusters
            ? ranked.map(({ cluster }) => {
                const isSelected = cluster.id === selectedId
                const faded = Boolean(selectedId && !isSelected)
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
                      fillOpacity: isSelected ? 0.88 : faded ? 0.55 : 0.78,
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
                      },
                      mouseout: (e) => {
                        const layer = e.target as L.Path
                        layer.setStyle({
                          fillOpacity: isSelected ? 0.88 : faded ? 0.55 : 0.78,
                          weight: isSelected ? 4 : 2.8,
                        })
                      },
                    }}
                  >
                    <Tooltip
                      permanent
                      direction="center"
                      className="hoian-cluster-label"
                      opacity={1}
                    >
                      <span
                        style={{
                          color: '#1a1714',
                          fontWeight: 800,
                          fontSize: 15,
                          opacity: faded ? 0.85 : 1,
                          textShadow:
                            '0 0 5px #fff, 0 0 5px #fff, 1px 1px 0 #fff, -1px -1px 0 #fff',
                        }}
                      >
                        {cluster.name}
                      </span>
                    </Tooltip>
                  </Polygon>
                )
              })
            : null}

          {areaMarks.map((a) => (
            <Marker
              key={a.id}
              position={a.position}
              icon={areaIcon(a.name)}
              interactive={false}
              zIndexOffset={200}
            />
          ))}

          {placeMarks.map((p) => (
            <Marker
              key={p.id}
              position={p.position}
              icon={placeIcon(p.kind)}
              zIndexOffset={300}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <span className="text-[0.72rem] font-bold text-ink">{p.name}</span>
              </Tooltip>
            </Marker>
          ))}
          <StayBagFlagLayer pins={bagPins} />
        </MapContainer>
      </div>

      <div className="shrink-0 border-t border-ink/8 bg-paper/95 px-3 py-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.62rem] text-muted">
          <span className="font-bold uppercase tracking-wide text-ink/50">Map</span>
          <span>Google Map</span>
          {bagPins.length > 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-ink/70">
              🚩 Trip bag
            </span>
          ) : null}
          <span className="font-bold uppercase tracking-wide text-ink/50">Stay</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-3.5 rounded-[1px] bg-terracotta/30 ring-1 ring-terracotta/50" />{' '}
            Curated stay zone
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStayZones(false)}
              className={`rounded-[3px] px-2 py-1 text-[0.65rem] font-bold ${
                !layers.clusters ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
              }`}
            >
              Geography
            </button>
            <button
              type="button"
              onClick={() => setStayZones(true)}
              className={`rounded-[3px] px-2 py-1 text-[0.65rem] font-bold ${
                layers.clusters ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
              }`}
            >
              Stay zones
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLayersOpen((o) => !o)}
                className="rounded-[3px] px-2 py-1 text-[0.65rem] font-bold text-ink/70 hover:text-ink"
              >
                Layers
              </button>
              {layersOpen ? (
                <div className="absolute right-0 bottom-full mb-1 w-[168px] rounded-[3px] bg-paper p-2 shadow-lg ring-1 ring-ink/10">
                  {(
                    [
                      ['clusters', 'Stay zones'],
                      ['areas', 'Area labels'],
                      ['places', 'Landmarks'],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 px-1 py-1 text-[0.72rem] text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={layers[key]}
                        onChange={() => toggle(key)}
                        className="accent-terracotta"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {ranked.map(({ cluster }) => (
            <button
              key={cluster.id}
              type="button"
              onClick={() => {
                setStayZones(true)
                onSelect(cluster.id)
              }}
              className={`inline-flex items-center gap-1.5 text-[0.68rem] font-bold ${
                cluster.id === selectedId ? 'text-ink' : 'text-ink/65 hover:text-ink'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: cluster.mapColor.stroke }}
              />
              {cluster.name}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .leaflet-container { background: #e8eef1; font-family: inherit; }
        .hoian-cluster-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          font-weight: 800 !important;
          font-size: 15px !important;
        }
        .hoian-cluster-label::before { display: none !important; }
        .hoian-area-label {
          background: transparent !important;
          border: none !important;
        }
        .hoian-area-label__text {
          display: inline-block;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #3A322C;
          opacity: 0.78;
          text-shadow:
            0 0 3px #fff,
            1px 1px 0 #fff,
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff;
          white-space: nowrap;
          pointer-events: none;
        }
        .hoian-place-dot {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-tooltip-top:before,
        .leaflet-tooltip-bottom:before,
        .leaflet-tooltip-left:before,
        .leaflet-tooltip-right:before { display: none !important; }
        /* Custom Fit / ± replace default zoom control */
      `}</style>
    </div>
  )
}
