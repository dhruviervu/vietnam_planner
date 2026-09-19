import { useState } from 'react'
import { BUILDER_STEPS, stepIndex } from '../steps'
import { VerticalTripProgress } from './VerticalTripProgress'
import type { BuilderStepId } from '../types'

type Props = {
  current?: BuilderStepId
}

export function StayProgressPanel({ current = 'stay' }: Props) {
  const currentIdx = stepIndex(current)
  const step = BUILDER_STEPS[currentIdx]
  const [hovered, setHovered] = useState(false)

  return (
    <div className="relative h-[calc(100vh-72px)] w-14 shrink-0">
      <div
        className="absolute inset-y-0 left-0 z-30 cursor-pointer overflow-hidden border-r border-ink/8 bg-paper/95 shadow-[4px_0_24px_rgba(47,42,38,0.04)] backdrop-blur-sm transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: hovered ? 250 : 56 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? (
          <div className="flex h-full w-[250px] flex-col px-4 py-5 xl:px-5">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
              Itinerary progress
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <VerticalTripProgress current={current} />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-[56px] flex-col items-center gap-2 px-1.5 py-4 text-center">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-terracotta text-[0.7rem] font-bold text-paper shadow-[0_6px_14px_rgba(196,92,58,0.28)]">
              {String(currentIdx + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col items-center gap-1.5 py-1">
              {BUILDER_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`grid h-5 w-5 place-items-center rounded-full text-[0.55rem] font-bold ${
                    i < currentIdx
                      ? 'bg-sage text-paper'
                      : i === currentIdx
                        ? 'bg-terracotta/15 text-terracotta ring-1 ring-terracotta/40'
                        : 'bg-paper text-muted/70 ring-1 ring-ink/10'
                  }`}
                >
                  {i < currentIdx ? '✓' : i === currentIdx ? String(i + 1).padStart(2, '0') : '○'}
                </span>
              ))}
            </div>
            <p
              className="mt-auto max-h-[9rem] overflow-hidden text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {String(currentIdx + 1).padStart(2, '0')} · {step?.short ?? 'Step'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
