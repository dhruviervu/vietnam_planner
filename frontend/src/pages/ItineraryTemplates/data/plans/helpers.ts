import type { AuthoredDay, AuthoredPlan, SlotRef } from './types'

export function e(id: string, time?: string): SlotRef {
  return time ? { kind: 'experience', id, time } : { kind: 'experience', id }
}

export function a(id: string, time?: string): SlotRef {
  return time ? { kind: 'activity', id, time } : { kind: 'activity', id }
}

export function s(id: string, time?: string): SlotRef {
  return time ? { kind: 'shopping', id, time } : { kind: 'shopping', id }
}

export function m(name: string, time?: string): SlotRef {
  return time ? { kind: 'meal', name, time } : { kind: 'meal', name }
}

export function f(note: string): SlotRef {
  return { kind: 'free', note }
}

export function d(
  city: string,
  theme: string,
  blurb: string,
  morning: SlotRef[] = [],
  afternoon: SlotRef[] = [],
  evening: SlotRef[] = [],
  night: AuthoredDay['night'] = 'stay',
): AuthoredDay {
  return { city, theme, blurb, morning, afternoon, evening, night }
}

export function plan(
  templateId: string,
  stayByCity: Record<string, string>,
  days: AuthoredDay[],
): AuthoredPlan {
  return { templateId, stayByCity, days }
}
