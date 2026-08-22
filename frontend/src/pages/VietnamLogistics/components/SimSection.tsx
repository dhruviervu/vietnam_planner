import { useMemo, useState } from 'react'
import type { TripLength } from '../data/types'
import {
  filterByIntent,
  labelCopy,
  scoreSimProviders,
  type ScoredSimProvider,
  type SimIntentFilter,
  type SimRecommendationLabel,
} from '../data/simRecommendation'
import { Label, SectionIntro } from './ui'

type Props = {
  tripLength?: TripLength | null
  arrivalDate?: string | null
}

type ConnectMode = 'physical' | 'esim'

const IMG = {
  band: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1400&q=80',
  airport:
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
  store:
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
  esimPhone:
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
  wifi:
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80',
  connected:
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=900&q=80',
}

function IconSim({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 2.5v3.5h6V2.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8.5" y="10" width="7" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="18.5" r="0.9" fill="currentColor" />
    </svg>
  )
}

function IconEsim({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="3" width="12" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 7.5h6M9 10.5h6M9 13.5h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 16.2c.7.7 1.8.7 2.5 0M14.3 17.8c1.4 1.4 3.5 1.4 4.9 0"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="17.8" cy="14.4" r="0.85" fill="currentColor" />
    </svg>
  )
}

function primaryLabel(labels: SimRecommendationLabel[]): SimRecommendationLabel | null {
  const order: SimRecommendationLabel[] = [
    'best-overall',
    'best-value',
    'easiest-arrival',
    'best-esim',
    'best-coverage',
  ]
  return order.find((l) => labels.includes(l)) ?? labels[0] ?? null
}

function Dots({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < n ? 'bg-terracotta' : 'bg-ink/15'}`}
        />
      ))}
    </span>
  )
}

const PHYSICAL_BUY = [
  {
    id: 'airport' as const,
    title: 'Airport desk',
    tag: 'Fastest after landing',
    image: IMG.airport,
    summary: 'Grab a tourist SIM right after immigration when desks are open.',
    points: [
      'Official or authorised kiosks at major airports',
      'Passport usually required for registration',
      'Often a small convenience premium vs city stores',
    ],
    bestWhen: 'You want data immediately and prefer not to hunt for a shop.',
  },
  {
    id: 'store' as const,
    title: 'Official store',
    tag: 'Better value & choice',
    image: IMG.store,
    summary: 'City centres usually offer more plans and staff help with registration.',
    points: [
      'More package options than a rush airport desk',
      'Helpful if activation or ID registration fails',
      'Slightly slower — wait until you reach town',
    ],
    bestWhen: 'You have Wi‑Fi for maps/ride apps and can wait a few hours.',
  },
]

const ESIM_STEPS = [
  {
    n: '01',
    title: 'Confirm your phone',
    body: 'Settings → look for “Add eSIM” / “Cellular”. Your phone must be unlocked.',
    image: IMG.esimPhone,
  },
  {
    n: '02',
    title: 'Buy before you fly',
    body: 'Order a Vietnam eSIM online. Keep the QR or activation email offline.',
    image: IMG.wifi,
  },
  {
    n: '03',
    title: 'Install on Wi‑Fi',
    body: 'Scan the QR at home or hotel Wi‑Fi. Do not delete the profile until you land.',
    image: IMG.band,
  },
  {
    n: '04',
    title: 'Land already online',
    body: 'Enable the eSIM line on arrival. Skip airport queues entirely.',
    image: IMG.connected,
  },
]

export function SimSection({ tripLength = null, arrivalDate = null }: Props) {
  const [mode, setMode] = useState<ConnectMode>('physical')
  const [intent, setIntent] = useState<SimIntentFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [buyPlace, setBuyPlace] = useState<'airport' | 'store'>('airport')

  const scored = useMemo(
    () =>
      scoreSimProviders({
        tripLength,
        arrivalDate,
        connectionType: mode,
      }),
    [tripLength, arrivalDate, mode],
  )

  const intentOptions: { id: SimIntentFilter; label: string }[] = useMemo(() => {
    const base: { id: SimIntentFilter; label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'best-overall', label: 'Best overall' },
      { id: 'best-value', label: 'Best value' },
      { id: 'best-coverage', label: 'Best coverage' },
    ]
    if (mode === 'esim') {
      base.splice(3, 0, { id: 'best-esim', label: 'Best eSIM' })
    } else {
      base.splice(3, 0, { id: 'easiest-arrival', label: 'Easiest arrival' })
    }
    return base
  }, [mode])

  const ranked = useMemo(() => filterByIntent(scored, intent), [scored, intent])

  const selected: ScoredSimProvider | undefined =
    ranked.find((s) => s.provider.id === selectedId) ?? ranked[0]

  const activeBuy = PHYSICAL_BUY.find((b) => b.id === buyPlace) ?? PHYSICAL_BUY[0]

  const tripNote =
    tripLength === 'short'
      ? 'Short stay — favour convenience and a sensible pack size.'
      : tripLength === 'long'
        ? 'Longer stay — favour 30-day validity so you avoid buying twice.'
        : tripLength === 'medium'
          ? 'Medium stay — balance data, validity and easy activation.'
          : 'Trip length not set — ranking assumes a typical ~12-day stay.'

  return (
    <section className="space-y-6">
      <SectionIntro
        id="logistics-sim"
        n="02 · Connectivity"
        title="SIM & Connectivity"
        support="Pick a physical SIM or an eSIM — we’ll show the best providers, where to buy, and how to get online."
      />

      {/* Atmosphere strip */}
      <div className="relative h-[140px] overflow-hidden rounded-[2px] sm:h-[168px]">
        <img
          src={IMG.band}
          alt=""
          className="h-full w-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/35 to-ink/15" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper/75">
            Stay connected in Vietnam
          </p>
          <p className="mt-1 max-w-[36ch] font-serif text-[1.25rem] leading-snug text-paper sm:text-[1.4rem]">
            Two clear paths. One smart recommendation for your trip.
          </p>
        </div>
      </div>

      {/* Two-path control */}
      <div
        className="grid gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label="How do you want to connect"
      >
        {(
          [
            {
              id: 'physical' as const,
              title: 'Physical SIM',
              sub: 'Buy after landing · airport or store',
              Icon: IconSim,
            },
            {
              id: 'esim' as const,
              title: 'eSIM',
              sub: 'Install before you fly · no plastic card',
              Icon: IconEsim,
            },
          ] as const
        ).map(({ id, title, sub, Icon }) => {
          const on = mode === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setMode(id)
                setSelectedId(null)
                setIntent('all')
              }}
              className={`group relative flex min-h-[5rem] items-center gap-4 overflow-hidden rounded-[3px] border px-4 py-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                on
                  ? 'border-terracotta bg-terracotta text-paper shadow-[0_12px_32px_rgba(180,83,50,0.22)]'
                  : 'border-ink/12 bg-paper text-ink hover:border-ink/25'
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] ${
                  on ? 'bg-paper/15 text-paper' : 'bg-ink/[0.05] text-ink/80'
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-[1.2rem] leading-tight tracking-[-0.02em]">
                  {title}
                </span>
                <span className={`mt-0.5 block text-[0.74rem] ${on ? 'text-paper/80' : 'text-muted'}`}>
                  {sub}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          {/* Providers */}
          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <Label>{mode === 'physical' ? 'Physical SIM providers' : 'eSIM options'}</Label>
                <p className="mt-1 text-[0.78rem] text-muted">
                  {mode === 'physical'
                    ? 'Local networks you can buy as a plastic SIM after arrival.'
                    : 'Digital plans you install with a QR — including pre-arrival travel eSIMs.'}
                </p>
              </div>
            </div>

            <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {intentOptions.map((f) => {
                const on = intent === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setIntent(f.id)}
                    className={`shrink-0 rounded-[3px] px-2.5 py-1.5 text-[0.7rem] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      on
                        ? 'bg-terracotta text-paper'
                        : 'bg-ink/[0.04] text-ink/75 hover:bg-ink/[0.07]'
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>

            <ul className="mt-3 space-y-2">
              {ranked.map((row) => {
                const p = row.provider
                const active = selected?.provider.id === p.id
                const tag = primaryLabel(row.labels)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`flex w-full gap-3 overflow-hidden rounded-[3px] border text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                        active
                          ? 'border-terracotta/50 bg-terracotta/[0.06]'
                          : 'border-ink/10 bg-paper hover:border-ink/20'
                      }`}
                    >
                      <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[96px] sm:w-[108px]">
                        <img
                          src={p.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent" />
                      </div>
                      <div className="min-w-0 flex-1 py-2.5 pr-3">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="font-serif text-[1.05rem] text-ink">{p.name}</span>
                          {tag ? (
                            <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-terracotta">
                              {labelCopy(tag)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[0.72rem] text-muted">{p.coverage}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem]">
                          <span className="font-bold text-ink">~${p.priceUsdApprox}</span>
                          <span className="text-ink/75">{p.dataGb} GB</span>
                          <span className="text-ink/75">{p.validityDays} days</span>
                          <span className="hidden sm:inline">
                            <Dots n={row.coverageDots.nationwide} />
                          </span>
                        </div>
                        <p className="mt-1 text-[0.68rem] text-muted">
                          {[
                            mode === 'esim' && p.esim ? 'eSIM' : null,
                            p.airport ? 'Airport' : null,
                            p.cityStores ? 'Store' : null,
                            !p.airport && !p.cityStores ? 'Online' : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-2 text-[0.68rem] text-muted">
              Snapshot tourist pricing · {scored[0]?.provider.freshness ?? 'updated'} · not live
              inventory
            </p>
          </div>

          {mode === 'physical' ? (
            <div id="sim-buy" className="scroll-mt-28">
              <Label>Where should you buy it?</Label>
              <p className="mt-1 max-w-[52ch] text-[0.78rem] text-muted">
                Airport is convenient. Official stores often win on value and plan choice.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {PHYSICAL_BUY.map((place) => {
                  const on = buyPlace === place.id
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => setBuyPlace(place.id)}
                      className={`overflow-hidden rounded-[3px] border text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                        on
                          ? 'border-terracotta/45 bg-paper'
                          : 'border-ink/10 bg-paper hover:border-ink/20'
                      }`}
                    >
                      <div className="relative h-[110px]">
                        <img
                          src={place.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-3">
                          <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-paper/80">
                            {place.tag}
                          </p>
                          <p className="font-serif text-[1.15rem] text-paper">{place.title}</p>
                        </div>
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-[0.78rem] leading-snug text-ink/80">{place.summary}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {activeBuy ? (
                <div className="mt-3 border-t border-ink/10 pt-3">
                  <p className="font-serif text-[1.15rem] text-ink">{activeBuy.title}</p>
                  <p className="mt-1 text-[0.85rem] leading-relaxed text-ink/85">
                    <span className="font-medium text-ink">Best when: </span>
                    {activeBuy.bestWhen}
                  </p>
                  <ul className="mt-2 space-y-1 text-[0.78rem] text-muted">
                    {activeBuy.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span className="text-terracotta">·</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[0.68rem] text-muted">
                    Typical availability at major airports and city stores — not a live desk status.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div id="sim-process" className="scroll-mt-28">
              <Label>How eSIM works</Label>
              <p className="mt-1 max-w-[52ch] text-[0.78rem] text-muted">
                Four steps from “does my phone support this?” to landing already online.
              </p>
              <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                {ESIM_STEPS.map((step) => (
                  <li
                    key={step.n}
                    className="overflow-hidden rounded-[3px] border border-ink/10 bg-paper"
                  >
                    <div className="relative h-[100px]">
                      <img
                        src={step.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
                      <span className="absolute left-2.5 top-2.5 rounded-[2px] bg-paper/90 px-1.5 py-0.5 text-[0.58rem] font-bold tracking-[0.12em] text-ink">
                        {step.n}
                      </span>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="font-serif text-[1.02rem] text-ink">{step.title}</p>
                      <p className="mt-1 text-[0.76rem] leading-snug text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Recommendation panel */}
        <aside className="space-y-3 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[3px] border border-ink/10 bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)]">
            {selected ? (
              <>
                <div className="relative h-[132px]">
                  <img
                    src={selected.provider.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-paper/75">
                      Your best route
                    </p>
                    <h3 className="font-serif text-[1.45rem] leading-tight text-paper">
                      {selected.provider.name}
                    </h3>
                  </div>
                </div>
                <div className="p-3.5 sm:p-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-terracotta">
                    {primaryLabel(selected.labels)
                      ? labelCopy(primaryLabel(selected.labels)!)
                      : 'Recommended'}
                  </p>
                  <p className="mt-1 text-[0.84rem] text-ink/80">
                    {primaryLabel(selected.labels) === 'best-overall'
                      ? mode === 'esim'
                        ? 'Best overall eSIM path for your trip'
                        : 'Best overall physical SIM for your trip'
                      : selected.bestFor[0]
                        ? `Best for: ${selected.bestFor.join(' · ')}`
                        : selected.provider.typicalPackage}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-y border-ink/10 py-2.5">
                    <span className="font-serif text-[1.3rem] text-ink">
                      ~${selected.provider.priceUsdApprox}
                    </span>
                    <span className="self-center text-[0.85rem] text-ink/80">
                      {selected.provider.dataGb} GB
                    </span>
                    <span className="self-center text-[0.85rem] text-ink/80">
                      {selected.provider.validityDays} days
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
                      Why this one?
                    </p>
                    <p className="mt-1 text-[0.84rem] leading-relaxed text-ink/85">
                      {selected.reason}
                    </p>
                  </div>

                  <dl className="mt-3 space-y-1.5 text-[0.76rem]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted">Nationwide</dt>
                      <dd>
                        <Dots n={selected.coverageDots.nationwide} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted">Cities</dt>
                      <dd>
                        <Dots n={selected.coverageDots.cities} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted">Remote</dt>
                      <dd>
                        <Dots n={selected.coverageDots.remote} />
                      </dd>
                    </div>
                  </dl>

                  <a
                    href={mode === 'physical' ? '#sim-buy' : '#sim-process'}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-[3px] bg-terracotta px-4 py-2.5 text-[0.84rem] font-bold text-paper transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  >
                    {mode === 'physical' ? 'View where to buy →' : 'See eSIM process →'}
                  </a>
                </div>
              </>
            ) : (
              <p className="p-4 text-sm text-muted">No providers for this path.</p>
            )}
          </div>

          {mode === 'esim' ? (
            <div className="rounded-[3px] border border-ink/10 bg-paper px-3.5 py-3">
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
                Check before you buy
              </p>
              <ul className="mt-2 space-y-1.5 text-[0.8rem] text-ink/80">
                <li className="flex gap-2">
                  <span className="text-terracotta">✓</span> eSIM-compatible phone
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta">✓</span> Unlocked device
                </li>
                <li className="flex gap-2">
                  <span className="text-terracotta">✓</span> Wi‑Fi to install the QR
                </li>
              </ul>
            </div>
          ) : null}

          {selected ? (
            <div className="rounded-[3px] border border-ink/10 bg-ink/[0.03] px-3.5 py-3">
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
                You’ll need
              </p>
              <ul className="mt-2 space-y-1 text-[0.78rem] text-ink/80">
                {selected.provider.requirements.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
              <p className="mt-2 text-[0.68rem] text-muted">
                {selected.provider.source} · {selected.provider.lastUpdated}
              </p>
            </div>
          ) : null}

          <p className="px-0.5 text-[0.72rem] leading-relaxed text-muted">
            {tripNote}
            {arrivalDate
              ? ` Arrival date set (${arrivalDate}) — exact landing time unknown.`
              : ' Arrival time not set — we use typical availability.'}
          </p>
        </aside>
      </div>
    </section>
  )
}
