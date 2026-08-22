import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { EXPERIENCES } from '../data/experiences'
import { ExperienceCard } from '../components/ExperienceCard'
import { TripBag } from '../components/TripBag'
import { StageFooter } from '../components/StageFooter'
import { StayProgressPanel } from '../components/StayProgressPanel'
import {
  ExperienceFilterPanel,
  ExperienceFilterPanelBody,
  countActiveExperienceFilters,
} from '../components/ExperienceFilterPanel'
import { VerticalTripProgress } from '../components/VerticalTripProgress'
import { useTripStore } from '../../../store/tripStore'
import {
  DEFAULT_FILTERS,
  buildDiscoverySections,
  formatTripContext,
  suggestDayAround,
  type ExperienceFilters,
} from '../services/recommendationEngine'
import { loadCatalogViewState, saveCatalogViewState } from '../lib/catalogViewState'
import { groupExperiencesByCity, listCitiesByPopularity } from '../services/cityCatalog'
import type { Experience } from '../types'

const CITY_SCROLL_OFFSET = 96
const CITY_PREVIEW_COUNT = 6

export function cityAnchorId(city: string) {
  return `city-${city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`
}

type MobilePanel = 'none' | 'progress' | 'filters'

export function ThingsToDo() {
  const basics = useTripStore((s) => s.basics)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const addExperience = useTripStore((s) => s.addExperience)
  const mark = useTripStore((s) => s.markStepVisited)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)

  const saved = loadCatalogViewState()
  const [filters, setFilters] = useState<ExperienceFilters>(() => ({ ...DEFAULT_FILTERS }))
  const [mobileTripOpen, setMobileTripOpen] = useState(false)
  const [buildDayId, setBuildDayId] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)
  const [progressHovered, setProgressHovered] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none')

  const filtersExpanded = pipelineActive ? !progressHovered : true
  const progressExpanded = pipelineActive && progressHovered

  useEffect(() => {
    mark('experiences')
  }, [mark])

  // Clear any stuck session filters so the full catalog is visible again
  useEffect(() => {
    saveCatalogViewState({ filters: DEFAULT_FILTERS, filtersOpen: true })
  }, [])

  useEffect(() => {
    if (restored) return
    const y = saved?.scrollY ?? 0
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' })
      setRestored(true)
    })
    return () => window.cancelAnimationFrame(id)
  }, [restored, saved?.scrollY])

  useEffect(() => {
    saveCatalogViewState({ filters, filtersOpen: true, scrollY: window.scrollY })
  }, [filters])

  useEffect(() => {
    const onScroll = () => saveCatalogViewState({ scrollY: window.scrollY })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const deferredFilters = useDeferredValue(filters)

  const contextParts = useMemo(() => formatTripContext(basics), [basics])
  const tripDate = basics.dateMode === 'exact' && basics.startDate ? basics.startDate : null

  const regions = useMemo(
    () => [...new Set(EXPERIENCES.map((e) => e.region))].sort(),
    [],
  )

  // Defer heavy catalog work so filter chips can paint black immediately
  const sections = useMemo(
    () => buildDiscoverySections(basics, selectedIds, deferredFilters),
    [basics, selectedIds, deferredFilters],
  )

  const isFiltering =
    Boolean(deferredFilters.query) ||
    deferredFilters.likings.length > 0 ||
    deferredFilters.practical.length > 0 ||
    deferredFilters.region !== 'all' ||
    deferredFilters.duration !== 'all' ||
    deferredFilters.cost !== 'all' ||
    deferredFilters.accessibility !== 'all' ||
    deferredFilters.bestTime !== 'all' ||
    deferredFilters.minFit > 0

  // Full city catalog whenever filters are clear; filtered set only while filtering
  const cityCatalogItems = isFiltering ? sections.catalog : EXPERIENCES

  const resultCount = cityCatalogItems.length

  const dayPlan = buildDayId ? suggestDayAround(buildDayId) : null

  const cityJumpGroups = useMemo(
    () => groupExperiencesByCity(cityCatalogItems),
    [cityCatalogItems],
  )

  const allCityButtons = useMemo(
    () => listCitiesByPopularity(cityCatalogItems),
    [cityCatalogItems],
  )

  const cityCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of cityCatalogItems) {
      const key = e.city || e.region
      map[key] = (map[key] ?? 0) + 1
    }
    return map
  }, [cityCatalogItems])

  const [activeCity, setActiveCity] = useState<string | null>(null)
  const scrollLockRef = useRef<string | null>(null)
  const scrollLockTimerRef = useRef<number | null>(null)
  const rafSpyRef = useRef<number | null>(null)

  // Keep highlight in sync with the city section at the top of the viewport
  useEffect(() => {
    const cities = cityJumpGroups.map((g) => g.city)
    if (cities.length === 0) return

    setActiveCity((prev) => (prev && cities.includes(prev) ? prev : cities[0]))

    const spy = () => {
      if (scrollLockRef.current) {
        setActiveCity(scrollLockRef.current)
        return
      }
      const marker = CITY_SCROLL_OFFSET + 12
      let current = cities[0]
      for (const city of cities) {
        const el = document.getElementById(cityAnchorId(city))
        if (!el) continue
        if (el.getBoundingClientRect().top <= marker) current = city
      }
      setActiveCity(current)
    }

    const onScroll = () => {
      if (rafSpyRef.current != null) return
      rafSpyRef.current = window.requestAnimationFrame(() => {
        rafSpyRef.current = null
        spy()
      })
    }

    spy()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafSpyRef.current != null) window.cancelAnimationFrame(rafSpyRef.current)
      if (scrollLockTimerRef.current != null) window.clearTimeout(scrollLockTimerRef.current)
    }
  }, [cityJumpGroups])

  function scrollToCity(city: string) {
    const id = cityAnchorId(city)
    const run = () => {
      const el = document.getElementById(id)
      if (!el) return false
      const top = el.getBoundingClientRect().top + window.scrollY - CITY_SCROLL_OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
      return true
    }
    if (run()) return
    window.requestAnimationFrame(() => {
      if (run()) return
      window.setTimeout(run, 120)
    })
  }

  function selectCityFromFilter(city: string) {
    // Lock highlight to the clicked city until smooth-scroll finishes
    setActiveCity(city)
    scrollLockRef.current = city
    if (scrollLockTimerRef.current != null) window.clearTimeout(scrollLockTimerRef.current)
    scrollToCity(city)
    scrollLockTimerRef.current = window.setTimeout(() => {
      scrollLockRef.current = null
      // One final sync after scroll settles
      const el = document.getElementById(cityAnchorId(city))
      if (el) setActiveCity(city)
    }, 900)
    setMobilePanel('none')
  }

  function addDayToTrip() {
    if (!dayPlan) return
    addExperience(dayPlan.main.id, 'best')
    dayPlan.secondaryIds.forEach((id) => addExperience(id, 'afternoon'))
    setBuildDayId(null)
  }

  const activeFilterCount = countActiveExperienceFilters(filters)

  const filterPanelProps = {
    filters,
    onChange: setFilters,
    onClear: () => setFilters(DEFAULT_FILTERS),
    cities: allCityButtons,
    cityCounts,
    regions,
    activeCity,
    onSelectCity: selectCityFromFilter,
    resultCount,
  }

  return (
    <div className="relative flex pb-28 xl:pb-0">
      {/* Desktop: filters open by default; progress expands on hover only in Build itinerary */}
      <div className="sticky top-[72px] z-20 hidden shrink-0 self-start lg:flex">
        {pipelineActive ? (
          <div
            onMouseEnter={() => setProgressHovered(true)}
            onMouseLeave={() => setProgressHovered(false)}
          >
            <StayProgressPanel expanded={progressExpanded} current="experiences" />
          </div>
        ) : null}
        <ExperienceFilterPanel expanded={filtersExpanded} {...filterPanelProps} />
      </div>

      {/* Mobile pipeline / filters */}
      <div className="fixed inset-x-0 bottom-[4.6rem] z-30 flex justify-center gap-2 px-3 lg:hidden">
        {pipelineActive ? (
          <button
            type="button"
            onClick={() => setMobilePanel((p) => (p === 'progress' ? 'none' : 'progress'))}
            className={`rounded-full px-4 py-2.5 text-[0.8rem] font-bold shadow-card ${
              mobilePanel === 'progress' ? 'bg-ink text-paper' : 'bg-paper text-ink'
            }`}
          >
            Pipeline
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMobilePanel((p) => (p === 'filters' ? 'none' : 'filters'))}
          className={`rounded-full px-4 py-2.5 text-[0.8rem] font-bold shadow-card ${
            mobilePanel === 'filters' ? 'bg-ink text-paper' : 'bg-paper text-ink'
          }`}
        >
          Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
        </button>
      </div>

      <AnimatePresence>
        {mobilePanel !== 'none' && (
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobilePanel('none')}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pipelineActive && mobilePanel === 'progress' && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-[min(88vw,320px)] overflow-y-auto bg-paper p-5 shadow-hero lg:hidden"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
                Itinerary progress
              </p>
              <button type="button" onClick={() => setMobilePanel('none')} className="text-muted">
                Close
              </button>
            </div>
            <VerticalTripProgress current="experiences" />
          </motion.aside>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobilePanel === 'filters' && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-[min(92vw,340px)] overflow-y-auto bg-paper p-5 shadow-hero lg:hidden"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
                Filters
              </p>
              <button type="button" onClick={() => setMobilePanel('none')} className="text-muted">
                Close
              </button>
            </div>
            <ExperienceFilterPanelBody {...filterPanelProps} />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1 px-[clamp(1.1rem,4vw,2rem)] pt-2 lg:pt-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Stage 2 · Things to do
          </p>
          <h1 className="font-serif text-[clamp(1.85rem,3.8vw,2.7rem)] font-semibold leading-[1.12] text-ink">
            What do you want your Vietnam to feel like?
          </h1>
          <p className="mt-2 max-w-[52ch] text-[0.98rem] text-muted">
            We&apos;ll surface experiences that fit the trip you&apos;re building. Nothing is locked
            in — add what excites you and we&apos;ll help shape the rest.
          </p>

          <div className="mt-5">
            <Link
              to="/plan/builder/activities"
              className="inline-flex items-center gap-2 rounded-full border border-terracotta/25 bg-terracotta/8 px-4 py-2.5 text-[0.84rem] font-bold text-terracotta-deep transition hover:border-terracotta/45 hover:bg-terracotta/12"
            >
              Prefer hands-on activities? Classes, beach games, music &amp; dance →
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {contextParts.map((part) => (
              <span
                key={part}
                className="rounded-full bg-paper px-3 py-1.5 text-[0.72rem] font-bold tracking-wide text-ink shadow-soft"
              >
                {part}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[0.82rem]">
            <span className="font-semibold text-muted">
              {resultCount} experience{resultCount === 1 ? '' : 's'}
            </span>
            {isFiltering && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="font-bold text-terracotta hover:underline"
              >
                Relax filters
              </button>
            )}
          </div>

          {!isFiltering && (
            <DiscoverySection
              title="Best Fits for Your Trip"
              subtitle="Based on what you've told us so far. Browse freely and add whatever catches your eye."
            >
              <CardGrid
                items={sections.chosen}
                tripDate={tripDate}
                onBuildDay={setBuildDayId}
              />
            </DiscoverySection>
          )}

          {!isFiltering && sections.becauseSelected && (
            <DiscoverySection title={sections.becauseSelected.title}>
              <CardGrid
                items={sections.becauseSelected.items}
                tripDate={tripDate}
                onBuildDay={setBuildDayId}
              />
            </DiscoverySection>
          )}

          {!isFiltering && (
            <DiscoverySection
              title="Vietnam, At Its Best"
              subtitle="The experiences that make a trip here feel unmistakably Vietnamese."
            >
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {sections.vietnamBest.map((item) => (
                  <ExperienceCard
                    key={item.id}
                    experience={item}
                    tripDate={tripDate}
                    compact
                    onBuildDay={setBuildDayId}
                  />
                ))}
              </div>
            </DiscoverySection>
          )}

          {resultCount === 0 ? (
            <div className="mt-10 rounded-[22px] bg-paper p-8 text-center shadow-soft">
              <p className="font-serif text-[1.4rem] font-semibold text-ink">
                No experiences match all of these filters.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
              >
                Relax filters
              </button>
            </div>
          ) : (
            <DiscoverySection
              title={isFiltering ? 'Matching experiences by city' : 'Explore by city'}
              subtitle={
                isFiltering
                  ? 'Ranked by popularity and reviews within each city. Expand a city for every matching sight.'
                  : `Each city shows the top ${CITY_PREVIEW_COUNT} sights by popularity — expand to see every experience.`
              }
            >
              <CityCatalogSections
                items={cityCatalogItems}
                tripDate={tripDate}
                onBuildDay={setBuildDayId}
              />
            </DiscoverySection>
          )}

          {pipelineActive ? (
            <StageFooter current="experiences" continueLabel="Continue to Things to Do →" />
          ) : null}
        </motion.div>
      </div>

      <TripBag
        mobileOpen={mobileTripOpen}
        onToggleMobile={() => setMobileTripOpen((v) => !v)}
      />

      <AnimatePresence>
        {dayPlan && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBuildDayId(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="w-full max-w-lg rounded-[28px] bg-paper p-6 shadow-hero"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">
                Build a day
              </p>
              <h3 className="mt-1 font-serif text-[1.6rem] font-semibold text-ink">
                Around {dayPlan.main.name}
              </h3>
              <ul className="mt-5 space-y-3">
                {dayPlan.blocks.map((b) => (
                  <li key={b.time} className="flex gap-4 border-b border-ink/6 pb-3">
                    <span className="w-14 shrink-0 font-mono text-[0.82rem] font-bold text-terracotta">
                      {b.time}
                    </span>
                    <span className="text-[0.95rem] text-ink">{b.label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={addDayToTrip} className="btn-solid">
                  Add this day to my trip
                </button>
                <button
                  type="button"
                  onClick={() => setBuildDayId(null)}
                  className="rounded-full border border-ink/12 px-4 py-2.5 text-[0.88rem] font-bold text-ink"
                >
                  Adjust later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CityCatalogSections({
  items,
  tripDate,
  onBuildDay,
}: {
  items: Experience[]
  tripDate: string | null
  onBuildDay: (id: string) => void
}) {
  const groups = useMemo(() => groupExperiencesByCity(items), [items])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function toggle(city: string) {
    setExpanded((prev) => ({ ...prev, [city]: !prev[city] }))
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const isOpen = Boolean(expanded[group.city])
        const visible = isOpen ? group.items : group.items.slice(0, CITY_PREVIEW_COUNT)
        const hidden = Math.max(0, group.items.length - CITY_PREVIEW_COUNT)
        const topRated = group.items[0]
        return (
          <section
            key={group.city}
            id={cityAnchorId(group.city)}
            className="scroll-mt-32 overflow-hidden rounded-[24px] border border-ink/8 bg-gradient-to-br from-paper via-paper to-cream/40 shadow-soft"
          >
            <button
              type="button"
              onClick={() => toggle(group.city)}
              className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-cream/40 sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-[1.35rem] font-semibold text-ink">{group.city}</h3>
                  <span className="rounded-full bg-terracotta/12 px-2.5 py-0.5 text-[0.68rem] font-bold text-terracotta-deep">
                    Top {Math.min(CITY_PREVIEW_COUNT, group.items.length)} by popularity
                  </span>
                </div>
                <p className="mt-1 text-[0.8rem] text-muted">
                  {group.region !== group.city ? `${group.region} · ` : ''}
                  {group.items.length} experience{group.items.length === 1 ? '' : 's'}
                  {topRated
                    ? ` · #1 ${topRated.name} (⭐ ${topRated.rating} · ${topRated.reviewCount.toLocaleString()} reviews)`
                    : ''}
                  {group.topTags.length > 0 ? ` · ${group.topTags.join(' · ')}` : ''}
                </p>
              </div>
              <span
                className={`mt-1 shrink-0 rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold ${
                  isOpen ? 'bg-ink text-paper' : 'bg-terracotta text-paper'
                }`}
              >
                {isOpen ? 'Show top only' : hidden > 0 ? `Expand all · +${hidden}` : 'Expanded'}
              </span>
            </button>

            <div className="border-t border-ink/6 px-4 pb-4 pt-3 sm:px-5">
              <CardGrid items={visible} tripDate={tripDate} onBuildDay={onBuildDay} />
              {!isOpen && hidden > 0 ? (
                <button
                  type="button"
                  onClick={() => toggle(group.city)}
                  className="mt-4 w-full rounded-full border border-terracotta/25 bg-terracotta/8 py-3 text-[0.88rem] font-bold text-terracotta-deep transition hover:border-terracotta/45 hover:bg-terracotta/12"
                >
                  Expand {group.city} — show all {group.items.length} experiences
                </button>
              ) : null}
              {isOpen && group.items.length > CITY_PREVIEW_COUNT ? (
                <button
                  type="button"
                  onClick={() => toggle(group.city)}
                  className="mt-4 w-full rounded-full border border-ink/10 bg-cream/70 py-2.5 text-[0.84rem] font-bold text-ink hover:border-ink/20"
                >
                  Collapse to top {CITY_PREVIEW_COUNT}
                </button>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function DiscoverySection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-[1.45rem] font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 max-w-[56ch] text-[0.92rem] text-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function CardGrid({
  items,
  tripDate,
  onBuildDay,
}: {
  items: Experience[]
  tripDate: string | null
  onBuildDay: (id: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ExperienceCard
            key={item.id}
            experience={item}
            tripDate={tripDate}
            onBuildDay={onBuildDay}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
