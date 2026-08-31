import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type { MapProjectionMeta } from '../maps/mapMeta'
import { createProjector, curvedSvgPath, nearestLocationId } from '../maps/project'

export type SvgMapLocation = {
  id: string
  label: string
  lat: number
  lng: number
  type?: string
  hint?: string
  priority?: number
  emoji?: string
  highlighted?: boolean
}

type Props = {
  meta: MapProjectionMeta
  locations: SvgMapLocation[]
  originId: string | null
  destinationId: string | null
  onSelectLocation: (id: string) => void
  fitLabel?: string
  connectionLabel?: string
  className?: string
  /** Larger map chrome for urban detail */
  size?: 'default' | 'large' | 'workspace'
  alwaysShowLabels?: boolean
  /** Click empty map area → snap to nearest curated location (inter-city). */
  enableBackgroundSnap?: boolean
  /** Max geographic snap distance in km */
  snapMaxKm?: number
  /** Called when a background click is too far from any location */
  onSnapMiss?: () => void
  /** Draw direction arrow on the selected connection */
  showConnectionArrow?: boolean
  /** Optional status line under zoom controls */
  statusHint?: string | null
  /** Optional contextual hubs (airports/ports) — shown subtly when a connecting journey is active */
  contextMarkers?: SvgMapLocation[]
  /**
   * Urban free-form: click anywhere → geographic coordinates.
   * Near a landmark (landmarkHitKm) still selects that landmark via onSelectLocation.
   */
  enableFreeformSelect?: boolean
  landmarkHitKm?: number
  onSelectCoordinate?: (coord: { lat: number; lng: number }) => void
  /** Free-form A/B markers (when selection is not a landmark id in locations) */
  freeformOrigin?: { lat: number; lng: number; label: string } | null
  freeformDestination?: { lat: number; lng: number; label: string } | null
  /** Soften landmark markers so free-form is clearly primary */
  landmarksMuted?: boolean
  /** Geographic hover context from parent (district / water / outside) */
  geoHover?: { title: string; subtitle: string; kind: string } | null
  /** Fired on pointer move over map with inverted lat/lng (urban geography) */
  onMapPointerGeo?: (coord: { lat: number; lng: number } | null) => void
  /** Long-distance: pin emoji markers instead of dots */
  markerVariant?: 'dot' | 'emoji' | 'pin'
  /** Hide zoom controls and disable pan/zoom (long-distance map). */
  disableZoomPan?: boolean
}

type HoverState = { id: string; x: number; y: number; label: string; hint: string } | null

export function SvgTransportMap({
  meta,
  locations,
  originId,
  destinationId,
  onSelectLocation,
  fitLabel = 'Fit map',
  connectionLabel = 'Selected connection',
  className = '',
  size = 'default',
  alwaysShowLabels = false,
  enableBackgroundSnap = false,
  snapMaxKm = 95,
  onSnapMiss,
  showConnectionArrow = false,
  statusHint = null,
  contextMarkers = [],
  enableFreeformSelect = false,
  landmarkHitKm = 0.22,
  onSelectCoordinate,
  freeformOrigin = null,
  freeformDestination = null,
  landmarksMuted = false,
  geoHover = null,
  onMapPointerGeo,
  markerVariant = 'dot',
  disableZoomPan = false,
}: Props) {
  const markerId = useId().replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [hover, setHover] = useState<HoverState>(null)
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const movedRef = useRef(false)
  const width = meta.viewBox[2]
  const height = meta.viewBox[3]

  const project = useMemo(() => createProjector(meta), [meta])

  const points = useMemo(() => {
    return locations
      .map((loc) => {
        const pt = project(loc.lng, loc.lat)
        if (!pt) return null
        return { ...loc, ...pt }
      })
      .filter(Boolean) as (SvgMapLocation & { x: number; y: number })[]
  }, [locations, project])

  const origin = points.find((p) => p.id === originId) ?? null
  const destination = points.find((p) => p.id === destinationId) ?? null

  const freeOriginPt = useMemo(() => {
    if (!freeformOrigin) return null
    const pt = project(freeformOrigin.lng, freeformOrigin.lat)
    if (!pt) return null
    return { ...freeformOrigin, ...pt }
  }, [freeformOrigin, project])

  const freeDestPt = useMemo(() => {
    if (!freeformDestination) return null
    const pt = project(freeformDestination.lng, freeformDestination.lat)
    if (!pt) return null
    return { ...freeformDestination, ...pt }
  }, [freeformDestination, project])

  const lineA = freeOriginPt ?? origin
  const lineB = freeDestPt ?? destination
  const connection = lineA && lineB ? curvedSvgPath(lineA, lineB) : null

  const hubs = useMemo(() => {
    return contextMarkers
      .map((loc) => {
        const pt = project(loc.lng, loc.lat)
        if (!pt) return null
        return { ...loc, ...pt }
      })
      .filter(Boolean) as (SvgMapLocation & { x: number; y: number })[]
  }, [contextMarkers, project])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setHover(null)
    fetch(meta.file)
      .then((res) => {
        if (!res.ok) throw new Error('missing')
        if (cancelled) return
        setStatus('ready')
        setScale(1)
        setTx(0)
        setTy(0)
      })
      .catch(() => {
        if (!cancelled) setStatus('failed')
      })
    return () => {
      cancelled = true
    }
  }, [meta.file])

  function zoomBy(factor: number) {
    setScale((s) => Math.min(4.5, Math.max(1, Number((s * factor).toFixed(3)))))
  }

  function fit() {
    setScale(1)
    setTx(0)
    setTy(0)
  }

  function clientToMapCoords(clientX: number, clientY: number): { x: number; y: number } | null {
    const svg = svgRef.current
    if (!svg) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const svgPt = pt.matrixTransform(ctm.inverse())
    const cx = width / 2 + tx
    const cy = height / 2 + ty
    return {
      x: (svgPt.x - cx) / scale + width / 2,
      y: (svgPt.y - cy) / scale + height / 2,
    }
  }

  function snapFromClient(clientX: number, clientY: number) {
    const mapPt = clientToMapCoords(clientX, clientY)
    if (!mapPt) return
    const geo = project.invert(mapPt.x, mapPt.y)
    if (!geo) return

    if (enableFreeformSelect) {
      const hit = nearestLocationId(geo, locations, landmarkHitKm)
      if (hit) {
        onSelectLocation(hit.id)
        return
      }
      onSelectCoordinate?.(geo)
      return
    }

    const hit = nearestLocationId(geo, locations, snapMaxKm)
    if (!hit) {
      onSnapMiss?.()
      return
    }
    onSelectLocation(hit.id)
  }

  function onPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0) return
    if (disableZoomPan) return
    movedRef.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty }
  }

  function onPointerMove(e: ReactPointerEvent) {
    const drag = dragRef.current
    if (drag && !disableZoomPan) {
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      if (Math.hypot(dx, dy) > 4) movedRef.current = true
      setTx(drag.tx + dx)
      setTy(drag.ty + dy)
      return
    }
    if (!onMapPointerGeo || status !== 'ready') return
    const mapPt = clientToMapCoords(e.clientX, e.clientY)
    if (!mapPt) {
      onMapPointerGeo(null)
      return
    }
    const geo = project.invert(mapPt.x, mapPt.y)
    onMapPointerGeo(geo)
  }

  function onPointerUp(e: ReactPointerEvent) {
    const dragged = movedRef.current
    dragRef.current = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    if (dragged || status !== 'ready') return
    if (enableFreeformSelect || enableBackgroundSnap) {
      snapFromClient(e.clientX, e.clientY)
    }
  }

  function selectPoint(id: string, e?: { stopPropagation: () => void }) {
    e?.stopPropagation()
    if (movedRef.current) return
    onSelectLocation(id)
  }

  function onKeySelect(id: string, e: ReactKeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectLocation(id)
    }
  }

  const transform = disableZoomPan
    ? `translate(${width / 2} ${height / 2}) scale(1) translate(${-width / 2} ${-height / 2})`
    : `translate(${width / 2 + tx} ${height / 2 + ty}) scale(${scale}) translate(${-width / 2} ${-height / 2})`
  const heightClass =
    size === 'workspace'
      ? 'h-full min-h-[420px] lg:min-h-0'
      : size === 'large'
        ? 'h-[340px] sm:h-[420px] lg:h-[520px]'
        : 'h-[300px] sm:h-[380px] lg:h-[480px]'

  const isVietnamMap = meta.file.includes('vietnam.svg')
  const mapChrome = isVietnamMap ? '#B7D4C8' : '#D6E4E8'
  const shellClass =
    size === 'workspace'
      ? `relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[18px] ring-1 ring-ink/10 ${className}`
      : `relative overflow-hidden rounded-[18px] ring-1 ring-ink/10 ${className}`

  const nextStep =
    !lineA || (lineA && lineB)
      ? 'Click to set origin'
      : 'Click to set destination'
  const clickableBg = enableBackgroundSnap || enableFreeformSelect

  return (
    <div className={shellClass} style={{ backgroundColor: mapChrome }}>
      <div
        className={`${heightClass} w-full flex-1 touch-none ${clickableBg ? 'cursor-crosshair' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => onMapPointerGeo?.(null)}
      >
        {status === 'ready' ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="h-full w-full"
            role="img"
            aria-label="Geographic transport map"
          >
            <defs>
              {showConnectionArrow ? (
                <marker
                  id={`ga-arrow-${markerId}`}
                  markerWidth="7"
                  markerHeight="7"
                  refX="6"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L7,3.5 L0,7 Z" fill="#C45C3E" />
                </marker>
              ) : null}
            </defs>
            <g transform={transform}>
              <image
                href={meta.file}
                x={0}
                y={0}
                width={width}
                height={height}
                preserveAspectRatio="xMidYMid meet"
              />

              {connection && lineA && lineB ? (
                <path
                  key={`${lineA.x}-${lineA.y}-${lineB.x}-${lineB.y}`}
                  d={connection}
                  fill="none"
                  stroke="#C45C3E"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeDasharray="7 5"
                  opacity={0.92}
                  className="ga-svg-arc"
                  pointerEvents="none"
                  markerEnd={
                    showConnectionArrow ? `url(#ga-arrow-${markerId})` : undefined
                  }
                >
                  <title>{connectionLabel}</title>
                </path>
              ) : null}

              {hubs.map((h) => (
                <g key={`hub-${h.id}`} transform={`translate(${h.x} ${h.y})`} pointerEvents="none">
                  <circle r={5} fill="#FAF3E8" stroke="#8A7460" strokeWidth={1.2} strokeDasharray="2 1.5" />
                  <text
                    y={-8}
                    textAnchor="middle"
                    className="select-none"
                    style={{ fontSize: 9, fontWeight: 700, fill: '#5c4f44', opacity: 0.9 }}
                  >
                    {h.label}
                  </text>
                </g>
              ))}

              {[
                freeOriginPt
                  ? { key: 'free-a', pt: freeOriginPt, role: 'origin' as const, label: freeOriginPt.label }
                  : null,
                freeDestPt
                  ? {
                      key: 'free-b',
                      pt: freeDestPt,
                      role: 'destination' as const,
                      label: freeDestPt.label,
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((item) => {
                  const it = item!
                  const r = 7.5
                  const core = it.role === 'origin' ? '#C45C3E' : '#4F8A5B'
                  return (
                    <g
                      key={it.key}
                      transform={`translate(${it.pt.x} ${it.pt.y})`}
                      pointerEvents="none"
                    >
                      <circle r={r + 7} fill={core} opacity={0.18} />
                      <circle r={r + 3.2} fill="#FFFaf3" stroke={core} strokeWidth={2} />
                      <circle r={r} fill={core} />
                      <circle
                        cx={-r * 0.28}
                        cy={-r * 0.3}
                        r={Math.max(1.2, r * 0.32)}
                        fill="#FFFFFF"
                        opacity={0.55}
                      />
                      <g className="pointer-events-none select-none">
                        <rect
                          x={-36}
                          y={-r - 22}
                          width={72}
                          height={14}
                          rx={7}
                          fill="rgba(255,250,243,0.94)"
                          stroke="rgba(28,22,18,0.12)"
                          strokeWidth={0.8}
                        />
                        <text
                          y={-r - 12}
                          textAnchor="middle"
                          style={{ fontSize: 9.5, fontWeight: 700, fill: '#1c1612' }}
                        >
                          {it.role === 'origin' ? 'A · ' : 'B · '}
                          {it.label.length > 14 ? `${it.label.slice(0, 13)}…` : it.label}
                        </text>
                      </g>
                    </g>
                  )
                })}

              {points.map((p) => {
                const role =
                  p.id === originId
                    ? 'origin'
                    : p.id === destinationId
                      ? 'destination'
                      : hover?.id === p.id
                        ? 'hover'
                        : 'default'
                // When freeform markers carry A/B, don't also emphasize landmark as A/B fill
                const visualRole =
                  freeOriginPt && role === 'origin'
                    ? 'default'
                    : freeDestPt && role === 'destination'
                      ? 'default'
                      : role
                const priority = p.priority ?? 3
                const r =
                  visualRole === 'origin' || visualRole === 'destination'
                    ? 7
                    : visualRole === 'hover'
                      ? 6.2
                      : landmarksMuted
                        ? priority <= 1
                          ? 4.2
                          : 3.4
                        : priority <= 1
                          ? 5.8
                          : priority <= 2
                            ? 5
                            : 4.2
                const hit = markerVariant === 'pin' || markerVariant === 'emoji' ? 22 : 16
                const showLabel =
                  alwaysShowLabels ||
                  visualRole === 'origin' ||
                  visualRole === 'destination' ||
                  visualRole === 'hover' ||
                  p.highlighted ||
                  markerVariant === 'pin' ||
                  (!landmarksMuted && priority <= 1) ||
                  (!disableZoomPan && scale > 1.35)

                const core =
                  visualRole === 'origin'
                    ? '#C45C3E'
                    : visualRole === 'destination'
                      ? '#4F8A5B'
                      : visualRole === 'hover'
                        ? '#A84A32'
                        : priority <= 1
                          ? '#C45C3E'
                          : priority <= 2
                            ? '#2F7F86'
                            : '#5C6B7A'
                const ring =
                  visualRole === 'origin' || visualRole === 'destination' || visualRole === 'hover'
                    ? core
                    : '#FFFFFF'
                const muteOpacity = landmarksMuted && visualRole === 'default' ? 0.55 : 1

                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.x} ${p.y})`}
                    className="cursor-pointer"
                    opacity={muteOpacity}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectPoint(p.id, e)
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation()
                    }}
                    onMouseEnter={() =>
                      setHover({
                        id: p.id,
                        x: p.x,
                        y: p.y,
                        label: p.label,
                        hint: p.hint || p.type || 'Transport place',
                      })
                    }
                    onMouseLeave={() => setHover((h) => (h?.id === p.id ? null : h))}
                    onFocus={() =>
                      setHover({
                        id: p.id,
                        x: p.x,
                        y: p.y,
                        label: p.label,
                        hint: p.hint || p.type || 'Transport place',
                      })
                    }
                    onBlur={() => setHover((h) => (h?.id === p.id ? null : h))}
                    role="button"
                    tabIndex={0}
                    aria-label={`${p.label}. ${nextStep}`}
                    onKeyDown={(e) => onKeySelect(p.id, e)}
                  >
                    <circle r={hit} fill="transparent" />
                    {markerVariant === 'pin' || markerVariant === 'emoji' || p.emoji ? (
                      <>
                        {p.highlighted ||
                        visualRole === 'origin' ||
                        visualRole === 'destination' ? (
                          <circle
                            r={visualRole === 'origin' || visualRole === 'destination' ? 22 : 20}
                            fill={
                              visualRole === 'origin'
                                ? '#C45C3E'
                                : visualRole === 'destination'
                                  ? '#4F8A5B'
                                  : '#C45C3E'
                            }
                            opacity={0.22}
                          />
                        ) : null}
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize:
                              visualRole === 'origin' || visualRole === 'destination'
                                ? 36
                                : p.highlighted
                                  ? 32
                                  : 28,
                            fontWeight: 600,
                          }}
                        >
                          {markerVariant === 'pin' ? '📍' : p.emoji || '📍'}
                        </text>
                      </>
                    ) : (
                      <>
                    <circle r={r + 6} fill={core} opacity={landmarksMuted ? 0.1 : 0.16} />
                    <circle
                      r={r + 2.8}
                      fill="#FFFaf3"
                      stroke={ring}
                      strokeWidth={visualRole === 'default' ? 1.2 : 2}
                    />
                    <circle r={r} fill={core} />
                    <circle
                      cx={-r * 0.28}
                      cy={-r * 0.3}
                      r={Math.max(1.1, r * 0.32)}
                      fill="#FFFFFF"
                      opacity={0.5}
                    />
                      </>
                    )}
                    {showLabel ? (
                      <g className="pointer-events-none select-none">
                        {(() => {
                          const labelW = Math.max(36, Math.min(88, p.label.length * 5.2 + 12))
                          return (
                            <>
                              <rect
                                x={-labelW / 2}
                                y={
                                  markerVariant === 'pin' || markerVariant === 'emoji'
                                    ? -38
                                    : -r - 20
                                }
                                width={labelW}
                                height={13}
                                rx={6.5}
                                fill="rgba(255,250,243,0.9)"
                                stroke="rgba(28,22,18,0.1)"
                                strokeWidth={0.7}
                              />
                              <text
                                y={
                                  markerVariant === 'pin' || markerVariant === 'emoji'
                                    ? -29
                                    : -r - 11
                                }
                                textAnchor="middle"
                                style={{
                                  fontSize: priority <= 1 ? 9.5 : 8.5,
                                  fontWeight: 700,
                                  fill: '#1c1612',
                                }}
                              >
                                {p.label}
                              </text>
                            </>
                          )
                        })()}
                      </g>
                    ) : null}
                  </g>
                )
              })}
            </g>
          </svg>
        ) : null}
      </div>

      {geoHover && status === 'ready' ? (
        <div className="pointer-events-none absolute right-3 top-14 z-20 max-w-[16rem] rounded-[12px] bg-paper/95 px-3 py-2.5 shadow-sm ring-1 ring-ink/10 backdrop-blur-sm">
          <p className="text-[0.82rem] font-bold text-ink">📍 {geoHover.title}</p>
          <p className="mt-0.5 text-[0.7rem] font-medium text-muted">{geoHover.subtitle}</p>
          <p className="mt-1.5 text-[0.65rem] font-semibold text-terracotta">
            {geoHover.kind === 'outside' ? 'Outside supported boundary' : nextStep}
          </p>
        </div>
      ) : hover && status === 'ready' ? (
        <div className="pointer-events-none absolute right-3 top-14 z-20 max-w-[16rem] rounded-[12px] bg-paper/95 px-3 py-2.5 shadow-sm ring-1 ring-ink/10 backdrop-blur-sm">
          <p className="text-[0.82rem] font-bold text-ink">📍 {hover.label}</p>
          <p className="mt-0.5 text-[0.7rem] font-medium text-muted">{hover.hint}</p>
          <p className="mt-1.5 text-[0.65rem] font-semibold text-terracotta">{nextStep}</p>
        </div>
      ) : null}

      {statusHint ? (
        <div className="pointer-events-none absolute left-3 top-14 z-20 max-w-[15rem] rounded-[12px] bg-paper/95 px-3 py-2 text-[0.7rem] font-semibold text-ink shadow-sm ring-1 ring-ink/10">
          {statusHint}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-[#E8DFD2]/75">
          <div className="h-40 w-24 rounded-[14px] bg-[#D6E4E8]/90 ring-1 ring-ink/8" />
          <p className="mt-4 text-[0.78rem] font-semibold text-muted">Loading geographic map…</p>
        </div>
      ) : null}

      {status === 'failed' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-cream/95 px-4 text-center">
          <div>
            <p className="font-serif text-[1.1rem] font-semibold text-ink">Map unavailable</p>
            <p className="mt-1 max-w-[36ch] text-[0.8rem] font-medium text-muted">
              Map unavailable right now. You can still explore transport options with the selectors.
            </p>
          </div>
        </div>
      ) : null}

      {status === 'ready' && !disableZoomPan ? (
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => zoomBy(1.25)}
            className="rounded-[10px] bg-paper/95 px-2.5 py-1.5 text-[0.68rem] font-bold text-ink shadow-sm ring-1 ring-ink/10"
          >
            Zoom in
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.25)}
            className="rounded-[10px] bg-paper/95 px-2.5 py-1.5 text-[0.68rem] font-bold text-ink shadow-sm ring-1 ring-ink/10"
          >
            Zoom out
          </button>
          <button
            type="button"
            onClick={fit}
            className="rounded-[10px] bg-paper/95 px-2.5 py-1.5 text-[0.68rem] font-bold text-ink shadow-sm ring-1 ring-ink/10"
          >
            {fitLabel}
          </button>
        </div>
      ) : null}

      {markerVariant !== 'pin' && markerVariant !== 'emoji' ? (
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-[12px] bg-paper/92 px-3 py-2 text-[0.65rem] font-semibold text-ink shadow-sm ring-1 ring-ink/8 backdrop-blur-sm">
        <p className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink/35" /> Major place
        </p>
        <p className="mt-1 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-terracotta" /> Origin
        </p>
        <p className="mt-1 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sage" /> Destination
        </p>
        <p className="mt-1.5 text-muted">···· {connectionLabel}</p>
      </div>
      ) : null}

      <style>{`
        .ga-svg-arc {
          stroke-dashoffset: 48;
          animation: ga-arc-draw 0.65s ease forwards;
        }
        @keyframes ga-arc-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}
