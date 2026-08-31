import type { PracticalTag, ShoppingItem } from './types'

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 'vietnamese-coffee',
    name: 'Vietnamese Coffee',
    featured: true,
    tags: ['☕ Local Classic', '⭐ Must Bring Home'],
    specialityReason: 'Vietnam Essential',
    description:
      'Bold, aromatic coffee shaped by Vietnam’s slow-drip phin — a ritual you cannot fake with a supermarket bag. Beans, a small metal filter and condensed-milk kits travel easily, taste like a Hanoi sidewalk breakfast, and make one of the strongest gifts you can take home. Buy sealed bags from known roasters rather than unmarked market piles.',
    storyParagraphs: [
      {
        title: 'Key characteristics',
        body:
          'Vietnamese coffee is built on dark-roast robusta more often than arabica: thick, chocolatey, a little smoky, and strong enough to stand up to sweetened condensed milk. The phin — a small metal drip filter — slows the brew into a ritual rather than a shot. What you take home is not a supermarket blend with a tropical label. It is that sidewalk cup: bitter, round, and meant to be sipped, not gulped. A bag of beans plus a phin is the whole kit.',
      },
      {
        title: 'Popular types',
        body:
          'Cà phê sữa đá is the everyday classic: robusta dripped over condensed milk, then poured on ice. Cà phê trứng (egg coffee) is a Hanoi sit-down: whipped yolk foam over a fierce brew. Highlands robusta from Buôn Ma Thuột is the workhorse; Dalat arabica shows up in specialty shops. Buy sealed bags from named roasters, and skip unmarked market piles. The gift is the method as much as the beans.',
      },
    ],
    images: [
      img('photo-1514432324607-a09d9b4aefdd'),
      img('photo-1442512595331-e89e7388250c'),
      img('photo-1495474472287-4d71bcdd2085'),
      img('photo-1509042239860-f550ce710b93'),
      img('photo-1461023058943-07fcbe16d735'),
      img('photo-1498804103079-a6351b050096'),
    ],
    regions: ['Central Highlands', 'Nationwide'],
    regionalVariations: [
      {
        region: 'Central',
        label: 'Highlands roast',
        note: 'Buôn Ma Thuột robusta depth and chocolate notes.',
      },
      {
        region: 'Southern',
        label: 'Saigon style',
        note: 'Often sold with phin filters and condensed-milk kits.',
      },
      {
        region: 'Northern',
        label: 'Hanoi cafés',
        note: 'Egg-coffee culture pairs with specialty beans.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/k4HA1ejw_hA',
    whyItMatters: [
      'Vietnam is one of the world’s great coffee producers, and the phin drip culture is unmistakably local.',
      'Roasted beans and small metal filters travel well and make a gift that feels specific, not generic.',
      'Buying near origin or specialty shops helps you avoid tourist-markup sachets.',
    ],
    typicalCostLabel: '$$',
    typicalCostFrom: 'From $4–12 for beans / filter kits',
    material: 'Roasted coffee beans · metal phin',
    origin: 'Central Highlands · sold nationwide',
    airportSafe: true,
    fragile: false,
    easyToPack: true,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Sometimes',
    worthBringingHome: 5,
    worthReason:
      'Excellent souvenir — distinctive, easy to carry and strongly associated with Vietnamese coffee culture.',
    authenticityNote: 'Prefer sealed bags from known roasters over unmarked market piles.',
  },
  {
    id: 'vietnamese-tea',
    name: 'Vietnamese Tea',
    featured: true,
    tags: ['🌿 Regional Special', '🎁 Great Gift'],
    specialityReason: 'Regional Special',
    description:
      'Light, fragrant teas from northern hills and lotus-scented traditions — distinctive here, even if tea itself is not unique to Vietnam. Sealed packs are light, gift-friendly and easy to compare, with clear origin on the tin worth more than a pretty empty box. A strong, inexpensive present with almost no packing cost.',
    storyParagraphs: [
      {
        title: 'Key characteristics',
        body:
          'Vietnamese tea is quieter than the coffee story, and that is the point. Northern greens from Thái Nguyên are light, grassy and floral; lotus tea is scented by burying leaves in blossoms overnight. Everyday trà đá is a different drink again — cheap iced tea on every street. What travels well is sealed leaf with a clear origin, not a decorative empty tin. A small pack is one of the lightest, cheapest gifts you can carry.',
      },
      {
        title: 'Popular types',
        body:
          'Look for Thái Nguyên green, lotus-scented trà sen, artisanal oolong from the highlands, and herbal blends sold in Hanoi and Huế. Southern shops lean toward iced-tea culture and packaged mixes. Read the origin on the tin, smell the leaf if you can, and prefer cooperative or specialty counters over souvenir boxes. Tea is not unique to Vietnam — but these scents and villages are.',
      },
    ],
    images: [
      img('photo-1544787219-7f47ccb76574'),
      img('photo-1576092768241-dec231879fc3'),
      img('photo-1556679343-c7306c1976bc'),
      img('photo-1594631252845-29fc4cc8cde9'),
      img('photo-1571934811356-5cc061b6821f'),
      img('photo-1564890369473-f4b8aa59e5a5'),
    ],
    regions: ['Northern highlands', 'Nationwide'],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Greener profiles',
        note: 'Thai Nguyen and highland greens feel lighter and floral.',
      },
      {
        region: 'Central',
        label: 'Herbal blends',
        note: 'Artisan shops mix regional botanicals.',
      },
      {
        region: 'Southern',
        label: 'Iced tea culture',
        note: 'Different everyday preparation and packaging.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/yEtIwQGwyec',
    whyItMatters: [
      'Tea sits quietly beside Vietnam’s coffee fame — especially northern greens and lotus-scented leaves.',
      'Small sealed packs are light, gift-friendly and easy to compare across markets.',
      'Look for clear origin labeling rather than decorative empty tins.',
    ],
    typicalCostLabel: '$',
    typicalCostFrom: 'From $3–10 per pack',
    material: 'Dried tea leaves',
    origin: 'Northern highlands · specialty shops',
    airportSafe: true,
    fragile: false,
    easyToPack: true,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Yes',
    worthBringingHome: 4,
    worthReason:
      'Light, affordable and regionally distinctive — strong gift value for little packing cost.',
  },
  {
    id: 'silk',
    name: 'Silk',
    featured: true,
    tags: ['🇻🇳 Vietnam Essential', '⭐ Must Bring Home'],
    specialityReason: 'Vietnam Essential',
    description:
      'Soft, luminous silk from weaving villages and Hoi An tailor streets — one of Vietnam’s most recognizable crafts, tactile and culturally grounded. Scarves pack flat and custom garments become part of the trip itself. Feel the weight and ask about silk content; blends hide in tourist lanes, and a well-chosen piece is a classic take-home.',
    storyParagraphs: [
      {
        title: 'History and production',
        body:
          'Silk has been woven in Vietnam for centuries, from village looms at Vạn Phúc near Hanoi to Hội An’s tailor streets, where Chinese, Japanese and Vietnamese trade left a cloth culture that still measures you in an afternoon. Mulberry, worm, reel, dye, weave — the good pieces still carry that chain. Scarves, áo dài fabric and custom shirts are the forms that travel. A well-chosen length is one of the country’s most recognizable crafts.',
      },
      {
        title: 'Market realities and buying tips',
        body:
          'Tourist lanes sell blends labelled as silk. Feel the weight, ask the percentage, and compare a village shop with a night-market stall before you commit. Fixed-price malls are easier; street tailors need a conversation. Scarves pack flat; a custom garment is a trip, not a last-morning errand — allow a fitting. Pay for origin and hand, not for the word silk printed on a tag.',
      },
    ],
    images: [
      img('photo-1558769132-cb1aea458c5e'),
      img('photo-1583292650898-7d22cd27ca6f'),
      img('photo-1590736969955-71cc94901144'),
      img('photo-1490481651871-ab68de25d43d'),
      img('photo-1520006403909-838d6b92c22e'),
      img('photo-1558171813-4c088753af8f'),
    ],
    regions: ['Hanoi', 'Hoi An', 'Van Phuc'],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Vạn Phúc silk',
        note: 'Village weaving near Hanoi with classic scarf formats.',
      },
      {
        region: 'Central',
        label: 'Hoi An tailoring',
        note: 'Custom garments and lighter tropical weaves.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/iZJzTScgB-c',
    whyItMatters: [
      'Silk is one of Vietnam’s most recognizable craft exports — tactile, beautiful and culturally grounded.',
      'Scarves pack flat; custom tailoring is a trip experience as much as a purchase.',
      'Quality varies widely, so feel weight and ask about origin rather than chasing the cheapest stall.',
    ],
    typicalCostLabel: '$$$',
    typicalCostFrom: 'From $15–80+ depending on piece',
    material: 'Silk textiles',
    origin: 'Vạn Phúc · Hoi An · craft shops',
    airportSafe: true,
    fragile: false,
    easyToPack: true,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Sometimes',
    worthBringingHome: 5,
    worthReason: 'Classic bring-home piece — beautiful, packable and unmistakably craft-led.',
    authenticityNote: 'Ask about silk content; blends are common in tourist lanes.',
  },
  {
    id: 'lacquerware',
    name: 'Lacquerware',
    featured: true,
    tags: ['🇻🇳 Vietnam Essential', '🎁 Great Gift'],
    specialityReason: 'Vietnam Essential',
    description:
      'Glossy, layered lacquer boxes and trays built from dozens of polished coats — slow Vietnamese craft, not a factory souvenir. Small travel-size pieces make memorable gifts if you wrap them well; workshop streets beat mall copies for finish and colour. A strong take-home if you can protect the fragile shine.',
    storyParagraphs: [
      {
        title: 'What it is made of',
        body:
          'Vietnamese lacquerware starts with wood, then sap from the sơn tree, built up in many thin coats until the surface is deep, glossy and almost liquid. Egg shell, gold leaf, mother-of-pearl and colour pigments sit in those layers. The object is a box, a tray, a bowl — small enough to pack — but the material is time: each coat must dry and be sanded before the next. Factory gloss is thinner; workshop pieces feel heavier in the hand.',
      },
      {
        title: 'The craft process',
        body:
          'A serious piece can take weeks: seal the wood, lay sap, inlay, polish, repeat. Hanoi’s craft streets and Huế workshops still do this by hand. Look for even edges, a depth of colour you can look into, and a price that does not pretend a week of labour costs five dollars. Wrap well — the shine chips. Small travel sizes beat oversized décor you will not get through the airport intact.',
      },
    ],
    images: [
      img('photo-1513519245088-0e12902e35a6'),
      img('photo-1452860606245-08befc0ff44b'),
      img('photo-1586023492125-27b2c045efd7'),
      img('photo-1610701596007-11502861dcfa'),
      img('photo-1555041469-a586c61ea9bc'),
      img('photo-1493663284031-b7e3aefcae8e'),
    ],
    regions: ['Hanoi', 'Hue', 'HCMC'],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Hanoi workshops',
        note: 'Classic egg-shell and gold-leaf techniques.',
      },
      {
        region: 'Central',
        label: 'Hue craft shops',
        note: 'Often smaller decorative pieces for travel.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/oHzWxXqmOXE',
    whyItMatters: [
      'Vietnamese lacquerware is a slow craft — dozens of layers polished into deep colour and shine.',
      'Small boxes and trays make memorable gifts if you pack them carefully.',
      'Workshop districts beat generic souvenir streets for finish quality.',
    ],
    typicalCostLabel: '$$$',
    typicalCostFrom: 'From $12–60 for travel-size pieces',
    material: 'Lacquered wood · resin finishes',
    origin: 'Hanoi craft streets · Hue shops',
    airportSafe: true,
    fragile: true,
    easyToPack: false,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Sometimes',
    worthBringingHome: 4,
    worthReason:
      'Strong cultural signal and gift value — worth it if you can protect fragile finishes.',
  },
  {
    id: 'ceramics',
    name: 'Ceramics',
    featured: true,
    tags: ['🌿 Regional Special', '🇻🇳 Vietnam Essential'],
    specialityReason: 'Regional Special',
    description:
      'Hand-finished bowls, cups and tiles from pottery towns such as Bát Tràng, where living craft still outranks airport ceramics. Everyday tableware travels better than oversized décor, and buying at the village usually wins on character and price. Choose smaller pieces, pack for fragility, and you bring home something you will actually use.',
    storyParagraphs: [
      {
        title: 'What it is made of',
        body:
          'Vietnamese ceramics are clay, glaze and fire — most famously from Bát Tràng outside Hanoi, where river clay and a long kiln tradition still make everyday bowls, cups and tiles. The body is stoneware more often than porcelain; glazes run celadon, cobalt, cream and brown. What you want is tableware you will use, not a giant vase. The clay is local; the skill is village, not factory sticker.',
      },
      {
        title: 'The craft process',
        body:
          'Throw or press, dry, biscuit, glaze, fire. Village kilns still do this at a human pace. Walk Bát Tràng for seconds and firsts, ask what is handmade, and compare weight. Airport ceramics are lighter in story and often in clay. Pack cups in clothes; skip the oversized décor. A set of bowls is the piece that actually reaches your table.',
      },
    ],
    images: [
      img('photo-1565193566173-7a0ee3dbe261'),
      img('photo-1610701596007-11502861dcfa'),
      img('photo-1578749556568-bc2c40e68b61'),
      img('photo-1493106641515-6b5631de4bb9'),
      img('photo-1610701596061-2ecf227e861b'),
      img('photo-1578500494198-246f612d3b3d'),
    ],
    regions: ['Bat Trang', 'Hanoi', 'Hoi An'],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Bát Tràng',
        note: 'Vietnam’s best-known ceramic village near Hanoi.',
      },
      {
        region: 'Central',
        label: 'Hoi An studios',
        note: 'Smaller decorative and tableware pieces.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/t7sTPrvculo',
    whyItMatters: [
      'Ceramics connect you to living craft villages — especially Bát Tràng outside Hanoi.',
      'Everyday cups and bowls travel home better than oversized décor if packed well.',
      'Buying at the source usually beats airport ceramics for character and price.',
    ],
    typicalCostLabel: '$$',
    typicalCostFrom: 'From $5–35 per piece',
    material: 'Glazed ceramic',
    origin: 'Bát Tràng · craft districts',
    airportSafe: true,
    fragile: true,
    easyToPack: false,
    bulky: false,
    carryOnFriendly: false,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Yes',
    worthBringingHome: 4,
    worthReason: 'Beautiful and usable — choose smaller pieces and pack for fragility.',
  },
  {
    id: 'handmade-lanterns',
    name: 'Handmade Lanterns',
    featured: true,
    tags: ['🌿 Regional Special', '🎁 Great Gift'],
    specialityReason: 'Only Found In This Form Here',
    description:
      'Silk and bamboo lanterns glowing with Hoi An’s evening colour — a form of souvenir almost inseparable from that town’s night streets. Collapsible frames pack far better than rigid ones, so ask before you buy a large size. Compare workshops rather than identical tourist-lane copies, and you take home a signature Hoi An piece.',
    storyParagraphs: [
      {
        title: 'How they are made',
        body:
          'A Hội An lantern is a bamboo or wire frame stretched with silk (or cheaper fabric), wired for a bulb or candle, and finished so it folds or stands. Workshop streets still cut, stretch and stitch by hand. Collapsible frames pack; rigid globes do not. Ask to see it fold before you buy a large size. The good ones keep their shape; the tourist copies sag after a humid week.',
      },
      {
        title: 'Colours and meaning',
        body:
          'Hội An’s night streets are a wash of silk colour — red for luck and celebration, yellow for prosperity, blue and green for calm, white for purity. Mixed lanterns are simply beautiful, not a code you must decode. Buy the colour you will actually hang. Evening workshops glow for a reason: this is the town’s signature object, not a generic night-market toy.',
      },
    ],
    images: [
      img('photo-1528127269322-539801943592'),
      img('photo-1559592413-7cec4d0cae2b'),
      img('photo-1583417319070-4a69db38a482'),
      img('photo-1509030450996-3a5ea825872b'),
      img('photo-1528183429752-a97d0bf99b5a'),
      img('photo-1544551763-46a013bb70d5'),
    ],
    regions: ['Hoi An'],
    regionalVariations: [],
    youtubeVideoUrl: 'https://www.youtube.com/embed/5S2_5ZrmUyQ',
    whyItMatters: [
      'Lanterns are inseparable from Hoi An’s night atmosphere and make a memorable visual souvenir.',
      'Collapsible styles pack better than rigid frames — ask before you buy large sizes.',
      'Workshop streets offer more character than identical tourist-lane copies.',
    ],
    typicalCostLabel: '$$',
    typicalCostFrom: 'From $6–25 depending on size',
    material: 'Silk · bamboo · wire frames',
    origin: 'Hoi An lantern workshops',
    airportSafe: true,
    fragile: true,
    easyToPack: false,
    bulky: true,
    carryOnFriendly: false,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Yes',
    worthBringingHome: 4,
    worthReason: 'Signature Hoi An piece — choose foldable sizes if you need luggage space.',
  },
  {
    id: 'spices',
    name: 'Spices',
    featured: true,
    tags: ['☕ Local Classic', '🎁 Great Gift'],
    specialityReason: 'Local Classic',
    description:
      'Star anise, cinnamon, chilli and mixed packs that carry a Vietnamese kitchen home in a pouch — one of the easiest wins in any suitcase. Sealed bags are light, cheap and usually airport-friendly in modest amounts. Buy from busy spice counters rather than pretty tourist jars, and you will actually cook with what you bring back.',
    storyParagraphs: [
      {
        title: 'Essential Vietnam spices',
        body:
          'A Vietnamese kitchen travels in a pouch: star anise and cinnamon for phở, black cardamom for smoky broth, lemongrass and chilli for the centre, pepper from Phú Quốc, turmeric and coriander seed, and shrimp paste if you can seal it well. Mixed “phở spice” bundles are the easiest start. Buy from busy market counters — Đồng Xuân, Bến Thành, Hội An Central — not pretty tourist jars. Sealed bags are light, cheap and usually airport-friendly in modest amounts. This is one of the highest-usefulness, lowest-packing-cost things you can bring home.',
      },
    ],
    images: [
      img('photo-1596040033229-a9821ebd058d'),
      img('photo-1506368249639-73a05d6f6488'),
      img('photo-1606914501449-5a96b8aa59e0'),
      img('photo-1516594798947-e65505dbb29d'),
      img('photo-1478144592103-25e218a04891'),
      img('photo-1596040033229-a9821ebd058d'),
    ],
    regions: ['Nationwide'],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Pho spice sets',
        note: 'Star anise and cinnamon bundles for broth.',
      },
      {
        region: 'Central',
        label: 'Chilli-forward mixes',
        note: 'Bolder heat suited to central cooking.',
      },
      {
        region: 'Southern',
        label: 'Market blends',
        note: 'Wide variety in Saigon wet markets.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/xxM4t8vP-0A',
    whyItMatters: [
      'Spices are the quietest way to bring Vietnamese flavour into your kitchen later.',
      'Sealed packs are light and usually airport-friendly in modest quantities.',
      'Buy from busy spice counters rather than prettified tourist jars alone.',
    ],
    typicalCostLabel: '$',
    typicalCostFrom: 'From $2–8 per pack',
    material: 'Dried spices',
    origin: 'Markets nationwide',
    airportSafe: true,
    fragile: false,
    easyToPack: true,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Yes',
    worthBringingHome: 5,
    worthReason: 'High usefulness, tiny packing cost — one of the easiest wins to bring home.',
  },
  {
    id: 'local-snacks',
    name: 'Local Snacks',
    featured: true,
    tags: ['🎁 Great Gift', '☕ Local Classic'],
    specialityReason: 'Great Gift',
    description:
      'Coconut candies, sesame crackers and packaged sweets that make light, shareable souvenirs for friends and colleagues. Choose sealed factory or reputable market brands for longer journeys, and skip soft sweets that melt in heat. Best as a fun add-on rather than the main thing you bring home.',
    storyParagraphs: [
      {
        title: 'Popular street food snacks',
        body:
          'What packs is not the stool snack itself — bánh mì goes stale — but the sealed versions of what people actually eat: sesame crackers, rice crackers, dried banana, roasted peanuts, and packaged bò khô. Markets and supermarket aisles are better than decorative gift towers. Buy what you would eat on a bus, in a sealed bag, with a date on it.',
      },
      {
        title: 'Sweet treats and candies',
        body:
          'Coconut candy from Bến Tre, lotus-seed sweets, green-rice (cốm) treats in season, and sesame-peanut brittle are the classic shareable gifts. Factory-sealed beats soft market fudge that melts in a suitcase. Skip anything oily or unlabelled for a long flight. These are fun add-ons, not the main souvenir — a handful of packs for colleagues is enough.',
      },
    ],
    images: [
      img('photo-1481391319762-47dff72954d9'),
      img('photo-1558961363-fa8fdf82db35'),
      img('photo-1582058091505-f87a2e55a40f'),
      img('photo-1606313564200-e75d5e30476c'),
      img('photo-1571115177098-24ec42ed204d'),
      img('photo-1499636136210-6f4ee915583e'),
    ],
    regions: ['Nationwide · Ben Tre coconut sweets'],
    regionalVariations: [
      {
        region: 'Southern',
        label: 'Coconut candy',
        note: 'Mekong specialties pack well for short trips home.',
      },
      {
        region: 'Northern',
        label: 'Seed & sesame snacks',
        note: 'Common in Hanoi gift shops.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/b4COqj_4aIg',
    whyItMatters: [
      'Packaged snacks are the easiest shareable souvenirs for friends and colleagues.',
      'Choose sealed factory or reputable market brands for longer journeys.',
      'Watch liquids and soft sweets that melt in heat.',
    ],
    typicalCostLabel: '$',
    typicalCostFrom: 'From $1–6 per pack',
    material: 'Packaged confectionery',
    origin: 'Markets · specialty snack shops',
    airportSafe: true,
    fragile: false,
    easyToPack: true,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: true,
    giftFriendly: true,
    bargainable: 'Sometimes',
    worthBringingHome: 3,
    worthReason: 'Fun and shareable — best as light add-ons rather than primary souvenirs.',
  },
  {
    id: 'embroidered-crafts',
    name: 'Embroidered Crafts',
    featured: true,
    tags: ['🌿 Regional Special', '🎁 Great Gift'],
    specialityReason: 'Regional Special',
    description:
      'Hand-stitched textiles and accessories that turn village craft into something you can wear or pack — a personal alternative to mass-produced souvenirs. Small pieces travel better than wall hangings, and cooperative shops often give a clearer maker story than souvenir streets. Distinctive here for the motifs, even if embroidery exists worldwide.',
    storyParagraphs: [
      {
        title: 'History and origins',
        body:
          'Embroidery in Vietnam runs from courtly Huế stitchwork to highland textiles and Hanoi cooperative shops. Motifs — lotus, phoenix, village scenes, geometric hill-tribe patterns — are the local language, even though embroidery exists worldwide. What you buy should look stitched, not printed. Small accessories and scarves travel; huge wall hangings usually do not.',
      },
      {
        title: 'Famous Vietnam embroidery villages',
        body:
          'Quất Động near Hanoi is the classic embroidery village; Sapa and northern highland shops carry Hmong and Dao stitch and appliqué; Hội An sells lighter travel pieces. Cooperative and village shops usually tell a clearer maker story than souvenir streets. Compare thread density and the back of the work. Pay for hand, not for a frame that will not fit in the overhead bin.',
      },
    ],
    images: [
      img('photo-1452860606245-08befc0ff44b'),
      img('photo-1558769132-cb1aea458c5e'),
      img('photo-1520006403909-838d6b92c22e'),
      img('photo-1590736969955-71cc94901144'),
      img('photo-1490481651871-ab68de25d43d'),
      img('photo-1583292650898-7d22cd27ca6f'),
    ],
    regions: ['Hanoi', 'Sapa crafts', 'Hoi An'],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Highland motifs',
        note: 'Stronger ethnic textile patterns in mountain craft shops.',
      },
      {
        region: 'Central',
        label: 'Hoi An stitchwork',
        note: 'Scarves and small accessories for travel packing.',
      },
    ],
    youtubeVideoUrl: 'https://www.youtube.com/embed/yEtIwQGwyec',
    whyItMatters: [
      'Embroidery turns everyday textiles into cultural keepsakes without needing fragile packaging.',
      'Small pieces travel better than large wall hangings.',
      'Fair-trade and cooperative shops often give clearer maker stories.',
    ],
    typicalCostLabel: '$$',
    typicalCostFrom: 'From $8–40',
    material: 'Embroidered fabric',
    origin: 'Craft cooperatives · Hanoi · Hoi An',
    airportSafe: true,
    fragile: false,
    easyToPack: true,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Sometimes',
    worthBringingHome: 4,
    worthReason: 'Personal and packable — a strong alternative to mass-produced souvenirs.',
  },
  {
    id: 'traditional-gifts',
    name: 'Traditional Gifts',
    featured: true,
    tags: ['🇻🇳 Vietnam Essential', '🎁 Great Gift'],
    specialityReason: 'Great Gift',
    description:
      'Classic take-home pieces — nón lá miniatures, fans, seals and small crafts — useful when you need several gifts fast without visiting every specialty shop. Quality ranges wildly, so choose fewer better objects instead of a bag of plastic trinkets. Convenient, optional, and only worth it when you are selective.',
    storyParagraphs: [
      {
        title: 'Iconic crafts and decor',
        body:
          'The classic pile: miniature nón lá, folding fans, seals, water puppets in miniature, and small lacquer or ceramic objects. Useful when you need several gifts in one market walk. Quality ranges from village-made to plastic. Choose fewer better objects. A real fan or a small lacquer box beats a bag of keyrings.',
      },
      {
        title: 'Fashion and textiles',
        body:
          'Scarves, light shirts, nón lá (full-size only if you can pack it), and embroidered accessories sit in the same gift streets. Feel fabric, ask about silk content, and skip anything that pills in the hand. One good textile gift is worth more than five printed T-shirts. Tailor streets in Hội An are a different errand — allow time.',
      },
      {
        title: 'Food and drink',
        body:
          'Coffee, tea, spices, coconut candy and fish sauce (well sealed, in checked bags) are the edible half of a mixed gift haul. Markets and specialty counters beat decorative towers. This is the easy, useful layer when you are buying for people who cook. Keep liquids modest and labelled.',
      },
    ],
    images: [
      img('photo-1528183429752-a97d0bf99b5a'),
      img('photo-1559592413-7cec4d0cae2b'),
      img('photo-1509030450996-3a5ea825872b'),
      img('photo-1583417319070-4a69db38a482'),
      img('photo-1544551763-46a013bb70d5'),
      img('photo-1528127269322-539801943592'),
    ],
    regions: ['Nationwide'],
    regionalVariations: [],
    youtubeVideoUrl: 'https://www.youtube.com/embed/obRDCiSwjCs',
    whyItMatters: [
      'Traditional gift shops gather the classics when you need several small presents fast.',
      'Quality ranges wildly — choose fewer better pieces over a bag of plastic trinkets.',
      'Useful when you want variety without visiting every craft specialty.',
    ],
    typicalCostLabel: '$$',
    typicalCostFrom: 'From $3–25 per gift',
    material: 'Mixed crafts',
    origin: 'Gift streets · markets · malls',
    airportSafe: true,
    fragile: true,
    easyToPack: true,
    bulky: false,
    carryOnFriendly: true,
    liquid: false,
    perishable: false,
    giftFriendly: true,
    bargainable: 'Yes',
    worthBringingHome: 3,
    worthReason: 'Convenient for mixed gifts — be selective to avoid tourist clutter.',
  },
]

export function getItemPracticalTags(item: ShoppingItem): PracticalTag[] {
  const tags: PracticalTag[] = []
  if (item.airportSafe) tags.push('Airport Safe')
  if (item.fragile) {
    tags.push('Fragile')
    tags.push('Needs Care')
  }
  if (item.easyToPack) tags.push('Easy to Pack')
  if (item.bulky) tags.push('Bulky')
  if (item.carryOnFriendly) tags.push('Carry-On Friendly')
  if (item.liquid) tags.push('Liquid')
  if (item.perishable) tags.push('Perishable')
  if (item.giftFriendly) tags.push('Gift Friendly')
  if (item.bargainable === 'Yes' || item.bargainable === 'Sometimes') tags.push('Bargainable')
  if (item.bargainable === 'No · Fixed price') tags.push('Fixed Price')
  return tags
}

export function getItemById(id: string): ShoppingItem | undefined {
  return SHOPPING_ITEMS.find((i) => i.id === id)
}

export function getFeaturedItems(): ShoppingItem[] {
  return SHOPPING_ITEMS.filter((i) => i.featured)
}

export function worthStars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

export function itemUniqueness(item: ShoppingItem): {
  unique: boolean
  headline: string
  body: string
} {
  const body = [item.whyItMatters[0], item.authenticityNote].filter(Boolean).join(' ')
  if (item.specialityReason === 'Only Found In This Form Here') {
    return { unique: true, headline: 'Unique to Vietnam in this form', body }
  }
  if (item.specialityReason === 'Vietnam Essential') {
    return { unique: true, headline: 'A Vietnam essential', body }
  }
  if (item.specialityReason === 'Regional Special') {
    return {
      unique: false,
      headline: 'Distinctive here, not exclusive worldwide',
      body,
    }
  }
  return {
    unique: false,
    headline: 'Not exclusive to Vietnam — buy here for quality and price',
    body,
  }
}

export function itemWorthTake(item: ShoppingItem): {
  label: string
  tone: 'yes' | 'careful' | 'optional' | 'skip'
} {
  if (item.worthBringingHome >= 5) return { label: 'Take it home', tone: 'yes' }
  if (item.worthBringingHome === 4) {
    return item.fragile || item.bulky
      ? { label: 'Yes, if you pack carefully', tone: 'careful' }
      : { label: 'Worth bringing home', tone: 'yes' }
  }
  if (item.worthBringingHome === 3) {
    return { label: 'Optional — only if you love it', tone: 'optional' }
  }
  return { label: 'Skip unless you have a strong reason', tone: 'skip' }
}
