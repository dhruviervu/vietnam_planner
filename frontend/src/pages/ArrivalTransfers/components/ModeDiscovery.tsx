import { useState } from 'react'
import type {
  AvailabilityResult,
  ModeEvaluation,
  ProviderOption,
  TransportMode,
  TransportModeId,
} from '../data/types'
import { formatCostWithBasis, formatTimeRange } from '../data/catalog'
import { bookingUrlForOption, rankOptionsForProfile } from '../data/providers'

type Profile = {
  passengers: number
  luggage: 'light' | 'medium' | 'heavy'
  budget: boolean
}

type Props = {
  title: string
  support: string
  evaluations: ModeEvaluation[]
  optionsByMode: Record<string, ProviderOption[]>
  recommendedModeId: TransportModeId | null
  expandedId: TransportModeId | null
  onExpand: (id: TransportModeId) => void
  onSelectMode: (id: TransportModeId) => void
  profile: Profile
  airportSelected: boolean
  destinationSelected: boolean
  direction: 'inbound' | 'outbound'
}

export function ModeDiscovery({
  title,
  support,
  evaluations,
  optionsByMode,
  recommendedModeId,
  expandedId: _expandedId,
  onExpand,
  onSelectMode,
  profile,
  airportSelected,
  destinationSelected,
  direction,
}: Props) {
  const [showAll, setShowAll] = useState<Record<string, boolean>>({})

  return (
    <div>
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-1 max-w-[52ch] text-[0.88rem] text-muted">{support}</p>
      <p className="mt-1 text-[0.68rem] font-semibold text-muted/80">
        Typical / estimated prototype data — not live inventory.
      </p>

      <div className="mt-6 space-y-5">
        {evaluations.map((ev) => {
          const ranked = rankOptionsForProfile(optionsByMode[ev.mode.id] ?? [], profile)
          const visible = showAll[ev.mode.id] ? ranked : ranked.slice(0, 3)
          return (
            <ModeBlock
              key={ev.mode.id}
              evaluation={ev}
              isRecommended={ev.mode.id === recommendedModeId}
              options={visible}
              totalOptions={ranked.length}
              showingAll={!!showAll[ev.mode.id]}
              onSelectMode={() => onSelectMode(ev.mode.id)}
              onToggleAll={() =>
                setShowAll((s) => ({ ...s, [ev.mode.id]: !s[ev.mode.id] }))
              }
              allEvals={evaluations}
              onJump={(id) => {
                onExpand(id)
                onSelectMode(id)
              }}
              airportSelected={airportSelected}
              destinationSelected={destinationSelected}
              direction={direction}
            />
          )
        })}
      </div>
    </div>
  )
}

function ModeBlock({
  evaluation,
  isRecommended,
  options,
  totalOptions,
  showingAll,
  onSelectMode,
  onToggleAll,
  allEvals,
  onJump,
  airportSelected,
  destinationSelected,
  direction,
}: {
  evaluation: ModeEvaluation
  isRecommended: boolean
  options: ProviderOption[]
  totalOptions: number
  showingAll: boolean
  onSelectMode: () => void
  onToggleAll: () => void
  allEvals: ModeEvaluation[]
  onJump: (id: TransportModeId) => void
  airportSelected: boolean
  destinationSelected: boolean
  direction: 'inbound' | 'outbound'
}) {
  const { mode, availability, suitability } = evaluation
  const unavailable = availability.status === 'unavailable'
  const alts = evaluation.alternatives
    .map((id) => allEvals.find((e) => e.mode.id === id)?.mode)
    .filter(Boolean) as TransportMode[]

  return (
    <section
      id={`mode-${mode.id}`}
      className="scroll-mt-28 rounded-[18px] bg-paper/70 px-4 py-5 ring-1 ring-ink/10 sm:px-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-[clamp(1.15rem,2.2vw,1.35rem)] font-semibold text-ink">
          {mode.symbol} {mode.label}
        </h3>
        {isRecommended ? (
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-terracotta">
            ★ Recommended
          </span>
        ) : null}
        <AvailabilityChip availability={availability} />
      </div>

      <div className="mt-4">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[0.9rem] leading-relaxed text-ink/85">{mode.description}</p>

            <p className="mt-4 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
              Best for
            </p>
            <p className="mt-1 text-[0.85rem] font-semibold text-ink">
              {mode.bestFor.join(' · ')}
            </p>

            <p className="mt-3 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
              Why choose it
            </p>
            <ul className="mt-1 space-y-0.5">
              {mode.whyChoose.map((w) => (
                <li key={w} className="text-[0.82rem] font-medium text-ink/85">
                  · {w}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[0.82rem] font-medium text-ink/80">
              <span className="font-bold text-ink">Tradeoff — </span>
              {mode.tradeoff}
            </p>
          </div>

          <ModeJourneyCard
            mode={mode}
            airportSelected={airportSelected}
            destinationSelected={destinationSelected}
            direction={direction}
          />
        </div>

        <p className="mt-3 text-[0.75rem] font-medium text-muted">{availability.note}</p>

        {unavailable ? (
          <div className="mt-4 rounded-[14px] bg-cream/80 px-4 py-3 ring-1 ring-ink/8">
            <p className="text-[0.85rem] font-bold text-ink">
              🔴 Not available for your selected time / route
            </p>
            <p className="mt-1 text-[0.8rem] font-medium text-ink/80">{availability.note}</p>
            {alts.length ? (
              <>
                <p className="mt-3 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                  Better fits right now
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {alts.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onJump(m.id)}
                      className="rounded-full bg-paper px-3 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/8 hover:text-terracotta"
                    >
                      {m.symbol} {m.shortLabel}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <>
            {suitability < 60 ? (
              <p className="mt-2 text-[0.78rem] font-medium text-ink/75">
                Available, but a weaker fit for your current profile.
              </p>
            ) : null}

            <h4 className="mt-5 font-serif text-[1.05rem] font-semibold text-ink">
              Available options
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {options.map((o) => {
                return (
                  <article
                    key={o.id}
                    className="overflow-hidden rounded-[14px] bg-cream/50 ring-1 ring-ink/6"
                  >
                    <button type="button" className="w-full text-left" onClick={onSelectMode}>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={o.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-ink/55 px-2 py-0.5 text-[0.55rem] font-bold text-paper">
                          ⭐ {o.rating.toFixed(1)}
                        </span>
                      </div>
                    </button>
                    <div className="p-2.5">
                      <h5 className="text-[0.72rem] font-bold uppercase tracking-[0.04em] text-ink">
                        {mode.symbol} {o.name}
                      </h5>
                      <p className="mt-1 text-[0.88rem] font-bold text-terracotta">{o.priceLabel}</p>
                      <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[0.66rem] font-semibold text-ink/80">
                        <span>🚗 {o.vehicle}</span>
                        <span>👥 {o.capacity}</span>
                        <span>🧳 {o.luggage}</span>
                        <span>📍 {o.pickupStyle}</span>
                        <span className="col-span-2">♿ {o.accessibility}</span>
                      </div>
                      <p className="mt-1.5 text-[0.65rem] font-semibold text-ink/70">
                        {availability.status === 'available' ? '🟢' : '🟡'} {availability.label}
                      </p>
                      <a
                        href={bookingUrlForOption(o)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex rounded-full bg-terracotta px-2.5 py-1 text-[0.66rem] font-bold text-paper"
                      >
                        See Booking Options →
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
            {totalOptions > 3 ? (
              <button
                type="button"
                onClick={onToggleAll}
                className="mt-4 w-full rounded-[14px] bg-terracotta px-5 py-3.5 text-center text-[0.95rem] font-bold text-paper shadow-sm transition hover:bg-terracotta/90 sm:w-auto sm:min-w-[16rem]"
              >
                {showingAll ? 'Show top 3' : `See All Options (${totalOptions})`}
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

function modeStructureHint(modeId: TransportModeId): string {
  if (modeId === 'private-transfer') return 'Direct · Dedicated'
  if (modeId === 'car-taxi') return 'Direct'
  if (modeId === 'public-bus') return 'Fixed route · final connection may be required'
  if (modeId === 'shared-transfer') return 'Shared · possible additional stops'
  return 'Self-drive / dedicated driver'
}

function stepRole(index: number, total: number): 'start' | 'transport' | 'via' | 'end' {
  if (index === 0) return 'start'
  if (index === total - 1) return 'end'
  if (total === 3 && index === 1) return 'transport'
  if (index === 1) return 'transport'
  return 'via'
}

function stepOverline(role: ReturnType<typeof stepRole>): string {
  if (role === 'start') return 'Start'
  if (role === 'end') return 'Destination'
  if (role === 'transport') return 'Transport'
  return 'Then'
}

function stepContext(
  role: ReturnType<typeof stepRole>,
  step: { icon: string; label: string },
  mode: TransportMode,
): string {
  if (role === 'transport') return modeStructureHint(mode.id)
  if (role === 'via') {
    if (step.label.toLowerCase().includes('connection')) return 'May be required'
    if (step.label.toLowerCase().includes('stop')) return 'Fixed stop'
    if (step.label.toLowerCase().includes('route')) return 'Flexible routing'
    return 'En route'
  }
  if (role === 'start') {
    if (step.icon === '✈️' || /airport|noi bai|tan son|da nang|phu quoc|cam ranh/i.test(step.label)) {
      return 'Airport'
    }
    return 'Pickup area'
  }
  if (step.icon === '✈️' || /airport|noi bai|tan son|da nang|phu quoc|cam ranh/i.test(step.label)) {
    return 'Airport'
  }
  return 'Drop-off'
}

function ModeJourneyCard({
  mode,
  airportSelected,
  destinationSelected,
  direction,
}: {
  mode: TransportMode
  airportSelected: boolean
  destinationSelected: boolean
  direction: 'inbound' | 'outbound'
}) {
  const steps = mode.journey
  const routeComplete = airportSelected && destinationSelected
  const startIsAirport = direction === 'inbound'
  const endIsAirport = direction === 'outbound'

  function endpointLabel(isAirportEnd: boolean, fallback: string): string {
    if (isAirportEnd) {
      return airportSelected ? fallback : 'No airport selected'
    }
    return destinationSelected ? fallback : 'No destination selected'
  }

  function endpointContext(isAirportEnd: boolean, role: 'start' | 'end'): string {
    if (isAirportEnd) {
      if (!airportSelected) return 'Select an airport above'
      return role === 'start' ? 'Airport' : 'Airport'
    }
    if (!destinationSelected) return 'Select a destination above'
    return role === 'start' ? 'Pickup area' : 'Drop-off'
  }

  const displaySteps = steps.map((step, i) => {
    const role = stepRole(i, steps.length)
    if (role === 'start') {
      const isAirport = startIsAirport
      return {
        ...step,
        icon: !routeComplete
          ? isAirport
            ? airportSelected
              ? step.icon
              : '✈️'
            : destinationSelected
              ? step.icon
              : '📍'
          : step.icon,
        label: endpointLabel(isAirport, step.label),
        contextOverride: endpointContext(isAirport, 'start'),
        missing: isAirport ? !airportSelected : !destinationSelected,
      }
    }
    if (role === 'end') {
      const isAirport = endIsAirport
      return {
        ...step,
        icon: !routeComplete
          ? isAirport
            ? airportSelected
              ? step.icon
              : '✈️'
            : destinationSelected
              ? step.icon
              : '📍'
          : step.icon,
        label: endpointLabel(isAirport, step.label),
        contextOverride: endpointContext(isAirport, 'end'),
        missing: isAirport ? !airportSelected : !destinationSelected,
      }
    }
    return {
      ...step,
      contextOverride: null as string | null,
      missing: false,
    }
  })

  const origin = displaySteps[0]?.label ?? 'Origin'
  const destination = displaySteps[displaySteps.length - 1]?.label ?? 'Destination'
  const operating = mode.operatingWindow.replace(/^Typically\s+/i, '')

  function scrollToRoute() {
    document.getElementById('route-selector')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="rounded-[16px] bg-cream/60 px-4 py-3.5 ring-1 ring-ink/6">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
        Your journey
      </p>
      <p className="mt-1.5 font-serif text-[0.95rem] font-semibold leading-snug text-ink">
        {origin}
        <span className="mx-1.5 font-sans text-[0.78rem] font-bold text-terracotta" aria-hidden>
          →
        </span>
        {destination}
      </p>

      <ol className="mt-4">
        {displaySteps.map((step, i) => {
          const role = stepRole(i, steps.length)
          const isTransport = role === 'transport'
          const isEnd = role === 'end'
          const context =
            step.contextOverride ?? stepContext(role, step, mode)
          const isLast = i === displaySteps.length - 1

          return (
            <li key={`${step.icon}-${step.label}-${i}`} className="relative flex gap-3">
              {!isLast ? (
                <span
                  className="absolute left-[13px] top-7 bottom-0 w-[2px] bg-terracotta/55"
                  aria-hidden
                />
              ) : null}

              <div className="relative z-[1] flex w-7 shrink-0 flex-col items-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.85rem] ${
                    step.missing
                      ? 'bg-paper ring-1 ring-dashed ring-ink/25'
                      : isTransport
                        ? 'bg-terracotta/15 ring-2 ring-terracotta/35'
                        : isEnd
                          ? 'bg-sage/20 ring-2 ring-sage/40'
                          : 'bg-paper ring-1 ring-ink/12'
                  }`}
                  aria-hidden
                >
                  {step.icon}
                </span>
                {!isLast ? (
                  <span
                    className="absolute -bottom-1 left-1/2 z-[1] h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-terracotta"
                    aria-hidden
                  />
                ) : null}
              </div>

              <div className={`min-w-0 flex-1 ${isLast ? 'pb-0.5' : 'pb-5'}`}>
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
                  {stepOverline(role)}
                </p>
                <p
                  className={`mt-0.5 text-[0.88rem] font-bold leading-snug ${
                    step.missing ? 'text-muted' : 'text-ink'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`mt-0.5 text-[0.7rem] font-medium leading-snug ${
                    isTransport ? 'font-semibold text-terracotta/90' : 'text-muted'
                  }`}
                >
                  {context}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      {!airportSelected || !destinationSelected ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink/8 pt-3">
          {!airportSelected ? (
            <button
              type="button"
              onClick={scrollToRoute}
              className="rounded-full bg-terracotta px-3 py-1.5 text-[0.7rem] font-bold text-paper"
            >
              Select airport →
            </button>
          ) : null}
          {!destinationSelected ? (
            <button
              type="button"
              onClick={scrollToRoute}
              className="rounded-full bg-paper px-3 py-1.5 text-[0.7rem] font-bold text-ink ring-1 ring-ink/10"
            >
              Select destination →
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 space-y-1 border-t border-ink/8 pt-3 text-[0.75rem] font-semibold text-ink/80">
        <p>
          ⏱ {formatTimeRange(mode.timeMin)}
          <span className="mx-1.5 text-ink/25">·</span>
          💰 {formatCostWithBasis(mode)}
        </p>
        <p>
          🕐 {operating}
          <span className="mx-1.5 text-ink/25">·</span>
          ♿ {mode.accessibilityLevel}
        </p>
      </div>
    </div>
  )
}

function AvailabilityChip({ availability }: { availability: AvailabilityResult }) {
  const color =
    availability.status === 'available'
      ? 'text-sage'
      : availability.status === 'limited'
        ? 'text-terracotta'
        : availability.status === 'unavailable'
          ? 'text-ink/45'
          : 'text-muted'
  const dot =
    availability.status === 'available'
      ? '🟢'
      : availability.status === 'limited'
        ? '🟡'
        : availability.status === 'unavailable'
          ? '🔴'
          : '⚪'
  return (
    <span className={`text-[0.65rem] font-bold uppercase tracking-[0.08em] ${color}`}>
      {dot} {availability.label}
    </span>
  )
}
