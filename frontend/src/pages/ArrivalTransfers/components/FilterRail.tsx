import { useState } from 'react'
import type { DiscoveryFilters } from '../data/types'

type Props = {
  filters: DiscoveryFilters
  onToggle: (key: keyof DiscoveryFilters) => void
}

const ITEMS: { key: keyof DiscoveryFilters; label: string }[] = [
  { key: 'bestFit', label: 'Best Fit' },
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'highestRated', label: 'Highest Rated' },
  { key: 'availableNow', label: 'Available Now' },
  { key: 'allDay', label: '24/7' },
  { key: 'accessible', label: 'Accessible' },
  { key: 'freeCancellation', label: 'Free Cancellation' },
  { key: 'direct', label: 'Direct' },
]

export function FilterRail({ filters, onToggle }: Props) {
  const [openMobile, setOpenMobile] = useState(false)

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <button
        type="button"
        className="mb-2 rounded-full bg-cream px-3 py-1.5 text-[0.75rem] font-bold text-ink ring-1 ring-ink/8 lg:hidden"
        onClick={() => setOpenMobile((v) => !v)}
      >
        {openMobile ? 'Hide filters' : 'Filters →'}
      </button>
      <div className={`${openMobile ? 'block' : 'hidden'} lg:block`}>
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">Filters</p>
        <div className="mt-2.5 rounded-[16px] bg-cream/90 p-2.5 ring-1 ring-ink/10 lg:flex lg:flex-col lg:gap-1.5">
          <div className="flex flex-wrap gap-1.5 lg:flex-col lg:flex-nowrap">
            {ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onToggle(item.key)}
                aria-pressed={filters[item.key]}
                className={`rounded-full px-3 py-1.5 text-left text-[0.72rem] font-bold transition ${
                  filters[item.key]
                    ? 'bg-terracotta text-paper shadow-sm'
                    : 'bg-paper text-ink ring-1 ring-ink/10 hover:ring-ink/20 hover:text-terracotta'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
