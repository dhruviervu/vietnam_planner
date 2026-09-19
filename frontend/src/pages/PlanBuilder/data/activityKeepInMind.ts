/**
 * Personalized Keep in Mind copy for a small set of activities.
 *
 * There are 52+ city activities. Filling unique multi-paragraph copy for every
 * heading on every item is a large writing job — add more ids here over time.
 * Activities without an entry fall back to generated copy in activityDetailCopy.ts.
 */
export type ActivityKeepInMind = {
  where: string
  what: string
  expect: string
  bring: string
  know: string
}

export const ACTIVITY_KEEP_IN_MIND: Record<string, ActivityKeepInMind> = {
  'hn-cooking-home': {
    where:
      'Book a family kitchen in or just outside Hanoi’s Old Quarter — lanes around Hang Be, Hang Bac, or a townhouse toward the French Quarter. The point is a real stove, a shared table, and a host who cooks this way most weeks, not a hotel buffet demo. Skip classes that never leave a restaurant dining room. Many hosts include a short wet-market stop first; confirm the meeting point the night before (a café or the house gate) so you are not hunting an alley with a Grab pin that is two doors off.',
    what:
      'This is a small-group home kitchen class: you chop, season, fry, and wrap beside the person who actually cooks for their family. Typical dishes are bun cha, nem (spring rolls), a seasonal stir-fry, or a dipping sauce you will use all trip. You sit down together and eat what you made. It is not a chef’s-table performance and not a street-food crawl — it is one house, a few hours, and the rhythm of a Hanoi lunch.',
    expect:
      'Set aside three to four hours. You will stand at a counter, get a little smoky, and ask a lot of questions. English varies by host; gestures and tasting still work. Class size should stay small — six people at a home stove is already a crowd. The market stop, if included, is short and cash-friendly. You leave full, with a recipe card or phone photos, not a diploma. If someone in your group has shellfish, peanut, or gluten needs, say so when you book, not at the chopping board.',
    bring:
      'Closed-toe shoes, hair tied back, and clothes that can take a splash of fish sauce or oil. Note allergies and spice comfort when you reserve. Small cash is useful for the market, a soft drink, or a thank-you if the class is in a private home. Leave bulky bags at the hotel; kitchens are tight. A phone is enough for recipes — you will not need a laptop.',
    know:
      'From about $35 as a starting point; confirm whether market ingredients, drinks, and hotel pickup are included. This fits food lovers, couples, and first-timers who want a slower Hanoi morning. Ask whether you cook every dish or watch one volunteer while staff finish the rest — a hands-on class means you touch the food. Tip fairly if the host taught in their own kitchen. Add it to your trip as a flexible activity, not a rigid sightseeing slot.',
  },
  'hn-tai-chi-lake': {
    where:
      'Hoan Kiem Lake is the easy join-in: the east bank near Ngoc Son Temple, from about 5:30 to 6:30, when regulars already have a circle going. Lenin Park (Thong Nhat) has weekend groups if the lake feels too tourist-dense. Walk up, watch one round from the back, then step in. There is no ticket booth and no official start time. Hotel “sunrise tai chi” on a rooftop is a different, paid product — fine if you want instruction, not this lakeside public rhythm.',
    what:
      'This is Hanoi’s public morning practice: slow forms, deep breath, and a social circle of locals who have been coming for years. You are a guest in an existing habit, not the star of a class. Some mornings a volunteer counts; most mornings you copy the person in front of you. Soft, free if you join the open circle, and over before the scooter roar fully arrives.',
    expect:
      'Forty-five to sixty minutes if you stay for a full set; you can leave after one round. Arrive 10–15 minutes early and stand at the back. Nobody scores you. If the group uses a speaker, the volume is modest. Photographing people in the circle without a smile and a nod is poor form. Afterward the lake path is for coffee and watching the city wake — that is part of the outing.',
    bring:
      'Soft shoes or bare feet, a light layer for the dawn chill, and water if you tend to run dry. Leave valuables zipped. You do not need a mat. If you want a taught intro instead of copying, ask your hotel for a paid lakeside session — bring cash for that separately.',
    know:
      'Usually free; a small tip is the right thank-you only if someone clearly taught you, not for sharing public park space. Fits early risers and slow travel. The lake is busiest on weekends and around Tet. If you sleep badly, skip it rather than arriving groggy and blocking the regulars. This is an activity slot we can drop in on a Hanoi morning without rearranging the whole day.',
  },
  'hn-truc-bach-swan': {
    where:
      'Trúc Bạch Lake, Ba Đình — the walk-up swan and duck boats on the eastern shore near the floating café, reached along Thanh Niên between West Lake and Trúc Bạch. Cash at the kiosk. No app booking.',
    what:
      'You pedal a swan-shaped boat for an hour. Small boats hold two or three; larger ones hold a family. It is a local lakeside outing, not a sightseeing cruise.',
    expect:
      'Confirm the hourly price before you board (about 100,000₫ small, 200,000₫ large). Hours are roughly 07:00–21:30. Late afternoon is cooler. Life jackets if offered — take them.',
    bring:
      'Small cash, sunscreen, and a dry bag for phones. Flip-flops are fine. Do not stand up in the boat for photos.',
    know:
      'Walk-in only. Pair with coffee on Thanh Niên after. If the kiosk is closed, come back later rather than hiring a random lakeside tout.',
  },
  'hn-da-cau': {
    where:
      'Hoàn Kiếm Lake paths, Lý Thái Tổ garden, and Old Quarter plazas in the early evening. Public, free, no booth.',
    what:
      'Đá cầu is kick-shuttlecock. Locals keep a feathered cork in the air with the inside of the foot. You join an existing circle.',
    expect:
      'Watch one rally, smile, then step in. You will miss. That is normal. Twenty to forty-five minutes is enough. Do not film faces without a nod.',
    bring:
      'Soft shoes. Nothing else. Leave valuables zipped.',
    know:
      'Free. If nobody is playing, walk on — do not start a noisy game in a temple courtyard. Morning lake hours belong more to tai chi.',
  },
  'hn-knife-making': {
    where:
      'Đa Sỹ blacksmith village in Hà Đông. Grab or taxi from the Old Quarter (allow 40–60 minutes). Hosts meet at a local landmark, not a showroom on Hàng Bạc.',
    what:
      'A booked forge class: heat, hammer, grind, and take home a kitchen knife. Family smiths, English on the established Airbnb listings.',
    expect:
      'Two to three hours, hot, loud, closed-toe shoes. Ages often 10–12+. You will be tired in the shoulders.',
    bring:
      'Cotton clothes you can sweat in, closed shoes, and a plan for packing the blade in checked luggage. Cabin security will not love a new knife.',
    know:
      'From about $35–46. Confirm pickup vs self-transfer. This is a real village forge, not a mall demo.',
  },
  'ha-lantern-make': {
    where:
      'Workshops sit on Nguyen Thai Hoc and nearby old-town lanes in Hoi An, where frames, silk, and glue are already on the table. You leave with the lantern and can hang it that evening. Ancient-town kiosks selling ready-made lanterns are shopping, not this. Book a seat for late afternoon if you want to walk out into lantern hour with something you actually folded.',
    what:
      'A short craft workshop: you build a bamboo or wire frame, stretch silk or paper, and finish a Hoi An-style lantern you can pack or gift. The maker shows one technique; you try it once or twice at a bench. It is seated, tactile, and over in well under half a day — a souvenir with a story rather than a stall purchase.',
    expect:
      'About one to two hours. Hands get sticky. Your first lantern will look handmade, which is the point. English is usually enough for the steps. Evening light is when the piece looks finished; if you book at noon, take it back out after dark. Ask whether the silk is included or if upgrades cost extra before you sit down.',
    bring:
      'An old shirt or apron mindset — dye and glue happen. Hand wipes help. Cash if you want a second lantern or a larger size from the same studio. You do not need tools. Leave the lantern’s hanging loop free; it is easier to carry through the old town than a shopping bag of souvenirs.',
    know:
      'Price varies by size and silk; confirm before you start so the “from” rate is not a tiny sample. Unique, photogenic, and easy to slot beside an old-town wander. Pack the lantern in clothes, not crushed under a suitcase of coffee. If you only want the photo, buy a ready-made one and skip the class — this is for people who want to make the object.',
  },
  'ha-hoai-lantern-boat': {
    where:
      'River ticket booths on Bạch Đằng and Nguyễn Phúc Chu after dusk, or a booked night-boat listing. The 15-minute sampan is the Hoài, not Cẩm Thanh. Heritage-zone tickets are separate if you enter from the paid old-town gates. Dinner cruises and the Memories Show are different evenings.',
    what:
      'A short night row under silk lanterns, then you set a paper lantern on the water. It is a photo hour, not a meal and not a village boat.',
    expect:
      'Fifteen to twenty minutes. Boats wait in a queue on busy nights. Cash at walk-up booths; booked sheets skip some haggling. Bring a light layer; the river is cooler than the lanes.',
    bring:
      'Small cash, phone with night mode, and patience for the lantern photo. Skip bulky bags. Kids need a life vest if the operator offers one.',
    know:
      'Walk-up is often ~170,000₫ for 1–3 people. GetYourGuide lists from about $8. Unique, short, easy to slot after dinner. If you want plates on the water, book the sunset dinner cruise card instead.',
  },
  'ha-cham-snorkel': {
    where:
      'Hotel pickup in Hội An, then Cửa Đại for the speedboat to Cù Lao Chàm. Bãi Chồng is the usual beach stop after snorkel time. Weather and park rules can cancel. This is the booked island day, not a Cửa Đại swim from the sand.',
    what:
      'A marine-park day: kit, boat, coral time, lunch, beach. Shared boats. You are in the water, not only photographing from the deck.',
    expect:
      'Six to eight hours door to door. Sun, salt, and a choppy crossing on windy days. Non-swimmers should say so when they book. Seasickness tablets help some people.',
    bring:
      'Reef-safe sunscreen, rash vest, towel, dry bag, cash for park extras. Motion sickness tablets if you need them. Leave passports at the hotel unless the operator asks.',
    know:
      'From about $36–57 including typical fees — read the sheet. Must-do in calm season. October–January can be rough. Not the same as the island sight card you might already have in the bag.',
  },
  'ha-hai-van-easy-rider': {
    where:
      'Licensed Easy Rider pickup at your Hội An hotel. You ride pillion over Hải Vân. Confirm Đà Nẵng drop versus Huế one-way with a luggage van. Town scooter rental is not this.',
    what:
      'A guided motorbike day on the pass: viewpoints, Lang Co, cloud and hairpins. The rider drives. You watch and hold on.',
    expect:
      'Five to eight hours. Cooler and wetter at the saddle. Helmets are mandatory. Rain gear should be on the bike.',
    bring:
      'Closed shoes, a layer, sunglasses, and a small backpack. Agree luggage handling the night before if you are ending in another city.',
    know:
      'From about $45 depending on drop-off. Unique, weather-sensitive. Do not treat this as a self-drive licence — you are a passenger on a booked ride.',
  },
  'ha-ms-lily-food': {
    where:
      'Lily’s walking dinner usually meets at 40 Trần Hưng Đạo / Madam Khánh unless the voucher names another pin. Cap is about eight. Book days ahead. The Nguyễn Hoàng night-market crawl is a different host and a different route.',
    what:
      'A named local walk: bánh mì, cao lầu, bánh xèo and whatever she is eating that week. Stools, stories, no coach restaurant.',
    expect:
      'Two and a half to three hours. You will stand, sit on low stools, and eat more than you planned. English is part of the product. Tell her allergies at the start.',
    bring:
      'Cash for extras, appetite, and shoes you can walk in. Leave the big camera bag; alleys are tight.',
    know:
      'From about $25. Must-do if you want a host, not a graze. If the date is sold out, do not substitute a random “food tour” and call it Lily — wait or pick the night-market card on purpose.',
  },
  'ha-memories-show': {
    where:
      'Hội An Impression Theme Park on Cẩm Nam (Nguyễn Tri Phương). Taxi or booked transfer — not an Ancient Town walking ticket. Arrive by 17:00 if you want the park villages before the 20:00 show. Dark on Tuesday.',
    what:
      'A large outdoor spectacular with hundreds of performers, plus the theme-park grounds. Eco, High, and VIP seats see different slices of the stage.',
    expect:
      'Park time plus a 60-minute show. It is loud, lit, and tourist-scale. HIGH seats are worth it if you care about the picture. Mosquitoes after rain.',
    bring:
      'The e-ticket, a light layer, and insect spray. Cash for snacks. Kids like it; toddlers may find the volume hard.',
    know:
      'From about $14 Eco on Klook. Popular, not a secret. Do not confuse this with hanging a lantern on the Hoài — that is a different, cheaper night.',
  },
  'hcmc-moto-food': {
    where:
      'Hotel pickup in District 1 with an all-female rider crew (XO Tours is the known name; others copy the format). Helmet on before the first alley. Routes cut D3, D4, and D8 supper stalls — not Bùi Viện and not a walk around the Bến Thành hall.',
    what:
      'A night motorbike street-food tour: you ride pillion, hop off at named stools, eat standing, then move. Four or five stops is a normal sheet. It is dinner as a ride, not a restaurant crawl.',
    expect:
      'Three to four hours. Traffic, heat, and fish sauce on your fingers. Tell them spice and shellfish limits when you book. Skirts are awkward on a bike; closed shoes help.',
    bring:
      'A light layer that can take splashes, cash for extras, and a small bag that zips. Leave flowing dresses and big cameras. Phone in a pocket.',
    know:
      'From about $45. Must-do if you want a host and a helmet. Vespa alley tours are daytime chrome; this is supper. If you only want Bến Thành night stalls, book that crawl instead.',
  },
  'hcmc-ao-show': {
    where:
      'Municipal Theatre — the Saigon Opera House on Lam Sơn Square. Enter with an À Ố ticket. Photographing the façade without a seat is not this.',
    what:
      'Lune Productions’ bamboo circus: bodies, rattan, almost no speech. About 60 minutes. Two evening shows most days.',
    expect:
      'Theatre air-con after street heat. Kids usually cope; the drums are loud. VIP is faces; cheaper seats still work.',
    bring:
      'The e-ticket on your phone, a light layer, and quiet. No food in the hall.',
    know:
      'From about $28 on Klook. Weekends sell out. This is not a walking-tour stop at the opera house — buy the show.',
  },
  'hcmc-cu-chi-shoot': {
    where:
      'The supervised range next to the Củ Chi tunnel complex, reached by morning van from District 1. War Remnants Museum is a different morning in town.',
    what:
      'Optional rifle time after (or with) the tunnels: you pay by the bullet, wear ear protection, fire under staff. The tunnels sight card is the underground walk; this card is the range.',
    expect:
      'Loud, hot, dusty. Not for anyone uneasy with weapons. Ages and IDs are checked. The tunnel crawl is separate and tight.',
    bring:
      'Closed shoes, ear defenders if you have them (they usually issue some), water, and a clear “no” if you only want the tunnels.',
    know:
      'Packages from about $25 including a short shoot; extra rounds cost more. Unique, not romantic. Skip it without guilt — the tunnels still work as a sight.',
  },
  'hcmc-palace-bunker': {
    where:
      'Independence Palace (Reunification Palace) on Nam Kỳ Khởi Nghĩa. Meet for a bunker-first guided visit. Gate selfies without going underground are the sight card.',
    what:
      'The 1960s command rooms: maps, radios, the April 1975 story from below the ceremonial floors.',
    expect:
      'Stairs, concrete, photography limits. English depends on the sheet. Combine with the state rooms if the ticket includes them — still one outing.',
    bring:
      'The voucher, modest clothes, and time before last entry (often mid-afternoon).',
    know:
      'From about $12 with ticket. Must-do for history. Bitexco is a different afternoon in glass.',
  },
  'pq-snorkel-guide': {
    where:
      'Hotel or An Thới pickup for a four-island speedboat. You enter the water at the south islets. The phu-quoc-snorkel sight is the same sea in the bag; this card is the booked boat. Freediving is a different morning.',
    what:
      'Shared snorkel day: kit, vest, lunch, several reef stops when the weather holds. You swim; you do not only photograph from the deck.',
    expect:
      'Five to seven hours. Sun, chop, and average reef — this is recreational, not a remote expedition. Non-swimmers should say so. Seasickness tablets help some people.',
    bring:
      'Reef-safe sunscreen, rash vest, towel, dry bag. Leave passports at the hotel unless asked.',
    know:
      'From about $25. Must-do in calm season. October–January can be murky. Do not stack this with a private second boat for the same islets.',
  },
  'pq-hon-thom-cable': {
    where:
      'Sun World station in Sunset Town. Buy a ride ticket. Photographing the towers from the plaza without boarding is the sight card.',
    what:
      'The 7.9 km over-sea cable to Hòn Thơm and back. Combos may add VinWonders — read the voucher. Last return is earlier than sunset.',
    expect:
      'Queues in high season. Wind can slow cabins. Kids like the glass floor if you get that car.',
    bring:
      'The e-ticket, a layer, and a plan for last car back. Do not assume you can stay on the island after the final return.',
    know:
      'From about $15. Must-do for the engineering. Kiss of the Sea is a separate night ticket at the same precinct.',
  },
  'pq-kiss-sea-show': {
    where:
      'Sunset Town show basin after dusk. Ticketed Kiss of the Sea. Weekend fireworks when the calendar lists them.',
    what:
      'Fountain, lights, a short multimedia set over the water. Not the cable car and not a free promenade.',
    expect:
      'Crowds on the plaza. Paid seats see more of the picture. Mosquitoes after rain.',
    bring:
      'The voucher and a light layer. Cash for snacks.',
    know:
      'From about $10. Popular, tourist-scale. Rock Island cocktails are a different booking beside the same rocks.',
  },
  'dl-canyoning': {
    where:
      'Datanla canyon south of Đà Lạt. Hotel pickup with a licensed outfitter. The waterfall viewing decks are the sight card; the alpine coaster and ropes park are other tickets on the same hill.',
    what:
      'Guided abseils, jumps, and swims in a real canyon. Helmet and harness. You get wet on purpose.',
    expect:
      'Half or full day. Cold water, stairs, and a swim test in spirit if not on paper. Age and fitness limits. Cameras in a dry bag or skip them.',
    bring:
      'Swimwear under clothes, strap-on shoes that can get soaked, a change of clothes, and motion-sickness tablets if vans bother you.',
    know:
      'From about $45. Must-do if you want sport, not scenery. Do not book canyoning and a full ropes-plus-coaster stack unless you have two days.',
  },
  'dl-hon-bo-sunrise': {
    where:
      'Pre-dawn van from your hotel to Hòn Bồ Peak. Cloud sits only if the weather agrees. Vintage jeep dawns and Langbiang are other ridgelines.',
    what:
      'A viewpoint morning: wool cloud below, coffee in the cold, photos, then back to town before lunch.',
    expect:
      'Pickup around 04:00. Wind, dark, and a chance of no cloud. Layers matter more than a fancy camera.',
    bring:
      'A warm layer, headlamp optional, and patience if fog is just fog.',
    know:
      'From about $12. Must-do for photographers. Refunds are rare when the cloud does not show — that is the gamble.',
  },
  'dl-crazy-house-walk': {
    where:
      'Hang Nga (Crazy House) in Đà Lạt. Meet for a hosted architecture walk. Gate photos without a ticket are the sight card.',
    what:
      'A maze of concrete trees, tight stairs, odd rooms. A host names what you are looking at.',
    expect:
      'One to one and a half hours. Low ceilings, uneven steps, not stroller-friendly. Kids usually love it; knees may not.',
    bring:
      'The voucher, flat shoes, and a small bag. Tripods are awkward in the corridors.',
    know:
      'From about $8 with ticket. Must-do for the building. Mosaic class is a studio, not this house.',
  },
  'dn-surf-my-khe': {
    where:
      'Mỹ Khê beachfront schools on Phạm Văn Đồng. Morning glass. The beach sight is lounge time; Sơn Trà parasail is a different desk.',
    what:
      'Beginner lesson plus board rental. Coach in the water. Pop-ups and ocean safety.',
    expect:
      'Ninety minutes to two hours. You will swallow salt. Tell them if you cannot swim well. Afternoon wind is for watching, not first lessons.',
    bring:
      'Swimwear, sunscreen, a strap for glasses. They supply the board. A change of clothes for the taxi home.',
    know:
      'From about $35. Must-do if you want a real lesson. Pickup football on the same sand is free and different.',
  },
  'dn-ba-na-ticket': {
    where:
      'Hotel pickup in Đà Nẵng to Sun World Bà Nà. Cable car is the ticket. Hội An travelers should use the Hội An day-trip listing. The ba-na-hills sight is the place card.',
    what:
      'Cable car, Golden Bridge hands, French Village. Optional Fantasy Park queues.',
    expect:
      'A full day. Cloud and rain hide the view. Buffet extras cost more. Wear layers — it is cooler on top.',
    bring:
      'The voucher, a light jacket, and patience for cable-car lines.',
    know:
      'From about $45. Must-do for first-timers. Do not stack it with Thần Tài and rafting on the same day.',
  },
  'dn-dragon-fire-cruise': {
    where:
      'Han River piers near Dragon Bridge. Weekend fire-and-water show around 21:00. Standing on the bank without a boat is the sight card. Buffet dance cruises are a dinner ticket.',
    what:
      'A short booked boat under the dragon when it breathes fire and water.',
    expect:
      'Sixty to ninety minutes. Confirm the show night. Weeknights may be lights only.',
    bring:
      'The voucher and a layer for wind on deck. Arrive before boarding, not at 21:00.',
    know:
      'From about $18. Must-do if you want a seat on the water. Kayak dusk is a paddle, not this.',
  },
  'hg-loop-easy-rider': {
    where:
      'Start in Hà Giang city with a licensed Easy Rider. Three or four days. The half-day buddy ride is a different card. The ha-giang-loop sight is the route, not this booking.',
    what:
      'Pillion or self-drive the loop: passes, homestays, tea. Your rider sets the pace.',
    expect:
      'Dust, cold mornings, long saddle days. Agree luggage and rain covers. Sunday market only if a Sunday falls on the itinerary.',
    bring:
      'Layers, rain jacket, closed shoes. A buff for dust.',
    know:
      'From about $80 a day with rider. Must-do for the highlands. Do not stack a Lũng Cú jeep on the same day you already ride there.',
  },
  'hl-overnight-cruise': {
    where:
      'Tuan Chau or Cat Ba pier. Cabin overnight. The halong-cruise sight is the bay outing. Squid cocktail boats are evening-only.',
    what:
      'Meals, cabin, and a kayak slot on the published itinerary.',
    expect:
      'One night. Sung Sốt and Luồn may be landings — they are still separate activity cards if you book them as extras.',
    bring:
      'The voucher, motion tablets if you need them, a light layer for deck.',
    know:
      'From about $180. Must-do. Day kayak is not a cabin.',
  },
  'pn-son-doong': {
    where:
      'Oxalis check-in in Phong Nha. Nobody else sells Sơn Đoòng legally.',
    what:
      'Multi-day jungle and cave camp. Hang Én is the shorter sister trek.',
    expect:
      'Waitlists, fitness screening, serious money. Not Dark Cave mud day.',
    bring:
      'Whatever Oxalis lists. Do not freelance this cave.',
    know:
      'From about $3000. Must-do only if you have the permit. Everyone else looks at the sight card and books Hang Én or Dark Cave.',
  },
}
