import { memo, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TripBag } from '../components/TripBag'
import { StageFooter } from '../components/StageFooter'
import { ActivityCard } from '../components/ActivityCard'
import { VerticalTripProgress } from '../components/VerticalTripProgress'
import {
  ActivityFilterBar,
  DEFAULT_ACTIVITY_FILTERS,
  type ActivityCatalogFilters,
} from '../components/ActivityFilterPanel'
import { useTripStore } from '../../../store/tripStore'
import { SIGHT_CATALOG } from '../data/experiences'
import {
  CITY_ACTIVITIES,
  activityKindFilters,
  groupActivitiesByCity,
  rankCityActivities,
  type ActivityCityGroup,
  type CityActivity,
} from '../data/activities'
import { groupIdForSourceId } from '../lib/yourVietnam/sightTiming'
import { cityAnchorId, activitiesCityPath, activitiesTopPath } from '../services/citySlug'

const CATALOG_SCROLL_ID = 'activities-by-city'
const CITY_PREVIEW_COUNT = 5

type MobilePanel = 'none' | 'progress'

function activitiesWithoutSightDupes(): CityActivity[] {
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

export function ThingsToDoByCity() {
  const mark = useTripStore((s) => s.markStepVisited)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)
  const [filters, setFilters] = useState<ActivityCatalogFilters>(() => ({
    ...DEFAULT_ACTIVITY_FILTERS,
  }))
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [mobileTripOpen, setMobileTripOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none')
  const [focusCity, setFocusCity] = useState<string | null>(null)
  const pendingScroll = useRef<string | null>(null)

  useEffect(() => {
    mark('activities')
  }, [mark])

  const catalog = useMemo(() => activitiesWithoutSightDupes(), [])
  const vietnamBest = useMemo(
    () => rankCityActivities(catalog).slice(0, 20),
    [catalog],
  )

  const deferredFilters = useDeferredValue(filters)
  const isFiltering =
    deferredFilters.kind !== 'all' || deferredFilters.cities.length > 0

  const kinds = useMemo(() => {
    const source =
      deferredFilters.cities.length > 0
        ? catalog.filter((a) => deferredFilters.cities.includes(a.cityName))
        : catalog
    return activityKindFilters(source).filter((k) => k.count > 0)
  }, [catalog, deferredFilters.cities])

  useEffect(() => {
    if (filters.kind === 'all') return
    if (kinds.some((k) => k.id === filters.kind)) return
    setFilters((prev) => ({ ...prev, kind: 'all' }))
  }, [filters.kind, kinds])

  const filteredItems = useMemo(() => {
    return catalog.filter((a) => {
      if (deferredFilters.kind !== 'all' && a.kind !== deferredFilters.kind) return false
      if (
        deferredFilters.cities.length > 0 &&
        !deferredFilters.cities.includes(a.cityName)
      ) {
        return false
      }
      return true
    })
  }, [catalog, deferredFilters])

  const cityGroups = useMemo(
    () => groupActivitiesByCity(filteredItems).filter((g) => g.activities.length > 0),
    [filteredItems],
  )
  const fullGroups = useMemo(() => groupActivitiesByCity(catalog), [catalog])

  const cityButtons = useMemo(() => {
    const source =
      deferredFilters.kind === 'all'
        ? catalog
        : catalog.filter((a) => a.kind === deferredFilters.kind)
    return [...new Set(groupActivitiesByCity(source).map((g) => g.cityName))]
  }, [catalog, deferredFilters.kind])

  useEffect(() => {
    if (filters.cities.length === 0) return
    const allowed = new Set(cityButtons)
    const next = filters.cities.filter((c) => allowed.has(c))
    if (next.length === filters.cities.length) return
    setFilters((prev) => ({ ...prev, cities: next }))
  }, [cityButtons, filters.cities])

  const cityCounts = useMemo(() => {
    const source =
      deferredFilters.kind === 'all'
        ? catalog
        : catalog.filter((a) => a.kind === deferredFilters.kind)
    const map: Record<string, number> = {}
    for (const a of source) {
      map[a.cityName] = (map[a.cityName] ?? 0) + 1
    }
    return map
  }, [catalog, deferredFilters.kind])

  const resultCount = filteredItems.length

  function scrollToSection(target: string) {
    const id =
      target === 'catalog'
        ? CATALOG_SCROLL_ID
        : target === 'vietnam-best' || target === ''
          ? 'vietnam-best'
          : cityAnchorId(target)
    const run = () => {
      const el = document.getElementById(id) ?? document.getElementById('vietnam-best')
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
      const match = groupActivitiesByCity(catalog).find(
        (g) => cityAnchorId(g.cityName) === raw,
      )
      if (!match) return
      setFocusCity(match.cityName)
      scrollToSection(match.cityName)
    }
    jump()
    window.addEventListener('hashchange', jump)
    return () => window.removeEventListener('hashchange', jump)
  }, [catalog])

  function applyFilters(next: ActivityCatalogFilters) {
    if (pendingScroll.current == null && next.cities[0]) {
      pendingScroll.current = next.cities[0]
    }
    setFilters(next)
  }

  function onSelectCity(city: string, turningOn: boolean) {
    if (turningOn) pendingScroll.current = city
    setFocusCity(turningOn ? city : null)
    setMobilePanel('none')
  }

  const filterPanelProps = {
    filters,
    onChange: applyFilters,
    onClear: () => applyFilters({ ...DEFAULT_ACTIVITY_FILTERS }),
    cities: cityButtons,
    cityCounts,
    kinds,
    onSelectCity,
    resultCount,
  }

  return (
    <div className="relative flex pb-28 xl:pb-0">
      {pipelineActive ? (
        <div className="fixed inset-x-0 bottom-[4.6rem] z-30 flex justify-center gap-2 px-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePanel((p) => (p === 'progress' ? 'none' : 'progress'))}
            className={`rounded-full px-4 py-2.5 text-[0.8rem] font-bold shadow-card ${
              mobilePanel === 'progress' ? 'bg-ink text-paper' : 'bg-paper text-ink'
            }`}
          >
            Pipeline
          </button>
        </div>
      ) : null}

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
            <VerticalTripProgress current="activities" />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <div className="px-[clamp(1.1rem,4vw,2rem)] pt-3 lg:pt-5">
          <h1 className="font-serif text-[clamp(1.85rem,3.8vw,2.7rem)] font-semibold leading-[1.12] text-ink">
            Activities in Vietnam
          </h1>
          <p className="mt-3 w-full text-[0.95rem] leading-[1.6] text-muted">
            Browse hands-on classes, adventures, workshops, and nights out city by city — ranked
            from the activities travelers actually do first, not obscure workshops. Click a city
            name on a card to open the ranked list, or See ranked activities at the end of a row.
          </p>
          {isFiltering ? (
            <button
              type="button"
              onClick={() => applyFilters({ ...DEFAULT_ACTIVITY_FILTERS })}
              className="mt-3 text-[0.82rem] font-bold text-terracotta hover:underline"
            >
              Relax filters
            </button>
          ) : null}
        </div>

        <div className="sticky top-0 z-30 mt-4 border-b border-ink/8 bg-cream px-[clamp(1.1rem,4vw,2rem)]">
          <ActivityFilterBar
            expanded={filtersOpen}
            onToggle={() => setFiltersOpen((v) => !v)}
            {...filterPanelProps}
          />
        </div>

        <div className="px-[clamp(1.1rem,4vw,2rem)] pt-4">
          {!isFiltering && (
            <DiscoverySection
              id="vietnam-best"
              title="Vietnam, at its best"
              subtitle="The activities most travelers actually do — ranked, not a random Unique tag."
            >
              <ActivityRowScroller>
                {vietnamBest.slice(0, CITY_PREVIEW_COUNT).map((item) => (
                  <ActivityCard key={item.id} activity={item} compact cityRank={item.cityRank} />
                ))}
                <a
                  href={activitiesTopPath()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[280px] w-[var(--sight-card-w,calc((100%-2rem)/2.5))] min-w-[var(--sight-card-w,calc((100%-2rem)/2.5))] shrink-0 snap-start flex-col items-center justify-center rounded-[22px] border border-terracotta/30 bg-terracotta/10 px-5 text-center transition hover:border-terracotta/50 hover:bg-terracotta/16"
                >
                  <span className="font-serif text-[1.2rem] font-semibold text-ink">
                    See All Top Activities
                  </span>
                  <span className="mt-1 text-[0.78rem] font-bold text-terracotta">
                    Ranked 1–20 across Vietnam
                  </span>
                </a>
              </ActivityRowScroller>
            </DiscoverySection>
          )}

          <DiscoverySection
            id={CATALOG_SCROLL_ID}
            title={isFiltering ? 'Matching activities by city' : 'Explore by city'}
            subtitle={
              isFiltering
                ? 'Must-visit ranking within each city — culture and landscape, not star counts.'
                : 'Must-visit activities in each city — open a city page for the full ranked list.'
            }
            className="mt-12"
          >
            <CityCatalogSections
              groups={cityGroups}
              fullGroups={fullGroups}
              focusCity={focusCity}
              selectedCities={filters.cities}
            />
          </DiscoverySection>

          {pipelineActive ? (
            <StageFooter current="activities" continueLabel="Continue to Where to Stay →" />
          ) : null}
        </div>
      </div>

      <TripBag
        mobileOpen={mobileTripOpen}
        onToggleMobile={() => setMobileTripOpen((v) => !v)}
      />
    </div>
  )
}

const CityCatalogSections = memo(function CityCatalogSections({
  groups,
  fullGroups,
  focusCity,
  selectedCities,
}: {
  groups: ActivityCityGroup[]
  fullGroups: ActivityCityGroup[]
  focusCity: string | null
  selectedCities: string[]
}) {
  return (
    <div className="space-y-5">
      {groups.map((group, index) => {
        const expand =
          group.cityName === focusCity || selectedCities.includes(group.cityName)
        const ranked = [...(fullGroups.find((g) => g.cityId === group.cityId)?.activities ?? group.activities)].sort(
          (a, b) => a.cityRank - b.cityRank,
        )
        const visible = expand ? ranked : ranked.slice(0, CITY_PREVIEW_COUNT)
        const eager = index < 2 || expand
        return (
          <section
            key={group.cityId}
            id={cityAnchorId(group.cityName)}
            className="scroll-mt-[9rem] overflow-hidden rounded-[24px] border border-ink/8 bg-gradient-to-br from-paper via-paper to-cream/40 shadow-soft"
          >
            <div className="px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="font-serif text-[1.35rem] font-semibold text-ink">{group.cityName}</h3>
                <p className="mt-1 text-[0.8rem] text-muted">
                  {ranked.length} activit{ranked.length === 1 ? 'y' : 'ies'} ·
                  {expand ? ' full rank order' : ' ranked by must-visit value'}
                </p>
              </div>
            </div>

            <div className="border-t border-ink/6 px-4 pb-4 pt-3 sm:px-5">
              <DeferredMount eager={eager} minHeight={280}>
                {expand ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((item) => (
                      <ActivityCard
                        key={item.id}
                        activity={item}
                        dense
                        cityRank={item.cityRank}
                      />
                    ))}
                  </div>
                ) : (
                  <ActivityRowScroller key={`${group.cityId}-preview`}>
                    {visible.map((item) => (
                      <ActivityCard
                        key={item.id}
                        activity={item}
                        compact
                        cityRank={item.cityRank}
                      />
                    ))}
                    <a
                      href={activitiesCityPath(group.cityName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[280px] w-[var(--sight-card-w,calc((100%-2rem)/2.5))] min-w-[var(--sight-card-w,calc((100%-2rem)/2.5))] shrink-0 snap-start flex-col items-center justify-center rounded-[22px] border border-terracotta/30 bg-terracotta/10 px-5 text-center transition hover:border-terracotta/50 hover:bg-terracotta/16"
                    >
                      <span className="font-serif text-[1.2rem] font-semibold text-ink">
                        See ranked activities in {group.cityName}
                      </span>
                      <span className="mt-1 text-[0.78rem] font-bold text-terracotta">
                        Full city ranking
                      </span>
                    </a>
                  </ActivityRowScroller>
                )}
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

function ActivityRowScroller({ children }: { children: React.ReactNode }) {
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
        className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 pr-14 snap-x snap-mandatory max-sm:[--sight-card-w:calc((100%-0.75rem)/1.35)] sm:[--sight-card-w:calc((100%-2rem)/2.5)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll to more activities"
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
