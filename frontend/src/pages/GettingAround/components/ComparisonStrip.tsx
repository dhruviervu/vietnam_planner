import type { TransportMode } from '../data/types'

type Props = {
  modes: TransportMode[]
  kind: 'long' | 'urban' | 'water'
}

export function ComparisonStrip({ modes, kind }: Props) {
  const list = modes.slice(0, 5)
  if (list.length < 2) return null

  return (
    <div className="mt-8 rounded-[18px] bg-cream/55 px-4 py-4 ring-1 ring-ink/8 sm:px-5">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
        {kind === 'long'
          ? 'Door-to-door comparison'
          : kind === 'urban'
            ? 'Urban snapshot'
            : 'Water snapshot'}{' '}
        · TYPICAL
      </p>
      <div className="mt-4 space-y-3">
        {list.map((m) => {
          const value =
            kind === 'long'
              ? (m.doorToDoorMinutes[0] + m.doorToDoorMinutes[1]) / 2
              : (m.vehicleMinutes[0] + m.vehicleMinutes[1]) / 2
          const max = Math.max(
            ...list.map((x) =>
              kind === 'long'
                ? (x.doorToDoorMinutes[0] + x.doorToDoorMinutes[1]) / 2
                : (x.vehicleMinutes[0] + x.vehicleMinutes[1]) / 2,
            ),
          )
          const pct = Math.max(14, Math.round((value / max) * 100))
          return (
            <div key={m.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[0.85rem] font-bold text-ink">
                  {m.symbol} {m.shortLabel}
                </p>
                <p className="text-[0.72rem] font-semibold text-muted">
                  {kind === 'long'
                    ? `${m.doorToDoorLabel} · ${m.costLabel} · ${m.transfers} transfers`
                    : kind === 'urban'
                      ? `${m.vehicleTimeLabel} · ${m.costLabel}${
                          m.trafficSensitivity ? ` · Traffic ${m.trafficSensitivity}` : ''
                        }`
                      : `${m.vehicleTimeLabel} · ${m.costLabel}${
                          m.weatherSensitive ? ' · Weather-aware' : ''
                        }`}
                </p>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper ring-1 ring-ink/8">
                <div className="h-full rounded-full bg-terracotta/65" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
