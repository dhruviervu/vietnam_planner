import { describe, expect, it } from 'vitest'
import { FEATURED_ROUTES, MODE_MATRIX, WATER_GROUPS } from './standaloneGuide'

describe('standalone getting-around guide', () => {
  it('has a five-row decision matrix', () => {
    expect(MODE_MATRIX.map((r) => r.mode)).toEqual([
      'Domestic flights',
      'Reunification Express',
      'Sleeper buses & limos',
      'Ferries & speedboats',
      'Grab / ride-hail',
    ])
  })

  it('covers the three popular corridors', () => {
    expect(FEATURED_ROUTES.map((r) => r.id)).toEqual(['hanoi-halong', 'hanoi-danang', 'hcmc-phuquoc'])
    expect(FEATURED_ROUTES.every((r) => r.warning && r.options.length === 3)).toBe(true)
  })

  it('groups water by function, not by vehicle nickname', () => {
    expect(WATER_GROUPS.map((g) => g.id)).toEqual(['island', 'cruise', 'river'])
  })
})
