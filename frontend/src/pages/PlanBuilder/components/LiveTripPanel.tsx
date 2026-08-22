import { AnimatePresence, motion } from 'framer-motion'
import { SignalDots, SignalRow } from './SignalMeter'
import type { TripSignal } from '../types'
import type { TravelStyle } from '../types'
import {
  BUDGET_UNLOCKS,
  budgetTier,
  compareMonths,
  paceDensity,
  tripFitForBudget,
} from '../data/tripSignals'

type Snapshot = {
  dateLabel: string
  daysLabel: string
  budgetLabel: string
  paceLabel: string
  interpretation: string
}

type Props = {
  signals: TripSignal[]
  month: number | null
  compareMonth: number | null
  onSignalClick: (id: string) => void
  activeSignalId: string | null
  days: number
  durationKnown: boolean
  budgetTarget: number
  budgetKnown: boolean
  budgetMode: 'per-person' | 'total'
  hoverBudget: number | null
  travelStyle: TravelStyle
  paceKnown: boolean
  snapshot: Snapshot
}

const PACE_COPY: Record<TravelStyle, string> = {
  relaxed: 'More time in each destination',
  balanced: 'A mix of exploring and downtime',
  packed: 'More places, less downtime',
}

const PACE_TITLE: Record<TravelStyle, string> = {
  relaxed: 'Slow',
  balanced: 'Balanced',
  packed: 'Packed',
}

export function LiveTripPanel({
  signals,
  month,
  compareMonth,
  onSignalClick,
  activeSignalId,
  days,
  durationKnown,
  budgetTarget,
  budgetKnown,
  budgetMode,
  hoverBudget,
  travelStyle,
  paceKnown,
  snapshot,
}: Props) {
  const displayBudget = hoverBudget ?? budgetTarget
  const tierKey = budgetTier(displayBudget)
  const unlocks = BUDGET_UNLOCKS[tierKey]
  const shape = tripFitForBudget(
    days,
    budgetKnown || hoverBudget != null,
    displayBudget,
  )
  const density = paceDensity(travelStyle)
  const comparison =
    month && compareMonth && month !== compareMonth
      ? compareMonths(month, compareMonth)
      : month
        ? compareMonths(month, month === 8 ? 10 : 8)
        : null

  const hasAny =
    Boolean(month) || durationKnown || budgetKnown || paceKnown

  return (
    <aside className="flex h-full flex-col rounded-[28px] bg-paper p-5 shadow-card lg:p-6">
      <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-sage">
        What this means for your trip
      </p>

      <AnimatePresence mode="wait">
        {!hasAny ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 text-[0.95rem] leading-relaxed text-muted"
          >
            Start with whatever you know. We&apos;ll help you fill in the rest.
          </motion.p>
        ) : (
          <motion.div
            key="filled"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 space-y-1"
          >
            {signals.map((signal) => (
              <SignalRow
                key={signal.id}
                signal={signal}
                active={activeSignalId === signal.id}
                onSelect={() => onSignalClick(signal.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-[0.72rem] leading-snug text-muted">
        Vietnam varies by region. These are country-level planning signals for now — once you
        choose destinations, we&apos;ll show conditions for each region.
      </p>

      {activeSignalId && comparison && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 overflow-hidden rounded-2xl bg-cream px-3 py-3"
        >
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
            {comparison.label}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-[0.82rem] font-semibold text-ink">
            <span>☀️ {comparison.weather}</span>
            <span>👥 {comparison.crowds}</span>
            <span>💰 {comparison.cost}</span>
          </div>
        </motion.div>
      )}

      <div className="mt-5 border-t border-ink/8 pt-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">Trip fit</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={
              durationKnown
                ? `fit-${days}-${budgetKnown || hoverBudget != null ? displayBudget : 'open'}`
                : 'unknown-days'
            }
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {durationKnown ? (
              <>
                <p className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">
                  {days} days
                </p>
                <p className="text-[0.9rem] font-semibold text-terracotta">
                  Good for {shape.regionsLabel} regions
                </p>
                <div className="mt-3 space-y-2">
                  {shape.routes.map((route) => (
                    <div
                      key={route.join('-')}
                      className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-cream px-3 py-2"
                    >
                      {route.map((stop, i) => (
                        <span key={stop} className="flex items-center gap-1.5">
                          <span className="rounded-full bg-paper px-2.5 py-1 text-[0.75rem] font-bold text-ink shadow-soft">
                            {stop}
                          </span>
                          {i < route.length - 1 && (
                            <span className="text-muted" aria-hidden="true">
                              ↓
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                {shape.fitNote && (
                  <p className="mt-2 text-[0.8rem] font-semibold text-ink/80">{shape.fitNote}</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-[0.9rem] text-muted">
                Example lengths: 5 · 7 · 10 · 14 days — pick one when you&apos;re ready.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
        <p className="mt-2 text-[0.75rem] text-muted">
          Travel pace matters more than exact duration. We&apos;ll adjust the route once you
          choose what you want to see.
        </p>
      </div>

      <div className="mt-5 border-t border-ink/8 pt-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">Budget feel</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={budgetKnown || hoverBudget != null ? displayBudget : 'budget-unknown'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {budgetKnown || hoverBudget != null ? (
              <>
                <p className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">
                  ${displayBudget.toLocaleString()}
                  <span className="ml-1 text-[0.85rem] font-sans font-semibold text-muted">
                    / {budgetMode === 'per-person' ? 'person' : 'total'}
                  </span>
                </p>
                <span className="mt-1 inline-flex rounded-full bg-terracotta/10 px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-terracotta">
                  {unlocks.tier}
                </span>
                <ul className="mt-3 grid grid-cols-1 gap-1.5">
                  {unlocks.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-[0.85rem] font-semibold text-ink"
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-[0.9rem] text-muted">
                Explore Comfortable → Premium → Luxury as a discovery tool — or leave it open.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 border-t border-ink/8 pt-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
          Experience density
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-serif text-[1.2rem] font-semibold text-ink">
            {paceKnown ? PACE_TITLE[travelStyle] : 'Open'}
          </p>
          <SignalDots
            level={paceKnown ? density : 3}
            tone={paceKnown ? (density >= 4 ? 'elevated' : 'favorable') : 'moderate'}
          />
        </div>
        <p className="mt-1 text-[0.85rem] text-muted">
          {paceKnown ? PACE_COPY[travelStyle] : 'Choose a pace when you know how you like to travel.'}
        </p>
      </div>

      <div className="mt-auto border-t border-ink/8 pt-4">
        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
          Your trip so far
        </p>
        <div className="flex flex-wrap gap-2">
          {[snapshot.dateLabel, snapshot.daysLabel, snapshot.budgetLabel, snapshot.paceLabel].map(
            (chip) => (
              <span
                key={chip}
                className="rounded-full bg-cream px-2.5 py-1 text-[0.75rem] font-bold text-ink"
              >
                {chip}
              </span>
            ),
          )}
        </div>
        <p className="mt-3 font-serif text-[1.05rem] font-semibold text-ink">
          {snapshot.interpretation}
        </p>
      </div>
    </aside>
  )
}
