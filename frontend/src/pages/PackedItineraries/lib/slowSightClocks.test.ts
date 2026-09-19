import { describe, expect, it } from 'vitest'
import { parseDayStart } from '../../PlanBuilder/lib/yourVietnam/dayWindows'
import {
  catalogHoursForSource,
  earliestOpenAt,
  sightClosedAtTime,
} from '../../PlanBuilder/lib/yourVietnam/openingHours'
import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { getPackedTemplate } from '../data/catalog'
import { getSlowTemplate } from '../data/slowCatalog'
import { dwellHoursFor, SLOW_GAP_HOURS } from './themeStayPack'
import {
  SLOW_GAP_MAX_HOURS,
  SLOW_GAP_MIN_HOURS,
  slowStartOverridesForDay,
  slowStartOverridesForTemplate,
} from './slowSightClocks'

function kindOf(id: string): 'experience' | 'activity' | 'shopping' {
  if (getExperienceById(id)) return 'experience'
  return 'activity'
}

describe('slow sight clocks', () => {
  it('leaves two to four idle hours and stays inside opening hours', () => {
    const ids = ['cam-thanh-basket-boats', 'tra-que-village']
    const clocks = slowStartOverridesForDay(ids)
    const starts = ids.map((id) => parseDayStart(clocks[id]))
    expect(starts[0]).toBeGreaterThanOrEqual(10)
    const dwell = dwellHoursFor(ids[0])
    const idle = starts[1] - (starts[0] + Math.max(0.75, dwell))
    expect(idle).toBeGreaterThanOrEqual(SLOW_GAP_MIN_HOURS - 0.08)
    expect(idle).toBeLessThanOrEqual(SLOW_GAP_MAX_HOURS + 0.08)
    expect(idle).toBeCloseTo(SLOW_GAP_HOURS, 1)
    for (const [i, id] of ids.entries()) {
      const hours = catalogHoursForSource(kindOf(id), id, 3)
      const dur = Math.max(0.75, dwellHoursFor(id))
      expect(sightClosedAtTime(hours, starts[i])).toBe(false)
      const openAt = earliestOpenAt(hours, starts[i], dur, 22)
      expect(openAt).toBeLessThanOrEqual(starts[i] + 0.05)
    }
  })

  it('never starts before 10:00 even when a place opens at dawn', () => {
    const lanterns = parseDayStart(slowStartOverridesForDay(['hoi-an-lanterns'])['hoi-an-lanterns'])
    expect(lanterns).toBeGreaterThanOrEqual(17.5)
    const dawn = parseDayStart(
      slowStartOverridesForDay(['cai-rang-floating-market'])['cai-rang-floating-market'],
    )
    expect(dawn).toBeGreaterThanOrEqual(10)
  })

  it('pins Hue’s river after 15:00 and leaves Thiên Mụ on the boat', () => {
    const clocks = slowStartOverridesForDay(['hue-citadel', 'thien-mu-pagoda', 'perfume-river'])
    expect(parseDayStart(clocks['hue-citadel'])).toBeGreaterThanOrEqual(10)
    expect(parseDayStart(clocks['perfume-river'])).toBeGreaterThanOrEqual(15)
    expect(clocks['thien-mu-pagoda']).toBeUndefined()
  })

  it('seeds slow idea templates and leaves packed clocks alone', () => {
    const slow = getSlowTemplate('slow-city-hoi-an-4')
    expect(slow).toBeTruthy()
    const clocks = slowStartOverridesForTemplate(slow!)
    expect(Object.keys(clocks).length).toBeGreaterThan(0)
    expect(clocks['cam-thanh-basket-boats']).toBeTruthy()
    expect(clocks['tra-que-village']).toBeTruthy()
    const packed = getPackedTemplate('city-hanoi-3')
    expect(packed).toBeTruthy()
    expect(slowStartOverridesForTemplate(packed!)).toEqual({})
  })
})
