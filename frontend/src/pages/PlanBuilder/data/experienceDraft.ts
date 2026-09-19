import type {
  Experience,
  ExperienceCategory,
  ExperiencePopularityTag,
  ExperienceSignal,
  PriceType,
  SignalLevel,
  TimePreference,
  TravelStyle,
} from '../types'

/** Draft shape matching experiences.ts `build()` — do not import build (circular). */
export type ExperienceDraft = {
  id: string
  name: string
  /** Shared identity across variants of one place — see Experience.groupId. */
  groupId?: string
  timePreference?: TimePreference
  region: string
  city: string
  sightSection?: string
  category: ExperienceCategory
  seeds: string[]
  hook: string
  about: string
  whyGo: string
  cardSummary?: string
  popularityRank?: number
  popularityTag?: ExperiencePopularityTag
  rating: number
  reviewCount: number
  costUsd: number
  costLabel: string
  priceType?: PriceType
  durationHours: number
  durationLabel: string
  dna: string[]
  signal: ExperienceSignal
  crowdBase: SignalLevel
  slotQuality: { morning: SignalLevel; afternoon: SignalLevel; evening: SignalLevel }
  accessibilityDetail: Experience['accessibilityDetail']
  hours: string
  bestTime: string
  paceAffinity: TravelStyle[]
  budgetBand: Experience['budgetBand']
  monthsIdeal: number[]
  relatedIds: string[]
  featured?: boolean
  hiddenGem?: boolean
  vietnamBest?: boolean
}
