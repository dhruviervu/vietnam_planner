import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CITY_STAY_TEMPLATES, cityStayTemplateId } from './cityStayTemplates'
import { ITINERARY_TEMPLATES, getTemplateById } from './templates'
import { daysLabel, paceLabel, typicalDaysFor } from '../lib/templateCopy'

describe('itinerary template catalog', () => {
  it('builds city-stay card ids from slugs', () => {
    expect(cityStayTemplateId('Hanoi', 3)).toBe('city-3-hanoi')
    expect(cityStayTemplateId('Ho Chi Minh City', 3)).toBe('city-3-ho-chi-minh-city')
    expect(CITY_STAY_TEMPLATES).toHaveLength(9)
    expect(getTemplateById('city-3-hanoi')?.title).toBe('3 days in Hanoi')
    expect(getTemplateById('city-3-hanoi-fun')?.title).toBe('3 fun days in Hanoi')
    expect(ITINERARY_TEMPLATES.length).toBeGreaterThan(70)
  })

  it('does not import the ranked sight catalog', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const stay = readFileSync(join(here, 'cityStayTemplates.ts'), 'utf8')
    const templates = readFileSync(join(here, 'templates.ts'), 'utf8')
    expect(stay).not.toMatch(/cityCatalog/)
    expect(stay).toMatch(/citySlug/)
    expect(templates).not.toMatch(/cityCatalog/)
  })

  it('labels days and pace without hydrating experiences', () => {
    const template = getTemplateById('vietnam-your-way')
    expect(template).toBeTruthy()
    expect(typicalDaysFor(template!)).toBe(14)
    expect(daysLabel(14)).toBe('14 days')
    expect(paceLabel('packed')).toBe('Maximum')
  })
})
