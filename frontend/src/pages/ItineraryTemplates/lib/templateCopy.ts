import type { ItineraryTemplate } from '../data/types'
import { FOUR_PLUS_WEEKS_DAYS } from '../data/types'
import { PERIOD_META, type PeriodId } from '../../PlanBuilder/lib/yourVietnam/types'

export { PERIOD_META }
export type { PeriodId }

const PERIODS: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']

export function periodList(): PeriodId[] {
  return PERIODS
}

export function peopleLabel(template: ItineraryTemplate, people?: number) {
  if (people != null) return people === 1 ? '1 person' : `${people} people`
  if (template.peopleMin === template.peopleMax) {
    return template.peopleMin === 1 ? '1 person' : `${template.peopleMin} people`
  }
  return `${template.peopleMin}–${template.peopleMax} people`
}

export function paceLabel(pace: ItineraryTemplate['pace']) {
  if (pace === 'relaxed') return 'Relaxed'
  if (pace === 'packed') return 'Maximum'
  return 'Mix'
}

export function daysLabel(days: number, requested?: number | null) {
  if (requested != null && requested >= FOUR_PLUS_WEEKS_DAYS) return '4+ weeks'
  if (days === 1) return '1 day'
  return `${days} days`
}

export function typicalDaysFor(template: ItineraryTemplate) {
  return Math.max(1, Math.round((template.minDays + template.maxDays) / 2))
}
