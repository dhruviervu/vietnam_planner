import { describe, expect, it } from 'vitest'
import { AIRPORTS, DESTINATIONS } from './catalog'
import { filledBookingUrl, routePlate } from './bookingLinks'

describe('booking links', () => {
  const han = AIRPORTS.find((a) => a.id === 'HAN')!
  const oldQuarter = DESTINATIONS.find((d) => d.id === 'han-old-quarter')!
  const route = { airport: han, destination: oldQuarter, direction: 'inbound' as const }

  it('plates airport and neighbourhood', () => {
    expect(routePlate(route)).toEqual({
      from: 'Noi Bai International (HAN)',
      to: 'Old Quarter, Hanoi',
    })
  })

  it('fills 12Go with airport and city slugs', () => {
    expect(filledBookingUrl('https://12go.asia/en', route)).toBe(
      'https://12go.asia/en/travel/hanoi-airport/hanoi',
    )
  })

  it('fills GetTransfer from/to', () => {
    expect(filledBookingUrl('https://gettransfer.com/en', route)).toBe(
      'https://gettransfer.com/en/search?from=Noi%20Bai%20International%20(HAN)&to=Old%20Quarter%2C%20Hanoi',
    )
  })
})
