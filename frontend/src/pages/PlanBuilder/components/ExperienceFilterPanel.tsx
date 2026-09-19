import { useEffect, useState } from 'react'
import type {
  ExperienceFilters,
  LikingFilter,
  PracticalFilter,
} from '../services/recommendationEngine'

export const CATALOG_LIKING_CHIPS: { id: LikingFilter; label: string }[] = [
  { id: 'must-do', label: '🔥 Must Do' },
  { id: 'hidden-gem', label: '💎 Hidden Gems' },
  { id: 'local-life', label: '🏮 Local Life' },
]

export const LIKING_CHIPS: { id: LikingFilter; label: string }[] = [
  { id: 'must-do', label: '🔥 Must Do' },
  { id: 'vietnam-special', label: '🇻🇳 Vietnam Specials' },
  { id: 'hidden-gem', label: '💎 Hidden Gems' },
  { id: 'picture-perfect', label: '📸 Picture Perfect' },
  { id: 'slow-scenic', label: '🌿 Slow & Scenic' },
  { id: 'adventure', label: '⚡ Adventure' },
  { id: 'eat-drink', label: '🍜 Eat & Drink' },
  { id: 'local-life', label: '🏮 Local Life' },
  { id: 'culture-history', label: '🎭 Culture & History' },
]

export const DURATION_CHIPS: {
  id: Exclude<ExperienceFilters['duration'], 'all'>
  label: string
  range: string
}[] = [
  { id: 'short', label: 'Shorter', range: '30 min–1 hr' },
  { id: 'medium', label: 'A few hours', range: '1–3 hrs' },
  { id: 'longer', label: 'Longer', range: '3+ hrs' },
  { id: 'flexible', label: 'Your pace', range: 'no set time' },
]

export const PRACTICAL_CHIPS: { id: PracticalFilter; label: string }[] = [
  { id: 'Nature', label: 'Nature' },
  { id: 'Cities', label: 'City' },
  { id: 'Beaches', label: 'Beach' },
  { id: 'History', label: 'History' },
  { id: 'Culture', label: 'Culture' },
  { id: 'Food', label: 'Food' },
  { id: 'Nightlife', label: 'Nightlife' },
  { id: 'Adventure', label: 'Adventure' },
  { id: 'Museum', label: 'Museum' },
  { id: 'Temple', label: 'Temple' },
  { id: 'Fun', label: 'Fun' },
  { id: 'Family', label: 'Family' },
  { id: 'Free', label: 'Free' },
  { id: 'Photography', label: 'Photography' },
  { id: 'Market', label: 'Market' },
  { id: 'Viewpoint', label: 'Viewpoint' },
  { id: 'Cave', label: 'Cave' },
  { id: 'Hiking', label: 'Hiking' },
  { id: 'Architecture', label: 'Architecture' },
  { id: 'Cruise', label: 'Cruise / Boat' },
  { id: 'Water', label: 'Water' },
  { id: 'Spiritual', label: 'Spiritual' },
  { id: 'Shopping', label: 'Shopping' },
  { id: 'Wildlife', label: 'Wildlife' },
]

/** Headline cities first in catalog filters; everything else sits behind Expand. */
export const PINNED_FILTER_CITIES = [
  'Ho Chi Minh City',
  'Hanoi',
  'Sapa',
  'Hoi An',
  'Da Nang',
] as const

export function splitPinnedCities<T>(items: T[], nameOf: (item: T) => string): { pinned: T[]; rest: T[] } {
  const byName = new Map(items.map((item) => [nameOf(item), item]))
  const pinned = PINNED_FILTER_CITIES.map((name) => byName.get(name)).filter(
    (item): item is T => item != null,
  )
  const pinnedNames = new Set(pinned.map(nameOf))
  const rest = items.filter((item) => !pinnedNames.has(nameOf(item)))
  return { pinned, rest }
}

export function countActiveExperienceFilters(filters: ExperienceFilters) {
  let n = 0
  if (filters.query) n += 1
  n += filters.likings.length
  n += filters.practical.length
  n += filters.cities?.length ?? 0
  if (filters.region !== 'all') n += 1
  return n
}

export function FilterChip({
  active,
  onClick,
  children,
  className = '',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  const [optimistic, setOptimistic] = useState<boolean | null>(null)
  const showActive = optimistic ?? active

  useEffect(() => {
    setOptimistic(null)
  }, [active])

  return (
    <button
      type="button"
      onClick={() => {
        setOptimistic(!active)
        onClick()
      }}
      className={`rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold ${
        showActive
          ? 'bg-ink text-paper'
          : 'bg-cream text-ink ring-1 ring-ink/10 hover:bg-cream-deep'
      } ${className}`}
    >
      {children}
    </button>
  )
}

type BodyProps = {
  filters: ExperienceFilters
  onChange: (next: ExperienceFilters) => void
  onClear: () => void
  cities: string[]
  cityCounts: Record<string, number>
  regions: string[]
  onSelectCity: (city: string, turningOn: boolean) => void
  resultCount: number
}

export function ExperienceFilterPanelBody({
  filters,
  onChange,
  onClear,
  cities,
  cityCounts,
  regions: _regions,
  onSelectCity,
  resultCount,
}: BodyProps) {
  const activeCount = countActiveExperienceFilters(filters)
  const selectedCities = filters.cities ?? []
  const [moreCities, setMoreCities] = useState(false)
  const { pinned, rest } = splitPinnedCities(cities, (city) => city)
  const extraCities = moreCities
    ? rest
    : rest.filter((city) => selectedCities.includes(city))

  function toggleCity(city: string) {
    const turningOn = !selectedCities.includes(city)
    onChange({
      ...filters,
      cities: turningOn ? [...selectedCities, city] : selectedCities.filter((c) => c !== city),
    })
    onSelectCity(city, turningOn)
  }

  function toggleLiking(id: LikingFilter) {
    onChange({
      ...filters,
      likings: filters.likings.includes(id)
        ? filters.likings.filter((x) => x !== id)
        : [...filters.likings, id],
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.78rem] text-muted">
          {resultCount} sight{resultCount === 1 ? '' : 's'}
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
              key={city}
              active={selectedCities.includes(city)}
              onClick={() => toggleCity(city)}
            >
              {city}
              <span className="ml-1 opacity-70">{cityCounts[city] ?? 0}</span>
            </FilterChip>
          ))}
          {extraCities.map((city) => (
            <FilterChip
              key={city}
              active={selectedCities.includes(city)}
              onClick={() => toggleCity(city)}
            >
              {city}
              <span className="ml-1 opacity-70">{cityCounts[city] ?? 0}</span>
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
          Show me
        </p>
        <div className="flex flex-wrap gap-1.5">
        {CATALOG_LIKING_CHIPS.map((c) => (
          <FilterChip
            key={c.id}
            active={filters.likings.includes(c.id)}
            onClick={() => toggleLiking(c.id)}
          >
            {c.label}
          </FilterChip>
        ))}
        </div>
      </div>
    </div>
  )
}

export function ExperienceFilterBar(props: BodyProps) {
  const [open, setOpen] = useState(true)
  const activeCount = countActiveExperienceFilters(props.filters)

  return (
    <div className="rounded-[18px] border border-ink/8 bg-paper/90 px-3.5 py-2.5 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 text-left"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-cream text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
          </span>
          <span>
            <span className="block text-[0.78rem] font-bold text-ink">
              Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
            </span>
            <span className="block text-[0.68rem] text-muted">
              {open ? 'Hide' : 'Show cities and vibes'}
            </span>
          </span>
        </button>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={props.onClear}
            className="text-[0.72rem] font-bold text-terracotta hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0.35 }}
      >
        <div className="overflow-hidden">
          <div className="pt-3">
            <ExperienceFilterPanelBody {...props} />
          </div>
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

export function ExperienceFilterPanel({
  expanded,
  onToggle,
  filters,
  onChange,
  onClear,
  cities,
  cityCounts,
  regions,
  onSelectCity,
  resultCount,
}: PanelProps) {
  const activeCount = countActiveExperienceFilters(filters)

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
        <ExperienceFilterPanelBody
          filters={filters}
          onChange={onChange}
          onClear={onClear}
          cities={cities}
          cityCounts={cityCounts}
          regions={regions}
          onSelectCity={onSelectCity}
          resultCount={resultCount}
        />
      </div>
    </div>
  )
}
