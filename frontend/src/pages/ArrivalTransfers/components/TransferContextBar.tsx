import { useEffect, useId, useRef, useState } from 'react'
import type { ArrivalContext, TimeBucket, TransferBudget } from '../data/types'

type Props = {
  passengers: number
  bags: number
  arrivalTime: TimeBucket
  budget: TransferBudget
  onPassengers: (n: number) => void
  onBags: (n: number) => void
  onArrivalTime: (t: TimeBucket) => void
  onBudget: (b: TransferBudget) => void
}

const PEOPLE = [1, 2, 3, 4, 5, 6] as const
const BAGS = [0, 1, 2, 3, 4, 5] as const
const TIMES: { id: TimeBucket; label: string }[] = [
  { id: 'not-set', label: 'Typical' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'late', label: 'Late night' },
]
const BUDGETS: { id: TransferBudget; label: string }[] = [
  { id: 'saver', label: 'Saver' },
  { id: 'typical', label: 'Typical' },
  { id: 'comfort', label: 'Comfort' },
]

export function bagsToLuggage(bags: number): ArrivalContext['luggageLevel'] {
  if (bags <= 1) return 'light'
  if (bags === 2) return 'medium'
  return 'heavy'
}

export function TransferContextBar({
  passengers,
  bags,
  arrivalTime,
  budget,
  onPassengers,
  onBags,
  onArrivalTime,
  onBudget,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      <Drop
        label="People"
        value={passengers === 6 ? '6+' : String(passengers)}
        options={PEOPLE.map((n) => ({ id: String(n), label: n === 6 ? '6+' : String(n) }))}
        onSelect={(id) => onPassengers(Number(id))}
      />
      <Drop
        label="Bags"
        value={bags === 5 ? '5+' : String(bags)}
        options={BAGS.map((n) => ({ id: String(n), label: n === 5 ? '5+' : String(n) }))}
        onSelect={(id) => onBags(Number(id))}
      />
      <Drop
        label="Time"
        value={TIMES.find((t) => t.id === arrivalTime)?.label ?? 'Typical'}
        options={TIMES.map((t) => ({ id: t.id, label: t.label }))}
        onSelect={(id) => onArrivalTime(id as TimeBucket)}
      />
      <Drop
        label="Budget"
        value={BUDGETS.find((t) => t.id === budget)?.label ?? 'Typical'}
        options={BUDGETS.map((t) => ({ id: t.id, label: t.label }))}
        onSelect={(id) => onBudget(id as TransferBudget)}
      />
    </div>
  )
}

function Drop({
  label,
  value,
  options,
  onSelect,
}: {
  label: string
  value: string
  options: { id: string; label: string }[]
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnId = useId()

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        id={btnId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-1.5 rounded-[12px] px-2.5 py-1.5 text-left ring-1 transition ${
          open ? 'bg-terracotta/10 ring-2 ring-terracotta' : 'bg-paper ring-ink/10 hover:ring-ink/16'
        }`}
      >
        <span className="min-w-0">
          <span className="block text-[0.54rem] font-bold uppercase tracking-[0.12em] text-muted">
            {label}
          </span>
          <span className="mt-0.5 block truncate font-serif text-[0.95rem] font-semibold leading-tight text-ink">
            {value}
          </span>
        </span>
        <Chevron open={open} />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-labelledby={btnId}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-[12px] bg-paper shadow-soft ring-1 ring-ink/10"
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="option"
              aria-selected={opt.label === value}
              onClick={() => {
                onSelect(opt.id)
                setOpen(false)
              }}
              className={`flex w-full px-2.5 py-1.5 text-left text-[0.82rem] font-semibold hover:bg-cream/80 ${
                opt.label === value ? 'bg-terracotta/10 text-terracotta' : 'text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function Chevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={`h-4 w-4 shrink-0 text-ink/70 transition ${open ? 'rotate-180 text-terracotta' : ''}`}
    >
      <path
        d="M4.5 7.25L10 12.75L15.5 7.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
