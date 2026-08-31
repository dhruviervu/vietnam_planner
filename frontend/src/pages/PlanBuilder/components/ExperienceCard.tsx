import { useState, type MouseEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Experience } from '../types'
import { useTripStore } from '../../../store/tripStore'
import { formatFromPrice, getExperienceImages } from '../lib/pricing'
import { flyToTripBag } from '../lib/flyToTripBag'
import { captureCatalogScroll } from '../lib/catalogViewState'
import { experiencesCityPath } from '../services/cityCatalog'

type Props = {
  experience: Experience
  tripDate: string | null
  compact?: boolean
  /** Tighter card layout for dense grids (e.g. city ranked page) */
  dense?: boolean
  onBuildDay?: (id: string) => void
  /** Popularity rank within this experience's city (1 = top) */
  cityRank?: number
}

export function ExperienceCard({
  experience,
  tripDate: _tripDate,
  compact = false,
  dense = false,
  onBuildDay,
  cityRank,
}: Props) {
  const [justAdded, setJustAdded] = useState(false)
  const [askSlot, setAskSlot] = useState(false)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const selected = selectedIds.includes(experience.id)
  const addExperience = useTripStore((s) => s.addExperience)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const setExperienceSlot = useTripStore((s) => s.setExperienceSlot)

  const images = getExperienceImages(experience)
  const fromPrice = formatFromPrice(experience.price, experience.priceType)
  const [broken, setBroken] = useState<Record<string, boolean>>({})
  const [photoIndex, setPhotoIndex] = useState(0)
  const visiblePhotos = images.filter((src) => !broken[src])
  const currentPhoto = visiblePhotos[Math.min(photoIndex, Math.max(visiblePhotos.length - 1, 0))]

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

  function shiftPhoto(e: MouseEvent, delta: number) {
    e.stopPropagation()
    if (visiblePhotos.length < 2) return
    setPhotoIndex((i) => (i + delta + visiblePhotos.length) % visiblePhotos.length)
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
      } ${compact ? 'min-w-[280px] max-w-[300px] shrink-0' : ''}`}
    >
      <div
        className={`relative overflow-hidden bg-cream ${dense ? 'aspect-[5/3.4]' : 'aspect-[5/3.2]'}`}
      >
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={experience.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
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
          <span className="rounded-full bg-paper/92 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-ink backdrop-blur-sm">
            {experience.signalEmoji} {experience.signalLabel}
          </span>
          <span className="rounded-full bg-terracotta/95 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-paper backdrop-blur-sm">
            {experience.popularityTag}
          </span>
        </div>
      </div>

      <div className={dense ? 'p-3' : 'p-4'}>
        <h3
          className={`flex items-start gap-2 font-serif font-semibold leading-tight text-ink ${
            dense ? 'gap-1.5 text-[1.02rem]' : 'gap-2.5 text-[1.2rem]'
          }`}
        >
          {cityRank != null ? (
            <a
              href={experiencesCityPath(experience.city)}
              target="_blank"
              rel="noopener noreferrer"
              title="Rank"
              aria-label={`#${cityRank} in ${experience.city}`}
              onClick={stop}
              className={`inline-flex shrink-0 items-center justify-center rounded-full bg-terracotta/12 font-serif font-bold tabular-nums text-terracotta underline decoration-terracotta/40 underline-offset-2 ring-1 ring-terracotta/30 transition hover:bg-terracotta hover:text-paper hover:no-underline ${
                dense
                  ? 'h-7 min-w-7 px-1.5 text-[0.82rem]'
                  : 'h-8 min-w-8 px-2 text-[0.92rem]'
              }`}
            >
              #{cityRank}
            </a>
          ) : null}
          <span className="min-w-0 flex-1">{experience.name}</span>
        </h3>
        <p
          className={`font-bold uppercase tracking-wide text-terracotta ${
            dense ? 'mt-0.5 text-[0.68rem]' : 'mt-1 text-[0.76rem]'
          }`}
        >
          <a
            href={experiencesCityPath(experience.city)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
            className="underline decoration-terracotta/35 underline-offset-2 hover:decoration-terracotta"
          >
            {experience.city}
          </a>
          {experience.city !== experience.region ? ` · ${experience.region}` : ''}
        </p>
        <p
          className={`leading-snug text-muted ${
            dense ? 'mt-1.5 line-clamp-3 text-[0.82rem]' : 'mt-2 line-clamp-5 text-[0.9rem]'
          }`}
        >
          {experience.cardSummary || experience.hook}{' '}
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

        <div className={`grid grid-cols-2 gap-2 ${dense ? 'mt-2' : 'mt-3'}`}>
          <Metric
            label="Rating"
            value={`⭐ ${experience.rating} (${experience.reviewCount.toLocaleString()})`}
            dense={dense}
          />
          <Metric label="Duration" value={`⏱ ${experience.durationLabel}`} dense={dense} />
          <Metric label="From" value={`💰 ${fromPrice}`} dense={dense} />
        </div>

        <div className={`flex gap-2 ${dense ? 'mt-3' : 'mt-4'}`} onClick={stop}>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 rounded-full font-bold transition-transform hover:scale-[1.01] ${
              dense ? 'px-3 py-2 text-[0.78rem]' : 'px-4 py-2.5 text-[0.86rem]'
            } ${
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
            className={`rounded-full border border-ink/12 bg-paper font-bold text-ink hover:border-ink/25 ${
              dense ? 'px-3 py-2 text-[0.78rem]' : 'px-3.5 py-2.5 text-[0.86rem]'
            }`}
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

function Metric({
  label,
  value,
  dense = false,
}: {
  label: string
  value: ReactNode
  dense?: boolean
}) {
  return (
    <div className={`rounded-xl bg-cream ${dense ? 'px-2 py-1.5' : 'px-2.5 py-2'}`}>
      <p
        className={`font-bold uppercase tracking-wide text-muted ${
          dense ? 'text-[0.58rem]' : 'text-[0.62rem]'
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-0.5 font-semibold leading-snug text-ink ${
          dense ? 'text-[0.72rem]' : 'text-[0.78rem]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
