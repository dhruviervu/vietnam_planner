import { useState } from 'react'
import {
  DURATION_CHIPS,
  FilterChip,
  splitPinnedCities,
} from './ExperienceFilterPanel'
import {
  type ActivityDurationFilter,
  type ActivityKind,
} from '../data/activities'

export type ActivityCatalogFilters = {
  kind: ActivityKind | 'all'
  duration: ActivityDurationFilter
}

export const DEFAULT_ACTIVITY_FILTERS: ActivityCatalogFilters = {
  kind: 'all',
  duration: 'all',
}

export function countActiveActivityFilters(filters: ActivityCatalogFilters) {
  let n = 0
  if (filters.kind !== 'all') n += 1
  if (filters.duration !== 'all') n += 1
  return n
}

type CityOption = {
  cityId: string
  cityName: string
  count: number
}

type KindOption = {
  id: ActivityKind
  label: string
  count: number
}

type BodyProps = {
  filters: ActivityCatalogFilters
  onChange: (next: ActivityCatalogFilters) => void
  onClear: () => void
  cities: CityOption[]
  kinds: KindOption[]
  activeCity: string | null
  onSelectCity: (cityId: string) => void
  resultCount: number
}

export function ActivityFilterPanelBody({
  filters,
  onChange,
  onClear,
  cities,
  kinds,
  activeCity,
  onSelectCity,
  resultCount,
}: BodyProps) {
  const activeCount = countActiveActivityFilters(filters)
  const [moreCities, setMoreCities] = useState(false)
  const { pinned, rest } = splitPinnedCities(cities, (city) => city.cityName)
  const extraCities = moreCities
    ? rest
    : rest.filter((city) => city.cityId === activeCity)

  function setDuration(next: ActivityDurationFilter) {
    onChange({ ...filters, duration: filters.duration === next ? 'all' : next })
  }

  function setKind(next: ActivityKind) {
    onChange({ ...filters, kind: filters.kind === next ? 'all' : next })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.78rem] text-muted">
          {resultCount} activit{resultCount === 1 ? 'y' : 'ies'}
          {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? '' : 's'}` : ''}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[0.72rem] font-bold text-terracotta hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-muted">
          Cities
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pinned.map((city) => (
            <FilterChip
              key={city.cityId}
              active={activeCity === city.cityId}
              onClick={() => onSelectCity(city.cityId)}
            >
              {city.cityName}
              <span className="ml-1 opacity-70">{city.count}</span>
            </FilterChip>
          ))}
          {extraCities.map((city) => (
            <FilterChip
              key={city.cityId}
              active={activeCity === city.cityId}
              onClick={() => onSelectCity(city.cityId)}
            >
              {city.cityName}
              <span className="ml-1 opacity-70">{city.count}</span>
            </FilterChip>
          ))}
          {rest.length > 0 ? (
            <button
              type="button"
              onClick={() => setMoreCities((v) => !v)}
              className="rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              {moreCities ? 'Fewer cities' : `+${rest.length} cities`}
            </button>
          ) : null}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-muted">
          Duration
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DURATION_CHIPS.map((chip) => (
            <FilterChip
              key={chip.id}
              active={filters.duration === chip.id}
              onClick={() => setDuration(chip.id)}
            >
              {chip.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-muted">
          Type
        </p>
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((k) => (
            <FilterChip
              key={k.id}
              active={filters.kind === k.id}
              onClick={() => setKind(k.id)}
            >
              {k.label}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  )
}

type PanelProps = BodyProps & {
  expanded: boolean
  onToggle: () => void
}

function FilterGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  )
}

export function ActivityFilterPanel({
  expanded,
  onToggle,
  filters,
  onChange,
  onClear,
  cities,
  kinds,
  activeCity,
  onSelectCity,
  resultCount,
}: PanelProps) {
  const activeCount = countActiveActivityFilters(filters)

  if (!expanded) {
    return (
      <div className="sticky top-[84px] hidden w-[4.4rem] shrink-0 self-start px-1.5 pt-1 lg:block">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={false}
          title="Expand filter panel"
          className="group relative flex w-full flex-col items-center gap-1.5 rounded-[22px] bg-paper px-1.5 py-3 text-ink shadow-soft ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:ring-terracotta/35 hover:shadow-card"
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-terracotta text-paper shadow-[0_8px_16px_rgba(196,92,58,0.28)] transition group-hover:scale-105">
            <FilterGlyph />
          </span>
          <span className="px-0.5 text-center text-[0.62rem] font-bold leading-[1.15] text-ink">
            Expand filters
          </span>
          {activeCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.6rem] font-bold text-paper">
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>
    )
  }

  return (
    <div className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[13.5rem] shrink-0 flex-col border-r border-ink/8 bg-paper/92 backdrop-blur-sm lg:flex">
      <div className="shrink-0 border-b border-ink/8 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded
          className="flex w-full items-center justify-between gap-2 rounded-full bg-cream px-3 py-2 text-left text-[0.78rem] font-bold text-ink ring-1 ring-ink/8 transition hover:bg-cream-deep"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-paper text-ink">
              <FilterGlyph />
            </span>
            Hide filters
          </span>
          {activeCount > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1.5 text-[0.62rem] font-bold text-paper">
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <ActivityFilterPanelBody
          filters={filters}
          onChange={onChange}
          onClear={onClear}
          cities={cities}
          kinds={kinds}
          activeCity={activeCity}
          onSelectCity={onSelectCity}
          resultCount={resultCount}
        />
      </div>
    </div>
  )
}
