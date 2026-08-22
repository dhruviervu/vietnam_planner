import type { DiscoveryFilters } from '../data/types'

export type RoutePreference = 'fastest' | 'best-value' | 'fewest-connections' | null

type Props = {
  value: RoutePreference
  onChange: (value: RoutePreference) => void
}

const OPTIONS: { id: Exclude<RoutePreference, null>; label: string; hint: string }[] = [
  { id: 'fastest', label: 'Fastest', hint: 'Prioritise shorter journey times' },
  { id: 'best-value', label: 'Best value', hint: 'Prioritise lower typical cost' },
  { id: 'fewest-connections', label: 'Fewest connections', hint: 'Prioritise more direct modes' },
]

/** Compact route preference chips — maps onto existing discovery filters. */
export function RoutePreferenceChips({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
        Route preference
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {OPTIONS.map((o) => {
          const on = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              title={o.hint}
              aria-pressed={on}
              onClick={() => onChange(on ? null : o.id)}
              className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold transition ${
                on
                  ? 'bg-terracotta text-paper'
                  : 'bg-cream text-ink ring-1 ring-ink/8 hover:text-terracotta'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function applyRoutePreference(
  filters: DiscoveryFilters,
  preference: RoutePreference,
): DiscoveryFilters {
  return {
    ...filters,
    fastest: preference === 'fastest',
    cheapest: preference === 'best-value',
    direct: preference === 'fewest-connections',
  }
}
