import type { CostTotals } from '../types'

type Props = {
  totals: CostTotals
  title?: string
}

export function CostSummary({ totals, title = 'Trip total' }: Props) {
  const rows = [
    { label: 'Activities', value: totals.activities },
    { label: 'Stay', value: totals.stay },
    { label: 'Food', value: totals.food },
    { label: 'Transport', value: totals.transport },
    { label: 'Shopping', value: totals.shopping },
  ]

  return (
    <aside className="rounded-[24px] bg-paper p-5 shadow-card">
      <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-sage">
        Cost overview
      </p>
      <h3 className="mb-4 font-serif text-[1.4rem] font-semibold text-ink">{title}</h3>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between text-[0.95rem]">
            <span className="text-muted">{row.label}</span>
            <span className="font-semibold text-ink">${row.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
        <span className="font-serif text-[1.15rem] font-semibold text-ink">Trip total</span>
        <span className="font-serif text-[1.5rem] font-semibold text-terracotta">
          ${totals.total}
        </span>
      </div>
      <p className="mt-2 text-[0.78rem] text-muted">Mock USD estimates — updates as you edit.</p>
    </aside>
  )
}
