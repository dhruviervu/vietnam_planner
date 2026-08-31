import { Link } from 'react-router-dom'
import type { MustVisitCity } from '../lib/yourVietnam/types'
import { experiencesCitySectionTo } from '../lib/yourVietnam/links'
import { cityImages } from '../data/cityImages'
import { EXPLORE_CITIES } from '../data/exploreCities'
import { getCityDescription } from '../data/cityDescriptions'

export function MustVisitCitiesSection({ cities }: { cities: MustVisitCity[] }) {
  if (cities.length === 0) return null

  return (
    <section className="mt-6">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">Must visit</p>
      <p className="mt-1 text-[0.88rem] text-muted">
        Cities most first trips still add — open a card to browse that city’s sights.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cities.map((c) => {
          const photo = cityImages(c.placeId)[0]
          const explore = EXPLORE_CITIES.find((e) => e.id === c.placeId)
          const line = explore?.tagline ?? getCityDescription(c.catalogCity).slice(0, 140)
          return (
            <Link
              key={c.placeId}
              to={experiencesCitySectionTo(c.catalogCity)}
              className="group overflow-hidden rounded-[20px] border border-ink/8 bg-paper shadow-soft transition hover:-translate-y-0.5 hover:border-terracotta/30"
            >
              <div className="aspect-[16/10] overflow-hidden bg-cream">
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="h-full w-full bg-sage/15" />
                )}
              </div>
              <div className="px-3.5 py-3">
                <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{c.label}</h3>
                <p className="mt-1 line-clamp-2 text-[0.78rem] leading-snug text-muted">{line}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
