import type { MonthId } from './months'
import {
  SEASON_MONTHS,
  seasonsForMonths,
  type EventSeason,
} from './eventSeasons'

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
  tag: string
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`

export const SEASONAL_EVENTS: SeasonalEventItem[] = [
  {
    id: 'fest-tet',
    name: 'Tết Nguyên Đán (Lunar New Year)',
    city: 'Hanoi',
    region: 'Nationwide',
    months: [1, 2],
    seasons: seasonsForMonths([1, 2]),
    tag: 'Culture',
    image: u('photo-1547981609-4b1e89e8c126'),
    description:
      'Tết is Vietnam’s defining holiday: the lunar new year when families reunite, ancestral altars fill with fruit and incense, and cities glow with peach blossom, kumquat trees, and lucky red. Dates shift each year across late January and February, but the feeling is constant — days of visiting, gift envelopes, lion dances, and fireworks.\n\nHanoi’s Old Quarter and Ho Chi Minh City’s Nguyen Hue flower street are the most intense public stages. Many shops, banks, and tour desks close for several days around the peak, and transport sells out weeks ahead. Travellers who plan stays and trains early get the spectacle; those who do not can find shuttered streets and fully booked hotels.\n\nAfter the first days, countryside roads quieten and temple courtyards reopen. It is the one winter window when Vietnam feels paused for family — then the country switches back on, still dressed for the new year.',
  },
  {
    id: 'fest-hoian-lantern',
    name: 'Hoi An Lantern Festival',
    city: 'Hoi An',
    region: 'Quang Nam',
    months: [1, 2, 3, 4, 8, 9, 10, 11, 12],
    seasons: seasonsForMonths([1, 2, 3, 4, 8, 9, 10, 11, 12]),
    tag: 'Romantic',
    image: u('photo-1559592413-7cec4d0cae2b'),
    description:
      'On the 14th night of each lunar month, Hoi An dims electric lights and the old town becomes a river of silk lanterns. Shopfronts glow yellow and red, candle boats drift on the Thu Bon, and the Japanese Covered Bridge sits in a pool of reflected colour. It is the town’s signature evening — part ritual, part street theatre.\n\nThe tradition tracks the full moon, so the date moves through the civil calendar. Dry-season months (roughly autumn through spring) are the most reliable for walking the pedestrian core without rain. August still holds lantern nights, but showers can interrupt the riverfront.\n\nArrive before dusk if you want space on the bridge and the bank. Street food, folk music, and tailor-lit alleys run late; the floating candles are the moment most visitors come for, and the one that photographs as “Hoi An” the world over.',
  },
  {
    id: 'fest-perfume-pagoda',
    name: 'Perfume Pagoda Festival',
    city: 'Hanoi',
    region: 'Hà Nội Province',
    months: [2, 3],
    seasons: seasonsForMonths([2, 3]),
    tag: 'Spiritual',
    image: u('photo-1528183429752-a97d0bf99b5a'),
    description:
      'From the first through the third lunar months, pilgrims leave Hanoi for the Huong Son limestone massif. The day is a sequence: a boat along Yen Stream under karst cliffs, a walk or cable car toward mountain pagodas, and finally Huong Tich Cave — the “inner palace” shrine that gives the festival its spiritual centre.\n\nIt is one of northern Vietnam’s oldest Buddhist gatherings, mixing devotion, picnic energy, and landscape. Peak weekends are crowded; weekdays still feel like a countryside pilgrimage rather than a sightseeing queue. Modest dress is expected at the shrines.\n\nFebruary and March sit at the heart of the season, overlapping Tết’s tail and spring’s start. Combine it with a Hanoi stay: the valley is a long day trip, and the river light is best when the winter mist lifts.',
  },
  {
    id: 'fest-lim',
    name: 'Lim Festival',
    city: 'Hanoi',
    region: 'Bắc Ninh',
    months: [2, 3],
    seasons: seasonsForMonths([2, 3]),
    tag: 'Culture',
    image: u('photo-1477587458883-47145f59a2bb'),
    description:
      'Lim Festival, held around the 13th day of the first lunar month in Bắc Ninh, is the public home of quan họ — the antiphonal folk singing of the Red River Delta. Costumed women and men face each other across yards and riverbanks, exchanging verses that were once courtship, now heritage.\n\nProcessions, traditional games, and village stages sit a short journey from Hanoi, which is why the capital is the practical base. The singing is UNESCO-recognised; hearing it outdoors, not in a theatre, is the point of travelling for Lim rather than booking a city show.\n\nDates cluster in February and early March depending on the lunar calendar. Go for the afternoon into evening if you want both the temple rites and the lingering duets as the light drops.',
  },
  {
    id: 'fest-hung-kings',
    name: "Hùng Kings' Festival",
    city: 'Hanoi',
    region: 'Phú Thọ · Nationwide',
    months: [4],
    seasons: seasonsForMonths([4]),
    tag: 'Heritage',
    image: u('photo-1555921015-5532091f6186'),
    description:
      'On the tenth day of the third lunar month, Vietnam honours the legendary Hùng Kings — the ancestral founders of the nation. The ceremonial heart is the Hùng Temple complex in Phú Thọ, where incense, processions, and state rites draw pilgrims from across the country. It is a public holiday, so cities slow and families travel.\n\nFor visitors, April is when this heritage layer is most visible: flags, offerings, and a nationwide pause that is cultural rather than commercial. Hanoi is the usual staging point for the temple hills to the northwest.\n\nExpect busy transport around the holiday itself. The meaning is ancestral rather than spectacular pyrotechnics — a spring day when origin stories, not beaches, organise the calendar.',
  },
  {
    id: 'fest-giong',
    name: 'Giong Festival',
    city: 'Hanoi',
    region: 'Gia Lâm · Hà Nội',
    months: [4, 5],
    seasons: seasonsForMonths([4, 5]),
    tag: 'Heritage',
    image: u('photo-1537996194471-e657df975ab4'),
    description:
      'Giong Festival commemorates Saint Giong, the mythical boy hero who grew into a giant to defend the kingdom. At Phu Dong and Soc temples on Hanoi’s eastern fringe, the story is replayed in processions, flag dances, opera-like re-enactments, and village pageantry that UNESCO lists as intangible heritage.\n\nSpring dates fall in April and May (tied to the lunar calendar). The mood is martial and folkloric rather than solemn: elephants in some tellings, bamboo in others, always a crowd in festival colour on the temple grounds.\n\nIt is one of the most visual heritage days within easy reach of the capital. Pair it with an Old Quarter stay; the temples are a dedicated half-day, not a detour you squeeze between coffee stops.',
  },
  {
    id: 'fest-ba-chua-xu',
    name: 'Ba Chua Xu Temple Festival',
    city: 'Can Tho',
    region: 'Châu Đốc · An Giang',
    months: [4, 5],
    seasons: seasonsForMonths([4, 5]),
    tag: 'Spiritual',
    image: u('photo-1509030450996-3a5ea825872b'),
    description:
      'Late in the fourth lunar month, pilgrims pack Sam Mountain above Châu Đốc to honour Bà Chúa Xứ — the Lady of the Realm. For several days the temple complex runs on incense, offerings, night vigils, and a density of faith that makes this the Mekong Delta’s largest spiritual gathering.\n\nApril and May are the civil-calendar window. Can Tho is the regional hub; Châu Đốc is the actual stage. Dress modestly, expect crowds, and treat it as a living pilgrimage rather than a photo stop.\n\nThe delta around the mountain is orchard and border-trade country. Festival days add a layer of Vietnamese-Khmer-Cham spiritual mix that you will not get from a floating-market morning alone.',
  },
  {
    id: 'fest-khau-vai',
    name: 'Khau Vai Love Market',
    city: 'Sapa',
    region: 'Hà Giang',
    months: [4, 5],
    seasons: seasonsForMonths([4, 5]),
    tag: 'Romantic',
    image: u('photo-1504609813442-a8924e83f76e'),
    description:
      'Once a year, Khau Vai village in Hà Giang hosts a gathering where former lovers may meet in the open — spouses traditionally wait elsewhere — while music, costume, and hill-market trade fill the slopes. It is a Hmong and Dao tradition of memory and matchmaking, not a staged “show” for the camera, though travellers now come for both.\n\nThe market falls in late spring (April–May on the lunar calendar). Sapa or Hà Giang town is the practical base; the last stretch is mountain road. Go with a local guide if you do not know the route, and keep photography respectful.\n\nSpring mist and new green suit the setting. This is highland culture at its most specific — a single day that does not repeat if you miss the date.',
  },
  {
    id: 'fest-danang-fireworks',
    name: 'Da Nang International Fireworks Festival',
    city: 'Da Nang',
    region: 'Central Coast',
    months: [6, 7],
    seasons: seasonsForMonths([6, 7]),
    tag: 'Culture',
    image: u('photo-1516450360452-9312f5e86fc7'),
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
    image: u('photo-1507525428034-b723cf961d3e'),
    description:
      'Nha Trang’s Sea Festival is the south-central coast’s summer civic party: beach sports, street performances, parades, and night programmes along the bay. Timing clusters in June, when the city leans into its identity as a resort strip rather than a transit stop.\n\nThe beachfront and Tran Phu promenade are the public stages. Expect louder evenings, more stalls, and a visitor mix of domestic holiday crowds and regional tour groups. It is less ceremonial than Vu Lan or Kate, more open-air city festival.\n\nIf you already planned Nha Trang for islands and Po Nagar, festival week adds atmosphere — and hotel demand. Book the bay side if you want to walk out of the lobby into the programme rather than taxi across town.',
  },
  {
    id: 'fest-vu-lan',
    name: 'Vu Lan / Wandering Souls Day',
    city: 'Hoi An',
    region: 'Nationwide',
    months: [8],
    seasons: seasonsForMonths([8]),
    tag: 'Spiritual',
    image: u('photo-1467810563316-b5476525c0f9'),
    description:
      'On the fifteenth day of the seventh lunar month, Vu Lan (and the related wandering-souls rites) fills temples and rivers with offerings. Families present food and incense to ancestors and hungry spirits; many wear a red rose if their mother is living, a white rose if she has passed — a Buddhist filial custom that is quietly moving if you know to look for it.\n\nAugust is the usual civil month. Ceremonies are nationwide; Hoi An’s river lanterns and Hanoi’s temple yards are the most visited by travellers. It is solemn compared with Tết or Mid-Autumn — closer to remembrance than to a street party.\n\nDress modestly at pagodas, keep voices down, and treat floating lights as ritual, not decoration. The wet-season calendar needed a spiritual anchor; Vu Lan is that night.',
  },
  {
    id: 'fest-mid-autumn',
    name: 'Mid-Autumn Festival (Tết Trung Thu)',
    city: 'Hanoi',
    region: 'Nationwide',
    months: [9, 10],
    seasons: seasonsForMonths([9, 10]),
    tag: 'Family',
    image: u('photo-1578662996442-48f36e0d20cd'),
    description:
      'Mid-Autumn is the children’s festival of the harvest moon: star-shaped lanterns, lion dances, toys, and boxes of mooncake shared among families and offices. Hanoi’s old streets, Hoi An’s alleys, and Ho Chi Minh City neighbourhoods all glow; the date falls on the 15th of the eighth lunar month, usually September, sometimes early October.\n\nBy day the story is bakeries and gift tins; by night it is parades of kids and a full moon over still-humid cities as autumn weather begins to settle. It is joyful and loud in the way Tết is earnest and closed.\n\nTravellers get the lanterns without Tết’s shop closures. Hang around Hoan Kiem, the Hoi An river, or any residential market street after dusk — that is where Trung Thu actually happens.',
  },
  {
    id: 'fest-kate',
    name: 'Kate Festival',
    city: 'Nha Trang',
    region: 'Ninh Thuận · Cham',
    months: [10],
    seasons: seasonsForMonths([10]),
    tag: 'Culture',
    image: u('photo-1540611025311-01df3cef54b5'),
    description:
      'Kate is the principal festival of the Cham community in Ninh Thuận, held at brick towers such as Po Klong Garai and Po Re Me. Priests, dancers in traditional dress, processions, and music honour ancestors and the old Hindu-Champa religious world that still shapes this stretch of coast.\n\nOctober is the month. Nha Trang is the visitor base; the towers sit inland toward Phan Rang. This is not a beach party grafted onto Cham culture — it is a living minority rite that happens to fall when central-coast weather is improving.\n\nGo for the ceremony hours, dress respectfully, and leave space for the community. Kate is one of the few calendar moments when Vietnam’s Hindu-influenced south-central heritage is fully public.',
  },
  {
    id: 'fest-ooc-om-boc',
    name: 'Ooc Om Boc',
    city: 'Can Tho',
    region: 'Khmer · Mekong Delta',
    months: [11],
    seasons: seasonsForMonths([11]),
    tag: 'Culture',
    image: u('photo-1414609245224-afa02bfb3fda'),
    description:
      'Ooc Om Boc marks the Khmer end of the rainy season with moon worship, pagoda gatherings, Apsara dance, and — most visibly — Ngo boat races on delta waterways. Soc Trang and Tra Vinh provinces host the liveliest days; Can Tho is the practical city for travellers stitching this onto a Mekong stay.\n\nNovember is the month, sitting at the start of Vietnam’s dry-season winter window. The mood is communal and distinctly southern: Khmer Theravada pagodas, not the northern lunar-new-year script.\n\nIf your November route already includes the delta, time a night for the races and moon rites. It is the winter calendar’s least-touristed major festival, and the one that reminds you the south is not only Vietnamese Kinh culture.',
  },
  {
    id: 'perf-water-puppet',
    name: 'Water Puppet Theatre',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: u('photo-1507676184212-d03ab07a01bf'),
    description:
      'Water puppetry was born in the flooded rice fields of the Red River Delta: wooden figures worked from behind a waist-deep pool, to live music, telling village legends, harvest jokes, and dragon dances. Thang Long Water Puppet Theatre on Hoan Kiem is the famous indoor stage; the form itself is older than the tourist ticket.\n\nShows run year-round, which is why this belongs with cultural performances rather than a festival month. Wet evenings in Hanoi are when an indoor hour of puppets-and-cheo-adjacent music makes the most sense; dry evenings you walk the lake after the curtain.\n\nBook the earlier show if you want English-friendly programmes and a seat. It is short, unique to the north, and the single easiest “only in Vietnam” performance to fit into any itinerary.',
  },
  {
    id: 'perf-ca-tru',
    name: 'Ca trù',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: u('photo-1514320291840-2e0a9bf2a9ae'),
    description:
      'Ca trù is chamber singing for a small room: a female vocalist, a lute, and a praise-drum, with poetry that once entertained scholars and mandarins. UNESCO lists it as endangered heritage. Hanoi clubs and dedicated houses still hold intimate sets — not nightly stadium folklore, but scheduled evenings you look up in advance.\n\nBecause it is indoor and seasonal only in the sense of the booking diary, ca trù sits in the year-round column. It rewards sitting still. This is not a festival crowd; it is a listening room.\n\nAsk your hotel or a heritage venue for the week’s ca trù night. Dress is ordinary-smart; applause follows the drum’s cues more than a pop chorus.',
  },
  {
    id: 'perf-nha-nhac',
    name: 'Nhã nhạc — Hue court music',
    city: 'Hue',
    region: 'Imperial capital',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: u('photo-1465847899084-d164df4dedc6'),
    description:
      'Nhã nhạc is the ceremonial music of the Nguyen court: oboes, drums, two-string fiddles, and ensembles that once marked royal rites inside Hue’s citadel. UNESCO recognises it as a masterpiece of intangible heritage. Today you hear it in the imperial enclosure, at Duyet Thi Duong Royal Theatre, and at heritage programmes tied to the palaces.\n\nPerformances run through the year for visitors and for ceremonial calendars. Hue weather changes; the music does not. A citadel ticket plus a theatre slot is the straightforward way to hear it rather than hoping a courtyard rehearsal is on.\n\nThis is the sound of the old capital — formal, measured, and unlike Hanoi’s folk opera or Saigon’s cải lương. Give it a seated hour, not a walk-by.',
  },
  {
    id: 'perf-cai-luong',
    name: 'Cải lương',
    city: 'Ho Chi Minh City',
    region: 'Southern Vietnam',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: u('photo-1503095396549-807759245b35'),
    description:
      'Cải lương is southern reformed opera: spoken drama, plucked guitar, and aching vocals that took the Mekong’s storytelling into twentieth-century theatres. Ho Chi Minh City still mounts productions; television and YouTube keep the stars famous even when tourist itineraries skip the playhouse.\n\nShows are year-round. You do not need Vietnamese to feel the melodrama — costumes, gesture, and the guitar’s slide carry a lot — but a synopsis helps. Theatres and cultural houses post weekly bills.\n\nIf your trip is Saigon-heavy, one evening of cải lương balances street food and rooftop bars with the south’s own classical-popular stage tradition.',
  },
  {
    id: 'perf-hat-cheo',
    name: 'Hát chèo',
    city: 'Hanoi',
    region: 'Red River Delta',
    months: SEASON_MONTHS['year-round'],
    seasons: ['year-round'],
    tag: 'Performance',
    image: u('photo-1493225457124-a3eb161ffa5f'),
    description:
      'Hát chèo is northern folk opera from the delta villages: satire, stock characters, percussion, and a chorus that talks back to the scene. It is earthier than Hue court music and older in village form than cải lương. Hanoi theatres and some water-puppet programmes share the same cultural neighbourhood.\n\nYou can find chèo on regular city stages throughout the year. It is comic and moral by turns — farmers, mandarins, tricksters — and was built for people who already knew the jokes.\n\nTreat it as a night out in the capital, not a festival date. Combined with water puppets, it is the north’s folk-performance pair: one on water, one on boards.',
  },
]

export function getEventsForSeason(season: EventSeason): SeasonalEventItem[] {
  return SEASONAL_EVENTS.filter((item) => item.seasons.includes(season))
}
