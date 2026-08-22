import { useEffect, useState } from 'react'
import type {
  ExperienceFilters,
  LikingFilter,
  PracticalFilter,
} from '../services/recommendationEngine'
import { DEFAULT_FILTERS } from '../services/recommendationEngine'

const LIKING_CHIPS: { id: LikingFilter; label: string }[] = [
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

const PRACTICAL_CHIPS: { id: PracticalFilter; label: string }[] = [
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
  if (filters.cost !== 'all') n += 1
  if (filters.accessibility !== 'all') n += 1
  if (filters.bestTime !== 'all') n += 1
  if (filters.minFit > 0) n += 1
  return n
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
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
      }`}
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
  regions,
  activeCity,
  onSelectCity,
  resultCount,
}: BodyProps) {
  const activeCount = countActiveExperienceFilters(filters)

  function toggleLiking(id: LikingFilter) {
    onChange({
      ...filters,
      likings: filters.likings.includes(id)
        ? filters.likings.filter((x) => x !== id)
        : [...filters.likings, id],
    })
  }

  function togglePractical(id: PracticalFilter) {
    onChange({
      ...filters,
      practical: filters.practical.includes(id)
        ? filters.practical.filter((x) => x !== id)
        : [...filters.practical, id],
    })
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

      <label className="block">
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Search
        </span>
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search experiences"
          className="mt-1.5 w-full rounded-[10px] border border-ink/10 bg-cream/80 px-3 py-2 text-[0.84rem] text-ink outline-none focus:border-terracotta/40"
        />
      </label>

      <section>
        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Explore by city
        </h3>
        <p className="mt-1 text-[0.72rem] text-muted">
          Jump to a city — the full page stays visible with every city section.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cities.map((city) => {
            const inView = activeCity === city
            return (
              <JumpChip key={city} active={inView} onClick={() => onSelectCity(city)}>
                {city}
                <span className="ml-1 opacity-70">{cityCounts[city] ?? 0}</span>
              </JumpChip>
            )
          })}
        </div>
      </section>

      <section>
        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          How do you want to feel it?
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {LIKING_CHIPS.map((c) => (
            <Chip
              key={c.id}
              active={filters.likings.includes(c.id)}
              onClick={() => toggleLiking(c.id)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Type & theme
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRACTICAL_CHIPS.map((c) => (
            <Chip
              key={c.id}
              active={filters.practical.includes(c.id)}
              onClick={() => togglePractical(c.id)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Practical
        </h3>
        <FilterSelect
          label="Region"
          value={filters.region}
          onChange={(v) => onChange({ ...filters, region: v })}
          options={[
            { value: 'all', label: 'All regions' },
            ...regions.map((r) => ({ value: r, label: r })),
          ]}
        />
        <FilterSelect
          label="Duration"
          value={filters.duration}
          onChange={(v) =>
            onChange({ ...filters, duration: v as ExperienceFilters['duration'] })
          }
          options={[
            { value: 'all', label: 'Any length' },
            { value: 'short', label: 'Under 2.5 hrs' },
            { value: 'half', label: 'Half day' },
            { value: 'full', label: 'Full day' },
          ]}
        />
        <FilterSelect
          label="Cost"
          value={filters.cost}
          onChange={(v) => onChange({ ...filters, cost: v as ExperienceFilters['cost'] })}
          options={[
            { value: 'all', label: 'Any cost' },
            { value: 'free-low', label: 'Free – $15' },
            { value: 'mid', label: '$15 – $55' },
            { value: 'high', label: '$55+' },
          ]}
        />
        <FilterSelect
          label="Accessibility"
          value={filters.accessibility}
          onChange={(v) =>
            onChange({
              ...filters,
              accessibility: v as ExperienceFilters['accessibility'],
            })
          }
          options={[
            { value: 'all', label: 'Any' },
            { value: 'wheelchair', label: 'Wheelchair-friendly' },
            { value: 'easy-walk', label: 'Easy walking' },
            { value: 'limited-walk', label: 'Limited walking' },
          ]}
        />
        <FilterSelect
          label="Best time"
          value={filters.bestTime}
          onChange={(v) =>
            onChange({ ...filters, bestTime: v as ExperienceFilters['bestTime'] })
          }
          options={[
            { value: 'all', label: 'Any time' },
            { value: 'morning', label: 'Morning' },
            { value: 'afternoon', label: 'Afternoon' },
            { value: 'evening', label: 'Evening' },
          ]}
        />
        <FilterSelect
          label="Min trip fit"
          value={String(filters.minFit)}
          onChange={(v) => onChange({ ...filters, minFit: Number(v) })}
          options={[
            { value: '0', label: 'Any fit' },
            { value: '70', label: '70%+' },
            { value: '80', label: '80%+' },
            { value: '90', label: '90%+' },
          ]}
        />
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block text-[0.78rem]">
      <span className="font-bold text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-[10px] border border-ink/10 bg-paper px-2.5 py-2 text-ink outline-none focus:border-terracotta/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
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
