/**
 * When a sight actually makes sense to visit. EVENING items (lanterns, night
 * markets, sunset spots) are held back past 17:30; MORNING/AFTERNOON items
 * (eco-tours, basket boats) are kept in daylight.
 */
export type TimePreference = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANY'

export type TravelStyle = 'relaxed' | 'balanced' | 'packed'
/** Trip purpose on Your Vietnam — maps onto TravelStyle for the rest of the builder. */
export type HolidayKind = 'action' | 'leisure' | 'culture-food'
export type BudgetMode = 'per-person' | 'total'
export type DateMode = 'exact' | 'flexible' | 'unknown'
export type Certainty = 'known' | 'unknown'

export type SignalLevel = 1 | 2 | 3 | 4 | 5
export type SignalTone = 'favorable' | 'moderate' | 'elevated' | 'challenging'

export type TripSignal = {
  id: string
  icon: string
  label: string
  level: SignalLevel
  tone: SignalTone
  valueLabel: string
  detail?: string
}

export type Interest =
  | 'nature'
  | 'culture'
  | 'food'
  | 'adventure'
  | 'beaches'
  | 'cities'
  | 'history'
  | 'nightlife'

export type ExperienceCategory =
  | 'Nature'
  | 'Culture'
  | 'Adventure'
  | 'Beaches'
  | 'Cities'
  | 'History'
  | 'Nightlife'
  | 'Food'

export type ExperienceSignal =
  | 'must-do'
  | 'vietnam-special'
  | 'hidden-gem'
  | 'picture-perfect'
  | 'slow-scenic'
  | 'local-life'
  | 'adventure'

export type PriceType = 'per_person' | 'per_group' | 'per_ticket' | 'free'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export type ExperiencePopularityTag =
  | 'Must do'
  | 'Popular'
  | 'Unique'
  | 'Hidden gem'
  | 'Local favourite'

export type Experience = {
  id: string
  name: string
  /**
   * Shared identity for variants of the same place (e.g. a daytime and an
   * evening version of the same town). Two sights with the same `groupId`
   * are never scheduled on the same day.
   */
  groupId?: string
  /** When this sight belongs in the day. Defaults to ANY when unset. */
  timePreference?: TimePreference
  region: string
  city: string
  /** City catalog grouping (HCMC landmarks, museums, etc.). */
  sightSection?: string
  category: ExperienceCategory
  /** Experience-accurate image URLs (3–5) */
  images: string[]
  /** @deprecated Prefer images; kept for legacy seed fallbacks */
  seeds: string[]
  hook: string
  /** Longer card blurb (2–4 sentences) */
  cardSummary: string
  about: string
  whyGo: string
  rating: number
  reviewCount: number
  /** Starting / from price in USD */
  price: number
  priceType: PriceType
  /** Alias of price for itinerary costing */
  costUsd: number
  costLabel: string
  durationHours: number
  durationLabel: string
  popularity: string
  /** 1 = most popular (catalog sort key) */
  popularityRank: number
  /** User-facing popularity gauge on cards */
  popularityTag: ExperiencePopularityTag
  bestTime: string
  accessibility: string
  hours: string
  tags: string[]
  /** Experience DNA — 2–4 feel tags */
  dna: string[]
  signal: ExperienceSignal
  signalEmoji: string
  signalLabel: string
  signalBlurb: string
  crowdBase: SignalLevel
  slotQuality: { morning: SignalLevel; afternoon: SignalLevel; evening: SignalLevel }
  accessibilityDetail: {
    wheelchair: string
    walking: string
    steps: string
  }
  seasonalNotes: { months: number[]; label: string; weather: string; crowds: string; note: string }[]
  reviews: { author: string; rating: number; text: string }[]
  relatedIds: string[]
  paceAffinity: TravelStyle[]
  budgetBand: 'smart' | 'comfortable' | 'premium' | 'luxury'
  monthsIdeal: number[]
  featured?: boolean
  hiddenGem?: boolean
  vietnamBest?: boolean
}

export type ExperienceSelectionMeta = {
  preferredSlot: 'best' | TimeOfDay | 'later'
  addedAt: number
}

export type BuilderStepId =
  | 'when-to-go'
  | 'experiences'
  | 'activities'
  | 'stay'
  | 'transport'
  | 'eat'
  | 'shopping'
  | 'airport'
  | 'logistics'
  | 'itinerary'
  /** @deprecated kept for any lingering references during migration */
  | 'basics'
  | 'know-before'

export type StayStyle = 'central' | 'quiet' | 'beachside' | 'adventure' | 'premium'

export type AccommodationType =
  | 'hotel'
  | 'boutique'
  | 'resort'
  | 'guesthouse'
  | 'villa'
  | 'hostel'

export type Hotel = {
  id: string
  name: string
  region: string
  city: string
  seed: string
  images?: string[]
  rating: number
  reviewCount?: number
  pricePerNight: number
  priceType?: 'per_room' | 'per_night'
  sourceLabel: string
  sourceUrl: string
  neighborhood: string
  blurb: string
  baseId?: string
  amenities?: string[]
  styleTags?: StayStyle[]
  accommodationType?: AccommodationType
  accessibility?: string
  transportScore?: number
  foodAccessScore?: number
  locationScore?: number
  reason?: string
  mapsQuery?: string
}

export type StayBase = {
  id: string
  name: string
  region: string
  city: string
  images: string[]
  bestFor: string[]
  typicalStayNights: [number, number]
  typicalNightlyMin: number
  typicalNightlyMax: number
  whyItWorks: string
  experienceDensity: number
  transportScore: number
  foodAccessScore: number
  styleTags: StayStyle[]
  tradeoff: string
  description: string
  arrivalHub?: boolean
  sampleNearby: string[]
}

export type Restaurant = {
  id: string
  name: string
  region: string
  city: string
  cuisine: string
  seed: string
  rating: number
  priceUsd: number
  priceLabel: string
  hours: string
    blurb: string
    nearExperienceIds: string[]
    address?: string
    image?: string
  }

export type ShoppingItem = {
  id: string
  name: string
  type: string
  region: string
  city: string
  seed: string
  costUsd: number
  costLabel: string
  popularity: string
  shop: string
  blurb: string
  /** When set, itinerary builders place this stop in the matching daypart */
  preferredPeriod?: 'morning' | 'afternoon' | 'evening'
  /** Dwell on the itinerary. Clamped to 30 min–2 hr when packing. */
  durationHours?: number
  hours?: string
}

export type TransportMode = 'train' | 'bus' | 'taxi' | 'driver' | 'rental'

export type TransportOption = {
  mode: TransportMode
  label: string
  icon: string
  costUsd: number
  durationMinutes: number
  convenience: number
  status: string
}

export type TransportLeg = {
  id: string
  from: string
  to: string
  options: TransportOption[]
}

export type LogisticsCard = {
  id: string
  title: string
  icon: string
  summary: string
  facts: { label: string; value: string }[]
  detail: string
  linkLabel?: string
  linkHref?: string
}

export type ItineraryBlock =
  | {
      kind: 'activity'
      id: string
      time: string
      title: string
      subtitle?: string
      durationLabel?: string
      costUsd: number
      icon: string
    }
  | {
      kind: 'meal'
      id: string
      time: string
      title: string
      subtitle?: string
      costUsd: number
      icon: string
    }
  | {
      kind: 'stay'
      id: string
      time: string
      title: string
      subtitle?: string
      costUsd: number
      icon: string
    }
  | {
      kind: 'transport'
      id: string
      time: string
      title: string
      subtitle?: string
      costUsd: number
      icon: string
    }
  | {
      kind: 'shopping'
      id: string
      time: string
      title: string
      subtitle?: string
      costUsd: number
      icon: string
    }

export type ItineraryDay = {
  day: number
  dateLabel: string
  region: string
  blocks: ItineraryBlock[]
  costs: {
    activities: number
    food: number
    stay: number
    transport: number
    shopping: number
    total: number
  }
}

export type CostTotals = {
  activities: number
  food: number
  stay: number
  transport: number
  shopping: number
  total: number
}
