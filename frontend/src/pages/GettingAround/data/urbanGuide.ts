export const URBAN_IN_DEPTH_PATH = '/plan/builder/transport/city'

export const URBAN_PHOTOS = {
  oldQuarter:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/2024-11-03_Hanoi%27s_Old_Quarter_7.jpg/1920px-2024-11-03_Hanoi%27s_Old_Quarter_7.jpg',
  streetLife:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Vietnam%2C_Hanoi%2C_Life_on_the_streets_of_Hanoi.jpg/1920px-Vietnam%2C_Hanoi%2C_Life_on_the_streets_of_Hanoi.jpg',
  walking:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/2024-11-03_Hanoi%27s_Old_Quarter_1.jpg/1920px-2024-11-03_Hanoi%27s_Old_Quarter_1.jpg',
}

export const URBAN_WHEN_INTRO =
  'In Vietnam’s major urban cores, long-haul trains and buses give way to walkability, app ride-hailing, and short scooter hops.'

export const URBAN_WHEN_SECTIONS: {
  title: string
  body?: string
  groups?: { name: string; points: string[] }[]
}[] = [
  {
    title: 'Walkability & Street Navigation',
    groups: [
      {
        name: 'Where walk-first works',
        points: ['Old Quarter (Hanoi), Ancient Town (Hoi An), and District 1 (Ho Chi Minh City).'],
      },
      {
        name: 'Distance rule',
        points: ['Under 1.5 km, walking is faster than navigating narrow alley traffic in a car.'],
      },
      {
        name: 'Best times',
        points: ['Early morning or after 16:00 to avoid severe midday heat.'],
      },
      {
        name: 'Pedestrian safety',
        points: [
          'Pavements are often uneven or used for scooter parking. When crossing roads, walk at a steady, predictable pace so incoming traffic can flow around you—avoid sudden, erratic movements or stopping mid-street.',
        ],
      },
    ],
  },
  {
    title: 'App Ride-Hailing & Taxis',
    groups: [
      {
        name: 'Primary apps',
        points: [
          'Grab, Be, and Xanh SM (EV taxis) are the gold standard—showing upfront pricing before you book.',
        ],
      },
      {
        name: 'Bikes vs. cars',
        points: [
          'GrabBike / Be Bike: Fastest and cheapest for solo travelers with small backpacks navigating heavy city traffic.',
          'GrabCar / Be Car: Essential for groups, heavy luggage, midday heat, or sudden rainstorms.',
        ],
      },
      {
        name: 'Metered taxis',
        points: [
          'Reputable traditional fleets (Mai Linh and Vinasun) or electric fleets (Xanh SM) are reliable as long as the meter is running.',
        ],
      },
      {
        name: 'Scam warning',
        points: [
          'Avoid hotel-door or airport touts who offer fixed flat-rate fares—they are almost always significantly more expensive than app-based rides.',
        ],
      },
    ],
  },
  {
    title: 'Scooter & Vehicle Rentals',
    groups: [
      {
        name: 'Ideal cities for scooters',
        points: ['Hoi An, Da Nang, Da Lat, and Phu Quoc—where roads are wider and less congested.'],
      },
      {
        name: 'Where to avoid driving',
        points: [
          'Do not attempt self-drive scooters during your first evening in Hanoi or Ho Chi Minh City rush-hour traffic.',
        ],
      },
      {
        name: 'Legal requirements',
        points: [
          'An International Driving Permit (IDP) with a valid motorcycle endorsement from your home country is legally required. Standard travel insurance policies typically void claims for unlicensed riding.',
        ],
      },
      {
        name: 'Private cars with drivers',
        points: [
          'Hiring a car with a dedicated driver is the most stress-free choice for families or multi-stop city day trips. Self-driving a car in dense urban cores is rarely worth the traffic and parking hassle.',
        ],
      },
    ],
  },
]

export const URBAN_APPS = [
  {
    name: 'Grab',
    ios: 'https://apps.apple.com/app/grab-superapp/id647268330',
    android: 'https://play.google.com/store/apps/details?id=com.grabtaxi.passenger',
  },
  {
    name: 'Be',
    ios: 'https://apps.apple.com/vn/app/be/id1442264795',
    android: 'https://play.google.com/store/apps/details?id=xyz.be.customer',
  },
  {
    name: 'Xanh SM',
    ios: 'https://apps.apple.com/vn/app/xanh-sm/id6444787092',
    android: 'https://play.google.com/store/apps/details?id=taxi.gsm.customer',
  },
]

export const URBAN_RENTAL_INTRO =
  'Driving in Vietnam is strictly regulated. While street shops may rent to anyone, operating a vehicle legally requires specific documentation to avoid police fines (up to 10 million dong) and voided travel insurance.'

export const URBAN_LICENSE_COLUMNS = [
  'Criterion',
  'Motorbikes (100cc – 150cc)',
  '50cc / Electric Scooters',
  'Self-Drive Cars',
] as const

export const URBAN_LICENSE_ROWS = [
  {
    criterion: 'Minimum age',
    moto: '18 years old',
    cc50: '16 years old',
    car: '18 years old (21+ for major car rental agencies)',
  },
  {
    criterion: 'License / treaty',
    moto: 'Home motorcycle license + 1968 Vienna IDP',
    cc50: 'No license required',
    car: 'Home driver’s license + 1968 Vienna IDP',
  },
  {
    criterion: 'Visa / stamp',
    moto: 'Any valid entry visa / tourist e-Visa',
    cc50: 'Any valid entry visa / tourist e-Visa',
    car: 'Tourist e-Visa + passports with more than 3-month residency (for local driver license conversion if IDP fails)',
  },
  {
    criterion: 'Insurance reality',
    moto: 'Medical policies void all claims if driving without a 1968 IDP + motorcycle class endorsement',
    cc50: 'Standard medical policies cover non-motorized / 50cc accidents',
    car: 'Standard rental collision damage waivers apply',
  },
]

export const URBAN_IDP_NOTICE =
  'The 1968 Vienna Convention trap: Vietnam only accepts IDPs issued under the 1968 Vienna Convention. IDPs from the USA, Canada, Australia, New Zealand, and Ireland are issued under the 1949 Geneva Convention and are legally invalid in Vietnam. Travelers from these countries must stick to 50cc scooters, Grab/taxis, or private drivers.'

export const URBAN_PROVIDER_COLUMNS = [
  'Vehicle type',
  'Standard rates',
  'Reputable / verified providers',
  'Deposit & documentation',
] as const

export const URBAN_PROVIDER_ROWS: {
  type: string
  rates: string
  providers: { name: string; href: string }[]
  deposit: string
}[] = [
  {
    type: 'Scooter / semi-auto (110cc–125cc)',
    rates: '$5 – $12 / day (120,000–280,000 dong)',
    providers: [
      { name: 'Tigit Motorbikes (Hanoi, HCMC, Da Nang)', href: 'https://www.tigitmotorbikes.com/' },
      { name: 'Style Motorbikes (Hanoi, HCMC, Hoi An)', href: 'https://stylemotorbikes.com/' },
      { name: 'Rentabike Vietnam (Hanoi)', href: 'https://rentabikevn.com/' },
    ],
    deposit: 'Never leave your physical passport. Offer a cash deposit ($100–$300) + a passport photocopy instead.',
  },
  {
    type: 'Touring / off-road (150cc–300cc)',
    rates: '$18 – $35 / day (450,000–850,000 dong)',
    providers: [
      { name: 'Flamingo Travel (Hanoi)', href: 'https://flamingotravel.com.vn/' },
      { name: 'Tigit Motorbikes', href: 'https://www.tigitmotorbikes.com/' },
    ],
    deposit: 'Cash deposit ($300–$500) + credit card pre-authorization.',
  },
  {
    type: 'Self-drive cars',
    rates: '$35 – $70 / day (850,000–1.7 million dong)',
    providers: [
      { name: 'Avis (airports)', href: 'https://www.avisvietnam.com.vn/' },
      { name: 'Hertz (airports)', href: 'https://www.hertz.com/rentacar/reservation/' },
      { name: 'Mioto app (local peer-to-peer car rental)', href: 'https://www.mioto.vn/' },
    ],
    deposit: 'Credit card hold ($500–$1,000) + original passport inspection.',
  },
  {
    type: 'Car with private driver (best choice)',
    rates: '$45 – $80 / day (1–2 million dong)',
    providers: [
      {
        name: 'SongSong Car (Central Vietnam)',
        href: 'https://www.google.com/maps/search/?api=1&query=SongSong+Car+Da+Nang+Hoi+An+private+driver',
      },
      {
        name: 'Klook',
        href: 'https://www.klook.com/en-US/search/?query=Vietnam%20private%20car%20with%20driver',
      },
    ],
    deposit: 'Upfront booking via app or hotel card billing. No document deposits required.',
  },
]

export const URBAN_PRE_RIDE = [
  {
    title: 'Braking',
    body: 'Test both front disc and rear drum brakes for tension.',
  },
  {
    title: 'Lighting & signals',
    body: 'Verify headlight (high/low beams), tail lights, and indicators work.',
  },
  {
    title: 'Tires',
    body: 'Check tread depth; worn tires slip instantly on wet Vietnamese asphalt or limestone roads.',
  },
  {
    title: 'Helmets',
    body: 'Standard shop helmets are thin plastic shells. Ask for a 3/4-face helmet or buy a proper DOT-approved helmet (~$20–$30) at a local shop if planning long-distance riding.',
  },
]

export const URBAN_WALKING = [
  {
    title: 'Where to walk',
    body: 'Hanoi Old Quarter, the Hoan Kiem loop, Hoi An Ancient Town, and short District 1 hops in Saigon (Ho Chi Minh City). Keep the next sight under 20 minutes on foot. Use a Grab for the river crossing, the museum across town, or the walk home after 22:00.',
  },
  {
    title: 'How to cross and where to stand',
    body: 'Pavements are a parking lot. Walk in the road-edge flow with the scooters, not against it. At an unmarked crossing, step out slowly and hold a straight line. Do not stop in the middle. Keep bags on the building side, not the kerb, in crowded streets.',
  },
  {
    title: 'Heat and rain',
    body: 'Carry water and a compact umbrella May–October. Schedule indoor stops 11:00–15:00. After a downpour, District 1 and Old Quarter corners flood in minutes — wait it out in a cafe rather than wading with a phone in your pocket.',
  },
]

export const URBAN_EMERGENCY = [
  {
    number: '113',
    label: 'Police',
    body: 'Theft, a crash, a fight, a licence check that will not end. Say you are a tourist, the street name, and the nearest hotel or landmark. Hotel reception can stay on the line and translate. Ask for a written record if you need it for insurance.',
  },
  {
    number: '115',
    label: 'Ambulance',
    body: 'Injury, collapse, a serious bike crash. Do not wait for a Grab if someone cannot walk. Major cities have international-standard private hospitals — your hotel or insurer can name the nearest one once you are moving.',
  },
  {
    number: '114',
    label: 'Fire',
    body: 'Fire, gas, a building you need to leave. Get out first, then call. These three numbers work from a Vietnamese SIM and, in practice, from many roaming phones — still save them before you need them.',
  },
]

export const URBAN_SAFETY = [
  {
    title: 'On a rented bike',
    body: 'Helmet that actually fits, closed shoes, no alcohol. Rain makes painted lines slick. Do not ride Hanoi or Saigon (Ho Chi Minh City) rush hour on day one. If you drop the bike, photograph everything, call the shop, and call 113 if anyone is hurt or another vehicle is involved. Do not “settle cash on the street” with a stranger who arrived after the fact.',
  },
  {
    title: 'In a car or on GrabBike',
    body: 'Match the plate to the app. Sit in the back of a car and belt in. Share the live trip with someone if it is late. Cancel and rebook if the driver asks you to sit a different bike or skip the app fare. Tipping is not required; rounding up a small amount is fine.',
  },
  {
    title: 'On foot at night',
    body: 'Tourist cores stay busy. Isolated river paths and empty side streets after midnight are a Grab, not a stroll. Keep the phone and wallet in a front zipped pocket. If someone is hurt or you are followed and cannot shake it, go into a hotel lobby and call 113.',
  },
  {
    title: 'If something goes wrong',
    body: 'Call 113 (police), 115 (ambulance), or 114 (fire). Tell them the city and a landmark. Then tell your hotel and, if you have one, your travel insurer. Keep photos of the scene, the other plate, and your passport bio page. Your embassy helps with lost passports — it does not replace 113 for a crime in progress.',
  },
]
