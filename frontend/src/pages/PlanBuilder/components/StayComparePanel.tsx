import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { hotelImages } from '../data/hotels'
import type { ScoredHotel } from '../services/stayRecommendationEngine'
import { meters } from '../services/stayRecommendationEngine'

type Props = {
  hotels: ScoredHotel[]
  onClose: () => void
  onRemove: (id: string) => void
  onExpand: () => void
}

export function StayComparePanel({ hotels, onClose, onRemove, onExpand }: Props) {
  if (hotels.length < 2) return null

  const maxPrice = Math.max(...hotels.map((h) => h.pricePerNight))
  const minPrice = Math.min(...hotels.map((h) => h.pricePerNight))
  const bestFit = Math.max(...hotels.map((h) => h.tripFit))
  const bestRating = Math.max(...hotels.map((h) => h.rating))
  const closest = Math.min(
    ...hotels.map((h) => (h.nearbyCount > 0 ? h.avgDistanceKm : Number.POSITIVE_INFINITY)),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-[22px] border border-ink/6 bg-paper/90 p-4 shadow-soft backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Stay compare
          </p>
          <p className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">
            {hotels.length} options side by side
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-1 text-[0.78rem] font-bold text-muted hover:bg-cream hover:text-ink"
        >
          ✕
        </button>
      </div>

      <p className="mt-2 text-[0.78rem] leading-snug text-muted">
        Cost, proximity to your Trip Bag, and review strength — skim the bars, then expand for the
        full picture.
      </p>

      <button
        type="button"
        onClick={onExpand}
        className="mt-3 w-full rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-4 py-2.5 text-[0.84rem] font-bold text-paper"
      >
        Expand
      </button>

      <div className="mt-4 space-y-3">
        {hotels.map((h) => {
          const isBestValue = h.pricePerNight === minPrice
          const isBestFit = h.tripFit === bestFit
          const isTopRated = h.rating === bestRating
          const isClosest =
            h.nearbyCount > 0 && Number.isFinite(closest) && h.avgDistanceKm === closest

          return (
            <div key={h.id} className="overflow-hidden rounded-2xl bg-cream/80">
              <div className="flex gap-2.5 p-2.5">
                <img
                  src={hotelImages(h)[0]}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-serif text-[0.95rem] font-semibold leading-snug text-ink">
                      {h.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(h.id)}
                      className="shrink-0 text-[0.68rem] font-bold text-muted hover:text-ink"
                      aria-label={`Remove ${h.name} from compare`}
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-wide text-terracotta">
                    {h.city}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {isBestFit && <Tag>Best trip fit</Tag>}
                    {isBestValue && <Tag>Lowest nightly</Tag>}
                    {isTopRated && <Tag>Top rated</Tag>}
                    {isClosest && <Tag>Closest avg</Tag>}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-ink/6 px-2.5 py-2.5">
                <Metric
                  label="Nightly"
                  value={`$${h.pricePerNight}`}
                  bar={minPrice === maxPrice ? 1 : (maxPrice - h.pricePerNight) / (maxPrice - minPrice || 1)}
                  tone="cost"
                  note={h.totalEstimate != null ? `~$${h.totalEstimate} / ${h.stayNights}n` : undefined}
                />
                <Metric
                  label="Trip fit"
                  value={`${h.tripFit}%`}
                  bar={h.tripFit / 100}
                  tone="fit"
                />
                <Metric
                  label="Rating"
                  value={`⭐ ${h.rating}`}
                  bar={h.rating / 5}
                  tone="rating"
                  note={`${(h.reviewCount ?? 0).toLocaleString()} reviews`}
                />
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">
                      Proximity
                    </p>
                    <p className="text-[0.78rem] font-bold text-ink">
                      {h.nearbyCount > 0
                        ? `${h.avgDistanceKm} km avg · ${h.nearbyCount} places`
                        : 'No bag places in region'}
                    </p>
                  </div>
                  {h.nearbyExperiences.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="mt-1 flex justify-between gap-2 text-[0.7rem] text-muted"
                    >
                      <span className="truncate">{e.name}</span>
                      <span className="shrink-0 font-semibold text-ink">~{e.km} km</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between gap-2 text-[0.7rem]">
                  <span className="text-muted">Transport {meters(h.transportScore ?? 3)}</span>
                  <span className="text-muted">Food {meters(h.foodAccessScore ?? 3)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-paper px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-sage">
      {children}
    </span>
  )
}

function Metric({
  label,
  value,
  bar,
  tone,
  note,
}: {
  label: string
  value: string
  bar: number
  tone: 'cost' | 'fit' | 'rating'
  note?: string
}) {
  const fill =
    tone === 'cost' ? 'bg-sage' : tone === 'fit' ? 'bg-terracotta' : 'bg-ink/70'
  const width = `${Math.max(8, Math.min(100, Math.round(bar * 100)))}%`

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">{label}</p>
        <p className="text-[0.82rem] font-bold text-ink">{value}</p>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper">
        <div className={`h-full rounded-full ${fill}`} style={{ width }} />
      </div>
      {note && <p className="mt-0.5 text-[0.65rem] text-muted">{note}</p>}
    </div>
  )
}

export function StayComparePrompt({ message }: { message: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-[18px] border border-terracotta/25 bg-terracotta/8 px-3.5 py-3 text-[0.82rem] leading-snug text-ink"
      >
        {message}
      </motion.div>
    </AnimatePresence>
  )
}
