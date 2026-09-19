import type { EventFact } from '../data/seasonalEvents'

export function EventFactStack({ facts }: { facts: EventFact[] }) {
  if (facts.length === 0) return null
  return (
    <dl className="divide-y divide-ink/8 overflow-hidden rounded-[14px] bg-cream/70 ring-1 ring-ink/[0.06]">
      {facts.map((fact) => (
        <div
          key={`${fact.label}-${fact.value.slice(0, 24)}`}
          className="grid gap-0.5 px-3 py-2.5 sm:grid-cols-[7.25rem_minmax(0,1fr)] sm:items-start sm:gap-3"
        >
          <dt className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-sage">{fact.label}</dt>
          <dd className="text-[0.82rem] leading-[1.45] text-ink/88">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
