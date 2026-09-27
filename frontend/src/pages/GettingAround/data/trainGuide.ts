/** Reunification Express facts paraphrased from Seat 61 (Vietnam, June 2026). */

export const TRAIN_IN_DEPTH_PATH = '/plan/builder/transport/train'
export const TRAIN_STANDALONE_PATH = '/getting-around/train'
export const SEAT61_GUIDE = 'https://www.seat61.com/Vietnam.htm'
export const SEAT61_TICKETS =
  'https://seat61.transport-ticket.com/?retailerPartnerNumber=455015&marketingCarrierCode=VRAL&locale=en'

/** Mid-market, September 2026: about 26,000 dong to US$1. */
const DONG_PER_USD = 26_000

/** Direct upload.wikimedia.org URLs (Special:FilePath 302s often fail as <img> src). */
const WIKI_URL: Record<string, string> = {
  'Hai_Van_Pass,_Vietnam,_North-South_Railway.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Hai_Van_Pass%2C_Vietnam%2C_North-South_Railway.jpg/1920px-Hai_Van_Pass%2C_Vietnam%2C_North-South_Railway.jpg',
  'Train_Ride_Between_Hue_and_Da_Nang_(12173026965).jpg':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Train_Ride_Between_Hue_and_Da_Nang_%2812173026965%29.jpg/1920px-Train_Ride_Between_Hue_and_Da_Nang_%2812173026965%29.jpg',
  'Train_Ride_Between_Hue_and_Da_Nang_(12173252643).jpg':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Train_Ride_Between_Hue_and_Da_Nang_%2812173252643%29.jpg/1920px-Train_Ride_Between_Hue_and_Da_Nang_%2812173252643%29.jpg',
  'View_from_train_South_VN.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/View_from_train_South_VN.jpg/1920px-View_from_train_South_VN.jpg',
  'SE3_Train_Compartment_(7350511486).jpg':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/SE3_Train_Compartment_%287350511486%29.jpg/1280px-SE3_Train_Compartment_%287350511486%29.jpg',
  'VNR_SE4_Saigon_to_Danang_inside.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/VNR_SE4_Saigon_to_Danang_inside.jpg/1280px-VNR_SE4_Saigon_to_Danang_inside.jpg',
  'HN-Sapa_4bunk_cabin.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/e/eb/HN-Sapa_4bunk_cabin.jpg',
  'Vietnam_Railways_passenger_coaches.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/2/28/Vietnam_Railways_passenger_coaches.jpg',
}

export function wikiFile(name: string, _width = 1600): string {
  return WIKI_URL[name] ?? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}`
}

export function formatFare000(thousands: number): { dong: string; usd: string; cell: string } {
  const amount = thousands * 1_000
  const usdNum = amount / DONG_PER_USD
  const usd = `$${usdNum >= 10 ? Math.round(usdNum) : usdNum.toFixed(1)}`
  const dong = `${amount.toLocaleString('en-US')} dong`
  return { dong, usd, cell: `${dong} (${usd})` }
}

export function stationLabel(station: string): string {
  return station === 'Saigon' ? 'Saigon (Ho Chi Minh City)' : station
}

export const WHEN_TO_TRAVEL_INTRO =
  'Traveling by train in Vietnam (operated by Vietnam Railways on the North-South Reunification Express line) is best chosen for scenic daylight coastal routes, mid-range distances, and budget overnight travel when speed is not the primary priority.'

export const WHEN_TO_TRAVEL_SECTIONS: { title: string; body: string }[] = [
  {
    title: 'On iconic Coastal and mountain routes',
    body: 'Hue to Da Nang (Hai Van Pass): The single best stretch of railway in Vietnam. The track hugs the cliffs of the Hai Van Pass overlooking the ocean and secluded beaches. Taking a morning train on this 2.5-hour journey offers views you cannot see from the highway tunnels. Da Nang to Quy Nhon / Nha Trang: Beautiful coastal vistas across central Vietnam’s rice paddies and bays.',
  },
  {
    title: 'For overnight journeys covering 6–12 hours',
    body: 'Hanoi to Lao Cai (Sapa): Booking a soft-sleeper cabin overnight lets you sleep on the train and arrive at the gateway to Sapa first thing in the morning, saving on a night of hotel accommodation. Hanoi to Hue: A popular 13-hour overnight option for travelers who prefer sleeping in a bed on tracks over taking a flight or sleeper bus.',
  },
  {
    title: 'When travelling with heavy luggage or seeking more comfort than buses',
    body: 'Unlike buses, trains offer room to walk around, dedicated luggage space, and 4-berth soft sleeper cabins that are significantly more comfortable for taller travelers than cramped sleeper buses.',
  },
  {
    title: 'Why choose the train',
    body: 'Unmatched coastal scenery: the railway runs through mountain passes, rural villages, and ocean edges that highway roads bypass. Safety and reliability: trains are far safer and more consistent than long-distance highway buses, avoiding Vietnam’s dense highway traffic. Cost efficiency: a 4-berth soft sleeper acts as both transport and a hotel night for mid-range budget travelers. Cultural experience: it offers a local travel experience, complete with food carts serving hot meals, coffee, and snacks down the aisles.',
  },
  {
    title: 'When not to take the train',
    body: 'Full-length journeys (Hanoi ↔ Ho Chi Minh City): the entire North-South route takes 31 to 35 hours. Unless you are intentionally taking a slow-travel rail journey, a 2-hour domestic flight is much more practical for long-haul transit. Tight schedules: trains in Vietnam can experience delays ranging from 30 minutes to a few hours.',
  },
]

export type TrainPhoto = {
  file: string
  alt: string
  caption: string
  credit: string
}

export const VIEW_PHOTOS: TrainPhoto[] = [
  {
    file: 'Hai_Van_Pass,_Vietnam,_North-South_Railway.jpg',
    alt: 'North–South Railway on Hai Van Pass above the coast',
    caption: 'The metre-gauge line on Hai Van Pass — the reason people take Hue to Da Nang by train.',
    credit: 'Wikimedia Commons',
  },
  {
    file: 'Train_Ride_Between_Hue_and_Da_Nang_(12173026965).jpg',
    alt: 'Coastal view from the Hue–Da Nang train',
    caption: 'Window view on the Hue–Da Nang run: lagoon, fishing boats, then the climb into cloud.',
    credit: 'Wikimedia Commons / Flickr',
  },
  {
    file: 'View_from_train_South_VN.jpg',
    alt: 'Rice country seen from a train north of Saigon (Ho Chi Minh City)',
    caption: 'South of Nha Trang the line crosses paddy and river country — slower, greener, less cliff-edge.',
    credit: 'dane brian / Wikimedia Commons',
  },
  {
    file: 'Train_Ride_Between_Hue_and_Da_Nang_(12173252643).jpg',
    alt: 'Train window looking down to the South China Sea',
    caption: 'Corridor windows on many sleepers still open — useful for photos on Hai Van; compartment glass usually does not.',
    credit: 'Wikimedia Commons / Flickr',
  },
]

export const INTERIOR_PHOTOS: TrainPhoto[] = [
  {
    file: 'SE3_Train_Compartment_(7350511486).jpg',
    alt: 'Four-berth soft sleeper compartment on train SE3',
    caption: 'Soft sleeper (K4): four berths, lockable door, bedding included. Default overnight class for visitors.',
    credit: 'Wikimedia Commons',
  },
  {
    file: 'VNR_SE4_Saigon_to_Danang_inside.jpg',
    alt: 'Inside a Vietnam Railways sleeper on SE4 Saigon (Ho Chi Minh City) to Da Nang',
    caption: 'Corridor of a southbound/northbound sleeper. Power sockets on newer SE1–SE8 cars; trolley meals about 35,000 dong.',
    credit: 'Wikimedia Commons',
  },
  {
    file: 'HN-Sapa_4bunk_cabin.jpg',
    alt: 'Four-bunk tourist cabin similar to Hanoi overnight sleepers',
    caption: 'Four-bunk layout used on overnight tourist cars (here Hanoi–Lao Cai stock — same idea as Reunification K4).',
    credit: 'Wikimedia Commons',
  },
  {
    file: 'Vietnam_Railways_passenger_coaches.jpg',
    alt: 'Vietnam Railways seated coaches',
    caption: 'Air-con soft seat: fine for Hue–Da Nang (~2.5 h) and other daylight hops. Hard seat is last resort on long hauls.',
    credit: 'Wikimedia Commons',
  },
]

export const SOUTHBOUND_TRAINS = ['SE3', 'SE19', 'SE1', 'SE7', 'SE5', 'SE9', 'SE21', 'SNT1'] as const
export const NORTHBOUND_TRAINS = ['SE4', 'SE2', 'SE20', 'SE8', 'SE6', 'SE22', 'SE10', 'SNT2'] as const

export type TimetableRow = {
  km: string
  station: string
  times: string[]
}

/** Southbound = Hanoi → Saigon. Times from Seat 61 Vietnam page, June 2026. */
export const SOUTHBOUND_ROWS: TimetableRow[] = [
  { km: '0', station: 'Hanoi', times: ['19:20', '19:45', '20:50', '06:00', '08:55', '12:50', '—', '—'] },
  { km: '115', station: 'Ninh Binh', times: ['21:31', '21:55', '22:57', '08:13', '11:06', '15:03', '—', '—'] },
  { km: '175', station: 'Thanh Hoa', times: ['22:32', '22:55', '23:59', '09:16', '12:07', '16:06', '—', '—'] },
  { km: '319', station: 'Vinh', times: ['00:48', '01:13', '02:16', '11:32', '14:25', '18:23', '—', '—'] },
  { km: '522', station: 'Dong Hoi', times: ['04:23', '04:53', '06:03', '15:12', '18:11', '22:10', '—', '—'] },
  { km: '688', station: 'Hue', times: ['07:26', '08:16', '09:17', '18:18', '21:15', '01:16', '—', '—'] },
  { km: '791', station: 'Danang', times: ['10:08', '11:27', '12:23', '21:08', '00:08', '04:06', '08:00', '—'] },
  { km: '928', station: 'Quang Ngai', times: ['12:26', '—', '14:48', '23:28', '02:26', '06:27', '10:21', '—'] },
  { km: '1,095', station: 'Dieu Tri', times: ['15:14', '—', '17:39', '02:16', '05:14', '09:18', '13:08', '—'] },
  { km: '1,315', station: 'Nha Trang', times: ['18:54', '—', '21:22', '05:56', '08:54', '13:10', '16:48', '20:00'] },
  { km: '1,551', station: 'Binh Thuan', times: ['22:15', '—', '00:47', '09:22', '12:15', '16:35', '20:10', '23:25'] },
  { km: '1,726', station: 'Saigon', times: ['05:15 d3', '—', '05:45 d3', '17:35 d2', '20:20 d2', '03:40 d3', '04:25 d2', '04:50 d2'] },
]

export const NORTHBOUND_ROWS: TimetableRow[] = [
  { km: '0', station: 'Saigon', times: ['19:25', '20:35', '—', '06:00', '08:40', '10:15', '13:20', '21:40'] },
  { km: '175', station: 'Binh Thuan', times: ['22:32', '23:45', '—', '09:13', '11:48', '13:23', '16:32', '00:47'] },
  { km: '411', station: 'Nha Trang', times: ['01:53', '03:07', '—', '12:37', '15:11', '16:47', '19:54', '06:20'] },
  { km: '631', station: 'Dieu Tri', times: ['05:34', '06:50', '—', '16:16', '18:52', '20:27', '23:36', '—'] },
  { km: '798', station: 'Quang Ngai', times: ['08:22', '09:40', '—', '19:04', '21:42', '23:17', '02:26', '—'] },
  { km: '935', station: 'Danang', times: ['10:49', '12:08', '19:10', '21:28', '00:08', '01:47', '04:52', '—'] },
  { km: '1,038', station: 'Hue', times: ['13:27', '14:53', '22:08', '00:08', '02:47', '04:27', '07:32', '—'] },
  { km: '1,204', station: 'Dong Hoi', times: ['16:29', '18:00', '01:13', '03:11', '05:52', '07:32', '10:36', '—'] },
  { km: '1,407', station: 'Vinh', times: ['20:03', '21:39', '04:50', '06:47', '09:28', '11:08', '14:14', '—'] },
  { km: '1,551', station: 'Thanh Hoa', times: ['22:21', '23:57', '07:09', '09:05', '11:47', '13:27', '16:32', '—'] },
  { km: '1,611', station: 'Ninh Binh', times: ['23:24', '01:00', '08:12', '10:08', '12:50', '14:30', '17:35', '—'] },
  { km: '1,726', station: 'Hanoi', times: ['04:55 d3', '05:45 d3', '11:40 d2', '16:10 d2', '19:12 d2', '—', '04:35 d3', '—'] },
]

export type TrainNoteCard = {
  id: string
  route: string
  tag: string
  tagTone: 'premier' | 'overnight' | 'daylight' | 'budget' | 'regional' | 'sector' | 'tourist'
  bullets: { label: string; text: string }[]
}

export const TRAIN_NOTES: TrainNoteCard[] = [
  {
    id: 'SE1 / SE2',
    route: 'Full Route (Hanoi ↔ Saigon (Ho Chi Minh City))',
    tag: 'Flagship Express',
    tagTone: 'premier',
    bullets: [
      { label: 'Best For', text: 'Top-tier comfort and long-haul travel' },
      {
        label: 'Key Feature',
        text: 'Includes exclusive 2-berth VIP cabins (only 4 beds total; includes drinks/meals — book early)',
      },
      { label: 'Tourist Cars', text: 'Livitrans sleepers attach on the Hanoi – Hue – Da Nang segment' },
    ],
  },
  {
    id: 'SE3 / SE4',
    route: 'Full Route (Hanoi ↔ Saigon (Ho Chi Minh City))',
    tag: 'Overnight Express',
    tagTone: 'overnight',
    bullets: [
      { label: 'Departure', text: 'SE3 leaves Hanoi at 19:20' },
      { label: 'Best For', text: 'Daylight view of Hai Van Pass in the morning' },
      { label: 'Tourist Cars', text: 'Violette Express sleepers attach on the Hanoi – Hue – Da Nang segment' },
    ],
  },
  {
    id: 'SE5 to SE8',
    route: 'Full Route (Hanoi ↔ Saigon (Ho Chi Minh City))',
    tag: 'Daytime Coastal',
    tagTone: 'daylight',
    bullets: [
      { label: 'Hanoi Departures', text: 'SE7 (06:00) | SE5 (08:55)' },
      { label: 'Saigon Departures', text: 'SE8 (06:00) | SE6 (08:40)' },
      { label: 'Best For', text: 'Experiencing the Hue–Da Nang coast in daylight' },
      { label: 'Note', text: 'Similar train family to SE1–SE4, slightly older' },
    ],
  },
  {
    id: 'SE9 / SE10',
    route: 'Full Route (Hanoi ↔ Saigon (Ho Chi Minh City))',
    tag: 'Budget / Backup',
    tagTone: 'budget',
    bullets: [
      { label: 'Departures', text: 'SE9 (Hanoi 12:50) | SE10 (Saigon 13:20)' },
      { label: 'Best For', text: 'When SE1–SE8 sleepers are sold out' },
      { label: 'Note', text: 'Later, slower services with older stock and a longer journey' },
    ],
  },
  {
    id: 'SE19 / SE20',
    route: 'Regional Route',
    tag: 'Hanoi ↔ Da Nang Only',
    tagTone: 'regional',
    bullets: [
      { label: 'Departures', text: 'SE19 (Hanoi 19:45) | SE20 (Da Nang 19:10)' },
      { label: 'Seating', text: 'All-sleeper (soft sleepers only, no seats)' },
      {
        label: 'Best For',
        text: 'Direct coastal trip without traveling south to Saigon (Ho Chi Minh City)',
      },
    ],
  },
  {
    id: 'SE21 / SE22',
    route: 'Regional Route (Da Nang ↔ Saigon (Ho Chi Minh City))',
    tag: 'Southern Sector',
    tagTone: 'sector',
    bullets: [
      { label: 'Departures', text: 'SE21 (Da Nang 08:00) | SE22 (Saigon 10:15)' },
      { label: 'Best For', text: 'Flying into Da Nang and continuing south overnight without starting in Hanoi' },
    ],
  },
  {
    id: 'SNT1 / SNT2',
    route: 'Saigon (Ho Chi Minh City) ↔ Nha Trang',
    tag: 'Tourist Sleeper',
    tagTone: 'tourist',
    bullets: [
      { label: 'Departures', text: 'SNT1 (Nha Trang 20:00, Saigon ~04:50) | SNT2 (Saigon 21:40, Nha Trang ~06:20)' },
      { label: 'Operator', text: 'Golden Train / Livitrans' },
      { label: 'Best For', text: 'A hotel night on rails for the beach run — about US$38 in a tourist berth' },
    ],
  },
]

export const SOUTHBOUND_BLURB =
  'Southbound means Hanoi toward Saigon (Ho Chi Minh City) — kilometre 0 at Hanoi Station. Overnight SE3 / SE19 / SE1 leave in the evening; SE7 and SE5 are morning trains that give you Hai Van in daylight. “d2 / d3” is arrival on the second or third calendar day. SE21 and SNT1 do not start in Hanoi.'

export const NORTHBOUND_BLURB =
  'Northbound is Saigon (Ho Chi Minh City) toward Hanoi. SE4 and SE2 are the evening flagships into Hanoi before dawn on day 3. SE8 and SE6 are the morning departures. SE20 is Danang–Hanoi only. SNT2 is the tourist sleeper that stops at Nha Trang and does not continue to Hanoi.'

export type FareRow = {
  route: string
  hours: string
  softSeat: number
  hardL: number
  hardM: number
  hardU: number
  softL: number
  softU: number
}

/** Best trains SE1–SE4, fares in thousands of dong, Seat 61 June 2026. */
export const FARES: FareRow[] = [
  { route: 'Hanoi → Hue', hours: '~12–14 h', softSeat: 569, hardL: 1070, hardM: 962, hardU: 832, softL: 1218, softU: 1139 },
  { route: 'Hanoi → Danang', hours: '~15–17 h', softSeat: 651, hardL: 1137, hardM: 1022, hardU: 883, softL: 1294, softU: 1211 },
  { route: 'Hanoi → Nha Trang', hours: '~23–25 h', softSeat: 908, hardL: 1369, hardM: 1236, hardU: 1074, softL: 1585, softU: 1506 },
  { route: 'Hanoi → Saigon (Ho Chi Minh City)', hours: '~32–36 h', softSeat: 1026, hardL: 1637, hardM: 1471, hardU: 1273, softL: 1758, softU: 1667 },
  { route: 'Saigon (Ho Chi Minh City) → Nha Trang', hours: '~8 h', softSeat: 404, hardL: 763, hardM: 686, hardU: 593, softL: 869, softU: 813 },
  { route: 'Hue → Danang', hours: '~2.5–3.5 h', softSeat: 106, hardL: 219, hardM: 219, hardU: 219, softL: 265, softU: 227 },
]

export const FARE_NOTES = [
  'Figures are for the better SE1–SE4 family. Dollar amounts use about 26,000 dong to US$1 (mid-market, September 2026) and will move a little with the exchange rate.',
  'Soft sleeper lower berths cost more than upper; hard sleeper is six bunks (lower, middle, and upper seats). Children 0–4 travel free, ages 5–9 pay 75% of the adult fare.',
  'Tourist cars (Livitrans, Violette, Golden Train) price in dollars and sit above Vietnam Railways soft sleeper. VIP 2-berth on SE1/SE2 is about double a normal four-berth lower.',
]

export type TicketProvider = {
  id: string
  name: string
  tag: string
  href: string
  fee: string
  pay: string
  collect: string
  bestFor: string
  caution: string
}

export const TICKET_PROVIDERS: TicketProvider[] = [
  {
    id: 'seat61',
    name: 'Seat 61 tickets',
    tag: 'Official inventory',
    href: SEAT61_TICKETS,
    fee: 'Booking fee on DSVN fares',
    pay: 'Card in your home currency',
    collect: 'E-ticket / Distribusion fulfilment',
    bestFor: 'Booking from abroad on the same inventory Seat 61 recommends — Vietnam Railways trains, not private tourist cars.',
    caution: 'Does not sell Livitrans / Violette private sleepers. Print or screenshot the voucher; staff still want a name match.',
  },
  {
    id: 'baolau',
    name: 'Baolau',
    tag: 'Live map',
    href: 'https://www.baolau.com/',
    fee: '~2.7% card markup',
    pay: 'International cards',
    collect: 'E-ticket; show at the gate',
    bestFor: 'Seeing which trains still have which berth on a map of the country, then paying in one checkout.',
    caution: 'You are buying through a reseller. Keep the order email; berth numbers sometimes assign late.',
  },
  {
    id: '12go',
    name: '12Go',
    tag: 'Multi-mode',
    href: 'https://12go.asia/',
    fee: '~4% on rail',
    pay: 'Cards, some wallets',
    collect: 'E-ticket in the 12Go app',
    bestFor: 'Mixing a train with a bus or ferry in the same booking (Hanoi sleeper + Ha Long transfer, etc.).',
    caution: 'Highest typical markup of the three resellers. Read the class name — “soft sleeper” vs tourist brand.',
  },
  {
    id: 'dsvn',
    name: 'dsvn.vn',
    tag: 'Vietnam Railways',
    href: 'https://dsvn.vn/',
    fee: 'Face fare',
    pay: 'Overseas cards accepted since 2022 (English flag on the site)',
    collect: 'E-ticket, or pay-at-station within 24 hours if you reserve online',
    bestFor: 'Cheapest DSVN fare and checking real remaining berths before you walk to a counter.',
    caution: 'Phishing clones exist. Use https://dsvn.vn — not a random Google ad. Ignore +84 “railway” phone numbers that call you.',
  },
]

export type StationGuide = {
  id: string
  name: string
  city: string
  address: string
  maps: string
  photo: string
  photoAlt: string
  scope: string
  scopeTone: 'hub' | 'origin' | 'provincial'
  facts: { label: string; text: string }[]
}

export const STATION_BUY_INTRO = [
  {
    title: '1. Lead Time & Availability',
    bullets: [
      {
        label: 'Normal Travel',
        text: 'Buying 1–2 days in advance at the station is usually sufficient outside peak seasons, though premier soft-sleeper berths sell out first.',
      },
      {
        label: 'Tet (Lunar New Year)',
        text: 'Tickets for January/February sell out months in advance. Do not rely on station purchases during holiday periods.',
      },
    ],
  },
  {
    title: '2. Payment & Language at the Window',
    bullets: [
      {
        label: 'Cash Only',
        text: 'Counter windows strictly accept Vietnamese dong (VND) — foreign credit cards or US dollars are not accepted.',
      },
      {
        label: 'Avoid Language Barriers',
        text: 'Screenshot your desired train number, date, cabin type, and berth on dsvn.vn to show the agent on your phone instead of negotiating classes verbally.',
      },
    ],
  },
] as const

export const STATIONS: StationGuide[] = [
  {
    id: 'hanoi',
    name: 'Hanoi Railway Station',
    city: 'Hanoi',
    address: '120 Le Duan, Hoan Kiem',
    maps: 'https://www.google.com/maps/search/?api=1&query=Hanoi+Railway+Station+120+Le+Duan',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Hanoi_Railway_Station.jpg/1920px-Hanoi_Railway_Station.jpg',
    photoAlt: 'Exterior of Hanoi Railway Station on Le Duan Street',
    scope: 'Full-Line Hub (Sells advance tickets for any route in Vietnam)',
    scopeTone: 'hub',
    facts: [
      {
        label: 'How to Buy',
        text: 'Enter the main central doors, turn right through the narrow hallway to the ticket hall, and head to the window marked Tourist.',
      },
      { label: 'Payment', text: 'Cash strictly in Vietnamese dong (VND).' },
      {
        label: 'Insider Tip',
        text: 'Great station for purchasing through-tickets (e.g., reserving a Hue ➔ Saigon (Ho Chi Minh City) segment ahead of time).',
      },
    ],
  },
  {
    id: 'saigon',
    name: 'Saigon Station (Ho Chi Minh City)',
    city: 'Ho Chi Minh City',
    address: '1 Nguyen Thong, District 3, Ho Chi Minh City',
    maps: 'https://www.google.com/maps/search/?api=1&query=Saigon+Railway+Station+1+Nguyen+Thong',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Ga_Sai_Gon.jpg/1920px-Ga_Sai_Gon.jpg',
    photoAlt: 'Exterior of Saigon Railway Station in District 3',
    scope: 'Full-Line Hub (Sells same-day and advance tickets for most North–South routes)',
    scopeTone: 'hub',
    facts: [
      {
        label: 'How to Buy',
        text: 'The main ticket counter is downstairs. Take a numbered queue ticket from the machine (select Buy Ticket) and wait for your number on the overhead screens.',
      },
      { label: 'Payment', text: 'Cash (VND) preferred.' },
      {
        label: 'Insider Tip',
        text: 'Avoid the upstairs hall — it is mainly reserved for ticket changes/refunds and is often closed.',
      },
    ],
  },
  {
    id: 'hue',
    name: 'Hue Railway Station',
    city: 'Hue',
    address: '2 Bui Thi Xuan, Hue',
    maps: 'https://www.google.com/maps/search/?api=1&query=Hue+Railway+Station+2+Bui+Thi+Xuan',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Hue_Vietnam_Hue-Railway-Station-01.jpg/1920px-Hue_Vietnam_Hue-Railway-Station-01.jpg',
    photoAlt: 'Exterior of Hue Railway Station',
    scope: 'Origin-Only Station (Primarily sells journeys departing directly from Hue)',
    scopeTone: 'origin',
    facts: [
      {
        label: 'How to Buy',
        text: 'Smaller ticket office. You cannot easily bundle a Hue departure with a separate future segment (e.g., a later Saigon (Ho Chi Minh City) leg) in one transaction.',
      },
      { label: 'Payment', text: 'Cash (VND).' },
      {
        label: 'Insider Tip',
        text: 'Reserve on dsvn.vn first, then present your reservation code at the window to pay and collect your physical ticket.',
      },
    ],
  },
  {
    id: 'danang',
    name: 'Da Nang Railway Station',
    city: 'Da Nang',
    address: '202 Hai Phong, Thanh Khe, Da Nang',
    maps: 'https://www.google.com/maps/search/?api=1&query=Da+Nang+Railway+Station+202+Hai+Phong',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Da_Nang_Railway_Station_20130721.jpg/1920px-Da_Nang_Railway_Station_20130721.jpg',
    photoAlt: 'Front of Da Nang Railway Station',
    scope: 'Origin-Only Station',
    scopeTone: 'origin',
    facts: [
      { label: 'Key Expresses', text: 'Terminus/origin for SE19 / SE20 overnight sleepers to Hanoi.' },
      { label: 'Payment', text: 'Bring cash (VND); credit card machines at the counter are often unreliable.' },
      {
        label: 'Onward Transit',
        text: 'Terminus for travelers heading to Hoi An (about 30–45 minute taxi ride from the main station exit).',
      },
    ],
  },
  {
    id: 'nhatrang',
    name: 'Nha Trang Station',
    city: 'Nha Trang',
    address: '17 Thai Nguyen, Nha Trang',
    maps: 'https://www.google.com/maps/search/?api=1&query=Nha+Trang+Railway+Station+17+Thai+Nguyen',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ga_Nha_Trang_front.jpg/1920px-Ga_Nha_Trang_front.jpg',
    photoAlt: 'Front of Nha Trang Railway Station',
    scope: 'Origin-Only Station (South to Saigon (Ho Chi Minh City) or North toward Hue/Da Nang)',
    scopeTone: 'origin',
    facts: [
      { label: 'How to Buy', text: 'Standard Vietnam Railways counter.' },
      {
        label: 'Tourist Sleepers Note',
        text: 'Private operators like Livitrans or Golden Train often operate separate desks or have representatives in the lobby — check with hall staff before queuing at the standard window.',
      },
      { label: 'Payment', text: 'Cash (VND).' },
    ],
  },
  {
    id: 'ninhbinh',
    name: 'Ninh Binh Railway Station',
    city: 'Ninh Binh',
    address: '1 Le Dai Hanh, Ninh Binh',
    maps: 'https://www.google.com/maps/search/?api=1&query=Ninh+Binh+Railway+Station',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Ninh_Binh_Railway_Station.jpg',
    photoAlt: 'Ninh Binh Railway Station seen from a passing train',
    scope: 'Provincial Stop',
    scopeTone: 'provincial',
    facts: [
      {
        label: 'Strategic Value',
        text: 'Gateway to Trang An and Tam Coc without needing to backtrack to Hanoi.',
      },
      {
        label: 'Language Tip',
        text: 'English at the window is limited and berth stock is thin. Show the agent your desired train number (e.g., SE3) written down on your phone.',
      },
    ],
  },
]
