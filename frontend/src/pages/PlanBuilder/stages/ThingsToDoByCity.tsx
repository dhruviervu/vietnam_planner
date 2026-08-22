import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TripBag } from '../components/TripBag'
import { StageFooter } from '../components/StageFooter'
import { ActivityCard } from '../components/ActivityCard'
import { useTripStore } from '../../../store/tripStore'
import { formatTripContext } from '../services/recommendationEngine'
import { cityImages } from '../data/cityImages'
import {
  CITY_ACTIVITIES,
  groupActivitiesByCity,
  activityKindFilters,
  type ActivityKind,
  type CityActivity,
} from '../data/activities'
import { stepPath } from '../steps'

const CITY_SCROLL_OFFSET = 96

export function ThingsToDoByCity() {
  const basics = useTripStore((s) => s.basics)
  const mark = useTripStore((s) => s.markStepVisited)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)
  const [mobileTripOpen, setMobileTripOpen] = useState(false)
  const [kindFilter, setKindFilter] = useState<ActivityKind | 'all'>('all')
  const [activeCity, setActiveCity] = useState<string | null>(null)

  useEffect(() => {
    mark('activities')
  }, [mark])

  const contextParts = useMemo(() => formatTripContext(basics), [basics])

  const filtered = useMemo(() => {
    if (kindFilter === 'all') return CITY_ACTIVITIES
    return CITY_ACTIVITIES.filter((a) => a.kind === kindFilter)
  }, [kindFilter])

  const groups = useMemo(() => groupActivitiesByCity(filtered), [filtered])
  const kinds = useMemo(() => activityKindFilters(), [])

  useEffect(() => {
    const nodes = groups.map((g) => document.getElementById(`activity-city-${g.cityId}`))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveCity(visible[0].target.id.replace('activity-city-', ''))
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
    )
    nodes.forEach((n) => n && observer.observe(n))
    return () => observer.disconnect()
  }, [groups])

  function scrollToCity(id: string) {
    const el = document.getElementById(`activity-city-${id}`)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - CITY_SCROLL_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <div className="relative xl:flex xl:gap-6 xl:pb-0 pb-28">
      <div className="min-w-0 flex-1">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Stage 2 · Things to do
          </p>
          <h1 className="font-serif text-[clamp(1.9rem,4vw,2.85rem)] font-semibold leading-[1.1] text-ink">
            Join in — don&apos;t just look
          </h1>
          <p className="mt-3 max-w-[54ch] text-[1.02rem] leading-relaxed text-muted">
            Classes, beach games with locals, singing, dancing, workshops — real activities you do
            with your hands and your voice. Sorted city by city so you can plan where to play.
          </p>

          {contextParts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {contextParts.map((part) => (
                <span
                  key={part}
                  className="rounded-full bg-paper px-3 py-1.5 text-[0.72rem] font-bold tracking-wide text-ink shadow-soft"
                >
                  {part}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={stepPath('experiences')}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2.5 text-[0.84rem] font-bold text-ink shadow-soft transition hover:border-terracotta/35"
            >
              ← Signature experiences
            </Link>
            <span className="text-[0.8rem] text-muted">
              {CITY_ACTIVITIES.length} activities · {groups.length} cities
            </span>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <KindChip active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
              All activities
            </KindChip>
            {kinds.map((k) => (
              <KindChip
                key={k.id}
                active={kindFilter === k.id}
                onClick={() => setKindFilter(k.id)}
              >
                {k.label}
              </KindChip>
            ))}
          </div>

          <nav
            aria-label="Jump to city"
            className="-mx-1 mt-6 border-b border-ink/6 bg-cream/90 px-1 py-3"
          >
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
              Jump to a city
            </p>
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {groups.map((g) => {
                const on = activeCity === g.cityId
                return (
                  <button
                    key={g.cityId}
                    type="button"
                    onClick={() => scrollToCity(g.cityId)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition-colors ${
                      on
                        ? 'bg-terracotta text-paper shadow-soft'
                        : 'bg-paper text-muted shadow-soft hover:text-ink'
                    }`}
                  >
                    {g.cityName}
                    <span className={`ml-1.5 ${on ? 'text-paper/70' : 'text-muted/70'}`}>
                      {g.activities.length}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>

          {groups.length === 0 ? (
            <div className="mt-10 rounded-[22px] bg-paper p-8 text-center shadow-soft">
              <p className="font-serif text-[1.35rem] font-semibold text-ink">
                No activities in this category right now.
              </p>
              <button
                type="button"
                onClick={() => setKindFilter('all')}
                className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
              >
                Show all
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-16">
              {groups.map((group, index) => (
                <CityActivitySection
                  key={group.cityId}
                  cityId={group.cityId}
                  cityName={group.cityName}
                  activities={group.activities}
                  index={index}
                  cityOptions={groups.map((g) => ({
                    id: g.cityId,
                    name: g.cityName,
                  }))}
                  onJumpCity={scrollToCity}
                />
              ))}
            </div>
          )}

          {pipelineActive ? (
            <StageFooter current="activities" continueLabel="Continue to Where to Stay →" />
          ) : null}
        </motion.div>
      </div>

      <TripBag
        mobileOpen={mobileTripOpen}
        onToggleMobile={() => setMobileTripOpen((v) => !v)}
      />
    </div>
  )
}

function CityActivitySection({
  cityId,
  cityName,
  activities,
  index,
  cityOptions,
  onJumpCity,
}: {
  cityId: string
  cityName: string
  activities: CityActivity[]
  index: number
  cityOptions: { id: string; name: string }[]
  onJumpCity: (id: string) => void
}) {
  const hero = cityImages(cityId)[0] ?? activities[0]?.image
  const kinds = [...new Set(activities.map((a) => a.kindLabel))].slice(0, 4)

  return (
    <section id={`activity-city-${cityId}`} className="scroll-mt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.12) }}
      >
        <div className="relative overflow-hidden rounded-[28px] shadow-hero">
          <div className="absolute inset-0">
            {hero ? (
              <img
                src={hero}
                alt=""
                className="h-full w-full object-cover"
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="h-full w-full bg-cream-deep" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/78 via-ink/45 to-ink/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
          </div>

          <div className="relative flex min-h-[220px] flex-col justify-end px-5 py-7 sm:min-h-[260px] sm:px-8 sm:py-9">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-paper/75">
              {String(index + 1).padStart(2, '0')} · {activities.length} activities
            </p>
            <h2 className="mt-1 font-serif text-[clamp(1.85rem,4vw,2.55rem)] font-semibold leading-tight text-paper">
              {cityName}
            </h2>
            <p className="mt-2 max-w-[42ch] text-[0.95rem] text-paper/85">
              Hands-on ways to spend time here — not just places to photograph.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {kinds.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-paper/25 bg-paper/12 px-3 py-1 text-[0.72rem] font-bold tracking-wide text-paper backdrop-blur-sm"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        {cityOptions.length > 1 && (
          <div className="mt-4 rounded-[18px] border border-ink/8 bg-paper/80 px-4 py-3 shadow-soft">
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
              Jump to another city
            </p>
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cityOptions.map((c) => {
                const here = c.id === cityId
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={here}
                    onClick={() => onJumpCity(c.id)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition-colors ${
                      here
                        ? 'bg-ink/10 text-ink/50'
                        : 'bg-cream text-muted shadow-soft hover:text-ink'
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}

function KindChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition-colors ${
        active ? 'bg-ink text-paper' : 'bg-paper text-muted shadow-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
