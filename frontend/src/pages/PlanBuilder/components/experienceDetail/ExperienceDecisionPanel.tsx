import { useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Experience, TimeOfDay } from '../../types'
import type { ExperienceLiveSignals } from '../../services/experienceLiveService'
import { formatFromPrice } from '../../lib/pricing'
import { flyToTripBag } from '../../lib/flyToTripBag'
import { getExperienceImages } from '../../lib/pricing'
import { ExperienceTimeSelector } from './ExperienceTimeSelector'
import { LiveSnapshot } from './LiveSnapshot'
import { SeasonalSnapshot } from './SeasonalSnapshot'
import { AccessibilitySnapshot } from './AccessibilitySnapshot'

type Props = {
  experience: Experience
  live: ExperienceLiveSignals
  time: TimeOfDay
  onTimeChange: (t: TimeOfDay) => void
  fitScore: number
  fitReasons: string[]
  activeMonth: number | null
  selected: boolean
  onAdd: () => void
  onRemove: () => void
  onBack: () => void
}

export function ExperienceDecisionPanel({
  experience,
  live,
  time,
  onTimeChange,
  fitScore,
  fitReasons,
  activeMonth,
  selected,
  onAdd,
  onRemove,
  onBack,
}: Props) {
  const [showWhy, setShowWhy] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const fromPrice = formatFromPrice(experience.price, experience.priceType)

  function handlePrimary(e: MouseEvent<HTMLButtonElement>) {
    if (selected) {
      onRemove()
      setJustAdded(false)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    flyToTripBag(rect, getExperienceImages(experience)[0])
    onAdd()
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 self-start text-[0.82rem] font-bold text-muted hover:text-ink"
      >
        ← Back to experiences
      </button>

      <p className="text-[0.78rem] font-bold tracking-wide text-terracotta">
        {experience.signalEmoji} {experience.signalLabel}
      </p>
      <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.2vw,2.45rem)] font-semibold leading-[1.1] text-ink">
        {experience.name}
      </h1>
      <p className="mt-1 text-[0.88rem] font-bold uppercase tracking-wide text-muted">
        📍 {experience.city}
        {experience.city !== experience.region ? ` · ${experience.region}` : ''}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Fact
          label="Rating"
          value={`⭐ ${experience.rating}`}
          sub={`${experience.reviewCount.toLocaleString()} reviews`}
        />
        <Fact label="Duration" value={`⏱ ${experience.durationLabel}`} />
        <Fact label="From" value={`💰 ${fromPrice}`} />
        <Fact label="Accessibility" value={`♿ ${experience.accessibilityDetail.wheelchair}`} />
      </div>

      <div className="mt-4">
        <ExperienceTimeSelector value={time} onChange={onTimeChange} />
      </div>

      <div className="mt-4">
        <LiveSnapshot live={live} />
      </div>

      <div className="mt-4">
        <SeasonalSnapshot experience={experience} activeMonth={activeMonth} />
      </div>

      <div className="mt-4">
        <AccessibilitySnapshot detail={experience.accessibilityDetail} />
      </div>

      <div className="mt-4 rounded-2xl border border-ink/8 bg-cream/80 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.95rem] font-bold text-ink">{fitScore}% fit for your trip</p>
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
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
              className="mt-2 space-y-1 overflow-hidden text-[0.8rem] text-muted"
            >
              {fitReasons.map((r) => (
                <li key={r}>✓ {r}</li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePrimary}
          className={`rounded-full px-6 py-3 text-[0.92rem] font-bold transition-transform hover:scale-[1.02] ${
            selected
              ? 'bg-sage text-paper'
              : 'bg-gradient-to-br from-terracotta to-terracotta-deep text-paper shadow-[0_10px_24px_rgba(196,92,58,0.28)]'
          }`}
        >
          {justAdded
            ? 'Added to your trip ✓'
            : selected
              ? '✓ Added to Your Trip'
              : '+ Add to Trip'}
        </button>
      </div>
    </div>
  )
}

function Fact({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl bg-cream px-3 py-2.5">
      <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.88rem] font-semibold text-ink">{value}</p>
      {sub && <p className="text-[0.7rem] text-muted">{sub}</p>}
    </div>
  )
}
