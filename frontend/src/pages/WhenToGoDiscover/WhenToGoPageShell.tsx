import type { ReactNode } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { StageFooter } from '../PlanBuilder/components/StageFooter'
import { useTripStore } from '../../store/tripStore'
import { eventCalendarPath, whenToGoHomePath } from './data/seasonGuides'
import type { EventSeason } from './data/eventSeasons'

export function useWhenToGoHomePath() {
  const pipeline = useTripStore((s) => s.itineraryPipelineActive)
  return whenToGoHomePath(pipeline)
}

export function useEventCalendarPath(season?: EventSeason) {
  const pipeline = useTripStore((s) => s.itineraryPipelineActive)
  return eventCalendarPath({ pipeline, season })
}

/** Nav + footer, or pipeline progress rail + Continue, so new tabs stay in the trip. */
export function WhenToGoPageShell({
  children,
  footer = true,
}: {
  children: ReactNode
  footer?: boolean
}) {
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)

  if (pipelineActive) {
    return (
      <>
        <Nav />
        <BuilderProgressChrome current="when-to-go">
          {children}
          <div className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] pb-10">
            <StageFooter
              current="when-to-go"
              continueLabel="Continue to Sights →"
            />
          </div>
        </BuilderProgressChrome>
      </>
    )
  }

  return (
    <>
      <Nav />
      {children}
      {footer ? <Footer /> : null}
    </>
  )
}
