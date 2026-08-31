import type { AuthoredPlan } from './types'
import { getTemplateById, ITINERARY_TEMPLATES } from '../templates'
import { cityKey } from '../../lib/cityKey'
import { SOLO_PLANS } from './solo'
import { COUPLES_PLANS } from './couples'
import { FAMILY_YOUNG_PLANS } from './familyYoung'
import { FAMILY_OLDER_PLANS } from './familyOlder'
import { FRIENDS_PLANS } from './friends'
import { LARGE_GROUPS_PLANS } from './largeGroups'
import { BUDGET_PLANS } from './budget'
import { RELAXED_PLANS } from './relaxed'
import { BEACHES_PLANS } from './beaches'
import { FOOD_PLANS } from './food'
import { ADVENTURE_PLANS } from './adventure'
import { LUXURY_PLANS } from './luxury'
import { FIRST_TIME_PLANS } from './firstTime'
import { RESET_PLANS } from './reset'
import { MAX_EXPERIENCE_PLANS } from './maxExperience'

export { LUXURY_PLACE_PINS } from '../luxuryStayPins'
export type { LuxuryPlacePin } from '../luxuryStayPins'

const ALL_PLANS: AuthoredPlan[] = [
  ...SOLO_PLANS,
  ...COUPLES_PLANS,
  ...FAMILY_YOUNG_PLANS,
  ...FAMILY_OLDER_PLANS,
  ...FRIENDS_PLANS,
  ...LARGE_GROUPS_PLANS,
  ...BUDGET_PLANS,
  ...RELAXED_PLANS,
  ...BEACHES_PLANS,
  ...FOOD_PLANS,
  ...ADVENTURE_PLANS,
  ...LUXURY_PLANS,
  ...FIRST_TIME_PLANS,
  ...RESET_PLANS,
  ...MAX_EXPERIENCE_PLANS,
]

const BY_ID = new Map(ALL_PLANS.map((plan) => [plan.templateId, plan]))

function typicalDaysFor(minDays: number, maxDays: number) {
  return Math.max(1, Math.round((minDays + maxDays) / 2))
}

export function getAuthoredPlan(templateId: string) {
  return BY_ID.get(templateId)
}

function sameCitySeq(planCities: string[], templateCities: string[]) {
  const fromPlan: string[] = []
  for (const city of planCities) {
    const last = fromPlan[fromPlan.length - 1]
    if (!last || cityKey(last) !== cityKey(city)) fromPlan.push(city)
  }
  if (fromPlan.length !== templateCities.length) return false
  return fromPlan.every((city, i) => cityKey(city) === cityKey(templateCities[i] ?? ''))
}

export function validateAuthoredPlans() {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const plan of ALL_PLANS) {
    if (ids.has(plan.templateId)) errors.push(`duplicate plan ${plan.templateId}`)
    ids.add(plan.templateId)
    const template = getTemplateById(plan.templateId)
    if (!template) {
      errors.push(`plan ${plan.templateId} has no catalog card`)
      continue
    }
    const typical = typicalDaysFor(template.minDays, template.maxDays)
    if (plan.days.length !== typical) {
      errors.push(`${plan.templateId}: ${plan.days.length} days, expected ${typical}`)
    }
    const seq = plan.days.map((day) => day.city)
    if (!sameCitySeq(seq, template.cities)) {
      errors.push(`${plan.templateId}: city sequence does not match ${template.cities.join(' → ')}`)
    }
  }
  for (const template of ITINERARY_TEMPLATES) {
    if (!BY_ID.has(template.id)) errors.push(`missing plan for ${template.id}`)
  }
  return errors
}

if (import.meta.env.DEV) {
  const errors = validateAuthoredPlans()
  if (errors.length) console.error('[itinerary templates]', errors.join('\n'))
}
