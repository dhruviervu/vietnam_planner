import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getFeaturedDishes, getDishById } from './data/dishes'
import { TasteHero } from './components/TasteHero'
import { DishDiscovery } from './components/DishDiscovery'
import { RestaurantExplorer } from './components/RestaurantExplorer'
import { FoodCultureSection } from './components/FoodCultureSection'

const RESTAURANTS_ID = 'where-to-eat'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function TasteOfVietnamPage({ embedded = false }: { embedded?: boolean }) {
  const dishes = useMemo(() => getFeaturedDishes(), [])
  const [params, setParams] = useSearchParams()
  const dishFromUrl = params.get('dish')
  const [selectedDishId, setSelectedDishId] = useState(
    dishFromUrl && dishes.some((d) => d.id === dishFromUrl) ? dishFromUrl : dishes[0]?.id ?? 'pho',
  )
  const [restaurantDishId, setRestaurantDishId] = useState<string | 'All'>(
    dishFromUrl && dishes.some((d) => d.id === dishFromUrl) ? dishFromUrl : 'All',
  )

  const selectedDish = getDishById(selectedDishId) ?? dishes[0]

  useEffect(() => {
    if (dishFromUrl && dishes.some((d) => d.id === dishFromUrl)) {
      setSelectedDishId(dishFromUrl)
      setRestaurantDishId(dishFromUrl)
    }
  }, [dishFromUrl, dishes])

  useEffect(() => {
    if (window.location.hash === `#${RESTAURANTS_ID}`) {
      requestAnimationFrame(() => scrollToSection(RESTAURANTS_ID))
    }
  }, [])

  function handleSeeRecipe(dishId: string) {
    setSelectedDishId(dishId)
    const from = embedded ? '?from=pipeline' : ''
    window.open(`/taste-of-vietnam/recipe/${dishId}${from}`, '_blank', 'noopener,noreferrer')
  }

  function handleShowRestaurants(dishId: string) {
    setSelectedDishId(dishId)
    setRestaurantDishId(dishId)
    setParams({ dish: dishId }, { replace: true, preventScrollReset: true })
    window.setTimeout(() => scrollToSection(RESTAURANTS_ID), 50)
  }

  function handleRestaurantDish(dishId: string | 'All') {
    setRestaurantDishId(dishId)
    if (dishId !== 'All') setSelectedDishId(dishId)
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
          <FoodCultureSection />
        </div>

        <div className="mt-12">
          <RestaurantExplorer
            dishes={dishes}
            selectedDishId={restaurantDishId}
            onSelectDish={handleRestaurantDish}
          />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
