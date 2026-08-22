import { useRef, useState, type MouseEvent } from 'react'
import { flyToItinerary } from '../../hooks/useFlyToItinerary'
import { useCartStore, type CartItem } from '../../store/cartStore'

type Size = 'sm' | 'md'
type Variant = 'icon' | 'full'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
}

type Props = {
  item: CartItem
  size?: Size
  variant?: Variant
  className?: string
}

export function AddToItineraryButton({
  item,
  size = 'md',
  variant = 'icon',
  className = '',
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hasItem = useCartStore((s) => s.items.some((entry) => entry.id === item.id))
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const [busy, setBusy] = useState(false)

  function handleClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return

    if (hasItem) {
      removeItem(item.id)
      return
    }

    const rect = buttonRef.current?.getBoundingClientRect()
    addItem(item)
    if (rect) {
      setBusy(true)
      flyToItinerary(rect)
      window.setTimeout(() => setBusy(false), 600)
    }
  }

  if (variant === 'full') {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        aria-pressed={hasItem}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[0.9rem] font-bold transition-[background,color,transform] duration-200 ${
          hasItem
            ? 'bg-sage text-paper hover:bg-sage/90'
            : 'bg-gradient-to-br from-terracotta to-terracotta-deep text-paper shadow-[0_8px_22px_rgba(196,92,58,0.28)] hover:scale-[1.015]'
        } ${className}`}
      >
        {hasItem ? (
          <>
            Added
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add to Itinerary
          </>
        )}
      </button>
    )
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={hasItem ? `Remove ${item.name} from itinerary` : `Add ${item.name} to itinerary`}
      aria-pressed={hasItem}
      className={`relative inline-grid place-items-center rounded-full border border-ink/5 bg-paper text-ink shadow-[0_6px_18px_rgba(58,50,44,0.18)] transition-[background,color,transform] duration-200 hover:scale-105 hover:bg-cream ${SIZE_CLASS[size]} ${className}`}
    >
      <span
        className={`absolute inset-0 grid place-items-center transition-all duration-200 ${
          hasItem ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span
        className={`absolute inset-0 grid place-items-center text-terracotta transition-all duration-200 ${
          hasItem ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </span>
    </button>
  )
}
