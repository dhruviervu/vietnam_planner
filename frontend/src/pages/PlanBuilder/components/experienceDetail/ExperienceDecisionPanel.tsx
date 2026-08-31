import { useState, type MouseEvent } from 'react'
import type { Experience } from '../../types'
import { formatFromPrice } from '../../lib/pricing'
import { flyToTripBag } from '../../lib/flyToTripBag'
import { getExperienceImages } from '../../lib/pricing'
import { getExperienceDetailBlurb } from '../../lib/experienceDetailBlurb'

type Props = {
  experience: Experience
  selected: boolean
  onAdd: () => void
  onRemove: () => void
  onBack: () => void
}

export function ExperienceDecisionPanel({
  experience,
  selected,
  onAdd,
  onRemove,
  onBack,
}: Props) {
  const [justAdded, setJustAdded] = useState(false)
  const fromPrice = formatFromPrice(experience.price, experience.priceType)
  const blurb = getExperienceDetailBlurb(experience)

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

  function scrollToVisitorGuide() {
    document.getElementById('visitor-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Fact
          label="Rating"
          value={`⭐ ${experience.rating}`}
          sub={`${experience.reviewCount.toLocaleString()} reviews`}
        />
        <Fact label="Duration" value={`⏱ ${experience.durationLabel}`} />
        <Fact label="From" value={`💰 ${fromPrice}`} />
      </div>

      <p className="mt-5 text-[0.94rem] leading-[1.65] text-ink/90">
        {blurb.replace(/[.…]+$/, '').trim()}{' '}
        <button
          type="button"
          onClick={scrollToVisitorGuide}
          className="inline p-0 text-[0.82rem] font-bold text-terracotta underline decoration-terracotta/40 underline-offset-2 transition hover:text-terracotta-deep hover:decoration-terracotta"
        >
          Learn More
        </button>
      </p>

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
