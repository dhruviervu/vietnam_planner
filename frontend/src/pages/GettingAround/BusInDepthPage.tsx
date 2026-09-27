import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ContentImage } from '../../components/shared/ContentImage'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { StageFooter } from '../PlanBuilder/components/StageFooter'
import { keepPipelineAlive } from '../PlanBuilder/lib/yourVietnam/links'
import {
  BUS_BOOKING,
  BUS_PHOTOS,
  BUS_TERMINALS,
  BUS_TYPES,
  BUS_WHEN_INTRO,
  BUS_WHEN_SECTIONS,
} from './data/busGuide'

const TOC = [
  { id: 'when', label: 'When to go' },
  { id: 'types', label: 'The vehicles' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'stations', label: 'Stations' },
] as const

export function BusInDepthPage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate()

  useEffect(() => {
    keepPipelineAlive()
  }, [])

  function goBack() {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.focus()
        window.close()
        return
      } catch {
        /* fall through */
      }
    }
    navigate('/plan/builder/transport#dive-coach')
  }

  const body = (
    <article className="overflow-x-clip bg-cream text-ink">
      <header className="relative min-h-[68vh] overflow-hidden">
        <ContentImage
          src={BUS_PHOTOS.sleeper}
          fallbacks={[BUS_PHOTOS.exterior]}
          alt="Sleeper bus in Vietnam"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
        <div className="relative mx-auto flex min-h-[68vh] max-w-[1600px] flex-col justify-end px-[clamp(1.1rem,4vw,2rem)] pb-12 pt-24">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/70">
            Getting around · Coaches and vans
          </p>
          <h1 className="mt-3 max-w-[16ch] font-serif text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[0.95] text-white">
            Vietnam by bus
          </h1>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-ink/8 bg-cream/92 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-[clamp(1.1rem,4vw,2rem)] py-2.5">
          {TOC.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-[0.78rem] font-semibold text-ink/70 hover:bg-paper hover:text-ink"
            >
              {t.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-[1600px] px-[clamp(1.1rem,4vw,2rem)] py-14">
        <div className="mb-10 flex flex-wrap items-center gap-3 text-[0.82rem] font-semibold">
          <button type="button" onClick={goBack} className="text-terracotta hover:underline">
            ← Back to Getting Around
          </button>
          <span className="text-ink/25">·</span>
          <Link to="/plan/builder/transport" state={{ itineraryPipeline: true }} className="text-ink/60 hover:text-ink">
            Stay on this trip
          </Link>
        </div>

        <section id="when" className="scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            When to Travel by Bus
          </h2>
          <p className="mt-5 text-[1.08rem] leading-[1.75] text-ink/82">{BUS_WHEN_INTRO}</p>
          <div className="mt-8 space-y-7">
            {BUS_WHEN_SECTIONS.map((block) => (
              <div key={block.title}>
                <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                  {block.title}
                </h3>
                <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="types" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Inside the buses
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {BUS_TYPES.map((t) => (
              <article key={t.title} className="rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                <h3 className="text-[1.05rem] font-semibold text-ink">{t.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/78">{t.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
              <ContentImage src={BUS_PHOTOS.interior} alt="Interior of a Vietnamese sleeper bus" className="aspect-[16/10] w-full object-cover" />
              <figcaption className="px-4 py-3.5 text-[0.9rem] text-ink/80">
                VIP / cabin sleeper interior. Still a bunk on a highway — passport on your body.
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
              <ContentImage src={BUS_PHOTOS.bunks} alt="Open sleeper bunks on a Vietnamese night bus" className="aspect-[16/10] w-full object-cover" />
              <figcaption className="px-4 py-3.5 text-[0.9rem] text-ink/80">
                Open sleeper bunks. Upper berths are short. Photograph the luggage tag for the hold.
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="tickets" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Tickets and reservation
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/75">
            The pickup pin matters more than the brand. “Hanoi” on 12Go can mean My Dinh, Giap Bat, or a
            hotel alley at 6:40 a.m. Screenshot the voucher and the map pin.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {BUS_BOOKING.map((p) => (
              <article key={p.name} className="flex flex-col rounded-[24px] bg-paper p-6 shadow-soft ring-1 ring-ink/8">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[1.05rem] font-semibold text-ink">{p.name}</h3>
                  <span className="rounded-full bg-terracotta/12 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-terracotta">
                    {p.tag}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-ink/78">{p.body}</p>
                <a href={p.href} target="_blank" rel="noreferrer" className="btn-solid mt-5 self-start">
                  Open {p.name}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="stations" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Major stations
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/75">
            Coach stations sit on the ring road more often than in the old quarter. Budget a Grab at both
            ends. Pay in dong at the window if you buy in person.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {BUS_TERMINALS.map((s) => (
              <article key={s.name} className="rounded-[22px] bg-paper p-6 shadow-soft ring-1 ring-ink/8">
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-terracotta">{s.city}</p>
                <h3 className="mt-1 text-[1.08rem] font-semibold text-ink">{s.name}</h3>
                <p className="mt-1 text-[0.88rem] text-muted">{s.address}</p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/78">{s.how}</p>
                <a
                  href={s.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-[0.88rem] font-semibold text-terracotta underline-offset-4 hover:underline"
                >
                  Open in Google Maps →
                </a>
              </article>
            ))}
          </div>
        </section>

        {embedded ? <StageFooter current="transport" /> : null}
      </div>
    </article>
  )

  if (embedded) return body

  return (
    <BuilderProgressChrome current="transport" withNav>
      {body}
      <Footer />
    </BuilderProgressChrome>
  )
}
