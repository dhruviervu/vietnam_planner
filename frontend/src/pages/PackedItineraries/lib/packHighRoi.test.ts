import { describe, expect, it } from 'vitest'
import { PACKED_TEMPLATES, getPackedTemplate } from '../data/catalog'
import { catalogHoursForSourceId } from '../../PlanBuilder/lib/yourVietnam/dayAllocation'
import { isIncludedCompanion } from '../../PlanBuilder/lib/yourVietnam/sightPlanning'
import { isAtomicExclusive } from '../../PlanBuilder/lib/yourVietnam/sightIntelligence'
import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { SHOPPING_ITEMS } from '../../PlanBuilder/data/shopping'
import { CITY_STAY_MUST, THREE_DAY_CITIES } from '../data/cityStayCores'
import { packCityStayDays, placeIdForCity } from './packHighRoi'
import { cityDayHostsFullVisit } from '../../PlanBuilder/lib/yourVietnam/dayAllocation'
import { buildPackedTrip } from './buildPackedTrip'
import { CITY_STAY_TEMPLATES, cityStayTemplateId } from '../../ItineraryTemplates/data/cityStayTemplates'
import { getCityStayPlan, getCityStayPlans } from '../../ItineraryTemplates/data/plans/cityStays'
import { authoredCityStayPlan } from '../../ItineraryTemplates/data/plans/cityStayPlanBuild'
import { buildTemplateItinerary } from '../../ItineraryTemplates/lib/buildTemplateItinerary'
import { getTemplateById } from '../../ItineraryTemplates/data/templates'

function billedHours(ids: string[]) {
  const billed = ids.filter((id) => !isIncludedCompanion(id, ids))
  return billed.reduce((sum, id) => sum + catalogHoursForSourceId(id), 0)
}

describe('packed itinerary templates', () => {
  it('ships city and country catalogs with sights on every day', () => {
    expect(PACKED_TEMPLATES.some((t) => t.kind === 'country')).toBe(true)
    expect(PACKED_TEMPLATES.some((t) => t.cities.includes('Da Nang'))).toBe(true)
    for (const template of PACKED_TEMPLATES) {
      expect(template.dayPlans.length).toBeGreaterThan(0)
      expect(template.allIds.length).toBeGreaterThan(0)
      expect(template.previewNames.length).toBeGreaterThan(0)
      for (const day of template.dayPlans) {
        expect(day.sourceIds.length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps precomputed city days in sync with live packing', () => {
    const samples = [
      ['Hanoi', 2, 'city-hanoi-2'],
      ['Hanoi', 3, 'city-hanoi-3'],
      ['Da Nang', 2, 'city-da-nang-2'],
    ] as const
    for (const [city, days, id] of samples) {
      expect(getPackedTemplate(id)?.dayPlans.map((d) => d.sourceIds)).toEqual(packCityStayDays(city, days))
    }
  })

  it('fills a day before opening the next on a 2-day city stay', () => {
    const daNang = PACKED_TEMPLATES.find((t) => t.id === 'city-da-nang-2')
    const hanoi = PACKED_TEMPLATES.find((t) => t.id === 'city-hanoi-2')
    expect(daNang?.days).toBe(2)
    expect(hanoi?.days).toBe(2)
    for (const template of [daNang, hanoi]) {
      if (!template) continue
      expect(template.dayPlans.length).toBe(2)
      for (const day of template.dayPlans) {
        const hours = billedHours(day.sourceIds)
        const exclusive = day.sourceIds.some((id) => isAtomicExclusive(id))
        expect(
          exclusive || hours >= 6 || day.sourceIds.length >= 6,
          `${template.id} ${day.city} underfilled: ${hours}h / ${day.sourceIds.join(', ')}`,
        ).toBe(true)
      }
    }
  })

  it('lays out templates without empty days', () => {
    const samples = PACKED_TEMPLATES.filter(
      (t) =>
        t.id === 'city-da-nang-2' ||
        t.id === 'city-hanoi-3' ||
        t.id === 'vn-classic-10' ||
        t.id === 'vn-central-7',
    )
    expect(samples.length).toBeGreaterThan(2)
    for (const template of samples) {
      const trip = buildPackedTrip(template)
      expect(trip.isEmpty).toBe(false)
      expect(trip.days.length).toBeGreaterThan(0)
      for (const day of trip.days) {
        const ids = day.periods.flatMap((p) =>
          p.items
            .filter((it) => it.kind === 'experience' || it.kind === 'shopping')
            .map((it) => it.sourceId)
            .filter(Boolean),
        )
        expect(ids.length).toBeGreaterThan(0)
      }
    }
  })

  it('packs 3-day city stays with must-dos, no blanks, no duplicate ids', () => {
    for (const city of THREE_DAY_CITIES) {
      const rows = packCityStayDays(city, 3)
      expect(rows.length, city).toBe(3)
      const flat: string[] = []
      for (const row of rows) {
        expect(row.length, `${city} empty day`).toBeGreaterThan(0)
        for (const id of row) {
          expect(
            getExperienceById(id) || SHOPPING_ITEMS.some((item) => item.id === id),
            `${city} unknown ${id}`,
          ).toBeTruthy()
          expect(flat.includes(id), `${city} duplicate ${id}`).toBe(false)
          flat.push(id)
        }
        expect(
          cityDayHostsFullVisit(row, placeIdForCity(city)),
          `${city} infeasible: ${row.join(',')}`,
        ).toBe(true)
      }
      for (const must of CITY_STAY_MUST[city] ?? []) {
        expect(flat.includes(must), `${city} missing ${must}`).toBe(true)
      }
      if (city === 'Nha Trang') {
        const vin = rows.find((row) => row.includes('vinwonders-nha-trang'))
        const mun = rows.find((row) => row.includes('hon-mun-island'))
        expect(vin).toBeTruthy()
        expect(mun).toBeTruthy()
        expect(vin).not.toBe(mun)
      }
      if (city === 'Sapa') {
        const trek = rows.find((row) => row.includes('sapa-trek'))
        const fan = rows.find((row) => row.includes('fansipan'))
        const cat = rows.find((row) => row.includes('cat-cat-village'))
        expect(trek).not.toBe(fan)
        expect(trek).not.toBe(cat)
        expect(fan).not.toBe(cat)
      }
    }
  })

  it('authors matching 3-day itinerary template cards', () => {
    const plans = getCityStayPlans()
    expect(CITY_STAY_TEMPLATES).toHaveLength(THREE_DAY_CITIES.length)
    expect(plans).toHaveLength(THREE_DAY_CITIES.length)
    for (const city of THREE_DAY_CITIES) {
      expect(getCityStayPlan(cityStayTemplateId(city, 3))).toEqual(authoredCityStayPlan(city, 3))
    }
    for (const plan of plans) {
      expect(plan.days).toHaveLength(3)
      const template = getTemplateById(plan.templateId)
      expect(template).toBeTruthy()
      const trip = buildTemplateItinerary(template!, { days: 3, people: 2 }, plan)
      expect(trip.days).toHaveLength(3)
      for (const day of trip.days) {
        const ids = (['morning', 'afternoon', 'evening'] as const).flatMap((p) =>
          day.periods[p]
            .filter((s) => s.kind === 'experience' || s.kind === 'shopping' || s.kind === 'activity')
            .map((s) => s.sourceId),
        )
        expect(ids.length, `${plan.templateId} ${day.theme}`).toBeGreaterThan(0)
      }
    }
  })
})

