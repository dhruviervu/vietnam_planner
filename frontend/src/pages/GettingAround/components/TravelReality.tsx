import type { TransportMode } from '../data/types'

/** Editorial Travel Reality — not the Airport Transfers journey card. */
export function TravelReality({ mode }: { mode: TransportMode }) {
  const friction =
    mode.id === 'flight'
      ? ['Airport arrival', 'Security & boarding', 'Flight', 'Baggage', 'City transfer']
      : mode.id === 'train'
        ? ['Station arrival', 'Boarding', 'Rail journey', 'Arrival station', 'City connection']
        : mode.id === 'coach'
          ? ['Terminal', 'Boarding', 'Coach journey', 'Arrival area', 'Final hop']
          : mode.journey.map((s) => s.label)

  return (
    <div className="relative overflow-hidden rounded-[18px] bg-ink px-4 py-4 text-paper sm:px-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(196,92,62,0.35), transparent 55%)',
        }}
      />
      <p className="relative text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
        Travel Reality
      </p>
      <div className="relative mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-paper/55">
            Headline
          </p>
          <p className="mt-1 font-serif text-[1.35rem] font-semibold leading-tight">
            {mode.vehicleTimeLabel}
          </p>
          <p className="mt-1 text-[0.72rem] font-medium text-paper/65">Vehicle / segment time</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-terracotta">
            Door-to-door
          </p>
          <p className="mt-1 font-serif text-[1.35rem] font-semibold leading-tight text-terracotta">
            {mode.doorToDoorLabel}
          </p>
          <p className="mt-1 text-[0.72rem] font-medium text-paper/65">
            Transfers · {mode.transfers} · TYPICAL
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-paper/15 pt-3">
        {friction.map((step, i) => (
          <span key={step} className="flex items-center gap-1 text-[0.72rem] font-semibold text-paper/85">
            {i > 0 ? <span className="mx-0.5 text-terracotta" aria-hidden>→</span> : null}
            {step}
          </span>
        ))}
      </div>

      {mode.journey.length >= 3 ? (
        <ol className="relative mt-4 space-y-1.5 border-t border-paper/15 pt-3">
          {mode.journey.map((step) => (
            <li key={step.label} className="flex items-center gap-2 text-[0.8rem] font-bold text-paper">
              <span aria-hidden>{step.icon}</span>
              {step.label}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

const NO_REALITY = new Set(['walking', 'bicycle', 'scooter'])

export function shouldShowTravelReality(modeId: string) {
  return !NO_REALITY.has(modeId)
}
