import type {
  ListingFilterCategoryId,
  StayFilterId,
  StayListingFilterId,
  StaySortId,
} from './types'

export const FILTER_LABELS: Record<StayFilterId, string> = {
  budget: 'Budget',
  central: 'Central',
  quiet: 'Quiet',
  nightlife: 'Nightlife',
  families: 'Families',
  'first-trip': 'First trip',
  beach: 'Beach',
  luxury: 'Luxury',
  walkable: 'Walkable',
  food: 'Food',
  culture: 'Culture',
}

export const SORT_OPTIONS: { id: StaySortId; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'best-rated', label: 'Best rated' },
  { id: 'best-value', label: 'Best value' },
  { id: 'closest', label: 'Closest to sights' },
  { id: 'price-low', label: 'Price · low to high' },
  { id: 'price-high', label: 'Price · high to low' },
]

export const COST_LEGEND = [
  { level: 1 as const, label: 'Budget' },
  { level: 2 as const, label: 'Mid-range' },
  { level: 3 as const, label: 'Premium' },
  { level: 4 as const, label: 'Luxury' },
]

export const LISTING_FILTER_LABELS: Record<StayListingFilterId, string> = {
  'cost-budget': 'Budget ($)',
  'cost-mid': 'Mid-range ($$)',
  'cost-premium': 'Premium ($$$)',
  'cost-luxury': 'Luxury ($$$$)',
  'rating-45': '4.5+ rating',
  'rating-47': '4.7+ rating',
  'rating-48': '4.8+ rating',
  'type-hotel': 'Hotel',
  'type-apartment': 'Apartment',
  'type-airbnb': 'Airbnb / home',
  'type-resort': 'Resort',
  'type-villa': 'Villa',
  'pets-yes': 'Pets allowed',
  'caretaker-yes': 'On-site caretaker / staff',
  'smoking-yes': 'Smoking allowed',
  'drinking-yes': 'Drinking allowed',
  'no-smoking': 'Non-smoking',
  'quiet-hours': 'Quiet hours',
  'flexible-cancel': 'Flexible cancellation',
  'instant-book': 'Instant book',
}

export const LISTING_FILTER_CATEGORIES: {
  id: ListingFilterCategoryId
  label: string
  filters: StayListingFilterId[]
}[] = [
  {
    id: 'cost',
    label: 'Cost',
    filters: ['cost-budget', 'cost-mid', 'cost-premium', 'cost-luxury'],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    filters: ['rating-45', 'rating-47', 'rating-48'],
  },
  {
    id: 'property',
    label: 'Property type',
    filters: ['type-hotel', 'type-apartment', 'type-airbnb', 'type-resort', 'type-villa'],
  },
  {
    id: 'house-rules',
    label: 'House rules',
    filters: [
      'pets-yes',
      'caretaker-yes',
      'smoking-yes',
      'drinking-yes',
      'no-smoking',
      'quiet-hours',
    ],
  },
  {
    id: 'booking',
    label: 'Booking preference',
    filters: ['flexible-cancel', 'instant-book'],
  },
]

export const PROPERTY_TYPE_LABELS = {
  hotel: 'Hotel',
  apartment: 'Apartment',
  airbnb: 'Airbnb / home',
  resort: 'Resort',
  villa: 'Villa',
} as const

export const CROWD_LABELS = {
  calm: 'Calm',
  moderate: 'Moderate crowd',
  lively: 'Lively',
  busy: 'Busy',
} as const

export const SAFETY_LABELS = {
  'very-comfortable': 'Very comfortable for tourists',
  comfortable: 'Generally comfortable',
  'take-care': 'Take normal night care',
} as const

export const PROXIMITY_LABELS = {
  'on-foot': 'On foot',
  'short-hop': 'Short hop',
  'taxi-needed': 'Taxi needed',
} as const
