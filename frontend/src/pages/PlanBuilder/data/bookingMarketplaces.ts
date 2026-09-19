/** Search URLs on the OTAs where Vietnam tickets and tours are actually sold. */

export type MarketplaceId = 'getyourguide' | 'klook' | 'viator' | 'kkday'

export type MarketplaceOffer = {
  id: string
  name: string
  blurb: string
  bookingUrl: string
}

export function gygSearchUrl(q: string) {
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}`
}

export function klookSearchUrl(q: string) {
  return `https://www.klook.com/en-US/search/?query=${encodeURIComponent(q)}`
}

export function viatorSearchUrl(q: string) {
  return `https://www.viator.com/searchResults/all?text=${encodeURIComponent(q)}`
}

export function kkdaySearchUrl(q: string) {
  return `https://www.kkday.com/en/product/productlist?keyword=${encodeURIComponent(q)}`
}

export function marketplaceOffersForQuery(query: string): MarketplaceOffer[] {
  const q = query.trim()
  return [
    {
      id: 'getyourguide',
      name: 'GetYourGuide',
      blurb: 'Tours and tickets — search opens with this sight already filled in.',
      bookingUrl: gygSearchUrl(q),
    },
    {
      id: 'klook',
      name: 'Klook',
      blurb: 'Vietnam-heavy marketplace for attraction tickets and day tours.',
      bookingUrl: klookSearchUrl(q),
    },
    {
      id: 'viator',
      name: 'Viator',
      blurb: 'Compare operators and prices for the same sight.',
      bookingUrl: viatorSearchUrl(q),
    },
    {
      id: 'kkday',
      name: 'KKday',
      blurb: 'Another SE Asia booking desk — useful when Klook is thin.',
      bookingUrl: kkdaySearchUrl(q),
    },
  ]
}
