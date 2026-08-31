import type { StayCityId } from './types'

export type HotelWebsiteLink = {
  id: 'booking' | 'agoda' | 'hotels' | 'expedia' | 'tripadvisor'
  name: string
  blurb: string
  href: string
}

const TRIPADVISOR_HOTELS: Record<StayCityId, { geo: string; slug: string }> = {
  hanoi: { geo: 'g293924', slug: 'Hanoi' },
  hcmc: { geo: 'g293925', slug: 'Ho_Chi_Minh_City' },
  'da-nang': { geo: 'g298085', slug: 'Da_Nang' },
  'hoi-an': { geo: 'g298082', slug: 'Hoi_An' },
  hue: { geo: 'g293926', slug: 'Hue' },
  'nha-trang': { geo: 'g293928', slug: 'Nha_Trang' },
  dalat: { geo: 'g298084', slug: 'Dalat_Lam_Dong_Province' },
  'phu-quoc': { geo: 'g469418', slug: 'Phu_Quoc_Island_Kien_Giang_Province' },
}

const AGODA_CITY: Record<StayCityId, string> = {
  hanoi: '2758',
  hcmc: '13170',
  'da-nang': '16440',
  'hoi-an': '16552',
  hue: '16446',
  'nha-trang': '15932',
  dalat: '17190',
  'phu-quoc': '17180',
}

function placeQuery(cityLabel: string, neighbourhood?: string | null) {
  return neighbourhood?.trim()
    ? `${neighbourhood.trim()}, ${cityLabel}, Vietnam`
    : `${cityLabel}, Vietnam`
}

/** Hotel-only deep links for the current city (and neighbourhood, when filtered). */
export function hotelWebsiteLinks(
  cityId: StayCityId,
  cityLabel: string,
  neighbourhood?: string | null,
): HotelWebsiteLink[] {
  const place = placeQuery(cityLabel, neighbourhood)
  const encoded = encodeURIComponent(place)
  const ta = TRIPADVISOR_HOTELS[cityId]
  const tripadvisorHref = neighbourhood?.trim()
    ? `https://www.tripadvisor.com/Search?q=${encoded}&ssrc=h&searchType=hotel`
    : `https://www.tripadvisor.com/Hotels-${ta.geo}-${ta.slug}-Hotels.html`

  const agodaCity = AGODA_CITY[cityId]
  const agodaHref = neighbourhood?.trim()
    ? `https://www.agoda.com/search?city=${agodaCity}&textToSearch=${encoded}`
    : `https://www.agoda.com/search?city=${agodaCity}`

  return [
    {
      id: 'booking',
      name: 'Booking.com',
      blurb: 'Hotel listings for this place',
      href: `https://www.booking.com/searchresults.html?ss=${encoded}&nflt=ht_id%3D204`,
    },
    {
      id: 'agoda',
      name: 'Agoda',
      blurb: 'Hotels in this city',
      href: agodaHref,
    },
    {
      id: 'hotels',
      name: 'Hotels.com',
      blurb: 'Hotel-only search',
      href: `https://www.hotels.com/Hotel-Search?destination=${encoded}`,
    },
    {
      id: 'expedia',
      name: 'Expedia',
      blurb: 'Hotel-only search',
      href: `https://www.expedia.com/Hotel-Search?destination=${encoded}`,
    },
    {
      id: 'tripadvisor',
      name: 'Tripadvisor',
      blurb: 'Hotels only — not restaurants or sights',
      href: tripadvisorHref,
    },
  ]
}
