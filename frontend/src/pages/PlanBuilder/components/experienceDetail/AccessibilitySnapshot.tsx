import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Experience } from '../../types'

type Props = {
  detail: Experience['accessibilityDetail']
}

export function AccessibilitySnapshot({ detail }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Cell label="Wheelchair access" value={detail.wheelchair} />
        <Cell label="Walking intensity" value={detail.walking} />
        <Cell label="Steps" value={detail.steps} />
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 text-[0.72rem] font-bold text-terracotta hover:underline"
      >
        {open ? 'Hide accessibility details' : 'Accessibility details →'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 overflow-hidden text-[0.82rem] leading-relaxed text-muted"
          >
            Wheelchair access is {detail.wheelchair.toLowerCase()}. Walking intensity is{' '}
            {detail.walking.toLowerCase()}. Expect: {detail.steps}. Check local conditions on the day
            of your visit.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream px-2.5 py-2">
      <p className="text-[0.6rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.8rem] font-semibold text-ink">{value}</p>
    </div>
  )
}
