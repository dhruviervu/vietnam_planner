import type { ShoppingItem } from '../data/types'
import { getItemPracticalTags } from '../data/items'
import { ItemSlideshow } from './ItemSlideshow'

type Props = {
  item: ShoppingItem
  selected: boolean
  onSeeMore: () => void
  onShowShops: () => void
}

export function ItemCard({ item, selected, onSeeMore, onShowShops }: Props) {
  const practical = getItemPracticalTags(item).slice(0, 4)

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[18px] bg-paper shadow-soft ring-1 transition ${
        selected ? 'ring-terracotta/40 shadow-card' : 'ring-ink/6'
      }`}
    >
      <ItemSlideshow images={item.images} alt={item.name} className="aspect-[16/10] w-full" />

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mt-2 font-serif text-[1.15rem] font-semibold leading-tight text-ink">
          {item.name}
        </h3>
        <p className="mt-1.5 text-[0.8rem] font-medium leading-snug text-ink/80">
          {item.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          {practical.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2 py-0.5 text-[0.58rem] font-bold ${
                tag === 'Fragile' || tag === 'Bulky' || tag === 'Perishable' || tag === 'Needs Care'
                  ? 'bg-terracotta/10 text-terracotta'
                  : 'bg-sage/15 text-ink/75'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-terracotta">
          {item.specialityReason}
        </p>

        <div className="mt-auto flex flex-col gap-1.5 pt-3 sm:flex-row">
          <button
            type="button"
            onClick={onSeeMore}
            className="flex-1 rounded-full border border-sage/50 bg-transparent px-3 py-2 text-[0.78rem] font-bold text-ink transition hover:-translate-y-0.5 hover:border-sage"
          >
            See More on Item →
          </button>
          <button
            type="button"
            onClick={onShowShops}
            className="flex-1 rounded-full bg-terracotta px-3 py-2 text-[0.78rem] font-bold text-paper transition hover:-translate-y-0.5"
          >
            Show Me Shops →
          </button>
        </div>
      </div>
    </article>
  )
}
