import { useTripStore } from '../../../store/tripStore'
import type { ShopCity, ShoppingDestination } from '../data/types'
import { crowdDots } from '../data/destinations'

type Props = {
  destination: ShoppingDestination
  rank: number
  cityScope: ShopCity | 'All'
}

export function ShopPlaceCard({ destination: d, rank, cityScope }: Props) {
  const itineraryId = d.itineraryId ?? d.id
  const selected = useTripStore((s) => s.selectedShoppingIds.includes(itineraryId))
  const toggleShopping = useTripStore((s) => s.toggleShopping)
  const cityLabel = d.city === 'Ho Chi Minh City' ? 'HCMC' : d.city
  const rankCity =
    cityScope === 'All' ? null : cityScope === 'Ho Chi Minh City' ? 'HCMC' : cityScope

  return (
    <article className="group flex flex-col overflow-hidden rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/6 transition hover:-translate-y-0.5 hover:ring-terracotta/25">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={d.images[0]}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,22,18,0.08) 30%, rgba(28,22,18,0.72) 100%)',
          }}
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-terracotta px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-paper shadow-soft">
          {rankCity ? `#${rank} in ${rankCity}` : `Ranked #${rank}`}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-paper/90 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-ink backdrop-blur-sm">
          {d.type}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h4 className="font-serif text-[1.12rem] font-semibold leading-tight text-paper drop-shadow">
            {d.name}
          </h4>
          <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-paper/80">
            {cityLabel} · {d.area}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-semibold text-ink">
          <span>⭐ {d.rating.toFixed(1)}</span>
          <span className="text-muted">{d.priceRange}</span>
          <span className="text-muted">{d.openingHours}</span>
        </div>

        <p className="mt-2 text-[0.68rem] font-semibold text-ink/80">
          <span className="text-[0.55rem] font-bold uppercase tracking-[0.08em] text-muted">
            Best for ·{' '}
          </span>
          {d.bestForLabels.join(' · ')}
        </p>

        <p className="mt-2.5 text-[0.8rem] font-medium leading-relaxed text-ink/85">{d.whyRecommended}</p>
        {d.valueNote && rank === 1 ? (
          <p className="mt-1 text-[0.72rem] font-semibold text-terracotta">{d.valueNote}</p>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Signal label={`${d.crowdType} crowd`} value={`${crowdDots(d.crowdLevel)} ${d.crowdLabel}`} />
          <Signal label="Value" value={d.valueLevel} />
          <Signal label="Bargaining" value={d.bargaining} />
          <Signal label="Tourist friendly" value={d.touristFriendly} />
        </div>

        {d.crowdBusyPeriod ? (
          <p className="mt-1.5 text-[0.65rem] text-muted">Busy · {d.crowdBusyPeriod}</p>
        ) : null}

        <div className="mt-auto flex gap-1.5 pt-3.5">
          <a
            href={d.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-sage/45 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-ink transition hover:-translate-y-0.5"
          >
            Maps →
          </a>
          <button
            type="button"
            onClick={() => toggleShopping(itineraryId)}
            className={`flex-1 rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold transition hover:-translate-y-0.5 ${
              selected ? 'bg-sage text-paper' : 'bg-terracotta text-paper'
            }`}
          >
            {selected ? 'Added ✓' : 'Add to itinerary'}
          </button>
        </div>
      </div>
    </article>
  )
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-cream/80 px-2 py-1.5">
      <p className="text-[0.52rem] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-0.5 text-[0.7rem] font-bold leading-snug text-ink">{value}</p>
    </div>
  )
}
