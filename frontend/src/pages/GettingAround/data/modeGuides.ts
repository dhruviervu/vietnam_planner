import type { LongModeId, UrbanModeId, WaterModeId } from './types'

export type ModeGuideBlock = {
  title: string
  body: string
  image?: string
}

export type ModeGuide = {
  intro: string
  blocks: ModeGuideBlock[]
  heroImage?: string
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

export const LONG_MODE_GUIDES: Partial<Record<LongModeId, ModeGuide>> = {
  flight: {
    intro:
      'Domestic flights are the fastest way to cover Vietnam’s long spine — Hanoi, Da Nang, and Ho Chi Minh City are the trunk, with islands and highlands on spokes. Air time is often 1–2 hours; door-to-door is usually closer to 4 hours once you add airport process and city transfers.',
    blocks: [
      {
        title: '✈️ Main Airlines',
        body: 'Vietnam Airlines is the full-service flag carrier, strongest on trunk routes and useful if you want checked baggage included in a typical fare. VietJet Air is the high-frequency low-cost option — cheap headline fares, with bags and seat selection usually extra. Bamboo Airways sits between the two on selected routes. Always compare the same bag allowance, not just the first price on the search page.',
      },
      {
        title: '🗺️ Popular routes and travel durations',
        body: 'Hanoi ↔ Ho Chi Minh City is about 2 hours in the air and flies from early morning to late evening. Hanoi ↔ Da Nang and HCMC ↔ Da Nang are typically 1h 15m–1h 40m. Phu Quoc, Nha Trang, Da Lat, and Con Dao are flight-first destinations for most visitors. Hue has a smaller airport; Hoi An does not — fly into Da Nang and continue by car (about 45 minutes). Ninh Binh, Ha Giang, and Sapa have no useful passenger airports; fly to Hanoi and continue on the ground.',
      },
      {
        title: '🧳 Practical tips',
        body: 'Build slack around domestic terminals, especially in peak Tet and summer. Low-cost fares often exclude a hold bag. Names on tickets must match passports. Weather can delay island and highland flights. A 07:00 domestic departure from a city-centre hotel usually means a 04:30 start. Official airline sites and Google Flights are the cleanest places to check live inventory.',
      },
    ],
  },
  train: {
    intro:
      'Vietnam Railways (Đường sắt Việt Nam) runs the Reunification Express along the north–south spine. Trains are slower than flying, often more scenic, and they put you in a city station rather than an airport. Sleepers turn a long night into a hotel on rails.',
    blocks: [
      {
        title: '🛤️ Key Routes',
        body: 'The core corridor is Hanoi – Hue – Da Nang – Nha Trang – Ho Chi Minh City (SE/TN trains). Hanoi to Hue is a classic overnight; Hue to Da Nang is a shorter, often scenic daylight hop along the coast. Hanoi to Ninh Binh is a short regional ride and a strong alternative to a private car. There is no passenger railway to Ha Giang, Phu Quoc, Con Dao, or Da Lat’s current tourist core — those need coach, car, or flight.',
      },
      {
        title: '🎫 Ticket classes and booking',
        body: 'Soft sleeper (4-berth) is the comfort default for overnight. Hard sleeper is cheaper and more crowded. Soft seat works for daylight hops under ~6 hours. Book on the official DSVN site, or via 12Go / Baolau if you want an English interface and e-tickets. Peak holidays sell out; choose the exact train number, not a vague “night train”. Stations are usually closer to the centre than airports, which is the real time saving.',
      },
    ],
  },
  coach: {
    intro:
      'Inter-city coaches and sleeper buses cover almost every tourist corridor in Vietnam, including towns trains skip. Quality ranges from excellent limousine vans to rough overnight sleepers. Price is usually the lowest of the long-distance options.',
    blocks: [
      {
        title: '🚌 Types of buses',
        body: 'Limousine vans (often 9–16 seats) are the comfortable choice on medium tourist hops such as Hanoi–Ninh Binh, Da Nang–Hoi An, or HCMC–Mekong. Full-size coaches serve longer trunk routes. Sleeper buses have bunks for overnight runs (Hanoi–Hue, HCMC–Da Lat, HCMC–Nha Trang). “Open tour” backpacker buses are cheap and stop often — fine if time is loose, tiring if it is not.',
      },
      {
        title: '🗺️ Popular routes and costs',
        body: 'Hanoi ↔ Ninh Binh is typically 2–2.5 hours and inexpensive. Hanoi ↔ Sapa or Ha Giang is a 5–8 hour mountain ride, often overnight. Da Nang ↔ Hue is about 2.5–3.5 hours. HCMC ↔ Da Lat is a winding 6–8 hours. Phu Quoc and Con Dao are not coach destinations. Typical fares: a few dollars on short hops, teens to low thirties of dollars on long sleepers, depending on class.',
      },
      {
        title: '🏢 Major operators',
        body: 'Futa / Phuong Trang is a large nationwide coach group with a real booking site. The Sinh Tourist is the classic open-tour name on the backpacker trail. VeXeRe aggregates many Vietnamese operators. 12Go is the easiest English-language marketplace for tourist seats. Confirm pickup point — many “city” buses leave from a suburban terminal, not the hotel door.',
      },
      {
        title: '📝 Tips for riding',
        body: 'Bring a layer; air-con is fierce. Keep valuables on you overnight. Earplugs help. Sleeper bunks are short for tall travellers. Motion sickness is common on Hai Van Pass and Da Lat roads. Save the operator’s Vietnamese phone number. Arrive 20–30 minutes early; Vietnamese coach time is more reliable than it used to be, but terminals are busy.',
      },
    ],
  },
  'private-driver': {
    intro:
      'A car with driver is the flexible long-distance option: door-to-door, luggage-friendly, and able to stop at viewpoints, rest, or a second town the same day. It costs more than a coach, and a 10-hour transfer is still a long day even if you are not driving.',
    blocks: [
      {
        title: '🚦 Traffic and driving reality',
        body: 'Vietnam’s highways are improving, but motorbikes, trucks, weather, and town centres still shape the clock. Hanoi → Ninh Binh is a realistic half-day with stops. Hanoi → Ha Long is about 2.5–3.5 hours. Da Nang → Hoi An is 45 minutes in light traffic. Hanoi → Hue or HCMC → Da Lat as a single drive is a full, tiring day — most people fly or sleep on a train/bus instead. Night mountain driving is a poor idea.',
      },
      {
        title: '📱 How to book a driver or Ride',
        body: 'For in-city and short hops, Grab Car is the default app (metered, trackable). For inter-city days, book a private transfer through 12Go, Klook, or a hotel-arranged car with a written price, pickup time, and vehicle type (sedan vs SUV). Agree whether fuel, tolls, parking, and driver meals are included. For Ha Giang, an experienced easy-rider or car-and-driver package is safer than self-driving the loop. Do not treat a Grab booking as a guaranteed 8-hour highway charter — use a pre-arranged car for that.',
      },
    ],
  },
  'shared-transfer': {
    intro:
      'Shared vans sit between coaches and private cars on popular tourist corridors: cheaper than a driver, more door-to-area than a bus terminal, with the tradeoff of waiting and extra stops.',
    blocks: [
      {
        title: '🚐 When they shine',
        body: 'Hotel-area pickups on Hanoi–Ninh Binh, Da Nang–Hoi An, HCMC–Mekong day routes, and similar hops. Book on 12Go or through your hotel the day before in peak season. Not a substitute for a flight to Phu Quoc or a sleeper to Hue.',
      },
    ],
  },
}

export const URBAN_MODE_GUIDES: Partial<Record<UrbanModeId, ModeGuide>> = {
  scooter: {
    intro:
      '🛵 Rental scooters and bicycles are how many visitors move inside Vietnamese cities — fast, flexible, and very local. They suit confident riders on short hops; families need a realistic plan for who drives and who rides pillion.',
    heroImage: img('photo-1558981403-c5f9899a28bc'),
    blocks: [
      {
        title: '💰 Cost and where to rent',
        body: 'Automatic scooters typically run USD 5–12 per day in Hanoi, Hoi An, Da Nang, and HCMC; weekly rates drop. Bicycle rentals are USD 2–6 per day in walkable towns. Hotel desks, dedicated rental shops on tourist streets, and apps like Klook aggregate inventory. Passport deposit or photocopy is standard; some shops include one helmet, others charge extra. A family of four needs at least two capable drivers — one scooter carries two adults max legally and safely; plan two bikes or mix with Grab for non-riders.',
        image: img('photo-1568771283089-945142b453e9'),
      },
      {
        title: '📋 Legal requirements',
        body: 'Vietnam requires a valid motorbike licence recognised locally — an International Driving Permit with motorcycle category is the practical baseline for self-drive. Police checks happen in tourist zones; riding without proper papers can mean fines or impound. Travel insurance often excludes unlicensed riding. Bicycle rental has lighter paperwork but still needs a passport hold. Grab Bike is app-hailed and driver-licensed if you prefer not to self-drive.',
        image: img('photo-1589829545856-d0995768596e'),
      },
      {
        title: '🦺 Safety and inspection tips',
        body: 'Before you roll: test brakes, lights, horn, and tyre tread; photograph existing scratches. Wear a proper helmet (not a novelty shell), closed shoes, and sleeves at night. Ride defensively — traffic merges from every angle and rules are interpreted locally. Avoid first-day riding in HCMC rush hour; start in calmer Hoi An or Da Nang lanes. Never drink and ride; rain makes painted lines treacherously slick.',
        image: img('photo-1558980664-769d59546b3d'),
      },
    ],
  },
  'car-taxi': {
    intro:
      '🚕 Cars and taxis are the default urban hop when heat, rain, luggage, or a family group makes two wheels impractical. Grab Car dominates app bookings; Mai Linh and Vinasun remain reliable street-hail brands in major cities.',
    heroImage: img('photo-1511527661048-7f093d1f8c0b'),
    blocks: [
      {
        title: '📱 Apps vs street hail',
        body: 'Grab shows upfront pricing, live tracking, and card payment — best for foreigners and late nights. Street taxis should use the meter; confirm “by meter” before you sit. Airport and Old Quarter touts may quote flat inflated fares — walk to a main road or use the app.',
        image: img('photo-1449965408869-eaa3f409d32f'),
      },
      {
        title: '🚦 Traffic reality',
        body: 'A 3 km hop can take 25 minutes at rush hour in Hanoi or District 1. Motorbike traffic weaves around cars; stay belted and expect sudden stops. Tipping is not expected; rounding up a small amount is fine.',
        image: img('photo-1544620341-11cb2f96f2ca'),
      },
    ],
  },
  'public-transit': {
    intro:
      '🚌 City buses and — in HCMC — a growing metro/BRT network offer the lowest urban fares. Routing takes patience; English signage is improving but not universal.',
    heroImage: img('photo-1570125909232-eb263c188f7e'),
    blocks: [
      {
        title: '🗺️ Where it works',
        body: 'HCMC Metro Line 1 links Ben Thanh ↔ Suoi Tien on a useful east–west spine. Hanoi has BRT and dense bus corridors on major arterials. Hoi An and Da Nang have limited useful bus coverage for tourists — taxis often win on time.',
        image: img('photo-1544620341-11cb2f96f2ca'),
      },
      {
        title: '🎫 Fares and payment',
        body: 'Cash coins and small notes on entry; keep exact change on older buses. Metro uses tap cards sold at stations. Services typically run ~05:30–21:00; plan a taxi backup for late returns.',
        image: img('photo-1556742049-0cfed4f6a45d'),
      },
    ],
  },
  walking: {
    intro:
      '🚶 Walking is often the best “mode” inside compact historic cores — Hanoi Old Quarter lanes, Hoi An Ancient Town, and HCMC District 1 pockets reward slow exploration.',
    heroImage: img('photo-1559592413-7cec4d0cae2b'),
    blocks: [
      {
        title: '👟 When to choose feet',
        body: 'Under ~1.5 km between sights, walking beats waiting for a taxi. Early morning and golden hour dodge heat. Uneven tiles, missing kerbs, and scooter parking on pavements require attention.',
        image: img('photo-1528183429752-a663d3bd4713'),
      },
      {
        title: '🌦 Weather planning',
        body: 'Carry a compact umbrella May–October. Midday sun is brutal — schedule indoor stops 11:00–15:00. After heavy rain, flooded intersections appear quickly in HCMC and Hanoi.',
        image: img('photo-1504608524841-42fe6f032b4b'),
      },
    ],
  },
  bicycle: {
    intro:
      '🚲 Dedicated cycling suits calmer towns — Hoi An countryside, Phu Quoc coastal roads, and Ninh Binh lanes — more than dense HCMC arterials without protected lanes.',
    heroImage: img('photo-1485965120184-e220f721d03e'),
    blocks: [
      {
        title: '🛤️ Best routes',
        body: 'Hoi An → An Bang Beach and rice-field loops are classic half-day rides. Da Nang riverfront promenades work at dawn. Avoid national highways without a shoulder.',
        image: img('photo-1541625602330-2277a4c46182'),
      },
      {
        title: '⚡ E-bikes and tours',
        body: 'E-bikes flatten Da Lat hills and extend range for families. Guided countryside tours include water and route knowledge — worth it if you are unsure of traffic patterns.',
        image: img('photo-1571068316344-75bc76f77890'),
      },
    ],
  },
  'urban-driver': {
    intro:
      '🚐 A private half-day or full-day car removes heat stress and carries luggage between scattered city sights — especially for families, seniors, or multi-stop photography days.',
    heroImage: img('photo-1485291571150-772bcfc10da5'),
    blocks: [
      {
        title: '📅 How to book',
        body: 'Arrange through your hotel, Klook, or a trusted transfer agency with a written itinerary, hours, and fuel policy. Sedan vs seven-seater matters for family of four plus bags.',
        image: img('photo-1449965408869-eaa3f409d32f'),
      },
      {
        title: '💡 When it pays off',
        body: 'Temple clusters outside Hue, marble mountains + beach combos in Da Nang, or rainy-day museum circuits. Less economical for a single 2 km Old Quarter hop — use Grab instead.',
        image: img('photo-1469854523086-cc02fe5d8800'),
      },
    ],
  },
}

export const WATER_OVERVIEW: ModeGuideBlock[] = [
  {
    title: 'Where water is actually transport',
    body: 'This section covers boats that take you on and off islands, plus the few Vietnamese waters where a boat is how people really move — not freight, and not a city sightseeing circuit. Choose an island below for the accurate mix (taxi or scooter only to the pier, then ferry or flight).',
  },
]

export const WATER_MODE_GUIDES: Partial<Record<WaterModeId, ModeGuide>> = {
  ferry: {
    intro:
      '⛴️ Scheduled ferries are the workhorse mainland ↔ island link — slower than flying, cheaper, and sometimes the only way to bring a vehicle.',
    heroImage: img('photo-1544551763-46a013bb70d5'),
    blocks: [
      {
        title: '🗺️ Main corridors',
        body: 'Rach Gia / Ha Tien ↔ Phu Quoc; Vung Tau ↔ Con Dao (long overnight); Hai Phong ↔ Cat Ba. Vehicle decks fill first in peak season — book ahead for Tet and summer weekends.',
        image: img('photo-1559592413-7cec4d0cae2b'),
      },
    ],
  },
  'fast-boat': {
    intro:
      '🚤 Fast boats cut island crossing time on calm days — bumpier, stricter on luggage weight, and more weather-cancelled than large ferries.',
    heroImage: img('photo-1567899378494-47b22a2ae96a'),
    blocks: [
      {
        title: '⚡ Speed vs comfort',
        body: 'Phu Quoc express services from Rach Gia or Ha Tien run roughly 2–2.5 hours vs longer conventional ferries. Motion sickness is common — sit aft, bring medication, avoid heavy meals.',
        image: img('photo-1544551763-46a013bb70d5'),
      },
    ],
  },
  'sightseeing-boat': {
    intro:
      '🛥️ Local and sightseeing boats are experience-first: short bay loops, river paddles, and lagoon hops where the journey is the attraction.',
    heroImage: img('photo-1507525428034-b723cf961d3e'),
    blocks: [
      {
        title: '📍 Where tourists use them',
        body: 'Ha Long day junks, Hoi An lantern boat rides, Ninh Binh sampan through caves, Hue perfume river at sunset. Book same-day at the pier or through your hotel for negotiated pickup.',
        image: img('photo-1528127269322-539801943592'),
      },
    ],
  },
  cruise: {
    intro:
      '🚢 Overnight bay cruises package sleep, meals, and kayaking — a fixed itinerary product, not point-to-point transport.',
    heroImage: img('photo-1559827260-dc66d52bef19'),
    blocks: [
      {
        title: '🛏️ What you are buying',
        body: '1N/2D and 2N/3D Ha Long or Lan Ha loops dominate. Quality swings by ship tier — compare cabin photos, crowd size, and whether route enters Lan Ha’s quieter karsts.',
        image: img('photo-1506905925346-21bda4d32df4'),
      },
    ],
  },
  'river-boat': {
    intro:
      '🚣 Mekong and delta river boats are essential for market mornings and homestay access — schedules informal, fares negotiated locally.',
    heroImage: img('photo-1528127269322-539801943592'),
    blocks: [
      {
        title: '🌾 Delta rhythm',
        body: 'Can Tho Cai Rang floating market starts before dawn — boat hire is by the hour. Combine with a guided tour if you need English commentary and fixed timing back to the city.',
        image: img('photo-1583417319070-4a69db38a482'),
      },
    ],
  },
}
