import type { YourVietnamDay } from '../lib/yourVietnam/types'

export function DayToggleBar({
  days,
  activeDay,
  onSelect,
}: {
  days: YourVietnamDay[]
  activeDay: number
  onSelect: (day: number) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Trip days"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {days.map((d) => {
        const on = d.day === activeDay
        return (
          <button
            key={d.day}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(d.day)}
            className={`shrink-0 rounded-[18px] px-4 py-3 text-left transition ${
              on
                ? 'bg-ink text-paper shadow-soft'
                : 'border border-ink/8 bg-paper text-ink hover:-translate-y-0.5 hover:border-terracotta/30'
            }`}
          >
            <span
              className={`block text-[0.65rem] font-bold uppercase tracking-[0.14em] ${
                on ? 'text-paper/65' : 'text-terracotta'
              }`}
            >
              Day {String(d.day).padStart(2, '0')}
            </span>
            <span className="mt-0.5 block font-serif text-[1.05rem] font-semibold leading-tight">
              {d.city}
            </span>
            <span className={`mt-0.5 block text-[0.72rem] ${on ? 'text-paper/70' : 'text-muted'}`}>
              {d.dateLabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}
