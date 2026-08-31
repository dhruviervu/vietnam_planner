import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { getDishById } from '../data/dishes'
import type { Dish, FoodCity, Restaurant, RestaurantFilter, RestaurantSort } from '../data/types'
import {
  RESTAURANTS,
  citiesForDish,
  getRestaurantsForDish,
  restaurantCityCounts,
  restaurantDishCounts,
} from '../data/restaurants'
import { getTripFoodCities } from '../lib/tripFoodCities'
import { RestaurantCard } from './RestaurantCard'

type Props = {
  dishes: Dish[]
  selectedDishId: string | 'All'
  onSelectDish: (dishId: string | 'All') => void
}

const TOP_CITY_COUNT = 6
const PAGE_SIZE = 4

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

  const listingCities = useMemo(() => citiesForDish(selectedDishId), [selectedDishId])
  const availableCities = useMemo(
    () => (hasTrip ? listingCities.filter((c) => tripCities.includes(c)) : listingCities),
    [hasTrip, listingCities, tripCities],
  )
  const cityCounts = useMemo(() => restaurantCityCounts(selectedDishId), [selectedDishId])
  const dishCounts = useMemo(() => restaurantDishCounts(), [])
  const [city, setCity] = useState<FoodCity | 'All'>('All')
  const [sort, setSort] = useState<RestaurantSort>('reviews-high')
  const [filters, setFilters] = useState<RestaurantFilter>({})
  const [moreCities, setMoreCities] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setCity('All')
    setMoreCities(false)
  }, [selectedDishId])

  useEffect(() => {
    setPage(1)
  }, [selectedDishId, city, sort, filters])

  const activeCity = city === 'All' || availableCities.includes(city) ? city : 'All'
  const topCities = availableCities.slice(0, TOP_CITY_COUNT)
  const extraCities = hasTrip ? [] : availableCities.slice(TOP_CITY_COUNT)
  const visibleCities = hasTrip || moreCities ? availableCities : topCities

  const restaurants = useMemo(
    () => getRestaurantsForDish(selectedDishId, activeCity, sort, filters, tripCities),
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
    (activeCity !== 'All' ? 1 : 0)

  function clearFilters() {
    onSelectDish('All')
    setCity('All')
    setSort('reviews-high')
    setFilters({})
  }

  return (
    <section id="where-to-eat" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Where Should You Eat?
      </h2>
      <p className="mt-1 max-w-[50ch] text-[0.88rem] text-muted">
        Places worth going to — filter by dish if you already know what you want to taste.
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

      <div className="mt-5 overflow-hidden rounded-[22px] bg-paper shadow-soft lg:grid lg:grid-cols-[minmax(10.5rem,0.22fr)_minmax(0,0.78fr)]">
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
                {dishes.map((d) => (
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
                {selectedDish ? `Jump to a city for ${selectedDish.name}.` : 'Jump to a city.'}
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

            <section>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                More filters
              </h3>
              <div className="mt-2 flex flex-wrap gap-1">
                <CityChip
                  active={!!filters.servesAlcohol}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, servesAlcohol: !prev.servesAlcohol }))
                  }
                >
                  Serves alcohol
                </CityChip>
                <CityChip
                  active={!!filters.allowsSmoking}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, allowsSmoking: !prev.allowsSmoking }))
                  }
                >
                  Smoking
                </CityChip>
              </div>
            </section>
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
              </p>
            </motion.div>
          </AnimatePresence>

          {restaurants.length === 0 ? (
            <p className="mt-6 text-[0.88rem] text-muted">
              No restaurants match these filters
              {selectedDish ? ` for ${selectedDish.name}` : ''}. Try clearing a filter or choosing
              another city.
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pageRestaurants.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    dishName={cardDishName(r, selectedDish)}
                    isTop={pageStart + i === 0}
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
                      <span
                        key={`gap-${i}`}
                        className="px-1.5 text-[0.78rem] font-bold text-muted"
                      >
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
