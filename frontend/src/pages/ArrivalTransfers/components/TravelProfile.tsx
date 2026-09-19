import { useEffect, useRef, useState } from 'react'
import type { ArrivalContext } from '../data/types'

type Props = {
  passengers: number
  luggageLevel: ArrivalContext['luggageLevel']
  onPassengers: (n: number) => void
  onLuggage: (v: ArrivalContext['luggageLevel']) => void
}

export function TravelProfile({
  passengers,
  luggageLevel,
  onPassengers,
  onLuggage,
}: Props) {
  const [open, setOpen] = useState<'pax' | 'bags' | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <section ref={rootRef}>
      <h2 className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
        Your Travel Profile
      </h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip
          active={open === 'pax'}
          onClick={() => setOpen(open === 'pax' ? null : 'pax')}
          label={`Number of people : ${passengers === 6 ? '6+' : passengers}`}
        />
        <Chip
          active={open === 'bags'}
          onClick={() => setOpen(open === 'bags' ? null : 'bags')}
          label={`Luggage : ${cap(luggageLevel)}`}
        />
      </div>
      {open === 'pax' ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                onPassengers(n)
                setOpen(null)
              }}
              className={`h-8 w-8 rounded-full text-[0.78rem] font-bold ${
                passengers === n ? 'bg-terracotta text-paper' : 'bg-cream text-ink'
              }`}
            >
              {n === 6 ? '6+' : n}
            </button>
          ))}
        </div>
      ) : null}
      {open === 'bags' ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(['light', 'medium', 'heavy'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                onLuggage(v)
                setOpen(null)
              }}
              className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold capitalize ${
                luggageLevel === v ? 'bg-terracotta text-paper' : 'bg-cream text-ink'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[0.75rem] font-bold transition ${
        active ? 'bg-terracotta text-paper' : 'bg-cream text-ink ring-1 ring-ink/8'
      }`}
    >
      {label}
    </button>
  )
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
