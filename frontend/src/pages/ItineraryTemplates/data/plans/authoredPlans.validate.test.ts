import { describe, expect, it } from 'vitest'
import { validateAuthoredPlans } from './index'

describe('authored itinerary plans', () => {
  it('match catalog cards and typical day counts', () => {
    expect(validateAuthoredPlans()).toEqual([])
  })
})
