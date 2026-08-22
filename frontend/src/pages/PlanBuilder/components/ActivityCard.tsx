import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CityActivity } from '../data/activities'
import { getActivityImages } from '../data/activities'
import { useTripStore } from '../../../store/tripStore'
import { flyToTripBag } from '../lib/flyToTripBag'

type Props = {
  activity: CityActivity
}

export function ActivityCard({ activity }: Props) {
  const [slide, setSlide] = useState(0)
  const [justAdded, setJustAdded] = useState(false)
  const [showFitNote, setShowFitNote] = useState(false)
  const selectedIds = useTripStore((s) => s.selectedActivityIds)
  const addActivity = useTripStore((s) => s.addActivity)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const selected = selectedIds.includes(activity.id)
  const images = getActivityImages(activity)
  const isFree = activity.priceFromUsd === 0

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % images.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [images.length])

  function openDetail() {
    window.open(`/plan/builder/activity/${activity.id}`, '_blank')
  }

  function handleAdd(e: MouseEvent) {
    e.stopPropagation()
    if (selected) {
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
      className="group cursor-pointer overflow-hidden rounded-[22px] bg-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[5/3.2] overflow-hidden">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${activity.name} photo ${i + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
            style={{ opacity: i === slide ? 1 : 0 }}
            loading="lazy"
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-paper/92 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-ink backdrop-blur-sm">
            {activity.signalEmoji} {activity.signalLabel}
          </span>
          <span className="rounded-full bg-terracotta/95 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-paper backdrop-blur-sm">
            {activity.popularityTag}
          </span>
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-ink/45 px-2 py-1 text-[0.68rem] font-bold text-paper backdrop-blur-sm">
          {slide + 1}/{images.length}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex gap-1" onClick={stop}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={(e) => {
                  stop(e)
                  setSlide(i)
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-4 bg-paper' : 'w-1.5 bg-paper/50'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1" onClick={stop}>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                stop(e)
                setSlide((s) => (s - 1 + images.length) % images.length)
              }}
              className="grid h-7 w-7 place-items-center rounded-full bg-ink/40 text-[0.7rem] text-paper backdrop-blur-sm"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                stop(e)
                setSlide((s) => (s + 1) % images.length)
              }}
              className="grid h-7 w-7 place-items-center rounded-full bg-ink/40 text-[0.7rem] text-paper backdrop-blur-sm"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-serif text-[1.2rem] font-semibold leading-tight text-ink">
          {activity.name}
        </h3>
        <p className="mt-1 text-[0.76rem] font-bold uppercase tracking-wide text-terracotta">
          📍 {activity.cityName}
        </p>
        <p className="mt-2 line-clamp-5 text-[0.9rem] leading-snug text-muted">
          {activity.cardSummary}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {activity.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink/8 bg-cream/80 px-2.5 py-1 text-[0.68rem] font-bold text-ink"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Rating" value={`⭐ ${activity.rating}`} />
          <Metric label="Duration" value={`⏱ ${activity.durationLabel}`} />
          <Metric
            label={isFree ? 'Cost' : 'From'}
            value={isFree ? `🌿 ${activity.priceLabel}` : `💰 ${activity.priceLabel}`}
          />
          <Metric label="Best time" value={`🌅 ${activity.bestTime}`} />
        </div>

        <div className="mt-3 rounded-xl border border-ink/6 bg-cream/70 px-3 py-2.5">
          <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">The vibe</p>
          <p className="mt-0.5 text-[0.88rem] font-semibold text-ink">{activity.vibe}</p>
          <p className="mt-1 text-[0.78rem] text-muted">{activity.hook}</p>
        </div>

        <div className="mt-4 flex gap-2" onClick={stop}>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 rounded-full px-4 py-2.5 text-[0.86rem] font-bold transition-transform hover:scale-[1.01] ${
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
            className="rounded-full border border-ink/12 bg-paper px-3.5 py-2.5 text-[0.86rem] font-bold text-ink hover:border-ink/25"
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
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-cream px-2.5 py-2">
      <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.78rem] font-semibold leading-snug text-ink">{value}</p>
    </div>
  )
}
