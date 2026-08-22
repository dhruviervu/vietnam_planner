import { FILTER_LABELS } from '../data/labels'
import type { StayFilterId } from '../data/types'

type Props = {
  available: StayFilterId[]
  selected: StayFilterId[]
  onToggle: (id: StayFilterId) => void
}

export function FilterBar({ available, selected, onToggle }: Props) {
  return (
    <section className="rounded-[3px] border border-ink/10 bg-paper px-4 py-3.5 sm:px-5">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
        Step 2 · Neighbourhood fit
      </p>
      <p className="mt-1 font-serif text-[1.15rem] text-ink">What matters in this city?</p>
      <p className="mt-1 text-[0.76rem] text-muted">
        These re-rank map clusters — they don’t hide areas.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {available.map((id) => {
          const on = selected.includes(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className={`rounded-[3px] px-3 py-1.5 text-[0.74rem] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                on
                  ? 'bg-terracotta text-paper'
                  : 'bg-ink/[0.04] text-ink/80 hover:bg-ink/[0.07]'
              }`}
            >
              {FILTER_LABELS[id]}
            </button>
          )
        })}
      </div>
    </section>
  )
}
