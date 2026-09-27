import { Link } from 'react-router-dom'
import { SIGHT_CATALOG } from '../data/experiences'
import { CITY_ACTIVITIES, rankCityActivities } from '../data/activities'
import { ActivityCard } from '../components/ActivityCard'
import { groupIdForSourceId } from '../lib/yourVietnam/sightTiming'

function catalogWithoutSightDupes() {
  const sightGroups = new Set<string>()
  for (const e of SIGHT_CATALOG) {
    sightGroups.add(e.id)
    if (e.groupId) sightGroups.add(e.groupId)
    sightGroups.add(groupIdForSourceId(e.id))
  }
  return CITY_ACTIVITIES.filter((a) => {
    const group = a.groupId ?? groupIdForSourceId(a.id)
    return !sightGroups.has(group) && !sightGroups.has(a.id)
  })
}

export function ActivitiesTopPage() {
  const sights = rankCityActivities(catalogWithoutSightDupes()).slice(0, 20)

  return (
    <div className="px-[clamp(1.1rem,4vw,2rem)] pb-16 pt-4">
      <section className="rounded-[22px] bg-gradient-to-br from-cream/80 via-paper to-paper p-5 shadow-soft ring-1 ring-ink/[0.06] sm:p-7">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-sage">
          Vietnam, at its best
        </p>
        <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.5vw,2.35rem)] font-semibold leading-tight text-ink">
          Top 20 activities
        </h1>
        <p className="mt-3 max-w-[62ch] text-[0.94rem] leading-[1.7] text-ink/85">
          Ranked by what travelers actually book first — overnight bays, loops, cooking and food
          runs — not obscure workshops.
        </p>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sights.map((item) => (
          <ActivityCard key={item.id} activity={item} dense cityRank={item.cityRank} />
        ))}
      </div>

      <div className="mt-10 border-t border-ink/8 pt-6">
        <Link
          to="/plan/builder/activities"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink shadow-soft transition hover:border-terracotta/35"
        >
          ← Back to activities
        </Link>
      </div>
    </div>
  )
}
