import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Season } from './seasons'

type Props = {
  season: Season
  sectionRef: RefObject<HTMLElement | null>
}

export function ExpandedSeasonDetails({ season, sectionRef }: Props) {
  return (
    <section
      ref={sectionRef}
      id="season-details"
      className="scroll-mt-24 px-[clamp(1.1rem,4vw,2.5rem)] pb-[clamp(3rem,7vw,5rem)] pt-4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={season.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-content"
        >
          <div className="relative mb-8 overflow-hidden rounded-[28px] shadow-card">
            <img
              src={`https://picsum.photos/seed/${season.heroSeed}/1400/700`}
              alt=""
              className="min-h-[220px] aspect-[21/9] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-8">
              <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-paper/75">
                {season.months.join(' · ')}
              </p>
              <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold text-paper">
                {season.title}
              </h2>
            </div>
          </div>

          <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Snapshot
          </p>
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {season.weather.map((item) => (
              <div key={item.label} className="rounded-2xl bg-paper px-4 py-4 text-center shadow-soft">
                <p className="mb-1 text-xl" aria-hidden="true">
                  {item.icon}
                </p>
                <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
                  {item.label}
                </p>
                <p className="mt-1 font-serif text-[1.05rem] font-semibold text-ink">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Best Destinations
          </p>
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {season.destinations.map((dest) => (
              <article
                key={dest.slug}
                className="group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${dest.seed}/640/480`}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1 font-serif text-[1.1rem] font-semibold text-ink">{dest.name}</h3>
                  <p className="mb-3 text-[0.86rem] leading-snug text-muted">{dest.blurb}</p>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {dest.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full px-2 py-0.5 text-[0.68rem] font-semibold text-ink"
                        style={{ background: season.accentSoft }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/see-and-do?highlight=${dest.slug}`}
                    className="mt-auto inline-flex items-center justify-center rounded-full border border-ink/10 bg-cream px-3 py-2 text-[0.8rem] font-bold text-ink transition-colors hover:border-terracotta/30 hover:bg-terracotta hover:text-paper"
                  >
                    Check It Out
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            What to Expect
          </p>
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {season.expectations.map((item) => (
              <div
                key={item.label}
                className="group rounded-2xl bg-paper px-4 py-5 text-center shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card"
                style={{ border: `1px solid ${season.accent}22` }}
              >
                <p className="mb-2 text-3xl transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
                  {item.icon}
                </p>
                <p className="text-[0.88rem] font-bold text-ink">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Perfect For
          </p>
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {season.personas.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl px-4 py-6 text-center shadow-soft transition-transform duration-200 hover:-translate-y-1"
                style={{ background: season.accentSoft }}
              >
                <p className="mb-2 text-3xl" aria-hidden="true">
                  {item.icon}
                </p>
                <p className="font-serif text-[1.05rem] font-semibold text-ink">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Month Breakdown
          </p>
          <div className="mb-12 grid gap-3 sm:grid-cols-3">
            {season.monthNotes.map((item) => (
              <div key={item.month} className="rounded-2xl bg-paper p-4 shadow-soft">
                <p className="font-serif text-[1.2rem] font-semibold uppercase tracking-wide text-ink">
                  {item.month}
                </p>
                <p className="mt-1 text-[0.9rem] font-semibold text-muted">{item.headline}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {item.indicators.map((ind) => (
                    <div
                      key={`${item.month}-${ind.label}`}
                      className="rounded-xl bg-cream px-2 py-2 text-center"
                    >
                      <p className="text-base" aria-hidden="true">
                        {ind.icon}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] font-bold text-ink">{ind.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA — matches Build My Itinerary language */}
          <div className="rounded-[28px] bg-paper px-6 py-10 text-center shadow-card sm:px-10">
            <h3 className="mb-2 font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold text-ink">
              Ready for this season?
            </h3>
            <p className="mx-auto mb-6 max-w-[40ch] text-[0.95rem] text-muted">
              Discover activities, experiences, landmarks, food, and hidden gems for this season.
            </p>
            <Link
              to={`/see-and-do?season=${season.id}`}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-[1.45rem] py-[0.75rem] text-[0.92rem] font-bold text-paper shadow-[0_10px_28px_rgba(196,92,58,0.38)] transition-transform duration-200 ease-out hover:scale-[1.03]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.65"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M2.8 12s3.4-6.2 9.2-6.2S21.2 12 21.2 12s-3.4 6.2-9.2 6.2S2.8 12 2.8 12z" />
                <circle cx="12" cy="12" r="2.4" />
              </svg>
              See Things To Do
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
