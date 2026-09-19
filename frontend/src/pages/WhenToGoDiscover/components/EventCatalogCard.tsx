import { monthShortLabels } from '../data/eventSeasons'
import {
  eventBlurb,
  eventGuidePath,
  eventMonthPath,
  eventTagPath,
  isYearRoundEvent,
  type SeasonalEventItem,
} from '../data/seasonalEvents'
import { ContentImage } from '../../../components/shared/ContentImage'
import { EventFactStack } from './EventFactStack'

export function EventCatalogCard({ item }: { item: SeasonalEventItem }) {
  const yearRound = isYearRoundEvent(item)
  const months = monthShortLabels(item.months)

  return (
    <article className="flex flex-col overflow-hidden rounded-[22px] bg-paper shadow-card ring-1 ring-ink/[0.05] transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="relative aspect-[5/3.2] overflow-hidden bg-cream">
        <ContentImage
          src={item.image}
          alt={item.name}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col px-4 py-4">
        <a
          href={eventTagPath(item.tag)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-terracotta hover:text-ink"
        >
          {item.tag}
        </a>
        <h2 className="mt-1 font-serif text-[1.15rem] font-semibold leading-snug text-ink">
          {item.name}
        </h2>
        <div className="mt-3">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Months</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {yearRound ? (
              <a
                href={eventMonthPath('year-round')}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/80 hover:bg-terracotta/15 hover:text-terracotta"
              >
                Year Round
              </a>
            ) : (
              months.map((label, i) => (
                <a
                  key={`${item.id}-${item.months[i]}`}
                  href={eventMonthPath(item.months[i])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/80 hover:bg-terracotta/15 hover:text-terracotta"
                >
                  {label}
                </a>
              ))
            )}
          </div>
        </div>
        <p className="mt-3 line-clamp-3 text-[0.82rem] leading-[1.55] text-ink/80">
          {eventBlurb(item)}
        </p>
        <div className="mt-3 flex-1">
          <EventFactStack facts={item.facts.slice(0, 4)} />
        </div>
        <a
          href={eventGuidePath(item.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex w-fit items-center rounded-full bg-ink px-4 py-2 text-[0.75rem] font-bold text-paper transition hover:bg-terracotta"
        >
          Learn More
        </a>
      </div>
    </article>
  )
}

export function EventCoverLink({
  href,
  image,
  title,
  caption,
}: {
  href: string
  image: string
  title: string
  caption?: string
}) {
  return (
    <a
      href={href}
      className="group relative block overflow-hidden rounded-[20px] bg-ink shadow-soft ring-1 ring-ink/[0.08]"
    >
      <img
        src={image}
        alt=""
        className="aspect-[16/10] h-auto w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="font-serif text-[1.05rem] font-semibold leading-snug text-paper">{title}</p>
        {caption ? (
          <p className="mt-0.5 text-[0.72rem] font-semibold text-paper/80">{caption}</p>
        ) : null}
      </div>
    </a>
  )
}
