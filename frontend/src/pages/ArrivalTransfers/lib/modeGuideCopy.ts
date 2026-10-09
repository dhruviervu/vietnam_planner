import type { Airport, ArrivalContext, Destination, TransportModeId } from '../data/types'
import { AIRPORT_GUIDES, timeOfDayLabel } from '../data/transferGuides'

type Args = {
  modeId: TransportModeId
  airport: Airport
  destination: Destination
  ctx: ArrivalContext
}

function bags(ctx: ArrivalContext) {
  if (ctx.luggageLevel === 'heavy') return 'heavy luggage'
  if (ctx.luggageLevel === 'light') return 'light bags'
  return 'normal luggage'
}

function party(ctx: ArrivalContext) {
  if (ctx.passengers >= 5) return `${ctx.passengers === 6 ? 'six or more' : ctx.passengers} of you`
  if (ctx.passengers === 1) return 'you travelling solo'
  if (ctx.passengers === 2) return 'the two of you'
  return `a party of ${ctx.passengers}`
}

function when(ctx: ArrivalContext) {
  const t = timeOfDayLabel(ctx.arrivalTime)
  if (!t) return ctx.direction === 'inbound' ? 'a typical arrival' : 'a typical departure'
  return ctx.direction === 'inbound' ? `a ${t} arrival` : `a ${t} run to the airport`
}

export function modeBrief({ modeId, airport, destination, ctx }: Args): {
  lead: string
  pros: string[]
  cons: string[]
  best: string
} {
  const g = AIRPORT_GUIDES[airport.id] ?? AIRPORT_GUIDES.HAN
  if (!g) {
    return { lead: '', pros: [], cons: [], best: '' }
  }
  const dest = destination.label
  const late = ctx.arrivalTime === 'late' || ctx.lateArrival
  const heavy = ctx.luggageLevel === 'heavy'
  const group = ctx.passengers >= 4
  const rush = ctx.arrivalTime === 'morning' || ctx.arrivalTime === 'evening'

  if (modeId === 'private-transfer') {
    return {
      lead:
        airport.id === 'HAN'
          ? `For ${party(ctx)} with ${bags(ctx)} on ${when(ctx)} into Nội Bài, a named car is the one that is actually waiting on the T2 side of a 30 km Nhật Tân run to ${dest}. The fare is per vehicle, so ${ctx.passengers >= 3 ? 'it often beats two Grab cars' : 'you are paying for certainty, not for a bargain'}.`
          : airport.id === 'SGN'
            ? `Tân Sơn Nhất is close to ${dest} on the map and far in the 17:00 jam. A pre-booked car to a named hotel skips the rank argument. ${rush ? 'Build 50–70 minutes into D1 at rush hour — the car does not create a new road.' : 'Off-peak this is a 20–35 minute drop.'}`
            : airport.id === 'DAD'
              ? destination.id.includes('hoi-an') || destination.id.includes('an-bang')
                ? `Hoi An is a 30 km coastal drive, not a city taxi. Seat 61 is explicit: no station in Hoi An. For ${party(ctx)} that means a private car or a named shared van — not a hope that bus 01 still exists.`
                : `Đà Nẵng airport is minutes from ${dest}. Private still earns its keep for ${party(ctx)} with ${bags(ctx)}${late ? ' after the last shared vans have gone' : ''}.`
              : `A pre-booked car to ${dest} is the unglamorous version of landing well: name board, fixed price, no app coverage gamble.`,
      pros: [
        group ? 'One fare for the whole group — vans exist for 5–6 + bags.' : 'Direct to the door, no second Grab from a bus terminus.',
        late ? 'Drivers watch the flight; Bus 86 / Dat Moi / 109 may already be done.' : 'Meet-and-greet inside the hall, not in the car-park scrum.',
        heavy ? 'Boot space is the point. Buses will hate these bags.' : 'You can be moving 10 minutes after immigration.',
      ],
      cons: [
        'Costs more than 86 / 109 / Dat Moi when those are still running.',
        'A vague drop (“city centre”) produces a debate. Put the hotel.',
      ],
      best: late || heavy || group || ctx.passengers >= 3
        ? 'This is the default for your party as set above.'
        : 'Worth it if you value a waiting driver over saving $10.',
    }
  }

  if (modeId === 'ride-hailing') {
    return {
      lead: `Grab, Xanh SM and Be are the apps to download before you land. For ${party(ctx)} to ${dest}, request the car in-app and walk to the marked pickup bay — not the lobby touts.`,
      pros: ['Fixed pricing, GPS tracking, no currency or language barrier.'],
      cons: ['Needs SIM/data; designated pickup may be a short walk from arrivals.'],
      best: 'Most tourists and solo travellers.',
    }
  }

  if (modeId === 'car-taxi') {
    return {
      lead:
        airport.id === 'HAN'
          ? `Grab, Be and Xanh SM are apps. They are not websites. For ${party(ctx)} to ${dest}, open Grab, set pickup to Nội Bài T2, walk to the painted bay. A lobby man with “taxi?” is not Grab. ${late ? 'Late night: cars exist, surge exists — still better than a broken meter.' : 'Check Be once; it is often a dollar cheaper.'}`
          : airport.id === 'SGN'
            ? `In Saigon the rank brands you can audit are Vinasun (white) and Mai Linh (green). Grab is usually cheaper than a “fixed 250k”. ${rush ? 'Hoàng Văn Thụ at 17:30 is why the app quote jumps — that is traffic, not a scam.' : 'Off-peak to D1 is a short, cheap ride.'}`
            : `Ride-hail is the local default at ${airport.code}. Install Grab before you land. The .com sites are brochures; the car comes from the app.`,
      pros: [
        'Leave when you want — no waiting for a van to fill.',
        ctx.passengers <= 3 ? 'Sedan fits 2–3 plus bags. Fourth adult is a squeeze; ask for a Plus/Innova in the app.' : 'Switch the app to a 7-seater before you confirm.',
        'Tracked, fare shown, drop is your pin — not a bus park.',
      ],
      cons: [
        'Needs data. Buy eSIM or use airport wifi to open the app in arrivals.',
        heavy && ctx.passengers >= 3 ? 'Two big suitcases + 4 people will not fit a GrabCar sedan.' : 'Surge around flight banks and rain.',
        'Kerb touts will try to intercept you before you reach the bay.',
      ],
      best: !late && ctx.passengers <= 3 && !heavy
        ? 'The practical choice for most visitors who have Grab installed.'
        : 'Use it if a private car was not pre-booked — still walk to the official bay.',
    }
  }

  if (modeId === 'shared-transfer') {
    return {
      lead:
        airport.id === 'DAD' && (destination.id.includes('hoi-an') || destination.id.includes('an-bang'))
          ? `Shared vans replaced the old bus 01 that Seat 61 now warns is not a plan. ${party(ctx)} pay per seat to Hoi An, then wait until the car is full. Fine at 14:00. Miserable at 22:30.`
          : `Shared seats to ${dest} undercut a private car and beat a city bus if you dislike stops. You pay in waiting: 15–40 min plus other hotels. ${heavy ? 'With heavy bags, the van’s last row will not love you.' : ''}`,
      pros: [
        'Per-person price sits between bus and private.',
        'Usually a named drop, not a random bus pole.',
      ],
      cons: [
        late ? 'Last shared services die before the last flight.' : 'Detours through three hotels before yours.',
        group ? 'Four paid seats ≈ a private car. Book the car.' : 'You move on the operator’s clock.',
      ],
      best: !late && ctx.passengers <= 2 && ctx.luggageLevel !== 'heavy'
        ? 'Good value on this profile.'
        : 'Skip it — your party size or bags make a private car cleaner.',
    }
  }

  if (modeId === 'public-bus') {
    if (g.buses.length === 0) {
      return {
        lead:
          airport.id === 'DAD'
            ? `There is no honest airport express here. Seat 61’s old bus 01 to Hoi An is not something to build an arrival on. For ${dest}, use Grab or a listed van.`
            : `${airport.name} does not run a visitor airport bus worth planning around. Use Grab, a rank taxi, or a hotel van to ${dest}.`,
        pros: ['You save nothing if the bus does not exist.'],
        cons: ['Standing at the kerb hoping is how touts win.'],
        best: 'Pick another mode on this airport.',
      }
    }
    const star = g.buses[0]
    return {
      lead:
        airport.id === 'HAN'
          ? `Express 86 is the real visitor bus: T1 and T2, Nhật Tân, then Long Biên → Trần Quang Khải → Opera → Melia → Ga Hà Nội. ${dest.includes('West') || dest.includes('Tây') ? 'West Lake is not on the useful end of 86 — drop at Âu Cơ and Grab, or do not take the bus.' : `For ${dest}, get off at Opera / Trần Quang Khải / Melia rather than riding to the station just because it is the terminus.`} Fare is cash đồng. Last airport departures are late evening, not 02:00. ${late ? 'Your arrival time is why this card is a bad idea tonight.' : ''}`
          : airport.id === 'SGN'
            ? `109 is the visitor line to 23/9 Park (Phạm Ngũ Lão). 152 is the cheap local that continues to Trung Sơn after Bến Thành. 49 is a hotel shuttle, not a street bus. 119 exists for Miền Tây coaches, not for a D1 hotel. ${dest.includes('Thu') || dest.includes('Thủ') ? 'Thủ Đức is the wrong direction — take a car.' : `For ${dest}, 109 is the one that matches.`}`
            : airport.id === 'CXR'
              ? `Dat Moi line 18 is the bus into Nha Trang centre (buy at the hall booth). Electric 16-2 is Vinpearl / Nguyễn Tất Thành, a different terminus. FUTA coaches serve Cam Ranh town from Nha Trang station — they are not the same as walking out of CXR arrivals.`
              : `${star.name} is the line to know. Others on the map go somewhere else — read the terminus, not the word “airport”.`,
      pros: [
        `${star.number} is ${star.fareUsd} — the cheapest honest ride.`,
        !heavy && ctx.passengers <= 2 ? 'With light bags this is how locals and good guidebooks actually travel.' : 'Works if you can haul the bags onto a bus island.',
        airport.id === 'HAN' ? '86’s last stop is Ga Hà Nội — the station Seat 61 uses for overnight trains.' : 'Fixed route: you can watch the stops instead of a meter.',
      ],
      cons: [
        late ? 'You are outside the last-bus window. Do not “try the bus” at 23:40.' : `Last buses: ${star.hours}.`,
        heavy || group ? 'Party size / bags turn a $2 fare into a 20-minute boarding fight.' : 'You still walk or Grab from the terminus to the hotel door.',
        rush ? 'The bus sits in the same jam as the Grab. You just pay less to sit there.' : 'Air-con is real; space is not generous.',
      ],
      best:
        late || heavy || group
          ? 'Not for this arrival profile — keep it as a daytime trick.'
          : `Yes, if ${dest} is on ${star.number}’s useful stops.`,
    }
  }

  return {
    lead:
      airport.id === 'DAD'
        ? `Đà Nẵng is the Vietnam airport where a rental car is not a joke — Hoi An, Mỹ Sơn, the Hải Vân Pass. Still: Hoi An Ancient Town is for walking. Hertz the car, park outside.`
        : airport.id === 'HAN' || airport.id === 'SGN'
          ? `Hertz and Avis sit in ${airport.code}. That is for leaving the city tomorrow, not for a first-night drop at ${dest}. Hanoi/Saigon traffic plus jet lag is how rental deposits disappear. A car-with-driver for Ninh Bình / Vũng Tàu is the grown-up version.`
          : `Self-drive desks are thin. A driver for the airport leg, then a local hire the next day, matches how this place actually works.`,
    pros: [
      'Same vehicle for airport + next-day road trip.',
      'Driver packages remove the scooter-ocean problem.',
    ],
    cons: [
      'Desk hours and deposits. Walk-up at 23:00 is fantasy.',
      'Parking will cost more than the Grab you were avoiding.',
    ],
    best: ctx.passengers >= 3
      ? 'Driver + Innova if you have a road day after the hotel drop.'
      : 'Skip for a single hotel transfer — take Grab or private.',
  }
}
