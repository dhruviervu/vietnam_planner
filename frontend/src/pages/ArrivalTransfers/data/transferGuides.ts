import type { AirportId, ArrivalContext, TransportModeId } from './types'
import { BUS_NETWORK, type BusLine } from './busNetwork'

export type { BusLine, BusStop } from './busNetwork'

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export type BookingKind = 'app' | 'desk' | 'web' | 'onboard'

export type GuideProvider = {
  id: string
  name: string
  modeId: TransportModeId
  summary: string
  fare: string
  time: string
  pickup: string
  hours: string
  booking: { kind: BookingKind; label: string; url?: string; note: string }
  image: string
  goodFor: string
  /** Lower = better value. Used to sort catalogs. */
  priceFrom?: number
}

export type SafetyPoint = { title: string; note: string }

export type AirportGuide = {
  distanceNote: string
  seat61Note: string | null
  safety: Partial<Record<TransportModeId, SafetyPoint[]>>
  providers: GuideProvider[]
  buses: BusLine[]
  rentals: GuideProvider[]
}

const GRAB_IOS = 'https://apps.apple.com/app/grab-superapp/id647268330'
const GRAB_PLAY = 'https://play.google.com/store/apps/details?id=com.grabtaxi.passenger'
const BE_IOS = 'https://apps.apple.com/app/be-ride-food-delivery/id1442190418'
const BE_PLAY = 'https://play.google.com/store/apps/details?id=xyz.be.customer'
const XANH_IOS = 'https://apps.apple.com/app/xanh-sm/id6444787709'
const XANH_PLAY = 'https://play.google.com/store/apps/details?id=com.gsm.customer'
const GO12 = 'https://12go.asia/en'
const KLOOK_HAN = 'https://www.klook.com/en-US/activity/airport-transfers-hanoi-29/'
const KLOOK_SGN = 'https://www.klook.com/en-US/activity/airport-transfers-ho-chi-minh-city-31/'
const KLOOK_DAD = 'https://www.klook.com/en-US/activity/airport-transfers-da-nang-33/'
const HERTZ = 'https://www.hertz.com/rentacar/reservation/'
const AVIS = 'https://www.avis.com/en/home'

const grabHow =
  'Grab is an app, not a website. Open Grab on your phone, set pickup to the official airport pin (never a random “Grab.com” page — that is marketing, not a booking desk). Walk to the marked Grab / ride-hailing zone shown in the app.'

function grab(id: string, fare: string, time: string, pickup: string): GuideProvider {
  return {
    id,
    name: 'Grab Car',
    modeId: 'car-taxi',
    summary: 'Metered in-app fare, tracked driver, English UI. This is how most visitors leave Vietnamese airports.',
    fare,
    time,
    pickup,
    hours: '24/7 at major airports (cars thin out 01:00–05:00)',
    booking: {
      kind: 'app',
      label: 'Open the Grab app',
      url: GRAB_IOS,
      note: grabHow,
    },
    image: img('photo-1449965408869-eaa3f409d32f'),
    goodFor: 'Solo, couples, anyone with data. Skip grab.com.',
  }
}

function be(id: string, fare: string, time: string, pickup: string): GuideProvider {
  return {
    id,
    name: 'Be (ride-hail)',
    modeId: 'car-taxi',
    summary: 'Vietnamese rival to Grab. Often a few dollars cheaper; same airport pickup-bay idea.',
    fare,
    time,
    pickup,
    hours: 'Typically 24/7 in Hanoi, HCMC, Da Nang',
    booking: {
      kind: 'app',
      label: 'Open the Be app',
      url: BE_IOS,
      note: 'Install Be before you land if you can. There is no useful English booking website — the app is the product.',
    },
    image: img('photo-1502877338535-766e1452684a'),
    goodFor: 'Price check against Grab before you accept.',
  }
}

function xanh(id: string, fare: string, time: string, pickup: string): GuideProvider {
  return {
    id,
    name: 'Xanh SM (GSM)',
    modeId: 'car-taxi',
    summary: 'Electric taxis from Vingroup. Fixed in-app pricing, calm cars, English enough for airport pins.',
    fare,
    time,
    pickup,
    hours: 'Strong daytime coverage; overnight is thinner than Grab',
    booking: {
      kind: 'app',
      label: 'Open the Xanh SM app',
      url: XANH_IOS,
      note: 'Use the Xanh SM / GSM app. Do not chase random “Xanh taxi” links — desks at some airports can also call a car if the app fails.',
    },
    image: img('photo-1558618666-fcd25c85f82e'),
    goodFor: 'Quieter ride, slightly more formal than Grab.',
  }
}

export const APP_STORE_LINKS = {
  grab: { ios: GRAB_IOS, android: GRAB_PLAY },
  be: { ios: BE_IOS, android: BE_PLAY },
  xanh: { ios: XANH_IOS, android: XANH_PLAY },
}

const HAN: AirportGuide = {
  distanceNote:
    'Noi Bai sits ~27–32 km north of the Old Quarter. Almost everyone uses Nhật Tân Bridge. Off-peak 35–50 min; 07:00–09:00 and 16:30–19:00 can run 70–90 min.',
  seat61Note:
    'The Man in Seat 61 treats Ga Hà Nội as the city’s rail hub for the Reunification Line (Huế, Đà Nẵng, Saigon) and the Lào Cai / Sapa sleepers. Express Bus 86’s last stop is that station — useful if you are going straight onto a train, useless if your hotel is in Tây Hồ and you stay on to the terminus.',
  safety: {
    'private-transfer': [
      { title: 'Name board inside T2', note: 'Licensed drivers wait in the arrivals hall, not in the car park scrum. Confirm the plate matches the voucher before you leave the building.' },
      { title: 'Flight-aware wait', note: 'A real transfer tracks the flight. If a tout says the “pre-booked car cancelled”, that is a classic swap — call the number on your confirmation.' },
    ],
    'car-taxi': [
      { title: 'Apps, not lobby men', note: 'Anyone inside arrivals offering a “taxi” is selling a private fare. Walk to the Grab/Be/Xanh zone or the official taxi rank with a posted price board.' },
      { title: 'Nhat Tan toll', note: 'The bridge toll is real and small. It should already be in a Grab fare. On a street taxi, watch that it is not “added” twice.' },
    ],
    'shared-transfer': [
      { title: 'Hotel, not “Old Quarter”', note: 'Shared vans drop a zone, then walk you. Confirm the drop is your hotel street, not Long Biên station “close enough”.' },
    ],
    'public-bus': [
      { title: 'Bus 86 is the tourist line', note: 'Look for “86” and Ga Hà Nội on the destination board. Ordinary city buses (7, 17) are cheaper but crawl and dump you far from most hotels.' },
      { title: 'Cash đồng only', note: 'Conductor collects on board. Have 50,000–100,000 VND notes. Cards and Grab pay do not work here.' },
      { title: 'T2 stop is left of arrivals', note: 'International: exit, turn left ~80–100 m to the marked 86 bay. Ignore anyone steering you to a minivan “same price”.' },
    ],
    'rental-driver': [
      { title: 'Self-drive is the hard mode', note: 'Hanoi motorbikes do not pause. If you have never driven here, take a car-with-driver for the first day rather than a Hertz key at 23:00.' },
    ],
  },
  providers: [
    {
      id: 'han-klook',
      name: 'Pre-booked private car (Klook)',
      modeId: 'private-transfer',
      summary: 'English voucher, meet-and-greet at T2, sedan or Innova. Price is per car to a named address — the sane choice after a long-haul into HAN.',
      fare: 'From ~$13–22 / car',
      time: '35–55 min off-peak',
      pickup: 'T2 international arrivals, name sign',
      hours: '24/7 when pre-booked',
      booking: {
        kind: 'web',
        label: 'Book on Klook (browser)',
        url: KLOOK_HAN,
        note: 'This is an actual checkout page, not an app wall. Use your hotel address as the drop — “Hanoi” is too vague.',
      },
      image: img('photo-1549317661-bd32c8ce0db2'),
      goodFor: 'Families, late flights, heavy luggage.',
    },
    {
      id: 'han-12go',
      name: 'Private / shared transfer (12Go)',
      modeId: 'private-transfer',
      summary: '12Go is the English booking layer Seat 61 recommends for Vietnam buses and many airport cars. You pay in a browser; the operator is local.',
      fare: 'Private from ~$15 · shared from ~$6',
      time: '40–70 min (shared waits)',
      pickup: 'Arrivals, operator sign',
      hours: 'Scheduled; last shared vans often ~22:00',
      booking: {
        kind: 'web',
        label: 'Search HAN transfers on 12Go',
        url: GO12,
        note: 'Search “Noi Bai” → your area. 12Go is a real English site (the same one Seat 61 uses for trains/buses). Avoid random Facebook “airport taxi” pages.',
      },
      image: img('photo-1485291571150-772bcfc10da5'),
      goodFor: 'When you want a voucher without installing five apps.',
    },
    grab('han-grab', 'Typically $10–16 to Old Quarter', '35–60 min', 'In-app “Noi Bai T2” pickup bay'),
    be('han-be', 'Typically $9–15', '35–60 min', 'Same ride-hailing bays as Grab'),
    xanh('han-xanh', 'Typically $10–16', '35–60 min', 'Xanh SM airport pin in the app'),
    {
      id: 'han-taxi-noi-bai',
      name: 'Taxi Nội Bài (official rank)',
      modeId: 'car-taxi',
      summary: 'Airport-company cars at the rank with a published tariff to central Hanoi. Use the rank, not a lobby intermediary.',
      fare: 'Posted ~300,000–450,000 VND ($12–18)',
      time: '35–60 min',
      pickup: 'Official taxi rank outside T2',
      hours: '24/7',
      booking: {
        kind: 'desk',
        label: 'Use the airport taxi rank',
        note: 'No website you need. Take a numbered car from the rank. If there is no meter / no tariff card, walk to the next car. Mai Linh green cabs are the other safe rank brand.',
      },
      image: img('photo-1511527661048-7f093d1f8c0b'),
      goodFor: 'No SIM card yet, late night when apps are thin.',
    },
    {
      id: 'han-shared-hotel',
      name: 'Hotel / Old Quarter shuttle',
      modeId: 'shared-transfer',
      summary: 'Shared minibuses sold at 12Go or hotel desks. Cheaper per seat than a car; you wait for other passengers and may stop 2–4 times in the centre.',
      fare: '$5–9 / person',
      time: '50–85 min including waits',
      pickup: 'Arrivals or shuttle island',
      hours: 'Daytime–evening; rare after 22:00',
      booking: {
        kind: 'web',
        label: 'Compare on 12Go',
        url: GO12,
        note: 'Book a named hotel drop. “Hanoi city” shared tickets often terminate at a travel cafe on Hàng Bạc — then you still need a Grab for the last kilometre.',
      },
      image: img('photo-1544620341-11cb2f96f2ca'),
      goodFor: 'Solo, light bags, daytime.',
    },
  ],
  buses: BUS_NETWORK.HAN ?? [],
  rentals: [
    {
      id: 'han-hertz',
      name: 'Hertz — Nội Bài',
      modeId: 'rental-driver',
      summary: 'International desk in the terminal. English contract, CDW options, and a car you can take onward to Ninh Bình or Hạ Long.',
      fare: 'From ~$35–55 / day compact',
      time: '35–55 min to the city',
      pickup: 'Hertz counter, T2 arrivals / rental island',
      hours: 'Desk hours follow flight banks; pre-book for late arrivals',
      booking: {
        kind: 'web',
        label: 'Reserve on Hertz.com',
        url: HERTZ,
        note: 'Use Hertz’s own site (airport = HAN). A prepaid voucher beats arguing insurance in arrivals. Driving Hanoi after a night flight is a bad first hour in Vietnam.',
      },
      image: img('photo-1492144534655-ae79c964c9d7'),
      goodFor: 'Onward road trip, not a 8 km hop to a hotel.',
    },
    {
      id: 'han-avis',
      name: 'Avis / Budget — Nội Bài',
      modeId: 'rental-driver',
      summary: 'Same terminal cluster as Hertz. Budget is often the cheaper sibling brand at the same desk family.',
      fare: 'From ~$30–50 / day',
      time: '35–55 min to the city',
      pickup: 'Avis/Budget airport counter',
      hours: 'Pre-book; walk-up inventory is thin',
      booking: {
        kind: 'web',
        label: 'Reserve on Avis.com',
        url: AVIS,
        note: 'Choose HAN airport location. Add full cover if you are not used to scooters on every shoulder.',
      },
      image: img('photo-1503376780353-7e6692767b70'),
      goodFor: 'Familiar international rental paper trail.',
    },
    {
      id: 'han-driver-day',
      name: 'Car with driver (day hire)',
      modeId: 'rental-driver',
      summary: 'Innova or similar with a driver who already knows Nhật Tân, the Old Quarter bans, and where a tourist car can actually stop.',
      fare: 'From ~$45–70 / half day after the airport drop',
      time: '35–55 min to the city',
      pickup: 'Meet-and-greet or hotel next morning',
      hours: 'By arrangement',
      booking: {
        kind: 'web',
        label: 'Arrange via 12Go / hotel',
        url: GO12,
        note: 'For a single hotel drop this is overkill. It shines the next day (Perfume Pagoda, Ninh Bình) — book that, not a “rental” you will fear in the Old Quarter.',
      },
      image: img('photo-1511919884225-912b1b2dd5ad'),
      goodFor: 'Day trips after you land, groups of 3–6.',
    },
  ],
}

const SGN: AirportGuide = {
  distanceNote:
    'Tân Sơn Nhất is inside the city — 6–8 km to District 1. The clock is traffic, not distance: 20 min at 10:00, 50–70 min at 17:30 on Hoàng Văn Thụ / Cộng Hòa.',
  seat61Note:
    'Seat 61’s Saigon station (Ga Sài Gòn, 1 Nguyễn Thông, D3) is not the airport bus terminus. Bus 109 ends at 23/9 Park by Phạm Ngũ Lão. For a Reunification Line train, ride 109 to Bến Thành then a short Grab to Ga Sài Gòn — or take a car straight there.',
  safety: {
    'private-transfer': [
      { title: 'Domestic vs international halls', note: 'SGN still splits terminals. Put the correct hall on the voucher or the driver waits at the other door.' },
    ],
    'car-taxi': [
      { title: 'Vinasun / Mai Linh ranks', note: 'White Vinasun and green Mai Linh at the official rank are the meter brands. Lobby “taxi 150,000 fixed” is usually 250,000 plus a toll story.' },
      { title: 'Airport taxi surcharge', note: 'A legal airport surcharge exists. Grab already includes it. On a meter, you should see it as a line, not a round-number extra in cash.' },
    ],
    'shared-transfer': [
      { title: 'D1 is not D7', note: 'Shared vans love Phạm Ngũ Lão. Phú Mỹ Hưng / D7 is a different direction — book a private car.' },
    ],
    'public-bus': [
      { title: '109 is the visitor bus', note: 'Yellow/green airport 109 has luggage space and ends at 23/9 Park (backpacker streets). 152 is the cheap local that continues south to Trung Sơn.' },
      { title: '49 is a hotel shuttle, not a city bus', note: 'Route 49 skips ordinary stops and serves big hotels / Notre Dame / Opera. Do not wait for it at a random red-and-white city pole.' },
    ],
    'rental-driver': [
      { title: 'Motorcycle rain', note: 'Self-drive in D1 in the wet season is a parking and one-way puzzle. A driver for the first afternoon is cheaper than a scraped bumper.' },
    ],
  },
  providers: [
    {
      id: 'sgn-klook',
      name: 'Pre-booked private car (Klook)',
      modeId: 'private-transfer',
      summary: 'Fixed price to a District 1–3 address. Worth it when you land into the 16:00–19:00 jam and do not want to negotiate in arrivals.',
      fare: 'From ~$8–16 / car to D1',
      time: '20–55 min',
      pickup: 'Correct terminal arrivals, name sign',
      hours: '24/7 when pre-booked',
      booking: {
        kind: 'web',
        label: 'Book on Klook (browser)',
        url: KLOOK_SGN,
        note: 'Browser checkout. Put the hotel name and district. “District 1” alone can still be a 20-minute argument.',
      },
      image: img('photo-1549317661-bd32c8ce0db2'),
      goodFor: 'Families, late, first time in Saigon.',
    },
    {
      id: 'sgn-12go',
      name: 'Private / shared (12Go)',
      modeId: 'private-transfer',
      summary: 'English platform Seat 61 already uses for Vietnam. Shared seats make sense only if you are going to Phạm Ngũ Lão / Bến Thành.',
      fare: 'Private from ~$9 · shared from ~$4',
      time: '25–70 min',
      pickup: 'Arrivals sign',
      hours: 'Shared mostly 06:00–22:00',
      booking: { kind: 'web', label: 'Search SGN on 12Go', url: GO12, note: 'Real English site. Skip Facebook “Saigon airport taxi” groups.' },
      image: img('photo-1485291571150-772bcfc10da5'),
      goodFor: 'Voucher without another app.',
    },
    grab('sgn-grab', 'Typically $4–11 to D1 (surge at rush hour)', '20–55 min', 'In-app Tân Sơn Nhất pin — follow the pickup bay map'),
    be('sgn-be', 'Typically $4–10', '20–55 min', 'Ride-hailing bays at the terminal'),
    xanh('sgn-xanh', 'Typically $5–11', '20–55 min', 'Xanh SM airport pin'),
    {
      id: 'sgn-vinasun',
      name: 'Vinasun / Mai Linh rank',
      modeId: 'car-taxi',
      summary: 'The two meter brands visitors can actually audit. Rank is outside arrivals; staff in uniform, not polo shirts with a laminated “taxi” card.',
      fare: 'Meter ~150,000–250,000 VND + airport fee ($6–10)',
      time: '20–55 min',
      pickup: 'Official taxi rank',
      hours: '24/7',
      booking: {
        kind: 'desk',
        label: 'Take the official rank',
        note: 'No website required. Vinasun white, Mai Linh green. Insist the meter starts. If it “is broken”, take the next car.',
      },
      image: img('photo-1511527661048-7f093d1f8c0b'),
      goodFor: 'No data, short hop, you can see the meter.',
    },
  ],
  buses: BUS_NETWORK.SGN ?? [],
  rentals: [
    {
      id: 'sgn-hertz',
      name: 'Hertz — Tân Sơn Nhất',
      modeId: 'rental-driver',
      summary: 'Desk in the airport. Useful if you are leaving Saigon by road the same day (Mũi Né, Vũng Tàu), not for a weekend in D1.',
      fare: 'From ~$35–60 / day',
      time: '20–55 min',
      pickup: 'Airport rental counters',
      hours: 'Pre-book for evening banks',
      booking: { kind: 'web', label: 'Reserve on Hertz.com', url: HERTZ, note: 'Location SGN. Parking in D1 will cost more than the Grab you skipped.' },
      image: img('photo-1492144534655-ae79c964c9d7'),
      goodFor: 'Leaving the city by car.',
    },
    {
      id: 'sgn-avis',
      name: 'Avis — Tân Sơn Nhất',
      modeId: 'rental-driver',
      summary: 'International counter, English contract.',
      fare: 'From ~$32–55 / day',
      time: '20–55 min',
      pickup: 'Avis airport counter',
      hours: 'Pre-book',
      booking: { kind: 'web', label: 'Reserve on Avis.com', url: AVIS, note: 'Pick SGN airport. Full cover if this is your first Vietnam drive.' },
      image: img('photo-1503376780353-7e6692767b70'),
      goodFor: 'Paper trail + onward highway.',
    },
  ],
}

const DAD: AirportGuide = {
  distanceNote:
    'Đà Nẵng airport is 3–6 km from the river/Han Market and ~8 km from Mỹ Khê. Hoi An is a different trip: ~25–30 km south, 45–70 min. Seat 61 is blunt: Hoi An has no railway station — you land here, then go by road.',
  seat61Note:
    'Seat 61: Hoi An is 30 km south of Đà Nẵng with no station of its own. Train travellers finish at Ga Đà Nẵng, then road. Local bus 01 to Hoi An was diverted after Covid and has not been a reliable tourist tool since — do not plan your arrival around it. Shared minibuses and cars (12Go) replaced it.',
  safety: {
    'private-transfer': [
      { title: 'Say Hoi An or Đà Nẵng', note: 'Drivers at DAD assume “the beach” is Mỹ Khê. If you booked An Bàng / Hoi An, that must be on the voucher or you will be arguing at the river.' },
    ],
    'car-taxi': [
      { title: 'Short ride, still a rank', note: 'The city is close, which is why touts overcharge — “200,000 fixed” for a 15-minute hop. Grab/Be usually land 70,000–150,000 VND to the centre.' },
    ],
    'shared-transfer': [
      { title: 'Hoi An vans wait for a load', note: 'Shared Hoi An cars can sit 20–40 min. If you land at 23:00, pay for private.' },
    ],
    'public-bus': [
      { title: 'There is no Bus 86 here', note: 'Đà Nẵng does not run a dedicated airport express into the centre worth planning around. City buses exist; visitors use Grab or a car. For Hoi An, use a listed minibus, not a rumour of bus 01.' },
    ],
    'rental-driver': [
      { title: 'This is the easy airport to drive', note: 'Wide coast road to Hoi An / Mỹ Sơn. Still: scooters at dusk, and Hoi An’s old town is not a place to park a Hertz.' },
    ],
  },
  providers: [
    {
      id: 'dad-klook',
      name: 'Private car — Đà Nẵng or Hoi An (Klook)',
      modeId: 'private-transfer',
      summary: 'The correct product if Hoi An / An Bàng is the drop. Price is per car, 45–70 min south on the coastal highway.',
      fare: 'City from ~$5–8 · Hoi An from ~$12–18',
      time: '10–25 min city · 45–70 min Hoi An',
      pickup: 'Arrivals, name sign',
      hours: '24/7 pre-booked',
      booking: { kind: 'web', label: 'Book on Klook (browser)', url: KLOOK_DAD, note: 'Choose Đà Nẵng vs Hoi An as two different products. Browser checkout.' },
      image: img('photo-1549317661-bd32c8ce0db2'),
      goodFor: 'Hoi An arrivals, families, late flights.',
    },
    {
      id: 'dad-12go',
      name: 'Super Air Bus / shared van (12Go)',
      modeId: 'shared-transfer',
      summary: 'Named shared vans (often “Super Air Bus” and hotel shuttles) are how backpackers cover DAD → Hoi An now that bus 01 is not a plan.',
      fare: '$4–8 / person to Hoi An',
      time: '55–90 min including wait',
      pickup: 'Arrivals or shuttle lane',
      hours: 'Mostly 07:00–21:00',
      booking: { kind: 'web', label: 'Book the named van on 12Go', url: GO12, note: 'Seat 61’s booking habit: 12Go in a browser. Confirm drop = your Hoi An street, not “bus station 2 km west”.' },
      image: img('photo-1544620341-11cb2f96f2ca'),
      goodFor: 'Daytime Hoi An, light bags, solo.',
    },
    grab('dad-grab', 'City $3–6 · Hoi An $10–16', '10–25 min city · 45–70 Hoi An', 'Grab pin at DAD — it is a short walk'),
    be('dad-be', 'Usually matches or undercuts Grab', '10–70 min', 'App pickup bay'),
    {
      id: 'dad-taxi',
      name: 'Airport taxi rank',
      modeId: 'car-taxi',
      summary: 'Fine for Mỹ Khê or the river if you check the meter. A “fixed 250k to Hoi An” can be fair; a “fixed 250k to the city” is not.',
      fare: 'City ~80,000–150,000 VND · Hoi An ~250,000–400,000',
      time: '10–70 min',
      pickup: 'Rank outside arrivals',
      hours: '24/7',
      booking: { kind: 'desk', label: 'Use the rank, meter on', note: 'No website. Mai Linh if you see the green. For Hoi An agree the number before the boot closes.' },
      image: img('photo-1511527661048-7f093d1f8c0b'),
      goodFor: 'No SIM, short city hop.',
    },
  ],
  buses: BUS_NETWORK.DAD ?? [],
  rentals: [
    {
      id: 'dad-hertz',
      name: 'Hertz / Avis — Đà Nẵng',
      modeId: 'rental-driver',
      summary: 'Small airport, rental desks in the terminal. This is the one Vietnam airport where a compact car for Hoi An + Mỹ Sơn + Huế can make sense.',
      fare: 'From ~$28–50 / day',
      time: '10–25 min to the city',
      pickup: 'Rental counters at DAD',
      hours: 'Pre-book; last desks follow evening flights',
      booking: { kind: 'web', label: 'Reserve on Hertz.com', url: HERTZ, note: 'Location DAD. Do not drive into Hoi An Ancient Town — park outside and walk.' },
      image: img('photo-1492144534655-ae79c964c9d7'),
      goodFor: 'Coastal looping for a few days.',
    },
    {
      id: 'dad-driver',
      name: 'Car with driver to Hoi An / Huế',
      modeId: 'rental-driver',
      summary: 'The Hải Vân Pass to Huế is gorgeous and tiring. A driver for that day is the local choice; self-drive is for people who already know the tunnel vs the pass.',
      fare: 'Hoi An drop ~$15 · Huế day from ~$70',
      time: '45–70 min to Hoi An',
      pickup: 'Arrivals or hotel',
      hours: 'By arrangement',
      booking: { kind: 'web', label: 'Book via 12Go', url: GO12, note: 'English voucher, named driver. Better than improvising a Huế car at the airport kerb.' },
      image: img('photo-1511919884225-912b1b2dd5ad'),
      goodFor: 'Hải Vân / Huế without driving it yourself.',
    },
  ],
}

const PQC: AirportGuide = {
  distanceNote:
    'Phú Quốc airport is ~10 km from Dương Đông. 20–35 min. Long Beach / sunset strip is a slightly different heading than the night market.',
  seat61Note: null,
  safety: {
    'private-transfer': [
      { title: 'Resort gates close', note: 'JW, New World, Salinda etc. need the driver on the guest list. Put the resort name, not “Long Beach”.' },
    ],
    'car-taxi': [
      { title: 'Grab exists, thin at midnight', note: 'If you land on a late propeller, pre-book. The kerb will still sell you a car at a holiday price.' },
    ],
    'shared-transfer': [
      { title: 'Hotel shuttles are real here', note: 'Many resorts include or sell a van. That is usually better than a shared “Dương Đông” drop 4 km from your gate.' },
    ],
    'public-bus': [
      { title: 'No city airport express', note: 'Phú Quốc does not have a Hanoi-86 equivalent. Plan Grab, taxi, or the hotel van.' },
    ],
    'rental-driver': [
      { title: 'Motorbike default', note: 'Cars are for families and rainy season. International desks are limited — many “rentals” are local shops in Dương Đông, not the terminal.' },
    ],
  },
  providers: [
    {
      id: 'pqc-klook',
      name: 'Private car / resort van',
      modeId: 'private-transfer',
      summary: 'Fixed drop to Dương Đông or a named resort. The island is small; the value is not waiting for a Grab at 23:40.',
      fare: 'From ~$8–18 / car',
      time: '20–40 min',
      pickup: 'Arrivals',
      hours: 'Match the flight if pre-booked',
      booking: { kind: 'web', label: 'Book on 12Go', url: GO12, note: 'English checkout. Put the resort name. “Phu Quoc” is the whole island.' },
      image: img('photo-1549317661-bd32c8ce0db2'),
      goodFor: 'Resorts, families, late.',
    },
    grab('pqc-grab', 'Typically $5–12', '20–35 min', 'Airport Grab pin — coverage is decent by day'),
    {
      id: 'pqc-taxi',
      name: 'Airport taxi',
      modeId: 'car-taxi',
      summary: 'Rank outside. Agree Dương Đông vs Long Beach vs Sao Beach before you move — they are not the same fare.',
      fare: 'Often 150,000–300,000 VND depending on beach',
      time: '20–40 min',
      pickup: 'Rank',
      hours: 'Last flights included',
      booking: { kind: 'desk', label: 'Agree the destination and price', note: 'No useful website. Write the resort name on your phone and show it.' },
      image: img('photo-1511527661048-7f093d1f8c0b'),
      goodFor: 'No data, named resort.',
    },
  ],
  buses: BUS_NETWORK.PQC ?? [],
  rentals: [
    {
      id: 'pqc-local',
      name: 'Island car / motorbike hire',
      modeId: 'rental-driver',
      summary: 'Terminal car hire is limited. Most visitors hire a motorbike in Dương Đông the next morning. A car with driver is the comfortable island-day option (Grand World, Sao Beach, fish sauce factories).',
      fare: 'Motorbike ~$6–10 / day · car+driver from ~$40',
      time: '20–35 min',
      pickup: 'Hotel or Dương Đông shop',
      hours: 'Daylight for first-time scooter riders',
      booking: { kind: 'desk', label: 'Ask the hotel desk', note: 'Skip random “rental” WhatsApp from the airport kerb. Hotel bikes are boring and insured-enough.' },
      image: img('photo-1507525428034-b723cf961d3e'),
      goodFor: 'Day 2 exploring, not the 22:00 arrival.',
    },
  ],
}

const CXR: AirportGuide = {
  distanceNote:
    'Cam Ranh is ~35–40 km south of Nha Trang. Taxi 40–50 min. The coastal road is the trip; there is no “short cut through town”.',
  seat61Note:
    'Nha Trang station is in the city, not at Cam Ranh airport. If you are joining Seat 61’s Reunification Line, you still need this road transfer first (or last).',
  safety: {
    'private-transfer': [
      { title: 'Column C / name sign', note: 'Pre-booked cars wait in arrivals. The Dat Moi bus booth is a different queue — do not let a bus tout “upgrade” you at triple the bus fare.' },
    ],
    'car-taxi': [
      { title: 'Mai Linh at the rank', note: 'Green Mai Linh or the posted airport taxi. Unmarked men inside the hall are the expensive lesson.' },
    ],
    'shared-transfer': [
      { title: 'Hotel vs Trần Phú drop', note: 'Some shuttles end on the beach road, not at your resort in Cam Ranh town. Check the drop, not the word “Nha Trang”.' },
    ],
    'public-bus': [
      { title: 'Dat Moi 18 is the city bus', note: 'Ticket at the Dat Moi booth in the hall, then board outside. Electric 16-2 is a different line — it is for Vinpearl / Cam Ranh beach, not the backpacker centre.' },
    ],
    'rental-driver': [
      { title: 'Highway, then city one-ways', note: 'Easy until Trần Phú. If you only need Nha Trang beach, a car-with-driver for the airport leg is enough.' },
    ],
  },
  providers: [
    {
      id: 'cxr-private',
      name: 'Private car to Nha Trang',
      modeId: 'private-transfer',
      summary: 'Fixed 40–50 min up the coast. The option that still exists when Dat Moi’s last bus has gone.',
      fare: 'From ~$12–18 / car',
      time: '40–55 min',
      pickup: 'Arrivals name sign',
      hours: '24/7 pre-booked',
      booking: { kind: 'web', label: 'Book on 12Go', url: GO12, note: 'English site. Search Cam Ranh (CXR) → Nha Trang. Put the hotel on Trần Phú or Phạm Văn Đồng.' },
      image: img('photo-1549317661-bd32c8ce0db2'),
      goodFor: 'Late flights, families, resorts.',
    },
    grab('cxr-grab', 'Typically $10–15', '40–55 min', 'Grab pin at CXR — wait in the marked bay'),
    {
      id: 'cxr-mailinh',
      name: 'Mai Linh / airport taxi',
      modeId: 'car-taxi',
      summary: 'Rank outside. Typical 300,000–400,000 VND to central Nha Trang if the meter or posted tariff is used.',
      fare: '~$12–16',
      time: '40–55 min',
      pickup: 'Official rank',
      hours: 'Until last arrivals',
      booking: { kind: 'desk', label: 'Official rank only', note: 'No website. Ignore hall interceptors. Mai Linh green is the simple rule.' },
      image: img('photo-1511527661048-7f093d1f8c0b'),
      goodFor: 'No app, one hotel on the beach.',
    },
  ],
  buses: BUS_NETWORK.CXR ?? [],
  rentals: [
    {
      id: 'cxr-driver',
      name: 'Car with driver / local hire',
      modeId: 'rental-driver',
      summary: 'International desks are thinner than HAN/SGN. A driver for the airport + a Điệp Sơn / island day is the usual pattern.',
      fare: 'Airport car ~$13–18 · day hire from ~$50',
      time: '40–55 min',
      pickup: 'Arrivals or hotel',
      hours: 'By arrangement',
      booking: { kind: 'web', label: '12Go or hotel', url: GO12, note: 'FUTA’s site is for coaches. For a car, 12Go or the hotel — not a Facebook “Cam Ranh driver”.' },
      image: img('photo-1511919884225-912b1b2dd5ad'),
      goodFor: 'Airport plus a coastal day.',
    },
  ],
}

export const AIRPORT_GUIDES: Partial<Record<AirportId, AirportGuide>> = {
  HAN,
  SGN,
  DAD,
  PQC,
  CXR,
}

export function providersForMode(airportId: AirportId, modeId: TransportModeId): GuideProvider[] {
  const g = AIRPORT_GUIDES[airportId] ?? AIRPORT_GUIDES.HAN
  if (!g) return []
  if (modeId === 'rental-driver') return g.rentals
  return g.providers.filter((p) => p.modeId === modeId)
}

export function modeHasCatalog(airportId: AirportId, modeId: TransportModeId) {
  return providersForMode(airportId, modeId).length > 0
}

export function timeOfDayLabel(t: ArrivalContext['arrivalTime']) {
  if (t === 'morning') return 'morning'
  if (t === 'afternoon') return 'afternoon'
  if (t === 'evening') return 'evening'
  if (t === 'late') return 'late night'
  return null
}
