import { cityImages } from './cityImages'

export type CityStyleMeter = {
  label: string
  level: number // 1–5
}

export type CityVibeSignal = {
  emoji: string
  label: string
}

export type CityDaySketch = {
  label: string
  beats: string[]
  image: string
}

export type ExploreCity = {
  id: string
  name: string
  /** Matches Experience.region */
  region: string
  /** Concise memorable identity, e.g. "🇻🇳 MUST VISIT" */
  identityTag: string
  tagline: string
  whyChoose: string
  bestFor: string[]
  experienceDensity: 'High' | 'Medium' | 'Low'
  recommendedStay: string
  typicalPace: string
  styleMeters: CityStyleMeter[]
  vibeSignals: CityVibeSignal[]
  images: string[]
  daySketch: CityDaySketch[]
  daySketchLabel: string
  /** Preferred filter chip ids derived from city character; engine still prunes by data */
  preferredFilters: string[]
  arrivalHub?: boolean
}

function imgs(id: string) {
  return cityImages(id)
}

function day(label: string, beats: string[], image: string): CityDaySketch {
  return { label, beats, image }
}

export const EXPLORE_CITIES: ExploreCity[] = [
  {
    id: 'hanoi',
    name: 'Hanoi',
    region: 'Hanoi',
    identityTag: '🇻🇳 MUST VISIT',
    tagline: "Vietnam's historic, food-filled capital.",
    whyChoose:
      'Dense culture, street food and walkable old streets make Hanoi a natural base for exploring Northern Vietnam.',
    bestFor: ['Culture', 'Food', 'History', 'City Life'],
    experienceDensity: 'High',
    recommendedStay: '2–4 days',
    typicalPace: 'Moderate',
    styleMeters: [
      { label: 'Culture', level: 5 },
      { label: 'Food', level: 5 },
      { label: 'Nightlife', level: 4 },
      { label: 'Adventure', level: 3 },
    ],
    vibeSignals: [
      { emoji: '🍜', label: 'Food' },
      { emoji: '🏯', label: 'History' },
      { emoji: '🌙', label: 'Nightlife' },
      { emoji: '☕', label: 'Local culture' },
    ],
    images: imgs('hanoi'),
    daySketchLabel: 'A feel for 3 days here',
    daySketch: [
      day('Day 1', ['History', 'Food', 'Old Quarter'], imgs('hanoi')[0]),
      day('Day 2', ['Local culture', 'Major site', 'Evening'], imgs('hanoi')[2]),
      day('Day 3', ['Day trip', 'Local food', 'City experience'], imgs('hanoi')[4]),
    ],
    preferredFilters: [
      'most-popular',
      'must-do',
      'hidden-gem',
      'food',
      'history',
      'museums',
      'nightlife',
      'local-life',
      'short',
    ],
    arrivalHub: true,
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Binh',
    region: 'Ninh Binh',
    identityTag: '🌿 KNOWN FOR KARST LANDSCAPES',
    tagline: 'Limestone valleys, rivers, and quiet countryside days.',
    whyChoose:
      'A scenic nature pocket within easy reach of Hanoi — strong if you want outdoors without a long hop.',
    bestFor: ['Nature', 'Adventure', 'Photography'],
    experienceDensity: 'Medium',
    recommendedStay: '1–2 days',
    typicalPace: 'Relaxed to moderate',
    styleMeters: [
      { label: 'Nature', level: 5 },
      { label: 'Adventure', level: 4 },
      { label: 'Culture', level: 3 },
      { label: 'Food', level: 3 },
    ],
    vibeSignals: [
      { emoji: '🚣', label: 'Rivers' },
      { emoji: '🏔', label: 'Karsts' },
      { emoji: '📸', label: 'Views' },
      { emoji: '🌿', label: 'Nature' },
    ],
    images: imgs('ninh-binh'),
    daySketchLabel: 'A feel for 2 days here',
    daySketch: [
      day('Day 1', ['Boat ride', 'Landscapes', 'Local lunch'], imgs('ninh-binh')[1]),
      day('Day 2', ['Countryside', 'Temple', 'Golden hour'], imgs('ninh-binh')[3]),
    ],
    preferredFilters: ['must-do', 'nature', 'adventure', 'picture-perfect', 'hidden-gem', 'full-day'],
  },
  {
    id: 'ha-long',
    name: 'Ha Long',
    region: 'Quang Ninh',
    identityTag: '🛥 ICONIC BAY CRUISES',
    tagline: 'Karst seascape, overnight boats, and island edges.',
    whyChoose:
      'Iconic Vietnam water scenery — worth the time if bay days are a priority for your trip.',
    bestFor: ['Nature', 'Boats', 'Photography'],
    experienceDensity: 'Medium',
    recommendedStay: '1–2 days',
    typicalPace: 'Moderate',
    styleMeters: [
      { label: 'Nature', level: 5 },
      { label: 'Adventure', level: 4 },
      { label: 'Beach', level: 3 },
      { label: 'Culture', level: 2 },
    ],
    vibeSignals: [
      { emoji: '🛥', label: 'Cruises' },
      { emoji: '🏔', label: 'Karsts' },
      { emoji: '🛶', label: 'Kayak' },
      { emoji: '📸', label: 'Views' },
    ],
    images: imgs('ha-long'),
    daySketchLabel: 'A feel for 2 days here',
    daySketch: [
      day('Day 1', ['Bay cruise', 'Karsts', 'Onboard dinner'], imgs('ha-long')[0]),
      day('Day 2', ['Island edge', 'Kayak', 'Return'], imgs('ha-long')[2]),
    ],
    preferredFilters: ['must-do', 'vietnam-special', 'nature', 'adventure', 'picture-perfect', 'full-day'],
  },
  {
    id: 'ha-giang',
    name: 'Ha Giang',
    region: 'Ha Giang',
    identityTag: '🏍 THE ADVENTURE CHOICE',
    tagline: 'Mountain roads, highland villages, and big-sky loops.',
    whyChoose:
      'Best for travelers who want adventure and landscape over city density.',
    bestFor: ['Adventure', 'Nature', 'Motorbike'],
    experienceDensity: 'Medium',
    recommendedStay: '2–4 days',
    typicalPace: 'Active',
    styleMeters: [
      { label: 'Adventure', level: 5 },
      { label: 'Nature', level: 5 },
      { label: 'Culture', level: 3 },
      { label: 'Food', level: 2 },
    ],
    vibeSignals: [
      { emoji: '🏍', label: 'Loop roads' },
      { emoji: '🏔', label: 'Passes' },
      { emoji: '🏡', label: 'Villages' },
      { emoji: '📸', label: 'Viewpoints' },
    ],
    images: imgs('ha-giang'),
    daySketchLabel: 'A feel for 3 days here',
    daySketch: [
      day('Day 1', ['Passes', 'Village', 'Homestay'], imgs('ha-giang')[0]),
      day('Day 2', ['Loop roads', 'Viewpoints', 'Quiet night'], imgs('ha-giang')[1]),
      day('Day 3', ['Morning light', 'Local stop', 'Onward'], imgs('ha-giang')[2]),
    ],
    preferredFilters: ['must-do', 'adventure', 'nature', 'picture-perfect', 'hidden-gem', 'full-day'],
  },
  {
    id: 'sapa',
    name: 'Sapa',
    region: 'Sapa',
    identityTag: '🌾 TERRACES & HIGHLAND WALKS',
    tagline: 'Terraced hills, cool air, and highland walks.',
    whyChoose:
      'A slower mountain base when you want nature and local culture without a full loop itinerary.',
    bestFor: ['Nature', 'Trekking', 'Culture'],
    experienceDensity: 'Medium',
    recommendedStay: '2–3 days',
    typicalPace: 'Relaxed to active',
    styleMeters: [
      { label: 'Nature', level: 5 },
      { label: 'Culture', level: 4 },
      { label: 'Adventure', level: 4 },
      { label: 'Food', level: 3 },
    ],
    vibeSignals: [
      { emoji: '🌾', label: 'Terraces' },
      { emoji: '🥾', label: 'Treks' },
      { emoji: '🏡', label: 'Villages' },
      { emoji: '☕', label: 'Cool town' },
    ],
    images: imgs('sapa'),
    daySketchLabel: 'A feel for 2 days here',
    daySketch: [
      day('Day 1', ['Valley walk', 'Village', 'Town evening'], imgs('sapa')[0]),
      day('Day 2', ['Ridges', 'Local food', 'Return'], imgs('sapa')[2]),
    ],
    preferredFilters: ['must-do', 'nature', 'slow-scenic', 'adventure', 'local-life', 'full-day'],
  },
  {
    id: 'hue',
    name: 'Hue',
    region: 'Hue',
    identityTag: '🏯 THE IMPERIAL CITY',
    tagline: 'Imperial citadel, river calm, and royal cuisine.',
    whyChoose:
      'History-heavy and atmospheric — a strong stop between north and central beach towns.',
    bestFor: ['History', 'Culture', 'Food'],
    experienceDensity: 'Medium',
    recommendedStay: '1–2 days',
    typicalPace: 'Moderate',
    styleMeters: [
      { label: 'History', level: 5 },
      { label: 'Culture', level: 4 },
      { label: 'Food', level: 4 },
      { label: 'Nightlife', level: 2 },
    ],
    vibeSignals: [
      { emoji: '🏯', label: 'Citadel' },
      { emoji: '🍜', label: 'Hue food' },
      { emoji: '🌊', label: 'River' },
      { emoji: '🪦', label: 'Tombs' },
    ],
    images: imgs('hue'),
    daySketchLabel: 'A feel for 2 days here',
    daySketch: [
      day('Day 1', ['Citadel', 'Hue food', 'River'], imgs('hue')[0]),
      day('Day 2', ['Tombs', 'Slow morning', 'South'], imgs('hue')[3]),
    ],
    preferredFilters: ['must-do', 'history', 'culture', 'food', 'museums', 'hidden-gem'],
  },
  {
    id: 'hoi-an',
    name: 'Hoi An',
    region: 'Hoi An',
    identityTag: '🏮 FAMOUS FOR LANTERNS & OLD-TOWN NIGHTS',
    tagline: 'Lantern streets, riverside evenings, and craft culture.',
    whyChoose:
      'Compact, photogenic, and easy to love — often deserves 2–3 nights in a central Vietnam plan.',
    bestFor: ['Culture', 'Food', 'Evening', 'Crafts'],
    experienceDensity: 'High',
    recommendedStay: '2–3 days',
    typicalPace: 'Relaxed',
    styleMeters: [
      { label: 'Culture', level: 5 },
      { label: 'Food', level: 5 },
      { label: 'Beach', level: 3 },
      { label: 'Nightlife', level: 3 },
    ],
    vibeSignals: [
      { emoji: '🏮', label: 'Lanterns' },
      { emoji: '🍜', label: 'Food' },
      { emoji: '🧵', label: 'Crafts' },
      { emoji: '🏖', label: 'Beach' },
    ],
    images: imgs('hoi-an'),
    daySketchLabel: 'A feel for 3 days here',
    daySketch: [
      day('Day 1', ['Old Town', 'Food', 'Lanterns'], imgs('hoi-an')[1]),
      day('Day 2', ['Crafts', 'Beach', 'Cafe'], imgs('hoi-an')[4]),
      day('Day 3', ['Countryside', 'Cooking', 'Evening'], imgs('hoi-an')[0]),
    ],
    preferredFilters: [
      'must-do',
      'old-town',
      'food',
      'beach',
      'crafts',
      'hidden-gem',
      'evening',
      'culture',
    ],
  },
  {
    id: 'da-nang',
    name: 'Da Nang',
    region: 'Da Nang',
    identityTag: '🏖 FAMOUS FOR BEACHES & COASTAL ESCAPES',
    tagline: 'Beach city base with day trips and easy logistics.',
    whyChoose:
      'Practical hub for My Khe mornings and Hoi An / Marble Mountain days.',
    bestFor: ['Beaches', 'City', 'Day Trips'],
    experienceDensity: 'Medium',
    recommendedStay: '2–3 days',
    typicalPace: 'Balanced',
    styleMeters: [
      { label: 'Beach', level: 5 },
      { label: 'Adventure', level: 4 },
      { label: 'City', level: 4 },
      { label: 'Food', level: 4 },
    ],
    vibeSignals: [
      { emoji: '🏖', label: 'Beaches' },
      { emoji: '🏔', label: 'Day trips' },
      { emoji: '🍜', label: 'Seafood' },
      { emoji: '🌆', label: 'City nights' },
    ],
    images: imgs('da-nang'),
    daySketchLabel: 'A feel for 2 days here',
    daySketch: [
      day('Day 1', ['Beach', 'Seafood', 'Bridge night'], imgs('da-nang')[0]),
      day('Day 2', ['Day trip', 'Cafe', 'City'], imgs('da-nang')[2]),
    ],
    preferredFilters: ['must-do', 'beaches', 'adventure', 'food', 'nature', 'city', 'day-trips'],
    arrivalHub: true,
  },
  {
    id: 'phong-nha',
    name: 'Phong Nha',
    region: 'Phong Nha',
    identityTag: '🕳 CAVE COUNTRY',
    tagline: 'Cave country and jungle-edge adventure.',
    whyChoose:
      'Worth a dedicated stop if caves and nature are high on your list — less of a city detour.',
    bestFor: ['Adventure', 'Nature', 'Caves'],
    experienceDensity: 'Medium',
    recommendedStay: '2–3 days',
    typicalPace: 'Active',
    styleMeters: [
      { label: 'Adventure', level: 5 },
      { label: 'Nature', level: 5 },
      { label: 'Culture', level: 2 },
      { label: 'Food', level: 2 },
    ],
    vibeSignals: [
      { emoji: '🕳', label: 'Caves' },
      { emoji: '🌿', label: 'Jungle' },
      { emoji: '🛶', label: 'River' },
      { emoji: '🥾', label: 'Trails' },
    ],
    images: imgs('phong-nha'),
    daySketchLabel: 'A feel for 2 days here',
    daySketch: [
      day('Day 1', ['Cave', 'Jungle', 'Town'], imgs('phong-nha')[0]),
      day('Day 2', ['River', 'Trail', 'Quiet'], imgs('phong-nha')[2]),
    ],
    preferredFilters: ['must-do', 'adventure', 'nature', 'hidden-gem', 'full-day'],
  },
  {
    id: 'hcmc',
    name: 'Ho Chi Minh City',
    region: 'Ho Chi Minh City',
    identityTag: "🌆 VIETNAM'S MODERN HEART",
    tagline: 'Energy, museums, markets, and southern gateway days.',
    whyChoose:
      'Ideal southern hub for city culture and Mekong add-ons — dense and efficient.',
    bestFor: ['Cities', 'History', 'Food', 'Nightlife'],
    experienceDensity: 'High',
    recommendedStay: '2–4 days',
    typicalPace: 'Packed to moderate',
    styleMeters: [
      { label: 'City', level: 5 },
      { label: 'Food', level: 5 },
      { label: 'History', level: 4 },
      { label: 'Nightlife', level: 5 },
    ],
    vibeSignals: [
      { emoji: '🏛', label: 'Museums' },
      { emoji: '🍜', label: 'Street food' },
      { emoji: '🛒', label: 'Markets' },
      { emoji: '🌃', label: 'Nightlife' },
    ],
    images: imgs('hcmc'),
    daySketchLabel: 'A feel for 3 days here',
    daySketch: [
      day('Day 1', ['Museums', 'Street food', 'Skyline'], imgs('hcmc')[0]),
      day('Day 2', ['Markets', 'Cafe', 'Evening'], imgs('hcmc')[1]),
      day('Day 3', ['Day trip', 'Local meal', 'District walk'], imgs('hcmc')[2]),
    ],
    preferredFilters: [
      'most-popular',
      'must-do',
      'history',
      'food',
      'nightlife',
      'museums',
      'city',
      'short',
    ],
    arrivalHub: true,
  },
  {
    id: 'mekong',
    name: 'Mekong Delta',
    region: 'Mekong',
    identityTag: '🛶 RIVERS & FLOATING MARKETS',
    tagline: 'Rivers, floating markets, and soft southern days.',
    whyChoose:
      'A change of pace from HCMC — best as a day trip or overnight if you want waterways.',
    bestFor: ['Nature', 'Local Life', 'Food'],
    experienceDensity: 'Low',
    recommendedStay: '1–2 days',
    typicalPace: 'Relaxed',
    styleMeters: [
      { label: 'Nature', level: 4 },
      { label: 'Local life', level: 5 },
      { label: 'Food', level: 4 },
      { label: 'Adventure', level: 2 },
    ],
    vibeSignals: [
      { emoji: '🛶', label: 'Waterways' },
      { emoji: '🥭', label: 'Markets' },
      { emoji: '🏡', label: 'Villages' },
      { emoji: '🌿', label: 'Slow days' },
    ],
    images: imgs('mekong'),
    daySketchLabel: 'A feel for 1–2 days here',
    daySketch: [
      day('Day 1', ['Waterways', 'Markets', 'Village'], imgs('mekong')[0]),
      day('Day 2', ['Slow morning', 'Back to city'], imgs('mekong')[1]),
    ],
    preferredFilters: ['must-do', 'local-life', 'food', 'nature', 'slow-scenic', 'full-day'],
  },
  {
    id: 'phu-quoc',
    name: 'Phu Quoc',
    region: 'Phu Quoc',
    identityTag: '🏝 ISLAND BEACH RESET',
    tagline: 'Island beaches, snorkel days, and soft endings.',
    whyChoose:
      'A beach reset at the end of a Vietnam trip — plan flights or ferries into the logistics.',
    bestFor: ['Beaches', 'Snorkel', 'Relaxation'],
    experienceDensity: 'Medium',
    recommendedStay: '3–5 days',
    typicalPace: 'Relaxed',
    styleMeters: [
      { label: 'Beach', level: 5 },
      { label: 'Adventure', level: 3 },
      { label: 'Food', level: 3 },
      { label: 'Nightlife', level: 3 },
    ],
    vibeSignals: [
      { emoji: '🏖', label: 'Beaches' },
      { emoji: '🤿', label: 'Snorkel' },
      { emoji: '🍹', label: 'Sunset' },
      { emoji: '🍽', label: 'Seafood' },
    ],
    images: imgs('phu-quoc'),
    daySketchLabel: 'A feel for 3 days here',
    daySketch: [
      day('Day 1', ['Beach', 'Sunset', 'Seafood'], imgs('phu-quoc')[0]),
      day('Day 2', ['Snorkel', 'Island', 'Quiet'], imgs('phu-quoc')[1]),
      day('Day 3', ['Market', 'Slow beach', 'Onward'], imgs('phu-quoc')[2]),
    ],
    preferredFilters: ['must-do', 'beaches', 'nature', 'adventure', 'slow-scenic', 'food'],
  },
]

export type CityFilterChip = {
  id: string
  label: string
  emoji?: string
}

/** Global Explore All Vietnam chips */
export const GLOBAL_SIGNAL_CHIPS: CityFilterChip[] = [
  { id: 'must-do', label: 'Must Do', emoji: '🔥' },
  { id: 'vietnam-special', label: 'Vietnam Specials', emoji: '🇻🇳' },
  { id: 'most-popular', label: 'Most Popular', emoji: '⭐' },
  { id: 'hidden-gem', label: 'Hidden Gems', emoji: '💎' },
  { id: 'adventure', label: 'Most Exciting', emoji: '⚡' },
  { id: 'picture-perfect', label: 'Picture Perfect', emoji: '📸' },
  { id: 'slow-scenic', label: 'Slow & Scenic', emoji: '🌿' },
  { id: 'local-life', label: 'Local Life', emoji: '🏮' },
]

export const GLOBAL_CATEGORY_CHIPS: CityFilterChip[] = [
  { id: 'cat-Nature', label: 'Nature' },
  { id: 'cat-Culture', label: 'Culture' },
  { id: 'cat-History', label: 'History' },
  { id: 'cat-Museums', label: 'Museums' },
  { id: 'cat-Beaches', label: 'Beaches' },
  { id: 'cat-Food', label: 'Food' },
  { id: 'cat-Nightlife', label: 'Nightlife' },
  { id: 'cat-Adventure', label: 'Adventure' },
  { id: 'cat-Cities', label: 'Cities' },
]

export const GLOBAL_PRACTICAL_CHIPS: CityFilterChip[] = [
  { id: 'short', label: 'Short Experiences' },
  { id: 'full-day', label: 'Full Day' },
  { id: 'best-value', label: 'Best Value' },
  { id: 'accessible', label: 'Accessibility Friendly' },
]

const FILTER_LABELS: Record<string, string> = {
  'most-popular': 'Most Popular',
  'must-do': 'Must Do',
  'vietnam-special': 'Vietnam Specials',
  'hidden-gem': 'Hidden Gems',
  food: 'Food',
  history: 'History',
  museums: 'Museums',
  nightlife: 'Nightlife',
  'local-life': 'Local Life',
  short: 'Short Visits',
  nature: 'Nature',
  adventure: 'Adventure',
  'picture-perfect': 'Picture Perfect',
  'slow-scenic': 'Slow & Scenic',
  'full-day': 'Full Day',
  'old-town': 'Old Town',
  beach: 'Beach',
  beaches: 'Beaches',
  crafts: 'Crafts',
  evening: 'Evening',
  culture: 'Culture',
  city: 'City',
  'day-trips': 'Day Trips',
}

export function filterChipLabel(id: string) {
  return FILTER_LABELS[id] ?? id
}

export function getCityById(id: string) {
  return EXPLORE_CITIES.find((c) => c.id === id)
}

export function getCityByRegion(region: string) {
  return EXPLORE_CITIES.find((c) => c.region === region)
}
