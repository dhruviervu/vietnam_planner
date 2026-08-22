import { motion } from 'framer-motion'
import type { Hotel } from '../types'
import { hotelImages } from '../data/hotels'

type Props = {
  hotel: Hotel
  tripFit?: number
  stayNights?: number
  estimatedTotal?: number | null
  onRemove: (id: string) => void
}

export function StayBagItem({
  hotel,
  tripFit,
  stayNights,
  estimatedTotal,
  onRemove,
}: Props) {
  const thumb = hotelImages(hotel)[0]

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      className="overflow-hidden"
    >
      <div className="flex gap-3 rounded-2xl bg-cream/90 p-2.5">
        <div className="shrink-0 overflow-hidden rounded-xl">
          <img src={thumb} alt="" className="h-14 w-16 object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9rem] font-semibold text-ink">{hotel.name}</p>
          <p className="mt-0.5 text-[0.72rem] text-muted">
            {hotel.neighborhood || hotel.city} · {hotel.city}
          </p>
          <p className="mt-0.5 text-[0.75rem] font-semibold text-ink">
            From ${hotel.pricePerNight}/night
            {estimatedTotal != null && stayNights
              ? ` · $${estimatedTotal} / ${stayNights} nts`
              : ''}
          </p>
          {tripFit != null && (
            <p className="text-[0.72rem] font-bold text-sage">{tripFit}% trip fit</p>
          )}
        </div>
        <button
          type="button"
          aria-label={`Remove ${hotel.name}`}
          onClick={() => onRemove(hotel.id)}
          className="shrink-0 self-start rounded-full px-2 py-1 text-[0.75rem] text-muted hover:bg-paper hover:text-ink"
        >
          Remove
        </button>
      </div>
    </motion.li>
  )
}
