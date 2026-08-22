import { useState } from 'react'
import type { TransportMode, TransportOption } from '../data/types'
import { optionsForMode, getBookingProviders } from '../data/options'
import { TravelReality, shouldShowTravelReality } from './TravelReality'
import { BookingDrawer } from './BookingDrawer'

type Props = {
  mode: TransportMode
  idPrefix: string
  highlighted: boolean
  selectedOptionId?: string | null
  onSelectOption?: (id: string) => void
}

export function ModeSection({
  mode,
  idPrefix,
  highlighted,
  selectedOptionId = null,
  onSelectOption,
}: Props) {
  const [showAll, setShowAll] = useState(false)
  const [booking, setBooking] = useState<TransportOption | null>(null)
  const options = optionsForMode(mode.id)
  const visible = showAll ? options : options.slice(0, 3)
  const showReality = shouldShowTravelReality(mode.id)

  return (
    <section
      id={`${idPrefix}-${mode.id}`}
      className={`scroll-mt-28 border-t border-ink/10 pt-8 ${
        highlighted ? 'rounded-[18px] bg-terracotta/[0.04] px-3 py-2 sm:px-4' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-[clamp(1.25rem,2.4vw,1.55rem)] font-semibold text-ink">
          {mode.symbol} {mode.label}
        </h3>
        {mode.waterKind ? (
          <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted ring-1 ring-ink/8">
            {mode.waterKind === 'experience' ? 'Experience' : 'Transport'}
          </span>
        ) : null}
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted">
          TYPICAL
        </span>
      </div>

      <p className="mt-2 max-w-[62ch] text-[0.9rem] leading-relaxed text-ink/85">
        {mode.description}
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <MetaBlock title="Best for" body={mode.bestFor.join(' · ')} />
          <MetaBlock title="Why choose it" body={mode.whyChoose.join(' · ')} />
          <MetaBlock title="Tradeoff" body={mode.tradeoff} />

          {!showReality ? (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] font-semibold text-ink">
              <span>⏱ {mode.vehicleTimeLabel}</span>
              <span>💰 {mode.costLabel}</span>
              {mode.trafficSensitivity ? <span>🚦 Traffic · {mode.trafficSensitivity}</span> : null}
              {mode.weatherSensitive ? <span>🌦 Weather-sensitive</span> : null}
              <span>🧳 {mode.luggageLabel}</span>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.82rem] font-semibold text-ink/80">
              <span>🧳 {mode.luggageLabel}</span>
              <span>😌 {mode.comfortLabel}</span>
              <span>🎟 {mode.bookingNote}</span>
              {mode.weatherSensitive ? <span>🌦 Weather-sensitive</span> : null}
            </div>
          )}
        </div>

        {showReality ? <TravelReality mode={mode} /> : <UrbanSnapshot mode={mode} />}
      </div>

      <h4 className="mt-7 font-serif text-[1.05rem] font-semibold text-ink">Worth comparing</h4>
      <p className="mt-0.5 text-[0.68rem] font-semibold text-muted">
        Typical / estimated prototype data — not live inventory
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((o) => (
          <ProviderCard
            key={o.id}
            option={o}
            chosen={selectedOptionId === o.id}
            onOpen={() => setBooking(o)}
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

      {booking ? (
        <BookingDrawer
          option={booking}
          providers={getBookingProviders(booking)}
          onClose={() => setBooking(null)}
        />
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
    <div className="rounded-[18px] bg-cream/70 px-4 py-4 ring-1 ring-ink/8">
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
        <div className="flex justify-between gap-3">
          <dt className="font-medium text-muted">Best use</dt>
          <dd className="text-right">{mode.bestFor[0]}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[0.72rem] font-medium text-muted">TYPICAL · ESTIMATED</p>
    </div>
  )
}

function ProviderCard({
  option,
  chosen,
  onOpen,
  onSelect,
}: {
  option: TransportOption
  chosen: boolean
  onOpen: () => void
  onSelect?: () => void
}) {
  return (
    <article
      className={`overflow-hidden rounded-[14px] bg-cream/50 ring-1 ${
        chosen ? 'ring-terracotta/45' : 'ring-ink/6'
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={option.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute left-2 top-2 rounded-full bg-ink/55 px-2 py-0.5 text-[0.55rem] font-bold text-paper">
          ⭐ {option.rating.toFixed(1)}
        </span>
      </div>
      <div className="p-2.5">
        <h5 className="text-[0.8rem] font-bold text-ink">{option.name}</h5>
        <p className="mt-1 text-[0.9rem] font-bold text-terracotta">{option.priceLabel}</p>
        <div className="mt-1.5 space-y-0.5 text-[0.66rem] font-semibold text-ink/80">
          <p>{option.serviceType}</p>
          <p>⏱ {option.durationLabel}</p>
          <p>Door-to-door {option.doorToDoorLabel}</p>
          <p>🧳 {option.luggage}</p>
          <p>🎟 {option.bookingRequired}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full bg-terracotta px-2.5 py-1 text-[0.66rem] font-bold text-paper"
          >
            See Travel Options →
          </button>
          {!chosen && onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              className="rounded-full bg-paper px-2.5 py-1 text-[0.66rem] font-bold text-ink ring-1 ring-ink/8"
            >
              Select
            </button>
          ) : null}
        </div>
        {chosen && onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            className="group relative mt-2.5 w-full overflow-hidden rounded-[12px] bg-gradient-to-br from-sage/20 via-cream/90 to-paper px-3 py-2.5 text-left ring-1 ring-sage/35 transition hover:from-ink/[0.04] hover:via-cream hover:to-paper hover:ring-ink/15"
            aria-label="Unselect this option"
          >
            <div className="flex items-start gap-2 transition duration-200 group-hover:opacity-0">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage text-[0.7rem] font-bold text-paper"
                aria-hidden
              >
                ✓
              </span>
              <div className="min-w-0">
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-sage">
                  Saved for your trip
                </p>
                <p className="mt-0.5 text-[0.72rem] font-semibold leading-snug text-ink">
                  Chosen — we&apos;ll fit this into your itinerary and handle it when we plan your
                  trip.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream via-paper to-cream/90 opacity-0 transition duration-200 group-hover:opacity-100">
              <span className="text-[0.78rem] font-bold tracking-wide text-ink/80">Unselect</span>
            </div>
          </button>
        ) : null}
      </div>
    </article>
  )
}
