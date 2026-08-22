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

export type RestaurantSort =
  | 'best-for-dish'
  | 'highest-rated'
  | 'most-reviewed'
  | 'best-value'

export type RestaurantFilter = {
  openNow?: boolean
  outdoorSeating?: boolean
  servesAlcohol?: boolean
}

export type Restaurant = {
  id: string
  name: string
  city: FoodCity
  region: 'North' | 'Central' | 'South'
  neighborhood: string
  images: string[]
  specialityDishIds: string[]
  rating: number
  reviewCount: number
  priceLevel: 1 | 2 | 3 | 4
  openNow: boolean
  openingHours: string
  outdoorSeating: boolean
  servesAlcohol: boolean
  distanceKm: number | null
  mapUrl: string
  whyRecommended: string
  pickReason: string
  featured: boolean
}
