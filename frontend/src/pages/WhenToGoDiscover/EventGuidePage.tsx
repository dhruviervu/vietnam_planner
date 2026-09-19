import { Link, useParams } from 'react-router-dom'
import { monthShortLabels } from './data/eventSeasons'
import { getEventGuide, getEventOverview, getParagraphImages } from './data/eventGuides'
import { getEventVisitGuide } from './data/eventVisitGuides'
import { EventCatalogCard } from './components/EventCatalogCard'
import { EventFactStack } from './components/EventFactStack'
import {
  eventMonthPath,
  eventTagPath,
  getEventById,
  isYearRoundEvent,
  moreEventsLike,
} from './data/seasonalEvents'
import { ContentImage } from '../../components/shared/ContentImage'
import { WhenToGoPageShell, useWhenToGoHomePath } from './WhenToGoPageShell'

export function EventGuidePage() {
  const { id = '' } = useParams()
  const item = getEventById(id)
  const guide = getEventGuide(id)
  const home = useWhenToGoHomePath()

  if (!item || !guide) {
    return (
      <WhenToGoPageShell>
        <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-10 pb-20">
          <h1 className="font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold text-ink">
            Event not found
          </h1>
          <p className="mt-3 text-muted">We couldn&apos;t find that festival or performance.</p>
          <Link
            to={home}
            className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.85rem] font-bold text-paper"
          >
            ← Back to When to go
          </Link>
        </main>
      </WhenToGoPageShell>
    )
  }

  const yearRound = isYearRoundEvent(item)
  const months = monthShortLabels(item.months)
  const images = getParagraphImages(item.id, item.image)
  const more = moreEventsLike(item, 6)
  const overview = getEventOverview(item.id)
  const visit = getEventVisitGuide(item.id)
  const seenLabels = new Set(item.facts.map((f) => f.label.toLowerCase()))
  const stackedFacts = [
    ...item.facts,
    ...(visit?.facts ?? []).filter((f) => !seenLabels.has(f.label.toLowerCase())),
  ]

  return (
    <WhenToGoPageShell>
      <main className="pb-20">
        <section className="relative min-h-[min(56vh,520px)] overflow-hidden bg-ink">
          <ContentImage
            src={item.image}
            fallbacks={images}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/20"
          />
          <div className="relative z-10 mx-auto flex min-h-[min(56vh,520px)] max-w-[900px] flex-col justify-end px-[clamp(1.1rem,4vw,2rem)] pb-10 pt-28">
            <a
              href={eventTagPath(item.tag)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-paper/80 hover:text-paper"
            >
              {item.tag}
            </a>
            <h1 className="mt-2 font-serif text-[clamp(1.9rem,4.2vw,3rem)] font-semibold leading-[1.08] text-paper">
              {item.name}
            </h1>
            <p className="mt-3 text-[0.88rem] font-bold text-paper">{item.city}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {yearRound ? (
                <a
                  href={eventMonthPath('year-round')}
                  className="rounded-full bg-paper/15 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-paper ring-1 ring-paper/25 hover:bg-paper/25"
                >
                  Year Round
                </a>
              ) : (
                months.map((label, i) => (
                  <a
                    key={`${item.id}-${item.months[i]}`}
                    href={eventMonthPath(item.months[i])}
                    className="rounded-full bg-paper/15 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-paper ring-1 ring-paper/25 hover:bg-paper/25"
                  >
                    {label}
                  </a>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[980px] px-[clamp(1.1rem,4vw,2rem)] py-12">
          {overview ? (
            <p className="max-w-[62ch] text-[1.08rem] leading-[1.75] text-ink/88">{overview}</p>
          ) : null}
          <div className={`max-w-[62ch] ${overview ? 'mt-8' : ''}`}>
            <EventFactStack facts={stackedFacts} />
          </div>
          {item.description ? (
            <div className="mt-10 max-w-[62ch] space-y-4">
              <h2 className="font-serif text-[clamp(1.35rem,2.5vw,1.7rem)] font-semibold text-ink">
                What it is
              </h2>
              {item.description.split('\n\n').filter(Boolean).map((p) => (
                <p key={p.slice(0, 48)} className="text-[1.02rem] leading-[1.75] text-ink/88">
                  {p}
                </p>
              ))}
            </div>
          ) : null}
          <div className={`space-y-16 ${overview || stackedFacts.length > 0 ? 'mt-12' : ''}`}>
            {guide.sections.map((section, sectionIndex) => (
              <section key={`${section.title}-${sectionIndex}`}>
                <h2 className="font-serif text-[clamp(1.35rem,2.5vw,1.7rem)] font-semibold text-ink">
                  {section.title}
                </h2>
                <div className="mt-6 space-y-10">
                  {section.paragraphs.map((p, paraIndex) => {
                    const flowIndex = guide.sections
                      .slice(0, sectionIndex)
                      .reduce((n, s) => n + s.paragraphs.length, 0) + paraIndex
                    const img = images[flowIndex] ?? item.image
                    const reverse = flowIndex % 2 === 1
                    return (
                      <div
                        key={p.slice(0, 48)}
                        className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10"
                      >
                        <p
                          className={`text-[1.02rem] leading-[1.75] text-ink/88 ${
                            reverse ? 'lg:order-2' : ''
                          }`}
                        >
                          {p}
                        </p>
                        <div className={reverse ? 'lg:order-1' : undefined}>
                          <div className="overflow-hidden rounded-[20px] shadow-soft ring-1 ring-ink/[0.06]">
                            <ContentImage
                              src={img}
                              fallbacks={images}
                              alt=""
                              className="aspect-[16/10] h-auto w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          {more.length > 0 ? (
            <section className="mt-16">
              <h2 className="font-serif text-[clamp(1.35rem,2.5vw,1.75rem)] font-semibold text-ink">
                See More Events
              </h2>
              <p className="mt-1 max-w-[48ch] text-[0.88rem] text-muted">
                More festivals and performances from the Vietnam event calendar.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((other) => (
                  <EventCatalogCard key={other.id} item={other} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </WhenToGoPageShell>
  )
}
