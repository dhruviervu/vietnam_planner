import type { TimeOfDay } from '../../types'

const OPTIONS: { id: TimeOfDay; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
]

type Props = {
  value: TimeOfDay
  onChange: (t: TimeOfDay) => void
}

export function ExperienceTimeSelector({ value, onChange }: Props) {
  const idx = OPTIONS.findIndex((o) => o.id === value)

  return (
    <div>
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-sage">
        When are you thinking of going?
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition-colors ${
              value === opt.id ? 'bg-ink text-paper' : 'bg-cream text-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={idx}
        onChange={(e) => onChange(OPTIONS[Number(e.target.value)].id)}
        className="mt-3 w-full accent-terracotta"
        aria-label="Time of day"
      />
    </div>
  )
}
