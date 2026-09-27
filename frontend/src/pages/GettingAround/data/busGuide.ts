export const BUS_IN_DEPTH_PATH = '/plan/builder/transport/bus'

export const BUS_PHOTOS = {
  exterior:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sleeper_bus_in_Vietnam_02.JPG/1920px-Sleeper_bus_in_Vietnam_02.JPG',
  sleeper:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Samco_Primas_sleeper_bus_in_Vietnam.JPG/1920px-Samco_Primas_sleeper_bus_in_Vietnam.JPG',
  interior:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Thaco_Mobihome_sleeper_bus_interior.jpg/1920px-Thaco_Mobihome_sleeper_bus_interior.jpg',
  bunks:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Sleeper_bus_in_Vietnam.JPG/1920px-Sleeper_bus_in_Vietnam.JPG',
}

export const BUS_WHEN_INTRO =
  'Take a bus when the railway does not go there, when a 2–5 hour hop is cheaper than a flight, or when an overnight sleeper replaces a hotel. Vietnam’s coach network is denser than the track: Sapa, Ha Giang, Ha Long, Da Lat, and Hoi An are bus (or van) country. Quality swings from a 9-seat limousine with hotel pickup to a vibrating open bunk. Book the operator and the bunk class, not just “a bus.”'

export const BUS_WHEN_SECTIONS = [
  {
    title: 'When buses beat trains and planes',
    body: 'Ha Giang, Dong Van, and Meo Vac have no rails. Sapa is a bus or van from Lao Cai if you skip the overnight train. Da Lat sits off the Reunification line. Ha Long and Cat Ba are faster by limousine plus ferry than by any train. Short tourist hops — Hanoi to Ninh Binh, Da Nang to Hue by day, Da Nang to Hoi An — are van jobs, not coaches to a suburban terminal.',
  },
  {
    title: 'Limousine vans versus sleeper buses',
    body: 'Limousine vans (about 9–16 reclining seats) are the daylight default: fierce air-con, USB, often hotel-area pickup. Sleeper buses are overnight tubes with stacked bunks. VIP cabins are semi-private pods; standard upper bunks are short, noisy, and a poor fit if you are taller than about 1.8 m. Seated coaches still exist on cheaper day runs.',
  },
  {
    title: 'When not to take the bus',
    body: 'Hanoi to Ho Chi Minh City is a 30-plus-hour slog; fly. Hue to Da Nang for Hai Van Pass is a train, not a highway tunnel. If you get motion-sick, an overnight sleeper on mountain roads is miserable. At Tet, buses sell out and prices jump — book days ahead or change dates.',
  },
]

export const BUS_TYPES = [
  {
    title: 'Limousine van (9–16 seats)',
    body: 'You sit like a human. Hotel or old-quarter pickup on tourist corridors. Best for 2–5 hour hops: Hanoi–Ninh Binh, Hanoi–Ha Long, Da Nang–Hue by day.',
  },
  {
    title: 'VIP sleeper cabin',
    body: 'A semi-private pod with a door or curtain. Still a bunk on a highway. Keep passport and phone on your body. Better than an open upper bunk; still not a train soft sleeper.',
  },
  {
    title: 'Standard sleeper bunk',
    body: 'Open upper and lower beds in a vibrating aisle. Cheapest overnight to Sapa, Ha Giang, Da Lat, Nha Trang. Bring earplugs. Bags go in the hold — photograph the tag.',
  },
]

export const BUS_BOOKING = [
  {
    name: '12Go',
    tag: 'Multi-mode',
    href: 'https://12go.asia/',
    body: 'Widest English inventory of vans, sleepers, and mix-and-match tickets. Markup is real; class names are not always honest — read “limousine” versus “sleeper.”',
  },
  {
    name: 'Baolau',
    tag: 'Live map',
    href: 'https://www.baolau.com/',
    body: 'Useful when you want bus next to train on the same map. Confirm pickup point: “Hanoi” may mean My Dinh, Giap Bat, or a hotel alley.',
  },
  {
    name: 'Futa / Phuong Trang',
    tag: 'Big operator',
    href: 'https://futabus.vn/',
    body: 'Major southern and central network. English site exists; terminals are labelled. Face fares if you can use it; otherwise 12Go still sells their seats.',
  },
]

export const BUS_TERMINALS = [
  {
    name: 'My Dinh bus station',
    city: 'Hanoi',
    address: 'My Dinh, Nam Tu Liem',
    maps: 'https://www.google.com/maps/search/?api=1&query=My+Dinh+bus+station+Hanoi',
    how: 'Northwest of the centre. Many sleepers to the mountains and the south. Budget 25–40 minutes in traffic from the Old Quarter, then a Grab at the other end.',
  },
  {
    name: 'Giap Bat bus station',
    city: 'Hanoi',
    address: 'Giap Bat, Hoang Mai',
    maps: 'https://www.google.com/maps/search/?api=1&query=Giap+Bat+bus+station+Hanoi',
    how: 'South of the centre. Common for Ninh Binh, Hue, and some overnight southbound coaches. Check which station your ticket actually uses.',
  },
  {
    name: 'Mien Dong bus station',
    city: 'Ho Chi Minh City',
    address: 'Mien Dong, Binh Thanh',
    maps: 'https://www.google.com/maps/search/?api=1&query=Mien+Dong+bus+station+Ho+Chi+Minh+City',
    how: 'The big northbound and central Vietnam hub (Nha Trang, Da Lat, Da Nang). New and old Mien Dong sites both appear on tickets — match the pin.',
  },
  {
    name: 'Mien Tay bus station',
    city: 'Ho Chi Minh City',
    address: 'Mien Tay, Binh Tan',
    maps: 'https://www.google.com/maps/search/?api=1&query=Mien+Tay+bus+station+Ho+Chi+Minh+City',
    how: 'Mekong and western routes. Sleeper photos from this yard are the classic orange long-haul coaches. Not the station for Nha Trang.',
  },
  {
    name: 'Da Nang bus station',
    city: 'Da Nang',
    address: 'Ton Duc Thang, Cam Le',
    maps: 'https://www.google.com/maps/search/?api=1&query=Da+Nang+central+bus+station',
    how: 'South of the river. Hue and Hoi An are often easier by van or Grab than by this terminal. Confirm pickup — tourist vans rarely start here.',
  },
]
