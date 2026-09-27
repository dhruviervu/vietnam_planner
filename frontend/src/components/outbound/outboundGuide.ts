export type OutboundGuide = {
  href: string
  host: string
  productName: string
  headline: string
  tips: string[]
  continueLabel: string
}

const SKIP = new Set([
  'openstreetmap.org',
  'www.openstreetmap.org',
  'leafletjs.com',
  'localhost',
])

function hostOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function shouldGuideOutbound(href: string) {
  if (!href || href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false
  }
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const url = new URL(href, origin)
    if (url.origin === origin) return false
    const host = url.hostname.replace(/^www\./, '')
    if (SKIP.has(host) || host.endsWith('.openstreetmap.org')) return false
    return true
  } catch {
    return false
  }
}

const TIPS: Record<string, { headline: string; tips: string[]; continueLabel: string }> = {
  '12go.asia': {
    headline: '12Go is a timetable marketplace — pick the exact sailing, not a vague “ferry”.',
    continueLabel: 'Open 12Go with this route',
    tips: [
      'The page should already be filtered to this city pair. Set tomorrow’s date if today looks empty.',
      'Read the pickup point — many “HCMC” buses leave from a suburban terminal, not your hotel.',
      'Screenshot the ticket and the operator’s Vietnamese phone number; port Wi-Fi is poor.',
      'For island boats, check the weather note. A cheap fare is useless if the afternoon sailing is cancelled.',
    ],
  },
  'baolau.com': {
    headline: 'Baolau is already opened on this boat or train pair.',
    continueLabel: 'Open Baolau',
    tips: [
      'Confirm it says boat/ferry if you wanted water, not a bus substitute.',
      'Names must match passports. Peak Tet and summer weekends sell out.',
      'Download the e-ticket before you lose signal at the pier.',
    ],
  },
  'klook.com': {
    headline: 'Klook search is pre-filled for this place — don’t start from the Vietnam homepage.',
    continueLabel: 'Open Klook search',
    tips: [
      'Filter the date first. “From $12” is often a different day or a child ticket.',
      'Read the meeting point: hotel pickup vs a pier you must taxi to.',
      'Free cancellation windows matter more than a $3 discount. Check the cutoff.',
    ],
  },
  'getyourguide.com': {
    headline: 'GetYourGuide is searched for this outing — check pickup language.',
    continueLabel: 'Open GetYourGuide',
    tips: [
      'Open the first matching product and confirm it is this island or city, not a generic “Vietnam tour”.',
      'Hotel pickup is not door-to-door from every neighbourhood — read the zone list.',
      'Screenshots of the voucher and operator WhatsApp save you at 6am piers.',
    ],
  },
  'google.com': {
    headline: 'Google is opening a search or map already aimed at this hop.',
    continueLabel: 'Continue to Google',
    tips: [
      'For Flights: compare the same bag allowance, not the naked fare.',
      'For Maps: this is live navigation, not a booked ticket.',
      'Pin your hotel as the end point before you start walking to a ferry you have not bought.',
    ],
  },
  'vietnamairlines.com': {
    headline: 'Vietnam Airlines official site — use the same name as your passport.',
    continueLabel: 'Open Vietnam Airlines',
    tips: [
      'Domestic fares often include a hold bag on the full-service carrier — still confirm the weight.',
      'Island flights (PQC, VCS) are thin. If the calendar is red, try a neighbouring day before a ferry.',
      'Airport process from a city hotel is usually 3+ hours door-to-door, not the airborne hour.',
    ],
  },
  'vietjetair.com': {
    headline: 'VietJet is low-cost — the headline fare is rarely the door-to-door fare.',
    continueLabel: 'Open VietJet',
    tips: [
      'Add bags and a seat before checkout. A $30 fare becomes $70 with a 20 kg bag.',
      'Names must match passports exactly, including middle names.',
      'Build slack around Tân Sơn Nhất and Nội Bài at rush hour.',
    ],
  },
  'bambooairways.com': {
    headline: 'Bamboo sits between full-service and LCC on selected island routes.',
    continueLabel: 'Open Bamboo Airways',
    tips: [
      'Check whether this calendar even flies your island that day.',
      'Compare bag rules against VietJet on Google Flights before you commit here.',
    ],
  },
  'superdong.com.vn': {
    headline: 'Superdong’s own timetable — this is the operator, not a reseller.',
    continueLabel: 'Open Superdong',
    tips: [
      'Find today’s row for your corridor (Hà Tiên, Rạch Giá, Nam Du, Trần Đề).',
      'Arrive 30–40 minutes early. Vehicle decks and holiday mornings fill first.',
      'If the sea is up, they cancel. Have a hotel night you can keep.',
    ],
  },
  'online.superdong.com.vn': {
    headline: 'Official Superdong sailing board.',
    continueLabel: 'Open the timetable',
    tips: [
      'Match the Vietnamese place names: Hà Tiên, Rạch Giá, Phú Quốc, Côn Đảo, Nam Du.',
      'Morning boats are the reliable ones. Do not cut a same-day flight too tight.',
    ],
  },
  'phuquocexpress.com': {
    headline: 'Phú Quốc Express catamarans — official operator for several island legs.',
    continueLabel: 'Open Phu Quoc Express',
    tips: [
      'They run Hà Tiên / Rạch Giá–Phú Quốc, Vũng Tàu–Côn Đảo, Sa Kỳ–Lý Sơn, Phan Thiết–Phú Quý.',
      'English pages exist; still screenshot the ticket QR.',
      'Sit aft if you get seasick. Skip a heavy breakfast.',
    ],
  },
  'vetauphuquy.vn': {
    headline: 'Phú Quý’s live daily board — some dates have no sailing.',
    continueLabel: 'Open the Phu Quy schedule',
    tips: [
      'Read today and tomorrow before you leave Phan Thiết.',
      'If it says không hoạt động, do not drive to the port hoping.',
    ],
  },
  'grab.com': {
    headline: 'Grab is in-app from here — set the pin on the actual pier, not the town name.',
    continueLabel: 'Open Grab',
    tips: [
      'Drop the pin on Bãi Vòng, Cửa Đại, or Đồng Bài — not “Phu Quoc” as a city blob.',
      'Ferry mornings surge. Book the car before you finish breakfast.',
    ],
  },
  'futabus.vn': {
    headline: 'Futa / Phương Trang coaches — confirm the terminal, not just the city.',
    continueLabel: 'Open Futa',
    tips: [
      'Saigon has several Futa yards. Screenshot the one printed on the ticket.',
      'This will not put you on a Phu Quoc ferry by itself.',
    ],
  },
  'vexere.com': {
    headline: 'VeXeRe aggregates Vietnamese coaches. English is limited — slow down on the station name.',
    continueLabel: 'Open VeXeRe',
    tips: ['Keep the operator phone. Overnight bunks are short if you are tall.'],
  },
}

const GENERIC = {
  headline: 'You are leaving TripBuilder for a booking site.',
  continueLabel: 'Continue to the site',
  tips: [
    'We already aimed this link at the right place or operator where we could.',
    'Check the date, the meeting point, and whether bags are included before you pay.',
    'Keep a screenshot of the confirmation — Vietnamese ports and stations have weak Wi-Fi.',
  ],
}

export function buildOutboundGuide(href: string, productName = ''): OutboundGuide {
  const host = hostOf(href)
  const match =
    TIPS[host] ||
    Object.entries(TIPS).find(([key]) => host.endsWith(key))?.[1] ||
    GENERIC
  return {
    href,
    host,
    productName,
    headline: match.headline,
    tips: match.tips,
    continueLabel: match.continueLabel,
  }
}
