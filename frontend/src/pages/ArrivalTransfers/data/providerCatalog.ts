import type { AirportId, TransportModeId } from './types'

export type CatalogBooking = { kind: 'app' | 'desk' | 'web' | 'onboard'; label: string; url?: string; note: string }

export type CatalogProvider = {
  id: string
  name: string
  modeId: TransportModeId
  summary: string
  fare: string
  time: string
  pickup: string
  hours: string
  booking: CatalogBooking
  image: string
  goodFor: string
  priceFrom?: number
}

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const PROVIDER_LINKS = {
  klook: {
    HAN: 'https://www.klook.com/en-US/activity/airport-transfers-hanoi-29/',
    SGN: 'https://www.klook.com/en-US/activity/airport-transfers-ho-chi-minh-city-31/',
    DAD: 'https://www.klook.com/en-US/activity/airport-transfers-da-nang-33/',
    PQC: 'https://www.klook.com/en-US/activity/airport-transfers-phu-quoc-36/',
    CXR: 'https://www.klook.com/en-US/activity/airport-transfers-nha-trang-34/',
  } as Record<AirportId, string>,
  kkday: 'https://www.kkday.com/en/product/productlist?keyword=Vietnam+airport+transfer',
  trip: 'https://www.trip.com/airport-transfers/',
  viator: 'https://www.viator.com/searchResults/all?text=Vietnam%20airport%20transfer',
  vietnamPrivateCar: 'https://vietnamprivatecar.com/',
  airportTransfersVn: 'https://airporttransfers.vn/',
  maiLinh: 'https://www.mailinh.vn/',
  vinasun: 'https://www.vinasun.vn/',
  grab: 'https://www.grab.com/vn/',
  grabIos: 'https://apps.apple.com/app/grab-superapp/id647268330',
  grabPlay: 'https://play.google.com/store/apps/details?id=com.grabtaxi.passenger',
  xanh: 'https://www.xanhsm.com/',
  xanhIos: 'https://apps.apple.com/app/xanh-sm/id6444787709',
  xanhPlay: 'https://play.google.com/store/apps/details?id=com.gsm.customer',
  be: 'https://be.com.vn/',
  beIos: 'https://apps.apple.com/app/be-ride-food-delivery/id1442190418',
  bePlay: 'https://play.google.com/store/apps/details?id=xyz.be.customer',
  hertz: 'https://www.hertz.com/rentacar/reservation/',
  avis: 'https://www.avis.com/en/home',
  budget: 'https://www.budget.com/en/home',
  futa: 'https://futabus.vn/en-US',
  go12: 'https://12go.asia/en',
  vietnamAirlines: 'https://www.vietnamairlines.com/vn/en/home',
  vietjet: 'https://www.vietjetair.com/en',
  transerco: 'https://www.transerco.com.vn/',
  klookHoiAn: 'https://www.klook.com/en-US/search/result/?query=da%20nang%20airport%20hoi%20an%20shuttle',
  klookNhaTrang: 'https://www.klook.com/en-US/search/result/?query=cam%20ranh%20airport%20nha%20trang%20bus',
  klookDriver: 'https://www.klook.com/en-US/search/result/?query=vietnam%20private%20car%20with%20driver',
  kkdayDriver: 'https://www.kkday.com/en/product/productlist?keyword=Vietnam+car+with+driver',
  hanoiJourney: 'https://www.hanoijourney.com/product/private-car-rental-driver/',
  saigonPrivateCar: 'https://saigoncartransfer.com/',
  mioto: 'https://www.mioto.vn/',
  tigit: 'https://tigitmotorbikes.com/',
  styleMotorbikes: 'https://stylemotorbikes.com/',
  rentabike: 'https://rentabikevn.com/',
}

const CAR = img('photo-1449965408869-eaa3f409d32f')
const TAXI = img('photo-1511527661048-7f093d1f8c0b')
const BUS = img('photo-1570125909232-eb263c188f7e')
const RENT = img('photo-1492144534655-ae79c964c9d7')

function gp(
  p: Omit<CatalogProvider, 'summary' | 'pickup' | 'hours' | 'goodFor'> & {
    summary?: string
    pickup?: string
    hours?: string
    goodFor?: string
  },
): CatalogProvider {
  return {
    summary: p.summary ?? '',
    pickup: p.pickup ?? '',
    hours: p.hours ?? '',
    goodFor: p.goodFor ?? '',
    ...p,
  }
}

function web(label: string, url: string): CatalogProvider['booking'] {
  return { kind: 'web', label, url, note: '' }
}
function app(label: string, url: string): CatalogProvider['booking'] {
  return { kind: 'app', label, url, note: '' }
}
function desk(label: string, url?: string): CatalogProvider['booking'] {
  return { kind: 'desk', label, url, note: '' }
}
function onboard(label = 'Pay on board'): CatalogProvider['booking'] {
  return { kind: 'onboard', label, note: '' }
}

function carTaxi(code: AirportId, times: string, fromUsd: number): CatalogProvider[] {
  return [
    gp({
      id: `${code}-mailinh`,
      name: 'Mai Linh taxi',
      modeId: 'car-taxi',
      fare: `Meter ~$${fromUsd}–${fromUsd + 6}`,
      time: times,
      priceFrom: fromUsd,
      image: TAXI,
      summary: 'Plentiful at official taxi stands; no app setup needed.',
      booking: web('Mai Linh', PROVIDER_LINKS.maiLinh),
    }),
    gp({
      id: `${code}-vinasun`,
      name: 'Vinasun taxi',
      modeId: 'car-taxi',
      fare: `Meter ~$${fromUsd}–${fromUsd + 6}`,
      time: times,
      priceFrom: fromUsd + 0.5,
      image: TAXI,
      summary: 'Official white-cab ranks at SGN and other major airports.',
      booking: web('Vinasun', PROVIDER_LINKS.vinasun),
    }),
    gp({
      id: `${code}-klook`,
      name: 'Klook',
      modeId: 'car-taxi',
      fare: 'Pre-paid online',
      time: times,
      priceFrom: fromUsd + 4,
      image: CAR,
      summary: 'Driver waits at arrivals with a personalized sign; highly rated support.',
      booking: web('Book on Klook', PROVIDER_LINKS.klook[code]),
    }),
    gp({
      id: `${code}-kkday`,
      name: 'KKday',
      modeId: 'car-taxi',
      fare: 'Flat-rate transfers',
      time: times,
      priceFrom: fromUsd + 5,
      image: CAR,
      summary: 'Strong for airport runs to nearby cities such as Hoi An or Hue.',
      booking: web('Book on KKday', PROVIDER_LINKS.kkday),
    }),
    gp({
      id: `${code}-trip`,
      name: 'Trip.com',
      modeId: 'car-taxi',
      fare: 'Pre-paid online',
      time: times,
      priceFrom: fromUsd + 6,
      image: CAR,
      summary: 'OTA network with flight-tracking so drivers wait out delays.',
      booking: web('Book on Trip.com', PROVIDER_LINKS.trip),
    }),
    gp({
      id: `${code}-viator`,
      name: 'Viator',
      modeId: 'car-taxi',
      fare: 'Pre-paid online',
      time: times,
      priceFrom: fromUsd + 6.5,
      image: CAR,
      summary: 'Global OTA with verified local driver networks.',
      booking: web('Book on Viator', PROVIDER_LINKS.viator),
    }),
    gp({
      id: `${code}-vpc`,
      name: 'Vietnam Private Car',
      modeId: 'car-taxi',
      fare: 'Quote by route',
      time: times,
      priceFrom: fromUsd + 8,
      image: CAR,
      summary: 'Nationwide HAN, SGN, DAD, CXR — groups, luggage, intercity.',
      booking: web('vietnamprivatecar.com', PROVIDER_LINKS.vietnamPrivateCar),
    }),
    gp({
      id: `${code}-atvn`,
      name: 'AirportTransfers.vn',
      modeId: 'car-taxi',
      fare: 'Quote by route',
      time: times,
      priceFrom: fromUsd + 7,
      image: CAR,
      summary: 'Dedicated 24/7 WhatsApp dispatch for international arrivals.',
      booking: web('AirportTransfers.vn', PROVIDER_LINKS.airportTransfersVn),
    }),
  ]
}

function hail(code: AirportId, times: string, fromUsd: number): CatalogProvider[] {
  return [
    gp({
      id: `${code}-grab`,
      name: 'Grab',
      modeId: 'ride-hailing',
      fare: `Typically $${fromUsd}–${fromUsd + 5}`,
      time: times,
      priceFrom: fromUsd + 1,
      image: CAR,
      summary: 'Dominant ride-hailing app — cashless, upfront rates, huge fleet.',
      booking: app('Grab website / app', PROVIDER_LINKS.grab),
    }),
    gp({
      id: `${code}-xanh`,
      name: 'Xanh SM',
      modeId: 'ride-hailing',
      fare: `Typically $${fromUsd}–${fromUsd + 5}`,
      time: times,
      priceFrom: fromUsd + 1.5,
      image: TAXI,
      summary: 'VinFast EV fleet — clean cars, uniformed drivers, fixed pricing.',
      booking: app('Xanh SM website / app', PROVIDER_LINKS.xanh),
    }),
    gp({
      id: `${code}-be`,
      name: 'Be',
      modeId: 'ride-hailing',
      fare: `Typically $${fromUsd}–${fromUsd + 4}`,
      time: times,
      priceFrom: fromUsd,
      image: TAXI,
      summary: 'Local app, often cheaper at peak airport hours with promo codes.',
      booking: app('Be website / app', PROVIDER_LINKS.be),
    }),
  ]
}

function rentalDesks(code: AirportId, times: string): CatalogProvider[] {
  const hertz = gp({
    id: `${code}-hertz`,
    name: 'Hertz',
    modeId: 'rental-driver',
    fare: 'From ~$38 / day',
    time: times,
    priceFrom: 38,
    image: RENT,
    booking: web('Reserve on Hertz.com', PROVIDER_LINKS.hertz),
  })
  const avis = gp({
    id: `${code}-avis`,
    name: 'Avis',
    modeId: 'rental-driver',
    fare: 'From ~$32 / day',
    time: times,
    priceFrom: 32,
    image: RENT,
    booking: web('Reserve on Avis.com', PROVIDER_LINKS.avis),
  })
  const budget = gp({
    id: `${code}-budget`,
    name: 'Budget',
    modeId: 'rental-driver',
    fare: 'From ~$28 / day compact',
    time: times,
    priceFrom: 28,
    image: RENT,
    booking: web('Reserve on Budget.com', PROVIDER_LINKS.budget),
  })
  if (code === 'HAN' || code === 'SGN') return [hertz, avis, budget]
  if (code === 'DAD') return [hertz, avis]
  if (code === 'CXR') return [hertz]
  return []
}

function busCard(
  id: string,
  name: string,
  fare: string,
  priceFrom: number,
  time: string,
  booking: CatalogProvider['booking'] = onboard(),
): CatalogProvider {
  return gp({
    id,
    name,
    modeId: 'public-bus',
    fare,
    time,
    priceFrom,
    image: BUS,
    booking,
  })
}

const HAN_T = '45–60 min'
const SGN_T = '30–45 min'
const DAD_T = '10–15 min city · 45 min Hoi An'
const PQC_T = '20–35 min'
const CXR_T = '40–55 min'
const empty: CatalogProvider[] = []

function pack(
  car: CatalogProvider[],
  hailList: CatalogProvider[],
  bus: CatalogProvider[],
  rental: CatalogProvider[],
): Record<TransportModeId, CatalogProvider[]> {
  return {
    'car-taxi': car,
    'ride-hailing': hailList,
    'public-bus': bus,
    'rental-driver': rental,
    'private-transfer': empty,
    'shared-transfer': empty,
  }
}

export const PROVIDER_CATALOG: Record<AirportId, Record<TransportModeId, CatalogProvider[]>> = {
  HAN: pack(
    carTaxi('HAN', HAN_T, 10),
    hail('HAN', HAN_T, 10),
    [
      busCard('han-86', 'Express 86 · Hanoibus', '40,000–45,000 VND (~$1.80)', 1.8, '50–80 min'),
      busCard('han-17', 'City bus 17 · Long Biên', '~9,000 VND (~$0.40)', 0.4, '70–110 min'),
    ],
    rentalDesks('HAN', HAN_T),
  ),
  SGN: pack(
    carTaxi('SGN', SGN_T, 5),
    hail('SGN', SGN_T, 5),
    [
      busCard('sgn-152', 'Bus 152 · Bến Thành / Trung Sơn', '5,000–6,000 VND (~$0.25)', 0.25, '30–60 min'),
      busCard('sgn-109', 'Bus 109 · Công viên 23/9', '15,000–20,000 VND (~$0.70)', 0.7, '25–55 min'),
    ],
    rentalDesks('SGN', SGN_T),
  ),
  DAD: pack(
    carTaxi('DAD', DAD_T, 3),
    hail('DAD', '10–15 min city', 3),
    [
      busCard('dad-futa', 'FUTA Đà Nẵng ↔ Hoi An', '25,000–40,000 VND (~$1–1.60)', 1.2, '45–70 min', web('Tickets on FUTA', PROVIDER_LINKS.futa)),
      busCard('dad-city', 'City bus 06 · Non Nước', '~7,000–15,000 VND', 0.3, '25–50 min'),
    ],
    rentalDesks('DAD', '10–25 min to the city'),
  ),
  PQC: pack(
    carTaxi('PQC', PQC_T, 5),
    hail('PQC', PQC_T, 5),
    [
      busCard('pqc-dd', 'Dương Đông hotel shuttle', '~$3–6 / person', 4, '20–35 min', desk('Hotel / resort desk')),
    ],
    rentalDesks('PQC', PQC_T),
  ),
  CXR: pack(
    carTaxi('CXR', CXR_T, 10),
    hail('CXR', CXR_T, 10),
    [
      busCard('cxr-18', 'Dat Moi 18 · Nha Trang centre', '65,000–75,000 VND (~$2.70)', 2.7, '55–75 min', desk('Dat Moi booth in hall')),
    ],
    rentalDesks('CXR', CXR_T),
  ),
}

export function catalogProviders(airportId: AirportId, modeId: TransportModeId): CatalogProvider[] {
  const list = PROVIDER_CATALOG[airportId]?.[modeId] ?? []
  return [...list].sort((a, b) => (a.priceFrom ?? 99) - (b.priceFrom ?? 99))
}

export function findCatalogProvider(id: string): {
  airportId: AirportId
  provider: CatalogProvider
} | null {
  for (const airportId of Object.keys(PROVIDER_CATALOG) as AirportId[]) {
    for (const list of Object.values(PROVIDER_CATALOG[airportId])) {
      const hit = list.find((p) => p.id === id)
      if (hit) return { airportId, provider: hit }
    }
  }
  return null
}

export function siblingProviders(id: string): CatalogProvider[] {
  const found = findCatalogProvider(id)
  if (!found) return []
  return catalogProviders(found.airportId, found.provider.modeId).filter((p) => p.id !== id)
}
