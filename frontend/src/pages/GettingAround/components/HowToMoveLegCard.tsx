import type { PlaceId } from '../data/types'

export type HowToMoveLeg = {
  from: string
  to: string
  fromId: PlaceId
  toId: PlaceId
  title: string
  note: string
  symbol: string
}

type Props = HowToMoveLeg & {
  step: number
}

export function HowToMoveLegCard({ step, from, to, title, note, symbol }: Props) {
  return (
    <li className="group relative overflow-hidden rounded-[16px] bg-gradient-to-br from-cream/95 via-paper to-sage/10 ring-1 ring-ink/10 transition hover:ring-terracotta/35">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-terracotta/90 via-terracotta/50 to-transparent" />
      <div className="flex gap-4 px-4 py-4 pl-5 sm:gap-5">
        <div className="flex w-10 shrink-0 flex-col items-center pt-0.5">
          <span
            className="font-serif text-[1.65rem] font-semibold leading-none text-terracotta/35"
            aria-hidden
          >
            {String(step).padStart(2, '0')}
          </span>
          <span className="mt-2.5 text-[1.4rem] leading-none" aria-hidden>
            {symbol}
          </span>
        </div>
        <div className="min-w-0 flex-1 border-l border-ink/6 pl-4 sm:pl-5">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.16em] text-muted">
            Leg {step}
          </p>
          <h4 className="mt-1 font-serif text-[clamp(1rem,2.2vw,1.12rem)] font-semibold leading-snug text-ink">
            {from}
            <span className="mx-1.5 font-normal text-terracotta/75">→</span>
            {to}
          </h4>
          <p className="mt-2 text-[0.86rem] font-medium leading-relaxed text-ink/90">{title}</p>
          {note ? (
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">{note}</p>
          ) : null}
        </div>
      </div>
    </li>
  )
}
