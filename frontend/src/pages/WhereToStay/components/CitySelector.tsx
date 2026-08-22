import { STAY_CITIES } from '../data/cities'
import { costLevelLabel } from '../data/ranking'
import type { StayCity, StayCityId } from '../data/types'
import type { TripBagCitySummary } from '../services/tripBagStayIntelligence'

type Props = {
  cityId: StayCityId
  onChange: (id: StayCityId) => void
  /** When set, only these cities are listed (trip-bag mode). */
  cities?: StayCity[]
  bagSummaries?: TripBagCitySummary[]
  bagFiltered?: boolean
}

export function CitySelector({
  cityId,
  onChange,
  cities = STAY_CITIES,
  bagSummaries = [],
  bagFiltered = false,
}: Props) {
  const active = cities.find((c) => c.id === cityId) ?? STAY_CITIES.find((c) => c.id === cityId)
  const summaryById = new Map(bagSummaries.map((s) => [s.cityId, s]))

  return (
    <section className="overflow-hidden rounded-[3px] border border-ink/10 bg-paper">
      <div className="border-b border-ink/10 bg-[linear-gradient(180deg,#faf6f0_0%,#f3ebe0_100%)] px-4 py-4 sm:px-5">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-terracotta">
          Step 1 · Decide your base
        </p>
        <h2 className="mt-1 font-serif text-[1.55rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
          {bagFiltered ? 'Your trip cities' : 'Choose a city'}
        </h2>
        <p className="mt-1.5 max-w-[58ch] text-[0.84rem] leading-relaxed text-muted">
          {bagFiltered
            ? 'Only cities with experiences or things to do already in your trip bag. Pick one to see neighbourhoods and stays.'
            : 'This is the deciding step. Neighbourhoods, costs and stays all update from the city you pick.'}
        </p>
      </div>

      <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4 sm:p-4">
        {cities.map((city) => {
          const on = city.id === cityId
          const bag = summaryById.get(city.id)
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onChange(city.id)}
              className={`overflow-hidden rounded-[3px] border text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                on
                  ? 'border-terracotta/50 shadow-[0_10px_28px_rgba(180,83,50,0.14)]'
                  : 'border-ink/10 hover:border-ink/25'
              }`}
            >
              <div className="relative h-[88px]">
                <img src={city.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                {on ? (
                  <span className="absolute right-2 top-2 rounded-[2px] bg-terracotta px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-paper">
                    Selected
                  </span>
                ) : null}
                {bag ? (
                  <span className="absolute left-2 top-2 rounded-[2px] bg-paper/95 px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink">
                    In your bag
                  </span>
                ) : null}
                <p className="absolute bottom-2 left-2.5 font-serif text-[1.1rem] text-paper">
                  {city.label}
                </p>
              </div>
              <div className="px-2.5 py-2">
                {bag ? (
                  <p className="text-[0.72rem] font-semibold leading-snug text-ink">
                    {bag.experienceCount > 0 && (
                      <span>
                        {bag.experienceCount} experience{bag.experienceCount === 1 ? '' : 's'}
                      </span>
                    )}
                    {bag.experienceCount > 0 && bag.activityCount > 0 ? ' · ' : null}
                    {bag.activityCount > 0 && (
                      <span>
                        {bag.activityCount} activit{bag.activityCount === 1 ? 'y' : 'ies'}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="line-clamp-2 text-[0.7rem] leading-snug text-muted">{city.overview}</p>
                )}
                <p className="mt-1.5 text-[0.65rem] font-bold text-ink">
                  Typical {costLevelLabel(city.typicalCostLevel[0])}–
                  {costLevelLabel(city.typicalCostLevel[1])}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {active ? (
        <div className="border-t border-ink/10 px-4 py-3 sm:px-5">
          <p className="text-[0.78rem] text-ink/85">
            <span className="font-bold text-ink">{active.label} — </span>
            {active.overview}
          </p>
        </div>
      ) : null}
    </section>
  )
}
