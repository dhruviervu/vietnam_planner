import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ContentImage } from '../../components/shared/ContentImage'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { StageFooter } from '../PlanBuilder/components/StageFooter'
import { keepPipelineAlive } from '../PlanBuilder/lib/yourVietnam/links'
import { ALSO_ON_THE_WATER } from './data/islandCorridors'
import {
  WATER_BOOKING,
  WATER_MODES,
  WATER_PHOTOS,
  WATER_WEATHER,
  WATER_WHEN_INTRO,
  WATER_WHEN_SECTIONS,
  type WaterModeGuide,
} from './data/waterGuide'

const TOC = [
  { id: 'when', label: 'When to boat' },
  { id: 'ferries', label: 'Island ferries' },
  { id: 'cruises', label: 'Cruises' },
  { id: 'river', label: 'River boats' },
  { id: 'also', label: 'Also on the water' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'weather', label: 'Weather' },
] as const

function WaterModeSection({ mode }: { mode: WaterModeGuide }) {
  return (
    <section id={mode.id} className="mt-20 scroll-mt-24">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-terracotta">{mode.kicker}</p>
      <h2 className="mt-2 font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
        {mode.title}
      </h2>
      {mode.intro ? <p className="mt-5 text-[1.08rem] leading-[1.75] text-ink/82">{mode.intro}</p> : null}
      <div className="mt-8 space-y-7">
        {mode.sections.map((block) => (
          <div key={block.title}>
            <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-terracotta">{block.title}</h3>
            {block.body ? <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">{block.body}</p> : null}
            {block.groups?.map((g) => (
              <div key={g.name} className="mt-4">
                <h4 className="text-[1.02rem] font-semibold text-ink">{g.name}</h4>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[1.02rem] leading-[1.7] text-ink/80">
                  {g.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {mode.photos.map((ph) => (
          <figure key={ph.src} className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
            <ContentImage src={ph.src} alt={ph.alt} className="aspect-[16/10] w-full object-cover" />
            <figcaption className="px-4 py-3.5 text-[0.9rem] text-ink/80">{ph.caption}</figcaption>
          </figure>
        ))}
      </div>

      {mode.comparison ? (
        <>
          <h3 className="mt-12 font-serif text-[1.45rem] font-semibold text-ink">{mode.comparison.heading}</h3>
          <div className="mt-5 overflow-x-auto rounded-[24px] ring-1 ring-ink/10">
            <table className="min-w-[760px] w-full border-collapse text-left">
              <thead className="bg-ink text-paper">
                <tr>
                  {mode.comparison.columns.map((h) => (
                    <th key={h} className="px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mode.comparison.rows.map((row, i) => (
                  <tr key={row.region} className={i % 2 ? 'bg-cream/50' : 'bg-paper'}>
                    <td className="px-4 py-4 align-top font-serif text-[1.02rem] font-semibold text-ink">
                      {row.region}
                    </td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">
                      <ul className="list-disc space-y-1 pl-4">
                        {row.schedule.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">{row.vibe}</td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">{row.hubs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-[18px] bg-paper px-4 py-3.5 text-[0.95rem] leading-relaxed text-ink/82 ring-1 ring-ink/8">
            <span className="font-semibold text-ink">Pier Verification Notice: </span>
            {mode.comparison.notice.replace(/^Pier Verification Notice:\s*/, '')}
          </p>
        </>
      ) : mode.routes.length ? (
        <>
          <h3 className="mt-12 font-serif text-[1.45rem] font-semibold text-ink">The hops that matter</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {mode.routes.map((r) => (
              <article key={r.name} className="rounded-[22px] bg-paper p-6 shadow-soft ring-1 ring-ink/8">
                <h4 className="text-[1.08rem] font-semibold text-ink">{r.name}</h4>
                {r.facts?.map((f) => (
                  <p key={f.label} className="mt-2 text-[0.9rem] leading-relaxed text-ink/80">
                    <span className="font-bold uppercase tracking-[0.08em] text-terracotta">{f.label}. </span>
                    {f.text}
                  </p>
                ))}
                {r.time && !r.facts?.length ? (
                  <p className="mt-1 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-terracotta">{r.time}</p>
                ) : null}
                {r.bullets?.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed text-ink/78">
                    {r.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {r.body ? <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/78">{r.body}</p> : null}
              </article>
            ))}
          </div>
        </>
      ) : null}

      <h3 className="mt-12 font-serif text-[1.45rem] font-semibold text-ink">Tickets and providers</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {mode.providers.map((p) => (
          <article key={p.name} className="flex flex-col rounded-[24px] bg-paper p-6 shadow-soft ring-1 ring-ink/8">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-[1.05rem] font-semibold text-ink">{p.name}</h4>
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
  )
}

export function WaterInDepthPage({ embedded = false }: { embedded?: boolean }) {
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
    navigate('/plan/builder/transport#dive-water')
  }

  const body = (
    <article className="overflow-x-clip bg-cream text-ink">
      <header className="relative min-h-[68vh] overflow-hidden">
        <ContentImage
          src={WATER_PHOTOS.cruise}
          fallbacks={[WATER_PHOTOS.haLong, WATER_PHOTOS.ferry]}
          alt="Cruise boats on Ha Long Bay"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
        <div className="relative mx-auto flex min-h-[68vh] max-w-[1600px] flex-col justify-end px-[clamp(1.1rem,4vw,2rem)] pb-12 pt-24">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/70">
            Getting around · Water transport
          </p>
          <h1 className="mt-3 max-w-[16ch] font-serif text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[0.95] text-white">
            Vietnam by boat
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
            Navigating Vietnam’s Waterways
          </h2>
          <p className="mt-5 text-[1.08rem] leading-[1.75] text-ink/82">{WATER_WHEN_INTRO}</p>
          <div className="mt-8 space-y-7">
            {WATER_WHEN_SECTIONS.map((block) => (
              <div key={block.title}>
                <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                  {block.title}
                </h3>
                <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        {WATER_MODES.map((mode) => (
          <WaterModeSection key={mode.id} mode={mode} />
        ))}

        <section id="also" className="mt-20 scroll-mt-24">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">Also on Vietnam’s water</p>
          <h2 className="mt-2 font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Bays, canals, and day boats — not island ferries
          </h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {ALSO_ON_THE_WATER.map((item) => (
              <article key={item.id} className="rounded-[16px] bg-paper px-4 py-4 shadow-soft ring-1 ring-ink/8">
                <h3 className="font-serif text-[1.05rem] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink/85">{item.body}</p>
                <a
                  href={item.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-[0.78rem] font-bold text-terracotta"
                >
                  Open a searched booking page →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="tickets" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Tickets and reservation sites
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/75">
            Buy a named operator and a sailing. Screenshot the ticket. Read the actual pier.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {WATER_BOOKING.map((p) => (
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

        <section id="weather" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Weather, cancellations, and safety
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WATER_WEATHER.map((w) => (
              <article key={w.title} className="rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                <h3 className="text-[1.02rem] font-semibold text-ink">{w.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/78">{w.body}</p>
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
