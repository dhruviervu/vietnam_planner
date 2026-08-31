export type BeforeYouTravelItem = {
  id: string
  emoji: string
  title: string
  body: string
  image: string
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

export const BEFORE_YOU_TRAVEL_SECTIONS: BeforeYouTravelItem[] = [
  {
    id: 'tickets-payments',
    emoji: '🎫',
    title: 'Tickets and payments',
    body: 'Book domestic flights, sleeper trains, and peak-season ferries ahead — official airline sites, DSVN, 12Go, and Baolau are the cleanest English interfaces. Urban Grab and taxis are pay-on-arrival; city buses and informal boats often prefer cash in small notes. Cards work on major apps and airlines, but keep enough dong for local hops, tolls, and porters. Compare the full fare including bags and seat fees, not just the headline price.',
    image: img('photo-1556742049-0cfed4f6a45d'),
  },
  {
    id: 'luggage-boarding',
    emoji: '🧳',
    title: 'Luggage and boarding',
    body: 'Trains and private cars handle suitcases well; scooters, fast boats, and packed shared vans are tighter — pack for the mode you actually use that day. Airlines need full airport check-in time; trains and coaches are simpler but terminals can sit outside the historic centre. Ferries may weigh bags or restrict deck space in rough weather. Arrive 30–45 minutes early for trains and boats; keep passports and booking codes on your phone and a screenshot offline.',
    image: img('photo-1553062407-98eeb64c6a62'),
  },
  {
    id: 'delays-disruptions',
    emoji: '⏳',
    title: 'Delays and disruptions',
    body: 'Road traffic, Tet congestion, tropical storms, and sea state routinely shift schedules — build buffer before flights, ferries, and timed experiences. Weather can cancel island boats for a day; have a Plan B hotel night or flight option. Grab and taxis surge in rain; trains can run late but usually depart. Save operator phone numbers in Vietnamese and check live status the morning of travel rather than assuming yesterday’s timetable still holds.',
    image: img('photo-1494412574642-9faa2a0662f9'),
  },
]
