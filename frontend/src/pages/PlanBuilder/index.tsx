import { Suspense, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { useTripStore } from '../../store/tripStore'
import { StayProgressPanel } from './components/StayProgressPanel'
import { BuilderStageSkeleton } from './components/BuilderStageSkeleton'
import { BUILDER_STEPS, PIPELINE_START } from './steps'
import type { BuilderStepId } from './types'

function currentStepFromPath(pathname: string): BuilderStepId {
  const parts = pathname.split('/').filter(Boolean)
  const builderIdx = parts.indexOf('builder')
  const first = (builderIdx >= 0 ? parts[builderIdx + 1] : parts.at(-1)) ?? 'when-to-go'
  if (first === 'experiences' || first === 'experiences-city' || first === 'experience') return 'experiences'
  if (first === 'activities' || first === 'activity') return 'activities'
  if (first === 'stay') return 'stay'
  if (first === 'transport') return 'transport'
  if (first === 'eat') return 'eat'
  if (first === 'shopping') return 'shopping'
  if (first === 'airport') return 'airport'
  if (first === 'logistics') return 'logistics'
  if (first === 'itinerary') return 'itinerary'
  if (first === 'when-to-go' || first === 'basics') return 'when-to-go'
  if (first === 'know-before') return 'logistics'
  const match = BUILDER_STEPS.find((s) => s.path === first)
  return match?.id ?? 'when-to-go'
}

export type PipelineLocationState = {
  itineraryPipeline?: boolean
}

export function PlanBuilderLayout() {
  const location = useLocation()
  const current = currentStepFromPath(location.pathname)
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)
  const mark = useTripStore((s) => s.markStepVisited)

  useEffect(() => {
    enterItineraryPipeline()
    mark(current)
  }, [current, enterItineraryPipeline, mark, location.key])

  const selfPadded = [
    'when-to-go',
    'stay',
    'transport',
    'eat',
    'shopping',
    'airport',
    'logistics',
  ].includes(current) || /\/plan\/builder\/(experience|activity|stay\/compare)\//.test(location.pathname)

  return (
    <>
      <Nav mode="builder" />
      <div className="flex min-h-[calc(100vh-72px)]">
        <StayProgressPanel current={current} inFlow />
        <div className="min-w-0 flex-1">
          <main
            className={
              selfPadded
                ? 'mx-auto max-w-[1600px] pb-16 pt-2 lg:pt-4'
                : 'mx-auto max-w-[1600px] px-[clamp(1.1rem,4vw,2rem)] py-6 pb-16 lg:py-8'
            }
          >
            <Suspense fallback={<BuilderStageSkeleton />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </>
  )
}

export function PlanBuilderIndexRedirect() {
  return <Navigate to={PIPELINE_START} replace state={{ itineraryPipeline: true }} />
}
