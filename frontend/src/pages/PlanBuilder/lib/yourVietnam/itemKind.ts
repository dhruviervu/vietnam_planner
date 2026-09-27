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

export function newDaySlotId() {
  return `slot:${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}
