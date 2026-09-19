import type { Airport, Destination, TimeBucket, TransferDirection } from '../data/types'

type Props = {
  airport: Airport | null
  destination: Destination | null
  destinations: Destination[]
  direction: TransferDirection
  arrivalTime: TimeBucket
  onSelectDestination: (id: string) => void
}

function timeLabel(arrivalTime: TimeBucket): string | null {
  if (arrivalTime === 'not-set') return null
  if (arrivalTime === 'morning') return 'Morning'
  if (arrivalTime === 'afternoon') return 'Afternoon'
  if (arrivalTime === 'evening') return 'Evening'
  return 'Late night'
}

export function RouteContextBar({
  airport,
  destination,
  destinations,
  direction,
  arrivalTime,
  onSelectDestination,
}: Props) {
  if (!airport) return null

  const destLabel = destination?.label ?? airport.cityHubLabel
  const inbound = direction === 'inbound'
  const when = timeLabel(arrivalTime)
  const destValue = destination?.id ?? ''

  return (
    <div className="mb-4 rounded-[12px] bg-paper px-3 py-2.5 ring-1 ring-ink/8">
      <div className="flex flex-wrap items-center gap-2">
        {inbound ? (
          <>
            <p className="text-[0.78rem] font-bold text-ink">
              ✈️ {airport.code}
              <span className="mx-1.5 text-terracotta">→</span>
            </p>
            {destinations.length ? (
              <label className="min-w-0 flex-1">
                <span className="sr-only">Where you are going from the airport</span>
                <select
                  value={destValue}
                  onChange={(e) => {
                    if (e.target.value) onSelectDestination(e.target.value)
                  }}
                  className="w-full max-w-[18rem] rounded-[10px] bg-cream/90 px-2.5 py-1.5 text-[0.78rem] font-bold text-ink ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  {!destValue ? (
                    <option value="">{airport.cityHubLabel}</option>
                  ) : null}
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      📍 {d.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="text-[0.78rem] font-bold text-ink">📍 {destLabel}</p>
            )}
          </>
        ) : (
          <>
            {destinations.length ? (
              <label className="min-w-0 flex-1">
                <span className="sr-only">Where you are leaving from</span>
                <select
                  value={destValue}
                  onChange={(e) => {
                    if (e.target.value) onSelectDestination(e.target.value)
                  }}
                  className="w-full max-w-[18rem] rounded-[10px] bg-cream/90 px-2.5 py-1.5 text-[0.78rem] font-bold text-ink ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  {!destValue ? (
                    <option value="">{airport.cityHubLabel}</option>
                  ) : null}
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      📍 {d.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="text-[0.78rem] font-bold text-ink">📍 {destLabel}</p>
            )}
            <p className="text-[0.78rem] font-bold text-ink">
              <span className="mx-1.5 text-terracotta">→</span>
              ✈️ {airport.code}
            </p>
          </>
        )}
        {when ? <span className="text-[0.78rem] font-semibold text-muted">· {when}</span> : null}
      </div>
    </div>
  )
}
