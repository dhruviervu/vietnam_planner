import { useMemo } from 'react'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { costLevelLabel } from '../data/ranking'
import { PROPERTY_TYPE_LABELS } from '../data/labels'
import type { StayCityId, StayProperty } from '../data/types'
import { getClustersForCity } from '../data/clusters'
import {
  collectTripBagStayItems,
  mapPlaceToStayCity,
} from '../services/tripBagStayIntelligence'

type Props = {
  clusterName: string
  stays: StayProperty[]
  cityId: StayCityId
  cityLabel: string
}

type DistanceAnchor = {
  name: string
  destinationQuery: string
}

function hashPick<T>(seed: string, items: T[]): T {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return items[Math.abs(h) % items.length]
}

function popularCityAnchors(cityId: StayCityId, cityLabel: string): DistanceAnchor[] {
  const popularExps = EXPERIENCES.filter((e) => {
    const mapped = mapPlaceToStayCity(e.city) ?? mapPlaceToStayCity(e.region)
    if (mapped !== cityId) return false
    return (
      e.popularityTag === 'Must do' ||
      e.popularityTag === 'Popular' ||
      (e.popularityRank != null && e.popularityRank <= 12)
    )
  })
    .sort((a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99))
    .slice(0, 10)
    .map((e) => ({
      name: e.name,
      destinationQuery: `${e.name}, ${e.city}`,
    }))

  const popularActs = CITY_ACTIVITIES.filter((a) => {
    if (a.cityId !== cityId) return false
    return a.popularityTag === 'Must do' || a.popularityTag === 'Popular'
  })
    .slice(0, 10)
    .map((a) => ({
      name: a.name,
      destinationQuery: `${a.name}, ${a.cityName || cityLabel}`,
    }))

  const fromClusters = getClustersForCity(cityId)
    .flatMap((c) => c.keyPlaces)
    .slice(0, 12)
    .map((p) => ({
      name: p.label,
      destinationQuery: `${p.label}, ${cityLabel}, Vietnam`,
    }))

  const combined = [...popularExps, ...popularActs]
  return combined.length > 0 ? combined : fromClusters
}

function distanceUrl(stayName: string, cityLabel: string, anchor: DistanceAnchor) {
  const origin = encodeURIComponent(`${stayName}, ${cityLabel}, Vietnam`)
  const destination = encodeURIComponent(anchor.destinationQuery)
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
}

export function StayGrid({ clusterName, stays, cityId, cityLabel }: Props) {
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const itineraryStayPropertyIds = useTripStore((s) => s.itineraryStayPropertyIds)
  const toggleItineraryStayProperty = useTripStore((s) => s.toggleItineraryStayProperty)

  const anchorsByStayId = useMemo(() => {
    const bagItems = collectTripBagStayItems(experienceIds, activityIds).filter(
      (i) => i.stayCityId === cityId,
    )
    const bagAnchors: DistanceAnchor[] = bagItems.map((i) => ({
      name: i.name,
      destinationQuery: `${i.name}, ${i.cityLabel}`,
    }))
    const popular = popularCityAnchors(cityId, cityLabel)
    const pool = bagAnchors.length > 0 ? [...bagAnchors, ...popular] : popular

    const map = new Map<string, DistanceAnchor>()
    if (pool.length === 0) return map

    for (const stay of stays) {
      map.set(stay.id, hashPick(`${stay.id}:${cityId}`, pool))
    }
    return map
  }, [stays, cityId, cityLabel, experienceIds, activityIds])

  return (
    <section>
      <div>
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          Step 4 · Stays in {clusterName}
        </p>
        <p className="mt-1 font-serif text-[1.25rem] text-ink">Curated places worth considering</p>
        <p className="mt-1 text-[0.76rem] text-muted">
          Illustrative rates and reviews — confirm live prices before booking.
        </p>
      </div>

      {stays.length === 0 ? (
        <p className="mt-4 rounded-[3px] border border-ink/10 bg-cream/60 px-4 py-6 text-center text-[0.88rem] text-muted">
          No stays match these filters. Clear a category on the left to see more.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stays.map((stay) => {
            const selected = itineraryStayPropertyIds.includes(stay.id)
            const anchor = anchorsByStayId.get(stay.id)

            return (
              <article
                key={stay.id}
                className="group overflow-hidden rounded-[3px] border border-ink/10 bg-paper transition hover:border-ink/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                  <img
                    src={stay.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    <span className="rounded-[2px] bg-paper/95 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink">
                      {PROPERTY_TYPE_LABELS[stay.propertyType]}
                    </span>
                    <span className="rounded-[2px] bg-terracotta px-1.5 py-0.5 text-[0.58rem] font-bold text-paper">
                      {costLevelLabel(stay.costLevel)}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-3">
                  <h4 className="font-serif text-[1.05rem] leading-snug text-ink">{stay.name}</h4>
                  <p className="mt-1 text-[0.74rem] text-muted">
                    ⭐ {stay.rating.toFixed(1)}
                    <span className="text-ink/35"> · </span>
                    {stay.reviewCount.toLocaleString()} reviews
                    {stay.typicalNightlyRange
                      ? ` · ~$${stay.typicalNightlyRange[0]}–$${stay.typicalNightlyRange[1]}`
                      : ''}
                  </p>
                  <p className="mt-1 text-[0.72rem] text-ink/75">{stay.distanceLabel}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {stay.amenities.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="rounded-[2px] bg-ink/[0.04] px-1.5 py-0.5 text-[0.6rem] font-bold text-ink"
                      >
                        {a}
                      </span>
                    ))}
                    {stay.petsAllowed ? (
                      <span className="rounded-[2px] bg-sage/15 px-1.5 py-0.5 text-[0.6rem] font-bold text-ink">
                        Pets ok
                      </span>
                    ) : null}
                    {stay.caretaker ? (
                      <span className="rounded-[2px] bg-ink/[0.04] px-1.5 py-0.5 text-[0.6rem] font-bold text-ink">
                        Staffed
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-[0.72rem] leading-snug text-ink/80">{stay.reason}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={stay.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-[3px] border border-ink/15 px-2.5 py-1.5 text-[0.72rem] font-bold text-ink transition hover:border-terracotta/40 hover:text-terracotta"
                    >
                      Check stay →
                    </a>
                    {anchor ? (
                      <a
                        href={distanceUrl(stay.name, cityLabel, anchor)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center rounded-[3px] border border-ink/15 px-2.5 py-1.5 text-[0.72rem] font-bold text-ink transition hover:border-terracotta/40 hover:text-terracotta"
                        title={`Open Google Maps directions from ${stay.name} to ${anchor.name}`}
                      >
                        <span className="truncate">See how far from {anchor.name}</span>
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => toggleItineraryStayProperty(stay.id)}
                      className="inline-flex items-center rounded-[3px] bg-terracotta px-2.5 py-1.5 text-[0.72rem] font-bold text-paper transition hover:brightness-105"
                    >
                      {selected ? 'Set for your itinerary' : 'Select'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
