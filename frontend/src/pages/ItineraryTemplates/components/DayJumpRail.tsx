import type { TemplateDayPlan } from '../lib/buildTemplateItinerary'

type Props = {
  days: TemplateDayPlan[]
  activeDay: number
  onSelect: (day: number) => void
}

export function DayJumpRail({ days, activeDay, onSelect }: Props) {
  return (
    <nav
      aria-label="Trip days"
      className="mb-6 lg:sticky lg:top-24 lg:mb-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto"
    >
      <p className="mb-2 hidden text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage lg:block">
        Days
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {days.map((d) => {
          const active = activeDay === d.day
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => onSelect(d.day)}
              className={`shrink-0 rounded-full px-3 py-2 text-left transition-colors lg:w-full lg:rounded-xl ${
                active
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-muted shadow-soft hover:text-ink lg:bg-transparent lg:shadow-none'
              }`}
            >
              <span className="block font-serif text-[0.95rem] font-bold tabular-nums leading-tight">
                Day {String(d.day).padStart(2, '0')}
              </span>
              <span className={`block text-[0.68rem] ${active ? 'text-paper/70' : 'text-muted'}`}>
                {d.city}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
