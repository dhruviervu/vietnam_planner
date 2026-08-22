import { useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export type NavDirection = 'forward' | 'back'

/**
 * Tracks whether the latest route change is forward or back.
 * PUSH/REPLACE → forward; POP uses an in-memory key stack to tell
 * true back (earlier stack index) from forward (later stack index / browser forward).
 *
 * Logs every decision to the console for isolation testing.
 */
export function useNavigationDirection(): NavDirection {
  const location = useLocation()
  const navigationType = useNavigationType()

  const stackRef = useRef<string[]>([location.key])
  const indexRef = useRef(0)
  const lastKeyRef = useRef(location.key)
  const directionRef = useRef<NavDirection>('forward')

  // Sync during render so direction is correct on the same frame as the location change
  if (location.key !== lastKeyRef.current) {
    const key = location.key
    const stack = stackRef.current
    let next: NavDirection = 'forward'

    if (navigationType === 'PUSH') {
      stackRef.current = stack.slice(0, indexRef.current + 1)
      stackRef.current.push(key)
      indexRef.current = stackRef.current.length - 1
      next = 'forward'
    } else if (navigationType === 'REPLACE') {
      stackRef.current[indexRef.current] = key
      next = 'forward'
    } else {
      // POP — browser back/forward
      const idx = stack.findIndex((k) => k === key)
      if (idx === -1) {
        stackRef.current = [...stack, key]
        indexRef.current = stackRef.current.length - 1
        next = 'forward'
      } else {
        next = idx < indexRef.current ? 'back' : 'forward'
        indexRef.current = idx
      }
    }

    directionRef.current = next
    lastKeyRef.current = key

    // Isolation log — verify before relying on visuals
    console.log('[nav-direction]', next, {
      type: navigationType,
      path: location.pathname,
      key,
      index: indexRef.current,
      stack: [...stackRef.current],
    })
  }

  return directionRef.current
}
