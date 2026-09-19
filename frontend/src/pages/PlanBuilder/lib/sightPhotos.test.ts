import { describe, expect, it } from 'vitest'
import { SIGHT_CATALOG } from '../data/experiences'
import { getExperienceCardPhotos, getExperienceImages } from './pricing'
import { highRoiCatalogSights } from './highRoiSights'
import { isGenericCityPhoto, photoFileStem, rankPhotosForSight } from './resolveCatalogPhotos'

describe('sight card photos match the place', () => {
  it('does not put a generic Ho Chi Minh City skyline on Jade Emperor Pagoda', () => {
    const jade = SIGHT_CATALOG.find((e) => e.id === 'jade-emperor-pagoda')
    expect(jade).toBeTruthy()
    const photos = getExperienceCardPhotos(jade!)
    expect(photos.length).toBeGreaterThan(0)
    expect(photos.some((url) => /ho[_ ]chi[_ ]minh[_ ]city/i.test(url))).toBe(false)
    expect(photos.some((url) => /jade|ngoc|hoang|pagoda|chua/i.test(photoFileStem(url) || url))).toBe(
      true,
    )
  })

  it('ranks the pagoda file above the city skyline fallback', () => {
    const ranked = rankPhotosForSight(
      [
        'https://commons.wikimedia.org/wiki/Special:FilePath/Ho_Chi_Minh_City.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Jade_Emperor_Pagoda_Saigon.jpg/1280px-Jade_Emperor_Pagoda_Saigon.jpg',
      ],
      { id: 'jade-emperor-pagoda', name: 'Jade Emperor Pagoda', city: 'Ho Chi Minh City' },
    )
    expect(ranked[0]).toMatch(/Jade_Emperor_Pagoda/i)
    expect(
      isGenericCityPhoto('https://commons.wikimedia.org/wiki/Special:FilePath/Ho_Chi_Minh_City.jpg', {
        id: 'jade-emperor-pagoda',
        name: 'Jade Emperor Pagoda',
        city: 'Ho Chi Minh City',
      }),
    ).toBe(true)
  })

  it('does not lead any catalog card with a generic city wiki file', () => {
    const offenders: string[] = []
    for (const sight of SIGHT_CATALOG) {
      const photos = getExperienceCardPhotos(sight)
      expect(photos.length, sight.id).toBeGreaterThan(0)
      const lead = photos[0]!
      if (isGenericCityPhoto(lead, sight)) offenders.push(`${sight.id} → ${photoFileStem(lead)}`)
    }
    expect(offenders).toEqual([])
  })

  it('gives high-ROI sights at least eight matching photos', () => {
    const short: string[] = []
    const generic: string[] = []
    for (const sight of highRoiCatalogSights(SIGHT_CATALOG)) {
      const photos = getExperienceImages(sight).filter((url) => !isGenericCityPhoto(url, sight))
      if (photos.length < 8) short.push(`${sight.id} (${photos.length})`)
      if (photos.slice(0, 8).some((url) => isGenericCityPhoto(url, sight))) {
        generic.push(sight.id)
      }
    }
    expect(short).toEqual([])
    expect(generic).toEqual([])
  })
})
