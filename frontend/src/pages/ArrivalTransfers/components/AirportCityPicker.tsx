import type { TripAirportCity } from '../data/tripAirportIntelligence'
import { getSmartFlyIntoPick } from '../data/tripAirportIntelligence'

type Props = {
  cities: TripAirportCity[]
  selectedId: string | null
  onSelect: (city: TripAirportCity) => void
  fromTrip: boolean
}

export function AirportCityPicker({ cities, selectedId, onSelect, fromTrip }: Props) {
  if (cities.length === 0) return null

  const listed = cities
  const smartPick = fromTrip ? getSmartFlyIntoPick(cities) ?? cities[0] : null

  return (
    <section className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-sage">
            Airports
          </p>
          <h2 className="mt-1 font-serif text-[clamp(1.2rem,2.2vw,1.45rem)] font-semibold text-ink">
            Flying into which city
          </h2>
        </div>
        {smartPick && selectedId !== smartPick.id ? (
          <button
            type="button"
            onClick={() => onSelect(smartPick)}
            className="rounded-full bg-ink px-3 py-1.5 text-[0.7rem] font-bold text-paper"
          >
            Start in {smartPick.label}
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {listed.map((city) => {
          const on = selectedId === city.id
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelect(city)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-left transition ${
                on
                  ? 'bg-ink text-paper shadow-soft'
                  : city.isStartingCity
                    ? 'bg-paper text-ink ring-1 ring-terracotta/35 hover:ring-terracotta/55'
                    : 'bg-paper text-ink ring-1 ring-ink/10 hover:ring-terracotta/35'
              }`}
            >
              <span className="font-serif text-[0.95rem] font-semibold leading-none">
                {city.label}
              </span>
              <span
                className={`text-[0.62rem] font-bold tracking-[0.08em] ${
                  on ? 'text-paper/70' : 'text-muted'
                }`}
              >
                {city.airportCode}
              </span>
              {city.isStartingCity ? (
                <span className={`text-[0.62rem] ${on ? 'text-paper/80' : 'text-terracotta'}`}>
                  ★
                </span>
              ) : null}
              {city.itemCount > 0 ? (
                <span className={`text-[0.62rem] font-semibold ${on ? 'text-paper/65' : 'text-muted'}`}>
                  {city.itemCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
