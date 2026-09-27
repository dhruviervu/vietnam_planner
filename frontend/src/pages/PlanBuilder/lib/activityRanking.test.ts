import { describe, expect, it } from 'vitest'
import { CITY_ACTIVITIES, rankCityActivities } from '../data/activities'

function namesIn(city: string) {
  return rankCityActivities(CITY_ACTIVITIES.filter((a) => a.cityId === city)).map((a) => a.name)
}

describe('activity traveler ranking', () => {
  it('puts famous Hanoi activities above niche craft workshops', () => {
    const names = namesIn('hanoi')
    const food = names.findIndex((n) => /food motorbike|vespa|egg coffee/i.test(n))
    const niche = names.findIndex((n) => /blacksmith|silver jewelry|shuttlecock|karaoke/i.test(n))
    expect(food).toBeGreaterThanOrEqual(0)
    expect(niche).toBeGreaterThan(food)
    expect(food).toBeLessThan(5)
  })

  it('puts Hoi An basket boat and lantern ahead of coffee lab pottery', () => {
    const names = namesIn('hoi-an')
    const basket = names.findIndex((n) => /basket boat/i.test(n))
    const lantern = names.findIndex((n) => /lantern making/i.test(n))
    const coffee = names.findIndex((n) => /coconut coffee/i.test(n))
    expect(basket).toBeLessThan(4)
    expect(lantern).toBeLessThan(5)
    expect(coffee).toBeGreaterThan(lantern)
  })

  it('ranks Ha Giang Loop first in Ha Giang', () => {
    const names = namesIn('ha-giang')
    expect(names[0]).toMatch(/ha giang loop/i)
  })

  it('ranks Ha Long overnight cruise first in Ha Long', () => {
    const names = namesIn('ha-long')
    expect(names[0]).toMatch(/overnight/i)
  })
})
