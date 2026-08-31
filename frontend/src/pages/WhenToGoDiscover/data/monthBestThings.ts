import type { BestForChip, MonthId } from './months'
import { getMonthProfile } from './months'
import { getMonthHappenSnapshot } from './monthSnapshots'

export type MonthBestPlace = {
  name: string
  city: string
  note: string
}

export type MonthBestExperience = {
  name: string
  note: string
}

export type MonthBestThings = {
  month: MonthId
  featuredCity: string
  cityWhy: string
  places: MonthBestPlace[]
  experiences: MonthBestExperience[]
  bestRegions: string[]
  bestFor: BestForChip[]
}

const MONTH_BEST_THINGS: Record<
  MonthId,
  Omit<MonthBestThings, 'month' | 'bestRegions' | 'bestFor'>
> = {
  1: {
    featuredCity: 'Hoi An',
    cityWhy:
      'Dry, bright old-town days and calm central-coast beaches make Hoi An the easiest January base — cooler Hanoi mornings are a contrast, not the main weather story.',
    places: [
      {
        name: 'Hoi An Ancient Town',
        city: 'Hoi An',
        note: 'Lantern streets, tailor shops, and the Japanese Bridge in peak dry-season light.',
      },
      {
        name: 'Ha Long Bay',
        city: 'Ha Long',
        note: 'Clear winter skies suit overnight cruises and kayak days between the karsts.',
      },
      {
        name: 'Mekong Delta',
        city: 'Can Tho',
        note: 'Warm, low-rain boat days through floating markets and orchard canals.',
      },
    ],
    experiences: [
      { name: 'Overnight bay cruise', note: 'Calm winter water and sharp limestone silhouettes.' },
      { name: 'Old-town lantern walk', note: 'Full-moon evenings without summer storm risk.' },
      { name: 'South-coast beach day', note: 'Da Nang and Hoi An stay swimmable and reliable.' },
    ],
  },
  2: {
    featuredCity: 'Hanoi',
    cityWhy:
      'Tết peaks here — peach-blossom markets, ancestor streets, and citywide fireworks — but book stays early; many shops close for the holiday week.',
    places: [
      {
        name: 'Hanoi Old Quarter',
        city: 'Hanoi',
        note: 'Flower markets, lion dances, and festive night energy around Hoan Kiem.',
      },
      {
        name: 'Ho Chi Minh City',
        city: 'Ho Chi Minh City',
        note: 'Nguyen Hue flower street and southern Tết lights at their densest.',
      },
      {
        name: 'Da Nang coast',
        city: 'Da Nang',
        note: 'Dry beaches if you want a quieter contrast to the holiday cities.',
      },
    ],
    experiences: [
      { name: 'Tết market wander', note: 'Kumquat trees, peach blossom, and lucky foods.' },
      { name: 'Perfume Pagoda pilgrimage', note: 'Boat-and-climb season opens in the limestone valley.' },
      { name: 'Lantern full moon', note: 'Hoi An still floats candles between holiday peaks.' },
    ],
  },
  3: {
    featuredCity: 'Ha Long',
    cityWhy:
      'March is the rare month when north, centre, and south all travel well — Ha Long’s clearest spring skies make it the headline, with Hoi An and Ninh Binh easy to stitch on.',
    places: [
      {
        name: 'Ha Long Bay',
        city: 'Ha Long',
        note: 'Prime cruise and kayak weather before summer haze and rain build.',
      },
      {
        name: 'Ninh Binh',
        city: 'Ninh Binh',
        note: 'Spring rice paddies and limestone boat rides at their greenest.',
      },
      {
        name: 'Hoi An beaches',
        city: 'Hoi An',
        note: 'Warm, dry coast for An Bang days after old-town mornings.',
      },
    ],
    experiences: [
      { name: 'North-to-south sightseeing', note: 'The classic multi-region window of the year.' },
      { name: 'Rice-landscape photography', note: 'Ninh Binh and highland edges turn vivid green.' },
      { name: 'Hanoi flower season', note: 'Mild capital days for lakes, coffee, and street food.' },
    ],
  },
  4: {
    featuredCity: 'Hoi An',
    cityWhy:
      'April keeps the central coast hot, dry, and beach-ready before summer humidity — Hoi An is the natural hub for Hue, Da Nang, and heritage days.',
    places: [
      {
        name: 'Hoi An Ancient Town',
        city: 'Hoi An',
        note: 'Still excellent walking weather before the wetter central months.',
      },
      {
        name: 'Hue Citadel',
        city: 'Hue',
        note: 'Imperial courtyards stay workable in the mornings; start early.',
      },
      {
        name: 'Mekong Delta',
        city: 'Can Tho',
        note: 'Boat days remain easy if you leave at dawn before southern heat peaks.',
      },
    ],
    experiences: [
      { name: 'Hung Kings commemorations', note: 'National heritage day with temple ceremonies up north.' },
      { name: 'Coast-and-city hop', note: 'Da Nang beaches with Hue and Hoi An in one stretch.' },
      { name: 'Highland love market', note: 'Khau Vai’s once-a-year gathering draws culture seekers.' },
    ],
  },
  5: {
    featuredCity: 'Da Lat',
    cityWhy:
      'Lowland heat and showers rise in May — Da Lat’s cooler plateau is the relief valve, with Sapa a close second for greener, quieter days.',
    places: [
      {
        name: 'Da Lat highlands',
        city: 'Da Lat',
        note: 'Pine hills, lakes, and market produce while the coast turns humid.',
      },
      {
        name: 'Sapa terraces',
        city: 'Sapa',
        note: 'Fresher air and early green rice before peak monsoon.',
      },
      {
        name: 'Central beaches (mornings)',
        city: 'Da Nang',
        note: 'Still usable if you keep outdoor time before afternoon rain.',
      },
    ],
    experiences: [
      { name: 'Highland cool-down', note: 'Swap sticky cities for altitude and mist.' },
      { name: 'Quieter major sights', note: 'Demand softens between spring peak and summer storms.' },
      { name: 'Temple mornings', note: 'Buddha’s Birthday period adds calmer courtyard days.' },
    ],
  },
  6: {
    featuredCity: 'Da Nang',
    cityWhy:
      'June is wetter and hotter nationwide, but Da Nang still carries the month — fireworks over the Han River plus highland day-trips when the coast steams.',
    places: [
      {
        name: 'Han River waterfront',
        city: 'Da Nang',
        note: 'International fireworks nights pack bridges and promenades.',
      },
      {
        name: 'Da Lat',
        city: 'Da Lat',
        note: 'The reliable cool escape from lowland humidity.',
      },
      {
        name: 'Sapa',
        city: 'Sapa',
        note: 'Green terraces and trekking between summer showers.',
      },
    ],
    experiences: [
      { name: 'Fireworks festival evenings', note: 'Choreographed displays over the river and beachfront.' },
      { name: 'Flexible city food days', note: 'Duck rain with cafés, markets, and indoor culture.' },
      { name: 'Highland loop', note: 'Sapa or Da Lat when beach plans look unreliable.' },
    ],
  },
  7: {
    featuredCity: 'Hanoi',
    cityWhy:
      'July is peak wet season on the central coast — Hanoi’s food streets, museums, and rain-smart evenings outperform rigid beach itineraries.',
    places: [
      {
        name: 'Hanoi Old Quarter',
        city: 'Hanoi',
        note: 'Pho, egg coffee, and covered alleys when showers pass through.',
      },
      {
        name: 'Sapa / Ha Giang',
        city: 'Sapa',
        note: 'Lush mountain loops on clear spells between storms.',
      },
      {
        name: 'Ho Chi Minh City',
        city: 'Ho Chi Minh City',
        note: 'Indoor museums, food halls, and café culture in the rain.',
      },
    ],
    experiences: [
      { name: 'Rain-smart city days', note: 'Museums, cooking classes, and covered markets.' },
      { name: 'Fireworks follow-up', note: 'Da Nang’s festival often still lights the river.' },
      { name: 'Quieter icons', note: 'Major temples and bays feel less crowded between bursts.' },
    ],
  },
  8: {
    featuredCity: 'Sapa',
    cityWhy:
      'August keeps the central coast stormy — northern rice terraces hit their most vivid green, and Vu Lan ceremonies fill temples nationwide.',
    places: [
      {
        name: 'Sapa rice terraces',
        city: 'Sapa',
        note: 'Peak green season for treks and village homestays.',
      },
      {
        name: 'Hanoi temples',
        city: 'Hanoi',
        note: 'Vu Lan offerings and lanterns on the seventh lunar month.',
      },
      {
        name: 'Ho Chi Minh City',
        city: 'Ho Chi Minh City',
        note: 'Food-and-café days when the coast is too variable to lock in.',
      },
    ],
    experiences: [
      { name: 'Vu Lan remembrance', note: 'Temple incense, river lanterns, and family offerings.' },
      { name: 'Highland photography', note: 'Sapa and Ha Giang at their lushest.' },
      { name: 'Indoor culture', note: 'Water puppets and museums beat beach gamble days.' },
    ],
  },
  9: {
    featuredCity: 'Hanoi',
    cityWhy:
      'September is a clearing shoulder month — Mid-Autumn lanterns and National Day energy lift the capital, while Ninh Binh and the coast start to reopen.',
    places: [
      {
        name: 'Hanoi lantern streets',
        city: 'Hanoi',
        note: 'Star lanterns, mooncakes, and children’s parades at Mid-Autumn.',
      },
      {
        name: 'Ninh Binh',
        city: 'Ninh Binh',
        note: 'Photography conditions improve as rains ease.',
      },
      {
        name: 'Hoi An',
        city: 'Hoi An',
        note: 'Evenings return as central weather begins to settle.',
      },
    ],
    experiences: [
      { name: 'Mid-Autumn festival', note: 'Lantern parades and family sweets in the cities.' },
      { name: 'National Day city energy', note: 'Flags, gatherings, and festive nights around the 2nd.' },
      { name: 'Shoulder-season outdoor days', note: 'Ninh Binh and the coast reopen in fits and starts.' },
    ],
  },
  10: {
    featuredCity: 'Hoi An',
    cityWhy:
      'October unlocks lantern nights and clearer heritage weather — Hoi An is the month’s centre of gravity, with Hue and Ha Long close behind.',
    places: [
      {
        name: 'Hoi An Ancient Town',
        city: 'Hoi An',
        note: 'Full-moon lanterns and riverside evenings as rains retreat.',
      },
      {
        name: 'Hue heritage',
        city: 'Hue',
        note: 'Citadel and tomb walks feel rewarding again in milder air.',
      },
      {
        name: 'Ha Long Bay',
        city: 'Ha Long',
        note: 'Northern skies clear for cruises after the wet months.',
      },
    ],
    experiences: [
      { name: 'Lantern festival night', note: 'The town’s most atmospheric full-moon tradition.' },
      { name: 'Kate Festival', note: 'Cham towers near Nha Trang with dance and ritual dress.' },
      { name: 'Evening sightseeing', note: 'Cooler nights suit walking cities and heritage sites.' },
    ],
  },
  11: {
    featuredCity: 'Hoi An',
    cityWhy:
      'November is classic dry season — lantern streets, Ha Long cruises, and cooler Hanoi days. Hoi An is the city that best holds all three: culture, coast, and clear evenings.',
    places: [
      {
        name: 'Hoi An lantern streets',
        city: 'Hoi An',
        note: 'Peak dry-season old town with reliable full-moon nights.',
      },
      {
        name: 'Ha Long Bay',
        city: 'Ha Long',
        note: 'Clear-season water and photography light.',
      },
      {
        name: 'Hue Citadel',
        city: 'Hue',
        note: 'Comfortable heritage walks in the cooling central air.',
      },
    ],
    experiences: [
      { name: 'Lantern evenings', note: 'The most reliable month for Hoi An’s night ritual.' },
      { name: 'Clear-season bay trip', note: 'Overnight cruises with fewer rain delays.' },
      { name: 'Ooc Om Boc', note: 'Khmer moon worship and boat races in the delta.' },
    ],
  },
  12: {
    featuredCity: 'Ho Chi Minh City',
    cityWhy:
      'December mixes festive southern nights with peak beach season — Saigon’s year-end lights are the city story, with Da Nang, Hoi An, and Phu Quoc as the coast add-ons.',
    places: [
      {
        name: 'Ho Chi Minh City nights',
        city: 'Ho Chi Minh City',
        note: 'Christmas and New Year lights, food streets, and city energy.',
      },
      {
        name: 'Da Nang / Hoi An coast',
        city: 'Da Nang',
        note: 'Prime dry-season beach weather on the central strip.',
      },
      {
        name: 'Phu Quoc',
        city: 'Phu Quoc',
        note: 'Calm seas and island days in the southern dry window.',
      },
    ],
    experiences: [
      { name: 'Festive city evenings', note: 'Hanoi and Saigon dress up for year-end.' },
      { name: 'Peak beach week', note: 'Swim, snorkel, and island hops with low rain risk.' },
      { name: 'Book-ahead stays', note: 'December–January is nationwide high demand.' },
    ],
  },
}

export function getMonthBestThings(month: MonthId): MonthBestThings {
  const curated = MONTH_BEST_THINGS[month]
  const snapshot = getMonthHappenSnapshot(month)
  const profile = getMonthProfile(month)
  return {
    month,
    ...curated,
    bestRegions: snapshot.bestRegions,
    bestFor: profile.bestFor,
  }
}
