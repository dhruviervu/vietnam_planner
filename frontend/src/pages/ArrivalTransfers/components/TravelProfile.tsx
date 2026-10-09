import type { ArrivalContext } from '../data/types'

type Props = {
  passengers: number
  luggageLevel: ArrivalContext['luggageLevel']
  onPassengers: (n: number) => void
  onLuggage: (v: ArrivalContext['luggageLevel']) => void
}

export function TravelProfile({
  passengers,
  luggageLevel,
  onPassengers,
  onLuggage,
}: Props) {
  return (
    <section className="rounded-[20px] bg-cream/80 p-4 ring-1 ring-ink/8 sm:p-5">
      <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
        Filters that change the ranking
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[0.78rem] font-semibold text-ink">Party size</p>
          <p className="mt-0.5 text-[0.72rem] text-muted">
            5+ people lift private cars; solo trips favour apps and the bus.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onPassengers(n)}
                className={`h-9 min-w-9 rounded-full px-2 text-[0.78rem] font-bold ${
                  passengers === n ? 'bg-terracotta text-paper' : 'bg-paper text-ink ring-1 ring-ink/10'
                }`}
              >
                {n === 6 ? '6+' : n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[0.78rem] font-semibold text-ink">Luggage</p>
          <p className="mt-0.5 text-[0.72rem] text-muted">
            Heavy bags push you off the bus and toward taxis or a booked car.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(['light', 'medium', 'heavy'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onLuggage(v)}
                className={`rounded-full px-3.5 py-2 text-[0.75rem] font-bold capitalize ${
                  luggageLevel === v
                    ? 'bg-terracotta text-paper'
                    : 'bg-paper text-ink ring-1 ring-ink/10'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
