import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ContentImage } from '../../components/shared/ContentImage'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { StageFooter } from '../PlanBuilder/components/StageFooter'
import { keepPipelineAlive } from '../PlanBuilder/lib/yourVietnam/links'
import {
  FARES,
  FARE_NOTES,
  INTERIOR_PHOTOS,
  NORTHBOUND_ROWS,
  NORTHBOUND_TRAINS,
  SOUTHBOUND_ROWS,
  SOUTHBOUND_TRAINS,
  STATION_BUY_INTRO,
  STATIONS,
  TICKET_PROVIDERS,
  TRAIN_NOTES,
  VIEW_PHOTOS,
  formatFare000,
  stationLabel,
  wikiFile,
  WHEN_TO_TRAVEL_INTRO,
  WHEN_TO_TRAVEL_SECTIONS,
  type StationGuide,
  type TimetableRow,
  type TrainNoteCard,
} from './data/trainGuide'

const TOC = [
  { id: 'when', label: 'When to go' },
  { id: 'view', label: 'The view' },
  { id: 'inside', label: 'On board' },
  { id: 'south', label: 'Southbound' },
  { id: 'north', label: 'Northbound' },
  { id: 'notes', label: 'Train notes' },
  { id: 'fares', label: 'Fares' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'stations', label: 'Stations' },
] as const

export function TrainInDepthPage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate()
  const [openStation, setOpenStation] = useState<StationGuide | null>(null)

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
    navigate('/plan/builder/transport#dive-train')
  }

  const body = (
    <>
    <article className="overflow-x-clip bg-cream text-ink">
      <header className="relative min-h-[68vh] overflow-hidden">
        <ContentImage
          src={wikiFile('Train_Ride_Between_Hue_and_Da_Nang_(12173026965).jpg', 2000)}
          fallbacks={[wikiFile('Hai_Van_Pass,_Vietnam,_North-South_Railway.jpg', 2000)]}
          alt="View from the Hue to Da Nang train"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
        <div className="relative mx-auto flex min-h-[68vh] max-w-[1600px] flex-col justify-end px-[clamp(1.1rem,4vw,2rem)] pb-12 pt-24">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/70">
            Getting around · Reunification Express
          </p>
          <h1 className="mt-3 max-w-[18ch] font-serif text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[0.95] text-white">
            Vietnam by train
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
          <SectionHeading title="When to Travel" lede="Fit the rails to the days you have" />
          <p className="mt-5 max-w-none text-[1.08rem] leading-[1.75] text-ink/82">{WHEN_TO_TRAVEL_INTRO}</p>
          <div className="mt-8 max-w-none space-y-7">
            {WHEN_TO_TRAVEL_SECTIONS.map((block) => (
              <div key={block.title}>
                <h3 className={PARA_TITLE}>{block.title}</h3>
                <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="view" className="mt-20 scroll-mt-24">
          <SectionHeading title="View from the Train" lede="What you actually see" />
          <p className="mt-3 max-w-none text-[1.02rem] leading-relaxed text-ink/75">
            Photographs taken on the line — Hai Van’s coast, then the slower paddy country further south.
            Corridor windows on many sleepers still drop; compartment windows usually do not.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {VIEW_PHOTOS.map((p) => (
              <figure key={p.file} className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
                <ContentImage
                  src={wikiFile(p.file)}
                  alt={p.alt}
                  className="aspect-[16/10] w-full object-cover"
                />
                <figcaption className="px-4 py-3.5">
                  <p className="text-[0.95rem] leading-snug text-ink/85">{p.caption}</p>
                  <p className="mt-1 text-[0.72rem] text-muted">{p.credit}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="inside" className="mt-20 scroll-mt-24">
          <SectionHeading title="Inside the Trains" lede="Soft sleeper, hard sleeper, seats" />
          <div className="mt-6 max-w-none space-y-8">
            <div>
              <h3 className={PARA_TITLE}>1. Soft Sleeper Cabin (4-Berth)</h3>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">Layout:</span> A small, enclosed compartment with
                two bunk beds (4 beds total) and a sliding lockable door.
              </p>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">The Vibe:</span> Cozy, functional, and clean. This
                is the most popular choice for international travelers.
              </p>
            </div>
            <div>
              <h3 className={PARA_TITLE}>2. Hard Sleeper Cabin (6-Berth)</h3>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">Layout:</span> Enclosed compartment with three
                tiers of bunks on each side (6 beds total).
              </p>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">The Vibe:</span> More compact and social.
              </p>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">Comfort Level:</span> “Hard” refers to ticket
                class, not a wooden board — the beds do have thin mattresses.
              </p>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">Catch:</span> The middle and top berths have very
                low headroom, meaning you cannot sit fully upright on your bed.
              </p>
            </div>
            <div>
              <h3 className={PARA_TITLE}>Shared Hallways &amp; Restrooms</h3>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">Corridors:</span> Narrow, carpeted or
                linoleum-lined hallways running down one side of the carriage, featuring fold-down seats
                along the windows to watch the countryside.
              </p>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">Bathrooms:</span> Located at the ends of each
                carriage. Modern express trains feature Western-style toilets and separate sink basins
                outside the stall. Squat toilets can still be found on older provincial trains.
              </p>
              <p className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                <span className="font-semibold text-ink">Food Service:</span> Trolleys regularly roll down
                the aisle selling hot coffee, bottled water, snacks, instant noodles, and warm local meal
                boxes (like pork with rice).
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {INTERIOR_PHOTOS.map((p) => (
              <figure key={p.file} className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
                <ContentImage
                  src={wikiFile(p.file)}
                  alt={p.alt}
                  className="aspect-[4/5] w-full object-cover sm:aspect-[4/3]"
                />
                <figcaption className="px-4 py-3.5">
                  <p className="text-[0.95rem] leading-snug text-ink/85">{p.caption}</p>
                  <p className="mt-1 text-[0.72rem] text-muted">{p.credit}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="south" className="mt-20 scroll-mt-24">
          <SectionHeading title="Southbound" />
          <div className="mt-3 max-w-none space-y-4">
            <h3 className={PARA_TITLE}>Southbound Trains (Hanoi ➔ Ho Chi Minh City)</h3>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              Southbound services start at Hanoi Station (KM 0) and head south toward Saigon. In the
              Vietnam Railways schedule, southbound express trains use odd numbers:
            </p>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              <span className="font-semibold text-ink">Overnight Express (SE1, SE3, SE19):</span> Depart
              Hanoi in the evening; ideal for saving on a night of hotel accommodation.
            </p>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              <span className="font-semibold text-ink">Daylight Coastal Views (SE5, SE7):</span> Morning
              departures scheduled to cross the scenic Hai Van Pass in full daylight.
            </p>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              <span className="font-semibold text-ink">Regional Southbound Trains:</span> Routes like SE21
              (Da Nang ➔ Saigon) and SNT1 (Nha Trang ➔ Saigon) serve southern sectors rather than starting
              in Hanoi.
            </p>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              <span className="font-semibold text-ink">Tip:</span> Arrival times marked d2 or d3 indicate
              arrival on the 2nd or 3rd calendar day.
            </p>
          </div>
          <Timetable trains={[...SOUTHBOUND_TRAINS]} rows={SOUTHBOUND_ROWS} />
        </section>

        <section id="north" className="mt-16 scroll-mt-24">
          <SectionHeading title="Northbound" />
          <div className="mt-3 max-w-none space-y-4">
            <h3 className={PARA_TITLE}>Northbound Trains (Ho Chi Minh City ➔ Hanoi)</h3>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              Northbound services start at Saigon Station and travel north toward Hanoi. In the Vietnam
              Railways schedule, northbound express trains use even numbers:
            </p>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              <span className="font-semibold text-ink">Evening Flagships (SE2, SE4):</span> Evening
              departures from Saigon that arrive in Hanoi early in the morning on Day 3 (d3)—popular
              overnight choices for long-haul travel.
            </p>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              <span className="font-semibold text-ink">Daylight Departures (SE6, SE8):</span> Morning
              departures from Saigon, ideal for travelers breaking up their journey at central coastal
              cities like Nha Trang, Quy Nhon, or Da Nang.
            </p>
            <p className="text-[1.05rem] leading-[1.75] text-ink/80">
              <span className="font-semibold text-ink">Regional Northbound Trains:</span> Routes that cover
              shorter segments rather than the full journey, such as SE20 (Da Nang ➔ Hanoi) and SNT2
              (Saigon ➔ Nha Trang tourist sleeper).
            </p>
          </div>
          <Timetable trains={[...NORTHBOUND_TRAINS]} rows={NORTHBOUND_ROWS} />
        </section>

        <section id="notes" className="mt-16 scroll-mt-24">
          <SectionHeading title="Notes by Train Number" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {TRAIN_NOTES.map((n) => (
              <article key={n.id} className="flex flex-col rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
                <header className="flex flex-wrap items-start justify-between gap-2 border-b border-ink/8 px-5 py-4">
                  <div className="min-w-0">
                    <h3 className="text-[1.05rem] font-semibold tracking-tight text-ink">{n.id}</h3>
                    <p className="mt-0.5 text-[0.82rem] leading-snug text-muted">{n.route}</p>
                  </div>
                  <span className={noteTagClass(n.tagTone)}>{n.tag}</span>
                </header>
                <ul className="space-y-2.5 px-5 py-4">
                  {n.bullets.map((b) => (
                    <li key={b.label} className="flex gap-2 text-[0.92rem] leading-relaxed text-ink/80">
                      <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta/70" />
                      <p>
                        <span className="font-semibold text-ink">{b.label}:</span> {b.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="fares" className="mt-20 scroll-mt-24">
          <SectionHeading title="Cost Breakdown" lede="DSVN fares on SE1–SE4" />
          <p className="mt-3 max-w-none text-[1.02rem] leading-relaxed text-ink/75">
            Soft seat is the daylight class. Overnight, budget for a soft sleeper lower or upper berth.
            Dollar figures use about 26,000 dong to US$1.
          </p>
          <div className="mt-6 max-w-full overflow-x-auto rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
            <table className="min-w-[920px] w-full border-collapse text-left text-[0.8rem]">
              <thead>
                <tr className="border-b border-ink/10 bg-cream/80">
                  <th className="px-4 py-3 align-bottom text-[0.72rem] font-semibold text-ink">Route</th>
                  <th className="min-w-[8.5rem] px-3 py-3 align-bottom">
                    <span className="block text-[0.72rem] font-semibold text-ink">Soft seat</span>
                  </th>
                  <th className="min-w-[12.5rem] px-3 py-3 align-bottom">
                    <span className="block text-[0.72rem] font-semibold text-ink">Hard sleeper</span>
                    <span className="mt-0.5 block text-[0.68rem] font-normal leading-snug text-muted">
                      Lower, middle and upper seats
                    </span>
                  </th>
                  <th className="min-w-[9rem] px-3 py-3 align-bottom">
                    <span className="block text-[0.72rem] font-semibold text-ink">Soft sleeper</span>
                    <span className="mt-0.5 block text-[0.68rem] font-normal text-muted">Lower berth</span>
                  </th>
                  <th className="min-w-[9rem] px-3 py-3 align-bottom">
                    <span className="block text-[0.72rem] font-semibold text-ink">Soft sleeper</span>
                    <span className="mt-0.5 block text-[0.68rem] font-normal text-muted">Upper berth</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FARES.map((row) => (
                  <tr key={row.route} className="border-b border-ink/6 last:border-0">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-ink">{row.route}</p>
                      <p className="text-muted">{row.hours}</p>
                    </td>
                    <FareCell n={row.softSeat} />
                    <td className="px-3 py-3.5">
                      <HardSeatStack lower={row.hardL} middle={row.hardM} upper={row.hardU} />
                    </td>
                    <FareCell n={row.softL} emphasis />
                    <FareCell n={row.softU} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-5 max-w-none list-disc space-y-2 pl-5 text-[0.92rem] leading-relaxed text-ink/72">
            {FARE_NOTES.map((n, i) => (
              <li key={n}>
                {n}
                {i === 0 ? (
                  <>
                    {' '}
                    <a
                      href="https://www.xe.com/currencyconverter/convert/?Amount=26000&From=VND&To=USD"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-terracotta underline-offset-4 hover:underline"
                    >
                      Check a live dong to dollar rate on XE
                    </a>
                    .
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section id="tickets" className="mt-20 scroll-mt-24">
          <SectionHeading title="Tickets and Reservation" lede="Where to book from home" />
          <p className="mt-3 max-w-none text-[1.02rem] leading-relaxed text-ink/75">
            End-to-end Hanoi–Saigon (Ho Chi Minh City) sleepers usually open 60–90 days out; Hue–Danang hops appear later.
            Name on the ticket must match the passport you travel with.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {TICKET_PROVIDERS.map((p) => (
              <article key={p.id} className="flex flex-col rounded-[24px] bg-paper p-6 shadow-soft ring-1 ring-ink/8">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[1.05rem] font-semibold text-ink">{p.name}</h3>
                  <span className="rounded-full bg-terracotta/12 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-terracotta">
                    {p.tag}
                  </span>
                </div>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/78">{p.bestFor}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.8rem]">
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.08em] text-muted">Fee</dt>
                    <dd className="mt-0.5 text-ink/80">{p.fee}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.08em] text-muted">Pay</dt>
                    <dd className="mt-0.5 text-ink/80">{p.pay}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-semibold uppercase tracking-[0.08em] text-muted">Collect</dt>
                    <dd className="mt-0.5 text-ink/80">{p.collect}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[0.82rem] leading-relaxed text-ink/55">{p.caution}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-solid mt-5 self-start"
                >
                  Open {p.name}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="stations" className="mt-20 scroll-mt-24">
          <SectionHeading title="How to Buy Tickets at Stations" lede="Walk up with dong and a train number" />
          <div className="mt-6 max-w-none space-y-7">
            {STATION_BUY_INTRO.map((block) => (
              <div key={block.title}>
                <h3 className={PARA_TITLE}>{block.title}</h3>
                {block.bullets.map((b) => (
                  <p key={b.label} className="mt-2 text-[1.05rem] leading-[1.75] text-ink/80">
                    <span className="font-semibold text-ink">{b.label}:</span> {b.text}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {STATIONS.map((s) => (
              <article key={s.id} className="overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
                <ContentImage src={s.photo} alt={s.photoAlt} className="aspect-[16/10] w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-[1.08rem] font-semibold text-ink">{s.name}</h3>
                  <button
                    type="button"
                    onClick={() => setOpenStation(s)}
                    className="mt-1 text-left text-[0.82rem] font-semibold text-terracotta underline-offset-4 hover:underline"
                  >
                    Click to open side panel for more information
                  </button>
                  <p className="mt-3 text-[0.9rem] text-ink/75">
                    <span className="font-semibold text-ink">Address:</span> {s.address}
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-ink/80">
                    <span className="font-semibold text-ink">Booking Scope:</span>{' '}
                    <span className={scopeDot(s.scopeTone)} /> {s.scope}
                  </p>
                  {s.facts.map((f) => (
                    <p key={f.label} className="mt-2 text-[0.9rem] leading-relaxed text-ink/80">
                      <span className="font-semibold text-ink">{f.label}:</span> {f.text}
                    </p>
                  ))}
                  <a
                    href={s.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-[0.88rem] font-semibold text-terracotta underline-offset-4 hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {embedded ? <StageFooter current="transport" /> : null}
      </div>
    </article>
    {openStation ? <StationPanel station={openStation} onClose={() => setOpenStation(null)} /> : null}
  </>
  )

  if (embedded) return body

  return (
    <BuilderProgressChrome current="transport" withNav>
      {body}
      <Footer />
    </BuilderProgressChrome>
  )
}

const PARA_TITLE =
  'text-[0.78rem] font-bold uppercase tracking-[0.12em] text-terracotta'

const NOTE_TAG: Record<TrainNoteCard['tagTone'], string> = {
  premier: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
  overnight: 'bg-terracotta/12 text-terracotta ring-terracotta/20',
  daylight: 'bg-sky-50 text-sky-800 ring-sky-200/80',
  budget: 'bg-amber-50 text-amber-900 ring-amber-200/80',
  regional: 'bg-violet-50 text-violet-800 ring-violet-200/80',
  sector: 'bg-teal-50 text-teal-800 ring-teal-200/80',
  tourist: 'bg-orange-50 text-orange-900 ring-orange-200/80',
}

function noteTagClass(tone: TrainNoteCard['tagTone']) {
  return `shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] ring-1 ${NOTE_TAG[tone]}`
}

function SectionHeading({ title, lede }: { title: string; lede?: string }) {
  return (
    <header>
      <h2 className="font-serif text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold tracking-tight text-ink">
        {title}
      </h2>
      {lede ? <p className="mt-1.5 text-[0.92rem] leading-snug text-muted">{lede}</p> : null}
    </header>
  )
}

function scopeDot(tone: StationGuide['scopeTone']) {
  const color =
    tone === 'hub' ? 'bg-emerald-500' : tone === 'origin' ? 'bg-amber-400' : 'bg-sky-500'
  return `mr-1.5 inline-block h-2 w-2 shrink-0 translate-y-[-1px] rounded-full ${color}`
}

function StationPanel({
  station,
  onClose,
}: {
  station: StationGuide
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close station panel" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-[28rem] flex-col overflow-y-auto bg-paper shadow-2xl">
        <ContentImage src={station.photo} alt={station.photoAlt} className="h-48 w-full object-cover" />
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <p className={PARA_TITLE}>{station.city}</p>
            <h3 className="mt-1 font-serif text-[1.55rem] font-semibold text-ink">{station.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-[0.82rem] font-semibold text-ink/60 hover:bg-cream"
          >
            Close
          </button>
        </div>
        <div className="space-y-3 px-5 pb-8 text-[0.95rem] leading-relaxed text-ink/80">
          <p>
            <span className="font-semibold text-ink">Address:</span> {station.address}
          </p>
          <p>
            <span className="font-semibold text-ink">Booking Scope:</span>{' '}
            <span className={scopeDot(station.scopeTone)} />
            {station.scope}
          </p>
          {station.facts.map((f) => (
            <p key={f.label}>
              <span className="font-semibold text-ink">{f.label}:</span> {f.text}
            </p>
          ))}
          <a
            href={station.maps}
            target="_blank"
            rel="noreferrer"
            className="inline-block pt-2 font-semibold text-terracotta underline-offset-4 hover:underline"
          >
            Open in Google Maps →
          </a>
        </div>
      </aside>
    </div>
  )
}

function FareCell({ n, emphasis = false }: { n: number; emphasis?: boolean }) {
  const f = formatFare000(n)
  return (
    <td className={`px-3 py-3.5 ${emphasis ? 'font-semibold text-ink' : 'text-ink/80'}`}>
      <p className="leading-snug">{f.dong}</p>
      <p className="text-[0.72rem] font-normal text-muted">({f.usd})</p>
    </td>
  )
}

function HardSeatStack({ lower, middle, upper }: { lower: number; middle: number; upper: number }) {
  const rows = [
    { label: 'Lower seat', n: lower },
    { label: 'Middle seat', n: middle },
    { label: 'Upper seat', n: upper },
  ]
  return (
    <ul className="space-y-2">
      {rows.map((row) => {
        const f = formatFare000(row.n)
        return (
          <li key={row.label} className="leading-snug">
            <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-muted">
              {row.label}
            </span>
            <span className="text-ink/85">{f.dong}</span>{' '}
            <span className="text-[0.72rem] text-muted">({f.usd})</span>
          </li>
        )
      })}
    </ul>
  )
}

function Timetable({ trains, rows }: { trains: string[]; rows: TimetableRow[] }) {
  return (
    <div className="mt-6 max-w-full overflow-x-auto rounded-[22px] bg-paper shadow-soft ring-1 ring-ink/8">
      <table className="min-w-[920px] w-full border-collapse text-center text-[0.8rem]">
        <thead>
          <tr className="border-b border-ink/10 bg-cream/90">
            <th className="sticky left-0 bg-cream/95 px-3 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">
              Km · station
            </th>
            {trains.map((t) => (
              <th key={t} className="px-2 py-3 text-[0.82rem] font-semibold text-ink">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.station} className="border-b border-ink/6 last:border-0">
              <th className="sticky left-0 bg-paper px-3 py-2.5 text-left font-semibold text-ink">
                <span className="mr-2 font-mono text-[0.72rem] font-normal text-muted">{row.km}</span>
                {stationLabel(row.station)}
              </th>
              {row.times.map((time, i) => (
                <td
                  key={`${row.station}-${trains[i]}`}
                  className={`px-2 py-2.5 tabular-nums ${time === '—' ? 'text-ink/20' : 'text-ink/85'}`}
                >
                  {time}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-left text-[0.75rem] text-muted">
        d2 / d3 = arrives on the second or third calendar day. Em dash = that train does not call, or the
        published table leaves the cell blank.
      </p>
    </div>
  )
}
