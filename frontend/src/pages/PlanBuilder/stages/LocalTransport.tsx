import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { findLeg, formatDuration } from '../data/transport'
import { StageFooter } from '../components/StageFooter'
import { TripMap } from '../components/TripMap'
import { useTripStore } from '../../../store/tripStore'
import { stepPath } from '../steps'
import type { TransportOption } from '../types'

export function LocalTransport() {
  const regions = useTripStore((s) => s.getSelectedRegions())
  const choices = useTripStore((s) => s.transportChoices)
  const setChoice = useTripStore((s) => s.setTransportChoice)
  const mark = useTripStore((s) => s.markStepVisited)
  const [compareLeg, setCompareLeg] = useState<string | null>(null)

  useEffect(() => {
    mark('transport')
  }, [mark])

  const route = useMemo(() => {
    // preserve discovery order roughly by selection frequency already in getSelectedRegions
    return regions
  }, [regions])

  const legs = useMemo(() => {
    const result = []
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i]
      const to = route[i + 1]
      const leg = findLeg(from, to)
      if (leg) result.push(leg)
      else {
        result.push({
          id: `${from}-${to}`,
          from,
          to,
          options: [
            {
              mode: 'driver' as const,
              label: 'Private Driver',
              icon: '🚘',
              costUsd: 90,
              durationMinutes: 240,
              convenience: 5,
              status: 'Estimate',
            },
            {
              mode: 'bus' as const,
              label: 'Bus / Shuttle',
              icon: '🚐',
              costUsd: 25,
              durationMinutes: 300,
              convenience: 3,
              status: 'Estimate',
            },
          ],
        })
      }
    }
    return result
  }, [route])

  const comparing = legs.find((l) => l.id === compareLeg)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
        Stage 6
      </p>
      <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
        Local transport
      </h1>
      <p className="mb-8 max-w-[48ch] text-muted">
        Map-first planning for the moves between your stops.
      </p>

      {route.length < 2 ? (
        <div className="rounded-[24px] bg-cream-deep p-6">
          <p className="font-serif text-[1.3rem] font-semibold text-ink">
            Add at least two destinations to unlock the transport planner.
          </p>
          <p className="mt-2 text-muted">
            Pick experiences in different cities — then we&apos;ll connect them.
          </p>
          <Link to={stepPath('experiences')} className="btn-solid mt-5 inline-flex">
            Add more experiences
          </Link>
          <div className="mt-8">
            <StageFooter current="transport" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-[24px] bg-paper p-5 shadow-soft">
            <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-wide text-muted">
              Your route
            </p>
            <div className="flex flex-col gap-2">
              {route.map((region, i) => (
                <div key={region} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-terracotta text-[0.8rem] font-bold text-paper">
                    {i + 1}
                  </span>
                  <span className="font-serif text-[1.2rem] font-semibold text-ink">{region}</span>
                  {i < route.length - 1 && (
                    <span className="ml-2 text-muted" aria-hidden="true">
                      ↓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <TripMap
              defaultOpen
              title="Route map placeholder"
              markers={route.map((r) => ({
                id: r,
                label: r,
                kind: 'route' as const,
                region: r,
              }))}
              routeLabels={route}
            />
          </div>

          {legs.map((leg) => (
            <section key={leg.id} className="mb-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-[1.35rem] font-semibold text-ink">
                  {leg.from} → {leg.to}
                </h2>
                <button
                  type="button"
                  onClick={() => setCompareLeg(leg.id)}
                  className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-[0.8rem] font-bold text-ink"
                >
                  Compare options
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leg.options.map((opt) => (
                  <OptionCard
                    key={opt.mode}
                    option={opt}
                    selected={(choices[leg.id] ?? leg.options[0].mode) === opt.mode}
                    onSelect={() => setChoice(leg.id, opt.mode)}
                  />
                ))}
              </div>
            </section>
          ))}

          <StageFooter current="transport" />
        </>
      )}

      <AnimatePresence>
        {comparing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCompareLeg(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="w-full max-w-lg rounded-[28px] bg-paper p-6 shadow-hero"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-[1.4rem] font-semibold text-ink">
                Compare · {comparing.from} → {comparing.to}
              </h3>
              <div className="mt-4 space-y-3">
                {comparing.options.map((opt) => (
                  <div key={opt.mode} className="rounded-2xl bg-cream p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-ink">
                        {opt.icon} {opt.label}
                      </p>
                      <p className="font-bold text-terracotta">${opt.costUsd}</p>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[0.78rem] font-semibold text-muted">
                      <span>⏱ {formatDuration(opt.durationMinutes)}</span>
                      <span>Comfort {opt.convenience}/5</span>
                      <span>{opt.status}</span>
                    </div>
                    <Meter label="Cost" value={normalizeCost(opt.costUsd, comparing.options)} invert />
                    <Meter label="Speed" value={normalizeSpeed(opt.durationMinutes, comparing.options)} />
                    <Meter label="Convenience" value={opt.convenience / 5} />
                  </div>
                ))}
              </div>
              <button type="button" className="btn-outline mt-5 w-full" onClick={() => setCompareLeg(null)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: TransportOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-[22px] p-4 text-left shadow-soft transition-transform hover:-translate-y-0.5 ${
        selected ? 'bg-terracotta text-paper' : 'bg-paper text-ink'
      }`}
    >
      <p className="text-2xl" aria-hidden="true">
        {option.icon}
      </p>
      <p className="mt-2 font-serif text-[1.15rem] font-semibold">{option.label}</p>
      <p className={`mt-2 text-[1.2rem] font-bold ${selected ? 'text-paper' : 'text-terracotta'}`}>
        ${option.costUsd}
      </p>
      <p className={`text-[0.85rem] ${selected ? 'text-paper/85' : 'text-muted'}`}>
        {formatDuration(option.durationMinutes)} · Convenience {option.convenience}/5
      </p>
      <p className={`mt-1 text-[0.75rem] font-semibold ${selected ? 'text-paper/75' : 'text-muted'}`}>
        {option.status}
      </p>
      {selected && <p className="mt-2 text-[0.8rem] font-bold">✓ Selected</p>}
    </button>
  )
}

function Meter({
  label,
  value,
  invert,
}: {
  label: string
  value: number
  invert?: boolean
}) {
  const width = Math.round((invert ? 1 - value : value) * 100)
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-[0.7rem] font-bold text-muted">
        <span>{label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-paper">
        <div className="h-full rounded-full bg-sage" style={{ width: `${Math.max(8, width)}%` }} />
      </div>
    </div>
  )
}

function normalizeCost(cost: number, options: TransportOption[]) {
  const max = Math.max(...options.map((o) => o.costUsd))
  const min = Math.min(...options.map((o) => o.costUsd))
  if (max === min) return 0.5
  return (cost - min) / (max - min)
}

function normalizeSpeed(minutes: number, options: TransportOption[]) {
  const max = Math.max(...options.map((o) => o.durationMinutes))
  const min = Math.min(...options.map((o) => o.durationMinutes))
  if (max === min) return 1
  return 1 - (minutes - min) / (max - min)
}
