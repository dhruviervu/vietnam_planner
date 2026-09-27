import type { ShoppingItem } from '../data/types'
import { ItemSlideshow } from './ItemSlideshow'

type Props = {
  item: ShoppingItem
  selected: boolean
  onShowShops: () => void
}

export function ItemCard({ item, selected, onShowShops }: Props) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 transition ${
        selected ? 'ring-terracotta/40 shadow-card' : 'ring-ink/6'
      }`}
    >
      <ItemSlideshow
        images={item.images}
        alt={item.name}
        className="aspect-[16/10] w-full shrink-0"
      />

      <div className="flex flex-1 flex-col px-3.5 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-wide text-ink/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mt-2 font-serif text-[clamp(1.05rem,1.8vw,1.35rem)] font-semibold leading-tight text-ink">
          {item.name}
        </h3>
        <p className="mt-1 text-[0.62rem] font-semibold text-ink/65">{item.typicalCostFrom}</p>

        <p className="mt-3 line-clamp-4 text-[0.82rem] font-medium leading-relaxed text-ink/85">
          {item.description}
        </p>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={onShowShops}
            className="rounded-full bg-terracotta px-3.5 py-1.5 text-[0.74rem] font-bold text-paper transition hover:-translate-y-0.5"
          >
            See shops & markets →
          </button>
        </div>
      </div>
    </article>
  )
}
