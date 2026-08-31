import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { useTripStore } from '../../store/tripStore'
import { getDishById } from './data/dishes'
import { getRecipeForDish } from './data/recipes'
import { getRestaurantsForDish } from './data/restaurants'
import { getTripFoodCities } from './lib/tripFoodCities'
import { RestaurantCard } from './components/RestaurantCard'

function eatHrefForDish(dishId: string, fromPipeline: boolean) {
  const query = `?dish=${encodeURIComponent(dishId)}#where-to-eat`
  return fromPipeline ? `/plan/builder/eat${query}` : `/taste-of-vietnam${query}`
}

export function TasteRecipePage() {
  const { dishId = '' } = useParams()
  const [params] = useSearchParams()
  const fromPipeline = params.get('from') === 'pipeline'
  const dish = getDishById(dishId)
  const recipe = getRecipeForDish(dishId)
  const fallbackImages = dish?.images.slice(0, 3) ?? []
  const [broken, setBroken] = useState<Record<number, boolean>>({})
  const tripTick = useTripStore(
    (s) =>
      `${s.selectedExperienceIds.join(',')}|${s.selectedActivityIds.join(',')}|${s.selectedHotelIds.join(',')}|${s.itineraryStayPropertyIds.join(',')}`,
  )
  const tripCities = useMemo(() => getTripFoodCities(), [tripTick])

  const gallery = useMemo(() => {
    const raw = (recipe?.images.length ? recipe.images : fallbackImages).slice(0, 3)
    return raw.map((src, i) => (broken[i] ? fallbackImages[i] ?? src : src))
  }, [recipe?.images, fallbackImages, broken])

  const restaurants = useMemo(() => {
    if (!dish) return []
    return getRestaurantsForDish(dish.id, 'All', 'reviews-high', {}, tripCities, {
      skipInterleave: true,
      preferNearby: false,
    }).slice(0, 10)
  }, [dish, tripCities])

  if (!dish || !recipe) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-[720px] px-5 py-16 text-center">
          <h1 className="font-serif text-2xl text-ink">Recipe not found</h1>
          <Link to="/taste-of-vietnam" className="mt-4 inline-block font-bold text-terracotta">
            Back to Taste of Vietnam
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const eatHref = eatHrefForDish(dish.id, fromPipeline)
  const hasTrip = tripCities.length > 0

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[980px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <Link
          to={fromPipeline ? '/plan/builder/eat' : '/taste-of-vietnam'}
          className="text-[0.75rem] font-bold text-muted hover:text-terracotta"
        >
          ← Taste of Vietnam
        </Link>

        <p className="mt-5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta">
          Recipe · {dish.region}
        </p>
        <h1 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.05] text-ink">
          {dish.name}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink/85">
          {recipe.tastingDescription}
        </p>
        <p className="mt-3 text-[0.78rem] font-semibold text-muted">
          {recipe.servings} · {recipe.time}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <article className="rounded-[18px] bg-cream/50 px-5 py-5 ring-1 ring-ink/8">
            <h2 className="font-serif text-[1.2rem] font-semibold text-ink">
              🧅 Core ingredients
            </h2>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/85">{recipe.coreIngredients}</p>
          </article>
          <article className="rounded-[18px] bg-cream/50 px-5 py-5 ring-1 ring-ink/8">
            <h2 className="font-serif text-[1.2rem] font-semibold text-ink">
              🥢 How it is served
            </h2>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-ink/85">{recipe.howServed}</p>
          </article>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
          {gallery.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className={`overflow-hidden rounded-[18px] ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
            >
              <img
                src={src}
                alt={`${dish.name} ${i + 1}`}
                className={`w-full object-cover ${i === 0 ? 'h-full min-h-[220px] sm:min-h-[320px]' : 'aspect-[4/3]'}`}
                onError={() => setBroken((prev) => ({ ...prev, [i]: true }))}
              />
            </div>
          ))}
        </div>

        <section className="mt-10 overflow-hidden rounded-[22px] bg-paper shadow-soft">
          <div className="border-b border-ink/8 px-5 py-4 sm:px-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sage">
              Local recipe
            </p>
            <h2 className="mt-1 font-serif text-[1.45rem] font-semibold text-ink">
              How to make {dish.name}
            </h2>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
            <div className="border-b border-ink/8 bg-cream/40 p-5 lg:border-b-0 lg:border-r sm:p-6">
              <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                Ingredients
              </h3>
              <ul className="mt-3 space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.item} className="flex gap-3 text-[0.88rem] leading-snug text-ink">
                    <span className="w-[5.2rem] shrink-0 font-bold text-terracotta">
                      {ing.amount || '—'}
                    </span>
                    <span>{ing.item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                Method
              </h3>
              <ol className="mt-3 space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[0.9rem] leading-relaxed text-ink/85">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-terracotta/15 text-[0.72rem] font-bold text-terracotta">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-[1.45rem] font-semibold text-ink">See it being made</h2>
          <p className="mt-1 text-[0.82rem] text-muted">{recipe.videoTitle}</p>
          <div className="mt-4 overflow-hidden rounded-[18px] bg-ink shadow-card ring-1 ring-ink/10">
            <div className="aspect-video w-full">
              <iframe
                title={recipe.videoTitle}
                src={recipe.videoEmbedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                Show me restaurants for this dish
              </h2>
              <p className="mt-1 text-[0.82rem] text-muted">
                {hasTrip
                  ? `Top highly reviewed places in ${tripCities.map((c) => (c === 'Ho Chi Minh City' ? 'HCMC' : c)).join(', ')}.`
                  : 'Top highly reviewed places across Vietnam, ranked by reviews.'}
              </p>
            </div>
            <Link
              to={eatHref}
              className="rounded-full bg-terracotta px-4 py-2 text-[0.78rem] font-bold text-paper"
            >
              All restaurants →
            </Link>
          </div>
          {restaurants.length === 0 ? (
            <p className="mt-5 text-[0.88rem] text-muted">
              No listed restaurants for {dish.name} in your trip cities yet. Open the full list to
              browse other cities.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {restaurants.map((r, i) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  dishName={dish.name}
                  isTop={i === 0}
                  hasTripContext={hasTrip && tripCities.includes(r.city)}
                  showListingLink={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
