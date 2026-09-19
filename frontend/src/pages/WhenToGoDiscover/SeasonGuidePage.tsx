import { Link, useParams } from 'react-router-dom'
import {
  SEASON_META,
  SEASON_MONTHS,
  monthShortLabels,
} from './data/eventSeasons'
import {
  getSeasonGuide,
  otherSeasons,
  seasonGuidePath,
  type SeasonGuide,
  type SeasonGuideSection,
} from './data/seasonGuides'
import { WhenToGoPageShell, useEventCalendarPath, useWhenToGoHomePath } from './WhenToGoPageShell'

export function SeasonGuidePage() {
  const { season = '' } = useParams()
  const guide = getSeasonGuide(season)

  if (!guide) {
    return (
      <WhenToGoPageShell>
        <SeasonNotFound />
      </WhenToGoPageShell>
    )
  }

  const meta = SEASON_META[guide.season]
  const monthLabels = monthShortLabels(SEASON_MONTHS[guide.season])
  const others = otherSeasons(guide.season)

  return (
    <WhenToGoPageShell>
      <main className="pb-20">
        <section className="relative min-h-[min(72vh,640px)] overflow-hidden bg-ink">
          <img
            src={guide.heroImage}
            alt={guide.heroAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/45 to-ink/20"
          />
          <div className="relative z-10 mx-auto flex min-h-[min(72vh,640px)] max-w-[1100px] flex-col justify-end px-[clamp(1.1rem,4vw,2rem)] pb-12 pt-28">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-paper/80">
              <span aria-hidden className="mr-1">
                {meta.symbol}
              </span>
              {meta.filterLabel}
            </p>
            <h1 className="mt-2 max-w-[22ch] font-serif text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.05] text-paper">
              {meta.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {guide.season === 'year-round' ? (
                <span className="rounded-full bg-paper/15 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-paper ring-1 ring-paper/25 backdrop-blur-sm">
                  Year Round
                </span>
              ) : (
                monthLabels.map((label, i) => (
                  <span
                    key={`${guide.season}-${label}-${i}`}
                    className="rounded-full bg-paper/15 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-paper ring-1 ring-paper/25 backdrop-blur-sm"
                  >
                    {label}
                  </span>
                ))
              )}
            </div>
            <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-[1.65] text-paper/90">
              {meta.intro}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1100px] px-[clamp(1.1rem,4vw,2rem)]">
          <div className="mt-12 space-y-16 sm:space-y-20">
            {guide.sections.map((section, index) => (
              <GuideSectionBlock key={section.id} section={section} reverse={index % 2 === 1} />
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center rounded-[24px] bg-cream px-6 py-10 text-center ring-1 ring-ink/[0.06] sm:px-10">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
              Ready to pick dates
            </p>
            <h2 className="mt-2 font-serif text-[clamp(1.4rem,2.6vw,1.85rem)] font-semibold text-ink">
              Browse the event calendar
            </h2>
            <p className="mt-2 max-w-[44ch] text-[0.9rem] text-muted">
              See every festival and stage in this season, then compare the rest of the year.
            </p>
            <CalendarCta season={guide.season} />
          </div>

          <section className="mt-16">
            <h2 className="font-serif text-[clamp(1.35rem,2.5vw,1.75rem)] font-semibold text-ink">
              Other seasons
            </h2>
            <p className="mt-1 max-w-[48ch] text-[0.88rem] text-muted">
              Vietnam changes character with the calendar. Open another chapter.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((other) => (
                <OtherSeasonCard key={other} season={other} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </WhenToGoPageShell>
  )
}

function SeasonNotFound() {
  const home = useWhenToGoHomePath()
  return (
    <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-10 pb-20">
      <h1 className="font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold text-ink">
        Season not found
      </h1>
      <p className="mt-3 text-muted">We couldn&apos;t find that seasonal guide.</p>
      <Link
        to={home}
        className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.85rem] font-bold text-paper"
      >
        ← Back to When to go
      </Link>
    </main>
  )
}

function CalendarCta({ season }: { season: SeasonGuide['season'] }) {
  const href = useEventCalendarPath(season)
  return (
    <a
      href={href}
      className="mt-5 inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-[0.88rem] font-bold text-paper shadow-soft transition hover:bg-terracotta"
    >
      Browse Event Calendar
    </a>
  )
}

function GuideSectionBlock({
  section,
  reverse,
}: {
  section: SeasonGuideSection
  reverse: boolean
}) {
  return (
    <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div className={reverse ? 'lg:order-2' : undefined}>
        <h2 className="font-serif text-[clamp(1.45rem,2.6vw,1.95rem)] font-semibold leading-tight text-ink">
          {section.title}
        </h2>
        <div className="mt-4 space-y-4">
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 56)} className="text-[1.02rem] leading-[1.75] text-ink/88">
              {p}
            </p>
          ))}
        </div>
      </div>
      <div className={reverse ? 'lg:order-1' : undefined}>
        <div className="overflow-hidden rounded-[22px] shadow-soft ring-1 ring-ink/[0.06]">
          <img
            src={section.image}
            alt={section.imageAlt}
            className="aspect-[4/3] h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </article>
  )
}

function OtherSeasonCard({ season }: { season: SeasonGuide['season'] }) {
  const meta = SEASON_META[season]
  const guide = getSeasonGuide(season)
  if (!guide) return null

  return (
    <Link
      to={seasonGuidePath(season)}
      className="group overflow-hidden rounded-[18px] bg-paper shadow-soft ring-1 ring-ink/[0.06] transition hover:-translate-y-0.5 hover:ring-terracotta/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={guide.heroImage}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
        <p className="absolute bottom-2.5 left-3 text-[0.78rem] font-bold text-paper">
          <span aria-hidden className="mr-1">
            {meta.symbol}
          </span>
          {meta.filterLabel}
        </p>
      </div>
      <div className="px-3.5 py-3">
        <p className="font-serif text-[1.02rem] font-semibold leading-snug text-ink">{meta.title}</p>
        <p className="mt-1 line-clamp-3 text-[0.75rem] leading-snug text-muted">{meta.intro}</p>
      </div>
    </Link>
  )
}
