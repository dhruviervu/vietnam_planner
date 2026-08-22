export type StayCityId =
  | 'hanoi'
  | 'hcmc'
  | 'da-nang'
  | 'hoi-an'
  | 'hue'
  | 'nha-trang'
  | 'dalat'
  | 'phu-quoc'

export type CostLevel = 1 | 2 | 3 | 4

export type StayFilterId =
  | 'budget'
  | 'central'
  | 'quiet'
  | 'nightlife'
  | 'families'
  | 'first-trip'
  | 'beach'
  | 'luxury'
  | 'walkable'
  | 'food'
  | 'culture'

export type StaySortId =
  | 'recommended'
  | 'best-rated'
  | 'best-value'
  | 'closest'
  | 'price-low'
  | 'price-high'

export type PropertyType = 'hotel' | 'apartment' | 'airbnb' | 'resort' | 'villa'

/** Stay-listing filters (sidebar) — separate from neighbourhood preference chips */
export type StayListingFilterId =
  | 'cost-budget'
  | 'cost-mid'
  | 'cost-premium'
  | 'cost-luxury'
  | 'rating-45'
  | 'rating-47'
  | 'rating-48'
  | 'type-hotel'
  | 'type-apartment'
  | 'type-airbnb'
  | 'type-resort'
  | 'type-villa'
  | 'pets-yes'
  | 'caretaker-yes'
  | 'smoking-yes'
  | 'drinking-yes'
  | 'no-smoking'
  | 'quiet-hours'
  | 'flexible-cancel'
  | 'instant-book'

export type ListingFilterCategoryId =
  | 'cost'
  | 'reviews'
  | 'property'
  | 'house-rules'
  | 'booking'

/** A closed WGS84 ring made from [longitude, latitude] points. */
export type GeoRing = [number, number][]

export type GeoBounds = {
  west: number
  south: number
  east: number
  north: number
}

export type MatchLabel = 'recommended' | 'good' | 'possible'

export type CityGlance = {
  bestFirstTrip: string
  bestQuiet: string
  bestValue: string
  bestBeach?: string
}

export type StayCity = {
  id: StayCityId
  label: string
  overview: string
  typicalCostLevel: [CostLevel, CostLevel]
  glance: CityGlance
  /** Key in Getting Around's MAP_META.cities, or null when no SVG map exists. */
  mapCityId:
    | 'hanoi'
    | 'hcmc'
    | 'da-nang'
    | 'hoi-an'
    | 'hue'
    | 'nha-trang'
    | 'dalat'
    | null
  bounds: GeoBounds
  defaultClusterId: string
  availableFilters: StayFilterId[]
  image: string
}

export type ClusterKeyPlace = {
  label: string
  typicalMinutes: number
  mode: 'walk' | 'taxi'
  kind?: 'market' | 'sight' | 'beach' | 'food' | 'transit' | 'other'
}

export type ClusterMetrics = {
  locationScore: 1 | 2 | 3 | 4 | 5
  walkability: 1 | 2 | 3 | 4 | 5
  nightlife: 1 | 2 | 3 | 4 | 5
  quietness: 1 | 2 | 3 | 4 | 5
  localFeel: 1 | 2 | 3 | 4 | 5
  familySuitability: 1 | 2 | 3 | 4 | 5
  beachAccess: 0 | 1 | 2 | 3 | 4 | 5
  sightseeingAccess: 1 | 2 | 3 | 4 | 5
}

export type TransportAccess = {
  walkabilityLabel: string
  taxiLabel: string
  transitLabel: string
}

export type CrowdLevel = 'calm' | 'moderate' | 'lively' | 'busy'
export type SafetyFeel = 'very-comfortable' | 'comfortable' | 'take-care'
export type ProximityLevel = 'on-foot' | 'short-hop' | 'taxi-needed'

export type ClusterLiving = {
  crowdLevel: CrowdLevel
  touristSafety: SafetyFeel
  safetyNote: string
  marketAccess: ProximityLevel
  marketNote: string
  foodAccess: ProximityLevel
  foodNote: string
  nightlifeFeel: string
  noiseNote: string
  costOfLivingNote: string
  whoItSuits: string[]
}

export type ClusterMapColor = {
  fill: string
  fillSelected: string
  stroke: string
  label: string
}

export type StayCluster = {
  id: string
  cityId: StayCityId
  name: string
  character: string[]
  bestFor: StayFilterId[]
  costLevel: CostLevel
  typicalNightlyRange: [number, number] | null
  priceWhy: string
  baseYourselfIf: string
  tradeoff: string
  metrics: ClusterMetrics
  keyPlaces: ClusterKeyPlace[]
  transportAccess: TransportAccess
  polygon: GeoRing
  stayIds: string[]
  isDefault?: boolean
  recommendedStartingPoint?: string
  /** Derived / enriched at load */
  living: ClusterLiving
  mapColor: ClusterMapColor
}

export type StayProperty = {
  id: string
  clusterId: string
  name: string
  image: string
  rating: number
  reviewCount: number
  costLevel: CostLevel
  typicalNightlyRange: [number, number] | null
  distanceLabel: string
  amenities: string[]
  bestFor: StayFilterId[]
  reason: string
  bookingUrl: string
  mapsUrl: string
  sourceLabel: string
  propertyType: PropertyType
  petsAllowed: boolean
  caretaker: boolean
  smokingAllowed: boolean
  drinkingAllowed: boolean
  quietHours: boolean
  flexibleCancel: boolean
  instantBook: boolean
}
