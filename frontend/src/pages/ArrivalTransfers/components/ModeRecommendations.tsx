import { catalogProviders } from '../data/providerCatalog'
import { formatCostCompact, formatTimeRange } from '../data/catalog'
import { ourPickReasons } from '../data/recommendation'
import type { ArrivalContext, TransportMode, TransportModeId } from '../data/types'
import { ProviderCatalog } from './ProviderCatalog'
import type { BookingRoute } from '../data/bookingLinks'
import { modeDetailHref } from '../data/bookingLinks'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'

type Props = {
  ranked: TransportMode[]
  recommendedId: TransportModeId | null
  ctx: ArrivalContext
  route: BookingRoute
  selectedId: TransportModeId | null
  onSelect: (id: TransportModeId) => void
}

export function ModeRecommendations({
  ranked,
  recommendedId,
  ctx,
  route,
  selectedId,
  onSelect,
}: Props) {
  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-[clamp(1.35rem,2.6vw,1.7rem)] font-semibold text-ink">
            Best ways for this route
          </h2>
          <p className="mt-1 max-w-[62ch] text-[0.85rem] text-muted">
            Ranked live from party size and luggage. Open a mode for providers and booking.
          </p>
        </div>
      </div>
      <ol className="mt-5 space-y-3">
        {ranked.map((mode, i) => {
          const on = mode.id === selectedId
          const rec = mode.id === recommendedId
          const providers = catalogProviders(route.airport.id, mode.id)
          const reasons = ourPickReasons(mode, ctx)
          const href = modeDetailHref(mode.id, route)
          return (
            <li key={mode.id}>
              <article
                className={`overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 transition ${
                  on ? 'ring-2 ring-terracotta' : rec ? 'ring-terracotta/40' : 'ring-ink/8'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(mode.id)}
                  className="flex w-full items-start gap-4 px-4 py-4 text-left sm:px-5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-cream text-[1.2rem]">
                    {mode.symbol}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-serif text-[1.15rem] font-semibold text-ink">
                        {i + 1}. {mode.label}
                      </span>
                      {rec ? (
                        <span className="rounded-full bg-terracotta px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-paper">
                          Best fit
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-[0.88rem] font-semibold text-ink/80">
                      {formatTimeRange(mode.timeMin)}
                      <span className="mx-1.5 text-ink/25">·</span>
                      {formatCostCompact(mode)}
                      <span className="mx-1.5 text-ink/25">·</span>
                      Bags {mode.luggageLabel}
                    </span>
                    <span className="mt-1.5 block text-[0.8rem] leading-snug text-muted">
                      {reasons[0] ?? mode.whyChoose[0]}
                    </span>
                  </span>
                </button>
                <div className="border-t border-ink/8 px-4 py-4 sm:px-5">
                  <ul className="mb-4 flex flex-wrap gap-2">
                    {reasons.slice(0, 4).map((r) => (
                      <li
                        key={r}
                        className="rounded-full bg-cream px-3 py-1 text-[0.72rem] font-medium text-ink"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
                      Providers
                    </p>
                    <a
                      href={href}
                      onClick={(e) => openDetailHref(href, e)}
                      className="text-[0.75rem] font-bold text-terracotta hover:underline"
                    >
                      Mode guide →
                    </a>
                  </div>
                  <ProviderCatalog providers={providers} route={route} />
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
