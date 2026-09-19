import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { getExperienceById, SIGHT_CATALOG } from '../data/experiences'
import { getExperienceDetails } from '../services/experienceLiveService'
import { computeTripFit } from '../services/recommendationEngine'
import type { TimeOfDay } from '../types'
import { ExperienceDetailHero } from '../components/experienceDetail/ExperienceDetailHero'
import { ExperienceDecisionPanel } from '../components/experienceDetail/ExperienceDecisionPanel'
import { ExperienceGuide } from '../components/experienceDetail/ExperienceGuide'
import { ExperienceVideoSection } from '../components/experienceDetail/ExperienceVideoSection'
import { WhatToKnowSection } from '../components/experienceDetail/WhatToKnowSection'
import { getExperienceDetailVideos } from '../lib/experienceMedia'
import { BuilderProgressChrome } from '../components/BuilderProgressChrome'
import { ExperienceCard } from '../components/ExperienceCard'
import { rankCityExperiences } from '../services/cityCatalog'
import { pinNewSightToItinerary, readItineraryAddTarget } from '../lib/yourVietnam/itineraryAddTarget'

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
      <BuilderProgressChrome current="experiences" withNav>
        <main className="mx-auto max-w-content px-6 py-20 text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink">Experience not found</h1>
          <button type="button" onClick={goBackToCatalog} className="btn-solid mt-6">
            Back to experiences
          </button>
        </main>
      </BuilderProgressChrome>
    )
  }

  const cityRanked = rankCityExperiences(
    SIGHT_CATALOG.filter((item) => item.city === experience.city),
  )
  const alsoLike = cityRanked.filter((item) => item.id !== experience.id).slice(0, 4)
  const videoCap =
    experience.popularityTag === 'Must do' || experience.popularityTag === 'Popular' ? 3 : 2
  const detailVideos = getExperienceDetailVideos(experience).slice(0, videoCap)

  return (
    <BuilderProgressChrome current="experiences" withNav>
      <main className="mx-auto max-w-[1280px] px-[clamp(1.1rem,4vw,2rem)] pb-20 pt-5">
        {/* Decision-first viewport */}
        <section className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
          <ExperienceDetailHero key={experience.id} experience={experience} />

          <ExperienceDecisionPanel
            experience={experience}
            selected={selected}
            onAdd={() => {
              addExperience(experience.id, 'later')
              if (readItineraryAddTarget()) pinNewSightToItinerary(experience.id)
              setAskSlot(true)
            }}
            onRemove={() => {
              removeExperience(experience.id)
              setAskSlot(false)
            }}
            onBack={goBackToCatalog}
          />
        </section>

        <WhatToKnowSection experience={experience} />

        <ExperienceGuide experience={experience} className="mt-10" />

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

        <ExperienceVideoSection videos={detailVideos} name={experience.name} />

        {alsoLike.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Other Experiences</h2>
            <p className="mt-1 text-[0.9rem] text-muted">More to do in {experience.city}.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {alsoLike.map((item) => (
                <ExperienceCard
                  key={item.id}
                  experience={item}
                  tripDate={tripDate}
                  dense
                  cityRank={item.cityRank}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </BuilderProgressChrome>
  )
}
