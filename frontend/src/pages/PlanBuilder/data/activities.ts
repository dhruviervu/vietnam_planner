import { cityImages } from './cityImages'
import { ACTIVITY_IMAGES } from './activityImages'
import { withPhotoFallbacks } from '../lib/resolveCatalogPhotos'

export type ActivityKind =
  | 'class'
  | 'music'
  | 'dance'
  | 'sport'
  | 'beach'
  | 'workshop'
  | 'food'
  | 'community'
  | 'adventure'
  | 'craft'

export type ActivityPopularityTag =
  | 'Must do'
  | 'Popular'
  | 'Free time'
  | 'Local favourite'
  | 'Unique'

export type CityActivity = {
  id: string
  /** Matches EXPLORE_CITIES id */
  cityId: string
  cityName: string
  name: string
  kind: ActivityKind
  kindLabel: string
  hook: string
  summary: string
  /** Longer card blurb (2–4 sentences) */
  cardSummary: string
  /** ~200-word story for the detail page */
  about: string
  whyGo: string
  durationLabel: string
  priceFromUsd: number | null
  priceLabel: string
  bestFor: string[]
  vibe: string
  /** Primary image (cards + bag thumbs) */
  image: string
  images: string[]
  popularityTag: ActivityPopularityTag
  signalEmoji: string
  signalLabel: string
  tags: string[]
  bestTime: string
  hours: string
  rating: number
}

const KIND_LABEL: Record<ActivityKind, string> = {
  class: 'Class',
  music: 'Music',
  dance: 'Dance',
  sport: 'Sport',
  beach: 'Beach',
  workshop: 'Workshop',
  food: 'Food',
  community: 'With locals',
  adventure: 'Adventure',
  craft: 'Craft',
}

const KIND_SIGNAL: Record<ActivityKind, { emoji: string; label: string }> = {
  class: { emoji: '👩‍🍳', label: 'Hands-on class' },
  music: { emoji: '🎤', label: 'Music & song' },
  dance: { emoji: '💃', label: 'Dance' },
  sport: { emoji: '🏄', label: 'Active play' },
  beach: { emoji: '🏖️', label: 'Beach time' },
  workshop: { emoji: '✨', label: 'Workshop' },
  food: { emoji: '🍜', label: 'Food adventure' },
  community: { emoji: '🤝', label: 'With locals' },
  adventure: { emoji: '⚡', label: 'Adventure' },
  craft: { emoji: '🧶', label: 'Craft' },
}

const KIND_BEST_TIME: Record<ActivityKind, string> = {
  class: 'Morning or afternoon',
  music: 'Evening',
  dance: 'Evening',
  sport: 'Morning or late afternoon',
  beach: 'Late afternoon / sunset',
  workshop: 'Morning or afternoon',
  food: 'Morning market or evening',
  community: 'Morning or evening',
  adventure: 'Morning',
  craft: 'Afternoon',
}

function img(cityId: string, index = 0) {
  const list = cityImages(cityId)
  return list[index % Math.max(list.length, 1)] ?? list[0] ?? ''
}

type ActivitySeed = {
  id: string
  cityId: string
  cityName?: string
  name: string
  kind: ActivityKind
  hook: string
  summary: string
  durationLabel: string
  priceFromUsd: number | null
  priceLabel: string
  bestFor: string[]
  vibe: string
  image: string
  popularityTag?: ActivityPopularityTag
  cardSummary?: string
  about?: string
  whyGo?: string
  tags?: string[]
  bestTime?: string
  hours?: string
  rating?: number
}

function defaultPopularityTag(seed: ActivitySeed): ActivityPopularityTag {
  if (seed.priceFromUsd === 0) return 'Free time'
  if (seed.kind === 'community' || seed.kind === 'beach') return 'Local favourite'
  if (seed.kind === 'class' || seed.kind === 'adventure') return 'Must do'
  if (seed.kind === 'craft' || seed.kind === 'workshop') return 'Unique'
  return 'Popular'
}

function buildCardSummary(seed: ActivitySeed, cityName: string): string {
  const costBit =
    seed.priceFromUsd === 0
      ? 'Often free or tip-based — perfect for flexible free time.'
      : `Expect to budget ${seed.priceLabel.toLowerCase()} for a typical booking.`
  return `${seed.hook} ${seed.summary} In ${cityName}, this is a true join-in activity rather than a photo stop. ${costBit} Best suited for ${seed.bestFor.join(', ').toLowerCase()}.`
}

function buildAbout(seed: ActivitySeed, cityName: string, kindLabel: string): string {
  const isFree = seed.priceFromUsd === 0
  const costLine = isFree
    ? `Cost is usually free or tip-based (${seed.priceLabel}). Bring small cash for drinks or a thank-you gift if a local group welcomes you in.`
    : `Plan on ${seed.priceLabel} as a realistic starting point. Confirm what is included — gear, ingredients, transfers, or instructor time — before you book, and ask about group size caps so the session stays personal.`
  const p1 = `${seed.name} in ${cityName} is a hands-on ${kindLabel.toLowerCase()} for travelers who want to participate, not only observe. ${seed.hook} ${seed.summary}`
  const p2 = `The feeling people remember is “${seed.vibe}.” Set aside about ${seed.durationLabel}. ${costLine}`
  const p3 = `This fits ${seed.bestFor.join(', ').toLowerCase()}. Arrive a little early, wear clothes you can move (or get messy) in, and follow the lead of your host or the locals already playing. Put the camera down for stretches of time — the magic is in the doing: stirring a pot, missing a volleyball, learning a chorus, spinning a basket boat.`
  const p4 = `When you add this to your trip bag, we treat it as an activity slot — something we can weave beside your signature experiences without forcing a rigid timetable. Ask questions, tip fairly when someone shares their craft or kitchen, and leave room for the unexpected laugh that usually becomes the story you tell later.`
  return `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`
}

function a(seed: ActivitySeed): CityActivity {
  const cityName = seed.cityName ?? titleFromId(seed.cityId)
  const kindLabel = KIND_LABEL[seed.kind]
  const signal = KIND_SIGNAL[seed.kind]
  const photos = ACTIVITY_IMAGES[seed.id]
  const image = photos?.[0] ?? seed.image
  const gallery = photos?.length ? photos : [image]

  const popularityTag = seed.popularityTag ?? defaultPopularityTag(seed)
  const tags = seed.tags ?? [
    kindLabel,
    popularityTag,
    ...(seed.priceFromUsd === 0 ? ['Free / tip'] : ['Paid']),
    ...seed.bestFor.slice(0, 2),
  ]

  return {
    id: seed.id,
    cityId: seed.cityId,
    cityName,
    name: seed.name,
    kind: seed.kind,
    kindLabel,
    hook: seed.hook,
    summary: seed.summary,
    cardSummary: seed.cardSummary ?? buildCardSummary(seed, cityName),
    about: seed.about ?? buildAbout(seed, cityName, kindLabel),
    whyGo: seed.whyGo ?? seed.hook,
    durationLabel: seed.durationLabel,
    priceFromUsd: seed.priceFromUsd,
    priceLabel: seed.priceLabel,
    bestFor: seed.bestFor,
    vibe: seed.vibe,
    image,
    images: gallery,
    popularityTag,
    signalEmoji: signal.emoji,
    signalLabel: signal.label,
    tags,
    bestTime: seed.bestTime ?? KIND_BEST_TIME[seed.kind],
    hours: seed.hours ?? 'By booking / daylight hours',
    rating: seed.rating ?? 4.7,
  }
}

function titleFromId(id: string) {
  const map: Record<string, string> = {
    hanoi: 'Hanoi',
    'ninh-binh': 'Ninh Binh',
    'ha-long': 'Ha Long',
    'ha-giang': 'Ha Giang',
    sapa: 'Sapa',
    hue: 'Hue',
    'hoi-an': 'Hoi An',
    'da-nang': 'Da Nang',
    'phong-nha': 'Phong Nha',
    hcmc: 'Ho Chi Minh City',
    mekong: 'Mekong Delta',
    'phu-quoc': 'Phu Quoc',
    'nha-trang': 'Nha Trang',
    'da-lat': 'Da Lat',
    dalat: 'Da Lat',
  }
  return map[id] ?? id
}

/**
 * Participatory things to do — classes, play, music, dance, workshops —
 * not sightseeing. Grouped by explore city id.
 */
export const CITY_ACTIVITIES: CityActivity[] = [
  // ——— Hanoi ———
  a({
    id: 'hn-cooking-home',
    cityId: 'hanoi',
    name: 'Home kitchen cooking class',
    kind: 'class',
    hook: 'Chop, stir, and plate with a Hanoi family — then eat what you made.',
    summary:
      'Join a small home kitchen in or near the Old Quarter. Learn bun cha, spring rolls, or seasonal dishes from scratch, then sit down with your hosts for the meal.',
    durationLabel: '3–4 hours',
    priceFromUsd: 35,
    priceLabel: 'From $35',
    bestFor: ['Food lovers', 'Couples', 'First-timers'],
    vibe: 'Hands in the wok',
    image: img('hanoi', 3),
  }),
  a({
    id: 'hn-tai-chi-lake',
    cityId: 'hanoi',
    name: 'Dawn tai chi by Hoan Kiem',
    kind: 'community',
    hook: 'Move with local regulars as the lake wakes up.',
    summary:
      'Arrive early, follow a public group or a guided intro session, and feel the city’s quiet rhythm before traffic builds. Soft, social, and free if you join open circles.',
    durationLabel: '45–60 min',
    priceFromUsd: 0,
    priceLabel: 'Free / tip',
    bestFor: ['Early risers', 'Slow travel'],
    vibe: 'Soft morning energy',
    image: img('hanoi', 0),
  }),
  a({
    id: 'hn-karaoke-bia-hoi',
    cityId: 'hanoi',
    name: 'Karaoke night with locals',
    kind: 'music',
    hook: 'Belt Vietnamese pop and ballads in a private room — volume optional, courage required.',
    summary:
      'Book a karaoke box near the Old Quarter or with a local friend. Order snacks, pass the mic, and learn a chorus or two. The point is joining in, not sounding good.',
    durationLabel: '2–3 hours',
    priceFromUsd: 15,
    priceLabel: 'From $15 / room share',
    bestFor: ['Groups', 'Night owls'],
    vibe: 'Loud and laughing',
    image: img('hanoi', 1),
  }),
  a({
    id: 'hn-street-food-moto',
    cityId: 'hanoi',
    name: 'Backstreet food motorbike run',
    kind: 'food',
    hook: 'Ride pillion to stalls locals actually queue for — then taste side by side.',
    summary:
      'A guide takes you lane-by-lane for pho, bun, coffee, and night snacks. You eat standing, sitting on stools, and comparing notes — not from a tourist menu board.',
    durationLabel: '3 hours',
    priceFromUsd: 40,
    priceLabel: 'From $40',
    bestFor: ['Food lovers', 'Adventure'],
    vibe: 'Neon + steam',
    image: img('hanoi', 4),
  }),
  a({
    id: 'hn-egg-coffee-lab',
    cityId: 'hanoi',
    name: 'Egg coffee making lab',
    kind: 'workshop',
    hook: 'Whip the foam yourself — leave knowing why Hanoi’s cup is different.',
    summary:
      'A short hands-on workshop: brew, whip egg cream, balance sweetness, and taste variants. Small groups, lots of tasting.',
    durationLabel: '1–1.5 hours',
    priceFromUsd: 18,
    priceLabel: 'From $18',
    bestFor: ['Coffee nerds', 'Couples'],
    vibe: 'Sweet & foamy',
    image: img('hanoi', 5),
  }),

  // ——— Ninh Binh ———
  a({
    id: 'nb-paddle-van-long',
    cityId: 'ninh-binh',
    name: 'Paddle your own bamboo boat',
    kind: 'adventure',
    hook: 'You hold the oar — karst cliffs and quiet water do the rest.',
    summary:
      'At Van Long or quieter corners of Trang An, paddle (or share paddling) instead of only being ferried. Calm water, bird calls, and room to breathe.',
    durationLabel: '1.5–2 hours',
    priceFromUsd: 12,
    priceLabel: 'From $12',
    bestFor: ['Nature', 'Couples'],
    vibe: 'Quiet muscle',
    image: img('ninh-binh', 2),
  }),
  a({
    id: 'nb-rice-homestay',
    cityId: 'ninh-binh',
    name: 'Rice-field morning with a farm family',
    kind: 'community',
    hook: 'Plant, transplant, or harvest — mud optional, stories included.',
    summary:
      'Stay or day-visit a countryside homestay and join seasonal field work. Finish with a home-cooked lunch from the same kitchen.',
    durationLabel: 'Half day',
    priceFromUsd: 25,
    priceLabel: 'From $25',
    bestFor: ['Families', 'Slow travel'],
    vibe: 'Mud & laughter',
    image: img('ninh-binh', 0),
  }),
  a({
    id: 'nb-countryside-cook',
    cityId: 'ninh-binh',
    name: 'Countryside cooking under the eaves',
    kind: 'class',
    hook: 'Cook goat, river fish, or garden greens where the ingredients grew.',
    summary:
      'Market stop, then cook in a village kitchen. Lessons are unhurried and usually end with a long shared table.',
    durationLabel: '3–4 hours',
    priceFromUsd: 30,
    priceLabel: 'From $30',
    bestFor: ['Food lovers'],
    vibe: 'Smoke & gardens',
    image: img('ninh-binh', 1),
  }),
  a({
    id: 'nb-bike-picnic',
    cityId: 'ninh-binh',
    name: 'Bike the paddies + roadside picnic',
    kind: 'sport',
    hook: 'Pedal flat lanes between limestone towers, then eat where the view opens.',
    summary:
      'Hire bikes, follow a local route, stop for fruit and cold drinks. Easy pace, big scenery, zero rush.',
    durationLabel: '3–5 hours',
    priceFromUsd: 15,
    priceLabel: 'From $15',
    bestFor: ['Active', 'Couples'],
    vibe: 'Wind in the rice',
    image: img('ninh-binh', 3),
  }),

  // ——— Ha Long / Cat Ba ———
  a({
    id: 'hl-kayak-karsts',
    cityId: 'ha-long',
    name: 'Kayak into the karsts',
    kind: 'adventure',
    hook: 'Paddle under arches and into lagoons — you power every stroke.',
    summary:
      'From a day boat or Cat Ba base, kayak calm inlets and floating villages. Guides set the route; you do the paddling.',
    durationLabel: '2–3 hours',
    priceFromUsd: 35,
    priceLabel: 'From $35',
    bestFor: ['Active', 'Nature'],
    vibe: 'Salt on your hands',
    image: img('ha-long', 1),
  }),
  a({
    id: 'hl-beach-volley',
    cityId: 'ha-long',
    name: 'Beach volleyball with travelers & locals',
    kind: 'beach',
    hook: 'Cat Ba sand, pickup games, and cold drinks after sunset.',
    summary:
      'Join informal games on Cat Co or hotel beaches. Easy to walk up, smile, and ask to rotate in — language optional.',
    durationLabel: '1–2 hours',
    priceFromUsd: 0,
    priceLabel: 'Free',
    bestFor: ['Groups', 'Youthful vibe'],
    vibe: 'Sandy feet',
    image: img('ha-long', 4),
  }),
  a({
    id: 'hl-squid-night',
    cityId: 'ha-long',
    name: 'Night squid fishing with the crew',
    kind: 'community',
    hook: 'Drop lines under deck lights — celebrate whatever comes up.',
    summary:
      'Evening boat runs teach you the rhythm of line fishing. Grill on board if the catch cooperates; the night sky is the backup plan.',
    durationLabel: '3–4 hours',
    priceFromUsd: 45,
    priceLabel: 'From $45',
    bestFor: ['Groups', 'Night'],
    vibe: 'Black water glow',
    image: img('ha-long', 2),
  }),
  a({
    id: 'hl-sup-lan-ha',
    cityId: 'ha-long',
    name: 'Stand-up paddle among limestone',
    kind: 'sport',
    hook: 'Quiet water, your balance, and cliffs all around.',
    summary:
      'SUP sessions in sheltered Lan Ha corners. Beginner-friendly with a short coach intro before you glide out.',
    durationLabel: '1.5–2 hours',
    priceFromUsd: 30,
    priceLabel: 'From $30',
    bestFor: ['Active', 'Couples'],
    vibe: 'Glide & giggle',
    image: img('ha-long', 0),
  }),

  // ——— Ha Giang ———
  a({
    id: 'hg-homestay-dance',
    cityId: 'ha-giang',
    name: 'Homestay singing & circle dance',
    kind: 'dance',
    hook: 'Corn wine, folk songs, and feet that somehow keep the beat.',
    summary:
      'Evening at a Hmong or Tay homestay often ends in shared song and dance. Join the circle — hosts love guests who try.',
    durationLabel: 'Evening',
    priceFromUsd: 0,
    priceLabel: 'Included with stay / tip',
    bestFor: ['Culture', 'Groups'],
    vibe: 'Firelight chorus',
    image: img('ha-giang', 2),
  }),
  a({
    id: 'hg-weaving',
    cityId: 'ha-giang',
    name: 'Hmong weaving & indigo try-on',
    kind: 'craft',
    hook: 'Touch hemp, dye, and pattern with artisans — leave with stained fingertips.',
    summary:
      'Short workshops in villages along the loop introduce handloom basics and indigo. Buy direct from makers when you can.',
    durationLabel: '1–2 hours',
    priceFromUsd: 12,
    priceLabel: 'From $12',
    bestFor: ['Craft lovers', 'Slow travel'],
    vibe: 'Blue hands',
    image: img('ha-giang', 1),
  }),
  a({
    id: 'hg-market-day',
    cityId: 'ha-giang',
    name: 'Market morning with your host',
    kind: 'community',
    hook: 'Shop for lunch ingredients side by side — then cook them back home.',
    summary:
      'Follow your homestay host through a highland market: herbs, meat, sticky rice. Practice numbers, smiles, and bargaining gently.',
    durationLabel: '2–3 hours',
    priceFromUsd: 8,
    priceLabel: 'From $8 + groceries',
    bestFor: ['Food', 'Culture'],
    vibe: 'Basket & banter',
    image: img('ha-giang', 3),
  }),
  a({
    id: 'hg-easy-ride-buddy',
    cityId: 'ha-giang',
    name: 'Easy scenic ride with a local buddy',
    kind: 'adventure',
    hook: 'Ride pillion or self-drive short stretches with someone who knows every hairpin.',
    summary:
      'Not the full hardcore loop — curated viewpoints, photo stops, and tea breaks with a local rider who sets a safe pace.',
    durationLabel: 'Half day',
    priceFromUsd: 40,
    priceLabel: 'From $40',
    bestFor: ['Views', 'Couples'],
    vibe: 'Wind & limestone',
    image: img('ha-giang', 0),
  }),

  // ——— Sapa ———
  a({
    id: 'sp-indigo-batik',
    cityId: 'sapa',
    name: 'Indigo & batik workshop',
    kind: 'workshop',
    hook: 'Draw wax lines, dip cloth, watch blue bloom.',
    summary:
      'Village workshops teach simple batik motifs and indigo dips. Wear clothes you don’t mind staining.',
    durationLabel: '2 hours',
    priceFromUsd: 15,
    priceLabel: 'From $15',
    bestFor: ['Craft', 'Families'],
    vibe: 'Wax & blue',
    image: img('sapa', 0),
  }),
  a({
    id: 'sp-homestay-cook',
    cityId: 'sapa',
    name: 'Cook dinner in a mountain homestay',
    kind: 'class',
    hook: 'Fire, cast iron, and mountain vegetables — cook with your hosts.',
    summary:
      'Help prep bamboo-tube rice, grilled meats, or wild greens, then eat together on low stools. Stories come with the steam.',
    durationLabel: '2–3 hours',
    priceFromUsd: 20,
    priceLabel: 'From $20',
    bestFor: ['Food', 'Culture'],
    vibe: 'Smoke in the rafters',
    image: img('sapa', 1),
  }),
  a({
    id: 'sp-terrace-walk-games',
    cityId: 'sapa',
    name: 'Terrace walk + village games',
    kind: 'community',
    hook: 'Walk the paddies, then join kids’ games or a friendly tug-of-war.',
    summary:
      'Guided walks that pause in villages for play — skipping games, simple ball games, or music if the mood is right. Ask before photos.',
    durationLabel: 'Half day',
    priceFromUsd: 25,
    priceLabel: 'From $25',
    bestFor: ['Families', 'Active'],
    vibe: 'Mud paths & grins',
    image: img('sapa', 2),
  }),
  a({
    id: 'sp-evening-song',
    cityId: 'sapa',
    name: 'Evening folk song circle',
    kind: 'music',
    hook: 'Learn a refrain, clap the rhythm, pass a cup of warm tea.',
    summary:
      'Homestay evenings sometimes open into shared singing. Join softly; hosts often teach a line if you ask.',
    durationLabel: '1 hour',
    priceFromUsd: 0,
    priceLabel: 'Tip welcome',
    bestFor: ['Culture', 'Slow nights'],
    vibe: 'Voices in the mist',
    image: img('sapa', 3),
  }),

  // ——— Hue ———
  a({
    id: 'hue-royal-cook',
    cityId: 'hue',
    name: 'Royal-inspired cooking class',
    kind: 'class',
    hook: 'Plate like Hue’s imperial kitchen — delicate, colorful, precise.',
    summary:
      'Learn refined Hue dishes and presentation. Often includes a market visit and a multi-course tasting of your own work.',
    durationLabel: '3–4 hours',
    priceFromUsd: 38,
    priceLabel: 'From $38',
    bestFor: ['Food lovers', 'Couples'],
    vibe: 'Careful beauty',
    image: img('hue', 0),
  }),
  a({
    id: 'hue-ca-hue-boat',
    cityId: 'hue',
    name: 'Sing along on a ca Huế boat',
    kind: 'music',
    hook: 'Traditional songs on the Perfume River — clap, hum, then try a line.',
    summary:
      'Evening boats host ca Huế musicians. Guests are often invited to join choruses. Soft lights, river breeze, brave voices.',
    durationLabel: '1.5 hours',
    priceFromUsd: 20,
    priceLabel: 'From $20',
    bestFor: ['Culture', 'Couples'],
    vibe: 'Lanterns on water',
    image: img('hue', 3),
  }),
  a({
    id: 'hue-ao-dai-cycle',
    cityId: 'hue',
    name: 'Áo dài cycle along the river',
    kind: 'community',
    hook: 'Borrow the dress, pedal slowly, feel the city’s grace.',
    summary:
      'Rent an áo dài and bike the Perfume River paths at golden hour. Photo stops optional — the feeling is the point.',
    durationLabel: '2 hours',
    priceFromUsd: 18,
    priceLabel: 'From $18',
    bestFor: ['Couples', 'Photos'],
    vibe: 'Silk in the breeze',
    image: img('hue', 1),
  }),
  a({
    id: 'hue-incense-craft',
    cityId: 'hue',
    name: 'Incense-making by hand',
    kind: 'craft',
    hook: 'Roll sticks, scent the air, take a bundle home.',
    summary:
      'Short craft sessions near Thuy Xuan teach bundling and scent mixing. Sweet-smelling, meditative, very Hue.',
    durationLabel: '1 hour',
    priceFromUsd: 10,
    priceLabel: 'From $10',
    bestFor: ['Families', 'Craft'],
    vibe: 'Pink sticks drying',
    image: img('hue', 2),
  }),

  // ——— Hoi An ———
  a({
    id: 'ha-lantern-make',
    cityId: 'hoi-an',
    name: 'Make your own silk lantern',
    kind: 'workshop',
    hook: 'Frame, silk, and a glow you’ll hang that night.',
    summary:
      'Workshop studios walk you through building a classic Hoi An lantern. Leave with something you actually made.',
    durationLabel: '1–1.5 hours',
    priceFromUsd: 15,
    priceLabel: 'From $15',
    bestFor: ['Families', 'Couples'],
    vibe: 'Glow in your hands',
    image: img('hoi-an', 2),
  }),
  a({
    id: 'ha-tra-que-cook',
    cityId: 'hoi-an',
    name: 'Tra Que herb garden cooking',
    kind: 'class',
    hook: 'Pick herbs from the soil, then cook them minutes later.',
    summary:
      'Cycle or walk to Tra Que, harvest basil and greens, then cook cao lau or seasonal dishes in a garden kitchen.',
    durationLabel: 'Half day',
    priceFromUsd: 40,
    priceLabel: 'From $40',
    bestFor: ['Food', 'Nature'],
    vibe: 'Green fingers',
    image: img('hoi-an', 0),
  }),
  a({
    id: 'ha-an-bang-play',
    cityId: 'hoi-an',
    name: 'Sunset football & volleyball at An Bang',
    kind: 'beach',
    hook: 'Join locals and travelers for pickup games as the sky goes peach.',
    summary:
      'Walk onto An Bang in late afternoon — balls appear, teams form, and anyone can ask in. Swim after; beer optional.',
    durationLabel: '1–2 hours',
    priceFromUsd: 0,
    priceLabel: 'Free',
    bestFor: ['Active', 'Groups'],
    vibe: 'Salt & sunset',
    image: img('hoi-an', 4),
  }),
  a({
    id: 'ha-basket-boat',
    cityId: 'hoi-an',
    name: 'Spin the basket boat with a fisher',
    kind: 'adventure',
    hook: 'Round bamboo boat, wild spins, and your balance on trial.',
    summary:
      'Cam Thanh coconut village: fishers teach you to board and spin. Touristy, yes — but you are the one in the basket.',
    durationLabel: '45–60 min',
    priceFromUsd: 10,
    priceLabel: 'From $10',
    bestFor: ['Families', 'Fun'],
    vibe: 'Dizzy delight',
    image: img('hoi-an', 3),
  }),
  a({
    id: 'ha-folk-dance',
    cityId: 'hoi-an',
    name: 'Intro to Vietnamese folk dance',
    kind: 'dance',
    hook: 'Learn a few steps — fans, hats, or simple village patterns.',
    summary:
      'Cultural centers and some hotels offer short dance intros. No performance pressure — just movement and rhythm.',
    durationLabel: '1 hour',
    priceFromUsd: 12,
    priceLabel: 'From $12',
    bestFor: ['Culture', 'Groups'],
    vibe: 'Step & smile',
    image: img('hoi-an', 1),
  }),
  a({
    id: 'ha-thanh-ha-pottery',
    cityId: 'hoi-an',
    name: 'Throw clay at Thanh Ha',
    kind: 'craft',
    hook: 'Sit at the wheel — leave with a (wobbly) cup and wet hands.',
    summary:
      'Thanh Ha pottery village lets visitors try the wheel with a maker beside you. Messy, memorable, very tactile.',
    durationLabel: '1–1.5 hours',
    priceFromUsd: 12,
    priceLabel: 'From $12',
    bestFor: ['Families', 'Craft'],
    vibe: 'Clay under nails',
    image: img('hoi-an', 0),
  }),

  // ——— Da Nang ———
  a({
    id: 'dn-surf-my-khe',
    cityId: 'da-nang',
    name: 'Surf lesson at My Khe',
    kind: 'sport',
    hook: 'Soft waves, board under arm, coach in the water with you.',
    summary:
      'Beginner surf schools on My Khe teach pop-ups and ocean safety. Morning glass is best; rentals included on most lessons.',
    durationLabel: '1.5–2 hours',
    priceFromUsd: 35,
    priceLabel: 'From $35',
    bestFor: ['Active', 'Youthful'],
    vibe: 'Salt hair',
    image: img('da-nang', 0),
  }),
  a({
    id: 'dn-beach-football',
    cityId: 'da-nang',
    name: 'Beach football with the evening crowd',
    kind: 'beach',
    hook: 'Barefoot goals, local teens, and lights flicking on along the shore.',
    summary:
      'My Khe and nearby stretches host casual football after work. Wave, point at empty space, and you’re usually in.',
    durationLabel: '1 hour',
    priceFromUsd: 0,
    priceLabel: 'Free',
    bestFor: ['Active', 'Solo travelers'],
    vibe: 'Sand goals',
    image: img('da-nang', 1),
  }),
  a({
    id: 'dn-sunset-yoga',
    cityId: 'da-nang',
    name: 'Beach sunset yoga',
    kind: 'class',
    hook: 'Mats on sand, ocean breath, city skyline behind you.',
    summary:
      'Pop-up and studio-led sessions on the beach or nearby decks. All levels; bring water and arrive early for a spot.',
    durationLabel: '1 hour',
    priceFromUsd: 12,
    priceLabel: 'From $12',
    bestFor: ['Wellness', 'Couples'],
    vibe: 'Golden stretch',
    image: img('da-nang', 3),
  }),
  a({
    id: 'dn-han-kayak',
    cityId: 'da-nang',
    name: 'Kayak the Han at dusk',
    kind: 'adventure',
    hook: 'Paddle as Dragon Bridge lights wake up.',
    summary:
      'Guided kayak or SUP on the Han River in calm evening water. City skyline, bridge glow, gentle current.',
    durationLabel: '1.5 hours',
    priceFromUsd: 28,
    priceLabel: 'From $28',
    bestFor: ['Couples', 'Active'],
    vibe: 'City on water',
    image: img('da-nang', 2),
  }),

  // ——— Phong Nha ———
  a({
    id: 'pn-dark-cave-play',
    cityId: 'phong-nha',
    name: 'Dark Cave mud bath & river play',
    kind: 'adventure',
    hook: 'Zip, swim, smear mud, rinse in jade water — fully in it.',
    summary:
      'The Dark Cave day is participatory by design: kayak approach, optional zip, mud bath, and river swim. Bring a sense of humor.',
    durationLabel: 'Half day',
    priceFromUsd: 25,
    priceLabel: 'From $25',
    bestFor: ['Active', 'Groups'],
    vibe: 'Mud grin',
    image: img('phong-nha', 3),
  }),
  a({
    id: 'pn-farmstay-cook',
    cityId: 'phong-nha',
    name: 'Farmstay kitchen evening',
    kind: 'food',
    hook: 'Help cook farm vegetables and river fish under string lights.',
    summary:
      'Many Phong Nha farmstays invite guests into dinner prep. Chop, stir, taste — then eat what the garden gave that day.',
    durationLabel: '2 hours',
    priceFromUsd: 15,
    priceLabel: 'From $15',
    bestFor: ['Food', 'Slow travel'],
    vibe: 'Garden to plate',
    image: img('phong-nha', 2),
  }),
  a({
    id: 'pn-son-kayak',
    cityId: 'phong-nha',
    name: 'Kayak the Son River',
    kind: 'sport',
    hook: 'Limestone walls, your paddle, nowhere to hurry.',
    summary:
      'Rent or join a guided kayak on the Son. Flat water suited to beginners who want scenery without a cave ticket.',
    durationLabel: '2 hours',
    priceFromUsd: 20,
    priceLabel: 'From $20',
    bestFor: ['Nature', 'Couples'],
    vibe: 'Green silence',
    image: img('phong-nha', 0),
  }),

  // ——— HCMC ———
  a({
    id: 'hcmc-cook-class',
    cityId: 'hcmc',
    name: 'Saigon home cooking class',
    kind: 'class',
    hook: 'Market chaos first — then calm at a home stove.',
    summary:
      'Shop Ben Thanh or a local market, then cook pho, fresh rolls, or regional plates in a home kitchen. Eat family-style after.',
    durationLabel: '3–4 hours',
    priceFromUsd: 35,
    priceLabel: 'From $35',
    bestFor: ['Food lovers'],
    vibe: 'City heat & herbs',
    image: img('hcmc', 1),
  }),
  a({
    id: 'hcmc-dance-class',
    cityId: 'hcmc',
    name: 'Salsa or hip-hop drop-in class',
    kind: 'dance',
    hook: 'Saigon nights move — learn a combo and join the floor.',
    summary:
      'Studios in District 1–3 offer beginner drop-ins. English-friendly sessions are common; sneakers recommended.',
    durationLabel: '1–1.5 hours',
    priceFromUsd: 12,
    priceLabel: 'From $12',
    bestFor: ['Nightlife', 'Solo'],
    vibe: 'Bass & sweat',
    image: img('hcmc', 0),
  }),
  a({
    id: 'hcmc-karaoke',
    cityId: 'hcmc',
    name: 'Private-room karaoke with locals',
    kind: 'music',
    hook: 'Vinahey, ballads, and friends who will not let you sit out.',
    summary:
      'Karaoke is a Saigon social sport. Book a room, invite coworkers or new friends, and lean into the ridiculous.',
    durationLabel: '2 hours',
    priceFromUsd: 20,
    priceLabel: 'From $20 / group',
    bestFor: ['Groups', 'Night'],
    vibe: 'Neon courage',
    image: img('hcmc', 2),
  }),
  a({
    id: 'hcmc-moto-food',
    cityId: 'hcmc',
    name: 'Night motorbike food crawl',
    kind: 'food',
    hook: 'Alleyways, stools, and bites you would never find alone.',
    summary:
      'Ride with a guide through supper stalls and dessert carts. Standing snacks, sticky fingers, zero white-tablecloth energy.',
    durationLabel: '3 hours',
    priceFromUsd: 45,
    priceLabel: 'From $45',
    bestFor: ['Food', 'Adventure'],
    vibe: 'Exhaust & fish sauce',
    image: img('hcmc', 4),
  }),
  a({
    id: 'hcmc-boxing',
    cityId: 'hcmc',
    name: 'Muay Thai / boxing intro session',
    kind: 'sport',
    hook: 'Pads, footwork, and a coach who resets your stance.',
    summary:
      'Gyms across the city offer single intro sessions for travelers. Bring wrap-friendly hands and water.',
    durationLabel: '1 hour',
    priceFromUsd: 20,
    priceLabel: 'From $20',
    bestFor: ['Active', 'Solo'],
    vibe: 'Sharp & focused',
    image: img('hcmc', 3),
  }),

  // ——— Mekong ———
  a({
    id: 'mk-coconut-candy',
    cityId: 'mekong',
    name: 'Coconut candy workshop',
    kind: 'workshop',
    hook: 'Stir the pot, cut the squares, taste while warm.',
    summary:
      'Ben Tre and nearby islands run candy kitchens where visitors help stir and wrap. Sweet, sticky, photogenic.',
    durationLabel: '45–60 min',
    priceFromUsd: 5,
    priceLabel: 'From $5',
    bestFor: ['Families', 'Food'],
    vibe: 'Sticky sweet',
    image: img('mekong', 1),
  }),
  a({
    id: 'mk-homestay-fish',
    cityId: 'mekong',
    name: 'Cast a net with your host family',
    kind: 'community',
    hook: 'Riverbank mornings — learn the throw, laugh at the misses.',
    summary:
      'Homestays along the canals often let guests try simple fishing or garden work before a shared breakfast.',
    durationLabel: '1–2 hours',
    priceFromUsd: 10,
    priceLabel: 'From $10',
    bestFor: ['Families', 'Slow'],
    vibe: 'River hush',
    image: img('mekong', 0),
  }),
  a({
    id: 'mk-sampan-paddle',
    cityId: 'mekong',
    name: 'Paddle a sampan through the canals',
    kind: 'adventure',
    hook: 'You take an oar — water coconut groves slide past.',
    summary:
      'Beyond motorboat hops: short paddle stretches where you help row through quiet canals under green tunnels.',
    durationLabel: '1 hour',
    priceFromUsd: 12,
    priceLabel: 'From $12',
    bestFor: ['Nature', 'Couples'],
    vibe: 'Green tunnels',
    image: img('mekong', 2),
  }),
  a({
    id: 'mk-don-ca-tai-tu',
    cityId: 'mekong',
    name: 'Đờn ca tài tử music evening',
    kind: 'music',
    hook: 'Southern folk chamber music — tap along, then try a clap pattern.',
    summary:
      'Some homestays and cultural houses host tài tử sets. Intimate, improvisational, and welcoming to curious listeners who join the rhythm.',
    durationLabel: '1 hour',
    priceFromUsd: 8,
    priceLabel: 'From $8',
    bestFor: ['Culture'],
    vibe: 'Strings at dusk',
    image: img('mekong', 1),
  }),

  // ——— Phu Quoc ———
  a({
    id: 'pq-beach-volley',
    cityId: 'phu-quoc',
    name: 'Beach volleyball on Long Beach',
    kind: 'beach',
    hook: 'Sunset nets, barefoot digs, strangers who become teammates.',
    summary:
      'Hotels and open stretches of Long Beach set up nets most evenings. Ask to rotate in — cold drinks usually follow.',
    durationLabel: '1–2 hours',
    priceFromUsd: 0,
    priceLabel: 'Free',
    bestFor: ['Active', 'Groups'],
    vibe: 'Island easy',
    image: img('phu-quoc', 3),
  }),
  a({
    id: 'pq-seafood-cook',
    cityId: 'phu-quoc',
    name: 'Island seafood cooking class',
    kind: 'class',
    hook: 'Grill, steam, and plate the day’s catch with a local cook.',
    summary:
      'Morning market or pier stop, then cook prawns, fish, and island herbs. Eat facing the breeze if you’re lucky.',
    durationLabel: '3 hours',
    priceFromUsd: 40,
    priceLabel: 'From $40',
    bestFor: ['Food lovers', 'Couples'],
    vibe: 'Charcoal & lime',
    image: img('phu-quoc', 0),
  }),
  a({
    id: 'pq-sup-sunset',
    cityId: 'phu-quoc',
    name: 'Sunset stand-up paddle',
    kind: 'sport',
    hook: 'Flat water, peach sky, your board the only noise.',
    summary:
      'SUP rentals and short guided paddles along calmer west-coast water. Beginner boards available; golden hour is magic.',
    durationLabel: '1–1.5 hours',
    priceFromUsd: 25,
    priceLabel: 'From $25',
    bestFor: ['Couples', 'Wellness'],
    vibe: 'Liquid gold',
    image: img('phu-quoc', 1),
  }),
  a({
    id: 'pq-snorkel-guide',
    cityId: 'phu-quoc',
    name: 'Guided snorkel among the islets',
    kind: 'adventure',
    hook: 'Mask on — follow a guide to coral pockets and clear shallows.',
    summary:
      'Day trips to northern or southern islets include snorkel time in the water, not just boat views. Check seasonal clarity.',
    durationLabel: 'Half day',
    priceFromUsd: 35,
    priceLabel: 'From $35',
    bestFor: ['Nature', 'Families'],
    vibe: 'Blue below',
    image: img('phu-quoc', 2),
  }),
  a({
    id: 'pq-beach-drum',
    cityId: 'phu-quoc',
    name: 'Beach bonfire music jam',
    kind: 'music',
    hook: 'Guitars, shakers, and whoever shows up with a voice.',
    summary:
      'Some beach bars and traveler hangouts host informal jams. Bring a song, clap along, or just sit in the circle.',
    durationLabel: 'Evening',
    priceFromUsd: 0,
    priceLabel: 'Drink minimum / free',
    bestFor: ['Nightlife', 'Groups'],
    vibe: 'Embers & chorus',
    image: img('phu-quoc', 3),
  }),

  // ——— Nha Trang ———
  a({
    id: 'nt-island-snorkel',
    cityId: 'nha-trang',
    name: 'Guided snorkel off Hon Mun',
    kind: 'adventure',
    hook: 'Mask on, coral under you, boat waiting when you surface.',
    summary:
      'A small-group snorkel from a bay boat — fins, vest, and a guide pointing out what you would otherwise swim past.',
    durationLabel: 'Half day',
    priceFromUsd: 30,
    priceLabel: 'From $30',
    bestFor: ['Active', 'Families'],
    vibe: 'Salt and quiet water',
    image: img('nha-trang', 0),
  }),
  a({
    id: 'nt-mud-bath',
    cityId: 'nha-trang',
    name: 'Mineral mud bath afternoon',
    kind: 'workshop',
    hook: 'Warm mud, a soak, and a lazy hour that is the opposite of a temple.',
    summary:
      'Nha Trang’s mineral springs are a genuine rest day: cover, soak, rinse. Families and couples both use it as the unscheduled afternoon.',
    durationLabel: '2–3 hours',
    priceFromUsd: 18,
    priceLabel: 'From $18',
    bestFor: ['Couples', 'Reset'],
    vibe: 'Warm and slow',
    image: img('nha-trang', 1),
  }),
  a({
    id: 'nt-beach-volley',
    cityId: 'nha-trang',
    name: 'Promenade beach volleyball',
    kind: 'beach',
    hook: 'Join a pickup game as the heat drops off the sand.',
    summary:
      'Late afternoon nets along the central beach. Ask to join, miss a few, stay for a drink after.',
    durationLabel: '1 hour',
    priceFromUsd: 0,
    priceLabel: 'Free',
    bestFor: ['Friends', 'Active'],
    vibe: 'Sand on the shins',
    image: img('nha-trang', 0),
  }),
  a({
    id: 'nt-seafood-grill',
    cityId: 'nha-trang',
    name: 'Choose-your-catch grill night',
    kind: 'food',
    hook: 'Point at the tank, sit down, eat it grilled.',
    summary:
      'A guided seafood terrace: pick fish or shellfish, agree a price, eat with lime and chilli. The usable version of “Nha Trang seafood.”',
    durationLabel: '2 hours',
    priceFromUsd: 20,
    priceLabel: 'From $20',
    bestFor: ['Food lovers', 'Couples'],
    vibe: 'Steam and sea',
    image: img('nha-trang', 2),
  }),

  // ——— Da Lat ———
  a({
    id: 'dl-coffee-farm',
    cityId: 'da-lat',
    name: 'Highland coffee farm tasting',
    kind: 'class',
    hook: 'Walk the rows, roast a small batch, drink it while the air is still cool.',
    summary:
      'A working farm outside town: cherry to cup, with a tasting that actually explains why Da Lat coffee tastes different.',
    durationLabel: '3 hours',
    priceFromUsd: 22,
    priceLabel: 'From $22',
    bestFor: ['Food lovers', 'Slow travel'],
    vibe: 'Pine and roast',
    image: img('da-lat', 0),
  }),
  a({
    id: 'dl-canyoning',
    cityId: 'da-lat',
    name: 'Beginner canyoning day',
    kind: 'adventure',
    hook: 'Rappel a waterfall, jump a pool, get properly wet.',
    summary:
      'Guided canyon south of town for people who want altitude to feel like sport, not just scenery. Helmets, harness, and a dry bag for the camera.',
    durationLabel: 'Full day',
    priceFromUsd: 55,
    priceLabel: 'From $55',
    bestFor: ['Adventure', 'Friends'],
    vibe: 'Cold water, loud laugh',
    image: img('da-lat', 1),
  }),
  a({
    id: 'dl-market-cook',
    cityId: 'da-lat',
    name: 'Night-market cooking with a local kitchen',
    kind: 'food',
    hook: 'Shop Hoa Binh, then cook the highland dishes you just pointed at.',
    summary:
      'A small class that starts in the market — herbs, artichoke, pork — and ends at a shared table. Built for cool evenings.',
    durationLabel: '3 hours',
    priceFromUsd: 28,
    priceLabel: 'From $28',
    bestFor: ['Food lovers', 'Couples'],
    vibe: 'Steam in jumper weather',
    image: img('da-lat', 2),
  }),
  a({
    id: 'dl-lake-cycle',
    cityId: 'da-lat',
    name: 'Xuan Huong lakeside cycle',
    kind: 'sport',
    hook: 'A cheap bike, a cool loop, no traffic lights that matter.',
    summary:
      'Rent a bicycle near the lake and ride the flat loop. Stop for coffee whenever the light hits the water.',
    durationLabel: '1–2 hours',
    priceFromUsd: 5,
    priceLabel: 'From $5',
    bestFor: ['Slow travel', 'Couples'],
    vibe: 'Pedals and pine',
    image: img('da-lat', 0),
  }),
]

export type RankedActivity = CityActivity & { cityRank: number }

export type ActivityCityGroup = {
  cityId: string
  cityName: string
  activities: RankedActivity[]
}

const CITY_ORDER = [
  'hanoi',
  'ninh-binh',
  'ha-long',
  'ha-giang',
  'sapa',
  'hue',
  'hoi-an',
  'da-nang',
  'phong-nha',
  'hcmc',
  'mekong',
  'phu-quoc',
  'nha-trang',
  'da-lat',
]

const POPULARITY_TAG_WEIGHT: Record<ActivityPopularityTag, number> = {
  'Must do': 1,
  Popular: 2,
  Unique: 3,
  'Local favourite': 4,
  'Free time': 5,
}

export function rankCityActivities(items: CityActivity[]): RankedActivity[] {
  return [...items]
    .sort((a, b) => {
      const dw = POPULARITY_TAG_WEIGHT[a.popularityTag] - POPULARITY_TAG_WEIGHT[b.popularityTag]
      if (dw) return dw
      return (b.rating ?? 0) - (a.rating ?? 0)
    })
    .map((item, index) => ({ ...item, cityRank: index + 1 }))
}

export function activityCityIdForPlace(place: string): string | null {
  const s = place.trim().toLowerCase()
  if (!s) return null
  for (const a of CITY_ACTIVITIES) {
    if (a.cityId === s) return a.cityId
    if (a.cityName.toLowerCase() === s) return a.cityId
  }
  for (const a of CITY_ACTIVITIES) {
    const name = a.cityName.toLowerCase()
    if (s.includes(name) || name.includes(s)) return a.cityId
    if (s.replace(/-/g, ' ') === a.cityId.replace(/-/g, ' ')) return a.cityId
  }
  return null
}

export function groupActivitiesByCity(
  activities: CityActivity[] = CITY_ACTIVITIES,
  bagCityIds: Iterable<string> = [],
): ActivityCityGroup[] {
  const map = new Map<string, CityActivity[]>()
  for (const act of activities) {
    const list = map.get(act.cityId) ?? []
    list.push(act)
    map.set(act.cityId, list)
  }

  const bag = new Set(bagCityIds)
  const bagOrder = CITY_ORDER.filter((id) => bag.has(id) && map.has(id))
  const restOrder = CITY_ORDER.filter((id) => !bag.has(id) && map.has(id))
  const extra = [...map.keys()].filter((id) => !CITY_ORDER.includes(id))

  return [...bagOrder, ...restOrder, ...extra].map((cityId) => {
    const list = map.get(cityId)!
    return {
      cityId,
      cityName: list[0]?.cityName ?? cityId,
      activities: rankCityActivities(list),
    }
  })
}

export function activityKindFilters(activities: CityActivity[] = CITY_ACTIVITIES) {
  const counts = new Map<ActivityKind, number>()
  for (const a of activities) {
    counts.set(a.kind, (counts.get(a.kind) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([kind, count]) => ({
      id: kind,
      label: KIND_LABEL[kind],
      count,
    }))
}

export type ActivityDurationFilter = 'all' | 'short' | 'medium' | 'longer' | 'flexible'

function estimateActivityHours(label: string): number {
  const l = label.toLowerCase()
  if (l.includes('half day')) return 4
  if (l.includes('full day')) return 8
  if (l.includes('evening')) return 2.5
  const minRange = l.match(/(\d+)\s*[–-]\s*(\d+)\s*min/)
  if (minRange) return (Number(minRange[1]) + Number(minRange[2])) / 2 / 60
  const minOne = l.match(/(\d+)\s*min/)
  if (minOne) return Number(minOne[1]) / 60
  const hrRange = l.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs)/)
  if (hrRange) return (Number(hrRange[1]) + Number(hrRange[2])) / 2
  const hrOne = l.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs)/)
  if (hrOne) return Number(hrOne[1])
  return 2
}

export function activityDurationBand(
  activity: CityActivity,
): Exclude<ActivityDurationFilter, 'all'> {
  const hay = `${activity.kind} ${activity.durationLabel}`.toLowerCase()
  if (activity.kind === 'beach' || activity.kind === 'community' || hay.includes('evening')) {
    return 'flexible'
  }
  const hours = estimateActivityHours(activity.durationLabel)
  if (hours <= 1) return 'short'
  if (hours < 3) return 'medium'
  return 'longer'
}

export function listActivityCitiesByPopularity(activities: CityActivity[] = CITY_ACTIVITIES) {
  const map = new Map<string, { cityId: string; cityName: string; count: number }>()
  for (const a of activities) {
    const prev = map.get(a.cityId)
    map.set(a.cityId, {
      cityId: a.cityId,
      cityName: a.cityName,
      count: (prev?.count ?? 0) + 1,
    })
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.cityName.localeCompare(b.cityName))
}

export function getActivityById(id: string) {
  return CITY_ACTIVITIES.find((act) => act.id === id)
}

export function getActivityImages(activity: CityActivity) {
  const curated = ACTIVITY_IMAGES[activity.id] ?? []
  return withPhotoFallbacks(
    [...curated, ...activity.images, activity.image],
    `${activity.id} ${activity.name} ${activity.kind} ${activity.cityName} ${activity.hook}`,
  )
}
