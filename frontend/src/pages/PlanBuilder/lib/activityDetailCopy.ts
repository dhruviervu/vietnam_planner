import type { ActivityKind, CityActivity } from '../data/activities'
import { ACTIVITY_KEEP_IN_MIND } from '../data/activityKeepInMind'

export type ActivityGuideSection = {
  title: string
  body: string
  wide?: boolean
}

/** Longer readable snapshot for the detail panel beside the photo. */
export function getActivityDetailBlurb(activity: CityActivity): string {
  const hook = activity.hook.trim()
  const summary = activity.summary.trim()
  const hourBit =
    activity.hours && !/by booking/i.test(activity.hours)
      ? activity.hours.endsWith('.')
        ? activity.hours
        : `${activity.hours}.`
      : ''
  const extras = [
    activity.durationLabel ? `Set aside about ${activity.durationLabel.toLowerCase()}.` : '',
    hourBit,
    activity.bestFor.length > 0 ? `Suits ${activity.bestFor.join(', ').toLowerCase()}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const hookLine = /[.!?]$/.test(hook) ? hook : `${hook}.`
  return [hookLine, summary, extras].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

function join(...parts: Array<string | false | undefined>) {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,])/g, '$1')
    .trim()
}

function hoursLine(activity: CityActivity) {
  const h = activity.hours.trim()
  if (!h) return ''
  if (/by booking/i.test(h)) return 'Usually booked ahead, in daylight.'
  return h.endsWith('.') ? h : `${h}.`
}

function kindExpect(kind: ActivityKind): string {
  switch (kind) {
    case 'class':
      return 'You work with your hands the whole time, then sit down with what you made.'
    case 'workshop':
      return 'A maker shows one technique; you try it once or twice. Short and seated or at a bench.'
    case 'craft':
      return 'You sit beside an artisan, copy a simple step, and leave with something tactile.'
    case 'music':
      return 'Informal. Nobody is scoring you — clap, learn a line, or take the mic if you want it.'
    case 'dance':
      return 'A few steps, then you repeat them together. No performance pressure.'
    case 'sport':
      return 'A short intro, then you are in the water, on the sand, or on the bike. Coaches correct as you go.'
    case 'beach':
      return 'Pickup games. Smile, point at a gap, and you are usually in. Come and go as you like.'
    case 'food':
      return 'Several stops, standing or on low stools. You taste more than you sit.'
    case 'community':
      return 'You follow a local rhythm — early, muddy, or quiet. It is joining in, not a show.'
    case 'adventure':
      return 'You do the moving: paddle, swim, spin, or ride. Guides set the route and the safety line.'
  }
}

function kindBring(kind: ActivityKind): string {
  switch (kind) {
    case 'class':
      return 'Clothes that can take a splash. Tell the host about allergies before you start. Small cash for a thank-you in a home kitchen.'
    case 'workshop':
    case 'craft':
      return 'Clothes you do not mind staining. Small bills if you want to buy a piece from the maker.'
    case 'music':
      return 'A song you can fake, or willingness to clap. Small cash if you are splitting a room or drinks.'
    case 'dance':
      return 'Shoes you can move in and light clothes. Tie hair back if it is a hot room.'
    case 'sport':
      return 'Sunscreen, water, and a change if you will get wet or sweaty.'
    case 'beach':
      return 'Swimwear, water, and flip-flops. Leave valuables in the room.'
    case 'food':
      return 'An empty stomach and cash for extra bites. Motion-sickness care if you are on a motorbike.'
    case 'community':
      return 'Small notes for a thank-you tip. Ask before you photograph people.'
    case 'adventure':
      return 'Grip shoes or sandals that can get wet, a dry bag for your phone, and reef-safe sunscreen.'
  }
}

function extraExpect(activity: CityActivity): string {
  const n = `${activity.id} ${activity.name}`.toLowerCase()
  if (/tai-chi|tai chi/.test(n))
    return 'Arrive 10–15 minutes early and follow from the back. Open lakeside circles rarely need a booking.'
  if (/karaoke/.test(n))
    return 'Private room, snacks on the table, volume optional. Drinks are usually extra.'
  if (/moto|motorbike|food crawl/.test(n))
    return 'Helmet on, hair up, hold the grab rail. Skip a stall if you are full.'
  if (/paddle|kayak|sup|sampan|basket/.test(n))
    return 'You will get wet. Strap glasses. If wind picks up, wait for the meeting point.'
  if (/rice|farm|terrace/.test(n) && !/cook/.test(n))
    return 'Mud is part of it. Go slow, copy whoever is already working, and laugh when you sink.'
  if (/volley|football/.test(n))
    return 'Barefoot is normal. Go easy if children are on the court. Swim or a cold drink usually follows.'
  if (/squid/.test(n))
    return 'Night on the water. You may catch nothing — that is still the outing. The crew will show you the rhythm of the line.'
  if (/\bfish/.test(n) && !/seafood/.test(n))
    return 'Morning on the bank or boat. Misses are normal. Copy the throw and laugh it off.'
  if (/indigo|batik|weaving/.test(n))
    return 'Dye stains skin and clothes for days. Do not wear white.'
  if (/market/.test(n))
    return 'Cash, smiles, and light bargaining. Do not haggle hard over small change.'
  if (/dance|song|folk|jam|drum|ca huế|tài tử/.test(n) && activity.kind !== 'class')
    return 'Join one refrain if invited. Sitting and clapping is enough if you are shy.'
  if (/ride|buddy/.test(n))
    return 'Agree the pace before you leave. You can sit pillion. Rain jacket in the wet season.'
  if (/ao dai|áo dài/.test(n))
    return 'They lend the dress. Pedal slowly. Golden hour is the usual slot.'
  if (/lantern/.test(n))
    return 'You leave with the lantern. Evening light is when it looks finished.'
  if (/pottery|clay/.test(n))
    return 'Messy on purpose. Your piece may not survive a suitcase — take the photo.'
  if (/surf/.test(n))
    return 'Morning is calmer. They provide the board. Say so if you are not a confident swimmer.'
  if (/yoga/.test(n))
    return 'Arrive early for a mat spot. All levels. Ocean noise is the soundtrack.'
  if (/dark-cave|mud/.test(n))
    return 'Swimsuit, flip-flops you can lose, nothing precious. Optional ziplines have weight limits — ask first.'
  if (/snorkel/.test(n))
    return 'Follow the guide. Check water clarity that week; it changes with weather.'
  if (/boxing|muay/.test(n))
    return 'Tell the coach old injuries. Wraps are often provided. One hour is plenty.'
  if (/candy/.test(n))
    return 'Sticky hands, about 45 minutes, and you taste while it is still warm.'
  if (/incense/.test(n))
    return 'Short, fragrant, and you leave with a bundle.'
  return ''
}

function extraBring(activity: CityActivity): string {
  const n = `${activity.id} ${activity.name}`.toLowerCase()
  if (/tai-chi|tai chi/.test(n)) return 'Soft shoes or bare feet. A light layer for the dawn chill.'
  if (/cook|kitchen|seafood/.test(n))
    return 'Closed-toe shoes. Hair tied back. Note spice or shellfish allergies when you book.'
  if (/indigo|batik|weaving|pottery|incense|lantern/.test(n))
    return 'An old shirt. Hand wipes. Cash if you want to buy extra from the studio.'
  if (/kayak|sup|paddle|surf|snorkel|basket|cave|mud/.test(n))
    return 'A dry bag, strap for glasses, and a towel. No jewelry you care about.'
  if (/moto|ride/.test(n))
    return 'Long sleeves for sun and bugs. Say no if the pace feels unsafe — a good rider will slow down.'
  if (/rice|farm|terrace/.test(n) && !/cook/.test(n))
    return 'A change of clothes and something that can get muddy. Hat for the sun.'
  if (/karaoke/.test(n)) return 'Small bills to split the room. A chorus you can laugh through.'
  if (/yoga|dance/.test(n)) return 'Water and clothes you can stretch in. They often lend mats or a dress.'
  return ''
}

function knowCopy(activity: CityActivity): string {
  const free = activity.priceFromUsd === 0
  const cost = free
    ? `${activity.priceLabel}. A small tip is the right thank-you if someone taught you.`
    : `${activity.priceLabel} as a starting point. Confirm whether gear, food, or hotel pickup is included.`
  const fit =
    activity.bestFor.length > 0
      ? `Fits ${activity.bestFor.join(', ').toLowerCase()}.`
      : ''
  const photo = /community|homestay|market|weaving|dance|song/.test(
    `${activity.kind} ${activity.id}`,
  )
    ? 'Ask before photographing people, especially in villages and homes.'
    : ''
  return join(cost, fit, photo)
}

const WHERE_TO_CATCH: Record<string, string> = {
  'hn-cooking-home':
    'Book a family kitchen in or just outside the Old Quarter — Hang Be, Hang Bac, or a house toward the French Quarter. Skip hotel buffet classes; the point is a real stove and a shared table.',
  'hn-tai-chi-lake':
    'Hoan Kiem Lake, especially the east bank near Ngoc Son, from about 5:30–7:00. Lenin Park also has weekend groups. Walk up, watch one round, then join from the back. No ticket booth.',
  'hn-karaoke-bia-hoi':
    'Private rooms in the Old Quarter (side streets off Ta Hien, Hang Buom, and Ma May) after 8pm. Ask a hotel desk to call a room rather than wandering stage bars. Bia hoi corners nearby are for drinks after, not the singing.',
  'hn-street-food-moto':
    'Start in the Old Quarter / Dong Xuan lanes, not Train Street. A good run hits standing stalls for pho, bun cha, and coffee — your guide should name the stops before you put the helmet on.',
  'hn-egg-coffee-lab':
    'Old Quarter workshops near Nguyen Huu Huan. Cafe Giang is the classic cup if you only want to taste; book a lab if you want to whip the foam yourself. Small groups fill up — reserve the day before.',
  'nb-paddle-van-long':
    'Van Long Nature Reserve (Gia Vien), north of Ninh Binh town — this is where you can actually take an oar. Trang An is mostly a seated ferry. Tam Coc is prettier and busier; go early if that is your only option.',
  'nb-rice-homestay':
    'Countryside homestays around Tam Coc and Hoa Lu, not the roadside hotels on the highway. Ask if field work is in season (planting or harvest). A morning with the family beats a staged “farmer for an hour” stop.',
  'nb-countryside-cook':
    'Village kitchens in the Tam Coc / Hoa Lu homestay cluster. Many include a small market stop first. Confirm it is a home stove, not a restaurant demo for a bus group.',
  'nb-bike-picnic':
    'Flat paddy lanes between Tam Coc and Hang Mua, or the quieter backroads toward Van Long. Hire bikes in Tam Coc village. Pack fruit and water; eat where the limestone opens, not on the main coach road.',
  'hl-kayak-karsts':
    'Lan Ha Bay from Cat Ba (Ben Beo or the town pier) is the better paddle — smaller boats, more time on the water. Ha Long day cruises from Tuan Chau often include only a short kayak stop. Ask how many minutes you actually paddle.',
  'hl-beach-volley':
    'Cat Co 1–3 beaches on Cat Ba, late afternoon into sunset. Walk the sand, watch a rotation, then ask to join. Hotel beaches will lend a ball if a net is already up. Ha Long city waterfront is not the game.',
  'hl-squid-night':
    'Overnight or evening boats from Cat Ba harbor or Tuan Chau. Ask the crew the afternoon you board — this is an add-on, not a street activity. Bring a light layer; the deck is windy.',
  'hl-sup-lan-ha':
    'Sheltered Lan Ha coves, run from Cat Ba operators. Beginner boards at the pier. Skip open Ha Long swell unless you already paddle well.',
  'hg-homestay-dance':
    'After dinner at your homestay — Lung Cu, Dong Van, or Meo Vac are the usual nights. This is a circle in the yard, not a staged town show. Ask your host; they will tell you if music is happening that evening.',
  'hg-weaving':
    'Lung Tam linen village in Quan Ba is the reliable stop on the loop. Some Dong Van houses also host a short try-on. Buy from the maker in front of you, not a roadside souvenir shed.',
  'hg-market-day':
    'Dong Van Sunday market is the one to plan around. Meo Vac and Yen Minh run on other weekdays — check with your host. Go at opening, shop for lunch ingredients, cook them back at the homestay.',
  'hg-easy-ride-buddy':
    'Start in Ha Giang city with a local rider. The scenic half-day is Quan Ba – Yen Minh – Dong Van viewpoints, not the full hardcore loop. Agree the pace and hairpin comfort before you leave town.',
  'sp-indigo-batik':
    'Cat Cat for an easy intro; Ta Phin if you want Red Dzao indigo. Book in Sapa town, go to the village workshop — do not buy “indigo” from the main square stalls and call it a class.',
  'sp-homestay-cook':
    'Muong Hoa valley homestays — Ta Van, Lao Chai, Giang Ta Chai — not a restaurant class in Sapa town. Dinner prep starts late afternoon. Stay the night if you can; the walk back in mist is the weak part of a day trip.',
  'sp-terrace-walk-games':
    'The Lao Chai – Ta Van valley path. Guides pause in villages for play if the mood is right. Ask before photos. This is not the Fansipan ticket line.',
  'sp-evening-song':
    'Homestay living rooms in the Muong Hoa valley after dinner. Town bars in Sapa play speakers, not this. Sit, clap, learn one refrain if they offer.',
  'hue-royal-cook':
    'Classes that start with Dong Ba Market, then a kitchen near the Citadel. Skip the hotel high-tea version. Ask whether you plate a full Hue spread or only one tourist dish.',
  'hue-ca-hue-boat':
    'Evening boats on the Perfume River from the Le Loi / park-side piers. Ask if guests may join the chorus — some sets are listen-only. Sit near the musicians, not the drinks fridge.',
  'hue-ao-dai-cycle':
    'Perfume River paths, Trang Tien toward Thien Mu, at golden hour. Rental shops on Le Loi lend the dress and the bike. Pedal slowly; this is a promenade, not a workout.',
  'hue-incense-craft':
    'Thuy Xuan village south of the river — look for the pink sticks drying along the road. Not the Citadel souvenir stalls. A short workshop, then walk the drying racks.',
  'ha-lantern-make':
    'Workshops on Nguyen Thai Hoc and nearby old-town lanes. You leave with the lantern; hang it that night. Ancient-town tourist kiosks sell ready-made ones — that is not this.',
  'ha-tra-que-cook':
    'Tra Que vegetable village, 3–4 km north of the ancient town via Cam Ha. Cycle or grab a short taxi. Book the garden kitchen, not a restaurant back in town that uses the name.',
  'ha-an-bang-play':
    'An Bang Beach, about 15 minutes from the old town. Nets and balls appear from roughly 16:30–18:30. Walk onto the sand, smile, point at a gap. The old-town riverfront is not the game.',
  'ha-basket-boat':
    'Cam Thanh coconut village (Bay Mau), east of Hoi An — not the old-town river. Go early to miss the tour clusters. You are in the round boat; the fisher shows you the spin.',
  'ha-folk-dance':
    'Old-town cultural houses and some hotel courtyards offer short intros. Check the evening performance board in the ancient town. This is a few steps, not a ticketed spectacle.',
  'ha-thanh-ha-pottery':
    'Thanh Ha pottery village, west of the ancient town. Sit at a maker’s wheel. The clay souvenirs in old-town shops are not the class.',
  'dn-surf-my-khe':
    'My Khe / Pham Van Dong beachfront schools. Morning glass is the lesson; afternoon wind is for watching. They provide the board. Tell them if you are not a confident swimmer.',
  'dn-beach-football':
    'My Khe sand along the main hotel stretch after 17:00, when local groups show up. Wave at a gap. The Han riverfront promenade is for walking, not this.',
  'dn-sunset-yoga':
    'My Khe toward the Marble Mountains end, or hotel decks that put mats on the sand. Arrive 15 minutes early. Pop-ups move — ask your hotel which stretch has a session tonight.',
  'dn-han-kayak':
    'Operators on the Han riverfront near Dragon Bridge. Dusk is the point — lights on the bridge. Calm water; this is not a sea paddle.',
  'pn-dark-cave-play':
    'Hang Toi / Chay River complex, northwest of Phong Nha town — not Paradise Cave and not the Phong Nha Cave boat. Buy the current official combo; zip and mud elements change with water level.',
  'pn-farmstay-cook':
    'Farmstays along the Ho Chi Minh Highway west of Phong Nha town. Help with dinner under string lights, then eat. Town restaurants will not give you a knife.',
  'pn-son-kayak':
    'Son River boat station / town riverfront in Phong Nha. Flat water, limestone walls. This is not a cave ticket. Rent or join a short guided paddle from the pier.',
  'hcmc-cook-class':
    'Home kitchens in District 1 or 3. The better ones stop at a wet market (Thai Binh or a neighborhood market), not only Ben Thanh. Confirm group size — six people is already a crowd at a home stove.',
  'hcmc-dance-class':
    'Beginner drop-ins in District 1–3 studios, not the Bui Vien pavement. Search salsa or hip-hop that week; English-friendly sessions are common. Sneakers, water, one combo, then the social floor if you want it.',
  'hcmc-karaoke':
    'Private rooms in District 1 — Pasteur, around Nguyen Hue, or side streets off Bui Vien. Book a room, split the bill, pass the mic. Stage bars are for watching; this is for singing.',
  'hcmc-moto-food':
    'Alley stalls in D1, D3, and District 4. A good crawl names the stops. Backpacker street is one chapter, not the whole night. Helmet on before the first bite.',
  'hcmc-boxing':
    'Gyms in District 1 and Binh Thanh offer traveler intro sessions. Book a pads hour, not a stadium fight. Tell the coach old injuries at the door.',
  'mk-coconut-candy':
    'Ben Tre island kitchens, not the rushed My Tho day-trip candy stop if you can help it. Stir, cut, taste warm. Forty-five minutes is the whole visit.',
  'mk-homestay-fish':
    'Canal homestays in Ben Tre or Vinh Long. Morning on the bank with your host. This is not a fishing-tour boat from My Tho.',
  'mk-sampan-paddle':
    'Quiet canals in Cai Be or Ben Tre where you take an oar under water-coconut groves. Skip the big motorboat circuit if paddling is the point. Short stretches; you will be damp.',
  'mk-don-ca-tai-tu':
    'Homestays and cultural houses in Vinh Long or Can Tho in the evening. Intimate, sit close, tap along. Tour-bus “folk shows” in My Tho are louder and less of this.',
  'pq-beach-volley':
    'Long Beach (Bai Truong) hotel stretch at sunset. Nets go up most evenings. Ask to rotate in. Sao Beach is for swimming, not the regular pickup game.',
  'pq-seafood-cook':
    'Duong Dong market or Ham Ninh for the catch, then a kitchen facing the breeze if you are lucky. Book a class, not only a restaurant grill.',
  'pq-sup-sunset':
    'Calmer west-coast water — Long Beach or Ong Lang. Beginner boards from beach operators. East-coast wind is a different afternoon.',
  'pq-snorkel-guide':
    'North islets (Hon Mot and neighbors) in clear season, or south around An Thoi. Day boat with time in the water, not a look-from-the-deck ticket. Ask about clarity that week.',
  'pq-beach-drum':
    'Long Beach / sunset-strip bars on jam nights. Ask which evening has guitars. Bring a song or just sit in the circle. Some spots have a drink minimum.',
}

export function getActivityWhereToCatch(activity: CityActivity) {
  return WHERE_TO_CATCH[activity.id] ?? null
}

export function getActivityGuideSections(activity: CityActivity): ActivityGuideSection[] {
  const authored = ACTIVITY_KEEP_IN_MIND[activity.id]
  if (authored) {
    return [
      { title: 'Where to do this', body: authored.where, wide: true },
      { title: 'What this is', body: authored.what },
      { title: 'What to expect', body: authored.expect },
      { title: 'What to bring', body: authored.bring },
      { title: 'Good to know', body: authored.know },
    ]
  }

  const expect = join(
    `Set aside ${activity.durationLabel.toLowerCase()}.`,
    hoursLine(activity),
    extraExpect(activity) || kindExpect(activity.kind),
  )
  const bring = extraBring(activity) || kindBring(activity.kind)
  const where = getActivityWhereToCatch(activity)

  const sections: ActivityGuideSection[] = []
  if (where) {
    sections.push({ title: 'Where to do this', body: where, wide: true })
  }
  sections.push(
    {
      title: 'What this is',
      body: activity.summary.trim(),
    },
    {
      title: 'What to expect',
      body: expect,
    },
    {
      title: 'What to bring',
      body: bring,
    },
    {
      title: 'Good to know',
      body: knowCopy(activity),
    },
  )
  return sections
}
