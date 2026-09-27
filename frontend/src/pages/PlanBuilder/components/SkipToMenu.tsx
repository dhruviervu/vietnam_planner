import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BUILDER_STEPS, stepPath } from '../steps'
import type { BuilderStepId } from '../types'
import { useTripStore } from '../../../store/tripStore'

type Props = {
  current: BuilderStepId
}

export function SkipToMenu({ current }: Props) {
  const [open, setOpen] = useState(false)
  const exitItineraryPipeline = useTripStore((s) => s.exitItineraryPipeline)
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[0.8rem] font-semibold text-muted underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
      >
        Skip to
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-20 cursor-default"
              aria-label="Close skip menu"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute bottom-full right-0 z-30 mb-2 w-56 overflow-hidden rounded-2xl bg-paper p-2 shadow-card"
            >
              <p className="px-2 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-muted">
                Jump to any stage
              </p>
              <Link
                to="/"
                onClick={() => {
                  exitItineraryPipeline()
                  setOpen(false)
                }}
                className="block rounded-xl px-3 py-2 text-[0.88rem] font-semibold text-ink hover:bg-cream"
              >
                Home
              </Link>
              {BUILDER_STEPS.map((step) => (
                <Link
                  key={step.id}
                  to={stepPath(step.id)}
                  state={{ itineraryPipeline: true }}
                  onClick={() => {
                    enterItineraryPipeline()
                    setOpen(false)
                  }}
                  className={`block rounded-xl px-3 py-2 text-[0.88rem] font-semibold transition-colors ${
                    step.id === current
                      ? 'bg-cream-deep text-terracotta'
                      : 'text-ink hover:bg-cream'
                  }`}
                >
                  {step.label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
