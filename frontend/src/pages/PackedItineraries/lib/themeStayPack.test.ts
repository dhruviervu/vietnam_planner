import { describe, expect, it } from 'vitest'
import { getTemplateById, ITINERARY_TEMPLATES } from '../../ItineraryTemplates/data/templates'
import { authoredThemedCityPlan } from '../../ItineraryTemplates/data/plans/cityStayPlanBuild'
import { themedCityTemplateId, THEMED_CITY_TEMPLATES, SLOW_CITY_TEMPLATES, SLOW_CITY_SPECS } from '../../ItineraryTemplates/data/cityStayTemplates'
import { getAuthoredPlan, validateAuthoredPlans } from '../../ItineraryTemplates/data/plans'
import { buildTemplateItinerary } from '../../ItineraryTemplates/lib/buildTemplateItinerary'
import { catalogHoursForSourceId } from '../../PlanBuilder/lib/yourVietnam/dayAllocation'
import { isAtomicExclusive } from '../../PlanBuilder/lib/yourVietnam/sightIntelligence'
import { packCityStayDays } from './packHighRoi'
import {
  packThemedStayDays,
  independentUnhurriedStops,
  THEME_PACE,
  SLOW_GAP_HOURS,
  type StayTheme,
} from './themeStayPack'

function clockMins(label: string) {
  const [hh, mm] = label.split(':').map(Number)
  return hh * 60 + mm
}

describe('themed city stay packing', () => {
  it('lists a 3-day card per city for relaxed, luxury, fun, and nightlife', () => {
    expect(THEMED_CITY_TEMPLATES).toHaveLength(36)
    expect(ITINERARY_TEMPLATES.some((t) => t.id === 'city-3-hanoi-nightlife')).toBe(true)
    expect(getTemplateById('city-3-hanoi-fun')?.section).toBe('fun')
    expect(getTemplateById('city-3-hoi-an-relaxed')?.pace).toBe('relaxed')
  })

  it('packs fuller days than a thin core and keeps themes distinct', () => {
    const packed = packCityStayDays('Hanoi', 3)
    const relaxed = packThemedStayDays('Hanoi', 3, 'relaxed')
    const nightlife = packThemedStayDays('Hanoi', 3, 'nightlife')
    expect(packed).toHaveLength(3)
    expect(relaxed).toHaveLength(3)
    expect(nightlife).toHaveLength(3)
    const packedStops = packed.reduce((n, row) => n + row.length, 0)
    const relaxedStops = relaxed.reduce((n, row) => n + row.length, 0)
    expect(relaxed.every((row) => row.length <= THEME_PACE.relaxed.maxStops)).toBe(true)
    expect(relaxedStops / 3).toBeLessThanOrEqual(THEME_PACE.relaxed.maxStops)
    expect(packedStops).toBeGreaterThanOrEqual(12)
    expect(nightlife.flat().includes('perfume-pagoda')).toBe(false)
    for (const row of packed) {
      const hours = row.reduce((sum, id) => sum + catalogHoursForSourceId(id), 0)
      expect(isAtomicExclusive(row[0] ?? '') || hours >= 6 || row.length >= 5).toBe(true)
    }
  })

  it('hydrates themed plans with flowing clocks and evening nightlife', () => {
    const themes: StayTheme[] = ['relaxed', 'luxury', 'fun', 'nightlife']
    for (const theme of themes) {
      const template = getTemplateById(themedCityTemplateId('Hanoi', theme, 3))
      expect(template, theme).toBeTruthy()
      const plan = authoredThemedCityPlan('Hanoi', 3, theme)
      const trip = buildTemplateItinerary(template!, { people: 2 }, plan)
      expect(trip.days).toHaveLength(3)
      for (const day of trip.days) {
        const visits = (['morning', 'afternoon', 'evening'] as const).flatMap((period) =>
          day.periods[period].filter((slot) => slot.kind === 'experience' || slot.kind === 'activity'),
        )
        expect(visits.length, `${theme} ${day.theme}`).toBeGreaterThan(0)
        const clocks = visits.map((slot) => clockMins(slot.timeLabel))
        if (theme === 'relaxed') {
          expect(visits.length, `${theme} ${day.theme}`).toBeGreaterThanOrEqual(THEME_PACE.relaxed.minStops)
          expect(clocks[0], `${theme} ${day.theme}`).toBeGreaterThanOrEqual(10 * 60)
          for (let i = 1; i < clocks.length; i++) {
            expect(clocks[i] - clocks[i - 1], `${theme} ${day.theme} ${visits[i]?.name}`).toBeGreaterThanOrEqual(
              SLOW_GAP_HOURS * 60 - 5,
            )
          }
        }
        for (let i = 1; i < clocks.length; i++) {
          expect(clocks[i], `${theme} ${day.theme} ${visits[i]?.name}`).toBeGreaterThanOrEqual(clocks[i - 1])
        }
        if (theme === 'nightlife') {
          expect(day.periods.evening.length, `${day.theme} missing night`).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('slow city stays', () => {
  it('lists a slow card for water and heritage cities without replacing packed or relaxed cards', () => {
    expect(SLOW_CITY_TEMPLATES.length).toBe(12)
    expect(THEMED_CITY_TEMPLATES).toHaveLength(36)
    expect(getTemplateById('city-3-hanoi-relaxed')?.section).toBe('relaxed')
    expect(getTemplateById('city-4-hoi-an-slow')?.section).toBe('slow')
    expect(getTemplateById('city-3-ha-long-slow')?.title).toBe('3 slow days in Ha Long')
    for (const id of [
      'slow-north-water',
      'slow-imperial-lanterns',
      'slow-sand-and-lanterns',
      'slow-two-coasts',
      'slow-valley-and-boats',
      'slow-mekong-island',
    ]) {
      expect(getTemplateById(id)?.section, id).toBe('slow')
    }
    expect(validateAuthoredPlans()).toEqual([])
  })

  it('keeps at least three sights a day and skips full-day cruises', () => {
    const hoiAn = packThemedStayDays('Hoi An', 4, 'slow')
    const haLong = packThemedStayDays('Ha Long', 3, 'slow')
    expect(hoiAn).toHaveLength(4)
    expect(haLong).toHaveLength(3)
    expect(
      hoiAn.every((row) => {
        const n = independentUnhurriedStops(row).length
        return n >= THEME_PACE.slow.minStops && n <= THEME_PACE.slow.maxStops
      }),
    ).toBe(true)
    expect(haLong.flat().includes('halong-cruise')).toBe(false)
    expect(hoiAn.some((row) => row.includes('ha-herbal-massage') || row.includes('cam-thanh-basket-boats'))).toBe(true)
    for (const { city, days } of SLOW_CITY_SPECS) {
      const rows = packThemedStayDays(city, days, 'slow')
      expect(rows, city).toHaveLength(days)
      expect(
        rows.every((row) => {
          const n = independentUnhurriedStops(row).length
          return n >= THEME_PACE.slow.minStops && n <= THEME_PACE.slow.maxStops
        }),
        city,
      ).toBe(true)
    }
  })

  it('keeps Hue’s citadel morning and Perfume River boat together, with Thiên Mụ on the boat', () => {
    for (const theme of ['slow', 'relaxed'] as const) {
      const day = packThemedStayDays('Hue', 1, theme)[0] ?? []
      expect(day, theme).toContain('hue-citadel')
      expect(day, theme).toContain('perfume-river')
      expect(day, theme).toContain('thien-mu-pagoda')
      const outings = independentUnhurriedStops(day)
      expect(outings, theme).not.toContain('thien-mu-pagoda')
    }
  })

  it('starts at 10:00 and leaves two to four hours between visits', () => {
    const template = getTemplateById('city-4-hoi-an-slow')
    expect(template).toBeTruthy()
    const plan = authoredThemedCityPlan('Hoi An', 4, 'slow')
    const trip = buildTemplateItinerary(template!, { people: 2 }, plan)
    expect(trip.days).toHaveLength(4)
    for (const day of trip.days) {
      const visits = (['morning', 'afternoon', 'evening'] as const).flatMap((period) =>
        day.periods[period].filter((slot) => slot.kind === 'experience' || slot.kind === 'activity'),
      )
      expect(visits.length, day.theme).toBeGreaterThanOrEqual(THEME_PACE.slow.minStops)
      expect(visits.length, day.theme).toBeLessThanOrEqual(THEME_PACE.slow.maxStops)
      const clocks = visits.map((slot) => clockMins(slot.timeLabel))
      expect(clocks[0], day.theme).toBeGreaterThanOrEqual(10 * 60)
      for (let i = 1; i < clocks.length; i++) {
        expect(clocks[i] - clocks[i - 1], `${day.theme} ${visits[i]?.name}`).toBeGreaterThanOrEqual(
          SLOW_GAP_HOURS * 60 - 5,
        )
      }
    }
  })

  it('rebuilds slow and relaxed country templates with three stops from 10:00', () => {
    for (const id of [
      'slow-north-water',
      'slow-imperial-lanterns',
      'slow-mekong-island',
      'take-it-slow-in-vietnam',
      'vietnam-at-your-own-pace',
      'slow-days-sunny-places',
    ]) {
      const template = getTemplateById(id)
      const plan = getAuthoredPlan(id)
      expect(template, id).toBeTruthy()
      expect(plan, id).toBeTruthy()
      const trip = buildTemplateItinerary(template!, { people: 2 }, plan)
      expect(trip.days.length, id).toBe(template!.minDays)
      for (const day of trip.days) {
        const visits = (['morning', 'afternoon', 'evening', 'night'] as const).flatMap((period) =>
          day.periods[period].filter(
            (slot) => slot.kind === 'experience' || slot.kind === 'activity' || slot.kind === 'shopping',
          ),
        )
        expect(visits.length, `${id} ${day.theme} ${visits.map((v) => v.sourceId).join(',')}`).toBeGreaterThanOrEqual(
          THEME_PACE.slow.minStops,
        )
        const clocks = visits.map((slot) => clockMins(slot.timeLabel))
        expect(clocks[0], `${id} ${day.theme}`).toBeGreaterThanOrEqual(10 * 60)
      }
    }
  })
})
