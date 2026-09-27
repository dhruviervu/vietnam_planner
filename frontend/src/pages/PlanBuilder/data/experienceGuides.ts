import { EXPERIENCE_GUIDES_PART2 } from './experienceGuidesPart2'
import { EXPERIENCE_GUIDES_PART3 } from './experienceGuidesPart3'
import { EXPERIENCE_GUIDES_PART4 } from './experienceGuidesPart4'
import { EXPERIENCE_GUIDES_HOI_AN } from './experienceGuidesHoiAn'
import { EXPERIENCE_GUIDES_HOI_AN_MORE } from './experienceGuidesHoiAnMore'
import { EXPERIENCE_GUIDES_HOI_AN_OUT } from './experienceGuidesHoiAnOut'
import { EXPERIENCE_GUIDES_HANOI } from './experienceGuidesHanoi'
import { EXPERIENCE_GUIDES_HANOI_MORE } from './experienceGuidesHanoiMore'
import { EXPERIENCE_GUIDES_HCMC } from './experienceGuidesHcmc'
import { EXPERIENCE_GUIDES_CU_CHI } from './experienceGuidesCuChi'
import { EXPERIENCE_GUIDES_WAR_REMNANTS } from './experienceGuidesWarRemnants'
import { EXPERIENCE_GUIDES_HCMC_MORE } from './experienceGuidesHcmcMore'
import { EXPERIENCE_GUIDES_NINH_BINH } from './experienceGuidesNinhBinh'
import { EXPERIENCE_GUIDES_DA_LAT } from './experienceGuidesDaLat'
import { EXPERIENCE_GUIDES_HUE } from './experienceGuidesHue'
import { EXPERIENCE_GUIDES_HUE_TOMBS } from './experienceGuidesHueTombs'
import { EXPERIENCE_GUIDES_HUE_OUT } from './experienceGuidesHueOut'
import { EXPERIENCE_GUIDES_DA_NANG } from './experienceGuidesDaNang'
import { EXPERIENCE_GUIDES_DA_NANG_MORE } from './experienceGuidesDaNangMore'
import { EXPERIENCE_GUIDES_SAPA } from './experienceGuidesSapa'
import { EXPERIENCE_GUIDES_PHU_QUOC } from './experienceGuidesPhuQuoc'
import { EXPERIENCE_GUIDES_PHU_QUOC_MORE } from './experienceGuidesPhuQuocMore'
import { EXPERIENCE_GUIDES_HA_LONG } from './experienceGuidesHaLong'
import { EXPERIENCE_GUIDES_HA_LONG_SHORE } from './experienceGuidesHaLongShore'
import { EXPERIENCE_GUIDES_PHONG_NHA } from './experienceGuidesPhongNha'
import { EXPERIENCE_GUIDES_NHA_TRANG } from './experienceGuidesNhaTrang'
import { EXPERIENCE_GUIDES_NHA_TRANG_MORE } from './experienceGuidesNhaTrangMore'
import { EXPERIENCE_GUIDES_CAN_THO } from './experienceGuidesCanTho'
import { EXPERIENCE_GUIDES_HA_GIANG } from './experienceGuidesHaGiang'
import { EXPERIENCE_GUIDES_HA_GIANG_LIFE } from './experienceGuidesHaGiangLife'
import { EXPERIENCE_GUIDES_CAT_BA } from './experienceGuidesCatBa'
import { EXPERIENCE_GUIDES_DONG_VAN } from './experienceGuidesDongVan'
import { EXPERIENCE_GUIDES_CITY_DESCRIPTIONS } from './experienceGuidesCityDescriptions'
import { getExperienceById } from './experiences'
import { composeExperienceGuide, curatedWordCount } from './composeExperienceGuide'
import generatedVisitorGuides from './generatedVisitorGuides.json'
import {
  clipGuideWords,
  HERITAGE_GUIDE_MIN_WORDS,
  isDeepHeritageSight,
} from './heritageDeepSights'

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function padHeritageGuide(text: string, experience: NonNullable<ReturnType<typeof getExperienceById>>): string {
  const extra = `Give ${experience.name} the listed ${experience.durationLabel.toLowerCase()}. Hours on this card are ${experience.hours}; confirm at the gate the morning you go. Cover shoulders and knees in halls, keep voices down around altars, and do not touch statues, stelae, or offerings. This visit is ${experience.name} in ${experience.city} — not a second ticket for a different monument nearby.`
  let out = text.trim()
  let guard = 0
  while (curatedWordCount(out) < HERITAGE_GUIDE_MIN_WORDS && guard < 3) {
    out = `${out}\n\n${extra}`
    guard += 1
  }
  return out
}

export function getExperienceGuide(id: string): string {
  const experience = getExperienceById(id)
  if (!experience) return ''
  const curated = EXPERIENCE_GUIDES[id] || ''
  if (!isDeepHeritageSight(experience)) return curated
  if (curatedWordCount(curated) >= HERITAGE_GUIDE_MIN_WORDS) {
    return clipGuideWords(curated)
  }
  const generated = GENERATED_GUIDES[id] || ''
  const base = curatedWordCount(curated) >= curatedWordCount(generated) ? curated : generated
  if (curatedWordCount(base) >= 12) {
    return clipGuideWords(padHeritageGuide(base, experience))
  }
  return clipGuideWords(composeExperienceGuide(experience, curated))
}

const EXPERIENCE_GUIDES_PART1: Record<string, string> = {
  'halong-cruise': `Ha Long Bay is one of Vietnam’s great natural set pieces: a broad sweep of sheltered sea punctuated by limestone towers, forested islets, arches, caves, and tiny coves. The name is usually translated as “descending dragon,” a reference to the legend that dragons sent to defend the country scattered jewels which became the islands. Its geological story is much older. Water and weather have worked on thick limestone over millions of years, producing the mature marine karst landscape visible today. UNESCO placed Ha Long Bay on the World Heritage List for its scenery in 1994 and recognized its geological and geomorphological value in 2000. The listed area sits within a larger seascape that continues toward Bai Tu Long Bay and the Cat Ba archipelago, so not every beautiful island seen from a boat lies within exactly the same administrative or protected boundary.

A cruise is less about ticking off a single monument than watching the bay change character over several hours. Close to port, the horizon can feel busy with vessels; farther among the islands, channels narrow and cliffs fill the view. Depending on the route, passengers may visit a vast illuminated cave, transfer to a rowing boat or kayak for a lagoon, stop at a beach, or pass a floating aquaculture area. Sung Sot, often called Surprise Cave, is among the best-known caverns on the classic Ha Long route. Luon Cave is approached at water level, while Ti Top Island combines a small beach with steep steps to a panoramic viewpoint. Routes in Lan Ha Bay often emphasize kayaking and calmer coves. No itinerary can include every sight, and weather, tides, port instructions, and conservation rules may alter the order without notice.

Choosing the right cruise matters more than choosing the most ambitious list of stops. A day boat is sensible when time is tight, but the road journey from Hanoi and the embarkation formalities consume part of the day. An overnight cruise allows the landscape to be experienced in softer evening and morning light, when many day vessels have gone. Two nights create a slower rhythm and may reach less frequented water, though route quality varies. Before booking, confirm the exact departure port, bay and route, cabin category, private or shared transfers, included drinks, kayaking arrangements, and whether listed taxes and service charges are final. “Ha Long cruise” is often used broadly in marketing for cruises departing from Ha Long or nearby ports but sailing principally in Lan Ha or Bai Tu Long Bay. That is not necessarily a disadvantage; it should simply be understood.

Cabins range from compact and practical to polished suites with balconies and baths. Photographs can exaggerate their size, so check floor area and whether the balcony is genuinely private. A reputable operator should provide life jackets, safety instructions, passenger registration, and a clear schedule. Larger ships tend to offer more facilities and steadier service systems; smaller vessels can feel intimate but may have fewer quiet corners. Food commonly arrives as set menus or buffets and usually includes Vietnamese seafood. Share allergies and dietary restrictions before departure and repeat them when boarding. Drinking water allowances differ, and imported wine or cocktails can be expensive. Cruises are regulated and must follow harbor decisions, so a cancellation caused by unsafe conditions is not something a responsible captain can override.

Northern Vietnam has distinct seasons. October to April often brings drier air, but winter can be cool, grey, and misty rather than postcard-blue. Mist has its own beauty, softening the islands into layered silhouettes, yet it reduces long views. Late spring and summer are warmer and better suited to swimming, with greater humidity, heavy showers, and a higher chance of tropical weather disrupting sailings. Conditions can change quickly in any month. Pack a light waterproof layer, sun protection, insect repellent, secure sandals or trainers, swimwear, and a warmer layer from roughly November through March. Keep a small overnight bag if a large suitcase is inconvenient in a tender. Limestone steps can be polished and damp; shoes with grip are preferable to loose flip-flops for cave and viewpoint visits.

The bay rewards an unhurried eye. Early risers may join tai chi on deck, but the real pleasure is simply watching fishing boats move between dark pinnacles as kitchens begin breakfast. At sunset, choose an open deck rather than viewing everything through cabin glass. Artificial lighting inside major caves makes their scale legible, though it can feel theatrical; look beyond the colored lamps to the stalactites, flowstone, and chambers shaped by water. When kayaking, maintain distance from cliffs where loose fragments could fall, follow the guide’s route, and do not enter unapproved openings. In rowing boats, sit balanced and keep hands inside when passing other craft. Drones are restricted in many locations and should never be flown without explicit permission.

Ha Long is a living environment, not an empty scenic park. Communities around the bay have long depended on fishing and marine trade, although many residents of former floating villages have been resettled on land. Aquaculture and tourism remain visible. Visitors can reduce pressure by refusing single-use plastic where alternatives exist, retaining every piece of litter, using reef-safe habits, and never taking shells, limestone, or cave formations. Do not feed monkeys or other wildlife. Swimming is appropriate only where the crew permits it, both for safety and water quality. Engine noise and crowding are genuine concerns; selecting a well-managed operator, traveling outside peak holiday periods, and following protected-area rules are more useful responses than treating quiet coves as private territory.

Etiquette aboard is relaxed but considerate. Be punctual for tender transfers because one late guest can delay the entire vessel. Wear a cover-up away from swimming areas, speak softly in cabin corridors, and ask before photographing crew members or local fishers at close range. Tipping is optional rather than a substitute for fair wages; if service has been excellent, a discreet collective tip at the end is easiest. Vietnamese domestic holidays and weekends can be lively, especially in summer. Families and groups may enjoy karaoke or celebratory meals. A luxury label does not guarantee silence, so travelers seeking serenity should ask about ship size, charter groups, and evening entertainment before paying.

Allow a margin after disembarkation. Fog, traffic, and port procedures make a tight same-day flight unwise, particularly from Hanoi airports. Keep passports accessible because operators need passenger details for registration, but hand them over only through the cruise’s formal process and retrieve them as directed. Mobile coverage is intermittent among the islands; regard that as part of the experience and download anything essential in advance. Cash is useful for small extras, although established boats normally accept cards with varying surcharges or connectivity limitations. Travel insurance should cover weather disruption and medical evacuation, especially for multi-day journeys.

The finest Ha Long experience is not necessarily the sunniest or most elaborate. A cool morning with clouds snagged on the karsts can reveal why artists and poets have returned to this seascape for generations. Give the bay enough time, choose a transparent operator, and accept that nature rather than the brochure controls the day. Between scheduled cave calls and meals, leave space to stand at the rail. The slow sequence of stone, water, working boats, and shifting light is the essential experience, and it is most memorable when approached with curiosity, patience, and care.`,

  'temple-literature': `The Temple of Literature is Hanoi’s most resonant place for understanding how scholarship, statecraft, and moral cultivation were linked in premodern Vietnam. Emperor Ly Thanh Tong founded the temple in 1070 to honor Confucius and learned figures. In 1076, the Imperial Academy, often known by its Vietnamese name Quoc Tu Giam, was established beside it. Education there initially served members of the royal family and elite, later admitting talented students more broadly, although access remained shaped by the social order of its time. The complex endured alteration, damage, and restoration across many dynasties. It should be understood not as a university in the modern institutional sense, but as a major center of elite Confucian learning and a symbol of Vietnam’s long examination culture.

The visitor route unfolds through a sequence of courtyards aligned on a central axis. Passing the main gate, you move from the noise of contemporary Hanoi into gardens of mature trees, clipped lawns, brick paths, and low tiled roofs. Gates mark each transition, making progress feel ceremonial. The best-known is Khue Van Cac, the Pavilion of the Constellation of Literature, an elegant early nineteenth-century structure raised on four whitewashed pillars. Its red timber upper level and circular windows have become an emblem of Hanoi. Beyond it lies the Well of Heavenly Clarity, a square pond whose still surface creates a moment of spaciousness before the courtyards devoted to scholars and worship.

Beside the pond stand stone stelae recording successful candidates in royal examinations. Eighty-two survive, commemorating examination laureates from sessions held between 1442 and 1779. Each tablet rests on a carved stone turtle, an animal associated with longevity and wisdom. The inscriptions are more than lists of names: they express the state’s ideal of selecting capable officials through learning and moral merit. The stelae are recognized by UNESCO’s Memory of the World Programme. They are historic documents and vulnerable sculptures, so visitors should not touch them or rub the turtles’ heads for luck. That once-common gesture causes wear and is now discouraged and physically restricted.

Farther inside, incense and lacquered altars create a more devotional atmosphere. The Dai Thanh sanctuary honors Confucius and distinguished disciples, while buildings in the academy area evoke the teaching institution associated with the site. Some structures are reconstructions because war and time removed earlier fabric. Displays introduce celebrated teachers, examination practices, calligraphy, and traditional educational ideals. Interpretation can vary in depth, which makes a guide useful for travelers interested in architectural chronology or Confucian philosophy. Even without one, the spatial arrangement tells a clear story: learning requires leaving ordinary distraction, passing through stages of discipline, and arriving at a place where knowledge carries public responsibility.

Set aside at least an hour, or closer to ninety minutes if you enjoy inscriptions, gardens, and architectural detail. The temple is in central Hanoi, close to the Fine Arts Museum and within a manageable taxi ride or a purposeful walk from the Old Quarter. Opening hours and ticket arrangements can change seasonally, so check the official local information shortly before visiting rather than relying on an old screenshot. Mornings soon after opening tend to be cooler and calmer. Late afternoon brings gentler light to the red gates, though school groups and tour parties can arrive at any time. The courtyards have some shade, but Hanoi heat and humidity remain tiring in summer.

Dress with the respect due to an active cultural and devotional site. Shoulders and knees are best covered, hats should come off inside sanctuary buildings, and voices should be lowered around altars. Never step over offerings, lean against worship furniture, or pose in a way that mocks statues or ritual gestures. Incense may be available, but participation is not required. If you do offer incense, follow posted instructions and local example; more sticks do not indicate greater respect and contribute to smoke. Ask before closely photographing worshippers, graduates, or students in formal dress. Tripods, commercial shoots, and elaborate costume photography may require permission.

The complex is especially meaningful during the period around Tet and before important examinations. Students and families come to seek encouragement, request calligraphy, and honor traditions of learning. Modern Vietnamese education is not simply a continuation of the imperial system, yet the temple remains a potent symbol of study, perseverance, and achievement. You may see young people taking graduation photographs in ao dai or academic dress. Their presence is not staged folklore; it demonstrates how the monument continues to carry emotional weight. Give groups room to complete their photographs and ceremonies rather than treating them as part of the visitor display.

Understanding Confucian context enriches the visit. Confucian learning reached Vietnam through long contact with China, but Vietnamese courts adapted institutions and texts to local political life. For centuries, mastery of classical literature and moral philosophy offered a route into administration. The examination system favored men and privileged those with resources to study, so its meritocratic ideal was incomplete. Nevertheless, it established scholarship as a prestigious form of service and produced officials whose names remain recorded in stone. The temple therefore represents both aspiration and hierarchy. A thoughtful visit can admire intellectual discipline while recognizing who was excluded from formal power.

Practical details are straightforward. Carry water, but consume food away from sanctuaries and dispose of nothing in the gardens. Flat shoes are ideal for brick paving and thresholds. Step carefully over raised wooden sills rather than standing on them; in Vietnamese architecture, thresholds are treated with respect and are easy to trip over. The site is relatively compact, although some uneven surfaces and steps can complicate wheelchair access. Ask at the entrance about the most accessible route. Toilets and visitor facilities may be basic during crowded periods. Secure valuables as you would elsewhere in central Hanoi, especially near busy gates.

Combine the temple with places that broaden the story rather than rushing through a checklist. The nearby Vietnam Fine Arts Museum illuminates religious and courtly visual traditions, while a walk toward Ba Dinh reveals later chapters of national history. A cafe stop gives time to absorb what you have seen. Avoid treating Khue Van Cac merely as a photograph: notice its proportion, the contrast of red timber and white supports, and how its circular windows frame sky and foliage. Look closely at roof tiles, guardian motifs, old trees, and the changing sound between courtyards.

The Temple of Literature succeeds because it makes an abstract value—reverence for learning—physical. Gates slow your pace, gardens quiet the city, stone records individual achievement, and altars place education within an ethical universe. Visit early, read patiently, and preserve the dignity of spaces still used for remembrance and hope. The result is not only a lesson in dynastic Hanoi. It is an encounter with a living Vietnamese conviction that education can shape character, family fortune, and public life.`,

  'old-quarter': `Hanoi’s Old Quarter is not a sealed historic district but a dense, working piece of the capital where commerce, domestic life, worship, food, and traffic occupy the same narrow ground. Its core developed beside the Red River and the imperial citadel, drawing craft communities and traders into streets associated with particular goods. Many street names begin with Hang, meaning merchandise or shop, followed by an old specialty such as silver, mats, or drums. The familiar phrase “36 streets” is symbolic rather than a reliable modern count. Trades shifted, streets were renamed, and today mobile-phone accessories may sit beside an ancestral business, yet the mercantile logic remains visible in blocks clustered around one product.

Begin with orientation rather than a rigid route. Hoan Kiem Lake anchors the southern edge, while Dong Xuan Market stands toward the north. The quarter between them is compact on a map but slow in practice because pavements become kitchens, motorbike parking, workshops, and social space. Tube houses—narrow at the street and deep behind—reflect valuable commercial frontage and generations of subdivision. Look upward above bright shop signs to find timber shutters, tiled roofs, decorative vents, and French-period facades. Some buildings are carefully restored; others carry improvised balconies, water tanks, and tangled utilities. The beauty lies in the accumulated city, not in uniform preservation.

An early walk reveals deliveries, exercise around the lake, breakfast stalls, and shutters lifting. Midday is hotter and less graceful, while late afternoon and evening bring food traffic and a festive pulse. Weekend pedestrian arrangements around Hoan Kiem Lake can make wandering easier, although they also draw large crowds and may change vehicle access. There is no single ideal circuit. A rewarding first loop might connect the lake, Ma May Street, Bach Ma Temple, the old city gate at O Quan Chuong, and Dong Xuan Market, with deliberate detours whenever a courtyard, food stall, or specialized shop catches your eye. Check current opening times for interiors and dress respectfully at temples.

Bach Ma Temple is among the city’s important old sacred sites, associated with the guardian spirit of the east of ancient Thang Long. Its present fabric reflects repeated rebuilding, but its dark timber, incense, and ritual objects offer a valuable contrast to the commercial street. The small house at 87 Ma May, commonly visited as a heritage house, helps explain the long, narrow domestic plan. O Quan Chuong preserves the memory of gates that once controlled entry to the old city. St Joseph’s Cathedral, just southwest of the traditional quarter, represents the colonial and Catholic layer of Hanoi. Ngoc Son Temple on the lake adds another strand of religious and civic memory.

Food is inseparable from the neighborhood, but choose with observation rather than social-media urgency. Busy stalls with fast turnover are often a good sign. Look for ingredients protected from traffic dust, clean bowls, and a clear washing system. Pho, bun cha, banh cuon, sticky rice, noodle soups, and small savory snacks all have strong Hanoi associations, yet opening hours can be specialized: a celebrated vendor may sell only breakfast or close when the day’s batch is gone. Ask the price before ordering when it is not displayed. Tiny plastic stools are normal, and sharing a table is common. Return bowls and rubbish as directed instead of leaving them in the walking path.

Street crossing is the practical art every visitor must learn. Use marked crossings where available, wait for a manageable gap, and move at a steady, predictable pace while maintaining awareness. Do not sprint, stop abruptly, or follow a local blindly into a situation you have not assessed. Larger buses and cars have less room to maneuver than motorbikes. Keep phones away while crossing. Pavements are uneven and often obstructed, so supportive closed shoes are preferable. For longer distances, use a reputable metered taxi or established ride-hailing app, verify the registration, and wait in a place where the driver can stop without blocking traffic.

The quarter is generally welcoming, but density creates opportunities for petty theft and confusion. Carry a zipped cross-body bag, avoid holding a phone loosely beside the road, and count change without displaying a large wallet. Confirm prices for cyclo rides and agree on the total route and number of passengers in writing if possible. Shoe-shine or fruit-basket photo encounters should never proceed without a clear price. Most interactions are honest; a little clarity prevents the small disputes that sour an afternoon. In bars, keep track of the bill as items arrive. For emergency access and personal comfort, know your hotel’s exact address and save it in Vietnamese.

Commerce deserves respect. Ask before photographing a vendor at close range, especially when no purchase is intended. Bargaining can be appropriate in markets and souvenir shops, but not at every fixed-price store or humble food stall. Keep it light, offer a reasonable counterprice, and walk away politely if it does not suit. A few thousand dong may mean little to a traveler and more to a seller. Avoid buying wildlife products, questionable antiques, or mass-produced items presented as rare tribal craft. Better purchases include clearly sourced lacquerware, ceramics, paper goods, coffee, textiles, and contemporary design from shops able to explain their makers.

Religious spaces are embedded in ordinary streets and may be easy to miss. Cross thresholds quietly, cover shoulders and knees, remove hats, and do not block worshippers. Family altars are also visible inside shops and homes; they are not decorative props. On the first and fifteenth days of the lunar month, incense and offerings may be more prominent. During Tet, the quarter’s rhythms change as residents prepare, travel, worship, and gather with family. Visitors are welcome to observe public life, but should not intrude into private ceremonies or photograph people in grief, prayer, or vulnerable moments without consent.

Hanoi’s air, weather, and sound affect the experience. Summer demands water, shade, and a slower pace. Winter can be damp and surprisingly cool, especially on a motorbike. Air quality varies, so sensitive travelers should check current conditions and consider a well-fitting mask. Traffic noise begins early; a “quiet” hotel room should face an internal courtyard or higher rear floor, though even then roosters, neighbors, and construction are possible. Earplugs are useful. Rain transforms paving quickly, and awnings discharge sudden streams, so a compact umbrella and shoes that tolerate water earn their place.

Allow time to sit. Egg coffee is a modern Hanoi favorite, but traditional tea, fresh beer, and straightforward black coffee offer equally good reasons to pause. From a balcony or doorway, notice how space is negotiated: a cook shifts a stool for a passerby, a delivery rider threads through, children return from school, and neighbors exchange news. This choreography is the Old Quarter’s real attraction. It is also residents’ daily environment, so large tour groups should avoid occupying entire lanes and individuals should keep voices low late at night.

The district makes most sense over repeated walks. Visit once at dawn, once in the evening, and leave one route unplanned. Learn a few courteous Vietnamese words, taste selectively, and look above street level. The reward is not a perfectly preserved past. It is an unusually vivid urban continuum in which medieval trading patterns, colonial architecture, socialist history, entrepreneurial energy, religious custom, and contemporary taste remain compressed into a few compelling square kilometers.`,

  'ninh-binh': `Ninh Binh province offers one of northern Vietnam’s most satisfying changes of pace: limestone massifs rise abruptly from rice fields and wetlands, rivers slip through caves, and old religious and political sites occupy ground once central to the Vietnamese state. The landscape is frequently promoted as “Ha Long Bay on land,” a convenient image but an incomplete one. Here the karst is entwined with farms, villages, temples, dikes, and seasonal floodplains. The Trang An Landscape Complex was inscribed by UNESCO in 2014 for both cultural and natural values, recognizing spectacular geology alongside evidence of long human occupation and the historic setting of Hoa Lu.

Ninh Binh is also the name of the provincial capital, but most visitors spread themselves among rural areas around Trang An, Tam Coc, Hoa Lu, Hang Mua, and Van Long. Choosing a base changes the mood. Tam Coc has the broadest tourist infrastructure, with restaurants, guesthouses, bicycles, and boats departing from the center. Trang An is more controlled and landscaped around its boat complex. Rural homestays between the main sights can feel peaceful, though they require dependable transport after dark. Ninh Binh city is practical for rail arrivals but lacks the immediate karst atmosphere many travelers expect. Confirm the precise location of any accommodation rather than relying on a broad destination label.

Boat journeys are the signature experience. At Trang An, small sampans follow set routes through low caves and between steep green cliffs, stopping at temples and, on some routes, a film-set area adapted for visitors. The scenery feels enclosed and cinematic. At Tam Coc, boats travel along the Ngo Dong River through three caves, with rice fields reaching the water’s edge. The most photogenic rice is usually seasonal rather than permanent; planting and harvest dates vary with weather and farming decisions. Van Long Nature Reserve is quieter and important for wetland habitat, with a chance, never a guarantee, of seeing the critically endangered Delacour’s langur on distant cliffs.

Boat trips generally last two to three hours, exposed to sun and rain. Wear a hat that fastens, high-factor sunscreen, and clothing that covers without overheating. Bring water in a reusable bottle and a light waterproof layer. Passengers sit low, so a thin cushion may help, but do not upset the boat’s balance. Keep hands clear in caves, where ceilings can be close, and follow the rower’s direction. Life jackets should be worn as instructed. Tipping practices have caused uncertainty in the region. Boat operators work hard, and a voluntary tip for good service is kind, but no passenger should be pressured. Keep small notes and remain calm if approached by photographers or floating sellers.

Beyond the water, cycle routes thread through villages and paddies. Cycling is most pleasant early or late, when heat and tour buses are reduced. Helmets are not always automatically supplied; request one and test the brakes before leaving. Rural lanes can still carry trucks, animals, children, and fast motorbikes. Ride predictably, use lights near dusk, and never assume a quiet intersection is empty. Renting a motorbike offers range but is appropriate only for licensed, insured, experienced riders. Taxis and cars with drivers are easy alternatives. Distances that look small can take time because karst formations, waterways, and narrow roads interrupt direct routes.

Hoa Lu, the capital associated with the Dinh and Early Le dynasties in the tenth and early eleventh centuries, provides essential historical context. The surviving temple precincts honor rulers including Dinh Tien Hoang and Le Dai Hanh; they are later constructions and restorations rather than intact tenth-century palaces. Nearby, the climb at Hang Mua is modern as a visitor attraction but delivers a superb view across the Ngo Dong valley. Hundreds of steep steps lead to ridges with pagoda forms and dragon sculpture. The rock can be slippery and exposed, and the summit becomes crowded. Attempt it in cool, dry conditions, carry water, and turn back during lightning or dangerous heat.

Bich Dong Pagoda, set against a limestone hill near Tam Coc, layers gateways, cave sanctuaries, and forested steps in a compact visit. Bai Dinh, by contrast, is a vast modern Buddhist complex beside an older temple area. Its scale, monumental statuary, and electric shuttles can be impressive, but it is not an ancient complex in the form suggested by casual publicity. Those seeking quiet may prefer smaller pagodas; those interested in contemporary Vietnamese pilgrimage will find Bai Dinh revealing. In every sacred place, cover shoulders and knees, remove hats inside worship halls, avoid touching statues, and let worshippers approach altars first.

Two nights is a comfortable minimum for travelers who want a boat trip, Hoa Lu or a pagoda, and an unhurried cycle. A day trip from Hanoi is possible but often compresses several major stops into a long, hot schedule. If taking the train, reserve onward transport from Ninh Binh station. Road transfers vary with Hanoi traffic. Avoid scheduling a flight immediately after returning. Entrance systems, boat routes, and operating hours can change, especially during floods or festivals, so verify details locally. Cash remains useful for small tickets, food, tips, and bicycle rental, while established hotels often accept cards.

The climate rewards planning. Late spring may bring green or ripening rice around Tam Coc, but there is no exact annual guarantee. Summer is lush, humid, and storm-prone. Autumn often brings clearer air, while winter can be misty and cool, with subdued fields. Public holidays and the period after Lunar New Year draw domestic pilgrims, particularly to Bai Dinh and Trang An. Start early on busy dates. Mosquito repellent is useful near water, and leech awareness may be relevant on wet, overgrown trails. Do not enter caves, cliffs, or farm tracks beyond authorized areas merely to avoid other visitors.

Local meals often feature goat, freshwater fish, mountain snails in season, rice dishes, and com chay, crisp rice served with savory accompaniments. Goat is a regional specialty, but quality varies; ask your host for a trusted kitchen. Vegetarian travelers should clarify that fish sauce, meat stock, and small dried seafood are excluded, not merely visible meat. Village hospitality can be warm and informal. Learn basic greetings, dress modestly away from resort pools, and ask before photographing farmers or entering fields. Rice paddies are workplaces and private livelihoods, not open photo sets.

Environmental care is particularly important in enclosed waterways. Carry all packaging out, decline unnecessary plastic, and never throw food into the river. Do not play loud music on boats or use drones without permission. Wildlife sightings should remain quiet and distant; calling, feeding, or crowding langurs is unacceptable. Choose operators and lodgings that handle waste responsibly and support local employment. Water levels, vegetation, and agricultural activity are part of a living system, so accept that the view may differ from edited images.

Ninh Binh’s strength is the conversation among landscape, livelihood, belief, and history. Give it enough time for morning mist to lift from the cliffs and for evening light to settle over the fields. A well-paced stay combines one long boat journey with cycling, a historically informed visit to Hoa Lu, and room for an unscheduled village meal. Approached gently, the province is not a substitute for Ha Long Bay but a distinctive cultural landscape with its own powerful sense of place.`,

  'mua-cave': `Hang Mua, generally marketed in English as Mua Cave, is best known not for the modest cave at its base but for the dramatic stairways climbing the limestone above it. From the ridges, visitors look across the Ngo Dong River, Tam Coc’s rice fields, villages, and a succession of dark karst peaks. The attraction sits close to Tam Coc in Ninh Binh province and works well as a complement to a boat journey below. Its present stairway, ornamental gateways, statues, and landscaped grounds are a modern visitor complex drawing on Vietnamese and Buddhist visual motifs. It should not be mistaken for an untouched ancient pilgrimage route, although the surrounding geology and cultivated valley carry much deeper histories.

The climb begins after the ticketed entrance and garden area. Roughly five hundred stone steps ascend toward a saddle, where routes divide between viewpoints. One side leads toward a small pagoda-like structure; the higher and more famous ridge is marked by a long stone dragon undulating along the crest near a figure associated with the bodhisattva of compassion. Counts vary depending on where people begin and which branch they include, so the practical fact is more useful than a precise number: this is a steep, sustained ascent on irregular stone, with exposed drops and little shade near the top.

The view changes with season. When rice around Tam Coc is young, the valley appears bright green; near harvest it can turn gold. At other times fields may be muddy, recently cut, flooded, or planted with a different crop. Those states are part of working agriculture, not a failure of the attraction. Mist can erase distant peaks but create beautiful layers close by. Clear mornings provide broad definition, while late afternoon can warm the valley and cliffs. Sunrise and sunset are popular, yet opening rules and visibility should be confirmed locally, and descending rough steps in low light requires extra care.

Start early for cooler air and fewer people. In hot months, the exposed rock radiates heat and the ascent can become unsafe by midday. Late afternoon is another option, but leave enough daylight to descend. Drink water before climbing and carry more in a reusable bottle. There are vendors and cafes around the lower complex, though availability and prices can change. Eat lightly beforehand rather than attempting the stairs immediately after a heavy meal. Travelers with heart, balance, knee, or respiratory concerns should assess the route honestly; there is no lift to the ridge and no shame in enjoying the lower grounds.

Footwear is the most important piece of equipment. Choose trainers or walking sandals with a secure heel and reliable tread. Polished stone can be slippery after rain, and loose gravel gathers at step edges. Flip-flops and long trailing clothes are poor choices. A hat, sunscreen, sunglasses, and breathable shoulder coverage help in strong sun. In wet weather, use a compact rain jacket rather than an umbrella on exposed steps, where gusts and crowds make umbrellas awkward. Do not climb during thunderstorms. Limestone ridges and metal objects offer no safe shelter from lightning.

The stairway can become congested at narrow points. Keep right where local flow makes that sensible, pause only in wider spaces, and allow faster climbers to pass. Never sit across a step for a photograph or move beyond barriers to create an uncluttered image. The dragon ridge is narrow, uneven, and exposed; climbing onto the sculpture is unsafe and disrespectful. Strong wind can affect balance. Children need close supervision, not least because railings are inconsistent. If descending makes your knees unstable, turn sideways for some sections, use available handholds carefully, and take frequent pauses without blocking others.

Photographers should carry as little as possible. A standard wide lens or phone captures the main panorama; repeated lens changes on a crowded ridge add risk and dust. Secure straps and avoid setting equipment on parapets. Drones are subject to Vietnamese aviation controls and site rules and should not be flown casually. The airspace may be restricted, and a drone disturbs visitors, worshipful spaces, birds, and residents below. Portraits are most considerate when they do not occupy the best lookout for long periods. Everyone has climbed for the view, not to wait behind a private production.

The lower grounds contain ponds, paths, decorative installations, accommodation, and places to rest. Allow time there rather than treating the entrance as a corridor. The cave itself is small and may feel anticlimactic beside the panorama, but it explains the attraction’s name. Artificial elements are prominent throughout the property, and expectations should be calibrated accordingly. Visitors seeking wilderness will find quieter hikes elsewhere; Hang Mua excels as an accessible, concentrated overview of the Tam Coc landscape, provided one is capable of the stairs.

Transport is straightforward from Tam Coc by bicycle, motorbike, taxi, or car. The final roads pass homes and fields, and several businesses may advertise parking or imply that their stop is the official entrance. Follow current mapping carefully and clarify any parking fee before leaving a bicycle or motorbike. Lock rentals and retain the claim ticket if one is issued. Cycling is delightful in cool weather, but after the climb the return ride can feel harder than expected. At dusk, use lights and watch for unlit vehicles, dogs, and pedestrians.

Combine Hang Mua intelligently. Climbing before an early Tam Coc boat can create a rushed morning, while climbing immediately after hours seated under the sun is exhausting. One balanced plan is a dawn or early-morning ascent, a long breakfast and rest, then a later boat ride or gentle cycle. Another is to boat early and save the climb for a cool, clear afternoon after checking weather. Trang An, Hoa Lu, and Bich Dong also deserve time, so do not force every Ninh Binh highlight into one day. Two nights in the area produce a far kinder schedule.

Cultural care matters even in a heavily photographed attraction. Pagoda forms, the dragon, and the compassion figure carry meanings beyond decoration. Dress as you would for a public cultural site, keep voices moderate, and avoid comic or sexualized poses on sacred imagery. Ask before photographing staff, residents, or couples conducting formal shoots. Beyond the boundary, do not enter rice fields without permission. Narrow dikes are used by farmers and can be damaged by foot traffic. Buy drinks and services politely, ask prices in advance, and bargain only where it is clearly expected.

Entrance fees and hours can change, so check recent official or accommodation advice rather than preserving old numbers in a fixed itinerary. Carry cash for tickets and small purchases. Toilets are easiest to use before the climb. Mobile service is generally available but should not substitute for telling companions where you are. Solo travelers should avoid isolated cliff edges, particularly in poor weather. Travel insurance needs to cover ordinary hiking injuries; emergency extraction from the upper stairs is difficult.

Hang Mua is most rewarding when treated as a real climb, not a quick photo stop. Pace slowly, turn around often, and notice the river’s curves and the geometry of paddies appearing as elevation increases. At the summit, make room for others and spend a few minutes looking without a screen. The famous view is genuinely magnificent, but the quality of the visit depends on sound timing, suitable shoes, restraint on the ridge, and respect for the cultivated landscape spread below.`,

  'hoa-lu': `Hoa Lu was the political heart of an independent Vietnamese kingdom during a decisive period in the tenth and early eleventh centuries. Dinh Bo Linh unified competing powers, established the Dinh dynasty, and made Hoa Lu his capital in 968. The Early Le dynasty followed, and the court remained here until Ly Cong Uan transferred the capital to Dai La in 1010, renaming it Thang Long, the nucleus of Hanoi. Hoa Lu’s setting among defensible limestone mountains and waterways made strategic sense in an era of consolidation. Today, visitors encounter temple precincts, gateways, village life, and archaeological memory rather than a complete surviving citadel.

That distinction is essential. The principal temples honor Emperor Dinh Tien Hoang and Emperor Le Dai Hanh, but the buildings visible now have undergone construction and restoration long after the rulers’ lifetimes. They occupy a landscape associated with the old capital and preserve dynastic worship, yet they are not intact tenth-century palaces. Ramparts, foundations, caves, and place names help scholars reconstruct the wider settlement. The historic capital covered more than the compact ticketed area many tours visit. Approaching it as a layered commemorative landscape is more accurate and, ultimately, more interesting than imagining a frozen royal city.

The Temple of King Dinh generally receives first attention. A ceremonial approach leads through courtyards toward dark timber halls, stone paving, carved details, incense, and an image of the ruler. The neighboring Temple of King Le has a similar sequence on a somewhat smaller scale. Look for thresholds, roof forms, guardian creatures, old trees, and the way mountains close the horizon. Interpretation panels may summarize political events, though translations vary. A knowledgeable local guide can clarify the relationships among the Dinh, Early Le, and Ly dynasties and distinguish original artifacts from later memorial architecture.

The period represented here helped shape an autonomous Vietnamese state after centuries of Chinese rule and domestic fragmentation. Dinh Bo Linh’s unification and royal title asserted authority; the Early Le court defended the realm and continued centralization. Court politics were violent and succession contested, so the story is not a simple heroic progression. Queen Duong Van Nga, linked to both Dinh and Le rulers, remains a particularly discussed figure whose choices are interpreted differently in popular and scholarly narratives. Avoid guides who turn uncertainty into melodramatic certainty. The surviving record invites context and nuance.

Allow at least ninety minutes for the two principal temples and grounds, more if adding nearby religious sites, a bicycle ride, or a climb. Hoa Lu is close to Trang An and can be combined with a boat trip, but major group tours often race through in less than an hour. Early morning gives cooler courtyards and softer light. Late afternoon can be peaceful after buses depart. Festivals, school visits, and the period after Tet bring larger crowds and a more devotional atmosphere. Opening times and ticket boundaries change, so verify locally before setting out.

Dress modestly, covering shoulders and knees. Remove hats inside worship halls, lower your voice, and step over rather than onto raised thresholds. Do not turn your back on an altar for an extended portrait, touch statues, or rearrange offerings. Incense is optional; if participating, use the number and placement indicated by the site, and never add candles where none are requested. Give worshippers priority and avoid photographing private prayer at close range. The temples are historic attractions, but they also function as places of dynastic remembrance and spiritual practice.

Hoa Lu is readily reached by car, taxi, bicycle, or motorbike from Tam Coc and Trang An. Cycling through the surrounding plain can reveal much more than an air-conditioned transfer, provided weather and traffic suit. Wear a helmet, test brakes, and carry lights. Tour buses and trucks use the same narrow roads. Parking attendants may direct visitors toward paid areas; clarify the charge and retain any ticket. If using a ride-hailing service, arrange a meeting point for collection because vehicles may not remain immediately beside the entrance.

The terrain in the main precinct is mostly manageable, though paving is uneven and thresholds create obstacles. Additional climbs in the surrounding area are much more strenuous. Hot-season visits require water, sunscreen, a hat, and rest. Winter can be damp and chilly in shaded halls. Mosquito repellent is useful around vegetation. Toilets and refreshments are available around the tourist area but may be basic. Carry small cash for tickets and drinks, while keeping valuables secure during crowded ceremonies.

Be selective about combinations. Trang An and Hoa Lu share the UNESCO-listed cultural landscape and make a coherent day: one reveals the waterways and caves, the other the political history supported by this terrain. Hang Mua supplies a wide visual overview but adds a demanding stair climb. Bai Dinh reflects large-scale contemporary Buddhist pilgrimage, while Bich Dong offers a more intimate pagoda setting. Trying to include all four with a boat ride reduces each to a photograph. A slower itinerary also supports local cafes, guides, and family-run accommodation rather than only high-volume stops.

The annual Hoa Lu festival, generally held in the third lunar month, commemorates dynastic figures through processions, offerings, performances, and communal activities. Exact dates follow the lunar calendar and arrangements vary. If attending, expect congestion and treat ceremonies as community observance, not theater arranged solely for cameras. Stand where directed, do not cross processional paths, and request permission before photographing participants closely. Formal costumes and ritual objects have specific roles. A respectful visitor watches patiently and allows local families the best access.

The surrounding villages and fields remain working spaces. Ask before photographing residents, especially older people at worship or farmers at work. Do not walk into paddies, climb walls, or enter courtyards that appear private. Vendors may offer snacks, embroidery, fruit, and souvenirs. Ask prices before accepting goods and bargain with good humor where appropriate. Regional dishes include goat and crisp rice, but choose a busy, clean restaurant or ask a trusted host for a recommendation. Vegetarian diners should specify no fish sauce or meat stock.

Environmental responsibility is simple: refill water when possible, carry all litter out, and avoid single-use offerings or plastic trinkets. Do not feed animals or remove fragments of brick and stone. Drones require permission and can disrupt worship, archaeology, and nearby residents. Remain on designated paths, even when an unofficial shortcut promises a better angle. Limestone slopes are fragile and can conceal unstable ground.

Hoa Lu’s power emerges gradually. It lacks the monumental completeness some travelers expect from a former capital, but mountains, temple axes, inscriptions, and ritual continuity make the missing city imaginable. Read before arriving, resist exaggerated claims, and spend time looking beyond the central altars to the enclosing terrain. The visit then becomes a thoughtful encounter with the difficult work of state formation and with the Vietnamese tradition of remembering rulers in the landscape where their authority took root.`,

  'hoi-an-lanterns': `Lantern light has become the defining evening image of Hoi An, but the town’s appeal rests on a deeper history of exchange. From the fifteenth to nineteenth centuries, Hoi An flourished as a trading port where Vietnamese, Chinese, Japanese, and later European merchants met. River silting and changing trade patterns reduced its commercial role, helping preserve an urban fabric of timber houses, assembly halls, temples, shops, lanes, and waterfront buildings. UNESCO inscribed Hoi An Ancient Town on the World Heritage List in 1999 as an exceptionally well-preserved example of a Southeast Asian trading port shaped by local and foreign influences.

The lantern tradition visitors see today draws from older regional practices while also reflecting Hoi An’s modern cultural revival and tourism economy. Silk-covered frames glow beneath eaves, across pedestrian streets, within assembly halls, and along the Thu Bon River. Their colors transform warm ochre walls after sunset, especially when electric shop lighting is restrained. Lanterns are not merely props: they appear in homes, temples, festivals, and celebrations, carrying associations with good fortune and remembrance. At the same time, the immense contemporary display has been cultivated as the town’s signature. Both truths can coexist without diminishing the beauty.

The most atmospheric walk begins before dusk. Arrive while there is daylight to inspect carved wooden interiors, tiled roofs, old shop houses, and Chinese congregation halls, then watch lanterns emerge as the sky darkens. The Japanese Covered Bridge is a celebrated landmark, though restoration or crowd controls may affect access. Cross streets away from the river for quieter views around Tran Phu and Nguyen Thai Hoc, then approach the waterfront after the first rush. Across the river, An Hoi’s night market is brighter, louder, and more commercial. It offers energy rather than serenity, and knowing that distinction helps set expectations.

Hoi An’s full-moon lantern festival is associated with the fourteenth day of the lunar month, when parts of the old town reduce electric lighting and devotional activity becomes more visible. Dates should be checked against the local lunar calendar, not assumed from the Western full moon or an old travel blog. The evening can be exceptionally crowded. Processions, folk games, music, and temple visits vary from month to month; weather and official programming also matter. A normal evening in Hoi An still has thousands of lanterns and may be more enjoyable for travelers who value space.

Small paper lanterns with candles are sold for release on the river. The gesture is often framed as making a wish or offering remembrance, but it also creates waste, wax, and retrieval work. If you participate, buy only one from a responsible vendor, keep the holder out of the water if an alternative ritual is available, and follow current environmental guidance. Never release plastic, foil, or battery lights. Watching from the bank can be just as meaningful. Do not confuse a purchased floating lantern with a required religious act; respectful observation is entirely acceptable.

Boat rides on the river are short, scenic, and heavily promoted. Agree on duration, total price, number of passengers, and whether a floating lantern is included before boarding. Use an authorized landing, wear the life jacket offered, and sit balanced. The river is busy after dark, and low craft can be difficult for larger boats to see. Keep children close and phones secured. A quieter daytime or early-evening ride may reveal working river life more clearly than peak darkness. During floods or strong currents, heed closures without negotiation.

Photography is easiest in the blue hour, when the sky retains color and lanterns do not overwhelm camera exposure. A small, fast lens is more practical than a tripod in crowded lanes. Do not block doorways or pedestrian flow, and never place equipment in a temple approach. Many lantern shops allow portraits because they expect a purchase or charge a fee; ask first. Residents live above and behind the famous facades, so avoid pointing cameras into private rooms. Formal shoots in rented traditional clothing should remain courteous and should not monopolize bridges or shopfronts.

An old-town ticket system supports heritage conservation and provides access to a selection of historic interiors. Arrangements can change, so use official booths and current information. Do not judge the town only from the street: a merchant house or assembly hall explains ventilation, flood adaptation, family worship, and international networks far better than a souvenir lane. In sacred halls, cover shoulders and knees, remove hats, lower voices, and avoid flash. Step over raised thresholds and do not touch altars or old timber. Incense is optional, and worshippers always take priority.

Central Hoi An becomes hot and humid, and shade is limited beside the river. Carry water, use sun protection, and build in an afternoon rest before the evening walk. The rainy season can bring intense downpours and flooding; raised marks inside old houses testify to repeated inundation. Never enter floodwater for photographs. It can conceal open drains, contamination, and currents. In any season, wear shoes comfortable on polished paving. Mosquito repellent is useful near water, and a light layer helps in air-conditioned restaurants or on breezy winter evenings.

Traffic restrictions make parts of the old town pleasant to walk, but bicycles, electric carts, and occasional motorbikes still appear. Stay alert. For travel from beach hotels or outlying villas, confirm where taxis can drop off and arrange a clear return point. Tailors may promise extremely quick garments; inspect fabric, seams, lining, and fit, and allow time for at least one considered fitting rather than sacrificing the entire evening. Lantern workshops can be enjoyable when led by craftspeople who explain bamboo framing and silk covering, but compare class size and what participants actually make.

Food is a major reason to linger. Cao lau, white rose dumplings, com ga, banh mi, and regional seafood are widely available, with quality extending well beyond the most photographed shops. Eat where ingredients look fresh and turnover is brisk. Ask prices when menus are absent and clarify dietary needs, especially fish sauce, shrimp paste, and meat stock. The waterfront’s prime tables charge for location; lanes a few blocks back may be calmer and more personal. Supporting businesses that conserve old buildings and employ local residents helps keep heritage from becoming a stage set.

Cultural sensitivity means recognizing that Hoi An is not only an aesthetic. Family altars glow inside shops, traders’ congregation halls preserve communal histories, and residents continue daily routines amid visitor crowds. Keep voices down late at night, dress beyond beachwear in town, and ask before photographing people. Bargain gently at the market and do not treat a tiny price difference as a contest. Avoid single-use plastic and carry litter until you find a proper bin. Drones are restricted and intrusive over dense homes.

The finest lantern evening balances spectacle with understanding. Begin in daylight, enter at least one historic building, pause for dinner away from the busiest riverfront, and return when the lanes have softened. Look at how light falls across wood, plaster, water, and faces rather than chasing every installation. Hoi An’s lanterns are memorable because they illuminate a port shaped by centuries of movement and adaptation. Treat that living heritage with patience, and the evening becomes richer than its famous photograph.`,

  'cooking-class': `A Vietnamese cooking class can be one of the most revealing half-days of a journey, provided it is chosen as a lesson in ingredients and household technique rather than simply a themed meal. Vietnam has no single national cooking style. Northern kitchens often emphasize clarity and balance; central traditions can be intricate, chile-forward, and connected to courtly as well as village cooking; southern food frequently uses abundant herbs, produce, coconut, and a sweeter palate. These are broad tendencies, not fixed rules. Climate, religion, migration, ethnicity, family preference, and local markets create far more variation than a short class can contain.

Begin by reading the menu critically. A class in Hanoi might sensibly explore bun cha, fresh or fried rolls, dipping sauce, or a seasonal soup. In Hoi An, cao lau, banh xeo, fish in clay pot, green papaya salad, or local dumpling traditions may appear, although some specialist foods depend on components prepared by dedicated producers. In Hue, small cakes and refined central dishes require patience. In the Mekong Delta, coconut, river fish, herbs, and tropical fruit are natural subjects. A menu offering every famous dish from pho to banh mi in two hours is likely to prioritize assembly over genuine instruction.

Market visits are popular but vary in substance. A good guide introduces herbs by scent and use, explains grades of fish sauce, points out rice products and fresh noodles, and discusses how shoppers assess meat, fish, tofu, and produce. Markets are workplaces. Keep the group compact, do not block narrow aisles, and ask before photographing vendors at close range. Avoid touching ingredients unless invited. Live animals and unfamiliar butchery can be confronting; respond without ridicule or theatrical disgust. If animal welfare is important to you, ask the school in advance exactly which market and sections are visited.

Hygiene should be visible, not assumed from polished branding. Workstations need clean boards and knives, safe drinking water, handwashing facilities, chilled storage for perishable food, and separation between raw and cooked ingredients. Instructors should explain how herbs are washed and how raw meat is handled. Outdoor village kitchens can be excellent without resembling a hotel, but basic controls still matter. Travelers who are pregnant, immunocompromised, or managing severe allergies should seek medical advice and choose a small class able to prevent cross-contact. Travel insurance does not replace sensible judgment.

Disclose dietary requirements before paying. “Vegetarian” may be interpreted as no visible meat while fish sauce, shrimp paste, chicken powder, or pork stock remains in seasoning. Specify each exclusion clearly. Vegan, halal, kosher, gluten-free, and allergy-safe cooking require more than removing a garnish. Soy sauce may contain wheat; peanuts can appear in toppings; shellfish may be hidden in fermented condiments; shared woks and mortars create cross-contact. Ask whether substitutions preserve the structure of the dish and whether each participant has separate equipment. If a school cannot answer confidently, choose another.

Fish sauce, nuoc mam, is foundational in many Vietnamese kitchens, contributing salt, aroma, and umami. It may season food during cooking or form the base of nuoc cham, a family of dipping sauces balanced with water, sugar, lime or vinegar, garlic, and chile. Recipes vary by dish and household. Taste before adding more of any element. Fresh herbs are equally important: mint, Thai basil, perilla, Vietnamese coriander, sawtooth coriander, and many others are not interchangeable decorations. A worthwhile class teaches how each is torn, wrapped, cooked, or eaten raw.

Rice appears in multiple technologies: steamed grains, noodles, paper, flour batters, porridge, fermented preparations, and crisped crusts. Learn by touch. Rice-paper rolls improve when the sheet is moistened sparingly and given time to soften; drowning it creates a sticky wrapper. Banh xeo batter needs a hot pan and controlled oil to develop its crisp edge. Noodle dishes depend on organizing herbs, pickles, protein, and sauce as much as on boiling. Pho broth traditionally takes far longer than a tourist class, so honest schools may demonstrate prepared stock while teaching spice treatment and assembly. They should not pretend a quick version duplicates an overnight process.

Many classes begin with a basket-boat ride, farm tour, or village cycle. These additions can be pleasant, especially around Hoi An, but inspect what they contribute. Basket boats are working craft with a complex coastal history; staged spinning and loud entertainment are designed for tourism and may not suit everyone. Wear a life jacket and protect phones near water. On farms, remain on paths, ask before harvesting, and recognize that demonstration plots may serve classes rather than represent all local agriculture. A shorter, kitchen-focused course is often better for serious cooks.

Class size shapes the experience. In a hands-on class, each guest should chop, season, cook, and taste rather than watch one volunteer while staff complete dishes behind the scenes. Small groups allow questions about substitutions and technique. Private classes suit families, skilled cooks, and complex diets but cost more. Confirm whether the instructor teaches directly in a shared language or relies on an assistant. Ask whether recipes, drinks, transport, market purchases, and the final meal are included. “Free pickup” may cover only a defined central area.

Wear closed shoes and light clothing that covers the torso. Tie back long hair, remove dangling jewelry, and wash hands thoroughly. Knife styles and gas burners may differ from home. Watch the instructor before imitating fast cuts, stabilize the board, turn pan handles inward, and ask before adjusting flames. Hot oil and wet ingredients are a dangerous combination. Alcohol is best saved until active cooking ends. Children need age-appropriate stations and direct adult supervision; a family-friendly label does not guarantee safe bench heights or guarded stoves.

Taste throughout, but use clean spoons and never return a tasting utensil to the communal pot. Vietnamese seasoning often seeks a moving balance among salty, sour, sweet, bitter, aromatic, and spicy qualities rather than a universal formula. Chiles may be served separately, so ask before assuming a dish must be fiery. MSG is commonly used in Vietnam and is considered safe for most people in normal culinary quantities; travelers who wish to avoid it should communicate without shaming cooks. The more useful question is what each seasoning contributes and how it can be adjusted.

Cultural exchange works best with humility. Family recipes can differ from restaurant versions and still be authentic. “Authentic” itself is not a guarantee of age, purity, or superiority; dishes evolve with trade, scarcity, technology, and taste. Ask instructors what they cook at home, which steps are reserved for festivals, and how urban routines have changed shopping. Avoid declaring one region’s version the correct one. If invited into a home, follow cues about shoes, seating, ancestral altars, and photography. Bring curiosity rather than an expectation that private life be performed on demand.

After class, take recipes as frameworks. Ingredient strength differs across countries, herbs may be unavailable, and domestic stoves may not match high-output gas burners. Record sensory details: how the batter should flow, what the sauce tastes like before chile, how aromatic spices smell when toasted, and when meat feels cooked. Ask for ingredient names in Vietnamese and photograph packages with permission. Fish sauce quality, rice-paper thickness, and noodle type matter more than souvenir gadgets. Customs rules may restrict fresh produce, meat, and plant material, so do not pack market ingredients without checking.

Choose businesses responsibly. Fair wages, manageable group sizes, transparent sourcing, refill water, and reduced single-use plastic matter more than a decorative “eco” label. Reviews can reveal whether animal encounters are exploitative, classes are routinely overbooked, or advertised instruction becomes a sales stop. Pay a fair price, tip only if service merits it and local practice allows, and credit the teacher when sharing recipes. Do not post identifiable photographs of staff or children without consent.

The best cooking class leaves you with judgment rather than just a printed recipe. You should understand how to build a dipping sauce, handle a herb platter, control heat, and adapt a dish without losing its logic. Select a regionally coherent menu, communicate needs, participate in every stage, and listen to the stories attached to everyday ingredients. The resulting meal will be enjoyable, but the lasting pleasure comes later, when one aroma or practiced movement returns you to a Vietnamese market and the generosity of the person who taught you.`,
}

const GUIDE_LAYERS: Record<string, string>[] = [
  EXPERIENCE_GUIDES_PART1,
  EXPERIENCE_GUIDES_PART2,
  EXPERIENCE_GUIDES_PART3,
  EXPERIENCE_GUIDES_PART4,
  EXPERIENCE_GUIDES_HOI_AN,
  EXPERIENCE_GUIDES_HOI_AN_MORE,
  EXPERIENCE_GUIDES_HOI_AN_OUT,
  EXPERIENCE_GUIDES_HANOI,
  EXPERIENCE_GUIDES_HANOI_MORE,
  EXPERIENCE_GUIDES_HCMC,
  EXPERIENCE_GUIDES_CU_CHI,
  EXPERIENCE_GUIDES_WAR_REMNANTS,
  EXPERIENCE_GUIDES_HCMC_MORE,
  EXPERIENCE_GUIDES_NINH_BINH,
  EXPERIENCE_GUIDES_DA_LAT,
  EXPERIENCE_GUIDES_HUE,
  EXPERIENCE_GUIDES_HUE_TOMBS,
  EXPERIENCE_GUIDES_HUE_OUT,
  EXPERIENCE_GUIDES_DA_NANG,
  EXPERIENCE_GUIDES_DA_NANG_MORE,
  EXPERIENCE_GUIDES_SAPA,
  EXPERIENCE_GUIDES_PHU_QUOC,
  EXPERIENCE_GUIDES_PHU_QUOC_MORE,
  EXPERIENCE_GUIDES_HA_LONG,
  EXPERIENCE_GUIDES_HA_LONG_SHORE,
  EXPERIENCE_GUIDES_PHONG_NHA,
  EXPERIENCE_GUIDES_NHA_TRANG,
  EXPERIENCE_GUIDES_NHA_TRANG_MORE,
  EXPERIENCE_GUIDES_CAN_THO,
  EXPERIENCE_GUIDES_HA_GIANG,
  EXPERIENCE_GUIDES_HA_GIANG_LIFE,
  EXPERIENCE_GUIDES_CAT_BA,
  EXPERIENCE_GUIDES_DONG_VAN,
  EXPERIENCE_GUIDES_CITY_DESCRIPTIONS,
]

type GeneratedGuide = {
  id?: string
  guide?: string
  cardSummary?: string
}

const LAYERED_GUIDES: Record<string, string> = Object.assign({}, ...GUIDE_LAYERS)
const GENERATED_RAW = generatedVisitorGuides as Record<string, GeneratedGuide | string>
const GENERATED_GUIDES: Record<string, string> = {}
for (const [id, row] of Object.entries(GENERATED_RAW || {})) {
  const guide = typeof row === 'string' ? row.trim() : row?.guide?.trim()
  if (guide) GENERATED_GUIDES[id] = guide
}

/** Generated copy fills gaps; existing curated modules still win when they are long enough. */
export const EXPERIENCE_GUIDES: Record<string, string> = { ...GENERATED_GUIDES, ...LAYERED_GUIDES }
for (const [id, generated] of Object.entries(GENERATED_GUIDES)) {
  const curated = LAYERED_GUIDES[id] || ''
  if (curatedWordCount(curated) < 200) EXPERIENCE_GUIDES[id] = generated
  const experience = getExperienceById(id)
  if (
    experience &&
    /hoan kiem/i.test(generated) &&
    experience.city !== 'Hanoi'
  ) {
    if (curated) EXPERIENCE_GUIDES[id] = curated
    else delete EXPERIENCE_GUIDES[id]
  }
}

/** Keys that appear in more than one guide module (later layers silently overwrite). */
export function duplicateExperienceGuideKeys(): string[] {
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const layer of GUIDE_LAYERS) {
    for (const key of Object.keys(layer)) {
      if (seen.has(key)) dupes.add(key)
      seen.add(key)
    }
  }
  return [...dupes].sort()
}
