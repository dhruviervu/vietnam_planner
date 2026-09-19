import { describe, expect, it } from 'vitest'
import { SEASONAL_EVENTS } from './seasonalEvents'
import { EVENT_MEDIA, eventGallery } from './eventMedia'

describe('event media', () => {
  it('gives every calendar event a full gallery of loadable URLs', () => {
    for (const item of SEASONAL_EVENTS) {
      const gallery = EVENT_MEDIA[item.id]
      expect(gallery?.length, item.id).toBeGreaterThanOrEqual(8)
      const filled = eventGallery(item.id, gallery![0])
      expect(filled.length, item.id).toBe(16)
      for (const url of filled) {
        expect(url.startsWith('https://'), item.id).toBe(true)
        expect(url.includes('beijing'), item.id).toBe(false)
        expect(url.includes('placehold'), item.id).toBe(false)
      }
    }
  })
})
