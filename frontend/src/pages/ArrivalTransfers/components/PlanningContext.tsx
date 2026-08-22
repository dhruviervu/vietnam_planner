import type { Airport, AirportId, Destination, TimeBucket } from '../data/types'

type Props = {
  airports: Airport[]
  airportId: AirportId | null
  onSelectAirport: (id: AirportId | null) => void
  destinations: Destination[]
  destinationId: string | null
  onSelectDestination: (id: string) => void
  direction: 'inbound' | 'outbound'
  arrivalTime: TimeBucket
  onArrivalTime: (v: TimeBucket) => void
}

export function PlanningContext({
  airports,
  airportId,
  onSelectAirport,
  destinations,
  destinationId,
  onSelectDestination,
  direction,
  arrivalTime,
  onArrivalTime,
}: Props) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
          Planning for
        </h2>
        <p className="mt-1 text-[0.82rem] text-muted">
          Optional — browse Vietnam-wide first, then personalize by airport.
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onSelectAirport(null)}
            aria-pressed={!airportId}
            className={`shrink-0 rounded-full px-3 py-2 text-[0.72rem] font-bold transition ${
              !airportId
                ? 'bg-terracotta text-paper'
                : 'bg-cream text-ink ring-1 ring-ink/8 hover:text-terracotta'
            }`}
          >
            Vietnam · Typical
          </button>
          {airports.map((a) => {
            const on = airportId === a.id
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectAirport(a.id)}
                aria-pressed={on}
                className={`flex min-w-[132px] shrink-0 items-center gap-2 rounded-[12px] px-2 py-1.5 text-left transition ${
                  on
                    ? 'bg-terracotta/15 ring-2 ring-terracotta'
                    : 'bg-cream/80 ring-1 ring-ink/8 hover:bg-cream'
                }`}
              >
                <div className="h-9 w-9 overflow-hidden rounded-[8px]">
                  <img src={a.image} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="text-[0.72rem] font-bold text-ink">
                  {a.code} · {a.city === 'Ho Chi Minh City' ? 'HCMC' : a.city}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {airportId && destinations.length ? (
        <div>
          <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
            {direction === 'inbound' ? 'Where are you headed?' : 'Where are you leaving from?'}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {destinations.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDestination(d.id)}
                aria-pressed={destinationId === d.id}
                className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold transition ${
                  destinationId === d.id
                    ? 'bg-terracotta text-paper'
                    : 'bg-cream text-ink hover:text-terracotta'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
          When are you travelling?
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
      </div>
    </section>
  )
}
