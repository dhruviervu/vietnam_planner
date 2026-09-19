import { useState } from 'react'
import { FilterChip } from '../../PlanBuilder/components/ExperienceFilterPanel'

type PaceFilter = 'packed' | 'slow' | null

type Props = {
  days: number | null
  city: string | null
  pace: PaceFilter
  dayOptions: number[]
  cities: string[]
  cityCounts: Record<string, number>
  resultCount: number
  onDays: (days: number | null) => void
  onCity: (city: string | null) => void
  onPace: (pace: PaceFilter) => void
  onClear: () => void
}

export function PackedFilterBar({
  days,
  city,
  pace,
  dayOptions,
  cities,
  cityCounts,
  resultCount,
  onDays,
  onCity,
  onPace,
  onClear,
}: Props) {
  const activeCount = (days != null ? 1 : 0) + (city != null ? 1 : 0) + (pace != null ? 1 : 0)
  const [moreCities, setMoreCities] = useState(false)
  const extraCities = cities.slice(6)
  const visibleCities = moreCities ? cities : cities.slice(0, 6)

  return (
    <nav
      aria-label="Itinerary filters"
      className="rounded-[20px] border border-ink/8 bg-paper/90 p-4 shadow-soft backdrop-blur-sm lg:sticky lg:top-24 lg:self-start"
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Filters</p>
            <p className="mt-1 font-serif text-[1.15rem] font-semibold leading-snug text-ink">
              Shape what you see
            </p>
            <p className="mt-1 text-[0.75rem] text-muted">
              {resultCount} match{resultCount === 1 ? '' : 'es'}
              {activeCount > 0 ? ` · ${activeCount} active` : ''}
            </p>
          </div>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>

        <section>
          <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
            Explore by city
          </h3>
          <p className="mt-1 text-[0.72rem] text-muted">Filter the catalog to one or more cities.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <FilterChip active={city === '__vietnam__'} onClick={() => onCity(city === '__vietnam__' ? null : '__vietnam__')}>
              Complete Vietnam
            </FilterChip>
            {visibleCities.map((name) => (
              <FilterChip key={name} active={city === name} onClick={() => onCity(city === name ? null : name)}>
                {name}
                <span className="ml-1 opacity-70">{cityCounts[name] ?? 0}</span>
              </FilterChip>
            ))}
          </div>
          {extraCities.length > 0 ? (
            <button
              type="button"
              onClick={() => setMoreCities((v) => !v)}
              className="mt-2 text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              {moreCities ? 'Show fewer cities' : `Show ${extraCities.length} more cities`}
            </button>
          ) : null}
        </section>

        <section>
          <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">Pace</h3>
          <p className="mt-1 text-[0.72rem] text-muted">Packed days, or slow days with room between sights.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <FilterChip active={pace === 'packed'} onClick={() => onPace(pace === 'packed' ? null : 'packed')}>
              Packed
            </FilterChip>
            <FilterChip active={pace === 'slow'} onClick={() => onPace(pace === 'slow' ? null : 'slow')}>
              Slow
            </FilterChip>
          </div>
        </section>

        <section>
          <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">Duration</h3>
          <p className="mt-1 text-[0.72rem] text-muted">How long you want to spend.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dayOptions.map((n) => (
              <FilterChip key={n} active={days === n} onClick={() => onDays(days === n ? null : n)}>
                {n === 1 ? '1 day' : `${n} days`}
              </FilterChip>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={onClear}
          className="w-full rounded-full border border-ink/10 py-2.5 text-[0.8rem] font-bold text-ink hover:border-terracotta/30"
        >
          Reset filters
        </button>
      </div>
    </nav>
  )
}
