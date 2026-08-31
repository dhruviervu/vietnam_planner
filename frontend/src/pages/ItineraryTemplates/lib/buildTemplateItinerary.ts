import { EXPERIENCES, getExperienceById } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES, getActivityImages, getActivityById, type CityActivity } from '../../PlanBuilder/data/activities'
import { HOTELS, hotelImages } from '../../PlanBuilder/data/hotels'
import { RESTAURANTS as PB_RESTAURANTS } from '../../PlanBuilder/data/restaurants'
import { findLeg, formatDuration } from '../../PlanBuilder/data/transport'
import { getExperienceImages } from '../../PlanBuilder/lib/pricing'
import { restaurantMapsUrl } from '../../PlanBuilder/lib/yourVietnam/links'
import type { TransportMode } from '../../PlanBuilder/types'
import type { Experience } from '../../PlanBuilder/types'
import { PERIOD_META, type PeriodId } from '../../PlanBuilder/lib/yourVietnam/types'
import { RESTAURANTS as TASTE_RESTAURANTS } from '../../TasteOfVietnam/data/restaurants'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import type { StayProperty } from '../../WhereToStay/data/types'
import { rankInSection } from '../data/rankTemplates'
import { getAuthoredPlan } from '../data/plans'
import type { AuthoredDay, SlotRef } from '../data/plans/types'
import { FOUR_PLUS_WEEKS_DAYS, type ItineraryTemplate, type TemplateSectionId } from '../data/types'
import { cityKey } from './cityKey'
import { localMoveFor } from './localMove'

export { cityKey }

export type TemplateSlotKind =
  | 'experience'
  | 'activity'
  | 'meal'
  | 'stay'
  | 'shopping'
  | 'city-transfer'
  | 'local-move'

export type TemplateSlot = {
  id: string
  kind: TemplateSlotKind
  period: PeriodId
  timeLabel: string
  name: string
  city: string
  reason: string
  icon: string
  thumb?: string
  costUsd?: number
  durationLabel?: string
  locationLabel?: string
  sourceId?: string
  hotelId?: string
  stayId?: string
  clusterId?: string
  listingUrl?: string
  legId?: string
  transportMode?: TransportMode
}

export type TemplateDayPlan = {
  day: number
  city: string
  theme: string
  blurb: string
  localMove: TemplateSlot
  periods: Record<PeriodId, TemplateSlot[]>
  openNotes: Partial<Record<PeriodId, string>>
}

export type TemplateTransfer = {
  afterDay: number
  from: string
  to: string
  slot: TemplateSlot
}

export type TemplateTripContext = {
  days?: number | null
  people?: number | null
}

export type TemplateTrip = {
  typicalDays: number
  people: number
  rankInSection: number
  keptCities: string[]
  tradeoffs: string[]
  transfers: TemplateTransfer[]
  days: TemplateDayPlan[]
}

const PERIODS: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']

export { PERIOD_META }
export type { PeriodId }

function samePlace(a: string, b: string) {
  return cityKey(a) === cityKey(b)
}

function hotelRegion(city: string) {
  const key = cityKey(city)
  if (key === 'hcmc') return 'Ho Chi Minh City'
  if (key === 'ha-long') return 'Quang Ninh'
  if (key === 'yen-tu') return 'Yen Tu'
  if (key === 'ninh-binh') return 'Ninh Binh'
  if (key === 'ha-giang') return 'Ha Giang'
  if (key === 'cao-bang') return 'Cao Bang'
  if (key === 'hoi-an') return 'Hoi An'
  if (key === 'da-nang') return 'Da Nang'
  if (key === 'phu-quoc') return 'Phu Quoc'
  if (key === 'con-dao') return 'Con Dao'
  if (key === 'cat-tien') return 'Cat Tien'
  if (key === 'vinh-hy') return 'Vinh Hy Bay'
  if (key === 'quy-nhon') return 'Quy Nhon'
  if (key === 'hanoi') return 'Hanoi'
  if (key === 'hue') return 'Hue'
  if (key === 'sapa') return 'Sapa'
  if (key === 'mekong') return 'Mekong'
  if (key === 'nha-trang') return 'Nha Trang'
  if (key === 'dalat') return 'Da Lat'
  if (key === 'phong-nha') return 'Phong Nha'
  return city
}

function hopMode(section: TemplateSectionId, longHop: boolean, people: number): TransportMode {
  if (section === 'luxury') return 'driver'
  if (section === 'budget') return 'bus'
  if (people >= 6) return 'driver'
  if (section === 'family-young') return 'taxi'
  if (longHop) return 'train'
  return 'driver'
}

function isLongHop(from: string, to: string) {
  const a = cityKey(from)
  const b = cityKey(to)
  if (a === b) return false
  const short = new Set([
    'hoi-an|da-nang',
    'da-nang|hoi-an',
    'hanoi|ninh-binh',
    'ninh-binh|hanoi',
    'hanoi|ha-long',
    'ha-long|hanoi',
  ])
  return !short.has(`${a}|${b}`)
}

const SYNTHETIC_HOPS: Record<string, { minutes: number; label: string }> = {
  'hanoi|da-nang': { minutes: 90, label: 'Flight' },
  'hanoi|hcmc': { minutes: 120, label: 'Flight' },
  'hanoi|hoi-an': { minutes: 150, label: 'Flight via Da Nang' },
  'da-nang|hcmc': { minutes: 90, label: 'Flight' },
  'hoi-an|hcmc': { minutes: 120, label: 'Flight via Da Nang' },
  'hcmc|phu-quoc': { minutes: 60, label: 'Flight' },
  'da-nang|nha-trang': { minutes: 70, label: 'Flight' },
  'hcmc|nha-trang': { minutes: 70, label: 'Flight' },
  'da-nang|hue': { minutes: 150, label: 'Train or car' },
  'hue|hoi-an': { minutes: 180, label: 'Car via Hai Van' },
  'hanoi|sapa': { minutes: 360, label: 'Overnight train' },
  'hanoi|ha-giang': { minutes: 360, label: 'Night bus' },
  'dalat|nha-trang': { minutes: 240, label: 'Car' },
  'hcmc|cat-tien': { minutes: 210, label: 'Car to Cat Tien' },
  'cat-tien|dalat': { minutes: 240, label: 'Car up to Da Lat' },
  'ha-long|vinh-hy': { minutes: 180, label: 'Flight HAN/HPH → CXR, car to Vinh Hy' },
  'vinh-hy|hcmc': { minutes: 90, label: 'Car to CXR, flight to SGN' },
  'da-nang|quy-nhon': { minutes: 300, label: 'The Vietage by Anantara' },
  'hcmc|con-dao': { minutes: 60, label: 'Flight SGN → VCS' },
  'hanoi|hue': { minutes: 80, label: 'Flight' },
  'hue|hcmc': { minutes: 90, label: 'Flight' },
  'hoi-an|phu-quoc': { minutes: 90, label: 'Flight via Da Nang' },
  'da-nang|phu-quoc': { minutes: 80, label: 'Flight' },
  'hanoi|phu-quoc': { minutes: 130, label: 'Flight' },
  'hoi-an|ha-long': { minutes: 150, label: 'Flight via Hanoi or Da Nang' },
  'ha-long|hoi-an': { minutes: 150, label: 'Flight via Hanoi or Da Nang' },
  'ha-long|da-nang': { minutes: 90, label: 'Flight' },
  'da-nang|ha-long': { minutes: 90, label: 'Flight' },
  'mekong|phong-nha': { minutes: 180, label: 'Flight via Hue or Da Nang' },
  'phong-nha|hue': { minutes: 150, label: 'Car' },
  'hanoi|ninh-binh': { minutes: 140, label: 'Train' },
  'ha-giang|sapa': { minutes: 300, label: 'Car' },
  'ha-giang|ha-long': { minutes: 360, label: 'Car via Hanoi' },
  'ninh-binh|sapa': { minutes: 360, label: 'Via Hanoi' },
  'ninh-binh|ha-long': { minutes: 180, label: 'Private charter bus to Tuan Chau / Got Harbour' },
  'ha-long|ninh-binh': { minutes: 180, label: 'Private charter bus from the marina' },
  'ninh-binh|hoi-an': { minutes: 150, label: 'Flight via Hanoi or Da Nang' },
  'ninh-binh|da-nang': { minutes: 90, label: 'Flight via Hanoi' },
  'hanoi|dalat': { minutes: 110, label: 'Flight' },
  'hanoi|phong-nha': { minutes: 90, label: 'Flight via Hue or Da Nang' },
  'phong-nha|hoi-an': { minutes: 180, label: 'Car via Hue / Da Nang' },
  'sapa|hue': { minutes: 150, label: 'Flight via Hanoi' },
  'ha-long|hue': { minutes: 150, label: 'Flight via Hanoi or Da Nang' },
  'sapa|hoi-an': { minutes: 150, label: 'Flight via Hanoi or Da Nang' },
  'hcmc|dalat': { minutes: 50, label: 'Flight' },
  'da-nang|dalat': { minutes: 55, label: 'Flight' },
  'hoi-an|dalat': { minutes: 70, label: 'Flight via Da Nang' },
  'dalat|hcmc': { minutes: 50, label: 'Flight' },
  'hue|da-nang': { minutes: 150, label: 'Train or car' },
  'ninh-binh|hcmc': { minutes: 120, label: 'Flight via Hanoi' },
  'ha-long|nha-trang': { minutes: 90, label: 'Flight HPH → CXR' },
  'nha-trang|phu-quoc': { minutes: 70, label: 'Flight CXR → PQC' },
  'phong-nha|dalat': { minutes: 200, label: 'Flight via Da Nang' },
  'ha-giang|phong-nha': { minutes: 720, label: 'Overnight sleeper via Hanoi' },
  'ha-long|phong-nha': { minutes: 240, label: 'Car to HPH, flight to VDH, driver to Phong Nha' },
  'phong-nha|ha-long': { minutes: 240, label: 'Driver to VDH, flight to HPH' },
  'phong-nha|hcmc': { minutes: 110, label: 'Flight VDH → SGN' },
  'ha-long|phu-quoc': { minutes: 300, label: 'Van to HAN, flight to PQC' },
  'sapa|ninh-binh': { minutes: 360, label: 'Via Hanoi, then limousine van' },
  'ninh-binh|dalat': { minutes: 240, label: 'Private transfer to HAN, flight to DLI' },
  'ninh-binh|hue': { minutes: 540, label: 'Overnight sleeper train' },
  'mekong|phu-quoc': { minutes: 90, label: 'Flight via HCMC' },
  'hcmc|mekong': { minutes: 180, label: 'Car or slow boat to Can Tho' },
  'hanoi|yen-tu': { minutes: 120, label: 'Private car from HAN / Hanoi to Yen Tu' },
  'yen-tu|hanoi': { minutes: 120, label: 'Private car Yen Tu to Hanoi' },
  'yen-tu|ha-long': { minutes: 90, label: 'Private car to Got Harbor' },
  'ha-long|yen-tu': { minutes: 90, label: 'Private car from the marina to Yen Tu' },
  'ha-giang|cao-bang': { minutes: 180, label: 'Car via Meo Vac toward Ban Gioc' },
  'cao-bang|ha-giang': { minutes: 180, label: 'Car via Meo Vac from Ban Gioc' },
  'cao-bang|hanoi': { minutes: 480, label: 'Overnight sleeper bus to Hanoi' },
  'hanoi|cao-bang': { minutes: 480, label: 'Sleeper bus to Cao Bang' },
}

function transferSlot(
  from: string,
  to: string,
  section: TemplateSectionId,
  period: PeriodId,
  day: number,
  people: number,
): TemplateSlot {
  const leg = findLeg(hotelRegion(from), hotelRegion(to)) ?? findLeg(from, to)
  const longHop = isLongHop(from, to)
  const mode = hopMode(section, longHop, people)
  const option = leg?.options.find((o) => o.mode === mode) ?? leg?.options[0]
  const synth =
    SYNTHETIC_HOPS[`${cityKey(from)}|${cityKey(to)}`] ??
    SYNTHETIC_HOPS[`${cityKey(to)}|${cityKey(from)}`]
  const minutes = option?.durationMinutes ?? synth?.minutes ?? (longHop ? 180 : 50)
  let label = option?.label ?? synth?.label ?? (mode === 'bus' ? 'Sleeper bus' : 'Transfer')
  if (section === 'budget' && longHop) label = 'Sleeper bus'
  if ((section === 'luxury' || people >= 6) && !option) label = 'Private car'
  if (people >= 6 && mode === 'driver') label = 'Private van / driver'
  const icon = option?.icon ?? (longHop ? '✈️' : '🚘')
  return {
    id: `xfer-${day}-${cityKey(from)}-${cityKey(to)}`,
    kind: 'city-transfer',
    period,
    timeLabel: longHop ? 'Morning hop' : 'Evening hop',
    name: `${from} → ${to}`,
    city: to,
    reason: `${label} · ${formatDuration(minutes)}`,
    icon,
    durationLabel: formatDuration(minutes),
    costUsd: option?.costUsd,
    legId: leg?.id ?? `${cityKey(from)}-${cityKey(to)}`,
    transportMode: option?.mode ?? mode,
  }
}

function slotId(kind: string, day: number, source: string) {
  return `${kind}-${day}-${source}`
}

function emptyPeriods(): Record<PeriodId, TemplateSlot[]> {
  return { morning: [], afternoon: [], evening: [], night: [] }
}

function foldName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function warnMissing(kind: string, ref: string, city: string) {
  if (import.meta.env.DEV) {
    console.warn(`[itinerary template] missing ${kind} “${ref}” in ${city}`)
  }
}

function defaultTimes(period: PeriodId, index: number) {
  if (period === 'morning') return index === 0 ? '09:00' : index === 1 ? '10:30' : '11:15'
  if (period === 'afternoon') return index === 0 ? '12:30' : index === 1 ? '15:00' : '16:00'
  if (period === 'evening') return index === 0 ? '18:30' : index === 1 ? '19:45' : '20:30'
  return '21:30'
}

function findMeal(name: string, city: string) {
  const folded = foldName(name)
  const taste =
    TASTE_RESTAURANTS.find((r) => samePlace(r.city, city) && foldName(r.name) === folded) ??
    TASTE_RESTAURANTS.find((r) => foldName(r.name) === folded)
  if (taste) {
    return {
      id: taste.id,
      name: taste.name,
      city: taste.city,
      reason: taste.menuOrReviews,
      thumb: taste.images[0],
      costUsd: taste.priceLevel * 8,
      locationLabel: taste.neighborhood,
      listingUrl: taste.listingUrl,
    }
  }
  const pb =
    PB_RESTAURANTS.find((r) => samePlace(r.city, city) && foldName(r.name) === folded) ??
    PB_RESTAURANTS.find((r) => foldName(r.name) === folded)
  if (pb) {
    return {
      id: pb.id,
      name: pb.name,
      city: pb.city,
      reason: pb.blurb,
      costUsd: pb.priceUsd,
      listingUrl: restaurantMapsUrl(pb.name, pb.city),
    }
  }
  return null
}

function resolveStay(city: string, stayRef?: string) {
  if (stayRef) {
    const stay = STAY_PROPERTY_BY_ID[stayRef] as StayProperty | undefined
    if (stay) return { stay, hotel: undefined as (typeof HOTELS)[number] | undefined }
    const hotel = HOTELS.find((h) => h.id === stayRef)
    if (hotel) return { stay: undefined, hotel }
  }
  const hotel =
    HOTELS.find((h) => samePlace(h.city, city) || samePlace(h.region, hotelRegion(city))) ??
    HOTELS.find((h) => samePlace(h.city, city))
  return { stay: undefined, hotel }
}

function staySlot(
  city: string,
  day: number,
  period: PeriodId,
  timeLabel: string,
  prefix: string,
  stayRef?: string,
): TemplateSlot {
  const { stay, hotel } = resolveStay(city, stayRef)
  const stayName = stay?.name ?? hotel?.name ?? `A stay in ${city}`
  return {
    id: slotId(prefix, day, stay?.id ?? hotel?.id ?? cityKey(city)),
    kind: 'stay',
    period,
    timeLabel,
    name: `${prefix === 'stay' ? 'Check in' : 'Overnight'} · ${stayName}`,
    city,
    reason: stay?.reason ?? hotel?.blurb ?? `Your base in ${city}.`,
    icon: prefix === 'stay' ? '🏨' : '🌙',
    thumb: stay?.image ?? (hotel ? hotelImages(hotel)[0] : undefined),
    locationLabel: stay?.distanceLabel ?? hotel?.neighborhood,
    hotelId: hotel?.id,
    stayId: stay?.id,
    clusterId: stay?.clusterId,
  }
}

function hydrateRef(
  ref: SlotRef,
  day: number,
  city: string,
  period: PeriodId,
  index: number,
): { slot?: TemplateSlot; note?: string } {
  const time = 'time' in ref && ref.time ? ref.time : defaultTimes(period, index)
  if (ref.kind === 'free') return { note: ref.note }
  if (ref.kind === 'experience') {
    const exp: Experience | undefined = getExperienceById(ref.id) ?? EXPERIENCES.find((e) => e.id === ref.id)
    if (!exp) {
      warnMissing('experience', ref.id, city)
      return {}
    }
    return {
      slot: {
        id: slotId('experience', day, exp.id),
        kind: 'experience',
        period,
        timeLabel: time,
        name: exp.name,
        city: exp.city,
        reason: exp.cardSummary ?? exp.whyGo,
        icon: exp.signalEmoji ?? '✦',
        thumb: getExperienceImages(exp)[0],
        costUsd: exp.costUsd,
        durationLabel: exp.durationLabel,
        sourceId: exp.id,
      },
    }
  }
  if (ref.kind === 'activity') {
    const act: CityActivity | undefined =
      getActivityById(ref.id) ?? CITY_ACTIVITIES.find((item) => item.id === ref.id)
    if (!act) {
      warnMissing('activity', ref.id, city)
      return {}
    }
    return {
      slot: {
        id: slotId('activity', day, act.id),
        kind: 'activity',
        period,
        timeLabel: time,
        name: act.name,
        city: act.cityName,
        reason: act.hook,
        icon: act.signalEmoji ?? '✦',
        thumb: getActivityImages(act)[0],
        costUsd: act.priceFromUsd ?? undefined,
        durationLabel: act.durationLabel,
        sourceId: act.id,
      },
    }
  }
  const meal = findMeal(ref.name, city)
  if (!meal) {
    if (import.meta.env.DEV) {
      console.info(`[itinerary template] meal “${ref.name}” in ${city} is a maps pin (not in catalog)`)
    }
    return {
      slot: {
        id: slotId('meal', day, foldName(ref.name) || `meal-${index}`),
        kind: 'meal',
        period,
        timeLabel: time,
        name: ref.name,
        city,
        reason: `A table worth crossing ${city} for.`,
        icon: '🍜',
        listingUrl: restaurantMapsUrl(ref.name, city),
      },
    }
  }
  return {
    slot: {
      id: slotId('meal', day, meal.id),
      kind: 'meal',
      period,
      timeLabel: time,
      name: meal.name,
      city: meal.city,
      reason: meal.reason,
      icon: '🍜',
      thumb: meal.thumb,
      costUsd: meal.costUsd,
      locationLabel: meal.locationLabel,
      sourceId: meal.id,
      listingUrl: meal.listingUrl,
    },
  }
}

function applyPeriod(
  periods: Record<PeriodId, TemplateSlot[]>,
  openNotes: TemplateDayPlan['openNotes'],
  refs: SlotRef[] | undefined,
  day: number,
  city: string,
  period: PeriodId,
) {
  ;(refs ?? []).forEach((ref, index) => {
    const { slot, note } = hydrateRef(ref, day, city, period, index)
    if (slot) periods[period].push(slot)
    if (note) openNotes[period] = note
  })
}

export function typicalDaysFor(template: ItineraryTemplate) {
  return Math.max(1, Math.round((template.minDays + template.maxDays) / 2))
}

export function resolveTripDays(template: ItineraryTemplate, _ctx?: TemplateTripContext) {
  const plan = getAuthoredPlan(template.id)
  if (plan?.days.length) return plan.days.length
  return typicalDaysFor(template)
}

export function resolveTripPeople(template: ItineraryTemplate, ctx?: TemplateTripContext) {
  if (ctx?.people != null) return Math.max(1, ctx.people)
  return Math.max(1, Math.round((template.peopleMin + template.peopleMax) / 2))
}

function citiesFromDays(days: AuthoredDay[]) {
  const out: string[] = []
  for (const day of days) {
    const last = out[out.length - 1]
    if (!last || !samePlace(last, day.city)) out.push(day.city)
  }
  return out
}

export function buildTemplateItinerary(
  template: ItineraryTemplate,
  ctx: TemplateTripContext = {},
): TemplateTrip {
  const authored = getAuthoredPlan(template.id)
  if (!authored) {
    throw new Error(`No authored itinerary for template “${template.id}”.`)
  }

  const people = resolveTripPeople(template, ctx)
  const days: TemplateDayPlan[] = []
  const transfers: TemplateTransfer[] = []
  const tradeoffs: string[] = []
  if (people >= 6 && template.section !== 'large-groups') {
    tradeoffs.push(`A party of ${people}: in-city days use a van or taxis, not a stack of scooters.`)
  }

  for (let i = 0; i < authored.days.length; i++) {
    const script = authored.days[i]!
    const prev = authored.days[i - 1]
    const next = authored.days[i + 1]
    const dayNum = i + 1
    const firstInCity = !prev || !samePlace(prev.city, script.city)
    const lastInCity = !next || !samePlace(next.city, script.city)
    const travelOut = Boolean(next && lastInCity)
    const stayRef = authored.stayByCity?.[script.city]
    const periods = emptyPeriods()
    const openNotes: TemplateDayPlan['openNotes'] = {}
    const move = localMoveFor(script.city, people, template.section)

    applyPeriod(periods, openNotes, script.morning, dayNum, script.city, 'morning')
    applyPeriod(periods, openNotes, script.afternoon, dayNum, script.city, 'afternoon')
    applyPeriod(periods, openNotes, script.evening, dayNum, script.city, 'evening')

    if (firstInCity) {
      periods.evening.push(staySlot(script.city, dayNum, 'evening', '16:30', 'stay', stayRef))
    } else if (!travelOut) {
      periods.night.push(staySlot(script.city, dayNum, 'night', '21:30', 'stay-night', stayRef))
    }

    if (script.night === 'free') {
      openNotes.night = 'Unscheduled night — walk, a drink, or sleep when you are done.'
    } else if (script.night && script.night !== 'stay') {
      openNotes.night = script.night
    } else if (travelOut) {
      openNotes.night = 'Travel evening — pack light and sleep when you land.'
    }

    if (travelOut && next) {
      const longHop = isLongHop(script.city, next.city)
      transfers.push({
        afterDay: dayNum,
        from: script.city,
        to: next.city,
        slot: transferSlot(
          script.city,
          next.city,
          template.section,
          longHop ? 'morning' : 'evening',
          dayNum,
          people,
        ),
      })
    }

    for (const period of PERIODS) {
      periods[period].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
    }

    days.push({
      day: dayNum,
      city: script.city,
      theme: script.theme,
      blurb: script.blurb,
      localMove: {
        id: slotId('local-move', dayNum, cityKey(script.city)),
        kind: 'local-move',
        period: 'morning',
        timeLabel: 'In the city',
        name: move.name,
        city: script.city,
        reason: move.reason,
        icon: move.icon,
        durationLabel: move.durationLabel,
      },
      periods,
      openNotes,
    })
  }

  return {
    typicalDays: authored.days.length,
    people,
    rankInSection: rankInSection(template),
    keptCities: citiesFromDays(authored.days),
    tradeoffs,
    transfers,
    days,
  }
}

export function peopleLabel(template: ItineraryTemplate, people?: number) {
  if (people != null) return people === 1 ? '1 person' : `${people} people`
  if (template.peopleMin === template.peopleMax) {
    return template.peopleMin === 1 ? '1 person' : `${template.peopleMin} people`
  }
  return `${template.peopleMin}–${template.peopleMax} people`
}

export function periodList(): PeriodId[] {
  return PERIODS
}

export function paceLabel(pace: ItineraryTemplate['pace']) {
  if (pace === 'relaxed') return 'Relaxed'
  if (pace === 'packed') return 'Maximum'
  return 'Mix'
}

export function daysLabel(days: number, requested?: number | null) {
  if (requested != null && requested >= FOUR_PLUS_WEEKS_DAYS) return '4+ weeks'
  if (days === 1) return '1 day'
  return `${days} days`
}
