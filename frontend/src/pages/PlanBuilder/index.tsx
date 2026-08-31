import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { useTripStore } from '../../store/tripStore'
import { StayProgressPanel } from './components/StayProgressPanel'
import { SkipToMenu } from './components/SkipToMenu'
import { BUILDER_STEPS, PIPELINE_START } from './steps'
import type { BuilderStepId } from './types'
import { stepIndex } from './steps'

function currentStepFromPath(pathname: string): BuilderStepId {
  const parts = pathname.split('/').filter(Boolean)
  const builderIdx = parts.indexOf('builder')
  const first = (builderIdx >= 0 ? parts[builderIdx + 1] : parts.at(-1)) ?? 'when-to-go'
  if (first === 'experiences' || first === 'experiences-city') return 'experiences'
  if (first === 'activities') return 'activities'
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
  const idx = Math.max(0, stepIndex(current))
  const [progressHovered, setProgressHovered] = useState(true)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)

  // Activate from Link state (Build itinerary) — survives persist rehydrate races
  useEffect(() => {
    const st = location.state as PipelineLocationState | null
    if (st?.itineraryPipeline) {
      enterItineraryPipeline()
    }
  }, [location.state, location.key, enterItineraryPipeline])

  const selfPadded = [
    'when-to-go',
    'stay',
    'transport',
    'eat',
    'shopping',
    'airport',
    'logistics',
  ].includes(current)

  const ownsOwnRail =
    /\/plan\/builder\/experiences$/.test(location.pathname) ||
    /\/plan\/builder\/activities$/.test(location.pathname)
  const hideLayoutProgress = ownsOwnRail

  return (
    <>
      <Nav mode="builder" />
      {!hideLayoutProgress && (
        <aside
          className="fixed left-0 top-[72px] z-[60] hidden h-[calc(100vh-72px)] md:block"
          onMouseEnter={() => setProgressHovered(true)}
          onMouseLeave={() => setProgressHovered(false)}
        >
          <StayProgressPanel expanded={progressHovered} current={current} />
        </aside>
      )}

      <div
        className={`mx-auto min-h-[calc(100vh-72px)] max-w-[1600px] transition-[padding] duration-300 ${
          hideLayoutProgress ? '' : progressHovered ? 'md:pl-[250px]' : 'md:pl-14'
        }`}
      >
        {pipelineActive ? (
          <div className="sticky top-[72px] z-20 border-b border-ink/8 bg-cream/95 px-[clamp(1.1rem,4vw,2rem)] py-3 backdrop-blur-sm md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
                  Step {idx + 1} of {BUILDER_STEPS.length}
                  {BUILDER_STEPS[idx]?.optional ? ' · Optional' : ''}
                </p>
                <p className="font-serif text-[1.05rem] font-semibold text-ink">
                  {BUILDER_STEPS[idx]?.label}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {BUILDER_STEPS.map((step, i) => (
                    <span
                      key={step.id}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < idx ? 'bg-sage' : i === idx ? 'bg-terracotta' : 'bg-ink/15'
                      }`}
                    />
                  ))}
                </div>
                <SkipToMenu current={current} />
              </div>
            </div>
          </div>
        ) : null}

        <main
          className={
            selfPadded
              ? 'pb-16 pt-2 lg:pt-4'
              : 'px-[clamp(1.1rem,4vw,2rem)] py-6 pb-16 lg:py-8'
          }
        >
          <Outlet />
        </main>
      </div>
    </>
  )
}

export function PlanBuilderIndexRedirect() {
  return <Navigate to={PIPELINE_START} replace state={{ itineraryPipeline: true }} />
}
