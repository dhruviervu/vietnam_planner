import type { MonthId } from './months'
import { MONTH_PROFILES } from './months'
import {
  SEASON_MONTHS,
  monthToSeason,
  seasonsForMonths,
  type EventSeason,
} from './eventSeasons'
import { EVENT_MEDIA } from './eventMedia'

export type EventFact = {
  label: string
  value: string
}

export type SeasonalEventItem = {
  id: string
  name: string
  city: string
  region: string
  months: MonthId[]
  /** Seasonal sections this item appears in. Year-round items use only that bucket. */
  seasons: EventSeason[]
  description: string
  image: string
  images: string[]
  facts: EventFact[]
  tag: string
}

const cover = (id: string) => EVENT_MEDIA[id]?.[0] ?? ''
const gallery = (id: string) => EVENT_MEDIA[id] ?? []


export const SEASONAL_EVENTS: SeasonalEventItem[] = [
  {
    id: 'fest-tet',
    name: 'Lunar New Year',
    city: 'Hanoi',
    region: 'Nationwide',
    months: [1, 2],
    seasons: seasonsForMonths([1, 2]),
    tag: 'Culture',
    image: cover('fest-tet'),
    images: gallery('fest-tet'),
    facts: [
      { label: 'Also called', value: 'Vietnam’s biggest holiday — the start of the new year on the moon calendar' },
      { label: 'When', value: 'Late January or February (the date shifts a little each year)' },
      { label: 'Where', value: 'Nationwide — busiest in Hanoi’s Old Quarter and Ho Chi Minh City’s flower street' },
      { label: 'Status', value: 'The country’s largest public holiday; many shops and trains pause around peak days' },
      { label: 'Look for', value: 'Lucky-money envelopes, sticky rice cakes, peach blossom in the north and yellow apricot blossom in the south' },
    ],
    description:
      'Lunar New Year is Vietnam’s defining holiday: families reunite, ancestral altars fill with fruit and incense, and cities glow with peach blossom, kumquat trees, and lucky red. Dates shift each year across late January and February, but the feeling is constant — days of visiting, gift envelopes, lion dances, and fireworks.\n\nHanoi’s Old Quarter and Ho Chi Minh City’s Nguyen Hue flower street are the most intense public stages. Many shops, banks, and tour desks close for several days around the peak, and transport sells out weeks ahead. Travellers who plan stays and trains early get the spectacle; those who do not can find shuttered streets and fully booked hotels.\n\nAfter the first days, countryside roads quieten and temple courtyards reopen. It is the one winter window when Vietnam feels paused for family — then the country switches back on, still dressed for the new year.',
  },
  {
    id: 'fest-hoian-lantern',
    name: 'Hoi An Lantern Festival',
    city: 'Hoi An',
    region: 'Quang Nam',
    months: [1, 2, 3, 4, 8, 9, 10, 11, 12],
    seasons: ['year-round'],
    tag: 'Romantic',
    image: cover('fest-hoian-lantern'),
    images: gallery('fest-hoian-lantern'),
    facts: [
      { label: 'When', value: 'Every full-moon night (the calendar date moves through the year)' },
      { label: 'Where', value: 'Hoi An Ancient Town and the Thu Bon riverfront, including the Japanese Covered Bridge' },
      { label: 'Status', value: 'Monthly town rite inside a UNESCO World Heritage old town' },
      { label: 'Look for', value: 'Silk lanterns, dimmed street lights, and floating candle boats on the river' },
    ],
    description:
      'On every full-moon night, Hoi An dims electric lights and the old town becomes a river of silk lanterns. Shopfronts glow yellow and red, candle boats drift on the Thu Bon, and the Japanese Covered Bridge sits in a pool of reflected colour. It is the town’s signature evening — part ritual, part street theatre.\n\nThe tradition tracks the full moon, so the date moves through the civil calendar. Dry-season months (roughly autumn through spring) are the most reliable for walking the pedestrian core without rain. August still holds lantern nights, but showers can interrupt the riverfront.\n\nArrive before dusk if you want space on the bridge and the bank. Street food, folk music, and tailor-lit alleys run late; the floating candles are the moment most visitors come for, and the one that photographs as “Hoi An” the world over.',
  },
  {
    id: 'fest-perfume-pagoda',
    name: 'Perfume Pagoda Festival',
    city: 'Hanoi',
    region: 'Ha Noi Province',
    months: [2, 3],
    seasons: seasonsForMonths([2, 3]),
    tag: 'Spiritual',
    image: cover('fest-perfume-pagoda'),
    images: gallery('fest-perfume-pagoda'),
    facts: [
      { label: 'Also called', value: 'Perfume Pagoda Festival' },
      { label: 'When', value: 'Usually February and March' },
      { label: 'Where', value: 'Huong Tich cave and mountain pagodas, My Duc, Hanoi Province' },
      { label: 'How', value: 'Boat on Yen Stream, then walk or cable car to the cave shrine' },
      { label: 'Note', value: 'Northern Vietnam’s largest Buddhist pilgrimage; modest dress at the shrines' },
    ],
    description:
      'Through February and March, pilgrims leave Hanoi for the limestone hills around the Perfume Pagoda. The day is a sequence: a boat along Yen Stream under karst cliffs, a walk or cable car toward mountain pagodas, and finally Huong Tich Cave — the inner shrine that gives the festival its spiritual centre.\n\nIt is one of northern Vietnam’s oldest Buddhist gatherings, mixing devotion, picnic energy, and landscape. Peak weekends are crowded; weekdays still feel like a countryside pilgrimage rather than a sightseeing queue. Modest dress is expected at the shrines.\n\nFebruary and March sit at the heart of the season, overlapping the tail of Lunar New Year and the start of spring. Combine it with a Hanoi stay: the valley is a long day trip, and the river light is best when the winter mist lifts.',
  },
  {
    id: 'fest-lim',
    name: 'Lim Festival',
    city: 'Hanoi',
    region: 'Bac Ninh',
    months: [2, 3],
    seasons: seasonsForMonths([2, 3]),
    tag: 'Culture',
    image: cover('fest-lim'),
    images: gallery('fest-lim'),
    facts: [
      { label: 'When', value: 'Usually February or early March' },
      { label: 'Where', value: 'Lim village, Bac Ninh — a short trip north of Hanoi' },
      { label: 'Heritage', value: 'Call-and-response folk singing, UNESCO Intangible Cultural Heritage (2009)' },
      { label: 'Look for', value: 'Paired singers in traditional dress exchanging verses outdoors' },
    ],
    description:
      'Lim Festival, usually in February or early March in Bac Ninh, is the public home of northern call-and-response folk singing from the Red River Delta. Costumed women and men face each other across yards and riverbanks, exchanging verses that were once courtship, now heritage.\n\nProcessions, traditional games, and village stages sit a short journey from Hanoi, which is why the capital is the practical base. The singing is UNESCO-recognised; hearing it outdoors, not in a theatre, is the point of travelling for Lim rather than booking a city show.\n\nDates cluster in February and early March. Go for the afternoon into evening if you want both the temple rites and the lingering duets as the light drops.',
  },
  {
    id: 'fest-hung-kings',
    name: "Hung Kings Festival",
    city: 'Hanoi',
    region: 'Phu Tho · Nationwide',
    months: [4],
    seasons: seasonsForMonths([4]),
    tag: 'Heritage',
    image: cover('fest-hung-kings'),
    images: gallery('fest-hung-kings'),
    facts: [
      { label: 'What', value: 'National day honouring Vietnam’s legendary founding kings' },
      { label: 'When', value: 'Usually April — a national public holiday' },
      { label: 'Where', value: 'Hung Temple complex, Phu Tho; observed nationwide' },
      { label: 'Heritage', value: 'Worship of Hung Kings listed by UNESCO as intangible heritage (2012)' },
    ],
    description:
      'Each April, Vietnam honours the legendary Hung Kings — the ancestral founders of the nation. The ceremonial heart is the Hung Temple complex in Phu Tho, where incense, processions, and state rites draw pilgrims from across the country. It is a public holiday, so cities slow and families travel.\n\nFor visitors, April is when this heritage layer is most visible: flags, offerings, and a nationwide pause that is cultural rather than commercial. Hanoi is the usual staging point for the temple hills to the northwest.\n\nExpect busy transport around the holiday itself. The meaning is ancestral rather than spectacular pyrotechnics — a spring day when origin stories, not beaches, organise the calendar.',
  },
  {
    id: 'fest-giong',
    name: 'Giong Festival',
    city: 'Hanoi',
    region: 'Eastern Hanoi',
    months: [4, 5],
    seasons: seasonsForMonths([4, 5]),
    tag: 'Heritage',
    image: cover('fest-giong'),
    images: gallery('fest-giong'),
    facts: [
      { label: 'When', value: 'Usually April or May, at Phu Dong and Soc temples' },
      { label: 'Where', value: 'Phu Dong and Soc temples on Hanoi’s eastern fringe (Gia Lam / Soc Son)' },
      { label: 'Heritage', value: 'UNESCO Intangible Cultural Heritage (2010)' },
      { label: 'Story', value: 'Commemorates Saint Giong, the boy hero of Vietnamese legend' },
    ],
    description:
      'Giong Festival commemorates Saint Giong, the mythical boy hero who grew into a giant to defend the kingdom. At Phu Dong and Soc temples on Hanoi’s eastern fringe, the story is replayed in processions, flag dances, opera-like re-enactments, and village pageantry that UNESCO lists as intangible heritage.\n\nSpring dates fall in April and May. The mood is martial and folkloric rather than solemn: elephants in some tellings, bamboo in others, always a crowd in festival colour on the temple grounds.\n\nIt is one of the most visual heritage days within easy reach of the capital. Pair it with an Old Quarter stay; the temples are a dedicated half-day, not a detour you squeeze between coffee stops.',
  },
  {
    id: 'fest-ba-chua-xu',
    name: 'Lady of the Realm Festival',
    city: 'Can Tho',
    region: 'Chau Doc · An Giang',
    months: [4, 5],
    seasons: seasonsForMonths([4, 5]),
    tag: 'Spiritual',
    image: cover('fest-ba-chua-xu'),
    images: gallery('fest-ba-chua-xu'),
    facts: [
      { label: 'When', value: 'Usually April or May, several days of pilgrimage' },
      { label: 'Where', value: 'Lady of the Realm Temple on Sam Mountain, Chau Doc, An Giang' },
      { label: 'Scale', value: 'The Mekong Delta’s largest temple festival' },
      { label: 'Base', value: 'Chau Doc is the stage; Can Tho is the usual regional hub' },
    ],
    description:
      'In April or May, pilgrims pack Sam Mountain above Chau Doc to honour the Lady of the Realm. For several days the temple complex runs on incense, offerings, night vigils, and a density of faith that makes this the Mekong Delta’s largest spiritual gathering.\n\nApril and May are the civil-calendar window. Can Tho is the regional hub; Chau Doc is the actual stage. Dress modestly, expect crowds, and treat it as a living pilgrimage rather than a photo stop.\n\nThe delta around the mountain is orchard and border-trade country. Festival days add a layer of Vietnamese-Khmer-Cham spiritual mix that you will not get from a floating-market morning alone.',
  },
  {
    id: 'fest-khau-vai',
    name: 'Khau Vai Love Market',
    city: 'Sapa',
    region: 'Ha Giang',
    months: [4, 5],
    seasons: seasonsForMonths([4, 5]),
    tag: 'Romantic',
    image: cover('fest-khau-vai'),
    images: gallery('fest-khau-vai'),
    facts: [
      { label: 'When', value: 'Usually late April or May — one weekend a year' },
      { label: 'Where', value: 'Khau Vai village, Meo Vac district, Ha Giang' },
      { label: 'Who', value: 'Hmong, Dao and neighbouring highland communities' },
      { label: 'Note', value: 'A once-a-year gathering; photography should stay respectful of local custom' },
    ],
    description:
      'Once a year, Khau Vai village in Ha Giang hosts a gathering where former lovers may meet in the open — spouses traditionally wait elsewhere — while music, costume, and hill-market trade fill the slopes. It is a Hmong and Dao tradition of memory and matchmaking, not a staged “show” for the camera, though travellers now come for both.\n\nThe market falls in late spring (April or May). Sapa or Ha Giang town is the practical base; the last stretch is mountain road. Go with a local guide if you do not know the route, and keep photography respectful.\n\nSpring mist and new green suit the setting. This is highland culture at its most specific — a single day that does not repeat if you miss the date.',
  },
  {
    id: 'fest-danang-fireworks',
    name: 'Da Nang International Fireworks Festival',
    city: 'Da Nang',
    region: 'Central Coast',
    months: [6, 7],
    seasons: seasonsForMonths([6, 7]),
    tag: 'Culture',
    image: cover('fest-danang-fireworks'),
    images: gallery('fest-danang-fireworks'),
    facts: [
      { label: 'Also called', value: 'DIFF — Da Nang International Fireworks Festival' },
      { label: 'When', value: 'Typically several weekend nights in June–July (dates announced each year)' },
      { label: 'Where', value: 'Han River waterfront, Dragon Bridge, and viewing from both banks' },
      { label: 'What', value: 'International teams compete with music-synced pyrotechnics over the river' },
    ],
    description:
      'Each summer, teams from around the world compete over the Han River with choreographed pyrotechnics set to music. Bridges, the dragon-spanned waterfront, and My Khe beachfront become viewing decks. The festival typically runs across several weekends in June and July rather than a single night.\n\nDa Nang in summer is hot and shower-prone; fireworks nights still draw huge crowds because the river is the city’s living room. Arrive early for a rail or bank spot. Hotels on the river and in An Thuong book up on display dates.\n\nIt is the clearest “summer event” on Vietnam’s visitor calendar: not a temple rite, but a civic spectacle that gives the wet season a reason to stay out after dark.',
  },
  {
    id: 'fest-nhatrang-sea',
    name: 'Nha Trang Sea Festival',
    city: 'Nha Trang',
    region: 'Khanh Hoa Coast',
    months: [6],
    seasons: seasonsForMonths([6]),
    tag: 'Culture',
    image: cover('fest-nhatrang-sea'),
    images: gallery('fest-nhatrang-sea'),
    facts: [
      { label: 'When', value: 'June — Nha Trang’s civic summer festival week' },
      { label: 'Where', value: 'Nha Trang Bay, Tran Phu promenade, and beachfront stages' },
      { label: 'Look for', value: 'Parades, beach sports, night programmes, and extra hotel demand on the bay' },
    ],
    description:
      'Nha Trang’s Sea Festival is the south-central coast’s summer civic party: beach sports, street performances, parades, and night programmes along the bay. Timing clusters in June, when the city leans into its identity as a resort strip rather than a transit stop.\n\nThe beachfront and Tran Phu promenade are the public stages. Expect louder evenings, more stalls, and a visitor mix of domestic holiday crowds and regional tour groups. It is less ceremonial than Wandering Souls Festival or Kate, more open-air city festival.\n\nIf you already planned Nha Trang for islands and Po Nagar, festival week adds atmosphere — and hotel demand. Book the bay side if you want to walk out of the lobby into the programme rather than taxi across town.',
  },
  {
    id: 'fest-vu-lan',
    name: 'Wandering Souls Festival',
    city: 'Hoi An',
    region: 'Nationwide',
    months: [8],
    seasons: seasonsForMonths([8]),
    tag: 'Spiritual',
    image: cover('fest-vu-lan'),
    images: gallery('fest-vu-lan'),
    facts: [
      { label: 'When', value: 'Usually August' },
      { label: 'Where', value: 'Nationwide pagodas; travellers often see it in Hoi An and Hanoi' },
      { label: 'Custom', value: 'Red rose if one’s mother is living; white rose if she has passed' },
      { label: 'Also known as', value: 'A Buddhist remembrance night for parents and ancestors' },
    ],
    description:
      'Usually in August, the Wandering Souls Festival fills temples and rivers with offerings. Families present food and incense to ancestors; many wear a red rose if their mother is living, a white rose if she has passed — a Buddhist custom that is quietly moving if you know to look for it.\n\nCeremonies are nationwide; Hoi An’s river lanterns and Hanoi’s temple yards are the most visited by travellers. It is solemn compared with Lunar New Year or Mid-Autumn — closer to remembrance than to a street party.\n\nDress modestly at pagodas, keep voices down, and treat floating lights as ritual, not decoration. This is the wet season’s spiritual night, not a fireworks show.'
  },
  {
    id: 'fest-mid-autumn',
    name: 'Mid-Autumn Festival',
    city: 'Hanoi',
    region: 'Nationwide',
    months: [9, 10],
    seasons: seasonsForMonths([9, 10]),
    tag: 'Family',
    image: cover('fest-mid-autumn'),
    images: gallery('fest-mid-autumn'),
    facts: [
      { label: 'What', value: 'Children’s lantern festival under the harvest moon' },
      { label: 'When', value: 'Usually September, sometimes early October' },
      { label: 'Where', value: 'Nationwide — Hang Ma Street in Hanoi and Hoi An lantern streets are famous' },
      { label: 'Look for', value: 'Star lanterns, lion dances, toys, and mooncakes' },
    ],
    description:
      'Mid-Autumn is the children’s festival of the harvest moon: star-shaped lanterns, lion dances, toys, and mooncakes shared among families and offices. Hanoi’s old streets, Hoi An’s alleys, and Ho Chi Minh City neighbourhoods all glow. It usually falls in September, sometimes early October.\n\nBy day the story is bakeries and gift tins; by night it is parades of kids and a full moon over still-humid cities as autumn weather begins to settle. It is joyful and loud, unlike Lunar New Year which is quieter and more family-closed.\n\nTravellers get the lanterns without Lunar New Year shop closures. Hang around Hoan Kiem Lake, the Hoi An river, or any residential market street after dusk.'
  },
  {
    id: 'fest-kate',
    name: 'Kate Festival',
    city: 'Nha Trang',
    region: 'Ninh Thuan · Cham',
    months: [10],
    seasons: seasonsForMonths([10]),
    tag: 'Culture',
    image: cover('fest-kate'),
    images: gallery('fest-kate'),
    facts: [
      { label: 'Who', value: 'The principal festival of the Cham community in Ninh Thuan' },
      { label: 'When', value: 'Usually October, at Cham towers such as Po Klong Garai and Po Re Me' },
      { label: 'Base', value: 'Nha Trang or Phan Rang; towers sit inland from the coast' },
      { label: 'Look for', value: 'Priests, processions, dance, and living Cham Hindu-heritage rites' },
    ],
    description:
      'Kate is the principal festival of the Cham community in Ninh Thuan, held at brick towers such as Po Klong Garai and Po Re Me. Priests, dancers in traditional dress, processions, and music honour ancestors and the old Hindu-Champa religious world that still shapes this stretch of coast.\n\nOctober is the month. Nha Trang is the visitor base; the towers sit inland toward Phan Rang. This is not a beach party grafted onto Cham culture — it is a living minority rite that happens to fall when central-coast weather is improving.\n\nGo for the ceremony hours, dress respectfully, and leave space for the community. Kate is one of the few calendar moments when Vietnam’s Hindu-influenced south-central heritage is fully public.',
  },
  {
    id: 'fest-ooc-om-boc',
    name: 'Khmer Moon Festival',
    city: 'Can Tho',
    region: 'Khmer · Mekong Delta',
    months: [11],
    seasons: seasonsForMonths([11]),
    tag: 'Culture',
    image: cover('fest-ooc-om-boc'),
    images: gallery('fest-ooc-om-boc'),
    facts: [
      { label: 'Who', value: 'Khmer communities of the Mekong Delta' },
      { label: 'When', value: 'November — end of the rainy season / moon festival' },
      { label: 'Where', value: 'Soc Trang and Tra Vinh host the liveliest days; Can Tho is the usual hub' },
      { label: 'Look for', value: 'Ngo boat races, pagoda gatherings, and Apsara dance' },
    ],
    description:
      'Khmer Moon Festival marks the end of the rainy season with moon worship, pagoda gatherings, dance, and — most visibly — boat races on delta waterways. Soc Trang and Tra Vinh provinces host the liveliest days; Can Tho is the practical city for travellers stitching this onto a Mekong stay.\n\nNovember is the month, sitting at the start of Vietnam’s dry-season winter window. The mood is communal and distinctly southern: Khmer Theravada pagodas, not the northern lunar-new-year script.\n\nIf your November route already includes the delta, time a night for the races and moon rites. It is the winter calendar’s least-touristed major festival, and the one that reminds you the south is not only Vietnamese Kinh culture.',
  },
  {
    id: 'perf-water-puppet',
    name: 'Water Puppet Theatre',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: cover('perf-water-puppet'),
    images: gallery('perf-water-puppet'),
    facts: [
      { label: 'What', value: 'Water puppetry from the Red River Delta' },
      { label: 'Where', value: 'Thang Long Water Puppet Theatre on Hoan Kiem Lake, Hanoi (best-known stage)' },
      { label: 'When', value: 'Year-round indoor shows; book ahead for evening slots' },
      { label: 'Heritage', value: 'Village form centuries old; wooden figures worked from behind a pool' },
    ],
    description:
      'Water puppetry was born in the flooded rice fields of the Red River Delta: wooden figures worked from behind a waist-deep pool, to live music, telling village legends, harvest jokes, and dragon dances. Thang Long Water Puppet Theatre on Hoan Kiem is the famous indoor stage; the form itself is older than the tourist ticket.\n\nShows run year-round, which is why this belongs with cultural performances rather than a festival month. Wet evenings in Hanoi are when an indoor hour of puppets-and-cheo-adjacent music makes the most sense; dry evenings you walk the lake after the curtain.\n\nBook the earlier show if you want English-friendly programmes and a seat. It is short, unique to the north, and the single easiest “only in Vietnam” performance to fit into any itinerary.',
  },
  {
    id: 'perf-ca-tru',
    name: 'Northern Chamber Singing',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: cover('perf-ca-tru'),
    images: gallery('perf-ca-tru'),
    facts: [
      { label: 'What', value: 'Northern chamber singing — vocalist, lute, and praise drum' },
      { label: 'Heritage', value: 'UNESCO Intangible Cultural Heritage (2009), listed as in need of safeguarding' },
      { label: 'Where', value: 'Small Hanoi clubs and heritage houses — check weekly listings, not a nightly show' },
      { label: 'When', value: 'Year-round by booking, not a festival date' },
    ],
    description:
      'Northern chamber singing is for a small room: a female vocalist, a lute, and a praise-drum, with poetry that once entertained scholars and mandarins. UNESCO lists it as endangered heritage. Hanoi clubs and dedicated houses still hold intimate sets — not nightly stadium folklore, but scheduled evenings you look up in advance.\n\nBecause it is indoor, it sits in the year-round column. It rewards sitting still. This is not a festival crowd; it is a listening room.\n\nAsk your hotel or a heritage venue for the week’s chamber-singing night. Dress is ordinary-smart; applause follows the drum’s cues more than a pop chorus.'
  },
  {
    id: 'perf-nha-nhac',
    name: 'Hue Court Music',
    city: 'Hue',
    region: 'Imperial capital',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: cover('perf-nha-nhac'),
    images: gallery('perf-nha-nhac'),
    facts: [
      { label: 'What', value: 'Ceremonial music of the old royal court in Hue' },
      { label: 'Heritage', value: 'UNESCO Intangible Cultural Heritage (proclaimed 2003; inscribed 2008)' },
      { label: 'Where', value: 'Hue Imperial City and Duyet Thi Duong Royal Theatre' },
      { label: 'When', value: 'Year-round visitor programmes inside the citadel' },
    ],
    description:
      'Hue court music is the ceremonial sound of the old royal court: oboes, drums, two-string fiddles, and ensembles that once marked rites inside Hue’s citadel. UNESCO recognises it as a masterpiece of intangible heritage. Today you hear it in the imperial enclosure, at the Royal Theatre, and at heritage programmes tied to the palaces.\n\nPerformances run through the year for visitors and for ceremonial calendars. Hue weather changes; the music does not. A citadel ticket plus a theatre slot is the straightforward way to hear it rather than hoping a courtyard rehearsal is on.\n\nThis is the sound of the old capital — formal, measured, and unlike Hanoi’s folk opera or southern reformed opera. Give it a seated hour, not a walk-by.'
  },
  {
    id: 'perf-cai-luong',
    name: 'Southern Reformed Opera',
    city: 'Ho Chi Minh City',
    region: 'Southern Vietnam',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: cover('perf-cai-luong'),
    images: gallery('perf-cai-luong'),
    facts: [
      { label: 'What', value: 'Southern reformed opera — spoken drama, guitar, and sung melody' },
      { label: 'Where', value: 'Ho Chi Minh City theatres and cultural houses (bills change weekly)' },
      { label: 'When', value: 'Year-round stage tradition of the south' },
      { label: 'Note', value: 'A short plot summary helps if you do not speak the language; gesture and music still carry the story' },
    ],
    description:
      'Southern reformed opera is spoken drama, plucked guitar, and aching vocals that took Mekong storytelling into twentieth-century theatres. Ho Chi Minh City still mounts productions; television and YouTube keep the stars famous even when tourist itineraries skip the playhouse.\n\nShows are year-round. You do not need the language to feel the melodrama — costumes, gesture, and the guitar’s slide carry a lot — but a synopsis helps. Theatres and cultural houses post weekly bills.\n\nIf your trip is Ho Chi Minh City-heavy, one evening of this opera balances street food and rooftop bars with the south’s own stage tradition.'
  },
  {
    id: 'perf-hat-cheo',
    name: 'Northern Folk Opera',
    city: 'Hanoi',
    region: 'Red River Delta',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: cover('perf-hat-cheo'),
    images: gallery('perf-hat-cheo'),
    facts: [
      { label: 'What', value: 'Northern folk opera from Red River Delta villages' },
      { label: 'Where', value: 'Hanoi theatres; some programmes sit near the water-puppet circuit' },
      { label: 'When', value: 'Year-round city stages' },
      { label: 'Tone', value: 'Satire and stock characters — earthier than Hue court music' },
    ],
    description:
      'Northern folk opera comes from the delta villages: satire, stock characters, percussion, and a chorus that talks back to the scene. It is earthier than Hue court music and older in village form than southern reformed opera. Hanoi theatres and some water-puppet programmes share the same cultural neighbourhood.\n\nYou can find it on regular city stages throughout the year. It is comic and moral by turns — farmers, officials, tricksters — and was built for people who already knew the jokes.\n\nTreat it as a night out in the capital, not a festival date. Combined with water puppets, it is the north’s folk-performance pair: one on water, one on boards.'
  },
]

export function isYearRoundEvent(item: SeasonalEventItem): boolean {
  return item.seasons.includes('year-round')
}

export function homeSeason(item: SeasonalEventItem): EventSeason {
  if (isYearRoundEvent(item)) return 'year-round'
  return monthToSeason(item.months[0])
}

export function getEventsForSeason(season: EventSeason): SeasonalEventItem[] {
  return getAllEventsByPopularity().filter((item) => homeSeason(item) === season)
}

const EVENT_DISPLAY_ORDER = [
  'fest-tet',
  'fest-mid-autumn',
  'fest-hung-kings',
  'fest-hoian-lantern',
  'fest-vu-lan',
  'fest-perfume-pagoda',
  'fest-danang-fireworks',
  'fest-ba-chua-xu',
  'perf-water-puppet',
  'fest-lim',
  'fest-giong',
  'fest-nhatrang-sea',
  'perf-nha-nhac',
  'perf-cai-luong',
  'fest-khau-vai',
  'fest-kate',
  'fest-ooc-om-boc',
  'perf-hat-cheo',
  'perf-ca-tru',
] as const

export function getAllEventsByPopularity(): SeasonalEventItem[] {
  const byId = new Map(SEASONAL_EVENTS.map((item) => [item.id, item]))
  const ordered = EVENT_DISPLAY_ORDER.map((id) => byId.get(id)).filter(
    (item): item is SeasonalEventItem => Boolean(item),
  )
  const leftovers = SEASONAL_EVENTS.filter((item) => !EVENT_DISPLAY_ORDER.includes(item.id as (typeof EVENT_DISPLAY_ORDER)[number]))
  return [...ordered, ...leftovers]
}

export function alsoInMonthNames(item: SeasonalEventItem): string[] {
  if (isYearRoundEvent(item) || item.months.length === 0) return []
  const home = monthToSeason(item.months[0])
  const names: string[] = []
  for (const month of item.months) {
    if (monthToSeason(month) === home) continue
    const name = MONTH_PROFILES[month - 1]?.name
    if (name && !names.includes(name)) names.push(name)
  }
  return names
}

export function citySlug(city: string): string {
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function eventCityPath(city: string): string {
  return `/when-to-go/discover/city/${citySlug(city)}`
}

export function eventGuidePath(id: string): string {
  return `/when-to-go/discover/event/${id}`
}

export function eventTagPath(tag: string): string {
  return `/when-to-go/discover/tag/${citySlug(tag)}`
}

export function getEventsForTag(tag: string): SeasonalEventItem[] {
  return SEASONAL_EVENTS.filter((item) => item.tag === tag).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export function getTagBySlug(slug: string): string | undefined {
  const tags = [...new Set(SEASONAL_EVENTS.map((item) => item.tag))]
  return tags.find((tag) => citySlug(tag) === slug)
}

export function getEventById(id: string): SeasonalEventItem | undefined {
  return SEASONAL_EVENTS.find((item) => item.id === id)
}

export function getEventCities(): string[] {
  const seen = new Set<string>()
  const cities: string[] = []
  for (const item of SEASONAL_EVENTS) {
    if (seen.has(item.city)) continue
    seen.add(item.city)
    cities.push(item.city)
  }
  return cities
}

export function getCityBySlug(slug: string): string | undefined {
  return getEventCities().find((city) => citySlug(city) === slug)
}

export function getEventsForCity(city: string): SeasonalEventItem[] {
  return SEASONAL_EVENTS.filter((item) => item.city === city)
}

export function eventBlurb(item: SeasonalEventItem): string {
  return item.description.split('\n\n').filter(Boolean)[0] ?? ''
}

export function eventMonthPath(month: MonthId | 'year-round'): string {
  return `/when-to-go/discover/month/${month}`
}

export function nextMonthId(month: MonthId): MonthId {
  return (month === 12 ? 1 : month + 1) as MonthId
}

export function monthFullName(month: MonthId): string {
  return MONTH_PROFILES[month - 1]?.name ?? String(month)
}

export function getEventsForMonth(month: MonthId): SeasonalEventItem[] {
  return SEASONAL_EVENTS.filter((item) => {
    if (isYearRoundEvent(item) && item.tag === 'Performance') return false
    return item.months.includes(month)
  }).sort((a, b) => a.name.localeCompare(b.name))
}

export function getYearRoundEvents(): SeasonalEventItem[] {
  return SEASONAL_EVENTS.filter(isYearRoundEvent).sort((a, b) => a.name.localeCompare(b.name))
}

export function moreEventsLike(item: SeasonalEventItem, limit = 6): SeasonalEventItem[] {
  const sameCity = SEASONAL_EVENTS.filter((e) => e.id !== item.id && e.city === item.city)
  const rest = SEASONAL_EVENTS.filter(
    (e) => e.id !== item.id && e.city !== item.city,
  )
  return [...sameCity, ...rest].slice(0, limit)
}

export function cityCoverImage(city: string): string {
  return getEventsForCity(city)[0]?.image ?? SEASONAL_EVENTS[0].image
}

export function monthCoverImage(month: MonthId): string {
  return getEventsForMonth(month)[0]?.image ?? SEASONAL_EVENTS[0].image
}
