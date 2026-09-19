import { useMemo, useState } from 'react'
import type { Experience } from '../types'
import { getExperienceImages } from '../lib/pricing'
import { openDetailHref } from '../lib/yourVietnam/links'
import { similarSightsFor, swapAdvice } from '../lib/yourVietnam/sightSwap'
import { EXPERIENCES } from '../data/experiences'
import { CITY_ACTIVITIES, getActivityImages } from '../data/activities'
import type { ItineraryItem } from '../lib/yourVietnam/types'
import { useTripStore } from '../../../store/tripStore'

type SwapTarget = { kind: 'experience' | 'activity'; id: string }

type BagCard = {
  kind: 'experience' | 'activity'
  id: string
  name: string
  summary: string
  photo?: string
  href: string
}

function cityKey(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

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
  onSwap: (candidate: SwapTarget) => void
}) {
  const selectedExperienceIds = useTripStore((s) => s.selectedExperienceIds)
  const selectedActivityIds = useTripStore((s) => s.selectedActivityIds)
  const [pending, setPending] = useState<Experience | null>(null)
  const current = item.sourceId ? EXPERIENCES.find((e) => e.id === item.sourceId) : undefined
  const recs = similarSightsFor(item, itinerarySourceIds, sameDaySourceIds, 6)
  const advice = pending ? swapAdvice(current, pending, recs) : null
  const place = cityKey(item.city)

  const bagCards = useMemo<BagCard[]>(() => {
    const experiences = EXPERIENCES.filter((e) => {
      if (!selectedExperienceIds.includes(e.id)) return false
      if (e.id === item.sourceId) return false
      if (sameDaySourceIds.has(e.id)) return false
      return cityKey(e.city) === place || cityKey(e.region) === place
    }).map((e) => ({
      kind: 'experience' as const,
      id: e.id,
      name: e.name,
      summary: e.cardSummary || e.hook,
      photo: getExperienceImages(e)[0],
      href: `/plan/builder/experience/${e.id}`,
    }))
    const activities = CITY_ACTIVITIES.filter((a) => {
      if (!selectedActivityIds.includes(a.id)) return false
      if (a.id === item.sourceId) return false
      if (sameDaySourceIds.has(a.id)) return false
      return cityKey(a.cityName) === place
    }).map((a) => ({
      kind: 'activity' as const,
      id: a.id,
      name: a.name,
      summary: a.cardSummary || a.hook,
      photo: getActivityImages(a)[0],
      href: `/plan/builder/activity/${a.id}`,
    }))
    return [...experiences, ...activities]
  }, [item.sourceId, place, sameDaySourceIds, selectedActivityIds, selectedExperienceIds])

  const bagIds = new Set(bagCards.map((c) => c.id))
  const recCards = recs.filter((e) => !bagIds.has(e.id))

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-3 sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Close swap" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-paper shadow-hero">
        <div className="flex items-start justify-between gap-3 border-b border-ink/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Swap this sight</p>
            <h3 className="mt-0.5 font-serif text-[1.45rem] font-semibold text-ink">{item.name}</h3>
            <p className="mt-1 max-w-[52ch] text-[0.84rem] text-muted">
              Pick something else from your bag, or a top recommendation in {item.city}.
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
                  onClick={() => onSwap({ kind: 'experience', id: pending.id })}
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
          ) : (
            <div className="space-y-8">
              <section>
                <h4 className="font-serif text-[1.15rem] font-semibold text-ink">From your bag</h4>
                <p className="mt-1 text-[0.8rem] text-muted">
                  Other sights and activities you already added, not on this day.
                </p>
                {bagCards.length === 0 ? (
                  <p className="mt-3 text-[0.88rem] text-muted">Nothing else in your bag for {item.city} today.</p>
                ) : (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bagCards.map((card) => (
                      <SwapMiniCard
                        key={`${card.kind}-${card.id}`}
                        name={card.name}
                        summary={card.summary}
                        photo={card.photo}
                        onSeeMore={() => openDetailHref(card.href)}
                        onSwap={() => onSwap({ kind: card.kind, id: card.id })}
                      />
                    ))}
                  </div>
                )}
              </section>
              <section>
                <h4 className="font-serif text-[1.15rem] font-semibold text-ink">Top recommendations</h4>
                <p className="mt-1 text-[0.8rem] text-muted">
                  Nearby and similar stops ranked by how travellers actually use them.
                </p>
                {recCards.length === 0 ? (
                  <p className="mt-3 text-[0.88rem] text-muted">
                    Every strong alternative in {item.city} is already on your trip.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {recCards.map((exp) => (
                      <SwapMiniCard
                        key={exp.id}
                        name={exp.name}
                        summary={exp.cardSummary || exp.hook}
                        photo={getExperienceImages(exp)[0]}
                        onSeeMore={() => openDetailHref(`/plan/builder/experience/${exp.id}`)}
                        onSwap={() => setPending(exp)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SwapMiniCard({
  name,
  summary,
  photo,
  onSeeMore,
  onSwap,
}: {
  name: string
  summary: string
  photo?: string
  onSeeMore: () => void
  onSwap: () => void
}) {
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
        <h4 className="font-serif text-[1.05rem] font-semibold leading-snug text-ink">{name}</h4>
        <p className="mt-1.5 line-clamp-3 text-[0.8rem] leading-relaxed text-ink/75">{summary}</p>
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
