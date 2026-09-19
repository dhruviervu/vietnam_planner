import type { ShoppingItem } from '../data/types'
import { ItemCard } from './ItemCard'

type Props = {
  items: ShoppingItem[]
  selectedItemId: string
  onShowShops: (id: string) => void
}

export function ItemDiscovery({ items, selectedItemId, onShowShops }: Props) {
  return (
    <section id="what-to-buy" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Special Vietnamese Items
      </h2>
      <p className="mt-1 max-w-[52ch] text-[0.88rem] text-muted">
        The story behind each piece, then the shops and markets that sell it.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            selected={item.id === selectedItemId}
            onShowShops={() => onShowShops(item.id)}
          />
        ))}
      </div>
    </section>
  )
}
