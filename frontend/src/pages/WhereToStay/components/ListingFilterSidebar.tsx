import {
  LISTING_FILTER_CATEGORIES,
  LISTING_FILTER_LABELS,
  SORT_OPTIONS,
} from '../data/labels'
import type { StayListingFilterId, StaySortId } from '../data/types'

type Props = {
  selected: StayListingFilterId[]
  onToggle: (id: StayListingFilterId) => void
  onClear: () => void
  sort: StaySortId
  onSort: (id: StaySortId) => void
  resultCount: number
}

export function ListingFilterSidebar({
  selected,
  onToggle,
  onClear,
  sort,
  onSort,
  resultCount,
}: Props) {
  return (
    <aside className="rounded-[3px] border border-ink/10 bg-paper">
      <div className="border-b border-ink/10 px-3.5 py-3">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          Stay filters
        </p>
        <p className="mt-1 text-[0.78rem] font-semibold text-ink">
          {resultCount} stay{resultCount === 1 ? '' : 's'}
        </p>
        {selected.length ? (
          <button
            type="button"
            onClick={onClear}
            className="mt-1 text-[0.7rem] font-bold text-muted hover:text-terracotta"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="border-b border-ink/10 px-3.5 py-3">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Sort</p>
        <div className="mt-2 space-y-1">
          {SORT_OPTIONS.map((opt) => {
            const on = sort === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSort(opt.id)}
                className={`flex w-full rounded-[2px] px-2 py-1.5 text-left text-[0.74rem] font-bold transition ${
                  on ? 'bg-terracotta text-paper' : 'text-ink/75 hover:bg-ink/[0.04]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="max-h-[70vh] space-y-4 overflow-y-auto px-3.5 py-3">
        {LISTING_FILTER_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
              {cat.label}
            </p>
            <div className="mt-2 space-y-1">
              {cat.filters.map((id) => {
                const on = selected.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onToggle(id)}
                    className={`flex w-full items-center gap-2 rounded-[2px] px-2 py-1.5 text-left text-[0.74rem] transition ${
                      on
                        ? 'bg-ink/[0.06] font-bold text-ink'
                        : 'text-ink/75 hover:bg-ink/[0.03]'
                    }`}
                  >
                    <span
                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border text-[0.55rem] ${
                        on
                          ? 'border-terracotta bg-terracotta text-paper'
                          : 'border-ink/25 bg-paper'
                      }`}
                      aria-hidden
                    >
                      {on ? '✓' : ''}
                    </span>
                    {LISTING_FILTER_LABELS[id]}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
