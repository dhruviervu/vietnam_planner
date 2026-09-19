export type IslandId =
  | 'phu-quoc'
  | 'con-dao'
  | 'cat-ba'
  | 'cham'
  | 'ly-son'
  | 'phu-quy'
  | 'nam-du'
  | 'hon-son'
  | 'co-to'
  | 'quan-lan'

export type IslandRouteKind = 'flight' | 'ferry' | 'fast-boat' | 'mix'

export type IslandProvider = {
  id: string
  name: string
  operator: string
  kind: IslandRouteKind | 'marketplace'
  note: string
  bookingUrl: string
  priceLabel: string
}

export type IslandRoute = {
  id: string
  title: string
  badge: 'best' | 'value' | 'scenic' | 'only'
  kind: IslandRouteKind
  fromLabel: string
  toLabel: string
  durationLabel: string
  costLabel: string
  steps: string[]
  why: string
  weatherNote?: string
  providerIds: string[]
}

export type IslandCorridor = {
  id: IslandId
  label: string
  region: string
  lat: number
  lng: number
  summary: string
  hasAirport: boolean
  mainlandPorts: { label: string; lat: number; lng: number }[]
  routes: IslandRoute[]
  providers: IslandProvider[]
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function twelveGoFerry(from: string, to: string) {
  return `https://12go.asia/en/ferry/${slug(from)}/${slug(to)}/`
}

export function twelveGoTravel(from: string, to: string) {
  return `https://12go.asia/en/travel/${slug(from)}/${slug(to)}`
}

export function baolauBoat(from: string, to: string) {
  const a = from.replace(/\s+/g, '-')
  const b = to.replace(/\s+/g, '-')
  return `https://www.baolau.com/en/s/${a}/${b}/boat`
}

export function klookQuery(q: string) {
  return `https://www.klook.com/en-US/search/?query=${encodeURIComponent(q)}`
}

export function gygQuery(q: string) {
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}`
}

export function googleFlights(fromCode: string, toCode: string) {
  return `https://www.google.com/travel/flights?q=Flights%20${encodeURIComponent(fromCode)}%20to%20${encodeURIComponent(toCode)}`
}

export const WATER_SCOPE_PARAGRAPH = `This section is only about water as real transport — boats that take you on and off islands, and the handful of Vietnamese waters where a boat is how people actually move. It is not a freight briefing, and it is not city sightseeing on the Saigon or Perfume rivers.

The island crossings that matter for travellers are: Phú Quốc (fast ferries from Hà Tiên in about 45–80 minutes, or from Rạch Giá in about 2–2.5 hours; most visitors from Ho Chi Minh City still fly SGN–PQC); Côn Đảo (flights from Tân Sơn Nhất, plus high-speed ferries from Vũng Tàu in about 3.5–4.5 hours, Trần Đề / Sóc Trăng in about 2.5 hours, or Hiệp Phước in HCMC in about 5 hours); Cát Bà (no road all the way onto the island — drive or bus to Đồng Bài on Cát Hải, then a 20–30 minute ferry to Cái Viềng, or the Cát Hải–Phù Long cable car, or the scenic Tuần Châu–Gia Luân ferry from Hạ Long; the old Gót pier closed in 2024); Cù Lao Chàm off Hội An (speedboats from Cửa Đại, typically 20–50 minutes, day-return); Lý Sơn (Sa Kỳ port, Quảng Ngãi, about 30–75 minutes); Phú Quý (Phan Thiết, about 2.5–3.5 hours); Nam Du, Hòn Sơn and Hòn Tre in Kiên Giang (Superdong from Rạch Giá, about 1.5–2.5 hours, with short hops between those islands); and Cô Tô plus Quan Lạn in Quảng Ninh (Cái Rồng / Ao Tiên in Vân Đồn, plus Hòn Gai from Hạ Long for Quan Lạn).

On the mainland, water is still transport in a few places: Hạ Long and Lan Ha overnight cruises (sleep on the bay, not a city hop); Mekong canals out of Cần Thơ, Mỹ Tho and Bến Tre for floating markets and homestays; sampans through Tràng An / Tam Cốc in Ninh Bình; Nha Trang day boats to Hòn Mun and Hòn Tằm; a hydrofoil or fast boat HCMC–Vũng Tàu; and the Châu Đốc speedboat onward to Phnom Penh if you are leaving Vietnam. Saigon’s waterbus exists, but Grab still wins for getting across District 1. Pick an island below for the accurate mix — usually a taxi or scooter only as far as the port, then the ferry or a flight. You cannot ride a scooter to the mainland.`

export const ISLAND_CORRIDORS: IslandCorridor[] = [
  {
    id: 'phu-quoc',
    label: 'Phu Quoc',
    region: 'Southwest',
    lat: 10.227,
    lng: 103.967,
    summary:
      'Vietnam’s busiest resort island. Fly from Saigon in about an hour, or taxi to Hà Tiên and take a fast catamaran.',
    hasAirport: true,
    mainlandPorts: [
      { label: 'Ha Tien port', lat: 10.3833, lng: 104.4833 },
      { label: 'Rach Gia port', lat: 10.0125, lng: 105.0802 },
    ],
    routes: [
      {
        id: 'pq-flight-sgn',
        title: 'Fly Ho Chi Minh City → Phu Quoc (PQC)',
        badge: 'best',
        kind: 'flight',
        fromLabel: 'Tan Son Nhat (SGN)',
        toLabel: 'Phu Quoc (PQC)',
        durationLabel: '~1h airborne · ~3–4h door to door',
        costLabel: '$35–90',
        steps: [
          'Grab or taxi to Tân Sơn Nhất (30–70 min from D1, traffic dependent).',
          'Fly VietJet, Vietnam Airlines, or Bamboo — several daily SGN–PQC.',
          'Airport is on the island: 15–35 min taxi or hotel transfer to Long Beach / Duong Dong.',
        ],
        why: 'The realistic default from Saigon. Faster and calmer than a 5–7 hour ground-plus-ferry day with luggage.',
        providerIds: ['pq-gflights', 'pq-12go-travel', 'pq-klook-flight'],
      },
      {
        id: 'pq-hatien-ferry',
        title: 'Taxi / bus to Ha Tien + fast ferry',
        badge: 'value',
        kind: 'mix',
        fromLabel: 'HCMC or Ha Tien',
        toLabel: 'Bai Vong port, Phu Quoc',
        durationLabel: 'Ha Tien crossing 45–80 min · from HCMC 5.5–7.5h',
        costLabel: '$8–18 ferry · $12–40 ground',
        steps: [
          'From the island: Grab or scooter only as far as Bãi Vòng ferry port (not to the mainland).',
          'Superdong or Phú Quốc Express catamaran to Hà Tiên (about 45–80 min).',
          'From Hà Tiên: taxi into town, or a 4.5–6h car/bus onward to Ho Chi Minh City.',
        ],
        why: 'The true island ↔ mainland mix. Scooter is the last mile to the pier — the sea crossing is always a boat.',
        weatherNote: 'Southwest monsoon (roughly June–November) cancels sailings. Keep a buffer night.',
        providerIds: ['pq-12go-hatien', 'pq-baolau-hatien', 'pq-superdong', 'pq-pqexpress'],
      },
      {
        id: 'pq-rachgia-ferry',
        title: 'Rach Gia ferry (longer crossing)',
        badge: 'scenic',
        kind: 'ferry',
        fromLabel: 'Rach Gia',
        toLabel: 'Phu Quoc',
        durationLabel: '~2–2.5h on the water',
        costLabel: '$8–14',
        steps: [
          'Reach Rạch Giá by car or bus from HCMC (~4–5h) or fly to the small mainland airport.',
          'Superdong / Phú Quốc Express to the island (~2–2.5h).',
          'Taxi from the island port to your hotel — do not plan to keep a mainland hire scooter.',
        ],
        why: 'Useful if you are already in Kiên Giang. From Saigon, Hà Tiên is the shorter sea leg.',
        providerIds: ['pq-12go-rg', 'pq-superdong', 'pq-baolau-rg'],
      },
    ],
    providers: [
      {
        id: 'pq-gflights',
        name: 'Google Flights SGN → PQC',
        operator: 'Google Flights',
        kind: 'flight',
        note: 'Compare VietJet, Vietnam Airlines, and Bamboo on the same bag rules.',
        bookingUrl: googleFlights('SGN', 'PQC'),
        priceLabel: 'Live fares',
      },
      {
        id: 'pq-12go-travel',
        name: '12Go · HCMC to Phu Quoc',
        operator: '12Go',
        kind: 'marketplace',
        note: 'Opens the city pair so you can see flights and combined tickets together.',
        bookingUrl: twelveGoTravel('ho chi minh city', 'phu quoc'),
        priceLabel: 'Live',
      },
      {
        id: 'pq-klook-flight',
        name: 'Klook · Phu Quoc flights & transfers',
        operator: 'Klook',
        kind: 'marketplace',
        note: 'Airport transfers and flight+hotel bundles already searched for Phu Quoc.',
        bookingUrl: klookQuery('Phu Quoc flight airport transfer'),
        priceLabel: 'From ~$8 transfer',
      },
      {
        id: 'pq-12go-hatien',
        name: '12Go · Ha Tien ↔ Phu Quoc ferry',
        operator: '12Go',
        kind: 'ferry',
        note: 'Superdong and Phú Quốc Express sailings, date-ready.',
        bookingUrl: twelveGoFerry('ha tien', 'phu quoc'),
        priceLabel: 'From ~$8',
      },
      {
        id: 'pq-baolau-hatien',
        name: 'Baolau · Ha Tien–Phu Quoc boat',
        operator: 'Baolau',
        kind: 'ferry',
        note: 'Same corridor on Baolau’s boat search, not a generic Vietnam homepage.',
        bookingUrl: baolauBoat('Ha-Tien', 'Phu-Quoc'),
        priceLabel: 'From ~$8',
      },
      {
        id: 'pq-superdong',
        name: 'Superdong timetable',
        operator: 'Superdong',
        kind: 'fast-boat',
        note: 'Official catamaran schedule for Hà Tiên, Rạch Giá, Nam Du and Côn Đảo legs.',
        bookingUrl: 'https://online.superdong.com.vn/Home/ScheduleBoat',
        priceLabel: 'Operator fares',
      },
      {
        id: 'pq-pqexpress',
        name: 'Phu Quoc Express',
        operator: 'Phu Quoc Express',
        kind: 'fast-boat',
        note: 'Official catamarans on Hà Tiên / Rạch Giá ↔ Phú Quốc.',
        bookingUrl: 'https://phuquocexpress.com/en/',
        priceLabel: 'Operator fares',
      },
      {
        id: 'pq-12go-rg',
        name: '12Go · Rach Gia ↔ Phu Quoc',
        operator: '12Go',
        kind: 'ferry',
        note: 'The longer Kiên Giang crossing, pre-filtered.',
        bookingUrl: twelveGoFerry('rach gia', 'phu quoc'),
        priceLabel: 'From ~$8',
      },
      {
        id: 'pq-baolau-rg',
        name: 'Baolau · Rach Gia boat',
        operator: 'Baolau',
        kind: 'ferry',
        note: 'Rạch Giá–Phú Quốc boat search.',
        bookingUrl: baolauBoat('Rach-Gia', 'Phu-Quoc'),
        priceLabel: 'From ~$8',
      },
    ],
  },
  {
    id: 'con-dao',
    label: 'Con Dao',
    region: 'Southeast',
    lat: 8.6833,
    lng: 106.6167,
    summary:
      'A national-park archipelago. Fly from Saigon when you can; the Vũng Tàu ferry is the sea backup, not a scooter hop.',
    hasAirport: true,
    mainlandPorts: [
      { label: 'Vung Tau ferry harbour', lat: 10.346, lng: 107.0843 },
      { label: 'Tran De, Soc Trang', lat: 9.47, lng: 106.19 },
    ],
    routes: [
      {
        id: 'cd-flight',
        title: 'Fly Ho Chi Minh City → Con Dao (VCS)',
        badge: 'best',
        kind: 'flight',
        fromLabel: 'Tan Son Nhat (SGN)',
        toLabel: 'Con Dao (VCS)',
        durationLabel: '~1h airborne · ~3.5h door to door',
        costLabel: '$50–140',
        steps: [
          'Taxi to Tân Sơn Nhất.',
          'Vietnam Airlines / Bamboo on SGN–VCS (fewer frequencies than Phu Quoc — book early).',
          'Short taxi from the island airstrip to town or the park lodges.',
        ],
        why: 'The honest way onto Côn Đảo with luggage. Sea state can wipe out the ferry for days.',
        providerIds: ['cd-gflights', 'cd-12go-travel', 'cd-klook'],
      },
      {
        id: 'cd-vungtau',
        title: 'Car to Vung Tau + high-speed ferry',
        badge: 'value',
        kind: 'mix',
        fromLabel: 'HCMC → Vung Tau harbour',
        toLabel: 'Con Dao',
        durationLabel: '2h road + 3.5–4.5h sea',
        costLabel: '$20–45 ferry · $12–35 road',
        steps: [
          'Grab or pre-booked car HCMC → Vũng Tàu express harbour (~1.5–2.5h).',
          'Phú Quốc Express / Côn Đảo high-speed ferry (~3.5–4.5h). Arrive 45 min early.',
          'On the island, taxi or hotel pickup — there is no bridge and no scooter path from the mainland.',
        ],
        why: 'The realistic sea mix when flights are sold out. Never a self-drive scooter.',
        weatherNote: 'June–November cancellations are common. Confirm the night before.',
        providerIds: ['cd-12go-vt', 'cd-pqexpress', 'cd-baolau'],
      },
      {
        id: 'cd-trande',
        title: 'Tran De (Soc Trang) ferry',
        badge: 'scenic',
        kind: 'ferry',
        fromLabel: 'Tran De',
        toLabel: 'Con Dao',
        durationLabel: '~2.5h on the water',
        costLabel: '$18–35',
        steps: [
          'Overland to Trần Đề in Sóc Trăng (long from Saigon — usually a planned Mekong day).',
          'High-speed ferry to Côn Đảo (~2.5h).',
          'Island taxi to your stay.',
        ],
        why: 'Shorter sea time if you are already in the Mekong. Not a shortcut from District 1.',
        providerIds: ['cd-superdong', 'cd-pqexpress'],
      },
    ],
    providers: [
      {
        id: 'cd-gflights',
        name: 'Google Flights SGN → VCS',
        operator: 'Google Flights',
        kind: 'flight',
        note: 'Con Dao seats are thin — compare dates before you lock hotels.',
        bookingUrl: googleFlights('SGN', 'VCS'),
        priceLabel: 'Live fares',
      },
      {
        id: 'cd-12go-travel',
        name: '12Go · HCMC to Con Dao',
        operator: '12Go',
        kind: 'marketplace',
        note: 'City pair already opened for flights and boats.',
        bookingUrl: twelveGoTravel('ho chi minh city', 'con dao'),
        priceLabel: 'Live',
      },
      {
        id: 'cd-klook',
        name: 'Klook · Con Dao',
        operator: 'Klook',
        kind: 'marketplace',
        note: 'Transfers and island days, searched for Côn Đảo.',
        bookingUrl: klookQuery('Con Dao ferry flight'),
        priceLabel: 'Varies',
      },
      {
        id: 'cd-12go-vt',
        name: '12Go · Vung Tau ↔ Con Dao',
        operator: '12Go',
        kind: 'ferry',
        note: 'The harbour-to-island search, not a Vietnam homepage.',
        bookingUrl: twelveGoFerry('vung tau', 'con dao'),
        priceLabel: 'From ~$20',
      },
      {
        id: 'cd-baolau',
        name: 'Baolau · Vung Tau boat',
        operator: 'Baolau',
        kind: 'ferry',
        note: 'Boat inventory for Vũng Tàu–Côn Đảo.',
        bookingUrl: baolauBoat('Vung-Tau', 'Con-Dao'),
        priceLabel: 'From ~$20',
      },
      {
        id: 'cd-pqexpress',
        name: 'Phu Quoc Express · Con Dao',
        operator: 'Phu Quoc Express',
        kind: 'fast-boat',
        note: 'Operator also runs Vũng Tàu / Trần Đề–Côn Đảo catamarans.',
        bookingUrl: 'https://phuquocexpress.com/en/',
        priceLabel: 'Operator fares',
      },
      {
        id: 'cd-superdong',
        name: 'Superdong · Soc Trang–Con Dao',
        operator: 'Superdong',
        kind: 'ferry',
        note: 'Official Trần Đề / Sóc Trăng timetable.',
        bookingUrl: 'https://online.superdong.com.vn/Home/ScheduleBoat',
        priceLabel: 'Operator fares',
      },
    ],
  },
  {
    id: 'cat-ba',
    label: 'Cat Ba',
    region: 'Northeast',
    lat: 20.7275,
    lng: 107.048,
    summary:
      'The inhabited island of the Ha Long–Cat Ba UNESCO seascape. Ferries from Hải Phòng or Tuần Châu — not a scooter from Hanoi.',
    hasAirport: false,
    mainlandPorts: [
      { label: 'Dong Bai / Hai Phong', lat: 20.78, lng: 106.88 },
      { label: 'Tuan Chau, Ha Long', lat: 20.9357, lng: 106.9901 },
    ],
    routes: [
      {
        id: 'cb-haiphong',
        title: 'Van to Dong Bai + ferry to Cai Vieng',
        badge: 'best',
        kind: 'mix',
        fromLabel: 'Hanoi / Hai Phong',
        toLabel: 'Cat Ba town',
        durationLabel: '~2h van + 20–30 min ferry + 30–45 min island taxi',
        costLabel: '$8–18 combined',
        steps: [
          'Limousine or bus Hanoi → Hải Phòng (~2h), then taxi or bus 16C to Đồng Bài on Cát Hải. Do not go to the old Gót pier — it closed to public ferries in 2024.',
          'Car ferry Đồng Bài → Cái Viềng (about 20–30 min). You can take a scooter or car on the boat.',
          'Cái Viềng is not town: taxi or bus another 22–25 km (30–45 min) to Cát Bà town. Island scooters are for after you land.',
        ],
        why: 'The everyday visitor mix. There is still no bridge onto Cát Bà itself — the last stretch is always water or the cable car.',
        providerIds: ['cb-12go', 'cb-klook', 'cb-gyg'],
      },
      {
        id: 'cb-cable',
        title: 'Cat Hai – Phu Long cable car',
        badge: 'value',
        kind: 'mix',
        fromLabel: 'Dong Bai, Cat Hai',
        toLabel: 'Phu Long, Cat Ba',
        durationLabel: '~10–15 min in the air after the same Cat Hai approach',
        costLabel: 'Cable-car fare + taxi to town',
        steps: [
          'Reach Đồng Bài the same way as the ferry (bridge to Cát Hải).',
          'Sun World cable car to Phù Long on Cát Bà — useful if you are not taking a vehicle across.',
          'Taxi from Phù Long to Cát Bà town.',
        ],
        why: 'A realistic alternative to the car ferry for foot passengers. Still not a scooter from Hanoi.',
        providerIds: ['cb-klook', 'cb-cable'],
      },
      {
        id: 'cb-tuanchau',
        title: 'Ha Long (Tuan Chau) → Gia Luan ferry',
        badge: 'scenic',
        kind: 'ferry',
        fromLabel: 'Tuan Chau',
        toLabel: 'Gia Luan, Cat Ba',
        durationLabel: '~45–75 min',
        costLabel: '$5–12',
        steps: [
          'Reach Tuần Châu from Hạ Long city (taxi).',
          'Ferry to Gia Luân on the north of Cát Bà — more like a short bay crossing than a city hop.',
          'Taxi across the island to Cat Ba town (~30–40 min).',
        ],
        why: 'Best if you are already on the bay. Combine with a Lan Ha day boat, not a Hanoi scooter.',
        providerIds: ['cb-klook', 'cb-12go'],
      },
    ],
    providers: [
      {
        id: 'cb-12go',
        name: '12Go · Hai Phong ↔ Cat Ba',
        operator: '12Go',
        kind: 'ferry',
        note: 'Ferry inventory for the Hải Phòng crossing.',
        bookingUrl: twelveGoFerry('hai phong', 'cat ba'),
        priceLabel: 'From ~$5',
      },
      {
        id: 'cb-klook',
        name: 'Klook · Cat Ba / Lan Ha',
        operator: 'Klook',
        kind: 'marketplace',
        note: 'Ferries, day boats, and Hanoi transfers already queried.',
        bookingUrl: klookQuery('Cat Ba ferry Hai Phong'),
        priceLabel: 'From ~$12',
      },
      {
        id: 'cb-gyg',
        name: 'GetYourGuide · Cat Ba',
        operator: 'GetYourGuide',
        kind: 'marketplace',
        note: 'Island and Lan Ha boat days with pickup notes on the product page.',
        bookingUrl: gygQuery('Cat Ba ferry Lan Ha'),
        priceLabel: 'Tours from ~$40',
      },
      {
        id: 'cb-cable',
        name: 'Klook · Cat Hai cable car',
        operator: 'Klook',
        kind: 'marketplace',
        note: 'Search is pre-filled for the Cát Hải–Phù Long cable car onto Cát Bà.',
        bookingUrl: klookQuery('Cat Hai Phu Long cable car Cat Ba'),
        priceLabel: 'Live',
      },
    ],
  },
  {
    id: 'cham',
    label: 'Cu Lao Cham',
    region: 'Central',
    lat: 15.95,
    lng: 108.52,
    summary:
      'Biosphere islands 15 km off Hội An. Morning speedboats from Cửa Đại; monsoon months often shut the sea.',
    hasAirport: false,
    mainlandPorts: [{ label: 'Cua Dai port, Hoi An', lat: 15.877, lng: 108.374 }],
    routes: [
      {
        id: 'cham-speed',
        title: 'Cua Dai speedboat (day return)',
        badge: 'best',
        kind: 'fast-boat',
        fromLabel: 'Cua Dai, Hoi An',
        toLabel: 'Bai Lang, Cham',
        durationLabel: '20–50 min each way',
        costLabel: '$8–25 boat · tours $35–70',
        steps: [
          'Taxi or hotel shuttle from Hội An / An Bàng to Cửa Đại (10–20 min).',
          'Speedboat 08:00–09:00 season; wooden boat is slower and once a day.',
          'Return boats typically 13:00–17:00. Bring your passport; visitor caps apply.',
        ],
        why: 'A day island, not a new base. October–February swell cancels boats — have a Hoi An backup.',
        weatherNote: 'Central-Vietnam storm season (roughly Oct–Feb) is the wrong window.',
        providerIds: ['cham-klook', 'cham-gyg', 'cham-12go'],
      },
    ],
    providers: [
      {
        id: 'cham-klook',
        name: 'Klook · Cham Island',
        operator: 'Klook',
        kind: 'fast-boat',
        note: 'Snorkel day tours with Cửa Đại pickup already searched.',
        bookingUrl: klookQuery('Cham Island Hoi An speedboat'),
        priceLabel: 'From ~$25',
      },
      {
        id: 'cham-gyg',
        name: 'GetYourGuide · Cu Lao Cham',
        operator: 'GetYourGuide',
        kind: 'marketplace',
        note: 'Hoi An hotel pickup products.',
        bookingUrl: gygQuery('Cu Lao Cham Hoi An'),
        priceLabel: 'From ~$30',
      },
      {
        id: 'cham-12go',
        name: '12Go · Da Nang / Hoi An boats',
        operator: '12Go',
        kind: 'ferry',
        note: 'Boat listings when operators publish them.',
        bookingUrl: twelveGoTravel('hoi an', 'cham island'),
        priceLabel: 'Live',
      },
    ],
  },
  {
    id: 'ly-son',
    label: 'Ly Son',
    region: 'Central',
    lat: 15.38,
    lng: 109.12,
    summary: 'Volcanic island off Quảng Ngãi. The only public way is the Sa Kỳ fast ferry.',
    hasAirport: false,
    mainlandPorts: [{ label: 'Sa Ky port', lat: 15.208, lng: 108.92 }],
    routes: [
      {
        id: 'ls-saky',
        title: 'Sa Ky fast ferry',
        badge: 'only',
        kind: 'fast-boat',
        fromLabel: 'Sa Ky, Quang Ngai',
        toLabel: 'Ly Son',
        durationLabel: '30–75 min',
        costLabel: '$6–12',
        steps: [
          'Reach Sa Kỳ from Quảng Ngãi city or Đà Nẵng by car (~1.5–3h depending on start).',
          'Phú Quốc Express and local fast boats; buy the day before in peak holidays.',
          'Xe ôm on the island. No airport, no bridge, no scooter from the mainland.',
        ],
        why: 'A dedicated island trip. Pair with a Quảng Ngãi night, not a same-day Hoi An squeeze.',
        weatherNote: 'Central sea can close with little notice.',
        providerIds: ['ls-pqexpress', 'ls-12go', 'ls-klook'],
      },
    ],
    providers: [
      {
        id: 'ls-pqexpress',
        name: 'Phu Quoc Express · Sa Ky–Ly Son',
        operator: 'Phu Quoc Express',
        kind: 'fast-boat',
        note: 'Operator lists the Sa Kỳ–Lý Sơn catamaran on the official site.',
        bookingUrl: 'https://phuquocexpress.com/en/',
        priceLabel: 'Operator fares',
      },
      {
        id: 'ls-12go',
        name: '12Go · Ly Son ferry',
        operator: '12Go',
        kind: 'ferry',
        note: 'Sa Kỳ–Lý Sơn when inventory is loaded.',
        bookingUrl: twelveGoFerry('sa ky', 'ly son'),
        priceLabel: 'From ~$6',
      },
      {
        id: 'ls-klook',
        name: 'Klook · Ly Son',
        operator: 'Klook',
        kind: 'marketplace',
        note: 'Tours and boat days searched for Lý Sơn.',
        bookingUrl: klookQuery('Ly Son ferry Sa Ky'),
        priceLabel: 'Varies',
      },
    ],
  },
  {
    id: 'phu-quy',
    label: 'Phu Quy',
    region: 'Southeast',
    lat: 10.52,
    lng: 108.94,
    summary: 'Quiet island off Phan Thiết. Fast ferry only — schedules change by day.',
    hasAirport: false,
    mainlandPorts: [{ label: 'Phan Thiet port', lat: 10.933, lng: 108.1 }],
    routes: [
      {
        id: 'pqy-pt',
        title: 'Phan Thiet fast ferry',
        badge: 'only',
        kind: 'fast-boat',
        fromLabel: 'Phan Thiet',
        toLabel: 'Phu Quy',
        durationLabel: '2.5–3.5h',
        costLabel: '$12–22',
        steps: [
          'Bus or car to Phan Thiết (from HCMC ~4–5h).',
          'Check the live timetable — some weekdays have no sailing.',
          'Arrive 40 minutes early. Island xe ôm on arrival.',
        ],
        why: 'Not a Phu Quoc substitute. Confirm the boat the morning you travel.',
        providerIds: ['pqy-vetauphuquy', 'pqy-pqexpress', 'pqy-12go'],
      },
    ],
    providers: [
      {
        id: 'pqy-vetauphuquy',
        name: 'Ve Tau Phu Quy live schedule',
        operator: 'Phu Quy ferry',
        kind: 'fast-boat',
        note: 'Daily-updated Phan Thiết ↔ Phú Quý times. Read it before you leave Saigon.',
        bookingUrl: 'https://vetauphuquy.vn/schedule/',
        priceLabel: 'Operator fares',
      },
      {
        id: 'pqy-pqexpress',
        name: 'Phu Quoc Express · Phan Thiet–Phu Quy',
        operator: 'Phu Quoc Express',
        kind: 'fast-boat',
        note: 'Operator also runs this corridor.',
        bookingUrl: 'https://phuquocexpress.com/en/',
        priceLabel: 'Operator fares',
      },
      {
        id: 'pqy-12go',
        name: '12Go · Phan Thiet ↔ Phu Quy',
        operator: '12Go',
        kind: 'ferry',
        note: 'Boat search for the pair.',
        bookingUrl: twelveGoFerry('phan thiet', 'phu quy'),
        priceLabel: 'Live',
      },
    ],
  },
  {
    id: 'nam-du',
    label: 'Nam Du',
    region: 'Southwest',
    lat: 10.03,
    lng: 104.68,
    summary: 'Kiên Giang island cluster. Superdong from Rạch Giá; also a hop from Phú Quốc.',
    hasAirport: false,
    mainlandPorts: [{ label: 'Rach Gia', lat: 10.0125, lng: 105.0802 }],
    routes: [
      {
        id: 'nd-rg',
        title: 'Rach Gia → Nam Du (Superdong)',
        badge: 'best',
        kind: 'ferry',
        fromLabel: 'Rach Gia',
        toLabel: 'Nam Du',
        durationLabel: '~2h · morning boats',
        costLabel: '$8–14',
        steps: [
          'Overland to Rạch Giá from HCMC (~4–5h) or from Hà Tiên.',
          'Superdong typically 07:30 and 08:30 out; returns around 11:00–11:50.',
          'Local boats between islets. Scooter stays on Nam Du — not a mainland ride.',
        ],
        why: 'A Kiên Giang sea day or overnight, not a Saigon urban hop.',
        providerIds: ['nd-superdong', 'nd-12go'],
      },
      {
        id: 'nd-pq',
        title: 'Phu Quoc → Nam Du',
        badge: 'scenic',
        kind: 'ferry',
        fromLabel: 'Phu Quoc',
        toLabel: 'Nam Du',
        durationLabel: 'Morning boat (check timetable)',
        costLabel: '$10–18',
        steps: [
          'Superdong lists a Phú Quốc–Nam Du sailing (often 08:00 out, 14:00 back).',
          'Confirm the day’s ship — this is thinner than the Hà Tiên run.',
        ],
        why: 'Island-to-island, still a ferry. Never a scooter between them.',
        providerIds: ['nd-superdong'],
      },
    ],
    providers: [
      {
        id: 'nd-superdong',
        name: 'Superdong · Nam Du timetable',
        operator: 'Superdong',
        kind: 'ferry',
        note: 'Official Rạch Giá / Phú Quốc / Nam Du hours.',
        bookingUrl: 'https://online.superdong.com.vn/Home/ScheduleBoat',
        priceLabel: 'Operator fares',
      },
      {
        id: 'nd-12go',
        name: '12Go · Rach Gia ↔ Nam Du',
        operator: '12Go',
        kind: 'ferry',
        note: 'Boat search for Nam Du.',
        bookingUrl: twelveGoFerry('rach gia', 'nam du'),
        priceLabel: 'Live',
      },
    ],
  },
  {
    id: 'hon-son',
    label: 'Hon Son',
    region: 'Southwest',
    lat: 10.14,
    lng: 104.5,
    summary: 'Also called Lại Sơn. Morning Superdong from Rạch Giá, with a short link to Nam Du.',
    hasAirport: false,
    mainlandPorts: [{ label: 'Rach Gia', lat: 10.0125, lng: 105.0802 }],
    routes: [
      {
        id: 'hs-rg',
        title: 'Rach Gia → Hon Son',
        badge: 'best',
        kind: 'ferry',
        fromLabel: 'Rach Gia',
        toLabel: 'Hon Son',
        durationLabel: 'Morning boat (~2h)',
        costLabel: '$8–14',
        steps: [
          'Superdong around 06:35 from Rạch Giá; return around 12:00.',
          'Hòn Sơn–Nam Du is about 30 minutes if you are island-hopping.',
        ],
        why: 'A fishermen’s island with a scheduled catamaran — still not rideable from the mainland.',
        providerIds: ['hs-superdong'],
      },
    ],
    providers: [
      {
        id: 'hs-superdong',
        name: 'Superdong · Hon Son',
        operator: 'Superdong',
        kind: 'ferry',
        note: 'Rạch Giá–Hòn Sơn and Hòn Sơn–Nam Du on the official board.',
        bookingUrl: 'https://online.superdong.com.vn/Home/ScheduleBoat',
        priceLabel: 'Operator fares',
      },
    ],
  },
  {
    id: 'co-to',
    label: 'Co To',
    region: 'Northeast',
    lat: 20.9835,
    lng: 107.7619,
    summary: 'Quảng Ninh’s far island. High-speed boats from Cái Rồng (Vân Đồn) through the day.',
    hasAirport: false,
    mainlandPorts: [{ label: 'Cai Rong, Van Don', lat: 21.06, lng: 107.42 }],
    routes: [
      {
        id: 'ct-cairong',
        title: 'Cai Rong (Van Don) high-speed ferry',
        badge: 'best',
        kind: 'fast-boat',
        fromLabel: 'Cai Rong',
        toLabel: 'Co To',
        durationLabel: '~1–1.5h · many daytime sailings',
        costLabel: '$8–16',
        steps: [
          'From Hạ Long or Hanoi: van to Vân Đồn / Cái Rồng port.',
          'Multiple local operators (Havaco and others) from early morning to late afternoon.',
          'Buy at the pier or the day before on Vietnamese holidays.',
        ],
        why: 'Northeast island logistics: van + boat. Leave the scooter at the port town.',
        providerIds: ['ct-klook', 'ct-12go'],
      },
    ],
    providers: [
      {
        id: 'ct-klook',
        name: 'Klook · Co To',
        operator: 'Klook',
        kind: 'marketplace',
        note: 'Island tours and transfers when listed.',
        bookingUrl: klookQuery('Co To island ferry Van Don'),
        priceLabel: 'Varies',
      },
      {
        id: 'ct-12go',
        name: '12Go · Van Don / Co To',
        operator: '12Go',
        kind: 'ferry',
        note: 'Boat search for Cô Tô.',
        bookingUrl: twelveGoFerry('van don', 'co to'),
        priceLabel: 'Live',
      },
    ],
  },
  {
    id: 'quan-lan',
    label: 'Quan Lan',
    region: 'Northeast',
    lat: 20.8764,
    lng: 107.4941,
    summary:
      'Bái Tử Long island with three mainland gates: Ao Tiên (Vân Đồn), Hòn Gai (Hạ Long), and Vũng Đục (Cẩm Phả).',
    hasAirport: false,
    mainlandPorts: [
      { label: 'Ao Tien, Van Don', lat: 21.05, lng: 107.38 },
      { label: 'Hon Gai, Ha Long', lat: 20.951, lng: 107.08 },
    ],
    routes: [
      {
        id: 'ql-aotien',
        title: 'Ao Tien (Van Don) fast ferry',
        badge: 'best',
        kind: 'fast-boat',
        fromLabel: 'Ao Tien',
        toLabel: 'Quan Lan',
        durationLabel: '~1h · several daytime boats',
        costLabel: '$6–14',
        steps: [
          'Van from Hạ Long or Hanoi to Ao Tiên.',
          'Typical outbound 07:00, 09:30, 11:30, 13:30 — confirm locally.',
          'Returns into the afternoon. Weather in the gulf still cancels.',
        ],
        why: 'The usual visitor gate. Hon Gai is better if you are already in Hạ Long city.',
        providerIds: ['ql-klook', 'ql-12go'],
      },
      {
        id: 'ql-hongai',
        title: 'Hon Gai (Ha Long) ferry',
        badge: 'scenic',
        kind: 'ferry',
        fromLabel: 'Hon Gai',
        toLabel: 'Quan Lan',
        durationLabel: '~60 min',
        costLabel: '$7–15',
        steps: [
          'Taxi to Hòn Gai port in Hạ Long.',
          'Morning and afternoon high-speed boats (operators such as Havaco / Phúc Thịnh).',
        ],
        why: 'Skip the Vân Đồn transfer if you slept in Hạ Long.',
        providerIds: ['ql-klook'],
      },
    ],
    providers: [
      {
        id: 'ql-klook',
        name: 'Klook · Quan Lan / Bai Tu Long',
        operator: 'Klook',
        kind: 'marketplace',
        note: 'Island boats and Bai Tu Long day trips.',
        bookingUrl: klookQuery('Quan Lan ferry Ha Long'),
        priceLabel: 'Varies',
      },
      {
        id: 'ql-12go',
        name: '12Go · Quan Lan',
        operator: '12Go',
        kind: 'ferry',
        note: 'Boat search when the pair is listed.',
        bookingUrl: twelveGoFerry('ha long', 'quan lan'),
        priceLabel: 'Live',
      },
    ],
  },
]

export const ALSO_ON_THE_WATER: {
  id: string
  title: string
  body: string
  bookingUrl: string
}[] = [
  {
    id: 'halong-cruise',
    title: 'Ha Long & Lan Ha overnight cruises',
    body: 'Sleep on the bay — this is the product, not a city bus. Book a 1N/2D or 2N/3D junk with a Lan Ha itinerary if you want quieter water.',
    bookingUrl: klookQuery('Ha Long Bay overnight cruise Lan Ha'),
  },
  {
    id: 'mekong',
    title: 'Mekong canals — Can Tho, My Tho, Ben Tre',
    body: 'Cái Răng floating market boats leave before dawn. Mỹ Tho and Bến Tre are canal days from Saigon. Hire is by the hour or a packaged speedboat.',
    bookingUrl: klookQuery('Cai Rang floating market Can Tho boat'),
  },
  {
    id: 'ninh-binh',
    title: 'Trang An / Tam Coc sampans',
    body: 'Rowed boats through limestone — the only way into the creeks. Buy at the park quay; it is not a ferry to another city.',
    bookingUrl: klookQuery('Trang An boat Ninh Binh'),
  },
  {
    id: 'hue-hoian-river',
    title: 'Hue Perfume River & Hoi An Thu Bon',
    body: 'Sunset sampans and lantern boats. Lovely, short, and not how you leave the city.',
    bookingUrl: klookQuery('Hue Perfume River boat'),
  },
  {
    id: 'nhatrang-islands',
    title: 'Nha Trang island boats (Hon Mun, Hon Tre)',
    body: 'Day snorkel boats from Cầu Đá. Vinpearl’s Hon Tre is a cable car or shuttle — still not mainland transport.',
    bookingUrl: klookQuery('Nha Trang Hon Mun snorkel boat'),
  },
  {
    id: 'hcmc-vungtau',
    title: 'Ho Chi Minh City ↔ Vung Tau fast boat',
    body: 'A hydrofoil or fast passenger boat still runs between Saigon and Vũng Tàu. It is a mainland coastal hop, not an island ferry — useful if you are connecting toward the Côn Đảo sailing from Vũng Tàu.',
    bookingUrl: twelveGoTravel('ho chi minh city', 'vung tau'),
  },
  {
    id: 'chau-doc',
    title: 'Chau Doc speedboat to Phnom Penh',
    body: 'The Mekong border boat from Châu Đốc is how some travellers leave Vietnam for Cambodia. Immigration is on the river — this is an international crossing, not a domestic island ferry.',
    bookingUrl: twelveGoTravel('chau doc', 'phnom penh'),
  },
]

export function getIslandCorridor(id: IslandId) {
  return ISLAND_CORRIDORS.find((c) => c.id === id) ?? ISLAND_CORRIDORS[0]
}
