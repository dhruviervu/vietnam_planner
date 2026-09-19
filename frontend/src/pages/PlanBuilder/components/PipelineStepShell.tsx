import { useEffect, type ReactNode } from 'react'
import { StageFooter } from '../components/StageFooter'
import { useTripStore } from '../../../store/tripStore'
import type { BuilderStepId } from '../types'

type Props = {
  step: BuilderStepId
  children: ReactNode
  /** Shown above the continue controls (e.g. optional airport note) */
  note?: ReactNode
  continueLabel?: string
}

/** Wraps an embedded product page with pipeline progress marking + continue footer. */
export function PipelineStepShell({
  step,
  children,
  note,
  continueLabel,
}: Props) {
  const mark = useTripStore((s) => s.markStepVisited)
  const pipelineActive = useTripStore((s) => s.itineraryPipelineActive)

  useEffect(() => {
    if (pipelineActive) mark(step)
  }, [mark, step, pipelineActive])

  return (
    <div className="pb-4">
      {children}
      {pipelineActive && note ? (
        <div className="mx-auto mt-8 max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)]">
          {note}
        </div>
      ) : null}
      {pipelineActive ? (
        <div className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)]">
          <StageFooter
            current={step}
            continueLabel={continueLabel}
          />
        </div>
      ) : null}
    </div>
  )
}
