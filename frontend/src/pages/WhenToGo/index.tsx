import { useCallback, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { SEASONS, seasonFromMonthIndex } from './seasons'
import { ClockBackdrop } from './ClockBackdrop'
import { TravelClock } from './TravelClock'
import { ExpandedSeasonDetails } from './ExpandedSeasonDetails'

export function WhenToGoPage() {
  const [seasonId, setSeasonId] = useState(SEASONS[0].id)
  const detailsRef = useRef<HTMLElement>(null)

  const season = useMemo(
    () => SEASONS.find((item) => item.id === seasonId) ?? SEASONS[0],
    [seasonId],
  )

  const selectMonth = useCallback((monthIndex: number) => {
    setSeasonId(seasonFromMonthIndex(monthIndex).id)
  }, [])

  const scrollToDetails = useCallback(() => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-cream-deep">
        <section className="relative overflow-hidden">
          <ClockBackdrop season={season} />

          <div className="relative z-10 px-[clamp(1.1rem,4vw,2.5rem)] pb-8 pt-10 sm:pb-10 sm:pt-12">
            <header className="mb-4 text-center sm:mb-6">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="mx-auto max-w-[16ch] font-serif text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink [text-shadow:0_1px_18px_rgba(250,243,232,0.85)]"
              >
                When Should You Visit Vietnam?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="mx-auto mt-4 max-w-[40ch] text-[0.98rem] leading-relaxed text-ink/80 [text-shadow:0_1px_14px_rgba(250,243,232,0.9)]"
              >
                Explore Vietnam through the seasons and discover the experiences waiting each time
                of year.
              </motion.p>
            </header>

            <TravelClock
              season={season}
              onSelectMonth={selectMonth}
              onKnowMore={scrollToDetails}
            />
          </div>
        </section>

        <ExpandedSeasonDetails season={season} sectionRef={detailsRef} />
      </main>
      <Footer />
    </>
  )
}
