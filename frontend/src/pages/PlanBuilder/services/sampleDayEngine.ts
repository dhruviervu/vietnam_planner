import type { TravelStyle } from '../types'
import {
  getActivityById,
  getDayTemplates,
  getSamplePool,
  type DayMood,
  type SampleActivity,
} from '../data/sampleDayPool'

export type SampleSlot = {
  key: string
  timeHour: number
  timeMinute: number
  activity: SampleActivity
}

export type SlotContext = {
  crowdLabel: string
  crowdLevel: number
  conditionsLabel: string
  lightLabel: string
  atmosphereLabel: string
  openingLabel: string
  openingStatus: 'open' | 'closing-soon' | 'closed'
}

export type SwapOption = {
  activity: SampleActivity
  fit: 'great' | 'ok' | 'tight'
  note: string
  suggestTime?: { hour: number; minute: number; label: string }
  distanceLabel: string
}

export type TravelGap = {
  fromKey: string
  toKey: string
  minutes: number
  warning: boolean
  label: string
}

export function defaultMoodFromPace(pace: TravelStyle | null | undefined): DayMood {
  if (pace === 'relaxed') return 'slow'
  if (pace === 'packed') return 'adventure'
  return 'balanced'
}

export function representativeDayCount(recommendedStay: string, sketchLen: number) {
  const nums = recommendedStay.match(/\d+/g)?.map(Number) ?? []
  if (nums.length >= 2) return Math.min(3, Math.max(sketchLen, Math.round((nums[0] + nums[1]) / 2)))
  if (nums.length === 1) return Math.min(3, Math.max(1, nums[0]))
  return Math.min(3, Math.max(1, sketchLen || 2))
}

export function formatTime(hour: number, minute: number) {
  const h = Math.floor(hour)
  const m = minute
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function buildDaySlots(
  cityId: string,
  mood: DayMood,
  dayIndex: number,
): SampleSlot[] {
  const templates = getDayTemplates(cityId)
  const days = templates[mood] ?? templates.balanced
  const day = days[Math.min(dayIndex, days.length - 1)] ?? days[0] ?? []
  return day
    .map((t, i) => {
      const activity = getActivityById(cityId, t.activityId)
      if (!activity) return null
      return {
        key: `${dayIndex}-${i}-${activity.id}`,
        timeHour: t.timeHour,
        timeMinute: t.timeMinute,
        activity,
      }
    })
    .filter(Boolean) as SampleSlot[]
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** experience + time → contextual state (mock, deterministic) */
export function getSlotContext(activity: SampleActivity, hour: number, minute: number): SlotContext {
  const t = hour + minute / 60
  const seed = hash(`${activity.id}|${hour}|${minute}`)
  const evening = t >= 17
  const morning = t < 11
  const afternoon = !morning && !evening

  let crowdLevel = 2
  if (morning) crowdLevel = 2
  if (afternoon) crowdLevel = 3
  if (evening) crowdLevel = 4
  if (t >= 19) crowdLevel = 5
  if (activity.category === 'Scenic' && morning) crowdLevel = 1
  crowdLevel = Math.max(1, Math.min(5, crowdLevel + ((seed % 3) - 1)))

  const crowdLabel =
    crowdLevel <= 1 ? 'Quiet' : crowdLevel === 2 ? 'Low crowds' : crowdLevel === 3 ? 'Moderate' : crowdLevel === 4 ? 'Busy' : 'Peak'

  const conditionsLabel = morning ? 'Mild' : afternoon ? 'Warm' : 'Cooler evening'
  const lightLabel = morning ? 'Soft' : t >= 16 && t < 18.5 ? 'Golden' : evening ? 'Evening' : 'Bright'
  const atmosphereLabel = evening
    ? 'Lively'
    : morning
      ? 'Calm'
      : activity.category === 'Food'
        ? 'Bustling'
        : 'Steady'

  let openingStatus: SlotContext['openingStatus'] = 'open'
  let openingLabel = 'Open'
  if (t < activity.openHour) {
    openingStatus = 'closed'
    openingLabel = `Opens ${formatTime(activity.openHour, 0)}`
  } else if (t >= activity.closeHour) {
    openingStatus = 'closed'
    openingLabel = 'Closed'
  } else if (t >= activity.closeHour - 1) {
    openingStatus = 'closing-soon'
    openingLabel = 'Closing soon'
  }

  return {
    crowdLabel,
    crowdLevel,
    conditionsLabel,
    lightLabel,
    atmosphereLabel,
    openingLabel,
    openingStatus,
  }
}

function slotEndHours(slot: SampleSlot) {
  return slot.timeHour + slot.timeMinute / 60 + slot.activity.durationHours
}

function availableWindowHours(slots: SampleSlot[], index: number) {
  const slot = slots[index]
  const start = slot.timeHour + slot.timeMinute / 60
  const next = slots[index + 1]
  if (!next) return 4
  const nextStart = next.timeHour + next.timeMinute / 60
  return Math.max(0.5, nextStart - start)
}

export function getSwapOptions(
  cityId: string,
  slots: SampleSlot[],
  index: number,
): SwapOption[] {
  const current = slots[index]
  if (!current) return []
  const pool = getSamplePool(cityId)
  const used = new Set(slots.map((s) => s.activity.id))
  const windowHrs = availableWindowHours(slots, index)
  const start = current.timeHour + current.timeMinute / 60

  const options: SwapOption[] = []
  for (const a of pool) {
    if (a.id === current.activity.id) continue
    if (used.has(a.id)) continue

    const dist = Math.abs(a.distanceKm - current.activity.distanceKm)
    const distanceLabel = `${Math.max(0.3, dist).toFixed(1)} km`

    let fit: SwapOption['fit'] = 'great'
    let note = 'Fits this slot well.'
    let suggestTime: SwapOption['suggestTime']

    const ends = start + a.durationHours
    if (a.durationHours > windowHrs + 0.25) {
      fit = 'tight'
      note = `Needs ~${a.durationLabel} — this slot has ~${windowHrs.toFixed(1)} hrs.`
    }

    if (start < a.openHour) {
      fit = 'tight'
      note = `Usually opens around ${formatTime(a.openHour, 0)}.`
      suggestTime = {
        hour: Math.floor(a.openHour),
        minute: 0,
        label: `Move to ${formatTime(a.openHour, 0)}`,
      }
    } else if (start >= a.closeHour) {
      fit = 'tight'
      note = 'Closed at this time.'
      const earlier = Math.max(a.openHour, a.closeHour - a.durationHours - 0.5)
      suggestTime = {
        hour: Math.floor(earlier),
        minute: earlier % 1 >= 0.5 ? 30 : 0,
        label: `Move to ${formatTime(Math.floor(earlier), earlier % 1 >= 0.5 ? 30 : 0)}`,
      }
    } else if (ends > a.closeHour) {
      fit = fit === 'great' ? 'ok' : fit
      note = 'Possible, but less ideal at this time — closes soon.'
      const earlier = Math.max(a.openHour, a.closeHour - a.durationHours - 0.25)
      suggestTime = {
        hour: Math.floor(earlier),
        minute: earlier % 1 >= 0.5 ? 30 : 0,
        label: `Move to ${formatTime(Math.floor(earlier), earlier % 1 >= 0.5 ? 30 : 0)}`,
      }
    } else if (Math.abs(a.durationHours - current.activity.durationHours) <= 0.5 && dist < 2) {
      fit = 'great'
      note = 'Similar length and nearby.'
    } else if (a.category === current.activity.category || a.categoryLabel === current.activity.categoryLabel) {
      fit = fit === 'tight' ? 'tight' : 'ok'
      if (fit !== 'tight') note = 'Same kind of experience — good swap.'
    }

    // Prefer similar duration / nearby
    const score =
      (fit === 'great' ? 30 : fit === 'ok' ? 15 : 0) +
      (10 - Math.min(10, dist * 2)) +
      (5 - Math.min(5, Math.abs(a.durationHours - windowHrs)))

    options.push({ activity: a, fit, note, suggestTime, distanceLabel, score } as SwapOption & { score: number })
  }

  return (options as (SwapOption & { score: number })[])
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ score: _s, ...rest }) => rest)
}

export function computeTravelGaps(slots: SampleSlot[]): TravelGap[] {
  const gaps: TravelGap[] = []
  for (let i = 0; i < slots.length - 1; i++) {
    const a = slots[i]
    const b = slots[i + 1]
    const end = slotEndHours(a)
    const nextStart = b.timeHour + b.timeMinute / 60
    const freeMin = Math.round((nextStart - end) * 60)
    const travelMin = Math.round(Math.abs(a.activity.distanceKm - b.activity.distanceKm) * 8 + 8)
    if (freeMin < travelMin) {
      gaps.push({
        fromKey: a.key,
        toKey: b.key,
        minutes: travelMin,
        warning: true,
        label: `Travel gap: ~${travelMin} min needed`,
      })
    } else if (freeMin < 0) {
      gaps.push({
        fromKey: a.key,
        toKey: b.key,
        minutes: Math.abs(freeMin),
        warning: true,
        label: 'Possible timing conflict',
      })
    }
  }
  return gaps
}

export function explainOrder(slots: SampleSlot[]): { flow: string; note: string } {
  if (slots.length < 2) {
    return {
      flow: 'A simple single-stop day to feel the place.',
      note: "Save what you like — we'll refine the full schedule later.",
    }
  }
  const arc = slots.map((s) => {
    const t = s.timeHour + s.timeMinute / 60
    const cat = s.activity.categoryLabel.toLowerCase()
    if (t < 11) return `Morning ${cat}`
    if (t < 14) return `midday ${cat}`
    if (t < 17) return `afternoon ${cat}`
    return `evening ${cat}`
  })
  const unique = [...new Set(arc)]
  const flow = unique.join(' → ')
  const spread =
    Math.max(...slots.map((s) => s.activity.distanceKm)) -
    Math.min(...slots.map((s) => s.activity.distanceKm))
  const note =
    spread < 3
      ? 'We grouped nearby experiences to reduce backtracking and give each part of the day a natural pace.'
      : 'Farther stops are spaced with time to move between areas, so the day still keeps a natural pace.'
  return { flow, note }
}

export function reorderSlots(slots: SampleSlot[], from: number, to: number): SampleSlot[] {
  if (from === to || from < 0 || to < 0 || from >= slots.length || to >= slots.length) return slots
  const next = [...slots]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  // Keep times in ascending order by swapping time labels with positions
  const times = slots.map((s) => ({ h: s.timeHour, m: s.timeMinute }))
  return next.map((s, i) => ({
    ...s,
    key: `${s.activity.id}-${times[i].h}-${times[i].m}-${i}`,
    timeHour: times[i].h,
    timeMinute: times[i].m,
  }))
}

export const DAY_MOODS: { id: DayMood; label: string }[] = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Food' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'slow', label: 'Slow' },
]

export const TIME_PRESETS = [
  { hour: 8, minute: 0 },
  { hour: 9, minute: 0 },
  { hour: 10, minute: 0 },
  { hour: 11, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 13, minute: 0 },
  { hour: 14, minute: 0 },
  { hour: 15, minute: 0 },
  { hour: 16, minute: 0 },
  { hour: 17, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 18, minute: 30 },
  { hour: 19, minute: 0 },
  { hour: 19, minute: 30 },
  { hour: 20, minute: 0 },
]
