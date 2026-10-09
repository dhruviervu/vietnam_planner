import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { StageFooter } from '../PlanBuilder/components/StageFooter'
import { getAirport, getDestination } from './data/catalog'
import { ALL_MODE_IDS, MODE_DEFINITIONS } from './data/modes'
import { PROVIDER_LINKS } from './data/providerCatalog'
import { modeDetailHref, type BookingRoute } from './data/bookingLinks'
import { APP_STORE_LINKS } from './data/transferGuides'
import { MAP_PLACES, mapsDirUrl } from './data/transferGeo'
import type { AirportId, TransferDirection, TransportModeId } from './data/types'
import { BusModeGuide } from './BusModeGuide'
import { RentalModeGuide } from './RentalModeGuide'

function isModeId(id: string): id is TransportModeId {
  return ALL_MODE_IDS.includes(id as TransportModeId)
}

function Table({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto rounded-[16px] ring-1 ring-ink/10">
      <table className="min-w-full text-left text-[0.82rem]">
        <thead className="bg-cream/80 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink/70">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-paper">
          {rows.map((cells, i) => (
            <tr key={i} className="border-t border-ink/8 align-top">
              {cells.map((c, j) => (
                <td key={j} className="px-3 py-2.5 leading-snug text-ink/85">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta">
      {children}
    </a>
  )
}

function VisitSite({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="ml-1.5 inline-flex items-center rounded-full bg-terracotta/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-terracotta ring-1 ring-terracotta/25 hover:bg-terracotta hover:text-paper"
    >
      Visit site
    </a>
  )
}

function NamedLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-0">
      <Ext href={href}>{children}</Ext>
      <VisitSite href={href} />
    </span>
  )
}

function MapsCheck({ from, to }: { from: (typeof MAP_PLACES)[keyof typeof MAP_PLACES]; to: (typeof MAP_PLACES)[keyof typeof MAP_PLACES] }) {
  const href = mapsDirUrl(from, to, 'driving')
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-2.5 py-0.5 align-middle text-[0.62rem] font-bold uppercase tracking-[0.08em] text-sage ring-1 ring-sage/30 hover:bg-sage hover:text-paper"
    >
      <span aria-hidden>🗺️</span>
      Check distance
    </a>
  )
}

function CarTaxiGuide() {
  const L = PROVIDER_LINKS
  const P = MAP_PLACES
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">Primary transport options</h2>
        <div className="mt-4">
          <Table
            headers={['Transport type', 'Pros', 'Cons', 'Best for']}
            rows={[
              [
                <>
                  Ride-hailing (
                  <NamedLink href={L.grab}>Grab</NamedLink>, <NamedLink href={L.xanh}>Xanh SM</NamedLink>,{' '}
                  <NamedLink href={L.be}>Be</NamedLink>)
                </>,
                'Fixed pricing, no currency/language barrier, tracked via GPS',
                'Requires SIM/data; designated pickup area requires brief walking',
                'Most tourists & solo travellers',
              ],
              [
                <>
                  Metered taxis (<NamedLink href={L.maiLinh}>Mai Linh</NamedLink>,{' '}
                  <NamedLink href={L.vinasun}>Vinasun</NamedLink>)
                </>,
                'Plentiful at official taxi stands; no app setup needed',
                'Risk of scam touts/fake taxis if picked outside the line',
                'First-time arrivals without immediate mobile internet',
              ],
              [
                'Pre-booked private transfer',
                'Driver waits with name placard; prepaid options',
                'Slightly higher cost; fixed pickup schedule',
                'Large families, night arrivals, heavy luggage',
              ],
            ]}
          />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">Main airports: pricing &amp; breakdown</h2>
        <div className="mt-4 grid gap-4">
          <article className="rounded-[22px] bg-cream/50 p-5 ring-1 ring-ink/8">
            <h3 className="font-serif text-xl font-semibold text-ink">Ho Chi Minh City — Tan Son Nhat (SGN)</h3>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/85">
              Distance to city centre (District 1): ~7–8 km (~30–45 mins depending on heavy traffic)
              <MapsCheck from={P.sgn} to={P.district1} />
            </p>
            <p className="mt-1.5 text-[0.92rem] text-ink/85">Estimated fare: ₫120,000 – ₫200,000 (~$5 – $8 USD)</p>
            <p className="mt-3 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink/55">Pickup spots</p>
            <ul className="mt-1 list-disc pl-5 text-[0.92rem] leading-relaxed text-ink/85">
              <li>International terminal: exit gates, walk across to the main car parking lot.</li>
              <li>Domestic terminal: Lane D inside the multi-story parking building.</li>
            </ul>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/85">
              <span className="font-semibold text-ink">Crucial tip:</span> Avoid people standing inside the arrival hall
              offering “cheap taxi” rides. Walk directly to the official taxi queues outside or request an app ride.
            </p>
          </article>

          <article className="rounded-[22px] bg-cream/50 p-5 ring-1 ring-ink/8">
            <h3 className="font-serif text-xl font-semibold text-ink">Hanoi — Noi Bai (HAN)</h3>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/85">
              Distance to city centre (Old Quarter): ~28–30 km (~45–60 mins via Expressway)
              <MapsCheck from={P.han} to={P.oldQuarter} />
            </p>
            <p className="mt-1.5 text-[0.92rem] text-ink/85">Estimated fare: ₫250,000 – ₫400,000 (~$10 – $16 USD)</p>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/85">
              Pickup spots: follow signs to “Ride-Hailing Pick-up” or exit directly to the official ground-level taxi
              line.
            </p>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/85">
              <span className="font-semibold text-ink">Crucial tip:</span> Fix the rate with meter-taxi operators or use
              Grab / Xanh SM upfront pricing.
            </p>
          </article>

          <article className="rounded-[22px] bg-cream/50 p-5 ring-1 ring-ink/8">
            <h3 className="font-serif text-xl font-semibold text-ink">Da Nang — Da Nang International (DAD)</h3>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/85">
              Distance to Da Nang city centre: ~3–5 km (~10–15 mins)
              <MapsCheck from={P.dad} to={P.daNangCentre} />
            </p>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/85">
              Distance to Hoi An Ancient Town: ~30 km (~45 mins)
              <MapsCheck from={P.dad} to={P.hoiAnAncient} />
            </p>
            <p className="mt-3 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink/55">Estimated fare</p>
            <ul className="mt-1 list-disc pl-5 text-[0.92rem] leading-relaxed text-ink/85">
              <li>To Da Nang centre: ₫70,000 – ₫120,000 (~$3 – $5 USD)</li>
              <li>To Hoi An: ₫300,000 – ₫400,000 (~$12 – $16 USD)</li>
            </ul>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/85">
              <span className="font-semibold text-ink">Crucial tip:</span> Drivers frequently offer off-app rates to Hoi
              An. Using Grab or Xanh SM is generally simpler and ensures transparent pricing.
            </p>
          </article>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">Recommended apps for on-demand transport</h2>
        <ul className="mt-4 space-y-3">
          {[
            {
              name: 'Grab',
              href: L.grab,
              stores: APP_STORE_LINKS.grab,
              copy: 'The dominant ride-hailing app across Southeast Asia (similar to Uber/Lyft).',
            },
            {
              name: 'Xanh SM',
              href: L.xanh,
              stores: APP_STORE_LINKS.xanh,
              copy: 'Vietnam’s growing EV fleet. Clean, quiet cars and professional drivers.',
            },
            {
              name: 'Be',
              href: L.be,
              stores: APP_STORE_LINKS.be,
              copy: 'Reliable local app, often with competitive promo codes.',
            },
          ].map((app) => (
            <li
              key={app.name}
              className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-[16px] bg-paper px-4 py-3 ring-1 ring-ink/8"
            >
              <NamedLink href={app.href}>{app.name}</NamedLink>
              <span className="text-[0.9rem] text-ink/80">{app.copy}</span>
              <span className="ml-auto flex flex-wrap gap-1.5">
                <Ext href={app.stores.ios}>iOS</Ext>
                <span className="text-ink/25">·</span>
                <Ext href={app.stores.android}>Android</Ext>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">Top online booking platforms</h2>
        <p className="mt-1 text-[0.82rem] text-muted">Best for pre-arranged meets</p>
        <div className="mt-4">
          <Table
            headers={['Provider', 'Description', 'Key advantage']}
            rows={[
              [
                <NamedLink key="k" href={L.klook.SGN ?? L.kkday}>
                  Klook
                </NamedLink>,
                'The leading Asian travel booking platform.',
                'Driver waits at arrivals with a personalized sign; highly rated customer support; pre-paid online.',
              ],
              [
                <NamedLink key="kk" href={L.kkday}>
                  KKday
                </NamedLink>,
                'Major regional booking aggregator for Asia.',
                'Great for flat-rate transfers to nearby cities (e.g. Da Nang Airport straight to Hoi An or Hue).',
              ],
              [
                <>
                  <NamedLink href={L.trip}>Trip.com</NamedLink>
                  {' / '}
                  <NamedLink href={L.viator}>Viator</NamedLink>
                </>,
                'Global OTA platforms with verified local driver networks.',
                'Easy flight tracking integration — drivers track your arrival time for flight delays.',
              ],
            ]}
          />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">Top specialised local transfer services</h2>
        <div className="mt-4">
          <Table
            headers={['Provider', 'Coverage', 'Key advantage']}
            rows={[
              [
                <NamedLink key="v" href={L.vietnamPrivateCar}>
                  Vietnam Private Car
                </NamedLink>,
                'Nationwide (HAN, SGN, DAD, CXR)',
                'Excellent for groups, specialised luggage needs, or long-distance intercity transfers.',
              ],
              [
                <NamedLink key="a" href={L.airportTransfersVn}>
                  AirportTransfers.vn
                </NamedLink>,
                'Major international hubs',
                'Dedicated 24/7 WhatsApp dispatch support for incoming international travellers.',
              ],
            ]}
          />
        </div>
      </section>
    </div>
  )
}

export function TransferModePage() {
  const { modeId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const dir = (params.get('dir') === 'outbound' ? 'outbound' : 'inbound') as TransferDirection
  const airport = getAirport((params.get('airport') as AirportId) || 'SGN')
  const dest = getDestination(params.get('dest') ?? '')
  const destination =
    dest && airport && dest.airportId === airport.id
      ? dest
      : airport
        ? getDestination(airport.defaultDestinationId)
        : undefined

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
    navigate(`/plan/builder/airport#mode-${modeId}`)
  }

  if (!isModeId(modeId) || !airport || !destination) {
    return (
      <main className="mx-auto max-w-[900px] px-[clamp(1.1rem,4vw,2rem)] py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">Guide not found</h1>
        <button type="button" onClick={goBack} className="btn-solid mt-6">
          Back to Airport Transfers
        </button>
      </main>
    )
  }

  const mode = MODE_DEFINITIONS[modeId]
  const route: BookingRoute = { airport, destination, direction: dir }
  const others = ALL_MODE_IDS.filter((id) => id !== modeId)

  return (
    <article className="pb-16">
      <div className="border-b border-ink/8 bg-cream/40">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-3 gap-y-2 px-[clamp(1.1rem,4vw,2rem)] py-3 text-[0.78rem] font-semibold">
          <Link to="/plan/builder/airport" state={{ itineraryPipeline: true }} className="text-terracotta hover:underline">
            Airport Transfers
          </Link>
          <span className="text-ink/25">/</span>
          <span className="text-ink">{mode.label}</span>
          <button type="button" onClick={goBack} className="text-ink/55 hover:text-ink">
            Back
          </button>
        </div>
      </div>

      <header className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] pb-8 pt-10">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-terracotta">Airport transfer guide</p>
        <h1 className="mt-3 font-serif text-[clamp(2.2rem,5.2vw,3.6rem)] font-semibold leading-[0.98] text-ink">
          {mode.symbol} {mode.label}
        </h1>
        <p className="mt-5 max-w-[62ch] text-[1.08rem] leading-[1.7] text-ink/80">{mode.description}</p>
      </header>

      <div className="mx-auto max-w-[1180px] space-y-10 px-[clamp(1.1rem,4vw,2rem)]">
        {modeId === 'car-taxi' ? <CarTaxiGuide /> : null}
        {modeId === 'public-bus' ? <BusModeGuide /> : null}
        {modeId === 'rental-driver' ? <RentalModeGuide /> : null}

        <section>
          <h2 className="font-serif text-xl font-semibold text-ink">Other ways in</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((id) => (
              <li key={id}>
                <Link
                  to={modeDetailHref(id, route)}
                  className="rounded-full bg-cream px-3 py-1.5 text-[0.8rem] font-semibold text-ink ring-1 ring-ink/10 hover:ring-terracotta"
                >
                  {MODE_DEFINITIONS[id].label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <StageFooter current="airport" continueLabel="Continue to Know before you go →" />
    </article>
  )
}
