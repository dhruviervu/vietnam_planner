import { describe, expect, it } from 'vitest'
import { SEASONAL_EVENTS } from './seasonalEvents'
import { eventGuideWordCount, getEventGuide } from './eventGuides'

describe('event Learn More guides', () => {
  it('gives every calendar event a 1000-word uniquely titled paragraph guide', () => {
    expect(SEASONAL_EVENTS.length).toBe(19)
    for (const item of SEASONAL_EVENTS) {
      const guide = getEventGuide(item.id)
      expect(guide, item.id).toBeTruthy()
      if (!guide) continue
      expect(eventGuideWordCount(guide), item.id).toBeGreaterThanOrEqual(1000)
      expect(guide.sections.length, item.id).toBeGreaterThanOrEqual(12)
      const titles = guide.sections.map((s) => s.title)
      expect(new Set(titles).size, item.id).toBe(titles.length)
      for (const section of guide.sections) {
        expect(section.paragraphs.length, `${item.id} ${section.title}`).toBeGreaterThanOrEqual(1)
        expect(section.paragraphs.join(' ').trim().length, `${item.id} ${section.title}`).toBeGreaterThan(200)
      }
    }
  })
})
