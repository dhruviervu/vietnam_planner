import { motion } from 'framer-motion'
import type { AccommodationType, StayStyle } from '../types'
import {
  STAY_PRIORITY_OPTIONS,
  countActiveStayFilters,
  type StayFiltersState,
  type StayPriority,
  type StayProximity,
} from '../lib/stayFilters'

const STYLE_OPTIONS: { id: StayStyle; label: string }[] = [
  { id: 'central', label: 'Central' },
  { id: 'quiet', label: 'Quiet' },
  { id: 'beachside', label: 'Beachside' },
  { id: 'adventure', label: 'Adventure Base' },
  { id: 'premium', label: 'Premium' },
]

const RATING_OPTIONS: { value: number; label: string }[] = [
  { value: 4.5, label: '4.5+' },
  { value: 4.0, label: '4.0+' },
  { value: 3.5, label: '3.5+' },
]

const PROXIMITY_OPTIONS: { id: StayProximity; label: string }[] = [
  { id: '1km', label: 'Within 1 km' },
  { id: '3km', label: 'Within 3 km' },
  { id: '5km', label: 'Within 5 km' },
  { id: 'any', label: 'Anywhere nearby' },
]

const TYPE_OPTIONS: { id: AccommodationType; label: string }[] = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'resort', label: 'Resort' },
  { id: 'guesthouse', label: 'Guesthouse' },
  { id: 'villa', label: 'Villa' },
  { id: 'hostel', label: 'Hostel' },
]

type BodyProps = {
  filters: StayFiltersState
  onChange: (next: StayFiltersState) => void
  onClear: () => void
  hasExperiences: boolean
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[0.78rem] font-bold transition-colors ${
        active ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream-deep'
      }`}
    >
      {children}
    </button>
  )
}

export function StayFilterPanelBody({
  filters,
  onChange,
  onClear,
  hasExperiences,
}: BodyProps) {
  const activeCount = countActiveStayFilters(filters)

  function setPriority(id: StayPriority) {
    onChange({ ...filters, priority: filters.priority === id ? null : id })
  }

  function toggleStyle(id: StayStyle) {
    const styles = filters.styles.includes(id)
      ? filters.styles.filter((s) => s !== id)
      : [...filters.styles, id]
    onChange({ ...filters, styles })
  }

  function toggleType(id: AccommodationType) {
    const types = filters.types.includes(id)
      ? filters.types.filter((t) => t !== id)
      : [...filters.types, id]
    onChange({ ...filters, types })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Stay filters
          </p>
          <p className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
            How do you want to explore?
          </p>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[0.78rem] font-bold text-terracotta hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <section>
        <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
          What matters most?
        </h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {STAY_PRIORITY_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              active={filters.priority === opt.id}
              onClick={() => setPriority(opt.id)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
          Stay style
        </h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              active={filters.styles.includes(opt.id)}
              onClick={() => toggleStyle(opt.id)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">Price</h3>
        <p className="mt-2 font-serif text-[1.05rem] font-semibold text-ink">
          ${filters.priceMin}
          <span className="mx-2 text-muted">—</span>$
          {filters.priceMax >= 250 ? '200+' : filters.priceMax}
          <span className="ml-1 text-[0.78rem] font-bold text-muted">/ night</span>
        </p>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="sr-only">Minimum nightly price</span>
            <input
              type="range"
              min={20}
              max={240}
              step={5}
              value={filters.priceMin}
              onChange={(e) => {
                const priceMin = Math.min(Number(e.target.value), filters.priceMax - 10)
                onChange({ ...filters, priceMin })
              }}
              className="w-full accent-terracotta"
            />
          </label>
          <label className="block">
            <span className="sr-only">Maximum nightly price</span>
            <input
              type="range"
              min={30}
              max={250}
              step={5}
              value={filters.priceMax}
              onChange={(e) => {
                const priceMax = Math.max(Number(e.target.value), filters.priceMin + 10)
                onChange({ ...filters, priceMax })
              }}
              className="w-full accent-terracotta"
            />
          </label>
        </div>
        <div className="mt-1 flex justify-between text-[0.72rem] font-bold text-muted">
          <span>$20</span>
          <span>$250+</span>
        </div>
      </section>

      <section>
        <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">Rating</h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {RATING_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.minRating === opt.value}
              onClick={() =>
                onChange({
                  ...filters,
                  minRating: filters.minRating === opt.value ? null : opt.value,
                })
              }
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </section>

      {hasExperiences && (
        <section className="rounded-2xl bg-cream/80 p-3.5">
          <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-sage">
            Proximity to my trip
          </h3>
          <p className="mt-1 text-[0.78rem] text-muted">
            Distance to your selected experiences.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {PROXIMITY_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                active={filters.proximity === opt.id}
                onClick={() => onChange({ ...filters, proximity: opt.id })}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
          Accommodation type
        </h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              active={filters.types.includes(opt.id)}
              onClick={() => toggleType(opt.id)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </section>
    </div>
  )
}

type Props = BodyProps & {
  expanded: boolean
}

export function StayFilterPanel({
  filters,
  onChange,
  onClear,
  hasExperiences,
  expanded,
}: Props) {
  const activeCount = countActiveStayFilters(filters)

  return (
    <motion.div
      layout
      initial={false}
      animate={{ width: expanded ? 300 : 56 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-[calc(100vh-72px)] shrink-0 overflow-hidden border-r border-ink/8 bg-paper/75 backdrop-blur-sm"
    >
      {expanded ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-ink/8 px-4 py-3">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink">
              Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <StayFilterPanelBody
              filters={filters}
              onChange={onChange}
              onClear={onClear}
              hasExperiences={hasExperiences}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center gap-3 px-1.5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cream text-ink shadow-soft">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
          </span>
          <p
            className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Filters{activeCount > 0 ? ` · ${activeCount}` : ''}
          </p>
        </div>
      )}
    </motion.div>
  )
}
