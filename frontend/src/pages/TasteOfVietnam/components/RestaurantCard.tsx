import { Link } from 'react-router-dom'
import { useTripStore } from '../../../store/tripStore'
import { StayItineraryButton } from '../../WhereToStay/components/StayItineraryButton'
import { priceSymbols } from '../data/restaurants'
import type { Restaurant } from '../data/types'

function distanceLabel(km: number | null, hasTripContext: boolean) {
  if (!hasTripContext || km == null) return null
  if (km <= 1.4) return `${Math.max(8, Math.round(km * 12))} min walk`
  if (km <= 5.2) return `Short cab · ${km.toFixed(1)} km`
  return `${km.toFixed(1)} km away`
}

type Props = {
  restaurant: Restaurant
  dishName: string
  isTop?: boolean
  hasTripContext?: boolean
  /** When set, the terracotta button jumps back to the eat section instead of the listing. */
  eatHref?: string
  /** Hide listing / “show restaurants” CTA (recipe tab uses itinerary instead). */
  showListingLink?: boolean
}

export function RestaurantCard({
  restaurant: r,
  dishName,
  isTop = false,
  hasTripContext = false,
  eatHref,
  showListingLink = true,
}: Props) {
  const walk = distanceLabel(r.distanceKm, hasTripContext)
  const cityLabel = r.city === 'Ho Chi Minh City' ? 'HCMC' : r.city
  const selected = useTripStore((s) => s.selectedRestaurantIds.includes(r.id))
  const toggleRestaurant = useTripStore((s) => s.toggleRestaurant)

  return (
    <article className="flex flex-col overflow-hidden rounded-[16px] bg-cream/50 ring-1 ring-ink/6">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={r.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
        {isTop ? (
          <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper">
            Highly reviewed
          </span>
        ) : null}
        <span className="absolute bottom-2 left-2 rounded-full bg-ink/55 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper backdrop-blur-sm">
          {dishName}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h4 className="font-serif text-[1.05rem] font-semibold leading-tight text-ink">{r.name}</h4>
        <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-terracotta">
          {cityLabel} · {r.neighborhood}
        </p>
        <p className="mt-1 text-[0.7rem] leading-snug text-muted">{r.address}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-semibold text-ink">
          <span>⭐ {r.rating.toFixed(1)}</span>
          <span className="text-muted">{r.reviewCount.toLocaleString()} reviews</span>
          <span className="text-muted">{priceSymbols(r.priceLevel)}</span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {r.servesAlcohol ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              Alcohol
            </span>
          ) : null}
          {r.allowsSmoking ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              Smoking
            </span>
          ) : null}
          {walk ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              {walk}
            </span>
          ) : (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              {r.region} Vietnam
            </span>
          )}
        </div>

        <p className="mt-2.5 text-[0.78rem] font-medium leading-snug text-ink/85">{r.menuOrReviews}</p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          {showListingLink ? (
            eatHref ? (
              <Link
                to={eatHref}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-terracotta/90 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
              >
                Show restaurants →
              </Link>
            ) : (
              <a
                href={r.listingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-terracotta/90 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
              >
                Show me restaurant →
              </a>
            )
          ) : null}
          <span className="shrink-0">
            <StayItineraryButton
              selected={selected}
              onToggle={() => toggleRestaurant(r.id)}
            />
          </span>
        </div>
      </div>
    </article>
  )
}
