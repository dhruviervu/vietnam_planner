import type { Experience, SignalLevel, TimeOfDay } from '../types'
import { getExperienceById } from '../data/experiences'
import {
  catalogHoursForSource,
  displayTodayHours,
  hoursLabelForSource,
  weekdayFromIso,
} from '../lib/yourVietnam/openingHours'

/**
 * Live / time-sensitive experience signals.
 * Mock now — replace internals with a real API later without changing callers.
 *
 * Concept: experience + date + time → current signals
 */
export type ExperienceLiveSignals = {
  experienceId: string
  date: string | null
  time: TimeOfDay
  region: string
  weather: {
    label: string
    detail: string
    level: SignalLevel
  }
  crowdLevel: SignalLevel
  crowdLabel: string
  openingStatus: 'open' | 'closing-soon' | 'closed' | 'seasonal'
  openingLabel: string
  availability: 'good' | 'limited' | 'sold-out'
  availabilityLabel: string
  guideAvailability: 'available' | 'limited' | 'unavailable'
  guideLabel: string
  queueSignal: string | null
  lightLabel: string
  atmosphereLabel: string
  updatedMinutesAgo: number
}

export type ExperienceDetailsPayload = {
  experience: Experience
  live: ExperienceLiveSignals
  stable: {
    location: string
    durationLabel: string
    costLabel: string
    costUsd: number
    accessibility: Experience['accessibilityDetail']
    hours: string
    about: string
    whyGo: string
  }
}

const CROWD_WORDS: Record<SignalLevel, string> = {
  1: 'Quiet',
  2: 'Low crowds',
  3: 'Moderate',
  4: 'Busy',
  5: 'Very crowded',
}

function clampLevel(n: number): SignalLevel {
  return Math.max(1, Math.min(5, Math.round(n))) as SignalLevel
}

function hashSeed(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h
}

/**
 * Mock live service — deterministic from experienceId + date + time
 * so UI feels consistent within a session.
 */
export function getLiveSignals(
  experience: Experience,
  opts: { date?: string | null; time: TimeOfDay },
): ExperienceLiveSignals {
  const date = opts.date ?? null
  const seed = hashSeed(`${experience.id}|${date ?? 'flex'}|${opts.time}`)
  const slot = experience.slotQuality[opts.time]
  const crowdShift = opts.time === 'evening' ? 1 : opts.time === 'morning' ? -1 : 0
  const crowdLevel = clampLevel(experience.crowdBase + crowdShift + ((seed % 3) - 1) * 0.3)

  const weatherPool =
    opts.time === 'morning'
      ? [
          { label: 'Clear morning', detail: 'Warming up', level: 4 as SignalLevel },
          { label: 'Soft haze', detail: 'Good visibility', level: 3 as SignalLevel },
          { label: 'Mild breeze', detail: 'Comfortable', level: 4 as SignalLevel },
        ]
      : opts.time === 'afternoon'
        ? [
            { label: 'Warm & bright', detail: 'Strong sun', level: 3 as SignalLevel },
            { label: 'Partly cloudy', detail: 'Comfortable', level: 4 as SignalLevel },
            { label: 'Hot spell', detail: 'Hydrate well', level: 2 as SignalLevel },
          ]
        : [
            { label: 'Cool evening', detail: 'Pleasant', level: 5 as SignalLevel },
            { label: 'Clear skies', detail: 'Good for photos', level: 4 as SignalLevel },
            { label: 'Light humidity', detail: 'Soft air', level: 3 as SignalLevel },
          ]

  const weather = weatherPool[seed % weatherPool.length]

  const lightLabel =
    opts.time === 'morning'
      ? 'Good light'
      : opts.time === 'afternoon'
        ? 'Strong light'
        : slot >= 4
          ? 'Golden hour'
          : 'Evening light'

  const atmosphereLabel =
    opts.time === 'evening' && experience.dna.some((d) => /NIGHT|EVENING|LANTERN/i.test(d))
      ? 'Lantern atmosphere'
      : opts.time === 'morning'
        ? 'Quieter start'
        : 'Daytime energy'

  const hours = catalogHoursForSource(
    'experience',
    experience.id,
    date ? weekdayFromIso(date) : new Date().getDay(),
  )
  const openingStatus: ExperienceLiveSignals['openingStatus'] = hours.closedToday
    ? 'closed'
    : hours.unknown
      ? 'seasonal'
      : 'open'

  const availRoll = seed % 7
  const availability: ExperienceLiveSignals['availability'] =
    availRoll > 5 ? 'limited' : 'good'

  const guideRoll = seed % 5
  const guideAvailability: ExperienceLiveSignals['guideAvailability'] =
    guideRoll > 3 ? 'limited' : 'available'

  return {
    experienceId: experience.id,
    date,
    time: opts.time,
    region: experience.region,
    weather,
    crowdLevel,
    crowdLabel: CROWD_WORDS[crowdLevel],
    openingStatus,
    openingLabel: hours.closedToday
      ? 'Closed today'
      : hours.unknown
        ? hours.label || 'Hours vary'
        : displayTodayHours(hours),
    availability,
    availabilityLabel:
      availability === 'good' ? 'Good availability' : availability === 'limited' ? 'Limited slots' : 'Sold out',
    guideAvailability,
    guideLabel:
      guideAvailability === 'available'
        ? 'Guides available'
        : guideAvailability === 'limited'
          ? 'Guides limited'
          : 'No guides',
    queueSignal: crowdLevel >= 4 ? 'Expect short waits at peak' : null,
    lightLabel,
    atmosphereLabel,
    updatedMinutesAgo: 8 + (seed % 22),
  }
}

export function getExperienceDetails(
  experienceId: string,
  date: string | null,
  time: TimeOfDay,
): ExperienceDetailsPayload | null {
  const experience = getExperienceById(experienceId)
  if (!experience) return null
  const live = getLiveSignals(experience, { date, time })
  return {
    experience,
    live,
    stable: {
      location: `${experience.city}, ${experience.region}`,
      durationLabel: experience.durationLabel,
      costLabel: experience.costLabel,
      costUsd: experience.costUsd,
      accessibility: experience.accessibilityDetail,
      hours: hoursLabelForSource('experience', experience.id, experience.hours),
      about: experience.about,
      whyGo: experience.whyGo,
    },
  }
}
