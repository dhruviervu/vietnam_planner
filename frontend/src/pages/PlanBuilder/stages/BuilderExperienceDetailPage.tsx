import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from '../../../components/landing/Nav'
import { useTripStore } from '../../../store/tripStore'
import { getExperienceById, EXPERIENCES } from '../data/experiences'
import { getExperienceDetails } from '../services/experienceLiveService'
import { computeTripFit } from '../services/recommendationEngine'
import { getExperienceImages } from '../lib/pricing'
import { monthFromDate } from '../data/tripSignals'
import { ExperienceDetailHero } from '../components/experienceDetail/ExperienceDetailHero'
import { ExperienceDecisionPanel } from '../components/experienceDetail/ExperienceDecisionPanel'
import { ExperienceGuide } from '../components/experienceDetail/ExperienceGuide'
import type { TimeOfDay } from '../types'

export function BuilderExperienceDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const experience = getExperienceById(id)
  const basics = useTripStore((s) => s.basics)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const addExperience = useTripStore((s) => s.addExperience)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const setExperienceSlot = useTripStore((s) => s.setExperienceSlot)
  const selected = selectedIds.includes(id)

  const [time, setTime] = useState<TimeOfDay>('morning')
  const [askSlot, setAskSlot] = useState(false)

  const tripDate = basics.dateMode === 'exact' && basics.startDate ? basics.startDate : null
  const details = useMemo(
    () => (experience ? getExperienceDetails(experience.id, tripDate, time) : null),
    [experience, tripDate, time],
  )
  const fit = experience ? computeTripFit(experience, basics, selectedIds) : null

  const activeMonth =
    tripDate != null
      ? monthFromDate(tripDate)
      : basics.flexibleMonth != null
        ? basics.flexibleMonth
        : null

  function goBackToCatalog() {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.focus()
        window.close()
        return
      } catch {
        /* fall through */
      }
    }
    navigate('/plan/builder/experiences')
  }

  if (!experience || !details || !fit) {
    return (
      <>
        <Nav mode="builder" />
        <main className="mx-auto max-w-content px-6 py-20 text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink">Experience not found</h1>
          <button type="button" onClick={goBackToCatalog} className="btn-solid mt-6">
            Back to experiences
          </button>
        </main>
      </>
    )
  }

  const related = experience.relatedIds
    .map((rid) => getExperienceById(rid))
    .filter(Boolean)
    .slice(0, 4)
  const fallbackRelated = EXPERIENCES.filter(
    (e) => e.id !== experience.id && e.region === experience.region,
  ).slice(0, 4)
  const alsoLike = (related.length ? related : fallbackRelated).filter(Boolean)

  return (
    <>
      <Nav mode="builder" />
      <main className="mx-auto max-w-[1280px] px-[clamp(1.1rem,4vw,2rem)] pb-20 pt-5">
        {/* Decision-first viewport */}
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.95fr] lg:items-stretch lg:gap-8">
          <ExperienceDetailHero experience={experience} />
          <ExperienceDecisionPanel
            experience={experience}
            live={details.live}
            time={time}
            onTimeChange={setTime}
            fitScore={fit.score}
            fitReasons={fit.reasons}
            activeMonth={activeMonth}
            selected={selected}
            onAdd={() => {
              addExperience(experience.id, 'later')
              setAskSlot(true)
            }}
            onRemove={() => {
              removeExperience(experience.id)
              setAskSlot(false)
            }}
            onBack={goBackToCatalog}
          />
        </section>

        <AnimatePresence>
          {askSlot && selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-2xl bg-cream p-4"
            >
              <p className="text-[0.88rem] font-semibold text-ink">
                When would you like to do this?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ['best', 'Best fit'],
                    ['morning', 'Morning'],
                    ['afternoon', 'Afternoon'],
                    ['evening', 'Evening'],
                    ['later', "I'll decide later"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setExperienceSlot(experience.id, value)
                      setAskSlot(false)
                    }}
                    className="rounded-full bg-paper px-3 py-1.5 text-[0.78rem] font-bold text-ink shadow-soft"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progressive detail */}
        <section className="mt-12 max-w-[720px]">
          <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Why people go</h2>
          <p className="mt-2 text-[1.05rem] font-medium leading-snug text-ink">{experience.whyGo}</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{experience.hook}</p>
        </section>

        <section className="mt-10 max-w-[720px]">
          <h2 className="font-serif text-[1.45rem] font-semibold text-ink">What to know</h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{experience.about}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <InfoChip label="Hours" value={experience.hours} />
            <InfoChip label="Best time" value={experience.bestTime} />
            <InfoChip label="Typical crowds" value={details.live.crowdLabel} />
            <InfoChip label="Visited by" value={experience.popularity} />
          </div>
        </section>

        <ExperienceGuide experienceId={experience.id} experienceName={experience.name} />

        <section className="mt-10">
          <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
            Rating ⭐ {experience.rating} / 5
          </h2>
          <p className="text-[0.85rem] text-muted">
            {experience.reviewCount.toLocaleString()} reviews
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {experience.reviews.slice(0, 3).map((r) => (
              <blockquote key={r.author} className="rounded-2xl bg-paper p-4 shadow-soft">
                <p className="text-[0.8rem] font-bold text-terracotta">
                  {'★'.repeat(r.rating)}
                  <span className="ml-2 font-semibold text-muted">{r.author}</span>
                </p>
                <p className="mt-2 text-[0.92rem] text-ink">{r.text}</p>
              </blockquote>
            ))}
          </div>
        </section>

        {alsoLike.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-[1.45rem] font-semibold text-ink">While You&apos;re Here</h2>
            <p className="mt-1 text-[0.9rem] text-muted">Nearby or complementary experiences.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {alsoLike.map((item) =>
                item ? (
                  <Link
                    key={item.id}
                    to={`/plan/builder/experience/${item.id}`}
                    className="overflow-hidden rounded-2xl bg-paper shadow-soft transition-shadow hover:shadow-card"
                  >
                    <img
                      src={getExperienceImages(item)[0]}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="text-[0.68rem] font-bold text-terracotta">
                        {item.signalEmoji} {item.signalLabel}
                      </p>
                      <p className="font-serif text-[1.05rem] font-semibold text-ink">{item.name}</p>
                      <p className="text-[0.78rem] text-muted">📍 {item.city}</p>
                    </div>
                  </Link>
                ) : null,
              )}
            </div>
          </section>
        )}
      </main>
    </>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cream px-3.5 py-3">
      <p className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-ink">{value}</p>
    </div>
  )
}
