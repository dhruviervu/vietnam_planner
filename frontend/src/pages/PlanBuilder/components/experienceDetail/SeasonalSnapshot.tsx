import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Experience } from '../../types'

type Props = {
  experience: Experience
  activeMonth: number | null
}

export function SeasonalSnapshot({ experience, activeMonth }: Props) {
  const [open, setOpen] = useState(false)
  const primary =
    experience.seasonalNotes.find((n) => activeMonth != null && n.months.includes(activeMonth)) ??
    experience.seasonalNotes[0]

  const monthLabel =
    activeMonth != null
      ? new Date(2026, activeMonth - 1, 1).toLocaleString('en-US', { month: 'long' })
      : primary.label

  return (
    <div className="rounded-2xl bg-cream px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">Season</p>
          <p className="font-serif text-[1.15rem] font-semibold text-ink">{monthLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[0.72rem] font-bold text-terracotta hover:underline"
        >
          {open ? 'Hide details' : 'See seasonal details →'}
        </button>
      </div>
      <ul className="mt-2 space-y-1 text-[0.82rem] text-ink">
        <li>🌤 {primary.weather}</li>
        <li>👥 {primary.crowds} crowds</li>
        <li>📸 {primary.note}</li>
      </ul>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid gap-2 border-t border-ink/8 pt-3 sm:grid-cols-2">
              {experience.seasonalNotes.map((note) => (
                <div key={note.label} className="rounded-xl bg-paper px-3 py-2">
                  <p className="text-[0.78rem] font-bold text-ink">{note.label}</p>
                  <p className="mt-1 text-[0.75rem] text-muted">
                    {note.weather} · {note.crowds} · {note.note}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
