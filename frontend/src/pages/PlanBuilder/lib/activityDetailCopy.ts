import type { ActivityKind, CityActivity } from '../data/activities'
import { ACTIVITY_KEEP_IN_MIND } from '../data/activityKeepInMind'
import { hoursLabelForSource } from './yourVietnam/openingHours'

export type ActivityGuideSection = {
  title: string
  body: string
  wide?: boolean
}

/** Longer readable snapshot for the detail panel beside the photo. */
export function getActivityDetailBlurb(activity: CityActivity): string {
  const hook = activity.hook.trim()
  const summary = activity.summary.trim()
  const hoursLabel = hoursLabelForSource('activity', activity.id, activity.hours)
  const hourBit =
    hoursLabel && !/by booking/i.test(hoursLabel)
      ? hoursLabel.endsWith('.')
        ? hoursLabel
        : `${hoursLabel}.`
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
  const h = hoursLabelForSource('activity', activity.id, activity.hours).trim()
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
    'Book a family kitchen in or just outside the Old Quarter (Bát Sứ / Yên Thái) or Hidden Hanoi in Tây Hồ. Market first, stove second. Skip hotel buffet demos.',
  'hn-tai-chi-lake':
      'Hoan Kiem Lake, especially the east bank near Ngoc Son, from about 5:30–6:30. Lenin Park also has weekend groups. Walk up, watch one round, then join from the back. No ticket booth.',
  'hn-karaoke-bia-hoi':
    'Private rooms in the Old Quarter (side streets off Ta Hien, Hang Buom, and Ma May) after 8pm. Ask a hotel desk to call a room rather than wandering stage bars. Bia hoi corners nearby are for drinks after, not the singing.',
  'hn-street-food-moto':
    'Start in the Old Quarter / Dong Xuan lanes, not Train Street. A good run hits standing stalls for pho, bun cha, and coffee — your guide should name the stops before you put the helmet on.',
  'hn-egg-coffee-lab':
    'Old Quarter workshops — Hồng Hoài / Hàng Bạc / Nguyễn Hữu Huân. Café Giang is the classic cup if you only want to taste; book a lab if you want to whip the foam. Reserve the day before.',
  'hn-bat-trang-pottery':
    'Old Quarter studio (Hoàn Kiếm, Sơn / Authentic Bát Tràng) for a 3-hour wheel, or a booked van to Bát Tràng village east of the city. The village sight card is the walk; this is the class.',
  'hn-silver-workshop':
    'Hoàng Mai thin-silver alley (look for ngõ 307) or 34i Lý Nam Đế in Hoàn Kiếm. Hang Bac shops sell silver; they are not this workshop unless the listing says you make the piece.',
  'hn-knife-making':
    'Đa Sỹ village, Hà Đông — Grab or taxi, not the Old Quarter. Meeting points are often a pitch or preschool landmark. Closed-toe shoes. The blade goes in checked luggage.',
  'hn-print-embroidery':
    'Embroidery: Tân Mỹ at 16 Hàng Trống. Woodblock: Đông Hồ in Bắc Ninh as a countryside trip, not a Hang Ma votive-paper shop.',
  'hn-tea-ceremony':
    'Booked rooms near Ngọc Hà / West Lake (lotus tea) or Tây Hồ tasting studios. Not a sidewalk trà đá stool — that is a different, cheaper pleasure.',
  'hn-vespa-jeep':
    'Hotel or Old Quarter pickup. You ride pillion or as a jeep passenger with a licensed driver. Confirm Vespa vs army jeep vs food inclusions on the sheet.',
  'hn-speakeasy-crawl':
    'Hidden-bar walks start in the Old Quarter (often near Lò Sũ). Pub crawls cluster on Tạ Hiện. Bia hơi corners are stools and draught — a different night.',
  'hn-quang-ba-flowers':
    'Quảng Bá wholesale market, Tây Hồ. Peak after 23:00, busiest 02:00–05:00. Grab in, or book a night guide. Daytime is a quieter, less photogenic market.',
  'hn-long-bien-cycle':
    'Guided sunset rides meet in the Old Quarter or Long Biên approach. The steel deck and Bãi Giữa farms are the point — not a solo hire-bike on the highway.',
  'hn-incense-village':
    'Quảng Phú Cầu, Ứng Hòa, about an hour south. Book a morning van or jeep. Do not step on drying mats. Rain cancels the colour.',
  'hn-truc-bach-swan':
    'Walk-up kiosk on the Trúc Bạch shore near the floating café (Thanh Niên / Trúc Bạch). Cash. Small boat ~100,000₫/hr, larger ~200,000₫/hr. About 07:00–21:30.',
  'hn-da-cau':
    'Hoàn Kiếm banks, Lý Thái Tổ garden, and Old Quarter plazas in the early evening. Watch a circle, then join. No booth. If nobody is playing, do not force a game in a temple yard.',
  'nb-paddle-van-long':
    'Van Long Nature Reserve (Gia Viễn). Bamboo boat for birds and langurs. Not Tràng An grottos, not Tam Cốc, not Cúc Phương night safari.',
  'nb-trang-an-boat':
    'Tràng An boat station. Official rower through the UNESCO caves. Tam Cốc is the rice-field sampan. Van Long is the wetland.',
  'nb-mua-hike':
    'Hang Múa stairs east of Tam Cốc. 500 steps. Not a river boat. Hoa Lư cycling is the citadel.',
  'nb-tam-coc':
    'Tam Cốc pier. Foot-rowed sampan. Go early. Tràng An is the longer grotto loop.',
  'nb-bai-dinh-tour':
    'Bái Đính new complex. E-car plus host. Hoa Lư is the ancient capital bike.',
  'nb-cuc-phuong':
    'Cúc Phương National Park, west of Ninh Binh. EPRC then night safari. Van Long langurs are a wetland boat.',
  'nb-hoa-lu-cycle':
    'Hoa Lư Đinh and Lê temples by bike. Not the picnic paddy pedal (nb-bike-picnic).',
  'nb-thung-nam':
    'Thung Nâm bird park at sunset. Not Van Long’s morning langur run.',
  'nb-rice-homestay':
    'Countryside homestays around Tam Cốc. Seasonal field work. Clay-pot class is the stove.',
  'nb-countryside-cook':
    'Village clay-pot kitchen. Not a boat with a lunchbox. Homestay field morning is mud.',
  'nb-bike-picnic':
    'Paddy lanes between Tam Cốc and Hang Múa. Not the Hoa Lư temple loop.',
  'hl-kayak-karsts':
    'Day kayak from Cát Bà / Lan Ha. Not the overnight cruise kayak slot. SUP is standing.',
  'hl-beach-volley':
    'Cat Co beaches, walk-up. Not a boat ticket.',
  'hl-squid-night':
    'Lan Ha sunset cocktail then squid lines. Cat Ba or Lan Ha dusk. Overnight luxury is a cabin night.',
  'hl-sup-lan-ha':
    'Sheltered Lan Ha SUP from Cát Bà. Not seated kayak. Not squid night.',
  'hl-overnight-cruise':
    'Tuan Chau or Cat Ba embark, cabin overnight with kayak on the itinerary. The halong-cruise sight is the bay card. Squid evening is not a cabin.',
  'hl-luon-boat':
    'Luồn Cave bamboo or kayak landing. Not Sung Sốt boardwalk. Often a named cruise add-on.',
  'hl-titop-hike':
    'Ti Tốp summit stairs. Not a swim-only beach stop. Đỉnh Hương boat is other islets.',
  'hl-catba-trek':
    'Cát Bà National Park gate with a guide. Not scooter, not canopy zip.',
  'hl-dinh-huong-boat':
    'Day boat naming Đỉnh Hương and Ga Chọi. Not overnight. Not Sung Sốt cave hour.',
  'hl-sung-sot-guide':
    'Sung Sốt Surprise Cave boardwalk with a guide. Not Luồn’s tunnel.',
  'hl-catba-scooter':
    'Cát Bà island roads and a floating-village stop. Not the park trek.',
  'hl-catba-canopy':
    'Cát Bà zipline and climbing park. Not Dark-Cave-style mud. Not the jungle trek.',
  'hg-homestay-dance':
    'After dinner at the homestay yard. Not a ticketed show. Tip.',
  'hg-weaving':
    'Indigo and batik bench. Not Sunday Đồng Văn market. Not Lô Lô tea.',
  'hg-market-day':
    'Weekday grocery with your host. Sunday Đồng Văn tour is the cultural Sunday card.',
  'hg-easy-ride-buddy':
    'Half-day scenic from Hà Giang city. The loop expedition is hg-loop-easy-rider.',
  'hg-loop-easy-rider':
    '3–4 day Easy Rider loop. Not a half-day buddy ride. Lũng Cú jeep is a dedicated flag day.',
  'hg-nho-que-kayak':
    'Nho Quế river stations. Kayak or wooden boat. Skywalk is the cliff above.',
  'hg-lo-lo-tea':
    'Lô Lô Chải with ancient tea. Village sight card is a walk without tasting.',
  'hg-ma-pi-leng-skywalk':
    'Mã Pì Lèng cliff path / skywalk. Not the canyon boat. Not the multi-day loop.',
  'hg-dong-van-sunday':
    'Đồng Văn Sunday market with a host. Sunday only. Not a weekday grocery.',
  'hg-du-gia-cook':
    'Du Già Tày homestay kitchen. Not the market tour.',
  'hg-khau-lai':
    'Khau Lại waterfall trek and pools. Not the pass viewpoint.',
  'hg-lung-cu-jeep':
    'Jeep to Lũng Cú flag. Not Lô Lô tea. Loop may pass it; this is the dedicated jeep.',
  'sp-indigo-batik':
    'Black Hmong beeswax batik. Not the Red Dao herbal bath. Not rice wine.',
  'sp-homestay-cook':
    'Valley homestay dinner. Not rice-wine brewing.',
  'sp-terrace-walk-games':
    'Short terrace walk plus play. Not the full Mường Hoa trek.',
  'sp-evening-song':
    'Homestay song after dinner. Tip. Not a spa.',
  'sp-muong-hoa-trek':
    'Guided Mường Hoa trek. The sapa-trek sight is the valley card. Fansipan is cable.',
  'sp-fansipan-cable':
    'Sun World Fansipan cable and summit temples. Not a terrace walk.',
  'sp-red-dao-bath':
    'Red Dao herbal tub. Not batik. Not wine class.',
  'sp-rice-wine':
    'Red Dao brewing class. 18+ to taste. Not dinner cook.',
  'sp-ban-mong-coaster':
    'Bản Mông alpine coaster. Not paragliding. Not Fansipan cable.',
  'sp-paraglide':
    'Tandem from Sapa valleys. Weather hold. Coaster is the rail.',
  'sp-waterfall-scooter':
    'Love and Silver Falls picnic loop. Not Bắc Hà Sunday.',
  'sp-bac-ha-market':
    'Sunday van to Bắc Hà. Not Sapa town market.',
  'hue-royal-cook':
    'Dong Ba then a royal-style kitchen. Not cyclo snacks. Not the cooking-class sight card.',
  'hue-ca-hue-boat':
    'Tea and ca Huế on the Perfume River. Not the dragon sunset prow boat.',
  'hue-ao-dai-cycle':
    'River-path áo dài bike. Not the Imperial City photographer booking.',
  'hue-incense-craft':
    'Thủy Xuân incense and nón class. Village drying racks without a bench are the sight.',
  'hue-dragon-sunset':
    'Dragon boat at sunset. Not tea-and-chamber-music. Tam Giang is the lagoon.',
  'hue-ao-dai-photo':
    'Stylist and photographer inside Đại Nội. Citadel ticket often extra. River cycle is different.',
  'hue-truc-lam-bach-ma':
    'Guided hours at Trúc Lâm Bạch Mã. Modest dress. Not a river cruise.',
  'hue-tam-giang':
    'Tam Giang lagoon kayak then seafood. Not the city Perfume River boats.',
  'hue-an-dinh-walk':
    'An Định Palace with a host. Not the Imperial City áo dài shoot.',
  'hue-cyclo-food':
    'Cyclo between bun bo and chè. Not the cooking class. Not a river boat.',
  'ha-lantern-make':
    'Booked bench on Nguyễn Thái Học or a nearby studio. You fold and silk a collapsible lantern. Ready-made kiosk lanterns and the night-river photo stop are different cards — this is the class.',
  'ha-tra-que-cook':
    'Trà Quế herb village, 3–4 km north via Cẩm Hà. Cycle or pickup. Farm rows then a garden kitchen. Town restaurants that borrow the village name are not this class.',
  'ha-an-bang-play':
    'An Bàng Beach, about 15 minutes from the old town. Nets and balls appear from roughly 16:30–18:30. Walk onto the sand, smile, point at a gap. Paid surf lessons are a different card.',
  'ha-basket-boat':
    'Cẩm Thanh / Bảy Mẫu coconut forest, east of town — not the Hoài sampan booths. Book the round thuyền thúng plus crab line. The nipa-forest sight walk is a different card.',
  'ha-folk-dance':
    'Old-town cultural houses and some hotel courtyards offer short intros. Check the evening performance board in the ancient town. This is a few steps, not a ticketed spectacle.',
  'ha-thanh-ha-pottery':
    'Thanh Hà village west of town. Sit at a family wheel. Old-town ceramic souvenirs and the pottery-village sight stroll are not the booked workshop.',
  'ha-hoai-lantern-boat':
    'Bạch Đằng / Nguyễn Phúc Chu river booths after dusk, or a booked night-boat sheet. Fifteen minutes plus a paper lantern. Heritage ticket is separate. Not the Memories Show and not a dinner cruise.',
  'ha-jewelry-workshop':
    'Booked silver/brass bench in or just outside the old town. You make the piece. Nguyễn Thái Học jewellery cabinets are shopping unless the listing says you sit at the torch.',
  'ha-hai-van-easy-rider':
    'Hotel pickup in Hội An. Licensed rider — you do not drive. Confirm whether you drop in Đà Nẵng or Huế. This is the pass day, not a town scooter hire.',
  'ha-cham-snorkel':
    'Cửa Đại transfer, then speedboat to Cù Lao Chàm. Snorkel plus Bãi Chồng time. Marine-park fee is usually on the sheet. Not a Cửa Đại beach hour and not the island sight card by itself.',
  'ha-tailor':
    'Named houses (Yaly, A Dong, Bebe, smaller ateliers) for measure and two fittings. Bring a photo. Touts offering a free spa with a suit are not this.',
  'ha-coffee-lab':
    'Studio classes in Cẩm Thanh (Sabirama and others). You brew salt coffee and coconut coffee on a phin. Café queues in the old town are tasting, not this class.',
  'ha-memories-show':
    'Hội An Impression Theme Park, Cẩm Nam / Nguyễn Tri Phương. Arrive by 17:00 for the park; show 20:00 most nights except Tuesday. Not an Ancient Town walking ticket.',
  'ha-sidecar-jeep':
    'Town pickup, then paddy lanes and Cam Kim backroads. Passenger sidecar or jeep. Not Hải Vân and not a basket boat.',
  'ha-thubon-sup':
    'Dawn launch near Trà Quế or Cẩm Nam on the Thu Bồn. Beginner board, vest, hotel pickup. An Bàng surf school is a different card.',
  'ha-kim-bong-wood':
    'Cam Kim island — boat or bridge to a carpenter yard. Short carve with a family. The village sight walk is not the workshop unless you book the bench.',
  'ha-speakeasy-crawl':
    'Small-group 18+ walk behind shophouse doors. Host names the bars. Riverfront bia hơi stools are a different, cheaper night.',
  'ha-ms-lily-food':
    'Meet 40 Trần Hưng Đạo / Madam Khánh unless the voucher says otherwise. Max about eight. Book days ahead. Generic night-market crawls are a different card.',
  'ha-an-bang-surf':
    'An Bàng beach schools, 15 minutes from town. Board and coach in the water. Morning glass. Pickup football on the same sand is free and separate.',
  'ha-bamboo-craft':
    'Booked studio or village yard for split-and-lash bamboo. You keep the piece. Cẩm Thanh basket boats use bamboo boats — they are not this class.',
  'ha-night-market-crawl':
    'Nguyễn Hoàng night-market lanes after dusk. Guided crawls name the stalls; walk-up is cash and queues. Ms. Lily’s ancient-town dinner walk is a different host and route.',
  'ha-ba-na-day':
    'Hotel pickup from Hội An for Sun World Bà Nà / Golden Bridge. Full day, cable car, mountain weather. This is the booked excursion, not a Da Nang city wander.',
  'ha-marble-am-phu':
    'Half-day from Hội An to Ngũ Hành Sơn with Âm Phủ cave time. Elevator optional. Not a Bà Nà ticket and not a self-guided taxi with no cave plan.',
  'ha-silk-village':
    'Hội An Silk Village (Cam Châu / Nguyễn Tất Thành side), dye vats and loom demo or a longer class. Old-town silk shops are retail unless the listing includes the village workshop.',
  'ha-myson-dawn':
    'Pre-dawn van from Hội An to Mỹ Sơn. Site ticket plus guide. Modest dress, brick paths. This is the early tour, not a midday coach dump.',
  'ha-herbal-massage':
    'Named old-town or hotel spa desk for foot bath plus bodywork. Skip free-footbath touts tied to a tailor. Pay at the spa.',
  'ha-sunset-dinner-cruise':
    'Booked dinner boat on the Thu Bồn / Hoài at golden hour. Set menu, 1.5–2.5 hrs. Not the 15-minute lantern sampan at the ticket booth.',
  'dn-surf-my-khe':
    'Mỹ Khê / Phạm Văn Đồng beachfront schools. Morning glass is the lesson. Board is in the package. Parasail is Sơn Trà water sports. The beach sight is sand without a coach.',
  'dn-douc-safari':
    'Sơn Trà forest roads at dawn. Wildlife van for red-shanked doucs. Lady Buddha and the peninsula viewpoint are sight cards. Ocean kayak and parasail are other Sơn Trà bookings.',
  'dn-hoa-phu-raft':
    'Hòa Phú Thành west of town (Hòa Vang). Helmet rafting. Han dusk kayak is city water. ATV is dirt tracks. Thần Tài is the soak.',
  'dn-phin-coffee':
    'A Đà Nẵng studio, not a café table. Egg, salt, and coconut phin. Hàn Market hunt buys ingredients; this class brews them.',
  'dn-cook-class':
    'Hàn or Cồn market, then a home stove for five dishes. The scavenger hunt is a game sheet, not this kitchen. Áo dài crawl is supper on bikes.',
  'dn-dragon-fire-cruise':
    'Han pier boarding timed to the weekend fire-and-water show. Free riverside standing is the dragon-bridge sight. Buffet-and-dance boats are a longer dinner cruise.',
  'dn-han-buffet-cruise':
    'Evening dinner boat on the Hàn with buffet and a Champa or lotus set. Fire-show boats are the short timed run. Dusk kayak is a paddle.',
  'dn-marble-am-phu':
    'Thủy Sơn from a Đà Nẵng hotel. Guide plus Âm Phủ. Self-guided climb is the marble-mountains sight. Hội An pickup is ha-marble-am-phu. Stone class is the village below.',
  'dn-aodai-food':
    'Evening hotel pickup with female riders in áo dài. Named stalls, then a taproom. Brewery hop is East West and Seven Bridges only. Cooking class is daytime.',
  'dn-cham-seatrek':
    'Tiên Sa / Đà Nẵng speedboat, then a helmet walk at Cù Lao Chàm. Hội An snorkel is ha-cham-snorkel. Sơn Trà kayak stays on the peninsula.',
  'dn-hai-van-jeep':
    'Đà Nẵng start, jeep or Easy Rider pillion over Hải Vân. The pass viewpoint is the sight card. Hội An Easy Rider is ha-hai-van-easy-rider. Train to Huế is rails.',
  'dn-ba-na-ticket':
    'Sun World cable car and Golden Bridge from Đà Nẵng hotels. The ba-na-hills sight is the place. Hội An day trips use ha-ba-na-day.',
  'dn-than-tai':
    'Núi Thần Tài park in Hòa Ninh / Hòa Vang. Mud and mineral pools. Mikazuki is the Japanese beach onsen in the city.',
  'dn-atv-bbq':
    'Countryside ATV west or south of Đà Nẵng, BBQ after. Hải Vân is the highway pass. Rafting is the river.',
  'dn-perfume':
    'City blending studio. You leave with a vial. Not a mall tester. Coffee class is a phin.',
  'dn-stone-carve':
    'Non Nước village workshop bench. You chisel. The village street is the sight. Marble Mountains is the hill.',
  'dn-mikazuki':
    'Mikazuki 365 on Võ Nguyên Giáp / Non Nước strip. Day pass. Thần Tài is inland hot springs. Surf stays on open Mỹ Khê.',
  'dn-sky36':
    'Sky36 rooftop at Novotel Premier Han River, 36 Bạch Đằng. 18+. VIP table or entry. Brewery hop is taprooms. Cultural show is theater.',
  'dn-champa-show':
    'Booked theater or dedicated stage in Đà Nẵng. Champa and lotus program. Dinner-cruise dance is a short deck set.',
  'dn-sontra-watersports':
    'Parasail and jet ski desks at Sơn Trà / Tiên Sa beaches. Douc safari is forest. Ocean kayak is a paddle. My Khe surf is the city lesson.',
  'dn-brewery-hop':
    'East West Brewing and Seven Bridges with a host. 18+. Áo dài crawl adds supper stalls first.',
  'dn-hue-train':
    'Ga Đà Nẵng, SE-line seat to Huế along Hải Vân. Jeep is the road. Huế citadel is a separate sight.',
  'dn-myson-dawn':
    'Pre-dawn van from Đà Nẵng hotels to Mỹ Sơn. Storyteller plus site ticket. The my-son sight is the sanctuary. Hội An pickup is ha-myson-dawn.',
  'dn-sontra-kayak':
    'East Sơn Trà sea launch. Kayak then snorkel. Han dusk kayak is the river. Cham sea-trek is an island helmet. Parasail is the tow desk.',
  'dn-han-market-hunt':
    'Inside Chợ Hàn with a list. You hunt ingredients. Five-dish class is the kitchen after. The han-market sight is an unguided wander.',
  'dn-beach-football':
    'My Khe sand along the hotel stretch after 17:00. Wave at a gap. Not a booked surf lesson.',
  'dn-sunset-yoga':
    'Mỹ Khê toward the Marble Mountains end, or hotel decks. Arrive 15 minutes early. Not the surf school.',
  'dn-han-kayak':
    'Han riverfront near Dragon Bridge. Dusk paddle. Fire cruise and buffet cruise are seated boats. Sơn Trà kayak is ocean.',
  'pn-dark-cave-play':
    'Hang Tối / Chày River. Zip and mud. Not Phong Nha Cave boat. Not Ozo park zip.',
  'pn-farmstay-cook':
    'Farmstay kitchen west of town. Not Duck Stop. Not a cave day.',
  'pn-son-kayak':
    'Son River town pier. No cave ticket. Mo Cọc is the eco-stream. Cave boat is Phong Nha + Tiên Sơn.',
  'pn-son-doong':
    'Oxalis only. Multi-day permit. Not Hang Én. The son-doong-cave sight is the cave card.',
  'pn-hang-en':
    'Hang Én overnight camp. Licensed operator. Not Sơn Đoòng. Not Dark Cave mud.',
  'pn-cave-boat-tour':
    'Phong Nha wet cave plus Tiên Sơn stairs. Not Dark Cave. Not town-river kayak.',
  'pn-mo-coc':
    'Mo Cọc boardwalk and kayak. Not Hang Tối. Not Son town kayak.',
  'pn-ozo':
    'Ozo Treetop Park. Not Dark Cave zip-and-mud.',
  'pn-duck-stop':
    'Duck Stop farm. Not countryside bike. Not a cave.',
  'pn-bike':
    'Countryside bike with a host. Not a cave ticket.',
  'pn-cha-loi':
    'Chà Lòi cave and Bru-Vân Kiều village. Not Oxalis Sơn Đoòng.',
  'hcmc-moto-food':
    'Hotel pickup in District 1 with an all-female moto crew (XO and similar). Helmet on. D3/D4/D8 supper alleys — not Bùi Viện and not a Bến Thành indoor-market hour.',
  'hcmc-ao-show':
    'Municipal Theatre (Saigon Opera House), Lam Sơn Square. Book À Ố seats. Façade photos without a ticket are not this.',
  'hcmc-scent-lab':
    'The Scent Lab studio in District 1. You blend a bottle. Café Apartment fragrance desks are a different card.',
  'hcmc-silver-clay':
    'Booked D1 bench. You fire a ring. Đồng Khởi jewellery windows are shopping unless you sit at the torch.',
  'hcmc-rum-pairing':
    'Seated rum lab or taproom. 18+. Bùi Viện buckets and craft-beer crawls are different nights.',
  'hcmc-ben-thanh-crawl':
    'Evening stalls around Bến Thành’s outdoor ring. Hosted crawl. The daytime market hall is the sight card.',
  'hcmc-sunset-cruise':
    'Bạch Đằng / District 1 piers, booked cocktail boat at gold hour. Waterbus to Thanh Đa is cheaper and different.',
  'hcmc-cu-chi-shoot':
    'Range beside the Củ Chi tunnels, van from D1. Ear protection. War Remnants Museum and the tunnels sight walk are not the shooting add-on.',
  'hcmc-cafe-apt-fragrance':
    'Café Apartment, 42 Nguyễn Huệ — a booked blend on a café floor. The building’s café-hop sight is coffee. The Scent Lab is another studio.',
  'hcmc-speakeasy-crawl':
    'District 1 hidden bars plus one rooftop. 18+. Karaoke rooms and Bùi Viện pub crawls are different.',
  'hcmc-saigon-sup':
    'Thanh Đa / Bình Quới launch, beginner board. Standing paddle. Not the commuter waterbus and not a sunset cocktail deck.',
  'hcmc-egg-coffee-lab':
    'District 1 coffee lab: phin plus egg foam. Café Giang is Hanoi. Apartment-café sightseeing is not the class.',
  'hcmc-cho-lon-photo':
    'Bình Tây and Chợ Lớn wholesale lanes at opening, with a photo host. The Chợ Lớn wander sight is unguided.',
  'hcmc-cook-class':
    'Neighbourhood wet market (not only Bến Thành souvenirs), then bánh xèo at a D1/D3 home stove. Hội An garden kitchens are a different city.',
  'hcmc-waterbus-thanh-da':
    'Saigon Waterbus from Bạch Đằng toward Thanh Đa. Timetable tickets. Luxury cocktail boats are a different pier product.',
  'hcmc-lion-head':
    'Chợ Lớn / District 5 lion-dance workshop. Paint and glue. Street lion performances at Tết are not the class.',
  'hcmc-vespa-alleys':
    'Licensed Vespa, you ride pillion through D1 alleys. Night female food motos are a different card. You do not drive.',
  'hcmc-herbal-massage':
    'Named D1 or D3 spa desk. Pay there. Skip free-footbath tailor touts on Bùi Viện.',
  'hcmc-craft-beer':
    'Hosted taprooms in District 1 and 3 (Pasteur Street, Heart of Darkness, East West). Rum pairing is another listing.',
  'hcmc-palace-bunker':
    'Independence Palace underground command rooms with a guide. Gate photos of the palace are the sight card.',
  'hcmc-bitexco-ticket':
    'Timed SkyDeck ticket, floor 49. Landmark 81 is a different tower. Street photos of the lotus are not the deck.',
  'hcmc-ao-dai-photo':
    'D1 rental house, then Notre-Dame or Nguyễn Huệ frames. Hội An made-to-measure suits are a different city.',
  'hcmc-ho-thi-ky':
    'Hồ Thị Kỷ flower market, District 10, after ~20:00. Not Bến Thành. Hanoi’s Quảng Bá is a different city.',
  'hcmc-suoi-tien-water':
    'Suối Tiên in District 9 — water slides and pools. The cultural-park sight walk is dry; this is the wet ticket. Far from downtown.',
  'hcmc-mekong-speedboat':
    'Day van plus speedboat to Bến Tre coconut canals from Saigon. Mekong homestay paddle/candy cards live on the Mekong city list. The delta sight is not this boat.',
  'hcmc-dance-class':
    'Beginner drop-ins in District 1–3 studios, not the Bùi Viện pavement. Sneakers, water, one combo. À Ố is a ticketed show, not this.',
  'hcmc-karaoke':
    'Private rooms in District 1 — Pasteur, around Nguyễn Huệ, or side streets off Bùi Viện. Book a room. Stage bars are for watching.',
  'hcmc-boxing':
    'Gyms in District 1 and Bình Thạnh offer traveler intro sessions. Book a pads hour, not a stadium fight. Tell the coach old injuries at the door.',
  'mk-coconut-candy':
    'Bến Tre candy and rice-paper kitchen. Not Cái Răng. Cooking class is a meal.',
  'mk-homestay-fish':
    'Canal bank net-cast. Not An Bình orchard picking. Not the cooking class.',
  'mk-sampan-paddle':
    'Short coconut-canal oar. Not Tra Su forest. Not the Bến Tre kayak-bike combo.',
  'mk-don-ca-tai-tu':
    'Music-only tài tử evening. Bee-farm pairing is honey plus strings.',
  'mk-cai-rang':
    'Cái Răng dawn boat, pickup ~05:00. The floating-market sight is the place. Châu Đốc is another city.',
  'mk-tram-chim':
    'Tràm Chim National Park bird boat. Not Tra Su. Not Cái Răng.',
  'mk-bentre-kayak-bike':
    'Bến Tre kayak then bike. Candy class is a kitchen. Tra Su is An Giang forest.',
  'mk-cook-class':
    'Home kitchen fish and fruit. Not candy squares. Not net-fishing.',
  'mk-an-binh-pick':
    'An Bình orchard. Not Cái Răng. Not the homestay net.',
  'mk-tra-su':
    'Tra Su cajuput sampan. Not Tràm Chim birds. Not Châu Đốc Cham town.',
  'mk-bee-folk':
    'Bee farm honey then folk music. Not music-only evening.',
  'mk-chau-doc':
    'Châu Đốc Cham quarter and floating houses. Not Cái Răng. Not Tra Su.',
  'nt-island-snorkel':
    'Four-island speedboat snorkel from Nha Trang harbor. Not Hon Mun scuba/sea-walk. Not VinWonders.',
  'nt-hon-mun-dive':
    'Hon Mun reserve scuba or helmet walk. Not the four-island snorkel boat.',
  'nt-mud-bath':
    'Tháp Bà mineral mud spa. Not Po Nagar towers. Not Ba Hồ trek.',
  'nt-vinwonders':
    'VinWonders cable and park pass. Not island snorkel. Not Emperor dinner.',
  'nt-monkey-island':
    'Đảo Khỉ and Hoa Lan eco boat. Watch bags. Not Hon Mun scuba.',
  'nt-emperor-sunset':
    'Emperor Cruises sunset dinner junk. Not night fishing. Not beer crawl.',
  'nt-night-fish':
    'Wooden-boat night lines. Not Emperor cocktails.',
  'nt-ba-ho':
    'Ba Hồ three pools and optional jump. Not Tháp Bà mud.',
  'nt-seafood-grill':
    'Craft beer and seafood crawl on land. Not Emperor junk. Not volleyball.',
  'nt-beach-volley':
    'Promenade nets, walk-up. Not a boat ticket.',
  'pq-beach-volley':
    'Long Beach (Bãi Trường) hotel stretch for sunset nets, then Dương Đông night-market lanes. São Beach is a swim, not the regular game. Hosted food strolls name the stools.',
  'pq-seafood-cook':
    'Dương Đông market or Hàm Ninh for the catch, then a kitchen class. Night-market grazing is a different card. Book a class, not only a grill restaurant.',
  'pq-sup-sunset':
    'Ốc Sen Beach, west/north-west calm water, sunset launch. Beginner board and vest. Cửa Cạn kayak is mangroves. Long Beach volleyball is sand nets.',
  'pq-snorkel-guide':
    'An Thới four-island speedboat — time in the water at Mây Rút / Gầm Ghì / Móng Tay. The phu-quoc-snorkel sight is the reef outing; this is the booked boat. Freedive class is separate.',
  'pq-beach-drum':
    'Long Beach / sunset-strip bars on jam nights. Ask which evening has guitars. Drink minimum at some spots.',
  'pq-hon-thom-cable':
    'Sun World station in Sunset Town. Buy the over-sea ticket. Last car back is early. The hon-thom-cable sight is the station; this is the ride. Kiss of the Sea is a night show.',
  'pq-squid-dinner':
    'Evening boats from Dương Đông or An Thới. Shared squid dinner. Deep-sea BBQ charter is a different, pricier boat.',
  'pq-cua-can-kayak':
    'Cửa Cạn river / mangrove launch in the north-west. You paddle. The Cửa Cạn beach sight is sand.',
  'pq-kiss-sea-show':
    'Sunset Town show basin. Ticketed Kiss of the Sea; fireworks when listed. Plaza wandering without a seat is the sunset-town sight.',
  'pq-pearl-craft':
    'Pearl farm or Hàm Ninh workshop bench. Harvest demo plus a piece you make. Showroom cabinets are shopping.',
  'pq-rach-vem-starfish':
    'North: Rạch Vẹm floating village lunch, then Starfish Beach. Do not pick up starfish. Not the south snorkel boat.',
  'pq-ridgeback':
    'Booked kennel / breeding farm. Racing demo. Not a beach stray. Ask before touching.',
  'pq-fish-sauce':
    'Dương Đông barrel house (Khải Hoàn and peers). Hosted tasting. The factory sight is unguided. Sim wine is another farm.',
  'pq-sim-wine':
    'Inland sim (rose myrtle) wine farm. Tasting flight. Not Rock Island cocktails.',
  'pq-night-safari':
    'Vinpearl Safari, north island, after dark. Keeper add-on if on the sheet. Not VinWonders on Hòn Thơm and not Aquatopia.',
  'pq-jeep-north':
    'Hotel pickup, open-top into national-park edges. Passenger only. Cable car is the south.',
  'pq-pepper-workshop':
    'Khu Cường-style farm bench: harvest and grind. The pepper-plantation sight is a walk; this is the class.',
  'pq-sea-walk':
    'Coral Mountain / south-island helmet dive. Briefing and health limits. Not snorkeling, not freediving.',
  'pq-night-fish-bbq':
    'Private or small night charter, deeper water, BBQ. Not the shared squid-dinner cruise.',
  'pq-rock-island':
    'Rock Island Club, Sunset Town — reserved sunset cocktail tasting. Sun Bavaria is craft beer. Kiss of the Sea is a show.',
  'pq-bee-farm':
    'Inland apiary. Honey tasting. Neighbouring pepper and sim farms are different tickets.',
  'pq-versailles-spa':
    'Versailles Beach Club spa desk, west coast. Mud plus herbal. Book the package, not only a lounger.',
  'pq-sun-bavaria':
    'Sun Bavaria gastropub, Sunset Town. Evening flights, 18+. Rock Island is cocktails.',
  'pq-prison-tour':
    'Phú Quốc Prison (Coconut Prison) with a guide. The prison sight is the gate and grounds; this is the hosted history circuit.',
  'pq-grand-world-taxi':
    'Grand World Venice canals: water taxi plus night lights. Aquatopia is the water-park ticket next door.',
  'pq-aquatopia':
    'Aquatopia full-day pass at Grand World. Swimsuit. Not the Hòn Thơm cable and not Safari.',
  'pq-freedive':
    'Small-group freedive boat among the islets. Coach in the water. The four-island snorkel boat is cheaper and different.',
  'dl-canyoning':
    'Datanla canyon south of town. Licensed harness day. The waterfall sight is the viewing walk; coaster and ropes are other Datanla tickets.',
  'dl-alpine-coaster':
    'Datanla Alpine Coaster rails. You brake. Mongo Land luge is a different park. Canyoning is the wet canyon.',
  'dl-coffee-farm':
    'Twin Beans Farm (countryside). Roast and cup. Town cafés are not this class. Balava is chocolate.',
  'dl-hon-bo-sunrise':
    'Pre-dawn van to Hòn Bồ Peak. Cloud if weather holds. Vintage dawn jeeps use other ridges. Langbiang is a different mountain.',
  'dl-tuyen-lam-sup':
    'Tuyền Lâm Lake launch, beginner board. Robin Hill cable is the monastery car. Valley of Love is pedal boats. Xuân Hương is the town lake cycle.',
  'dl-mongo-land':
    'Mongo Land hillside: luge/kart and rainbow slide. Not Datanla’s alpine coaster. The mongo-land-dalat sight is the park.',
  'dl-easy-rider':
    'Licensed pillion through countryside. You do not drive. Dawn jeep and Langbiang jeep are different.',
  'dl-datanla-ropes':
    'Datanla high-rope and zipline park. Not canyoning, not the coaster.',
  'dl-balava-chocolate':
    'Balava studio in Đà Lạt. Bean-to-bar. Twin Beans is coffee.',
  'dl-robin-cable':
    'Robin Hill cable station to Trúc Lâm. Modest dress. Last car back. The monastery and lake sights are the landing.',
  'dl-lumiere':
    'Lumiere Light Garden timed ticket. Indoor lights. Not the city flower gardens. Not Valley of Love.',
  'dl-pine-mtb':
    'Guided dirt under pines. Helmet. Xuân Hương hire bikes are the town loop.',
  'dl-candle-craft':
    'Town atelier for scented candles. Mosaic/glass is another bench. Night-market stalls are shopping.',
  'dl-cau-dat-tea':
    'Cầu Đất plantation and historic factory, hosted tasting. The cau-dat-tea sight is the hill. Twin Beans is coffee.',
  'dl-mosaic-glass':
    'Artist studio for mosaic or stained glass. Crazy House is architecture, not this class.',
  'dl-langbiang-jeep':
    'Jeep up Langbiang plus a trek. The langbiang sight is the mountain. Hòn Bồ is a dawn van.',
  'dl-suoi-may-onsen':
    'Suối Mấy Japanese-style onsen. Named baths. Not a hotel shower.',
  'dl-night-market-food':
    'Hòa Bình night-market lanes with a host. The night-market sight is unguided. Market cooking class is a kitchen.',
  'dl-valley-love-boat':
    'Valley of Love park ticket plus pedal boat. Not Tuyền Lâm SUP. Not Xuân Hương cycle.',
  'dl-cricket-wine':
    'Countryside rice-wine and cricket farm tasting. Seated. Easy Rider may pass a farm — this is the table.',
  'dl-flower-highland':
    'Flower Highland / Fresh Zoo combo. Not downtown flower gardens. Not Lumiere.',
  'dl-crazy-house-walk':
    'Hang Nga with a guide. The crazy-house sight is the building; this is the hosted maze.',
  'dl-jeep-dawn':
    'Vintage open-top pre-dawn to countryside ridges. Not the Hòn Bồ peak van. Not Langbiang daytime jeep.',
  'dl-strawberry-pick':
    'Greenhouse strawberry and hydroponic pick, pay fruit by kilo. Thái Phiên flower sight is blooms, not picking.',
  'dl-steam-train':
    'Đà Lạt Railway Station heritage ride toward Trại Mát. The station sight is the building; this is the ticketed train.',
  'dl-market-cook':
    'Shop Hòa Bình then cook in a kitchen. The street-food walking tour is stools only.',
  'dl-lake-cycle':
    'Hire bikes on Xuân Hương’s flat loop. Pine MTB is dirt. Tuyền Lâm SUP is another lake.',
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
