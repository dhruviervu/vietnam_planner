import { Link } from 'react-router-dom'
import { SIGHT_CATALOG } from '../data/experiences'
import { ExperienceCard } from './ExperienceCard'
import type { ThinCityNote } from '../lib/yourVietnam/types'
import { experiencesCitySectionTo } from '../lib/yourVietnam/links'
import { rankCityExperiences } from '../services/cityCatalog'

export function AddMoreSightsSection({
  thinCities,
  selectedIds,
  tripDate,
}: {
  thinCities: ThinCityNote[]
  selectedIds: string[]
  tripDate: string | null
}) {
  if (thinCities.length === 0) return null
  const selected = new Set(selectedIds)

  return (
    <div className="mt-12 space-y-10">
      {thinCities.map((city) => {
        const to = experiencesCitySectionTo(city.catalogCity)
        const top = rankCityExperiences(
          SIGHT_CATALOG.filter(
            (e) =>
              (e.city === city.catalogCity || e.city === city.city) && !selected.has(e.id),
          ),
        ).slice(0, 3)
        return (
          <section key={city.catalogCity}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-serif text-[1.55rem] font-semibold leading-tight text-ink">
                <Link to={to} className="hover:text-terracotta">
                  You Can Add More Sights in {city.city}
                </Link>
              </h2>
              <Link
                to={to}
                className="text-[0.88rem] font-bold text-terracotta hover:underline"
              >
                See more…
              </Link>
            </div>
            {top.length === 0 ? (
              <p className="mt-3 text-[0.88rem] text-muted">
                Everything popular in {city.city} is already in your bag.{' '}
                <Link to={to} className="font-semibold text-ink hover:text-terracotta">
                  Browse the full city list
                </Link>
                .
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {top.map((item) => (
                  <ExperienceCard
                    key={item.id}
                    experience={item}
                    tripDate={tripDate}
                    dense
                    cityRank={item.cityRank}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
