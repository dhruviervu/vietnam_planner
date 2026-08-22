import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Marker = {
  id: string
  label: string
  kind: 'activity' | 'stay' | 'food' | 'shop' | 'route'
  region: string
}

type Props = {
  title?: string
  markers: Marker[]
  routeLabels?: string[]
  defaultOpen?: boolean
}

export function TripMap({
  title = 'View your trip on the map',
  markers,
  routeLabels = [],
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-[24px] border border-ink/8 bg-paper shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <p className="font-serif text-[1.15rem] font-semibold text-ink">{title}</p>
          <p className="text-[0.85rem] text-muted">
            {markers.length} places · map placeholder ready for real tiles later
          </p>
        </div>
        <span className="text-muted">{open ? '▴' : '▾'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="relative mx-4 mb-4 min-h-[260px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#d9e5d4] via-[#f0e4d2] to-[#e8d5c4]">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(58,50,44,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(58,50,44,0.08) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div className="relative z-10 flex h-full flex-col justify-between p-5">
                <div className="flex flex-wrap gap-2">
                  {markers.slice(0, 10).map((m, i) => (
                    <motion.span
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`rounded-full px-3 py-1.5 text-[0.75rem] font-bold shadow-soft ${
                        m.kind === 'stay'
                          ? 'bg-terracotta text-paper'
                          : m.kind === 'food'
                            ? 'bg-sage text-paper'
                            : 'bg-paper text-ink'
                      }`}
                    >
                      {m.kind === 'stay' ? '🏨' : m.kind === 'food' ? '🍜' : '📍'} {m.label}
                    </motion.span>
                  ))}
                </div>

                {routeLabels.length > 0 && (
                  <div className="mt-6 rounded-2xl bg-paper/85 p-4 backdrop-blur-sm">
                    <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-wide text-muted">
                      Route spine
                    </p>
                    <p className="font-serif text-[1.05rem] font-semibold text-ink">
                      {routeLabels.join(' → ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
