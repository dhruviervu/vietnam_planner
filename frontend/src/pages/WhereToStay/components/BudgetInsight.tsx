import { costLevelLabel } from '../data/ranking'
import type { StayCluster } from '../data/types'

type Props = {
  clusters: StayCluster[]
  cityLabel: string
}

export function BudgetInsight({ clusters, cityLabel }: Props) {
  const ordered = [...clusters].sort((a, b) => a.costLevel - b.costLevel || a.name.localeCompare(b.name))

  return (
    <section className="rounded-[14px] bg-cream/70 px-3.5 py-3 ring-1 ring-ink/8">
      <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
        Where your stay budget goes furthest · {cityLabel}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {ordered.map((c) => (
          <div key={c.id} className="flex items-baseline gap-1.5 text-[0.75rem]">
            <span className="font-bold text-terracotta">{costLevelLabel(c.costLevel)}</span>
            <span className="font-semibold text-ink">{c.name}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[0.68rem] leading-snug text-muted">
        Rough cost bands only — central and landmark areas usually cost more for access. Confirm
        live rates when you book.
      </p>
    </section>
  )
}
