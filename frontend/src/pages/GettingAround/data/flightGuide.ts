export const FLIGHT_IN_DEPTH_PATH = '/plan/builder/transport/flight'

export const FLIGHT_PHOTOS = {
  noiBai:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Vietjet_Air_Airbus_A330-300_at_Noi_Bai_International_Airport_-_20230819.jpg/1920px-Vietjet_Air_Airbus_A330-300_at_Noi_Bai_International_Airport_-_20230819.jpg',
  vietjet:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/VN-A666_Airbus_A320_VietJet_Air.jpg/1920px-VN-A666_Airbus_A320_VietJet_Air.jpg',
  takeoff:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/VJ2.JPG/1920px-VJ2.JPG',
}

export const FLIGHT_WHEN_INTRO =
  'Fly when the clock matters more than the window. Air time on Vietnam’s trunk is 1–2 hours; door-to-door is usually 3.5–5 hours once you add the city transfer, check-in, and another Grab at the other end. That still beats a 32-hour train or a 16-hour sleeper bus on Hanoi to Ho Chi Minh City. Islands with runways — Phu Quoc, Con Dao, Phu Cat for Quy Nhon — are flight-first for most visitors.'

export const FLIGHT_WHEN_SECTIONS = [
  {
    title: 'When flying is the honest choice',
    body: 'Hanoi to Saigon (Ho Chi Minh City) is about two hours in the air and runs from early morning to late evening. Hanoi to Da Nang and Saigon (Ho Chi Minh City) to Da Nang are typically 1 hour 15 minutes to 1 hour 40 minutes. Da Lat (Lien Khuong), Nha Trang (Cam Ranh), and Phu Quoc are faster by air than by any coach. A 07:00 departure from a city-centre hotel usually means a 04:30 start.',
  },
  {
    title: 'When not to fly',
    body: 'Hue to Da Nang is a scenic train, not a flight. Hanoi to Ninh Binh is a van. Hoi An has no airport — use Da Nang plus a 30–45 minute taxi. Sapa, Ha Giang, and Ninh Binh have no useful passenger airports. Do not book a tight international connection onto a domestic low-cost ticket; VietJet and similar fares are unforgiving if the first flight slips.',
  },
  {
    title: 'Bags, names, and Tet',
    body: 'Compare the same baggage allowance, not the first price on the search page. Low-cost fares often exclude a hold bag and a seat. The name on the ticket must match the passport. Tet and peak summer sell out and stretch security lines. Island and highland flights weather-delay more than the trunk.',
  },
]

export const FLIGHT_AIRLINES = [
  {
    name: 'Vietnam Airlines',
    tag: 'Full service',
    href: 'https://www.vietnamairlines.com/',
    body: 'Flag carrier. Strongest on the trunk and useful when a typical fare already includes a checked bag. Better if you want a more predictable airport process.',
  },
  {
    name: 'VietJet Air',
    tag: 'Low-cost',
    href: 'https://www.vietjetair.com/',
    body: 'Highest frequency and the cheapest headline fare. Bags, seats, and changes are usually extra. Fine if you add the hold bag at booking and arrive early.',
  },
  {
    name: 'Bamboo Airways',
    tag: 'Hybrid',
    href: 'https://www.bambooairways.com/',
    body: 'Sits between the two on selected routes. Always check whether the fare you clicked actually includes luggage — it varies by ticket type.',
  },
]

export const FLIGHT_BOOKING = [
  {
    name: 'Google Flights',
    tag: 'Compare',
    href: 'https://www.google.com/travel/flights',
    body: 'Cleanest way to see the day’s frequencies and a realistic fare band before you pick an airline site.',
  },
  {
    name: 'Vietnam Airlines',
    tag: 'Official',
    href: 'https://www.vietnamairlines.com/',
    body: 'Buy the flag carrier here if you want included bags on a typical fare and fewer surprise add-ons.',
  },
  {
    name: 'VietJet Air',
    tag: 'Official',
    href: 'https://www.vietjetair.com/',
    body: 'Book hold luggage in the same checkout. A “$19” fare without a bag is not a $19 trip.',
  },
]

export const FLIGHT_AIRPORTS = [
  {
    name: 'Noi Bai International (HAN)',
    city: 'Hanoi',
    address: 'Soc Son, Hanoi — about 35–50 minutes from the Old Quarter in traffic',
    maps: 'https://www.google.com/maps/search/?api=1&query=Noi+Bai+International+Airport',
    how: 'The northern hub. Domestic and international sit in linked terminals. Budget a Grab or the airport bus; do not cut a 07:00 domestic departure from the Old Quarter closer than 2.5 hours.',
  },
  {
    name: 'Tan Son Nhat International (SGN)',
    city: 'Ho Chi Minh City',
    address: 'Tan Binh, Ho Chi Minh City — about 25–45 minutes from District 1',
    maps: 'https://www.google.com/maps/search/?api=1&query=Tan+Son+Nhat+International+Airport',
    how: 'The southern hub and a crowded city airport. Peak hours eat taxi time. Domestic departure halls get long at Tet. Photograph your Grab pin on the way out — pickup zones are easy to mix up.',
  },
  {
    name: 'Da Nang International (DAD)',
    city: 'Da Nang',
    address: 'Hai Chau / airport road, Da Nang',
    maps: 'https://www.google.com/maps/search/?api=1&query=Da+Nang+International+Airport',
    how: 'The central Vietnam hub. Hoi An is 30–45 minutes by taxi. Hue is a train or a 2–2.5 hour van, not a second flight. Compact airport — still add transfer time.',
  },
  {
    name: 'Cam Ranh (CXR)',
    city: 'Nha Trang',
    address: 'Cam Ranh, Khanh Hoa — about 35–50 minutes south of Nha Trang',
    maps: 'https://www.google.com/maps/search/?api=1&query=Cam+Ranh+International+Airport',
    how: 'Nha Trang’s airport is not in town. Factor a shuttle or taxi. Useful when you refuse the overnight train or sleeper bus from Saigon (Ho Chi Minh City).',
  },
  {
    name: 'Phu Quoc International (PQC)',
    city: 'Phu Quoc',
    address: 'Duong To, Phu Quoc',
    maps: 'https://www.google.com/maps/search/?api=1&query=Phu+Quoc+International+Airport',
    how: 'The realistic way onto the island for most visitors. Several daily flights from Saigon (Ho Chi Minh City) and Hanoi. The Ha Tien ferry is a different trip, not a substitute for a tight itinerary.',
  },
  {
    name: 'Lien Khuong (DLI)',
    city: 'Da Lat',
    address: 'Duc Trong, Lam Dong — about 30–40 minutes from Da Lat centre',
    maps: 'https://www.google.com/maps/search/?api=1&query=Lien+Khuong+Airport+Da+Lat',
    how: 'Da Lat’s airport. Weather and fog delay more than the trunk. The road from Ho Chi Minh City is 6–8 winding hours — fly if you value the day.',
  },
]
