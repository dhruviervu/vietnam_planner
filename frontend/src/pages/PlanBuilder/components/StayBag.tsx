import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { hotelImages, getHotelById } from '../data/hotels'
import { getBaseById } from '../data/stayBases'
import { onStayBagPop, registerStayBag } from '../lib/stayBagTarget'
import { StayBagEmptyState } from './StayBagEmptyState'
import { StayBagItem } from './StayBagItem'
import { scoreHotel, suggestedStayNights } from '../services/stayRecommendationEngine'

type Props = {
  mobileOpen?: boolean
  onToggleMobile?: () => void
  /** Rendered below the desktop Stay Bag card (e.g. compare panel) */
  footer?: ReactNode
}

export function StayBag({ mobileOpen = false, onToggleMobile, footer }: Props) {
  const basics = useTripStore((s) => s.basics)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const hotelIds = useTripStore((s) => s.selectedHotelIds)
  const stayStyle = useTripStore((s) => s.stayStyle)
  const preferredBaseId = useTripStore((s) => s.preferredBaseId)
  const toggleHotel = useTripStore((s) => s.toggleHotel)

  const [expanded, setExpanded] = useState(false)
  const [popping, setPopping] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const preferredBase = preferredBaseId ? getBaseById(preferredBaseId) : null
  const stayHint = suggestedStayNights(basics, selectedIds, preferredBase ?? null)

  const saved = useMemo(() => {
    return hotelIds
      .map((id) => getHotelById(id))
      .filter(Boolean)
      .map((hotel) => {
        const scored = scoreHotel(hotel!, basics, selectedIds, stayStyle, stayHint.nights)
        return scored
      })
  }, [hotelIds, basics, selectedIds, stayStyle, stayHint.nights])

  const cities = [...new Set(saved.map((h) => h.city))]
  const locationSummary =
    cities.length === 0
      ? ''
      : cities.length <= 3
        ? cities.join(' · ')
        : `${cities.length} cities · ${saved.length} stays`

  useEffect(() => {
    registerStayBag(anchorRef.current)
    return () => registerStayBag(null)
  }, [])

  useEffect(() => {
    return onStayBagPop(() => {
      setPopping(true)
      window.setTimeout(() => setPopping(false), 380)
    })
  }, [])

  const body = (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Your Stay Bag
          </p>
          {saved.length > 0 && (
            <p className="mt-1 text-[0.78rem] font-bold uppercase tracking-wide text-muted">
              {saved.length} stay{saved.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div
          ref={anchorRef}
          className={`grid h-11 w-11 place-items-center rounded-2xl bg-cream transition-transform ${
            popping ? 'scale-110' : ''
          }`}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7a8f72" strokeWidth="1.7">
            <rect x="4" y="8" width="16" height="12" rx="2.5" />
            <path d="M8 8V6.5C8 4.57 9.57 3 11.5 3h1C14.43 3 16 4.57 16 6.5V8" />
            <path d="M8 14h8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {saved.length === 0 ? (
        <StayBagEmptyState />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 w-full rounded-2xl border border-ink/8 bg-cream/70 px-3 py-3 text-left transition-colors hover:bg-cream"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-serif text-[1.15rem] font-semibold text-ink">
                Your Stay Bag · {saved.length}
              </p>
              <span className="text-muted">{expanded ? '▾' : '▸'}</span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {saved.slice(0, 8).map((h) => (
                <div key={h.id} className="overflow-hidden rounded-lg">
                  <img
                    src={hotelImages(h)[0]}
                    alt={h.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {locationSummary && (
              <p className="mt-3 text-[0.78rem] leading-snug text-muted">{locationSummary}</p>
            )}

            <p className="mt-3 text-[0.82rem] font-medium text-ink">You don&apos;t have to decide yet.</p>
            <p className="mt-0.5 text-[0.78rem] text-muted">We&apos;ll compare your options later.</p>
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t border-ink/8 pt-3">
                  <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">
                    Collect now. Decide later.
                  </p>
                  <p className="mt-1 text-[0.78rem] text-muted">
                    Save as many as you like. We&apos;ll make the tradeoffs clear before you choose.
                  </p>
                  <ul className="mt-3 space-y-2">
                    <AnimatePresence initial={false}>
                      {saved.map((h) => (
                        <StayBagItem
                          key={h.id}
                          hotel={h}
                          tripFit={h.tripFit}
                          stayNights={h.stayNights}
                          estimatedTotal={h.totalEstimate}
                          onRemove={(id) => {
                            if (hotelIds.includes(id)) toggleHotel(id)
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {saved.length >= 4 && (
            <p className="mt-3 text-[0.78rem] leading-snug text-muted">
              {saved.length} saved — we&apos;ll shortlist the strongest fits when you compare.
            </p>
          )}
        </>
      )}
    </div>
  )

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 p-3 backdrop-blur-md xl:hidden">
        <button
          type="button"
          onClick={onToggleMobile}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-left"
        >
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
              Your Stay Bag
            </p>
            <p className="font-serif text-[1.05rem] font-semibold text-ink">
              Stay Bag · {hotelIds.length}
            </p>
          </div>
          <span className="text-muted">{mobileOpen ? '▾' : '▴'}</span>
        </button>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-h-[55vh] overflow-y-auto pt-3"
            >
              {body}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="sticky top-[88px] hidden max-h-[calc(100vh-104px)] w-[290px] shrink-0 space-y-4 overflow-y-auto xl:block">
        <div className="rounded-[22px] border border-ink/6 bg-paper/85 p-4 shadow-soft backdrop-blur-sm">
          {body}
        </div>
        {footer}
      </aside>
    </>
  )
}
