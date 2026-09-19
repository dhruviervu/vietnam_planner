import type { Experience } from '../types'
import { marketplaceOffersForQuery, type MarketplaceOffer } from './bookingMarketplaces'

/**
 * Catalog names that do not search well on OTAs — use the English listing phrase
 * travelers actually type on GetYourGuide / Klook / Viator.
 */
const QUERY_ALIASES: Record<string, string> = {
  'halong-cruise': 'Ha Long Bay day cruise',
  'ninh-binh': 'Trang An boat tour Ninh Binh',
  'temple-literature': 'Temple of Literature Hanoi',
  'hoa-lo-prison': 'Hoa Lo Prison Museum Hanoi',
  'hoan-kiem-lake': 'Hoan Kiem Lake Hanoi',
  'old-quarter': 'Hanoi Old Quarter walking tour',
  'egg-coffee': 'Hanoi egg coffee',
  'train-street': 'Hanoi Train Street',
  'sung-sot-cave': 'Sung Sot Surprise Cave Ha Long',
  'ti-top-island': 'Titop Island Ha Long',
  'thien-cung-cave': 'Thien Cung Cave Ha Long',
  'bai-tu-long-bay': 'Bai Tu Long Bay cruise',
  'lan-ha': 'Lan Ha Bay cruise Cat Ba',
  'cat-ba': 'Cat Ba Island',
  'fansipan': 'Fansipan cable car Sapa',
  'sapa-trek': 'Sapa Lao Chai Ta Van trek',
  'cam-thanh-basket-boats': 'Cam Thanh coconut basket boat Hoi An',
  'hon-mun-islands': 'Hon Mun snorkeling Nha Trang',
  'phu-quoc-snorkel': 'Phu Quoc snorkeling tour',
  'hoi-an-ancient-town': 'Hoi An Ancient Town ticket',
  'ba-na-hills': 'Ba Na Hills Golden Bridge',
  'paradise-cave': 'Paradise Cave Phong Nha ticket',
  'my-son': 'My Son Sanctuary Hoi An',
  'ngo-mon-gate': 'Hue Imperial City citadel ticket',
  'thai-hoa-palace': 'Hue Imperial City Thai Hoa Palace',
  'khai-dinh-tomb': 'Khai Dinh Tomb Hue ticket',
}

const WALK_UP_IDS = new Set([
  'hoan-kiem-lake',
  'old-quarter',
  'bia-hoi',
  'egg-coffee',
  'train-street',
])

const BOOKABLE_HINT =
  /\b(ticket|tickets|entrance|admission|cruise|sampan|cable car|cable-car|skip.?the.?line|kayak|snorkel|overnight|jeep|zip\s?line|cave|museum|palace|citadel|sanctuary|theme park|water park|national park|boat ride|boat tour|day cruise|booking|booked|combo|park hours|adult ticket|gate)\b/i

const NOT_BOOKABLE_HINT =
  /\b(no ticket|not a ticket booth|no extra ticket|not a ticket|free, anytime|not a ticketed)\b/i

function catalogText(experience: Pick<Experience, 'name' | 'about' | 'whyGo' | 'cardSummary' | 'hours' | 'hook'>) {
  return `${experience.name} ${experience.hook} ${experience.about} ${experience.whyGo} ${experience.cardSummary} ${experience.hours}`
}

export function isBookableSight(experience: Experience): boolean {
  if (WALK_UP_IDS.has(experience.id)) return false
  if (experience.priceType !== 'free' && experience.price > 0) {
    if (experience.category === 'Nightlife' && experience.price < 12) return false
    if (experience.category === 'Food' && experience.price < 12 && !BOOKABLE_HINT.test(catalogText(experience))) {
      return false
    }
    return true
  }
  const text = catalogText(experience)
  if (NOT_BOOKABLE_HINT.test(text)) return false
  return BOOKABLE_HINT.test(text)
}

export function sightMarketplaceQuery(experience: Pick<Experience, 'id' | 'name' | 'city'>): string {
  const alias = QUERY_ALIASES[experience.id]
  if (alias) return alias
  const stripped = experience.name
    .replace(/\s+\([^)]*\)/g, '')
    .replace(/\b(Walk|Stroll|Visit|See|Café Crawl|Cafe Crawl|Crawl)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  const city = experience.city.trim()
  if (city && !stripped.toLowerCase().includes(city.toLowerCase())) {
    return `${stripped} ${city}`
  }
  return stripped
}

export function getSightProviderOffers(experience: Experience): MarketplaceOffer[] {
  if (!isBookableSight(experience)) return []
  return marketplaceOffersForQuery(sightMarketplaceQuery(experience))
}
