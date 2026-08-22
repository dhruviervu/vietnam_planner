export type MonthId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type Level = 1 | 2 | 3 | 4 | 5

export type BestForChip =
  | 'Culture'
  | 'Nature'
  | 'Food'
  | 'Photography'
  | 'Adventure'
  | 'Beaches'
  | 'Slow Travel'
  | 'City Exploration'

export type TravelWindowId =
  | 'cooler-drier'
  | 'peak-comfort'
  | 'hotter-greener'
  | 'wetter-lush'
  | 'clearing-skies'
  | 'year-end'

export type MonthProfile = {
  month: MonthId
  name: string
  short: string
  travelWindow: TravelWindowId
  windowLabel: string
  /** Compact strength signal for the year selector */
  signalLabel: string
  signalLevel: Level
  identity: string
  averageTemperature: number
  temperatureRange: string
  rainLevel: Level
  rainfallSummary: string
  crowdLevel: Level
  crowdSummary: string
  costLevel: Level
  costSummary: string
  eventsLevel: Level
  eventsSummary: string
  majorEvents: string[]
  whyItWorks: { icon: string; label: string }[]
  whatItOffers: string
  goodToKnow: string[]
  bestFor: BestForChip[]
  regionalNotes: string
  /** Higher = stronger overall planning fit (mock) */
  climateScore: number
  rainScore: number
  crowdScore: number
  costScore: number
  eventScore: number
  multiRegionScore: number
  mapDataReference: string
  eventReferences: string[]
}

export type TravelWindowMeta = {
  id: TravelWindowId
  label: string
  months: MonthId[]
}

export const TRAVEL_WINDOWS: TravelWindowMeta[] = [
  { id: 'cooler-drier', label: 'Cooler / drier', months: [1, 2] },
  { id: 'peak-comfort', label: 'Peak comfort', months: [3, 4] },
  { id: 'hotter-greener', label: 'Hotter / greener', months: [5, 6] },
  { id: 'wetter-lush', label: 'Wetter / lush', months: [7, 8, 9] },
  { id: 'clearing-skies', label: 'Clearing skies', months: [10, 11] },
  { id: 'year-end', label: 'Year-end', months: [12] },
]

export const MONTH_PROFILES: MonthProfile[] = [
  {
    month: 1,
    name: 'January',
    short: 'JAN',
    travelWindow: 'cooler-drier',
    windowLabel: 'Cooler / drier',
    signalLabel: 'Festive dry',
    signalLevel: 4,
    identity: 'Crisp north · dry south · festive energy',
    averageTemperature: 22,
    temperatureRange: '18–26°C',
    rainLevel: 1,
    rainfallSummary: 'Very low',
    crowdLevel: 4,
    crowdSummary: 'Busy',
    costLevel: 4,
    costSummary: 'Higher demand',
    eventsLevel: 5,
    eventsSummary: 'Festive',
    majorEvents: ['Tết preparations', 'New Year travel peaks'],
    whyItWorks: [
      { icon: '☀️', label: 'Dry south & central coast' },
      { icon: '🏮', label: 'Festive atmosphere builds' },
      { icon: '🏖', label: 'Strong beach conditions' },
      { icon: '📸', label: 'Clear winter light in the north' },
    ],
    whatItOffers:
      'Ideal if you want dry beaches and city energy, with cooler northern mornings that feel distinctly seasonal.',
    goodToKnow: [
      'Hanoi mornings can feel cool — pack a light layer.',
      'Pre-Tết travel can raise fares and hotel demand.',
      'Rain risk is low nationally, but highland mist is common.',
    ],
    bestFor: ['Beaches', 'Culture', 'Food', 'City Exploration'],
    regionalNotes: 'North cooler; south dry and warm; central coast often excellent.',
    climateScore: 78,
    rainScore: 92,
    crowdScore: 55,
    costScore: 48,
    eventScore: 88,
    multiRegionScore: 72,
    mapDataReference: 'jan-regional',
    eventReferences: ['tet-prep', 'new-year'],
  },
  {
    month: 2,
    name: 'February',
    short: 'FEB',
    travelWindow: 'cooler-drier',
    windowLabel: 'Cooler / drier',
    signalLabel: 'Tết peak',
    signalLevel: 3,
    identity: 'Tết season · dry coasts · cooler north',
    averageTemperature: 23,
    temperatureRange: '19–27°C',
    rainLevel: 1,
    rainfallSummary: 'Very low',
    crowdLevel: 5,
    crowdSummary: 'Peak festive',
    costLevel: 5,
    costSummary: 'Peak pricing',
    eventsLevel: 5,
    eventsSummary: 'Very active',
    majorEvents: ['Tết Nguyên Đán', 'Lantern & family festivals'],
    whyItWorks: [
      { icon: '🎉', label: 'Unforgettable cultural moment' },
      { icon: '☀️', label: 'Still largely dry' },
      { icon: '🍜', label: 'Special seasonal foods' },
      { icon: '🌿', label: 'Quiet countryside after Tết' },
    ],
    whatItOffers:
      'Best for travelers who want Vietnam’s biggest cultural celebration — plan early around closures and travel spikes.',
    goodToKnow: [
      'Many businesses close around Tết — book ahead.',
      'Domestic travel demand is intense.',
      'Post-Tết week can feel calmer and greener.',
    ],
    bestFor: ['Culture', 'Food', 'Photography', 'City Exploration'],
    regionalNotes: 'Nationwide festive rhythm; coastal weather stays favorable.',
    climateScore: 74,
    rainScore: 90,
    crowdScore: 35,
    costScore: 30,
    eventScore: 95,
    multiRegionScore: 68,
    mapDataReference: 'feb-regional',
    eventReferences: ['tet', 'lanterns'],
  },
  {
    month: 3,
    name: 'March',
    short: 'MAR',
    travelWindow: 'peak-comfort',
    windowLabel: 'Peak comfort',
    signalLabel: 'Strong',
    signalLevel: 5,
    identity: 'Comfortable · lower rainfall · strong sightseeing',
    averageTemperature: 26,
    temperatureRange: '24–29°C',
    rainLevel: 2,
    rainfallSummary: 'Low',
    crowdLevel: 3,
    crowdSummary: 'Moderate',
    costLevel: 3,
    costSummary: 'Good value',
    eventsLevel: 4,
    eventsSummary: 'Active',
    majorEvents: ['Spring festivals', 'Flower season in the north'],
    whyItWorks: [
      { icon: '☀️', label: 'Comfortable sightseeing' },
      { icon: '👥', label: 'Manageable crowds' },
      { icon: '🌧', label: 'Lower rain risk' },
      { icon: '💰', label: 'Strong overall value' },
    ],
    whatItOffers:
      'A balanced month for multi-region trips — warm enough for beaches, mild enough for cities and countryside.',
    goodToKnow: [
      'Northern mornings can still feel cooler.',
      'Rain varies significantly by region.',
      'Popular sites fill on weekends — book key stays early.',
    ],
    bestFor: ['Culture', 'Nature', 'Photography', 'City Exploration', 'Food'],
    regionalNotes: 'One of the easiest months for north–central–south combinations.',
    climateScore: 92,
    rainScore: 84,
    crowdScore: 72,
    costScore: 78,
    eventScore: 76,
    multiRegionScore: 94,
    mapDataReference: 'mar-regional',
    eventReferences: ['spring-festivals', 'flower-season'],
  },
  {
    month: 4,
    name: 'April',
    short: 'APR',
    travelWindow: 'peak-comfort',
    windowLabel: 'Peak comfort',
    signalLabel: 'Strong',
    signalLevel: 5,
    identity: 'Warm · settled · excellent all-round travel',
    averageTemperature: 28,
    temperatureRange: '25–31°C',
    rainLevel: 2,
    rainfallSummary: 'Low',
    crowdLevel: 3,
    crowdSummary: 'Moderate',
    costLevel: 3,
    costSummary: 'Good value',
    eventsLevel: 3,
    eventsSummary: 'Steady',
    majorEvents: ['Hung Kings Commemoration', 'Late spring celebrations'],
    whyItWorks: [
      { icon: '☀️', label: 'Reliable daytime warmth' },
      { icon: '🗺', label: 'Multi-region friendly' },
      { icon: '🌧', label: 'Still before heavier rains' },
      { icon: '📸', label: 'Bright, clear conditions' },
    ],
    whatItOffers:
      'Excellent for itineraries that mix cities, nature and coast without peak-summer heat or peak-winter crowds.',
    goodToKnow: [
      'Afternoons run warmer in the south.',
      'Central beaches are often at their best.',
      'Shoulder pricing still beats winter peaks.',
    ],
    bestFor: ['Beaches', 'Adventure', 'Culture', 'Nature', 'Photography'],
    regionalNotes: 'Strong national balance; south warms up more quickly.',
    climateScore: 90,
    rainScore: 80,
    crowdScore: 70,
    costScore: 76,
    eventScore: 68,
    multiRegionScore: 92,
    mapDataReference: 'apr-regional',
    eventReferences: ['hung-kings'],
  },
  {
    month: 5,
    name: 'May',
    short: 'MAY',
    travelWindow: 'hotter-greener',
    windowLabel: 'Hotter / greener',
    signalLabel: 'Value',
    signalLevel: 3,
    identity: 'Hotter days · greener landscapes · fewer peak crowds',
    averageTemperature: 30,
    temperatureRange: '27–33°C',
    rainLevel: 3,
    rainfallSummary: 'Rising',
    crowdLevel: 2,
    crowdSummary: 'Lighter',
    costLevel: 2,
    costSummary: 'Better value',
    eventsLevel: 2,
    eventsSummary: 'Quieter',
    majorEvents: ['Buddha’s Birthday period', 'Early summer local festivals'],
    whyItWorks: [
      { icon: '🌿', label: 'Landscapes turn lush' },
      { icon: '💰', label: 'Better value than winter' },
      { icon: '👥', label: 'Fewer peak-season crowds' },
      { icon: '🏖', label: 'Still strong for beaches' },
    ],
    whatItOffers:
      'Great for travelers who want greener landscapes, fewer peak-season crowds and a more relaxed pace.',
    goodToKnow: [
      'Heat builds — plan outdoor time for mornings.',
      'Showers become more common in some regions.',
      'Mountain bases feel fresher than cities.',
    ],
    bestFor: ['Nature', 'Slow Travel', 'Beaches', 'Photography'],
    regionalNotes: 'South and central heat up; north stays more pleasant.',
    climateScore: 70,
    rainScore: 58,
    crowdScore: 82,
    costScore: 84,
    eventScore: 52,
    multiRegionScore: 66,
    mapDataReference: 'may-regional',
    eventReferences: ['buddhas-birthday'],
  },
  {
    month: 6,
    name: 'June',
    short: 'JUN',
    travelWindow: 'hotter-greener',
    windowLabel: 'Hotter / greener',
    signalLabel: 'Lush value',
    signalLevel: 3,
    identity: 'Summer heat · vivid greens · value travel',
    averageTemperature: 31,
    temperatureRange: '28–34°C',
    rainLevel: 3,
    rainfallSummary: 'Moderate',
    crowdLevel: 2,
    crowdSummary: 'Lighter',
    costLevel: 2,
    costSummary: 'Strong value',
    eventsLevel: 2,
    eventsSummary: 'Local',
    majorEvents: ['Summer school-holiday travel', 'Regional folk events'],
    whyItWorks: [
      { icon: '💰', label: 'Stronger hotel value' },
      { icon: '🌿', label: 'Especially green countryside' },
      { icon: '🏔', label: 'Highlands feel fresher' },
      { icon: '🍜', label: 'Easy city food trips' },
    ],
    whatItOffers:
      'A good pick if you prioritize value and greenery, and can handle heat with flexible daily pacing.',
    goodToKnow: [
      'Midday heat can be intense in lowland cities.',
      'Afternoon showers are more likely.',
      'Ha Giang / Sapa are appealing escapes.',
    ],
    bestFor: ['Adventure', 'Nature', 'Food', 'Slow Travel'],
    regionalNotes: 'North highlands shine; Mekong and lowland cities run hot.',
    climateScore: 62,
    rainScore: 52,
    crowdScore: 80,
    costScore: 86,
    eventScore: 48,
    multiRegionScore: 58,
    mapDataReference: 'jun-regional',
    eventReferences: ['summer-local'],
  },
  {
    month: 7,
    name: 'July',
    short: 'JUL',
    travelWindow: 'wetter-lush',
    windowLabel: 'Wetter / lush',
    signalLabel: 'Flexible',
    signalLevel: 2,
    identity: 'Lush · stormier pockets · quieter sites',
    averageTemperature: 30,
    temperatureRange: '27–33°C',
    rainLevel: 4,
    rainfallSummary: 'Higher',
    crowdLevel: 2,
    crowdSummary: 'Lighter',
    costLevel: 2,
    costSummary: 'Strong value',
    eventsLevel: 2,
    eventsSummary: 'Selective',
    majorEvents: ['Summer festivals', 'Regional boat races'],
    whyItWorks: [
      { icon: '🌿', label: 'Deep green landscapes' },
      { icon: '💰', label: 'Attractive pricing' },
      { icon: '👥', label: 'Quieter major sites' },
      { icon: '☕', label: 'Great café / city days' },
    ],
    whatItOffers:
      'Rewarding if you like lush scenery and flexible plans — build buffer days for weather shifts.',
    goodToKnow: [
      'Central coast can see heavier rain periods.',
      'Travel days may need flexibility.',
      'Photography thrives after storms clear.',
    ],
    bestFor: ['Nature', 'Photography', 'Food', 'City Exploration'],
    regionalNotes: 'Conditions diverge sharply north–central–south; check regional notes.',
    climateScore: 55,
    rainScore: 38,
    crowdScore: 78,
    costScore: 84,
    eventScore: 50,
    multiRegionScore: 45,
    mapDataReference: 'jul-regional',
    eventReferences: ['summer-festivals'],
  },
  {
    month: 8,
    name: 'August',
    short: 'AUG',
    travelWindow: 'wetter-lush',
    windowLabel: 'Wetter / lush',
    signalLabel: 'Flexible',
    signalLevel: 2,
    identity: 'Peak green · variable rain · soft crowds',
    averageTemperature: 30,
    temperatureRange: '27–33°C',
    rainLevel: 4,
    rainfallSummary: 'Higher',
    crowdLevel: 2,
    crowdSummary: 'Lighter',
    costLevel: 2,
    costSummary: 'Strong value',
    eventsLevel: 3,
    eventsSummary: 'Cultural',
    majorEvents: ['Vu Lan (Ghost Festival)', 'Mid-year ceremonies'],
    whyItWorks: [
      { icon: '🌿', label: 'Rice terraces look vivid' },
      { icon: '💰', label: 'Value stays strong' },
      { icon: '🎭', label: 'Meaningful cultural dates' },
      { icon: '🌧', label: 'Rain often comes in bursts' },
    ],
    whatItOffers:
      'Suited to flexible travelers chasing atmosphere and value rather than guaranteed dry days.',
    goodToKnow: [
      'Storm systems can affect the central coast.',
      'Keep outdoor icons for clearer mornings.',
      'Indoor museums and food days work well.',
    ],
    bestFor: ['Culture', 'Nature', 'Food', 'Slow Travel'],
    regionalNotes: 'South often more stable than central; north remains humid.',
    climateScore: 52,
    rainScore: 35,
    crowdScore: 80,
    costScore: 85,
    eventScore: 62,
    multiRegionScore: 42,
    mapDataReference: 'aug-regional',
    eventReferences: ['vu-lan'],
  },
  {
    month: 9,
    name: 'September',
    short: 'SEP',
    travelWindow: 'wetter-lush',
    windowLabel: 'Wetter / lush',
    signalLabel: 'Shoulder',
    signalLevel: 3,
    identity: 'Transition month · softer light · improving outlook',
    averageTemperature: 29,
    temperatureRange: '26–32°C',
    rainLevel: 3,
    rainfallSummary: 'Easing',
    crowdLevel: 2,
    crowdSummary: 'Lighter',
    costLevel: 2,
    costSummary: 'Good value',
    eventsLevel: 3,
    eventsSummary: 'Active',
    majorEvents: ['National Day period', 'Mid-Autumn Festival'],
    whyItWorks: [
      { icon: '🌕', label: 'Mid-Autumn atmosphere' },
      { icon: '💰', label: 'Still strong value' },
      { icon: '📸', label: 'Softer late-summer light' },
      { icon: '🗺', label: 'Conditions start to settle' },
    ],
    whatItOffers:
      'A thoughtful shoulder month — festive moments with improving weather and fewer peak crowds.',
    goodToKnow: [
      'Early September can still bring storms centrally.',
      'Mid-Autumn evenings are especially photogenic.',
      'Book coastal stays if traveling over National Day.',
    ],
    bestFor: ['Culture', 'Photography', 'Food', 'City Exploration'],
    regionalNotes: 'Improving overall, with leftover wet-season variability in places.',
    climateScore: 68,
    rainScore: 55,
    crowdScore: 75,
    costScore: 80,
    eventScore: 78,
    multiRegionScore: 62,
    mapDataReference: 'sep-regional',
    eventReferences: ['national-day', 'mid-autumn'],
  },
  {
    month: 10,
    name: 'October',
    short: 'OCT',
    travelWindow: 'clearing-skies',
    windowLabel: 'Clearing skies',
    signalLabel: 'Rising',
    signalLevel: 4,
    identity: 'Clearing skies · golden light · rising demand',
    averageTemperature: 27,
    temperatureRange: '24–30°C',
    rainLevel: 2,
    rainfallSummary: 'Lower',
    crowdLevel: 3,
    crowdSummary: 'Building',
    costLevel: 3,
    costSummary: 'Rising',
    eventsLevel: 4,
    eventsSummary: 'Active',
    majorEvents: ['Autumn festivals', 'Women’s Day celebrations'],
    whyItWorks: [
      { icon: '☀️', label: 'Noticeably clearer days' },
      { icon: '📸', label: 'Excellent golden light' },
      { icon: '🗺', label: 'Strong for multi-stop trips' },
      { icon: '🍜', label: 'Comfortable city pacing' },
    ],
    whatItOffers:
      'One of the most rewarding autumn months — comfortable travel with landscapes still lush from recent rains.',
    goodToKnow: [
      'Central Vietnam often improves sharply.',
      'Demand rises toward winter — book popular stays.',
      'Evenings cool pleasantly in the north.',
    ],
    bestFor: ['Photography', 'Culture', 'Nature', 'Adventure', 'Food'],
    regionalNotes: 'Broadly favorable; residual showers possible early in the month.',
    climateScore: 86,
    rainScore: 74,
    crowdScore: 68,
    costScore: 70,
    eventScore: 74,
    multiRegionScore: 88,
    mapDataReference: 'oct-regional',
    eventReferences: ['autumn-festivals'],
  },
  {
    month: 11,
    name: 'November',
    short: 'NOV',
    travelWindow: 'clearing-skies',
    windowLabel: 'Clearing skies',
    signalLabel: 'Popular',
    signalLevel: 4,
    identity: 'Cooler air · dry stretch · popular window',
    averageTemperature: 25,
    temperatureRange: '22–28°C',
    rainLevel: 1,
    rainfallSummary: 'Low',
    crowdLevel: 4,
    crowdSummary: 'Busy',
    costLevel: 4,
    costSummary: 'Higher',
    eventsLevel: 3,
    eventsSummary: 'Steady',
    majorEvents: ['Vietnamese Women’s Day travel', 'Late autumn festivals'],
    whyItWorks: [
      { icon: '☀️', label: 'Reliable dry conditions' },
      { icon: '🗺', label: 'Excellent itinerary flexibility' },
      { icon: '🏖', label: 'Great central coast weather' },
      { icon: '📸', label: 'Crisp visibility' },
    ],
    whatItOffers:
      'A classic travel month for comfort and coverage — expect more visitors at headline destinations.',
    goodToKnow: [
      'Crowds rise at Ha Long, Hoi An and Hanoi.',
      'Book trains and popular hotels early.',
      'North evenings turn cooler.',
    ],
    bestFor: ['Culture', 'Beaches', 'Adventure', 'City Exploration', 'Photography'],
    regionalNotes: 'Nationally strong; peak demand at iconic stops.',
    climateScore: 88,
    rainScore: 88,
    crowdScore: 50,
    costScore: 52,
    eventScore: 64,
    multiRegionScore: 90,
    mapDataReference: 'nov-regional',
    eventReferences: ['womens-day'],
  },
  {
    month: 12,
    name: 'December',
    short: 'DEC',
    travelWindow: 'year-end',
    windowLabel: 'Year-end',
    signalLabel: 'Holiday',
    signalLevel: 3,
    identity: 'Holiday season · dry south · cool north',
    averageTemperature: 23,
    temperatureRange: '19–27°C',
    rainLevel: 1,
    rainfallSummary: 'Very low',
    crowdLevel: 5,
    crowdSummary: 'Peak',
    costLevel: 5,
    costSummary: 'Peak pricing',
    eventsLevel: 4,
    eventsSummary: 'Festive',
    majorEvents: ['Christmas & New Year celebrations', 'Year-end city lights'],
    whyItWorks: [
      { icon: '☀️', label: 'Dry beach weather down south' },
      { icon: '🎉', label: 'Festive city energy' },
      { icon: '🏖', label: 'Phu Quoc / Da Nang shine' },
      { icon: '☕', label: 'Cozy northern café weather' },
    ],
    whatItOffers:
      'Perfect for holiday travelers who want reliable dry weather and atmosphere — budget for peak demand.',
    goodToKnow: [
      'Prices spike around Christmas–New Year.',
      'Popular islands and coasts book out early.',
      'Hanoi can feel genuinely cool at night.',
    ],
    bestFor: ['Beaches', 'Food', 'City Exploration', 'Culture'],
    regionalNotes: 'South/central coast excellent; north cool and atmospheric.',
    climateScore: 80,
    rainScore: 90,
    crowdScore: 32,
    costScore: 28,
    eventScore: 82,
    multiRegionScore: 74,
    mapDataReference: 'dec-regional',
    eventReferences: ['nye', 'christmas'],
  },
]

export function getMonthProfile(month: MonthId) {
  return MONTH_PROFILES.find((m) => m.month === month) ?? MONTH_PROFILES[2]
}

export function levelLabel(kind: 'rain' | 'crowds' | 'cost' | 'events', level: Level) {
  if (kind === 'rain') {
    return (['Very low', 'Low', 'Moderate', 'Higher', 'Heavy'] as const)[level - 1]
  }
  if (kind === 'crowds') {
    return (['Quiet', 'Lighter', 'Moderate', 'Busy', 'Peak'] as const)[level - 1]
  }
  if (kind === 'cost') {
    return (['Great value', 'Strong value', 'Good value', 'Higher', 'Peak pricing'] as const)[
      level - 1
    ]
  }
  return (['Quiet', 'Selective', 'Steady', 'Active', 'Very active'] as const)[level - 1]
}
