import { cityImages } from '../data/cityImages'
import { experiencesCityPath } from '../services/citySlug'
import { openDetailHref } from '../lib/yourVietnam/links'
import { catalogReviewRoi } from '../lib/yourVietnam/dayCapacity'
import type { CityRoiRow, CitySightGroup, ScoredBagItem } from '../lib/yourVietnam/itineraryOptimize'

export function thinCityGroups(groups: CitySightGroup[]): CitySightGroup[] {
  return groups.filter((g) => g.items.length <= 2)
}

export function CraftWaiting() {
  return (
    <div className="mt-6 rounded-[16px] border border-ink/8 bg-paper px-5 py-10 text-center shadow-soft">
      <p className="font-serif text-[1.35rem] font-semibold text-ink">Putting your itinerary together…</p>
      <p className="mt-1 text-[0.88rem] text-muted">Checking days, cities and sights.</p>
    </div>
  )
}

export function CraftAddMoreGate({
  cities,
  onFine,
}: {
  cities: CitySightGroup[]
  onFine: () => void
}) {
  return (
    <section className="mt-4 rounded-[12px] border border-ink/8 bg-paper px-3 py-2.5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-[1.02rem] font-semibold leading-snug text-ink">
          You have less sights in these cities. Want to add more?
        </h2>
        <button
          type="button"
          onClick={onFine}
          className="rounded-full bg-ink px-4 py-1.5 text-[0.8rem] font-bold text-paper"
        >
          Continue
        </button>
      </div>
      <ul className="mt-2 flex flex-wrap gap-2">
        {cities.map((g) => {
          const photo = cityImages(g.placeId ?? g.catalogCity)[0]
          const href = experiencesCityPath(g.catalogCity)
          return (
            <li
              key={g.placeId ?? g.city}
              className="flex items-center gap-2 rounded-full border border-ink/8 bg-cream/60 py-1 pl-1 pr-2"
            >
              <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-sage/15">
                {photo ? (
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.78rem] font-bold text-ink">{g.city}</span>
                <span className="block text-[0.65rem] text-muted">
                  {g.items.length} {g.items.length === 1 ? 'sight' : 'sights'}
                </span>
              </span>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openDetailHref(href, e)}
                className="shrink-0 rounded-full bg-terracotta px-2.5 py-1 text-[0.7rem] font-bold text-paper"
              >
                Add
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function CraftDropLowGate({
  city,
  onDropItem,
  onFine,
}: {
  city: CityRoiRow | null
  onDropItem: (item: ScoredBagItem) => void
  onFine: () => void
}) {
  const items = city
    ? [...city.items].sort(
        (a, b) => catalogReviewRoi(a.kind, a.id) - catalogReviewRoi(b.kind, b.id),
      )
    : []

  return (
    <section className="mt-6 rounded-[16px] border border-ink/8 bg-paper px-4 py-4 shadow-soft sm:px-5">
      <h2 className="font-serif text-[1.45rem] font-semibold text-ink">These sights can be dropped</h2>
      {city ? (
        <>
          <p className="mt-1 text-[0.92rem] leading-relaxed text-muted">
            {city.city} has the lowest return for the days you have. These sights add the least —
            drop any you can skip.
          </p>
          <ul className="mt-4 space-y-2">
            {items.map((it) => (
              <li
                key={it.key}
                className="flex items-center justify-between gap-3 rounded-[14px] border border-ink/8 bg-cream/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-serif text-[0.98rem] font-semibold text-ink">{it.name}</p>
                  <p className="text-[0.72rem] font-bold uppercase tracking-wide text-terracotta">
                    {it.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDropItem(it)}
                  className="shrink-0 rounded-full border border-ink/12 bg-paper px-3 py-1.5 text-[0.78rem] font-bold text-ink"
                >
                  Drop
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-[0.92rem] text-muted">Those lower-return sights are no longer in your bag.</p>
      )}
      <button
        type="button"
        onClick={onFine}
        className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
      >
        Continue
      </button>
    </section>
  )
}
