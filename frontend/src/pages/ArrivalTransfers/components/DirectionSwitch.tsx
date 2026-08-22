import type { TransferDirection } from '../data/types'

type Props = {
  direction: TransferDirection
  onChange: (d: TransferDirection) => void
}

export function DirectionSwitch({ direction, onChange }: Props) {
  return (
    <section>
      <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
        How are you travelling?
      </h2>
      <div
        role="tablist"
        className="mt-2.5 inline-flex max-w-full flex-wrap rounded-full bg-cream p-1 ring-1 ring-ink/8"
      >
        <button
          type="button"
          role="tab"
          aria-selected={direction === 'inbound'}
          onClick={() => onChange('inbound')}
          className={`rounded-full px-4 py-2.5 text-[0.8rem] font-bold transition sm:px-5 ${
            direction === 'inbound'
              ? 'bg-terracotta text-paper shadow-soft'
              : 'text-ink/75 hover:text-ink'
          }`}
        >
          ✈️ Airport → City
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={direction === 'outbound'}
          onClick={() => onChange('outbound')}
          className={`rounded-full px-4 py-2.5 text-[0.8rem] font-bold transition sm:px-5 ${
            direction === 'outbound'
              ? 'bg-terracotta text-paper shadow-soft'
              : 'text-ink/75 hover:text-ink'
          }`}
        >
          🏙️ City → Airport
        </button>
      </div>
    </section>
  )
}
