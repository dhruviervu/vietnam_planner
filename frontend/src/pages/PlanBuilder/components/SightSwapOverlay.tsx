import { useState } from 'react'
import type { Experience } from '../types'
import { getExperienceImages } from '../lib/pricing'
import { openDetailHref } from '../lib/yourVietnam/links'
import { similarSightsFor, swapAdvice } from '../lib/yourVietnam/sightSwap'
import { EXPERIENCES } from '../data/experiences'
import type { ItineraryItem } from '../lib/yourVietnam/types'

export function SightSwapOverlay({
  item,
  itinerarySourceIds,
  sameDaySourceIds,
  onClose,
  onSwap,
}: {
  item: ItineraryItem
  itinerarySourceIds: Set<string>
  sameDaySourceIds: Set<string>
  onClose: () => void
  onSwap: (candidate: Experience) => void
}) {
  const [pending, setPending] = useState<Experience | null>(null)
  const current = item.sourceId ? EXPERIENCES.find((e) => e.id === item.sourceId) : undefined
  const cards = similarSightsFor(item, itinerarySourceIds, sameDaySourceIds, 6)
  const advice = pending ? swapAdvice(current, pending, cards) : null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-3 sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Close swap" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-paper shadow-hero">
        <div className="flex items-start justify-between gap-3 border-b border-ink/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Swap this sight</p>
            <h3 className="mt-0.5 font-serif text-[1.45rem] font-semibold text-ink">{item.name}</h3>
            <p className="mt-1 max-w-[52ch] text-[0.84rem] text-muted">
              Nearby and similar stops in {item.city}, ranked by how travellers actually use them — none of these are already on your itinerary.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cream px-3 py-1 text-[0.8rem] font-bold text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(88vh-7rem)] overflow-y-auto px-5 py-4 sm:px-6">
          {pending && advice ? (
            <div className="mx-auto max-w-lg rounded-[22px] border border-ink/8 bg-cream/60 px-5 py-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">{advice.title}</p>
              <p className="mt-2 font-serif text-[1.2rem] font-semibold text-ink">{pending.name}</p>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/80">{advice.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSwap(pending)}
                  className="rounded-full bg-ink px-4 py-2 text-[0.82rem] font-bold text-paper"
                >
                  Swap anyway
                </button>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="rounded-full bg-paper px-4 py-2 text-[0.82rem] font-bold text-ink ring-1 ring-ink/10"
                >
                  Keep looking
                </button>
              </div>
            </div>
          ) : cards.length === 0 ? (
            <p className="py-8 text-center text-[0.9rem] text-muted">
              Every strong alternative in {item.city} is already on this trip.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((exp) => (
                <SwapMiniCard
                  key={exp.id}
                  experience={exp}
                  onSeeMore={() => openDetailHref(`/plan/builder/experience/${exp.id}`)}
                  onSwap={() => setPending(exp)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SwapMiniCard({
  experience,
  onSeeMore,
  onSwap,
}: {
  experience: Experience
  onSeeMore: () => void
  onSwap: () => void
}) {
  const photo = getExperienceImages(experience)[0]
  return (
    <article className="overflow-hidden rounded-[18px] bg-paper shadow-card ring-1 ring-ink/6">
      <div className="relative aspect-[5/3.2] bg-cream">
        {photo ? (
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-terracotta/15 to-sage/25" />
        )}
      </div>
      <div className="px-3.5 py-3">
        <h4 className="font-serif text-[1.05rem] font-semibold leading-snug text-ink">{experience.name}</h4>
        <p className="mt-1.5 line-clamp-3 text-[0.8rem] leading-relaxed text-ink/75">
          {experience.cardSummary || experience.hook}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onSeeMore}
            className="flex-1 rounded-full border border-ink/12 bg-paper px-3 py-1.5 text-[0.75rem] font-bold text-ink hover:border-ink/25"
          >
            See more
          </button>
          <button
            type="button"
            onClick={onSwap}
            className="flex-1 rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-3 py-1.5 text-[0.75rem] font-bold text-paper"
          >
            Swap
          </button>
        </div>
      </div>
    </article>
  )
}
