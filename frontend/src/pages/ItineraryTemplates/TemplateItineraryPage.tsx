import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Footer } from '../../components/landing/Footer'
import { Nav } from '../../components/landing/Nav'
import { cityImages } from '../PlanBuilder/data/cityImages'
import { TEMPLATE_SECTIONS } from './data/sections'
import { cityArc, getTemplateById } from './data/templates'
import { DayJumpRail } from './components/DayJumpRail'
import { TemplateItemRow } from './components/TemplateItemRow'
import { cityKey } from './lib/cityKey'
import {
  PERIOD_META,
  buildTemplateItinerary,
  daysLabel,
  paceLabel,
  peopleLabel,
  periodList,
  type TemplateSlot,
} from './lib/buildTemplateItinerary'

const DAY_SCROLL_OFFSET = 100

function periodCover(city: string, slots: TemplateSlot[], fallback?: string) {
  const fromItem = slots.find((s) => s.thumb)?.thumb
  if (fromItem) return fromItem
  const photos = cityImages(cityKey(city))
  return photos[0] ?? fallback
}

export function TemplateItineraryPage() {
  const { templateId } = useParams()
  const [params] = useSearchParams()
  const template = templateId ? getTemplateById(templateId) : undefined
  const peopleParam = params.get('people')
  const requestedPeople = peopleParam ? Number.parseInt(peopleParam, 10) : null
  const ctx = useMemo(
    () => ({
      people: Number.isFinite(requestedPeople) ? requestedPeople : null,
    }),
    [requestedPeople],
  )
  const trip = useMemo(
    () => (template ? buildTemplateItinerary(template, ctx) : null),
    [template, ctx],
  )
  const [activeDay, setActiveDay] = useState(1)
  const section = template
    ? TEMPLATE_SECTIONS.find((s) => s.id === template.section)
    : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [templateId])

  useEffect(() => {
    if (!trip?.days.length) return
    const ids = trip.days.map((d) => `tpl-day-${d.day}`)
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const match = visible[0]?.target.id.match(/^tpl-day-(\d+)$/)
        if (match) setActiveDay(Number(match[1]))
      },
      { rootMargin: '-18% 0px -55% 0px', threshold: 0.12 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [trip])

  function scrollToDay(day: number) {
    setActiveDay(day)
    const el = document.getElementById(`tpl-day-${day}`)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - DAY_SCROLL_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  if (!template || !trip) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-16">
          <h1 className="font-serif text-[2rem] font-semibold text-ink">Template not found</h1>
          <p className="mt-2 text-muted">That example trip is not in the library.</p>
          <Link
            to="/plan/itinerary-templates"
            className="mt-6 inline-flex rounded-full bg-terracotta px-4 py-2 text-[0.85rem] font-bold text-paper"
          >
            Back to templates
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <p className="mb-4">
          <Link
            to="/plan/itinerary-templates"
            className="text-[0.82rem] font-semibold text-terracotta hover:underline"
          >
            ← All templates
          </Link>
        </p>

        <header className="overflow-hidden rounded-[28px] border border-ink/8 bg-paper shadow-hero md:grid md:grid-cols-[minmax(15rem,0.42fr)_minmax(0,1fr)] md:items-stretch">
          <div className="relative min-h-[220px] overflow-hidden sm:min-h-[260px] md:min-h-[320px]">
            <img src={template.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span
              className="absolute left-4 top-4 inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-terracotta px-2.5 font-serif text-[1.05rem] font-bold tabular-nums text-paper shadow-soft"
              aria-label={`Rank ${trip.rankInSection} in ${section?.label ?? 'this section'}`}
            >
              #{trip.rankInSection}
            </span>
          </div>
          <div className="px-5 py-6 sm:px-8 sm:py-7">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
              Ready-to-travel plan
              <span className="mx-1.5 text-ink/20">·</span>
              {section?.label ?? 'Example trip'}
              <span className="mx-1.5 text-ink/20">·</span>
              #{trip.rankInSection} in this section
            </p>
            <h1 className="mt-1 font-serif text-[clamp(1.85rem,3.6vw,2.7rem)] font-semibold leading-[1.05] text-ink">
              {template.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cream px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-ink/80"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[0.92rem] font-semibold text-ink/75">
              {daysLabel(trip.typicalDays)}
              <span className="mx-1.5 text-ink/25">·</span>
              {peopleLabel(template, trip.people)}
              <span className="mx-1.5 text-ink/25">·</span>
              {paceLabel(template.pace)}
            </p>
            <p className="mt-1 text-[0.86rem] text-muted">{cityArc(trip.keptCities)}</p>
            <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink/85">
              {template.description}
            </p>
            {trip.tradeoffs.length ? (
              <ul className="mt-4 max-w-[62ch] space-y-1.5">
                {trip.tradeoffs.map((line) => (
                  <li
                    key={line}
                    className="rounded-[12px] bg-cream px-3 py-2 text-[0.82rem] leading-relaxed text-ink/80"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>

        <div className="mt-10 lg:grid lg:grid-cols-[148px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <DayJumpRail days={trip.days} activeDay={activeDay} onSelect={scrollToDay} />

          <div className="min-w-0 space-y-12">
            {trip.days.map((day) => (
              <section key={day.day} id={`tpl-day-${day.day}`} className="scroll-mt-24">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-serif text-[clamp(2.2rem,4.2vw,2.9rem)] font-bold leading-none tracking-tight text-ink">
                    Day {String(day.day).padStart(2, '0')}
                  </h2>
                  <p className="font-serif text-[1.35rem] font-semibold leading-none text-ink/70">
                    {day.city}
                  </p>
                </div>
                <p className="mt-2.5 font-serif text-[1.12rem] font-semibold leading-snug text-ink/80">
                  {day.theme}
                </p>
                <p className="mt-1 max-w-[56ch] text-[0.9rem] text-muted">{day.blurb}</p>
                <div className="mt-3">
                  <TemplateItemRow slot={day.localMove} compact />
                </div>

                <div className="mt-4 space-y-3">
                  {periodList().map((period) => {
                    const slots = day.periods[period]
                    const note = day.openNotes[period]
                    if (!slots.length && !note) return null
                    const meta = PERIOD_META[period]
                    const cover = periodCover(day.city, slots, template.image)
                    return (
                      <div
                        key={period}
                        className="flex gap-3 rounded-[16px] bg-paper/90 p-2.5 ring-1 ring-ink/6 sm:p-3"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt=""
                            className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-[12px] object-cover sm:h-24 sm:w-24"
                          />
                        ) : (
                          <div className="grid h-[5.5rem] w-[5.5rem] shrink-0 place-items-center rounded-[12px] bg-cream sm:h-24 sm:w-24">
                            <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">
                              {meta.label}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[1.05rem] font-semibold leading-tight text-ink">
                            {meta.label}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.95rem] font-bold tabular-nums tracking-tight text-ink">
                              {meta.windowLabel.replace(/\s*approx\.?\s*$/i, '')}
                            </span>
                            <span className="rounded-full bg-terracotta/12 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                              approx.
                            </span>
                          </p>
                          <div className="mt-2 space-y-2">
                            {slots.map((slot) => (
                              <TemplateItemRow key={slot.id} slot={slot} compact />
                            ))}
                            {note ? (
                              <p className="rounded-[12px] bg-cream px-3 py-2 text-[0.78rem] leading-relaxed text-ink/75">
                                {note}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}

            {trip.transfers.length ? (
              <section id="tpl-between-cities" className="scroll-mt-24 border-t border-ink/8 pt-10">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
                  Between cities
                </p>
                <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                  <h2 className="font-serif text-[1.55rem] font-semibold text-ink">How you move the country</h2>
                  <button
                    type="button"
                    onClick={() =>
                      window.open('/getting-around', '_blank', 'noopener,noreferrer')
                    }
                    className="rounded-full bg-ink px-4 py-2 text-[0.78rem] font-bold text-paper transition hover:-translate-y-0.5"
                  >
                    See all travel in Vietnam
                  </button>
                </div>
                <p className="mt-1 max-w-[56ch] text-[0.88rem] text-muted">
                  City hops sit here — not stuffed into a morning — so the day you land can still be a day.
                </p>
                <div className="mt-5 space-y-2.5">
                  {trip.transfers.map((hop) => (
                    <div key={hop.slot.id}>
                      <p className="mb-1.5 text-[0.68rem] font-semibold text-muted">
                        After day {String(hop.afterDay).padStart(2, '0')}
                      </p>
                      <TemplateItemRow slot={hop.slot} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
