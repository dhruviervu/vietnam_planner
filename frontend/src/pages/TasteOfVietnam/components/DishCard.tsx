import type { Dish } from '../data/types'
import { DishSlideshow } from './DishSlideshow'

type Props = {
  dish: Dish
  selected: boolean
  onSeeRecipe: () => void
  onShowRestaurants: () => void
}

export function DishCard({ dish, selected, onSeeRecipe, onShowRestaurants }: Props) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[18px] bg-paper shadow-soft ring-1 transition ${
        selected ? 'ring-terracotta/40 shadow-card' : 'ring-ink/6'
      }`}
    >
      <DishSlideshow
        images={dish.images}
        alt={dish.name}
        className="aspect-[16/10] w-full"
      />

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex flex-wrap gap-1">
          {dish.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mt-2 font-serif text-[1.2rem] font-semibold leading-tight text-ink">
          {dish.name}
        </h3>
        <p className="mt-1.5 text-[0.8rem] font-medium leading-snug text-ink/80">
          {dish.description}
        </p>

        <p className="mt-2 text-[0.68rem] font-semibold text-ink/70">
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
            Contains ·{' '}
          </span>
          {dish.proteins.join(' · ')}
        </p>

        <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-terracotta">
          {dish.specialityReason}
        </p>

        <div className="mt-auto flex flex-col gap-1.5 pt-3 sm:flex-row">
          <button
            type="button"
            onClick={onSeeRecipe}
            className="flex-1 rounded-full border border-sage/50 bg-transparent px-3 py-2 text-[0.78rem] font-bold text-ink transition hover:-translate-y-0.5 hover:border-sage"
          >
            See Recipe →
          </button>
          <button
            type="button"
            onClick={onShowRestaurants}
            className="flex-1 rounded-full bg-terracotta px-3 py-2 text-[0.78rem] font-bold text-paper transition hover:-translate-y-0.5"
          >
            Show Me Restaurants →
          </button>
        </div>
      </div>
    </article>
  )
}
