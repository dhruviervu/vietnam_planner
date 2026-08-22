import type { ArrivalContext, ProviderOption, TransportMode } from '../data/types'
import { formatCostRange, formatTimeRange } from '../data/catalog'
import { ourPickReasons } from '../data/recommendation'

export type PickPanelKind = 'our-pick' | 'selected-mode' | 'selected-transfer'

type Props = {
  kind: PickPanelKind
  recommendedMode: TransportMode
  selectedMode: TransportMode
  selectedOption: ProviderOption | null
  cityLabel: string
  ctx: ArrivalContext
  tripHint?: string | null
  onBrowse: () => void
}

export function OurPick({
  kind,
  recommendedMode,
  selectedMode,
  selectedOption: _selectedOption,
  cityLabel,
  ctx,
  tripHint,
  onBrowse,
}: Props) {
  if (kind === 'selected-mode') {
    return (
      <section id="our-pick" className="scroll-mt-24">
        <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
          Your Selected Mode
        </h2>
        <div className="mt-4 border-t border-ink/10 pt-4">
          <p className="font-serif text-[1.3rem] font-semibold text-ink">
            {selectedMode.symbol} {selectedMode.label}
          </p>
          <p className="mt-3 max-w-[54ch] text-[0.8rem] font-medium text-muted">
            Our recommendation remains {recommendedMode.symbol} {recommendedMode.label} because it
            offers a stronger overall fit for this route and timing.
          </p>
          <BrowseBtn onClick={onBrowse} />
        </div>
      </section>
    )
  }

  const reasons = ourPickReasons(recommendedMode, ctx, tripHint)
  const routeBit =
    ctx.routeDestinationLabel && ctx.routeAirportCode
      ? ctx.direction === 'outbound'
        ? `${ctx.routeDestinationLabel} → ${ctx.routeAirportCode}`
        : `${ctx.routeAirportCode} → ${ctx.routeDestinationLabel}`
      : null
  const blurb =
    ctx.direction === 'outbound'
      ? routeBit
        ? `Best overall return for ${routeBit} on your current profile.`
        : 'Best overall way back to the airport for your current journey.'
      : routeBit
        ? `Best overall for ${routeBit} given your timing and travel profile.`
        : `Best overall for your journey into ${cityLabel}.`

  return (
    <section id="our-pick" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        What We&apos;d Choose For You
      </h2>
      <div className="mt-4 overflow-hidden rounded-[18px] bg-gradient-to-br from-terracotta/[0.1] via-paper to-cream/80 px-4 py-5 ring-1 ring-terracotta/20 sm:px-5">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          ⭐ Our Pick
        </p>
        <p className="mt-2 font-serif text-[clamp(1.25rem,2.4vw,1.5rem)] font-semibold text-ink">
          {recommendedMode.symbol} {recommendedMode.label}
        </p>
        <p className="mt-1 text-[0.9rem] font-semibold text-ink/80">{blurb}</p>
        <ul className="mt-3.5 space-y-1.5">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2 text-[0.85rem] font-semibold text-ink">
              <span className="text-sage">✓</span>
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-3.5 flex flex-wrap gap-x-4 text-[0.88rem] font-bold text-ink">
          <span>{formatCostRange(recommendedMode)}</span>
          <span>{formatTimeRange(recommendedMode.timeMin)}</span>
          <span>♿ {recommendedMode.accessibilityLevel}</span>
        </div>
        <p className="mt-3 max-w-[54ch] text-[0.82rem] font-medium text-ink/80">
          {routeBit
            ? `Strongest balance of availability, convenience and fit for ${routeBit}.`
            : 'Strongest balance of availability, convenience and fit for this context.'}
        </p>
        <BrowseBtn onClick={onBrowse} />
      </div>
    </section>
  )
}

function BrowseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 rounded-full bg-terracotta px-4 py-2 text-[0.78rem] font-bold text-paper"
    >
      Other travel options →
    </button>
  )
}
