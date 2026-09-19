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
      className="flex max-h-[28vh] flex-col gap-2 overflow-y-auto pb-1 lg:sticky lg:top-24 lg:max-h-[70vh]"
    >
      {days.map((d) => {
        const on = d.day === activeDay
        return (
          <button
            key={d.day}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => {
              onSelect(d.day)
              document.querySelector('[data-yv="crafted-itinerary"]')?.scrollIntoView({ block: 'start' })
            }}
            className={`w-full shrink-0 rounded-[18px] px-3 py-2.5 text-left transition lg:px-4 lg:py-3 ${
              on
                ? 'bg-ink text-paper shadow-soft'
                : 'border border-ink/8 bg-paper text-ink hover:border-terracotta/30'
            }`}
          >
            <span
              className={`block text-[0.65rem] font-bold uppercase tracking-[0.14em] ${
                on ? 'text-paper/65' : 'text-terracotta'
              }`}
            >
              Day {String(d.day).padStart(2, '0')}
            </span>
            <span className="mt-0.5 block font-serif text-[0.98rem] font-semibold leading-tight lg:text-[1.05rem]">
              {d.city}
            </span>
            <span className={`mt-0.5 hidden text-[0.72rem] lg:block ${on ? 'text-paper/70' : 'text-muted'}`}>
              {d.dateLabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}
