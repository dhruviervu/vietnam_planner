import { useMemo } from 'react'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { costLevelLabel } from '../data/ranking'
import { PROPERTY_TYPE_LABELS } from '../data/labels'
import type { StayCityId, StayProperty } from '../data/types'
import { getStayCity } from '../data/cities'
import { getClusterById, getClustersForCity } from '../data/clusters'
import { StayItineraryButton } from './StayItineraryButton'
import {
  collectTripBagStayItems,
  mapPlaceToStayCity,
} from '../services/tripBagStayIntelligence'

type Props = {
  clusterName: string
  stays: StayProperty[]
  cityId: StayCityId
  cityLabel: string
  eyebrow?: string
  heading?: string
  highlightId?: string | null
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

function stayCityOf(
  stay: StayProperty,
  fallbackId: StayCityId,
  fallbackLabel: string,
): { cityId: StayCityId; cityLabel: string } {
  const cluster = getClusterById(stay.clusterId)
  if (!cluster) return { cityId: fallbackId, cityLabel: fallbackLabel }
  return { cityId: cluster.cityId, cityLabel: getStayCity(cluster.cityId).label }
}

export function StayGrid({
  clusterName,
  stays,
  cityId,
  cityLabel,
  eyebrow,
  heading,
  highlightId,
}: Props) {
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const itineraryStayPropertyIds = useTripStore((s) => s.itineraryStayPropertyIds) ?? []
  const customStayProperties = useTripStore((s) => s.customStayProperties)
  const toggleItineraryStayProperty = useTripStore((s) => s.toggleItineraryStayProperty)

  const anchorsByStayId = useMemo(() => {
    const bagAll = collectTripBagStayItems(experienceIds, activityIds)
    const map = new Map<string, DistanceAnchor>()

    for (const stay of stays) {
      const loc = stayCityOf(stay, cityId, cityLabel)
      const bagAnchors: DistanceAnchor[] = bagAll
        .filter((i) => i.stayCityId === loc.cityId)
        .map((i) => ({
          name: i.name,
          destinationQuery: `${i.name}, ${i.cityLabel}`,
        }))
      const popular = popularCityAnchors(loc.cityId, loc.cityLabel)
      const pool = bagAnchors.length > 0 ? [...bagAnchors, ...popular] : popular
      if (pool.length === 0) continue
      map.set(stay.id, hashPick(`${stay.id}:${loc.cityId}`, pool))
    }
    return map
  }, [stays, cityId, cityLabel, experienceIds, activityIds])

  return (
    <section>
      <div>
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          {eyebrow ?? `Stays in ${clusterName}`}
        </p>
        <p className="mt-1 font-serif text-[1.25rem] text-ink">
          {heading ?? 'Curated places worth considering'}
        </p>
        <p className="mt-1 text-[0.76rem] text-muted">
          Illustrative rates and reviews — confirm live prices before booking.
        </p>
      </div>

      {stays.length === 0 ? (
        <p className="mt-4 rounded-[3px] border border-ink/10 bg-cream/60 px-4 py-6 text-center text-[0.88rem] text-muted">
          No stays match these filters. Clear a filter on the left to see more.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stays.map((stay) => {
            const selected = itineraryStayPropertyIds.includes(stay.id)
            const addedByYou = Boolean(stay.addedByYou || customStayProperties[stay.id])
            const loc = stayCityOf(stay, cityId, cityLabel)
            const anchor = anchorsByStayId.get(stay.id)

            return (
              <article
                key={stay.id}
                id={`stay-card-${stay.id}`}
                className={`group scroll-mt-24 overflow-hidden rounded-[8px] border bg-paper transition ${
                  highlightId === stay.id
                    ? 'border-[3px] border-terracotta shadow-[0_0_0_5px_rgba(196,92,58,0.28)] ring-4 ring-terracotta/50'
                    : 'border-ink/10 hover:border-ink/20'
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                  <img
                    src={stay.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    <span className="rounded-[2px] bg-paper/95 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-ink">
                      {PROPERTY_TYPE_LABELS[stay.propertyType]}
                    </span>
                    <span className="rounded-[2px] bg-terracotta px-1.5 py-0.5 text-[0.58rem] font-bold text-paper">
                      {costLevelLabel(stay.costLevel)}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-3">
                  <h4 className="flex flex-wrap items-center gap-2 font-serif text-[1.05rem] leading-snug text-ink">
                    <span>{stay.name}</span>
                    {addedByYou ? (
                      <span className="rounded-[4px] bg-terracotta px-2 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-paper">
                        Added By You
                      </span>
                    ) : null}
                  </h4>
                  <p className="mt-1 text-[0.74rem] text-muted">
                    {stay.rating > 0 ? (
                      <>
                        ⭐ {stay.rating.toFixed(1)}
                        <span className="text-ink/35"> · </span>
                        {stay.reviewCount.toLocaleString()} reviews
                      </>
                    ) : (
                      stay.sourceLabel
                    )}
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

                  <p className="mt-2 text-[0.84rem] leading-relaxed text-ink/85">{stay.reason}</p>

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
                        href={distanceUrl(stay.name, loc.cityLabel, anchor)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center rounded-[3px] border border-ink/15 px-2.5 py-1.5 text-[0.72rem] font-bold text-ink transition hover:border-terracotta/40 hover:text-terracotta"
                        title={`Open Google Maps directions from ${stay.name} to ${anchor.name}`}
                      >
                        <span className="truncate">Check Distance from {anchor.name}</span>
                      </a>
                    ) : null}
                    <StayItineraryButton
                      selected={selected}
                      onToggle={() => toggleItineraryStayProperty(stay.id)}
                    />
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
