import { describe, expect, it } from 'vitest'
import { agentDwellHours } from './dayAllocation'
import { parseDurationRangeHours, snapVisitHours, usesStandardVisitHours } from './visitHours'

describe('default visit hours', () => {
  it('reads the lower end of a standard visit range', () => {
    expect(parseDurationRangeHours('1.5–2 hrs', 2).min).toBe(1.5)
    expect(parseDurationRangeHours('2–4 hrs', 4).min).toBe(2)
    expect(parseDurationRangeHours('20–40 min', 1).min).toBeCloseTo(20 / 60, 5)
  })

  it('uses the catalog visit length from the card', () => {
    expect(usesStandardVisitHours('halong-cruise')).toBe(true)
    expect(agentDwellHours('halong-cruise')).toBeGreaterThanOrEqual(6)
    expect(agentDwellHours('temple-literature')).toBe(2)
    expect(agentDwellHours('sung-sot-cave', ['halong-cruise', 'sung-sot-cave'])).toBeCloseTo(20 / 60, 8)
    expect(agentDwellHours('vinwonders-nha-trang', ['hon-tre-island', 'vinwonders-nha-trang'])).toBeGreaterThanOrEqual(6)
    expect(agentDwellHours('hon-tre-island', ['hon-tre-island', 'vinwonders-nha-trang'])).toBeLessThanOrEqual(1)
    expect(agentDwellHours('hon-mun-island')).toBeGreaterThanOrEqual(6)
  })
})

describe('snapVisitHours', () => {
  it('uses 15, 20 or 30 minutes under an hour, then half-hour steps', () => {
    expect(snapVisitHours(18 / 60)).toBeCloseTo(20 / 60, 8)
    expect(snapVisitHours(0.3)).toBeCloseTo(20 / 60, 8)
    expect(snapVisitHours(24 / 60)).toBeCloseTo(20 / 60, 8)
    expect(snapVisitHours(0.4)).toBeCloseTo(20 / 60, 8)
    expect(snapVisitHours(36 / 60)).toBeCloseTo(0.5, 8)
    expect(snapVisitHours(2)).toBe(2)
    expect(snapVisitHours(1.4)).toBeCloseTo(1.5, 8)
  })
})
