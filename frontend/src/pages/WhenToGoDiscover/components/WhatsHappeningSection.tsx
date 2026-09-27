import type { MonthId } from '../data/months'
import {
  alsoInMonthNames,
  eventGuidePath,
  eventMonthPath,
  eventTagPath,
  getAllEventsByPopularity,
  isYearRoundEvent,
  type SeasonalEventItem,
} from '../data/seasonalEvents'
import { EventFactStack } from './EventFactStack'

type Props = {
  selectedMonth: MonthId
  focusSeason?: unknown
}

const MONTH_PILL =
  'rounded-full bg-terracotta px-3.5 py-1.5 text-[0.75rem] font-bold uppercase tracking-wide text-paper shadow-sm transition hover:bg-terracotta-deep'

export function WhatsHappeningSection(_props: Props) {
  const items = getAllEventsByPopularity()

  return (
    <section>
      <h2 className="font-serif text-[clamp(1.2rem,2.4vw,1.45rem)] font-semibold text-ink">
        Vietnam Events Month by Month
      </h2>
      <p className="mt-0.5 max-w-[52ch] text-[0.84rem] text-muted">
        Festivals and performances across the year, in a traveller-friendly order.
      </p>

      <div className="mt-5 space-y-8 rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 ring-ink/[0.06] sm:px-6 sm:py-6">
        {items.map((item) => (
          <EventSubsection key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function EventSubsection({ item }: { item: SeasonalEventItem }) {
  const paragraphs = item.description.split('\n\n').filter(Boolean)
  const itemMonths = item.months.map((m) => {
    const names = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return names[m - 1] ?? String(m)
  })
  const alsoIn = alsoInMonthNames(item)
  const yearRound = isYearRoundEvent(item)

  return (
    <article className="border-t border-ink/8 pt-6 first:border-t-0 first:pt-0">
      <a
        href={eventTagPath(item.tag)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-full bg-terracotta/12 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-terracotta ring-1 ring-terracotta/20 transition hover:bg-terracotta hover:text-paper"
      >
        {item.tag}
      </a>
      <h4 className="mt-2 font-serif text-[clamp(1.15rem,2vw,1.4rem)] font-semibold leading-snug text-ink">
        {item.name}
        {alsoIn.length > 0 ? (
          <span className="font-sans text-[0.78rem] font-semibold text-muted">
            {' '}
            (Also in {alsoIn.join(', ')})
          </span>
        ) : null}
      </h4>
      <p className="mt-1 text-[0.78rem] font-bold text-terracotta">{item.city}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {yearRound ? (
          <a
            href={eventMonthPath('year-round')}
            target="_blank"
            rel="noopener noreferrer"
            className={MONTH_PILL}
          >
            Year Round
          </a>
        ) : (
          itemMonths.map((label, i) => (
            <a
              key={`${item.id}-${item.months[i]}`}
              href={eventMonthPath(item.months[i])}
              target="_blank"
              rel="noopener noreferrer"
              className={MONTH_PILL}
            >
              {label}
            </a>
          ))
        )}
      </div>

      <div className="mt-4">
        <EventFactStack facts={item.facts} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-start lg:gap-6">
        <div className="space-y-3">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="text-[0.9rem] leading-[1.7] text-ink/88">
              {p}
            </p>
          ))}
          <a
            href={eventGuidePath(item.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center rounded-full bg-ink px-5 py-2.5 text-[0.78rem] font-bold text-paper shadow-soft transition hover:bg-terracotta"
          >
            Learn More
          </a>
        </div>
        <div className="overflow-hidden rounded-[16px] ring-1 ring-ink/[0.06]">
          <img
            src={item.image}
            alt=""
            className="aspect-[16/10] h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </article>
  )
}
