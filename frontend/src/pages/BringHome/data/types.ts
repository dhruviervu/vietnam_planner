export type ItemSignal =
  | '🇻🇳 Vietnam Essential'
  | '⭐ Must Bring Home'
  | '🌿 Regional Special'
  | '🎁 Great Gift'
  | '☕ Local Classic'

export type PracticalTag =
  | 'Airport Safe'
  | 'Fragile'
  | 'Easy to Pack'
  | 'Bulky'
  | 'Carry-On Friendly'
  | 'Liquid'
  | 'Perishable'
  | 'Gift Friendly'
  | 'Needs Care'
  | 'Bargainable'
  | 'Fixed Price'

export type RegionNote = {
  region: 'Northern' | 'Central' | 'Southern'
  label: string
  note: string
}

export type ShoppingItem = {
  id: string
  name: string
  images: string[]
  description: string
  tags: ItemSignal[]
  specialityReason: string
  regions: string[]
  regionalVariations: RegionNote[]
  youtubeVideoUrl: string
  whyItMatters: string[]
  typicalCostLabel: string
  typicalCostFrom: string
  material: string
  origin: string
  airportSafe: boolean
  fragile: boolean
  easyToPack: boolean
  bulky: boolean
  carryOnFriendly: boolean
  liquid: boolean
  perishable: boolean
  giftFriendly: boolean
  bargainable: 'Yes' | 'Sometimes' | 'No · Fixed price'
  worthBringingHome: 1 | 2 | 3 | 4 | 5
  worthReason: string
  authenticityNote?: string
  featured: boolean
}

export type ShopCity =
  | 'Hanoi'
  | 'Ninh Binh'
  | 'Hue'
  | 'Da Nang'
  | 'Hoi An'
  | 'Ho Chi Minh City'

export type DestinationType =
  | 'Market'
  | 'Shop'
  | 'Craft District'
  | 'Mall'
  | 'Specialty Store'

export type CrowdLevel = 1 | 2 | 3 | 4 | 5
export type ValueLevel = 'High' | 'Medium' | 'Low'
export type TouristFriendly = 'High' | 'Medium' | 'Low'
export type Bargaining = 'Yes' | 'Limited' | 'No · Fixed price'

export type ShopSort =
  | 'best-overall'
  | 'best-value'
  | 'highest-rated'
  | 'lower-crowds'
  | 'tourist-friendly'
  | 'best-for-bargaining'

export type ShopTypeFilter = 'markets' | 'specialty' | 'craft' | 'malls' | null

export type ShopFilter = {
  openNow?: boolean
  type?: ShopTypeFilter
}

export type ShoppingDestination = {
  id: string
  name: string
  type: DestinationType
  city: ShopCity
  region: 'North' | 'Central' | 'South'
  area: string
  images: string[]
  bestForItemIds: string[]
  bestForLabels: string[]
  crowdLevel: CrowdLevel
  crowdType: 'Typical' | 'Current'
  crowdLabel: string
  crowdBusyPeriod?: string
  valueLevel: ValueLevel
  valueNote?: string
  touristFriendly: TouristFriendly
  bargaining: Bargaining
  priceRange: string
  rating: number
  openNow: boolean
  openingHours: string
  distanceKm: number | null
  distanceNote?: string
  whyRecommended: string
  mapUrl: string
  featured: boolean
}
