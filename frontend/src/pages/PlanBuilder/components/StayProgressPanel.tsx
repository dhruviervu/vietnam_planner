import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BUILDER_STEPS, stepIndex } from '../steps'
import { VerticalTripProgress } from './VerticalTripProgress'
import type { BuilderStepId } from '../types'
import { useTripStore } from '../../../store/tripStore'

const RAIL_KEY = 'vn-pipeline-rail-collapsed'
export const RAIL_EXPANDED_PX = 272
export const RAIL_COLLAPSED_PX = 60

type Props = {
  current?: BuilderStepId
  /** Sit in the page flex and grow/shrink width instead of overlaying content. */
  inFlow?: boolean
}

function readCollapsed() {
  try {
    return sessionStorage.getItem(RAIL_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    if (collapsed) sessionStorage.setItem(RAIL_KEY, '1')
    else sessionStorage.removeItem(RAIL_KEY)
  } catch {
    /* ignore */
  }
}

export function StayProgressPanel({ current = 'stay', inFlow = true }: Props) {
  const currentIdx = stepIndex(current)
  const step = BUILDER_STEPS[currentIdx]
  const exitItineraryPipeline = useTripStore((s) => s.exitItineraryPipeline)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  useEffect(() => {
    writeCollapsed(collapsed)
  }, [collapsed])

  const width = collapsed ? RAIL_COLLAPSED_PX : RAIL_EXPANDED_PX

  return (
    <div
      className={
        inFlow
          ? 'sticky top-0 z-40 hidden h-svh shrink-0 self-start lg:block'
          : 'relative h-[calc(100vh-72px)] w-14 shrink-0'
      }
      style={inFlow ? { width } : undefined}
    >
      <aside
        className={
          inFlow
            ? 'flex h-full flex-col overflow-hidden border-r border-ink/10 bg-paper shadow-[6px_0_28px_rgba(47,42,38,0.06)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
            : 'absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r border-ink/10 bg-paper/95 shadow-[4px_0_24px_rgba(47,42,38,0.04)] backdrop-blur-sm transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
        }
        style={{ width }}
        aria-label="Trip progress"
      >
        {collapsed ? (
          <div className="flex h-full w-[60px] flex-col items-center px-1.5 py-3">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper shadow-[0_6px_14px_rgba(47,42,38,0.18)] transition hover:bg-terracotta"
              aria-expanded={false}
              title="Expand trip menu"
            >
              <ExpandIcon />
              <span className="sr-only">Expand trip menu</span>
            </button>
            <Link
              to="/"
              onClick={() => exitItineraryPipeline()}
              className="mt-3 grid h-9 w-9 place-items-center rounded-full text-muted ring-1 ring-ink/10 transition hover:bg-cream hover:text-ink"
              title="Home"
            >
              <HomeIcon />
              <span className="sr-only">Home</span>
            </Link>
            <span className="mt-4 grid h-8 w-8 place-items-center rounded-full bg-terracotta text-[0.68rem] font-bold text-paper shadow-[0_6px_14px_rgba(196,92,58,0.28)]">
              {String(currentIdx + 1).padStart(2, '0')}
            </span>
            <p
              className="mt-2 max-h-[7.5rem] overflow-hidden text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {step?.short ?? 'Trip'}
            </p>
          </div>
        ) : (
          <div className="flex h-full w-[272px] flex-col px-4 py-5">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="font-serif text-[1.05rem] font-semibold tracking-tight text-ink">
                  TripBuilder
                </p>
                <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sage">
                  Build your trip
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="shrink-0 rounded-full px-2.5 py-1.5 text-[0.68rem] font-bold text-muted ring-1 ring-ink/12 transition hover:bg-cream hover:text-ink"
                aria-expanded={true}
              >
                Minimize
              </button>
            </div>

            <Link
              to="/"
              onClick={() => exitItineraryPipeline()}
              className="mb-5 flex items-center justify-between rounded-xl px-3 py-2 text-[0.84rem] font-semibold text-muted transition-all duration-200 hover:bg-cream hover:text-ink"
            >
              <span>Home</span>
            </Link>

            <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
              <VerticalTripProgress current={current} compact />
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.5V20h11V10.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
