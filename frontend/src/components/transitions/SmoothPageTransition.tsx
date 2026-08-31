import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type Props = {
  children: ReactNode
}

/**
 * Soft opacity fade on route change — no book flip, no heavy motion.
 */
export function SmoothPageTransition({ children }: Props) {
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      history.scrollRestoration = 'manual'
    } catch {
      /* ignore */
    }
    const cityHash = location.hash.startsWith('#city-')
    if (!cityHash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transition = 'none'
    // Force reflow then fade in
    void el.offsetHeight
    el.style.transition = 'opacity 220ms ease'
    el.style.opacity = '1'
  }, [location.pathname, location.hash])

  return (
    <div ref={ref} className="min-h-screen w-full bg-cream">
      {children}
    </div>
  )
}
