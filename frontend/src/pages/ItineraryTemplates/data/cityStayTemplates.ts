import { cityImages } from '../../PlanBuilder/data/cityImages'
import { cityToSlug } from '../../PlanBuilder/services/citySlug'
import { CITY_STAY_NARRATIVE, THREE_DAY_CITIES } from '../../PackedItineraries/data/cityStayCores'
import { cityKey } from '../lib/cityKey'
import type { ItineraryTemplate } from './types'

function cover(city: string) {
  const photos = cityImages(cityKey(city)) || cityImages(cityToSlug(city))
  return photos[0] || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80'
}

export function cityStayTemplateId(city: string, days = 3) {
  return `city-${days}-${cityToSlug(city)}`
}

export function themedCityTemplateId(city: string, theme: string, days = 3) {
  return `${cityStayTemplateId(city, days)}-${theme}`
}

export function parseThemedCityTemplateId(id: string) {
  const match = /^city-(\d+)-(.+)-(relaxed|luxury|fun|nightlife|slow)$/.exec(id)
  if (!match) return null
  return {
    days: Number(match[1]),
    citySlug: match[2],
    theme: match[3] as 'relaxed' | 'luxury' | 'fun' | 'nightlife' | 'slow',
  }
}

export const CITY_STAY_TEMPLATES: ItineraryTemplate[] = THREE_DAY_CITIES.map((city) => {
  const copy = CITY_STAY_NARRATIVE[city]
  return {
    id: cityStayTemplateId(city, 3),
    title: `3 days in ${city}`,
    section: 'city-stays',
    description: copy?.summary ?? `A packed 3-day ${city} stay using the same clustering as Your Itinerary.`,
    tags: ['First-timer'],
    pace: 'packed',
    minDays: 3,
    maxDays: 3,
    peopleMin: 1,
    peopleMax: 8,
    cities: [city],
    image: cover(city),
  }
})

const THEME_CARDS: {
  theme: 'relaxed' | 'luxury' | 'fun' | 'nightlife'
  section: ItineraryTemplate['section']
  tag: ItineraryTemplate['tags'][0]
  pace: ItineraryTemplate['pace']
  title: (city: string) => string
  description: (city: string) => string
}[] = [
  {
    theme: 'relaxed',
    section: 'relaxed',
    tag: 'Relaxing',
    pace: 'relaxed',
    title: (city) => `3 relaxed days in ${city}`,
    description: (city) =>
      `${city} without the race: three sights from 10:00, lake walks, pagodas, a boat or beach, and a massage when it’s listed.`,
  },
  {
    theme: 'luxury',
    section: 'luxury',
    tag: 'Luxury',
    pace: 'relaxed',
    title: (city) => `3 luxurious days in ${city}`,
    description: (city) =>
      `A polished ${city} stay: the best rooms, the serious museums and views, private cars, and no backpacker crawl.`,
  },
  {
    theme: 'fun',
    section: 'fun',
    tag: 'Friends',
    pace: 'packed',
    title: (city) => `3 fun days in ${city}`,
    description: (city) =>
      `${city} as a playground: boats, classes, viewpoints, and enough motion that a crew never sits still.`,
  },
  {
    theme: 'nightlife',
    section: 'nightlife',
    tag: 'Nightlife',
    pace: 'balanced',
    title: (city) => `3 nights out in ${city}`,
    description: (city) =>
      `${city} after dark: lanterns, night markets, rooftops, and just enough daylight so the late nights still work.`,
  },
]

export const THEMED_CITY_TEMPLATES: ItineraryTemplate[] = THREE_DAY_CITIES.flatMap((city) =>
  THEME_CARDS.map((card) => ({
    id: themedCityTemplateId(city, card.theme, 3),
    title: card.title(city),
    section: card.section,
    description: card.description(city),
    tags: [card.tag],
    pace: card.pace,
    minDays: 3,
    maxDays: 3,
    peopleMin: 1,
    peopleMax: 8,
    cities: [city],
    image: cover(city),
  })),
)

export const SLOW_CITY_SPECS: { city: string; days: number }[] = [
  { city: 'Hanoi', days: 4 },
  { city: 'Ha Long', days: 3 },
  { city: 'Ninh Binh', days: 3 },
  { city: 'Hue', days: 4 },
  { city: 'Hoi An', days: 4 },
  { city: 'Da Nang', days: 4 },
  { city: 'Nha Trang', days: 4 },
  { city: 'Da Lat', days: 4 },
  { city: 'Sapa', days: 4 },
  { city: 'Phu Quoc', days: 4 },
  { city: 'Cat Ba', days: 3 },
  { city: 'Can Tho', days: 3 },
]

export const SLOW_CITY_NAMES = SLOW_CITY_SPECS.map((row) => row.city)

export const SLOW_CITY_TEMPLATES: ItineraryTemplate[] = SLOW_CITY_SPECS.map(({ city, days }) => ({
  id: themedCityTemplateId(city, 'slow', days),
  title: `${days} slow days in ${city}`,
  section: 'slow',
  description: `${city} without the race: three well-spaced sights from 10:00, two to four hours between them, and a spa or soak when the city lists one.`,
  tags: ['Relaxing'],
  pace: 'relaxed',
  minDays: days,
  maxDays: days,
  peopleMin: 1,
  peopleMax: 6,
  cities: [city],
  image: cover(city),
}))

export function cityNameFromThemedSlug(slug: string) {
  return [...THREE_DAY_CITIES, ...SLOW_CITY_NAMES].find((name) => cityToSlug(name) === slug) ?? null
}
