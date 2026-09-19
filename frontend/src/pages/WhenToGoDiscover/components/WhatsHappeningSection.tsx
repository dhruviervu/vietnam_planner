import { useEffect, useRef, useState } from 'react'
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
import {
  alsoInMonthNames,
  eventGuidePath,
  eventMonthPath,
  eventTagPath,
  getEventsForSeason,
  isYearRoundEvent,
  type SeasonalEventItem,
} from '../data/seasonalEvents'
import { EventFactStack } from './EventFactStack'

type Props = {
  selectedMonth: MonthId
  focusSeason?: EventSeason | null
}

const MONTH_PILL =
  'rounded-full bg-terracotta px-3.5 py-1.5 text-[0.75rem] font-bold uppercase tracking-wide text-paper shadow-sm transition hover:bg-terracotta-deep'

export function WhatsHappeningSection({ selectedMonth, focusSeason = null }: Props) {
  const [activeSeason, setActiveSeason] = useState<EventSeason>(() => monthToSeason(selectedMonth))
  const scrollLockRef = useRef<EventSeason | null>(null)
  const scrollLockTimerRef = useRef<number | null>(null)
  const rafSpyRef = useRef<number | null>(null)

  useEffect(() => {
    if (focusSeason == null) return
    setActiveSeason(focusSeason)
  }, [focusSeason])

  useEffect(() => {
    const spy = () => {
      if (scrollLockRef.current) {
        setActiveSeason(scrollLockRef.current)
        return
      }
      const marker = 140
      let current = EVENT_SEASONS[0]
      for (const season of EVENT_SEASONS) {
        const el = document.getElementById(seasonSectionId(season))
        if (!el) continue
        if (el.getBoundingClientRect().top <= marker) current = season
      }
      setActiveSeason(current)
    }

    const onScroll = () => {
      if (rafSpyRef.current != null) return
      rafSpyRef.current = window.requestAnimationFrame(() => {
        rafSpyRef.current = null
        spy()
      })
    }

    spy()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafSpyRef.current != null) window.cancelAnimationFrame(rafSpyRef.current)
      if (scrollLockTimerRef.current != null) window.clearTimeout(scrollLockTimerRef.current)
    }
  }, [])

  function handleFilter(season: EventSeason) {
    setActiveSeason(season)
    scrollLockRef.current = season
    if (scrollLockTimerRef.current != null) window.clearTimeout(scrollLockTimerRef.current)
    document
      .getElementById(seasonSectionId(season))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    scrollLockTimerRef.current = window.setTimeout(() => {
      scrollLockRef.current = null
      setActiveSeason(season)
    }, 900)
  }

  return (
    <section>
      <h2 className="font-serif text-[clamp(1.2rem,2.4vw,1.45rem)] font-semibold text-ink">
        Vietnam Events Month by Month
      </h2>
      <p className="mt-0.5 max-w-[52ch] text-[0.84rem] text-muted">
        See the various events and festivals in Vietnam in this section. Select a season below or
        just scroll through.
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
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {season === 'year-round' ? (
          <a
            href={eventMonthPath('year-round')}
            target="_blank"
            rel="noopener noreferrer"
            className={MONTH_PILL}
          >
            Year Round
          </a>
        ) : (
          monthLabels.map((label, i) => (
            <a
              key={`${months[i]}-${label}`}
              href={eventMonthPath(months[i])}
              target="_blank"
              rel="noopener noreferrer"
              className={MONTH_PILL}
            >
              {label}
            </a>
          ))
        )}
      </div>
      <p className="mt-3 max-w-[62ch] text-[0.88rem] leading-[1.65] text-ink/80">{meta.intro}</p>
      {season !== 'year-round' ? (
        <a
          href={`/when-to-go/discover/season/${season}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[0.82rem] font-bold text-terracotta transition hover:text-ink"
        >
          Learn More…
          <span aria-hidden>↗</span>
        </a>
      ) : null}

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
  const alsoIn = alsoInMonthNames(item)
  const yearRound = isYearRoundEvent(item)

  return (
    <article className="border-t border-ink/8 pt-6">
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
