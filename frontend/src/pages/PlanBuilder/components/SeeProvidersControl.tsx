import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { MarketplaceOffer } from '../data/bookingMarketplaces'

type Props = {
  offers: MarketplaceOffer[]
  sightName: string
  children: ReactNode
}

export function SeeProvidersControl({ offers, sightName, children }: Props) {
  const [open, setOpen] = useState(false)
  const bookable = offers.length > 0

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-3">
        {bookable ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-ink/15 bg-paper px-6 py-3 text-[0.92rem] font-bold text-ink shadow-soft transition-transform hover:scale-[1.02] hover:border-terracotta/40"
          >
            {open ? 'Hide Providers' : 'See Providers'}
          </button>
        ) : null}
        {children}
      </div>

      <AnimatePresence>
        {bookable && open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-3 space-y-2"
          >
            <p className="text-[0.78rem] leading-snug text-muted">
              Search opens with <span className="font-semibold text-ink">{sightName}</span> so
              listed operators and prices for this sight are on the page.
            </p>
            {offers.map((offer) => (
              <a
                key={offer.id}
                href={offer.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 rounded-[16px] border border-ink/[0.07] bg-cream/90 px-3.5 py-3 transition hover:border-terracotta/35 hover:bg-paper"
              >
                <span>
                  <span className="block font-serif text-[1.02rem] font-semibold text-ink">
                    {offer.name}
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] leading-snug text-muted">
                    {offer.blurb}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-terracotta px-3 py-1.5 text-[0.72rem] font-bold text-paper">
                  Open
                </span>
              </a>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
