import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { LiveTripPanel } from '../components/LiveTripPanel'
import {
  DURATION_PRESETS,
  MONTH_SIGNALS,
  SEASONS,
  buildClimateSignals,
  monthFromDate,
} from '../data/tripSignals'
import { stepPath } from '../steps'
import type { TravelStyle } from '../types'

const PACE_CARDS: {
  id: TravelStyle
  title: string
  line: string
}[] = [
  { id: 'relaxed', title: 'Slow', line: 'More time. Fewer stops.' },
  { id: 'balanced', title: 'Balanced', line: 'See more. Still breathe.' },
  { id: 'packed', title: 'Packed', line: 'Maximum experiences.' },
]

function formatRange(start: string, end: string) {
  if (!start || !end) return null
  const a = new Date(`${start}T12:00:00`)
  const b = new Date(`${end}T12:00:00`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${a.toLocaleDateString('en-US', opts)} – ${b.toLocaleDateString('en-US', opts)}`
}

function dayAfter(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

const PRESET_DAYS = DURATION_PRESETS as readonly number[]

export function TripBasics() {
  const basics = useTripStore((s) => s.basics)
  const setBasics = useTripStore((s) => s.setBasics)
  const mark = useTripStore((s) => s.markStepVisited)
  const [activeSignalId, setActiveSignalId] = useState<string | null>(null)
  const [hoverBudget, setHoverBudget] = useState<number | null>(null)
  const [hoverPace, setHoverPace] = useState<TravelStyle | null>(null)
  const [customDays, setCustomDays] = useState('')
  const [mobileSignalsOpen, setMobileSignalsOpen] = useState(true)

  useEffect(() => {
    mark('basics')
  }, [mark])

  // Keep duration UI in sync when dates (or other logic) set days
  useEffect(() => {
    if (!basics.durationKnown) return
    if (PRESET_DAYS.includes(basics.days)) {
      setCustomDays('')
    } else {
      setCustomDays(String(basics.days))
    }
  }, [basics.days, basics.durationKnown])

  const endDateMin = basics.startDate ? dayAfter(basics.startDate) : undefined
  const endDateInvalid =
    Boolean(basics.startDate && basics.endDate && basics.endDate <= basics.startDate)

  const activeSeasonLabel = useMemo(() => {
    if (basics.flexibleSeason) return basics.flexibleSeason
    if (basics.flexibleMonth != null) {
      return (
        SEASONS.find((s) => (s.months as readonly number[]).includes(basics.flexibleMonth!))
          ?.label ?? null
      )
    }
    return null
  }, [basics.flexibleSeason, basics.flexibleMonth])

  const planningMonth = useMemo(() => {
    if (basics.dateMode === 'exact') {
      return monthFromDate(basics.startDate) ?? monthFromDate(basics.endDate)
    }
    if (basics.dateMode === 'flexible') {
      if (basics.flexibleMonth != null) return basics.flexibleMonth
      // Season-only: use mid-season month so live signals stay meaningful
      if (basics.flexibleSeason) {
        const season = SEASONS.find((s) => s.label === basics.flexibleSeason)
        return season?.months[1] ?? null
      }
      return null
    }
    return null
  }, [
    basics.dateMode,
    basics.startDate,
    basics.endDate,
    basics.flexibleMonth,
    basics.flexibleSeason,
  ])

  const signals = useMemo(() => buildClimateSignals(planningMonth), [planningMonth])

  const snapshot = useMemo(() => {
    const dateLabel =
      basics.dateMode === 'exact' && basics.startDate && basics.endDate
        ? formatRange(basics.startDate, basics.endDate)?.toUpperCase() ?? 'DATES SET'
        : basics.dateMode === 'flexible'
          ? basics.flexibleMonth
            ? MONTH_SIGNALS.find((m) => m.month === basics.flexibleMonth)!.name.toUpperCase()
            : basics.flexibleSeason
              ? basics.flexibleSeason.toUpperCase()
              : 'FLEXIBLE DATES'
          : 'DATES OPEN'

    const daysLabel = basics.durationKnown ? `${basics.days} DAYS` : 'DURATION OPEN'
    const budgetLabel = basics.budgetKnown
      ? `$${basics.budgetTarget.toLocaleString()} / ${
          basics.budgetMode === 'per-person' ? 'PERSON' : 'TOTAL'
        }`
      : 'BUDGET OPEN'
    const paceLabel = basics.paceKnown
      ? basics.travelStyle === 'relaxed'
        ? 'SLOW'
        : basics.travelStyle.toUpperCase()
      : 'PACE OPEN'

    const knownCount = [
      basics.dateMode !== 'unknown',
      basics.durationKnown,
      basics.budgetKnown,
      basics.paceKnown,
    ].filter(Boolean).length

    let interpretation = 'Start with whatever you know.'
    if (knownCount >= 3) interpretation = 'We have enough to start finding experiences that fit.'
    else if (knownCount >= 1) interpretation = 'Great starting point.'

    return { dateLabel, daysLabel, budgetLabel, paceLabel, interpretation }
  }, [basics])

  const panelProps = {
    signals,
    month: planningMonth,
    compareMonth: planningMonth === 8 ? 10 : 8,
    onSignalClick: (id: string) => setActiveSignalId((cur) => (cur === id ? null : id)),
    activeSignalId,
    days: basics.days,
    durationKnown: basics.durationKnown,
    budgetTarget: basics.budgetTarget,
    budgetKnown: basics.budgetKnown,
    budgetMode: basics.budgetMode,
    hoverBudget,
    travelStyle: hoverPace ?? basics.travelStyle,
    paceKnown: basics.paceKnown || hoverPace != null,
    snapshot,
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] xl:items-start">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
        <h1 className="font-serif text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-[1.12] text-ink">
          Let&apos;s give your trip a starting point.
        </h1>
        <p className="mt-3 max-w-[46ch] text-[1rem] text-muted">
          You don&apos;t need to have it all figured out. A rough idea helps us guide you — and
          we&apos;ll keep refining it with you.
        </p>
        <p className="mt-2 text-[0.88rem] font-semibold text-sage">
          Nothing is final. You can change any of this later.
        </p>

        <div className="mt-6 xl:hidden">
          <button
            type="button"
            onClick={() => setMobileSignalsOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl bg-paper px-4 py-3 text-left shadow-soft"
          >
            <span className="text-[0.85rem] font-bold uppercase tracking-wide text-sage">
              Trip signals
            </span>
            <span className="text-muted">{mobileSignalsOpen ? '▴' : '▾'}</span>
          </button>
          <AnimatePresence initial={false}>
            {mobileSignalsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <LiveTripPanel {...panelProps} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section className="mt-9">
          <h2 className="font-serif text-[1.4rem] font-semibold text-ink">
            When are you thinking of going?
          </h2>

          <div
            className={`mt-4 grid gap-3 sm:grid-cols-2 ${
              basics.dateMode !== 'exact' ? 'opacity-55' : ''
            }`}
          >
            <label className="block rounded-[22px] bg-paper p-4 shadow-soft">
              <span className="mb-2 block text-[0.72rem] font-bold uppercase tracking-wide text-muted">
                Start date
              </span>
              <input
                type="date"
                value={basics.startDate}
                onChange={(e) => {
                  const startDate = e.target.value
                  setBasics({
                    startDate,
                    dateMode: 'exact',
                    ...(basics.endDate && startDate && basics.endDate <= startDate
                      ? { endDate: '' }
                      : {}),
                  })
                }}
                className="w-full rounded-xl border border-ink/10 bg-cream px-3 py-2.5 font-semibold text-ink outline-none focus:border-terracotta/40"
              />
            </label>
            <label className="block rounded-[22px] bg-paper p-4 shadow-soft">
              <span className="mb-2 block text-[0.72rem] font-bold uppercase tracking-wide text-muted">
                End date
              </span>
              <input
                type="date"
                value={basics.endDate}
                min={endDateMin}
                disabled={!basics.startDate}
                onChange={(e) => {
                  const endDate = e.target.value
                  if (basics.startDate && endDate && endDate <= basics.startDate) return
                  setBasics({
                    endDate,
                    dateMode: 'exact',
                  })
                }}
                className="w-full rounded-xl border border-ink/10 bg-cream px-3 py-2.5 font-semibold text-ink outline-none focus:border-terracotta/40 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {!basics.startDate && (
                <p className="mt-2 text-[0.75rem] text-muted">Choose a start date first.</p>
              )}
              {endDateInvalid && (
                <p className="mt-2 text-[0.75rem] font-semibold text-terracotta">
                  End date must be after the start date.
                </p>
              )}
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip
              active={basics.dateMode === 'flexible'}
              onClick={() =>
                setBasics({
                  dateMode: basics.dateMode === 'flexible' ? 'unknown' : 'flexible',
                })
              }
            >
              Dates are flexible
            </ToggleChip>
            <ToggleChip
              active={basics.dateMode === 'unknown'}
              onClick={() =>
                setBasics({
                  dateMode: 'unknown',
                  startDate: '',
                  endDate: '',
                  flexibleMonth: null,
                  flexibleSeason: null,
                })
              }
            >
              I haven&apos;t decided yet
            </ToggleChip>
          </div>

          {basics.dateMode === 'flexible' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-[22px] bg-cream-deep/70 p-4"
            >
              <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-wide text-muted">
                Approximate timing
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {SEASONS.map((season) => {
                  const active = activeSeasonLabel === season.label
                  return (
                    <button
                      key={season.id}
                      type="button"
                      onClick={() =>
                        setBasics({
                          flexibleSeason: season.label,
                          flexibleMonth: null,
                        })
                      }
                      className={`rounded-full px-3 py-1.5 text-[0.8rem] font-bold ${
                        active
                          ? 'bg-terracotta text-paper'
                          : 'bg-paper text-ink shadow-soft'
                      }`}
                    >
                      {season.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MONTH_SIGNALS.map((m) => {
                  const season = SEASONS.find((s) =>
                    (s.months as readonly number[]).includes(m.month),
                  )
                  const inActiveSeason = activeSeasonLabel === season?.label
                  const isSelectedMonth = basics.flexibleMonth === m.month
                  return (
                    <button
                      key={m.month}
                      type="button"
                      onClick={() =>
                        setBasics({
                          flexibleMonth: m.month,
                          flexibleSeason: season?.label ?? null,
                        })
                      }
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        isSelectedMonth
                          ? 'bg-ink text-paper'
                          : inActiveSeason
                            ? 'bg-terracotta/20 text-terracotta-deep ring-1 ring-terracotta/35'
                            : 'bg-paper/80 text-muted'
                      }`}
                    >
                      {m.name.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {basics.dateMode === 'unknown' && (
            <p className="mt-3 text-[0.9rem] text-muted">
              That&apos;s okay. We&apos;ll help you figure this out as you explore.
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-[1.4rem] font-semibold text-ink">
            How long do you have?
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {DURATION_PRESETS.map((d) => {
              const active =
                basics.durationKnown &&
                customDays === '' &&
                (d === 21 ? basics.days >= 21 : basics.days === d)
              return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setCustomDays('')
                  setBasics({ days: d, durationKnown: true })
                }}
                className={`rounded-[18px] px-4 py-3 text-[0.95rem] font-bold transition-transform hover:-translate-y-0.5 ${
                  active
                    ? 'bg-terracotta text-paper shadow-[0_10px_24px_rgba(196,92,58,0.3)]'
                    : 'bg-paper text-ink shadow-soft'
                }`}
              >
                {d === 21 ? '21+ days' : `${d} days`}
              </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 shadow-soft ${
                basics.durationKnown && customDays !== ''
                  ? 'bg-terracotta/15 ring-1 ring-terracotta/30'
                  : 'bg-paper'
              }`}
            >
              <span className="text-[0.78rem] font-bold text-muted">Custom</span>
              <input
                type="number"
                min={1}
                max={60}
                value={customDays}
                placeholder="e.g. 9"
                onChange={(e) => {
                  setCustomDays(e.target.value)
                  const n = Number(e.target.value)
                  if (n >= 1 && n <= 60) setBasics({ days: n, durationKnown: true })
                }}
                className="w-16 border-0 bg-transparent font-semibold text-ink outline-none"
              />
            </label>
            <ToggleChip
              active={!basics.durationKnown}
              onClick={() => setBasics({ durationKnown: false })}
            >
              I haven&apos;t decided yet
            </ToggleChip>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif text-[1.4rem] font-semibold text-ink">
              How much would you like to spend?
            </h2>
            <div className="flex rounded-full bg-paper p-1 shadow-soft">
              {(['per-person', 'total'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBasics({ budgetMode: mode, budgetKnown: true })}
                  className={`rounded-full px-3 py-1.5 text-[0.75rem] font-bold ${
                    basics.budgetMode === mode ? 'bg-ink text-paper' : 'text-muted'
                  }`}
                >
                  {mode === 'per-person' ? 'Per person' : 'Total'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[24px] bg-paper p-5 shadow-soft">
            <div className="mb-3 flex items-end justify-between">
              <p className="font-serif text-[2rem] font-semibold leading-none text-ink">
                ${basics.budgetTarget.toLocaleString()}
                {basics.budgetTarget >= 2500 ? '+' : ''}
              </p>
              <p className="text-[0.85rem] font-semibold text-muted">
                {basics.budgetMode === 'per-person' ? 'per person' : 'trip total'}
              </p>
            </div>
            <input
              type="range"
              min={600}
              max={2500}
              step={50}
              value={Math.min(basics.budgetTarget, 2500)}
              onMouseEnter={() => setHoverBudget(basics.budgetTarget)}
              onMouseLeave={() => setHoverBudget(null)}
              onChange={(e) => {
                const v = Number(e.target.value)
                setHoverBudget(v)
                setBasics({ budgetTarget: v, budgetKnown: true })
              }}
              className="w-full accent-terracotta"
            />
            <div className="mt-1 flex justify-between text-[0.72rem] font-bold text-muted">
              <span>$600</span>
              <span>$2,500+</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[800, 1500, 2500].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onMouseEnter={() => setHoverBudget(tier)}
                  onMouseLeave={() => setHoverBudget(null)}
                  onClick={() => setBasics({ budgetTarget: tier, budgetKnown: true })}
                  className="rounded-full bg-cream px-3 py-1.5 text-[0.78rem] font-bold text-ink"
                >
                  Preview ${tier.toLocaleString()}
                </button>
              ))}
              <ToggleChip
                active={!basics.budgetKnown}
                onClick={() => setBasics({ budgetKnown: false })}
              >
                Not sure yet
              </ToggleChip>
            </div>
            {!basics.budgetKnown && (
              <p className="mt-3 text-[0.88rem] text-muted">
                That&apos;s okay. We&apos;ll estimate what works once we know more about your trip.
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-[1.4rem] font-semibold text-ink">
            How do you like to travel?
          </h2>
          <p className="mt-2 max-w-[46ch] text-[0.92rem] text-muted">
            Your pace shapes our recommendations — how many experiences fit each day, and how
            much room we leave to breathe.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PACE_CARDS.map((card) => {
              const active = basics.paceKnown && basics.travelStyle === card.id
              return (
                <button
                  key={card.id}
                  type="button"
                  onMouseEnter={() => setHoverPace(card.id)}
                  onMouseLeave={() => setHoverPace(null)}
                  onFocus={() => setHoverPace(card.id)}
                  onBlur={() => setHoverPace(null)}
                  onClick={() => setBasics({ travelStyle: card.id, paceKnown: true })}
                  className={`rounded-[24px] p-5 text-left shadow-soft transition-transform hover:-translate-y-1 ${
                    active ? 'bg-terracotta text-paper' : 'bg-paper text-ink'
                  }`}
                >
                  <p className="font-serif text-[1.35rem] font-semibold">{card.title}</p>
                  <p className={`mt-1 text-[0.9rem] ${active ? 'text-paper/85' : 'text-muted'}`}>
                    {card.line}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <div className="mt-12 border-t border-ink/8 pt-6">
          <p className="mb-4 max-w-[44ch] text-[0.9rem] text-muted">
            Nothing here is final. You can change your dates, budget, pace, and choices later.
          </p>
          <Link to={stepPath('experiences')} className="btn-solid inline-flex">
            Continue to Activities →
          </Link>
        </div>
      </motion.div>

      <div className="hidden xl:block xl:sticky xl:top-24 xl:self-start">
        <LiveTripPanel {...panelProps} />
      </div>
    </div>
  )
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition-colors ${
        active ? 'bg-sage text-paper' : 'bg-paper text-muted shadow-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
