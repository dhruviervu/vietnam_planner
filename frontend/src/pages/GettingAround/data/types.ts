export type TransportWorld = 'long-distance' | 'urban' | 'water'
export type DataConfidence = 'typical' | 'estimated' | 'scheduled' | 'current' | 'unknown'
export type AvailabilityStatus = 'available' | 'limited' | 'unavailable' | 'unknown'
export type TimeBucket = 'not-set' | 'morning' | 'afternoon' | 'evening' | 'late'
export type LuggageLevel = 'light' | 'medium' | 'heavy'
export type WaterKind = 'transport' | 'experience' | null

export type PlaceId =
  | 'hanoi'
  | 'da-nang'
  | 'hoi-an'
  | 'hcmc'
  | 'nha-trang'
  | 'phu-quoc'
  | 'ninh-binh'
  | 'ha-long'
  | 'hue'
  | 'can-tho'
  | 'con-dao'
  | 'ha-tien'
  | 'sapa'
  | 'ha-giang'
  | 'phong-nha'
  | 'dalat'
  | 'mekong'

export type LongModeId =
  | 'flight'
  | 'train'
  | 'coach'
  | 'private-driver'
  | 'shared-transfer'

export type UrbanModeId =
  | 'car-taxi'
  | 'public-transit'
  | 'scooter'
  | 'walking'
  | 'bicycle'
  | 'urban-driver'

export type WaterModeId =
  | 'ferry'
  | 'fast-boat'
  | 'sightseeing-boat'
  | 'cruise'
  | 'river-boat'

export type TransportModeId = LongModeId | UrbanModeId | WaterModeId

export type Place = {
  id: PlaceId
  label: string
  region: string
  kind: 'city' | 'town' | 'island' | 'bay' | 'delta'
  urbanRelevant: boolean
  waterRelevant: boolean
  waterThemes: string[]
  lat: number
  lng: number
  mapZoom?: number
}

export type JourneyStep = { icon: string; label: string }

export type TransportMode = {
  id: TransportModeId
  world: TransportWorld
  symbol: string
  label: string
  shortLabel: string
  description: string
  bestFor: string[]
  whyChoose: string[]
  tradeoff: string
  vehicleTimeLabel: string
  doorToDoorLabel: string
  costLabel: string
  costUsd: [number, number]
  vehicleMinutes: [number, number]
  doorToDoorMinutes: [number, number]
  transfers: string
  luggageLabel: string
  comfortLabel: string
  bookingNote: string
  operatingWindow: string
  journey: JourneyStep[]
  waterKind: WaterKind
  trafficSensitivity?: 'Low' | 'Medium' | 'High'
  weatherSensitive?: boolean
  overnightFriendly?: boolean
  image: string
}

export type TransportOption = {
  id: string
  modeId: TransportModeId
  name: string
  provider: string
  image: string
  rating: number
  priceLabel: string
  priceFrom: number
  serviceType: string
  durationLabel: string
  doorToDoorLabel: string
  luggage: string
  bookingRequired: string
  availability: string
  accessibility: string
  cancellation: string
  bookingUrl: string
  providerUrl: string
  source: string
}

export type BookingProvider = {
  id: string
  name: string
  priceLabel: string
  rating: number
  cancellation: string
  luggage: string
  availability: string
  bookingUrl: string
  providerUrl: string
  source: string
}

export type RouteSeed = {
  id: string
  originId: PlaceId
  destinationId: PlaceId
  distanceKm: number
  typicalHours: [number, number]
  typicalCostUsd: [number, number]
  longModeIds: LongModeId[]
  urbanFocus?: PlaceId
  waterModeIds?: WaterModeId[]
  dayTrip?: boolean
  insights: string[]
}

export type TravelProfile = {
  passengers: number
  luggage: LuggageLevel
  accessibility: boolean
  budget: boolean
}

export type DiscoveryFilters = {
  bestFit: boolean
  cheapest: boolean
  fastest: boolean
  highestRated: boolean
  fewestConnections: boolean
  mostComfortable: boolean
  overnight: boolean
  direct: boolean
  availableNow: boolean
  coverage: boolean
  traffic: boolean
  walking: boolean
  frequent: boolean
  weatherSensitive: boolean
}

export type AvailabilityResult = {
  status: AvailabilityStatus
  label: string
  note: string
  confidence: DataConfidence
}

export type ModeEvaluation = {
  mode: TransportMode
  availability: AvailabilityResult
  suitability: number
  score: number
  relevance: number
  alternatives: TransportModeId[]
}
