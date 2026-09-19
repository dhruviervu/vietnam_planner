import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { TripBagCitySummary } from '../services/tripBagStayIntelligence'

type Props = {
  cities: TripBagCitySummary[]
  unmappedLabels: string[]
  activitiesHref?: string
}

export function TripBagStayContext({
  cities,
  unmappedLabels,
  activitiesHref = '/plan/builder/activities',
}: Props) {
  const singleActivityCities = cities.filter((c) => c.activityCount === 1)

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[22px] border border-terracotta/25 bg-gradient-to-br from-paper via-cream to-cream-deep shadow-soft"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-terracotta/10 blur-2xl"
        aria-hidden
      />
      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.75rem)] font-semibold leading-snug text-ink">
          Showing cities where you already have plans
        </h2>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <li
              key={c.cityId}
              className="rounded-[16px] border-2 border-terracotta/35 bg-paper px-4 py-3 shadow-soft"
            >
              <p className="font-serif text-[1.25rem] font-semibold leading-tight text-ink">
                {c.label}
              </p>
              <p className="mt-1 text-[0.78rem] font-semibold text-muted">
                {c.experienceCount + c.activityCount} plan
                {c.experienceCount + c.activityCount === 1 ? '' : 's'} in your bag
              </p>
            </li>
          ))}
        </ul>

        {unmappedLabels.length > 0 ? (
          <p className="mt-4 text-[0.88rem] leading-relaxed text-ink/85">
            We don&apos;t list stay neighbourhoods for{' '}
            <span className="font-bold text-ink">
              {unmappedLabels.length === 1
                ? unmappedLabels[0]
                : `${unmappedLabels.slice(0, -1).join(', ')} and ${unmappedLabels[unmappedLabels.length - 1]}`}
            </span>{' '}
            yet — those picks stay in your trip bag.
          </p>
        ) : null}

        {singleActivityCities.length > 0 ? (
          <div className="mt-3 space-y-1.5">
            {singleActivityCities.map((c) => (
              <p key={c.cityId} className="text-[0.88rem] text-ink/85">
                <span className="font-bold text-ink">{c.label}</span> has only one activity.{' '}
                <Link to={activitiesHref} className="font-bold text-terracotta hover:underline">
                  Want to add more?
                </Link>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </motion.section>
  )
}
