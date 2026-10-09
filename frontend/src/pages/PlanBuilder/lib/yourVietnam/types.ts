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
  addKind?: 'experience' | 'activity' | 'restaurant'
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
  /** True when the engine asks the traveller to consider dropping this pick */
  suggestDrop?: boolean
  /** One-line planner context (what it is / when / same-tour). */
  planningNote?: string
  /** Landing already inside a selected parent tour (cruise cave, etc.). */
  includedStop?: boolean
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

export type DayAgendaItem = {
  id: string
  name: string
  kind: ItemKind
  sourceId?: string
  recommended?: boolean
  mapsUrl?: string
}

export type DayAgenda = {
  sights: DayAgendaItem[]
  do: DayAgendaItem[]
  eat: DayAgendaItem[]
}

export type ItineraryDaySlot = {
  id: string
  placeId: string
  blank: boolean
}

/** User-inserted pause on a day's compact timeline (lunch, coffee, rest). */
export type ItineraryBreak = {
  id: string
  /** Sight this break follows. `null` places it before the first sight. */
  afterSourceId: string | null
  label: string
  durationMinutes: number
  /** Planner-added lunch the timeline reserves itself. Not stored or edited. */
  auto?: boolean
}

export type YourVietnamDay = {
  day: number
  dateLabel: string
  city: string
  region: string
  /** Stable id for this calendar slot (survives day reorder). */
  slotId: string
  /** True when the traveller inserted an empty day. */
  blank?: boolean
  /** Getting Around place id when the city is on the Vietnam map */
  placeId?: string
  theme: string
  blurb: string
  nightsHere: number
  experienceCount: number
  foodCount: number
  transferCount: number
  agenda: DayAgenda
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
  /** Airport + in-city transport briefing for this stop. */
  cityNote?: string
}

export type RouteStop = {
  city: string
  region: string
  nights: number
  experiences: number
  kind: 'stay' | 'transfer'
  placeId?: string
}

export type ThinCityNote = {
  city: string
  nights: number
  selectedCount: number
  catalogCity: string
}

export type MustVisitCity = {
  placeId: string
  label: string
  catalogCity: string
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

/** A bagged sight the city's days cannot hold under the daily caps. */
export type UnscheduledSight = {
  sourceId: string
  kind: 'experience' | 'activity' | 'shopping' | 'restaurant'
  name: string
  city: string
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
  /**
   * Suggested-day stops (template days) that cannot work on their authored day
   * for this start date, re-homed to another day: sourceId → day slot id.
   */
  pinMoves?: Record<string, string>
  isEmpty: boolean
  hasNoStays: boolean
  thinCities: ThinCityNote[]
  mustVisit: MustVisitCity[]
  unscheduled: UnscheduledSight[]
}

export const PERIOD_META: Record<
  PeriodId,
  { label: string; windowLabel: string }
> = {
  morning: { label: 'Morning', windowLabel: '09:00–13:00' },
  afternoon: { label: 'Afternoon', windowLabel: '13:00–17:30' },
  evening: { label: 'Evening', windowLabel: '17:30–19:30' },
  night: { label: 'Night', windowLabel: '19:30+' },
}
