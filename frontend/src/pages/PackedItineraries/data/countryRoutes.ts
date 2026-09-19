export type CountryStay = { city: string; days: number }

export type CountryRoute = {
  id: string
  title: string
  description: string
  stays: CountryStay[]
}

/**
 * Complete Vietnam routes distilled from common published itineraries
 * (Lonely Planet / Tripadvisor / Vietnam Airlines first-timer spines):
 * north karst + bay, imperial-central coast, Saigon + Mekong, optional highlands and island.
 * City blocks are contiguous so packing never double-books a return stay.
 */
export const COUNTRY_ROUTES: CountryRoute[] = [
  {
    id: 'vn-north-7',
    title: '7-day Northern Vietnam',
    description:
      'The classic first week north of Hai Van: Hanoi’s Old Quarter and temples, Ninh Binh boats and Hang Mua, then a Ha Long / Bai Tu Long day on the water. Packed, not a cruise brochure — highest-ROI walks, markets, and one bay day.',
    stays: [
      { city: 'Hanoi', days: 3 },
      { city: 'Ninh Binh', days: 2 },
      { city: 'Ha Long', days: 2 },
    ],
  },
  {
    id: 'vn-central-7',
    title: '7-day Central coast',
    description:
      'Hue’s citadel and tombs, Da Nang’s Marble Mountains and dragon river, Hoi An’s ancient town, lanterns, tailors, and An Bang. The DAD airport week everyone actually flies.',
    stays: [
      { city: 'Hue', days: 2 },
      { city: 'Da Nang', days: 2 },
      { city: 'Hoi An', days: 3 },
    ],
  },
  {
    id: 'vn-classic-10',
    title: '10-day Vietnam spine',
    description:
      'The first-timer line Google keeps recommending: Hanoi streets and egg coffee, a Ninh Binh karst day, Hoi An heritage plus a Da Nang / Ba Na or Marble Mountains swing, then Saigon museums, Independence Palace, and Bến Thành. North to south, no filler islands.',
    stays: [
      { city: 'Hanoi', days: 3 },
      { city: 'Ninh Binh', days: 2 },
      { city: 'Hoi An', days: 3 },
      { city: 'Ho Chi Minh City', days: 2 },
    ],
  },
  {
    id: 'vn-classic-14',
    title: '14-day Classic Vietnam',
    description:
      'Two weeks the way desk agents still write it: Hanoi, Ha Long water, imperial Hue, lantern Hoi An (with Da Nang in reach), Saigon history, and a Mekong dawn at Cái Răng. Shopping sits on the evening markets — Đồng Xuân, Hội An tailors, Bến Thành — not as an afterthought.',
    stays: [
      { city: 'Hanoi', days: 3 },
      { city: 'Ha Long', days: 2 },
      { city: 'Hue', days: 2 },
      { city: 'Hoi An', days: 3 },
      { city: 'Ho Chi Minh City', days: 2 },
      { city: 'Can Tho', days: 2 },
    ],
  },
  {
    id: 'vn-nature-14',
    title: '14-day Nature & heritage',
    description:
      'Mountains before museums: Hanoi launch, Sapa terraces and Fansipan, Ninh Binh boats, Phong Nha cave country, then Hoi An to land. Built from the sights travellers actually rank — not a 4×4 brochure dump.',
    stays: [
      { city: 'Hanoi', days: 2 },
      { city: 'Sapa', days: 3 },
      { city: 'Ninh Binh', days: 2 },
      { city: 'Phong Nha', days: 3 },
      { city: 'Hoi An', days: 4 },
    ],
  },
  {
    id: 'vn-grand-21',
    title: '21-day Grand Vietnam',
    description:
      'Three weeks, north to island: Hanoi, the Hà Giang loop, Ninh Binh, Phong Nha, Hue, Hoi An / Da Nang, Da Lat pines, Saigon, then Phú Quốc to finish. Packed days, shopping markets included, timing from the same engine as Your Itinerary.',
    stays: [
      { city: 'Hanoi', days: 2 },
      { city: 'Ha Giang', days: 3 },
      { city: 'Ninh Binh', days: 2 },
      { city: 'Phong Nha', days: 2 },
      { city: 'Hue', days: 2 },
      { city: 'Hoi An', days: 3 },
      { city: 'Da Lat', days: 2 },
      { city: 'Ho Chi Minh City', days: 2 },
      { city: 'Phu Quoc', days: 3 },
    ],
  },
]
