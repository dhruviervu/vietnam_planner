import type { ItineraryItem } from './types'

export function isSight(
  item: ItineraryItem,
): item is ItineraryItem & { kind: 'experience' | 'activity' | 'shopping' | 'meal' } {
  return (
    item.kind === 'experience' ||
    item.kind === 'activity' ||
    item.kind === 'shopping' ||
    (item.kind === 'meal' && Boolean(item.sourceId))
  )
}

export type MealKind = 'breakfast' | 'lunch' | 'coffee' | 'dinner'

/** Clock rules for a sit-down stop: earliest start, latest start, and how long it takes. */
export const MEAL_WINDOW: Record<MealKind, { from: number; latestStart: number; hours: number }> = {
  breakfast: { from: 7, latestStart: 10, hours: 0.75 },
  lunch: { from: 11.5, latestStart: 13.75, hours: 1 },
  coffee: { from: 14, latestStart: 17, hours: 0.75 },
  dinner: { from: 18, latestStart: 20.5, hours: 1.25 },
}

export function mealKindOf(item: ItineraryItem): MealKind | null {
  if (item.kind !== 'meal') return null
  const name = item.name.toLowerCase()
  if (name.startsWith('breakfast')) return 'breakfast'
  if (name.startsWith('coffee')) return 'coffee'
  if (name.startsWith('dinner') || name.startsWith('evening meal')) return 'dinner'
  return 'lunch'
}

/** Calendar days an outing occupies: overnight cruises and cave expeditions run past one day. */
export function spanDays(durationHours: number | undefined): number {
  const hours = durationHours ?? 0
  return hours >= 24 ? Math.max(2, Math.round(hours / 24)) : 1
}

export function newDaySlotId() {
  return `slot:${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}
