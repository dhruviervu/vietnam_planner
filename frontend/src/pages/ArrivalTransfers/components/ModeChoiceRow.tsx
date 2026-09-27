import type { ReactNode } from 'react'
import type { ModeEvaluation, TransportModeId } from '../data/types'
import { ALL_MODE_IDS } from '../data/modes'
import { formatCostCompact, formatTimeRange } from '../data/catalog'

type Props = {
  evaluations: ModeEvaluation[]
  recommendedId: TransportModeId | null
  selectedId: TransportModeId | null
  onPick: (id: TransportModeId) => void
  toolbar?: ReactNode
}

export function ModeChoiceRow({ evaluations, recommendedId, selectedId, onPick, toolbar }: Props) {
  return (
    <section>
      <div>
        <h2 className="font-serif text-[clamp(1.35rem,2.6vw,1.7rem)] font-semibold text-ink">
          Ways to make this trip
        </h2>
        <p className="mt-1 max-w-[60ch] text-[0.82rem] text-muted">
          One row, every real option. Tap a card to jump to how it actually works.
        </p>
      </div>
      {toolbar ? <div className="mt-3">{toolbar}</div> : null}
      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {ALL_MODE_IDS.map((id) => evaluations.find((ev) => ev.mode.id === id))
          .filter((ev): ev is ModeEvaluation => Boolean(ev))
          .map((ev) => {
            const rec = ev.mode.id === recommendedId
            const on = ev.mode.id === selectedId
            return (
              <button
                key={ev.mode.id}
                type="button"
                onClick={() => onPick(ev.mode.id)}
                className={`min-w-[14.5rem] snap-start overflow-hidden rounded-[18px] bg-paper text-left shadow-soft ring-1 transition md:min-w-0 ${
                  on ? 'ring-2 ring-terracotta' : rec ? 'ring-terracotta/50' : 'ring-ink/8 hover:ring-ink/16'
                }`}
              >
                <div className="relative h-[7.2rem] overflow-hidden">
                  <img src={ev.mode.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-full bg-paper/92 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-ink">
                    {ev.mode.symbol} {ev.mode.shortLabel}
                  </span>
                  {rec ? (
                    <span className="absolute right-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-paper">
                      Best fit
                    </span>
                  ) : null}
                </div>
                <div className="px-3 py-3">
                  <p className="font-serif text-[1.02rem] font-semibold leading-tight text-ink">{ev.mode.label}</p>
                  <p className="mt-1.5 text-[0.8rem] font-semibold text-ink/80">
                    {formatTimeRange(ev.mode.timeMin)}
                    <span className="mx-1.5 text-ink/25">·</span>
                    {formatCostCompact(ev.mode)}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[0.72rem] font-medium leading-snug text-muted">
                    {ev.mode.whyChoose[0]}
                  </p>
                </div>
              </button>
            )
          })}
      </div>
    </section>
  )
}
