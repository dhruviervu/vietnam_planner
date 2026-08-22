/** Structured model for the flagship "Your Vietnam" itinerary. */

export type SelectionState =
  | 'selected'
  | 'recommended'
  | 'system'
  | 'optional'
  | 'open'
  | 'conflict'

export type PeriodId = 'morning' | 'afternoon' | 'evening' | 'night'

export type ItemKind =
  | 'experience'
  | 'activity'
  | 'meal'
  | 'stay'
  | 'shopping'
  | 'local-transfer'
  | 'city-transfer'
  | 'airport-transfer'
  | 'check-in'
  | 'check-out'
  | 'open'

export type TripIssueSeverity = 'ok' | 'warn' | 'info'

export type TripIssueSuggestion = {
  id: string
  name: string
  tag: string
  reason: string
}

export type TripIssue = {
  id: string
  severity: TripIssueSeverity
  title: string
  detail: string
  /** trip = short top checklist; day = shown on that day only */
  scope?: 'trip' | 'day'
  dayNumber?: number
  actionLabel?: string
  href?: string
  /** Optional must-do / popular adds (thin cities) */
  suggestions?: TripIssueSuggestion[]
}

export type LocalTransferHint = {
  mode: string
  icon: string
  durationLabel: string
  reason: string
  selectionState: SelectionState
  costUsd: number
  mapsUrl?: string
  externalUrl?: string
  /** Same-city local move vs cross-neighbourhood hop */
  accent?: 'local' | 'city-hop'
}

export type ItineraryItem = {
  id: string
  kind: ItemKind
  name: string
  selectionState: SelectionState
  period: PeriodId
  timeLabel: string
  durationLabel?: string
  locationLabel?: string
  city: string
  region: string
  description?: string
  costUsd: number
  costBand?: string
  icon: string
  thumb?: string
  mapsUrl?: string
  externalUrl?: string
  externalLabel?: string
  reason?: string
  tags?: string[]
  /** Visual accent for transfer-like items in the day plan */
  transferAccent?: 'arrival' | 'departure' | 'city-hop' | 'local'
  /** Transfer after this item toward the next */
  transferAfter?: LocalTransferHint
  sourceId?: string
}

export type DayPeriod = {
  id: PeriodId
  label: string
  windowLabel: string
  items: ItineraryItem[]
  /** When no items and we intentionally leave open */
  openNote?: string
}

export type DayCosts = {
  stay: number
  food: number
  transport: number
  experiences: number
  shopping: number
  other: number
  total: number
}

export type YourVietnamDay = {
  day: number
  dateLabel: string
  city: string
  region: string
  theme: string
  blurb: string
  nightsHere: number
  experienceCount: number
  foodCount: number
  transferCount: number
  periods: DayPeriod[]
  costs: DayCosts
  issues: TripIssue[]
  hotelName?: string
  hotelId?: string
  stayGap?: boolean
  /** City change departing this evening / next morning */
  cityTransferOut?: {
    toCity: string
    toRegion: string
    modeLabel: string
    icon: string
    durationLabel: string
    costUsd: number
    reason: string
    externalUrl?: string
    /** True when the traveller has not confirmed a mode for this hop */
    unset?: boolean
  }
  bannerImage?: string
}

export type RouteStop = {
  city: string
  region: string
  nights: number
  experiences: number
  kind: 'stay' | 'transfer'
}

export type CostSummaryBand = {
  low: number
  mid: number
  high: number
  categories: {
    accommodation: number
    food: number
    transport: number
    experiences: number
    shopping: number
    other: number
  }
}

export type YourVietnamTrip = {
  title: string
  generatedAt: string
  daysCount: number
  cityCount: number
  experienceCount: number
  activityCount: number
  foodCount: number
  stayCount: number
  transferCount: number
  travellersLabel: string
  dateRangeLabel: string
  route: RouteStop[]
  days: YourVietnamDay[]
  cost: CostSummaryBand
  issues: TripIssue[]
  isEmpty: boolean
  hasNoStays: boolean
}

export const PERIOD_META: Record<
  PeriodId,
  { label: string; windowLabel: string }
> = {
  morning: { label: 'Morning', windowLabel: '08:00–12:00 approx.' },
  afternoon: { label: 'Afternoon', windowLabel: '12:00–17:00 approx.' },
  evening: { label: 'Evening', windowLabel: '17:00–21:00 approx.' },
  night: { label: 'Night', windowLabel: '21:00+ approx.' },
}
