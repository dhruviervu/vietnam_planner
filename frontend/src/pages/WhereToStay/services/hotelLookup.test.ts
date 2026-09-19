import { describe, expect, it } from 'vitest'
import {
  isHotelRelatedUrl,
  INVALID_HOTEL_LINK_MESSAGE,
  parseHotelQuery,
} from './hotelLookup'

describe('hotel URL gate', () => {
  it('accepts booking, tripadvisor hotel, maps, and official hotel sites', () => {
    expect(
      isHotelRelatedUrl('https://www.booking.com/hotel/vn/sofitel-legend-metropole-hanoi.html'),
    ).toBe(true)
    expect(
      isHotelRelatedUrl(
        'https://www.tripadvisor.com/Hotel_Review-g293924-d294102-Reviews-Sofitel_Legend_Metropole_Hanoi-Hanoi.html',
      ),
    ).toBe(true)
    expect(isHotelRelatedUrl('https://www.google.com/maps/place/Sofitel+Legend+Metropole')).toBe(
      true,
    )
    expect(isHotelRelatedUrl('https://www.metropolehanoi.com/')).toBe(true)
    expect(isHotelRelatedUrl('https://all.accor.com/hotel/1234/index.en.shtml')).toBe(true)
  })

  it('rejects search pages, restaurants, and news', () => {
    expect(
      isHotelRelatedUrl('https://www.booking.com/searchresults.html?ss=Hanoi'),
    ).toBe(false)
    expect(
      isHotelRelatedUrl(
        'https://www.tripadvisor.com/Restaurant_Review-g293924-d123-Reviews-Pho-Hanoi.html',
      ),
    ).toBe(false)
    expect(isHotelRelatedUrl('https://www.nytimes.com/2024/01/01/travel/hanoi.html')).toBe(false)
    expect(isHotelRelatedUrl('https://www.youtube.com/watch?v=abc')).toBe(false)
  })

  it('pulls a hotel name from a booking slug', () => {
    const parsed = parseHotelQuery(
      'https://www.booking.com/hotel/vn/sofitel-legend-metropole-hanoi.html',
      'Hanoi',
    )
    expect(parsed.name.toLowerCase()).toContain('sofitel')
    expect(parsed.listingUrl).toContain('booking.com')
  })

  it('keeps the check-url copy stable', () => {
    expect(INVALID_HOTEL_LINK_MESSAGE).toBe('Please check the URL.')
  })
})
