import {
  EVENT_SEASONS,
  seasonSectionId,
  type EventSeason,
} from './eventSeasons'

const u = (id: string, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`

export type SeasonGuideSection = {
  id: string
  title: string
  paragraphs: string[]
  image: string
  imageAlt: string
}

export type SeasonGuide = {
  season: EventSeason
  heroImage: string
  heroAlt: string
  sections: SeasonGuideSection[]
}

export const EVENT_CALENDAR_HREF = '/when-to-go/discover#event-calendar'

export function whenToGoHomePath(pipeline?: boolean): string {
  return pipeline ? '/plan/builder/when-to-go' : '/when-to-go/discover'
}

export function eventCalendarPath(opts?: {
  pipeline?: boolean
  season?: EventSeason
}): string {
  const hash = opts?.season ? seasonSectionId(opts.season) : 'event-calendar'
  return `${whenToGoHomePath(opts?.pipeline)}#${hash}`
}

export function seasonGuidePath(season: EventSeason): string {
  return `/when-to-go/discover/season/${season}`
}

export function isEventSeason(value: string): value is EventSeason {
  return EVENT_SEASONS.includes(value as EventSeason)
}

export const SEASON_GUIDES: Record<EventSeason, SeasonGuide> = {
  spring: {
    season: 'spring',
    heroImage: u('photo-1528183429752-a97d0bf99b5a', 1800),
    heroAlt: 'Limestone karst and river valley in northern Vietnam in spring',
    sections: [
      {
        id: 'festive',
        title: 'Festive rhythms and cultural celebrations',
        image: u('photo-1555921015-5532091f6186'),
        imageAlt: 'Temple courtyard and incense during a Vietnamese heritage festival',
        paragraphs: [
          'March through May is when northern heritage days sit in comfortable weather. The tenth day of the third lunar month is a public holiday for the Hùng Kings — ancestral rites at the temple complex in Phú Thọ, flags, incense, and a nationwide pause that is cultural rather than commercial. Giong Festival follows at Phu Dong and Soc temples on Hanoi’s eastern fringe: processions, flag dances, and the boy-hero legend UNESCO lists as intangible heritage.',
          'Pilgrims still finish the Perfume Pagoda season into early spring — boat, mountain, and Huong Tich Cave — while Lim Festival in Bắc Ninh puts quan họ singing outdoors. In the highlands, Khau Vai’s once-a-year love market (late spring, lunar date) is a Hmong and Dao gathering, not a staged show. In the Mekong, Bà Chúa Xứ on Sam Mountain above Châu Đốc draws the delta’s largest pilgrimage in the fourth lunar month.',
          'Hoi An’s lantern nights continue on the 14th of each lunar month; dry-season evenings are the most reliable for walking the old town without rain. Spring is festival-dense in the north and spiritually busy in the delta — plan transport around holiday weekends, not only around beach weather.',
        ],
      },
      {
        id: 'flavours',
        title: 'Seasonal flavours and culinary shifts',
        image: u('photo-1582878826629-29b7ad1cdc43'),
        imageAlt: 'Bowl of phở and herbs at a Vietnamese street table',
        paragraphs: [
          'Spring tables in the north still lean on phở, bún chả, and herbs that taste cleaner in cooler air. As days warm, Hanoi moves toward lighter noodles, fresh rolls, and the last of winter citrus on Tết-adjacent altars if lunar New Year ran late. Bánh cuốn, nem rán, and egg coffee remain year-round, but spring is when sidewalk stools feel pleasant at both lunch and dusk.',
          'Central kitchens keep mì Quảng, cao lầu, and Hoi An’s herb plates; the coast adds grilled seafood as sea days lengthen. In the south, fruit stalls fill with mango approaching late spring, while bánh xèo and hủ tiếu stay the humid-day staples. Festival weeks mean extra sweets and offerings — bánh chưng leftovers after a late Tết, then savoury street food around temple fairs.',
          'Drink according to the climb: iced cà phê sữa đá as soon as Hanoi sheds its jacket, egg coffee while mornings are still cool, and coconut in the delta. Spring is the easiest season to eat outdoors without a rain plan — still carry a bottle; heat builds fast in May.',
        ],
      },
      {
        id: 'outdoors',
        title: 'Outdoor pursuits and adventure conditions',
        image: u('photo-1504609813442-a8924e83f76e'),
        imageAlt: 'Terraced hills and mountain road in northern Vietnam',
        paragraphs: [
          'This is Vietnam’s most comfortable nationwide window for being outside. The north is dry and warming: Ha Long and Ninh Binh karst, Perfume Pagoda boats, and Hà Giang loop roads before summer cloud and rain. Sapa and the highlands are green, with trekking still cool at elevation. March and April are the classic months to stitch Hanoi, the bay, and the mountains without a daily downpour.',
          'The central coast — Da Nang, Hoi An, Hue — is typically bright with low rain through April, which is why beach and old-town walking pair so well. May starts to feel hotter; showers become more likely toward the end of the month. The south is warm and still relatively dry compared with peak monsoon, good for Mekong boats and city days in Ho Chi Minh City.',
          'Crowds rise at icons because the weather is this good. Book Ha Long boats, Hoi An stays, and holiday-week trains early around Hùng Kings. Late spring highland markets need a 4x4 or a guide if you do not know the last stretch of road.',
        ],
      },
      {
        id: 'packing',
        title: 'Packing strategy and gear essentials',
        image: u('photo-1528127269322-539801943592'),
        imageAlt: 'Ha Long Bay karst in clear travel weather',
        paragraphs: [
          'Pack for a dry, bright country that still has a cool north. Light layers, a breathable shirt, and one light sweater or overshirt cover Hanoi evenings and air-conditioned buses. Shorts and a sun hat earn their space by Da Nang and the delta. Modest cover for temples — shoulders and knees — is not optional on pilgrimage days.',
          'Sunscreen, sunglasses, and a refillable bottle matter more than a heavy rain shell in March and April; add a compact umbrella by May. Trail shoes with grip help on limestone and Sapa mud even when the forecast is fair. A dry bag inside your daypack protects cameras on boats.',
          'If your dates overlap a public holiday, print or screenshot bookings: banks and some desks close. Insect repellent for dusk in the delta and highlands, plus a light scarf for incense-heavy courtyards, finishes a spring kit without overpacking.',
        ],
      },
    ],
  },
  summer: {
    season: 'summer',
    heroImage: u('photo-1516450360452-9312f5e86fc7', 1800),
    heroAlt: 'Night fireworks over a riverfront city',
    sections: [
      {
        id: 'festive',
        title: 'Festive rhythms and cultural celebrations',
        image: u('photo-1507525428034-b723cf961d3e'),
        imageAlt: 'Tropical coastline used for Vietnam’s summer sea festivals',
        paragraphs: [
          'June through August is festival-light compared with Tết or spring heritage days, and heavier on civic spectacle. Da Nang’s international fireworks competition typically spreads across June and July weekends over the Han River — bridges and the dragon-spanned waterfront become viewing decks. Nha Trang’s Sea Festival clusters in June: beach sports, parades, and night programmes along Tran Phu.',
          'The spiritual centre of the wet season is Vu Lan, on the fifteenth of the seventh lunar month (usually August). Families offer food and incense for ancestors; many wear a red rose if their mother is living, white if she has passed. Ceremonies run nationwide; Hoi An’s river and Hanoi’s pagodas are the places travellers most often witness. It is remembrance, not a street party.',
          'Hoi An lantern nights continue, but showers can interrupt the riverfront. Summer is when indoor stages — water puppets, court music, cải lương — earn their keep on wet evenings. Plan outdoor festivals with a rain window, not a rigid minute-by-minute timetable.',
        ],
      },
      {
        id: 'flavours',
        title: 'Seasonal flavours and culinary shifts',
        image: u('photo-1559314809-0d155014ce50'),
        imageAlt: 'Vietnamese herbs and noodle salad suited to hot weather',
        paragraphs: [
          'Heat and humidity push the table toward cold drinks, fruit, and dishes you can eat without a heavy broth. Rambutan, longan, lychee, and mango pile the markets; sugarcane juice, coconut, and trà đá become the walking drinks. In the south, bánh xèo, gỏi, and hủ tiếu feel right at lunch; in the centre, mì Quảng and seafood still work if you eat early, before the afternoon steam.',
          'Northern summers still serve phở, but many locals lean into bún, fresh rolls, and sour fish soups that cut the air. Street stalls stay open through showers — plastic stools, condensed-milk coffee, and a tarpaulin. Festival weeks in Da Nang and Nha Trang add night-market snacks more than a separate cuisine.',
          'Food safety in the wet season is ordinary caution: busy stalls, peeled fruit, and bottled or boiled water. Carry electrolytes or oral rehydration if you are walking cities at midday. Vu Lan offerings are for the altar — eat at neighbouring canteens, not off the shrine.',
        ],
      },
      {
        id: 'outdoors',
        title: 'Outdoor pursuits and adventure conditions',
        image: u('photo-1509030450996-3a5ea825872b'),
        imageAlt: 'Mekong waterway under a heavy summer sky',
        paragraphs: [
          'Summer is Vietnam’s wet, green season, not a write-off. The south and Mekong see frequent rain; landscapes are lush, rivers high, and floating markets still run between storms. Ho Chi Minh City days are hot; plan indoor museums and early or late walks. Ha Long and the north get rain too, with dramatic cloud on the karst — boats still go, with more cancelled afternoons.',
          'The central coast is the caution zone later in the season: heat, downpours, and a rising typhoon risk toward late summer and early autumn. Hue’s citadel and tombs are still worth it; pack for flooded streets after a storm. Da Nang and Hoi An remain on many summer itineraries because the sea is the civic living room — fireworks nights prove people will stand in humidity for a sky show.',
          'Mountains are green and leech-prone after rain; Sapa trails can be slick. Adventure here is flexible timing: cave days in Phong Nha, short treks between showers, and boat hours when the radar is quiet. Build slack into transfers. This is not the season for a rigid Ha Giang motorcycle timetable unless you accept weather delays.',
        ],
      },
      {
        id: 'packing',
        title: 'Packing strategy and gear essentials',
        image: u('photo-1583417319070-4a69db38a482'),
        imageAlt: 'Vietnam landscape under mixed sun and cloud',
        paragraphs: [
          'Pack a real rain plan: compact umbrella, light waterproof shell, and quick-dry clothing. Cotton jeans stay wet; merino or synthetic trousers earn their weight. Waterproof sandals or shoes that drain, plus one dry pair for evenings, beat a single soaked trainer. A dry bag or zip pouches keep passports and phones alive through a motorbike taxi in the rain.',
          'Heat kit still matters: sunscreen, hat, electrolytes, and breathable shirts. Modest temple clothes for Vu Lan. Insect repellent for dusk, especially in the delta. If you are going north into the hills, add a light long sleeve for leeches and air-con buses — not a winter coat.',
          'Electronics hate humidity: silica packets in the camera bag, and do not leave gear on a wet balcony. Hotels on fireworks or sea-festival weekends book out; screenshot confirmations. A small torch helps on unlit village paths after a blackout in a storm.',
        ],
      },
    ],
  },
  autumn: {
    season: 'autumn',
    heroImage: u('photo-1559592413-7cec4d0cae2b', 1800),
    heroAlt: 'Silk lanterns in Hoi An old town after dusk',
    sections: [
      {
        id: 'festive',
        title: 'Festive rhythms and cultural celebrations',
        image: u('photo-1578662996442-48f36e0d20cd'),
        imageAlt: 'Lantern light and night street during Mid-Autumn',
        paragraphs: [
          'September and October are when the rains ease and the harvest moon takes the calendar. Mid-Autumn (Tết Trung Thu) falls on the 15th of the eighth lunar month — usually September, sometimes early October. Star lanterns, lion dances, toys, and boxes of mooncake fill Hanoi’s old streets, Hoi An’s alleys, and Ho Chi Minh City neighbourhoods. It is joyful and loud in the way Tết is earnest and closed, and shops stay open.',
          'Kate Festival in October is the Cham community’s principal rite at brick towers such as Po Klong Garai near Phan Rang, with Nha Trang as the visitor base. Priests, dance, and processions honour a Hindu-Champa religious world that still shapes this coast — not a beach party grafted onto minority culture. Hoi An lantern nights return to their most reliable dry-season form as showers drop.',
          'Autumn is shorter than the other chapters (two civil months) but visually dense: moon, lanterns, and Cham towers. Travellers get festival atmosphere without Tết’s closures. Hang around Hoan Kiem, the Thu Bon, or any residential market street after dusk on Trung Thu — that is where it actually happens.',
        ],
      },
      {
        id: 'flavours',
        title: 'Seasonal flavours and culinary shifts',
        image: u('photo-1495474472287-4d71bcdd2085'),
        imageAlt: 'Vietnamese coffee service as evenings cool',
        paragraphs: [
          'Mid-Autumn is a bakery season: baked and snow-skin mooncakes, lotus seed and salted egg yolks, gift tins moving between offices. By day the story is pastry; by night it is street food under lanterns. Hanoi starts to want richer broths again as nights cool — phở and bún thang feel right after a humid summer.',
          'Central Vietnam is coming out of the wettest weeks: cao lầu, mì Quảng, and grilled seafood return to outdoor tables. The south stays tropical; autumn fruit overlaps with the last of peak mango in some years, then custard apple and remaining longan. Tea and cà phê sữa đá both belong — mornings can finally be crisp in the north.',
          'If you are gifted mooncake, share it; whole tins are dense. Pair festival sweets with something savoury and green. Kate days in Ninh Thuận are about ceremony first — eat in town before or after the towers, and do not treat offerings as a tasting menu.',
        ],
      },
      {
        id: 'outdoors',
        title: 'Outdoor pursuits and adventure conditions',
        image: u('photo-1583417319070-4a69db38a482'),
        imageAlt: 'Karst seascape as central and northern weather clears',
        paragraphs: [
          'Autumn is the reset after summer rain. The north turns clearer and cooler — excellent for Ha Long, Ninh Binh, and city walking in Hanoi. September can still hold leftover storms on the central coast; October is often the turning month toward the dry season that makes Hoi An and Da Nang famous in travel guides.',
          'This is a strong window for the classic central-coast pair: Hue’s citadel in less oppressive heat, then the Thu Bon old town at lantern hour. Beaches are usable; the sea can still be choppy after a late typhoon, so check local advice before island boats. The highlands (Da Lat, the pass roads) are pleasant as humidity drops.',
          'The south remains warm; Mekong trips are easier than in peak flood months. Crowds rebuild toward November’s dry-season peak, so September can feel like a sweet spot: festivals on, weather improving, slightly fewer peak-winter visitors in the north.',
        ],
      },
      {
        id: 'packing',
        title: 'Packing strategy and gear essentials',
        image: u('photo-1528127269322-539801943592'),
        imageAlt: 'Clear-water karst bay in improving autumn weather',
        paragraphs: [
          'Pack a split kit: summer leftovers plus the first cool-weather layer. North evenings in October want a light jacket; Hoi An days still want linen and sun protection. Keep the compact umbrella through September on the central coast. Modest dress for Cham towers and pagodas.',
          'Comfortable walking shoes for lantern streets and citadel stone. A small daypack for mooncake tins if you are gift-shopping. Sunscreen does not retire when humidity drops — autumn light on the water is still strong.',
          'If your trip crosses a typhoon remnant, waterproof phone pouch and flexible boat tickets matter more than extra clothes. Screenshot hotel names in Vietnamese for taxi apps on festival nights when streets close around Hoan Kiem or the Hoi An river.',
        ],
      },
    ],
  },
  winter: {
    season: 'winter',
    heroImage: u('photo-1547981609-4b1e89e8c126', 1800),
    heroAlt: 'Hanoi streets dressed for Tết with blossoms and festive colour',
    sections: [
      {
        id: 'festive',
        title: 'Festive rhythms and cultural celebrations',
        image: u('photo-1559592413-7cec4d0cae2b'),
        imageAlt: 'Lantern-lit old town during Vietnam’s dry festive months',
        paragraphs: [
          'November through February is Vietnam’s classic dry, festive stretch. Tết Nguyên Đán — lunar new year — is the defining holiday: ancestral altars, peach blossom and kumquat in the north, mai yellow in the south, lì xì envelopes, lion dances, and days when families reunite. Dates shift across late January and February. Cities glow; many shops, banks, and tour desks close around the peak, and trains sell out weeks ahead.',
          'November opens the window with Ooc Om Boc in the Khmer south — moon worship, pagoda gatherings, and Ngo boat races around Soc Trang and Tra Vinh, with Can Tho as the practical base. Hoi An lantern nights are at their most photogenic in the dry months. After Tết’s first days, countryside roads quieten and temples reopen; the country switches back on still dressed for the new year.',
          'Travellers who book stays and transport early get the spectacle; those who do not find shuttered streets and full hotels. Winter is also peak visitor season in the south and on the central coast, so festive and tourist calendars overlap. Treat Tết as a cultural event you plan around, not a week of normal tourism with extra lights.',
        ],
      },
      {
        id: 'flavours',
        title: 'Seasonal flavours and culinary shifts',
        image: u('photo-1563379926898-05f4575a45d8'),
        imageAlt: 'Rich Vietnamese noodle soup suited to cooler northern days',
        paragraphs: [
          'Tết cooking is a cuisine of its own: bánh chưng and bánh tét sticky rice cakes, boiled chicken, pickled vegetables, candied fruit, and trays that sit on the ancestral altar before they sit on the table. In the days around New Year, street phở can be harder to find; family kitchens take over. After the holiday, Hanoi returns to broth with a vengeance — winter is when a steaming bowl is the point, not a compromise.',
          'The south stays hot; Tết there is yellow apricot, tropical fruit, and the same cakes in a warmer street. Central Vietnam in the dry months is the season for cao lầu on a lantern evening and seafood without a rain dash. Khmer festival days in the delta add pagoda sweets and communal rice dishes alongside Vietnamese Kinh staples.',
          'If you arrive during peak Tết, ask your hotel which kitchens stay open; tourist streets in Hoi An and the Old Quarter still feed visitors, while residential alleys go quiet. Bring small gifts if you are invited to a home — fruit, biscuits, or tea — and accept whatever is offered at the altar table with both hands.',
        ],
      },
      {
        id: 'outdoors',
        title: 'Outdoor pursuits and adventure conditions',
        image: u('photo-1528127269322-539801943592'),
        imageAlt: 'Ha Long Bay in the dry season',
        paragraphs: [
          'Winter splits the country. The south and Mekong are in their dry, sunny high season — the easiest months for boats, markets, and beach time in Phu Quoc or the delta. The central coast is typically dry and bright: Hoi An, Da Nang, and Hue are at their most walkable. This is the classic “best weather” strip that travel seasons are built on.',
          'The north is another climate: Hanoi can be cool, grey, and damp in a light-jacket way; Ha Long is still beautiful, sometimes under mist. Sapa and Hà Giang can be cold, with rare frost at elevation. Ninh Binh karst is clear and photogenic. Outdoor days are excellent if you dress for the latitude you are actually in, not for a single “Vietnam winter” idea.',
          'Crowds and prices peak. Ha Long boats, Hoi An Old Town, and Tet-week anything require advance booking. For adventure, dry-season dirt on the Hà Giang loop is more forgiving than summer mud, but mountain nights are cold on a motorbike. Build Tết closures into any itinerary that crosses late January or February.',
        ],
      },
      {
        id: 'packing',
        title: 'Packing strategy and gear essentials',
        image: u('photo-1477587458883-47145f59a2bb'),
        imageAlt: 'Northern Vietnamese city streets in cooler months',
        paragraphs: [
          'Pack two climates in one bag if you are going north and south. For Hanoi, Sapa, and the loop: layers, a proper jacket, closed shoes, and something for wind on a boat or bike. For Hoi An and the Mekong: the spring/summer kit — linen, sun hat, sandals, sunscreen. A light scarf helps in both: temples, incense, and Hanoi drizzle.',
          'Tết-specific: red envelopes if you will see children of friends, modest clothes for pagodas, and printed bookings. Do not assume ATMs and taxis behave as in a normal week. Power banks matter when you are walking longer festival nights.',
          'Rain is lower nationwide than in summer, but northern drizzle still soaks cotton. A compact umbrella and a dry bag remain useful. If you only buy one extra item in-country, let it be a cheap warm layer in Hanoi rather than overpacking a ski coat from home.',
        ],
      },
    ],
  },
  'year-round': {
    season: 'year-round',
    heroImage: u('photo-1507676184212-d03ab07a01bf', 1800),
    heroAlt: 'Theatre stage lights for Vietnamese traditional performance',
    sections: [
      {
        id: 'festive',
        title: 'Festive rhythms and cultural celebrations',
        image: u('photo-1465847899084-d164df4dedc6'),
        imageAlt: 'Traditional ensemble performing Vietnamese court or folk music',
        paragraphs: [
          'Not every cultural night in Vietnam waits on the lunar calendar. Water puppetry, ca trù chamber singing, Hue court music (nhã nhạc), southern cải lương, and northern hát chèo run on indoor stages throughout the year. They are rain-proof: the same ticket makes sense in a Hanoi downpour or a dry Saigon evening.',
          'Thang Long Water Puppet Theatre on Hoan Kiem is the famous pool-stage for wooden figures born in the Red River paddies. Ca trù is the opposite scale — a vocalist, lute, and praise-drum in a small room, UNESCO-listed and endangered. In Hue, nhã nhạc still sounds inside the citadel and at Duyet Thi Duong. Ho Chi Minh City keeps cải lương on playbills; Hanoi theatres still mount chèo’s village satire.',
          'These are not festivals you “catch if the date lands.” They are the country’s standing cultural infrastructure. Look up the week’s bills when you arrive; earlier puppet shows are easier for English-friendly programmes. Dress is ordinary-smart, not costume.',
        ],
      },
      {
        id: 'flavours',
        title: 'Seasonal flavours and culinary shifts',
        image: u('photo-1555939594-58d7cb561ad1'),
        imageAlt: 'Vietnamese street food plates that run in every travel month',
        paragraphs: [
          'Year-round performance nights pair with year-round food. Phở, bún, bánh mì, fresh rolls, and cà phê sữa đá do not wait for a season. What changes is the room: a steaming bowl after water puppets in January, iced coffee after cải lương in April, mì Quảng after a Hue court-music slot in any month.',
          'Theatre districts have their own canteens — Old Quarter stools after Hoan Kiem, citadel-side Hue snacks, Saigon’s pre-show cơm tấm. Use the same rule as festival weeks: eat where the queue of locals is, then walk to the door. Alcohol is optional; tea and beer both appear at southern theatres.',
          'If you are stacking a show after a long travel day, eat a proper meal first; puppet and ca trù programmes are short, opera-length cải lương is not. Keep a street-food budget separate from the ticket — the night is both.',
        ],
      },
      {
        id: 'outdoors',
        title: 'Outdoor pursuits and adventure conditions',
        image: u('photo-1528183429752-a97d0bf99b5a'),
        imageAlt: 'Vietnam landscape for the days between indoor performances',
        paragraphs: [
          'Year-round stages exist so culture still works when the map is raining, typhoon-warned, or too hot at noon. Use them as the indoor half of any itinerary: karst and coast by day, theatre by night. In the wet season they are the difference between a cancelled boat and a still-Vietnamese evening. In the dry season they are how you avoid doing only lantern streets and viewpoints.',
          'Geography still matters. Water puppets and chèo are northern; nhã nhạc is Hue; cải lương is southern. Do not expect the same bill in every city. A Hanoi stay can hold puppets plus ca trù; a Saigon stay should look for cải lương rather than a replica water-puppet house as the “authentic” night.',
          'Adventure conditions follow the month you actually visit — see spring, summer, autumn, and winter chapters for rain, heat, and wind. This chapter is the constant: book the earlier show if you have a dawn transfer; book the later show if you want the lake walk first.',
        ],
      },
      {
        id: 'packing',
        title: 'Packing strategy and gear essentials',
        image: u('photo-1514320291840-2e0a9bf2a9ae'),
        imageAlt: 'Quiet performance room suited to chamber music and opera',
        paragraphs: [
          'For performance nights, pack one outfit that is neat and covered — not beachwear, not trekking mud. A light shirt with sleeves works in Hue’s theatres and Hanoi’s clubs. Closed-toe shoes help on citadel stone and city pavements after dark.',
          'Bring earplugs only if you are sensitive; these are acoustic rooms, not stadiums. A compact umbrella covers the walk from taxi to door in any month. Screenshot the ticket and the theatre name in Vietnamese.',
          'The rest of the bag should match the season you are in, not this chapter. Year-round culture is the layer you add on top of a climate kit — a reserved hour, not a second suitcase.',
        ],
      },
    ],
  },
}

export function getSeasonGuide(season: string | undefined): SeasonGuide | null {
  if (!season || !isEventSeason(season)) return null
  return SEASON_GUIDES[season]
}

export function otherSeasons(season: EventSeason): EventSeason[] {
  return EVENT_SEASONS.filter((s) => s !== season)
}
