import type { TimeBucket } from '../data/types'

type Props = {
  arrivalTime: TimeBucket
  onArrivalTime: (v: TimeBucket) => void
}

export function PlanningContext({ arrivalTime, onArrivalTime }: Props) {
  return (
    <section>
      <h3 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
        <span>When are you travelling?</span>
        <span className="normal-case tracking-normal text-[0.78rem] font-medium text-muted">
          may affect availability and routes — always confirm before booking.
        </span>
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(
          [
            ['not-set', 'Typical timing'],
            ['morning', 'Morning'],
            ['afternoon', 'Afternoon'],
            ['evening', 'Evening'],
            ['late', 'Late night'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onArrivalTime(id)}
            aria-pressed={arrivalTime === id}
            className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold transition ${
              arrivalTime === id
                ? 'bg-terracotta text-paper'
                : 'bg-cream text-ink hover:text-terracotta'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
