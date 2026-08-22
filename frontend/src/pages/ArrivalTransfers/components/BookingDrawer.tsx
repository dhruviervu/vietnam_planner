import { useEffect } from 'react'
import type { BookingProvider, ProviderOption } from '../data/types'

type Props = {
  option: ProviderOption
  providers: BookingProvider[]
  onClose: () => void
}

export function BookingDrawer({ option, providers, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[22px] bg-paper p-5 shadow-card sm:rounded-[22px]">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
          Booking options
        </p>
        <h3 className="mt-1 font-serif text-[1.25rem] font-semibold text-ink">{option.name}</h3>
        <p className="mt-1 text-[0.8rem] font-medium text-muted">
          Vietnam, Curated explains and compares. The provider handles the booking.
        </p>
        <div className="mt-4 space-y-3">
          {providers.map((p) => (
            <article key={p.id} className="rounded-[14px] bg-cream/70 p-3 ring-1 ring-ink/8">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-ink">{p.name}</p>
                  <p className="text-[0.72rem] font-semibold text-muted">{p.source}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-terracotta">{p.priceLabel}</p>
                  <p className="text-[0.72rem] font-bold text-ink">⭐ {p.rating.toFixed(1)}</p>
                </div>
              </div>
              <div className="mt-2 grid gap-0.5 text-[0.72rem] font-semibold text-ink/80">
                <span>Cancellation · {p.cancellation}</span>
                <span>Flight delay · {p.flightDelay}</span>
                <span>Luggage · {p.luggage}</span>
                <span>Pickup · {p.pickup}</span>
              </div>
              <a
                href={p.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-full bg-terracotta px-3 py-1.5 text-[0.72rem] font-bold text-paper"
              >
                Continue to provider →
              </a>
              <p className="mt-1.5 text-[0.65rem] font-medium text-muted">
                You&apos;re leaving Vietnam, Curated. Prices and policies are controlled by the
                provider.
              </p>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-[0.78rem] font-bold text-terracotta hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  )
}
