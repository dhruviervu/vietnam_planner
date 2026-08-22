import type { ShoppingItem } from '../data/types'
import { ItemCard } from './ItemCard'

type Props = {
  items: ShoppingItem[]
  selectedItemId: string
  onSeeMore: (id: string) => void
  onShowShops: (id: string) => void
}

export function ItemDiscovery({ items, selectedItemId, onSeeMore, onShowShops }: Props) {
  return (
    <section>
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Vietnam Essentials
      </h2>
      <p className="mt-1 max-w-[48ch] text-[0.88rem] text-muted">
        A curated collection of things that are genuinely worth taking home.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            selected={item.id === selectedItemId}
            onSeeMore={() => onSeeMore(item.id)}
            onShowShops={() => onShowShops(item.id)}
          />
        ))}
      </div>
    </section>
  )
}
