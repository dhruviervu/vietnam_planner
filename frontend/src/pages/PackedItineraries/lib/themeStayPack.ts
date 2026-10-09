import { SIGHT_CATALOG, getExperienceById } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES, getActivityById } from '../../PlanBuilder/data/activities'
import { SHOPPING_ITEMS } from '../../PlanBuilder/data/shopping'
import { rankCityExperiences } from '../../PlanBuilder/services/cityCatalog'
import { catalogHoursForSourceId, cityDayHostsFullVisit, planCityStay } from '../../PlanBuilder/lib/yourVietnam/dayAllocation'
import { isAtomicExclusive, parentTourIdOf, alternativesOf, complexFor, memberFor } from '../../PlanBuilder/lib/yourVietnam/sightIntelligence'
import { spanDays } from '../../PlanBuilder/lib/yourVietnam/itemKind'
import { catalogHoursForSource, earliestOpenAt, sightClosedAtTime } from '../../PlanBuilder/lib/yourVietnam/openingHours'
import { DAY_CLOSE, EVENING_EARLIEST_START } from '../../PlanBuilder/lib/yourVietnam/dayWindows'
import { groupIdForSourceId, timePreferenceForSourceId } from '../../PlanBuilder/lib/yourVietnam/sightTiming'
import { resolvePlaceId } from '../../PlanBuilder/lib/yourVietnam/cityPins'
import { formatClock } from '../../PlanBuilder/lib/yourVietnam/clockTimes'
import type { PeriodId } from '../../PlanBuilder/lib/yourVietnam/types'
import { CITY_STAY_CORES } from '../data/cityStayCores'

export type StayTheme = 'packed' | 'relaxed' | 'luxury' | 'fun' | 'nightlife' | 'slow'

export const STAY_THEMES: StayTheme[] = ['packed', 'relaxed', 'luxury', 'fun', 'nightlife', 'slow']

/** Hours of idle time between two unhurried sights (lunch, pool, café, spa). */
export const SLOW_GAP_HOURS = 2.5
/** Relaxed and slow days never start a sight before this. Opening at 07:00 is not a 07:00 start. */
export const RELAXED_DAY_START = 10

export const THEME_PACE: Record<
  StayTheme,
  { minHours: number; maxHours: number; minStops: number; maxStops: number }
> = {
  packed: { minHours: 6, maxHours: 8, minStops: 5, maxStops: 8 },
  relaxed: { minHours: 3.2, maxHours: 6, minStops: 3, maxStops: 5 },
  luxury: { minHours: 4, maxHours: 6.5, minStops: 3, maxStops: 5 },
  fun: { minHours: 5, maxHours: 8, minStops: 4, maxStops: 7 },
  nightlife: { minHours: 4.5, maxHours: 7, minStops: 4, maxStops: 7 },
  slow: { minHours: 3.2, maxHours: 6, minStops: 3, maxStops: 4 },
}

const NIGHT_RE = /night|lantern|bia.?hoi|karaoke|rooftop|speakeasy|sunset|after.?dark|train-street|walking|promenade|skydeck|skyline|grand-world|dragon-bridge/
const RELAX_RE = /lake|beach|pagoda|garden|spa|mud|sunset|monastery|village|walk|circuit|island|cove|pool/
const SPA_RE = /massage|herbal (foot|bath|spa)|mud bath|onsen|wellness|\bspa\b|foot bath|hot spring/
const LUXE_RE = /opera|palace|museum|spa|cruise|skydeck|villa|cove|peninsula|fine.?art|citadel|literature|west-lake/
const FUN_RE = /adventure|boat|kayak|trek|cable|park|island|basket|vespa|jeep|class|workshop|beach|bridge|waterfall/
const BACKPACKER_RE = /train-street|bia.?hoi|hostel|backpack/

function cityKeys(city: string): string[] {
  if (city === 'Hoi An') return ['Hoi An', 'Near Hoi An']
  if (city === 'Ho Chi Minh City') return ['Ho Chi Minh City', 'Saigon']
  if (city === 'Can Tho') return ['Can Tho', 'Mekong']
  return [city]
}

function isCityMatch(itemCity: string | undefined, city: string) {
  if (!itemCity) return false
  const fold = (s: string) => s.trim().toLowerCase()
  return cityKeys(city).some((k) => fold(itemCity) === fold(k))
}

function placeIdForCity(city: string) {
  return resolvePlaceId(city) ?? 'hanoi'
}

function billedHours(id: string) {
  return catalogHoursForSourceId(id)
}

function blobOf(id: string) {
  const exp = getExperienceById(id)
  if (exp) return `${exp.id} ${exp.name} ${exp.category} ${exp.tags.join(' ')} ${exp.bestTime} ${exp.signal}`
  const act = getActivityById(id)
  if (act) return `${act.id} ${act.name} ${act.kind} ${act.tags.join(' ')} ${act.bestTime} ${act.vibe}`
  const shop = SHOPPING_ITEMS.find((s) => s.id === id)
  if (shop) return `${shop.id} ${shop.name} ${shop.type} ${shop.blurb}`
  return id
}

export function isSpaRelaxationId(id: string) {
  const text = blobOf(id).toLowerCase()
  if (/zipline|dark.?cave|trek|national park|overnight/.test(text)) return false
  return SPA_RE.test(text)
}

export function bestPeriodForSource(id: string): Exclude<PeriodId, 'night'> {
  const blob = blobOf(id).toLowerCase()
  if (/dawn|sunrise|tai.?chi|early morning/i.test(blob)) return 'morning'
  const pref = timePreferenceForSourceId(id)
  if (pref === 'EVENING') return 'evening'
  if (pref === 'MORNING') return 'morning'
  if (pref === 'AFTERNOON') return 'afternoon'
  const exp = getExperienceById(id)
  if (exp?.slotQuality) {
    const { morning, afternoon, evening } = exp.slotQuality
    if (evening >= morning && evening >= afternoon && evening >= 4) return 'evening'
    if (morning >= afternoon && morning >= evening) return 'morning'
    if (afternoon >= evening) return 'afternoon'
    return 'evening'
  }
  const act = getActivityById(id)
  if (act?.timePreference === 'EVENING') return 'evening'
  if (act?.timePreference === 'MORNING') return 'morning'
  if (act?.timePreference === 'AFTERNOON') return 'afternoon'
  if (NIGHT_RE.test(id) || NIGHT_RE.test(blobOf(id).toLowerCase())) return 'evening'
  return 'afternoon'
}

export function themeScore(id: string, theme: StayTheme): number {
  const exp = getExperienceById(id)
  const act = getActivityById(id)
  const shop = SHOPPING_ITEMS.find((s) => s.id === id)
  const text = blobOf(id).toLowerCase()
  let n = 0
  if (theme === 'packed') {
    if (exp?.signal === 'must-do' || exp?.popularityTag === 'Must do') n += 8
    if (exp?.paceAffinity.includes('packed')) n += 3
    n += Math.max(0, 6 - (exp?.popularityRank ?? 12) / 8)
    if (shop) n += 1
  }
  if (theme === 'relaxed') {
    if (exp?.paceAffinity.includes('relaxed')) n += 6
    if (exp?.signal === 'slow-scenic') n += 8
    if (exp?.category === 'Beaches' || exp?.category === 'Nature') n += 5
    if (RELAX_RE.test(text)) n += 4
    if (isSpaRelaxationId(id)) n += 12
    if (exp?.category === 'Adventure' || FUN_RE.test(id)) n -= 4
    if (NIGHT_RE.test(text) && !/sunset|lantern|lake/.test(text)) n -= 3
    if (act?.kind === 'beach' || act?.kind === 'community') n += 3
    if (act?.kind === 'adventure') n -= 2
  }
  if (theme === 'luxury') {
    if (exp?.budgetBand === 'luxury') n += 10
    if (exp?.budgetBand === 'premium') n += 6
    if (exp?.budgetBand === 'smart') n -= 4
    if (LUXE_RE.test(text)) n += 4
    if (BACKPACKER_RE.test(text)) n -= 8
    if (exp?.category === 'Nightlife' && /karaoke|bia/.test(text)) n -= 5
    if (act && (act.priceFromUsd ?? 0) >= 40) n += 3
    if (act?.kind === 'workshop' || act?.kind === 'class') n += 2
  }
  if (theme === 'fun') {
    if (exp?.category === 'Adventure' || exp?.signal === 'adventure') n += 7
    if (FUN_RE.test(text)) n += 4
    if (act?.kind === 'adventure' || act?.kind === 'sport' || act?.kind === 'class') n += 6
    if (act?.kind === 'workshop' || act?.kind === 'craft') n += 4
    if (exp?.popularityTag === 'Unique') n += 2
  }
  if (theme === 'nightlife') {
    if (isAtomicExclusive(id) || billedHours(id) >= 4.5) n -= 20
    if (timePreferenceForSourceId(id) === 'EVENING') n += 10
    if (exp?.category === 'Nightlife') n += 8
    if (NIGHT_RE.test(text)) n += 6
    if (act?.kind === 'music' || act?.kind === 'dance' || act?.kind === 'food') n += 7
    if (exp?.slotQuality && exp.slotQuality.evening >= 4) n += 4
    if (timePreferenceForSourceId(id) === 'MORNING' && !RELAX_RE.test(text)) n -= 2
  }
  if (theme === 'slow') {
    if (exp?.paceAffinity.includes('relaxed')) n += 8
    if (exp?.signal === 'slow-scenic') n += 10
    if (exp?.category === 'Beaches' || exp?.category === 'Nature') n += 7
    if (/cruise|boat|bay|beach|lake|pagoda|garden|village|island|sunset|river|spa/.test(text)) n += 6
    if (isSpaRelaxationId(id)) n += 14
    if (isAtomicExclusive(id) && billedHours(id) >= 4.5) n -= 20
    if (exp?.category === 'Adventure' && !/boat|kayak|bike/.test(text)) n -= 6
    if (act?.kind === 'beach' || act?.kind === 'community') n += 4
    if (act?.kind === 'adventure' || act?.kind === 'sport') n -= 3
    if (NIGHT_RE.test(text) && !/sunset|lantern|lake|beach/.test(text)) n -= 4
  }
  return n
}

const ACTIVITY_CITY: Record<string, string> = {
  Hanoi: 'hanoi',
  'Ho Chi Minh City': 'hcmc',
  'Da Nang': 'da-nang',
  'Hoi An': 'hoi-an',
  Hue: 'hue',
  'Da Lat': 'da-lat',
  'Nha Trang': 'nha-trang',
  'Phu Quoc': 'phu-quoc',
  Sapa: 'sapa',
  'Ninh Binh': 'ninh-binh',
  'Ha Long': 'ha-long',
  'Cat Ba': 'cat-ba',
  'Ha Giang': 'ha-giang',
  'Phong Nha': 'phong-nha',
  'Can Tho': 'can-tho',
}

function activitiesForCity(city: string) {
  const id = ACTIVITY_CITY[city]
  return CITY_ACTIVITIES.filter((a) => a.cityId === id || isCityMatch(a.cityName, city))
}

export function themedSightPool(city: string, theme: StayTheme, days: number): string[] {
  const ranked = rankCityExperiences(SIGHT_CATALOG.filter((e) => isCityMatch(e.city, city)))
  const shops = SHOPPING_ITEMS.filter((s) => isCityMatch(s.city, city) || isCityMatch(s.region, city))
  const cores = CITY_STAY_CORES[city] ?? []
  const out: string[] = []
  const groups = new Set<string>()
  const consider = (id: string) => {
    if (!id || out.includes(id)) return
    if (spanDays(getExperienceById(id)?.durationHours) > 1) return
    if (parentTourIdOf(id)) return
    if (alternativesOf(id).some((alt) => out.includes(alt))) return
    if (theme === 'nightlife' && (isAtomicExclusive(id) || billedHours(id) >= 4.5)) return
    if ((theme === 'relaxed' || theme === 'luxury') && isAtomicExclusive(id)) return
    if (theme === 'slow' && (isAtomicExclusive(id) || billedHours(id) >= 4.5)) return
    if (theme === 'slow' && SHOPPING_ITEMS.some((s) => s.id === id)) return
    const group = groupIdForSourceId(id)
    if (groups.has(group)) return
    out.push(id)
    groups.add(group)
  }
  for (const id of cores) consider(id)
  for (const sight of ranked) consider(sight.id)
  for (const shop of shops) consider(shop.id)
  const cap = Math.max(14, days * 8 + 8)
  if (theme === 'packed') return out.slice(0, cap)
  return out
    .map((id) => ({ id, n: themeScore(id, theme) }))
    .sort((a, b) => b.n - a.n || out.indexOf(a.id) - out.indexOf(b.id))
    .map((row) => row.id)
    .slice(0, cap)
}

export function themedActivityPool(city: string, theme: StayTheme): string[] {
  return activitiesForCity(city)
    .map((a) => ({ id: a.id, n: themeScore(a.id, theme) }))
    .filter((row) => row.n > 0 || theme === 'fun')
    .sort((a, b) => b.n - a.n)
    .map((row) => row.id)
}

function dayHours(ids: string[]) {
  return ids.filter((id) => !parentTourIdOf(id)).reduce((sum, id) => sum + billedHours(id), 0)
}

function isUnhurried(theme: StayTheme) {
  return theme === 'slow' || theme === 'relaxed'
}

function exclusiveDay(ids: string[]) {
  return ids.some((id) => isAtomicExclusive(id) || billedHours(id) >= 4.5)
}

function needsFill(ids: string[], theme: StayTheme) {
  const spec = THEME_PACE[theme]
  if (isUnhurried(theme)) return ids.length < spec.minStops
  if (exclusiveDay(ids)) return false
  if (ids.length >= spec.maxStops) return false
  if (dayHours(ids) >= spec.minHours && ids.length >= spec.minStops) return false
  return true
}

function takeNextFill(
  day: string[],
  rest: string[],
  spec: (typeof THEME_PACE)[StayTheme],
  placeId: ReturnType<typeof placeIdForCity>,
  unhurriedFill: boolean,
) {
  return rest.findIndex((id) => {
    if (day.includes(id)) return false
    if (day.length >= spec.maxStops) return false
    if (unhurriedFill) return !exclusiveDay([id]) || day.length === 0
    if (dayHours(day) + billedHours(id) > spec.maxHours + 0.6) return false
    if (exclusiveDay([id]) && day.length) return false
    return cityDayHostsFullVisit([...day, id], placeId)
  })
}

function trimStayDays(rows: string[][], theme: StayTheme): string[][] {
  const spec = THEME_PACE[theme]
  if (theme === 'packed') return rows
  return rows.map((row) => {
    if (!isUnhurried(theme) && exclusiveDay(row)) return row.slice(0, 1)
    const out: string[] = []
    let hours = 0
    for (const id of row) {
      if (out.length >= spec.maxStops) break
      const h = billedHours(id)
      if (out.length >= spec.minStops && hours + h > spec.maxHours + 0.4) break
      out.push(id)
      hours += h
    }
    if (isUnhurried(theme) && out.length < spec.minStops) {
      for (const id of row) {
        if (out.includes(id)) continue
        out.push(id)
        if (out.length >= spec.minStops) break
      }
    }
    return out.length ? out : row.slice(0, spec.minStops)
  })
}

/** Push leftover high-ROI stops onto days that are still short of a full clock. */
export function fillStayDays(city: string, rows: string[][], pool: string[], theme: StayTheme): string[][] {
  const out = rows.map((row) => [...row])
  const used = new Set(out.flat())
  const rest = pool.filter((id) => id && !used.has(id) && !parentTourIdOf(id))
  const placeId = placeIdForCity(city)
  const spec = THEME_PACE[theme]

  for (let i = 0; i < out.length; i++) {
    if (exclusiveDay(out[i])) continue
    let guard = 0
    while (needsFill(out[i], theme) && rest.length && guard < 24) {
      guard += 1
      const idx = takeNextFill(
        out[i],
        rest,
        spec,
        placeId,
        isUnhurried(theme) && out[i].length < spec.minStops,
      )
      if (idx < 0) break
      const next = rest.splice(idx, 1)[0]
      out[i].push(next)
      used.add(next)
    }
  }
  return out
}

export function ensureStayDays(
  city: string,
  rows: string[][],
  pool: string[],
  want: number,
  theme: StayTheme,
): string[][] {
  const trimmed = trimStayDays(rows.filter((row) => row.length > 0).slice(0, want), theme)
  const out = [...trimmed]
  while (out.length < want) {
    const used = new Set(out.flat())
    const extra = pool.filter((id) => id && !used.has(id) && !parentTourIdOf(id)).slice(0, THEME_PACE[theme].minStops)
    if (!extra.length) break
    out.push(extra)
  }
  if (!out.length && pool.length) out.push(pool.slice(0, THEME_PACE[theme].minStops))
  return fillStayDays(city, out, pool, theme)
}

export function packThemedStayDays(city: string, days: number, theme: StayTheme): string[][] {
  if (isUnhurried(theme)) return packUnhurriedStayDays(city, days, theme)
  const want = Math.max(1, days)
  const pool = themedSightPool(city, theme, want)
  const cap = THEME_PACE[theme].maxStops * want + 4
  const sliced = pool.slice(0, Math.max(cap, want * 4))
  const packed = planCityStay(sliced, placeIdForCity(city), undefined, { targetDays: want }).days.filter(
    (row) => row.length > 0,
  )
  const rows = packed.length ? packed.slice(0, want) : [sliced.slice(0, THEME_PACE[theme].maxStops)]
  return padToMinStops(city, weaveSpaStops(city, ensureStayDays(city, rows, pool, want, theme), theme), theme)
}

export function stayThemeForSection(section: string): StayTheme {
  if (section === 'nightlife') return 'nightlife'
  if (section === 'fun' || section === 'friends') return 'fun'
  if (section === 'luxury') return 'luxury'
  if (section === 'slow') return 'slow'
  if (section === 'relaxed' || section === 'reset' || section === 'couples' || section === 'beaches') {
    return 'relaxed'
  }
  return 'packed'
}

/**
 * Geographic unhurried days (slow + relaxed). Three outings from 10:00,
 * clustered the way a published city guide would: Imperial City in the morning,
 * Perfume River boat (with Thiên Mụ as a landing) after 15:00, tombs on a
 * separate countryside day. Inner halls/pagodas are not extra taxi stops.
 */
export const SLOW_DAY_FLOW: Record<string, string[][]> = {
  Hanoi: [
    ['hoan-kiem-lake', 'old-quarter', 'egg-coffee'],
    ['temple-literature', 'west-lake', 'tran-quoc-pagoda'],
    ['ethnology-museum', 'st-joseph-cathedral', 'train-street'],
    ['hoa-lo-prison', 'one-pillar-pagoda', 'egg-coffee'],
  ],
  'Ho Chi Minh City': [
    ['notre-dame-saigon', 'independence-palace', 'nguyen-hue-walking'],
    ['war-remnants', 'ben-thanh', 'bitexco-skydeck'],
    ['cho-lon', 'nguyen-hue-walking', 'ben-thanh'],
  ],
  'Ha Long': [
    ['bai-chay-beach', 'ha-long-flower-park', 'loi-am-pagoda'],
    ['tuan-chau-island', 'ha-long-market', 'bai-chay-bridge'],
    ['quang-ninh-museum', 'bai-tho-mountain', 'long-tien-pagoda'],
  ],
  'Ninh Binh': [
    ['hoa-lu', 'tam-coc-boats', 'mua-cave'],
    ['trang-an-boats', 'bich-dong-pagoda', 'thai-vi-temple'],
    ['van-long', 'bai-dinh', 'thung-nham'],
  ],
  Hue: [
    ['hue-citadel', 'perfume-river', 'dong-ba-market'],
    ['tu-duc-tomb', 'khai-dinh-tomb', 'vong-canh-hill'],
    ['minh-mang-tomb', 'hue-incense-craft', 'hue-cyclo-food'],
    ['an-dinh-palace', 'hue-ao-dai-photo', 'hue-an-dinh-walk'],
  ],
  'Hoi An': [
    ['hoi-an-ancient-town', 'an-bang', 'hoi-an-lanterns'],
    ['cam-thanh-basket-boats', 'tra-que-village', 'ha-herbal-massage'],
    ['thanh-ha-pottery', 'kim-bong-village', 'ha-lantern-make'],
    ['an-bang', 'cam-thanh-basket-boats', 'hoi-an-lanterns'],
  ],
  'Da Nang': [
    ['da-nang-beach', 'son-tra', 'dragon-bridge'],
    ['marble-mountains', 'da-nang-beach', 'dragon-bridge'],
    ['son-tra', 'da-nang-beach', 'han-river-bridge'],
    ['marble-mountains', 'da-nang-beach', 'dragon-bridge'],
  ],
  'Nha Trang': [
    ['nha-trang-beach', 'po-nagar', 'nha-trang-promenade'],
    ['i-resort-mud-bath', 'long-son-pagoda', 'nha-trang-cathedral'],
    ['po-nagar', 'nha-trang-promenade', 'nha-trang-beach'],
    ['i-resort-mud-bath', 'nha-trang-promenade', 'nha-trang-beach'],
  ],
  'Da Lat': [
    ['xuan-huong-lake', 'valley-of-love', 'linh-phuoc-pagoda'],
    ['tuyen-lam-lake', 'da-lat-market', 'da-lat-night-market'],
    ['datanla-waterfall', 'xuan-huong-lake', 'da-lat-night-market'],
    ['valley-of-love', 'linh-phuoc-pagoda', 'tuyen-lam-lake'],
  ],
  Sapa: [
    ['cat-cat-village', 'sapa-stone-church', 'sapa-market'],
    ['muong-hoa-valley', 'lao-chai-village', 'sp-red-dao-bath'],
    ['ham-rong-mountain', 'ta-van-village', 'sapa-stone-church'],
    ['cat-cat-village', 'sapa-market', 'muong-hoa-valley'],
  ],
  'Phu Quoc': [
    ['long-beach-pq', 'dinh-cau', 'kiss-bridge'],
    ['sao-beach', 'hon-thom-cable', 'phu-quoc-sunset'],
    ['long-beach-pq', 'duong-dong-night-market', 'dinh-cau'],
    ['sao-beach', 'kiss-bridge', 'pq-versailles-spa'],
  ],
  'Cat Ba': [
    ['cat-co-1', 'cat-ba-square', 'cat-ba-market'],
    ['cat-co-2', 'cat-ba-cable-car', 'cat-ba-night-market'],
    ['cat-co-1', 'cat-ba-square', 'cat-ba-night-market'],
  ],
  'Can Tho': [
    ['ninh-kieu-wharf', 'chua-ong-can-tho', 'binh-thuy-ancient-house'],
    ['ninh-kieu-love-bridge', 'ninh-kieu-wharf', 'chua-ong-can-tho'],
    ['binh-thuy-ancient-house', 'ninh-kieu-love-bridge', 'chua-ong-can-tho'],
  ],
}

function existsInCity(id: string, city: string) {
  const exp = getExperienceById(id)
  if (exp) return isCityMatch(exp.city, city) || isCityMatch(exp.region, city)
  const act = getActivityById(id)
  if (act) return act.cityId === ACTIVITY_CITY[city] || isCityMatch(act.cityName, city)
  return SHOPPING_ITEMS.some((s) => s.id === id && (isCityMatch(s.city, city) || isCityMatch(s.region, city)))
}

/** Inner stop whose parent outing is already on this day — clock it on the parent, not as a taxi hop. Soft evening cards (lanterns) stay their own outing. */
export function isCompanionOnDay(id: string, ids: string[]) {
  const parent = parentTourIdOf(id)
  if (!parent || !ids.includes(parent)) return false
  if (memberFor(id)?.soft) return false
  return true
}

export function independentUnhurriedStops(ids: string[]) {
  return ids.filter((id) => !isCompanionOnDay(id, ids))
}

function trimUnhurriedRow(ids: string[], theme: StayTheme) {
  const unique = ids.filter((id, i) => ids.indexOf(id) === i)
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of unique) {
    if (ownsSlowDay(id)) continue
    if (isCompanionOnDay(id, unique) && !memberFor(id)?.soft) continue
    const group = groupIdForSourceId(id)
    if (seen.has(group) && !memberFor(id)?.soft) continue
    seen.add(group)
    out.push(id)
    if (out.length >= THEME_PACE[theme].maxStops) break
  }
  return out
}

function attachOutingLandings(row: string[], city: string) {
  const extra: string[] = []
  for (const id of row) {
    const complex = complexFor(id)
    if (!complex || complex.parentId !== id) continue
    if (
      !(
        complex.access === 'boat' ||
        complex.access === 'day-trip' ||
        complex.access === 'cable' ||
        complex.exclusive
      )
    ) {
      continue
    }
    const landing = complex.members.find((member) => member.id !== id && !member.soft)
    if (!landing || row.includes(landing.id) || extra.includes(landing.id)) continue
    if (!existsInCity(landing.id, city)) continue
    extra.push(landing.id)
  }
  return extra.length ? [...row, ...extra] : row
}

/** Full-day water or trek outings own a slow day. A 90-minute basket boat does not. */
export function ownsSlowDay(id: string) {
  const hours = getActivityById(id) ? dwellHoursFor(id) : billedHours(id)
  if (hours >= 4.5) return true
  if (!isAtomicExclusive(id)) return false
  return billedHours(id) >= 4 || /cruise|overnight/.test(blobOf(id).toLowerCase())
}

export function packSlowStayDays(city: string, days: number): string[][] {
  return packUnhurriedStayDays(city, days, 'slow')
}

export function packUnhurriedStayDays(city: string, days: number, theme: StayTheme = 'slow'): string[][] {
  const packTheme = isUnhurried(theme) ? theme : 'slow'
  const want = Math.max(1, days)
  const spec = THEME_PACE[packTheme]
  const used = new Set<string>()
  const take = (id: string, row: string[] = []) => {
    if (!id || used.has(id) || !existsInCity(id, city)) return false
    const parent = parentTourIdOf(id)
    const soft = Boolean(memberFor(id)?.soft)
    if (parent && !soft && (used.has(parent) || row.includes(parent))) return false
    if (ownsSlowDay(id)) return false
    if (alternativesOf(id).some((alt) => used.has(alt))) return false
    used.add(id)
    return true
  }

  const curated = (SLOW_DAY_FLOW[city] ?? [])
    .map((row) => trimUnhurriedRow(row.filter((id) => take(id, row)), packTheme))
    .filter((row) => row.length > 0)

  const out = curated.slice(0, want)
  const pool = themedSightPool(city, packTheme, want).filter((id) => !used.has(id))
  while (out.length < want && pool.length) {
    const chunk: string[] = []
    while (chunk.length < spec.minStops && pool.length) {
      const next = pool.shift()!
      if (!take(next, chunk)) continue
      chunk.push(next)
    }
    if (!chunk.length) break
    out.push(trimUnhurriedRow(chunk, packTheme))
  }
  const filled = ensureStayDays(city, out, themedSightPool(city, packTheme, want), want, packTheme)
  const woven = padToMinStops(city, weaveSpaStops(city, filled, packTheme), packTheme)
  return woven.map((row) => attachOutingLandings(row, city))
}

function shortSpaId(id: string) {
  return isSpaRelaxationId(id) && dwellHoursFor(id) < 4.5
}

function sourceKind(id: string): 'experience' | 'activity' | 'shopping' {
  if (getExperienceById(id)) return 'experience'
  if (getActivityById(id)) return 'activity'
  return 'shopping'
}

/** Lanterns stay evening. A 15:00–19:00 river boat is a late-afternoon outing, not nightlife. */
function isUnhurriedEvening(id: string) {
  if (isSpaRelaxationId(id)) return false
  const hours = catalogHoursForSource(sourceKind(id), id, 3)
  const open = hours.intervals?.[0]?.open
  if (open != null && open >= 14 && open < 17.5) return false
  if (timePreferenceForSourceId(id) === 'EVENING') return true
  return bestPeriodForSource(id) === 'evening'
}

function weaveSpaStops(city: string, rows: string[][], theme: StayTheme): string[][] {
  if (!isUnhurried(theme)) return rows
  const spec = THEME_PACE[theme]
  const used = new Set(rows.flat())
  const seen = new Set<string>()
  const spas = [
    ...activitiesForCity(city).map((a) => a.id),
    ...themedSightPool(city, theme, rows.length),
  ].filter((id) => {
    if (!shortSpaId(id) || used.has(id) || !existsInCity(id, city) || seen.has(id)) return false
    seen.add(id)
    return true
  })
  return rows.map((row) => {
    if (row.some(isSpaRelaxationId)) return row.slice(0, spec.maxStops)
    const spa = spas.shift()
    if (!spa) return row.slice(0, spec.maxStops)
    used.add(spa)
    const evening = row.filter((id) => isUnhurriedEvening(id)).slice(0, 1)
    const rest = row.filter((id) => !isUnhurriedEvening(id) && !isSpaRelaxationId(id))
    const coreCount = Math.max(0, spec.minStops - 1 - evening.length)
    const mixed = [...rest.slice(0, coreCount), ...evening, spa]
    return mixed.filter((id, i, arr) => arr.indexOf(id) === i).slice(0, spec.maxStops)
  })
}

function padToMinStops(city: string, rows: string[][], theme: StayTheme): string[][] {
  const spec = THEME_PACE[theme]
  const used = new Set(rows.flat())
  const extras = [
    ...themedSightPool(city, theme, rows.length),
    ...activitiesForCity(city).map((a) => a.id),
  ].filter((id) => id && !parentTourIdOf(id) && existsInCity(id, city))
  return rows.map((row) => {
    const out = [...row]
    const local = new Set(out)
    const take = (id: string) => {
      if (out.length >= spec.minStops || local.has(id)) return
      if (theme === 'slow' && ownsSlowDay(id)) return
      if (theme === 'relaxed' && ownsSlowDay(id)) return
      out.push(id)
      local.add(id)
      used.add(id)
    }
    for (const id of extras) {
      if (used.has(id) && !local.has(id)) continue
      take(id)
    }
    if (out.length < spec.minStops) {
      for (const id of extras) take(id)
    }
    return out.slice(0, spec.maxStops)
  })
}

function unhurriedOpenStart(id: string, after: number) {
  const evening = isUnhurriedEvening(id)
  const floor = evening ? Math.max(after, EVENING_EARLIEST_START) : Math.max(after, RELAXED_DAY_START)
  const hours = catalogHoursForSource(sourceKind(id), id, 3)
  const dur = Math.max(0.75, dwellHoursFor(id))
  let start = earliestOpenAt(hours, floor, dur, DAY_CLOSE)
  if (!Number.isFinite(start)) {
    start = earliestOpenAt(hours, Math.max(RELAXED_DAY_START, floor - 1), dur, DAY_CLOSE)
  }
  if (!Number.isFinite(start) || hours.closedToday) return floor
  if (sightClosedAtTime(hours, start)) return floor
  return Math.max(start, RELAXED_DAY_START)
}

/** Sequential 10:00 start, opening-hours aware, 2.5h gaps. Landings are clocked on the parent outing. */
export function timedUnhurriedStops(ids: string[], _theme: StayTheme) {
  const unique = ids.filter((id, i, arr) => id && arr.indexOf(id) === i)
  const independents = independentUnhurriedStops(unique)
  const spa = independents.filter(isSpaRelaxationId)
  const evening = independents.filter((id) => isUnhurriedEvening(id) && !isSpaRelaxationId(id))
  const rest = independents.filter((id) => !isSpaRelaxationId(id) && !isUnhurriedEvening(id))
  const ordered = [...rest, ...evening, ...spa]
  let after = RELAXED_DAY_START
  return ordered.map((id) => {
    const start = unhurriedOpenStart(id, after)
    const period: Exclude<PeriodId, 'night'> = start >= 17.5 ? 'evening' : start >= 13 ? 'afternoon' : 'morning'
    after = start + Math.max(0.75, dwellHoursFor(id)) + SLOW_GAP_HOURS
    return { id, time: formatClock(start), period }
  })
}

export function periodStartHour(period: PeriodId, theme: StayTheme) {
  if (period === 'morning') {
    if (theme === 'nightlife') return 10
    if (theme === 'slow' || theme === 'relaxed') return RELAXED_DAY_START
    if (theme === 'luxury') return 9.5
    return 9
  }
  if (period === 'afternoon') return theme === 'slow' || theme === 'relaxed' ? 14 : 13.5
  if (period === 'evening') {
    if (theme === 'nightlife') return 18.5
    if (theme === 'slow' || theme === 'relaxed') return 18
    return 17.75
  }
  return 21.5
}

export function splitIdsByBestTime(ids: string[]): Record<'morning' | 'afternoon' | 'evening', string[]> {
  const buckets: Record<'morning' | 'afternoon' | 'evening', string[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  }
  for (const id of ids) buckets[bestPeriodForSource(id)].push(id)
  if (!buckets.morning.length && buckets.afternoon.length > 1) {
    buckets.morning = buckets.afternoon.splice(0, Math.ceil(buckets.afternoon.length / 2))
  }
  if (!buckets.afternoon.length && buckets.morning.length > 2) {
    buckets.afternoon = buckets.morning.splice(Math.ceil(buckets.morning.length / 2))
  }
  const late = (id: string) =>
    /karaoke|speakeasy|crawl|bia.?hoi|night market|flower|pub|bar hop|train-street/i.test(`${id} ${blobOf(id)}`)
  buckets.evening.sort((a, b) => Number(late(a)) - Number(late(b)))
  return buckets
}

export function clockForIndex(period: PeriodId, index: number, theme: StayTheme, previousEnd?: number) {
  const unhurried = theme === 'slow' || theme === 'relaxed'
  if (previousEnd != null && Number.isFinite(previousEnd)) {
    const gap = unhurried ? SLOW_GAP_HOURS : 10 / 60
    return formatClock(Math.max(previousEnd + gap, unhurried ? RELAXED_DAY_START : periodStartHour(period, theme)))
  }
  const spacing = unhurried ? SLOW_GAP_HOURS : 1.15
  const floor = unhurried && period === 'morning' ? RELAXED_DAY_START : periodStartHour(period, theme)
  return formatClock(floor + index * spacing)
}

export function dwellHoursFor(id: string) {
  const exp = getExperienceById(id)
  if (exp?.durationHours) return Math.max(0.5, exp.durationHours)
  const act = getActivityById(id)
  if (act?.durationLabel) {
    const m = act.durationLabel.match(/(\d+(?:\.\d+)?)/)
    if (m) {
      const n = Number(m[1])
      return /min/i.test(act.durationLabel) ? n / 60 : n
    }
  }
  return billedHours(id) || 1
}

export function themeBlurb(city: string, theme: StayTheme, names: string[]) {
  const listed = names.slice(0, 5).join(', ')
  if (theme === 'slow') {
    return `${city} at an unhurried clip: ${listed || 'three well-spaced stops'}. First sight at 10:00, two to four hours between them — spa or a soak when the city lists one.`
  }
  if (theme === 'relaxed') {
    return `${city} at walking speed: ${listed}. First stop at 10:00, room between sights, evenings allowed to stay kind — massage if it’s on the list.`
  }
  if (theme === 'luxury') {
    return `A polished ${city} day: ${listed}. Private cars between stops, one serious table, and no backpacker crawl.`
  }
  if (theme === 'fun') {
    return `A full ${city} play day: ${listed}. Book the class or the boat, then keep moving.`
  }
  if (theme === 'nightlife') {
    return `${city} after dark, with just enough daylight: ${listed}. Stack the night market, a show, and a late walk — sleep in is allowed.`
  }
  return `Packed ${city}: ${listed}.`
}

export function themeDayTitle(city: string, theme: StayTheme, index: number) {
  const labels: Record<StayTheme, string[]> = {
    packed: ['Must-dos', 'Second cluster', 'Further out'],
    relaxed: ['Soft landing', 'Water and shade', 'One more loop'],
    luxury: ['The polished core', 'A private outing', 'Slow finish'],
    fun: ['Play the city', 'Booked adventure', 'Last hurrah'],
    nightlife: ['Ease in, go out', 'Daylight, then dark', 'Late city'],
    slow: ['Three unhurried stops', 'Water, then a soak', 'Another neighbourhood', 'Leave the evening kind'],
  }
  return `${city} · ${labels[theme][index] ?? `Day ${index + 1}`}`
}

export function pickActivitiesForDays(
  city: string,
  theme: StayTheme,
  dayCount: number,
  taken: Set<string>,
): string[][] {
  if (theme === 'packed' || isUnhurried(theme)) return Array.from({ length: dayCount }, () => [])
  const pool = themedActivityPool(city, theme).filter((id) => !taken.has(id))
  const spaFirst = [...pool].sort((a, b) => Number(isSpaRelaxationId(b)) - Number(isSpaRelaxationId(a)))
  const perDay = theme === 'nightlife' || theme === 'fun' ? 2 : 1
  const out: string[][] = Array.from({ length: dayCount }, () => [])
  let i = 0
  for (const id of spaFirst) {
    if (out.every((row) => row.length >= perDay)) break
    while (i < dayCount && out[i % dayCount].length >= perDay) i += 1
    if (i >= dayCount * perDay) break
    const day = i % dayCount
    out[day].push(id)
    taken.add(id)
    i += 1
  }
  return out
}
