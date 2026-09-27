import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SIGHT_CATALOG } from '../data/experiences'
import { getCityDescription } from '../data/cityDescriptions'
import { ActivityCard } from '../components/ActivityCard'
import { FilterChip } from '../components/ExperienceFilterPanel'
import {
  CITY_ACTIVITIES,
  activityKindFilters,
  rankCityActivities,
  type ActivityKind,
  type CityActivity,
  type RankedActivity,
} from '../data/activities'
import { groupIdForSourceId } from '../lib/yourVietnam/sightTiming'
import { slugToCity } from '../services/cityCatalog'
import { activitiesCitySectionTo } from '../lib/yourVietnam/links'

function cityCatalog(): CityActivity[] {
  const sightGroups = new Set<string>()
  for (const e of SIGHT_CATALOG) {
    sightGroups.add(e.id)
    if (e.groupId) sightGroups.add(e.groupId)
    sightGroups.add(groupIdForSourceId(e.id))
  }
  return CITY_ACTIVITIES.filter((a) => {
    const group = a.groupId ?? groupIdForSourceId(a.id)
    return !sightGroups.has(group) && !sightGroups.has(a.id)
  })
}

export function ActivitiesCityPage() {
  const { citySlug = '' } = useParams()
  const catalog = useMemo(() => cityCatalog(), [])
  const allCities = useMemo(
    () => [...new Set(catalog.map((a) => a.cityName))].sort(),
    [catalog],
  )
  const cityName = useMemo(
    () => slugToCity(citySlug, allCities),
    [citySlug, allCities],
  )

  const [kind, setKind] = useState<ActivityKind | 'all'>('all')

  useEffect(() => {
    setKind('all')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [cityName])

  const rankedAll = useMemo(() => {
    if (!cityName) return [] as RankedActivity[]
    return rankCityActivities(catalog.filter((a) => a.cityName === cityName))
  }, [catalog, cityName])

  const kinds = useMemo(
    () => activityKindFilters(rankedAll).filter((k) => k.count > 0),
    [rankedAll],
  )

  useEffect(() => {
    if (kind === 'all') return
    if (kinds.some((k) => k.id === kind)) return
    setKind('all')
  }, [kind, kinds])

  const filtered = useMemo(() => {
    if (kind === 'all') return rankedAll
    return rankedAll.filter((a) => a.kind === kind)
  }, [kind, rankedAll])

  if (!cityName) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="font-serif text-[1.35rem] font-semibold text-ink">City not found</p>
        <Link
          to="/plan/builder/activities"
          className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
        >
          ← Back to activities
        </Link>
      </div>
    )
  }

  return (
    <div className="px-[clamp(1.1rem,4vw,2rem)] pb-16 pt-4">
      <section className="rounded-[22px] bg-gradient-to-br from-cream/80 via-paper to-paper p-5 shadow-soft ring-1 ring-ink/[0.06] sm:p-7">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-sage">
          Ranked best to last
        </p>
        <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.5vw,2.35rem)] font-semibold leading-tight text-ink">
          {cityName}
        </h1>
        <p className="mt-3 text-[0.94rem] leading-[1.7] text-ink/85">
          {getCityDescription(cityName)}
        </p>
        <p className="mt-3 text-[0.78rem] font-bold text-muted">
          {rankedAll.length} activit{rankedAll.length === 1 ? 'y' : 'ies'} · famous first, niche later
        </p>
        {kinds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <FilterChip active={kind === 'all'} onClick={() => setKind('all')}>
              All
            </FilterChip>
            {kinds.map((tab) => (
              <FilterChip
                key={tab.id}
                active={kind === tab.id}
                onClick={() => setKind(kind === tab.id ? 'all' : tab.id)}
              >
                {tab.label}
              </FilterChip>
            ))}
          </div>
        )}
        <Link
          to={activitiesCitySectionTo(cityName)}
          className="mt-4 inline-flex text-[0.82rem] font-bold text-terracotta hover:underline"
        >
          {cityName} on the activities catalog →
        </Link>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <ActivityCard
            key={item.id}
            activity={item}
            dense
            cityRank={item.cityRank}
          />
        ))}
      </div>

      <div className="mt-10 border-t border-ink/8 pt-6">
        <Link
          to="/plan/builder/activities"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink shadow-soft transition hover:border-terracotta/35"
        >
          ← Back to activities
        </Link>
      </div>
    </div>
  )
}
