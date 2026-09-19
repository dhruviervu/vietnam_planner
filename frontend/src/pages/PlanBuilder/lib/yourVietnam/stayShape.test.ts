import { describe, expect, it } from 'vitest'
import { orderTripCities } from './cityPlanning'
import { stayDayBounds, volumeStayDays } from './stayShape'

describe('stayDayBounds', () => {
  it('weights days by sight volume, not leftover stubs', () => {
    expect(volumeStayDays(1)).toBe(1)
    expect(volumeStayDays(2)).toBe(1)
    expect(volumeStayDays(8)).toBe(2)
    expect(volumeStayDays(17)).toBe(3)
    expect(volumeStayDays(20)).toBe(4)
  })

  it('gives Hanoi 17 sights a 3-day ceiling and does not pad a 1-sight city', () => {
    expect(stayDayBounds('hanoi', Array.from({ length: 17 }, (_, i) => `s${i}`))).toEqual({
      min: 1,
      max: 3,
    })
    expect(stayDayBounds('hanoi', ['temple-literature'])).toEqual({ min: 1, max: 1 })
  })

  it('gives a one-sight Ha Long cruise a single day — never clones the card onto day 2', () => {
    expect(stayDayBounds('ha-long', ['halong-cruise'])).toEqual({ min: 1, max: 1 })
  })

  it('uses Da Lat as a 2-day highland connector between the coast and Phu Quoc', () => {
    const trip = ['hanoi', 'nha-trang', 'dalat', 'phu-quoc'] as const
    expect(stayDayBounds('dalat', ['crazy-house', 'tuyen-lam-lake'], [...trip])).toEqual({
      min: 2,
      max: 2,
    })
  })
})

describe('orderTripCities spine', () => {
  it('keeps Hanoi as the northern hub, then Sapa, Ha Long, and the south', () => {
    expect(
      orderTripCities(['phu-quoc', 'nha-trang', 'sapa', 'ha-long', 'dalat', 'hanoi']),
    ).toEqual(['hanoi', 'sapa', 'ha-long', 'nha-trang', 'dalat', 'phu-quoc'])
  })

  it('does not fly into Nha Trang first when the bag still has the north', () => {
    expect(orderTripCities(['nha-trang', 'sapa', 'ha-long'])).toEqual([
      'sapa',
      'ha-long',
      'nha-trang',
    ])
  })
})
