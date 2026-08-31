import { useState } from 'react'
import { useTripStore } from '../../../store/tripStore'
import type { HolidayKind } from '../types'
import { HOLIDAY_KIND_META } from '../lib/yourVietnam/holidayKind'

const DURATION_PRESETS = [5, 7, 10, 14] as const

const KIND_ORDER: HolidayKind[] = ['action', 'leisure']

function MoneyField({
  value,
  onCommit,
  ariaLabel,
}: {
  value: number
  onCommit: (n: number) => void
  ariaLabel: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? String(value)

  function commit(raw: string) {
    const n = Number.parseInt(raw.replace(/[^\d]/g, ''), 10)
    if (Number.isFinite(n) && n >= 0) onCommit(n)
  }

  return (
    <div className="mt-1 flex items-baseline rounded-full bg-cream px-3 py-1.5">
      <span className="text-[0.85rem] font-bold text-muted">$</span>
      <input
        type="text"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={shown}
        onFocus={() => setDraft(String(value))}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={() => {
          if (draft === '' || draft === null) {
            setDraft(draft === '' ? '' : null)
            return
          }
          commit(draft)
          setDraft(null)
        }}
        className="w-full bg-transparent pl-1 font-semibold leading-none text-ink outline-none text-[0.95rem]"
      />
    </div>
  )
}

export function TripVariablesBar() {
  const basics = useTripStore((s) => s.basics)
  const setBasics = useTripStore((s) => s.setBasics)
  const [customDays, setCustomDays] = useState(
    DURATION_PRESETS.includes(basics.days as (typeof DURATION_PRESETS)[number])
      ? ''
      : String(basics.days),
  )

  return (
    <section
      data-yv="shape-itinerary"
      className="rounded-[24px] border border-ink/8 bg-paper px-4 py-4 shadow-soft sm:px-5"
    >
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
        Shape this itinerary
      </p>
      <p className="mt-0.5 text-[0.78rem] text-muted">
        Duration, group, kind of holiday and budget — change any, the days rebuild.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">Trip duration</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setCustomDays('')
                  setBasics({ days: d, durationKnown: true })
                }}
                className={`rounded-full px-2.5 py-1 text-[0.75rem] font-bold transition ${
                  basics.days === d && !customDays
                    ? 'bg-ink text-paper'
                    : 'bg-cream text-muted hover:text-ink'
                }`}
              >
                {d}d
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={45}
              placeholder="+"
              value={customDays}
              onChange={(e) => {
                const v = e.target.value
                setCustomDays(v)
                const n = Number(v)
                if (n >= 1 && n <= 45) setBasics({ days: n, durationKnown: true })
              }}
              className="w-[3.4rem] rounded-full border border-ink/10 bg-cream px-2 py-1 text-[0.75rem] font-semibold text-ink outline-none focus:border-terracotta/40"
            />
          </div>
        </div>

        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">Group size</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {(
              [
                [1, 'Solo'],
                [2, 'Couple'],
                [4, 'Family'],
              ] as const
            ).map(([n, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setBasics({ groupSize: n, groupSizeKnown: true })}
                className={`rounded-full px-2.5 py-1 text-[0.75rem] font-bold transition ${
                  basics.groupSize === n
                    ? 'bg-ink text-paper'
                    : 'bg-cream text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="inline-flex items-center overflow-hidden rounded-full bg-cream">
              <button
                type="button"
                aria-label="Fewer travellers"
                onClick={() =>
                  setBasics({
                    groupSize: Math.max(1, basics.groupSize - 1),
                    groupSizeKnown: true,
                  })
                }
                className="px-2 py-1 text-[0.85rem] font-bold text-muted hover:text-ink"
              >
                −
              </button>
              <span className="min-w-[1.4rem] text-center text-[0.8rem] font-bold text-ink">
                {basics.groupSize}
              </span>
              <button
                type="button"
                aria-label="More travellers"
                onClick={() =>
                  setBasics({
                    groupSize: Math.min(12, basics.groupSize + 1),
                    groupSizeKnown: true,
                  })
                }
                className="px-2 py-1 text-[0.85rem] font-bold text-muted hover:text-ink"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">
            Kind of holiday
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {KIND_ORDER.map((id) => {
              const meta = HOLIDAY_KIND_META[id]
              const current = basics.holidayKind === 'action' ? 'action' : 'leisure'
              const on = current === id
              return (
                <button
                  key={id}
                  type="button"
                  title={meta.line}
                  onClick={() => setBasics({ holidayKind: id, holidayKindKnown: true })}
                  className={`rounded-full px-2.5 py-1 text-[0.75rem] font-bold transition ${
                    on ? 'bg-terracotta/15 text-terracotta' : 'bg-cream text-muted hover:text-ink'
                  }`}
                >
                  {meta.label.split(' / ')[0]}
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-[0.7rem] text-muted">
            Action packs the city; relaxation keeps two or three sights plus meals.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-[0.68rem] font-bold uppercase tracking-wide text-terracotta">
              Fixed budget
            </span>
            <MoneyField
              value={basics.budgetFixedUsd}
              ariaLabel="Fixed budget in US dollars"
              onCommit={(n) => setBasics({ budgetFixedUsd: n, budgetAllocationKnown: true })}
            />
          </label>
          <label>
            <span className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">
              Per person daily
            </span>
            <MoneyField
              value={basics.budgetDailyUsd}
              ariaLabel="Per person daily spend in US dollars"
              onCommit={(n) => setBasics({ budgetDailyUsd: n, budgetAllocationKnown: true })}
            />
          </label>
        </div>
      </div>
    </section>
  )
}
