import { useEffect, useState } from 'react'
import { Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { StayBagPin } from '../lib/tripBagStayPins'

/** 45px flags reduced 1.5×. */
const FLAG_PX = 30
const ICON_BOX = 36
const TIP_X = 12
const TIP_Y = 28
const RING_SLOTS = 8

function groupNearby(pins: StayBagPin[], map: L.Map, zoom: number): StayBagPin[][] {
  const maxPx = FLAG_PX * 1.15
  const max2 = maxPx * maxPx
  const pts = pins.map((pin) => {
    const p = map.project(L.latLng(pin.lat, pin.lng), zoom)
    return { pin, x: p.x, y: p.y }
  })
  const groups: (typeof pts)[] = []
  for (const item of pts) {
    const hits: number[] = []
    groups.forEach((group, i) => {
      if (
        group.some((g) => {
          const dx = g.x - item.x
          const dy = g.y - item.y
          return dx * dx + dy * dy <= max2
        })
      ) {
        hits.push(i)
      }
    })
    if (!hits.length) {
      groups.push([item])
      continue
    }
    const target = hits[0]!
    groups[target]!.push(item)
    for (let k = hits.length - 1; k >= 1; k--) {
      const idx = hits[k]!
      groups[target]!.push(...groups[idx]!)
      groups.splice(idx, 1)
    }
  }
  return groups.map((group) => group.map((g) => g.pin))
}

function spiderOffset(index: number, count: number): { x: number; y: number } {
  if (count <= 1) return { x: 0, y: 0 }
  const ring = Math.floor(index / RING_SLOTS)
  const slot = index % RING_SLOTS
  const ringSize =
    ring < Math.floor((count - 1) / RING_SLOTS) ? RING_SLOTS : ((count - 1) % RING_SLOTS) + 1
  const minSep = FLAG_PX * 1.85
  const rNeeded = ringSize <= 1 ? minSep : minSep / (2 * Math.sin(Math.PI / ringSize))
  const r = rNeeded + ring * (FLAG_PX + 14)
  const angle = (slot / ringSize) * Math.PI * 2 - Math.PI / 2
  return { x: Math.round(Math.cos(angle) * r), y: Math.round(Math.sin(angle) * r) }
}

function spiderPad(count: number) {
  if (count <= 1) return 0
  let max = 0
  for (let i = 0; i < count; i++) {
    const { x, y } = spiderOffset(i, count)
    max = Math.max(max, Math.abs(x), Math.abs(y))
  }
  return max
}

function bagFlagIcon(x: number, y: number, pad: number) {
  const size = ICON_BOX + pad * 2
  return L.divIcon({
    className: 'stay-bag-flag',
    html: `<span class="stay-bag-flag__mark" style="left:${pad + x}px;top:${pad + y}px" aria-hidden="true">🚩</span>`,
    iconSize: [size, size],
    iconAnchor: [pad + TIP_X, pad + TIP_Y],
    tooltipAnchor: [x, y - FLAG_PX],
  })
}

type Props = {
  pins: StayBagPin[]
}

export function StayBagFlagLayer({ pins }: Props) {
  if (!pins.length) return null
  return <StayBagFlagMarkers pins={pins} />
}

function StayBagFlagMarkers({ pins }: Props) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  useEffect(() => {
    const sync = () => setZoom(map.getZoom())
    map.on('zoomend', sync)
    return () => {
      map.off('zoomend', sync)
    }
  }, [map])

  const markers = groupNearby(pins, map, zoom).flatMap((group) => {
    const pad = spiderPad(group.length)
    const lat = group.reduce((s, p) => s + p.lat, 0) / group.length
    const lng = group.reduce((s, p) => s + p.lng, 0) / group.length
    return group.map((pin, i) => {
      const { x, y } = spiderOffset(i, group.length)
      return {
        pin,
        position: [lat, lng] as [number, number],
        icon: bagFlagIcon(x, y, pad),
        z: 600 + i,
      }
    })
  })

  return (
    <>
      {markers.map(({ pin, position, icon, z }) => (
        <Marker
          key={pin.id}
          position={position}
          icon={icon}
          zIndexOffset={z}
        >
          <Tooltip direction="top" offset={[0, -18]} opacity={1}>
            <span className="text-[0.8rem] font-bold text-ink">{pin.name}</span>
          </Tooltip>
        </Marker>
      ))}
      <style>{`
        .stay-bag-flag {
          background: transparent !important;
          border: none !important;
          pointer-events: none !important;
        }
        .stay-bag-flag__mark {
          position: absolute;
          display: block;
          pointer-events: auto;
          font-size: ${FLAG_PX}px;
          line-height: 1;
          filter:
            drop-shadow(0 0 3px #fff)
            drop-shadow(0 0 6px #fff)
            drop-shadow(0 2px 3px rgba(0, 0, 0, 0.45));
        }
      `}</style>
    </>
  )
}
