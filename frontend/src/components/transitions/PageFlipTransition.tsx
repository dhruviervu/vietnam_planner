import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import HTMLFlipBook from 'react-pageflip'
import { useLocation, type Location } from 'react-router-dom'
import { useNavigationDirection, type NavDirection } from '../../hooks/useNavigationDirection'

const FLIP_MS = 550

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export function scrollToTopInstant() {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  root.style.scrollBehavior = previous
}

type PageFlipTransitionProps = {
  children: (location: Location) => ReactNode
}

type PrepareTransition = {
  status: 'prepare'
  from: Location
  to: Location
  direction: NavDirection
}

type FlipTransition = {
  status: 'flip'
  from: Location
  to: Location
  direction: NavDirection
  width: number
  height: number
}

type Transition = PrepareTransition | FlipTransition

type BookRef = {
  pageFlip: () => {
    flipNext: (corner?: string) => void
    flipPrev: (corner?: string) => void
    getPageCount?: () => number
    getCurrentPageIndex?: () => number
  } | null
}

/**
 * Two-leaf StPageFlip transition for a router-driven SPA.
 * Flipbook exists ONLY during a transition, then unmounts to plain DOM.
 */
export function PageFlipTransition({ children }: PageFlipTransitionProps) {
  const location = useLocation()
  const direction = useNavigationDirection()
  const reduceMotion = usePrefersReducedMotion()

  const prevLocationRef = useRef(location)
  const [transition, setTransition] = useState<Transition | null>(null)
  const [fade, setFade] = useState(false)

  const fromMeasureRef = useRef<HTMLDivElement>(null)
  const toMeasureRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<BookRef | null>(null)
  const flipStartedRef = useRef(false)
  const completedRef = useRef(false)

  const finishTransition = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    flipStartedRef.current = false
    setTransition(null)
    scrollToTopInstant()
  }, [])

  useLayoutEffect(() => {
    if (prevLocationRef.current.key === location.key) return

    const from = prevLocationRef.current
    const dir = direction
    prevLocationRef.current = location
    completedRef.current = false
    flipStartedRef.current = false

    scrollToTopInstant()

    if (reduceMotion) {
      setFade(true)
      const id = window.setTimeout(() => {
        setFade(false)
        scrollToTopInstant()
      }, 150)
      return () => window.clearTimeout(id)
    }

    setTransition({
      status: 'prepare',
      from,
      to: location,
      direction: dir,
    })
  }, [location, direction, reduceMotion])

  useLayoutEffect(() => {
    if (!transition || transition.status !== 'prepare') return

    const width = Math.max(
      document.documentElement.clientWidth || window.innerWidth,
      320,
    )
    const fromH = fromMeasureRef.current?.scrollHeight ?? window.innerHeight
    const toH = toMeasureRef.current?.scrollHeight ?? window.innerHeight
    const height = Math.max(fromH, toH, window.innerHeight)

    setTransition({
      status: 'flip',
      from: transition.from,
      to: transition.to,
      direction: transition.direction,
      width,
      height,
    })
  }, [transition])

  // Programmatic flip once the book engine is ready (+ hard safety unmount)
  useEffect(() => {
    if (!transition || transition.status !== 'flip') return

    let cancelled = false
    let attempts = 0

    const tryStartFlip = () => {
      if (cancelled || flipStartedRef.current || completedRef.current) return
      const api = bookRef.current?.pageFlip?.()
      if (!api) {
        if (attempts++ < 30) {
          window.setTimeout(tryStartFlip, 16)
        } else {
          finishTransition()
        }
        return
      }

      flipStartedRef.current = true
      try {
        if (transition.direction === 'forward') {
          api.flipNext('top')
        } else {
          api.flipPrev('top')
        }
      } catch (err) {
        console.warn('[page-flip] flip failed, falling back', err)
        finishTransition()
      }
    }

    const startId = window.setTimeout(tryStartFlip, 32)
    const safetyId = window.setTimeout(() => finishTransition(), FLIP_MS + 500)

    return () => {
      cancelled = true
      window.clearTimeout(startId)
      window.clearTimeout(safetyId)
    }
  }, [transition, finishTransition])

  const handleFlip = useCallback(
    (e: { data: number }) => {
      if (!transition || transition.status !== 'flip') return
      if (!flipStartedRef.current) return

      const target = transition.direction === 'forward' ? 1 : 0
      if (e.data === target) {
        window.setTimeout(() => finishTransition(), 48)
      }
    },
    [transition, finishTransition],
  )

  const handleChangeState = useCallback(
    (e: { data: string }) => {
      if (!flipStartedRef.current || completedRef.current) return
      if (e.data === 'read') {
        window.setTimeout(() => finishTransition(), 48)
      }
    },
    [finishTransition],
  )

  if (!transition) {
    return (
      <div
        className={`min-h-screen w-full bg-cream transition-opacity duration-150 ${
          fade ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children(location)}
      </div>
    )
  }

  if (transition.status === 'prepare') {
    const width = Math.max(
      document.documentElement.clientWidth || window.innerWidth,
      320,
    )
    return (
      <div className="relative min-h-screen w-full bg-cream">
        <div className="relative z-[1] min-h-screen w-full">{children(transition.to)}</div>
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 -z-10 overflow-hidden opacity-0"
          style={{ width }}
        >
          <div ref={fromMeasureRef}>{children(transition.from)}</div>
          <div ref={toMeasureRef}>{children(transition.to)}</div>
        </div>
      </div>
    )
  }

  const { from, to, direction: dir, width, height } = transition
  const forward = dir === 'forward'
  const firstLoc = forward ? from : to
  const secondLoc = forward ? to : from

  // Force portrait/single-page: minWidth >= width/2 would still allow landscape
  // when width is large. Setting minWidth === width keeps blockWidth < minWidth*2.
  return (
    <div
      className="page-flip-stage relative w-full overflow-x-clip bg-cream"
      style={{ minHeight: height }}
    >
      <HTMLFlipBook
        key={`${from.key}->${to.key}:${dir}`}
        ref={bookRef as never}
        className="page-flip-book mx-auto"
        style={{}}
        width={width}
        height={height}
        size="stretch"
        minWidth={width}
        maxWidth={width}
        minHeight={height}
        maxHeight={height}
        drawShadow
        flippingTime={FLIP_MS}
        usePortrait
        startPage={forward ? 0 : 1}
        startZIndex={5}
        autoSize
        maxShadowOpacity={0.55}
        showCover={false}
        mobileScrollSupport={false}
        clickEventForward
        useMouseEvents={false}
        swipeDistance={0}
        showPageCorners={false}
        disableFlipByClick
        onFlip={handleFlip}
        onChangeState={handleChangeState}
      >
        <div
          className="flip-leaf bg-cream"
          data-density="soft"
          style={{ width, height, overflow: 'hidden' }}
        >
          <div style={{ minHeight: height }}>{children(firstLoc)}</div>
        </div>
        <div
          className="flip-leaf bg-cream"
          data-density="soft"
          style={{ width, height, overflow: 'hidden' }}
        >
          <div style={{ minHeight: height }}>{children(secondLoc)}</div>
        </div>
      </HTMLFlipBook>
    </div>
  )
}
