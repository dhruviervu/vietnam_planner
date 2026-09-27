import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EXPERIENCES } from '../data/experiences'
import { RESTAURANTS } from '../data/restaurants'
import { StageFooter } from '../components/StageFooter'
import { useTripStore } from '../../../store/tripStore'
import { stepPath } from '../steps'

export function WhereToEat() {
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const restaurantIds = useTripStore((s) => s.selectedRestaurantIds)
  const toggle = useTripStore((s) => s.toggleRestaurant)
  const mark = useTripStore((s) => s.markStepVisited)

  useEffect(() => {
    mark('eat')
  }, [mark])

  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))

  const groups = useMemo(() => {
    const byRegion = new Map<string, typeof selected>()
    for (const e of selected) {
      const list = byRegion.get(e.region) ?? []
      list.push(e)
      byRegion.set(e.region, list)
    }
    const regionList = [...byRegion.entries()]
    if (regionList.length === 0) {
      return [
        {
          region: 'Vietnam',
          activities: [] as typeof selected,
          restaurants: RESTAURANTS.slice(0, 4),
        },
      ]
    }
    return regionList.map(([region, activities]) => {
      const activityIds = new Set(activities.map((a) => a.id))
      const nearby = RESTAURANTS.filter(
        (r) =>
          r.region === region ||
          r.nearExperienceIds.some((id) => activityIds.has(id)),
      )
      return {
        region,
        activities,
        restaurants: nearby.length ? nearby : RESTAURANTS.filter((r) => r.region === region),
      }
    })
  }, [selected])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
        Where to eat
      </h1>
      <p className="mb-8 max-w-[48ch] text-muted">
        Meals organized around your selected activities — so lunch is near your afternoon stop.
      </p>

      {selected.length === 0 && (
        <div className="mb-8 rounded-[24px] bg-cream-deep p-5">
          <p className="font-semibold text-ink">Select experiences to unlock nearby restaurant picks.</p>
          <Link to={stepPath('experiences')} className="mt-3 inline-block font-bold text-terracotta">
            Choose experiences →
          </Link>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.region} className="mb-10">
          <h2 className="font-serif text-[1.5rem] font-semibold text-ink">{group.region}</h2>
          {group.activities.length > 0 && (
            <div className="mt-2 mb-4">
              <p className="mb-2 text-[0.75rem] font-bold uppercase tracking-wide text-muted">
                Your selected activities
              </p>
              <div className="flex flex-wrap gap-2">
                {group.activities.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full bg-paper px-3 py-1.5 text-[0.82rem] font-semibold text-ink shadow-soft"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mb-3 text-[0.75rem] font-bold uppercase tracking-wide text-sage">
            Recommended nearby restaurants
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {group.restaurants.map((r, i) => {
              const on = restaurantIds.includes(r.id)
              const meters = 180 + i * 140 + (r.name.length % 7) * 20
              return (
                <article key={r.id} className="flex gap-3 rounded-[22px] bg-paper p-3 shadow-soft">
                  <img
                    src={`https://picsum.photos/seed/${r.seed}/200/200`}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[1.1rem] font-semibold text-ink">{r.name}</h3>
                    <p className="text-[0.8rem] font-bold text-terracotta">{r.cuisine}</p>
                    <p className="mt-1 text-[0.82rem] text-muted">{r.blurb}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[0.72rem] font-semibold">
                      <span className="rounded-full bg-cream px-2 py-0.5">⭐ {r.rating}</span>
                      <span className="rounded-full bg-cream px-2 py-0.5">{r.priceLabel}</span>
                      <span className="rounded-full bg-cream px-2 py-0.5">{r.hours}</span>
                      <span className="rounded-full bg-cream px-2 py-0.5">
                        {meters}m from your afternoon stop
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(r.id)}
                        className={`rounded-full px-3 py-1.5 text-[0.78rem] font-bold ${
                          on ? 'bg-sage text-paper' : 'bg-terracotta text-paper'
                        }`}
                      >
                        {on ? '✓ Added' : 'Add to trip'}
                      </button>
                      <span className="rounded-full border border-ink/10 px-3 py-1.5 text-[0.78rem] font-semibold text-muted">
                        Explore restaurants
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      <StageFooter current="eat" />
    </motion.div>
  )
}
