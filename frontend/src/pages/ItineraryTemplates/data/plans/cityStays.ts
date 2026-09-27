import raw from './cityStayPlans.json'
import type { AuthoredPlan } from './types'

const ALL = raw as unknown as AuthoredPlan[]
const BY_ID = new Map(ALL.map((plan) => [plan.templateId, plan]))

export function getCityStayPlan(templateId: string): AuthoredPlan | undefined {
  return BY_ID.get(templateId)
}

export function getCityStayPlans(): AuthoredPlan[] {
  return ALL
}
