import type { Airport, Destination, TimeBucket, TransferDirection } from '../data/types'

type Props = {
  airport: Airport | null
  destination: Destination | null
  direction: TransferDirection
  arrivalTime: TimeBucket
}

function timeLabel(arrivalTime: TimeBucket): string | null {
  if (arrivalTime === 'not-set') return null
  if (arrivalTime === 'morning') return 'Morning'
  if (arrivalTime === 'afternoon') return 'Afternoon'
  if (arrivalTime === 'evening') return 'Evening'
  return 'Late night'
}

export function RouteContextBar({ airport, destination, direction, arrivalTime }: Props) {
  if (!airport) return null

  const destLabel = destination?.label ?? airport.cityHubLabel
  const inbound = direction === 'inbound'
  const when = timeLabel(arrivalTime)

  return (
    <div className="sticky top-16 z-20 -mx-1 mb-4 rounded-[12px] bg-paper/95 px-3 py-2 ring-1 ring-ink/8 backdrop-blur-sm">
      <p className="text-[0.78rem] font-bold text-ink">
        {inbound ? (
          <>
            ✈️ {airport.code} → 📍 {destLabel}
          </>
        ) : (
          <>
            📍 {destLabel} → ✈️ {airport.code}
          </>
        )}
        {when ? <span className="font-semibold text-muted"> · {when}</span> : null}
      </p>
    </div>
  )
}
