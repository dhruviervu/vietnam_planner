import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { TripBagCitySummary } from '../services/tripBagStayIntelligence'

type Props = {
  cities: TripBagCitySummary[]
  totalBagItems: number
  unmappedCount: number
  experiencesHref?: string
  activitiesHref?: string
}

export function TripBagStayContext({
  cities,
  totalBagItems,
  unmappedCount,
  experiencesHref = '/plan/builder/experiences',
  activitiesHref = '/plan/builder/activities',
}: Props) {
  const cityNames = cities.map((c) => c.label)

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
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          Tailored to your trip bag
        </p>
        <h2 className="mt-1 font-serif text-[clamp(1.35rem,2.8vw,1.75rem)] font-semibold leading-snug text-ink">
          Showing cities where you already have plans
        </h2>
        <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-muted">
          You have <span className="font-bold text-ink">{totalBagItems}</span> item
          {totalBagItems === 1 ? '' : 's'} in your trip bag
          {cityNames.length > 0 ? (
            <>
              {' '}
              across{' '}
              <span className="font-bold text-ink">
                {cityNames.length === 1
                  ? cityNames[0]
                  : `${cityNames.slice(0, -1).join(', ')} and ${cityNames[cityNames.length - 1]}`}
              </span>
            </>
          ) : null}
          . We’re focusing stay options on those cities so your base sits near what you want to do.
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li
              key={c.cityId}
              className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-[0.78rem] font-bold text-ink shadow-soft"
            >
              {c.label}
              <span className="ml-1.5 font-semibold text-muted">
                {c.experienceCount + c.activityCount} plan
                {c.experienceCount + c.activityCount === 1 ? '' : 's'}
              </span>
            </li>
          ))}
        </ul>

        {unmappedCount > 0 && (
          <p className="mt-3 text-[0.8rem] text-muted">
            {unmappedCount} selected place{unmappedCount === 1 ? '' : 's'} sit outside our stay-city
            map for now — they still stay in your trip bag.
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink/8 pt-4">
          <p className="text-[0.84rem] text-ink/85">
            Want another city? Add experiences or activities there first.
          </p>
          <Link
            to={experiencesHref}
            className="rounded-full bg-ink px-4 py-2 text-[0.8rem] font-bold text-paper transition hover:bg-ink/90"
          >
            Back to experiences →
          </Link>
          <Link
            to={activitiesHref}
            className="rounded-full border border-ink/12 bg-paper px-4 py-2 text-[0.8rem] font-bold text-ink hover:border-ink/25"
          >
            Things to do →
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
