import type { YourVietnamDay, YourVietnamTrip } from '../lib/yourVietnam/types'

function usd(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

export function TripBudgetBreakdown({
  trip,
  day,
  fixedBudgetUsd,
  dailyUsd,
  groupSize,
}: {
  trip: YourVietnamTrip
  day: YourVietnamDay
  fixedBudgetUsd: number
  dailyUsd: number
  groupSize: number
}) {
  const through = trip.days
    .filter((d) => d.day <= day.day)
    .reduce((s, d) => s + d.costs.total, 0)
  const estimate = trip.cost.mid
  const vsFixed = estimate - fixedBudgetUsd
  const perPersonToday = groupSize > 0 ? day.costs.total / groupSize : day.costs.total
  const cat = trip.cost.categories

  return (
    <div className="mt-3 rounded-[18px] border border-ink/8 bg-paper px-3.5 py-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-sage">Budget</p>
      <dl className="mt-2 space-y-1 text-[0.8rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">This day</dt>
          <dd className="font-semibold text-ink">{usd(day.costs.total)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Through day {day.day}</dt>
          <dd className="font-semibold text-ink">{usd(through)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Trip estimate</dt>
          <dd className="font-semibold text-ink">{usd(estimate)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Fixed Budget</dt>
          <dd className="font-semibold text-ink">
            {usd(fixedBudgetUsd)}
            <span className="ml-1.5 font-medium text-muted">
              {vsFixed > 40
                ? `${usd(vsFixed)} over`
                : vsFixed < -40
                  ? `${usd(Math.abs(vsFixed))} under`
                  : 'on track'}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Per person daily</dt>
          <dd className="font-semibold text-ink">
            {usd(dailyUsd)}
            <span className="ml-1.5 font-medium text-muted">
              this day {usd(perPersonToday)}
            </span>
          </dd>
        </div>
      </dl>
      <p className="mt-2 border-t border-ink/6 pt-2 text-[0.72rem] text-muted">
        Stay {usd(cat.accommodation)} · Food {usd(cat.food)} · Transport {usd(cat.transport)} ·
        Experiences {usd(cat.experiences)}
      </p>
    </div>
  )
}
