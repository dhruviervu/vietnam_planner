import type { StayCity, StayCityId } from '../data/types'

type Props = {
  cities: StayCity[]
  cityId: StayCityId
  onChange: (id: StayCityId) => void
}

export function CitySwitchBar({ cities, cityId, onChange }: Props) {
  const active = cities.find((c) => c.id === cityId) ?? cities[0]

  return (
    <section className="rounded-[16px] border border-ink/10 bg-paper px-4 py-4 sm:px-5">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-terracotta">
        Choose a city
      </p>
      <h2 className="mt-1 font-serif text-[1.35rem] font-semibold text-ink sm:text-[1.5rem]">
        Seeing Stays in {active?.label}
      </h2>
      <p className="mt-1 max-w-[54ch] text-[0.82rem] leading-relaxed text-muted">
        Neighbourhoods, the map and hotels below all follow this city. Switch here whenever you want
        a different base.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cities.map((city) => {
          const on = city.id === cityId
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onChange(city.id)}
              className={`relative overflow-hidden rounded-[12px] text-left transition ${
                on
                  ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-paper'
                  : 'ring-1 ring-ink/10 hover:ring-ink/25'
              }`}
            >
              <img
                src={city.image}
                alt=""
                className="h-[76px] w-full object-cover sm:h-[88px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />
              {on ? (
                <span className="absolute right-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-paper">
                  Selected
                </span>
              ) : null}
              <span className="absolute bottom-2 left-2.5 font-serif text-[1.05rem] text-paper">
                {city.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
