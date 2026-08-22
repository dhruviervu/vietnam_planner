import { useEffect, useMemo, useRef, useState } from 'react'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { ItemSlideshow } from './ItemSlideshow'
import {
  marketCityAnchorId,
  marketDistanceUrl,
  marketMapsUrl,
  marketsGroupedByCity,
  resolveMarketCityLabel,
  type FamousMarketplace,
} from '../data/famousMarkets'
import { resolveStayForMarketCity } from '../data/resolveStayForMarketCity'

const CITY_SCROLL_OFFSET = 110

function MarketCard({
  market,
  stay,
}: {
  market: FamousMarketplace
  stay: ReturnType<typeof resolveStayForMarketCity>
}) {
  const selected = useTripStore((s) => s.selectedShoppingIds.includes(market.id))
  const toggleShopping = useTripStore((s) => s.toggleShopping)

  return (
    <article className="overflow-hidden rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/6 transition hover:ring-terracotta/25">
      <ItemSlideshow
        images={market.images}
        alt={market.name}
        className="aspect-[16/10] w-full"
      />
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-sage">
              {market.area}
            </p>
            <h3 className="mt-0.5 font-serif text-[1.2rem] font-semibold leading-snug text-ink">
              {market.name}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[0.65rem] font-bold text-muted">
            {market.periodLabel}
          </span>
        </div>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">{market.shortDescription}</p>
        <p className="mt-2 text-[0.75rem] font-semibold text-ink/70">{market.costLabel}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={marketMapsUrl(market)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-paper px-3.5 py-2 text-[0.78rem] font-bold text-ink transition hover:border-ink/30"
          >
            View on Google Maps
          </a>
          {stay ? (
            <a
              href={marketDistanceUrl(market, stay)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex max-w-full items-center justify-center rounded-full border border-terracotta/30 bg-terracotta/[0.06] px-3.5 py-2 text-[0.78rem] font-bold text-terracotta-deep transition hover:border-terracotta/50 hover:bg-terracotta/10"
              title={`Directions from ${stay.stayName}`}
            >
              <span className="truncate">See how far from {stay.stayName}</span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => toggleShopping(market.id)}
            className={`inline-flex items-center justify-center rounded-full px-3.5 py-2 text-[0.78rem] font-bold transition ${
              selected
                ? 'bg-sage text-paper'
                : 'bg-terracotta text-paper hover:bg-terracotta-deep'
            }`}
          >
            {selected ? 'Added to itinerary ✓' : 'Add to itinerary'}
          </button>
        </div>
        {selected ? (
          <p className="mt-2.5 text-[0.72rem] leading-snug text-sage">
            We&apos;ll place this in {market.city} during the {market.preferredPeriod} on a matching
            trip day.
          </p>
        ) : null}
      </div>
    </article>
  )
}

function MarketCityJumpBar({
  cities,
  activeCity,
  fromTrip,
  onJump,
}: {
  cities: string[]
  activeCity: string | null
  fromTrip: boolean
  onJump: (city: string) => void
}) {
  return (
    <div className="sticky top-3 z-30 -mx-1 px-1 py-1">
      <div className="overflow-hidden rounded-[18px] border border-ink/8 bg-paper/90 shadow-[0_10px_40px_rgba(28,22,18,0.08)] backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-ink/6 px-3.5 py-2.5 sm:px-4">
          <p className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Jump to city
          </p>
          {fromTrip ? (
            <p className="min-w-0 truncate text-[0.72rem] font-semibold text-muted">
              Based on experiences &amp; things to do in your trip bag
            </p>
          ) : (
            <p className="min-w-0 truncate text-[0.72rem] font-semibold text-muted">
              All marketplace cities
            </p>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 sm:px-4">
          {cities.map((city) => {
            const on = activeCity === city
            return (
              <button
                key={city}
                type="button"
                onClick={() => onJump(city)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition ${
                  on
                    ? 'bg-ink text-paper shadow-soft'
                    : 'bg-cream text-ink/75 hover:bg-cream-deep hover:text-ink'
                }`}
              >
                {city}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function FamousMarketsSection() {
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const itineraryStayPropertyIds = useTripStore((s) => s.itineraryStayPropertyIds)
  const chosenStayId = useTripStore((s) => s.chosenStayId)
  const hotelIds = useTripStore((s) => s.selectedHotelIds)

  const stayByCity = useMemo(() => {
    const map = new Map<string, ReturnType<typeof resolveStayForMarketCity>>()
    for (const city of marketsGroupedByCity().map((g) => g.city)) {
      map.set(
        city,
        resolveStayForMarketCity(city, {
          itineraryStayPropertyIds,
          chosenStayId,
          hotelIds,
        }),
      )
    }
    return map
  }, [itineraryStayPropertyIds, chosenStayId, hotelIds])

  const tripMarketCities = useMemo(() => {
    const labels = new Set<string>()
    for (const e of EXPERIENCES.filter((x) => experienceIds.includes(x.id))) {
      const city =
        resolveMarketCityLabel(e.city) ?? resolveMarketCityLabel(e.region)
      if (city) labels.add(city)
    }
    for (const a of CITY_ACTIVITIES.filter((x) => activityIds.includes(x.id))) {
      const city =
        resolveMarketCityLabel(a.cityName) ?? resolveMarketCityLabel(a.cityId)
      if (city) labels.add(city)
    }
    return [...labels]
  }, [experienceIds, activityIds])

  const bagHasItems = experienceIds.length > 0 || activityIds.length > 0
  const fromTrip = bagHasItems && tripMarketCities.length > 0
  const cityFilter = fromTrip ? tripMarketCities : null

  const groups = useMemo(() => marketsGroupedByCity(cityFilter), [cityFilter])
  const barCities = groups.map((g) => g.city)

  const [activeCity, setActiveCity] = useState<string | null>(barCities[0] ?? null)
  const scrollLockRef = useRef(false)

  useEffect(() => {
    setActiveCity(barCities[0] ?? null)
  }, [barCities.join('|')])

  useEffect(() => {
    if (barCities.length === 0) return

    function onScroll() {
      if (scrollLockRef.current) return
      let current: string | null = barCities[0] ?? null
      for (const city of barCities) {
        const el = document.getElementById(marketCityAnchorId(city))
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= CITY_SCROLL_OFFSET + 24) current = city
      }
      setActiveCity(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [barCities.join('|')])

  function jumpToCity(city: string) {
    const el = document.getElementById(marketCityAnchorId(city))
    if (!el) return
    scrollLockRef.current = true
    setActiveCity(city)
    const y = el.getBoundingClientRect().top + window.scrollY - CITY_SCROLL_OFFSET
    window.scrollTo({ top: y, behavior: 'smooth' })
    window.setTimeout(() => {
      scrollLockRef.current = false
    }, 900)
  }

  return (
    <section id="famous-markets" className="scroll-mt-24">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
        City by city
      </p>
      <h2 className="mt-1 font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Famous Marketplaces
      </h2>
      <p className="mt-1.5 max-w-[54ch] text-[0.88rem] text-muted">
        {fromTrip
          ? 'Markets in the cities already on your trip — jump between them, then add stops to your itinerary.'
          : 'Iconic markets worth a dedicated stop — sorted by city. Add one to your itinerary and we schedule it by city and time of day.'}
      </p>

      {barCities.length > 0 ? (
        <div className="mt-6">
          <MarketCityJumpBar
            cities={barCities}
            activeCity={activeCity}
            fromTrip={fromTrip}
            onJump={jumpToCity}
          />
        </div>
      ) : null}

      <div className="mt-8 space-y-10">
        {groups.map(({ city, markets }) => (
          <div key={city} id={marketCityAnchorId(city)} className="scroll-mt-36">
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-ink/8 pb-2">
              <h3 className="font-serif text-[1.25rem] font-semibold text-ink">{city}</h3>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-muted">
                {markets.length} market{markets.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {markets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  stay={stayByCity.get(city) ?? null}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
