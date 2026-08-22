import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Dish, FoodCity, RestaurantFilter, RestaurantSort } from '../data/types'
import {
  citiesForDish,
  getRestaurantsForDish,
  priceSymbols,
} from '../data/restaurants'

type Props = {
  dish: Dish
}

const SORTS: { id: RestaurantSort; label: string }[] = [
  { id: 'best-for-dish', label: 'Best for this Dish' },
  { id: 'highest-rated', label: 'Highest Rated' },
  { id: 'most-reviewed', label: 'Most Reviewed' },
  { id: 'best-value', label: 'Best Value' },
]

export function RestaurantExplorer({ dish }: Props) {
  const availableCities = useMemo(() => citiesForDish(dish.id), [dish.id])
  const [city, setCity] = useState<FoodCity | 'All'>('All')
  const [sort, setSort] = useState<RestaurantSort>('best-for-dish')
  const [filters, setFilters] = useState<RestaurantFilter>({})

  useEffect(() => {
    setCity('All')
    setSort('best-for-dish')
    setFilters({})
  }, [dish.id])

  const activeCity =
    city === 'All' || availableCities.includes(city) ? city : 'All'

  const restaurants = useMemo(
    () => getRestaurantsForDish(dish.id, activeCity, sort, filters),
    [dish.id, activeCity, sort, filters],
  )

  function toggleFilter(key: keyof RestaurantFilter) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section id="where-to-eat" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Where Should You Eat It?
      </h2>
      <p className="mt-1 max-w-[50ch] text-[0.88rem] text-muted">
        Once you know what you want to taste, we&apos;ll help you find the places worth going to.
      </p>
      <p className="mt-2 text-[0.68rem] font-semibold text-muted/80">
        Prototype listings — not live availability.
      </p>

      <div className="mt-5 overflow-hidden rounded-[22px] bg-paper shadow-soft lg:grid lg:grid-cols-[minmax(10.5rem,0.28fr)_minmax(0,0.72fr)]">
        {/* City rail */}
        <aside className="border-b border-ink/8 bg-cream/40 lg:border-b-0 lg:border-r">
          <p className="px-4 pt-4 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
            Cities
          </p>
          <div className="flex gap-1.5 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:px-2 lg:pb-4">
            <CityRailButton
              label="All cities"
              active={activeCity === 'All'}
              onClick={() => setCity('All')}
            />
            {availableCities.map((c) => (
              <CityRailButton
                key={c}
                label={c === 'Ho Chi Minh City' ? 'HCMC' : c}
                active={activeCity === c}
                onClick={() => setCity(c)}
              />
            ))}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="font-serif text-[1.35rem] font-semibold text-ink">
                Where to Eat {dish.name}
              </h3>
              <p className="mt-0.5 text-[0.8rem] text-muted">
                {restaurants.length} place{restaurants.length === 1 ? '' : 's'}
                {activeCity !== 'All' ? ` in ${activeCity}` : ''} · ranked for this dish
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Filter bar */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSort(s.id)}
                className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold transition ${
                  sort === s.id
                    ? 'bg-terracotta text-paper'
                    : 'bg-cream text-ink hover:text-terracotta'
                }`}
              >
                {s.label}
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-ink/10 sm:inline-block" />
            <FilterChip
              label="Open Now"
              active={!!filters.openNow}
              onClick={() => toggleFilter('openNow')}
            />
            <FilterChip
              label="Outdoor Seating"
              active={!!filters.outdoorSeating}
              onClick={() => toggleFilter('outdoorSeating')}
            />
            <FilterChip
              label="Serves Alcohol"
              active={!!filters.servesAlcohol}
              onClick={() => toggleFilter('servesAlcohol')}
            />
          </div>

          {restaurants.length === 0 ? (
            <p className="mt-6 text-[0.88rem] text-muted">
              No restaurants match these filters for {dish.name}. Try clearing a filter or choosing
              another city.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {restaurants.map((r, i) => (
                <RestaurantCard key={r.id} restaurant={r} dishName={dish.name} isTop={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CityRailButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-[12px] px-3 py-2 text-left text-[0.78rem] font-bold transition lg:w-full ${
        active
          ? 'bg-terracotta/15 text-terracotta ring-1 ring-terracotta/25'
          : 'text-ink hover:bg-cream'
      }`}
    >
      {label}
    </button>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold transition ${
        active ? 'bg-sage/20 text-ink ring-1 ring-sage/40' : 'bg-cream/80 text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}

function RestaurantCard({
  restaurant: r,
  dishName,
  isTop,
}: {
  restaurant: import('../data/types').Restaurant
  dishName: string
  isTop: boolean
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[16px] bg-cream/50 ring-1 ring-ink/6">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={r.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
        {isTop ? (
          <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper">
            Our pick
          </span>
        ) : null}
        <span className="absolute bottom-2 left-2 rounded-full bg-ink/55 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper backdrop-blur-sm">
          {dishName}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h4 className="font-serif text-[1.05rem] font-semibold leading-tight text-ink">{r.name}</h4>
        <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-terracotta">
          {r.city === 'Ho Chi Minh City' ? 'HCMC' : r.city} · {r.neighborhood}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-semibold text-ink">
          <span>⭐ {r.rating.toFixed(1)}</span>
          <span className="text-muted">{r.reviewCount.toLocaleString()} reviews</span>
          <span className="text-muted">{priceSymbols(r.priceLevel)}</span>
          <span className={r.openNow ? 'text-sage' : 'text-muted'}>
            {r.openNow ? 'Open now' : 'Closed now'}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {r.outdoorSeating ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              Outdoor
            </span>
          ) : null}
          {r.servesAlcohol ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              Alcohol
            </span>
          ) : null}
          {r.distanceKm != null ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              {r.distanceKm.toFixed(1)} km from planned area
            </span>
          ) : (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              {r.region} Vietnam
            </span>
          )}
        </div>

        <div className="mt-2.5">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
            Why we picked it
          </p>
          <p className="mt-0.5 text-[0.78rem] font-medium leading-snug text-ink/85">
            {r.whyRecommended}
          </p>
          {isTop ? (
            <p className="mt-1 text-[0.72rem] font-semibold text-terracotta">{r.pickReason}</p>
          ) : null}
        </div>

        <div className="mt-auto flex gap-1.5 pt-3">
          <a
            href={r.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-sage/45 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-ink transition hover:-translate-y-0.5"
          >
            View on Maps →
          </a>
          <button
            type="button"
            className="flex-1 rounded-full bg-terracotta/90 px-2.5 py-1.5 text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
          >
            See Restaurant →
          </button>
        </div>
      </div>
    </article>
  )
}
