import { useEffect, useState } from 'react'
import type { MonthId } from '../data/months'
import {
  EVENT_SEASONS,
  SEASON_META,
  SEASON_MONTHS,
  monthShortLabels,
  monthToSeason,
  seasonSectionId,
  type EventSeason,
} from '../data/eventSeasons'
import { getEventsForSeason, type SeasonalEventItem } from '../data/seasonalEvents'

type Props = {
  selectedMonth: MonthId
  focusSeason?: EventSeason | null
}

export function WhatsHappeningSection({ selectedMonth, focusSeason = null }: Props) {
  const [activeSeason, setActiveSeason] = useState<EventSeason>(() => monthToSeason(selectedMonth))

  useEffect(() => {
    if (focusSeason == null) return
    setActiveSeason(focusSeason)
  }, [focusSeason])

  function handleFilter(season: EventSeason) {
    setActiveSeason(season)
    document
      .getElementById(seasonSectionId(season))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section>
      <h2 className="font-serif text-[clamp(1.2rem,2.4vw,1.45rem)] font-semibold text-ink">
        Vietnam Events Month by Month
      </h2>
      <p className="mt-0.5 max-w-[52ch] text-[0.84rem] text-muted">
        Five seasonal chapters — festivals, summer events, and year-round stages — with the months
        each chapter covers.
      </p>

      <div className="mt-5 lg:grid lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <SeasonFilterBar active={activeSeason} onSelect={handleFilter} />

        <div className="mt-4 min-w-0 space-y-8 lg:mt-0">
          {EVENT_SEASONS.map((season) => (
            <SeasonEventSection
              key={season}
              season={season}
              active={activeSeason === season}
              items={getEventsForSeason(season)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function SeasonFilterBar({
  active,
  onSelect,
}: {
  active: EventSeason
  onSelect: (season: EventSeason) => void
}) {
  return (
    <nav aria-label="Event seasons" className="lg:sticky lg:top-24 lg:self-start">
      <p className="mb-1.5 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-sage">
        Season
      </p>
      <div className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
        {EVENT_SEASONS.map((season) => {
          const meta = SEASON_META[season]
          const isActive = active === season
          return (
            <button
              key={season}
              type="button"
              onClick={() => onSelect(season)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1.5 text-left text-[0.72rem] font-bold transition ring-1 lg:w-full lg:rounded-[12px] ${
                isActive
                  ? 'bg-ink text-paper shadow-sm ring-ink'
                  : 'bg-paper text-ink/85 ring-ink/[0.08] hover:bg-cream hover:ring-terracotta/25'
              }`}
            >
              {meta.filterLabel}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function SeasonEventSection({
  season,
  active,
  items,
}: {
  season: EventSeason
  active: boolean
  items: SeasonalEventItem[]
}) {
  const meta = SEASON_META[season]
  const months = SEASON_MONTHS[season]
  const monthLabels = monthShortLabels(months)

  return (
    <section
      id={seasonSectionId(season)}
      className={`scroll-mt-24 rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 sm:px-6 sm:py-6 ${
        active ? 'ring-terracotta/35' : 'ring-ink/[0.06]'
      }`}
    >
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-sage">
        <span aria-hidden className="mr-1">
          {meta.symbol}
        </span>
        {meta.filterLabel}
      </p>
      <h3 className="mt-1 font-serif text-[clamp(1.35rem,2.4vw,1.7rem)] font-semibold leading-tight text-ink">
        <span aria-hidden className="mr-2">
          {meta.symbol}
        </span>
        {meta.title}
      </h3>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {monthLabels.map((label, i) => (
          <span
            key={`${months[i]}-${label}`}
            className="rounded-full bg-cream px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-ink ring-1 ring-ink/[0.08]"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="mt-3 max-w-[62ch] text-[0.88rem] leading-[1.65] text-ink/80">{meta.intro}</p>

      <div className="mt-6 space-y-8">
        {items.map((item) => (
          <EventSubsection key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function EventSubsection({ item }: { item: SeasonalEventItem }) {
  const paragraphs = item.description.split('\n\n').filter(Boolean)
  const itemMonths = monthShortLabels(item.months)

  return (
    <article className="border-t border-ink/8 pt-6">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-terracotta/12 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-terracotta ring-1 ring-terracotta/20">
          {item.tag}
        </span>
        <span className="text-[0.65rem] font-bold uppercase tracking-wide text-terracotta">
          {item.city}
        </span>
      </div>
      <h4 className="mt-2 font-serif text-[clamp(1.15rem,2vw,1.4rem)] font-semibold leading-snug text-ink">
        {item.name}
      </h4>
      <p className="mt-1 text-[0.68rem] font-semibold text-muted">{item.region}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {itemMonths.map((label, i) => (
          <span
            key={`${item.id}-${item.months[i]}`}
            className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/75"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-start lg:gap-6">
        <div className="space-y-3">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="text-[0.9rem] leading-[1.7] text-ink/88">
              {p}
            </p>
          ))}
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
