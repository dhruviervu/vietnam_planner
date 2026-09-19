import { describe, expect, it } from 'vitest'
import { SIGHT_CATALOG } from '../data/experiences'
import { firstSentences, sightCardCopy } from './sightCardCopy'

describe('sight card copy', () => {
  it('keeps copy to one to three sentences', () => {
    expect(firstSentences('One. Two. Three. Four.', 3)).toBe('One. Two. Three.')
    const n = sightCardCopy({
      hook: 'Lanterns glow on the river after dusk in the old town.',
    })
      .split(/[.!?]+/)
      .filter(Boolean).length
    expect(n).toBeLessThanOrEqual(3)
  })

  it('describes the sight itself rather than tickets and crowds', () => {
    const copy = sightCardCopy({
      id: 'po-nagar',
      name: 'Po Nagar Cham Towers',
      city: 'Nha Trang',
      hook: 'Cham brick towers on a hill above the Cái River.',
      about:
        'Climb the hilltop sanctuary of the goddess Po Ină Nagar: red-brick towers built without mortar.',
      cardSummary:
        'UNESCO-listed Cham sanctuary. Ticket about 30,000 VND, typically 06:00–18:00. Pair with mud baths next door.',
    })
    expect(copy.toLowerCase()).toMatch(/cham|tower|goddess|brick/)
    expect(copy).not.toMatch(/30,000|VND|pair with/i)
  })

  it('gives every catalog sight a short place description', () => {
    const long: string[] = []
    const meta: string[] = []
    for (const sight of SIGHT_CATALOG) {
      const copy = sightCardCopy(sight)
      expect(copy.length, sight.id).toBeGreaterThan(12)
      expect(copy.length, sight.id).toBeLessThanOrEqual(420)
      const sentences = (copy.match(/[.!?]+/g) ?? []).length
      if (sentences > 3) long.push(sight.id)
      if (/ticket about|vnd|pair with|tour bus/i.test(copy)) meta.push(sight.id)
    }
    expect(long).toEqual([])
    expect(meta).toEqual([])
  })
})
