import { useEffect, useRef, useState } from 'react'
import { onCartBadgePop, registerCartBadge } from '../../lib/cartBadgeTarget'
import { useCartStore } from '../../store/cartStore'

export function CartBadge() {
  const count = useCartStore((s) => s.items.length)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [popping, setPopping] = useState(false)

  useEffect(() => {
    registerCartBadge(anchorRef.current)
    return () => registerCartBadge(null)
  }, [])

  useEffect(() => {
    return onCartBadgePop(() => {
      setPopping(true)
      window.setTimeout(() => setPopping(false), 350)
    })
  }, [])

  return (
    <span
      ref={anchorRef}
      className="pointer-events-none absolute -right-1 -top-1 z-10 grid h-5 min-w-5 place-items-center"
      aria-hidden={count === 0}
    >
      {count > 0 && (
        <span
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta-deep px-1 text-[0.65rem] font-bold leading-none text-paper shadow-[0_4px_10px_rgba(163,72,44,0.45)] ${
            popping ? 'animate-cart-pop' : ''
          }`}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  )
}
