import { Link } from 'react-router-dom'
import { rankVietnamBestSights } from '../services/cityCatalog'
import { ExperienceCard } from '../components/ExperienceCard'
import { useTripStore } from '../../../store/tripStore'

export function ExperiencesTopPage() {
  const tripDate = useTripStore((s) =>
    s.basics.dateMode === 'exact' && s.basics.startDate ? s.basics.startDate : null,
  )
  const sights = rankVietnamBestSights(20)

  return (
    <div className="pb-16">
      <section className="rounded-[22px] bg-gradient-to-br from-cream/80 via-paper to-paper p-5 shadow-soft ring-1 ring-ink/[0.06] sm:p-7">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-sage">
          Vietnam, at its best
        </p>
        <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.5vw,2.35rem)] font-semibold leading-tight text-ink">
          Top 20 sights
        </h1>
        <p className="mt-3 max-w-[62ch] text-[0.94rem] leading-[1.7] text-ink/85">
          Ranked across Vietnam by history, landscape, and culture — the must-visit list from the
          Attractions catalog.
        </p>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sights.map((item, index) => (
          <ExperienceCard
            key={item.id}
            experience={item}
            tripDate={tripDate}
            dense
            cityRank={item.cityRank}
            priority={index < 3}
          />
        ))}
      </div>

      <div className="mt-10 border-t border-ink/8 pt-6">
        <Link
          to="/plan/builder/experiences"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink shadow-soft transition hover:border-terracotta/35"
        >
          ← Back to attractions
        </Link>
      </div>
    </div>
  )
}
