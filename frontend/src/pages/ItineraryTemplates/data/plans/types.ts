export type SlotRef =
  | { kind: 'experience'; id: string; time?: string }
  | { kind: 'activity'; id: string; time?: string }
  | { kind: 'meal'; name: string; time?: string }
  | { kind: 'free'; note: string }

export type AuthoredDay = {
  city: string
  theme: string
  blurb: string
  morning?: SlotRef[]
  afternoon?: SlotRef[]
  evening?: SlotRef[]
  /** Custom night note. Stay check-in / overnight is inferred from city changes. */
  night?: 'stay' | 'free' | string
}

export type AuthoredPlan = {
  templateId: string
  /** Stay property id or hotel id, keyed by city label on the card. */
  stayByCity?: Record<string, string>
  days: AuthoredDay[]
}
