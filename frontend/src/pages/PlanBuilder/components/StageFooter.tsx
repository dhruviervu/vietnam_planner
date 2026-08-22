import { Link } from 'react-router-dom'
import { SkipToMenu } from './SkipToMenu'
import { BUILDER_STEPS, stepPath } from '../steps'
import type { BuilderStepId } from '../types'

type Props = {
  current: BuilderStepId
  continueLabel?: string
  secondaryLabel?: string
  secondaryTo?: string
  onContinue?: () => void
}

export function StageFooter({
  current,
  continueLabel,
  secondaryLabel = 'Skip for now',
  secondaryTo,
  onContinue,
}: Props) {
  const step = BUILDER_STEPS.find((s) => s.id === current)
  const next = step?.nextId
  const primaryLabel = continueLabel ?? step?.continueLabel ?? 'Continue'
  const nextTo = next ? stepPath(next) : undefined
  const skipTo = secondaryTo ?? nextTo

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-6">
      <SkipToMenu current={current} />
      <div className="flex flex-wrap items-center gap-3">
        {skipTo && (
          <Link to={skipTo} className="text-[0.88rem] font-semibold text-muted hover:text-ink">
            {secondaryLabel}
          </Link>
        )}
        {nextTo && (
          <Link to={nextTo} onClick={onContinue} className="btn-solid">
            {primaryLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
