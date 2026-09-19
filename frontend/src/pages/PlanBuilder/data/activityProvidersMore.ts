import type { ActivityProvider } from './activityProviders'

const gyg = (q: string) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}`
const klook = (q: string) =>
  `https://www.klook.com/en-US/search/?query=${encodeURIComponent(q)}`
const viator = (q: string) =>
  `https://www.viator.com/searchResults/all?text=${encodeURIComponent(q)}`

type Seed = [string, string, string, string, number, number, string]

function pair(id: string, a: Seed, b: Seed): ActivityProvider[] {
  return [
    {
      id: `${id}-a`,
      name: a[0],
      description: a[1],
      priceLabel: a[2],
      durationLabel: a[3],
      rating: a[4],
      reviewCount: a[5],
      bookingUrl: a[6],
    },
    {
      id: `${id}-b`,
      name: b[0],
      description: b[1],
      priceLabel: b[2],
      durationLabel: b[3],
      rating: b[4],
      reviewCount: b[5],
      bookingUrl: b[6],
    },
  ]
}

function p(
  id: string,
  a: Seed,
  b: Seed,
): [string, ActivityProvider[]] {
  return [id, pair(id, a, b)]
}

export const MORE_ACTIVITY_PROVIDERS: Record<string, ActivityProvider[]> = Object.fromEntries([
  p('hg-loop-easy-rider', ['Ha Giang Loop Easy Rider', '3–4 day pillion expedition. Not a half-day buddy spin.', 'From $80 / day', '3–4 days', 4.9, 4200, gyg('Ha Giang Loop Easy Rider')], ['Loop with licensed rider', 'Hà Giang to Đồng Văn to Mèo Vạc. Jeep to Lũng Cú is a different day.', 'From $90 / day', '4 days', 4.9, 2100, klook('Ha Giang loop motorbike')]),
  p('hg-nho-que-kayak', ['Nho Quế wooden boat', 'Jade canyon under Mã Pì Lèng. Not the skywalk.', 'From $15', '1–2 hrs', 4.8, 980, gyg('Nho Que River boat kayak')], ['Nho Quế kayak', 'River station hire. Pass trek is above.', 'From $18', '90 min', 4.8, 410, klook('Nho Que River kayak')]),
  p('hg-lo-lo-tea', ['Lô Lô Chải tea house', 'Ancient Shan tea with a host. Not a gate photo.', 'From $12', '2 hrs', 4.7, 220, gyg('Lo Lo Chai tea tasting')], ['Lo Lo village tea', 'Clay-roof houses, tasting. Indigo is a dye bench.', 'From $15', '2 hrs', 4.7, 90, klook('Lo Lo Chai Ha Giang')]),
  p('hg-ma-pi-leng-skywalk', ['Mã Pì Lèng skywalk', 'Cliff path on the pass. Not the river boat.', 'From $10', '1–2 hrs', 4.7, 640, gyg('Ma Pi Leng skywalk trek')], ['Ma Pi Leng cliff walk', 'Guide on the drop. Loop Easy Rider is the multi-day saddle.', 'From $14', '2 hrs', 4.7, 280, klook('Ma Pi Leng Pass walk')]),
  p('hg-dong-van-sunday', ['Đồng Văn Sunday market host', 'Sunday only. Not a weekday grocery run.', 'From $15', '2–3 hrs', 4.8, 510, gyg('Dong Van Sunday market tour')], ['Highland Sunday market', 'Cultural walk. Lũng Cú jeep is the flag.', 'From $18', '3 hrs', 4.8, 190, klook('Dong Van market')]),
  p('hg-du-gia-cook', ['Du Già Tày kitchen', 'Stream fish and sticky rice. Not the market tour.', 'From $20', '2–3 hrs', 4.8, 160, gyg('Du Gia cooking class')], ['Tay homestay class', 'Du Già evening stove. Indigo is cloth.', 'From $24', '3 hrs', 4.8, 70, klook('Ha Giang cooking class')]),
  p('hg-khau-lai', ['Khau Lại waterfall trek', 'Walk in, swim pools. Not the pass viewpoint.', 'From $18', 'Half day', 4.6, 140, gyg('Khau Lai waterfall Ha Giang')], ['Khau Lai swim trek', 'Wet rocks. Nho Quế is the canyon river.', 'From $22', '5 hrs', 4.6, 55, klook('Ha Giang waterfall trek')]),
  p('hg-lung-cu-jeep', ['Lũng Cú flag jeep', 'Northernmost point. Not Lô Lô tea.', 'From $25', 'Half day', 4.6, 380, gyg('Lung Cu flag tower jeep')], ['Lung Cu day jeep', 'Flag and border hills. Loop may pass it; this is the dedicated jeep.', 'From $30', '5 hrs', 4.6, 150, klook('Lung Cu Ha Giang tour')]),
  p('sp-muong-hoa-trek', ['Mường Hoa terrace trek', 'Guided paddies. Not Fansipan cable.', 'From $25', 'Full day', 4.8, 2100, gyg('Sapa Muong Hoa valley trek')], ['Sapa rice terrace walk', 'Local guide. Terrace games extra is a short play walk.', 'From $30', '8 hrs', 4.8, 980, klook('Sapa trekking Muong Hoa')]),
  p('sp-fansipan-cable', ['Fansipan Sun World cable', 'Summit temples. Not a valley trek.', 'From $30', 'Half day', 4.5, 6400, gyg('Fansipan cable car ticket')], ['Fansipan peak ticket', 'Cloud can hide the view. Coaster is Bản Mông.', 'From $35', '4 hrs', 4.5, 4100, klook('Fansipan cable car Sapa')]),
  p('sp-red-dao-bath', ['Red Dao herbal bath', 'Wooden tub. Not batik, not rice wine.', 'From $12', '1–1.5 hrs', 4.7, 890, gyg('Sapa Red Dao herbal bath')], ['Ta Phin herbal spa', 'After-trek soak. Homestay cook is dinner.', 'From $15', '90 min', 4.7, 410, klook('Sapa herbal bath')]),
  p('sp-rice-wine', ['Red Dao ruou class', 'You brew. 18+ to taste. Not the bath.', 'From $18', '2 hrs', 4.7, 120, gyg('Sapa rice wine brewing class')], ['Sapa rice-wine workshop', 'Yeast and jar. Batik is wax.', 'From $22', '2 hrs', 4.7, 48, klook('Sapa rice wine class')]),
  p('sp-ban-mong-coaster', ['Bản Mông alpine coaster', 'You brake. Not paragliding.', 'From $10', '30–60 min', 4.5, 640, gyg('Sapa alpine coaster Ban Mong')], ['Ban Mong rail sled', 'Height rules. Fansipan is the cable peak.', 'From $12', '45 min', 4.5, 280, klook('Sapa alpine coaster')]),
  p('sp-paraglide', ['Sapa tandem paraglide', 'Weather hold. Not the coaster rail.', 'From $90', '2–3 hrs', 4.8, 310, gyg('Sapa tandem paragliding')], ['Valley tandem flight', 'Weight limits. Trek is walking.', 'From $110', '3 hrs', 4.8, 140, klook('Sapa paragliding')]),
  p('sp-waterfall-scooter', ['Love & Silver Falls picnic', 'Two falls, thermos. Not Bắc Hà Sunday.', 'From $22', 'Half day', 4.6, 260, gyg('Sapa Love Waterfall Silver Falls')], ['Sapa waterfall scooter', 'Picnic. Muong Hoa is a walking trek.', 'From $26', '5 hrs', 4.6, 110, klook('Sapa waterfall tour scooter')]),
  p('sp-bac-ha-market', ['Bắc Hà Sunday van', 'Sunday only. Not Sapa town market.', 'From $25', 'Full day', 4.7, 980, gyg('Bac Ha Sunday market tour')], ['Bac Ha market day trip', 'Pre-dawn van. Waterfall scooter is falls.', 'From $30', 'Full day', 4.7, 410, klook('Bac Ha market Sapa')]),
  p('hue-dragon-sunset', ['Perfume River dragon sunset', 'Gold-hour prow. Not tea-and-ca-Huế.', 'From $18', '1–1.5 hrs', 4.6, 720, gyg('Hue dragon boat sunset cruise')], ['Dragon boat golden hour', 'City river. Tam Giang is the lagoon.', 'From $22', '90 min', 4.6, 310, klook('Hue dragon boat')]),
  p('hue-ao-dai-photo', ['Imperial City áo dài shoot', 'Stylist plus photographer in Đại Nội. Not the river cycle.', 'From $35', '2 hrs', 4.8, 540, gyg('Hue ao dai photography Imperial City')], ['Citadel royal dress photos', 'Ticket often extra. An Định is another palace.', 'From $42', '2 hrs', 4.8, 220, klook('Hue ao dai photoshoot')]),
  p('hue-truc-lam-bach-ma', ['Trúc Lâm Bạch Mã retreat', 'Guided quiet hours. Modest dress.', 'From $22', 'Half day', 4.6, 180, gyg('Truc Lam Bach Ma monastery Hue')], ['Bach Ma zen visit', 'Mountain monastery. Not a river cruise.', 'From $28', '5 hrs', 4.6, 70, klook('Hue Bach Ma monastery')]),
  p('hue-tam-giang', ['Tam Giang kayak + seafood', 'Lagoon paddle then grill. Not the city river.', 'From $35', '3–4 hrs', 4.8, 410, gyg('Tam Giang lagoon kayak Hue')], ['Lagoon sunset feast', 'Swim skill. Dragon boat stays in Hue city.', 'From $40', '4 hrs', 4.8, 160, klook('Tam Giang lagoon tour')]),
  p('hue-an-dinh-walk', ['An Định architecture host', 'Palace walk. Not the citadel photo shoot.', 'From $8', '1–1.5 hrs', 4.6, 290, gyg('An Dinh Palace Hue tour')], ['An Định heritage hour', 'Yellow walls. Imperial City áo dài is Đại Nội.', 'From $12', '90 min', 4.6, 110, klook('An Dinh Palace ticket')]),
  p('hue-cyclo-food', ['Hue cyclo snack crawl', 'Bun bo stools from a cyclo. Not the cooking class.', 'From $28', '2.5–3 hrs', 4.8, 640, gyg('Hue cyclo street food tour')], ['Imperial snack cyclo', 'Land food. Chamber-music boat is water.', 'From $32', '3 hrs', 4.8, 280, klook('Hue street food cyclo')]),
  p('pn-son-doong', ['Oxalis Sơn Đoòng', 'Permit expedition. Waitlist. Not Hang Én.', 'From $3000', '4–5 days', 4.9, 890, gyg('Son Doong Cave Oxalis')], ['Oxalis Hang Sơn Đoòng', 'Only Oxalis. Hang Én is the shorter camp.', 'From $3200', '5 days', 4.9, 640, klook('Son Doong expedition')]),
  p('pn-hang-en', ['Oxalis Hang Én camp', 'Two-day cave beach. Not Sơn Đoòng.', 'From $300', '2 days', 4.9, 1200, gyg('Hang En Cave camping Oxalis')], ['Hang Én overnight trek', 'Licensed operator. Dark Cave is mud day.', 'From $340', '2 days', 4.9, 510, klook('Hang En cave tour')]),
  p('pn-cave-boat-tour', ['Phong Nha + Tiên Sơn', 'Wet cave boat and dry cave stairs. Not Dark Cave.', 'From $15', '3–4 hrs', 4.6, 2100, gyg('Phong Nha Cave Tien Son')], ['River-mouth cave tickets', 'Son kayak is the town river without a cave.', 'From $18', '4 hrs', 4.6, 880, klook('Phong Nha cave boat')]),
  p('pn-mo-coc', ['Mo Cọc trail + kayak', 'Eco-stream. Not Hang Tối mud.', 'From $18', 'Half day', 4.6, 340, gyg('Mo Coc stream Phong Nha')], ['Mo Coc paddle', 'Boardwalk and kayak. Ozo is a zip park.', 'From $22', '4 hrs', 4.6, 140, klook('Mo Coc Phong Nha')]),
  p('pn-ozo', ['Ozo Treetop Park', 'Zipline course. Not Dark Cave zip.', 'From $20', '2 hrs', 4.5, 980, gyg('Ozo Park Phong Nha zipline')], ['Ozo adventure park', 'Harnesses. Duck Stop is a farm.', 'From $24', '2 hrs', 4.5, 410, klook('Ozo Phong Nha')]),
  p('pn-duck-stop', ['Duck Stop farm', 'Feed and ride. Not a cave.', 'From $8', '1–1.5 hrs', 4.6, 720, gyg('Duck Stop Phong Nha')], ['Phong Nha duck farm', 'Kids hour. Bike tour is roads.', 'From $10', '90 min', 4.6, 310, klook('Duck Stop farm')]),
  p('pn-bike', ['Phong Nha countryside bike', 'Farm roads with a host. Not a cave ticket.', 'From $12', 'Half day', 4.7, 540, gyg('Phong Nha bicycle tour')], ['National park edge cycle', 'Buffalo lanes. Farmstay cook is dinner.', 'From $15', '4 hrs', 4.7, 220, klook('Phong Nha bike tour')]),
  p('pn-cha-loi', ['Chà Lòi + Bru-Vân Kiều', 'Wilder cave and village. Not Oxalis Sơn Đoòng.', 'From $45', 'Full day', 4.8, 180, gyg('Cha Loi Cave Phong Nha')], ['Cha Loi ethnic trek', 'Modest dress in the village. Hang Én is the camp cave.', 'From $55', 'Full day', 4.8, 70, klook('Phong Nha village cave trek')]),
  p('mk-cai-rang', ['Cái Răng dawn boat', 'Coffee-pot hulls before 7:00. Not candy class.', 'From $15', '3–4 hrs', 4.6, 3400, gyg('Cai Rang floating market boat')], ['Can Tho floating market', 'Hotel pickup ~05:00. Châu Đốc is another city.', 'From $18', '4 hrs', 4.6, 1800, klook('Cai Rang floating market')]),
  p('mk-tram-chim', ['Tràm Chim bird boat', 'Đồng Tháp park. Not Tra Su forest.', 'From $25', 'Half day', 4.7, 210, gyg('Tram Chim National Park boat')], ['Dong Thap birdwatching', 'Permit boat. Cái Răng is a market.', 'From $32', '5 hrs', 4.7, 80, klook('Tram Chim birdwatching')]),
  p('mk-bentre-kayak-bike', ['Bến Tre kayak + bike', 'Canal then coconut lanes. Not Tra Su.', 'From $22', 'Half day', 4.7, 640, gyg('Ben Tre kayak bicycle tour')], ['Ben Tre countryside combo', 'Candy class is a kitchen stop, not this.', 'From $28', '5 hrs', 4.7, 280, klook('Ben Tre kayak bike')]),
  p('mk-cook-class', ['Mekong home kitchen', 'Fish and tropical fruit. Not candy squares.', 'From $28', '3–4 hrs', 4.8, 410, gyg('Mekong Delta cooking class')], ['Delta fruit and fish class', 'Home stove. Homestay net is fishing.', 'From $32', '4 hrs', 4.8, 160, klook('Mekong cooking class')]),
  p('mk-an-binh-pick', ['An Bình orchard pick', 'Fruit harvest. Not Cái Răng.', 'From $20', 'Half day', 4.7, 190, gyg('An Binh Island fruit picking')], ['An Binh homestay orchard', 'Hammock island. Net-cast extra is fishing.', 'From $25', '5 hrs', 4.7, 70, klook('An Binh Island Can Tho')]),
  p('mk-tra-su', ['Tra Su cajuput sampan', 'Melaleuca forest. Not Tràm Chim.', 'From $18', '2 hrs', 4.7, 890, gyg('Tra Su forest boat')], ['Tra Su forest ticket', 'An Giang. Châu Đốc Cham is the town tour.', 'From $22', '2 hrs', 4.7, 410, klook('Tra Su Cajuput Forest')]),
  p('mk-bee-folk', ['Bee farm + tài tử', 'Honey then strings. Not music-only evening.', 'From $12', '1.5–2 hrs', 4.6, 240, gyg('Mekong bee farm folk music')], ['Delta honey tasting', 'Candy is coconut sugar, not this.', 'From $15', '2 hrs', 4.6, 90, klook('Mekong honey farm')]),
  p('mk-chau-doc', ['Châu Đốc Cham tour', 'Mosque quarter and floating houses. Not Cái Răng.', 'From $30', 'Half day', 4.6, 320, gyg('Chau Doc Cham floating village')], ['Chau Doc cultural morning', 'Tra Su is forest. This is town and water houses.', 'From $36', '5 hrs', 4.6, 120, klook('Chau Doc tour')]),
  p('nt-hon-mun-dive', ['Hon Mun scuba / sea-walk', 'Reserve water. Not the four-island snorkel.', 'From $55', 'Half day', 4.7, 980, gyg('Nha Trang Hon Mun diving sea walking')], ['Hon Mun first dive', 'Helmet walk option. Monkey Island is eco boat.', 'From $65', '5 hrs', 4.7, 410, klook('Nha Trang scuba Hon Mun')]),
  p('nt-vinwonders', ['VinWonders day pass', 'Cable plus park. Not island snorkel.', 'From $40', 'Full day', 4.4, 4200, gyg('VinWonders Nha Trang ticket')], ['Vinpearl land-sea pass', 'Emperor cruise is a dinner junk.', 'From $45', 'Full day', 4.4, 2800, klook('VinWonders Nha Trang')]),
  p('nt-monkey-island', ['Đảo Khỉ + Hoa Lan', 'Eco boat. Watch bags. Not Hon Mun scuba.', 'From $22', 'Half day', 4.4, 640, gyg('Nha Trang Monkey Island tour')], ['Monkey and orchid islands', 'Four-island is coral snorkel.', 'From $26', '5 hrs', 4.4, 280, klook('Nha Trang Monkey Island')]),
  p('nt-emperor-sunset', ['Emperor Cruises sunset', 'Dinner junk. Not night fishing.', 'From $55', '3 hrs', 4.7, 1100, gyg('Emperor Cruises Nha Trang sunset')], ['Emperor cocktail junk', 'Gold hour table. Beer crawl is land.', 'From $65', '3 hrs', 4.7, 480, klook('Emperor Cruises Nha Trang')]),
  p('nt-night-fish', ['Wooden-boat night fish', 'Basket lights. Not Emperor dinner.', 'From $28', '3–4 hrs', 4.5, 410, gyg('Nha Trang night fishing tour')], ['Traditional squid night', 'Working boat. Four-island is daylight.', 'From $32', '4 hrs', 4.5, 160, viator('Nha Trang night fishing')]),
  p('nt-ba-ho', ['Ba Hồ trek + jump', 'Three pools. Swim skill. Not Tháp Bà mud.', 'From $18', 'Half day', 4.7, 890, gyg('Ba Ho waterfalls Nha Trang')], ['Ba Ho jungle morning', 'Wet rocks. Spa is Tháp Bà.', 'From $22', '5 hrs', 4.7, 340, klook('Ba Ho waterfall tour')]),
  p('nt-island-snorkel', ['Four-island speedboat', 'Bay snorkel circuit. Not Hon Mun scuba.', 'From $25', 'Half day', 4.6, 3200, gyg('Nha Trang four island snorkel')], ['Nha Trang island hopping', 'Mask time. VinWonders is the park cable.', 'From $30', '5 hrs', 4.6, 1800, klook('Nha Trang 4 island tour')]),
  p('nt-mud-bath', ['Tháp Bà mud spa', 'Mineral mud. Not Po Nagar towers.', 'From $18', '2–3 hrs', 4.5, 2100, gyg('Thap Ba mud bath Nha Trang')], ['Thap Ba herbal soak', 'Spa ticket. Beer crawl is night food.', 'From $22', '3 hrs', 4.5, 980, klook('Thap Ba hot spring')]),
  p('nt-seafood-grill', ['Nha Trang beer + seafood', 'Taprooms and grill. Not Emperor junk.', 'From $25', '3 hrs', 4.6, 410, gyg('Nha Trang craft beer seafood tour')], ['Coastal seafood crawl', 'Named stops. Night fishing is a boat.', 'From $30', '3 hrs', 4.6, 160, klook('Nha Trang food tour seafood')]),
  p('hg-weaving', ['Hmong indigo batik bench', 'Wax and vat. Not Sunday market.', 'From $12', '1–2 hrs', 4.9, 318, gyg('Ha Giang indigo batik workshop')], ['Dong Van textile class', 'Blue hands. Lô Lô is tea.', 'From $15', '90 min', 4.8, 174, klook('Ha Giang Hmong weaving')]),
  p('hue-royal-cook', ['Hue royal kitchen class', 'Imperial plates. Not cyclo snacks.', 'From $38', '3–4 hrs', 4.9, 980, gyg('Hue royal cooking class')], ['Hue court cuisine', 'Market then stove. Not a citadel photo walk.', 'From $45', '4 hrs', 4.9, 410, klook('Hue cooking class')]),
  p('hue-ca-hue-boat', ['Tea and ca Huế cruise', 'Chamber music. Not dragon sunset.', 'From $20', '1.5 hrs', 4.7, 640, gyg('Hue ca Hue boat tea')], ['Perfume River music boat', 'Seated tea. Cyclo crawl is land.', 'From $24', '90 min', 4.7, 280, klook('Hue traditional music boat')]),
  p('hue-incense-craft', ['Thủy Xuân incense + nón', 'Roll sticks and sew a hat. Not a village stroll.', 'From $10', '1–1.5 hrs', 4.7, 410, gyg('Hue incense conical hat workshop')], ['Thuy Xuan craft bench', 'Take-home bundle. Photo tour is the citadel.', 'From $14', '90 min', 4.7, 160, klook('Hue incense making')]),
  p('mk-coconut-candy', ['Candy + rice paper kitchen', 'Stir and pull bánh tráng. Not Cái Răng.', 'From $5', '45–90 min', 4.6, 980, gyg('Ben Tre coconut candy rice paper')], ['Mekong coconut house', 'Sticky hands. Cooking class is a meal.', 'From $8', '1 hr', 4.7, 412, klook('Mekong coconut candy')]),
  p('pn-dark-cave-play', ['Dark Cave zip + mud', 'Hang Tối play ticket. Not the cave boat.', 'From $25', 'Half day', 4.7, 2890, gyg('Phong Nha Dark Cave')], ['Hang Toi combo', 'Ozo is a different zip park.', 'From $28', '4–5 hrs', 4.6, 1544, klook('Dark Cave Phong Nha')]),
  p('sp-indigo-batik', ['Black Hmong beeswax batik', 'Wax and indigo. Not the herbal bath.', 'From $15', '2 hrs', 4.9, 527, gyg('Sapa Hmong batik workshop')], ['Sapa indigo house', 'Stain-friendly clothes. Rice wine is brewing.', 'From $18', '2 hrs', 4.8, 240, klook('Sapa batik class')]),
  p('nb-countryside-cook', ['Clay-pot village class', 'Goat or fish in clay. Not a boat lunchbox.', 'From $30', '3–4 hrs', 4.8, 640, gyg('Ninh Binh clay pot cooking class')], ['Ninh Binh home stove', 'Homestay field morning is mud work.', 'From $35', '4 hrs', 4.8, 274, klook('Ninh Binh cooking class')]),
])
