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

  const smartPick = fromTrip ? getSmartFlyIntoPick(cities) : null
  const runnerUp = cities.find((c) => !c.isStartingCity && c.itemCount > 0)

  return (
    <section className="scroll-mt-28">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-sage">
        {fromTrip ? 'Cities on your trip' : 'Choose a city with an airport'}
      </p>
      <h2 className="mt-1 font-serif text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold text-ink">
        Where are you flying into?
      </h2>
      <p className="mt-1.5 max-w-[56ch] text-[0.88rem] text-muted">
        {fromTrip
          ? 'We recommend starting in the city where you selected the most trip items — not the shortest airport transfer. Distances are shown for planning only.'
          : 'Select a city to see how to get between the airport and town. Distances are airport → city hub by road.'}
      </p>

      {smartPick ? (
        <div className="mt-5 overflow-hidden rounded-[20px] border border-terracotta/25 bg-gradient-to-br from-terracotta/[0.1] via-paper to-cream/80 px-4 py-4 shadow-soft sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
                Start your trip here
              </p>
              <p className="mt-1 font-serif text-[clamp(1.15rem,2.2vw,1.4rem)] font-semibold text-ink">
                Fly into {smartPick.label}
                <span className="ml-2 align-middle text-[0.75rem] font-bold tracking-wide text-muted">
                  {smartPick.airportCode}
                </span>
              </p>
              <p className="mt-1.5 max-w-[54ch] text-[0.88rem] leading-relaxed text-muted">
                {runnerUp && runnerUp.itemCount > 0 && smartPick.itemCount > runnerUp.itemCount ? (
                  <>
                    You have more of your trip in{' '}
                    <span className="font-semibold text-ink">{smartPick.label}</span> (
                    {smartPick.itemCount} items
                    {smartPick.itemSummary ? ` · ${smartPick.itemSummary}` : ''}) than in{' '}
                    {runnerUp.label} ({runnerUp.itemCount}). Start there first.
                  </>
                ) : (
                  <>
                    Most of what you selected sits in{' '}
                    <span className="font-semibold text-ink">{smartPick.label}</span> (
                    {smartPick.itemCount} item{smartPick.itemCount === 1 ? '' : 's'}
                    {smartPick.itemSummary ? ` · ${smartPick.itemSummary}` : ''}). Begin here.
                  </>
                )}
              </p>
              <p className="mt-2 text-[0.8rem] font-semibold text-ink/75">
                Airport transfer: ≈ {smartPick.distanceKm} km · {smartPick.timeMin[0]}–
                {smartPick.timeMin[1]} min to {smartPick.cityHubLabel}
              </p>
            </div>
            {selectedId !== smartPick.id ? (
              <button
                type="button"
                onClick={() => onSelect(smartPick)}
                className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[0.78rem] font-bold text-paper transition hover:bg-ink/90"
              >
                Start with {smartPick.label}
              </button>
            ) : (
              <span className="shrink-0 rounded-full bg-sage/15 px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-sage">
                Starting city
              </span>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          const on = selectedId === city.id
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelect(city)}
              className={`rounded-[18px] border px-4 py-4 text-left transition ${
                on
                  ? 'border-ink bg-ink text-paper shadow-soft'
                  : city.isStartingCity
                    ? 'border-terracotta/40 bg-paper text-ink ring-1 ring-terracotta/20 hover:border-terracotta/55'
                    : 'border-ink/10 bg-paper text-ink hover:border-terracotta/35 hover:bg-cream/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-serif text-[1.2rem] font-semibold leading-snug">{city.label}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold tracking-wide ${
                    on ? 'bg-paper/15 text-paper' : 'bg-cream text-muted'
                  }`}
                >
                  {city.airportCode}
                </span>
              </div>

              {city.isStartingCity ? (
                <p className="mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                  ★ Start here
                </p>
              ) : null}

              {city.itemCount > 0 ? (
                <p className={`mt-2 text-[0.82rem] font-semibold ${on ? 'text-paper' : 'text-ink'}`}>
                  {city.itemCount} trip item{city.itemCount === 1 ? '' : 's'}
                </p>
              ) : null}
              {city.itemSummary && city.itemCount > 0 ? (
                <p className={`mt-0.5 text-[0.75rem] ${on ? 'text-paper/70' : 'text-muted'}`}>
                  {city.itemSummary}
                </p>
              ) : null}

              <p className={`mt-1.5 text-[0.8rem] ${on ? 'text-paper/75' : 'text-muted'}`}>
                {city.airportName}
              </p>

              <p
                className={`mt-3 text-[0.78rem] font-semibold leading-snug ${
                  on ? 'text-paper/85' : 'text-ink/70'
                }`}
              >
                ≈ {city.distanceKm} km · {city.timeMin[0]}–{city.timeMin[1]} min to{' '}
                {city.cityHubLabel}
              </p>

              <p className={`mt-2 text-[0.78rem] leading-snug ${on ? 'text-paper/70' : 'text-muted'}`}>
                {city.recommendReason}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
