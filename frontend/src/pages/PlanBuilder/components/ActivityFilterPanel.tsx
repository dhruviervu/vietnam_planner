import { useState } from 'react'
import { DURATION_CHIPS, FilterChip } from './ExperienceFilterPanel'
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

function JumpChip({
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
      className={`rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold ${
        active ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream-deep'
      }`}
    >
      {children}
    </button>
  )
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
  const topCities = cities.slice(0, 6)
  const extraCities = cities.slice(6)
  const visibleCities = moreCities ? cities : topCities

  function setDuration(next: ActivityDurationFilter) {
    onChange({ ...filters, duration: filters.duration === next ? 'all' : next })
  }

  function setKind(next: ActivityKind) {
    onChange({ ...filters, kind: filters.kind === next ? 'all' : next })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Activity filters
          </p>
          <p className="mt-1 font-serif text-[1.15rem] font-semibold leading-snug text-ink">
            Shape what you see
          </p>
          <p className="mt-1 text-[0.75rem] text-muted">
            {resultCount} match{resultCount === 1 ? '' : 'es'}
            {activeCount > 0 ? ` · ${activeCount} active` : ''}
          </p>
        </div>
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

      <section>
        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Explore by city
        </h3>
        <p className="mt-1 text-[0.72rem] text-muted">Cities with activities, most first.</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleCities.map((city) => (
            <JumpChip
              key={city.cityId}
              active={activeCity === city.cityId}
              onClick={() => onSelectCity(city.cityId)}
            >
              {city.cityName}
              <span className="ml-1 opacity-70">{city.count}</span>
            </JumpChip>
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
        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Duration
        </h3>
        <p className="mt-1 text-[0.72rem] text-muted">How long you want to spend.</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DURATION_CHIPS.map((chip) => (
            <FilterChip
              key={chip.id}
              active={filters.duration === chip.id}
              onClick={() => setDuration(chip.id)}
              className="rounded-[14px] px-3 text-left"
            >
              <span className="flex flex-col items-start leading-tight">
                <span>{chip.label}</span>
                <span className="text-[0.62rem] font-semibold opacity-80">{chip.range}</span>
              </span>
            </FilterChip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Type
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
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
      </section>

      <button
        type="button"
        onClick={onClear}
        className="w-full rounded-full border border-ink/10 py-2.5 text-[0.8rem] font-bold text-ink hover:border-terracotta/30"
      >
        Reset filters
      </button>
    </div>
  )
}

type PanelProps = BodyProps & {
  expanded: boolean
}

export function ActivityFilterPanel({
  expanded,
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

  return (
    <div
      className="relative h-[calc(100vh-72px)] shrink-0 overflow-hidden border-r border-ink/8 bg-paper/90 backdrop-blur-sm transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ width: expanded ? 300 : 56, minWidth: 56 }}
    >
      <div
        className={`flex h-full w-[300px] flex-col ${expanded ? 'relative' : 'pointer-events-none absolute inset-0 opacity-0'}`}
        aria-hidden={!expanded}
      >
        <div className="flex items-center justify-between gap-2 border-b border-ink/8 px-4 py-3">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink">
            Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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

      <div
        className={`flex h-full w-[56px] flex-col items-center gap-3 px-1.5 py-5 ${
          expanded ? 'pointer-events-none absolute inset-0 opacity-0' : 'relative'
        }`}
        aria-hidden={expanded}
      >
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cream text-ink shadow-soft">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
        </span>
        {activeCount > 0 ? (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-terracotta text-[0.65rem] font-bold text-paper">
            {activeCount}
          </span>
        ) : null}
        <p
          className="mt-auto text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Filters
        </p>
      </div>
    </div>
  )
}
