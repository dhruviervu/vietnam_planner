import { ACTIVITY_OWNED_SIGHT_IDS, EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { RESTAURANTS as PLAN_RESTAURANTS } from '../../data/restaurants'
import { DESTINATIONS } from '../../../BringHome/data/destinations'
import { RESTAURANTS as TASTE_RESTAURANTS } from '../../../TasteOfVietnam/data/restaurants'
import { placeOpeningHoursRow } from '../../data/placeOpeningHours'
import type { ItineraryItem, PeriodId } from './types'
import { PERIOD_WINDOW } from './dayWindows'

export type HoursInterval = { open: number; close: number }

export type PlaceHours = {
  intervals: HoursInterval[] | null
  alwaysOpen: boolean
  closedToday: boolean
  unknown: boolean
  label: string
  source: 'live' | 'catalog'
  /** Recurring closures Google/OSM mention beyond the weekly grid (e.g. first Monday). */
  exceptionNote?: string
}

const DAY_NAME: Record<string, number> = {
  su: 0,
  sun: 0,
  sunday: 0,
  mo: 1,
  mon: 1,
  monday: 1,
  tu: 2,
  tue: 2,
  tues: 2,
  tuesday: 2,
  we: 3,
  wed: 3,
  wednesday: 3,
  th: 4,
  thu: 4,
  thur: 4,
  thursday: 4,
  fr: 5,
  fri: 5,
  friday: 5,
  sa: 6,
  sat: 6,
  saturday: 6,
}

export function weekdayFromIso(isoDate: string): number {
  if (!isoDate) return new Date().getDay()
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return new Date().getDay()
  return d.getDay()
}

export function tripIsoDate(startDate: string, dayNumber: number): string {
  if (!startDate) return ''
  const d = new Date(`${startDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + Math.max(0, dayNumber - 1))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const ORDINAL: Record<string, number> = {
  first: 1,
  '1st': 1,
  second: 2,
  '2nd': 2,
  third: 3,
  '3rd': 3,
  fourth: 4,
  '4th': 4,
  last: -1,
}

function weekdayOccurrenceInMonth(isoDate: string): { weekday: number; nth: number; isLast: boolean } | null {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  const weekday = d.getDay()
  const y = d.getFullYear()
  const m = d.getMonth()
  const date = d.getDate()
  const nth = Math.ceil(date / 7)
  const lastThisMonth = new Date(y, m + 1, 0).getDate()
  const isLast = date + 7 > lastThisMonth
  return { weekday, nth, isLast }
}

/** Match notes like "Closed first Monday of each month". */
export function exceptionNoteClosedOnDate(notes: string[] | undefined, isoDate: string): string | null {
  if (!notes?.length || !isoDate) return null
  const occ = weekdayOccurrenceInMonth(isoDate)
  if (!occ) return null
  for (const note of notes) {
    const text = note.trim()
    if (!text) continue
    const m = text.match(
      /closed\s+(?:on\s+)?(?:the\s+)?(first|1st|second|2nd|third|3rd|fourth|4th|last)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
    )
    if (!m) continue
    const nth = ORDINAL[m[1].toLowerCase()]
    const day = DAY_NAME[m[2].toLowerCase().slice(0, 3)]
    if (day !== occ.weekday) continue
    if (nth === -1 && occ.isLast) return text
    if (nth === occ.nth) return text
  }
  return null
}

function withException(hours: PlaceHours, note?: string): PlaceHours {
  if (!note) return hours
  return { ...hours, exceptionNote: hours.exceptionNote || note }
}

function anytime(label = 'Open all day', source: PlaceHours['source'] = 'catalog', extra?: { exceptionNote?: string }): PlaceHours {
  return {
    intervals: null,
    alwaysOpen: true,
    closedToday: false,
    unknown: false,
    label,
    source,
    exceptionNote: extra?.exceptionNote,
  }
}

function unknownHours(label = 'Hours vary', source: PlaceHours['source'] = 'catalog', extra?: { exceptionNote?: string }): PlaceHours {
  return {
    intervals: null,
    alwaysOpen: false,
    closedToday: false,
    unknown: true,
    label,
    source,
    exceptionNote: extra?.exceptionNote,
  }
}

function closedHours(label: string, source: PlaceHours['source'] = 'catalog', extra?: { exceptionNote?: string }): PlaceHours {
  return {
    intervals: [],
    alwaysOpen: false,
    closedToday: true,
    unknown: false,
    label,
    source,
    exceptionNote: extra?.exceptionNote,
  }
}

export function parseClockToken(raw: string): number | null {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(a\.?m\.?|p\.?m\.?)?$/i)
  if (!m) return null
  let h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  if (!Number.isFinite(h) || h > 24) return null
  const ap = m[3]
  if (ap) {
    const pm = ap.replace(/\./g, '').toLowerCase().startsWith('p')
    if (h === 12) h = pm ? 12 : 0
    else if (pm) h += 12
  }
  return Math.min(24, h + min / 60)
}

function parseTimePair(raw: string): HoursInterval | null {
  const m = raw
    .trim()
    .match(
      /(\d{1,2}(?::\d{2})?(?:\s*[ap]\.?m\.?)?)\s*[–\-to]+\s*(\d{1,2}(?::\d{2})?(?:\s*[ap]\.?m\.?)?)/i,
    )
  if (!m) return null
  const openTok = m[1]
  const closeTok = m[2]
  let open = parseClockToken(openTok)
  let close = parseClockToken(closeTok)
  if (open == null || close == null) return null
  const openHasAp = /[ap]\.?m/i.test(openTok)
  const closePm = /p\.?m/i.test(closeTok)
  // "1:30-5 pm" is afternoon; "9-5 pm" stays 09:00–17:00.
  if (!openHasAp && closePm && open > 0 && open < 7) open += 12
  if (close <= open) close += 24
  return { open, close }
}

function expandDays(token: string): number[] {
  const t = token.trim().toLowerCase().replace(/\./g, '')
  if (!t || t === 'ph' || t === 'sh') return []
  if (t === 'weekdays' || t === 'wd') return [1, 2, 3, 4, 5]
  if (t === 'weekends' || t === 'we') return [0, 6]
  const range = t.split('-')
  if (range.length === 2) {
    const a = DAY_NAME[range[0]]
    const b = DAY_NAME[range[1]]
    if (a == null || b == null) return []
    const out: number[] = []
    let i = a
    while (true) {
      out.push(i)
      if (i === b) break
      i = (i + 1) % 7
    }
    return out
  }
  const one = DAY_NAME[t]
  return one == null ? [] : [one]
}

function parseDayTokens(raw: string): Set<number> | null {
  const days = new Set<number>()
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return null
  for (const part of parts) {
    const got = expandDays(part)
    if (got.length === 0) return null
    for (const d of got) days.add(d)
  }
  return days
}

/** OSM opening_hours subset used by Vietnam sights (ranges, off, 24/7). */
export function parseOsmOpeningHours(raw: string, weekday: number): PlaceHours {
  const text = raw.trim()
  if (!text) return unknownHours(raw, 'live')
  if (/^24\/7$/i.test(text) || /^24 hours$/i.test(text)) return anytime('Open 24 hours', 'live')

  const rules = text.split(';').map((r) => r.trim()).filter(Boolean)
  let intervals: HoursInterval[] = []
  let off = false
  let matched = false

  for (const rule of rules) {
    if (/^PH/i.test(rule) && !/Mo|Tu|We|Th|Fr|Sa|Su/i.test(rule)) continue
    const offMatch = rule.match(/^(.*?)(?:\s+)?off$/i)
    const timesChunk = offMatch ? '' : rule
    const split = timesChunk.match(/^(.*?)(\d{1,2}:\d{2}\s*[-–].*)$/)
    const dayPart = (offMatch ? offMatch[1] : split ? split[1] : rule.replace(/(\d{1,2}:\d{2}.*)/, '')).trim()
    const timePart = split ? split[2] : offMatch ? '' : rule.match(/(\d{1,2}:\d{2}.*)$/)?.[1] ?? ''
    const days = dayPart ? parseDayTokens(dayPart.replace(/[:].*$/, '')) : null
    const applies = !days || days.has(weekday)
    if (!applies) continue
    matched = true
    if (offMatch || /\boff\b/i.test(rule) && !timePart) {
      off = true
      intervals = []
      continue
    }
    off = false
    const spans = timePart.split(',').map((s) => s.trim())
    const found: HoursInterval[] = []
    for (const span of spans) {
      const pair = parseTimePair(span)
      if (pair) found.push(pair)
    }
    if (found.length) intervals = found
  }

  if (off && intervals.length === 0) return closedHours(text, 'live')
  if (intervals.length) {
    return {
      intervals,
      alwaysOpen: false,
      closedToday: false,
      unknown: false,
      label: text,
      source: 'live',
    }
  }
  if (matched) return unknownHours(text, 'live')
  const fallback = parseHoursLabel(text, weekday, 'live')
  return fallback.unknown ? unknownHours(text, 'live') : { ...fallback, source: 'live', label: text }
}

export function parseHoursLabel(
  raw: string,
  weekday: number,
  source: PlaceHours['source'] = 'catalog',
): PlaceHours {
  const text = raw.trim()
  if (!text) return unknownHours('', source)
  if (/anytime|always|open all day|24\/7/i.test(text)) return anytime(text, source)
  if (/daylight/i.test(text)) {
    return {
      intervals: [{ open: 8, close: 18 }],
      alwaysOpen: false,
      closedToday: false,
      unknown: false,
      label: text,
      source,
    }
  }
  if (/check (train|tour|times|days)/i.test(text) && !/\d/.test(text) && !/book/i.test(text)) {
    return unknownHours(text, source)
  }

  const closedDay = text.match(/closed\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*/i)
  if (closedDay) {
    const day = DAY_NAME[closedDay[1].toLowerCase().slice(0, 3)]
    if (day === weekday) return closedHours(text, source)
  }

  const pairRe = /(\d{1,2}(?::\d{2})?(?:\s*[ap]\.?m\.?)?)\s*[–\-to]+\s*(\d{1,2}(?::\d{2})?(?:\s*[ap]\.?m\.?)?)/gi
  const pairs: HoursInterval[] = []
  let match: RegExpExecArray | null
  const normalized = text.replace(/[–—]/g, '-')
  while ((match = pairRe.exec(normalized))) {
    const pair = parseTimePair(`${match[1]}-${match[2]}`)
    if (pair) pairs.push(pair)
  }
  if (!pairs.length) {
    const inferred = inferSessionWindows(text)
    if (inferred.length) {
      return {
        intervals: inferred,
        alwaysOpen: false,
        closedToday: false,
        unknown: false,
        label: text,
        source,
      }
    }
    return unknownHours(text, source)
  }
  if (/afternoon repeat/i.test(text) && !pairs.some((p) => p.open >= 13)) {
    pairs.push({ open: 13.5, close: 17 })
  }
  return {
    intervals: pairs,
    alwaysOpen: false,
    closedToday: false,
    unknown: false,
    label: text,
    source,
  }
}

function inferSessionWindows(text: string): HoursInterval[] {
  const t = text.toLowerCase()
  const evening = /evening|after dark|after dusk|night|sunset/.test(t)
  const morning = /morning|dawn|sunrise/.test(t)
  const afternoon = /afternoon|midday/.test(t)
  const booked = /book|class|departure|session|slot/.test(t)
  if (evening && afternoon) return [{ open: 16, close: 23 }]
  if (evening && !morning && !afternoon) return [{ open: 17.5, close: 22 }]
  if (morning || afternoon || booked || /daytime/.test(t)) return [{ open: 8, close: 18 }]
  return []
}

/** Tours, classes and other operator products must not inherit nearby shop hours. */
export function usesLiveVenueHours(kind: string, sourceId: string, name = ''): boolean {
  if (kind === 'shopping' || kind === 'meal') return true
  if (kind === 'activity') return false
  if (kind === 'experience') {
    if (ACTIVITY_OWNED_SIGHT_IDS.has(sourceId)) return false
    if (/\b(tour|class|workshop|snorkel|dive)\b/i.test(name) && /food|cook|street.?food|snorkel|dive/i.test(name)) {
      return false
    }
    return true
  }
  return false
}

/** Google Places weekdayDescriptions, typically "Monday: 6:00 AM – 6:00 PM". */
export function parseGoogleWeekdayDescriptions(
  lines: string[],
  weekday: number,
  source: PlaceHours['source'] = 'live',
): PlaceHours {
  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const want = names[weekday]
  const line = lines.find((l) => l.trim().toLowerCase().startsWith(want))
  if (!line) return unknownHours(lines.join('; '), source)
  if (/:\s*closed/i.test(line) || /\bclosed\b/i.test(line.split(':').slice(1).join(':'))) {
    return closedHours(line, source)
  }
  if (/open 24/i.test(line)) return anytime(line, source)
  return parseHoursLabel(line.replace(/^[^:]+:\s*/, ''), weekday, source)
}

function hoursFromGoogleRow(sourceId: string, weekday: number, isoDate?: string): PlaceHours | null {
  const row = placeOpeningHoursRow(sourceId)
  if (!row?.weekdayDescriptions?.length && !row?.alwaysOpen) return null
  const standingNote = row.exceptionNotes?.filter(Boolean).join(' · ')
  const dated = Boolean(isoDate)
  const exceptionHit = dated ? exceptionNoteClosedOnDate(row.exceptionNotes, isoDate ?? '') : null
  if (exceptionHit) {
    return closedHours(exceptionHit, 'catalog', { exceptionNote: standingNote || exceptionHit })
  }
  if (row.alwaysOpen) {
    return anytime(row.weekdayDescriptions?.join('; ') || 'Open 24 hours', 'catalog', {
      exceptionNote: standingNote,
    })
  }
  const parsed = parseGoogleWeekdayDescriptions(row.weekdayDescriptions, weekday, 'catalog')
  if (parsed.unknown && !parsed.closedToday && !parsed.alwaysOpen) return null
  const labeled = withException(
    { ...parsed, source: 'catalog', label: compactWeekdayDescriptions(row.weekdayDescriptions) },
    standingNote,
  )
  if (!dated) return { ...labeled, closedToday: false }
  return labeled
}

function intersectIntervals(
  a: HoursInterval[] | null | undefined,
  b: HoursInterval[] | null | undefined,
): HoursInterval[] {
  if (!a?.length || !b?.length) return []
  const out: HoursInterval[] = []
  for (const x of a) {
    for (const y of b) {
      const open = Math.max(x.open, y.open)
      const close = Math.min(x.close, y.close)
      if (close - open >= 0.2) out.push({ open, close })
    }
  }
  return out
}

/** Venue hours from Google, clamped to a booked activity's session windows when both exist. */
export function refineHoursWithGoogle(catalog: PlaceHours, google: PlaceHours | null): PlaceHours {
  if (!google) return catalog
  if (google.closedToday) return google
  if (google.unknown) return catalog
  if (catalog.closedToday) return catalog
  if (google.alwaysOpen) return catalog.unknown ? google : catalog
  if (catalog.alwaysOpen || catalog.unknown || !catalog.intervals?.length) return google
  if (!google.intervals?.length) return catalog
  const intervals = intersectIntervals(catalog.intervals, google.intervals)
  if (!intervals.length) return catalog
  return {
    intervals,
    alwaysOpen: false,
    closedToday: false,
    unknown: false,
    label: google.label || catalog.label,
    source: google.source,
  }
}

export function compactWeekdayDescriptions(lines: string[]): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const byDay: string[] = Array(7).fill('')
  for (const line of lines) {
    const idx = names.findIndex((n) => line.trim().toLowerCase().startsWith(n))
    if (idx < 0) continue
    const rest = line.replace(/^[^:]+:\s*/, '').trim()
    if (!rest) continue
    if (/closed/i.test(rest)) {
      byDay[idx] = 'Closed'
      continue
    }
    if (/open 24/i.test(rest)) {
      byDay[idx] = 'Open 24 hours'
      continue
    }
    const parsed = parseHoursLabel(rest, idx)
    if (parsed.intervals?.length) {
      byDay[idx] = parsed.intervals
        .map((iv) => `${formatHourClock(iv.open)}–${formatHourClock(iv.close)}`)
        .join(', ')
      continue
    }
    // Truncated Google fragments like "Sunday: a" must not appear as "Sun a".
    if (rest.length >= 4 && /\d/.test(rest)) byDay[idx] = rest
  }
  const known = byDay.map((label, i) => ({ i, label })).filter((d) => d.label)
  if (!known.length) return lines.join('; ')
  const unique = [...new Set(known.map((d) => d.label))]
  if (unique.length === 1) {
    const closed = known.filter((d) => d.label === 'Closed')
    if (closed.length === 7) return 'Closed'
    if (closed.length === 0) return unique[0] === 'Open 24 hours' ? 'Open 24 hours' : `${unique[0]} daily`
  }
  const closedDays = known.filter((d) => d.label === 'Closed').map((d) => days[d.i])
  const open = known.filter((d) => d.label !== 'Closed')
  const openUnique = [...new Set(open.map((d) => d.label))]
  if (openUnique.length === 1 && closedDays.length && closedDays.length < 7) {
    return `${openUnique[0]} · Closed ${closedDays.join(', ')}`
  }
  return known.map((d) => `${days[d.i]} ${d.label}`).join('; ')
}

/** Google weekly hours when we have them; otherwise the authored catalog string. */
export function hoursLabelForSource(kind: string, sourceId: string, fallback: string): string {
  const row = placeOpeningHoursRow(sourceId)
  const note = row?.exceptionNotes?.filter(Boolean).join(' · ')
  let base = fallback
  if (row?.weekdayDescriptions?.length) {
    const compact = compactWeekdayDescriptions(row.weekdayDescriptions)
    if (compact.trim() && !/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+[a-z]{1,2}(?=;|$)/i.test(compact)) {
      base = compact
    }
  } else if (row?.alwaysOpen) base = 'Open 24 hours'
  if (note && !base.toLowerCase().includes(note.toLowerCase())) return `${base} · ${note}`
  return base
}

const EXPERIENCE_BY_ID = new Map(EXPERIENCES.map((e) => [e.id, e]))
const ACTIVITY_BY_ID = new Map(CITY_ACTIVITIES.map((a) => [a.id, a]))
const PLAN_RESTAURANT_BY_ID = new Map(PLAN_RESTAURANTS.map((r) => [r.id, r]))
const TASTE_RESTAURANT_BY_ID = new Map(TASTE_RESTAURANTS.map((r) => [r.id, r]))
const DESTINATION_BY_ID = new Map<string, (typeof DESTINATIONS)[number]>()
for (const row of DESTINATIONS) {
  DESTINATION_BY_ID.set(row.id, row)
  if (row.itineraryId) DESTINATION_BY_ID.set(row.itineraryId, row)
}
const HOURS_MEMO = new Map<string, PlaceHours>()

export function catalogHoursForSource(
  kind: 'experience' | 'activity' | string,
  sourceId: string,
  weekday: number,
  isoDate?: string,
): PlaceHours {
  const key = `${kind}|${sourceId}|${weekday}|${isoDate ?? ''}`
  const cached = HOURS_MEMO.get(key)
  if (cached) return cached

  const google = hoursFromGoogleRow(sourceId, weekday, isoDate)
  let result: PlaceHours = unknownHours()
  if (kind === 'experience') {
    const exp = EXPERIENCE_BY_ID.get(sourceId)
    const authored = exp?.hours ? parseHoursLabel(exp.hours, weekday) : unknownHours()
    result = google
      ? usesLiveVenueHours(kind, sourceId, exp?.name)
        ? google
        : refineHoursWithGoogle(authored, google)
      : authored
  } else if (kind === 'activity') {
    const act = ACTIVITY_BY_ID.get(sourceId)
    const authored = act?.hours ? parseHoursLabel(act.hours, weekday) : unknownHours()
    result = google ? refineHoursWithGoogle(authored, google) : authored
  } else if (kind === 'shopping') {
    const d = DESTINATION_BY_ID.get(sourceId)
    if (d?.weekdayDescriptions?.length) {
      result = parseGoogleWeekdayDescriptions(d.weekdayDescriptions, weekday)
    } else if (d?.hoursRaw) {
      result = /Mo|Tu|We|Th|Fr|Sa|Su|24\/7/i.test(d.hoursRaw)
        ? parseOsmOpeningHours(d.hoursRaw, weekday)
        : parseHoursLabel(d.hoursRaw, weekday)
    } else if (d && !d.hoursUnknown && d.openingHours && !/hours vary/i.test(d.openingHours)) {
      result = parseHoursLabel(d.openingHours, weekday)
    }
  } else if (kind === 'meal') {
    const plan = PLAN_RESTAURANT_BY_ID.get(sourceId)
    const taste = TASTE_RESTAURANT_BY_ID.get(sourceId)
    if (plan?.hours) result = parseHoursLabel(plan.hours, weekday)
    else if (taste?.openingHours) result = parseHoursLabel(taste.openingHours, weekday)
  }

  HOURS_MEMO.set(key, result)
  return result
}

export function catalogHoursForItem(item: ItineraryItem, weekday: number, isoDate?: string): PlaceHours {
  if (!item.sourceId) return unknownHours()
  if (item.kind === 'experience' || item.kind === 'activity' || item.kind === 'shopping' || item.kind === 'meal') {
    return catalogHoursForSource(item.kind, item.sourceId, weekday, isoDate)
  }
  return unknownHours()
}

export function hoursOverlapPeriod(hours: PlaceHours, period: PeriodId, need = 0.75): boolean {
  if (hours.closedToday) return false
  if (hours.alwaysOpen || hours.unknown || !hours.intervals) return true
  const win = PERIOD_WINDOW[period]
  return hours.intervals.some((iv) => {
    if (period === 'morning' && iv.open < 8 && iv.close <= win.start + 0.05) return true
    const start = Math.max(win.start, iv.open)
    const end = Math.min(win.end, iv.close)
    return end - start >= need
  })
}

function formatHourClock(hours: number): string {
  let totalMins = Math.round((((hours % 24) + 24) % 24) * 60)
  if (totalMins >= 24 * 60) totalMins = 0
  const h = Math.floor(totalMins / 60) % 24
  const m = totalMins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Today's hours for a sight card — live intervals win over a raw OSM/Google string. */
export function displayTodayHours(hours: PlaceHours): string {
  let today = 'Hours vary'
  if (hours.closedToday) today = hours.exceptionNote ? `Closed this day (${hours.exceptionNote})` : 'Closed this day'
  else if (hours.alwaysOpen) today = hours.label?.trim() || 'Open all day'
  else if (hours.intervals?.length) {
    today = hours.intervals
      .map((iv) => `${formatHourClock(iv.open)}–${formatHourClock(iv.close)}`)
      .join(', ')
  } else if (hours.label?.trim()) today = hours.label.trim()
  const note = hours.exceptionNote
  if (note && !hours.closedToday && !today.toLowerCase().includes(note.toLowerCase())) {
    return `${today} · ${note}`
  }
  return today
}

/**
 * Latest clock a visit may finish: the venue's closing hour when known,
 * otherwise the day's packing envelope (`dayEnd`, typically 18:00).
 */
export function visitDeadline(hours: PlaceHours, dayEnd: number): number {
  if (hours.closedToday) return Number.NEGATIVE_INFINITY
  if (hours.alwaysOpen || hours.unknown || !hours.intervals?.length) return dayEnd
  return latestClose(hours)
}

const CLOCK_PAIR =
  /(\d{1,2}(?::\d{2})?(?:\s*[ap]\.?m\.?)?)\s*[–\-to]+\s*(\d{1,2}(?::\d{2})?(?:\s*[ap]\.?m\.?)?)/i

/**
 * Hours used to pack a city day. Word-only “morning/afternoon” labels are not
 * venue close times — those sights slide through 08:00–19:00. Real clock
 * ranges (Google or “07:00–17:30”) still bound the visit.
 */
export function hoursForPacking(hours: PlaceHours, dayEnd = 19): PlaceHours {
  if (hours.closedToday) return hours
  if (hours.alwaysOpen || hours.unknown || !hours.intervals?.length) return hours
  if (CLOCK_PAIR.test(hours.label ?? '')) return hours
  const eveningOnly = hours.intervals.every((iv) => iv.open >= 16)
  if (eveningOnly) return hours
  return {
    ...hours,
    intervals: [{ open: 8, close: Math.max(dayEnd, 19) }],
    unknown: false,
    alwaysOpen: false,
  }
}

/**
 * Earliest clock the full visit can start at or after `after`, sliding inside
 * opening hours. Duration must fit before close — remaining time that is
 * strictly less than duration is not a valid start.
 */
export function earliestOpenAt(
  hours: PlaceHours,
  after: number,
  duration: number,
  until = 24,
): number {
  if (hours.closedToday) return Number.POSITIVE_INFINITY
  const need = Math.max(5 / 60, duration)
  if (hours.alwaysOpen || hours.unknown || !hours.intervals || hours.intervals.length === 0) {
    return after + need <= until + 0.05 ? after : Number.POSITIVE_INFINITY
  }
  let best = Number.POSITIVE_INFINITY
  for (const iv of hours.intervals) {
    const close = Math.min(iv.close, until)
    const start = Math.max(after, iv.open)
    // Split only when duration strictly exceeds remaining time before close.
    if (start + need <= close + 0.05) {
      best = Math.min(best, start)
    }
  }
  if (Number.isFinite(best)) return best
  // Dawn / pre-day windows only when the day has not started cascading yet.
  if (after <= 8.05) {
    for (const iv of hours.intervals) {
      if (iv.close <= 8.5 && iv.open + need <= iv.close + 0.05) {
        best = Math.min(best, iv.open)
      }
    }
  }
  return Number.isFinite(best) ? best : Number.POSITIVE_INFINITY
}

export function clampVisitEnd(hours: PlaceHours, startHour: number, endHour: number): number {
  if (hours.alwaysOpen || hours.unknown || !hours.intervals?.length) return endHour
  const covering = hours.intervals.find((iv) => startHour + 0.05 >= iv.open && startHour < iv.close)
  if (!covering) return endHour
  return Math.min(endHour, covering.close)
}

export function latestClose(hours: PlaceHours): number {
  if (!hours.intervals || hours.intervals.length === 0) return 24
  return Math.max(...hours.intervals.map((iv) => iv.close))
}

export const CLOSED_AT_THIS_TIME = 'Sight is closed at this time.'

/** True when a visit would start while the place is shut. */
export function sightClosedAtTime(hours: PlaceHours, startHour: number): boolean {
  if (hours.unknown || hours.alwaysOpen) return false
  if (hours.closedToday) return true
  if (!hours.intervals?.length) return false
  return !hours.intervals.some((iv) => startHour + 0.05 >= iv.open && startHour < iv.close)
}

export type VisitHoursConflict = {
  kind: 'closed-today' | 'after-close' | 'before-open'
  closeHour?: number
  openHour?: number
}

/** True when a scheduled visit falls outside known opening hours. */
export function visitHoursConflict(
  hours: PlaceHours,
  startHour: number,
  endHour: number,
): VisitHoursConflict | null {
  if (hours.unknown || hours.alwaysOpen) return null
  if (hours.closedToday) return { kind: 'closed-today' }
  if (!hours.intervals?.length) return null
  const close = latestClose(hours)
  const open = Math.min(...hours.intervals.map((iv) => iv.open))
  const covering = hours.intervals.find(
    (iv) => startHour + 0.05 >= iv.open && startHour < iv.close,
  )
  if (!covering) {
    if (startHour >= close - 0.05) return { kind: 'after-close', closeHour: close }
    if (startHour < open) return { kind: 'before-open', openHour: open, closeHour: close }
    const next = hours.intervals.find((iv) => iv.open > startHour)
    if (next) return { kind: 'before-open', openHour: next.open, closeHour: close }
    return { kind: 'after-close', closeHour: close }
  }
  if (endHour > covering.close + 0.08) return { kind: 'after-close', closeHour: covering.close }
  return null
}

export function mergeHours(live: PlaceHours | undefined, catalog: PlaceHours): PlaceHours {
  if (!live) return catalog
  const note = live.exceptionNote || catalog.exceptionNote
  if (live.closedToday) return withException(live, note)
  if (live.alwaysOpen || (live.intervals && live.intervals.length > 0 && !live.unknown)) {
    return withException(live, note)
  }
  return withException(catalog, note)
}
