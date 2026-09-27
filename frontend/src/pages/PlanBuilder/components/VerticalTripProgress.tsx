import { Link } from 'react-router-dom'
import { BUILDER_STEPS, PIPELINE_NAV_GROUPS, stepIndex, stepPath } from '../steps'
import type { BuilderStepId } from '../types'
import { useTripStore } from '../../../store/tripStore'

type Props = {
  current: BuilderStepId
  compact?: boolean
}

const LINK_ACTIVE =
  'flex items-center justify-between rounded-xl px-3 py-2 text-[0.84rem] font-semibold transition-all duration-200 bg-cream-deep text-ink shadow-[inset_0_0_0_1px_rgba(196,92,58,0.22)]'

const LINK_IDLE =
  'flex items-center justify-between rounded-xl px-3 py-2 text-[0.84rem] font-semibold transition-all duration-200 text-muted hover:bg-cream hover:text-ink'

export function VerticalTripProgress({ current, compact = false }: Props) {
  const farthest = useTripStore((s) => s.farthestStepIndex)
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)
  const currentIdx = stepIndex(current)
  const itineraryActive = current === 'itinerary'

  return (
    <aside className="flex h-full flex-col">
      {compact ? null : (
        <>
          <p className="mb-1 font-serif text-[1.05rem] font-semibold tracking-tight text-ink">
            TripBuilder
          </p>
          <p className="mb-5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sage">
            Build your Vietnam trip
          </p>
        </>
      )}

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1" aria-label="Trip builder stages">
        {PIPELINE_NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-muted">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.step === current
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      state={{ itineraryPipeline: true }}
                      onClick={() => enterItineraryPipeline()}
                      aria-current={active ? 'step' : undefined}
                      className={active ? LINK_ACTIVE : LINK_IDLE}
                    >
                      <span>{item.label}</span>
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`${compact ? 'mt-3' : 'mt-4'} border-t border-ink/8 pt-4`}>
        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-wide text-muted">
          Visited {Math.max(farthest, currentIdx) + 1}/{BUILDER_STEPS.length}
        </p>
        <Link
          to={stepPath('itinerary')}
          state={{ itineraryPipeline: true }}
          onClick={() => enterItineraryPipeline()}
          aria-current={itineraryActive ? 'step' : undefined}
          className={
            itineraryActive
              ? 'flex w-full items-center justify-center rounded-full bg-terracotta px-4 py-2.5 text-[0.8rem] font-bold text-paper shadow-[0_8px_20px_rgba(196,92,58,0.28)]'
              : 'flex w-full items-center justify-center rounded-full border border-ink/12 bg-cream px-4 py-2.5 text-[0.8rem] font-bold text-ink transition hover:border-ink/20 hover:bg-cream-deep'
          }
        >
          Your itinerary
        </Link>
      </div>
    </aside>
  )
}
