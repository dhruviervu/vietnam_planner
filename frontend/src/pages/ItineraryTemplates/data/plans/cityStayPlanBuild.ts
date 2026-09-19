import {
  CITY_STAY_DAY_MATCH,
  CITY_STAY_HOTELS,
  CITY_STAY_NARRATIVE,
} from '../../../PackedItineraries/data/cityStayCores'
import { packCityStayDays, sightName } from '../../../PackedItineraries/lib/packHighRoi'
import {
  clockForIndex,
  dwellHoursFor,
  packThemedStayDays,
  pickActivitiesForDays,
  splitIdsByBestTime,
  bestPeriodForSource,
  themeBlurb,
  themeDayTitle,
  timedUnhurriedStops,
  type StayTheme,
} from '../../../PackedItineraries/lib/themeStayPack'
import { getActivityById } from '../../../PlanBuilder/data/activities'
import { getExperienceById } from '../../../PlanBuilder/data/experiences'
import { SHOPPING_ITEMS } from '../../../PlanBuilder/data/shopping'
import { cityStayTemplateId, themedCityTemplateId } from '../cityStayTemplates'
import { a, d, e, plan, s } from './helpers'
import type { AuthoredPlan, SlotRef } from './types'

const LUXURY_STAYS: Record<string, string> = {
  Hanoi: 'sofitel-legend-metropole',
  'Ho Chi Minh City': 'hcmc-reverie',
  'Da Nang': 'intercontinental-danang',
  'Hoi An': 'lasenta-boutique',
  Hue: 'la-y-riverview',
  'Da Lat': 'colline-dalat',
  'Nha Trang': 'nhatrang-mojzo',
  'Phu Quoc': 'phuquoc-sol',
  Sapa: 'sapa-topas-ecolodge',
}

const SLOW_STAYS: Record<string, string> = {
  Hanoi: 'intercontinental-westlake',
  'Ha Long': 'halong-pearl',
  'Ninh Binh': 'ninhbinh-tamcoc',
  Hue: 'la-y-riverview',
  'Hoi An': 'lasenta-boutique',
  'Da Nang': 'tms-hotel-danang-beach',
  'Nha Trang': 'nhatrang-mojzo',
  'Da Lat': 'colline-dalat',
  Sapa: 'sapa-topas-ecolodge',
  'Phu Quoc': 'phuquoc-sol',
  'Cat Ba': 'catba-backpackers',
  'Can Tho': 'cantho-ninh-kieu',
}

function timedRefs(
  ids: string[],
  period: 'morning' | 'afternoon' | 'evening',
  theme: StayTheme,
  asActivity = false,
  startAfter?: number,
): SlotRef[] {
  let cursor = startAfter
  return ids.map((id, index) => {
    const time = clockForIndex(period, index, theme, cursor)
    const [hh, mm] = time.split(':').map(Number)
    cursor = hh + mm / 60 + dwellHoursFor(id)
    if (asActivity || getActivityById(id)) return a(id, time)
    if (SHOPPING_ITEMS.some((item) => item.id === id)) return s(id, time)
    return e(id, time)
  })
}

function splitDay(ids: string[], theme: StayTheme, extras: string[] = []) {
  if (theme === 'slow' || theme === 'relaxed') {
    const stops = timedUnhurriedStops([...ids, ...extras], theme)
    const buckets: Record<'morning' | 'afternoon' | 'evening', SlotRef[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    }
    for (const stop of stops) {
      if (getExperienceById(stop.id)) buckets[stop.period].push(e(stop.id, stop.time))
      else if (getActivityById(stop.id)) buckets[stop.period].push(a(stop.id, stop.time))
      else if (SHOPPING_ITEMS.some((item) => item.id === stop.id)) buckets[stop.period].push(s(stop.id, stop.time))
      else buckets[stop.period].push(e(stop.id, stop.time))
    }
    return buckets
  }
  const buckets = splitIdsByBestTime(ids)
  for (const id of extras) {
    if (ids.includes(id)) continue
    buckets[bestPeriodForSource(id)].push(id)
  }
  if (theme === 'nightlife' && !buckets.evening.length) {
    const donor = buckets.afternoon.length ? buckets.afternoon : buckets.morning
    if (donor.length) buckets.evening.push(donor.pop()!)
  }
  return {
    morning: timedRefs(buckets.morning, 'morning', theme),
    afternoon: timedRefs(buckets.afternoon, 'afternoon', theme),
    evening: timedRefs(buckets.evening, 'evening', theme),
  }
}

function copyForDay(city: string, ids: string[], used: Set<number>, fallbackIndex: number) {
  const copies = CITY_STAY_NARRATIVE[city]?.days ?? []
  const matches = CITY_STAY_DAY_MATCH[city] ?? []
  let bestI = fallbackIndex
  let best = -1
  matches.forEach((sig, j) => {
    if (used.has(j)) return
    const hits = sig.filter((id) => ids.includes(id)).length
    const score = hits * (sig.length <= 2 ? 8 : 1)
    if (score > best) {
      best = score
      bestI = j
    }
  })
  used.add(bestI)
  return copies[bestI] ?? copies[fallbackIndex]
}

function stayFor(city: string, theme: StayTheme) {
  if (theme === 'luxury' && LUXURY_STAYS[city]) return { [city]: LUXURY_STAYS[city] }
  if (theme === 'slow' && SLOW_STAYS[city]) return { [city]: SLOW_STAYS[city] }
  return CITY_STAY_HOTELS[city] ? { [city]: CITY_STAY_HOTELS[city] } : {}
}

/** Live pack used by tests to keep `cityStayPlans.json` honest. */
export function authoredCityStayPlan(city: string, days = 3): AuthoredPlan {
  return authoredThemedCityPlan(city, days, 'packed')
}

export function authoredThemedCityPlan(city: string, days = 3, theme: StayTheme = 'packed'): AuthoredPlan {
  const rows = theme === 'packed' ? packCityStayDays(city, days) : packThemedStayDays(city, days, theme)
  const acts = pickActivitiesForDays(city, theme, rows.length, new Set(rows.flat()))
  const used = new Set<number>()
  const authoredDays = rows.map((ids, i) => {
    const { morning, afternoon, evening } = splitDay(ids, theme, acts[i] ?? [])
    const names = ids.map(sightName).filter(Boolean)
    if (theme === 'packed') {
      const copy = copyForDay(city, ids, used, i)
      const title = copy?.theme ?? `${city}, day ${i + 1}`
      const blurb =
        copy?.blurb ??
        (names.length ? names.join(', ') + '.' : `Packed ${city} day — sights clustered like Your Itinerary.`)
      return d(city, title, blurb, morning, afternoon, evening)
    }
    return d(
      city,
      themeDayTitle(city, theme, i),
      themeBlurb(city, theme, names),
      morning,
      afternoon,
      evening,
    )
  })
  const templateId = theme === 'packed' ? cityStayTemplateId(city, days) : themedCityTemplateId(city, theme, days)
  return plan(templateId, stayFor(city, theme), authoredDays)
}

/** Multi-city slow/relaxed templates: three spaced stops from 10:00, spa when listed. */
export function authoredUnhurriedRoutePlan(
  templateId: string,
  stays: { city: string; days: number }[],
  theme: StayTheme,
  stayByCity: Record<string, string>,
): AuthoredPlan {
  const authoredDays = stays.flatMap(({ city, days: n }) => {
    const rows = packThemedStayDays(city, n, theme)
    return rows.map((ids, i) => {
      const { morning, afternoon, evening } = splitDay(ids, theme)
      const names = ids.map(sightName).filter(Boolean)
      return d(city, themeDayTitle(city, theme, i), themeBlurb(city, theme, names), morning, afternoon, evening)
    })
  })
  return plan(templateId, stayByCity, authoredDays)
}
