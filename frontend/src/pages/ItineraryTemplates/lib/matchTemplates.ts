import { FOUR_PLUS_WEEKS_DAYS, isFourPlusWeeks, type ItineraryTemplate, type TripShape } from '../data/types'
import type { TemplateSectionId } from '../data/types'
import { typicalDaysFor } from './templateCopy'

export type TemplateDurationFilter = 'all' | 'short' | 'week' | 'longer'

export type TemplateCatalogFilters = {
  cities: string[]
  sections: TemplateSectionId[]
  duration: TemplateDurationFilter
}

export const DEFAULT_TEMPLATE_FILTERS: TemplateCatalogFilters = {
  cities: [],
  sections: [],
  duration: 'all',
}

export function templateFiltersAreActive(filters: TemplateCatalogFilters) {
  return filters.cities.length > 0 || filters.sections.length > 0 || filters.duration !== 'all'
}

export function countActiveTemplateFilters(filters: TemplateCatalogFilters) {
  let n = 0
  n += filters.cities.length
  n += filters.sections.length
  if (filters.duration !== 'all') n += 1
  return n
}

export function isShapeSet(shape: TripShape) {
  return shape.days != null || shape.people != null || shape.pace != null
}

function daysMatch(template: ItineraryTemplate, days: number) {
  if (isFourPlusWeeks(days) || days >= FOUR_PLUS_WEEKS_DAYS) {
    return template.maxDays >= 18 || template.pace === 'packed' || template.section === 'max-experience'
  }
  if (days >= template.minDays && days <= template.maxDays) return true
  const typical = (template.minDays + template.maxDays) / 2
  return Math.abs(typical - days) <= 2
}

function durationMatch(template: ItineraryTemplate, duration: TemplateDurationFilter) {
  if (duration === 'all') return true
  const days = typicalDaysFor(template)
  if (duration === 'short') return days <= 5
  if (duration === 'week') return days >= 6 && days <= 10
  return days >= 11
}

export function matchTemplates(templates: ItineraryTemplate[], shape: TripShape): ItineraryTemplate[] {
  if (!isShapeSet(shape)) return []

  const scored = templates.flatMap((template) => {
    let hits = 0
    if (shape.days != null) {
      if (!daysMatch(template, shape.days)) return []
      hits++
    }
    if (shape.people != null) {
      if (shape.people < template.peopleMin || shape.people > template.peopleMax) return []
      hits++
    }
    if (shape.pace != null) {
      if (template.pace !== shape.pace) return []
      hits++
    }
    return [{ template, hits }]
  })

  scored.sort((a, b) => b.hits - a.hits || a.template.title.localeCompare(b.template.title))
  return scored.map((row) => row.template)
}

export function filterTemplates(
  templates: ItineraryTemplate[],
  filters: TemplateCatalogFilters,
): ItineraryTemplate[] {
  return templates.filter((template) => {
    if (template.section === 'city-stays') return false
    if (!durationMatch(template, filters.duration)) return false
    if (filters.sections.length && !filters.sections.includes(template.section)) return false
    if (filters.cities.length && !template.cities.some((city) => filters.cities.includes(city))) {
      return false
    }
    return true
  })
}

