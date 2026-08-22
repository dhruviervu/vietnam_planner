import { useMemo, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getFeaturedDishes, getDishById } from './data/dishes'
import { TasteHero } from './components/TasteHero'
import { DishDiscovery } from './components/DishDiscovery'
import { RecipeSection } from './components/RecipeSection'
import { RestaurantExplorer } from './components/RestaurantExplorer'

const RECIPE_ID = 'how-vietnam-makes-it'
const RESTAURANTS_ID = 'where-to-eat'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function TasteOfVietnamPage({ embedded = false }: { embedded?: boolean }) {
  const dishes = useMemo(() => getFeaturedDishes(), [])
  const [selectedDishId, setSelectedDishId] = useState(dishes[0]?.id ?? 'pho')

  const selectedDish = getDishById(selectedDishId) ?? dishes[0]

  function handleSeeRecipe(dishId: string) {
    setSelectedDishId(dishId)
    requestAnimationFrame(() => scrollToSection(RECIPE_ID))
  }

  function handleShowRestaurants(dishId: string) {
    setSelectedDishId(dishId)
    requestAnimationFrame(() => scrollToSection(RESTAURANTS_ID))
  }

  if (!selectedDish) return null

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <TasteHero />

        <div className="mt-10">
          <DishDiscovery
            dishes={dishes}
            selectedDishId={selectedDishId}
            onSeeRecipe={handleSeeRecipe}
            onShowRestaurants={handleShowRestaurants}
          />
        </div>

        <div className="mt-12">
          <RecipeSection dish={selectedDish} />
        </div>

        <div className="mt-12">
          <RestaurantExplorer dish={selectedDish} />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
