import type { StayCity, StayCityId } from '../data/types'

type Props = {
  cities: StayCity[]
  cityId: StayCityId
  onChange: (id: StayCityId) => void
}

export function CitySwitchBar({ cities, cityId, onChange }: Props) {
  const active = cities.find((c) => c.id === cityId) ?? cities[0]

  return (
    <section className="rounded-[16px] border border-ink/10 bg-paper px-4 py-3.5 sm:px-5">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-terracotta">
        Choose a city
      </p>
      <h2 className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">
        Seeing stays in {active?.label}
      </h2>
      <p className="mt-1 max-w-[62ch] text-[0.8rem] leading-relaxed text-muted">
        Browse every city&apos;s neighbourhoods — even if you have not added sights yet.
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {cities.map((city) => {
          const on = city.id === cityId
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onChange(city.id)}
              className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[0.75rem] font-semibold transition ${
                on ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream/80'
              }`}
            >
              <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-sage/15">
                <img src={city.image} alt="" className="h-full w-full object-cover" />
              </span>
              {city.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
