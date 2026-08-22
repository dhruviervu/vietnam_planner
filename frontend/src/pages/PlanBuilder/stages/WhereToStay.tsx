import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTripStore } from '../../../store/tripStore'
import { StageFooter } from '../components/StageFooter'
import { StayProgressPanel } from '../components/StayProgressPanel'
import { StayFilterPanel, StayFilterPanelBody } from '../components/StayFilterPanel'
import { VerticalTripProgress } from '../components/VerticalTripProgress'
import { StayCompareMiniPanelSlot } from '../components/StayCompareMiniPanel'
import { STAY_BASES, STAY_STYLE_OPTIONS } from '../data/stayBases'
import { formatTripContext } from '../services/recommendationEngine'
import {
  analyzeSelectedExperiences,
  applyStayFiltersAndSort,
  buildRoutePreview,
  describeRegionInsight,
  googleMapsStayUrl,
  meters,
  rankBases,
  rankHotelsForBase,
  recommendStartingPoint,
  scoreBase,
  styleInfluenceNote,
  suggestedPriceRange,
  suggestedStayNights,
  type ScoredHotel,
} from '../services/stayRecommendationEngine'
import { hotelImages } from '../data/hotels'
import { StayBag } from '../components/StayBag'
import { flyToStayBag } from '../lib/flyToStayBag'
import {
  DEFAULT_STAY_FILTERS,
  STAY_PRIORITY_OPTIONS,
  countActiveStayFilters,
  type StayFiltersState,
} from '../lib/stayFilters'
import {
  clearStayCompareRestoreFlag,
  loadStayCompareViewState,
  saveStayCompareViewState,
} from '../lib/stayCompareViewState'
import { startTripCompareSync } from '../lib/tripCompareSync'
import { stepPath } from '../steps'

type MobilePanel = 'none' | 'progress' | 'filters'

export function WhereToStay() {
  const basics = useTripStore((s) => s.basics)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const hotelIds = useTripStore((s) => s.selectedHotelIds)
  const toggleHotel = useTripStore((s) => s.toggleHotel)
  const comparisonStayIds = useTripStore((s) => s.comparisonStayIds)
  const toggleComparisonStay = useTripStore((s) => s.toggleComparisonStay)
  const startingPointBaseId = useTripStore((s) => s.startingPointBaseId)
  const preferredBaseId = useTripStore((s) => s.preferredBaseId)
  const stayStyle = useTripStore((s) => s.stayStyle)
  const setStartingPoint = useTripStore((s) => s.setStartingPoint)
  const setPreferredBase = useTripStore((s) => s.setPreferredBase)
  const setStayStyle = useTripStore((s) => s.setStayStyle)
  const mark = useTripStore((s) => s.markStepVisited)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)

  const [comparePanelVisible, setComparePanelVisible] = useState(true)
  const [mobileStayOpen, setMobileStayOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none')
  const [progressHovered, setProgressHovered] = useState(false)
  const [areaPickerOpen, setAreaPickerOpen] = useState(false)
  const [filters, setFilters] = useState<StayFiltersState>(() => {
    const range = suggestedPriceRange(basics)
    return { ...DEFAULT_STAY_FILTERS, priceMin: range.min, priceMax: range.max }
  })

  useEffect(() => {
    mark('stay')
    startTripCompareSync()
    // Migrate legacy session compare ids into central store once
    const saved = loadStayCompareViewState()
    if (
      saved?.compareIds?.length &&
      useTripStore.getState().comparisonStayIds.length === 0
    ) {
      saved.compareIds.slice(0, 8).forEach((id) => {
        if (!useTripStore.getState().comparisonStayIds.includes(id)) {
          useTripStore.getState().toggleComparisonStay(id)
        }
      })
    }
  }, [mark])

  // Restore scroll after "Compare more"
  useEffect(() => {
    const saved = loadStayCompareViewState()
    if (!saved?.restoreScroll) return
    const y = saved.scrollY ?? 0
    const restore = () => {
      window.scrollTo({ top: y, behavior: 'auto' })
      clearStayCompareRestoreFlag()
      setComparePanelVisible(true)
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(restore)
    })
  }, [])

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.type !== 'stay-compare-more') return
      const saved = loadStayCompareViewState()
      window.scrollTo({ top: saved?.scrollY ?? 0, behavior: 'auto' })
      clearStayCompareRestoreFlag()
      setComparePanelVisible(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Re-show mini-panel when selection changes (unless user only closed empty)
  useEffect(() => {
    if (comparisonStayIds.length > 0) setComparePanelVisible(true)
    saveStayCompareViewState({
      compareIds: comparisonStayIds,
      scrollY: window.scrollY,
      restoreScroll: false,
    })
  }, [comparisonStayIds])

  const contextParts = useMemo(() => formatTripContext(basics), [basics])
  const analysis = useMemo(() => analyzeSelectedExperiences(selectedIds), [selectedIds])
  const starting = useMemo(() => recommendStartingPoint(selectedIds), [selectedIds])
  const rankedBases = useMemo(
    () => rankBases(basics, selectedIds, stayStyle),
    [basics, selectedIds, stayStyle],
  )

  const tripBagRegions = useMemo(
    () => analysis.byRegion.map(([region, count]) => ({ region, count })),
    [analysis.byRegion],
  )

  const allRegions = useMemo(
    () => [...new Set(STAY_BASES.map((b) => b.region))].sort(),
    [],
  )

  const regionChoices =
    selectedIds.length > 0
      ? tripBagRegions.map((r) => r.region)
      : allRegions

  function pickRegion(region: string) {
    const base =
      rankedBases.find((b) => b.base.region === region)?.base ??
      STAY_BASES.find((b) => b.region === region && b.arrivalHub) ??
      STAY_BASES.find((b) => b.region === region)
    if (!base) return
    setPreferredBase(base.id)
    setStartingPoint(base.id)
    setAreaPickerOpen(false)
  }

  const activeBaseId =
    preferredBaseId ?? startingPointBaseId ?? rankedBases[0]?.base.id ?? STAY_BASES[0]?.id ?? null
  const activeBase = rankedBases.find((b) => b.base.id === activeBaseId)?.base
    ?? STAY_BASES.find((b) => b.id === activeBaseId)
    ?? null
  const activeScored = useMemo(() => {
    if (!activeBase) return null
    const fromRanked = rankedBases.find((b) => b.base.id === activeBase.id)
    if (fromRanked) return fromRanked
    const scored = scoreBase(activeBase, basics, selectedIds, stayStyle)
    return { base: activeBase, ...scored }
  }, [activeBase, rankedBases, basics, selectedIds, stayStyle])

  const activeRegion = activeBase?.region ?? null
  const suggestedRegion = starting?.base.region ?? null
  const regionInsight = useMemo(() => {
    if (!activeRegion) return null
    return describeRegionInsight(activeRegion, selectedIds, suggestedRegion)
  }, [activeRegion, selectedIds, suggestedRegion])

  const route = useMemo(
    () => buildRoutePreview(selectedIds, activeRegion),
    [selectedIds, activeRegion],
  )

  const stayHint = useMemo(
    () => suggestedStayNights(basics, selectedIds, activeBase),
    [basics, selectedIds, activeBase],
  )

  const rankedHotels = useMemo(() => {
    if (!activeBaseId) return []
    return rankHotelsForBase(activeBaseId, basics, selectedIds, stayStyle, stayHint.nights)
  }, [activeBaseId, basics, selectedIds, stayStyle, stayHint.nights])

  const hotels = useMemo(
    () => applyStayFiltersAndSort(rankedHotels, filters, selectedIds.length > 0),
    [rankedHotels, filters, selectedIds.length],
  )

  const ourPick = rankedHotels[0] ?? null
  const styleNote = styleInfluenceNote(stayStyle, basics.travelStyle)
  const activeFilterCount = countActiveStayFilters(filters)
  const filterExplanation =
    STAY_PRIORITY_OPTIONS.find((o) => o.id === filters.priority)?.explanation ?? null

  const filtersExpanded = pipelineActive ? !progressHovered : true
  const progressExpanded = pipelineActive && progressHovered

  function openMobile(mode: Exclude<MobilePanel, 'none'>) {
    setMobilePanel((prev) => (prev === mode ? 'none' : mode))
  }

  function clearFilters() {
    const range = suggestedPriceRange(basics)
    setFilters({ ...DEFAULT_STAY_FILTERS, priceMin: range.min, priceMax: range.max })
  }

  function onToggleCompare(id: string) {
    toggleComparisonStay(id)
    setComparePanelVisible(true)
  }

  const compareHint =
    comparisonStayIds.length === 1
      ? 'Select at least one more stay to open comparison.'
      : comparisonStayIds.length >= 8
        ? 'You can compare up to 8 stays at a time.'
        : null

  const catalogCols = filtersExpanded
    ? 'grid gap-4 sm:grid-cols-1 md:grid-cols-2'
    : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'

  const regionExperiences = analysis.selected.filter((e) => e.region === activeRegion)
  const emptyBagSights = activeBase?.sampleNearby ?? []

  const compareFooter: ReactNode = (
    <StayCompareMiniPanelSlot
      visible={comparePanelVisible}
      onClose={() => setComparePanelVisible(false)}
    />
  )

  return (
    <div className="relative flex pb-28 xl:pb-0">
      {/* Desktop: filters expanded by default; progress expands on hover */}
      <div className="sticky top-[72px] z-20 hidden shrink-0 self-start lg:flex">
        {pipelineActive ? (
          <div
            onMouseEnter={() => setProgressHovered(true)}
            onMouseLeave={() => setProgressHovered(false)}
          >
            <StayProgressPanel expanded={progressExpanded} />
          </div>
        ) : null}
        <StayFilterPanel
          expanded={filtersExpanded}
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          hasExperiences={selectedIds.length > 0}
        />
      </div>

      {/* Mobile Pipeline / Filters */}
      <div className="fixed inset-x-0 bottom-[4.6rem] z-30 flex justify-center gap-2 px-3 lg:hidden">
        {pipelineActive ? (
          <button
            type="button"
            onClick={() => openMobile('progress')}
            className={`rounded-full px-4 py-2.5 text-[0.8rem] font-bold shadow-card ${
              mobilePanel === 'progress' ? 'bg-ink text-paper' : 'bg-paper text-ink'
            }`}
          >
            Pipeline
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => openMobile('filters')}
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
            transition={{ duration: 0.28 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
                Itinerary progress
              </p>
              <button type="button" onClick={() => setMobilePanel('none')} className="text-muted">
                ✕
              </button>
            </div>
            <VerticalTripProgress current="stay" />
          </motion.aside>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobilePanel === 'filters' && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-[min(92vw,360px)] overflow-y-auto bg-paper p-5 shadow-hero lg:hidden"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink">
                Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
              </p>
              <button type="button" onClick={() => setMobilePanel('none')} className="text-muted">
                ✕
              </button>
            </div>
            <StayFilterPanelBody
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
              hasExperiences={selectedIds.length > 0}
            />
          </motion.aside>
        )}
      </AnimatePresence>

    <div className="min-w-0 flex-1 xl:flex xl:gap-6 xl:pr-[clamp(1.1rem,4vw,2rem)] xl:pt-6">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 flex-1 px-[clamp(1.1rem,4vw,2rem)] py-6 pb-8 lg:py-8 xl:pr-0 xl:pt-2"
    >
      <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
        Stage 3 · Where to stay
      </p>
      <h1 className="font-serif text-[clamp(1.85rem,3.8vw,2.7rem)] font-semibold leading-[1.12] text-ink">
        Where You Stay Shapes Your Trip
      </h1>
      <p className="mt-2 max-w-[54ch] text-[0.98rem] text-muted">
        Lodging is chosen around what you want to see — the places in your Trip Bag — so
        mornings start closer to your plans, not farther away.
      </p>

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

      {selectedIds.length === 0 && (
        <section className="mt-8 rounded-[22px] border border-ink/6 bg-cream/80 p-5">
          <h2 className="font-serif text-[1.35rem] font-semibold text-ink">Still exploring?</h2>
          <p className="mt-1 text-[0.92rem] text-muted">
            Pick any region below to browse stays freely. Once your Trip Bag has experiences,
            we&apos;ll explain which region fits best — and show distances to each place.
          </p>
          <Link
            to={stepPath('experiences')}
            className="mt-3 inline-block text-[0.88rem] font-bold text-terracotta hover:underline"
          >
            Or add experiences first →
          </Link>
        </section>
      )}

      {selectedIds.length > 0 && analysis.concentrationNote && (
        <section className="mt-8">
          <h2 className="font-serif text-[1.4rem] font-semibold text-ink">
            Your Experiences Point To…
          </h2>
          <p className="mt-2 max-w-[52ch] text-[0.95rem] text-muted">{analysis.concentrationNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.byRegion.slice(0, 4).map(([region, count]) => (
              <span
                key={region}
                className="rounded-full bg-paper px-3 py-1.5 text-[0.78rem] font-bold text-ink shadow-soft"
              >
                {region} · {count}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Starting region — always reflects the selected / active region */}
      <section className="mt-10">
        <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
          Recommended Starting Region
        </h2>
        <p className="mt-1 max-w-[54ch] text-[0.9rem] text-muted">
          We suggest a region from your Trip Bag cluster — changing region updates this card,
          the route preview, and the stays below.
        </p>

        {activeBase && regionInsight && (
          <div
            className={`mt-4 overflow-hidden rounded-[24px] bg-paper shadow-card ${
              regionInsight.warning ? 'ring-1 ring-terracotta/30' : ''
            }`}
          >
            <div className="grid md:grid-cols-[1.1fr_1fr]">
              <img
                src={activeBase.images[0]}
                alt=""
                className="aspect-[16/11] h-full w-full object-cover md:aspect-auto md:min-h-[240px]"
              />
              <div className="p-5">
                <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">
                  {regionInsight.badge}
                </p>
                <h3 className="mt-1 font-serif text-[1.7rem] font-semibold text-ink">
                  {activeBase.region}
                </h3>
                <p className="text-[0.9rem] font-semibold text-terracotta">
                  {activeBase.city} · {activeBase.name}
                </p>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
                  {regionInsight.why}
                </p>

                {regionInsight.tradeoffs.length > 0 && (
                  <div className="mt-3 rounded-2xl bg-cream/90 px-3.5 py-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wide text-terracotta">
                      Tradeoffs to know
                    </p>
                    <ul className="mt-1.5 space-y-1 text-[0.82rem] text-muted">
                      {regionInsight.tradeoffs.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedIds.length > 0 && regionInsight.bagCount === 0 && (
                  <p className="mt-3 rounded-2xl bg-terracotta/10 px-3.5 py-2.5 text-[0.85rem] font-semibold text-ink">
                    Heads-up: your Trip Bag has no experiences in {activeBase.region}. Stays here
                    won&apos;t sit next to your saved plans unless you add places in this region
                    or switch back.
                  </p>
                )}

                {regionExperiences.length > 0 && (
                  <p className="mt-3 text-[0.8rem] text-sage">
                    Trip Bag here:{' '}
                    {regionExperiences
                      .slice(0, 4)
                      .map((e) => e.name)
                      .join(' · ')}
                    {regionExperiences.length > 4 ? ` · +${regionExperiences.length - 4}` : ''}
                  </p>
                )}

                {selectedIds.length === 0 && emptyBagSights.length > 0 && (
                  <div className="mt-3 rounded-2xl bg-cream px-3.5 py-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wide text-sage">
                      Sights nearby in this area
                    </p>
                    <p className="mt-1 text-[0.85rem] text-muted">
                      {emptyBagSights.join(' · ')}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-muted">
                      Add experiences to your Trip Bag to personalize distances and fit.
                    </p>
                  </div>
                )}

                {suggestedRegion &&
                  suggestedRegion !== activeRegion &&
                  selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => pickRegion(suggestedRegion)}
                      className="mt-4 text-[0.82rem] font-bold text-terracotta hover:underline"
                    >
                      Back to suggested region ({suggestedRegion}) →
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
            {selectedIds.length > 0
              ? 'Change region (from your Trip Bag)'
              : 'Choose any region to browse'}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {regionChoices.map((region) => {
              const count = tripBagRegions.find((r) => r.region === region)?.count
              const active = activeRegion === region
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => pickRegion(region)}
                  className={`rounded-full px-3.5 py-2 text-[0.82rem] font-bold transition-colors ${
                    active ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream-deep'
                  }`}
                >
                  {region}
                  {count != null ? ` · ${count}` : ''}
                </button>
              )
            })}
          </div>
          {selectedIds.length > 0 && tripBagRegions.length < allRegions.length && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[0.82rem] font-bold text-terracotta">
                Browse a region outside your Trip Bag
              </summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {allRegions
                  .filter((r) => !regionChoices.includes(r))
                  .map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => pickRegion(region)}
                      className={`rounded-full px-3.5 py-2 text-[0.82rem] font-bold ${
                        activeRegion === region
                          ? 'bg-ink text-paper'
                          : 'bg-paper text-ink shadow-soft'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
              </div>
            </details>
          )}
        </div>
      </section>

      {/* Route preview — follows selected start region */}
      {route && (
        <section className="mt-10">
          <h2 className="font-serif text-[1.35rem] font-semibold text-ink">Natural route preview</h2>
          <p className="mt-1 text-[0.88rem] text-muted">{route.label}</p>
          {selectedIds.length > 0 &&
            activeRegion &&
            !tripBagRegions.some((r) => r.region === activeRegion) && (
              <p className="mt-2 rounded-2xl bg-cream px-3.5 py-2.5 text-[0.85rem] text-muted">
                Your start ({activeRegion}) is outside the Trip Bag cluster — the path below
                reconnects toward regions where you already have places saved.
              </p>
            )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink px-3 py-1 text-[0.72rem] font-bold text-paper">
              START
            </span>
            {route.stops.map((stop, i) => (
              <div key={`${stop}-${i}`} className="flex items-center gap-2">
                {i > 0 && <span className="text-terracotta">↓</span>}
                <span
                  className={`rounded-full px-3.5 py-1.5 text-[0.85rem] font-bold ${
                    i === 0 ? 'bg-terracotta text-paper' : 'bg-cream text-ink'
                  }`}
                >
                  {stop}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stay style */}
      <section className="mt-10">
        <h2 className="font-serif text-[1.4rem] font-semibold text-ink">
          What kind of base sounds right?
        </h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STAY_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStayStyle(stayStyle === opt.id ? null : opt.id)}
              className={`min-w-[132px] shrink-0 rounded-2xl px-3.5 py-3 text-left transition-colors ${
                stayStyle === opt.id ? 'bg-ink text-paper' : 'bg-paper text-ink shadow-soft'
              }`}
            >
              <p className="text-[1.1rem]">{opt.emoji}</p>
              <p className="mt-1 text-[0.88rem] font-bold">{opt.title}</p>
              <p
                className={`mt-0.5 text-[0.75rem] ${stayStyle === opt.id ? 'text-paper/75' : 'text-muted'}`}
              >
                {opt.line}
              </p>
            </button>
          ))}
        </div>
        {styleNote && <p className="mt-3 text-[0.85rem] text-muted">{styleNote}</p>}
      </section>

      {/* Recommended stays */}
      <section className="mt-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
              Recommended stays in this area
            </h2>
            <p className="mt-1 max-w-[54ch] text-[0.9rem] text-muted">
              {selectedIds.length === 0
                ? activeRegion
                  ? `Browsing ${activeRegion} — nearby sights are area highlights until your Trip Bag has places.`
                  : 'Pick an area to browse stays.'
                : activeRegion
                  ? `Stays near the places you want to visit in ${activeRegion}. Distances are to Trip Bag experiences in this region.`
                  : 'Stays matched to your current region.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAreaPickerOpen((v) => !v)}
            className="rounded-full border border-ink/12 bg-paper px-4 py-2 text-[0.82rem] font-bold text-ink shadow-soft"
          >
            {areaPickerOpen ? 'Hide areas' : 'Change area'}
          </button>
        </div>

        <AnimatePresence>
          {areaPickerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="rounded-[20px] bg-cream/80 p-3.5">
                <p className="text-[0.72rem] font-bold uppercase tracking-wide text-muted">
                  All areas
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {allRegions.map((region) => {
                    const count = tripBagRegions.find((r) => r.region === region)?.count
                    const active = activeRegion === region
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => pickRegion(region)}
                        className={`rounded-full px-3.5 py-2 text-[0.82rem] font-bold ${
                          active ? 'bg-ink text-paper' : 'bg-paper text-ink shadow-soft'
                        }`}
                      >
                        {region}
                        {selectedIds.length > 0
                          ? count
                            ? ` · ${count}`
                            : ' · 0 in bag'
                          : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedIds.length > 0 && regionInsight?.bagCount === 0 && activeRegion && (
          <p className="mt-3 rounded-2xl bg-terracotta/10 px-3.5 py-2.5 text-[0.85rem] text-ink">
            No Trip Bag experiences in <span className="font-bold">{activeRegion}</span> — you can
            still browse stays here, but they won&apos;t sit next to your saved plans. Switch area
            or add experiences in this region for clearer proximity.
          </p>
        )}

        {selectedIds.length === 0 && emptyBagSights.length > 0 && (
          <p className="mt-3 rounded-2xl bg-cream/80 px-3.5 py-2.5 text-[0.85rem] text-muted">
            Nearby in this area: {emptyBagSights.join(' · ')}
          </p>
        )}

        {filterExplanation && (
          <p className="mt-3 rounded-2xl bg-cream/80 px-3.5 py-2.5 text-[0.85rem] text-ink">
            {filterExplanation}
          </p>
        )}
        {!filterExplanation && filters.proximity !== 'any' && selectedIds.length > 0 && (
          <p className="mt-3 rounded-2xl bg-cream/80 px-3.5 py-2.5 text-[0.85rem] text-ink">
            Showing stays within your selected proximity to Trip Bag experiences.
          </p>
        )}

        <div className="mt-4 mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.88rem] text-muted">
            {hotels.length} stay{hotels.length === 1 ? '' : 's'}
            {activeBase ? ` · ${activeBase.name}, ${activeBase.city}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[0.8rem] font-bold text-terracotta hover:underline"
              >
                Clear filters
              </button>
            )}
            {comparisonStayIds.length > 0 && (
              <button
                type="button"
                onClick={() => setComparePanelVisible(true)}
                className={`rounded-full px-4 py-2 text-[0.82rem] font-bold ${
                  comparisonStayIds.length >= 2
                    ? 'bg-sage/15 text-sage'
                    : 'bg-terracotta/10 text-terracotta'
                }`}
              >
                {comparisonStayIds.length === 1
                  ? '1 in compare · pick one more'
                  : `${comparisonStayIds.length} in compare`}
              </button>
            )}
            {!comparePanelVisible && (
              <button
                type="button"
                onClick={() => setComparePanelVisible(true)}
                className="text-[0.78rem] font-bold text-muted hover:text-ink"
              >
                Show compare panel
              </button>
            )}
          </div>
        </div>

        {compareHint && (
          <p className="mb-3 rounded-2xl border border-terracotta/25 bg-terracotta/8 px-3.5 py-2.5 text-[0.85rem] text-ink xl:hidden">
            {compareHint}
          </p>
        )}

        <div id="stay-compare-anchor" className={catalogCols}>
          {hotels.map((hotel) => (
            <PropertyCard
              key={hotel.id}
              hotel={hotel}
              selected={hotelIds.includes(hotel.id)}
              comparing={comparisonStayIds.includes(hotel.id)}
              onToggle={() => toggleHotel(hotel.id)}
              onCompare={() => onToggleCompare(hotel.id)}
              durationKnown={basics.durationKnown}
              experienceNames={
                selectedIds.length > 0
                  ? analysis.selected
                      .filter((e) => e.region === hotel.region)
                      .map((e) => e.name)
                  : emptyBagSights
              }
            />
          ))}
        </div>
        {hotels.length === 0 && (
          <p className="mt-4 text-[0.92rem] text-muted">
            No stays match these filters in this region. Try widening price or proximity.
          </p>
        )}
      </section>

      {/* Recommended base detail */}
      {activeBase && activeScored && (
        <section className="mt-10 rounded-[24px] border border-ink/6 bg-paper p-5 shadow-soft sm:p-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">
            Why this area works
          </p>
          <h2 className="mt-1 font-serif text-[1.6rem] font-semibold text-ink">
            {activeBase.city}
          </h2>
          <p className="font-semibold text-terracotta">{activeBase.name}</p>
          <p className="mt-1 text-[0.9rem] text-muted">
            Explained from your Trip Bag, transport, and stay style — not a random pick.
          </p>

          <p className="mt-4 text-[1.05rem] font-bold text-ink">
            Trip Fit {activeScored.score}%
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <MeterRow label="Location" level={activeBase.experienceDensity} />
            <MeterRow label="Selected experiences nearby" level={Math.min(5, activeScored.nearbyCount + 1)} />
            <MeterRow label="Transport" level={activeBase.transportScore} />
            <MeterRow label="Food access" level={activeBase.foodAccessScore} />
            <MeterRow
              label="Cost"
              level={Math.max(1, 6 - Math.ceil(activeBase.typicalNightlyMax / 40))}
            />
          </div>
          <ul className="mt-4 space-y-1 text-[0.88rem] text-muted">
            {activeScored.reasons.map((r) => (
              <li key={r}>✓ {r}</li>
            ))}
          </ul>

          <div className="mt-5 rounded-2xl bg-cream px-4 py-3">
            <p className="text-[0.72rem] font-bold uppercase tracking-wide text-muted">
              Suggested stay length
            </p>
            <p className="font-serif text-[1.2rem] font-semibold text-ink">{stayHint.label}</p>
            <p className="mt-1 text-[0.85rem] text-muted">{stayHint.note}</p>
          </div>
        </section>
      )}

      {/* Base options tradeoffs */}
      {activeBase && (
        <section className="mt-10">
          <h2 className="font-serif text-[1.35rem] font-semibold text-ink">Neighborhoods in this region</h2>
          <p className="mt-1 text-[0.88rem] text-muted">
            Same region, different vibe — pick a pocket that matches how you want evenings to feel.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rankedBases
              .filter((b) => b.base.region === activeBase.region || b.base.id === activeBase.id)
              .slice(0, 4)
              .map(({ base }) => (
                <button
                  key={base.id}
                  type="button"
                  onClick={() => setPreferredBase(base.id)}
                  className={`rounded-2xl p-4 text-left transition-shadow ${
                    preferredBaseId === base.id || activeBaseId === base.id
                      ? 'bg-ink text-paper shadow-card'
                      : 'bg-cream text-ink hover:shadow-soft'
                  }`}
                >
                  <p className="text-[0.72rem] font-bold uppercase tracking-wide opacity-70">
                    {base.styleTags[0]?.toUpperCase() ?? 'AREA'}
                  </p>
                  <p className="mt-1 font-serif text-[1.15rem] font-semibold">{base.name}</p>
                  <p
                    className={`mt-2 text-[1.15rem] font-bold ${
                      preferredBaseId === base.id || activeBaseId === base.id
                        ? 'text-paper'
                        : 'text-ink'
                    }`}
                  >
                    ${base.typicalNightlyMin}–${base.typicalNightlyMax}
                    <span className="ml-1 text-[0.72rem] font-bold opacity-70">/ night</span>
                  </p>
                  <p
                    className={`mt-2 text-[0.8rem] ${
                      preferredBaseId === base.id || activeBaseId === base.id
                        ? 'text-paper/80'
                        : 'text-muted'
                    }`}
                  >
                    Best for: {base.bestFor.join(' · ')}
                  </p>
                  <p
                    className={`mt-1 text-[0.8rem] ${
                      preferredBaseId === base.id || activeBaseId === base.id
                        ? 'text-paper/70'
                        : 'text-muted'
                    }`}
                  >
                    Tradeoff: {base.tradeoff}
                  </p>
                </button>
              ))}
          </div>
        </section>
      )}

      {/* Our pick */}
      {ourPick && (
        <section className="mt-10">
          <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Our Pick</h2>
          <PropertyFeatured
            hotel={ourPick}
            selected={hotelIds.includes(ourPick.id)}
            onToggle={() => toggleHotel(ourPick.id)}
            durationKnown={basics.durationKnown}
            experienceNames={analysis.selected
              .filter((e) => e.region === ourPick.region)
              .map((e) => e.name)}
          />
        </section>
      )}

      <StageFooter current="stay" continueLabel="Continue to Food →" />

      {/* Mobile compare mini-panel */}
      <div className="fixed inset-x-3 bottom-[5.5rem] z-40 xl:hidden">
        <StayCompareMiniPanelSlot
          visible={comparePanelVisible}
          onClose={() => setComparePanelVisible(false)}
        />
      </div>
    </motion.div>

    <StayBag
      mobileOpen={mobileStayOpen}
      onToggleMobile={() => setMobileStayOpen((v) => !v)}
      footer={compareFooter}
    />
    </div>
    </div>
  )
}

function MeterRow({ label, level }: { label: string; level: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2">
      <span className="text-[0.78rem] font-semibold text-ink">{label}</span>
      <span className="tracking-widest text-terracotta">{meters(level)}</span>
    </div>
  )
}

function PropertyFeatured({
  hotel,
  selected,
  onToggle,
  durationKnown,
  experienceNames,
}: {
  hotel: ScoredHotel
  selected: boolean
  onToggle: () => void
  durationKnown: boolean
  experienceNames: string[]
}) {
  const [addedFlash, setAddedFlash] = useState(false)
  const [showDistances, setShowDistances] = useState(false)
  const imgs = hotelImages(hotel)
  const priceLabel = hotel.priceType === 'per_room' ? 'per room / night' : 'per night'

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    if (!selected) {
      const wrap = e.currentTarget.closest('.stay-pick') as HTMLElement | null
      const img = wrap?.querySelector('img')
      const rect = (img ?? e.currentTarget).getBoundingClientRect()
      flyToStayBag(rect, imgs[0])
      setAddedFlash(true)
      window.setTimeout(() => setAddedFlash(false), 1800)
    }
    onToggle()
  }

  return (
    <div className="stay-pick mt-4 overflow-hidden rounded-[24px] bg-paper shadow-card">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        <img src={imgs[0]} alt="" className="aspect-[16/11] w-full object-cover lg:aspect-auto lg:min-h-[280px]" />
        <div className="p-5">
          <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">Our pick</p>
          <h3 className="mt-1 font-serif text-[1.5rem] font-semibold text-ink">{hotel.name}</h3>
          <p className="text-[0.85rem] font-bold text-terracotta">
            {hotel.neighborhood} · {hotel.city}
          </p>
          <p className="mt-2 text-[0.95rem] font-bold text-ink">{hotel.tripFit}% fit for your trip</p>
          <p className="mt-1 text-[0.85rem] text-muted">
            ⭐ {hotel.rating} · {(hotel.reviewCount ?? 0).toLocaleString()} reviews
          </p>
          <p className="mt-4 font-serif text-[2rem] font-semibold leading-none text-ink">
            ${hotel.pricePerNight}
          </p>
          <p className="mt-1 text-[0.82rem] font-bold uppercase tracking-wide text-muted">
            {priceLabel}
          </p>
          {hotel.totalEstimate != null ? (
            <p className="mt-1 text-[0.88rem] text-muted">
              ${hotel.totalEstimate} for {hotel.stayNights} nights
            </p>
          ) : (
            <p className="mt-1 text-[0.88rem] text-muted">
              Your total will depend on your final stay length.
            </p>
          )}
          {!durationKnown && hotel.totalEstimate != null && (
            <p className="text-[0.75rem] text-muted">Estimate based on a natural stay length.</p>
          )}
          <p className="mt-2 text-[0.82rem] font-semibold text-sage">
            Trip efficiency {hotel.efficiency}%
          </p>
          {hotel.nearbyExperiences.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDistances((v) => !v)}
                className="text-[0.8rem] font-bold text-terracotta hover:underline"
              >
                {showDistances ? 'Hide' : 'Show'} distances to Trip Bag places
              </button>
              <AnimatePresence>
                {showDistances && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-1 overflow-hidden text-[0.82rem] text-muted"
                  >
                    {hotel.nearbyExperiences.map((e) => (
                      <li key={e.id}>
                        {e.name} · ~{e.km} km
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}
          <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-wide text-muted">
            Why it fits
          </p>
          <ul className="mt-1 space-y-1 text-[0.85rem] text-muted">
            {hotel.fitReasons.map((r) => (
              <li key={r}>✓ {r}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className={`rounded-full px-5 py-2.5 text-[0.88rem] font-bold ${
                selected ? 'bg-sage text-paper' : 'btn-solid border-0'
              }`}
            >
              {addedFlash
                ? 'Added to your Stay Bag'
                : selected
                  ? '✓ Added'
                  : '+ Add to Stay Bag'}
            </button>
            <a
              href={googleMapsStayUrl(hotel, experienceNames)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ink px-4 py-2.5 text-[0.86rem] font-bold text-paper"
            >
              See on Google Maps →
            </a>
            <a
              href={hotel.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink/12 px-4 py-2.5 text-[0.86rem] font-bold text-ink"
            >
              See More →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function PropertyCard({
  hotel,
  selected,
  comparing,
  onToggle,
  onCompare,
  durationKnown,
  experienceNames,
}: {
  hotel: ScoredHotel
  selected: boolean
  comparing: boolean
  onToggle: () => void
  onCompare: () => void
  durationKnown: boolean
  experienceNames: string[]
}) {
  const [slide, setSlide] = useState(0)
  const [flash, setFlash] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [showDistances, setShowDistances] = useState(false)
  const imgs = hotelImages(hotel)
  const priceLabel = hotel.priceType === 'per_room' ? 'per room / night' : 'per night'

  useEffect(() => {
    if (imgs.length <= 1) return
    const id = window.setInterval(() => setSlide((s) => (s + 1) % imgs.length), 4500)
    return () => window.clearInterval(id)
  }, [imgs.length])

  function stop(e: MouseEvent) {
    e.stopPropagation()
  }

  function openDetail() {
    window.open(hotel.sourceUrl, '_blank', 'noreferrer')
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDetail()
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-[22px] bg-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-[5/3.2] overflow-hidden">
        {imgs.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${hotel.name} photo ${i + 1}`}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
            style={{ opacity: i === slide ? 1 : 0 }}
            loading="lazy"
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-paper/92 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-ink backdrop-blur-sm">
          {hotel.tripFit}% fit
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-ink/45 px-2 py-1 text-[0.68rem] font-bold text-paper backdrop-blur-sm">
          {slide + 1}/{imgs.length}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-serif text-[1.2rem] font-semibold leading-tight text-ink">
          {hotel.name}
        </h3>
        <p className="mt-1 text-[0.76rem] font-bold uppercase tracking-wide text-terracotta">
          📍 {hotel.neighborhood} · {hotel.city}
        </p>
        <p className="mt-2 text-[0.9rem] leading-snug text-muted">
          {hotel.reason ?? hotel.blurb}
        </p>

        <div className="mt-4 rounded-2xl bg-cream px-3.5 py-3">
          <p className="font-serif text-[1.85rem] font-semibold leading-none text-ink">
            ${hotel.pricePerNight}
          </p>
          <p className="mt-1 text-[0.72rem] font-bold uppercase tracking-wide text-muted">
            {priceLabel}
          </p>
          {hotel.totalEstimate != null && (
            <p className="mt-1 text-[0.8rem] font-semibold text-ink">
              ${hotel.totalEstimate} for {hotel.stayNights} nights
            </p>
          )}
          {!durationKnown && hotel.totalEstimate != null && (
            <p className="text-[0.7rem] text-muted">Using a suggested stay length.</p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Fact label="Rating" value={`⭐ ${hotel.rating}`} />
          <Fact
            label="Nearby avg"
            value={hotel.nearbyCount > 0 ? `${hotel.avgDistanceKm} km` : '—'}
          />
        </div>

        <div
          className="mt-3 rounded-xl border border-ink/6 bg-cream/70 px-3 py-2.5"
          onClick={stop}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.82rem] font-bold text-ink">{hotel.tripFit}% fit for your trip</p>
            <button
              type="button"
              onClick={() => setShowWhy((v) => !v)}
              className="text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              Why?
            </button>
          </div>
          <AnimatePresence>
            {showWhy && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden text-[0.78rem] text-muted"
              >
                {hotel.fitReasons.map((r) => (
                  <li key={r}>✓ {r}</li>
                ))}
                <li>✓ {hotel.valueNote}</li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3" onClick={stop}>
          {hotel.nearbyExperiences.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setShowDistances((v) => !v)}
                className="text-[0.8rem] font-bold text-terracotta hover:underline"
              >
                {showDistances ? 'Hide' : 'Show'} distances to Trip Bag places (
                {hotel.nearbyExperiences.length})
              </button>
              <AnimatePresence>
                {showDistances && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-1 overflow-hidden rounded-xl bg-cream/80 px-3 py-2 text-[0.78rem] text-muted"
                  >
                    {hotel.nearbyExperiences.map((e) => (
                      <li key={e.id} className="flex justify-between gap-2">
                        <span>{e.name}</span>
                        <span className="font-bold text-ink">~{e.km} km</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          ) : (
            <p className="text-[0.78rem] text-muted">
              No Trip Bag places in this region yet — distances appear once you add some.
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2" onClick={stop}>
          <button
            type="button"
            onClick={(e) => {
              if (!selected) {
                const article = e.currentTarget.closest('article')
                const img = article?.querySelector('img')
                const rect = (img ?? e.currentTarget).getBoundingClientRect()
                flyToStayBag(rect, imgs[0])
                setFlash(true)
                window.setTimeout(() => setFlash(false), 1600)
              }
              onToggle()
            }}
            className={`rounded-full px-4 py-2 text-[0.84rem] font-bold ${
              selected
                ? 'bg-sage text-paper'
                : 'bg-gradient-to-br from-terracotta to-terracotta-deep text-paper'
            }`}
          >
            {flash ? 'Added to your Stay Bag' : selected ? '✓ Added' : '+ Add to Stay Bag'}
          </button>
          <a
            href={googleMapsStayUrl(hotel, experienceNames)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-ink px-3.5 py-2 text-[0.8rem] font-bold text-paper"
          >
            See on Google Maps →
          </a>
          <a
            href={hotel.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ink/12 px-3 py-2 text-[0.8rem] font-bold text-ink"
          >
            See More →
          </a>
          <button
            type="button"
            onClick={onCompare}
            className={`rounded-full border px-3 py-2 text-[0.8rem] font-bold ${
              comparing ? 'border-ink bg-ink text-paper' : 'border-ink/12 text-muted'
            }`}
          >
            {comparing ? 'In Compare' : 'Compare'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function Fact({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl bg-cream px-2.5 py-2">
      <p className="text-[0.6rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[0.82rem] font-semibold text-ink">{value}</p>
      {sub && <p className="text-[0.68rem] text-muted">{sub}</p>}
    </div>
  )
}

