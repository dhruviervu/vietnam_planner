import { getExperienceImages } from '../../PlanBuilder/lib/pricing'
import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { cityImages } from '../../PlanBuilder/data/cityImages'
import { cityToSlug } from '../../PlanBuilder/services/citySlug'
import { cityKey } from '../../ItineraryTemplates/lib/cityKey'
import { COUNTRY_ROUTES } from './countryRoutes'
import { packCityStayDays, placeIdForCity, sightName, splitSourceIds } from '../lib/packHighRoi'
import type { PackedDay, PackedTemplate } from './catalogTypes'

export type { PackedDay, PackedTemplate } from './catalogTypes'

const CITY_SPECS: { city: string; dayOptions: number[] }[] = [
  { city: 'Hanoi', dayOptions: [1, 2, 3, 4, 5] },
  { city: 'Ninh Binh', dayOptions: [1, 2, 3] },
  { city: 'Sapa', dayOptions: [2, 3, 4] },
  { city: 'Ha Long', dayOptions: [1, 2, 3] },
  { city: 'Cat Ba', dayOptions: [1, 2, 3] },
  { city: 'Ha Giang', dayOptions: [3, 4] },
  { city: 'Dong Van', dayOptions: [1, 2] },
  { city: 'Hue', dayOptions: [1, 2, 3] },
  { city: 'Da Nang', dayOptions: [1, 2, 3, 4] },
  { city: 'Hoi An', dayOptions: [1, 2, 3, 4] },
  { city: 'Phong Nha', dayOptions: [2, 3, 4] },
  { city: 'Nha Trang', dayOptions: [1, 2, 3, 4] },
  { city: 'Da Lat', dayOptions: [1, 2, 3, 4] },
  { city: 'Ho Chi Minh City', dayOptions: [1, 2, 3, 4] },
  { city: 'Can Tho', dayOptions: [1, 2] },
  { city: 'Phu Quoc', dayOptions: [2, 3, 4, 5] },
]

function coverImage(cities: string[], firstId?: string): string {
  const exp = firstId ? getExperienceById(firstId) : undefined
  if (exp) {
    const photos = getExperienceImages(exp)
    if (photos[0]) return photos[0]
  }
  for (const city of cities) {
    const photos = cityImages(cityKey(city)) || cityImages(cityToSlug(city))
    if (photos[0]) return photos[0]
  }
  return ''
}

function describeCity(city: string, days: number, ids: string[]): string {
  const names = ids.slice(0, 8).map(sightName)
  const listed = names.length
    ? names.slice(0, 6).join(', ') + (names.length > 6 ? '…' : '')
    : 'the city’s highest-ranked sights'
  return `${days}-day packed ${city} plan: ${listed}. Markets and shopping stops sit on the same timeline as the sights.`
}

function describeCountry(title: string, cities: string[], ids: string[]): string {
  const names = ids.slice(0, 10).map(sightName)
  return `${title} — ${cities.join(' → ')}. Highest-ROI days with ${names.slice(0, 5).join(', ')}${
    names.length > 5 ? ', and more' : ''
  }. Shopping is packed as sights, not a sidebar.`
}

function fromStayDays(city: string, rows: string[][]): PackedDay[] {
  const placeId = placeIdForCity(city)
  return rows.map((sourceIds) => ({ city, placeId, sourceIds }))
}

function assemble(
  dayPlans: PackedDay[],
  meta: Omit<PackedTemplate, 'dayPlans' | 'experienceIds' | 'shoppingIds' | 'allIds' | 'days' | 'cities' | 'previewNames'> & {
    days?: number
    cities?: string[]
  },
): PackedTemplate {
  const allIds = dayPlans.flatMap((d) => d.sourceIds)
  const { experienceIds, shoppingIds } = splitSourceIds(allIds)
  const cities = meta.cities ?? [...new Set(dayPlans.map((d) => d.city))]
  const days = meta.days ?? dayPlans.length
  return {
    ...meta,
    days,
    cities,
    image: meta.image || coverImage(cities, allIds[0]),
    previewNames: allIds.slice(0, 8).map(sightName).filter(Boolean),
    dayPlans,
    experienceIds,
    shoppingIds,
    allIds,
  }
}

function buildCityTemplates(): PackedTemplate[] {
  const out: PackedTemplate[] = []
  for (const spec of CITY_SPECS) {
    const seenDays = new Set<number>()
    for (const n of spec.dayOptions) {
      const rows = packCityStayDays(spec.city, n).filter((row) => row.length > 0)
      if (!rows.length) continue
      if (seenDays.has(rows.length)) continue
      seenDays.add(rows.length)
      const dayPlans = fromStayDays(spec.city, rows)
      const ids = dayPlans.flatMap((d) => d.sourceIds)
      out.push(
        assemble(dayPlans, {
          id: `city-${cityToSlug(spec.city)}-${rows.length}`,
          kind: 'city',
          title: `${rows.length}-day ${spec.city} itinerary`,
          description: describeCity(spec.city, rows.length, ids),
          image: coverImage([spec.city], ids[0]),
        }),
      )
    }
  }
  return out
}

function buildCountryTemplates(): PackedTemplate[] {
  return COUNTRY_ROUTES.map((route) => {
    const dayPlans: PackedDay[] = []
    for (const stay of route.stays) {
      const rows = packCityStayDays(stay.city, stay.days)
      dayPlans.push(...fromStayDays(stay.city, rows))
    }
    const ids = dayPlans.flatMap((d) => d.sourceIds)
    return assemble(dayPlans, {
      id: route.id,
      kind: 'country',
      title: route.title,
      description: route.description || describeCountry(route.title, route.stays.map((s) => s.city), ids),
      image: coverImage(
        route.stays.map((s) => s.city),
        ids[0],
      ),
    })
  }).filter((t) => t.dayPlans.length > 0)
}

/** Live pack — tests and snapshot generation only. The ideas page loads JSON. */
export function buildPackedCatalog(): PackedTemplate[] {
  return [...buildCountryTemplates(), ...buildCityTemplates()]
}
