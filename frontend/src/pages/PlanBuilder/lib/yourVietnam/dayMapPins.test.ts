import { describe, expect, it } from 'vitest'
import { bagMapStopsForCity } from './dayMapPins'

describe('bagMapStopsForCity', () => {
  it('keeps only bag sights that belong to that city', () => {
    const stops = bagMapStopsForCity(
      ['asia-park-danang', 'temple-literature', 'cham-sculpture-museum'],
      [],
      'da-nang',
      'Da Nang',
    )
    const ids = stops.map((s) => s.sourceId)
    expect(ids).toEqual(expect.arrayContaining(['asia-park-danang', 'cham-sculpture-museum']))
    expect(ids).not.toContain('temple-literature')
  })

  it('does not invent meals, hotels, or sights from other cities', () => {
    const stops = bagMapStopsForCity(['temple-literature'], [], 'da-nang', 'Da Nang')
    expect(stops).toEqual([])
  })
})
