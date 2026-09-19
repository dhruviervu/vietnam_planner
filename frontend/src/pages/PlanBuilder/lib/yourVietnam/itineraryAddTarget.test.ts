import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { readItineraryAddTarget, writeItineraryAddTarget } from './itineraryAddTarget'

const TARGET_KEY = 'yv-itinerary-add-target'
const memory = new Map<string, string>()

describe('readItineraryAddTarget', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memory.set(key, value)
        },
        removeItem: (key: string) => {
          memory.delete(key)
        },
      },
    })
  })

  afterEach(() => {
    memory.delete(TARGET_KEY)
  })

  it('reads the day and slot from the city-tab query string', () => {
    const target = readItineraryAddTarget('?itineraryDay=6&itinerarySlot=slot-hoa')
    expect(target).toEqual({ day: 6, slotId: 'slot-hoa', period: undefined })
  })

  it('falls back to the stored target when the URL has no itinerary params', () => {
    writeItineraryAddTarget({ day: 6, slotId: 'slot-hoa' })
    expect(readItineraryAddTarget('')).toEqual({ day: 6, slotId: 'slot-hoa' })
  })
})
