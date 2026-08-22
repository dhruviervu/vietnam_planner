import { useEffect, useMemo, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { useTripStore } from '../../store/tripStore'
import { getStayCity, STAY_CITIES } from './data/cities'
import { getClustersForCity } from './data/clusters'
import { getStaysForCluster } from './data/stays'
import { filterStaysByListing, rankClusters, rankStays } from './data/ranking'
import { LISTING_FILTER_CATEGORIES } from './data/labels'
import type {
  StayCityId,
  StayFilterId,
  StayListingFilterId,
  StaySortId,
} from './data/types'
import {
  collectTripBagStayItems,
  recommendClusterForBag,
  summarizeTripBagCities,
  unmappedBagPlaces,
} from './services/tripBagStayIntelligence'
import { StayHero } from './components/StayHero'
import { CitySelector } from './components/CitySelector'
import { FilterBar } from './components/FilterBar'
import { ClusterMap } from './components/ClusterMap'
import { ClusterPanel } from './components/ClusterPanel'
import { ClusterComparison } from './components/ClusterComparison'
import { StayGrid } from './components/StayGrid'
import { ListingFilterSidebar } from './components/ListingFilterSidebar'
import { TripBagStayContext } from './components/TripBagStayContext'

const DEFAULT_CITY: StayCityId = 'hanoi'

export function WhereToStayPage({ embedded = false }: { embedded?: boolean }) {
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)

  const bagItems = useMemo(
    () => collectTripBagStayItems(experienceIds, activityIds),
    [experienceIds, activityIds],
  )
  const bagCities = useMemo(() => summarizeTripBagCities(bagItems), [bagItems])
  const unmapped = useMemo(() => unmappedBagPlaces(bagItems), [bagItems])
  const bagFiltered = bagItems.length > 0 && bagCities.length > 0

  const visibleCities = useMemo(
    () =>
      bagFiltered
        ? STAY_CITIES.filter((c) => bagCities.some((b) => b.cityId === c.id))
        : STAY_CITIES,
    [bagFiltered, bagCities],
  )

  const initialCity =
    (bagFiltered ? bagCities[0]?.cityId : undefined) ??
    (visibleCities.some((c) => c.id === DEFAULT_CITY) ? DEFAULT_CITY : visibleCities[0]?.id) ??
    DEFAULT_CITY

  const [cityId, setCityId] = useState<StayCityId>(initialCity)
  const [filters, setFilters] = useState<StayFilterId[]>([])
  const [listingFilters, setListingFilters] = useState<StayListingFilterId[]>([])
  const [clusterId, setClusterId] = useState<string>(
    () => getStayCity(initialCity).defaultClusterId,
  )
  const [sort, setSort] = useState<StaySortId>('recommended')
  const [appliedBagRec, setAppliedBagRec] = useState(false)

  // Keep selected city inside the visible set when the bag changes
  useEffect(() => {
    if (!visibleCities.some((c) => c.id === cityId)) {
      const next = visibleCities[0]?.id ?? DEFAULT_CITY
      setCityId(next)
    }
  }, [visibleCities, cityId])

  const city = getStayCity(cityId)
  const clusters = useMemo(() => getClustersForCity(cityId), [cityId])
  const ranked = useMemo(() => rankClusters(clusters, filters), [clusters, filters])

  const cityBagItems = useMemo(
    () => bagItems.filter((i) => i.stayCityId === cityId),
    [bagItems, cityId],
  )

  const bagRecommendation = useMemo(
    () => (bagFiltered ? recommendClusterForBag(cityId, cityBagItems) : null),
    [bagFiltered, cityId, cityBagItems],
  )

  useEffect(() => {
    const nextCity = getStayCity(cityId)
    setFilters((prev) => prev.filter((f) => nextCity.availableFilters.includes(f)))
    setSort('recommended')
    setListingFilters([])
    setAppliedBagRec(false)
  }, [cityId])

  // Prefer trip-bag cluster recommendation when entering a city in bag mode
  useEffect(() => {
    if (!bagFiltered || !bagRecommendation || appliedBagRec) return
    setClusterId(bagRecommendation.cluster.id)
    setAppliedBagRec(true)
  }, [bagFiltered, bagRecommendation, appliedBagRec, cityId])

  const filterKey = filters.join('|')
  useEffect(() => {
    if (!filterKey) return
    if (bagFiltered && bagRecommendation) return
    const top = rankClusters(getClustersForCity(cityId), filters)[0]
    if (top) setClusterId(top.cluster.id)
  }, [filterKey, cityId, filters, bagFiltered, bagRecommendation])

  useEffect(() => {
    if (!ranked.some((r) => r.cluster.id === clusterId) && ranked[0]) {
      setClusterId(ranked[0].cluster.id)
    }
  }, [ranked, clusterId])

  const selectedRanked = ranked.find((r) => r.cluster.id === clusterId) ?? ranked[0]
  const selected = selectedRanked?.cluster ?? clusters[0]

  const recommendedClusterId =
    bagRecommendation?.cluster.id ??
    ranked.find((r) => r.match === 'recommended')?.cluster.id ??
    null
  const selectedIsRecommended = Boolean(
    selected && recommendedClusterId && selected.id === recommendedClusterId,
  )
  const recommendReasons =
    bagRecommendation && selectedIsRecommended ? bagRecommendation.reasons : []

  const stays = useMemo(() => {
    if (!selected) return []
    const list = getStaysForCluster(selected.id)
    const filtered = filterStaysByListing(list, listingFilters, LISTING_FILTER_CATEGORIES)
    return rankStays(filtered, sort, filters)
  }, [selected, sort, filters, listingFilters])

  function toggleFilter(id: StayFilterId) {
    setFilters((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleListingFilter(id: StayListingFilterId) {
    setListingFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function selectCluster(id: string) {
    setClusterId(id)
  }

  if (!selected) return null

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <StayHero />

        {bagFiltered && (
          <div className="mt-6">
            <TripBagStayContext
              cities={bagCities}
              totalBagItems={bagItems.length}
              unmappedCount={unmapped.length}
            />
          </div>
        )}

        {bagItems.length > 0 && bagCities.length === 0 && (
          <div className="mt-6 rounded-[18px] border border-ink/10 bg-cream/80 px-5 py-4">
            <p className="font-serif text-[1.2rem] font-semibold text-ink">
              Your picks are outside our stay-city map for now
            </p>
            <p className="mt-1 text-[0.9rem] text-muted">
              We’re showing all stay cities so you can still choose a base. Add plans in Hanoi, Hoi
              An, Da Nang, Hue, HCMC, Nha Trang, Da Lat or Phu Quoc to focus this page.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <CitySelector
            cityId={cityId}
            onChange={setCityId}
            cities={visibleCities}
            bagSummaries={bagCities}
            bagFiltered={bagFiltered}
          />

          <FilterBar
            available={city.availableFilters}
            selected={filters}
            onToggle={toggleFilter}
          />
        </div>

        <section className="mt-8">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Step 3 · Neighbourhoods
          </p>
          <h2 className="mt-1 font-serif text-[1.4rem] font-semibold text-ink">
            {city.id === 'hoi-an'
              ? 'Where to base yourself in Hoi An'
              : `Where to base yourself in ${city.label}`}
          </h2>
          <p className="mt-1 max-w-[62ch] text-[0.82rem] text-muted">
            {bagFiltered ? (
              <>
                We suggest a cluster from your trip bag — but you can open{' '}
                <span className="font-semibold text-ink">any neighbourhood</span> and browse stays
                across the city.
              </>
            ) : city.id === 'hoi-an' ? (
              <>
                Explore Hoi An on a real OpenStreetMap. Stay zones are{' '}
                <span className="font-semibold text-ink">curated overlays</span> — not official
                boundaries.
              </>
            ) : (
              <>
                Coloured areas are <span className="font-semibold text-ink">rough clusters</span>{' '}
                with <span className="font-semibold text-ink">rough cost-of-living estimates</span>{' '}
                — not exact property boundaries or live hotel prices.
              </>
            )}
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch">
            <div className="min-h-[420px] lg:h-[560px]">
              <ClusterMap
                city={city}
                ranked={ranked}
                selectedId={selected.id}
                onSelect={selectCluster}
              />
            </div>
            <div className="min-h-[420px] lg:h-[560px]">
              <ClusterPanel
                cluster={selected}
                match={
                  selectedIsRecommended
                    ? 'recommended'
                    : selectedRanked?.match ?? null
                }
                cityLabel={city.label}
                recommended={selectedIsRecommended}
                recommendReasons={recommendReasons}
              />
            </div>
          </div>
        </section>

        <div className="mt-5">
          <ClusterComparison
            cityLabel={city.label}
            cityImage={city.image}
            ranked={ranked}
            selectedId={selected.id}
            onSelect={selectCluster}
            recommendedId={recommendedClusterId}
          />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <ListingFilterSidebar
            selected={listingFilters}
            onToggle={toggleListingFilter}
            onClear={() => setListingFilters([])}
            sort={sort}
            onSort={setSort}
            resultCount={stays.length}
          />
          <StayGrid
            clusterName={selected.name}
            stays={stays}
            cityId={cityId}
            cityLabel={city.label}
          />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
