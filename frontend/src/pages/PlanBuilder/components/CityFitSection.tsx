import type { CityRoiRow, OptimizeResult, ScoredBagItem } from '../lib/yourVietnam/itineraryOptimize'
import { BagItemCards } from './SightsPerCitySection'

type Step = 'review' | 'impact'

type Props = {
  result: OptimizeResult
  step: Step
  onKeep: () => void
  onExtend: () => void
  onDrop: () => void
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

export function RecommendedDaysSection({ result }: { result: OptimizeResult }) {
  return (
    <section className="mt-5 rounded-[16px] border border-ink/8 bg-paper px-4 py-4 shadow-soft sm:px-5">
      <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
        Recommended Number of Days based on your Sights
      </h2>
      <p className="mt-1 text-[0.95rem] leading-relaxed text-ink">
        You can Change/Edit the number of days of Travel as you wish , this is a recommendation.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat symbol="🗺️" label="Needed" value={`${result.recommendedDays} days`} />
        <Stat symbol="⏱" label="Pace" value={`${result.maxDailyHours.toFixed(1)} h/day`} />
        <Stat symbol="💵" label="Stay + food" value={money(result.tripCostNeeded)} />
      </div>
    </section>
  )
}

export function CityFitSection({ result, step, onKeep, onExtend, onDrop }: Props) {
  const city = result.dropCandidate
  if (!city) return null

  return (
    <section className="mt-5 rounded-[20px] border border-ink/8 bg-paper px-4 py-4 shadow-soft sm:px-5">
      <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Lowest-return city</h2>
      <h3 className="mt-1 font-serif text-[1.7rem] font-semibold text-ink">{city.city}</h3>
      <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">
        A strong stop can still lose to the rest of the bag. {city.city} has the lowest total return
        given ratings, review volume, your days, budget, group size and how hard it is to see what
        you saved here.
      </p>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">
        You may have to extend your stay for these cities and they have very few sights added and
        have low return based on the number of days you can stay in Vietnam - you can extend your
        trip or drop this city - you wont miss out on much. Your choice.
      </p>

      <div className="mt-4">
        <BagItemCards items={city.items} />
      </div>

      {step === 'review' ? (
        <button
          type="button"
          onClick={onKeep}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[0.88rem] font-bold text-paper"
        >
          Keep in my itinerary
        </button>
      ) : null}

      {step === 'impact' ? (
        <ImpactCard result={result} city={city} onExtend={onExtend} onDrop={onDrop} />
      ) : null}
    </section>
  )
}

function ImpactCard({
  result,
  city,
  onExtend,
  onDrop,
}: {
  result: OptimizeResult
  city: CityRoiRow
  onExtend: () => void
  onDrop: () => void
}) {
  const budgetNote =
    result.budgetTarget > 0
      ? result.tripCostNeeded > result.budgetTarget
        ? `${money(result.tripCostNeeded - result.budgetTarget)} over your ${money(result.budgetTarget)} target`
        : `Still inside a ${money(result.budgetTarget)} target`
      : 'Set a budget above to compare'
  return (
    <div className="mt-4 rounded-[22px] border border-terracotta/25 bg-gradient-to-br from-cream via-paper to-sage/10 px-4 py-4">
      <h3 className="font-serif text-[1.35rem] font-semibold text-ink">
        What happens if you keep {city.city}
      </h3>
      <p className="mt-1 text-[0.9rem] text-ink">
        Stretch the trip to {result.recommendedDays} days so every bag city has room — or keep the
        current length and add more sights here to raise its return.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat symbol="📅" label="Days to add" value={`+${result.extraDays}`} />
        <Stat symbol="💵" label="Extra trip cost" value={money(result.extraCost)} />
        <Stat symbol="🎯" label="Budget" value={budgetNote} />
        <Stat symbol="⏱" label="Pace" value={`${result.maxDailyHours.toFixed(1)} h/day`} />
        <Stat symbol="👥" label="Travellers" value={String(result.groupSize)} />
        <Stat symbol="📍" label="Cities kept" value={String(result.cities.length)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExtend}
          className="rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-5 py-2.5 text-[0.86rem] font-bold text-paper"
        >
          Extend the trip
        </button>
        <button
          type="button"
          onClick={onDrop}
          className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.86rem] font-bold text-ink"
        >
          Drop {city.city}
        </button>
      </div>
    </div>
  )
}

export function dropBagItems(
  items: ScoredBagItem[],
  removeExperience: (id: string) => void,
  removeActivity: (id: string) => void,
) {
  for (const it of items) {
    if (it.kind === 'experience') removeExperience(it.id)
    else removeActivity(it.id)
  }
}

function Stat({
  symbol,
  label,
  value,
}: {
  symbol: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-paper/80 px-3 py-2.5 ring-1 ring-ink/8">
      <p className="text-[1.05rem] leading-none">{symbol}</p>
      <p className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.82rem] font-semibold leading-snug text-ink">{value}</p>
    </div>
  )
}
