import { memo, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SIGHT_CATALOG } from '../data/experiences'
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
  experienceFiltersAreActive,
  filterExperienceItems,
  suggestDayAround,
  type ExperienceFilters,
} from '../services/recommendationEngine'
import { loadCatalogViewState, saveCatalogViewState } from '../lib/catalogViewState'
import {
  getUnfilteredCityCatalog,
  groupExperiencesByCity,
  type CityExperienceGroup,
  type RankedExperience,
} from '../services/cityCatalog'
import { cityAnchorId, experiencesCityPath } from '../services/citySlug'

const CATALOG_SCROLL_ID = 'sights-by-city'
const CITY_PREVIEW_COUNT = 6
const VIETNAM_BEST = SIGHT_CATALOG.filter((e) => e.vietnamBest).slice(0, 8)
const CATALOG_REGIONS = [...new Set(SIGHT_CATALOG.map((e) => e.region))].sort()

type MobilePanel = 'none' | 'progress' | 'filters'

export function ThingsToDo() {
  const tripDate = useTripStore((s) =>
    s.basics.dateMode === 'exact' && s.basics.startDate ? s.basics.startDate : null,
  )
  const addExperience = useTripStore((s) => s.addExperience)
  const mark = useTripStore((s) => s.markStepVisited)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)

  const [filters, setFilters] = useState<ExperienceFilters>(() => ({ ...DEFAULT_FILTERS }))
  const [filtersOpen, setFiltersOpen] = useState(
    () => loadCatalogViewState()?.filtersOpen ?? true,
  )
  const [mobileTripOpen, setMobileTripOpen] = useState(false)
  const [buildDayId, setBuildDayId] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none')
  const [focusCity, setFocusCity] = useState<string | null>(null)
  const pendingScroll = useRef<string | null>(null)

  useEffect(() => {
    mark('experiences')
  }, [mark])

  useEffect(() => {
    saveCatalogViewState({ filters: DEFAULT_FILTERS }, true)
  }, [])

  useEffect(() => {
    const saved = loadCatalogViewState()
    const hash = window.location.hash.replace(/^#/, '')
    if (hash.startsWith('city-')) return
    const y = saved?.scrollY ?? 0
    if (y <= 0) return
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    saveCatalogViewState({ filters, filtersOpen, scrollY: window.scrollY })
  }, [filters, filtersOpen])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        saveCatalogViewState({ scrollY: window.scrollY })
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const deferredFilters = useDeferredValue(filters)
  const isFiltering = experienceFiltersAreActive(deferredFilters)
  const unfiltered = getUnfilteredCityCatalog()

  const filteredItems = useMemo(() => {
    if (!isFiltering) return SIGHT_CATALOG
    return filterExperienceItems(SIGHT_CATALOG, null, [], deferredFilters)
  }, [isFiltering, deferredFilters])

  const cityGroups = useMemo(
    () => (isFiltering ? groupExperiencesByCity(filteredItems) : unfiltered.groups),
    [isFiltering, filteredItems, unfiltered.groups],
  )

  const cityCatalogItems = isFiltering ? filteredItems : SIGHT_CATALOG
  const resultCount = cityCatalogItems.length
  const cityRankById = unfiltered.rankById
  const allCityButtons = unfiltered.cities
  const regions = CATALOG_REGIONS

  const dayPlan = buildDayId ? suggestDayAround(buildDayId) : null

  const cityCounts = useMemo(() => {
    const source =
      isFiltering && deferredFilters.cities.length > 0
        ? filterExperienceItems(SIGHT_CATALOG, null, [], {
            ...deferredFilters,
            cities: [],
          })
        : cityCatalogItems
    const map: Record<string, number> = {}
    for (const e of source) {
      const key = e.city || e.region
      map[key] = (map[key] ?? 0) + 1
    }
    return map
  }, [cityCatalogItems, deferredFilters, isFiltering])

  function scrollToSection(target: string) {
    const id = target === 'catalog' ? CATALOG_SCROLL_ID : cityAnchorId(target)
    const run = () => {
      const el = document.getElementById(id) ?? document.getElementById(CATALOG_SCROLL_ID)
      if (!el) return false
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
      return true
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (run()) return
        window.setTimeout(run, 80)
      })
    })
  }

  useLayoutEffect(() => {
    if (deferredFilters !== filters) return
    const target = pendingScroll.current
    if (target == null) return
    pendingScroll.current = null
    scrollToSection(target)
  }, [cityGroups, deferredFilters, filters])

  useEffect(() => {
    const jump = () => {
      const raw = window.location.hash.replace(/^#/, '')
      if (!raw.startsWith('city-')) return
      const match = getUnfilteredCityCatalog().groups.find((g) => cityAnchorId(g.city) === raw)
      if (!match) return
      setFocusCity(match.city)
      scrollToSection(match.city)
    }
    jump()
    window.addEventListener('hashchange', jump)
    return () => window.removeEventListener('hashchange', jump)
  }, [])

  function applyFilters(next: ExperienceFilters) {
    if (pendingScroll.current == null) {
      pendingScroll.current = next.cities[0] ?? 'catalog'
    }
    setFilters({ ...next, duration: 'all' })
  }

  function onSelectCity(city: string, turningOn: boolean) {
    pendingScroll.current = turningOn ? city : 'catalog'
    setFocusCity(turningOn ? city : null)
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
    onChange: applyFilters,
    onClear: () => applyFilters({ ...DEFAULT_FILTERS }),
    cities: allCityButtons,
    cityCounts,
    regions,
    onSelectCity,
    resultCount,
  }

  return (
    <div className="relative flex pb-28 xl:pb-0">
      {/* Desktop: filters open by default; progress expands on hover only in Build itinerary */}
      <div className="sticky top-[72px] z-20 hidden shrink-0 self-start lg:flex">
        {pipelineActive ? <StayProgressPanel current="experiences" /> : null}
        <ExperienceFilterPanel
          expanded={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
          {...filterPanelProps}
        />
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
        <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
          Stage 2 · SightSeeing
        </p>
        <h1 className="font-serif text-[clamp(1.85rem,3.8vw,2.7rem)] font-semibold leading-[1.12] text-ink">
          Explore all Major Sights in Vietnam Sorted City by City
        </h1>
        <p className="mt-2 max-w-[52ch] text-[0.98rem] text-muted">
          We&apos;ll show sights for the trip you&apos;re building. Nothing is locked in — add
          sights that excite you and we&apos;ll help you shape your trip.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[0.82rem]">
          {isFiltering && (
            <button
              type="button"
              onClick={() => applyFilters({ ...DEFAULT_FILTERS })}
              className="font-bold text-terracotta hover:underline"
            >
              Relax filters
            </button>
          )}
        </div>

        {!isFiltering && (
          <DiscoverySection
            title="Vietnam, At Its Best"
            subtitle="These are some Must Visit Sights in Vietnam"
          >
            <VietnamBestScroller>
              {VIETNAM_BEST.map((item, i) => (
                <ExperienceCard
                  key={item.id}
                  experience={item}
                  tripDate={tripDate}
                  compact
                  priority={i < 2}
                  onBuildDay={setBuildDayId}
                />
              ))}
            </VietnamBestScroller>
          </DiscoverySection>
        )}

        {resultCount === 0 ? (
          <div className="mt-10 rounded-[22px] bg-paper p-8 text-center shadow-soft">
            <p className="font-serif text-[1.4rem] font-semibold text-ink">
              No sights match all of these filters.
            </p>
            <button
              type="button"
              onClick={() => applyFilters({ ...DEFAULT_FILTERS })}
              className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
            >
              Relax filters
            </button>
          </div>
        ) : (
          <DiscoverySection
            id={CATALOG_SCROLL_ID}
            title={isFiltering ? 'Matching sights by city' : 'Explore by city'}
            subtitle={
              isFiltering
                ? 'Ranked by tourist reviews within each city. Open a city to see every matching sight.'
                : 'Top sights in each city — open a city tab to see the full ranked list.'
            }
            className="mt-12"
          >
            <CityCatalogSections
              groups={cityGroups}
              tripDate={tripDate}
              onBuildDay={setBuildDayId}
              cityRankById={cityRankById}
              focusCity={focusCity}
            />
          </DiscoverySection>
        )}

        {pipelineActive ? (
          <StageFooter current="experiences" continueLabel="Continue to Things to Do →" />
        ) : null}
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

const CityCatalogSections = memo(function CityCatalogSections({
  groups,
  tripDate,
  onBuildDay,
  cityRankById,
  focusCity,
}: {
  groups: CityExperienceGroup[]
  tripDate: string | null
  onBuildDay: (id: string) => void
  cityRankById: Map<string, number>
  focusCity: string | null
}) {
  return (
    <div className="space-y-5">
      {groups.map((group, index) => {
        const visible = group.items.slice(0, CITY_PREVIEW_COUNT)
        const eager = index < 2 || group.city === focusCity
        return (
          <section
            key={group.city}
            id={cityAnchorId(group.city)}
            className="scroll-mt-[7.5rem] overflow-hidden rounded-[24px] border border-ink/8 bg-gradient-to-br from-paper via-paper to-cream/40 shadow-soft"
          >
            <div className="px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="font-serif text-[1.35rem] font-semibold text-ink">{group.city}</h3>
                <p className="mt-1 text-[0.8rem] text-muted">
                  {group.region !== group.city ? `${group.region} · ` : ''}
                  {group.items.length} sight{group.items.length === 1 ? '' : 's'}
                  {group.topTags.length > 0 ? ` · ${group.topTags.join(' · ')}` : ''}
                </p>
              </div>
            </div>

            <div className="border-t border-ink/6 px-4 pb-4 pt-3 sm:px-5">
              <DeferredMount eager={eager} minHeight={480}>
                <CardGrid
                  items={visible}
                  tripDate={tripDate}
                  onBuildDay={onBuildDay}
                  cityRankById={cityRankById}
                  priorityCount={eager && index < 2 ? 2 : 0}
                />
                <a
                  href={experiencesCityPath(group.city)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center rounded-full border border-terracotta/25 bg-terracotta/8 py-3 text-[0.88rem] font-bold text-terracotta-deep transition hover:border-terracotta/45 hover:bg-terracotta/12"
                >
                  See all sights in {group.city}
                </a>
              </DeferredMount>
            </div>
          </section>
        )
      })}
    </div>
  )
})

function DeferredMount({
  eager,
  minHeight,
  children,
}: {
  eager: boolean
  minHeight: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(eager)

  useEffect(() => {
    if (eager) setVisible(true)
  }, [eager])

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '900px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  if (visible) return <>{children}</>
  return (
    <div
      ref={ref}
      style={{ minHeight }}
      aria-hidden
      className="rounded-[16px] bg-cream/50"
    />
  )
}

function VietnamBestScroller({ children }: { children: React.ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lastLeftRef = useRef(0)
  const stopTimerRef = useRef<number | null>(null)
  const [atEnd, setAtEnd] = useState(false)
  const [scrollingRight, setScrollingRight] = useState(false)

  function measureEnd(el: HTMLDivElement) {
    const reachedEnd =
      el.scrollWidth <= el.clientWidth + 8 ||
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
    setAtEnd(reachedEnd)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    lastLeftRef.current = el.scrollLeft
    measureEnd(el)

    const onScroll = () => {
      const left = el.scrollLeft
      const goingRight = left > lastLeftRef.current + 0.5
      lastLeftRef.current = left
      measureEnd(el)
      if (!goingRight) return
      setScrollingRight(true)
      if (stopTimerRef.current != null) window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = window.setTimeout(() => {
        setScrollingRight(false)
        measureEnd(el)
      }, 220)
    }

    const onResize = () => measureEnd(el)
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
      if (stopTimerRef.current != null) window.clearTimeout(stopTimerRef.current)
    }
  }, [])

  const showArrow = !atEnd && !scrollingRight

  function scrollMore() {
    scrollerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 pr-14 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll to more must-visit sights"
        tabIndex={showArrow ? 0 : -1}
        aria-hidden={!showArrow}
        onClick={scrollMore}
        className={`absolute inset-y-0 right-0 z-10 flex w-14 items-center justify-center bg-gradient-to-l from-cream via-cream/90 to-transparent transition-opacity duration-200 ${
          showArrow ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-paper shadow-hero ring-2 ring-paper/80 transition hover:bg-terracotta">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  )
}

function DiscoverySection({
  id,
  title,
  subtitle,
  className,
  children,
}: {
  id?: string
  title: string
  subtitle?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`scroll-mt-[7.5rem] ${className ?? (id ? 'mt-10' : 'mt-10')}`}>
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
  cityRankById,
  priorityCount = 0,
}: {
  items: RankedExperience[]
  tripDate: string | null
  onBuildDay: (id: string) => void
  cityRankById?: Map<string, number>
  priorityCount?: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item, index) => (
        <ExperienceCard
          key={item.id}
          experience={item}
          tripDate={tripDate}
          onBuildDay={onBuildDay}
          cityRank={item.cityRank ?? cityRankById?.get(item.id)}
          priority={index < priorityCount}
        />
      ))}
    </div>
  )
}
