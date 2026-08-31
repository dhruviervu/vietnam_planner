import type { CatalogCityFilter } from './eventCalendarCatalog'
import type { MonthId } from './months'
import { getMonthEventProfile } from './monthEventProfiles'
import { getMonthVisitInsight } from './monthSnapshots'
import {
  filterCalendarByCity,
  getFestivalsForMonth,
  getMustVisitPlaces,
  type EventCalendarItem,
} from './eventCalendarCatalog'

export type { EventCalendarItem, CalendarItemKind, CatalogCityFilter } from './eventCalendarCatalog'
export { CATALOG_CITIES } from './eventCalendarCatalog'

export type MonthCatalog = {
  month: MonthId
  /** Full-width month guide — expanded for the event calendar header */
  description: string
  festivals: EventCalendarItem[]
  mustVisit: EventCalendarItem[]
}

/** Month the event catalog opens on — November is the most eventful nationwide. */
export const DEFAULT_CATALOG_MONTH: MonthId = 11

const MONTH_INTRO: Partial<Record<MonthId, string>> = {
  1: 'January is peak dry season in southern Vietnam — Ho Chi Minh City runs warm at 25–33°C with sunshine most days, and Phu Quoc sees calm seas and clear water ideal for beaches. The north stays cool and dry around Hanoi (14–22°C) with occasional mist over Ha Long Bay. Pre-Tết flower markets and New Year energy build nationwide, though central coast showers can still appear. Tết preparations often dominate the cultural calendar toward month-end.',
  2: 'February is widely rated among the best months nationwide: mild, mostly dry weather from Hanoi to Ho Chi Minh City, with central beaches warming to swimmable temperatures. It often coincides with Tết (Lunar New Year), when cities fill with lights, flower markets, and family celebrations — book transport and hotels months ahead, as many businesses close briefly during the holiday peak. Perfume Pagoda and Lim Festival pilgrimages add northern colour.',
  3: 'March is often called the single best month for a north-to-south Vietnam trip: all three regions align on warm, dry, clear conditions at once — a rare window for Ha Long Bay, Hoi An, Hue, and the Mekong Delta in one itinerary. Temperatures sit in a comfortable 24–32°C band, crowds are moderate after Tết, and spring landscapes green up across Ninh Binh and the highlands. Perfume Pagoda season continues while central coast evenings turn reliably pleasant.',
  4: 'April stays excellent for central Vietnam — Da Nang, Hoi An, and Hue enjoy hot, dry beach weather before summer heat peaks, while the north warms pleasantly for Hanoi and Ha Long trips. The Hung Kings Commemoration and Giong Festival add cultural depth, Khau Vai Love Market draws highland visitors, and Mekong Delta boat days remain workable if you start early. Southern cities grow very hot toward month-end.',
  5: 'May marks a transition: the south enters wet season with rising humidity and afternoon showers, while the north and central coast can still feel workable in mornings. Landscapes turn lush and tourist numbers soften, offering better value. Da Lat and Sapa highlands stay cooler escapes from lowland heat — plan temple visits and city food days around midday warmth and building rain. Khau Vai and Ba Chua Xu festivals still anchor the event calendar.',
  6: 'June brings summer heat and humidity nationwide, with frequent afternoon showers especially in the south and increasing rain along parts of the central coast. It is not the classic beach month, but rice terraces and countryside look vividly green, and highland towns like Da Lat and Sapa offer cooler alternatives. Da Nang International Fireworks Festival often lights up the Han River — flexible city itineraries suit the wetter rhythm well.',
  7: 'July sits in the heart of Vietnam’s wet season: heavy rainfall and stormy spells affect much of the central coast, while southern cities stay hot, humid, and shower-prone. Ha Long and northern trails can still clear between bursts, and major sites feel quieter. Fireworks nights in Da Nang and indoor culture, food, and highland escapes carry the month better than fixed beach plans.',
  8: 'August is peak green season — and peak wet season along much of the central coast, where typhoon-related rain and rough seas can disrupt beach time. Northern rice terraces around Sapa and Ha Giang look at their most vivid, and Vu Lan (Wandering Souls Day) adds ceremony in many communities. Inland city days in Hanoi and Ho Chi Minh City, plus highland loops when skies clear, outperform coast-focused schedules.',
  9: 'September is a shoulder month as rains begin easing in places, though the central coast can still see unsettled weather early on. Mid-Autumn Festival lantern evenings lift Hanoi, Hoi An, and Ho Chi Minh City, and National Day adds festive city energy. Ninh Binh and northern landscapes can offer strong photography conditions — expect a mix of showers and improving dry windows rather than guaranteed sun every day.',
  10: 'October brings clearer, cooler weather to much of northern Vietnam — Hanoi and Ha Long become especially pleasant for walking and bay cruises as rains retreat. Central areas often improve through the month, making Hoi An evenings and Hue heritage days more reliable. Kate Festival celebrates Cham culture near Nha Trang, and full-moon lantern nights return strongly to Hoi An.',
  11: 'November opens classic dry-season travel across much of Vietnam: cool, clear days in Hanoi (19–25°C), improving sunshine on the central coast, and comfortable conditions for Ha Long Bay and Hoi An. Rice harvest colours appear in the north, Ooc Om Boc marks Khmer new year in the delta, and crowds build toward December peaks. Many guides rank it among the best months for combining culture, coast, and multi-region routes.',
  12: 'December starts Vietnam’s busy winter travel season: the south enters its prime dry window with warm, sunny days ideal for Ho Chi Minh City, the Mekong Delta, and Phu Quoc beaches, while Hanoi turns cool and festive with Christmas and New Year events. Central coast weather is generally dry and mild. Book popular stays early — December through January is peak tourism nationwide.',
}

function buildDescription(month: MonthId): string {
  const custom = MONTH_INTRO[month]
  if (custom) return custom
  const visit = getMonthVisitInsight(month).visitDescription
  const events = getMonthEventProfile(month).monthSummary
  return `${visit} ${events}`
}

export function getMonthCatalog(month: MonthId): MonthCatalog {
  return {
    month,
    description: buildDescription(month),
    festivals: getFestivalsForMonth(month),
    mustVisit: getMustVisitPlaces(),
  }
}

export function filterCatalogItems(
  items: EventCalendarItem[],
  city: CatalogCityFilter,
): EventCalendarItem[] {
  return filterCalendarByCity(items, city)
}

export function popularityLabel(score: number): string {
  if (score >= 90) return 'Very popular'
  if (score >= 80) return 'Popular'
  if (score >= 70) return 'Well known'
  return 'Worth visiting'
}

const TAG_PILL: Record<string, string> = {
  Culture: 'bg-terracotta/15 text-terracotta ring-terracotta/20',
  Heritage: 'bg-ink/10 text-ink ring-ink/12',
  Romantic: 'bg-rose-100/80 text-[#9a4a52] ring-rose-200/80',
  Family: 'bg-sage/15 text-sage ring-sage/20',
  Spiritual: 'bg-violet-100/70 text-violet-900 ring-violet-200/70',
  Scenic: 'bg-sky-100/70 text-sky-900 ring-sky-200/60',
  Nature: 'bg-emerald-100/70 text-emerald-900 ring-emerald-200/60',
  Adventure: 'bg-amber-100/80 text-amber-900 ring-amber-200/70',
  Urban: 'bg-cream text-ink ring-ink/10',
  Beach: 'bg-cyan-100/70 text-cyan-900 ring-cyan-200/60',
}

export function catalogTagPillClass(tag: string): string {
  return TAG_PILL[tag] ?? 'bg-paper text-ink ring-ink/10'
}
