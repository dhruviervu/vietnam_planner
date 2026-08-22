import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Experience } from '../types'
import { useTripStore } from '../../../store/tripStore'
import { getLiveSignals } from '../services/experienceLiveService'
import { computeTripFit } from '../services/recommendationEngine'
import { formatFromPrice, getExperienceImages } from '../lib/pricing'
import { flyToTripBag } from '../lib/flyToTripBag'
import { captureCatalogScroll } from '../lib/catalogViewState'

type Props = {
  experience: Experience
  tripDate: string | null
  compact?: boolean
  onBuildDay?: (id: string) => void
}

export function ExperienceCard({ experience, tripDate, compact = false, onBuildDay }: Props) {
  const [slide, setSlide] = useState(0)
  const [showWhy, setShowWhy] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [askSlot, setAskSlot] = useState(false)
  const basics = useTripStore((s) => s.basics)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const selected = selectedIds.includes(experience.id)
  const addExperience = useTripStore((s) => s.addExperience)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const setExperienceSlot = useTripStore((s) => s.setExperienceSlot)

  const images = getExperienceImages(experience)
  const live = getLiveSignals(experience, { date: tripDate, time: 'morning' })
  const fit = computeTripFit(experience, basics, selectedIds)
  const fromPrice = formatFromPrice(experience.price, experience.priceType)

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % images.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [images.length])

  function openDetail() {
    captureCatalogScroll()
    // Keep opener so "Back to experiences" can focus the catalog tab
    window.open(`/plan/builder/experience/${experience.id}`, '_blank')
  }

  function handleAdd(e: MouseEvent) {
    e.stopPropagation()
    if (selected) {
      removeExperience(experience.id)
      setJustAdded(false)
      setAskSlot(false)
      return
    }
    const target = e.currentTarget as HTMLElement
    const article = target.closest('article')
    const img = article?.querySelector('img')
    const rect = (img ?? target).getBoundingClientRect()
    flyToTripBag(rect, images[0])
    addExperience(experience.id, 'later')
    setJustAdded(true)
    setAskSlot(true)
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
      className={`group cursor-pointer overflow-hidden rounded-[22px] bg-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
        compact ? 'min-w-[280px] max-w-[300px] shrink-0' : ''
      }`}
    >
      <div className="relative aspect-[5/3.2] overflow-hidden">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${experience.name} photo ${i + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
            style={{ opacity: i === slide ? 1 : 0 }}
            loading="lazy"
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-paper/92 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-ink backdrop-blur-sm">
            {experience.signalEmoji} {experience.signalLabel}
          </span>
          <span className="rounded-full bg-terracotta/95 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-paper backdrop-blur-sm">
            {experience.popularityTag}
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
          {experience.name}
        </h3>
        <p className="mt-1 text-[0.76rem] font-bold uppercase tracking-wide text-terracotta">
          📍 {experience.city}
          {experience.city !== experience.region ? ` · ${experience.region}` : ''}
        </p>
        <p className="mt-2 line-clamp-5 text-[0.9rem] leading-snug text-muted">
          {experience.cardSummary || experience.hook}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Rating" value={`⭐ ${experience.rating}`} />
          <Metric label="Reviews" value={experience.reviewCount.toLocaleString()} />
          <Metric label="Duration" value={`⏱ ${experience.durationLabel}`} />
          <Metric label="From" value={`💰 ${fromPrice}`} />
          <Metric label="Best time" value={`🌅 ${experience.bestTime}`} />
          <Metric
            label="Accessibility"
            value={`♿ ${experience.accessibilityDetail.wheelchair}`}
          />
        </div>

        <div
          className="mt-3 rounded-xl border border-ink/6 bg-cream/70 px-3 py-2.5"
          onClick={stop}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.82rem] font-bold text-ink">{fit.score}% fit for your trip</p>
            <button
              type="button"
              onClick={(e) => {
                stop(e)
                setShowWhy((v) => !v)
              }}
              className="text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              Why?
            </button>
          </div>
          <AnimatePresence>
            {showWhy && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden text-[0.78rem] text-muted"
              >
                {fit.reasons.map((r) => (
                  <li key={r}>✓ {r}</li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-sage/35 bg-sage/5 px-3 py-2">
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-sage">
            ● Live conditions
          </p>
          <p className="mt-0.5 text-[0.78rem] text-ink">
            {live.weather.label} · {live.lightLabel}
          </p>
          <p className="text-[0.7rem] text-muted">Updated {live.updatedMinutesAgo} min ago</p>
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
          {askSlot && selected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
              onClick={stop}
            >
              <p className="mt-3 text-[0.78rem] font-semibold text-ink">
                When would you like to do this?
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(
                  [
                    ['best', 'Best fit'],
                    ['morning', 'Morning'],
                    ['afternoon', 'Afternoon'],
                    ['evening', 'Evening'],
                    ['later', "I'll decide later"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={(e) => {
                      stop(e)
                      setExperienceSlot(experience.id, value)
                      setAskSlot(false)
                    }}
                    className="rounded-full bg-cream px-2.5 py-1.5 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selected && onBuildDay && experience.durationHours >= 4 && (
          <button
            type="button"
            onClick={(e) => {
              stop(e)
              onBuildDay(experience.id)
            }}
            className="mt-3 w-full text-left text-[0.78rem] font-bold text-terracotta hover:underline"
          >
            Build a day around this →
          </button>
        )}
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
