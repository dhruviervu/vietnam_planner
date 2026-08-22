import { getTripBagRect, triggerTripBagPop } from './tripBagTarget'

const DURATION_MS = 620

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function bezier(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t
  return u * u * p0 + 2 * u * t * p1 + t * t * p2
}

/** Fly a thumbnail (or rect) toward the Trip Bag anchor. */
export function flyToTripBag(startRect: DOMRect, imageSrc?: string) {
  const targetRect = getTripBagRect()
  if (!targetRect) return

  const startX = startRect.left + startRect.width / 2
  const startY = startRect.top + startRect.height / 2
  const endX = targetRect.left + targetRect.width / 2
  const endY = targetRect.top + targetRect.height / 2

  const midX = (startX + endX) / 2
  const midY = Math.min(startY, endY) - Math.max(70, Math.abs(endY - startY) * 0.3)

  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '48px',
    height: '36px',
    marginLeft: '-24px',
    marginTop: '-18px',
    borderRadius: '10px',
    overflow: 'hidden',
    zIndex: '9999',
    pointerEvents: 'none',
    boxShadow: '0 8px 20px rgba(61, 44, 36, 0.28)',
    transform: `translate(${startX}px, ${startY}px) scale(1)`,
    opacity: '1',
    background: '#c45c3a',
  })

  if (imageSrc) {
    const img = document.createElement('img')
    img.src = imageSrc
    img.alt = ''
    Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover' })
    el.appendChild(img)
  }

  document.body.appendChild(el)

  const started = performance.now()
  let popped = false

  function frame(now: number) {
    const raw = Math.min(1, (now - started) / DURATION_MS)
    const t = easeInOutCubic(raw)
    const x = bezier(startX, midX, endX, t)
    const y = bezier(startY, midY, endY, t)
    const scale = lerp(1, 0.25, t)
    const opacity = lerp(1, 0, t * 0.8 + 0.2)

    el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    el.style.opacity = String(opacity)

    if (!popped && raw >= 0.9) {
      popped = true
      triggerTripBagPop()
    }

    if (raw < 1) {
      requestAnimationFrame(frame)
      return
    }
    el.remove()
  }

  requestAnimationFrame(frame)
}
