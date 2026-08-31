import { useEffect, useState } from 'react'
import type {
  ExperienceFilters,
  LikingFilter,
  PracticalFilter,
} from '../services/recommendationEngine'
import { DEFAULT_FILTERS } from '../services/recommendationEngine'

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

export function countActiveExperienceFilters(filters: ExperienceFilters) {
  let n = 0
  if (filters.query) n += 1
  n += filters.likings.length
  n += filters.practical.length
  if (filters.region !== 'all') n += 1
  if (filters.duration !== 'all') n += 1
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
        showActive ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream-deep'
      } ${className}`}
    >
      {children}
    </button>
  )
}

/** City jump chips — highlight only when that section is in view (no sticky optimistic state). */
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

type BodyProps = {
  filters: ExperienceFilters
  onChange: (next: ExperienceFilters) => void
  onClear: () => void
  cities: string[]
  cityCounts: Record<string, number>
  regions: string[]
  activeCity: string | null
  onSelectCity: (city: string) => void
  resultCount: number
}

export function ExperienceFilterPanelBody({
  filters,
  onChange,
  onClear,
  cities,
  cityCounts,
  regions: _regions,
  activeCity,
  onSelectCity,
  resultCount,
}: BodyProps) {
  const activeCount = countActiveExperienceFilters(filters)
  const [moreCities, setMoreCities] = useState(false)
  const topCities = cities.slice(0, 6)
  const extraCities = cities.slice(6)
  const visibleCities = moreCities ? cities : topCities

  function toggleLiking(id: LikingFilter) {
    onChange({
      ...filters,
      likings: filters.likings.includes(id)
        ? filters.likings.filter((x) => x !== id)
        : [...filters.likings, id],
    })
  }

  function setDuration(next: ExperienceFilters['duration']) {
    onChange({ ...filters, duration: filters.duration === next ? 'all' : next })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Experience filters
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
        <p className="mt-1 text-[0.72rem] text-muted">Jump to a city on the page.</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleCities.map((city) => (
            <JumpChip key={city} active={activeCity === city} onClick={() => onSelectCity(city)}>
              {city}
              <span className="ml-1 opacity-70">{cityCounts[city] ?? 0}</span>
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
          Show me
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
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
      </section>

      <button
        type="button"
        onClick={() => onChange({ ...DEFAULT_FILTERS })}
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

export function ExperienceFilterPanel({
  expanded,
  filters,
  onChange,
  onClear,
  cities,
  cityCounts,
  regions,
  activeCity,
  onSelectCity,
  resultCount,
}: PanelProps) {
  const activeCount = countActiveExperienceFilters(filters)

  return (
    <div
      className="relative h-[calc(100vh-72px)] shrink-0 overflow-hidden border-r border-ink/8 bg-paper/90 backdrop-blur-sm transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ width: expanded ? 300 : 56, minWidth: 56 }}
    >
      {/* Keep body mounted so chip selection paints instantly without remount lag */}
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
          <ExperienceFilterPanelBody
            filters={filters}
            onChange={onChange}
            onClear={onClear}
            cities={cities}
            cityCounts={cityCounts}
            regions={regions}
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
