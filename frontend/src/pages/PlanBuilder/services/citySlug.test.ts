import { describe, expect, it } from 'vitest'
import { cityAnchorId, cityToSlug, experiencesCityPath } from './citySlug'

describe('citySlug', () => {
  it('slugs cities without touching the sight catalog', () => {
    expect(cityToSlug('Hanoi')).toBe('hanoi')
    expect(cityToSlug('Ho Chi Minh City')).toBe('ho-chi-minh-city')
    expect(cityToSlug('Da Nang')).toBe('da-nang')
    expect(cityStayTemplateShape()).toBe('city-3-hanoi')
    expect(cityAnchorId('Hoi An')).toBe('city-hoi-an')
    expect(experiencesCityPath('Hue')).toBe('/plan/builder/experiences/city/hue')
  })
})

function cityStayTemplateShape() {
  return `city-3-${cityToSlug('Hanoi')}`
}
