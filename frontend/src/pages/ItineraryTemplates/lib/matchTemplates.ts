import { FOUR_PLUS_WEEKS_DAYS, isFourPlusWeeks, type ItineraryTemplate, type TripShape } from '../data/types'

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
