import { useState } from 'react'
import { FilterChip, splitPinnedCities } from './ExperienceFilterPanel'
import { type ActivityKind } from '../data/activities'

export type ActivityCatalogFilters = {
  kind: ActivityKind | 'all'
  cities: string[]
}

export const DEFAULT_ACTIVITY_FILTERS: ActivityCatalogFilters = {
  kind: 'all',
  cities: [],
}

export function countActiveActivityFilters(filters: ActivityCatalogFilters) {
  let n = 0
  if (filters.kind !== 'all') n += 1
  n += filters.cities.length
  return n
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
  cities: string[]
  cityCounts: Record<string, number>
  kinds: KindOption[]
  onSelectCity: (city: string, turningOn: boolean) => void
  resultCount: number
  compact?: boolean
}

export function ActivityFilterPanelBody({
  filters,
  onChange,
  onClear,
  cities,
  cityCounts,
  kinds,
  onSelectCity,
  resultCount,
  compact = false,
}: BodyProps) {
  const activeCount = countActiveActivityFilters(filters)
  const selectedCities = filters.cities ?? []
  const [moreCities, setMoreCities] = useState(false)
  const { pinned, rest } = splitPinnedCities(cities, (city) => city)
  const extraCities = moreCities
    ? rest
    : rest.filter((city) => selectedCities.includes(city))

  const allVietnamOn = selectedCities.length === 0

  function selectAllVietnam() {
    if (allVietnamOn) return
    onChange({ ...filters, cities: [] })
    onSelectCity('', false)
  }

  function toggleCity(city: string) {
    const turningOn = !selectedCities.includes(city)
    onChange({
      ...filters,
      cities: turningOn ? [city] : [],
    })
    onSelectCity(city, turningOn)
  }

  function setKind(next: ActivityKind) {
    onChange({ ...filters, kind: filters.kind === next ? 'all' : next })
  }

  const cityChips = (
    <>
      <button
        type="button"
        onClick={selectAllVietnam}
        aria-pressed={allVietnamOn}
        className={`rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold ${
          allVietnamOn
            ? 'bg-ink text-paper'
            : 'bg-cream text-ink ring-1 ring-ink/10 hover:bg-cream-deep'
        } ${compact ? 'px-2 py-1 text-[0.68rem]' : ''}`}
      >
        All Vietnam
      </button>
      {pinned.map((city) => (
        <FilterChip
          key={city}
          active={selectedCities.includes(city)}
          onClick={() => toggleCity(city)}
          className={compact ? 'px-2 py-1 text-[0.68rem]' : ''}
        >
          {city}
          {compact ? null : <span className="ml-1 opacity-70">{cityCounts[city] ?? 0}</span>}
        </FilterChip>
      ))}
      {extraCities.map((city) => (
        <FilterChip
          key={city}
          active={selectedCities.includes(city)}
          onClick={() => toggleCity(city)}
          className={compact ? 'px-2 py-1 text-[0.68rem]' : ''}
        >
          {city}
          {compact ? null : <span className="ml-1 opacity-70">{cityCounts[city] ?? 0}</span>}
        </FilterChip>
      ))}
      {rest.length > 0 ? (
        <button
          type="button"
          onClick={() => setMoreCities((v) => !v)}
          className="rounded-full px-2 py-1 text-[0.68rem] font-bold text-terracotta hover:underline"
        >
          {moreCities ? 'Fewer' : `+${rest.length} cities`}
        </button>
      ) : null}
    </>
  )

  const typeChips = kinds.map((k) => (
    <FilterChip
      key={k.id}
      active={filters.kind === k.id}
      onClick={() => setKind(k.id)}
      className={compact ? 'px-2 py-1 text-[0.68rem]' : ''}
    >
      {k.label}
    </FilterChip>
  ))

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted">
            Cities
          </span>
          {cityChips}
        </div>
        {kinds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted">
              Type
            </span>
            {typeChips}
          </div>
        ) : null}
      </div>
    )
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
        <div className="flex flex-wrap gap-1.5">{cityChips}</div>
      </div>

      {kinds.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-muted">
            Type
          </p>
          <div className="flex flex-wrap gap-1.5">{typeChips}</div>
        </div>
      ) : null}
    </div>
  )
}

export function ActivityFilterBar(
  props: BodyProps & { expanded?: boolean; onToggle?: () => void },
) {
  const { expanded, onToggle, ...body } = props
  const [localOpen, setLocalOpen] = useState(true)
  const open = expanded ?? localOpen
  const setOpen = onToggle ?? (() => setLocalOpen((v) => !v))
  const activeCount = countActiveActivityFilters(body.filters)

  return (
    <div className="flex items-start gap-3 py-1.5">
      <button
        type="button"
        onClick={setOpen}
        aria-expanded={open}
        aria-label={open ? 'Hide filters' : 'Show filters'}
        className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-full px-1 py-0.5 text-ink transition hover:bg-cream-deep"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-paper text-ink ring-1 ring-ink/8">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="text-[0.72rem] font-bold tracking-wide">{open ? 'Hide' : 'Show'}</span>
      </button>
      <div
        className="min-w-0 flex-1 overflow-hidden transition-[opacity,max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ maxHeight: open ? 220 : 0, opacity: open ? 1 : 0 }}
      >
        <ActivityFilterPanelBody {...body} compact />
      </div>
      {activeCount > 0 ? (
        <button
          type="button"
          onClick={body.onClear}
          className="mt-1 shrink-0 text-[0.7rem] font-bold text-terracotta hover:underline"
        >
          Clear
        </button>
      ) : null}
    </div>
  )
}
