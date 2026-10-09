import type { AirportId, TransportModeId } from './types'
import { PROVIDER_LINKS } from './providerCatalog'
import { MAP_PLACES, type TransferCoord } from './transferGeo'

export type CityPick = {
  name: string
  tag: string
  fare: string
  time: string
  why: string
  href?: string
  from: TransferCoord
  to: TransferCoord
}

const L = PROVIDER_LINKS
const P = MAP_PLACES

export const CITY_HUB: Partial<Record<AirportId, { city: string; hub: string; distance: string }>> = {
  HAN: { city: 'Hanoi', hub: 'Old Quarter', distance: '~28–30 km · 45–60 min' },
  SGN: { city: 'Ho Chi Minh City', hub: 'District 1', distance: '~7–8 km · 30–45 min' },
  DAD: { city: 'Da Nang', hub: 'city centre', distance: '~3–5 km · 10–15 min' },
  PQC: { city: 'Phu Quoc', hub: 'Duong Dong', distance: '~8–12 km · 20–35 min' },
  CXR: { city: 'Nha Trang', hub: 'city centre', distance: '~30–35 km · 40–55 min' },
}

const taxi = (name: string, tag: string, fare: string, time: string, why: string, from: TransferCoord, to: TransferCoord, href?: string): CityPick => ({
  name, tag, fare, time, why, from, to, href,
})

export const CITY_PICKS: Partial<Record<AirportId, Partial<Record<TransportModeId, CityPick[]>>>> = {
  HAN: {
    'car-taxi': [
      taxi('Official taxi rank', 'Best without an app', '₫250,000 – ₫400,000', '45–60 min', 'Mai Linh / posted rank outside arrivals. Skip lobby touts.', P.han, P.oldQuarter, L.maiLinh),
      taxi('Pre-booked car', 'Name board', 'From ~$10–16', '45–60 min', 'Driver waits inside with your name. Prepaid, delay-aware.', P.han, P.oldQuarter, L.klook.HAN),
    ],
    'public-bus': [
      taxi('Express Bus 86', 'Best tourist bus', '~₫45,000', '50–80 min', 'T1 & T2 to Old Quarter and Hanoi Railway Station. Cash onboard.', P.han, P.hanoiStation, L.transerco),
      taxi('Vietnam Airlines shuttle', 'Mid comfort', '₫40,000 – ₫50,000', '50–70 min', 'Minivan to 1 Quang Trung, near the Old Quarter.', P.han, P.quangTrung1, L.vietnamAirlines),
    ],
    'rental-driver': [
      taxi('Car with driver', 'Usual choice', '₫1.2–2.5m / day', 'Door to door', 'Day trips and luggage without licence risk.', P.han, P.oldQuarter, L.klookDriver),
      taxi('Avis self-drive', '1968 IDP only', 'From ~$32 / day', 'Desk hours', 'Airport desk. Poor first-night plan in Hanoi traffic.', P.han, P.oldQuarter, L.avis),
    ],
  },
  SGN: {
    'car-taxi': [
      taxi('Vinasun / Mai Linh rank', 'Official queue', '₫120,000 – ₫200,000', '30–45 min', 'White or green cabs at the posted stand. Walk past hall touts.', P.sgn, P.district1, L.vinasun),
      taxi('Pre-booked car', 'Name board', 'From ~$5–10', '30–45 min', 'Prepaid meet-and-greet. Useful after a long-haul or with kids.', P.sgn, P.district1, L.klook.SGN),
    ],
    'public-bus': [
      taxi('Express Bus 109', 'Best tourist bus', '₫20,000 – ₫30,000', '25–55 min', 'Pillar 12 (intl) or A18 (domestic). Toward Ben Thanh / Bui Vien.', P.sgn, P.benThanh),
      taxi('Bus 152', 'Ultra budget', '₫5,000 – ₫10,000', '30–60 min', 'Commuter bus. Extra ticket if a huge bag takes a seat.', P.sgn, P.benThanh),
    ],
    'rental-driver': [
      taxi('Car with driver', 'Usual choice', '₫1.2–2.5m / day', 'Door to door', 'Saigon traffic is why most visitors do not self-drive.', P.sgn, P.district1, L.klookDriver),
      taxi('Avis / Hertz desk', '1968 IDP only', 'From ~$28 / day', 'Desk hours', 'Real airport desks. Deposit on a credit card.', P.sgn, P.district1, L.avis),
    ],
  },
  DAD: {
    'car-taxi': [
      taxi('Into Da Nang centre', 'Short hop', '₫70,000 – ₫120,000', '10–15 min', 'Rank taxi or prepaid car. The airport is almost in town.', P.dad, P.daNangCentre, L.maiLinh),
      taxi('Straight to Hoi An', 'Most visitors', '₫300,000 – ₫400,000', '~45 min', 'Skip off-app quotes. Prepaid or an app fare is cleaner.', P.dad, P.hoiAnAncient, L.klook.DAD),
    ],
    'public-bus': [
      taxi('Hoi An shuttle van', 'Pre-book', '₫110,000 – ₫150,000 / seat', '45–70 min', 'Shared van from the terminal to Hoi An hotel districts.', P.dad, P.hoiAnAncient, L.klookHoiAn),
      taxi('City hop', 'Staying in Da Nang', 'City fare', '10–25 min', 'Local buses exist; for Hoi An, book the van instead.', P.dad, P.daNangCentre),
    ],
    'rental-driver': [
      taxi('Car with driver', 'Hoi An + Mỹ Sơn days', '₫1.2–2.5m / day', 'Flexible', 'The grown-up version of landing and continuing by road.', P.dad, P.hoiAnAncient, L.klookDriver),
      taxi('Avis / Hertz', '1968 IDP only', 'From ~$32 / day', 'Desk hours', 'Self-drive is possible here. Ancient Town is still for walking.', P.dad, P.daNangCentre, L.avis),
    ],
  },
  PQC: {
    'car-taxi': [
      taxi('Taxi to Duong Dong', 'Island default', 'Typically $5–9', '20–35 min', 'Official rank. Confirm the fare before you sit.', P.pqc, P.duongDong, L.maiLinh),
      taxi('Pre-booked car', 'Name board', 'From ~$8', '20–35 min', 'Useful with late flights and resort bags.', P.pqc, P.duongDong, L.klook.PQC),
    ],
    'public-bus': [
      taxi('Hotel / resort shuttle', 'Most resorts', '~$3–6 / person', '20–35 min', 'Arrange with the hotel. Island public buses are thin.', P.pqc, P.duongDong),
    ],
    'rental-driver': [
      taxi('Car with driver', 'Day-island loops', 'Quote by day', 'Flexible', 'No Hertz/Avis walk-up desk here. Driver or hotel car.', P.pqc, P.duongDong, L.vietnamPrivateCar),
      taxi('Scooter from town', 'Once you are settled', '₫120–200k / day', 'Next day', 'Not from the arrivals hall. Helmet on. 1968 IDP above 50cc.', P.pqc, P.duongDong, L.styleMotorbikes),
    ],
  },
  CXR: {
    'car-taxi': [
      taxi('Taxi to Nha Trang', 'Coast run', 'Typically $10–16', '40–55 min', 'Official rank. Fix the rate or use a prepaid car.', P.cxr, P.nhaTrangCentre, L.maiLinh),
      taxi('Pre-booked car', 'Name board', 'From ~$12', '40–55 min', 'Driver tracks the flight. Easier after a late Cam Ranh landing.', P.cxr, P.nhaTrangCentre, L.klook.CXR),
    ],
    'public-bus': [
      taxi('Dat Moi Bus 18', 'Best bus', '~₫60,000', '55–75 min', 'Booth in arrivals. Direct into Nha Trang centre along the coast.', P.cxr, P.nhaTrangCentre, L.go12),
    ],
    'rental-driver': [
      taxi('Car with driver', 'Coast days', '₫1.2–2.5m / day', 'Flexible', 'Airport leg plus islands / Điệp Sơn the next day.', P.cxr, P.nhaTrangCentre, L.klookDriver),
      taxi('Hertz desk', '1968 IDP only', 'From ~$38 / day', 'Desk hours', 'Thin compared with HAN/SGN. Confirm hours.', P.cxr, P.nhaTrangCentre, L.hertz),
    ],
  },
}

export function cityPicks(airportId: AirportId, modeId: TransportModeId): CityPick[] {
  return CITY_PICKS[airportId]?.[modeId] ?? []
}
