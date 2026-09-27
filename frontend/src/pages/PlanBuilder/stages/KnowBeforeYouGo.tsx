import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LOGISTICS_CARDS } from '../data/logistics'
import { StageFooter } from '../components/StageFooter'
import { useTripStore } from '../../../store/tripStore'

export function KnowBeforeYouGo() {
  const acknowledged = useTripStore((s) => s.logisticsAcknowledged)
  const toggle = useTripStore((s) => s.toggleLogistics)
  const mark = useTripStore((s) => s.markStepVisited)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    mark('know-before')
  }, [mark])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
        Know before you go
      </h1>
      <p className="mb-8 max-w-[48ch] text-muted">
        Essential logistics — short, visual, and expandable. Nothing here locks your itinerary.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {LOGISTICS_CARDS.map((card) => {
          const open = openId === card.id
          const checked = acknowledged.includes(card.id)
          return (
            <article key={card.id} className="rounded-[24px] bg-paper p-5 shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl" aria-hidden="true">
                    {card.icon}
                  </p>
                  <h2 className="mt-2 font-serif text-[1.35rem] font-semibold text-ink">
                    {card.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(card.id)}
                  className={`rounded-full px-3 py-1 text-[0.72rem] font-bold ${
                    checked ? 'bg-sage text-paper' : 'bg-cream text-muted'
                  }`}
                >
                  {checked ? 'Noted' : 'Mark read'}
                </button>
              </div>
              <p className="text-[0.95rem] text-muted">{card.summary}</p>
              <div className="mt-4 grid gap-2">
                {card.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-center justify-between rounded-2xl bg-cream px-3 py-2"
                  >
                    <span className="text-[0.75rem] font-bold uppercase tracking-wide text-muted">
                      {fact.label}
                    </span>
                    <span className="text-[0.9rem] font-semibold text-ink">{fact.value}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : card.id)}
                className="mt-4 text-[0.85rem] font-bold text-terracotta"
              >
                {open ? 'Show less' : 'Know more'}
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-[0.92rem] text-ink/85">{card.detail}</p>
                    {card.linkHref && (
                      <a
                        href={card.linkHref}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-[0.85rem] font-semibold text-sage underline underline-offset-2"
                      >
                        {card.linkLabel ?? 'Learn more'}
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          )
        })}
      </div>

      <StageFooter current="know-before" continueLabel="Review My Trip" />
    </motion.div>
  )
}
