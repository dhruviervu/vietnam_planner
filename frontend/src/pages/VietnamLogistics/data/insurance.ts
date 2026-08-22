import type {
  InsuranceActivityId,
  InsuranceCoverageItem,
  InsuranceExploreLink,
  InsurancePlanTier,
  InsuranceRisk,
} from './types'

/**
 * Coverage guidance with illustrative cost cues.
 * Premiums vary by age, nationality, trip length and extras — labelled estimated.
 */
export const INSURANCE_COVERAGE: InsuranceCoverageItem[] = [
  {
    id: 'medical',
    label: 'Medical treatment',
    importance: 'essential',
    description: 'Doctor visits and outpatient care for unexpected illness or injury.',
    protects: 'Clinic visits, prescriptions, unexpected illness',
    costLabel: 'Core of every sensible policy',
    costUsd: [15, 35],
  },
  {
    id: 'hospital',
    label: 'Hospitalisation',
    importance: 'essential',
    description: 'Inpatient care and hospital bills — confirm limits carefully.',
    protects: 'Hospital stays and inpatient treatment',
    costLabel: 'Usually bundled with medical',
    costUsd: null,
  },
  {
    id: 'evac',
    label: 'Emergency evacuation',
    importance: 'essential',
    description: 'Medical evacuation / repatriation if local care is insufficient.',
    protects: 'Getting you to proper care — or home',
    costLabel: 'High value · modest premium share',
    costUsd: [10, 25],
  },
  {
    id: 'cancel',
    label: 'Trip cancellation',
    importance: 'useful',
    description: 'Helpful if flights and prepaid stays are a large part of your budget.',
    protects: 'Prepaid flights and hotels you cannot use',
    costLabel: 'Often +$15–40 on a short trip',
    costUsd: [15, 40],
  },
  {
    id: 'delay',
    label: 'Flight delays',
    importance: 'useful',
    description: 'Useful on multi-leg Vietnam itineraries with tight connections.',
    protects: 'Meals, hotels and rebooking when flights slip',
    costLabel: 'Often included in mid tiers',
    costUsd: [5, 15],
  },
  {
    id: 'baggage',
    label: 'Lost baggage',
    importance: 'useful',
    description: 'Check limits — high-value items often need extras.',
    protects: 'Delayed, lost or damaged bags',
    costLabel: 'Usually included · low single-item caps',
    costUsd: [5, 12],
  },
  {
    id: 'liability',
    label: 'Personal liability',
    importance: 'depends',
    description: 'Depends on trip style and whether your existing policies already cover it.',
    protects: 'Damage or injury you accidentally cause',
    costLabel: 'Sometimes included · else a small add-on',
    costUsd: [5, 20],
  },
]

/** Typical total premiums for a ~2-week Vietnam tourist trip (single traveller, under ~65). */
export const INSURANCE_PLANS: InsurancePlanTier[] = [
  {
    id: 'essential',
    label: 'Essential',
    tagline: 'Medical + evacuation',
    bestFor: 'Short trips · strong existing cancel cover elsewhere',
    priceUsd: [25, 50],
    includes: ['Medical treatment', 'Hospitalisation', 'Emergency evacuation'],
    note: 'The minimum most travellers should consider.',
  },
  {
    id: 'standard',
    label: 'Standard',
    tagline: 'Medical + trip hiccups',
    bestFor: 'Most Vietnam itineraries',
    priceUsd: [45, 90],
    includes: [
      'Everything in Essential',
      'Trip interruption / delays',
      'Baggage basics',
    ],
    note: 'The usual sweet spot for first-time visitors.',
  },
  {
    id: 'complete',
    label: 'Complete',
    tagline: 'Full trip protection',
    bestFor: 'Prepaid hotels · adventure add-ons · families',
    priceUsd: [90, 160],
    includes: [
      'Everything in Standard',
      'Trip cancellation',
      'Higher limits / adventure options',
    ],
    note: 'Worth it when flights and stays are already booked and pricey.',
  },
]

export const INSURANCE_EXPLORE_LINKS: InsuranceExploreLink[] = [
  {
    id: 'squaremouth',
    label: 'Squaremouth',
    href: 'https://www.squaremouth.com/',
    blurb: 'Compare travel policies side by side with filters for medical limits.',
  },
  {
    id: 'insuremytrip',
    label: 'InsureMyTrip',
    href: 'https://www.insuremytrip.com/',
    blurb: 'Browse quoted prices by trip dates, age and destination.',
  },
  {
    id: 'worldnomads',
    label: 'World Nomads',
    href: 'https://www.worldnomads.com/',
    blurb: 'Popular with travellers who add adventure activities mid-trip.',
  },
  {
    id: 'nerdwallet',
    label: 'NerdWallet guide',
    href: 'https://www.nerdwallet.com/article/travel/best-travel-insurance',
    blurb: 'Independent overview of how travel insurance pricing usually works.',
  },
]

export const INSURANCE_RISKS: InsuranceRisk[] = [
  {
    id: 'scooter',
    symbol: '🛵',
    label: 'Scooter / motorbike exclusions',
    note: 'Many policies exclude riding — or require a valid licence and helmet. Check explicitly.',
  },
  {
    id: 'water',
    symbol: '🌊',
    label: 'Water activities',
    note: 'Snorkelling, diving and boat trips can sit outside standard leisure cover.',
  },
  {
    id: 'adventure',
    symbol: '🏔',
    label: 'Adventure activities',
    note: 'Trekking, climbing and similar activities may need adventure add-ons.',
  },
  {
    id: 'delays',
    symbol: '✈️',
    label: 'Delays / missed connections',
    note: 'Domestic hops and weather disruptions make delay cover practical.',
  },
  {
    id: 'baggage',
    symbol: '💼',
    label: 'Baggage',
    note: 'Confirm single-item limits for cameras, laptops and jewellery.',
  },
  {
    id: 'medical',
    symbol: '🏥',
    label: 'Medical care',
    note: 'Private hospitals in major cities are the usual tourist pathway — verify hospital limits.',
  },
  {
    id: 'multi',
    symbol: '🧳',
    label: 'Multi-city travel',
    note: 'Ensure the policy covers the full itinerary and any side trips outside Vietnam.',
  },
]

export const INSURANCE_ACTIVITIES: {
  id: InsuranceActivityId
  label: string
  checks: string[]
  /** Rough add-on cost cue when this activity needs extra cover */
  costCue: string
}[] = [
  {
    id: 'scooter',
    label: 'Scooter',
    costCue: 'Often excluded unless you add motorcycle cover (+$10–40 typical)',
    checks: [
      'Licence requirements for the vehicle class you will ride',
      'Helmet requirements',
      'Whether rented scooters / motorbikes are covered at all',
      'Accident and third-party liability wording',
      'Explicit policy exclusions for two-wheelers',
    ],
  },
  {
    id: 'water',
    label: 'Water activities',
    costCue: 'Diving / some boat sports may need an adventure add-on',
    checks: [
      'Snorkelling / diving depth limits',
      'Boat and island day-trip cover',
      'Whether activities must be with a licensed operator',
    ],
  },
  {
    id: 'adventure',
    label: 'Hiking / Adventure',
    costCue: 'Adventure packs often add ~$15–50 depending on activity',
    checks: [
      'Altitude or remote-area limits',
      'Guided vs independent trekking rules',
      'Search-and-rescue / evacuation wording',
    ],
  },
  {
    id: 'multi-city',
    label: 'Multi-city',
    costCue: 'Usually no extra premium if destinations are listed',
    checks: [
      'All Vietnam destinations on the itinerary',
      'Side trips to neighbouring countries',
      'Cover while in transit between cities',
    ],
  },
  {
    id: 'equipment',
    label: 'Expensive equipment',
    costCue: 'Gadget riders often +$10–30 for higher single-item limits',
    checks: [
      'Single-item limits for cameras / laptops',
      'Theft from rooms or vehicles',
      'Whether a separate gadget policy is needed',
    ],
  },
  {
    id: 'families',
    label: 'Families',
    costCue: 'Family policies can be cheaper per person than buying separately',
    checks: [
      'Named travellers and ages',
      'Child medical limits',
      'Cancellation cover for family bookings',
    ],
  },
]

export const COVERAGE_MATRIX = [
  { id: 'medical', label: 'Medical' },
  { id: 'cancel', label: 'Cancellation' },
  { id: 'baggage', label: 'Baggage' },
  { id: 'activities', label: 'Activities' },
  { id: 'evac', label: 'Evacuation' },
  { id: 'delays', label: 'Delays' },
] as const

/** Simple multipliers to show how trip length shifts typical premiums */
export const TRIP_LENGTH_COST_FACTOR: Record<'short' | 'medium' | 'long', number> = {
  short: 1,
  medium: 1.45,
  long: 2.1,
}
