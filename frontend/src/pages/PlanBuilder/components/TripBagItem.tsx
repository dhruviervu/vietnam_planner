import { motion } from 'framer-motion'

type BagItem = {
  kind: 'experience' | 'activity'
  id: string
  name: string
  city: string
  durationLabel: string
  image: string
}

type Props = {
  item: BagItem
  onRemove: () => void
  onOpen: () => void
}

export function TripBagItem({ item, onRemove, onOpen }: Props) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      className="overflow-hidden"
    >
      <div className="flex gap-3 rounded-2xl bg-cream/90 p-2.5">
        <button
          type="button"
          onClick={onOpen}
          className="relative shrink-0 overflow-hidden rounded-xl"
        >
          <img src={item.image} alt="" className="h-14 w-16 object-cover" />
          {item.kind === 'activity' && (
            <span className="absolute bottom-0.5 left-0.5 rounded bg-terracotta/95 px-1 text-[0.55rem] font-bold uppercase text-paper">
              Act
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="w-full text-left">
            <p className="truncate text-[0.9rem] font-semibold text-ink">{item.name}</p>
            <p className="mt-0.5 text-[0.72rem] text-muted">
              📍 {item.city} · ⏱ {item.durationLabel}
              {item.kind === 'activity' ? ' · Activity' : ''}
            </p>
          </button>
        </div>
        <button
          type="button"
          aria-label={`Remove ${item.name}`}
          onClick={onRemove}
          className="shrink-0 self-start rounded-full px-2 py-1 text-[0.75rem] text-muted hover:bg-paper hover:text-ink"
        >
          ✕
        </button>
      </div>
    </motion.li>
  )
}
