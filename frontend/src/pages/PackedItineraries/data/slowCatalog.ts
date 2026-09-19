import { getExperienceImages } from '../../PlanBuilder/lib/pricing'
import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { cityImages } from '../../PlanBuilder/data/cityImages'
import { cityToSlug } from '../../PlanBuilder/services/citySlug'
import { cityKey } from '../../ItineraryTemplates/lib/cityKey'
import { SLOW_CITY_SPECS } from '../../ItineraryTemplates/data/cityStayTemplates'
import { packSlowStayDays } from '../lib/themeStayPack'
import { placeIdForCity, sightName, splitSourceIds } from '../lib/packHighRoi'
import type { PackedDay, PackedTemplate } from './catalogTypes'

const SLOW_COUNTRY_ROUTES: {
  id: string
  title: string
  description: string
  stays: { city: string; days: number }[]
}[] = [
  {
    id: 'slow-north-water',
    title: '7 slow days · North Water',
    description:
      'Unhurried water: three Hanoi lake-and-temple stops from 10:00, then Ha Long’s shore parks and pagodas, then Ninh Binh boats with empty hours between. Massage or a soak when the city lists one.',
    stays: [
      { city: 'Hanoi', days: 2 },
      { city: 'Ha Long', days: 2 },
      { city: 'Ninh Binh', days: 3 },
    ],
  },
  {
    id: 'slow-imperial-lanterns',
    title: '7 slow days · Citadel, then Lanterns',
    description:
      'Hue’s citadel at walking speed, Thiên Mụ and the river, one tomb, then Hoi An old town, basket boats, An Bang, and lanterns. Plenty of empty afternoon.',
    stays: [
      { city: 'Hue', days: 3 },
      { city: 'Hoi An', days: 4 },
    ],
  },
  {
    id: 'slow-sand-and-lanterns',
    title: '7 slow days · Sand and Lanterns',
    description:
      'Hoi An and My Khe: ancient town, Cam Thanh, An Bang, lanterns, then Da Nang sand and Sơn Trà. Beach and boats first. Heritage as a side dish.',
    stays: [
      { city: 'Hoi An', days: 4 },
      { city: 'Da Nang', days: 3 },
    ],
  },
  {
    id: 'slow-two-coasts',
    title: '8 slow days · Two Coasts',
    description:
      'Nha Trang promenade, Po Nagar, one island outing, then Phu Quoc sand, Sao Beach, and Hòn Thơm. Unpack twice. Swim more than you tour.',
    stays: [
      { city: 'Nha Trang', days: 3 },
      { city: 'Phu Quoc', days: 5 },
    ],
  },
  {
    id: 'slow-valley-and-boats',
    title: '7 slow days · Valley, then Boats',
    description:
      'Cat Cat and Muong Hoa with empty hours, Fansipan only if the cloud lifts, then Trang An, Tam Coc bikes, and Bái Đính. The valley is the point.',
    stays: [
      { city: 'Sapa', days: 4 },
      { city: 'Ninh Binh', days: 3 },
    ],
  },
  {
    id: 'slow-mekong-island',
    title: '7 slow days · River Dawn, Island Week',
    description:
      'Cái Răng stays off the 10:00 clock. Ninh Kiều and a garden house, then Phu Quoc sand, Sao, Hòn Thơm, and a spa hour when it’s listed.',
    stays: [
      { city: 'Can Tho', days: 2 },
      { city: 'Phu Quoc', days: 5 },
    ],
  },
]

function coverImage(cities: string[], firstId?: string) {
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

function fromStayDays(city: string, rows: string[][]): PackedDay[] {
  const placeId = placeIdForCity(city)
  return rows.map((sourceIds) => ({ city, placeId, sourceIds }))
}

function assemble(dayPlans: PackedDay[], meta: Omit<PackedTemplate, 'dayPlans' | 'experienceIds' | 'shoppingIds' | 'allIds' | 'days' | 'cities' | 'previewNames' | 'pace'>): PackedTemplate {
  const allIds = dayPlans.flatMap((d) => d.sourceIds)
  const { experienceIds, shoppingIds } = splitSourceIds(allIds)
  const cities = [...new Set(dayPlans.map((d) => d.city))]
  return {
    ...meta,
    pace: 'slow',
    days: dayPlans.length,
    cities,
    image: meta.image || coverImage(cities, allIds[0]),
    previewNames: allIds.slice(0, 8).map(sightName).filter(Boolean),
    dayPlans,
    experienceIds,
    shoppingIds,
    allIds,
  }
}

function buildSlowCityTemplates(): PackedTemplate[] {
  return SLOW_CITY_SPECS.map(({ city, days }) => {
    const rows = packSlowStayDays(city, days).filter((row) => row.length > 0)
    const dayPlans = fromStayDays(city, rows)
    const ids = dayPlans.flatMap((d) => d.sourceIds)
    return assemble(dayPlans, {
      id: `slow-city-${cityToSlug(city)}-${rows.length}`,
      kind: 'city',
      title: `${rows.length} slow days in ${city}`,
      description:
        `${city} without the race: three sights a day, first stop at 10:00, two to four hours between them — a spa or soak when the city lists one.`,
      image: coverImage([city], ids[0]),
    })
  }).filter((t) => t.dayPlans.length > 0)
}

function buildSlowCountryTemplates(): PackedTemplate[] {
  return SLOW_COUNTRY_ROUTES.map((route) => {
    const dayPlans: PackedDay[] = []
    for (const stay of route.stays) {
      const rows = packSlowStayDays(stay.city, stay.days).filter((row) => row.length > 0)
      dayPlans.push(...fromStayDays(stay.city, rows.slice(0, stay.days)))
    }
    return assemble(dayPlans, {
      id: route.id,
      kind: 'country',
      title: route.title,
      description: route.description,
      image: coverImage(
        route.stays.map((s) => s.city),
        dayPlans[0]?.sourceIds[0],
      ),
    })
  }).filter((t) => t.dayPlans.length > 0)
}

export const SLOW_TEMPLATES: PackedTemplate[] = [...buildSlowCountryTemplates(), ...buildSlowCityTemplates()]

const BY_ID = new Map(SLOW_TEMPLATES.map((template) => [template.id, template]))

export function getSlowTemplate(id: string) {
  return BY_ID.get(id)
}

export function isSlowIdea(template: PackedTemplate) {
  return template.pace === 'slow'
}
