import { useState } from 'react'
import { ContentImage } from '../../../components/shared/ContentImage'
import type { TransportMode, TransportOption } from '../data/types'
import { optionsForMode } from '../data/options'
import {
  LONG_MODE_GUIDES,
  URBAN_MODE_GUIDES,
  WATER_MODE_GUIDES,
  type ModeGuide,
} from '../data/modeGuides'

type Props = {
  mode: TransportMode
  idPrefix: string
  highlighted: boolean
  selectedOptionId?: string | null
  onSelectOption?: (id: string) => void
  bookingHref?: (option: TransportOption) => string
}

function topProvidersHeading(mode: TransportMode): string {
  const byId: Partial<Record<TransportMode['id'], string>> = {
    flight: 'Top Flights',
    train: 'Top Trains',
    coach: 'Top Coaches',
    'private-driver': 'Top Drivers',
    'shared-transfer': 'Top Transfers',
    scooter: 'Top Scooters',
    'car-taxi': 'Top Taxis',
    'public-transit': 'Top Transit',
    walking: 'Top Walking',
    bicycle: 'Top Bikes',
    'urban-driver': 'Top Drivers',
    ferry: 'Top Ferries',
    'fast-boat': 'Top Fast Boats',
    'sightseeing-boat': 'Top Boats',
    cruise: 'Top Cruises',
    'river-boat': 'Top River Boats',
  }
  return byId[mode.id] ?? `Top ${mode.shortLabel}s`
}

function guideForMode(mode: TransportMode): ModeGuide | null {
  if (mode.world === 'long-distance') {
    return LONG_MODE_GUIDES[mode.id as keyof typeof LONG_MODE_GUIDES] ?? null
  }
  if (mode.world === 'urban') {
    return URBAN_MODE_GUIDES[mode.id as keyof typeof URBAN_MODE_GUIDES] ?? null
  }
  if (mode.world === 'water') {
    return WATER_MODE_GUIDES[mode.id as keyof typeof WATER_MODE_GUIDES] ?? null
  }
  return null
}

export function ModeSection({
  mode,
  idPrefix,
  highlighted,
  selectedOptionId = null,
  onSelectOption,
  bookingHref,
}: Props) {
  const [showAll, setShowAll] = useState(false)
  const options = optionsForMode(mode.id)
  const visible = showAll ? options : options.slice(0, 3)
  const guide = guideForMode(mode)
  const heroImage = guide?.heroImage ?? mode.image

  return (
    <section
      id={`${idPrefix}-${mode.id}`}
      className={`scroll-mt-28 border-t border-ink/10 pt-10 first:border-t-0 first:pt-0 ${
        highlighted ? 'rounded-[20px] bg-terracotta/[0.04] px-3 py-3 sm:px-5 sm:py-4 ring-1 ring-terracotta/15' : ''
      }`}
    >
      <div className="overflow-hidden rounded-[18px] ring-1 ring-ink/10">
        <div className="relative aspect-[21/7] max-h-44 sm:max-h-48">
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
            <span className="text-[2rem] leading-none sm:text-[2.25rem]" aria-hidden>
              {mode.symbol}
            </span>
            <h3 className="mt-1 font-serif text-[clamp(1.25rem,2.4vw,1.65rem)] font-semibold text-paper">
              {mode.label}
            </h3>
            {mode.waterKind ? (
              <span className="mt-1 inline-flex w-fit rounded-full bg-paper/20 px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-paper backdrop-blur-sm">
                {mode.waterKind === 'experience' ? 'Experience' : 'Transport'}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-[72ch] text-[0.95rem] leading-relaxed text-ink/85">
        {guide?.intro ?? mode.description}
      </p>

      {guide ? (
        <div className="mt-5 space-y-4">
          {guide.blocks.map((block) => (
            <article
              key={block.title}
              className="overflow-hidden rounded-[18px] border border-ink/8 bg-cream/55"
            >
              <div className="grid gap-0 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <div className="px-5 py-4">
                  <h4 className="font-serif text-[1.12rem] font-semibold text-ink">{block.title}</h4>
                  <p className="mt-2 text-[0.92rem] leading-[1.75] text-ink/90">{block.body}</p>
                </div>
                {block.image ? (
                  <div className="relative hidden aspect-square sm:block">
                    <img
                      src={block.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
              {block.image ? (
                <div className="relative aspect-[16/7] sm:hidden">
                  <img
                    src={block.image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <MetaBlock title="Best for" body={mode.bestFor.join(' · ')} />
            <MetaBlock title="Why choose it" body={mode.whyChoose.join(' · ')} />
            <MetaBlock title="Tradeoff" body={mode.tradeoff} />
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] font-semibold text-ink">
              <span>⏱ {mode.vehicleTimeLabel}</span>
              <span>💰 {mode.costLabel}</span>
              {mode.trafficSensitivity ? <span>🚦 Traffic · {mode.trafficSensitivity}</span> : null}
              {mode.weatherSensitive ? <span>🌦 Weather-sensitive</span> : null}
              <span>🧳 {mode.luggageLabel}</span>
            </div>
          </div>
          <UrbanSnapshot mode={mode} />
        </div>
      )}

      <h4 className="mt-8 font-serif text-[1.15rem] font-semibold text-ink">
        {topProvidersHeading(mode)}
      </h4>
      <p className="mt-0.5 text-[0.68rem] font-semibold text-muted">
        Check live availability on each operator&apos;s best website
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((o) => (
          <ProviderCard
            key={o.id}
            option={o}
            modeSymbol={mode.symbol}
            chosen={selectedOptionId === o.id}
            href={bookingHref?.(o) ?? o.bookingUrl}
            onSelect={() => onSelectOption?.(o.id)}
          />
        ))}
      </div>
      {options.length > 3 ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 rounded-[14px] bg-terracotta px-5 py-3 text-[0.88rem] font-bold text-paper"
        >
          {showAll ? 'Show top 3' : `See all options (${options.length})`}
        </button>
      ) : null}
    </section>
  )
}

function MetaBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">{title}</p>
      <p className="mt-1 text-[0.85rem] font-semibold leading-snug text-ink">{body}</p>
    </div>
  )
}

function UrbanSnapshot({ mode }: { mode: TransportMode }) {
  return (
    <div className="overflow-hidden rounded-[18px] ring-1 ring-ink/8">
      <div className="relative aspect-[16/10]">
        <ContentImage src={mode.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute left-3 top-3 text-[1.5rem]">{mode.symbol}</span>
      </div>
      <div className="bg-cream/70 px-4 py-4">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">At a glance</p>
        <dl className="mt-3 space-y-2 text-[0.85rem] font-semibold text-ink">
          <div className="flex justify-between gap-3">
            <dt className="font-medium text-muted">Typical trip</dt>
            <dd>{mode.vehicleTimeLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-medium text-muted">Cost</dt>
            <dd>{mode.costLabel}</dd>
          </div>
          {mode.trafficSensitivity ? (
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted">Traffic</dt>
              <dd>{mode.trafficSensitivity}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="font-medium text-muted">Luggage</dt>
            <dd>{mode.luggageLabel}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function ProviderCard({
  option,
  modeSymbol,
  chosen,
  href,
  onSelect,
}: {
  option: TransportOption
  modeSymbol: string
  chosen: boolean
  href: string
  onSelect?: () => void
}) {
  return (
    <article
      className={`group overflow-hidden rounded-[18px] bg-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
        chosen ? 'ring-2 ring-sage/50' : ''
      }`}
    >
      <div className="relative aspect-[5/3.4] overflow-hidden bg-cream">
        <img src={option.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-paper/92 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-ink backdrop-blur-sm">
          {modeSymbol} ⭐ {option.rating.toFixed(1)}
        </span>
      </div>
      <div className="p-3">
        <h5 className="font-serif text-[1.02rem] font-semibold leading-tight text-ink">{option.name}</h5>
        <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-terracotta">
          {option.provider}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[0.82rem] leading-snug text-muted">
          {option.serviceType} · {option.availability}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Metric label="From" value={`💰 ${option.priceLabel}`} />
          <Metric label="Duration" value={`⏱ ${option.durationLabel}`} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            data-outbound-label={option.name}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-3 py-2 text-center text-[0.78rem] font-bold text-paper"
          >
            See Travel options →
          </a>
          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              className={`rounded-full px-3 py-2 text-[0.78rem] font-bold ${
                chosen ? 'bg-sage text-paper' : 'border border-ink/12 bg-paper text-ink'
              }`}
            >
              {chosen ? '✓ Saved' : 'Select'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream px-2 py-1.5">
      <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.72rem] font-semibold leading-snug text-ink">{value}</p>
    </div>
  )
}
