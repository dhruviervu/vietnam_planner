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
      className={`overflow-hidden rounded-[22px] bg-paper shadow-soft ring-1 transition ${
        selected ? 'ring-terracotta/40 shadow-card' : 'ring-ink/6'
      }`}
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <ItemSlideshow
          images={item.images}
          alt={item.name}
          className="aspect-[16/10] w-full md:aspect-auto md:min-h-[280px] md:h-full"
        />

        <div className="flex flex-col px-5 py-5 sm:px-6 sm:py-6">
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

          <h3 className="mt-2 font-serif text-[clamp(1.35rem,2.4vw,1.7rem)] font-semibold leading-tight text-ink">
            {item.name}
          </h3>
          <p className="mt-1 text-[0.66rem] font-semibold text-ink/65">{item.typicalCostFrom}</p>

          <div className="mt-4 flex flex-col gap-4">
            {item.storyParagraphs.map((para) => (
              <div key={para.title}>
                <h4 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
                  {para.title}
                </h4>
                <p className="mt-1.5 text-[0.86rem] font-medium leading-relaxed text-ink/85">
                  {para.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-5">
            <button
              type="button"
              onClick={onShowShops}
              className="rounded-full bg-terracotta px-4 py-2 text-[0.8rem] font-bold text-paper transition hover:-translate-y-0.5"
            >
              See shops & markets →
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
