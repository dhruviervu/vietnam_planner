import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { StageFooter } from '../PlanBuilder/components/StageFooter'
import { getAirport, getDestination } from './data/catalog'
import {
  findCatalogProvider,
  siblingProviders,
  type CatalogProvider,
} from './data/providerCatalog'
import {
  filledBookingUrl,
  providerDetailHref,
  routePlate,
  type BookingRoute,
} from './data/bookingLinks'
import { resolveProviderGuide } from './data/providerGuides'
import { APP_STORE_LINKS } from './data/transferGuides'
import { busLineForProvider } from './data/busNetwork'
import { MODE_DEFINITIONS } from './data/modes'
import type { TransferDirection } from './data/types'
import { ProviderJourneyMap } from './components/ProviderJourneyMap'

function storesFor(name: string) {
  if (name.startsWith('Grab')) return APP_STORE_LINKS.grab
  if (name.startsWith('Be')) return APP_STORE_LINKS.be
  if (name.startsWith('Xanh')) return APP_STORE_LINKS.xanh
  return null
}

export function TransferProviderPage() {
  const { providerId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const found = findCatalogProvider(providerId)
  const dest = getDestination(params.get('dest') ?? '')
  const dir = (params.get('dir') === 'outbound' ? 'outbound' : 'inbound') as TransferDirection
  const airport = found ? getAirport(found.airportId) : undefined

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
    navigate(
      found ? `/plan/builder/airport#mode-${found.provider.modeId}` : '/plan/builder/airport',
    )
  }

  if (!found || !airport) {
    return (
      <main className="mx-auto max-w-[900px] px-[clamp(1.1rem,4vw,2rem)] py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">Provider not found</h1>
        <button type="button" onClick={goBack} className="btn-solid mt-6">
          Back to Airport Transfers
        </button>
      </main>
    )
  }

  const destination =
    dest && dest.airportId === airport.id
      ? dest
      : getDestination(airport.defaultDestinationId) ?? dest
  if (!destination) {
    return (
      <main className="mx-auto max-w-[900px] px-[clamp(1.1rem,4vw,2rem)] py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">Route not found</h1>
        <button type="button" onClick={goBack} className="btn-solid mt-6">
          Back to Airport Transfers
        </button>
      </main>
    )
  }

  const provider = found.provider
  const route: BookingRoute = { airport, destination, direction: dir }
  const plate = routePlate(route)
  const guide = resolveProviderGuide({
    airport,
    destination,
    provider,
    inbound: dir === 'inbound',
  })
  const href = filledBookingUrl(provider.booking.url, route)
  const stores = provider.booking.kind === 'app' ? storesFor(provider.name) : null
  const others = siblingProviders(provider.id)
  const line = busLineForProvider(provider.id, airport.id)
  const mode = MODE_DEFINITIONS[provider.modeId]
  const hours = line?.hours || provider.hours
  const pickup = line?.pickupAtAirport || provider.pickup
  const airportHref = `/plan/builder/airport#mode-${provider.modeId}`

  return (
    <article className="pb-16">
      <div className="border-b border-ink/8 bg-cream/40">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-3 gap-y-2 px-[clamp(1.1rem,4vw,2rem)] py-3 text-[0.78rem] font-semibold">
          <Link to={airportHref} state={{ itineraryPipeline: true }} className="text-terracotta hover:underline">
            Airport Transfers
          </Link>
          <span className="text-ink/25" aria-hidden>
            /
          </span>
          <Link
            to={airportHref}
            state={{ itineraryPipeline: true }}
            className="text-ink/55 hover:text-ink"
          >
            {mode.shortLabel}
          </Link>
          <span className="text-ink/25" aria-hidden>
            /
          </span>
          <span className="text-ink">{provider.name}</span>
          <span className="mx-1 hidden text-ink/20 sm:inline" aria-hidden>
            ·
          </span>
          <a href="#provider-map" className="text-ink/55 hover:text-ink">
            Map
          </a>
          <a href="#other-providers" className="text-ink/55 hover:text-ink">
            Other providers
          </a>
          <button type="button" onClick={goBack} className="text-ink/55 hover:text-ink">
            Back
          </button>
        </div>
      </div>

      <header className="mx-auto grid max-w-[1180px] gap-8 px-[clamp(1.1rem,4vw,2rem)] pb-8 pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] lg:items-end lg:pt-10">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-terracotta">
            {guide.kicker}
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2.2rem,5.2vw,3.6rem)] font-semibold leading-[0.98] text-ink">
            {provider.name}
          </h1>
          <p className="mt-5 max-w-[54ch] text-[1.12rem] leading-[1.7] text-ink/80">{guide.lead}</p>
          <p className="mt-6 flex flex-wrap items-center gap-2 text-[0.8rem] font-semibold">
            <span className="rounded-full bg-paper px-3 py-1 ring-1 ring-ink/10">{plate.from}</span>
            <span aria-hidden className="text-terracotta">
              →
            </span>
            <span className="rounded-full bg-paper px-3 py-1 ring-1 ring-ink/10">{plate.to}</span>
          </p>
        </div>
        <div className="relative isolate min-h-[16rem] overflow-hidden rounded-[28px] bg-ink shadow-hero">
          <img src={provider.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10" />
          <p className="absolute bottom-4 left-4 right-4 font-serif text-[1.35rem] leading-tight text-paper">
            {mode.symbol} {mode.label}
          </p>
        </div>
      </header>

      <div className="border-y border-ink/8 bg-paper">
        <dl className="mx-auto grid max-w-[1180px] grid-cols-2 gap-px bg-ink/8 sm:grid-cols-4">
          <Fact label="Time" value={provider.time} />
          <Fact label="Fare" value={provider.fare} />
          <Fact label="Hours" value={hours || 'See the stop board'} />
          <Fact label="How to start" value={pickup || provider.booking.label} />
        </dl>
      </div>

      <div className="mx-auto grid max-w-[1180px] gap-12 px-[clamp(1.1rem,4vw,2rem)] pt-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          {guide.sections.map((section) => (
            <section key={section.title} className="mt-12 first:mt-0">
              <h2 className="font-serif text-[clamp(1.55rem,2.8vw,1.95rem)] font-semibold text-ink">
                {section.title}
              </h2>
              <p className="mt-4 max-w-[66ch] text-[1.05rem] leading-[1.8] text-ink/80">{section.body}</p>
            </section>
          ))}

          {line ? (
            <section className="mt-12 rounded-[24px] bg-cream/80 px-5 py-6 ring-1 ring-ink/6">
              <h2 className="font-serif text-[1.45rem] font-semibold text-ink">If you are serious about this ride</h2>
              <ul className="mt-4 grid gap-3 text-[0.95rem] leading-relaxed text-ink/80 sm:grid-cols-2">
                <li>
                  <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                    Company
                  </span>
                  {line.company}
                </li>
                <li>
                  <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                    Payment
                  </span>
                  {line.payment}
                </li>
                <li>
                  <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                    Luggage
                  </span>
                  {line.luggage}
                </li>
                <li>
                  <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                    Catch it in the city
                  </span>
                  {line.catchInCity}
                </li>
              </ul>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-ink/75">
                <span className="font-semibold text-ink">Best for:</span> {line.bestFor}
              </p>
              <p className="mt-1 text-[0.92rem] leading-relaxed text-ink/75">
                <span className="font-semibold text-ink">Wrong for:</span> {line.notFor}
              </p>
            </section>
          ) : null}

          <div className="mt-12">
            <ProviderJourneyMap
              airport={airport}
              destination={destination}
              direction={dir}
              providerId={provider.id}
              modeId={provider.modeId}
            />
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] bg-sage/10 px-5 py-6 ring-1 ring-sage/25">
              <h3 className="font-serif text-[1.25rem] font-semibold text-ink">Do this</h3>
              <ul className="mt-3 space-y-3">
                {guide.doThis.map((item) => (
                  <li key={item} className="text-[0.95rem] leading-relaxed text-ink/85">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[22px] bg-terracotta/8 px-5 py-6 ring-1 ring-terracotta/20">
              <h3 className="font-serif text-[1.25rem] font-semibold text-ink">Skip it if</h3>
              <ul className="mt-3 space-y-3">
                {guide.skipIf.map((item) => (
                  <li key={item} className="text-[0.95rem] leading-relaxed text-ink/85">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] bg-paper p-6 shadow-soft ring-1 ring-ink/8">
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted">This ride</p>
            <p className="mt-2 font-serif text-[1.85rem] font-semibold leading-none text-terracotta">
              {provider.time}
            </p>
            <p className="mt-3 text-[1rem] font-semibold text-ink">{provider.fare}</p>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
              {plate.from} → {plate.to}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {provider.booking.kind === 'web' && href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-terracotta px-4 py-2.5 text-center text-[0.78rem] font-bold text-paper"
                >
                  {provider.booking.label}
                </a>
              ) : null}
              {stores ? (
                <>
                  <a
                    href={stores.ios}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-ink px-4 py-2.5 text-center text-[0.78rem] font-bold text-paper"
                  >
                    iPhone app
                  </a>
                  <a
                    href={stores.android}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-ink px-4 py-2.5 text-center text-[0.78rem] font-bold text-paper"
                  >
                    Android app
                  </a>
                </>
              ) : null}
              {provider.booking.kind === 'desk' || provider.booking.kind === 'onboard' ? (
                <p className="rounded-full bg-cream px-4 py-2.5 text-center text-[0.78rem] font-bold text-ink">
                  {provider.booking.label}
                </p>
              ) : null}
              <Link
                to={airportHref}
                state={{ itineraryPipeline: true }}
                className="rounded-full px-4 py-2.5 text-center text-[0.78rem] font-bold text-ink ring-1 ring-ink/12"
              >
                Back to Airport Transfers
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {others.length > 0 ? (
        <section
          id="other-providers"
          className="mx-auto mt-16 max-w-[1180px] scroll-mt-28 px-[clamp(1.1rem,4vw,2rem)]"
        >
          <h2 className="font-serif text-[clamp(1.55rem,2.8vw,1.95rem)] font-semibold text-ink">
            See other providers
          </h2>
          <p className="mt-2 max-w-[60ch] text-[0.95rem] leading-relaxed text-muted">
            Same mode, same airport. Each card stays inside this trip tab so the progress rail and
            Continue still work.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.slice(0, 4).map((p) => (
              <li key={p.id}>
                <OtherCard provider={p} route={route} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)]">
        <StageFooter current="airport" continueLabel="Continue to Know before you go →" />
      </div>
    </article>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper px-5 py-5">
      <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-2 text-[0.92rem] font-semibold leading-snug text-ink">{value}</dd>
    </div>
  )
}

function OtherCard({ provider, route }: { provider: CatalogProvider; route: BookingRoute }) {
  const href = providerDetailHref(provider.id, route)
  return (
    <Link
      to={href}
      state={{ itineraryPipeline: true }}
      className="group block overflow-hidden rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/8"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-cream">
        <img
          src={provider.image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="px-3 py-3">
        <p className="font-serif text-[1rem] font-semibold leading-tight text-ink">{provider.name}</p>
        <p className="mt-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-terracotta">
          {provider.time}
        </p>
        <p className="mt-0.5 text-[0.78rem] font-semibold text-ink/70">{provider.fare}</p>
      </div>
    </Link>
  )
}
