export type SeasonId = 'spring' | 'sunny' | 'lush' | 'scenic'

export type Season = {
  id: SeasonId
  title: string
  mood: string
  moodIcon: string
  accent: string
  accentSoft: string
  months: string[]
  monthIndexes: number[]
  pills: { icon: string; label: string; hint: string }[]
  experiences: string[]
  carouselSeeds: string[]
  heroSeed: string
  weather: { label: string; value: string; icon: string }[]
  destinations: {
    name: string
    blurb: string
    seed: string
    slug: string
    badges: string[]
  }[]
  expectations: { icon: string; label: string }[]
  personas: { icon: string; label: string }[]
  monthNotes: {
    month: string
    headline: string
    indicators: { icon: string; label: string }[]
  }[]
}

export const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const

export const SEASONS: Season[] = [
  {
    id: 'spring',
    title: 'Spring Discovery',
    mood: 'Fresh & Comfortable',
    moodIcon: '🌸',
    accent: '#6f9b78',
    accentSoft: 'rgba(111, 155, 120, 0.16)',
    months: ['JAN', 'FEB', 'MAR'],
    monthIndexes: [0, 1, 2],
    pills: [
      { icon: '🌡', label: '18–26°C', hint: 'Comfortably cool' },
      { icon: '👥', label: 'Moderate Crowds', hint: 'Easy sightseeing' },
      { icon: '💰', label: 'Excellent Value', hint: 'Lower hotel prices' },
      { icon: '🌧', label: 'Dry Season', hint: 'Outdoor friendly' },
    ],
    experiences: ['🛵 Ha Giang Loop', '🚣 Ninh Binh', '🏙 Hanoi Mornings', '🌸 Flower Season'],
    carouselSeeds: [
      'wtg-spring-hanoi',
      'wtg-spring-ninhbinh',
      'wtg-spring-hagiang',
      'wtg-spring-halong',
      'wtg-spring-flowers',
    ],
    heroSeed: 'wtg-spring-hero',
    weather: [
      { label: 'Temperature', value: '18–26°C', icon: '🌡' },
      { label: 'Rainfall', value: 'Dry stretch', icon: '🌧' },
      { label: 'Humidity', value: 'Mild air', icon: '💧' },
      { label: 'Crowds', value: 'Balanced', icon: '👥' },
      { label: 'Cost', value: 'Strong value', icon: '💰' },
    ],
    destinations: [
      {
        name: 'Hanoi',
        blurb: 'Cool mornings made for lakes and café rituals.',
        seed: 'wtg-dest-hanoi',
        slug: 'hanoi',
        badges: ['📸 Photography', '🍜 Food'],
      },
      {
        name: 'Ninh Binh',
        blurb: 'Limestone rivers under crisp winter light.',
        seed: 'wtg-dest-ninhbinh',
        slug: 'ninh-binh',
        badges: ['📸 Photography', '🚣 Boating'],
      },
      {
        name: 'Ha Giang',
        blurb: 'Clear highland passes and mountain markets.',
        seed: 'wtg-dest-hagiang',
        slug: 'ha-giang',
        badges: ['🏍 Adventure', '🥾 Hiking'],
      },
      {
        name: 'Ha Long Bay',
        blurb: 'Calm water days between the karsts.',
        seed: 'wtg-dest-halong-spring',
        slug: 'ha-long-bay',
        badges: ['⛵ Cruising', '💑 Couples'],
      },
    ],
    expectations: [
      { icon: '☀️', label: 'Clear Skies' },
      { icon: '🌸', label: 'Flower Season' },
      { icon: '🍃', label: 'Green Landscapes' },
      { icon: '🌄', label: 'Mountain Visibility' },
    ],
    personas: [
      { icon: '📸', label: 'Photographers' },
      { icon: '🥾', label: 'Hikers' },
      { icon: '🏍', label: 'Adventure Seekers' },
      { icon: '🍜', label: 'Food Lovers' },
    ],
    monthNotes: [
      {
        month: 'January',
        headline: '❄️ Coolest Temperatures',
        indicators: [
          { icon: '🌡', label: 'Cool' },
          { icon: '☀️', label: 'Sunny' },
          { icon: '👥', label: 'Moderate' },
          { icon: '💰', label: 'Great Value' },
        ],
      },
      {
        month: 'February',
        headline: '👁 Best Visibility',
        indicators: [
          { icon: '👁', label: 'Crisp Views' },
          { icon: '📸', label: 'Photo Peak' },
          { icon: '☀️', label: 'Clear Skies' },
          { icon: '💰', label: 'Great Value' },
        ],
      },
      {
        month: 'March',
        headline: '🌸 Flower Season',
        indicators: [
          { icon: '🌸', label: 'Blooms' },
          { icon: '🌿', label: 'Greenery' },
          { icon: '☀️', label: 'Comfortable' },
          { icon: '📸', label: 'Excellent Photos' },
        ],
      },
    ],
  },
  {
    id: 'sunny',
    title: 'Sunny Escapes',
    mood: 'Sunny & Energetic',
    moodIcon: '☀️',
    accent: '#d4a24a',
    accentSoft: 'rgba(212, 162, 74, 0.16)',
    months: ['APR', 'MAY', 'JUN'],
    monthIndexes: [3, 4, 5],
    pills: [
      { icon: '🌡', label: '26–34°C', hint: 'Beach-ready warmth' },
      { icon: '👥', label: 'Rising Crowds', hint: 'Book popular stays' },
      { icon: '💰', label: 'Fair Value', hint: 'Coast still accessible' },
      { icon: '🌧', label: 'Light Showers', hint: 'Mostly outdoor days' },
    ],
    experiences: ['🏖 Beach Escapes', '🏮 Hoi An Nights', '🌊 Da Nang Coast', '🍜 Central Kitchens'],
    carouselSeeds: [
      'wtg-sunny-danang',
      'wtg-sunny-hoian',
      'wtg-sunny-beach',
      'wtg-sunny-coastal',
      'wtg-sunny-lantern',
      'wtg-sunny-road',
    ],
    heroSeed: 'wtg-sunny-hero',
    weather: [
      { label: 'Temperature', value: '26–34°C', icon: '🌡' },
      { label: 'Rainfall', value: 'Light showers', icon: '🌧' },
      { label: 'Humidity', value: 'Warm air', icon: '💧' },
      { label: 'Crowds', value: 'Building', icon: '👥' },
      { label: 'Cost', value: 'Fair value', icon: '💰' },
    ],
    destinations: [
      {
        name: 'Da Nang',
        blurb: 'Beach mornings with easy city energy.',
        seed: 'wtg-dest-danang',
        slug: 'da-nang',
        badges: ['🏖 Beach', '🍜 Food'],
      },
      {
        name: 'Hoi An',
        blurb: 'Lantern evenings and riverside walks.',
        seed: 'wtg-dest-hoian',
        slug: 'hoi-an',
        badges: ['🏮 Culture', '💑 Couples'],
      },
      {
        name: 'Hue',
        blurb: 'Citadel days before heavier rains arrive.',
        seed: 'wtg-dest-hue',
        slug: 'hue',
        badges: ['🏛 History', '📸 Photography'],
      },
      {
        name: 'Nha Trang',
        blurb: 'Warm water and long coastal afternoons.',
        seed: 'wtg-dest-nhatrang',
        slug: 'nha-trang',
        badges: ['🏖 Beach', '🌴 Relaxed'],
      },
    ],
    expectations: [
      { icon: '🏖', label: 'Beach Weather' },
      { icon: '☀️', label: 'Long Daylight' },
      { icon: '🌊', label: 'Coastal Breeze' },
      { icon: '🏮', label: 'Lantern Evenings' },
    ],
    personas: [
      { icon: '🏖', label: 'Beach Lovers' },
      { icon: '💑', label: 'Couples' },
      { icon: '🍜', label: 'Food Lovers' },
      { icon: '🌴', label: 'Relaxed Travelers' },
    ],
    monthNotes: [
      {
        month: 'April',
        headline: '🏖 Beach Season Opens',
        indicators: [
          { icon: '🏖', label: 'Swim Days' },
          { icon: '☀️', label: 'Bright' },
          { icon: '👥', label: 'Growing' },
          { icon: '💰', label: 'Fair Value' },
        ],
      },
      {
        month: 'May',
        headline: '☀️ Warmest Dry Stretch',
        indicators: [
          { icon: '🌡', label: 'Warm' },
          { icon: '🌊', label: 'Coast Peak' },
          { icon: '🏮', label: 'Evenings' },
          { icon: '📸', label: 'Golden Light' },
        ],
      },
      {
        month: 'June',
        headline: '⚡ Early Summer Energy',
        indicators: [
          { icon: '☀️', label: 'Long Days' },
          { icon: '🌧', label: 'Light Rain' },
          { icon: '🍜', label: 'Food Trips' },
          { icon: '👥', label: 'Busier' },
        ],
      },
    ],
  },
  {
    id: 'lush',
    title: 'Lush Adventure',
    mood: 'Lush & Vibrant',
    moodIcon: '🌿',
    accent: '#3d6b68',
    accentSoft: 'rgba(61, 107, 104, 0.16)',
    months: ['JUL', 'AUG', 'SEP'],
    monthIndexes: [6, 7, 8],
    pills: [
      { icon: '🌡', label: '24–32°C', hint: 'Warm & green' },
      { icon: '👥', label: 'Quieter North', hint: 'Room to explore' },
      { icon: '💰', label: 'Strong Value', hint: 'Deals in highlands' },
      { icon: '🌧', label: 'Lush Rains', hint: 'Dramatic landscapes' },
    ],
    experiences: ['🌾 Rice Terraces', '💧 Waterfalls', '⛰ Mountain Trails', '🛶 River Days'],
    carouselSeeds: [
      'wtg-lush-terraces',
      'wtg-lush-waterfall',
      'wtg-lush-mountains',
      'wtg-lush-green',
      'wtg-lush-river',
    ],
    heroSeed: 'wtg-lush-hero',
    weather: [
      { label: 'Temperature', value: '24–32°C', icon: '🌡' },
      { label: 'Rainfall', value: 'Lush rains', icon: '🌧' },
      { label: 'Humidity', value: 'Jungle air', icon: '💧' },
      { label: 'Crowds', value: 'Softer', icon: '👥' },
      { label: 'Cost', value: 'Strong value', icon: '💰' },
    ],
    destinations: [
      {
        name: 'Sapa',
        blurb: 'Deep green terraces after summer rains.',
        seed: 'wtg-dest-sapa',
        slug: 'sapa',
        badges: ['🥾 Hiking', '📸 Photography'],
      },
      {
        name: 'Mai Chau',
        blurb: 'Valley stays and soft bike loops.',
        seed: 'wtg-dest-maichau',
        slug: 'mai-chau',
        badges: ['🏍 Adventure', '💑 Couples'],
      },
      {
        name: 'Phong Nha',
        blurb: 'Cave days wrapped in jungle color.',
        seed: 'wtg-dest-phongnha',
        slug: 'phong-nha',
        badges: ['🏍 Adventure', '📸 Photography'],
      },
      {
        name: 'Dalat',
        blurb: 'Cooler highland air and misty mornings.',
        seed: 'wtg-dest-dalat',
        slug: 'dalat',
        badges: ['💑 Couples', '🍜 Food'],
      },
    ],
    expectations: [
      { icon: '🍃', label: 'Green Landscapes' },
      { icon: '🌾', label: 'Rice Harvest' },
      { icon: '💧', label: 'Waterfalls' },
      { icon: '⛈', label: 'Dramatic Skies' },
    ],
    personas: [
      { icon: '🥾', label: 'Hikers' },
      { icon: '📸', label: 'Photographers' },
      { icon: '🏍', label: 'Adventure Seekers' },
      { icon: '💑', label: 'Couples' },
    ],
    monthNotes: [
      {
        month: 'July',
        headline: '🍃 Peak Greenery',
        indicators: [
          { icon: '🌿', label: 'Lush' },
          { icon: '💧', label: 'Waterfalls' },
          { icon: '👥', label: 'Quieter' },
          { icon: '💰', label: 'Strong Value' },
        ],
      },
      {
        month: 'August',
        headline: '💧 Waterfalls Run Strong',
        indicators: [
          { icon: '💧', label: 'Cascades' },
          { icon: '⛰', label: 'Trails' },
          { icon: '🌧', label: 'Showers' },
          { icon: '📸', label: 'Moody Light' },
        ],
      },
      {
        month: 'September',
        headline: '🌾 Harvest Begins',
        indicators: [
          { icon: '🌾', label: 'Gold Fields' },
          { icon: '📸', label: 'Photo Peak' },
          { icon: '🌡', label: 'Warm' },
          { icon: '💰', label: 'Great Value' },
        ],
      },
    ],
  },
  {
    id: 'scenic',
    title: 'Scenic Vietnam',
    mood: 'Scenic & Balanced',
    moodIcon: '🍂',
    accent: '#c45c3a',
    accentSoft: 'rgba(196, 92, 58, 0.16)',
    months: ['OCT', 'NOV', 'DEC'],
    monthIndexes: [9, 10, 11],
    pills: [
      { icon: '🌡', label: '22–28°C', hint: 'Balanced comfort' },
      { icon: '👥', label: 'Peak Interest', hint: 'Reserve ahead' },
      { icon: '💰', label: 'Book Ahead', hint: 'Popular season' },
      { icon: '🌧', label: 'Settling Skies', hint: 'Clear horizons' },
    ],
    experiences: ['⛵ Ha Long Bay', '🏮 Lantern Festivals', '🍁 Autumn Light', '🏙 City Evenings'],
    carouselSeeds: [
      'wtg-scenic-halong',
      'wtg-scenic-lanterns',
      'wtg-scenic-autumn',
      'wtg-scenic-rice',
      'wtg-scenic-city',
    ],
    heroSeed: 'wtg-scenic-hero',
    weather: [
      { label: 'Temperature', value: '22–28°C', icon: '🌡' },
      { label: 'Rainfall', value: 'Easing', icon: '🌧' },
      { label: 'Humidity', value: 'Balanced', icon: '💧' },
      { label: 'Crowds', value: 'Higher', icon: '👥' },
      { label: 'Cost', value: 'Book ahead', icon: '💰' },
    ],
    destinations: [
      {
        name: 'Ha Long Bay',
        blurb: 'Classic bay light and calm cruising.',
        seed: 'wtg-dest-halong',
        slug: 'ha-long-bay',
        badges: ['⛵ Cruising', '💑 Couples'],
      },
      {
        name: 'Hoi An',
        blurb: 'Festival glow and soft evening walks.',
        seed: 'wtg-dest-hoian-fall',
        slug: 'hoi-an',
        badges: ['🏮 Festivals', '📸 Photography'],
      },
      {
        name: 'Hanoi',
        blurb: 'Golden hour over lakes and old streets.',
        seed: 'wtg-dest-hanoi-fall',
        slug: 'hanoi',
        badges: ['🍜 Food', '📸 Photography'],
      },
      {
        name: 'Mekong Delta',
        blurb: 'Orchard canals in gentler weather.',
        seed: 'wtg-dest-mekong',
        slug: 'mekong-delta',
        badges: ['🛶 Boating', '🍜 Food'],
      },
    ],
    expectations: [
      { icon: '🍂', label: 'Autumn Landscapes' },
      { icon: '🏮', label: 'Festival Season' },
      { icon: '🌄', label: 'Clear Horizons' },
      { icon: '✨', label: 'Golden Light' },
    ],
    personas: [
      { icon: '💑', label: 'Couples' },
      { icon: '📸', label: 'Photographers' },
      { icon: '🍜', label: 'Food Lovers' },
      { icon: '🌴', label: 'Relaxed Travelers' },
    ],
    monthNotes: [
      {
        month: 'October',
        headline: '🌤 Skies Settle',
        indicators: [
          { icon: '☀️', label: 'Clearer' },
          { icon: '🌾', label: 'Gold Fields' },
          { icon: '👥', label: 'Rising' },
          { icon: '📸', label: 'Scenic Peak' },
        ],
      },
      {
        month: 'November',
        headline: '🍁 Peak Scenic Light',
        indicators: [
          { icon: '✨', label: 'Golden Hour' },
          { icon: '⛵', label: 'Bay Days' },
          { icon: '🏮', label: 'Lanterns' },
          { icon: '💰', label: 'Book Ahead' },
        ],
      },
      {
        month: 'December',
        headline: '✨ Festive Evenings',
        indicators: [
          { icon: '🏮', label: 'Festivals' },
          { icon: '🌡', label: 'Cooler' },
          { icon: '👥', label: 'Busy' },
          { icon: '💑', label: 'Couples Peak' },
        ],
      },
    ],
  },
]

export function seasonFromMonthIndex(monthIndex: number): Season {
  return SEASONS.find((season) => season.monthIndexes.includes(monthIndex)) ?? SEASONS[0]
}
