import { getExperienceById, SIGHT_CATALOG } from '../pages/PlanBuilder/data/experiences'
import { getActivityById } from '../pages/PlanBuilder/data/activities'
import { formatFromPrice } from '../pages/PlanBuilder/lib/pricing'
import {
  catalogHoursForSource,
  weekdayFromIso,
} from '../pages/PlanBuilder/lib/yourVietnam/openingHours'
import { parseDurationRangeHours } from '../pages/PlanBuilder/lib/yourVietnam/visitHours'
import { experiencesCityPath } from '../pages/PlanBuilder/services/citySlug'
import type { AskEntity, AskFact } from './types'

export function isoForAsk(startDate?: string | null) {
  if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) return startDate
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function factForEntity(entity: AskEntity, isoDate: string): AskFact | null {
  const weekday = weekdayFromIso(isoDate)
  if (entity.kind === 'experience') {
    const e = getExperienceById(entity.id)
    if (!e) return null
    const hours = catalogHoursForSource('experience', e.id, weekday, isoDate)
    return {
      id: e.id,
      kind: 'experience',
      name: e.name,
      city: e.city,
      hook: [e.hook, e.about, e.whyGo].filter(Boolean).join(' '),
      hours: hours.label || e.hours,
      closedToday: hours.closedToday,
      duration: e.durationLabel,
      durationHours: e.durationHours,
      cost: formatFromPrice(e.price, e.priceType),
      timePreference: e.timePreference ?? 'ANY',
      path: `/plan/builder/experience/${e.id}`,
    }
  }
  const a = getActivityById(entity.id)
  if (!a) return null
  const hours = catalogHoursForSource('activity', a.id, weekday, isoDate)
  const dur = parseDurationRangeHours(a.durationLabel, 2)
  return {
    id: a.id,
    kind: 'activity',
    name: a.name,
    city: a.cityName,
    hook: [a.hook, a.about, a.whyGo].filter(Boolean).join(' '),
    hours: hours.label || a.hours,
    closedToday: hours.closedToday,
    duration: a.durationLabel,
    durationHours: dur.max,
    cost: a.priceLabel,
    timePreference: a.timePreference ?? 'ANY',
    path: `/plan/builder/activity/${a.id}`,
  }
}

export function similarInCity(city: string, exceptId: string, limit = 4): AskEntity[] {
  return SIGHT_CATALOG.filter((e) => e.city === city && e.id !== exceptId)
    .slice(0, limit)
    .map((e) => ({ id: e.id, kind: 'experience' as const, name: e.name, city: e.city }))
}

export function cityCatalogPath(city: string) {
  return experiencesCityPath(city)
}
