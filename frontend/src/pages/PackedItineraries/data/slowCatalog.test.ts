import { describe, expect, it } from 'vitest'
import { SLOW_TEMPLATES, getSlowTemplate } from './slowCatalog'
import { getIdeaTemplate, IDEA_TEMPLATES } from './ideasCatalog'
import { getPackedTemplate } from './catalog'
import { packSlowStayDays, THEME_PACE } from '../lib/themeStayPack'
import { buildPackedTrip } from '../lib/buildPackedTrip'

describe('slow itinerary ideas catalog', () => {
  it('lists slow city and country cards without replacing packed ones', () => {
    expect(getPackedTemplate('city-hanoi-3')?.title).toBe('3-day Hanoi itinerary')
    expect(getPackedTemplate('slow-city-ha-long-3')).toBeUndefined()
    expect(getIdeaTemplate('city-hanoi-3')?.pace).not.toBe('slow')
    expect(getIdeaTemplate('slow-city-ha-long-3')?.title).toBe('3 slow days in Ha Long')
    expect(getSlowTemplate('slow-north-water')?.title).toMatch(/slow/i)
    expect(SLOW_TEMPLATES.every((t) => /slow/i.test(t.title))).toBe(true)
    expect(SLOW_TEMPLATES.some((t) => t.kind === 'country')).toBe(true)
    expect(IDEA_TEMPLATES.filter((t) => t.pace === 'slow').length).toBe(SLOW_TEMPLATES.length)
  })

  it('packs at least three sights a day from 10:00', () => {
    const haLong = getSlowTemplate('slow-city-ha-long-3')
    expect(haLong?.dayPlans.map((d) => d.sourceIds)).toEqual(packSlowStayDays('Ha Long', 3))
    expect(haLong?.allIds).not.toContain('halong-cruise')
    for (const template of SLOW_TEMPLATES) {
      expect(template.dayPlans.length).toBe(template.days)
      for (const day of template.dayPlans) {
        expect(day.sourceIds.length, template.id).toBeGreaterThanOrEqual(THEME_PACE.slow.minStops)
        expect(day.sourceIds.length, template.id).toBeLessThanOrEqual(THEME_PACE.slow.maxStops)
      }
    }
  })

  it('keeps each slow day on its own calendar day', () => {
    const template = getSlowTemplate('slow-city-hoi-an-4')
    expect(template).toBeTruthy()
    const trip = buildPackedTrip(template!)
    expect(trip.days).toHaveLength(4)
    for (const day of trip.days) {
      const sightIds = day.periods.flatMap((p) =>
        p.items.filter((it) => it.kind === 'experience' || it.kind === 'activity').map((it) => it.sourceId),
      )
      expect(sightIds.length).toBeGreaterThanOrEqual(THEME_PACE.slow.minStops)
      expect(sightIds.length).toBeLessThanOrEqual(THEME_PACE.slow.maxStops)
    }
  })
})
