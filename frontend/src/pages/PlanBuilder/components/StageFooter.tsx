import { Link } from 'react-router-dom'
import { BUILDER_STEPS, stepPath } from '../steps'
import type { BuilderStepId } from '../types'

type Props = {
  current: BuilderStepId
  continueLabel?: string
  onContinue?: () => void
}

export function StageFooter({
  current,
  continueLabel,
  onContinue,
}: Props) {
  const step = BUILDER_STEPS.find((s) => s.id === current)
  const next = step?.nextId
  const primaryLabel = continueLabel ?? step?.continueLabel ?? 'Continue'
  const nextTo = next ? stepPath(next) : undefined

  if (!nextTo) return null

  return (
    <div className="mt-10 flex flex-wrap items-center justify-end gap-4 border-t border-ink/8 pt-6">
      <Link to={nextTo} onClick={onContinue} className="btn-solid">
        {primaryLabel}
      </Link>
    </div>
  )
}
