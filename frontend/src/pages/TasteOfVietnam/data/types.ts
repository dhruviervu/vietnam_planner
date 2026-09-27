export type DishTag =
  | '🇻🇳 Vietnam Special'
  | '⭐ Must Try'
  | '🌿 Regional Special'
  | '🔥 Street Food'
  | '☕ Coffee Culture'

export type SpecialityReason =
  | 'Must Try'
  | 'Vietnam Special'
  | 'Only Found In This Form Here'
  | 'Northern Speciality'
  | 'Central Vietnam Speciality'
  | 'Southern Speciality'

export type RegionVariant = {
  region: 'Northern' | 'Central' | 'Southern'
  label: string
  note: string
}

export type Dish = {
  id: string
  name: string
  images: string[]
  description: string
  tags: DishTag[]
  specialityReason: SpecialityReason
  region: string
  /** Primary proteins / animal ingredients (beef, pork, chicken, fish, etc.) */
  proteins: string[]
  ingredients: string[]
  culturalDescription: string[]
  regionalVariations: RegionVariant[]
  recipeVideoUrl: string
  featured: boolean
}

export type FoodCity =
  | 'Hanoi'
  | 'Ninh Binh'
  | 'Hue'
  | 'Da Nang'
  | 'Hoi An'
  | 'Ho Chi Minh City'
  | 'Nha Trang'
  | 'Da Lat'

export type RestaurantSort = 'reviews-high' | 'best-value'

export type RestaurantKind = 'tourist-favorite' | 'local-table'

export type RestaurantPriceLevel = 1 | 2 | 3 | 4

export type RestaurantFilter = {
  servesAlcohol?: boolean
  allowsSmoking?: boolean
  priceLevels?: RestaurantPriceLevel[]
  kind?: RestaurantKind
}

export type Restaurant = {
  id: string
  name: string
  city: FoodCity
  region: 'North' | 'Central' | 'South'
  neighborhood: string
  address: string
  images: string[]
  specialityDishIds: string[]
  rating: number
  reviewCount: number
  priceLevel: RestaurantPriceLevel
  kind: RestaurantKind
  openNow: boolean
  openingHours: string
  outdoorSeating: boolean
  servesAlcohol: boolean
  allowsSmoking: boolean
  distanceKm: number | null
  mapUrl: string
  listingUrl: string
  /** Review highlights or what to order — shown on the card. */
  menuOrReviews: string
  featured: boolean
}

export type RecipeIngredient = {
  amount: string
  item: string
}

export type DishRecipe = {
  dishId: string
  servings: string
  time: string
  tastingDescription: string
  coreIngredients: string
  howServed: string
  images: string[]
  ingredients: RecipeIngredient[]
  steps: string[]
  videoEmbedUrl: string
  videoTitle: string
}
