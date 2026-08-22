import type { ArrivalContext, TransportMode } from '../data/types'
import type {
  SmartAdvice,
  StayPathAdvice,
  StayTransferContext,
} from '../data/tripAirportIntelligence'

type Props = {
  advice: SmartAdvice
  stay: StayTransferContext | null
  stayPath: StayPathAdvice | null
  recommendedMode: TransportMode | null
  direction: ArrivalContext['direction']
}

export function SmartTransferGuide({
  advice,
  stay,
  stayPath,
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

      {stay && stayPath ? (
        <div className="rounded-[22px] border border-terracotta/20 bg-gradient-to-br from-terracotta/[0.08] via-paper to-cream/70 px-5 py-5 shadow-soft sm:px-6">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Because you have a stay
          </p>
          <h3 className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">{stayPath.title}</h3>
          <p className="mt-1 text-[0.82rem] text-muted">
            Two calm ways to use the transfer — neither needs to be perfect, both can feel intentional.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-[16px] bg-paper/90 px-4 py-4 ring-1 ring-ink/8">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink/55">
                Option A
              </p>
              <p className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">
                {stayPath.directTitle}
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">{stayPath.directBody}</p>
            </article>
            <article className="rounded-[16px] bg-paper/90 px-4 py-4 ring-1 ring-ink/8">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink/55">
                Option B
              </p>
              <p className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">
                {stayPath.exploreTitle}
              </p>
              <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">{stayPath.exploreBody}</p>
            </article>
          </div>

          <p className="mt-4 text-[0.8rem] font-semibold text-terracotta-deep">{stayPath.tip}</p>
        </div>
      ) : null}
    </section>
  )
}
