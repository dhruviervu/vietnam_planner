import { eventGallery } from './eventMedia'
import { type SeasonalEventItem } from './seasonalEvents'
import { EVENT_GUIDES_LONG_A } from './eventGuidesLongA'
import { EVENT_GUIDES_LONG_B } from './eventGuidesLongB'
import { EVENT_GUIDES_LONG_C } from './eventGuidesLongC'
import { EVENT_GUIDES_LONG_PERF } from './eventGuidesLongPerf'

export type EventGuideKind = 'festival' | 'performance'

export type EventGuideSection = {
  title: string
  paragraphs: string[]
}

export type EventGuide = {
  id: string
  kind: EventGuideKind
  sections: EventGuideSection[]
}

const FESTIVAL_TITLES = [
  'Dates and Timing',
  'Key Traditions',
  'Best Places to experience the festival',
] as const

const PERFORMANCE_TITLES = [
  'History and Origins',
  'What to expect',
  'Where to Experience',
] as const

function festival(
  id: string,
  dates: [string, string],
  traditions: [string, string],
  places: [string, string],
): EventGuide {
  return {
    id,
    kind: 'festival',
    sections: [
      { title: FESTIVAL_TITLES[0], paragraphs: dates },
      { title: FESTIVAL_TITLES[1], paragraphs: traditions },
      { title: FESTIVAL_TITLES[2], paragraphs: places },
    ],
  }
}

function performance(
  id: string,
  history: [string, string],
  expect: [string, string],
  where: [string, string],
): EventGuide {
  return {
    id,
    kind: 'performance',
    sections: [
      { title: PERFORMANCE_TITLES[0], paragraphs: history },
      { title: PERFORMANCE_TITLES[1], paragraphs: expect },
      { title: PERFORMANCE_TITLES[2], paragraphs: where },
    ],
  }
}

export const EVENT_GUIDES: Record<string, EventGuide> = {
  'fest-tet': festival(
    'fest-tet',
    [
      'Tết Nguyên Đán follows the lunar calendar, so the civil dates shift each year across late January and February. The public holiday usually covers the first days of the new year, with family visiting stretching several days before and after. Transport, banks, and many shops slow or close around the peak; book trains and stays weeks ahead.',
      'The run-up matters as much as the first morning: flower markets, kitchen cleaning, and ancestral altars fill the week before. After the initial reunion days, streets reopen but still wear peach blossom, kumquat, and lucky red. Travellers who land in the quiet middle of Tết see ritual more than restaurants; those who come at the tail catch the country switching back on.',
    ],
    [
      'Families reunite, offer fruit and incense at ancestral altars, and exchange lì xì — red envelopes of lucky money — especially for children and elders. Lion dances, fireworks where permitted, and first-visitor customs (xông đất) mark the opening of the year. Homes display hoa đào in the north and hoa mai in the south.',
      'Food is ceremonial: bánh chưng and bánh tét sticky-rice cakes, boiled chicken, pickled vegetables, and candied fruit sit on the altar before they sit on the table. Visiting order is social protocol — grandparents first, then neighbours. Modest dress at pagodas and a calm voice in courtyards are expected even when the street is loud.',
    ],
    [
      'Hanoi’s Old Quarter and Ho Chi Minh City’s Nguyen Hue flower street are the most intense public stages. Temple yards in both cities stay busy with first-of-year incense. Countryside roads quieten after the first days — a different, more domestic Tết than the downtown lights.',
      'Use Hanoi or Ho Chi Minh City as a base, then take a short trip to a family neighbourhood or a pagoda at dawn. Do not treat Tết as a week of normal tourism with extra lanterns: plan around closures, and treat invitations to a home as the real festival if you are lucky enough to receive one.',
    ],
  ),
  'fest-hoian-lantern': festival(
    'fest-hoian-lantern',
    [
      'On the 14th night of each lunar month, Hoi An dims electric lights for the full-moon lantern festival. Because it tracks the moon, the civil date moves; dry-season months (roughly autumn through spring) are the most reliable for walking the old town without rain. August still holds lantern nights, but showers can interrupt the riverfront.',
      'The evening is a few hours, not a multi-day holiday. Arrive before dusk if you want space on the Japanese Covered Bridge and the Thu Bon banks. The pedestrian core fills quickly; the rite itself is monthly, so missing one moon is not missing the year.',
    ],
    [
      'Shopfronts glow with silk lanterns in yellow and red; candle boats are released on the river; folk music and street food run late. The dimming of neon is the ritual — a town-scale offering to the moon more than a ticketed show. Tailor-lit alleys and the covered bridge are the classic photographs.',
      'Treat floating candles as part of the night’s meaning, not only decoration. Buy a boat if you wish, but give others room on the parapet. The festival is both living custom and visitor theatre; the courtesy is to walk slowly and keep the riverbank clear for people releasing lights.',
    ],
    [
      'The old town riverfront, the Japanese Covered Bridge, and the far bank of the Thu Bon are the three viewing layers. Stay inside the heritage core so you can walk out at blue hour rather than taxi in at peak crush.',
      'Hoi An is the only place this exact monthly dimming happens at this scale. Combine it with a daytime walk when the streets are for bicycles, then return after the lights drop. Photographers should claim a bridge or bank spot before the main crowd.',
    ],
  ),
  'fest-perfume-pagoda': festival(
    'fest-perfume-pagoda',
    [
      'The Perfume Pagoda Festival runs from the first through the third lunar months, with February and March the civil-calendar heart. It overlaps the tail of Tết and the start of spring. Peak weekends are crowded; weekdays still feel like a countryside pilgrimage.',
      'A full day is the honest timing: boat, mountain, cave, and return to Hanoi. Start early. Lunar dates shift, so confirm the festival window in the year you travel rather than locking a Gregorian weekend months ahead without checking.',
    ],
    [
      'Pilgrims take a boat along Yen Stream under karst cliffs, then walk or ride a cable car toward mountain pagodas, finishing at Huong Tich Cave — the “inner palace” shrine. Offerings, incense, and modest dress are the grammar of the day. It is one of northern Vietnam’s oldest Buddhist gatherings, mixing devotion and picnic energy.',
      'The cave shrine is the spiritual centre, not a viewpoint you rush. Keep voices down, cover shoulders and knees, and expect queues at the holiest spots. The festival is a sequence of landscapes as much as a single temple visit.',
    ],
    [
      'The Huong Son limestone massif in Hà Nội Province is the stage; Hanoi is the practical overnight base. The valley is a long day trip, not a squeeze between Old Quarter coffee stops. River light is best when winter mist lifts.',
      'Stay in the capital, book the boat as part of a simple tour or public combination, and give the cave the last energy of the day. Combining it with Tết in Hanoi is possible if your dates overlap, but transport and crowds stack — prefer a weekday if you can.',
    ],
  ),
  'fest-lim': festival(
    'fest-lim',
    [
      'Lim Festival is held around the 13th day of the first lunar month in Bắc Ninh, so civil dates cluster in February and early March. It is a village-scale gathering rather than a national holiday, but it draws Hanoi day-trippers for the singing.',
      'Plan an afternoon into evening if you want both temple rites and the lingering quan họ duets as the light drops. Lunar timing means the weekend you pick in one year will not match the next.',
    ],
    [
      'Costumed women and men face each other across yards and riverbanks, exchanging quan họ verses that were once courtship and are now UNESCO-recognised heritage. Processions, traditional games, and village stages sit around the singing rather than replacing it.',
      'Hearing quan họ outdoors, not in a Hanoi theatre, is the point. Photography should leave space for the singers; this is a living folk form, not a costume parade staged only for visitors. Dress for mud and modest temple stops.',
    ],
    [
      'Bắc Ninh’s Lim village area is the stage; Hanoi is the usual base — a short journey north of the capital. You do not need to overnight in Bắc Ninh unless you want dawn at the temples.',
      'Go for the singing grounds and the riverbank pairs, then return to Hanoi. If you only have time for one northern spring folk event besides Tết, Lim is the one built around a sound rather than a cave or a king.',
    ],
  ),
  'fest-hung-kings': festival(
    'fest-hung-kings',
    [
      'The Hùng Kings’ Festival falls on the tenth day of the third lunar month — usually April on the civil calendar — and is a public holiday. Families travel; cities slow; the ceremonial heart is the Hùng Temple complex in Phú Thọ.',
      'The holiday itself is the date to plan around: transport is busy, and the meaning is a nationwide pause, not a night market. Confirm the exact public-holiday cluster each year.',
    ],
    [
      'Vietnam honours the legendary Hùng Kings, ancestral founders of the nation. Incense, processions, flags, and state rites fill the temple hills. Offerings and modest dress belong at the shrines; the mood is ancestral rather than pyrotechnic.',
      'It is heritage as civic identity: origin stories organising the calendar for a spring day. Visitors who treat it as a fireworks show will miss the point; visitors who watch a procession and a courtyard of incense will not.',
    ],
    [
      'The Hùng Temple complex in Phú Thọ is the ceremonial centre. Hanoi is the usual staging point for the hills to the northwest. Flags and offerings are also visible in cities nationwide on the holiday.',
      'Overnight in Hanoi, travel up for the temple day, and expect full coaches. If you cannot reach Phú Thọ, a capital pagoda on the public holiday still shows the ancestral layer — thinner than the temple hills, but honest.',
    ],
  ),
  'fest-giong': festival(
    'fest-giong',
    [
      'Giong Festival dates fall in April and May, tied to the lunar calendar, at Phu Dong and Soc temples on Hanoi’s eastern fringe. It is a dedicated half-day, not a detour between coffee stops.',
      'Spring timing sits after the Hùng Kings holiday for many years; check the lunar listing so you do not double-book the same weekend with Phú Thọ.',
    ],
    [
      'The festival commemorates Saint Giong, the mythical boy hero who grew into a giant to defend the kingdom. Processions, flag dances, opera-like re-enactments, and village pageantry replay the story. UNESCO lists the festival as intangible heritage.',
      'The mood is martial and folkloric: colour, movement, and a crowd on the temple grounds. Elephants appear in some tellings, bamboo in others. It is visual heritage within easy reach of the capital.',
    ],
    [
      'Phu Dong and Soc temples in Gia Lâm, on Hanoi’s eastern edge, are the stages. Pair the day with an Old Quarter stay so you are not crossing the city from a far-west hotel.',
      'Go for the processions rather than a quiet shrine visit. Photographers will want the flag dances and the packed courtyard; leave a respectful distance for the community performing the rite.',
    ],
  ),
  'fest-ba-chua-xu': festival(
    'fest-ba-chua-xu',
    [
      'Late in the fourth lunar month, pilgrims pack Sam Mountain above Châu Đốc to honour Bà Chúa Xứ. April and May are the civil-calendar window. The gathering lasts several days, not a single evening.',
      'Can Tho is the regional hub for travellers; Châu Đốc is the actual stage. Build an overnight near the mountain if you want dawn and night vigils rather than a rushed day trip.',
    ],
    [
      'The Lady of the Realm draws the Mekong Delta’s largest spiritual gathering: incense, offerings, night vigils, and a density of faith. Dress modestly and treat it as a living pilgrimage. Vietnamese, Khmer, and Cham spiritual threads mix on the mountain.',
      'This is not a photo stop grafted onto a floating-market morning. Keep cameras low in shrine rooms, follow the flow of pilgrims, and eat at neighbouring canteens rather than from the altar.',
    ],
    [
      'Sam Mountain and the temple complex above Châu Đốc in An Giang are the place. Can Tho is how most visitors stitch it onto a Mekong stay. The delta around the mountain is orchard and border-trade country.',
      'If your spring route already includes the delta, this festival is the spiritual counterweight to a market boat. If you only have Can Tho, you will feel the overflow in the region but miss the mountain itself — go the extra stretch to Châu Đốc.',
    ],
  ),
  'fest-khau-vai': festival(
    'fest-khau-vai',
    [
      'Khau Vai Love Market falls once a year in late spring, April–May on the lunar calendar, in Khau Vai village, Hà Giang. Miss the date and it does not repeat until the next year.',
      'The last stretch is mountain road. Sapa or Hà Giang town is the practical base; start early and use a local guide if you do not know the route. Weather can close mist over the slopes.',
    ],
    [
      'Hmong and Dao tradition holds that former lovers may meet in the open while spouses traditionally wait elsewhere. Music, costume, and hill-market trade fill the gathering. It is memory and matchmaking, not a staged show, though travellers now come for both.',
      'Keep photography respectful — ask before close portraits, and do not treat the meeting as street theatre. Costume and song are the public face; the personal meetings are not yours to narrate.',
    ],
    [
      'Khau Vai village in Hà Giang is the only stage that matters. Sapa is a common overnight for visitors already in the northwest; Hà Giang town is closer to the loop roads.',
      'Spring mist and new green suit the setting. Combine it with a Hà Giang loop only if your dates truly match; otherwise you will arrive at an ordinary hillside market and wonder where the festival went.',
    ],
  ),
  'fest-danang-fireworks': festival(
    'fest-danang-fireworks',
    [
      'Da Nang’s international fireworks festival typically spreads across several June and July weekends rather than a single night. Teams compete over the Han River with pyrotechnics set to music. Display dates sell out river hotels.',
      'Summer nights are hot and shower-prone; the show still goes on because the river is the city’s living room. Arrive early for a rail or bank spot — the programme is an evening, the queue is an afternoon.',
    ],
    [
      'This is civic spectacle, not a temple rite: national teams, choreographed colour, bridges packed with phones. Dragon Bridge and the waterfront become viewing decks. It is the clearest summer event on Vietnam’s visitor calendar.',
      'Bring patience and water. There is no incense protocol; there is crowd protocol. Pick a viewing layer — bridge, bank, or beachfront — and stay put once the first shells go up.',
    ],
    [
      'The Han River, its bridges, the dragon-spanned waterfront, and My Khe beachfront are the decks. Stay in An Thuong or on the river if you want to walk out of the lobby rather than cross town in gridlock.',
      'Da Nang is the only city that hosts this particular international competition. If your summer route is Hoi An-heavy, the short transfer is worth it on a display Saturday — then return to the old town when the smoke clears.',
    ],
  ),
  'fest-nhatrang-sea': festival(
    'fest-nhatrang-sea',
    [
      'Nha Trang’s Sea Festival clusters in June, when the city leans into its identity as a resort strip. It is a civic week of beach sports, parades, and night programmes rather than one sacred hour.',
      'Hotel demand rises on the bay. Book the waterfront if you want to walk into the programme; otherwise you will taxi across town at the loudest hour.',
    ],
    [
      'Street performances, sports on the sand, and evening stages along Tran Phu define the mood. It is less ceremonial than Vu Lan or Kate — an open-air city festival for domestic holiday crowds and regional tour groups.',
      'Expect stalls, volume, and a visitor mix that is more beach-holiday than pilgrimage. There is no single ritual object; the tradition is the city performing summer for itself.',
    ],
    [
      'The beachfront and Tran Phu promenade are the public stages. Po Nagar and the islands remain daytime sights; festival week adds the night layer on the same strip.',
      'If you already planned Nha Trang for the bay, festival June is atmosphere and crowds in one. If you want quiet sand, pick another month — this week is for the programme.',
    ],
  ),
  'fest-vu-lan': festival(
    'fest-vu-lan',
    [
      'Vu Lan, and the related wandering-souls rites, fall on the fifteenth day of the seventh lunar month — usually August. Ceremonies are nationwide in a single night and the days around it, not a multi-week carnival.',
      'It is the wet season’s spiritual anchor. Confirm the lunar date; August is the usual civil month but not a fixed Gregorian day.',
    ],
    [
      'Families offer food and incense to ancestors and hungry spirits. Many wear a red rose if their mother is living, a white rose if she has passed — a Buddhist filial custom. Temples and rivers fill with lights that are ritual, not decoration.',
      'Compared with Tết or Mid-Autumn, Vu Lan is solemn: remembrance rather than a street party. Dress modestly at pagodas, keep voices down, and do not treat floating lights as a photo prop first.',
    ],
    [
      'Ceremonies run nationwide. Travellers most often see Hoi An’s river lanterns and Hanoi’s temple yards. Pagodas in Ho Chi Minh City hold the same night with less visitor traffic.',
      'Hoi An is the photogenic river version; Hanoi is the capital temple version. Either works. Pair the evening with a quiet meal after, not a loud bar crawl — the tone of the night is filial.',
    ],
  ),
  'fest-mid-autumn': festival(
    'fest-mid-autumn',
    [
      'Mid-Autumn (Tết Trung Thu) falls on the 15th of the eighth lunar month — usually September, sometimes early October. It is an evening festival of the harvest moon, not a week-long shutdown like Tết. Shops stay open.',
      'By day the story is bakeries and gift tins; by night it is children, lanterns, and lion dances. The moon date moves, so pin the year you travel rather than “late September” as a forever rule.',
    ],
    [
      'Star-shaped lanterns, lion dances, toys, and boxes of mooncake — lotus seed, salted egg yolk, snow-skin — move between families and offices. It is the children’s festival: joyful and loud in the way Tết is earnest and closed.',
      'Parades of kids fill old streets after dusk. Travellers get lanterns without Tết’s shop closures. Share mooncake if you are gifted a tin; whole boxes are dense on purpose.',
    ],
    [
      'Hanoi’s streets around Hoan Kiem, Hoi An’s alleys, and Ho Chi Minh City neighbourhoods all glow. Any residential market street after dusk is where Trung Thu actually happens — not only the postcard square.',
      'Hang around the lake, the Thu Bon, or a local market rather than a ticketed “lantern show.” The festival is the city at child-height. Hanoi and Hoi An are the easiest visitor stages; Saigon’s neighbourhoods are the most everyday.',
    ],
  ),
  'fest-kate': festival(
    'fest-kate',
    [
      'Kate is held in October at Cham brick towers in Ninh Thuận, notably Po Klong Garai and Po Re Me. It is the principal festival of the Cham community, timed to their calendar and to improving central-coast weather.',
      'Ceremony hours matter more than a full tourist week. Confirm the tower programme; Nha Trang is the visitor overnight, not the ritual ground.',
    ],
    [
      'Priests, dancers in traditional dress, processions, and music honour ancestors and the Hindu-Champa religious world that still shapes this coast. It is a living minority rite, not a beach party grafted onto Cham culture.',
      'Dress respectfully, leave space for the community, and follow what the priests allow with cameras. Kate is one of the few calendar moments when this heritage is fully public.',
    ],
    [
      'Po Klong Garai and Po Re Me, inland toward Phan Rang in Ninh Thuận, are the towers. Nha Trang is the practical base. The rite is at the brick sanctuaries, not on Tran Phu beach.',
      'Go for the ceremony, then return to the coast. If you only stay on the Nha Trang strip you will miss Kate entirely — the festival is a dedicated inland morning or afternoon.',
    ],
  ),
  'fest-ooc-om-boc': festival(
    'fest-ooc-om-boc',
    [
      'Ooc Om Boc marks the Khmer end of the rainy season in November, with moon worship and — most visibly — Ngo boat races on delta waterways. Soc Trang and Tra Vinh provinces host the liveliest days.',
      'It sits at the start of Vietnam’s dry-season winter window. Pin the race days locally; Can Tho is the practical city for stitching this onto a Mekong stay.',
    ],
    [
      'Pagoda gatherings, Apsara dance, moon rites, and long-boat races define the festival. The mood is communal and southern: Khmer Theravada pagodas, not the northern lunar-new-year script.',
      'This is the winter calendar’s least-touristed major festival. Treat pagodas as active worship spaces. The races are the public spectacle; the moon rites are the meaning.',
    ],
    [
      'Soc Trang and Tra Vinh are the heartlands; Can Tho is how most travellers arrive. Waterways, not a single square, are the stage for the boats.',
      'If your November route already includes the delta, time a night for the races. You will not get this layer from a floating-market morning in Cai Rang alone.',
    ],
  ),
  'perf-water-puppet': performance(
    'perf-water-puppet',
    [
      'Water puppetry was born in the flooded rice fields of the Red River Delta: wooden figures worked from behind a waist-deep pool, telling village legends, harvest jokes, and dragon dances to live music. The form is older than the tourist ticket on Hoan Kiem.',
      'It belongs to northern wet-rice culture — a theatre that could be performed where the paddy already was water. Cheo-adjacent music and folk plots travelled with it into indoor houses in Hanoi.',
    ],
    [
      'Shows are short, seated, and usually offered with some English-friendly explanation at the famous house. Puppets appear, splash, and vanish; dragons and farmers share the pool. Book the earlier show for a seat and a calmer house.',
      'Wet evenings in Hanoi are when an indoor hour makes the most sense; dry evenings you walk the lake after the curtain. It is the easiest “only in Vietnam” performance to fit into any itinerary.',
    ],
    [
      'Thang Long Water Puppet Theatre on Hoan Kiem Lake is the famous indoor stage. Other northern houses exist, but this is the one visitors can actually book on a normal city night.',
      'Stay in the Old Quarter so the walk to the lake is the interval. Combine with hát chèo if you want the north’s folk-performance pair: one on water, one on boards.',
    ],
  ),
  'perf-ca-tru': performance(
    'perf-ca-tru',
    [
      'Ca trù is chamber singing for a small room: a female vocalist, a lute, and a praise-drum, with poetry that once entertained scholars and mandarins. UNESCO lists it as endangered heritage — not a vanished form, but a fragile one.',
      'It is northern and intimate by design. The tradition lived in singing houses rather than village paddies or royal courtyards, which is why you still look up a week’s bill rather than walking into a nightly stadium show.',
    ],
    [
      'Expect to sit still and listen. Applause follows the drum’s cues more than a pop chorus. Dress is ordinary-smart. This is not a festival crowd; it is a listening room.',
      'Sets are scheduled evenings, not drop-in folklore. A little context — the praise drum, the lute, the poetic line — makes the hour richer. Phones down unless the house allows photos between pieces.',
    ],
    [
      'Hanoi clubs and dedicated heritage houses still hold intimate sets. Ask your hotel or a heritage venue for the week’s ca trù night; it will not be on every street corner.',
      'The capital is the practical city. Do not expect the same bill in Hoi An or Saigon. Pair it with a quiet Old Quarter evening, not with a pub crawl.',
    ],
  ),
  'perf-nha-nhac': performance(
    'perf-nha-nhac',
    [
      'Nhã nhạc is the ceremonial music of the Nguyen court: oboes, drums, two-string fiddles, and ensembles that once marked royal rites inside Hue’s citadel. UNESCO recognises it as a masterpiece of intangible heritage.',
      'It is the sound of the old capital — formal and measured, unlike Hanoi’s folk opera or Saigon’s cải lương. Court ritual needed this music; tourism now keeps regular programmes so the form is still heard.',
    ],
    [
      'Give it a seated hour, not a walk-by. The texture is ensemble and ceremonial rather than a star vocalist. A citadel ticket plus a theatre slot is the straightforward way to hear it rather than hoping a courtyard rehearsal is on.',
      'Hue weather changes; the music does not. Programmes run through the year for visitors and for ceremonial calendars. Sit, watch the instruments, and let the formality be the point.',
    ],
    [
      'You hear it in the imperial enclosure, at Duyet Thi Duong Royal Theatre, and at heritage programmes tied to the palaces. Hue is the city; the citadel is the room.',
      'Book the theatre rather than treating a passing courtyard as the concert. Combine with a tomb or pagoda day so the court layer and the landscape layer share the same stay.',
    ],
  ),
  'perf-cai-luong': performance(
    'perf-cai-luong',
    [
      'Cải lương is southern reformed opera: spoken drama, plucked guitar, and aching vocals that took the Mekong’s storytelling into twentieth-century theatres. It is the south’s own classical-popular stage tradition, not a copy of Hue court music.',
      'Television and recordings kept stars famous even when tourist itineraries skipped the playhouse. Ho Chi Minh City still mounts productions; the form is living, not museum-only.',
    ],
    [
      'You do not need Vietnamese to feel the melodrama — costumes, gesture, and the guitar’s slide carry a lot — but a synopsis helps. Shows can run longer than a puppet hour; eat first.',
      'Theatres and cultural houses post weekly bills. Year-round staging means you look up tonight’s title rather than waiting for a festival date.',
    ],
    [
      'Ho Chi Minh City playhouses and cultural houses are the practical rooms. This is a Saigon-heavy evening, not a Hanoi import.',
      'If your trip is already in the south, one night of cải lương balances street food and rooftop bars. Ask the hotel concierge or a theatre listing the week you arrive.',
    ],
  ),
  'perf-hat-cheo': performance(
    'perf-hat-cheo',
    [
      'Hát chèo is northern folk opera from Red River Delta villages: satire, stock characters, percussion, and a chorus that talks back to the scene. It is earthier than Hue court music and older in village form than cải lương.',
      'Farmers, mandarins, and tricksters are the cast. The form was built for people who already knew the jokes — comic and moral by turns — then moved onto Hanoi boards.',
    ],
    [
      'You can find chèo on regular city stages throughout the year. It is a night out in the capital, not a festival date. Expect percussion, stock types, and a chorus that comments on the action.',
      'Some water-puppet programmes share the same cultural neighbourhood. Treat chèo as theatre you sit for, not a five-minute cultural snack in a hotel lobby.',
    ],
    [
      'Hanoi theatres are the usual rooms. Combined with water puppets, it is the north’s folk-performance pair.',
      'Look up the week’s bill when you arrive. The delta villages remain the origin; the capital is where visitors can actually buy a seat.',
    ],
  ),
}

Object.assign(
  EVENT_GUIDES,
  EVENT_GUIDES_LONG_A,
  EVENT_GUIDES_LONG_B,
  EVENT_GUIDES_LONG_C,
  EVENT_GUIDES_LONG_PERF,
)

const EVENT_OVERVIEWS: Record<string, string> = {
  'fest-tet':
    'Tết Nguyên Đán is Vietnam’s lunar new year, when families reunite, ancestral altars fill with fruit and incense, and cities glow with peach blossom, kumquat, and lucky red. Dates move through late January and February. Shops often close around the peak, while lion dances and red envelopes mark the opening of the year.',
  'fest-hoian-lantern':
    'Hoi An’s lantern festival falls on the fourteenth night of each lunar month, when the old town dims electric lights and silk lanterns fill the streets and Thu Bon River. Candle boats, the Japanese Covered Bridge, and tailor-lit alleys make it Vietnam’s most photographed monthly rite, especially in the drier months from autumn through spring.',
  'fest-perfume-pagoda':
    'The Perfume Pagoda Festival is a spring Buddhist pilgrimage from Hanoi into the Huong Son limestone hills. Pilgrims boat along Yen Stream, climb toward mountain pagodas, and enter Huong Tich Cave, the “inner palace.” It runs through the first lunar months, peaking in February and March, mixing devotion, landscape, and picnic energy on crowded weekends.',
  'fest-lim':
    'Lim Festival in Bắc Ninh, near Hanoi, is the public home of quan họ folk singing, held around the thirteenth day of the first lunar month. Costumed singers exchange verses across yards and riverbanks in a UNESCO-recognised tradition once tied to courtship. Processions and village games surround the duets, best heard outdoors rather than on a city stage.',
  'fest-hung-kings':
    'The Hùng Kings’ Festival honours Vietnam’s legendary founding rulers on the tenth day of the third lunar month, usually in April, and is a public holiday. The ceremonial heart is the Hùng Temple complex in Phú Thọ, where incense, processions, and state rites draw pilgrims. Cities slow as families travel for this ancestral, not commercial, spring pause.',
  'fest-giong':
    'Giong Festival commemorates Saint Giong, the mythical boy hero who grew into a giant to defend the kingdom. At Phu Dong and Soc temples on Hanoi’s eastern fringe, processions, flag dances, and folk re-enactments replay the story in April and May. UNESCO lists the gathering as intangible heritage — martial, colourful, and a dedicated half-day from the capital.',
  'fest-ba-chua-xu':
    'The Ba Chua Xu Temple Festival on Sam Mountain above Châu Đốc is the Mekong Delta’s largest pilgrimage, honouring the Lady of the Realm in the fourth lunar month. For several days the mountain fills with incense, offerings, and night vigils. Can Tho is the traveller hub; Châu Đốc is the stage. Dress modestly and treat it as living faith.',
  'fest-khau-vai':
    'Khau Vai Love Market is a once-a-year Hmong and Dao gathering in Hà Giang, usually in late spring. Former lovers may meet in the open while music, costume, and hill trade fill the slopes. It is memory and matchmaking, not a staged show. Sapa or Hà Giang town is the base; the last road is mountain, and the date does not repeat.',
  'fest-danang-fireworks':
    'Da Nang’s international fireworks festival brings competing teams to the Han River across several June and July weekends. Bridges, the dragon-spanned waterfront, and My Khe become viewing decks for choreographed pyrotechnics set to music. It is civic spectacle rather than temple rite — hot, crowded, and the clearest summer event on Vietnam’s visitor calendar.',
  'fest-nhatrang-sea':
    'Nha Trang’s Sea Festival is the south-central coast’s June civic party: beach sports, parades, street performances, and night programmes along Tran Phu and the bay. Timing clusters when the city leans into its resort identity. Expect louder evenings and higher hotel demand on the waterfront — less ceremony than Vu Lan or Kate, more open-air holiday energy.',
  'fest-vu-lan':
    'Vu Lan, or Wandering Souls Day, falls on the fifteenth of the seventh lunar month, usually August. Families offer food and incense to ancestors; many wear a red rose if their mother is living, white if she has passed. Temples and rivers nationwide fill with lights. It is solemn remembrance, most often seen by travellers in Hoi An and Hanoi.',
  'fest-mid-autumn':
    'Mid-Autumn Festival, Tết Trung Thu, is Vietnam’s harvest-moon night for children: star lanterns, lion dances, toys, and mooncakes shared among families and offices. It falls on the fifteenth of the eighth lunar month, usually September. Shops stay open. Hanoi’s old streets, Hoi An’s alleys, and Saigon neighbourhoods all glow after dusk without Tết’s closures.',
  'fest-kate':
    'Kate is the principal festival of the Cham community in Ninh Thuận, held in October at brick towers such as Po Klong Garai and Po Re Me. Priests, dancers, and processions honour ancestors and a Hindu-Champa religious world that still shapes this coast. Nha Trang is the visitor base; the rite is inland, living heritage rather than a beach party.',
  'fest-ooc-om-boc':
    'Ooc Om Boc marks the Khmer end of the rainy season in November with moon worship, pagoda gatherings, Apsara dance, and Ngo boat races on delta waterways. Soc Trang and Tra Vinh host the liveliest days; Can Tho is the practical city for travellers. It is communal, southern, and Theravada — distinct from northern Tết — and little touristed.',
  'perf-water-puppet':
    'Water puppetry was born in the flooded rice fields of the Red River Delta: wooden figures worked from behind a pool, to live music, telling village legends and dragon dances. Thang Long Water Puppet Theatre on Hanoi’s Hoan Kiem Lake is the famous indoor stage. Shows run year-round — short, unique to the north, and easy to fit into any stay.',
  'perf-ca-tru':
    'Ca trù is northern chamber singing for a small room: a female vocalist, a lute, and a praise-drum, with poetry that once entertained scholars. UNESCO lists it as endangered heritage. Hanoi clubs still hold intimate, scheduled sets — not nightly stadium folklore. It rewards sitting still; applause follows the drum, and dress is ordinary-smart rather than festival costume.',
  'perf-nha-nhac':
    'Nhã nhạc is the ceremonial music of the Nguyen court: oboes, drums, and fiddles that once marked royal rites inside Hue’s citadel. UNESCO recognises it as a masterpiece of intangible heritage. Today you hear it in the imperial enclosure and at Duyet Thi Duong Royal Theatre, year-round. It is formal and measured — the sound of the old capital, not folk opera.',
  'perf-cai-luong':
    'Cải lương is southern reformed opera: spoken drama, plucked guitar, and aching vocals that carried Mekong storytelling into twentieth-century theatres. Ho Chi Minh City still mounts productions; television kept the stars famous. Shows run year-round. You need little Vietnamese to feel the melodrama, though a synopsis helps. It is Saigon’s own classical-popular stage, not a Hue import.',
  'perf-hat-cheo':
    'Hát chèo is northern folk opera from Red River Delta villages: satire, stock characters, percussion, and a chorus that talks back to the scene. Earthier than Hue court music and older in village form than cải lương, it now plays Hanoi stages year-round. Farmers, mandarins, and tricksters share the bill — a capital night out, not a festival date.',
}

export function getEventOverview(id: string): string | undefined {
  return EVENT_OVERVIEWS[id]
}

export function getParagraphImages(id: string, fallback: string): string[] {
  return eventGallery(id, fallback)
}

export function eventGuideWordCount(guide: EventGuide): number {
  const text = guide.sections
    .flatMap((s) => [s.title, ...s.paragraphs])
    .join(' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function getEventGuide(id: string): EventGuide | undefined {
  return EVENT_GUIDES[id]
}

export function eventGuideKind(item: SeasonalEventItem): EventGuideKind {
  return item.tag === 'Performance' ? 'performance' : 'festival'
}
