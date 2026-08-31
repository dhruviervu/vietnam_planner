export type TemplatePace = 'packed' | 'balanced' | 'relaxed'

export type TemplateTag =
  | 'Solo'
  | 'Couple'
  | 'Family'
  | 'Friends'
  | 'Group'
  | 'Adventure'
  | 'Relaxing'
  | 'Beach'
  | 'Food'
  | 'Luxury'
  | 'Budget'
  | 'First-timer'
  | 'Reset'

export type TemplateSectionId =
  | 'solo'
  | 'couples'
  | 'family-young'
  | 'family-older'
  | 'friends'
  | 'large-groups'
  | 'budget'
  | 'relaxed'
  | 'beaches'
  | 'food'
  | 'adventure'
  | 'luxury'
  | 'first-time'
  | 'reset'
  | 'max-experience'

export type ItineraryTemplate = {
  id: string
  title: string
  section: TemplateSectionId
  description: string
  tags: [TemplateTag] | [TemplateTag, TemplateTag]
  pace: TemplatePace
  minDays: number
  maxDays: number
  peopleMin: number
  peopleMax: number
  cities: string[]
  image: string
}

/** 29 = “4+ weeks” in the shape bar (no 29/30/… day cards). */
export const FOUR_PLUS_WEEKS_DAYS = 29

export type TripShape = {
  days: number | null
  people: number | null
  pace: TemplatePace | null
}

export function isFourPlusWeeks(days: number | null | undefined) {
  return days != null && days >= FOUR_PLUS_WEEKS_DAYS
}
