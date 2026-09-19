import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BUILDER_STEPS, stepIndex, stepPath } from '../steps'
import type { BuilderStepId } from '../types'
import { useTripStore } from '../../../store/tripStore'
import { SkipToMenu } from './SkipToMenu'

type Props = {
  current: BuilderStepId
}

export function VerticalTripProgress({ current }: Props) {
  const farthest = useTripStore((s) => s.farthestStepIndex)
  const currentIdx = stepIndex(current)
  const pct = Math.round(((currentIdx + 1) / BUILDER_STEPS.length) * 100)

  return (
    <aside className="flex h-full flex-col">
      <p className="mb-5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-sage">
        Build your Vietnam Trip Step by Step
      </p>

      <div className="mb-4 h-1 overflow-hidden rounded-full bg-cream-deep">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-terracotta to-terracotta-deep"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <nav className="relative flex-1" aria-label="Trip builder stages">
        <div
          className="absolute bottom-3 left-[15px] top-3 w-px bg-ink/10"
          aria-hidden="true"
        />
        <ol className="relative space-y-1">
          {BUILDER_STEPS.map((step, i) => {
            const isCurrent = i === currentIdx
            const isDone = i < currentIdx
            const isDestination = step.id === 'itinerary'

            return (
              <li key={step.id}>
                <Link
                  to={stepPath(step.id)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`group relative flex items-start gap-3 rounded-2xl px-2 py-2.5 transition-colors ${
                    isCurrent ? 'bg-cream-deep' : 'hover:bg-cream'
                  }`}
                >
                  <span
                    className={`relative z-[1] mt-0.5 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[0.7rem] font-bold ${
                      isCurrent
                        ? 'bg-terracotta text-paper shadow-[0_6px_16px_rgba(196,92,58,0.35)]'
                        : isDone
                          ? 'bg-sage text-paper'
                          : 'bg-paper text-muted ring-1 ring-ink/10'
                    }`}
                  >
                    {isDone ? '✓' : String(i + 1).padStart(2, '0')}
                  </span>
                    <span className="min-w-0 pt-1">
                    <span
                      className={`block text-[0.88rem] font-bold leading-snug ${
                        isCurrent
                          ? 'text-ink'
                          : isDestination
                            ? 'text-ink/80'
                            : isDone
                              ? 'text-sage'
                              : 'text-muted'
                      }`}
                    >
                      {step.label}
                      {step.optional ? (
                        <span className="ml-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                          Optional
                        </span>
                      ) : null}
                    </span>
                    {isDestination && (
                      <span className="mt-0.5 block text-[0.72rem] text-muted">
                        Everything comes together here.
                      </span>
                    )}
                    {step.optional && isCurrent && (
                      <span className="mt-0.5 block text-[0.72rem] text-muted">
                        Skip if airports aren&apos;t decided yet.
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="mt-4 border-t border-ink/8 pt-4">
        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-wide text-muted">
          Visited {Math.max(farthest, currentIdx) + 1}/{BUILDER_STEPS.length}
        </p>
        <SkipToMenu current={current} />
      </div>
    </aside>
  )
}
