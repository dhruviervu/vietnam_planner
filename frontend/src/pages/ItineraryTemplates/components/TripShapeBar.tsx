import { useEffect, useRef, useState } from 'react'
import { FOUR_PLUS_WEEKS_DAYS, isFourPlusWeeks, type TemplatePace, type TripShape } from '../data/types'

const PACE_CHIPS: { id: TemplatePace; title: string }[] = [
  { id: 'packed', title: 'Maximum experience' },
  { id: 'balanced', title: 'Mix' },
  { id: 'relaxed', title: 'Relaxed' },
]

type Props = {
  shape: TripShape
  onChange: (patch: Partial<TripShape>) => void
  onClear: () => void
}

function ShapeStepper({
  label,
  value,
  min,
  max,
  extra,
  onChange,
}: {
  label: string
  value: number | null
  min: number
  max: number
  extra?: { value: number; label: string }
  onChange: (next: number | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isExtra = extra != null && value === extra.value
  const display = value == null ? 'Any' : isExtra ? extra.label : String(value)
  const stepperValue = isExtra ? max : value ?? (label === 'Days' ? 7 : 2)

  function applyTyped(raw: string) {
    setTyped(raw)
    const n = Number.parseInt(raw, 10)
    if (!raw.trim() || Number.isNaN(n)) {
      if (!raw.trim()) onChange(null)
      return
    }
    if (extra && n >= extra.value) {
      onChange(extra.value)
      return
    }
    onChange(Math.min(max, Math.max(min, n)))
  }

  function bump(delta: number) {
    setTyped('')
    if (isExtra && delta < 0) {
      onChange(max)
      return
    }
    onChange(Math.min(max, Math.max(min, stepperValue + delta)))
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.72rem] font-bold transition ${
          value != null
            ? 'bg-ink text-paper'
            : 'bg-paper text-ink ring-1 ring-ink/10 hover:bg-cream'
        }`}
      >
        <span className="text-[0.58rem] font-bold uppercase tracking-[0.1em] opacity-70">{label}</span>
        <span className="tabular-nums">{display}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
          className="absolute left-0 top-[calc(100%+0.4rem)] z-30 w-[13.5rem] rounded-[14px] bg-paper p-3 shadow-soft ring-1 ring-ink/10"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={`Decrease ${label.toLowerCase()}`}
              onClick={() => bump(-1)}
              className="grid h-8 w-8 place-items-center rounded-full bg-cream text-[1.05rem] font-bold text-ink hover:bg-cream/80"
            >
              −
            </button>
            <p className="min-w-[3.5rem] text-center font-serif text-[1.35rem] font-semibold tabular-nums text-ink">
              {isExtra ? extra.label : stepperValue}
            </p>
            <button
              type="button"
              aria-label={`Increase ${label.toLowerCase()}`}
              onClick={() => bump(1)}
              className="grid h-8 w-8 place-items-center rounded-full bg-cream text-[1.05rem] font-bold text-ink hover:bg-cream/80"
            >
              +
            </button>
          </div>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={typed}
            placeholder="Type a number"
            aria-label={`Type ${label.toLowerCase()}`}
            onChange={(e) => applyTyped(e.target.value.replace(/[^\d]/g, ''))}
            className="mt-2 h-8 w-full rounded-md bg-cream px-2 text-center text-[0.78rem] font-semibold text-ink outline-none ring-1 ring-ink/8 placeholder:text-muted/70 focus:ring-terracotta/40"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {extra ? (
              <button
                type="button"
                aria-pressed={isExtra}
                onClick={() => {
                  setTyped('')
                  onChange(isExtra ? null : extra.value)
                }}
                className={`rounded-full px-2.5 py-1 text-[0.62rem] font-bold ${
                  isExtra ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream/80'
                }`}
              >
                {extra.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setTyped('')
                onChange(null)
              }}
              className="rounded-full px-2.5 py-1 text-[0.62rem] font-bold text-muted hover:text-terracotta"
            >
              Any
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function TripShapeBar({ shape, onChange, onClear }: Props) {
  const set = shape.days != null || shape.people != null || shape.pace != null

  return (
    <section className="rounded-[16px] bg-cream/70 px-3 py-2.5 shadow-soft ring-1 ring-ink/6 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-serif text-[1.02rem] font-semibold text-ink">Shape this trip</h2>
        <ShapeStepper
          label="Days"
          value={shape.days}
          min={1}
          max={28}
          extra={{ value: FOUR_PLUS_WEEKS_DAYS, label: '4+ wks' }}
          onChange={(days) => onChange({ days })}
        />
        <ShapeStepper
          label="People"
          value={shape.people}
          min={1}
          max={12}
          onChange={(people) => onChange({ people })}
        />
        <div className="flex flex-wrap gap-1">
          {PACE_CHIPS.map((chip) => {
            const active = shape.pace === chip.id
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ pace: active ? null : chip.id })}
                className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold transition ${
                  active ? 'bg-terracotta text-paper' : 'bg-paper text-ink ring-1 ring-ink/8 hover:bg-cream'
                }`}
              >
                {chip.title}
              </button>
            )
          })}
        </div>
        {set ? (
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-[0.72rem] font-bold text-muted transition hover:text-terracotta"
          >
            Clear
          </button>
        ) : null}
      </div>
      {isFourPlusWeeks(shape.days) ? (
        <p className="mt-1.5 text-[0.68rem] text-muted">4+ weeks — we plan a full month, not day 29, 30, …</p>
      ) : null}
    </section>
  )
}
