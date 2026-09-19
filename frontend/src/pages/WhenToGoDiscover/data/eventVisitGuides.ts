import type { EventFact } from './seasonalEvents'
import type { EventGuideSection } from './eventGuides'

export type EventVisitGuide = {
  facts: EventFact[]
  sections: EventGuideSection[]
}

function visit(
  facts: EventFact[],
  gettingThere: [string, string],
  planVisit: [string, string],
): EventVisitGuide {
  return {
    facts,
    sections: [
      { title: 'How to get there', paragraphs: gettingThere },
      { title: 'Planning a visit', paragraphs: planVisit },
    ],
  }
}

/** Extra Learn More detail — public calendar, place, and heritage facts, not invented hours. */
export const EVENT_VISIT_GUIDES: Record<string, EventVisitGuide> = {
  'fest-tet': visit(
    [
      { label: 'Lunar new year', value: 'First days of the first lunar month; civil dates published each autumn for the next Tết' },
      { label: 'Public holiday', value: 'A national holiday cluster; exact days off are set by the government each year' },
      { label: 'Flower streets', value: 'Nguyễn Huệ (HCMC) and Hanoi peach/kumquat markets are the best-known public displays' },
      { label: 'Closures', value: 'Many restaurants, shops, and long-distance trains pause around peak reunion days' },
      { label: 'Greetings', value: 'Chúc Mừng Năm Mới / Cung Chúc Tân Xuân — lucky money (lì xì) is for children and elders' },
    ],
    [
      'Fly into Nội Bài (Hanoi) or Tân Sơn Nhất (Ho Chi Minh City). Both cities are the public stages; neither is a day trip from the other at Tết, when tickets vanish. Book flights and sleeper trains as soon as dates are announced.',
      'Inside each city, use Grab or walking in the old cores. Do not count on last-minute intercity buses. If you want a quieter Tết, stay in a residential neighbourhood rather than a deserted backpacker strip.',
    ],
    [
      'Treat the week as a family holiday, not a normal sightseeing window. Museums and some pagodas stay open; street food and tours often do not. Confirm opening hours the week you arrive.',
      'Pack modest clothes for temple visits, red envelopes only if you are invited into a home, and patience for fireworks rules that change by city. The most useful “ticket” is a confirmed hotel through the peak nights.',
    ],
  ),
  'fest-hoian-lantern': visit(
    [
      { label: 'Moon night', value: '14th night of each lunar month — look up the full-moon evening for the month you travel' },
      { label: 'UNESCO town', value: 'Hoi An Ancient Town is a World Heritage site; the lantern night is a town rite, not a separate ticket' },
      { label: 'Old Town ticket', value: 'Heritage-site tickets cover selected historic houses and the Japanese Covered Bridge on ordinary days' },
      { label: 'Duration', value: 'A few hours from dusk; the pedestrian core fills before the lights fully dim' },
    ],
    [
      'Da Nang International Airport is the usual arrival, then a 30–45 minute road transfer south to Hoi An. Stay inside or next to the Ancient Town so you can walk in at blue hour.',
      'The old town is best on foot or by bicycle. Taxis snarl the edges on lantern nights; do not plan a same-evening return to Da Nang unless you leave before the crush.',
    ],
    [
      'No separate lantern-festival ticket exists. You pay for the heritage zone on days you enter ticketed monuments; the street and riverfront are public. Candle boats are sold along the Thu Bon — optional, not required.',
      'Wear shoes you can walk in for hours. Keep the bridge parapet clear for people releasing lights. Dry-season moons (roughly February–May and August–October) are the most reliable; summer showers can cut the evening short.',
    ],
  ),
  'fest-perfume-pagoda': visit(
    [
      { label: 'Festival window', value: '1st–3rd lunar months (often February–April on the civil calendar)' },
      { label: 'Core shrine', value: 'Hương Tích Cave — the “inner palace” — in the Hương Sơn massif, Mỹ Đức, Hanoi Province' },
      { label: 'Day length', value: 'A full day from central Hanoi: boat on Yến Stream, then walk or cable car' },
      { label: 'Dress', value: 'Cover shoulders and knees at pagodas and in the cave' },
    ],
    [
      'Most visitors start from Hanoi. The valley is southwest of the city in Mỹ Đức — a long day trip, not an Old Quarter add-on. Tours and public combinations both exist; start at dawn.',
      'The classic approach is a boat along Yến Stream under karst cliffs, then a walk or cable car toward the mountain pagodas and the cave. Return to Hanoi the same evening unless you have booked a local homestay.',
    ],
    [
      'Weekdays in the festival months are kinder than weekends. Confirm the lunar window for your year; a Gregorian date that worked last spring will not automatically work this spring.',
      'Bring water, modest clothes, and cash for boat and cable-car fares. The cave is a shrine, not a viewpoint to rush. Combine with Tết in Hanoi only if you accept stacked crowds and transport.',
    ],
  ),
  'fest-lim': visit(
    [
      { label: 'When', value: 'Around the 13th day of the 1st lunar month (February or early March)' },
      { label: 'Heritage', value: 'Quan họ Bắc Ninh singing — UNESCO Intangible Cultural Heritage (2009)' },
      { label: 'Where', value: 'Lim and neighbouring villages, Bắc Ninh Province, north of Hanoi' },
      { label: 'Time needed', value: 'An afternoon into evening from the capital' },
    ],
    [
      'Hanoi is the base. Bắc Ninh is a short road or train hop north of the capital. You do not need to overnight in Bắc Ninh unless you want dawn at the temples.',
      'Local buses and private cars both work. The singing grounds are village-scale — yards, dikes, and riverbanks — not a single stadium gate.',
    ],
    [
      'There is no city-style e-ticket. You arrive for the folk gathering, dress for mud and modest temple stops, and leave space for the singers.',
      'If you only have time for one northern spring folk event besides Tết, Lim is the one built around a sound. Photography should not block the paired singers.',
    ],
  ),
  'fest-hung-kings': visit(
    [
      { label: 'Date', value: '10th day of the 3rd lunar month (usually April)' },
      { label: 'Holiday', value: 'Giỗ Tổ Hùng Vương is a national public holiday' },
      { label: 'Heritage', value: 'Worship of Hùng Kings — UNESCO Intangible Cultural Heritage (2012)' },
      { label: 'Ceremonial centre', value: 'Hùng Temple complex, Nghĩa Lĩnh mountain, Phú Thọ Province' },
    ],
    [
      'Hanoi is the usual overnight. Phú Thọ lies northwest of the capital; coaches and organised day trips fill on the holiday. Start early.',
      'If you cannot reach the temple hills, pagodas in Hanoi still show the ancestral day — thinner than Phú Thọ, but the nationwide pause is real.',
    ],
    [
      'Treat it as a civic and ancestral day, not a night market. Modest dress at the shrines. Confirm the public-holiday cluster when the government publishes it each year.',
      'Book the return to Hanoi before you go up; the same coaches that fill in the morning fill again at dusk.',
    ],
  ),
  'fest-giong': visit(
    [
      { label: 'When', value: '4th lunar month rites (April–May civil dates) at Phù Đổng and Sóc temples' },
      { label: 'Heritage', value: 'Gióng Festival of Phù Đổng and Sóc temples — UNESCO list (2010)' },
      { label: 'Story', value: 'Saint Gióng, the boy hero of Vietnamese legend' },
      { label: 'Time needed', value: 'A dedicated half-day from central Hanoi' },
    ],
    [
      'Both temples sit on Hanoi’s eastern fringe (Gia Lâm / Sóc Sơn). Stay in the Old Quarter or Hoàn Kiếm so you are not crossing the whole city from a far-west hotel.',
      'Grab, taxi, or a local tour. This is not a walk from Hoàn Kiếm Lake — budget transfer time as part of the half-day.',
    ],
    [
      'Go for processions and flag dances, not a quiet empty courtyard. Leave room for the community performing the rite.',
      'Check the lunar listing so you do not stack the same weekend with the Hùng Kings holiday in Phú Thọ.',
    ],
  ),
  'fest-ba-chua-xu': visit(
    [
      { label: 'When', value: 'Late 4th lunar month (April–May), several pilgrimage days' },
      { label: 'Temple', value: 'Bà Chúa Xứ Temple, Sam Mountain (Núi Sam), Châu Đốc, An Giang' },
      { label: 'Scale', value: 'The Mekong Delta’s largest temple festival' },
      { label: 'Hub vs stage', value: 'Can Tho is the traveller hub; Châu Đốc is the mountain' },
    ],
    [
      'Fly to Can Tho, then continue by road to Châu Đốc (several hours). Border-trade traffic and festival coaches both thicken the highway in peak days.',
      'Overnight near Sam Mountain if you want night vigils and dawn. A same-day round trip from Can Tho is possible but rushed.',
    ],
    [
      'Dress modestly, keep cameras low in shrine rooms, and follow pilgrim flow. This is a living pilgrimage, not a floating-market add-on.',
      'Bring cash for offerings you choose to make, water, and shoes for the mountain paths. Confirm the lunar window; the gathering lasts more than one night.',
    ],
  ),
  'fest-khau-vai': visit(
    [
      { label: 'When', value: '26th–27th of the 3rd lunar month (usually April–May) — once a year' },
      { label: 'Village', value: 'Khâu Vai, Mèo Vạc district, Hà Giang' },
      { label: 'Communities', value: 'Hmong, Dao, and neighbouring highland groups' },
      { label: 'Miss it', value: 'The gathering does not repeat until the following year' },
    ],
    [
      'Hà Giang town is closer to the loop roads; Sapa is a common overnight if you are already in the northwest. The last stretch to Khâu Vai is mountain road.',
      'Use a driver or local guide if you do not know the pass. Motorbike loop riders should check weather — mist can close the slopes.',
    ],
    [
      'Ask before close portraits. Costume and song are public; personal meetings are not street theatre. There is no box office — you arrive on the right lunar days or you miss it.',
      'Do not splice this onto a Hà Giang loop “sometime in April.” Confirm the lunar date, then build the loop around it.',
    ],
  ),
  'fest-danang-fireworks': visit(
    [
      { label: 'Also called', value: 'DIFF — Da Nang International Fireworks Festival' },
      { label: 'Season', value: 'Typically several weekend nights in June–July; exact nights are announced each year' },
      { label: 'Stage', value: 'Han River, Dragon Bridge, and both banks' },
      { label: 'Entry', value: 'Riverbank viewing is public; some restaurants and hotels sell seated decks' },
    ],
    [
      'Fly into Da Nang. Stay on the river or in An Thượng / Mỹ Khê if you want to walk to a viewing layer. Hoi An is a short transfer but a long crawl back after the finale.',
      'Bridges and rails fill in the afternoon. Pick a bank, bridge, or beachfront deck and stay put once the first shells go up.',
    ],
    [
      'Check the year’s DIFF calendar before you lock Saturday nights. River hotels sell out on display weekends. Bring water; summer showers are common and the show usually continues.',
      'This is civic spectacle — no temple dress code, but crowd etiquette matters. Do not block emergency lanes on the bridges.',
    ],
  ),
  'fest-nhatrang-sea': visit(
    [
      { label: 'When', value: 'June civic festival week on Nha Trang Bay' },
      { label: 'Where', value: 'Trần Phú promenade, beachfront stages, and the bay' },
      { label: 'Tone', value: 'Open-air city festival — sports, parades, night programmes' },
    ],
    [
      'Cam Ranh (Nha Trang) Airport is the arrival. Stay on the bay if you want to walk into the programme; inland hotels mean taxis at the loudest hour.',
      'The promenade is the public stage. Po Nagar and the islands remain daytime sights; festival week adds the night layer on the same strip.',
    ],
    [
      'There is no single sacred ticket — programmes are municipal and change by year. Book the waterfront early; domestic holiday demand is the real constraint.',
      'If you want quiet sand, pick another month. June on this strip is for the civic party.',
    ],
  ),
  'fest-vu-lan': visit(
    [
      { label: 'When', value: '15th day of the 7th lunar month (usually August)' },
      { label: 'Roses', value: 'Red if one’s mother is living; white if she has passed — a widely observed filial custom' },
      { label: 'Tone', value: 'Remembrance and temple rites, not a street carnival' },
      { label: 'Visitor stages', value: 'Hoi An river lanterns and Hanoi pagoda yards are the most visited by travellers' },
    ],
    [
      'Nationwide — you do not need a special journey if you are already in a city with active pagodas. Hoi An and Hanoi are the photogenic visitor versions.',
      'Walk to a neighbourhood pagoda at dusk. In Hoi An the river is part of the picture; treat floating lights as ritual.',
    ],
    [
      'Dress modestly, keep voices down, and skip a loud bar crawl after. Confirm the lunar date; “August” is the usual civil month, not a fixed Gregorian night.',
      'No ticket is required for most temple yards. Follow local lead on offerings and photography inside halls.',
    ],
  ),
  'fest-mid-autumn': visit(
    [
      { label: 'Vietnamese', value: 'Tết Trung Thu — 15th day of the 8th lunar month' },
      { label: 'Usual month', value: 'September, sometimes early October' },
      { label: 'Look for', value: 'Star lanterns, lion dances, toys, mooncakes (including salted-egg-yolk and snow-skin styles)' },
      { label: 'Closures', value: 'Unlike Tết, shops generally stay open' },
    ],
    [
      'Any Vietnamese city works. Hanoi around Hoàn Kiếm, Hoi An alleys, and Ho Chi Minh City neighbourhood streets are the easiest visitor stages.',
      'The festival happens at child-height on ordinary market streets after dusk — not only on a postcard square.',
    ],
    [
      'Buy mooncake tins from a busy bakery if you want the food tradition; share if you are gifted a box. Lanterns are sold in toy streets in the days before the moon.',
      'Pin the lunar date for your year. Bring patience for crowds around Hoàn Kiếm and the Hoi An river; residential streets are kinder.',
    ],
  ),
  'fest-kate': visit(
    [
      { label: 'Who', value: 'Principal festival of the Cham community in Ninh Thuận' },
      { label: 'Towers', value: 'Po Klong Garai and Po Re Me, inland toward Phan Rang' },
      { label: 'When', value: 'Usually October, on the Cham ceremonial calendar' },
      { label: 'Base', value: 'Nha Trang or Phan Rang — the rite is not on Trần Phú beach' },
    ],
    [
      'Overnight in Nha Trang or Phan Rang, then go inland to the brick towers for ceremony hours. This is a dedicated morning or afternoon, not a beach stroll.',
      'Private car or a local tour is the practical transfer. Confirm which tower holds the main rite in the year you travel.',
    ],
    [
      'Dress respectfully, leave space for priests and dancers, and follow what the community allows with cameras. Kate is living heritage, not a costume show for the resort strip.',
      'There is no beach-club ticket. You go to the sanctuary at the announced hours or you miss the public ceremony.',
    ],
  ),
  'fest-ooc-om-boc': visit(
    [
      { label: 'Who', value: 'Khmer communities of the Mekong Delta' },
      { label: 'When', value: 'November — moon festival at the end of the rainy season' },
      { label: 'Signature', value: 'Ngo boat races, pagoda gatherings, Apsara dance' },
      { label: 'Heartlands', value: 'Sóc Trăng and Trà Vinh; Can Tho is the usual traveller hub' },
    ],
    [
      'Fly to Can Tho, then continue to Sóc Trăng or Trà Vinh for race and pagoda days. Waterways, not a single square, are the stage for the boats.',
      'Local buses and cars both work. Ask in Can Tho which race days are on in the week you arrive — the programme is local, not a national e-ticket.',
    ],
    [
      'Treat pagodas as active Theravada worship. The races are the public spectacle; moon rites are the meaning. Dress modestly at temples.',
      'If your November route already includes the delta, time an overnight for the races. A Cai Rang floating-market morning is not a substitute.',
    ],
  ),
  'perf-water-puppet': visit(
    [
      { label: 'Vietnamese', value: 'Múa rối nước — water puppetry of the Red River Delta' },
      { label: 'Best-known house', value: 'Thăng Long Water Puppet Theatre, 57B Đinh Tiên Hoàng, Hoàn Kiếm, Hanoi' },
      { label: 'Shows', value: 'Year-round indoor programmes; several slots on typical evenings — check the theatre’s current bill' },
      { label: 'Length', value: 'A short seated show, built to fit a city night' },
    ],
    [
      'Stay in Hanoi’s Old Quarter or around Hoàn Kiếm Lake. The famous theatre sits on the lake’s edge — a walk for most central hotels.',
      'Book on the theatre’s own channels or a reputable desk. Earlier evening slots are often easier for seats and for an English-friendly house.',
    ],
    [
      'This is a ticketed indoor performance, not a street festival. Buy a seat; do not expect a free courtyard version at the same standard.',
      'Combine with hát chèo if you want the north’s folk pair. After the curtain, the lake walk is the interval — especially on wet nights.',
    ],
  ),
  'perf-ca-tru': visit(
    [
      { label: 'Form', value: 'Chamber singing — vocalist, đàn đáy lute, and praise drum' },
      { label: 'Heritage', value: 'UNESCO Intangible Cultural Heritage (2009), listed as in need of safeguarding' },
      { label: 'Setting', value: 'Small Hanoi clubs and heritage houses — scheduled sets, not a nightly stadium show' },
    ],
    [
      'Hanoi is the practical city. Ask your hotel or a heritage venue for the week’s ca trù night; listings change and are not on every corner.',
      'Do not expect the same bill in Hoi An or Saigon. Pair it with a quiet Old Quarter evening.',
    ],
    [
      'Sit still and listen. Applause follows the drum more than a pop chorus. Dress ordinary-smart. Phones down unless the house allows photos between pieces.',
      'There is no drop-in folklore stall. If no set is listed the week you are in town, skip rather than substituting a hotel lobby “show.”',
    ],
  ),
  'perf-nha-nhac': visit(
    [
      { label: 'Form', value: 'Nhã nhạc — ceremonial music of the Nguyễn court' },
      { label: 'Heritage', value: 'UNESCO Intangible Cultural Heritage (proclaimed 2003; inscribed 2008)' },
      { label: 'Rooms', value: 'Hue Imperial City and Duyệt Thị Đường Royal Theatre' },
      { label: 'When', value: 'Year-round visitor programmes; ceremonial calendars add extra court dates' },
    ],
    [
      'Fly or train to Hue. The citadel is the room — stay near the Imperial City or the Perfume River so you are not crossing town for a seated hour.',
      'A citadel ticket plus a theatre slot is the straightforward path. Do not count on catching a courtyard rehearsal by accident.',
    ],
    [
      'Give it a seated hour, not a walk-by. The texture is ensemble and ceremonial rather than a star vocalist.',
      'Combine with a tomb or Thiên Mụ pagoda day so the court layer and the landscape layer share the same stay. Check the royal theatre’s bill when you arrive.',
    ],
  ),
  'perf-cai-luong': visit(
    [
      { label: 'Form', value: 'Southern reformed opera — spoken drama, guitar, and sung melody' },
      { label: 'City', value: 'Ho Chi Minh City theatres and cultural houses' },
      { label: 'When', value: 'Year-round; weekly bills change' },
    ],
    [
      'This is a Saigon evening. Stay central enough to reach a playhouse without an hour of traffic at curtain. Ask the hotel or a theatre listing the week you arrive.',
      'It is not a Hanoi import and not a Hue court programme. You look up tonight’s title rather than waiting for a festival date.',
    ],
    [
      'A synopsis helps if you do not speak Vietnamese; costume, gesture, and the guitar’s slide still carry the plot. Shows can run longer than a puppet hour — eat first.',
      'Buy a theatre ticket. Hotel “cultural dinner shows” are not a substitute for cải lương on a city stage.',
    ],
  ),
  'perf-hat-cheo': visit(
    [
      { label: 'Form', value: 'Hát chèo — northern folk opera from Red River Delta villages' },
      { label: 'City stages', value: 'Hanoi theatres; some programmes sit near the water-puppet circuit' },
      { label: 'Tone', value: 'Satire, stock characters, percussion, and a commenting chorus' },
    ],
    [
      'Hanoi is where visitors can buy a seat. The delta villages remain the origin. Look up the week’s bill when you arrive.',
      'Combined with water puppets, it is the north’s folk-performance pair: one on water, one on boards.',
    ],
    [
      'Treat it as theatre you sit for, not a five-minute hotel-lobby snack. Expect percussion and stock types — farmers, mandarins, tricksters.',
      'Tickets are for the listed house that week. If chèo is not on, do not force a substitute from another region’s opera.',
    ],
  ),
}

export function getEventVisitGuide(id: string): EventVisitGuide | undefined {
  return EVENT_VISIT_GUIDES[id]
}
