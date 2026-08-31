import type { MonthId } from './months'
import { CATALOG_EXTRA_ITEMS } from './catalogItemsExtra'

export type HappenType = 'event' | 'seasonal' | 'must-visit'

export type HappenCity =
  | 'All Vietnam'
  | 'Hanoi'
  | 'Ha Long'
  | 'Sapa'
  | 'Ninh Binh'
  | 'Hue'
  | 'Hoi An'
  | 'Da Nang'
  | 'Da Lat'
  | 'Nha Trang'
  | 'Ho Chi Minh City'
  | 'Can Tho'
  | 'Phu Quoc'

export type CrowdBand = 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
export type CrowdType = 'typical' | 'current'

export type HappenItem = {
  id: string
  type: HappenType
  name: string
  city: HappenCity
  region: string
  image: string
  date?: string
  dateRange?: string
  /** Prominent date chip shown on cards */
  dateDisplay: string
  duration: string
  cost: string
  crowdLevel: CrowdBand
  crowdType: CrowdType
  /** Only set when crowdType === 'current' — never fabricate */
  crowdUpdatedAt?: string
  /** Typical peak window when using typical crowd */
  typicalPeak?: string
  bestTime: string
  /** Short why-this-month signal (decision-critical) */
  whyThisMonth: string
  /** Expandable context capsule */
  whyItMatters: string
  timeValue: 1 | 2 | 3 | 4 | 5
  rating?: number
  popularity: number
  featured?: boolean
  months: MonthId[]
  latitude: number
  longitude: number
  /** Optional link into existing experience detail */
  experienceId?: string
  /** Curated topic tags for the month-by-month catalog */
  catalogTags?: string[]
}

/** Authoring shape — enriched into HappenItem at read time */
export type HappenItemDraft = Omit<
  HappenItem,
  'dateDisplay' | 'crowdLevel' | 'crowdType' | 'whyThisMonth'
> & {
  crowdLevel: string
  crowdType?: CrowdType
  whyThisMonth?: string
  monthRelevance: string
  hook?: string
  dateDisplay?: string
  typicalPeak?: string
  crowdUpdatedAt?: string
}

export type CityPulse = {
  city: Exclude<HappenCity, 'All Vietnam'>
  count: number
  intensity: 1 | 2 | 3
}

export type MonthHappenGlance = {
  temperature: string
  rain: string
  crowds: string
  cost: string
  majorEventsLabel: string
  bestRegions: string[]
}

const img = {
  lantern:
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
  festival:
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  haLong:
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  rice:
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  beach:
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
  temple:
    'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80',
  market:
    'https://images.unsplash.com/photo-1509030450996-3a5ea825872b?auto=format&fit=crop&w=1200&q=80',
  city:
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  boat:
    'https://images.unsplash.com/photo-1509030450996-3a5ea825872b?auto=format&fit=crop&w=1200&q=80',
  highland:
    'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80',
}

/** Curated month highlights — intentionally limited, not a full directory. */
export const HAPPEN_ITEMS: HappenItemDraft[] = [
  // ——— October (featured example) ———
  {
    id: 'oct-lantern',
    type: 'event',
    name: 'Hoi An Lantern Festival',
    city: 'Hoi An',
    region: 'Central Coast',
    image: img.lantern,
    date: 'Oct 14',
    dateDisplay: '14–15 OCT',
    dateRange: 'Full-moon evenings',
    duration: '2–3 hrs',
    cost: 'Free',
    crowdLevel: 'High',
    bestTime: 'After sunset',
    monthRelevance: 'Annual full-moon highlight',
    hook: 'Lantern-lit streets and a livelier old town atmosphere.',
    whyThisMonth: 'Annual lantern atmosphere at its strongest.',
    whyItMatters:
      'Lantern festivals are part of Hoi An’s distinctive evening culture, transforming the riverfront and old town after dark. It is one of the clearest reasons to time evenings here in October.',
    timeValue: 5,
    popularity: 95,
    featured: true,
    months: [10],
    latitude: 15.88,
    longitude: 108.33,
  },
  {
    id: 'oct-hue-citadel',
    type: 'must-visit',
    name: 'Hue Imperial Citadel',
    city: 'Hue',
    region: 'Central Coast',
    image: img.temple,
    duration: 'Half day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Dryer conditions make exploring easier',
    hook: 'Wide courtyards feel more comfortable as rains ease.',
    whyItMatters:
      'Hue’s imperial complex rewards unhurried walking. October’s clearer stretch makes outdoor palace time far more pleasant than peak wet months.',
    timeValue: 5,
    popularity: 88,
    months: [10, 11],
    latitude: 16.47,
    longitude: 107.58,
  },
  {
    id: 'oct-danang-beach',
    type: 'seasonal',
    name: 'Da Nang Beach Evenings',
    city: 'Da Nang',
    region: 'Central Coast',
    image: img.beach,
    duration: '2–4 hrs',
    cost: 'Free–$',
    crowdLevel: 'Moderate',
    bestTime: 'Late afternoon',
    monthRelevance: 'Excellent evening conditions',
    hook: 'Sea air and soft light as the wet season loosens its grip.',
    whyItMatters:
      'October often brings more reliable late-day beach weather along the central coast — ideal for an easy coastal evening without midsummer heat.',
    timeValue: 4,
    popularity: 80,
    months: [10],
    latitude: 16.05,
    longitude: 108.2,
  },
  {
    id: 'oct-hanoi-old',
    type: 'seasonal',
    name: 'Hanoi Old Quarter Walk',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    image: img.city,
    duration: '2–3 hrs',
    cost: 'Free–$',
    crowdLevel: 'Busy',
    bestTime: 'Late afternoon',
    monthRelevance: 'Best atmosphere this month',
    hook: 'Comfortable evenings for street food and alley wandering.',
    whyItMatters:
      'Cooler nights return in autumn, making Hanoi’s densest neighbourhoods more inviting for a long, unhurried walk.',
    timeValue: 4,
    popularity: 86,
    months: [10, 11],
    latitude: 21.03,
    longitude: 105.85,
  },
  {
    id: 'oct-ninhbinh',
    type: 'must-visit',
    name: 'Ninh Binh River Landscapes',
    city: 'Ninh Binh',
    region: 'Northern Vietnam',
    image: img.boat,
    duration: 'Full day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Seasonal highlight for photography',
    hook: 'Limestone valleys and quieter boat routes after summer rains.',
    whyItMatters:
      'Post-wet-season greens and softer light make Ninh Binh especially photogenic — a high-value day trip from Hanoi in October.',
    timeValue: 5,
    popularity: 84,
    months: [10, 11],
    latitude: 20.25,
    longitude: 105.97,
  },
  {
    id: 'oct-midautumn',
    type: 'event',
    name: 'Mid-Autumn Street Energy',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    image: img.festival,
    date: 'Around full moon',
    duration: 'Evening',
    cost: 'Free–$',
    crowdLevel: 'High',
    bestTime: 'Evening',
    monthRelevance: 'Seasonal cultural highlight',
    hook: 'Lanterns, mooncakes and lively neighbourhood streets.',
    whyItMatters:
      'Even when dates shift slightly, October often carries Mid-Autumn atmosphere — a memorable evening layer on top of ordinary city exploring.',
    timeValue: 4,
    popularity: 78,
    months: [9, 10],
    latitude: 21.03,
    longitude: 105.85,
  },

  // ——— March / April peak ———
  {
    id: 'mar-halong',
    type: 'must-visit',
    name: 'Ha Long Bay Overnight',
    city: 'Ha Long',
    region: 'Quang Ninh',
    image: img.haLong,
    duration: '1–2 days',
    cost: '$$$',
    crowdLevel: 'Busy',
    bestTime: 'Full day start',
    monthRelevance: 'Excellent conditions nationwide',
    hook: 'Clearer skies for karst views and calm overnight cruises.',
    whyItMatters:
      'March sits in Vietnam’s strongest overall travel window — Ha Long rewards the clearer weather with reliable scenery and smoother logistics.',
    timeValue: 5,
    popularity: 96,
    featured: true,
    months: [3, 4],
    latitude: 20.91,
    longitude: 107.18,
    catalogTags: ['Scenic', 'Adventure', 'Nature'],
  },
  {
    id: 'mar-hoian-evening',
    type: 'seasonal',
    name: 'Hoi An Old Town After Dark',
    city: 'Hoi An',
    region: 'Central Coast',
    image: img.lantern,
    duration: '2–3 hrs',
    cost: 'Free–$',
    crowdLevel: 'Busy',
    bestTime: 'After sunset',
    monthRelevance: 'Best atmosphere this month',
    hook: 'Warm evenings without wet-season interruptions.',
    whyItMatters:
      'Dry-season evenings are one of Hoi An’s strongest draws — lantern streets feel intentional rather than rushed between showers.',
    timeValue: 5,
    popularity: 92,
    months: [3, 4],
    latitude: 15.88,
    longitude: 108.33,
  },
  {
    id: 'apr-mekong',
    type: 'seasonal',
    name: 'Mekong Delta Day Trip',
    city: 'Ho Chi Minh City',
    region: 'Mekong Delta',
    image: img.boat,
    duration: 'Full day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Early morning',
    monthRelevance: 'Still a strong dry-season window',
    hook: 'River markets and orchards before peak heat intensifies.',
    whyItMatters:
      'April remains workable for delta boat days if you start early — a classic southern day trip before heavier rains return.',
    timeValue: 4,
    popularity: 81,
    months: [3, 4],
    latitude: 10.45,
    longitude: 106.35,
  },
  {
    id: 'mar-hue',
    type: 'must-visit',
    name: 'Hue Royal Tombs Circuit',
    city: 'Hue',
    region: 'Central Coast',
    image: img.temple,
    duration: 'Half–full day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Comfortable sightseeing weather',
    hook: 'Palace gardens and riverside tombs without extreme heat.',
    whyItMatters:
      'Hue’s outdoor heritage sites feel more rewarding when temperatures stay mild — March–April is an easy fit.',
    timeValue: 4,
    popularity: 83,
    months: [3, 4],
    latitude: 16.46,
    longitude: 107.58,
  },
  {
    id: 'apr-danang',
    type: 'seasonal',
    name: 'Central Coast Beach Day',
    city: 'Da Nang',
    region: 'Central Coast',
    image: img.beach,
    duration: 'Half day',
    cost: 'Free–$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning or late day',
    monthRelevance: 'Reliable coastal conditions',
    hook: 'Bright beach weather paired with easy city logistics.',
    whyItMatters:
      'This window pairs beach time with culture without forcing a pure beach holiday — ideal for multi-stop trips.',
    timeValue: 4,
    popularity: 85,
    months: [3, 4],
    latitude: 16.05,
    longitude: 108.2,
  },

  // ——— January / February ———
  {
    id: 'jan-tet-prep',
    type: 'event',
    name: 'Tết Preparations in Hanoi',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    image: img.market,
    date: 'Late Jan–early Feb',
    dateRange: 'Pre-Tết weeks',
    duration: '2–4 hrs',
    cost: 'Free–$',
    crowdLevel: 'Busy',
    bestTime: 'Daytime markets',
    monthRelevance: 'Festive seasonal energy',
    hook: 'Flower markets and New Year atmosphere building citywide.',
    whyItMatters:
      'January’s pre-Tết weeks are uniquely atmospheric — peach blossoms, kumquat trees and denser market energy than ordinary winter days.',
    timeValue: 4,
    popularity: 90,
    featured: true,
    months: [1, 2],
    latitude: 21.03,
    longitude: 105.85,
  },
  {
    id: 'feb-tet',
    type: 'event',
    name: 'Tết Holiday Atmosphere',
    city: 'Ho Chi Minh City',
    region: 'Southeast',
    image: img.festival,
    date: 'Lunar New Year',
    duration: 'Evenings',
    cost: 'Free',
    crowdLevel: 'Peak',
    bestTime: 'Evening',
    monthRelevance: 'Annual cultural highlight',
    hook: 'City celebrations with festive lighting and family energy.',
    whyItMatters:
      'Tết transforms Vietnam’s cities — expect closures and peak demand, but also the year’s most distinctive festive mood.',
    timeValue: 5,
    popularity: 94,
    featured: true,
    months: [2],
    latitude: 10.78,
    longitude: 106.7,
  },
  {
    id: 'jan-sapa',
    type: 'seasonal',
    name: 'Northern Mountain Loop',
    city: 'Sapa',
    region: 'Lao Cai Highlands',
    image: img.highland,
    duration: '2–3 days',
    cost: '$$$',
    crowdLevel: 'Moderate',
    bestTime: 'Clear mornings',
    monthRelevance: 'Cool highland conditions',
    hook: 'Crisp air and dramatic winter light in the hills.',
    whyItMatters:
      'January’s cool highland weather suits trekking and terrace views — pack layers and expect misty mornings.',
    timeValue: 4,
    popularity: 82,
    months: [1, 12],
    latitude: 22.34,
    longitude: 103.84,
  },
  {
    id: 'jan-mekong-dry',
    type: 'must-visit',
    name: 'Dry-Season Mekong Boats',
    city: 'Ho Chi Minh City',
    region: 'Mekong Delta',
    image: img.boat,
    duration: 'Full day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Excellent dry-season window',
    hook: 'Easy river days before humidity climbs.',
    whyItMatters:
      'The dry season remains one of the delta’s most reliable travel windows for first-time visitors.',
    timeValue: 4,
    popularity: 79,
    months: [1, 2],
    latitude: 10.45,
    longitude: 106.35,
  },

  // ——— Quiet / wetter months fallbacks ———
  {
    id: 'jun-museums',
    type: 'seasonal',
    name: 'Hanoi Museum & Café Circuit',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    image: img.city,
    duration: 'Half day',
    cost: '$–$$',
    crowdLevel: 'Lighter',
    bestTime: 'Midday',
    monthRelevance: 'Great indoor pacing around showers',
    hook: 'Culture-rich city time when outdoor plans stay flexible.',
    whyItMatters:
      'Wetter months reward flexible city days — museums and cafés keep the trip feeling full without fighting the rain.',
    timeValue: 3,
    popularity: 70,
    featured: true,
    months: [6, 7, 8],
    latitude: 21.03,
    longitude: 105.85,
  },
  {
    id: 'jul-food',
    type: 'seasonal',
    name: 'Saigon Street Food Night',
    city: 'Ho Chi Minh City',
    region: 'Southeast',
    image: img.market,
    duration: '2–3 hrs',
    cost: '$',
    crowdLevel: 'Busy',
    bestTime: 'Evening',
    monthRelevance: 'Always strong — rain-flexible',
    hook: 'Evening grazing when daytime heat and showers peak.',
    whyItMatters:
      'Food-led evenings are one of the best ways to enjoy HCMC in wetter months without needing perfect weather.',
    timeValue: 4,
    popularity: 88,
    months: [6, 7, 8, 9],
    latitude: 10.78,
    longitude: 106.7,
  },
  {
    id: 'aug-spa',
    type: 'seasonal',
    name: 'Central Highlands Cool Escape',
    city: 'Da Nang',
    region: 'Central Highlands',
    image: img.highland,
    duration: '1–2 days',
    cost: '$$',
    crowdLevel: 'Lighter',
    bestTime: 'Morning',
    monthRelevance: 'Cooler plateau alternative',
    hook: 'Escape lowland heat with pine air and quieter towns.',
    whyItMatters:
      'When coasts feel wetter or hotter, highland towns offer a calmer rhythm and cooler nights.',
    timeValue: 3,
    popularity: 72,
    months: [6, 7, 8, 9],
    latitude: 11.94,
    longitude: 108.44,
  },
  {
    id: 'sep-photography',
    type: 'must-visit',
    name: 'Rice Terrace Photography',
    city: 'Sapa',
    region: 'Lao Cai Highlands',
    image: img.rice,
    duration: '2–3 days',
    cost: '$$$',
    crowdLevel: 'Moderate',
    bestTime: 'Golden hour',
    monthRelevance: 'Seasonal harvest colour',
    hook: 'Late-summer greens shifting toward harvest tones.',
    whyItMatters:
      'September can catch dramatic terrace colour for photographers willing to accept changeable mountain weather.',
    timeValue: 4,
    popularity: 76,
    featured: true,
    months: [9],
    latitude: 22.34,
    longitude: 103.84,
  },
  {
    id: 'may-value-hanoi',
    type: 'seasonal',
    name: 'Hanoi Value Season Walks',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    image: img.city,
    duration: 'Half day',
    cost: '$',
    crowdLevel: 'Lighter',
    bestTime: 'Early morning',
    monthRelevance: 'Better value before peak heat',
    hook: 'Quieter temples and lakeside paths.',
    whyItMatters:
      'May often brings softer demand — a practical window for city exploring if you pace around midday heat.',
    timeValue: 3,
    popularity: 74,
    featured: true,
    months: [5],
    latitude: 21.03,
    longitude: 105.85,
  },
  {
    id: 'may-hoian',
    type: 'must-visit',
    name: 'Hoi An Tailor & Old Town',
    city: 'Hoi An',
    region: 'Central Coast',
    image: img.lantern,
    duration: 'Half day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Late afternoon',
    monthRelevance: 'Still strong before wetter weeks',
    hook: 'Lantern streets and fittings with shoulder-season space.',
    whyItMatters:
      'May can still deliver classic Hoi An evenings with slightly softer crowds than peak dry season.',
    timeValue: 4,
    popularity: 80,
    months: [5],
    latitude: 15.88,
    longitude: 108.33,
  },
  {
    id: 'may-hue',
    type: 'must-visit',
    name: 'Hue Citadel Morning Circuit',
    city: 'Hue',
    region: 'Central Coast',
    image: img.temple,
    duration: 'Half day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Start early around rising heat',
    hook: 'Palace courtyards before midday temperatures climb.',
    whyItMatters:
      'Hue rewards early starts in May — mornings remain workable even as the year warms.',
    timeValue: 4,
    popularity: 77,
    months: [5],
    latitude: 16.47,
    longitude: 107.58,
  },
  {
    id: 'may-danang',
    type: 'seasonal',
    name: 'Da Nang Coastline Stretch',
    city: 'Da Nang',
    region: 'Central Coast',
    image: img.beach,
    duration: '2–4 hrs',
    cost: 'Free–$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Coastal days still deliver',
    hook: 'Beach time paired with easy city logistics.',
    whyItMatters:
      'May remains a solid coastal month if you avoid the hottest midday hours.',
    timeValue: 3,
    popularity: 75,
    months: [5],
    latitude: 16.05,
    longitude: 108.2,
  },
  {
    id: 'may-ninhbinh',
    type: 'seasonal',
    name: 'Ninh Binh Boat Morning',
    city: 'Ninh Binh',
    region: 'Northern Vietnam',
    image: img.boat,
    duration: 'Half–full day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Lush landscapes, quieter demand',
    hook: 'River valleys with greener post-spring scenery.',
    whyItMatters:
      'Shoulder-season Ninh Binh often feels less crowded while staying photogenic.',
    timeValue: 4,
    popularity: 78,
    months: [5],
    latitude: 20.25,
    longitude: 105.97,
  },
  {
    id: 'wet-temple',
    type: 'must-visit',
    name: 'Hue Heritage Indoors & Out',
    city: 'Hue',
    region: 'Central Coast',
    image: img.temple,
    duration: 'Half day',
    cost: '$$',
    crowdLevel: 'Lighter',
    bestTime: 'Flexible',
    monthRelevance: 'Pace around showers',
    hook: 'Palace rooms and covered corridors when skies open.',
    whyItMatters:
      'Hue still rewards a focused half-day in wetter months if you keep timing flexible.',
    timeValue: 3,
    popularity: 68,
    months: [6, 7, 8],
    latitude: 16.47,
    longitude: 107.58,
  },
  {
    id: 'wet-hoian-rain',
    type: 'seasonal',
    name: 'Hoi An Covered Markets',
    city: 'Hoi An',
    region: 'Central Coast',
    image: img.market,
    duration: '2 hrs',
    cost: '$',
    crowdLevel: 'Moderate',
    bestTime: 'Daytime',
    monthRelevance: 'Rain-smart old town exploring',
    hook: 'Market lanes and cafés between showers.',
    whyItMatters:
      'Hoi An remains worthwhile in wetter weeks when you lean into covered streets and flexible evenings.',
    timeValue: 3,
    popularity: 71,
    months: [6, 7, 8, 9],
    latitude: 15.88,
    longitude: 108.33,
  },
  {
    id: 'wet-sg-museum',
    type: 'must-visit',
    name: 'HCMC Museum Cluster',
    city: 'Ho Chi Minh City',
    region: 'Southeast',
    image: img.city,
    duration: 'Half day',
    cost: '$–$$',
    crowdLevel: 'Moderate',
    bestTime: 'Midday',
    monthRelevance: 'Excellent indoor city day',
    hook: 'History and design when outdoor plans pause.',
    whyItMatters:
      'A compact museum circuit keeps a southern city day productive during wetter stretches.',
    timeValue: 3,
    popularity: 73,
    months: [6, 7, 8],
    latitude: 10.78,
    longitude: 106.7,
  },
  {
    id: 'sep-ninhbinh',
    type: 'seasonal',
    name: 'Ninh Binh Late-Green Season',
    city: 'Ninh Binh',
    region: 'Northern Vietnam',
    image: img.boat,
    duration: 'Full day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Lush scenery before peak autumn crowds',
    hook: 'Karst valleys still vividly green.',
    whyItMatters:
      'September’s greens make Ninh Binh feel cinematic — a strong day trip if weather cooperates.',
    timeValue: 4,
    popularity: 74,
    months: [9],
    latitude: 20.25,
    longitude: 105.97,
  },
  {
    id: 'sep-danang',
    type: 'seasonal',
    name: 'Da Nang Seafront Reset',
    city: 'Da Nang',
    region: 'Central Coast',
    image: img.beach,
    duration: 'Half day',
    cost: 'Free–$',
    crowdLevel: 'Lighter',
    bestTime: 'Late day',
    monthRelevance: 'Quieter coastal pacing',
    hook: 'Sea air without peak-season density.',
    whyItMatters:
      'Shoulder timing can mean more breathing room along the central coast.',
    timeValue: 3,
    popularity: 70,
    months: [9],
    latitude: 16.05,
    longitude: 108.2,
  },
  {
    id: 'sep-hue',
    type: 'must-visit',
    name: 'Hue Riverside Heritage',
    city: 'Hue',
    region: 'Central Coast',
    image: img.temple,
    duration: 'Half day',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Morning',
    monthRelevance: 'Worth timing around clearer windows',
    hook: 'Tombs and citadel when showers ease.',
    whyItMatters:
      'Hue still earns a place on September itineraries when you keep outdoor blocks flexible.',
    timeValue: 3,
    popularity: 69,
    months: [9],
    latitude: 16.47,
    longitude: 107.58,
  },
  {
    id: 'nov-hoian',
    type: 'event',
    name: 'Hoi An Full-Moon Lanterns',
    city: 'Hoi An',
    region: 'Central Coast',
    image: img.lantern,
    date: 'Full moon',
    dateDisplay: 'EVERY FULL-MOON EVENING',
    duration: '2–3 hrs',
    cost: 'Free',
    crowdLevel: 'High',
    bestTime: 'After sunset',
    monthRelevance: 'Annual evening highlight',
    whyThisMonth: 'Annual lantern atmosphere at its strongest.',
    hook: 'Peak lantern atmosphere in dry-season evenings.',
    whyItMatters:
      'November’s dry evenings make lantern nights especially reliable — one of Hoi An’s signature experiences.',
    timeValue: 5,
    popularity: 93,
    featured: true,
    months: [11],
    latitude: 15.88,
    longitude: 108.33,
  },
  {
    id: 'nov-halong',
    type: 'must-visit',
    name: 'Ha Long in Clear Season',
    city: 'Ha Long',
    region: 'Quang Ninh',
    image: img.haLong,
    dateDisplay: 'ANY DAY',
    duration: '1–2 days',
    cost: '$$$',
    crowdLevel: 'Busy',
    bestTime: 'Full day',
    monthRelevance: 'Prime visibility window',
    whyThisMonth: 'Clearer conditions make this route easier to enjoy.',
    hook: 'Crisp air and strong karst contrast.',
    whyItMatters:
      'Late dry season often delivers excellent bay visibility — book ahead for popular overnight boats.',
    timeValue: 5,
    popularity: 91,
    months: [11],
    latitude: 20.91,
    longitude: 107.18,
  },
  {
    id: 'nov-hue-festival',
    type: 'event',
    name: 'Hue Heritage Evenings',
    city: 'Hue',
    region: 'Central Coast',
    image: img.temple,
    date: 'Nov weekends',
    dateDisplay: 'THROUGHOUT NOVEMBER',
    duration: '2–3 hrs',
    cost: '$$',
    crowdLevel: 'Moderate',
    bestTime: 'Evening',
    monthRelevance: 'Cultural peak evenings',
    whyThisMonth: 'Major cultural celebrations amplify evening heritage visits.',
    hook: 'Citadel glow and riverside cultural programming.',
    whyItMatters:
      'November’s clearer evenings make Hue’s outdoor heritage circuit especially rewarding after dark.',
    timeValue: 4,
    popularity: 84,
    months: [11],
    latitude: 16.47,
    longitude: 107.58,
  },
  {
    id: 'nov-danang',
    type: 'seasonal',
    name: 'Da Nang Coastal Evenings',
    city: 'Da Nang',
    region: 'Central Coast',
    image: img.beach,
    dateDisplay: 'ONGOING',
    duration: '2–4 hrs',
    cost: 'Free–$',
    crowdLevel: 'Moderate',
    bestTime: 'Late afternoon',
    monthRelevance: 'Excellent dry-season evenings',
    whyThisMonth: 'Peak seasonal evening conditions along the coast.',
    hook: 'Soft light and reliable beach weather.',
    whyItMatters:
      'Dry-season evenings are one of Da Nang’s strongest cards in November — easy to pair with Hoi An.',
    timeValue: 4,
    popularity: 82,
    months: [11],
    latitude: 16.05,
    longitude: 108.2,
  },
  {
    id: 'nov-hanoi-autumn',
    type: 'seasonal',
    name: 'Hanoi Autumn Old Quarter',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    image: img.city,
    dateDisplay: 'ONGOING',
    duration: '2–3 hrs',
    cost: 'Free–$',
    crowdLevel: 'Busy',
    bestTime: 'Late afternoon',
    monthRelevance: 'Best atmosphere this month',
    whyThisMonth: 'Cooler evenings make long walks especially worthwhile.',
    hook: 'Crisp air and lively street-food lanes.',
    whyItMatters:
      'Late autumn in Hanoi is a classic window for unhurried Old Quarter evenings.',
    timeValue: 4,
    popularity: 86,
    months: [11],
    latitude: 21.03,
    longitude: 105.85,
  },
  {
    id: 'dec-christmas-sg',
    type: 'event',
    name: 'Festive Saigon Evenings',
    city: 'Ho Chi Minh City',
    region: 'Southeast',
    image: img.city,
    date: 'December',
    duration: 'Evening',
    cost: 'Free–$$',
    crowdLevel: 'Peak',
    bestTime: 'Evening',
    monthRelevance: 'Festive city energy',
    hook: 'Lights, shopping streets and year-end buzz.',
    whyItMatters:
      'December adds festive lighting and denser nightlife energy — expect higher hotel demand.',
    timeValue: 3,
    popularity: 85,
    featured: true,
    months: [12],
    latitude: 10.78,
    longitude: 106.7,
  },
  {
    id: 'dec-beach',
    type: 'seasonal',
    name: 'South-Central Beach Escape',
    city: 'Da Nang',
    region: 'Central Coast',
    image: img.beach,
    duration: 'Full day',
    cost: '$$',
    crowdLevel: 'Busy',
    bestTime: 'Morning',
    monthRelevance: 'Dry beach season',
    hook: 'Bright coastal days for a classic beach break.',
    whyItMatters:
      'December remains a strong beach month along the south-central coast for travellers chasing sun.',
    timeValue: 4,
    popularity: 87,
    months: [12, 1],
    latitude: 16.05,
    longitude: 108.2,
  },
  ...CATALOG_EXTRA_ITEMS,
]

export const HAPPEN_CITIES: HappenCity[] = [
  'All Vietnam',
  'Hanoi',
  'Ha Long',
  'Sapa',
  'Ninh Binh',
  'Hue',
  'Hoi An',
  'Da Nang',
  'Da Lat',
  'Nha Trang',
  'Ho Chi Minh City',
  'Can Tho',
  'Phu Quoc',
]

export type HappenKindFilter = 'all' | 'events' | 'places'

const CROWD_RANK: Record<CrowdBand, number> = {
  'Very Low': 1,
  Low: 2,
  Moderate: 3,
  High: 4,
  'Very High': 5,
}

function normalizeCrowd(raw: string): CrowdBand {
  const s = raw.toLowerCase()
  if (s.includes('very low')) return 'Very Low'
  if (s.includes('very high') || s.includes('peak')) return 'Very High'
  if (s.includes('light') || s === 'low') return 'Low'
  if (s.includes('high') || s.includes('busy')) return 'High'
  return 'Moderate'
}

function inferTypicalPeak(bestTime: string): string | undefined {
  const t = bestTime.toLowerCase()
  if (t.includes('sunset') || t.includes('evening') || t.includes('after dark')) {
    return '19:00–21:00'
  }
  if (t.includes('morning') || t.includes('early')) return '08:00–11:00'
  if (t.includes('afternoon') || t.includes('late day')) return '15:00–18:00'
  if (t.includes('midday')) return '11:00–14:00'
  return undefined
}

function buildDateDisplay(draft: HappenItemDraft): string {
  if (draft.dateDisplay) return draft.dateDisplay
  if (draft.type === 'event') {
    const raw = draft.date ?? draft.dateRange ?? 'Seasonal'
    return raw.toUpperCase()
  }
  return draft.type === 'must-visit' ? 'ANY DAY' : 'ONGOING'
}

function enrichItem(draft: HappenItemDraft): HappenItem {
  const crowdType = draft.crowdType ?? 'typical'
  return {
    id: draft.id,
    type: draft.type,
    name: draft.name,
    city: draft.city,
    region: draft.region,
    image: draft.image,
    date: draft.date,
    dateRange: draft.dateRange,
    dateDisplay: buildDateDisplay(draft),
    duration: draft.duration,
    cost: draft.cost,
    crowdLevel: normalizeCrowd(draft.crowdLevel),
    crowdType,
    crowdUpdatedAt: crowdType === 'current' ? draft.crowdUpdatedAt : undefined,
    typicalPeak:
      crowdType === 'typical'
        ? (draft.typicalPeak ?? inferTypicalPeak(draft.bestTime))
        : undefined,
    bestTime: draft.bestTime,
    whyThisMonth: draft.whyThisMonth ?? draft.monthRelevance,
    whyItMatters: draft.whyItMatters,
    timeValue: draft.timeValue,
    rating: draft.rating,
    popularity: draft.popularity,
    featured: draft.featured,
    months: draft.months,
    latitude: draft.latitude,
    longitude: draft.longitude,
    experienceId: draft.experienceId,
    catalogTags: draft.catalogTags,
  }
}

function rankScore(item: HappenItem): number {
  const typeBoost = item.type === 'event' ? 300 : item.type === 'seasonal' ? 120 : 80
  const featuredBoost = item.featured ? 100 : 0
  return typeBoost + featuredBoost + item.popularity + item.timeValue * 8
}

export function getItemsForMonth(month: MonthId): HappenItem[] {
  return HAPPEN_ITEMS.filter((item) => item.months.includes(month))
    .map(enrichItem)
    .sort((a, b) => rankScore(b) - rankScore(a))
}

export function filterHappenItems(
  items: HappenItem[],
  city: HappenCity,
  kind: HappenKindFilter,
): HappenItem[] {
  return items.filter((item) => {
    const cityOk = city === 'All Vietnam' || item.city === city
    const kindOk =
      kind === 'all'
        ? true
        : kind === 'events'
          ? item.type === 'event'
          : item.type === 'seasonal' || item.type === 'must-visit'
    return cityOk && kindOk
  })
}

export function pickFeatured(items: HappenItem[]): HappenItem | null {
  if (!items.length) return null
  return items.find((i) => i.featured) ?? items[0]
}

export function getCityPulse(items: HappenItem[]): CityPulse[] {
  const counts = new Map<Exclude<HappenCity, 'All Vietnam'>, number>()
  for (const item of items) {
    if (item.city === 'All Vietnam') continue
    counts.set(item.city, (counts.get(item.city) ?? 0) + 1)
  }
  const max = Math.max(1, ...counts.values())
  return [...counts.entries()]
    .map(([city, count]) => ({
      city,
      count,
      intensity: (count >= max ? 3 : count >= Math.ceil(max / 2) ? 2 : 1) as 1 | 2 | 3,
    }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
}

export function typeLabel(type: HappenType): string {
  if (type === 'event') return 'Event'
  if (type === 'seasonal') return 'Seasonal'
  return 'Must visit'
}

export function typeBadge(type: HappenType): string {
  if (type === 'event') return '🏮 Event'
  if (type === 'seasonal') return '🌿 Seasonal'
  return '⭐ Must visit'
}

export function whyLabel(type: HappenType): string {
  if (type === 'event') return "Why it's special"
  if (type === 'seasonal') return 'Why now'
  return 'Why it matters'
}

export function timeStars(value: HappenItem['timeValue']): string {
  return '★'.repeat(value) + '☆'.repeat(5 - value)
}

export function crowdDots(level: CrowdBand): string {
  const n = CROWD_RANK[level]
  return '●'.repeat(n) + '○'.repeat(5 - n)
}

export function getHappenById(id: string): HappenItem | undefined {
  const draft = HAPPEN_ITEMS.find((i) => i.id === id)
  return draft ? enrichItem(draft) : undefined
}

