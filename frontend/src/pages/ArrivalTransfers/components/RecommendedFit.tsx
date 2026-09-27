import type { TransportMode } from '../data/types'

type Props = {
  mode: TransportMode
  people: number
  bags: number
  timeLabel: string
  destination: string
  budgetLabel: string
  onOpen: () => void
}

export function RecommendedFit({ mode, people, bags, timeLabel, destination, budgetLabel, onOpen }: Props) {
  const who = people === 1 ? '1 person' : people >= 6 ? '6+ people' : `${people} people`
  const bagsLabel = bags === 0 ? 'no bags' : bags === 1 ? '1 bag' : bags >= 5 ? '5+ bags' : `${bags} bags`
  const when = timeLabel === 'Typical time' ? 'a typical arrival' : timeLabel.toLowerCase()

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-[18px] bg-terracotta/10 px-4 py-3.5 text-left ring-1 ring-terracotta/30 transition hover:ring-terracotta/55"
    >
      <span className="shrink-0 rounded-full bg-terracotta px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-paper">
        Recommended
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-[1.15rem] font-semibold leading-tight text-ink">
          {mode.symbol} {mode.label}
        </span>
        <span className="mt-0.5 block text-[0.78rem] font-medium text-ink/75">
          Best for {who} · {bagsLabel} · {when} · {budgetLabel} budget
          {destination ? ` into ${destination}` : ''}
        </span>
      </span>
      <span className="hidden shrink-0 text-[0.72rem] font-bold text-terracotta sm:inline">
        See more →
      </span>
    </button>
  )
}
