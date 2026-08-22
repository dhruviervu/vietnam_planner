import type { Dish } from '../data/types'
import { DishCard } from './DishCard'

type Props = {
  dishes: Dish[]
  selectedDishId: string
  onSeeRecipe: (dishId: string) => void
  onShowRestaurants: (dishId: string) => void
}

export function DishDiscovery({
  dishes,
  selectedDishId,
  onSeeRecipe,
  onShowRestaurants,
}: Props) {
  return (
    <section>
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        What You Have To Try
      </h2>
      <p className="mt-1 max-w-[48ch] text-[0.88rem] text-muted">
        A few dishes that define Vietnam — and the places where each one shines.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            selected={dish.id === selectedDishId}
            onSeeRecipe={() => onSeeRecipe(dish.id)}
            onShowRestaurants={() => onShowRestaurants(dish.id)}
          />
        ))}
      </div>
    </section>
  )
}
