import { useState } from 'react'
import { useItineraryTripStore } from '../../../store/itineraryTripStore'
import type { HolidayKind } from '../types'
import { HOLIDAY_KIND_META } from '../lib/yourVietnam/holidayKind'
import { tripIsoDate } from '../lib/yourVietnam/openingHours'

const DURATION_PRESETS = [5, 7, 10, 14] as const

const KIND_ORDER: HolidayKind[] = ['action', 'leisure']

const fieldWarn = 'rounded-2xl ring-1 ring-terracotta/40 bg-terracotta/5 p-2'

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
  const useTripStore = useItineraryTripStore()
  const basics = useTripStore((s) => s.basics)
  const setBasics = useTripStore((s) => s.setBasics)
  const [customDays, setCustomDays] = useState(
    DURATION_PRESETS.includes(basics.days as (typeof DURATION_PRESETS)[number])
      ? ''
      : String(basics.days),
  )

  const missingGroup = !basics.groupSizeKnown
  const missingKind = !basics.holidayKindKnown
  const missingBudget = !basics.budgetKnown && !basics.budgetAllocationKnown
  const missingAny = missingGroup || missingKind || missingBudget

  return (
    <section
      data-yv="shape-itinerary"
      className="rounded-[24px] border border-ink/8 bg-paper px-4 py-4 shadow-soft sm:px-5"
    >
      <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
        Shape this itinerary
      </h2>
      <p className="mt-0.5 text-[0.88rem] text-muted">
        Group size, holiday kind and budget shape the pace. Nights in each city are decided from
        the sights you saved — duration, travel, meals and opening hours.
      </p>
      {missingAny ? (
        <p className="mt-1.5 text-[0.78rem] font-semibold text-terracotta">
          Set the highlighted fields to craft a day-by-day itinerary.
        </p>
      ) : null}

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">
            Trip dates
            <span className="ml-1 font-semibold normal-case tracking-normal text-muted">· optional</span>
          </p>
          <div className="mt-1.5 flex flex-col gap-1.5">
            <input
              type="date"
              aria-label="Trip start date"
              value={basics.startDate}
              onChange={(e) => {
                const nextStart = e.target.value
                if (!nextStart) {
                  setBasics({ startDate: '', endDate: '', dateMode: 'unknown' })
                  return
                }
                const nextEnd =
                  basics.endDate && basics.endDate >= nextStart
                    ? basics.endDate
                    : tripIsoDate(nextStart, basics.days)
                setBasics({
                  startDate: nextStart,
                  endDate: nextEnd,
                  dateMode: 'exact',
                })
              }}
              className="rounded-full bg-cream px-3 py-1.5 text-[0.85rem] font-semibold text-ink"
            />
            <input
              type="date"
              aria-label="Trip end date"
              value={basics.endDate}
              min={basics.startDate || undefined}
              onChange={(e) => {
                const nextEnd = e.target.value
                if (!nextEnd) {
                  setBasics({ endDate: '', dateMode: basics.startDate ? 'exact' : 'unknown' })
                  return
                }
                const nextStart =
                  basics.startDate && basics.startDate <= nextEnd ? basics.startDate : nextEnd
                setBasics({
                  startDate: nextStart,
                  endDate: nextEnd,
                  dateMode: 'exact',
                })
              }}
              className="rounded-full bg-cream px-3 py-1.5 text-[0.85rem] font-semibold text-ink"
            />
          </div>
        </div>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">
            Trip duration
            <span className="ml-1 font-semibold normal-case tracking-normal text-muted">· optional</span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setCustomDays('')
                  const endDate = basics.startDate
                    ? tripIsoDate(basics.startDate, d)
                    : basics.endDate
                  setBasics({ days: d, durationKnown: true, ...(endDate ? { endDate } : {}) })
                }}
                className={`rounded-full px-2.5 py-1 text-[0.75rem] font-bold transition ${
                  basics.durationKnown && basics.days === d && !customDays
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
                if (n >= 1 && n <= 45) {
                  const endDate = basics.startDate
                    ? tripIsoDate(basics.startDate, n)
                    : basics.endDate
                  setBasics({ days: n, durationKnown: true, ...(endDate ? { endDate } : {}) })
                }
              }}
              className="w-[3.4rem] rounded-full border border-ink/10 bg-cream px-2 py-1 text-[0.75rem] font-semibold text-ink outline-none focus:border-terracotta/40"
            />
          </div>
        </div>

        <div className={missingGroup ? fieldWarn : undefined}>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">
            Group size
            {missingGroup ? <span className="ml-1 font-semibold normal-case tracking-normal text-terracotta">· Set this to craft</span> : null}
          </p>
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
                  basics.groupSizeKnown && basics.groupSize === n
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

        <div className={missingKind ? fieldWarn : undefined}>
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink">
            Kind of holiday
            {missingKind ? <span className="ml-1 font-semibold normal-case tracking-normal text-terracotta">· Set this to craft</span> : null}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {KIND_ORDER.map((id) => {
              const meta = HOLIDAY_KIND_META[id]
              const current = basics.holidayKind === 'action' ? 'action' : 'leisure'
              const on = basics.holidayKindKnown && current === id
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

        <div className={`grid grid-cols-2 gap-2 ${missingBudget ? fieldWarn : ''}`}>
          <label>
            <span className="text-[0.68rem] font-bold uppercase tracking-wide text-terracotta">
              Fixed budget
              {missingBudget ? <span className="ml-1 font-semibold normal-case tracking-normal">· Set this to craft</span> : null}
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
