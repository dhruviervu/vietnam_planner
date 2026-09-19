import { useEffect, useMemo, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PlaceId } from '../data/types'
import { leafletBoundsFromCity } from '../maps/cityBounds'

export type UrbanMapMarker = {
  id: string
  label: string
  lat: number
  lng: number
  hint?: string
  role?: 'landmark' | 'bag'
}

type Props = {
  cityId: PlaceId
  cityLabel: string
  center: { lat: number; lng: number }
  zoom: number
  markers: UrbanMapMarker[]
  bagPins?: UrbanMapMarker[]
  originId: string | null
  destinationId: string | null
  freeformOrigin: { lat: number; lng: number; label: string } | null
  freeformDestination: { lat: number; lng: number; label: string } | null
  routePath?: [number, number][] | null
  routeEstimated?: boolean
  statusHint: string | null
  onSelectLocation: (id: string) => void
  onSelectCoordinate: (coord: { lat: number; lng: number }) => void
  focusNonce?: number
  focusOrigin?: { lat: number; lng: number } | null
  focusDestination?: { lat: number; lng: number } | null
}

const FIT_MAX_ZOOM: Partial<Record<PlaceId, number>> = {
  hanoi: 14,
  hcmc: 14,
  'da-nang': 14,
  'hoi-an': 15,
  hue: 14,
  'nha-trang': 14,
  dalat: 14,
  'phu-quoc': 13,
  sapa: 14,
  'ninh-binh': 14,
  'ha-long': 13,
  'can-tho': 14,
  'ha-giang': 14,
}

function pinIcon(color: string, glyph: string) {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};color:#fff;font-size:13px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.28);border:2px solid #fff">${glyph}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const landmarkIcon = pinIcon('#1f2937', '📍')
const bagIcon = pinIcon('#c45c3e', '★')
const originIcon = pinIcon('#c45c3e', 'A')
const destinationIcon = pinIcon('#5a7d5a', 'B')

function BindCityView({
  mapRef,
  bounds,
  maxZoom,
}: {
  mapRef: { current: L.Map | null }
  bounds: [[number, number], [number, number]] | null
  maxZoom: number
}) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
    const timer = window.setTimeout(() => {
      map.invalidateSize()
      if (bounds) {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom, animate: false })
      }
    }, 80)
    return () => window.clearTimeout(timer)
  }, [map, mapRef, bounds, maxZoom])
  return null
}

function MapClickLayer({
  onSelectCoordinate,
}: {
  onSelectCoordinate: (coord: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e) {
      onSelectCoordinate({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function FocusSearchPins({
  nonce,
  origin,
  destination,
}: {
  nonce: number
  origin: { lat: number; lng: number } | null
  destination: { lat: number; lng: number } | null
}) {
  const map = useMap()
  useEffect(() => {
    if (!nonce) return
    const pts: [number, number][] = []
    if (origin) pts.push([origin.lat, origin.lng])
    if (destination) pts.push([destination.lat, destination.lng])
    if (!pts.length) return
    const timer = window.setTimeout(() => {
      if (pts.length === 1) {
        const nextZoom = Math.max(15, Math.min(17, map.getZoom() < 14 ? 16 : map.getZoom()))
        map.flyTo(pts[0], nextZoom, { duration: 0.65 })
        return
      }
      map.flyToBounds(L.latLngBounds(pts), { padding: [56, 56], maxZoom: 16, duration: 0.75 })
    }, 40)
    return () => window.clearTimeout(timer)
  }, [nonce, origin?.lat, origin?.lng, destination?.lat, destination?.lng, map])
  return null
}

export function UrbanCityMap({
  cityId,
  cityLabel,
  center,
  zoom,
  markers,
  bagPins = [],
  originId,
  destinationId,
  freeformOrigin,
  freeformDestination,
  routePath = null,
  routeEstimated = false,
  statusHint,
  onSelectLocation,
  onSelectCoordinate,
  focusNonce = 0,
  focusOrigin = null,
  focusDestination = null,
}: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const bounds = useMemo(
    () => leafletBoundsFromCity(cityId, { lat: center.lat, lng: center.lng, mapZoom: zoom }),
    [cityId, center.lat, center.lng, zoom],
  )
  const maxZoom = FIT_MAX_ZOOM[cityId] ?? 14

  const pinById = useMemo(() => {
    const map = new Map<string, UrbanMapMarker>()
    for (const m of markers) map.set(m.id, m)
    for (const m of bagPins) map.set(m.id, m)
    return map
  }, [markers, bagPins])

  const straightLine = useMemo(() => {
    const from = freeformOrigin
      ? ([freeformOrigin.lat, freeformOrigin.lng] as [number, number])
      : originId
        ? (() => {
            const m = pinById.get(originId)
            return m ? ([m.lat, m.lng] as [number, number]) : null
          })()
        : null
    const to = freeformDestination
      ? ([freeformDestination.lat, freeformDestination.lng] as [number, number])
      : destinationId
        ? (() => {
            const m = pinById.get(destinationId)
            return m ? ([m.lat, m.lng] as [number, number]) : null
          })()
        : null
    if (!from || !to) return null
    return [from, to] as [number, number][]
  }, [pinById, originId, destinationId, freeformOrigin, freeformDestination])

  const path = routePath && routePath.length >= 2 ? routePath : straightLine
  const useStreetPath = Boolean(routePath && routePath.length >= 2 && !routeEstimated)

  function renderPin(m: UrbanMapMarker, isBag: boolean) {
    const isOrigin = m.id === originId
    const isDest = m.id === destinationId
    const icon = isOrigin ? originIcon : isDest ? destinationIcon : isBag ? bagIcon : landmarkIcon
    return (
      <Marker
        key={m.id}
        position={[m.lat, m.lng]}
        icon={icon}
        zIndexOffset={isOrigin || isDest ? 900 : isBag ? 650 : 200}
        eventHandlers={{
          click: (e) => {
            L.DomEvent.stopPropagation(e.originalEvent)
            onSelectLocation(m.id)
          },
        }}
      >
        <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
          <span className="text-[0.72rem] font-bold">{m.label}</span>
        </Tooltip>
      </Marker>
    )
  }

  return (
    <div className="relative h-full min-h-[480px] overflow-hidden rounded-[18px] ring-1 ring-ink/10">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="h-full w-full z-0"
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BindCityView mapRef={mapRef} bounds={bounds} maxZoom={maxZoom} />
        <FocusSearchPins nonce={focusNonce} origin={focusOrigin} destination={focusDestination} />
        <MapClickLayer onSelectCoordinate={onSelectCoordinate} />

        {markers.map((m) => renderPin(m, false))}
        {bagPins.map((m) => renderPin(m, true))}

        {freeformOrigin ? (
          <Marker position={[freeformOrigin.lat, freeformOrigin.lng]} icon={originIcon} zIndexOffset={900}>
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
              <span className="text-[0.72rem] font-bold">{freeformOrigin.label}</span>
            </Tooltip>
          </Marker>
        ) : null}

        {freeformDestination ? (
          <Marker
            position={[freeformDestination.lat, freeformDestination.lng]}
            icon={destinationIcon}
            zIndexOffset={900}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
              <span className="text-[0.72rem] font-bold">{freeformDestination.label}</span>
            </Tooltip>
          </Marker>
        ) : null}

        {path && useStreetPath ? (
          <>
            <Polyline positions={path} pathOptions={{ color: '#1a73e8', weight: 8, opacity: 0.28 }} />
            <Polyline positions={path} pathOptions={{ color: '#4285F4', weight: 5, opacity: 0.95 }} />
          </>
        ) : path ? (
          <Polyline
            positions={path}
            pathOptions={{ color: '#c45c3e', weight: 3, dashArray: '8 6', opacity: 0.85 }}
          />
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] bg-gradient-to-b from-ink/55 to-transparent px-4 py-3 pr-28">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-paper/75">
          {cityLabel} · OpenStreetMap
        </p>
        <p className="mt-0.5 text-[0.78rem] font-semibold text-paper">
          {bagPins.length
            ? 'Trip-bag places are marked · tap two pins, or anywhere, for A → B'
            : 'Tap the map or a pin for Point A → Point B'}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          const map = mapRef.current
          if (!map) return
          map.invalidateSize()
          map.fitBounds(bounds, { padding: [24, 24], maxZoom })
        }}
        className="absolute right-3 top-3 z-[1000] rounded-[3px] bg-paper/95 px-2.5 py-1.5 text-[0.68rem] font-bold text-ink shadow-md ring-1 ring-ink/10 hover:text-terracotta"
      >
        Fit city
      </button>

      {statusHint ? (
        <div className="absolute bottom-3 left-3 right-3 z-[400] rounded-[12px] bg-paper/95 px-3 py-2 text-[0.75rem] font-medium text-ink shadow-md ring-1 ring-ink/10 backdrop-blur-sm">
          {statusHint}
        </div>
      ) : null}
    </div>
  )
}
