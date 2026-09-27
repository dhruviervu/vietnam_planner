import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SIGHT_CATALOG } from '../data/experiences'
import { getCityDescription } from '../data/cityDescriptions'
import { ExperienceCard } from '../components/ExperienceCard'
import {
  FilterChip,
  LIKING_CHIPS,
  PRACTICAL_CHIPS,
} from '../components/ExperienceFilterPanel'
import { useTripStore } from '../../../store/tripStore'
import {
  DEFAULT_FILTERS,
  filterExperienceItems,
  type ExperienceFilters,
  type LikingFilter,
  type PracticalFilter,
} from '../services/recommendationEngine'
import {
  rankCityExperiences,
  slugToCity,
  getUnfilteredCityCatalog,
  type RankedExperience,
} from '../services/cityCatalog'
import { experiencesCitySectionTo } from '../lib/yourVietnam/links'
import { sightSectionsPresent } from '../data/sightSections'
export function ExperiencesCityPage() {
  const { citySlug = '' } = useParams()
  const tripDate = useTripStore((s) =>
    s.basics.dateMode === 'exact' && s.basics.startDate ? s.basics.startDate : null,
  )

  const allCities = useMemo(
    () => [...new Set(SIGHT_CATALOG.map((e) => e.city))].sort(),
    [],
  )
  const cityName = useMemo(
    () => slugToCity(citySlug, allCities),
    [citySlug, allCities],
  )

  const [likings, setLikings] = useState<LikingFilter[]>([])
  const [practical, setPractical] = useState<PracticalFilter[]>([])
  const [section, setSection] = useState<string>('all')

  useEffect(() => {
    setSection('all')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [cityName])
  const rankedAll = useMemo(() => {
    if (!cityName) return [] as RankedExperience[]
    const fromCatalog = getUnfilteredCityCatalog().groups.find((g) => g.city === cityName)?.items
    if (fromCatalog?.length) return fromCatalog
    return rankCityExperiences(SIGHT_CATALOG.filter((e) => e.city === cityName))
  }, [cityName])

  const sectionTabs = useMemo(() => sightSectionsPresent(rankedAll), [rankedAll])

  const filtered = useMemo(() => {
    if (!cityName) return [] as RankedExperience[]
    const filters: ExperienceFilters = {
      ...DEFAULT_FILTERS,
      cities: [cityName],
      likings,
      practical,
    }
    const ids = new Set(filterExperienceItems(rankedAll, null, [], filters).map((e) => e.id))
    return rankedAll.filter((e) => {
      if (!ids.has(e.id)) return false
      if (section !== 'all' && e.sightSection !== section) return false
      return true
    })
  }, [cityName, rankedAll, likings, practical, section])

  function toggleLiking(id: LikingFilter) {
    setLikings((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  function togglePractical(id: PracticalFilter) {
    setPractical((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  if (!cityName) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="font-serif text-[1.35rem] font-semibold text-ink">City not found</p>
        <Link
          to="/plan/builder/experiences"
          className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
        >
          ← Back to experiences
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-16 lg:flex lg:items-start lg:gap-8">
      <aside className="mb-6 shrink-0 lg:sticky lg:top-24 lg:w-[220px]">
        <div className="rounded-[18px] bg-paper p-3.5 shadow-soft ring-1 ring-ink/[0.06]">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-sage">
            Filter
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {LIKING_CHIPS.map((chip) => (
              <FilterChip
                key={chip.id}
                active={likings.includes(chip.id)}
                onClick={() => toggleLiking(chip.id)}
              >
                {chip.label}
              </FilterChip>
            ))}
          </div>
          <div className="mt-3 border-t border-ink/8 pt-3">
            <div className="flex flex-wrap gap-1.5">
              {PRACTICAL_CHIPS.map((chip) => (
                <FilterChip
                  key={chip.id}
                  active={practical.includes(chip.id)}
                  onClick={() => togglePractical(chip.id)}
                >
                  {chip.label}
                </FilterChip>
              ))}
            </div>
          </div>
          {(likings.length > 0 || practical.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setLikings([])
                setPractical([])
                setSection('all')
              }}
              className="mt-3 text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <section className="rounded-[22px] bg-gradient-to-br from-cream/80 via-paper to-paper p-5 shadow-soft ring-1 ring-ink/[0.06] sm:p-7">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-sage">
            Ranked experiences
          </p>
          <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.5vw,2.35rem)] font-semibold leading-tight text-ink">
            {cityName}
          </h1>
          <p className="mt-3 text-[0.94rem] leading-[1.7] text-ink/85">
            {getCityDescription(cityName)}
          </p>
          <p className="mt-3 text-[0.78rem] font-bold text-muted">
            {rankedAll.length} experience{rankedAll.length === 1 ? '' : 's'} · must-visit rank by
            history, landscape, and culture
          </p>
          {sectionTabs.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <FilterChip active={section === 'all'} onClick={() => setSection('all')}>
                All
              </FilterChip>
              {sectionTabs.map((tab) => (
                <FilterChip key={tab} active={section === tab} onClick={() => setSection(tab)}>
                  {tab}
                </FilterChip>
              ))}
            </div>
          )}
          <Link
            to={experiencesCitySectionTo(cityName)}
            className="mt-4 inline-flex text-[0.82rem] font-bold text-terracotta hover:underline"
          >
            {cityName} on the experiences catalog →
          </Link>
        </section>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-[20px] bg-paper p-8 text-center shadow-soft">
            <p className="font-serif text-[1.2rem] font-semibold text-ink">
              No experiences match these filters in {cityName}.
            </p>
            <button
              type="button"
              onClick={() => {
                setLikings([])
                setPractical([])
                setSection('all')
              }}
              className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[0.86rem] font-bold text-paper"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => (
              <ExperienceCard
                key={item.id}
                experience={item}
                tripDate={tripDate}
                dense
                cityRank={item.cityRank}
                priority={index < 3}
              />
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-ink/8 pt-6">
          <Link
            to="/plan/builder/experiences"
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink shadow-soft transition hover:border-terracotta/35"
          >
            ← Back to experiences
          </Link>
        </div>
      </div>
    </div>
  )
}
