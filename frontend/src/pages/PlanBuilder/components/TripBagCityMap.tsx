import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { GOOGLE_HYBRID_TILES } from '../../WhereToStay/lib/googleMapTiles'
import { placeCoords } from '../lib/yourVietnam/cityPins'
import {
  resolveDayMapPins,
  type DayMapStop,
  type ResolvedDayPin,
} from '../lib/yourVietnam/dayMapPins'
import type { PlaceId } from '../../GettingAround/data/types'

type Props = {
  stops: DayMapStop[]
  cityLabel: string
  placeId?: PlaceId
  activeStopId?: string | null
  onSelectStop: (id: string) => void
}

function googlePin(n: number, active: boolean) {
  const fill = active ? '#c45c3a' : '#ea4335'
  return L.divIcon({
    className: 'yv-day-pin',
    html: `<div style="width:28px;height:40px;pointer-events:none">
      <svg width="28" height="40" viewBox="0 0 28 40" aria-hidden="true" style="display:block">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${fill}" stroke="#fff" stroke-width="1.25"/>
        <circle cx="14" cy="14" r="8.2" fill="#fff"/>
        <text x="14" y="18.2" text-anchor="middle" font-size="11" font-weight="700" font-family="system-ui,sans-serif" fill="${fill}">${n}</text>
      </svg>
    </div>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
  })
}

function stayPin(active: boolean) {
  const fill = active ? '#c45c3a' : '#5c6f58'
  return L.divIcon({
    className: 'yv-day-pin yv-stay-pin',
    html: `<div style="width:28px;height:40px;pointer-events:none">
      <svg width="28" height="40" viewBox="0 0 28 40" aria-hidden="true" style="display:block">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${fill}" stroke="#fff" stroke-width="1.25"/>
        <path d="M8.2 18.2V12.4l5.8-4.2 5.8 4.2v5.8H8.2z" fill="#fff"/>
        <rect x="12.2" y="14.6" width="3.6" height="3.6" rx="0.4" fill="${fill}"/>
      </svg>
    </div>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
  })
}

function sortPins(a: ResolvedDayPin, b: ResolvedDayPin) {
  const an = a.n === 0 ? 1000 : a.n
  const bn = b.n === 0 ? 1000 : b.n
  return an - bn
}

/** Nudge pins that share a coordinate so every number stays visible. */
function spreadOverlappingPins(pins: ResolvedDayPin[]): ResolvedDayPin[] {
  const groups = new Map<string, ResolvedDayPin[]>()
  for (const p of pins) {
    const k = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`
    const g = groups.get(k) ?? []
    g.push(p)
    groups.set(k, g)
  }
  const out: ResolvedDayPin[] = []
  for (const group of groups.values()) {
    if (group.length === 1) {
      out.push(group[0])
      continue
    }
    const meters = 32
    const lat0 = group[0].lat
    const mPerDegLat = 111_320
    const mPerDegLng = 111_320 * Math.cos((lat0 * Math.PI) / 180)
    group.forEach((p, i) => {
      const ang = (2 * Math.PI * i) / group.length - Math.PI / 2
      out.push({
        ...p,
        lat: p.lat + (meters * Math.cos(ang)) / mPerDegLat,
        lng: p.lng + (meters * Math.sin(ang)) / mPerDegLng,
      })
    })
  }
  return out.sort(sortPins)
}

function pinPixelOff(map: L.Map, pins: ResolvedDayPin[], size: L.Point) {
  const padX = 22
  const padTop = 48
  const padBot = 16
  return pins.filter((p) => {
    const pt = map.latLngToContainerPoint([p.lat, p.lng])
    return pt.x < padX || pt.x > size.x - padX || pt.y < padTop || pt.y > size.y - padBot
  })
}

/** After zoom is known, separate pins that would overlap on screen. */
function spreadByPixels(map: L.Map, pins: ResolvedDayPin[], minPx = 40): ResolvedDayPin[] {
  if (pins.length < 2) return pins
  const items = pins.map((p) => ({ p, pt: map.latLngToContainerPoint([p.lat, p.lng]) }))
  const parent = items.map((_, i) => i)
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (Math.hypot(items[i].pt.x - items[j].pt.x, items[i].pt.y - items[j].pt.y) < minPx) {
        parent[find(j)] = find(i)
      }
    }
  }
  const groups = new Map<number, number[]>()
  for (let i = 0; i < items.length; i++) {
    const r = find(i)
    const g = groups.get(r) ?? []
    g.push(i)
    groups.set(r, g)
  }
  const out: ResolvedDayPin[] = []
  for (const idxs of groups.values()) {
    if (idxs.length === 1) {
      out.push(items[idxs[0]].p)
      continue
    }
    const cx = idxs.reduce((s, i) => s + items[i].pt.x, 0) / idxs.length
    const cy = idxs.reduce((s, i) => s + items[i].pt.y, 0) / idxs.length
    const radius = 28 + 10 * idxs.length
    idxs.forEach((i, k) => {
      const ang = (2 * Math.PI * k) / idxs.length - Math.PI / 2
      const ll = map.containerPointToLatLng([
        cx + radius * Math.cos(ang),
        cy + radius * Math.sin(ang),
      ])
      out.push({ ...items[i].p, lat: ll.lat, lng: ll.lng })
    })
  }
  return out.sort(sortPins)
}

function collapseDuplicateStays(pins: ResolvedDayPin[]) {
  const seen = new Set<string>()
  return pins.filter((p) => {
    if (p.n !== 0) return true
    const k = p.sourceId || p.name
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function spreadUntilSeparated(map: L.Map, pins: ResolvedDayPin[], minPx = 44) {
  let cur = pins
  for (let i = 0; i < 4; i++) {
    cur = spreadByPixels(map, cur, minPx)
    if (minPixelSep(map, cur) >= minPx - 4) break
  }
  return cur
}

function minPixelSep(map: L.Map, pins: ResolvedDayPin[]) {
  let min = Infinity
  for (let i = 0; i < pins.length; i++) {
    const a = map.latLngToContainerPoint([pins[i].lat, pins[i].lng])
    for (let j = i + 1; j < pins.length; j++) {
      const b = map.latLngToContainerPoint([pins[j].lat, pins[j].lng])
      min = Math.min(min, Math.hypot(a.x - b.x, a.y - b.y))
    }
  }
  return Number.isFinite(min) ? +min.toFixed(1) : 0
}

function DayPinLayer({
  pins,
  placeId,
  activeStopId,
  onSelectStop,
}: {
  pins: ResolvedDayPin[]
  placeId?: PlaceId
  activeStopId?: string | null
  onSelectStop: (id: string) => void
}) {
  const map = useMap()
  const [drawn, setDrawn] = useState<ResolvedDayPin[]>(pins)
  const key = pins.map((p) => `${p.id}:${p.lat.toFixed(5)}`).join('|')
  useEffect(() => {
    let cancelled = false
    const fit = () => {
      if (cancelled) return
      map.invalidateSize()
      const size = map.getSize()
      if (size.x < 40 || size.y < 40) return
      const base = collapseDuplicateStays(pins)
      if (base.length === 0) {
        const c = placeId ? placeCoords(placeId) : null
        map.setView(c ? [c.lat, c.lng] : [16.0, 107.5], c ? 13 : 5)
        setDrawn([])
        return
      }
      if (base.length === 1) {
        map.setView([base[0].lat, base[0].lng], 14)
        setDrawn(base)
      } else {
        const bounds = L.latLngBounds(base.map((p) => [p.lat, p.lng] as [number, number]))
        map.fitBounds(bounds, {
          paddingTopLeft: [44, 56],
          paddingBottomRight: [44, 32],
          maxZoom: 14,
          animate: false,
        })
        let guard = 0
        while (pinPixelOff(map, base, map.getSize()).length > 0 && map.getZoom() > 8 && guard++ < 8) {
          map.setZoom(map.getZoom() - 1, { animate: false })
        }
        setDrawn(spreadUntilSeparated(map, base, 44))
      }
    }
    fit()
    map.whenReady(fit)
    const raf = requestAnimationFrame(fit)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [map, key, pins, placeId])

  return (
    <>
      {drawn.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={pin.n > 0 ? googlePin(pin.n, pin.id === activeStopId) : stayPin(pin.id === activeStopId)}
          zIndexOffset={pin.n > 0 ? pin.n * 40 : 10}
          eventHandlers={{
            click: () => onSelectStop(pin.id),
          }}
        >
          <Tooltip direction="top" offset={[0, -36]} opacity={0.95}>
            {pin.n > 0 ? `${pin.n}. ${pin.name}` : `Stay · ${pin.name}`}
          </Tooltip>
          <Popup>
            <span className="text-[0.82rem] font-semibold">{pin.name}</span>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export function TripBagCityMap({ stops, cityLabel, placeId, activeStopId, onSelectStop }: Props) {
  const [pins, setPins] = useState<ResolvedDayPin[]>([])

  const center = useMemo<[number, number]>(() => {
    const c = placeId ? placeCoords(placeId) : null
    if (c) return [c.lat, c.lng]
    return [16.0, 107.5]
  }, [placeId])

  const stopKey = stops.map((s) => s.id).join('|')

  useEffect(() => {
    let cancelled = false
    resolveDayMapPins(stops, cityLabel, placeId, (partial) => {
      if (cancelled) return
      setPins(partial)
    }).then((resolved) => {
      if (cancelled) return
      setPins(resolved)
    })
    return () => {
      cancelled = true
    }
    // stopKey stands in for stops identity so geocoding does not loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopKey, cityLabel, placeId])

  const displayPins = useMemo(() => spreadOverlappingPins(pins), [pins])

  return (
    <div className="yv-city-map h-[min(300px,42vh)] overflow-hidden rounded-[22px] border border-ink/10 lg:h-[min(380px,48vh)]">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        touchZoom={true}
        attributionControl
      >
        <TileLayer
          url={GOOGLE_HYBRID_TILES.url}
          attribution={GOOGLE_HYBRID_TILES.attribution}
          subdomains={GOOGLE_HYBRID_TILES.subdomains}
          maxZoom={GOOGLE_HYBRID_TILES.maxZoom}
        />
        <ZoomControl position="bottomright" />
        <DayPinLayer
          pins={displayPins}
          placeId={placeId}
          activeStopId={activeStopId}
          onSelectStop={onSelectStop}
        />
      </MapContainer>
    </div>
  )
}
