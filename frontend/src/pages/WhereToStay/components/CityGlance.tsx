import { cityGlanceItems, costLevelLabel } from '../data/ranking'
import type { StayCity } from '../data/types'

type Props = {
  city: StayCity
}

export function CityGlance({ city }: Props) {
  const [lo, hi] = city.typicalCostLevel
  const cost =
    lo === hi ? costLevelLabel(lo) : `${costLevelLabel(lo)}–${costLevelLabel(hi)}`
  const items = cityGlanceItems(city)

  return (
    <section className="rounded-[16px] bg-paper px-4 py-3 ring-1 ring-ink/8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-terracotta">
            {city.label} · staying at a glance
          </p>
          <p className="mt-0.5 text-[0.78rem] text-muted">{city.overview}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.5rem] font-bold uppercase tracking-wide text-muted">
            Typical nightly
          </p>
          <p className="font-serif text-[1.15rem] font-semibold text-ink">{cost}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-[10px] bg-cream/80 px-2.5 py-2">
            <p className="text-[0.5rem] font-bold uppercase tracking-wide text-muted">
              {item.label}
            </p>
            <p className="mt-0.5 text-[0.78rem] font-bold leading-snug text-ink">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
