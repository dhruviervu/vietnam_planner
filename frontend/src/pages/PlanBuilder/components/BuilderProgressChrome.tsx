import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Nav } from '../../../components/landing/Nav'
import { StayProgressPanel } from './StayProgressPanel'
import type { BuilderStepId } from '../types'
import { useTripStore } from '../../../store/tripStore'

type Props = {
  current: BuilderStepId
  children: ReactNode
  /** When false, the page already rendered Nav. */
  withNav?: boolean
}

/** In-flow itinerary progress rail for pipeline pages and standalone product pages. */
export function BuilderProgressChrome({ current, children, withNav = false }: Props) {
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)
  const mark = useTripStore((s) => s.markStepVisited)

  useEffect(() => {
    enterItineraryPipeline()
    mark(current)
  }, [current, enterItineraryPipeline, mark])

  return (
    <>
      {withNav ? <Nav mode="builder" /> : null}
      <div className="flex min-h-[calc(100vh-72px)]">
        <StayProgressPanel current={current} inFlow />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  )
}
