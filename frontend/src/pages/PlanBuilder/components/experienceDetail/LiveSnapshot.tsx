import type { ReactNode } from 'react'
import type { ExperienceLiveSignals } from '../../services/experienceLiveService'
import type { SignalLevel } from '../../types'

type Props = {
  live: ExperienceLiveSignals
}

function meter(level: SignalLevel) {
  return '●'.repeat(level) + '○'.repeat(5 - level)
}

export function LiveSnapshot({ live }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-sage/40 bg-sage/5 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-sage">
          Right now for your selected time
        </p>
        <span className="text-[0.68rem] font-bold text-sage">● Live</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Snap
          label="Crowd level"
          value={live.crowdLabel}
          meta={<span className="tracking-widest text-terracotta">{meter(live.crowdLevel)}</span>}
        />
        <Snap label="Weather" value={live.weather.label} meta={live.weather.detail} />
        <Snap label="Light" value={live.lightLabel} meta={live.atmosphereLabel} />
        <Snap label="Opening" value={live.openingLabel} />
        <Snap label="Guides" value={live.guideLabel} />
      </div>
      <p className="mt-2.5 text-[0.7rem] text-muted">Updated {live.updatedMinutesAgo} min ago</p>
    </div>
  )
}

function Snap({
  label,
  value,
  meta,
}: {
  label: string
  value: string
  meta?: ReactNode
}) {
  return (
    <div className="rounded-xl bg-paper/80 px-2.5 py-2">
      <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.82rem] font-semibold text-ink">{value}</p>
      {meta && <div className="mt-0.5 text-[0.7rem] text-muted">{meta}</div>}
    </div>
  )
}
