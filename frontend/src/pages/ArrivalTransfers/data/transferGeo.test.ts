import { describe, expect, it } from 'vitest'
import { MAP_PLACES, mapsDirUrl, mapsPinUrl } from './transferGeo'

describe('maps urls', () => {
  it('builds directions from coordinates, not place names', () => {
    const url = mapsDirUrl(MAP_PLACES.sgn, MAP_PLACES.district1)
    expect(url).toBe(
      `https://www.google.com/maps/dir/${MAP_PLACES.sgn.lat},${MAP_PLACES.sgn.lng}/${MAP_PLACES.district1.lat},${MAP_PLACES.district1.lng}`,
    )
    expect(url).not.toMatch(/District|Hanoi|Vietnam/)
  })

  it('pins a stop with lat,lng', () => {
    const url = mapsPinUrl(MAP_PLACES.bus86T2)
    expect(url).toBe(`https://www.google.com/maps?q=${MAP_PLACES.bus86T2.lat},${MAP_PLACES.bus86T2.lng}`)
  })
})
