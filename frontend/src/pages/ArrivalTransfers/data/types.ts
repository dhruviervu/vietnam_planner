export type AirportId =
  | 'HAN'
  | 'DAD'
  | 'SGN'
  | 'PQC'
  | 'CXR'
  | 'HUI'
  | 'VCA'
  | 'DLI'
  | 'VII'
  | 'UIH'
  | 'VDH'
  | 'VDO'
  | 'BMV'
  | 'PXU'
  | 'VKG'
  | 'DIN'
  | 'VCL'
  | 'TBB'
  | 'THD'
  | 'CAH'
export type DestinationId = string
export type TransferDirection = 'inbound' | 'outbound'
export type PriceBasis = 'per_vehicle' | 'per_person' | 'per_trip' | 'fixed'
export type DataConfidence = 'typical' | 'estimated' | 'current' | 'unknown'
export type AvailabilityStatus = 'available' | 'limited' | 'unavailable' | 'unknown'
export type TimeBucket = 'not-set' | 'morning' | 'afternoon' | 'evening' | 'late'
export type TransferBudget = 'saver' | 'typical' | 'comfort'

/** Canonical transport modes shown on the airport transfer page. */
export type TransportModeId =
  | 'car-taxi'
  | 'ride-hailing'
  | 'private-transfer'
  | 'public-bus'
  | 'shared-transfer'
  | 'rental-driver'

export type Airport = {
  id: AirportId
  city: string
  name: string
  code: AirportId
  transferHint: string
  image: string
  cityHubLabel: string
  defaultDestinationId: string
  airportBufferHours: [number, number]
}

export type Destination = {
  id: DestinationId
  airportId: AirportId
  city: string
  area: string
  label: string
  mapsQuery: string
  image: string
  distanceKm: number
  typicalTimeMin: [number, number]
  popularBase: boolean
  eveningAppeal: boolean
  recommendedTransfer: string
}

export type ArrivalRoute = {
  id: string
  airportId: AirportId
  destinationId: DestinationId
  distanceKm: number
  typicalTimeMin: [number, number]
  typicalCostUsd: [number, number]
  trafficSensitivity: 'Low' | 'Medium' | 'High'
  modeIds: TransportModeId[]
  goodToKnow: { icon: string; title: string; note: string }[]
  goodToKnowOutbound: { icon: string; title: string; note: string }[]
  mapsUrl: string
  dataState: DataConfidence
  updatedAt: string
}

export type AccessibilityLevel =
  | 'Wheelchair-friendly'
  | 'Good'
  | 'Partial'
  | 'Limited'
  | 'Requires assistance'
  | 'Not recommended'
  | 'Check availability'

export type JourneyStep = { icon: string; label: string }

export type TransportMode = {
  id: TransportModeId
  symbol: string
  label: string
  shortLabel: string
  image: string
  description: string
  bestFor: string[]
  whyChoose: string[]
  tradeoff: string
  timeMin: [number, number]
  costUsd: [number, number]
  priceBasis: PriceBasis
  passengers: string
  luggageStars: 1 | 2 | 3 | 4 | 5
  luggageLabel: string
  accessibilityLevel: Exclude<AccessibilityLevel, 'Check availability'>
  accessible: boolean
  lateNightOk: boolean
  groupFriendly: boolean
  comfort: 1 | 2 | 3 | 4 | 5
  reliability: 1 | 2 | 3 | 4 | 5
  operatingWindow: string
  journey: JourneyStep[]
  journeyNote: string
  airportArrivalBuffer?: string
}

export type ProviderOption = {
  id: string
  modeId: TransportModeId
  routeId: string
  direction: TransferDirection
  name: string
  rating: number
  priceLabel: string
  priceFrom: number
  vehicle: string
  capacity: string
  luggage: string
  pickupStyle: string
  accessibility: AccessibilityLevel
  image: string
  timeLabel: string
  cancellationPolicy: string
  flightDelayPolicy: string
  waitingTimePolicy: string
  featured?: boolean
}

export type BookingProvider = {
  id: string
  name: string
  priceLabel: string
  rating: number
  cancellation: string
  flightDelay: string
  luggage: string
  pickup: string
  availability: string
  bookingUrl: string
  providerUrl: string
  source: string
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
  alternatives: TransportModeId[]
}

export type ArrivalContext = {
  passengers: number
  luggageLevel: 'light' | 'medium' | 'heavy'
  lateArrival: boolean
  arrivalTime: TimeBucket
  hasAccessibilityNeed: boolean
  arrivalLabel: string | null
  direction: TransferDirection
  budget: TransferBudget
  budgetPriority: boolean
  /** Optional route labels for explanations — not required for typical browsing. */
  routeAirportCode?: AirportId | null
  routeDestinationLabel?: string | null
}

/** Single source of route context for the Airport Transfers page. */
export type TransferRouteState = {
  airportId: AirportId | null
  destinationId: DestinationId | null
  direction: TransferDirection
}

export type DiscoveryFilters = {
  bestFit: boolean
  cheapest: boolean
  fastest: boolean
  highestRated: boolean
  availableNow: boolean
  allDay: boolean
  accessible: boolean
  freeCancellation: boolean
  direct: boolean
}
