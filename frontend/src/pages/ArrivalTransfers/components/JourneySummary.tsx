import type { Airport, Destination, TransferDirection, TimeBucket, DataConfidence } from '../data/types'
import { formatTimeRange } from '../data/catalog'

type Props = {
  airport: Airport | null
  destination: Destination | null
  cityLabel: string
  direction: TransferDirection
  arrivalTime: TimeBucket
  distanceKm: number | null
  timeMin: [number, number] | null
  isTypical: boolean
  bufferHours?: [number, number]
  dataState?: DataConfidence
  tripHint?: string | null
}

function confidenceLabel(dataState: DataConfidence | undefined, isTypical: boolean): string {
  if (dataState === 'current') return 'LIVE'
  if (dataState === 'estimated') return 'ESTIMATED'
  if (dataState === 'unknown') return 'UNKNOWN'
  if (isTypical || !dataState || dataState === 'typical') return 'TYPICAL'
  return 'TYPICAL'
}

export function JourneySummary({
  airport,
  destination,
  cityLabel,
  direction,
  arrivalTime,
  distanceKm,
  timeMin,
  isTypical,
  bufferHours,
  dataState,
  tripHint,
}: Props) {
  const inbound = direction === 'inbound'
  const fromLabel = inbound
    ? airport
      ? `✈️ ${airport.name}`
      : '✈️ Vietnam airports (typical)'
    : `📍 ${destination?.label ?? cityLabel}`
  const toLabel = inbound
    ? `📍 ${destination?.label ?? cityLabel}`
    : airport
      ? `✈️ ${airport.name}`
      : '✈️ Vietnam airports (typical)'
  const confidence = confidenceLabel(dataState, isTypical)

  return (
    <section>
      <h2 className="font-serif text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-ink">
        Your Journey
      </h2>
      <div className="mt-3 flex flex-wrap items-start gap-x-8 gap-y-3 border-t border-ink/10 pt-3">
        <div>
          <p className="text-[0.95rem] font-bold text-ink">{fromLabel}</p>
          <p className="my-1 text-terracotta" aria-hidden>
            ↓
          </p>
          <p className="text-[0.95rem] font-bold text-ink">{toLabel}</p>
        </div>
        <div className="space-y-1 text-[0.82rem] font-semibold text-ink/80">
          <p>
            ⏱ {timeMin ? formatTimeRange(timeMin) : '25–60 min'}
            <span className="ml-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-muted">
              · {confidence}
            </span>
          </p>
          {distanceKm != null ? <p>📍 ~{distanceKm} km</p> : null}
          <p>
            🕐{' '}
            {arrivalTime === 'not-set'
              ? 'Typical journey estimate'
              : `${arrivalTime.charAt(0).toUpperCase()}${arrivalTime.slice(1)} timing`}
          </p>
          {destination && airport ? (
            <p className="text-[0.72rem] font-medium text-muted">
              Route context: {airport.code} · {destination.label}
            </p>
          ) : (
            <p className="text-[0.72rem] font-medium text-muted">
              Example context — select an airport to personalize.
            </p>
          )}
          {tripHint ? (
            <p className="mt-1 max-w-[42ch] text-[0.78rem] font-semibold text-terracotta-deep">
              {tripHint}
            </p>
          ) : null}
        </div>
      </div>

      {!inbound && bufferHours ? (
        <div className="mt-4 border-l-2 border-terracotta/40 pl-3">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-terracotta">
            Airport buffer
          </p>
          <p className="mt-1 text-[0.85rem] font-semibold text-ink">
            Allow roughly {bufferHours[0]}–{bufferHours[1]} hours at the airport before an
            international departure.
          </p>
          <p className="mt-1 text-[0.72rem] font-medium text-muted">
            Planning estimate — not airline-specific. For a 14:30 flight, suggested city departure
            around 10:30–11:00.
          </p>
        </div>
      ) : null}
    </section>
  )
}
