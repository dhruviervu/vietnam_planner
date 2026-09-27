import { memo, useState, type MouseEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CityActivity } from '../data/activities'
import { getActivityImages } from '../data/activities'
import { catalogCardPhotoUrl } from '../lib/resolveCatalogPhotos'
import { useTripStore } from '../../../store/tripStore'
import { flyToTripBag } from '../lib/flyToTripBag'
import { pinNewSightToItinerary, readItineraryAddTarget } from '../lib/yourVietnam/itineraryAddTarget'
import { openDetailHref } from '../lib/yourVietnam/links'
import { activitiesCityPath } from '../services/citySlug'

type Props = {
  activity: CityActivity
  cityRank?: number
  compact?: boolean
  dense?: boolean
}

export const ActivityCard = memo(function ActivityCard({
  activity,
  cityRank,
  compact = false,
  dense = false,
}: Props) {
  const [justAdded, setJustAdded] = useState(false)
  const [showFitNote, setShowFitNote] = useState(false)
  const [broken, setBroken] = useState<Record<string, boolean>>({})
  const selected = useTripStore((s) => s.selectedActivityIds.includes(activity.id))
  const addActivity = useTripStore((s) => s.addActivity)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const [photoIndex, setPhotoIndex] = useState(0)
  const images = getActivityImages(activity).slice(0, 3).map(catalogCardPhotoUrl)
  const visiblePhotos = images.filter((src) => !broken[src])
  const currentPhoto = visiblePhotos[Math.min(photoIndex, Math.max(visiblePhotos.length - 1, 0))]
  const isFree = activity.priceFromUsd === 0

  function shiftPhoto(e: MouseEvent, delta: number) {
    e.stopPropagation()
    if (visiblePhotos.length < 2) return
    setPhotoIndex((i) => (i + delta + visiblePhotos.length) % visiblePhotos.length)
  }

  function openDetail() {
    openDetailHref(`/plan/builder/activity/${activity.id}`)
  }

  function handleAdd(e: MouseEvent) {
    e.stopPropagation()
    const itineraryTarget = readItineraryAddTarget()
    if (selected) {
      if (itineraryTarget) {
        pinNewSightToItinerary(activity.id)
        return
      }
      removeActivity(activity.id)
      setJustAdded(false)
      setShowFitNote(false)
      return
    }
    const target = e.currentTarget as HTMLElement
    const article = target.closest('article')
    const img = article?.querySelector('img')
    const rect = (img ?? target).getBoundingClientRect()
    flyToTripBag(rect, images[0])
    addActivity(activity.id)
    if (itineraryTarget) pinNewSightToItinerary(activity.id)
    setJustAdded(true)
    setShowFitNote(true)
    window.setTimeout(() => setJustAdded(false), 2200)
  }

  function stop(e: MouseEvent) {
    e.stopPropagation()
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDetail()
        }
      }}
      className={`group cursor-pointer overflow-hidden bg-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
        dense ? 'rounded-[18px]' : 'rounded-[22px]'
      } ${compact ? 'w-[var(--sight-card-w,calc((100%-2rem)/2.5))] min-w-[var(--sight-card-w,calc((100%-2rem)/2.5))] max-w-none shrink-0 snap-start' : ''}`}
    >
      <div className={`relative overflow-hidden bg-cream ${dense || compact ? 'aspect-[5/3.4]' : 'aspect-[5/3.2]'}`}>
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={activity.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 360px"
            onError={() => setBroken((prev) => ({ ...prev, [currentPhoto]: true }))}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-terracotta/15 to-sage/25" />
        )}
        {visiblePhotos.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => shiftPhoto(e, -1)}
              className="absolute left-2 top-1/2 z-[1] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-ink/50 text-paper backdrop-blur-sm hover:bg-ink/70"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => shiftPhoto(e, 1)}
              className="absolute right-2 top-1/2 z-[1] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-ink/50 text-paper backdrop-blur-sm hover:bg-ink/70"
            >
              ›
            </button>
            <div className="absolute inset-x-0 bottom-2 z-[1] flex justify-center gap-1">
              {visiblePhotos.map((src, i) => (
                <span
                  key={src}
                  className={`h-1.5 rounded-full ${
                    i === Math.min(photoIndex, visiblePhotos.length - 1)
                      ? 'w-3.5 bg-paper'
                      : 'w-1.5 bg-paper/50'
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-terracotta/95 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-paper backdrop-blur-sm">
            {activity.popularityTag}
          </span>
          <span className="rounded-full bg-paper/92 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-ink backdrop-blur-sm">
            {activity.kindLabel}
          </span>
        </div>
      </div>

      <div className={dense || compact ? 'p-3' : 'p-4'}>
        <h3 className="flex items-start gap-1.5 font-serif text-[1.02rem] font-semibold leading-tight text-ink">
          {cityRank != null ? (
            <a
              href={activitiesCityPath(activity.cityName)}
              target="_blank"
              rel="noopener noreferrer"
              title={`#${cityRank} in ${activity.cityName}`}
              aria-label={`#${cityRank} in ${activity.cityName}`}
              onClick={stop}
              className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-terracotta/12 px-1.5 font-serif text-[0.82rem] font-bold tabular-nums text-terracotta underline decoration-terracotta/40 underline-offset-2 ring-1 ring-terracotta/30 transition hover:bg-terracotta hover:text-paper hover:no-underline"
            >
              #{cityRank}
            </a>
          ) : null}
          <span className="min-w-0 flex-1">{activity.name}</span>
        </h3>
        <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-terracotta">
          <a
            href={activitiesCityPath(activity.cityName)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
            className="underline decoration-terracotta/35 underline-offset-2 hover:decoration-terracotta"
          >
            {activity.cityName}
          </a>
        </p>
        <p className="mt-1.5 line-clamp-3 text-[0.82rem] leading-snug text-muted">
          {activity.cardSummary}{' '}
          <button
            type="button"
            onClick={(e) => {
              stop(e)
              openDetail()
            }}
            className="inline font-bold text-terracotta hover:underline"
          >
            learn more…
          </button>
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Metric label="Rating" value={`⭐ ${activity.rating}`} />
          <Metric
            label="Cost"
            value={isFree ? 'Free' : `💰 ${activity.priceLabel}`}
          />
        </div>

        <div className="mt-3 flex gap-2" onClick={stop}>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 rounded-full px-3 py-2 text-[0.78rem] font-bold transition-transform hover:scale-[1.01] ${
              selected
                ? 'bg-sage text-paper'
                : 'bg-gradient-to-br from-terracotta to-terracotta-deep text-paper'
            }`}
          >
            {justAdded ? 'Added to your trip ✓' : selected ? '✓ In your trip' : '+ Add to trip'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e)
              openDetail()
            }}
            className="rounded-full border border-ink/12 bg-paper px-3 py-2 text-[0.78rem] font-bold text-ink hover:border-ink/25"
          >
            See More →
          </button>
        </div>

        <AnimatePresence>
          {showFitNote && selected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
              onClick={stop}
            >
              <div className="mt-3 rounded-xl border border-sage/30 bg-sage/8 px-3 py-2.5">
                <p className="text-[0.82rem] font-semibold leading-snug text-ink">
                  We&apos;ll fit this into your itinerary as an activity — alongside your
                  experiences, not instead of them.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e)
                    setShowFitNote(false)
                  }}
                  className="mt-2 text-[0.72rem] font-bold text-terracotta hover:underline"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
})

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-cream px-2 py-1.5">
      <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.72rem] font-semibold leading-snug text-ink">{value}</p>
    </div>
  )
}
