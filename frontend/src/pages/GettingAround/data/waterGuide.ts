export const WATER_IN_DEPTH_PATH = '/plan/builder/transport/water'

export const WATER_PHOTOS = {
  haLong:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ha_Long_Bay_-_Halong1407.jpg/1920px-Ha_Long_Bay_-_Halong1407.jpg',
  ferry:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Ferry_from_Haiphong_to_Cat_Ba_Island_-_panoramio.jpg/1920px-Ferry_from_Haiphong_to_Cat_Ba_Island_-_panoramio.jpg',
  ferryDeck:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Cat_Ba_ferry_1.jpg/1280px-Cat_Ba_ferry_1.jpg',
  cruise:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Cruising_Ha_Long_Bay_%2825415940037%29.jpg/1920px-Cruising_Ha_Long_Bay_%2825415940037%29.jpg',
  dayCruise:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/A_line_up_of_cruise_boats_on_the_Ha_Long_Bay_%2831598856166%29.jpg/1920px-A_line_up_of_cruise_boats_on_the_Ha_Long_Bay_%2831598856166%29.jpg',
  river:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Tam_Coc_%2885925447%29.jpeg/1920px-Tam_Coc_%2885925447%29.jpeg',
  mekong:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Cai_Rang_Floating_Market_1.jpg/1920px-Cai_Rang_Floating_Market_1.jpg',
  cruiseNight:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Halong_20220731_203733.jpg/1920px-Halong_20220731_203733.jpg',
  cruiseDeck:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Halong_Bay%2C_Boat_deck.jpg/1920px-Halong_Bay%2C_Boat_deck.jpg',
  cruiseBridge:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Captain_deck.jpg/1920px-Captain_deck.jpg',
}

const CRUISE_COMPARISON_COLUMNS = [
  'Route / Region',
  'Typical Schedule',
  'Vibe & Water',
  'Departure Hubs & Transit',
] as const

const CRUISE_PIER_NOTICE =
  'Pier Verification Notice: Cruising operators depart from different harbors across Ha Long City. Always verify the exact pier name on your voucher before setting off in a taxi or van—Tuan Chau Marina, Sun World Port, and Hon Gai Pier are completely separate locations.'

export const WATER_WHEN_INTRO =
  'Water transport in Vietnam falls into four distinct categories—and confusing them is a common traveler trap. A day cruise in Ha Long Bay is not a ferry connection to Cat Ba, and an overnight junk is a floating hotel, not a way to get down the coast. As a rule, turn to water transport only when land ends: accessing offshore islands, spending the night on a bay, or exploring river caves by sampan.'

export const WATER_WHEN_SECTIONS = [
  {
    title: 'When the Boat is the Crossing',
    body: 'For islands like Phu Quoc, Con Dao, Cat Ba, the Cham Islands, or Ly Son, overland transit stops at the pier. While Cat Ba strictly requires a ferry, speedboat, or cable car, flying remains the preferred choice for Phu Quoc and Con Dao due to long sea travel times.',
  },
  {
    title: 'When the Boat is the Destination',
    body: 'Overnight cruises in Ha Long and Lan Ha Bays serve as floating accommodations rather than point-to-point transit (harbor transfers from Hanoi are booked separately). A day boat gives you a quick glimpse of the karst islands, but an overnight stay is the intended way to see the bay.',
  },
  {
    title: 'When to Avoid Boats',
    body: 'Long-distance mainland routes (like Hanoi to Hue or Hue to Da Nang) should always be covered by train or road. Similarly, inner-city water taxis like the Saigon River Bus are fun leisure activities, but ride-hailing apps like Grab remain far superior for actual city transit. Finally, avoid booking hydrofoils on tight schedules—rough seas can ground ferry departures with little advance notice.',
  },
]

export type WaterProvider = {
  name: string
  tag: string
  href: string
  body: string
}

export type WaterPier = {
  name: string
  city: string
  station?: string
  how?: string
  bullets?: string[]
  maps: string
}

export type WaterModeGuide = {
  id: string
  title: string
  kicker: string
  intro: string
  sections: { title: string; body?: string; groups?: { name: string; points: string[] }[] }[]
  photos: { src: string; alt: string; caption: string }[]
  routes: {
    name: string
    time?: string
    facts?: { label: string; text: string }[]
    bullets?: string[]
    body?: string
  }[]
  comparison?: {
    heading: string
    columns: string[]
    rows: { region: string; schedule: string[]; vibe: string; hubs: string }[]
    notice: string
  }
  piers: WaterPier[]
  providers: WaterProvider[]
}

export const WATER_MODES: WaterModeGuide[] = [
  {
    id: 'ferries',
    title: 'Navigating Vietnam’s Island Ferries',
    kicker: 'Point-to-point, weather-bound',
    intro:
      'Mainland-to-island ferries in Vietnam are functional transit connections rather than leisurely sightseeing cruises. Always book a specific sailing time with a reputable operator rather than showing up at the pier expecting an informal water taxi. Keep in mind that scooters or taxis take you only as far as the harbor gate—you will board the vessel as a foot passenger unless taking a large car ferry.',
    sections: [
      {
        title: 'The Logistics of Major Island Routes',
        body: 'Getting to an island almost always involves two distinct bookings: ground transport to the pier and the ferry crossing itself. Routes to Phu Quoc leave from Rach Gia or Ha Tien via Superdong or Phu Quoc Express. Con Dao is served by fast hydrofoils from Tran De or Vung Tau. Cat Ba requires crossing water via the Cat Hai car ferry, a Ha Long Bay passenger boat, or the Sun World sea-crossing cable car. Day trips to the Cham Islands run on high-speed launches from Hoi An\'s Cua Dai Port.',
      },
      {
        title: 'When to Ferry vs. When to Fly',
        body: 'Fly to Phu Quoc or Con Dao if you have limited time or heavy luggage, as flights bypass long road connections and ocean swells. The ferry makes sense primarily if you are already traveling through the Mekong Delta. For Cat Ba, boat or cable car transit is required since there is no island airport. Finally, allow buffer time: hydrofoil schedules are vulnerable to rough weather, so avoid booking a same-day international flight right after a sea crossing.',
      },
    ],
    photos: [
      {
        src: WATER_PHOTOS.ferry,
        alt: 'Passenger ferry from Hai Phong toward Cat Ba',
        caption: 'Hai Phong–Cat Ba water. The last hop after the road — not a cruise.',
      },
      {
        src: WATER_PHOTOS.ferryDeck,
        alt: 'Buses on the Cat Ba to Cat Hai car ferry',
        caption: 'Cat Ba car ferry. Vehicles roll on. Foot passengers stand on deck.',
      },
    ],
    routes: [
      {
        name: 'Phu Quoc Island Hops',
        facts: [
          { label: 'Duration', text: '45–80 mins (from Ha Tien) | 2–2.5 hours (from Rach Gia)' },
          { label: 'Key Operators', text: 'Superdong, Phu Quoc Express' },
        ],
        bullets: [
          'Ha Tien is the shortest water route; Rach Gia is a longer sea crossing.',
          'Bottom Line: If departing from Saigon (HCMC), flying directly to Phu Quoc is still the most practical choice.',
        ],
      },
      {
        name: 'Con Dao Archipelago',
        facts: [
          { label: 'Duration', text: '2.5 to 5 hours (via Fast Hydrofoil)' },
          { label: 'Departure Piers', text: 'Vung Tau, Tran De (Soc Trang), or Hiep Phuoc' },
        ],
        bullets: [
          'Weather Warning: High sea swells lead to frequent cancellations.',
          'Bottom Line: Fly directly from Tan Son Nhat Airport (SGN) unless you are already exploring the southern coast with flexible timing.',
        ],
      },
      {
        name: 'Cat Ba Island',
        facts: [
          { label: 'Duration', text: '20–30 mins (water crossing)' },
          { label: 'Main Route', text: 'Dong Bai Pier → Cai Vieng Pier' },
        ],
        bullets: [
          'Road Connection: No bridges connect directly to the island; water or cable car transit is mandatory.',
          'Transit Tip: Combine a Hanoi-to-Got/Dong Bai limousine van with the local ferry rather than booking an indirect tour boat.',
        ],
      },
      {
        name: 'Cham Islands & Ly Son',
        facts: [
          { label: 'Duration', text: 'Cham Islands (20–50 mins) | Ly Son (30–75 mins)' },
          { label: 'Departure Piers', text: 'Cua Dai (for Cham) | Sa Ky (for Ly Son)' },
        ],
        bullets: [
          'Vessel Type: High-speed day-return launches.',
          'Weather Risk: Highly subject to sea swell cancellations. Always keep your afternoon return plans flexible.',
        ],
      },
    ],
    piers: [
      {
        name: 'Ha Tien (Phu Quoc Ferry Hub)',
        city: 'Ha Tien',
        station: 'Ha Tien Superdong Terminal',
        bullets: [
          'How to Buy: Walk-up counter tickets (morning of departure) or show e-tickets from 12Go / Superdong.',
          'Payment: Cash in Vietnamese Dong (VND) for walk-ups.',
          'Pro Tip: Arrive 30–45 minutes prior to departure. Note that the quay is a transit terminal, not a hotel area.',
        ],
        maps: 'https://www.google.com/maps/search/?api=1&query=Ha+Tien+Super+Dong+ferry+terminal',
      },
      {
        name: 'Phu Quoc (Island Arrival / Departure Piers)',
        city: 'Phu Quoc',
        station: 'Bai Vong Pier (East) / An Thoi Port (South)',
        bullets: [
          'How to Buy: Return ferry tickets are sold directly at the operator desks at the pier.',
          'Onward Transit: Use Grab or pre-arranged hotel pickup from the pier.',
          'Pro Tip: Do not attempt to bring a mainland rental scooter across the sea—rent locally on the island instead.',
        ],
        maps: 'https://www.google.com/maps/search/?api=1&query=Bai+Vong+ferry+port+Phu+Quoc',
      },
      {
        name: 'Cat Ba Island Crossing',
        city: 'Cat Ba',
        station: 'Dong Bai Pier (Mainland) & Cai Vieng Pier (Cat Ba)',
        bullets: [
          'How to Buy: Pay cash at the pier booth for the public vehicle/car ferry. Keep your physical ticket stub.',
          'Alternative Route: The Sun World Cable Car station is located nearby and requires a separate ticket.',
          'Important: The old Got Pier is permanently closed for passenger ferries; all traffic now operates via Dong Bai Pier.',
        ],
        maps: 'https://www.google.com/maps/search/?api=1&query=Dong+Bai+ferry+Cat+Hai',
      },
      {
        name: 'Hoi An (Cham Islands Launch)',
        city: 'Hoi An',
        station: 'Cua Dai Pier, Hoi An',
        bullets: [
          'How to Buy: Speedboat tickets sold at Cua Dai counter windows or booked through Hoi An hotels.',
          'Mandatory: Bring your physical passport for border guard check.',
          'Pro Tip: Morning launches fill up fast during high season (May–Aug); buy your ticket the day before if possible.',
        ],
        maps: 'https://www.google.com/maps/search/?api=1&query=Cua+Dai+pier+Hoi+An+Cham+Island',
      },
    ],
    providers: [
      {
        name: 'Super Dong',
        tag: 'Operator',
        href: 'https://superdong.com.vn/',
        body: 'Phu Quoc, Nam Du, and Kien Giang hops. Buy a sailing time. Check the morning board if the wind is up.',
      },
      {
        name: '12Go ferries',
        tag: 'Marketplace',
        href: 'https://12go.asia/en/ferry/',
        body: 'English checkout for named sailings. Read the actual pier. Screenshot the ticket; the quay still likes a phone copy.',
      },
      {
        name: 'Phu Quoc Express',
        tag: 'Operator',
        href: 'https://12go.asia/en/travel/ha-tien/phu-quoc',
        body: 'Ha Tien–Phu Quoc competitor to Super Dong. Same rule: named departure, not a vibe.',
      },
    ],
  },
  {
    id: 'cruises',
    title: 'Cruises',
    kicker: 'A floating hotel, not a transfer',
    intro:
      'Ha Long can be both a day trip and a night on the water. An overnight cruise is a luxury floating hotel — private cabin, meals, dusk and dawn — not extra sightseeing hours, and not a transfer down the coast.',
    sections: [
      {
        title: 'Golden Rule',
        body: 'Treat 2 Days / 1 Night as the absolute minimum trip duration to justify the travel time from Hanoi.',
      },
      {
        title: 'What Your Ticket Covers',
        body: 'An overnight cruise package functions as an all-inclusive luxury stay. Included: private cabin accommodation, all onboard meals, kayaking excursions, and guided cave visits along a fixed island route. Transfers: the 2.5 to 3.5-hour van transfer between Hanoi and the harbor is almost always a separate add-on ticket—double-check this during booking. Itinerary: Day 1 begins with midday boarding; Day 2 finishes with a morning on the water and a mid-afternoon return to the pier.',
      },
      {
        title: 'Overnight Cruise vs. Day Boat: Which to Pick?',
        body: 'Ha Long works both ways. If sightseeing is the main agenda — caves, lagoons, the postcard karsts in daylight — take the day cruise and sleep in a hotel. Overnight cruises are usually for luxury: the cabin, the meals, and the quiet hours after day boats leave. Lan Ha and Bai Tu Long stay quieter than the classic Ha Long core either way.',
      },
      {
        title: 'Flight & Weather Warnings',
        body: 'Flight Connections: never book a same-night flight out of Hanoi (Noi Bai Airport) directly after your cruise ends without building in a generous buffer for highway delays. Typhoon Season (June–October): storm warnings can ground all harbor sailings even when land transport runs fine. Always maintain a flexible hotel booking in Hanoi as a backup.',
      },
    ],
    photos: [
      {
        src: WATER_PHOTOS.cruiseDeck,
        alt: 'Furnished sundeck on a luxury overnight cruise in Ha Long Bay',
        caption: 'On deck of a luxury overnight — this is the stay, not extra sightseeing.',
      },
      {
        src: WATER_PHOTOS.cruiseBridge,
        alt: 'Bridge and interior of an Indochine luxury cruise on Ha Long Bay',
        caption: 'Inside a luxury overnight: cabins, meals, and the bridge on the same hull.',
      },
      {
        src: WATER_PHOTOS.cruiseNight,
        alt: 'Overnight cruise boats lit on Ha Long Bay at night',
        caption: 'Night on a good cruise — dusk and dawn are why you stay aboard.',
      },
      {
        src: WATER_PHOTOS.cruise,
        alt: 'Luxury overnight cruise boat on Ha Long Bay',
        caption: 'The hull on the water. Ha Long is also a day cruise if sightseeing is the point.',
      },
    ],
    routes: [],
    comparison: {
      heading: 'Popular Cruises Comparison',
      columns: [...CRUISE_COMPARISON_COLUMNS],
      rows: [
        {
          region: 'Ha Long Core',
          schedule: ['Board: ~12:00 PM', 'Disembark: ~11:30 AM (Next Day)'],
          vibe: 'Busy and tourist-heavy; shares caves and lagoons with day boats until dusk.',
          hubs: 'Tuan Chau Harbor or Halong Int’l Cruise Port (2.5–3.5 hrs from Hanoi by limousine van)',
        },
        {
          region: 'Lan Ha & Bai Tu Long',
          schedule: ['Board: ~12:00 PM', 'Disembark: ~11:30 AM (Next Day)'],
          vibe: 'Significantly quieter waters, cleaner scenery, and fewer horns.',
          hubs: 'Tuan Chau Harbor or Got / Hon Gai Piers (2.5–3 hrs from Hanoi by limousine van)',
        },
      ],
      notice: CRUISE_PIER_NOTICE,
    },
    piers: [
      {
        name: 'Tuan Chau harbour',
        city: 'Ha Long',
        how: 'Most overnight junks board here. Your operator should have a greeter with a sign. Do not buy a random “cruise” from a tout at the gate — it will be a day boat.',
        maps: 'https://www.google.com/maps/search/?api=1&query=Tuan+Chau+harbour+Ha+Long',
      },
      {
        name: 'Hon Gai / Ha Long city piers',
        city: 'Ha Long',
        how: 'Some day and overnight operators still use city-side docks. Match the pier name on the voucher. Hotel pickup in Ha Long town is a short Grab if you overnighted on land.',
        maps: 'https://www.google.com/maps/search/?api=1&query=Hon+Gai+international+passenger+port',
      },
    ],
    providers: [
      {
        name: 'Klook · Ha Long overnight',
        tag: 'Package',
        href: 'https://www.klook.com/en-US/search/?query=ha%20long%20overnight%20cruise%20lan%20ha',
        body: 'Packages already searched for overnight and Lan Ha. Confirm whether the Hanoi van is included.',
      },
      {
        name: 'GetYourGuide · Ha Long cruise',
        tag: 'Package',
        href: 'https://www.getyourguide.com/s/?q=Ha%20Long%20Bay%20overnight%20cruise',
        body: 'Another English marketplace. Read cabin class (window vs interior) and the cancellation window.',
      },
      {
        name: 'Bhaya / Heritage Line / similar',
        tag: 'Operator sites',
        href: 'https://www.klook.com/en-US/search/?query=ha%20long%20bay%20cruise',
        body: 'Named junk companies sell direct. Direct is cleaner for cabin upgrades; marketplaces are cleaner for comparing a date.',
      },
    ],
  },
  {
    id: 'river',
    title: 'River boats and local water taxis',
    kicker: 'Scenic loops, city hops, one river border',
    intro: '',
    sections: [
      {
        title: 'Leisure scenery: karst rivers and evening cruises',
        groups: [
          {
            name: 'Tam Coc and Trang An (Ninh Binh)',
            points: [
              'Concept: Rowed sampan trips through limestone karsts.',
              'Mechanics: Buy tickets at official park quays and board an assigned numbered boat for a 2–3 hour loop.',
              'Transit tip: This is a scenic activity, not transport to Hanoi. You must book a limousine van or train separately for long distances.',
            ],
          },
          {
            name: 'Hoi An and Hue evening boats',
            points: [
              'Short night rides on the Hoai and Perfume rivers for lanterns and sightseeing—purely leisure, not point-to-point transit.',
            ],
          },
        ],
      },
      {
        title: 'Local transit: Mekong canals and city waterbuses',
        groups: [
          {
            name: 'Mekong Delta canals (Can Tho, My Tho, Ben Tre)',
            points: [
              'Floating markets: Early-morning departures from Ninh Kieu Pier (Can Tho) for Cai Rang Market.',
              'Private hire: Negotiate hourly sampans directly at local quays or book packaged speedboats for narrow canal routes.',
              'Overland links: Coaches and buses connect the mainland piers.',
            ],
          },
          {
            name: 'Saigon Waterbus (Ho Chi Minh City)',
            points: [
              'Concept: Public transit running along the Saigon River from Bach Dang Station (District 1).',
              'Real-world use: Best used for cheap skyline sightseeing or getting to Thao Dien / Binh An. For fast city transit, Grab rides win.',
            ],
          },
        ],
      },
      {
        title: 'International crossing: Mekong river speedboat',
        body: 'Route: Chau Doc (Vietnam) to Phnom Penh (Cambodia).',
        groups: [
          {
            name: 'How it works',
            points: [
              'Mechanics: Daily morning speedboats (e.g. Hang Chau, Victoria) cruising up the Mekong / Bassac River (~5.5 hours total).',
              'Border control: Riverborne international crossing with immigration formalism handled directly at the Vinh Xuong / Kaam Samnor border.',
              'Booking tip: Stay overnight in Chau Doc prior to departure to make the ~7:00 AM launch.',
            ],
          },
        ],
      },
    ],
    photos: [
      {
        src: WATER_PHOTOS.river,
        alt: 'Sampan at Tam Coc, Ninh Binh',
        caption: 'Tam Coc — the river is the visit.',
      },
      {
        src: WATER_PHOTOS.mekong,
        alt: 'Cai Rang floating market near Can Tho',
        caption: 'Cai Rang, Can Tho. Dawn is the point. Buy at Ninh Kieu or with a hotel boat.',
      },
    ],
    routes: [],
    piers: [
      {
        name: 'Tam Coc and Trang An quays',
        city: 'Ninh Binh',
        how: 'Buy the park ticket, then the boat ticket at the official window. Ignore touts in the car park. Cash in dong. Boats seat four; you may share.',
        maps: 'https://www.google.com/maps/search/?api=1&query=Tam+Coc+boat+station+Ninh+Binh',
      },
      {
        name: 'Ninh Kieu quay, Can Tho',
        city: 'Can Tho',
        how: 'Dawn boats to Cai Rang. Hotels sell packages; independent hire is at the quay. Agree a price and a return time before you sit.',
        maps: 'https://www.google.com/maps/search/?api=1&query=Ninh+Kieu+wharf+Can+Tho',
      },
      {
        name: 'Saigon waterbus stops',
        city: 'Ho Chi Minh City',
        how: 'Ticket machines and small counters at the piers. Tap or cash. Check last sailing — it is not 24 hours.',
        maps: 'https://www.google.com/maps/search/?api=1&query=Bach+Dang+waterbus+station+Ho+Chi+Minh+City',
      },
    ],
    providers: [
      {
        name: 'Klook · Trang An / Tam Coc',
        tag: 'Park + boat',
        href: 'https://www.klook.com/en-US/search/?query=Trang%20An%20boat%20Ninh%20Binh',
        body: 'Skip-the-guesswork packages from Hanoi. The quay still sells walk-up if you arrive with a van.',
      },
      {
        name: 'Klook · Cai Rang',
        tag: 'Dawn market',
        href: 'https://www.klook.com/en-US/search/?query=Cai%20Rang%20floating%20market%20Can%20Tho%20boat',
        body: 'Hotel pickup plus boat. Independent hire at Ninh Kieu is cheaper if you already sleep in Can Tho.',
      },
      {
        name: '12Go · Chau Doc–Phnom Penh',
        tag: 'Border boat',
        href: 'https://12go.asia/en/travel/chau-doc/phnom-penh',
        body: 'The Mekong exit from Vietnam. Immigration is on the river. This is not a domestic island ferry.',
      },
    ],
  },
]

export const WATER_BOOKING = [
  {
    name: '12Go',
    tag: 'Ferries',
    href: 'https://12go.asia/en/ferry/',
    body: 'English marketplace for named sailings. Read the actual pier — “Ha Tien” is not your hotel. Screenshot the ticket; the quay still likes a paper or phone copy.',
  },
  {
    name: 'Super Dong',
    tag: 'Operator',
    href: 'https://superdong.com.vn/',
    body: 'The workhorse on Phu Quoc, Nam Du, and neighbouring Kien Giang hops. Buy a sailing time, not a vibe. Check the morning board if the wind is up.',
  },
  {
    name: 'Klook / GetYourGuide',
    tag: 'Cruises',
    href: 'https://www.klook.com/en-US/search/?query=ha%20long%20cruise',
    body: 'Ha Long and Lan Ha overnights and day boats are a package, not a ferry ticket. Confirm transfers from Hanoi are included or priced separately.',
  },
]

export const WATER_WEATHER = [
  {
    title: 'The sea can refuse you',
    body: 'Phu Quoc and Con Dao hydrofoils take the southwest monsoon worst in mid-to-late summer. Ha Long and Lan Ha take typhoon windows, typically June–October. If the last boat is your only way off an island, keep a hotel night in the port town.',
  },
  {
    title: 'What to do if it is cancelled',
    body: 'Do not stand on the quay arguing with the sea. Rebook the next sailing or fly if the island has a runway (Phu Quoc, Con Dao). Tell the hotel. Keep the cancellation note for insurance. Grab or a limousine still runs when the hydrofoil does not.',
  },
  {
    title: 'On the boat',
    body: 'Life jacket where they tell you. Passports and phones on your body, not in a hold bag. Seasickness is real on Con Dao and open-water Cat Ba hops — sit mid-ship. 113 is still police on land; on the water, follow the crew first, then call from the pier.',
  },
]
