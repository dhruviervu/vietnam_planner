import { TRUST_ITEMS } from '../data/trust'
import type { DataFreshness } from '../data/types'

type Props = {
  currencyStatus: 'loading' | 'live' | 'fallback'
  currencyUpdated: string
}

function short(f: DataFreshness, currencyStatus: Props['currencyStatus'], id: string) {
  if (id === 'currency') {
    if (currencyStatus === 'live') return 'Live'
    if (currencyStatus === 'loading') return '…'
    return 'Approx'
  }
  if (f === 'live') return 'Live'
  if (f === 'updated' || f === 'current') return 'Updated'
  if (f === 'typical') return id === 'insurance' ? 'Guidance' : 'Typical'
  return '—'
}

export function TrustStrip({ currencyStatus }: Props) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-ink/70">
      {TRUST_ITEMS.map((item, i) => {
        const freshness: DataFreshness =
          item.id === 'currency'
            ? currencyStatus === 'live'
              ? 'live'
              : currencyStatus === 'loading'
                ? 'unknown'
                : 'estimated'
            : item.freshness
        return (
          <span key={item.id} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span className="mr-1 text-ink/20">·</span> : null}
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                (item.id === 'currency' ? currencyStatus === 'live' : freshness === 'live')
                  ? 'bg-sage'
                  : freshness === 'updated' || freshness === 'current'
                    ? 'bg-terracotta/80'
                    : 'bg-ink/25'
              }`}
              aria-hidden
            />
            <span className="font-semibold text-ink">{item.label}</span>
            <span className="text-muted">{short(freshness, currencyStatus, item.id)}</span>
          </span>
        )
      })}
    </p>
  )
}
