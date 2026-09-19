import type { ArrivalContext, TransportMode } from '../data/types'
import type { SmartAdvice } from '../data/tripAirportIntelligence'

type Props = {
  advice: SmartAdvice
  recommendedMode: TransportMode | null
  direction: ArrivalContext['direction']
}

export function SmartTransferGuide({
  advice,
  recommendedMode,
  direction,
}: Props) {
  return (
    <section className="scroll-mt-28 space-y-5">
      <div>
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          Smart recommendation
        </p>
        <h2 className="mt-1 font-serif text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold text-ink">
          {advice.headline}
        </h2>
        <p className="mt-2 max-w-[58ch] text-[0.92rem] leading-relaxed text-muted">
          {advice.summary}
        </p>
        {advice.tripNudge ? (
          <p className="mt-3 max-w-[54ch] rounded-[14px] border border-terracotta/20 bg-terracotta/[0.06] px-3.5 py-2.5 text-[0.84rem] font-semibold leading-snug text-terracotta-deep">
            {advice.tripNudge}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[22px] border border-ink/8 bg-gradient-to-br from-paper via-cream/50 to-sage/[0.07] shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
              Best fit right now
            </p>
            <p className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">
              {recommendedMode
                ? `${recommendedMode.symbol} ${recommendedMode.label}`
                : advice.modeHint}
            </p>
          </div>
          <p className="text-[0.78rem] font-semibold text-muted">
            {direction === 'inbound' ? 'Airport → city' : 'City → airport'}
          </p>
        </div>
        <ul className="space-y-2.5 px-5 py-4">
          {advice.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-[0.88rem] leading-snug text-ink">
              <span className="mt-0.5 text-sage" aria-hidden>
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
