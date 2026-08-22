import { getCartBadgeRect, triggerCartBadgePop } from '../lib/cartBadgeTarget'

const DURATION_MS = 560

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** Quadratic bezier point */
function bezier(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t
  return u * u * p0 + 2 * u * t * p1 + t * t * p2
}

export function flyToItinerary(startRect: DOMRect) {
  const targetRect = getCartBadgeRect()
  if (!targetRect) return

  const startX = startRect.left + startRect.width / 2
  const startY = startRect.top + startRect.height / 2
  const endX = targetRect.left + targetRect.width / 2
  const endY = targetRect.top + targetRect.height / 2

  const midX = (startX + endX) / 2
  const midY = Math.min(startY, endY) - Math.max(80, Math.abs(endY - startY) * 0.35)

  const dot = document.createElement('div')
  dot.setAttribute('aria-hidden', 'true')
  Object.assign(dot.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '14px',
    height: '14px',
    marginLeft: '-7px',
    marginTop: '-7px',
    borderRadius: '9999px',
    background: '#c45c3a',
    boxShadow: '0 4px 12px rgba(196, 92, 58, 0.45)',
    zIndex: '9999',
    pointerEvents: 'none',
    transform: `translate(${startX}px, ${startY}px) scale(1)`,
    opacity: '1',
  })
  document.body.appendChild(dot)

  const started = performance.now()
  let popped = false

  function frame(now: number) {
    const raw = Math.min(1, (now - started) / DURATION_MS)
    const t = easeInOutCubic(raw)
    const x = bezier(startX, midX, endX, t)
    const y = bezier(startY, midY, endY, t)
    const scale = lerp(1, 0.3, t)
    const opacity = lerp(1, 0, t * 0.85 + 0.15)

    dot.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    dot.style.opacity = String(opacity)

    if (!popped && raw >= 0.92) {
      popped = true
      triggerCartBadgePop()
    }

    if (raw < 1) {
      requestAnimationFrame(frame)
      return
    }

    dot.remove()
  }

  requestAnimationFrame(frame)
}
