import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTripStore } from '../../../store/tripStore'
import { STAY_CITIES } from '../data/cities'
import { getClusterById, getClustersForCity } from '../data/clusters'
import { LISTING_FILTER_CATEGORIES } from '../data/labels'
import { filterStaysByListing, rankStays } from '../data/ranking'
import { getAllStays, getStaysForCity, isAttractionStayName } from '../data/stays'
import type { StayCityId, StayCluster, StayListingFilterId, StayProperty, StaySortId } from '../data/types'
import { HotelDiscoveryPanel } from './HotelDiscoveryPanel'
import { StayGrid } from './StayGrid'
import { StayListingFilterBar } from './StayListingFilterBar'

type Props = {
  cityId: StayCityId
  cityLabel: string
  clusters: StayCluster[]
  lockClusterId?: string
  catalogFooter?: ReactNode
  catalogScope?: 'city' | 'all'
}

const PAGE_SIZE = 6

export function HotelExplorer({
  cityId,
  cityLabel,
  clusters,
  lockClusterId,
  catalogFooter,
  catalogScope = 'city',
}: Props) {
  const [clusterFilter, setClusterFilter] = useState<string | 'All'>(lockClusterId ?? 'All')
  const [cityFilter, setCityFilter] = useState<StayCityId | 'All'>('All')
  const [listingFilters, setListingFilters] = useState<StayListingFilterId[]>([])
  const [sort, setSort] = useState<StaySortId>('recommended')
  const [page, setPage] = useState(1)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const customStayProperties = useTripStore((s) => s.customStayProperties)
  const upsertCustomStayProperty = useTripStore((s) => s.upsertCustomStayProperty)

  useEffect(() => {
    setClusterFilter(lockClusterId ?? 'All')
    setListingFilters([])
    setSort('recommended')
    setPage(1)
    setHighlightId(null)
  }, [cityId, lockClusterId])

  useEffect(() => {
    if (catalogScope !== 'all') return
    setCityFilter('All')
    setClusterFilter('All')
    setPage(1)
  }, [catalogScope])

  const neighbourhoodClusters = useMemo(() => {
    if (lockClusterId) return clusters
    if (catalogScope !== 'all') return clusters
    if (cityFilter === 'All') return []
    return getClustersForCity(cityFilter)
  }, [catalogScope, cityFilter, clusters, lockClusterId])

  const ranked = useMemo(() => {
    const catalog =
      catalogScope === 'all' ? getAllStays() : getStaysForCity(cityId)
    const cityClusterIds = new Set(
      catalogScope === 'all'
        ? catalog.map((stay) => stay.clusterId)
        : clusters.map((cluster) => cluster.id),
    )
    const extras = Object.values(customStayProperties).filter((stay) => {
      if (isAttractionStayName(stay.name)) return false
      if (catalog.some((item) => item.id === stay.id)) return false
      if (catalogScope === 'all') return Boolean(getClusterById(stay.clusterId))
      return cityClusterIds.has(stay.clusterId)
    })
    let list = [...extras, ...catalog]
    if (catalogScope === 'all' && cityFilter !== 'All') {
      const ids = new Set(getClustersForCity(cityFilter).map((cluster) => cluster.id))
      list = list.filter((stay) => ids.has(stay.clusterId))
    }
    if (lockClusterId) {
      list = list.filter((stay) => stay.clusterId === lockClusterId)
    } else if (clusterFilter !== 'All') {
      list = list.filter((stay) => stay.clusterId === clusterFilter)
    }
    list = filterStaysByListing(list, listingFilters, LISTING_FILTER_CATEGORIES)
    const extraIds = new Set(extras.map((stay) => stay.id))
    const sorted = rankStays(list, sort, [])
    return [
      ...sorted.filter((stay) => extraIds.has(stay.id)),
      ...sorted.filter((stay) => !extraIds.has(stay.id)),
    ]
  }, [
    cityId,
    clusters,
    clusterFilter,
    cityFilter,
    catalogScope,
    listingFilters,
    sort,
    customStayProperties,
    lockClusterId,
  ])

  useEffect(() => {
    if (!highlightId) return
    const index = ranked.findIndex((stay) => stay.id === highlightId)
    if (index < 0) return
    const nextPage = Math.floor(index / PAGE_SIZE) + 1
    setPage((current) => (current === nextPage ? current : nextPage))
  }, [highlightId, ranked])

  useEffect(() => {
    if (!highlightId) return
    const timer = window.setTimeout(() => {
      document.getElementById(`stay-card-${highlightId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 180)
    return () => window.clearTimeout(timer)
  }, [highlightId])

  const pageCount = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = ranked.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const filterName =
    clusterFilter === 'All'
      ? catalogScope === 'all'
        ? cityFilter === 'All'
          ? 'All cities'
          : (STAY_CITIES.find((c) => c.id === cityFilter)?.label ?? cityLabel)
        : cityLabel
      : (neighbourhoodClusters.find((c) => c.id === clusterFilter)?.name ??
        clusters.find((c) => c.id === clusterFilter)?.name ??
        cityLabel)
  const neighbourhoodName = clusterFilter === 'All' ? null : filterName
  const catalogTitle = lockClusterId
    ? (clusters.find((c) => c.id === lockClusterId)?.name ?? cityLabel)
    : catalogScope === 'all'
      ? filterName
      : cityLabel

  function setNeighbourhood(id: string | 'All') {
    setClusterFilter(id)
    setPage(1)
  }

  function setCatalogCity(id: StayCityId | 'All') {
    setCityFilter(id)
    setClusterFilter('All')
    setPage(1)
  }

  function toggleFilter(id: StayListingFilterId) {
    setPage(1)
    setListingFilters((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  function onStayReady(stay: StayProperty, alreadyInCatalog: boolean) {
    if (!alreadyInCatalog) upsertCustomStayProperty(stay)
    setHighlightId(stay.id)
    if (!lockClusterId) {
      setClusterFilter('All')
      setListingFilters([])
    }
  }

  return (
    <>
      <HotelDiscoveryPanel
        cityId={cityId}
        cityLabel={cityLabel}
        neighbourhoodName={neighbourhoodName}
        preferredClusterId={
          lockClusterId ??
          (clusterFilter !== 'All' && clusters.some((c) => c.id === clusterFilter)
            ? clusterFilter
            : undefined)
        }
        expectedCityId={lockClusterId ? cityId : undefined}
        expectedClusterId={lockClusterId}
        onStayReady={onStayReady}
      />

      <section id="stay-catalog" className="mt-14 scroll-mt-24">
        <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
          Stay catalog · {catalogTitle}
        </h2>
        <p className="mt-1 max-w-[54ch] text-[0.88rem] text-muted">
          A curated shortlist{catalogScope === 'all' ? ' across Vietnam’s stay cities' : ' for this city'}.
          Fetched stays appear at the top. Use the filters on the left to narrow the list.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:items-start">
          <StayListingFilterBar
            clusters={neighbourhoodClusters}
            clusterFilter={clusterFilter}
            onCluster={setNeighbourhood}
            selected={listingFilters}
            onToggle={toggleFilter}
            onClear={() => {
              setListingFilters([])
              setPage(1)
            }}
            sort={sort}
            onSort={(id) => {
              setSort(id)
              setPage(1)
            }}
            resultCount={ranked.length}
            hideNeighbourhood={Boolean(lockClusterId) || neighbourhoodClusters.length === 0}
            cities={catalogScope === 'all' ? STAY_CITIES : undefined}
            cityFilter={cityFilter}
            onCity={catalogScope === 'all' ? setCatalogCity : undefined}
          />

          <div>
            <StayGrid
              clusterName={filterName}
              stays={visible}
              cityId={cityId}
              cityLabel={cityLabel}
              eyebrow="Stay catalog"
              heading={`${ranked.length} stay${ranked.length === 1 ? '' : 's'}`}
              highlightId={highlightId}
            />

            {pageCount > 1 ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                <Chip disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                  ‹
                </Chip>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <Chip key={n} active={n === currentPage} onClick={() => setPage(n)}>
                    {n}
                  </Chip>
                ))}
                <Chip disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>
                  ›
                </Chip>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      {catalogFooter}
    </>
  )
}

function Chip({
  active,
  onClick,
  children,
  disabled,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold transition ${
        active
          ? 'bg-terracotta text-paper'
          : disabled
            ? 'cursor-not-allowed text-muted/40'
            : 'bg-paper text-ink ring-1 ring-ink/8 hover:text-terracotta'
      }`}
    >
      {children}
    </button>
  )
}
