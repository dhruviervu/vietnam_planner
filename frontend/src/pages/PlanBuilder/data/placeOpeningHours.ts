import raw from './placeOpeningHours.json'

export type PlaceOpeningHoursRow = {
  source: 'google'
  displayName?: string
  weekdayDescriptions: string[]
  alwaysOpen?: boolean
  fetchedAt?: string
  /** Recurring closures beyond the weekly grid, copied from Google. */
  exceptionNotes?: string[]
}

export const PLACE_OPENING_HOURS = raw as Record<string, PlaceOpeningHoursRow>

export function placeOpeningHoursRow(sourceId: string): PlaceOpeningHoursRow | undefined {
  return PLACE_OPENING_HOURS[sourceId]
}
