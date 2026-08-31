import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TripBag } from '../components/TripBag'
import { StageFooter } from '../components/StageFooter'
import { ActivityCard } from '../components/ActivityCard'
import { StayProgressPanel } from '../components/StayProgressPanel'
import { VerticalTripProgress } from '../components/VerticalTripProgress'
import {
  ActivityFilterPanel,
  ActivityFilterPanelBody,
  DEFAULT_ACTIVITY_FILTERS,
  countActiveActivityFilters,
} from '../components/ActivityFilterPanel'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../data/experiences'
import {
  CITY_ACTIVITIES,
  activityCityIdForPlace,
  activityDurationBand,
  activityKindFilters,
  groupActivitiesByCity,
  listActivityCitiesByPopularity,
  type RankedActivity,
} from '../data/activities'

const CITY_SCROLL_OFFSET = 96

type MobilePanel = 'none' | 'progress' | 'filters'

export function ThingsToDoByCity() {
  const mark = useTripStore((s) => s.markStepVisited)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)
  const [mobileTripOpen, setMobileTripOpen] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_ACTIVITY_FILTERS)
  const [activeCity, setActiveCity] = useState<string | null>(null)
  const [progressHovered, setProgressHovered] = useState(true)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none')

  const filtersExpanded = pipelineActive ? !progressHovered : true
  const progressExpanded = pipelineActive && progressHovered

  const scrollLockRef = useRef<string | null>(null)
  const scrollLockTimerRef = useRef<number | null>(null)
  const rafSpyRef = useRef<number | null>(null)

  useEffect(() => {
    mark('activities')
  }, [mark])

  const selectedExperienceIds = useTripStore((s) => s.selectedExperienceIds)

  const filtered = useMemo(() => {
    return CITY_ACTIVITIES.filter((a) => {
      if (filters.kind !== 'all' && a.kind !== filters.kind) return false
      if (filters.duration !== 'all' && activityDurationBand(a) !== filters.duration) return false
      return true
    })
  }, [filters])

  const bagCityIds = useMemo(() => {
    const ids = new Set<string>()
    for (const exp of EXPERIENCES) {
      if (!selectedExperienceIds.includes(exp.id)) continue
      const cityId = activityCityIdForPlace(exp.city) ?? activityCityIdForPlace(exp.region)
      if (cityId) ids.add(cityId)
    }
    return ids
  }, [selectedExperienceIds])

  const groups = useMemo(
    () => groupActivitiesByCity(filtered, bagCityIds),
    [filtered, bagCityIds],
  )
  const kinds = useMemo(() => activityKindFilters(), [])
  const cities = useMemo(() => listActivityCitiesByPopularity(filtered), [filtered])
  const resultCount = filtered.length
  const activeFilterCount = countActiveActivityFilters(filters)
  const isFiltering = filters.kind !== 'all' || filters.duration !== 'all'

  useEffect(() => {
    const cityIds = groups.map((g) => g.cityId)
    if (cityIds.length === 0) return

    setActiveCity((prev) => (prev && cityIds.includes(prev) ? prev : cityIds[0]))

    const spy = () => {
      if (scrollLockRef.current) {
        setActiveCity(scrollLockRef.current)
        return
      }
      const marker = CITY_SCROLL_OFFSET + 12
      let current = cityIds[0]
      for (const id of cityIds) {
        const el = document.getElementById(`activity-city-${id}`)
        if (!el) continue
        if (el.getBoundingClientRect().top <= marker) current = id
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
  }, [groups])

  function scrollToCity(id: string) {
    const el = document.getElementById(`activity-city-${id}`)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - CITY_SCROLL_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function selectCityFromFilter(cityId: string) {
    setActiveCity(cityId)
    scrollLockRef.current = cityId
    if (scrollLockTimerRef.current != null) window.clearTimeout(scrollLockTimerRef.current)
    scrollToCity(cityId)
    scrollLockTimerRef.current = window.setTimeout(() => {
      scrollLockRef.current = null
      setActiveCity(cityId)
    }, 900)
    setMobilePanel('none')
  }

  const filterPanelProps = {
    filters,
    onChange: setFilters,
    onClear: () => setFilters(DEFAULT_ACTIVITY_FILTERS),
    cities,
    kinds,
    activeCity,
    onSelectCity: selectCityFromFilter,
    resultCount,
  }

  return (
    <div className="relative flex pb-28 xl:pb-0">
      <div className="sticky top-[72px] z-20 hidden shrink-0 self-start lg:flex">
        {pipelineActive ? (
          <div
            onMouseEnter={() => setProgressHovered(true)}
            onMouseLeave={() => setProgressHovered(false)}
          >
            <StayProgressPanel expanded={progressExpanded} current="activities" />
          </div>
        ) : null}
        <ActivityFilterPanel expanded={filtersExpanded} {...filterPanelProps} />
      </div>

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
            <VerticalTripProgress current="activities" />
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
            <ActivityFilterPanelBody {...filterPanelProps} />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1 px-[clamp(1.1rem,4vw,2rem)] pt-2 lg:pt-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Stage 2 · Things to do
          </p>
          <h1 className="font-serif text-[clamp(1.9rem,4vw,2.85rem)] font-semibold leading-[1.1] text-ink">
            Join in — don&apos;t just look
          </h1>
          <p className="mt-3 max-w-[54ch] text-[1.02rem] leading-relaxed text-muted">
            Classes, beach games with locals, singing, dancing, workshops — real activities you do
            with your hands and your voice. Sorted city by city so you can plan where to play.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[0.8rem] text-muted">
              {resultCount} activit{resultCount === 1 ? 'y' : 'ies'}
              {isFiltering ? ' match' : ` · ${groups.length} cities`}
            </span>
            {isFiltering ? (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_ACTIVITY_FILTERS)}
                className="text-[0.8rem] font-bold text-terracotta hover:underline"
              >
                Relax filters
              </button>
            ) : null}
          </div>

          {groups.length === 0 ? (
            <div className="mt-10 rounded-[22px] bg-paper p-8 text-center shadow-soft">
              <p className="font-serif text-[1.35rem] font-semibold text-ink">
                No activities match these filters right now.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_ACTIVITY_FILTERS)}
                className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
              >
                Show all
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {groups.map((group) => (
                <CityActivitySection
                  key={group.cityId}
                  cityId={group.cityId}
                  cityName={group.cityName}
                  activities={group.activities}
                  becauseSights={bagCityIds.has(group.cityId)}
                />
              ))}
            </div>
          )}

          {pipelineActive ? (
            <StageFooter current="activities" continueLabel="Continue to Where to Stay →" />
          ) : null}
        </motion.div>
      </div>

      <TripBag
        mobileOpen={mobileTripOpen}
        onToggleMobile={() => setMobileTripOpen((v) => !v)}
      />
    </div>
  )
}

function CityActivitySection({
  cityId,
  cityName,
  activities,
  becauseSights,
}: {
  cityId: string
  cityName: string
  activities: RankedActivity[]
  becauseSights: boolean
}) {
  return (
    <section
      id={`activity-city-${cityId}`}
      className="scroll-mt-32 overflow-hidden rounded-[24px] border border-ink/8 bg-gradient-to-br from-paper via-paper to-cream/40 shadow-soft"
    >
      <div className="px-4 py-4 sm:px-5">
        <h2 className="font-serif text-[1.35rem] font-semibold text-ink">
          {becauseSights ? `Because You have Sights in ${cityName}` : cityName}
        </h2>
        <p className="mt-1 text-[0.8rem] text-muted">
          {activities.length} activit{activities.length === 1 ? 'y' : 'ies'}
        </p>
      </div>
      <div className="border-t border-ink/6 px-4 pb-4 pt-3 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} cityRank={activity.cityRank} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
