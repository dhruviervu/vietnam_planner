import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { getDishById } from '../data/dishes'
import type {
  Dish,
  FoodCity,
  Restaurant,
  RestaurantFilter,
  RestaurantKind,
  RestaurantPriceLevel,
  RestaurantSort,
} from '../data/types'
import {
  KIND_CHIPS,
  PRICE_CHIPS,
  RESTAURANTS,
  citiesForDish,
  getRestaurantsForDish,
  restaurantCityCounts,
  restaurantDishCounts,
  restaurantKindCounts,
  restaurantPriceCounts,
} from '../data/restaurants'
import { getTripFoodCities } from '../lib/tripFoodCities'
import { RestaurantCard } from './RestaurantCard'

type Props = {
  dishes: Dish[]
  selectedDishId: string | 'All'
  onSelectDish: (dishId: string | 'All') => void
}

const TOP_CITY_COUNT = 6
const PAGE_SIZE = 6

function cardDishName(restaurant: Restaurant, selectedDish?: Dish) {
  if (selectedDish) return selectedDish.name
  return getDishById(restaurant.specialityDishIds[0])?.name ?? 'Vietnamese'
}

export function RestaurantExplorer({ dishes, selectedDishId, onSelectDish }: Props) {
  const tripTick = useTripStore(
    (s) =>
      `${s.selectedExperienceIds.join(',')}|${s.selectedActivityIds.join(',')}|${s.selectedHotelIds.join(',')}|${s.itineraryStayPropertyIds.join(',')}`,
  )
  const tripCities = useMemo(() => getTripFoodCities(), [tripTick])
  const hasTrip = tripCities.length > 0
  const selectedDish = selectedDishId === 'All' ? undefined : getDishById(selectedDishId)

  const [city, setCity] = useState<FoodCity | 'All'>('All')
  const [sort, setSort] = useState<RestaurantSort>('reviews-high')
  const [filters, setFilters] = useState<RestaurantFilter>({})
  const [moreCities, setMoreCities] = useState(false)
  const [page, setPage] = useState(1)

  const listingCities = useMemo(
    () => citiesForDish(selectedDishId, filters, tripCities),
    [selectedDishId, filters, tripCities],
  )
  const availableCities = useMemo(
    () => (hasTrip ? listingCities.filter((c) => tripCities.includes(c)) : listingCities),
    [hasTrip, listingCities, tripCities],
  )
  const activeCity = city === 'All' || availableCities.includes(city) ? city : 'All'
  const cityCounts = useMemo(
    () => restaurantCityCounts(selectedDishId, filters, tripCities),
    [selectedDishId, filters, tripCities],
  )
  const dishCounts = useMemo(
    () => restaurantDishCounts(activeCity, filters, tripCities),
    [activeCity, filters, tripCities],
  )
  const priceCounts = useMemo(
    () => restaurantPriceCounts(selectedDishId, activeCity, filters, tripCities),
    [selectedDishId, activeCity, filters, tripCities],
  )
  const kindCounts = useMemo(
    () => restaurantKindCounts(selectedDishId, activeCity, filters, tripCities),
    [selectedDishId, activeCity, filters, tripCities],
  )

  const visibleDishes = dishes.filter((d) => (dishCounts[d.id] ?? 0) > 0)
  const visiblePrices = PRICE_CHIPS.filter((chip) => priceCounts[chip.id] > 0)
  const visibleKinds = KIND_CHIPS.filter((chip) => kindCounts[chip.id] > 0)

  useEffect(() => {
    setCity('All')
    setMoreCities(false)
  }, [selectedDishId])

  useEffect(() => {
    setPage(1)
  }, [selectedDishId, city, sort, filters])

  useEffect(() => {
    if (city !== 'All' && !availableCities.includes(city)) setCity('All')
  }, [availableCities, city])

  useEffect(() => {
    if (selectedDishId === 'All') return
    if ((dishCounts[selectedDishId] ?? 0) > 0) return
    onSelectDish('All')
  }, [dishCounts, onSelectDish, selectedDishId])

  useEffect(() => {
    const selected = filters.priceLevels ?? []
    if (selected.length === 0) return
    const next = selected.filter((p) => priceCounts[p] > 0)
    if (next.length === selected.length) return
    setFilters((prev) => ({ ...prev, priceLevels: next }))
  }, [filters.priceLevels, priceCounts])

  useEffect(() => {
    if (!filters.kind) return
    if (kindCounts[filters.kind] > 0) return
    setFilters((prev) => ({ ...prev, kind: undefined }))
  }, [filters.kind, kindCounts])

  const showAlcohol = getRestaurantsForDish(
    selectedDishId,
    activeCity,
    sort,
    { ...filters, servesAlcohol: false },
    tripCities,
    { preferNearby: false },
  ).some((r) => r.servesAlcohol)
  const showSmoking = getRestaurantsForDish(
    selectedDishId,
    activeCity,
    sort,
    { ...filters, allowsSmoking: false },
    tripCities,
    { preferNearby: false },
  ).some((r) => r.allowsSmoking)

  useEffect(() => {
    if (filters.servesAlcohol && !showAlcohol) {
      setFilters((prev) => ({ ...prev, servesAlcohol: false }))
    }
  }, [filters.servesAlcohol, showAlcohol])

  useEffect(() => {
    if (filters.allowsSmoking && !showSmoking) {
      setFilters((prev) => ({ ...prev, allowsSmoking: false }))
    }
  }, [filters.allowsSmoking, showSmoking])

  const topCities = availableCities.slice(0, TOP_CITY_COUNT)
  const extraCities = hasTrip ? [] : availableCities.slice(TOP_CITY_COUNT)
  const visibleCities = hasTrip || moreCities ? availableCities : topCities

  const restaurants = useMemo(
    () => getRestaurantsForDish(selectedDishId, activeCity, sort, filters, tripCities, { preferNearby: false }),
    [selectedDishId, activeCity, sort, filters, tripCities],
  )
  const pageCount = Math.max(1, Math.ceil(restaurants.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageRestaurants = restaurants.slice(pageStart, pageStart + PAGE_SIZE)
  const pageNumbers = visiblePageNumbers(currentPage, pageCount)

  const activeFilterCount =
    (selectedDishId !== 'All' ? 1 : 0) +
    (sort !== 'reviews-high' ? 1 : 0) +
    (filters.servesAlcohol ? 1 : 0) +
    (filters.allowsSmoking ? 1 : 0) +
    (filters.kind ? 1 : 0) +
    (filters.priceLevels?.length ? 1 : 0) +
    (activeCity !== 'All' ? 1 : 0)

  function clearFilters() {
    onSelectDish('All')
    setCity('All')
    setSort('reviews-high')
    setFilters({})
  }

  function togglePrice(level: RestaurantPriceLevel) {
    setFilters((prev) => {
      const cur = prev.priceLevels ?? []
      const next = cur.includes(level) ? cur.filter((p) => p !== level) : [...cur, level]
      return { ...prev, priceLevels: next }
    })
  }

  function toggleKind(kind: RestaurantKind) {
    setFilters((prev) => ({ ...prev, kind: prev.kind === kind ? undefined : kind }))
  }

  return (
    <section id="where-to-eat" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Where Should You Eat?
      </h2>
      <p className="mt-1 max-w-[62ch] text-[0.88rem] text-muted">
        A shortlist of rooms worth planning around — the most-reviewed traveller classics, plus local
        tables that still work for visitors. Vietnam has thousands more kitchens; check the live
        menu and recent reviews before you go.
      </p>
      {hasTrip ? (
        <p className="mt-2 text-[0.75rem] font-semibold text-sage">
          Showing places near your trip — walkable or a short cab from{' '}
          {tripCities.map((c) => (c === 'Ho Chi Minh City' ? 'HCMC' : c)).join(', ')}.
        </p>
      ) : (
        <p className="mt-2 text-[0.75rem] text-muted">
          No stays or experiences in the trip bag yet — listings are spread across different
          neighbourhoods and cities.
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-[22px] bg-paper shadow-soft lg:grid lg:grid-cols-[minmax(11rem,0.24fr)_minmax(0,0.76fr)]">
        <aside className="border-b border-ink/8 bg-cream/40 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2 px-3 pt-3">
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

          <div className="space-y-4 px-3 py-3">
            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Filter by dish
              </h3>
              <p className="mt-1 text-[0.72rem] text-muted">See every place, or one speciality.</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <CityChip active={selectedDishId === 'All'} onClick={() => onSelectDish('All')}>
                  All dishes
                  <span className="ml-1 opacity-70">{RESTAURANTS.length}</span>
                </CityChip>
                {visibleDishes.map((d) => (
                  <CityChip
                    key={d.id}
                    active={selectedDishId === d.id}
                    onClick={() => onSelectDish(d.id)}
                  >
                    {d.name}
                    <span className="ml-1 opacity-70">{dishCounts[d.id] ?? 0}</span>
                  </CityChip>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Explore by city
              </h3>
              <p className="mt-1 text-[0.72rem] text-muted">
                {selectedDish ? `Cities that serve ${selectedDish.name} well.` : 'Jump to a city.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <CityChip active={activeCity === 'All'} onClick={() => setCity('All')}>
                  All
                  <span className="ml-1 opacity-70">
                    {availableCities.reduce((n, c) => n + (cityCounts[c] ?? 0), 0)}
                  </span>
                </CityChip>
                {visibleCities.map((c) => (
                  <CityChip key={c} active={activeCity === c} onClick={() => setCity(c)}>
                    {c === 'Ho Chi Minh City' ? 'HCMC' : c}
                    <span className="ml-1 opacity-70">{cityCounts[c] ?? 0}</span>
                  </CityChip>
                ))}
              </div>
              {!hasTrip && extraCities.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setMoreCities((v) => !v)}
                  className="mt-2 text-[0.72rem] font-bold text-terracotta hover:underline"
                >
                  {moreCities
                    ? 'Show fewer cities'
                    : `Show ${extraCities.length} more ${extraCities.length === 1 ? 'city' : 'cities'}`}
                </button>
              ) : null}
            </section>

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Cost
              </h3>
              <p className="mt-1 text-[0.72rem] text-muted">Street stools through to a special night.</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {visiblePrices.map((chip) => (
                  <CityChip
                    key={chip.id}
                    active={!!filters.priceLevels?.includes(chip.id)}
                    onClick={() => togglePrice(chip.id)}
                  >
                    {chip.label}
                    <span className="ml-1 opacity-70">{priceCounts[chip.id]}</span>
                  </CityChip>
                ))}
              </div>
            </section>

            {visibleKinds.length > 0 ? (
              <section>
                <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                  Worth going
                </h3>
                <p className="mt-1 text-[0.72rem] text-muted">
                  High visitor volume, or rooms locals send guests to.
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {visibleKinds.map((chip) => (
                    <CityChip
                      key={chip.id}
                      active={filters.kind === chip.id}
                      onClick={() => toggleKind(chip.id)}
                    >
                      {chip.label}
                      <span className="ml-1 opacity-70">{kindCounts[chip.id]}</span>
                    </CityChip>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                Sort
              </h3>
              <div className="mt-2 flex flex-wrap gap-1">
                <CityChip
                  active={sort === 'reviews-high'}
                  onClick={() => setSort('reviews-high')}
                >
                  Reviews · high to low
                </CityChip>
                <CityChip active={sort === 'best-value'} onClick={() => setSort('best-value')}>
                  Best value
                </CityChip>
              </div>
            </section>

            {showAlcohol || showSmoking ? (
              <section>
                <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                  More filters
                </h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {showAlcohol ? (
                    <CityChip
                      active={!!filters.servesAlcohol}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, servesAlcohol: !prev.servesAlcohol }))
                      }
                    >
                      Serves alcohol
                    </CityChip>
                  ) : null}
                  {showSmoking ? (
                    <CityChip
                      active={!!filters.allowsSmoking}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, allowsSmoking: !prev.allowsSmoking }))
                      }
                    >
                      Smoking
                    </CityChip>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDishId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="font-serif text-[1.35rem] font-semibold text-ink">
                {selectedDish ? `Where to eat ${selectedDish.name}` : 'Places to eat'}
              </h3>
              <p className="mt-0.5 text-[0.8rem] text-muted">
                {restaurants.length} place{restaurants.length === 1 ? '' : 's'}
                {activeCity !== 'All' ? ` in ${activeCity}` : hasTrip ? ' near your trip' : ''}
                {' · ranked by tourist reviews'}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pageRestaurants.map((r, i) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                dishName={cardDishName(r, selectedDish)}
                isTop={pageStart + i === 0 && sort === 'reviews-high'}
                hasTripContext={hasTrip && (activeCity === 'All' || tripCities.includes(r.city))}
              />
            ))}
          </div>
          {pageCount > 1 ? (
            <nav
              aria-label="Restaurant pages"
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
        </div>
      </div>
    </section>
  )
}

function CityChip({
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
      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold transition ${
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
