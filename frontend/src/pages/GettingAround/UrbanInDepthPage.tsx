import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ContentImage } from '../../components/shared/ContentImage'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { StageFooter } from '../PlanBuilder/components/StageFooter'
import { keepPipelineAlive } from '../PlanBuilder/lib/yourVietnam/links'
import {
  URBAN_APPS,
  URBAN_EMERGENCY,
  URBAN_IDP_NOTICE,
  URBAN_LICENSE_COLUMNS,
  URBAN_LICENSE_ROWS,
  URBAN_PHOTOS,
  URBAN_PRE_RIDE,
  URBAN_PROVIDER_COLUMNS,
  URBAN_PROVIDER_ROWS,
  URBAN_RENTAL_INTRO,
  URBAN_SAFETY,
  URBAN_WALKING,
  URBAN_WHEN_INTRO,
  URBAN_WHEN_SECTIONS,
} from './data/urbanGuide'

const TOC = [
  { id: 'when', label: 'When to walk or ride' },
  { id: 'apps', label: 'Taxi apps' },
  { id: 'rentals', label: 'Rentals' },
  { id: 'walking', label: 'Walking' },
  { id: 'safety', label: 'Safety' },
] as const

export function UrbanInDepthPage({ embedded = false }: { embedded?: boolean }) {
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
    navigate('/plan/builder/transport#dive-urban')
  }

  const body = (
    <article className="overflow-x-clip bg-cream text-ink">
      <header className="relative min-h-[68vh] overflow-hidden">
        <ContentImage
          src={URBAN_PHOTOS.streetLife}
          fallbacks={[URBAN_PHOTOS.oldQuarter, URBAN_PHOTOS.walking]}
          alt="Street life and motorbikes in Hanoi"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
        <div className="relative mx-auto flex min-h-[68vh] max-w-[1600px] flex-col justify-end px-[clamp(1.1rem,4vw,2rem)] pb-12 pt-24">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/70">
            Getting around · Inside the city
          </p>
          <h1 className="mt-3 max-w-[16ch] font-serif text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[0.95] text-white">
            Streets, apps, and your own feet
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
            Urban Transit: Getting Around Vietnamese Cities
          </h2>
          <p className="mt-5 text-[1.08rem] leading-[1.75] text-ink/82">{URBAN_WHEN_INTRO}</p>
          <div className="mt-8 space-y-7">
            {URBAN_WHEN_SECTIONS.map((block) => (
              <div key={block.title}>
                <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                  {block.title}
                </h3>
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
        </section>

        <section id="apps" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Taxi apps for cars and bikes
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/75">
            Download Grab before you land. Be is the local backup. Match the plate, wait at the pin, and
            do not move the trip off the app.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {URBAN_APPS.map((a) => (
              <article key={a.name} className="flex flex-col rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                <h3 className="text-[1.05rem] font-semibold text-ink">{a.name}</h3>
                <p className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={a.ios}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-cream px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink/70 ring-1 ring-ink/10 hover:text-ink"
                  >
                    iPhone
                  </a>
                  <a
                    href={a.android}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-cream px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink/70 ring-1 ring-ink/10 hover:text-ink"
                  >
                    Android
                  </a>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="rentals" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Renting motorbikes & cars in Vietnam
          </h2>
          <p className="mt-5 text-[1.08rem] leading-[1.75] text-ink/82">{URBAN_RENTAL_INTRO}</p>

          <h3 className="mt-10 font-serif text-[1.45rem] font-semibold text-ink">
            Legal requirements & eligibility
          </h3>
          <div className="mt-5 overflow-x-auto rounded-[24px] ring-1 ring-ink/10">
            <table className="min-w-[760px] w-full border-collapse text-left">
              <thead className="bg-ink text-paper">
                <tr>
                  {URBAN_LICENSE_COLUMNS.map((h) => (
                    <th key={h} className="px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {URBAN_LICENSE_ROWS.map((row, i) => (
                  <tr key={row.criterion} className={i % 2 ? 'bg-cream/50' : 'bg-paper'}>
                    <td className="px-4 py-4 align-top font-serif text-[1.02rem] font-semibold text-ink">
                      {row.criterion}
                    </td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">{row.moto}</td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">{row.cc50}</td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">{row.car}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-[18px] bg-paper px-4 py-3.5 text-[0.95rem] leading-relaxed text-ink/82 ring-1 ring-ink/8">
            {URBAN_IDP_NOTICE}
          </p>

          <h3 className="mt-12 font-serif text-[1.45rem] font-semibold text-ink">
            Reputable rental providers & costs
          </h3>
          <div className="mt-5 overflow-x-auto rounded-[24px] ring-1 ring-ink/10">
            <table className="min-w-[760px] w-full border-collapse text-left">
              <thead className="bg-ink text-paper">
                <tr>
                  {URBAN_PROVIDER_COLUMNS.map((h) => (
                    <th key={h} className="px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {URBAN_PROVIDER_ROWS.map((row, i) => (
                  <tr key={row.type} className={i % 2 ? 'bg-cream/50' : 'bg-paper'}>
                    <td className="px-4 py-4 align-top font-serif text-[1.02rem] font-semibold text-ink">{row.type}</td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">{row.rates}</td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">
                      <ul className="list-disc space-y-1 pl-4">
                        {row.providers.map((p) => (
                          <li key={p.name}>
                            <a
                              href={p.href}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-terracotta underline-offset-4 hover:underline"
                            >
                              {p.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">{row.deposit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-12 font-serif text-[1.45rem] font-semibold text-ink">Pre-ride inspection checklist</h3>
          <p className="mt-2 text-[1.02rem] leading-relaxed text-ink/75">
            Before handing over cash or driving away, photograph and test the following:
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {URBAN_PRE_RIDE.map((item) => (
              <article key={item.title} className="rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                <h4 className="text-[1.02rem] font-semibold text-ink">{item.title}</h4>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/78">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="walking" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Simple walking
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              {URBAN_WALKING.map((w) => (
                <article key={w.title} className="rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                  <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/78">{w.body}</p>
                </article>
              ))}
            </div>
            <figure className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
              <ContentImage
                src={URBAN_PHOTOS.walking}
                alt="Hanoi Old Quarter street for walking"
                className="h-full min-h-[280px] w-full object-cover"
              />
              <figcaption className="px-4 py-3.5 text-[0.9rem] text-ink/80">
                Old Quarter lanes — under 1.5 km, walk. Bags on the building side, not the kerb.
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="safety" className="mt-20 scroll-mt-24">
          <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
            Safety and emergencies
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ink/75">
            Save these three numbers before you ride. Hotel reception can stay on the call and translate.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {URBAN_EMERGENCY.map((e) => (
              <article key={e.number} className="rounded-[24px] bg-paper p-6 shadow-soft ring-1 ring-ink/8">
                <p className="font-serif text-[2.4rem] font-semibold leading-none text-terracotta">{e.number}</p>
                <h3 className="mt-3 text-[1.05rem] font-semibold text-ink">{e.label}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/78">{e.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {URBAN_SAFETY.map((s) => (
              <article key={s.title} className="rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                <h3 className="text-[1.02rem] font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/78">{s.body}</p>
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
