import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import type { ShopCity, ShopFilter, ShopSort, ShoppingItem } from '../data/types'
import {
  DESTINATIONS,
  citiesForItem,
  destinationCityCounts,
  destinationItemCounts,
  getDestinationsForItem,
} from '../data/destinations'
import { getTripShopCities } from '../lib/tripShopCities'
import { ShopPlaceCard } from './ShopPlaceCard'

type Props = {
  items: ShoppingItem[]
  selectedItemId: string | 'All'
  onSelectItem: (id: string | 'All') => void
}

const PAGE_SIZE = 4

const SORTS: { id: ShopSort; label: string }[] = [
  { id: 'best-overall', label: 'Best overall' },
  { id: 'best-value', label: 'Best value' },
  { id: 'highest-rated', label: 'Highest rated' },
  { id: 'lower-crowds', label: 'Lower crowds' },
  { id: 'tourist-friendly', label: 'Tourist friendly' },
  { id: 'best-for-bargaining', label: 'Best for bargaining' },
]

export function ShopExplorer({ items, selectedItemId, onSelectItem }: Props) {
  const tripTick = useTripStore(
    (s) =>
      `${s.selectedExperienceIds.join(',')}|${s.selectedActivityIds.join(',')}|${s.selectedHotelIds.join(',')}|${s.itineraryStayPropertyIds.join(',')}`,
  )
  const tripCities = useMemo(() => getTripShopCities(), [tripTick])
  const hasTrip = tripCities.length > 0
  const selectedItem =
    selectedItemId === 'All' ? undefined : items.find((i) => i.id === selectedItemId)

  const listingCities = useMemo(() => citiesForItem(selectedItemId), [selectedItemId])
  const availableCities = listingCities
  const cityCounts = useMemo(() => destinationCityCounts(selectedItemId), [selectedItemId])
  const itemCounts = useMemo(() => destinationItemCounts(), [])

  const [city, setCity] = useState<ShopCity | 'All'>('All')
  const [sort, setSort] = useState<ShopSort>('best-overall')
  const [filters, setFilters] = useState<ShopFilter>({})
  const [page, setPage] = useState(1)

  useEffect(() => {
    setCity('All')
  }, [selectedItemId])

  useEffect(() => {
    setPage(1)
  }, [selectedItemId, city, sort, filters, tripTick])

  const activeCity = city === 'All' || availableCities.includes(city) ? city : 'All'
  const visibleCities = availableCities

  const destinations = useMemo(
    () => getDestinationsForItem(selectedItemId, activeCity, sort, filters, tripCities),
    [selectedItemId, activeCity, sort, filters, tripCities],
  )

  const pageCount = Math.max(1, Math.ceil(destinations.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageDestinations = destinations.slice(pageStart, pageStart + PAGE_SIZE)
  const pageNumbers = visiblePageNumbers(currentPage, pageCount)

  const activeFilterCount =
    (selectedItemId !== 'All' ? 1 : 0) +
    (sort !== 'best-overall' ? 1 : 0) +
    (filters.openNow ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (activeCity !== 'All' ? 1 : 0)

  function clearFilters() {
    onSelectItem('All')
    setCity('All')
    setSort('best-overall')
    setFilters({})
  }

  const cityLabel = activeCity === 'Ho Chi Minh City' ? 'HCMC' : activeCity
  const rankScope = activeCity === 'All' ? 'across Vietnam' : `in ${cityLabel}`

  return (
    <section id="where-to-shop" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Where to Shop
      </h2>
      <p className="mt-1 max-w-[62ch] text-[0.88rem] text-muted">
        Here we list top shopping centres to find the products listed above and sure you can find
        other stuff at these centres as well. These are the top tourist friendly centres across
        Vietnam.
      </p>
      {hasTrip ? (
        <p className="mt-2 text-[0.75rem] font-semibold text-sage">
          Your trip includes{' '}
          {tripCities.map((c) => (c === 'Ho Chi Minh City' ? 'HCMC' : c)).join(', ')} — use the city
          chips to jump there, or browse every shopping city.
        </p>
      ) : (
        <p className="mt-2 text-[0.75rem] text-muted">
          Shopping centres and markets across Vietnam — filter by city, then add a stop to a trip
          day.
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-[22px] bg-paper shadow-soft lg:grid lg:grid-cols-[minmax(15rem,0.32fr)_minmax(0,0.68fr)]">
        <aside className="border-b border-ink/8 bg-cream/40 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2 px-4 pt-4">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
              Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
            </p>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[0.7rem] font-bold text-terracotta hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="space-y-5 px-4 py-4">
            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Filter by item
              </h3>
              <p className="mt-1 text-[0.72rem] text-muted">See every place, or shops for one thing.</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FilterChip active={selectedItemId === 'All'} onClick={() => onSelectItem('All')}>
                  All items
                  <span className="ml-1 opacity-70">{DESTINATIONS.length}</span>
                </FilterChip>
                {items.map((item) => (
                  <FilterChip
                    key={item.id}
                    active={selectedItemId === item.id}
                    onClick={() => onSelectItem(item.id)}
                  >
                    {item.name}
                    <span className="ml-1 opacity-70">{itemCounts[item.id] ?? 0}</span>
                  </FilterChip>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Explore by city
              </h3>
              <p className="mt-1 text-[0.72rem] text-muted">
                {selectedItem
                  ? `Jump to a city ranked for ${selectedItem.name}.`
                  : 'Listings are ranked for the city you choose.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FilterChip active={activeCity === 'All'} onClick={() => setCity('All')}>
                  All
                  <span className="ml-1 opacity-70">
                    {availableCities.reduce((n, c) => n + (cityCounts[c] ?? 0), 0)}
                  </span>
                </FilterChip>
                {visibleCities.map((c) => (
                  <FilterChip key={c} active={activeCity === c} onClick={() => setCity(c)}>
                    {c === 'Ho Chi Minh City' ? 'HCMC' : c}
                    <span className="ml-1 opacity-70">{cityCounts[c] ?? 0}</span>
                  </FilterChip>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Place type
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FilterChip
                  active={filters.type === 'markets'}
                  onClick={() =>
                    setFilters((f) => ({ ...f, type: f.type === 'markets' ? null : 'markets' }))
                  }
                >
                  Markets
                </FilterChip>
                <FilterChip
                  active={filters.type === 'malls'}
                  onClick={() =>
                    setFilters((f) => ({ ...f, type: f.type === 'malls' ? null : 'malls' }))
                  }
                >
                  Malls
                </FilterChip>
                <FilterChip
                  active={filters.type === 'specialty'}
                  onClick={() =>
                    setFilters((f) => ({ ...f, type: f.type === 'specialty' ? null : 'specialty' }))
                  }
                >
                  Specialty shops
                </FilterChip>
                <FilterChip
                  active={filters.type === 'craft'}
                  onClick={() =>
                    setFilters((f) => ({ ...f, type: f.type === 'craft' ? null : 'craft' }))
                  }
                >
                  Craft districts
                </FilterChip>
              </div>
            </section>

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Sort
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SORTS.map((s) => (
                  <FilterChip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>
                    {s.label}
                  </FilterChip>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                More filters
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <FilterChip
                  active={!!filters.openNow}
                  onClick={() => setFilters((f) => ({ ...f, openNow: !f.openNow }))}
                >
                  Open now
                </FilterChip>
              </div>
            </section>
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedItemId}-${activeCity}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="font-serif text-[1.35rem] font-semibold text-ink">
                {selectedItem
                  ? `Where to buy ${selectedItem.name}`
                  : activeCity === 'All'
                    ? 'Markets, malls and shops'
                    : `Ranked for ${cityLabel}`}
              </h3>
              <p className="mt-0.5 text-[0.8rem] text-muted">
                {destinations.length} place{destinations.length === 1 ? '' : 's'} ranked {rankScope}
              </p>
            </motion.div>
          </AnimatePresence>

          {destinations.length === 0 ? (
            <p className="mt-6 text-[0.88rem] text-muted">
              No shops match these filters
              {selectedItem ? ` for ${selectedItem.name}` : ''}. Try clearing a filter or choosing
              another city.
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pageDestinations.map((d, i) => (
                  <ShopPlaceCard
                    key={d.id}
                    destination={d}
                    rank={pageStart + i + 1}
                    cityScope={activeCity}
                  />
                ))}
              </div>
              {pageCount > 1 ? (
                <nav
                  aria-label="Shop pages"
                  className="mt-5 flex flex-wrap items-center justify-center gap-1.5"
                >
                  <PageBtn
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    label="Previous page"
                  >
                    ‹
                  </PageBtn>
                  {pageNumbers.map((n, i) =>
                    n === '…' ? (
                      <span key={`gap-${i}`} className="px-1.5 text-[0.78rem] font-bold text-muted">
                        …
                      </span>
                    ) : (
                      <PageBtn
                        key={n}
                        active={n === currentPage}
                        onClick={() => setPage(n)}
                        label={`Page ${n}`}
                      >
                        {n}
                      </PageBtn>
                    ),
                  )}
                  <PageBtn
                    disabled={currentPage >= pageCount}
                    onClick={() => setPage(currentPage + 1)}
                    label="Next page"
                  >
                    ›
                  </PageBtn>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold transition ${
        active
          ? 'bg-terracotta text-paper'
          : 'bg-paper text-ink ring-1 ring-ink/8 hover:text-terracotta'
      }`}
    >
      {children}
    </button>
  )
}

function visiblePageNumbers(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set<number>([1, total, current, current - 1, current + 1])
  if (current <= 3) {
    set.add(2)
    set.add(3)
    set.add(4)
  }
  if (current >= total - 2) {
    set.add(total - 1)
    set.add(total - 2)
    set.add(total - 3)
  }
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out: Array<number | '…'> = []
  for (const n of nums) {
    if (out.length > 0) {
      const prev = out[out.length - 1]
      if (typeof prev === 'number' && n - prev > 1) out.push('…')
    }
    out.push(n)
  }
  return out
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-8 min-w-8 place-items-center rounded-full px-2.5 text-[0.78rem] font-bold transition ${
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
