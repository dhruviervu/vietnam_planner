import type { Airport, Destination } from './types'
import type { CatalogProvider } from './providerCatalog'

export type GuideSection = { title: string; body: string }

export type ResolvedProviderGuide = {
  kicker: string
  lead: string
  sections: GuideSection[]
  doThis: string[]
  skipIf: string[]
}

type Ctx = {
  airport: Airport
  destination: Destination
  provider: CatalogProvider
  inbound: boolean
}

type Draft = {
  kicker: string
  lead: string
  sections: GuideSection[]
  doThis: string[]
  skipIf: string[]
}

function fill(text: string, ctx: Ctx) {
  const from = ctx.inbound
    ? `${ctx.airport.name} (${ctx.airport.code})`
    : `${ctx.destination.label}, ${ctx.destination.city}`
  const to = ctx.inbound
    ? `${ctx.destination.label}, ${ctx.destination.city}`
    : `${ctx.airport.name} (${ctx.airport.code})`
  return text
    .replaceAll('{airport}', `${ctx.airport.name} (${ctx.airport.code})`)
    .replaceAll('{code}', ctx.airport.code)
    .replaceAll('{city}', ctx.airport.city)
    .replaceAll('{dest}', `${ctx.destination.label}, ${ctx.destination.city}`)
    .replaceAll('{area}', ctx.destination.label)
    .replaceAll('{from}', from)
    .replaceAll('{to}', to)
    .replaceAll('{time}', ctx.provider.time)
    .replaceAll('{fare}', ctx.provider.fare)
}

function draft(d: Draft): Draft {
  return d
}

const GUIDES: Record<string, Draft> = {
  '12go-private': draft({
    kicker: 'Prepaid car, not an airline',
    lead: '12Go is a Bangkok-born booking site that resells local cars in Vietnam. You are not buying a 12Go vehicle — you are paying a local fleet through an English checkout, then meeting a driver with a name board at {airport}.',
    sections: [
      {
        title: 'What you actually buy',
        body: 'A private sedan or Innova with a driver, priced per car, not per seat. The voucher includes pickup inside the arrivals hall (international) and a direct drop at {to}. Waiting time is commonly about 60 minutes after landing; after that, overtime is billed by the local partner, not by a 12Go agent standing in the terminal.',
      },
      {
        title: 'How arrival works',
        body: 'Put the flight number on the booking. The driver tracks the landing and waits at the meeting point printed on the voucher — usually just after customs, not kerbside. Confirm the plate on the board matches the message you get on WhatsApp or in the 12Go app. If nobody is there after 15 minutes, use the emergency number on the voucher before wandering out to the taxi scrum.',
      },
      {
        title: 'The honest trade',
        body: 'You pay more than Grab to avoid SIM-card logistics at 1am. You pay less than a hotel limousine. Cancellation is typically free until about 24 hours before pickup — after that the local car is already assigned. Child seats are not automatic; request them in the booking notes and assume they may not appear at smaller airports.',
      },
    ],
    doThis: [
      'Add the flight number and a WhatsApp number that works on landing.',
      'Screenshot the voucher and plate before you lose airport wifi.',
    ],
    skipIf: [
      'You already have a Vietnamese eSIM and light bags — Grab at the official pickup bay is usually cheaper.',
      'You want a shared van price; that is a different 12Go product.',
    ],
  }),
  '12go-shared': draft({
    kicker: 'A seat in a van, with extra stops',
    lead: '12Go shared airport vans sell a seat, not a car. The van leaves when it is reasonably full, then drops other hotels before {area}. That is why the time window is wider than a private transfer.',
    sections: [
      {
        title: 'Expect a circuit',
        body: 'From {from} you share with other arrivals. Drop order follows the driver\'s loop, not your hotel\'s prestige. A 25-minute private run can become 50–80 minutes if {area} is last. Luggage goes in the back; oversized surfboards and three hard cases per person do not belong here.',
      },
      {
        title: 'Booking truth',
        body: 'The 12Go listing is an aggregator. The van on the ground may be labelled Super Air Bus, a hotel shuttle, or a local co-op. Read the pickup note: some meet at a numbered pillar, others at a desk. If the listing says “hotel drop-off”, confirm your exact address is on their list — “Hoi An” is not the same as a beach resort 8 km north.',
      },
    ],
    doThis: [
      'Travel in daylight with one suitcase each.',
      'Write the pickup pillar number on your lock screen.',
    ],
    skipIf: [
      'Late-night arrivals: shared vans thin out after the last tourist wave.',
      'Groups of four: a private sedan is often the same money and half the time.',
    ],
  }),
  klook: draft({
    kicker: 'Meet-and-greet voucher',
    lead: 'Klook sells prepaid airport cars the way it sells theme-park tickets: you pay in the app, show a QR, and a partner driver holds a tablet with your name. At {airport} this is a meet-and-greet, not a taxi rank.',
    sections: [
      {
        title: 'Flight tracking is the point',
        body: 'Enter the flight number. Klook’s partner watches the inbound board, so a 40-minute delay is usually absorbed in the included wait (often 60–90 minutes after landing). If you change flights, update the voucher in the app — do not assume the original driver knows.',
      },
      {
        title: 'What the price is for',
        body: 'You are paying to skip Vietnamese-language haggling and to have a receipt. The car is a local sedan; it is not a licensed European chauffeur brand. Night landings and extra stops toward {to} can trigger a surcharge that only shows in the listing small print.',
      },
      {
        title: 'At the door',
        body: 'International arrivals at {code}: through immigration, then look for the Klook / partner signage or the name board. Domestic halls are smaller and easier to miss. Do not follow a tout who says “Klook is outside” — prepaid drivers are not allowed to wait in the public taxi queue.',
      },
    ],
    doThis: [
      'Keep the Klook app voucher offline and add the local emergency number from the ticket.',
    ],
    skipIf: [
      'You are connecting in under 90 minutes and still need to re-check bags — a prepaid car will wait, but you will not make the van if you meant to take a bus.',
    ],
  }),
  welcome: draft({
    kicker: 'English-speaking meet and greet',
    lead: 'Welcome Pickups is a global meet-and-greet brand. In Vietnam the car is still a local partner, but the product is built around English instructions, child-seat requests, and a driver who waits inside with a sign — aimed at first landings, not backpacker prices.',
    sections: [
      {
        title: 'Why people pay the extra',
        body: 'The useful bits are operational: they want the flight number, they text when the driver is in hall, and they treat overtime as a defined add-on rather than an argument. If you are landing at {airport} with kids, a stroller, and a hotel in {area}, this is the “please just be there” option.',
      },
      {
        title: 'What it is not',
        body: 'It is not a hotel limousine with a uniformed doorman, and it is not cheaper than Grab. On short hops (Đà Nẵng city, Dương Đông) the premium looks large because the ride is only {time}. The value shows up when you are tired, late, or allergic to SIM-card puzzles.',
      },
    ],
    doThis: [
      'Request a child seat in the booking, not in the arrivals hall.',
      'Use their chat if the board name is misspelled — common with Vietnamese diacritics.',
    ],
    skipIf: ['Solo travellers with an eSIM and one backpack — overkill for {city}.'],
  }),
  holidaytaxis: draft({
    kicker: 'Package-holiday transfer desk, online',
    lead: 'HolidayTaxis started as a UK airport-transfer broker. In Vietnam it behaves like other prepaid cars: local driver, name board, fixed quote to {to}. It is popular with people who already use the site for Spain or Greece and want the same checkout.',
    sections: [
      {
        title: 'Read the meeting point',
        body: 'Some Vietnam listings meet landside after baggage, others at a desk. The voucher is the contract. Night-time and extra passenger fees are where quotes jump; {fare} is a starting band for a standard car, not a van for six with golf bags.',
      },
      {
        title: 'Support timezone',
        body: 'Email support may be on European hours. For a missed pickup at {airport}, you need the local emergency number on the ticket, not a web form. Screenshot it before you board.',
      },
    ],
    doThis: ['Match vehicle size to luggage: a European “saloon” listing can be a small sedan here.'],
    skipIf: ['You want in-app Vietnamese ride-hailing with live map sharing — that is Grab or Be.'],
  }),
  gettransfer: draft({
    kicker: 'A marketplace, not a fleet',
    lead: 'GetTransfer lets local drivers and companies bid on your {from} → {to} ride. The first price you see is not always the car you get; you choose an offer, then that partner performs the transfer.',
    sections: [
      {
        title: 'How to not get a surprise',
        body: 'Filter on reviews, car class, and included wait time before you accept. A cheap bid may be a freelancer in a 10-year-old Innova. A dearer bid may be a company with a dispatcher. For {airport}, prefer partners who mention the correct terminal and a name board.',
      },
      {
        title: 'Payment',
        body: 'You usually pay through the platform. That helps if someone no-shows; it does not help if you accepted a vague offer. Message the driver your flight number in the thread so there is a record.',
      },
    ],
    doThis: ['Accept an offer only after the meeting point is written in the chat.'],
    skipIf: ['You want one branded voucher with a single phone number — use 12Go, Klook, or Welcome Pickups.'],
  }),
  grab: draft({
    kicker: 'App car, official pickup bay',
    lead: 'Grab is the default ride-hail in urban Vietnam. At {airport} you do not get picked up at the kerb like a Hollywood movie. You walk to the official Grab / ride-hailing zone, pin {to}, and wait for the plate on screen.',
    sections: [
      {
        title: 'You need data on landing',
        body: 'Without roaming or an eSIM, Grab is a brick. Download the app before you fly, log in, and save a Vietnamese payment method or GrabPay if you can. Cash still works in many cities, but the airport bay is smoother prepaid. Peak pricing is real: a {fare} trip can jump after a bank of widebodies land.',
      },
      {
        title: 'Where to stand',
        body: '{code} publishes a Grab pickup map — usually a numbered island or car park level, not the taxi rank. Follow “Grab / app cars” signs. Drivers cannot legally loiter at the arrivals door. If the pin is wrong by 80 metres the driver will cancel; walk to the pin, do not make them come to you.',
      },
      {
        title: 'GrabCar vs motorbike',
        body: 'GrabBike is faster in {city} traffic and wrong with suitcases. GrabCar or GrabCar Plus is the airport product. Share your live trip with someone if you are landing late; the in-app plate is the whole safety system.',
      },
    ],
    doThis: [
      'Stand on the numbered bay in the app, not “somewhere outside”.',
      'Check the first 200 metres of the route toward {area} before you load bags.',
    ],
    skipIf: [
      'No eSIM and a midnight arrival — prepaid meet-and-greet is less fragile.',
      'Four people plus four large cases: you may need Grab 6-seater or a private van.',
    ],
  }),
  be: draft({
    kicker: 'Vietnamese app, often cheaper than Grab',
    lead: 'Be is a homegrown ride-hail (cars and bikes) with thick coverage in Hanoi, HCMC, and Đà Nẵng. At {airport} it uses the same app-car bays as Grab. Prices are often a notch lower; English in the app is good enough, not pretty.',
    sections: [
      {
        title: 'Same physics as Grab',
        body: 'You still need data. You still walk to the ride-hailing zone. You still match the plate. Be’s driver pool is local and large, which helps when Grab surge is ugly after a delayed SGN bank. It does not help if you cannot read a cancellation message in Vietnamese — keep an eye on the map, not the toast text.',
      },
      {
        title: 'Airport etiquette',
        body: 'Do not negotiate a cash price with someone in a Be jacket in the hall. That is a freelance tout. Open the app, set {to}, and wait where the pin says.',
      },
    ],
    doThis: ['Install Be before you fly; the Play/App Store dance on airport wifi is slow.'],
    skipIf: ['Phú Quốc and Cam Ranh have thinner Be coverage than Grab or the official rank.'],
  }),
  xanh: draft({
    kicker: 'VinFast electric taxi, GSM app',
    lead: 'Xanh SM (GSM) is the electric taxi network tied to VinFast. Cars are new, green-badged, and booked in the Xanh SM app or taken from some airport ranks. The pitch is a quieter, more formal taxi than a random sedan.',
    sections: [
      {
        title: 'Why it feels different',
        body: 'Meters and app quotes are closer to a taxi company than to Grab surge. At {airport} look for GSM / Xanh SM signage. English in the app has improved; the driver may still prefer the in-app chat to spoken English. Child seats are not a given.',
      },
      {
        title: 'Coverage',
        body: 'Strongest in Hanoi and HCMC, growing in Đà Nẵng and coastal cities. If the app shows a long ETA at {code}, switch to Grab or the official rank rather than waiting in the hall.',
      },
    ],
    doThis: ['Use the app quote so you are not arguing about a meter that started early.'],
    skipIf: ['You need a 7-seater with roof boxes — GSM’s core fleet is sedans and small SUVs.'],
  }),
  mailinh: draft({
    kicker: 'Metered company taxi',
    lead: 'Mai Linh is an old-school Vietnamese taxi company (green/white in many cities). At {airport} you want the official Mai Linh rank or a car with a working meter and roof light — not a stranger who says “Mai Linh, cheaper”.',
    sections: [
      {
        title: 'How to ride it properly',
        body: 'Go to the rank, take the next car, meter on before you leave the airport grounds. Fares to {to} should land near {fare} in light traffic. Keep small VND or card if the car takes it; not every driver wants a 500,000đ note. Ask for a receipt if you need it for a visa or company.',
      },
      {
        title: 'The tout problem',
        body: 'Inside arrivals, people will quote a flat USD price. That is not Mai Linh policy. If the meter is “broken”, get out before the highway. The company phone number is on the door; use it if the route toward {area} goes scenic without asking.',
      },
    ],
    doThis: ['Meter visible. Doors with the Mai Linh logo. Rank, not hall.'],
    skipIf: ['You do not want to handle VND cash on landing — prepaid or Grab is cleaner.'],
  }),
  'rank-HAN': draft({
    kicker: 'Official Nội Bài taxi rank',
    lead: 'Nội Bài posts taxi information in the arrivals hall. The rank sits outside, not among the touts with laminated USD menus. A metered or board-priced run to {to} is the boring, correct move if you have cash and no app.',
    sections: [
      {
        title: 'Using the board',
        body: 'Look for the taxi information counter / posted fares, then walk to the official queue. Typical times to central Hanoi are {time} via Nhật Tân Bridge. Evening peak and rain add 20–40 minutes. Count your bags against the boot; a Corolla does not eat four 30 kg cases.',
      },
    ],
    doThis: ['Change a little VND airside or at a bank ATM, not with a hall money-changer waving a rate.'],
    skipIf: ['You refuse cash and have no card taxi — book a prepaid car instead.'],
  }),
  'rank-SGN': draft({
    kicker: 'Vinasun / official Tân Sơn Nhất rank',
    lead: 'HCMC’s reputable airport taxis are Vinasun (white/red stripes) and Mai Linh at the official rank. District 1 is close as the crow flies and slow as the motorbikes. {time} is honest; 17:00–19:00 is not.',
    sections: [
      {
        title: 'Rank, not hall',
        body: 'Follow taxi signs to the queue. Meter on. To {to}, {fare} is a sensible band without surge. Ignore anyone who intercepts you at the belt with “fixed price, very close”. Tân Sơn Nhất’s domestic and international exits dump you into different walkways — read the signs once rather than crossing roads with luggage.',
      },
    ],
    doThis: ['Have the hotel address in Vietnamese on your phone for the driver.'],
    skipIf: ['You are going past the airport to a far district and it is rush hour — a prepaid car with a flight number is less stress.'],
  }),
  'rank-DAD': draft({
    kicker: 'Đà Nẵng airport rank',
    lead: 'Đà Nẵng’s airport is close to the city. The official taxi rank is the simple option to {to} when the ride is only {time}. Hoi An is a different story — that is a 45–70 minute highway run, and a random rank taxi will quote like a transfer.',
    sections: [
      {
        title: 'City vs Hoi An',
        body: 'For the beach / city, take the rank or Grab. For Hoi An Ancient Town, a prepaid car or Super Air Bus is usually cleaner than negotiating a taxi in the hall. If you do take a taxi to Hoi An, agree the fare before the boot closes and know that returning the same day is a second negotiation.',
      },
    ],
    doThis: ['If {area} is Hoi An, skip the rank and use a listed transfer or the airport coach.'],
    skipIf: ['You want a $3 shared seat — that is Super Air Bus / FUTA, not the taxi lane.'],
  }),
  'rank-PQC': draft({
    kicker: 'Phú Quốc airport rank',
    lead: 'Phú Quốc International is a short hop to Dương Đông and a longer one to the north-island resorts. The official rank posts fares; touts in the hall will beat those numbers in the wrong direction.',
    sections: [
      {
        title: 'Island distances',
        body: 'Dương Đông / night market is the {time} job. Long Beach and the south is similar. Grand World and the far north add money and minutes. There is no urban bus network that replaces this. Cash VND still rules many rank cars.',
      },
    ],
    doThis: ['Match the posted board to {to} before you load the boot.'],
    skipIf: ['Your resort promised a shuttle — wait at their signed meeting point instead of the rank.'],
  }),
  'rank-CXR': draft({
    kicker: 'Cam Ranh taxi rank',
    lead: 'Cam Ranh sits a genuine highway hour from Nha Trang. Rank taxis and Mai Linh are fine if you pay a posted or metered price. They are a poor surprise if you thought the airport was “in town”.',
    sections: [
      {
        title: 'The cheaper alternative',
        body: 'Dat Moi bus 18 (booth in arrivals) exists because this ride is long. A rank taxi to {to} at {fare} is the door-to-door version of that. Night arrivals after the bus booth closes are when the rank earns its keep.',
      },
    ],
    doThis: ['If it is daytime and you have light bags, look at Dat Moi 18 before the taxi queue.'],
    skipIf: ['Vinpearl / island hops: check whether you need the 16-2 bus or a resort boat, not a city taxi.'],
  }),
  'han-86': draft({
    kicker: 'The proper airport bus',
    lead: 'Hanoibus Express 86 is the dedicated coach between Nội Bài and central Hanoi, not a random city bus that happens to pass the airport. Seat 61 flags it because the last stop is useful if you are continuing by train.',
    sections: [
      {
        title: 'The route that matters',
        body: '86 runs Nội Bài – Nhật Tân Bridge – the Hoàn Kiếm / Tràng Tiền corridor – and on to Hà Nội Railway Station (Ga Hà Nội). If your hotel is in the Old Quarter or Hoàn Kiếm, you get off before the terminus. If you stay on to the station, you are in the wrong place for Tây Hồ. Typical ride {time}; fare {fare}, paid on board in VND (notes, sometimes card on newer coaches).',
      },
      {
        title: 'Hours and luggage',
        body: 'Service is roughly dawn to late evening (commonly about 05:00–22:00/23:00 — check the board at the stop the day you land). Coaches take suitcases; they are not a porters’ service. The stop at the airport is signed “Bus 86”; do not board a city 07/17 by accident. Last-bus risk is real: after that you want Grab or a prepaid car, not a hope that “one more 86” exists.',
      },
    ],
    doThis: [
      'Stand at the 86 stop, not the city-bus island.',
      'Know which stop is closest to {area} so you do not ride to the railway station for fun.',
    ],
    skipIf: [
      'Landing after the last 86.',
      'Heavy luggage and a hotel in Tây Hồ / West Lake — 86 is the wrong axis.',
    ],
  }),
  'han-17': draft({
    kicker: 'City bus, not an airport product',
    lead: 'Route 17 is a municipal bus that happens to serve Nội Bài and runs toward Long Biên. It is {fare} because it is a city bus: many stops, local passengers, and no tourist padding.',
    sections: [
      {
        title: 'Who it is for',
        body: 'Travellers who already know Hanoi buses, have small bags, and are not in a hurry. Time to {area} can stretch to {time} because it is not an express. Luggage in the aisle will make you unpopular. There is no name board and no English commentary.',
      },
    ],
    doThis: ['Have exact-ish VND. Know the stop name for {area} before you board.'],
    skipIf: ['First night, big cases, or a hotel that is not on the 17 corridor.'],
  }),
  'han-07': draft({
    kicker: 'Another city bus that touches the airport',
    lead: 'Bus 07 is a Transerco city route, not Express 86. Expect more stops, a lower fare ({fare}), and a slower crawl toward town than the airport coach.',
    sections: [
      {
        title: 'Do not confuse it with 86',
        body: '07 is for people who would ride a city bus at home. If you want the tourist-tolerant airport coach with a luggage bay, walk to 86. If 07 is what pulled up, you can ride it — just do not expect {area} in 40 minutes.',
      },
    ],
    doThis: ['Check the headsign. 07 and 86 are different products.'],
    skipIf: ['Jet lag and hard-shell luggage.'],
  }),
  'han-minibus': draft({
    kicker: 'Airport minibus / Shuttle2',
    lead: 'Nội Bài minibuses (often sold as Shuttle2 or similar) sit between Express 86 and a private car: fewer stops than a city bus, more than a sedan, sold online or at a desk.',
    sections: [
      {
        title: 'What to verify',
        body: 'Confirm the drop is your address in {area}, not “Old Quarter area”. These vans wait for a handful of passengers. {time} is a window. 12Go listings are resellers — the van branding on the ground may differ.',
      },
    ],
    doThis: ['Screenshot the pickup pillar and the operator phone.'],
    skipIf: ['You are two people with a hotel 400 m from an 86 stop — the coach is cheaper and frequent.'],
  }),
  'han-vnair': draft({
    kicker: 'Airline desk coach',
    lead: 'Vietnam Airlines (and sometimes other desks) sell an airport bus/coach ticket in the arrivals hall. It is a staffed, daytime-ish product aimed at people who want a human to point at a bus, not an app.',
    sections: [
      {
        title: 'Use it as a desk product',
        body: 'Buy at the marked booth, not from someone with a laminated card. Drops are usually central hotels / a downtown point, not every Airbnb in {area}. If your flight is the last of the night, the booth may already be dark — have a backup.',
      },
    ],
    doThis: ['Ask where it stops relative to {area} before you pay.'],
    skipIf: ['You already have Grab working — this is slower to arrange.'],
  }),
  'sgn-152': draft({
    kicker: 'The famous cheap airport bus',
    lead: 'Bus 152 is Tân Sơn Nhất’s no-nonsense city bus toward Bến Thành / Trung Sơn. Fare is {fare}. It is crowded, local, and not designed around 29-inch suitcases even though everyone tries.',
    sections: [
      {
        title: 'How to ride it without hating it',
        body: 'The stop is signed at the airport. Pay the conductor. Time to District 1 is {time} off-peak and worse in rain. If you are going to {area} near Bến Thành, it can be brilliant. If you are going to Thảo Điền or D7, you will still need another ride. Keep the bag between your knees; this is not a coach bay.',
      },
    ],
    doThis: ['Travel light, in daylight, with VND coins/small notes.'],
    skipIf: ['Night arrival, three bags, or a hotel far from the 152 spine.'],
  }),
  'sgn-109': draft({
    kicker: 'Airport bus to 23/9 Park',
    lead: 'Bus 109 links Tân Sơn Nhất with Công viên 23/9 — the park by the backpacker corridor and a useful dump-off if {area} is Phạm Ngũ Lão / District 1 south of the tracks.',
    sections: [
      {
        title: 'A bit more tourist-tolerant than 152',
        body: 'Still a city bus. Fare {fare}. It is the right bus if your map pin is near 23/9, not if you need Thảo Điền. Hours are daytime-into-evening; do not bet your 23:40 landing on it.',
      },
    ],
    doThis: ['Get off at 23/9 and walk or Grab the last kilometre rather than riding past your hotel.'],
    skipIf: ['Lots of luggage — 109 is not a transfer van.'],
  }),
  'sgn-119': draft({
    kicker: 'Airport to Miền Tây coach station',
    lead: 'Bus 119 is for people leaving Ho Chi Minh by long-distance coach from Miền Tây, not for a hotel in {area} unless that hotel is actually near the station.',
    sections: [
      {
        title: 'Do not take it “into town”',
        body: 'Miền Tây is the Mekong / western bus station. If your plan is a sleeper to Cần Thơ or Châu Đốc, 119 can skip District 1 entirely. If your plan is a hotel in {area}, this is the wrong bus.',
      },
    ],
    doThis: ['Only if tonight’s ticket is from Miền Tây.'],
    skipIf: ['You said “city centre” and meant Bến Thành.'],
  }),
  'sgn-159': draft({
    kicker: 'Airport to Miền Đông',
    lead: 'Bus 159 runs toward Miền Đông — the eastern long-distance station for buses toward Đà Lạt, Nha Trang, and the coast. Same logic as 119: it is a station bus, not a boutique-hotel bus.',
    sections: [
      {
        title: 'When it is the clever move',
        body: 'Land at SGN, ignore District 1, go straight to the coach. When it is stupid: your booking is a rooftop bar in Bến Thành and you just wanted “a bus”.',
      },
    ],
    doThis: ['Match the station to your next ticket before you board.'],
    skipIf: ['{area} is a central hotel.'],
  }),
  'sgn-49': draft({
    kicker: 'Airport shuttle 49',
    lead: 'Shuttle 49 is a higher-fare airport shuttle (about {fare}) aimed at hotels and the Notre-Dame / central axis. Think of it as 152 with manners and a luggage attitude.',
    sections: [
      {
        title: 'Still not a private car',
        body: 'It will drop a corridor, not necessarily the door of a tucked-away Airbnb in {area}. Confirm the stop list. Time {time}. Buy at the signed airport point, not from a freelance “shuttle” in the parking lot.',
      },
    ],
    doThis: ['Ask whether {area} is on the published stop list.'],
    skipIf: ['Three of you — a GrabCar split three ways may match the shuttle and skip the loop.'],
  }),
  'dad-superair': draft({
    kicker: 'Đà Nẵng airport coach to Hoi An',
    lead: 'Super Air Bus is the tourist coach built for Đà Nẵng airport ↔ Hoi An. Luggage goes underneath. It is the Seat-61-adjacent, backpacker-and-family answer when {area} is Hoi An, not Mỹ Khê.',
    sections: [
      {
        title: 'Pickup and drop',
        body: 'Meet at the signed Super Air Bus / airport coach point. Drops are usually central Hoi An (old town / bus stop), not every beach resort. {time} includes the highway. 12Go sells seats; the bus on the ground is still Super Air Bus. If {area} is An Bàng or a north-coast resort, budget a Grab for the last bit.',
      },
    ],
    doThis: ['Buy a seat if you land in the tourist wave; walk-up can mean a wait.'],
    skipIf: ['Your hotel is in Đà Nẵng city — this bus is going the other way.'],
  }),
  'dad-super': draft({
    kicker: 'Đà Nẵng airport coach to Hoi An',
    lead: 'Super Air Bus is the tourist coach built for Đà Nẵng airport ↔ Hoi An. Luggage goes underneath. It is the practical coach when you are staying in Hoi An, not on the Đà Nẵng seafront.',
    sections: [
      {
        title: 'Pickup and drop',
        body: 'Meet at the signed airport coach point. Central Hoi An is the usual drop, not every beach resort. {time} is the highway plus unloading. If you are in An Bàng, finish by Grab.',
      },
    ],
    doThis: ['Do not board a city bus and hope it becomes this coach.'],
    skipIf: ['You are staying on Mỹ Khê — take Grab or a city taxi instead.'],
  }),
  'dad-share-12': draft({
    kicker: 'Shared van, Hoi An drop',
    lead: 'A 12Go-sold shared van from Đà Nẵng airport toward Hoi An. Same economics as other shared vans: cheaper per person, slower because of multiple hotels.',
    sections: [
      {
        title: 'Address list',
        body: 'If {area} is Ancient Town, you are on the standard loop. If it is a rice-field resort 6 km out, confirm the drop or you will be left at a convenient corner. {time} is a window.',
      },
    ],
    doThis: ['Put the full hotel name in the booking, not just “Hoi An”.'],
    skipIf: ['Four paying adults — private sedan is often similar money.'],
  }),
  'dad-futa': draft({
    kicker: 'Phương Trang (FUTA) coach',
    lead: 'FUTA / Phương Trang is Vietnam’s big open-tour coach company. Đà Nẵng ↔ Hoi An is a bread-and-butter hop at {fare}, not an airport-terminal product. You may need to get from {airport} to a FUTA office or a signed stop first.',
    sections: [
      {
        title: 'Airport vs office',
        body: 'Do not assume the coach waits in the arrivals hall. Many FUTA seats are from the Đà Nẵng station / downtown stop. Factor a Grab from the airport unless the listing explicitly says airport pickup. App and website sell seats; bring the QR.',
      },
    ],
    doThis: ['Read whether the origin is “Đà Nẵng airport” or “Đà Nẵng office”.'],
    skipIf: ['You want a name board at baggage claim — that is Super Air Bus or a private car.'],
  }),
  'dad-futa-share': draft({
    kicker: 'FUTA open-tour seat',
    lead: 'A cheap FUTA / open-tour seat toward Hoi An. It is a coach network ticket, not a meet-and-greet. Useful if you are already in the backpacker flow and {area} is on their Hoi An drop.',
    sections: [
      {
        title: 'Last mile',
        body: '{time} plus however long you wait for the coach to fill. Luggage is coach-style. Night arrivals after FUTA’s useful hours should not rely on this.',
      },
    ],
    doThis: ['Check the last useful departure against your landing time.'],
    skipIf: ['Families with car seats and jet lag.'],
  }),
  'dad-hue': draft({
    kicker: 'Longer FUTA / open bus toward Huế',
    lead: 'This is not an airport shuttle. It is an intercity coach: Đà Nẵng toward Huế in {time}. Only make sense if {area} is Huế or you are continuing north the same day.',
    sections: [
      {
        title: 'Do not mix it up with Hoi An',
        body: 'Hoi An is south-east of the airport; Huế is a different highway. Boarding the Huế coach “because it is FUTA” is how people visit the wrong UNESCO site.',
      },
    ],
    doThis: ['Match the destination city on the ticket to {area}.'],
    skipIf: ['You meant Hoi An or Đà Nẵng beach.'],
  }),
  'dad-city': draft({
    kicker: 'City bus 06, not a Hoi An coach',
    lead: 'Route 06 is the municipal line from Đà Nẵng airport toward Non Nước / Ngũ Hành Sơn. Fare {fare}. It is not Super Air Bus, and it does not become Hoi An if you sit long enough.',
    sections: [
      {
        title: 'What 06 actually does',
        body: 'From the airport bus station it works Nguyễn Văn Linh and the southern beach toward Marble Mountains / Non Nước. Time to a city pin is {time} only if {area} is on that corridor. English is limited. Luggage is a cabin bag, not a family of hard cases.',
      },
      {
        title: 'The other city line',
        body: 'Route 10 goes the other way — Hàn Bridge toward Thọ Quang / Sơn Trà — and sleeps earlier. Neither 06 nor 10 replaces a Hoi An seat. For that, Super Air Bus or a car.',
      },
    ],
    doThis: ['Use it only when the map shows a direct city route to {area}.'],
    skipIf: ['Hoi An, Marble Mountains with luggage, or night arrivals.'],
  }),
  'dad-sinh': draft({
    kicker: 'Sinh Tourist open bus',
    lead: 'Sinh Tourist is the classic backpacker open-bus brand. Airport connections are inconsistent; many seats are office-to-office (Đà Nẵng desk ↔ Hoi An desk).',
    sections: [
      {
        title: 'Buy as a network, not a transfer',
        body: 'If the 12Go listing includes airport pickup, believe the voucher. If it says Sinh open bus, you may be grabbing a taxi to their office first. That can still be cheap overall, but it is two steps.',
      },
    ],
    doThis: ['Read pickup, not just the brand name you remember from 2009.'],
    skipIf: ['You want one vehicle from the terminal door.'],
  }),
  'dad-hotel': draft({
    kicker: 'Your hotel’s van',
    lead: 'Hoi An hotels love a shuttle because the airport is in another city. This is not a public bus. It is a pre-arranged van whose quality is exactly as good as the hotel that sold it.',
    sections: [
      {
        title: 'Make the hotel own the meeting point',
        body: 'Get the sign text, the phone number, and whether they wait at domestic or international. {fare} per person is normal. If three of you are staying at the same place, ask for a private quote — it can beat four shuttle seats. Confirm they actually go to {area}, not a partner hotel downtown.',
      },
    ],
    doThis: ['WhatsApp the driver name the morning you fly.'],
    skipIf: ['The hotel shuttle is “maybe, if the van has space” — book Super Air Bus instead.'],
  }),
  'dad-cityshare': draft({
    kicker: 'Shared ride into Đà Nẵng beach',
    lead: 'A shared drop along the Đà Nẵng coastal strip. Short ride ({time}), low fare. Sensible when {area} is Mỹ Khê / city, not Hoi An.',
    sections: [
      {
        title: 'Keep it coastal',
        body: 'If someone sells you this toward Hoi An, they mislabelled it. For the city beach it is a cheap way not to take a whole taxi alone.',
      },
    ],
    doThis: ['Confirm the drop is {area}, not “Đà Nẵng” as a city-sized shrug.'],
    skipIf: ['Hoi An or Huế.'],
  }),
  'pqc-dd': draft({
    kicker: 'Resort / hotel shuttle to Dương Đông',
    lead: 'Phú Quốc hotels around Dương Đông often run a van from the airport. It is included or cheap ({fare}) because the island’s public bus story is thin.',
    sections: [
      {
        title: 'Treat it as a hotel product',
        body: 'Meeting point is a signed desk or a person with a property name. If you booked a holiday-park resort, they may pool guests. {time} to Dương Đông is short; do not let a “shared island shuttle” detour you north if that is not {area}.',
      },
    ],
    doThis: ['Have the hotel’s airport WhatsApp open before you exit.'],
    skipIf: ['You are staying in the far north — this shuttle may not be yours.'],
  }),
  'pqc-lb': draft({
    kicker: 'Long Beach resort shuttle',
    lead: 'Long Beach properties run their own vans. The airport is close; the product exists so you do not freelance a rank taxi at midnight.',
    sections: [
      {
        title: 'Voucher or it does not exist',
        body: 'If the resort did not confirm a seat, there is no shuttle — just a rank. {fare} when it is not bundled into the room.',
      },
    ],
    doThis: ['Ask for the plate or sign colour the day before.'],
    skipIf: ['Walk-up with no reservation at that resort.'],
  }),
  'pqc-gw': draft({
    kicker: 'Grand World / sunset strip share',
    lead: 'Shared vans toward the sunset strip and Grand World. Fine when {area} is actually that entertainment belt.',
    sections: [
      {
        title: 'Not Dương Đông night market',
        body: 'Different cluster of the island. {time} is plausible. 12Go may resell a local van; confirm the drop name matches your hotel, not “Phú Quốc”.',
      },
    ],
    doThis: ['Match the strip name to your booking.'],
    skipIf: ['Dương Đông or the far north.'],
  }),
  'pqc-jw': draft({
    kicker: 'North-island resort van',
    lead: 'The north of Phú Quốc is a longer, dearer shuttle ({fare}, {time}) because it is a different corner of the island, not a neighbourhood of Dương Đông.',
    sections: [
      {
        title: 'Do not freelance this in a city taxi without a quote',
        body: 'Rank drivers will do it, at island prices. The resort van is the predictable version. Night boats and park fees are separate — this is only the airport leg.',
      },
    ],
    doThis: ['Pre-book with the resort; walk-up vans are for the south and centre.'],
    skipIf: ['Your hotel is in Dương Đông.'],
  }),
  'pqc-island': draft({
    kicker: 'Thin island minibus',
    lead: 'Phú Quốc does not have a Hanoi-style airport bus. “Island minibus” means a local, limited, pay-on-board thing — useful only if it actually stops near {area}.',
    sections: [
      {
        title: 'Assume it might not exist when you land',
        body: 'Frequencies are not urban. If you cannot see a signed minibus that lists {area}, use the rank or a hotel van. {fare} is the reason people look; unreliability is why most tourists do not.',
      },
    ],
    doThis: ['Have a rank-taxi backup in VND.'],
    skipIf: ['Night flights and tight check-in the next morning.'],
  }),
  'cxr-18': draft({
    kicker: 'Dat Moi 18, the Cam Ranh airport bus',
    lead: 'Bus 18 (Dat Moi) is the proper coach between Cam Ranh airport and Nha Trang centre. Booth in the arrivals hall, fare {fare}, ride {time}. This is the route that exists because the airport is not in town.',
    sections: [
      {
        title: 'How to catch it',
        body: 'Buy at the Dat Moi booth inside the hall, not from a parking-lot freelancer. Coaches take luggage. Drops are central Nha Trang; if {area} is a quiet north-beach resort you will still need a short taxi. Last buses matter — late international arrivals often miss them and default to a taxi.',
      },
    ],
    doThis: ['Go to the booth before you exit to the taxi slog.'],
    skipIf: ['You land after the booth shuts, or {area} is Vinpearl island.'],
  }),
  'cxr-162': draft({
    kicker: 'Electric 16-2 toward Vinpearl',
    lead: 'Route 16-2 is the electric bus associated with the Vinpearl / coastal axis, not the generic Nha Trang centre coach. Fare {fare}.',
    sections: [
      {
        title: 'Right bus, right island',
        body: 'If {area} is Vinpearl or that stretch, this is the clever cheap option. If {area} is the main Nha Trang beach promenade, Dat Moi 18 is usually the better match. Confirm the headsign; do not board because it is electric and pretty.',
      },
    ],
    doThis: ['Match 16-2 to Vinpearl / that corridor only.'],
    skipIf: ['Centre-of-Nha-Trang hotels — take 18.'],
  }),
  'cxr-futa': draft({
    kicker: 'FUTA between Nha Trang and Cam Ranh town',
    lead: 'A FUTA coach on the Nha Trang ↔ Cam Ranh town corridor. It is not automatically the airport arrivals product. {fare} is coach money; {time} is coach time.',
    sections: [
      {
        title: 'Airport vs town',
        body: 'Cam Ranh town and Cam Ranh airport are related but not the same stop. If the ticket says airport, good. If it says Cam Ranh, you may still have a local hop. Read the origin.',
      },
    ],
    doThis: ['Verify “sân bay / airport” on the ticket.'],
    skipIf: ['You want the Dat Moi booth in the hall — that is bus 18.'],
  }),
  'cxr-shuttle': draft({
    kicker: 'Arrivals shuttle booth',
    lead: 'A paid airport shuttle sold from a booth in Cam Ranh arrivals. Closer to a minibus than Dat Moi 18. {fare}, {time} to central drops.',
    sections: [
      {
        title: 'Booth or it is a tout',
        body: 'Pay at the marked counter. Ask whether {area} is a stop. If they shrug and say “Nha Trang”, you may still walk from a central drop.',
      },
    ],
    doThis: ['Compare the booth price to Dat Moi 18 before you pay more for a similar loop.'],
    skipIf: ['18 is still running and your bags are normal size.'],
  }),
  'cxr-open': draft({
    kicker: 'Tourist open bus',
    lead: 'Open-tour style buses on the Nha Trang corridor. Convenient if you are already in the Sinh / open-bus world; fuzzy if you expected an airport express with a hall booth.',
    sections: [
      {
        title: 'Pickup discipline',
        body: '12Go may list it. The actual van might wait outside. Confirm {area} is on the drop loop. {time} includes other hotels.',
      },
    ],
    doThis: ['Use it in daylight between tourist hotels, not as a last-flight safety net.'],
    skipIf: ['You want Dat Moi 18’s booth-and-coach clarity.'],
  }),
  hotelshuttle: draft({
    kicker: 'Hotel or hostel van',
    lead: 'This is a pre-booked or walk-up shuttle sold around the airport, not a municipal bus. Quality tracks the property: a good hotel van is excellent; a “hostel shuttle” can be a 12-seat wait.',
    sections: [
      {
        title: 'Get the meeting text in writing',
        body: 'Sign wording, terminal, and a phone. Drop is {to} only if they said so. {fare} per person looks cheap until four of you could have taken a sedan.',
      },
    ],
    doThis: ['Confirm the last van versus your landing time.'],
    skipIf: ['The operator cannot name {area} without squinting at a map.'],
  }),
  backpacker: draft({
    kicker: 'Old-town / backpacker shuttle',
    lead: 'Vans aimed at hostels and cheap old-town hotels. They maximise seats, not minutes. Fine to {area} if that is actually the backpacker cluster.',
    sections: [
      {
        title: 'The loop is the product',
        body: 'You will visit other hostels. {time} is a window. Luggage goes in a pile. Night-time reliability follows the hostel, not a transport authority.',
      },
    ],
    doThis: ['Sit near the door if {area} is an early drop.'],
    skipIf: ['Business hotels, kids, or a tight dinner reservation.'],
  }),
  resortshare: draft({
    kicker: 'Resort corridor share',
    lead: 'A shared van along a resort strip. Useful when several properties sit on one road toward {area}. Useless when your place is a one-off in the opposite direction.',
    sections: [
      {
        title: 'Corridor, not address',
        body: 'Ask whether they pass your gate or a junction 800 m away. {fare} is per person. Compare with splitting a private car.',
      },
    ],
    doThis: ['Send the pin, not just the resort brand.'],
    skipIf: ['You are not on that strip.'],
  }),
  genericbus: draft({
    kicker: 'A named airport or city bus',
    lead: 'This is a real local service at {airport}, not a tourist brand. Fare {fare}, typical time {time}. Treat the headsign and the stop as the product.',
    sections: [
      {
        title: 'How to use it',
        body: 'Pay on board or at the signed booth. It will not come to a name board in arrivals unless the listing says so. If {area} is off the published corridor, plan a short Grab at the other end. Last-bus timing is the whole risk.',
      },
    ],
    doThis: ['Confirm the stop list includes a point you would actually walk from to {area}.'],
    skipIf: ['Heavy luggage after the last useful departure.'],
  }),
  vncrew: draft({
    kicker: 'Airline crew / airport bus',
    lead: 'Some airports sell a Vietnam Airlines or generic airline bus from a booth. It is a staffed coach to a downtown point, not a door-to-door car to {area}.',
    sections: [
      {
        title: 'Booth hours',
        body: 'When the booth is open, it is pleasant. When it is closed, it does not exist. Always have Grab or a rank as plan B. {fare} is the reason to look.',
      },
    ],
    doThis: ['Ask the exact drop street relative to {area}.'],
    skipIf: ['Last flight of the night.'],
  }),
  budget: draft({
    kicker: 'Self-drive rental desk',
    lead: 'Budget has desks at Vietnam’s larger airports. You are renting a car in a country where motorbikes own the geometry. {fare} is a compact starting band, plus insurance, plus a credit-card hold.',
    sections: [
      {
        title: 'Paper that matters',
        body: 'Bring a full driving licence and, in practice, an International Driving Permit. Age minimums apply. Photograph the car in the airport lot before you leave {airport}. City driving in Hanoi or HCMC is a skill issue, not a confidence issue — many visitors book a car with driver instead after one roundabout.',
      },
      {
        title: 'Where self-drive is saner',
        body: 'Phú Quốc, parts of Đà Nẵng / Hoi An, and coastal hops are the usual “maybe”. Nội Bài into the Old Quarter at rush hour is the usual “please don’t”. Returning the car with a low tank or a scooter scar gets expensive in the parking lot, not in email.',
      },
    ],
    doThis: [
      'Pre-book the desk location as {code}, not “Hanoi city”.',
      'Buy the insurance you will actually use, not the cheapest tick-box.',
    ],
    skipIf: [
      'You have never driven in dense mixed traffic.',
      'Your plan is one ride to {to} — that is a transfer, not a rental.',
    ],
  }),
  avis: draft({
    kicker: 'Avis airport desk',
    lead: 'Avis is a full-price international desk at {airport}. Same physics as Hertz/Budget: IDP, credit card, motorbikes, and a deposit that looks aggressive until you see a side mirror in Hoàn Kiếm.',
    sections: [
      {
        title: 'Desk, not kerbside',
        body: 'Follow rental-car signs. The car is in a lot, not at arrivals. Factor 30–45 minutes after immigration for paperwork. One-way to another city is a desk conversation, not an app toggle.',
      },
    ],
    doThis: ['Match the reservation to {code} and the right terminal lot.'],
    skipIf: ['You wanted a driver included — that is the “car with driver” product, not Avis.'],
  }),
  hertz: draft({
    kicker: 'Hertz airport desk',
    lead: 'Hertz at {airport} is self-drive. The brand is familiar; the traffic is not. Use it for multi-day driving, not as a fancy taxi to {to}.',
    sections: [
      {
        title: 'The first hour',
        body: 'Paperwork, deposit, lot shuttle. Then Vietnam roads. If your only job today is {from} → {to}, a private transfer is cheaper in stress even when Hertz looks similar in USD.',
      },
    ],
    doThis: ['Photograph every panel in the lot, including roof and wheels.'],
    skipIf: ['Manual transmission is a surprise — check the listing twice.'],
  }),
  driverhalf: draft({
    kicker: 'Car with driver, half day',
    lead: 'A local car and driver hired for a block of hours, often via 12Go. This is not Hertz. You are not signing a rental contract; you are buying a person’s afternoon to run {from} toward {to} and maybe one extra stop.',
    sections: [
      {
        title: 'Scope the hours',
        body: '{fare} is a half-day band. Airport pickup plus a hotel plus a lunch stop can fit. A half day does not include “and then the whole coastline”. Agree overtime before you add Marble Mountains “quickly”.',
      },
    ],
    doThis: ['Write the stop list in the booking. Drivers are not tour guides unless you paid for that.'],
    skipIf: ['You only need the airport hop — buy a point-to-point private transfer.'],
  }),
  driversuv: draft({
    kicker: 'Innova / SUV with driver',
    lead: 'A seven-seat Innova or similar with a driver, usually day-rate. The right tool for families, luggage walls, and highway legs out of {airport}.',
    sections: [
      {
        title: 'Why the Innova exists',
        body: 'Vietnam’s default family car. Bags go in the back without Tetris. {fare} is a day-compact, not an hourly taxi. For a single drop at {to} it can be overkill; for airport plus two hotels plus a lookout, it is the sane vehicle.',
      },
    ],
    doThis: ['Count bodies and cases: 6 people + 6 large cases is still tight.'],
    skipIf: ['Solo traveller with a carry-on.'],
  }),
}

function keyFor(provider: CatalogProvider): string {
  if (GUIDES[provider.id]) return provider.id
  const n = provider.name.toLowerCase()
  if (n.includes('12go') && provider.modeId === 'shared-transfer') return '12go-shared'
  if (n.includes('12go')) return '12go-private'
  if (n.includes('klook')) return 'klook'
  if (n.includes('welcome')) return 'welcome'
  if (n.includes('holiday')) return 'holidaytaxis'
  if (n.includes('gettransfer')) return 'gettransfer'
  if (n.startsWith('grab')) return 'grab'
  if (n.startsWith('be')) return 'be'
  if (n.includes('xanh')) return 'xanh'
  if (n.includes('mai linh') && n.includes('cam ranh')) return 'rank-CXR'
  if (n.includes('mai linh')) return 'mailinh'
  if (n.includes('nội bài') || n.includes('noi bai')) return 'rank-HAN'
  if (n.includes('vinasun')) return 'rank-SGN'
  if (n.includes('đà nẵng airport rank') || n.includes('da nang airport rank')) return 'rank-DAD'
  if (n.includes('phú quốc airport') || n.includes('phu quoc airport')) return 'rank-PQC'
  if (n.includes('super air')) return 'dad-superair'
  if (n.includes('futa') && n.includes('huế') || n.includes('futa') && n.includes('hue')) return 'dad-hue'
  if (n.includes('futa') && provider.modeId === 'shared-transfer') return 'dad-futa-share'
  if (n.includes('futa')) return 'dad-futa'
  if (n.includes('sinh')) return 'dad-sinh'
  if (n.includes('budget')) return 'budget'
  if (n.includes('avis')) return 'avis'
  if (n.includes('hertz')) return 'hertz'
  if (n.includes('half day')) return 'driverhalf'
  if (n.includes('innova') || n.includes('suv')) return 'driversuv'
  if (n.includes('crew') || n.includes('vietnam airlines')) return 'vncrew'
  if (n.includes('backpacker') || n.includes('old-town')) return 'backpacker'
  if (n.includes('resort') && n.includes('share')) return 'resortshare'
  if (n.includes('hotel shuttle') || n.includes('airport–hotel') || n.includes('airport-hotel')) {
    return 'hotelshuttle'
  }
  if (provider.modeId === 'public-bus') return 'genericbus'
  if (provider.modeId === 'rental-driver') return 'driverhalf'
  return '12go-private'
}

export function resolveProviderGuide(ctx: Ctx): ResolvedProviderGuide {
  const key = keyFor(ctx.provider)
  const g = GUIDES[key] ?? GUIDES['12go-private']
  return {
    kicker: fill(g.kicker, ctx),
    lead: fill(g.lead, ctx),
    sections: g.sections.map((s) => ({ title: fill(s.title, ctx), body: fill(s.body, ctx) })),
    doThis: g.doThis.map((s) => fill(s, ctx)),
    skipIf: g.skipIf.map((s) => fill(s, ctx)),
  }
}
