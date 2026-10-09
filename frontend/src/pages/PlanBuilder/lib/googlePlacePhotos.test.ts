import { describe, expect, it } from 'vitest'
import { pickPhotoSource, PLACE_PHOTO_SLOTS } from '../../../../server/googlePlacePhotos'
import { googlePlacePhotoUrls } from './experienceMedia'

describe('Google place photo slots', () => {
  it('exposes ten proxy URLs', () => {
    expect(PLACE_PHOTO_SLOTS).toBe(10)
    expect(googlePlacePhotoUrls('temple-literature')).toEqual(
      Array.from({ length: 10 }, (_, i) => `/api/place-photos/temple-literature/${i}`),
    )
  })

  it('uses Google photos first then catalog fallbacks', () => {
    const meta = {
      placeId: 'abc',
      displayName: 'Temple of Literature',
      googleMapsUri: 'https://maps.google.com',
      photoNames: ['places/abc/photos/1', 'places/abc/photos/2'],
      attributions: ['Jane'],
      fetchedAt: Date.now(),
    }
    const row = {
      name: 'Temple of Literature',
      city: 'Hanoi',
      lat: 21,
      lng: 105,
      fallbacks: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    }
    expect(pickPhotoSource(meta, row, 0)).toEqual({ kind: 'google', photoName: 'places/abc/photos/1' })
    expect(pickPhotoSource(meta, row, 2)).toEqual({ kind: 'fallback', url: 'https://example.com/a.jpg' })
  })
})
