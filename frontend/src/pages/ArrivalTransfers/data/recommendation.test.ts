import { describe, expect, it } from 'vitest'
import { getDefaultModes } from './modes'
import { pickOurMode } from './recommendation'
import type { ArrivalContext, TransferBudget } from './types'

function ctx(partial: Partial<ArrivalContext> & { budget: TransferBudget }): ArrivalContext {
  return {
    passengers: 2,
    luggageLevel: 'medium',
    lateArrival: false,
    arrivalTime: 'not-set',
    hasAccessibilityNeed: false,
    arrivalLabel: null,
    direction: 'inbound',
    budgetPriority: partial.budget === 'saver',
    ...partial,
  }
}

describe('pickOurMode', () => {
  const modes = getDefaultModes('inbound')

  it('picks the bus on a saver daytime trip', () => {
    expect(pickOurMode(modes, ctx({ budget: 'saver' }))?.id).toBe('public-bus')
  })

  it('picks car/taxi on a typical couple trip', () => {
    expect(pickOurMode(modes, ctx({ budget: 'typical' }))?.id).toBe('car-taxi')
  })

  it('picks car/taxi when the budget is comfort', () => {
    expect(pickOurMode(modes, ctx({ budget: 'comfort' }))?.id).toBe('car-taxi')
  })

  it('does not recommend the bus late at night even on saver', () => {
    expect(
      pickOurMode(
        modes,
        ctx({ budget: 'saver', arrivalTime: 'late', lateArrival: true }),
      )?.id,
    ).toBe('car-taxi')
  })

  it('shifts a typical trip to car/taxi when the group is large', () => {
    expect(pickOurMode(modes, ctx({ budget: 'typical', passengers: 5 }))?.id).toBe('car-taxi')
  })
})
