/** Known-good Unsplash URLs used as last-resort themed photos (never an empty box). */
const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`

const THEMES = {
  coffee: [
    u('photo-1495474472287-4d71bcdd2085'),
    u('photo-1442512595331-e89e73853f31'),
    u('photo-1511920170033-91abc30eae40'),
  ],
  lanterns: [
    u('photo-1559592413-7cec4d0cae2b'),
    u('photo-1578662996442-48f36e0481b4'),
    u('photo-1583417319070-4a69db38a482'),
  ],
  cooking: [
    u('photo-1556910103-1c0279aa3b47'),
    u('photo-1559314809-0d155014e29e'),
    u('photo-1467003909585-2f8a72700288'),
  ],
  food: [
    u('photo-1559314809-0d155014e29e'),
    u('photo-1569562211093-4ed0d0758f10'),
    u('photo-1504674900247-0877df9cc836'),
  ],
  bay: [
    u('photo-1528127269322-539801943592'),
    u('photo-1559827260-dc66d52bef19'),
    u('photo-1507525428034-b723cf961d3e'),
  ],
  beach: [
    u('photo-1507525428034-b723cf961d3e'),
    u('photo-1476514525535-07fb3b4ae5f1'),
    u('photo-1500375592092-40eb2168fd21'),
  ],
  temple: [
    u('photo-1528183429752-a97d0bf99b1a'),
    u('photo-1548013146-72479768bada'),
    u('photo-1477587458883-47145f9d4b6d'),
  ],
  citadel: [
    u('photo-1528183429752-a97d0bf99b1a'),
    u('photo-1555881400-74d7acaacd8b'),
    u('photo-1501785888041-af3ef285b470'),
  ],
  cave: [
    u('photo-1551632811-561732d1e306'),
    u('photo-1464822759023-fed622ff2c3b'),
    u('photo-1501785888041-af3ef285b470'),
  ],
  mountain: [
    u('photo-1464822759023-fed622ff2c3b'),
    u('photo-1486870591958-9b9d0d1dda99'),
    u('photo-1501785888041-af3ef285b470'),
  ],
  rice: [
    u('photo-1501785888041-af3ef285b470'),
    u('photo-1464822759023-fed622ff2c3b'),
    u('photo-1470071459604-3b5ec3a7fe05'),
  ],
  market: [
    u('photo-1555881400-74d7acaacd8b'),
    u('photo-1488459716781-31db52582fe9'),
    u('photo-1533900298318-6b8da08a523e'),
  ],
  city: [
    u('photo-1570168007204-dfb528c6958f'),
    u('photo-1449824913935-59a10b8d2000'),
    u('photo-1480714378408-67cf0d13bc1b'),
  ],
  lake: [
    u('photo-1439066615861-d1af74d74000'),
    u('photo-1501785888041-af3ef285b470'),
    u('photo-1470071459604-3b5ec3a7fe05'),
  ],
  bridge: [
    u('photo-1477959858617-67f85cf4f1df'),
    u('photo-1449824913935-59a10b8d2000'),
    u('photo-1480714378408-67cf0d13bc1b'),
  ],
  museum: [
    u('photo-1554907984-15263bfd63bd'),
    u('photo-1577083552431-6e5fd01988ec'),
    u('photo-1491156855053-9d2b2b6a1a1e'),
  ],
  prison: [
    u('photo-1467269204594-9661b134dd2b'),
    u('photo-1554907984-15263bfd63bd'),
    u('photo-1570168007204-dfb528c6958f'),
  ],
  kayak: [
    u('photo-1472745942893-4b9f730c7668'),
    u('photo-1528127269322-539801943592'),
    u('photo-1507525428034-b723cf961d3e'),
  ],
  craft: [
    u('photo-1452860606245-08befc0ff44b'),
    u('photo-1565193566173-7a0ee3dbe50c'),
    u('photo-1610701596007-11502861dcfa'),
  ],
  dance: [
    u('photo-1504609813442-a8924e83f76e'),
    u('photo-1514525253161-7a46d19cd819'),
    u('photo-1429962714451-bb934ec2e2bb'),
  ],
  sport: [
    u('photo-1502680390469-be75680c4dd4'),
    u('photo-1530549387789-4c1017266635'),
    u('photo-1507525428034-b723cf961d3e'),
  ],
}

const BY_ID: Record<string, string[]> = {
  'egg-coffee': THEMES.coffee,
  'hn-egg-coffee-lab': THEMES.coffee,
  'apartment-cafes': THEMES.coffee,
  'hoi-an-lanterns': THEMES.lanterns,
  'ha-lantern-make': THEMES.lanterns,
  'ha-hoai-lantern-boat': THEMES.lanterns,
  'ha-jewelry-workshop': THEMES.craft,
  'ha-hai-van-easy-rider': THEMES.mountain,
  'ha-cham-snorkel': THEMES.bay,
  'ha-tailor': THEMES.craft,
  'ha-coffee-lab': THEMES.coffee,
  'ha-memories-show': THEMES.lanterns,
  'ha-sidecar-jeep': THEMES.rice,
  'ha-thubon-sup': THEMES.kayak,
  'ha-kim-bong-wood': THEMES.craft,
  'ha-speakeasy-crawl': THEMES.dance,
  'ha-ms-lily-food': THEMES.food,
  'ha-an-bang-surf': THEMES.beach,
  'ha-bamboo-craft': THEMES.craft,
  'ha-night-market-crawl': THEMES.market,
  'ha-ba-na-day': THEMES.bridge,
  'ha-marble-am-phu': THEMES.cave,
  'ha-silk-village': THEMES.craft,
  'ha-myson-dawn': THEMES.temple,
  'ha-herbal-massage': THEMES.city,
  'ha-sunset-dinner-cruise': THEMES.lanterns,
  'ha-basket-boat': THEMES.kayak,
  'ha-thanh-ha-pottery': THEMES.craft,
  'ha-an-bang-play': THEMES.beach,
  'ha-folk-dance': THEMES.dance,
  'cooking-class': THEMES.cooking,
  'hn-cooking-home': THEMES.cooking,
  'hn-bat-trang-pottery': THEMES.craft,
  'hn-silver-workshop': THEMES.craft,
  'hn-knife-making': THEMES.craft,
  'hn-print-embroidery': THEMES.craft,
  'hn-tea-ceremony': THEMES.coffee,
  'hn-vespa-jeep': THEMES.city,
  'hn-speakeasy-crawl': THEMES.dance,
  'hn-quang-ba-flowers': THEMES.market,
  'hn-long-bien-cycle': THEMES.bridge,
  'hn-incense-village': THEMES.craft,
  'hn-truc-bach-swan': THEMES.lake,
  'hn-da-cau': THEMES.sport,
  'hcmc-cook-class': THEMES.cooking,
  'hcmc-moto-food': THEMES.food,
  'hcmc-ao-show': THEMES.dance,
  'hcmc-scent-lab': THEMES.craft,
  'hcmc-silver-clay': THEMES.craft,
  'hcmc-rum-pairing': THEMES.food,
  'hcmc-ben-thanh-crawl': THEMES.market,
  'hcmc-sunset-cruise': THEMES.city,
  'hcmc-cu-chi-shoot': THEMES.prison,
  'hcmc-cafe-apt-fragrance': THEMES.coffee,
  'hcmc-speakeasy-crawl': THEMES.dance,
  'hcmc-saigon-sup': THEMES.kayak,
  'hcmc-egg-coffee-lab': THEMES.coffee,
  'hcmc-cho-lon-photo': THEMES.market,
  'hcmc-waterbus-thanh-da': THEMES.kayak,
  'hcmc-lion-head': THEMES.craft,
  'hcmc-vespa-alleys': THEMES.city,
  'hcmc-herbal-massage': THEMES.city,
  'hcmc-craft-beer': THEMES.food,
  'hcmc-palace-bunker': THEMES.museum,
  'hcmc-bitexco-ticket': THEMES.city,
  'hcmc-ao-dai-photo': THEMES.city,
  'hcmc-ho-thi-ky': THEMES.market,
  'hcmc-suoi-tien-water': THEMES.sport,
  'hcmc-mekong-speedboat': THEMES.kayak,
  'hcmc-dance-class': THEMES.dance,
  'hcmc-karaoke': THEMES.dance,
  'hcmc-boxing': THEMES.sport,
  'hue-royal-cook': THEMES.cooking,
  'ha-tra-que-cook': THEMES.cooking,
  'pn-farmstay-cook': THEMES.cooking,
  'sp-homestay-cook': THEMES.cooking,
  'nb-countryside-cook': THEMES.cooking,
  'pq-seafood-cook': THEMES.cooking,
  'pq-snorkel-guide': THEMES.bay,
  'pq-hon-thom-cable': THEMES.bridge,
  'pq-squid-dinner': THEMES.food,
  'pq-cua-can-kayak': THEMES.kayak,
  'pq-kiss-sea-show': THEMES.lanterns,
  'pq-pearl-craft': THEMES.craft,
  'pq-rach-vem-starfish': THEMES.beach,
  'pq-ridgeback': THEMES.sport,
  'pq-fish-sauce': THEMES.food,
  'pq-sim-wine': THEMES.coffee,
  'pq-night-safari': THEMES.mountain,
  'pq-sup-sunset': THEMES.kayak,
  'pq-jeep-north': THEMES.mountain,
  'pq-pepper-workshop': THEMES.craft,
  'pq-sea-walk': THEMES.bay,
  'pq-night-fish-bbq': THEMES.food,
  'pq-rock-island': THEMES.dance,
  'pq-bee-farm': THEMES.rice,
  'pq-versailles-spa': THEMES.beach,
  'pq-sun-bavaria': THEMES.food,
  'pq-prison-tour': THEMES.prison,
  'pq-grand-world-taxi': THEMES.lanterns,
  'pq-aquatopia': THEMES.sport,
  'pq-freedive': THEMES.bay,
  'pq-beach-volley': THEMES.beach,
  'pq-beach-drum': THEMES.dance,
  'dl-canyoning': THEMES.mountain,
  'dl-alpine-coaster': THEMES.sport,
  'dl-coffee-farm': THEMES.coffee,
  'dl-hon-bo-sunrise': THEMES.mountain,
  'dl-tuyen-lam-sup': THEMES.kayak,
  'dl-mongo-land': THEMES.sport,
  'dl-easy-rider': THEMES.mountain,
  'dl-datanla-ropes': THEMES.sport,
  'dl-balava-chocolate': THEMES.food,
  'dl-robin-cable': THEMES.bridge,
  'dl-lumiere': THEMES.lanterns,
  'dl-pine-mtb': THEMES.mountain,
  'dl-candle-craft': THEMES.craft,
  'dl-cau-dat-tea': THEMES.rice,
  'dl-mosaic-glass': THEMES.craft,
  'dl-langbiang-jeep': THEMES.mountain,
  'dl-suoi-may-onsen': THEMES.lake,
  'dl-night-market-food': THEMES.food,
  'dl-valley-love-boat': THEMES.lake,
  'dl-cricket-wine': THEMES.food,
  'dl-flower-highland': THEMES.rice,
  'dl-crazy-house-walk': THEMES.city,
  'dl-jeep-dawn': THEMES.mountain,
  'dl-strawberry-pick': THEMES.rice,
  'dl-steam-train': THEMES.city,
  'dl-market-cook': THEMES.cooking,
  'dl-lake-cycle': THEMES.lake,
  'dn-surf-my-khe': THEMES.beach,
  'dn-douc-safari': THEMES.mountain,
  'dn-hoa-phu-raft': THEMES.kayak,
  'dn-phin-coffee': THEMES.coffee,
  'dn-cook-class': THEMES.cooking,
  'dn-dragon-fire-cruise': THEMES.bridge,
  'dn-han-buffet-cruise': THEMES.food,
  'dn-marble-am-phu': THEMES.cave,
  'dn-aodai-food': THEMES.food,
  'dn-cham-seatrek': THEMES.bay,
  'dn-hai-van-jeep': THEMES.mountain,
  'dn-ba-na-ticket': THEMES.bridge,
  'dn-than-tai': THEMES.lake,
  'dn-atv-bbq': THEMES.mountain,
  'dn-perfume': THEMES.craft,
  'dn-stone-carve': THEMES.craft,
  'dn-mikazuki': THEMES.beach,
  'dn-sky36': THEMES.city,
  'dn-champa-show': THEMES.temple,
  'dn-sontra-watersports': THEMES.sport,
  'dn-brewery-hop': THEMES.food,
  'dn-hue-train': THEMES.city,
  'dn-myson-dawn': THEMES.temple,
  'dn-sontra-kayak': THEMES.kayak,
  'dn-han-market-hunt': THEMES.food,
  'dn-beach-football': THEMES.beach,
  'dn-sunset-yoga': THEMES.beach,
  'dn-han-kayak': THEMES.kayak,
  'nb-trang-an-boat': THEMES.kayak,
  'nb-mua-hike': THEMES.mountain,
  'nb-tam-coc': THEMES.rice,
  'nb-bai-dinh-tour': THEMES.temple,
  'nb-cuc-phuong': THEMES.mountain,
  'nb-hoa-lu-cycle': THEMES.citadel,
  'nb-paddle-van-long': THEMES.kayak,
  'nb-thung-nam': THEMES.kayak,
  'nb-rice-homestay': THEMES.rice,
  'nb-bike-picnic': THEMES.rice,
  'hl-overnight-cruise': THEMES.bay,
  'hl-luon-boat': THEMES.kayak,
  'hl-titop-hike': THEMES.mountain,
  'hl-catba-trek': THEMES.mountain,
  'hl-dinh-huong-boat': THEMES.bay,
  'hl-sung-sot-guide': THEMES.cave,
  'hl-catba-scooter': THEMES.city,
  'hl-squid-night': THEMES.bay,
  'hl-catba-canopy': THEMES.sport,
  'hl-beach-volley': THEMES.beach,
  'hg-loop-easy-rider': THEMES.mountain,
  'hg-nho-que-kayak': THEMES.kayak,
  'hg-lo-lo-tea': THEMES.coffee,
  'hg-weaving': THEMES.craft,
  'hg-ma-pi-leng-skywalk': THEMES.mountain,
  'hg-dong-van-sunday': THEMES.city,
  'hg-du-gia-cook': THEMES.cooking,
  'hg-khau-lai': THEMES.lake,
  'hg-lung-cu-jeep': THEMES.mountain,
  'hg-homestay-dance': THEMES.temple,
  'hg-market-day': THEMES.food,
  'hg-easy-ride-buddy': THEMES.mountain,
  'sp-muong-hoa-trek': THEMES.rice,
  'sp-fansipan-cable': THEMES.bridge,
  'sp-red-dao-bath': THEMES.lake,
  'sp-indigo-batik': THEMES.craft,
  'sp-rice-wine': THEMES.coffee,
  'sp-ban-mong-coaster': THEMES.sport,
  'sp-paraglide': THEMES.mountain,
  'sp-waterfall-scooter': THEMES.mountain,
  'sp-bac-ha-market': THEMES.city,
  'sp-terrace-walk-games': THEMES.rice,
  'sp-evening-song': THEMES.temple,
  'hue-dragon-sunset': THEMES.kayak,
  'hue-ao-dai-photo': THEMES.citadel,
  'hue-incense-craft': THEMES.craft,
  'hue-truc-lam-bach-ma': THEMES.temple,
  'hue-tam-giang': THEMES.food,
  'hue-an-dinh-walk': THEMES.citadel,
  'hue-ca-hue-boat': THEMES.kayak,
  'hue-cyclo-food': THEMES.food,
  'hue-ao-dai-cycle': THEMES.city,
  'pn-son-doong': THEMES.cave,
  'pn-hang-en': THEMES.cave,
  'pn-dark-cave-play': THEMES.cave,
  'pn-cave-boat-tour': THEMES.cave,
  'pn-mo-coc': THEMES.kayak,
  'pn-ozo': THEMES.sport,
  'pn-duck-stop': THEMES.rice,
  'pn-bike': THEMES.rice,
  'pn-cha-loi': THEMES.cave,
  'pn-son-kayak': THEMES.kayak,
  'mk-cai-rang': THEMES.kayak,
  'mk-coconut-candy': THEMES.food,
  'mk-tram-chim': THEMES.kayak,
  'mk-bentre-kayak-bike': THEMES.kayak,
  'mk-cook-class': THEMES.cooking,
  'mk-an-binh-pick': THEMES.rice,
  'mk-tra-su': THEMES.kayak,
  'mk-bee-folk': THEMES.coffee,
  'mk-chau-doc': THEMES.city,
  'mk-homestay-fish': THEMES.kayak,
  'mk-sampan-paddle': THEMES.kayak,
  'mk-don-ca-tai-tu': THEMES.temple,
  'nt-island-snorkel': THEMES.bay,
  'nt-hon-mun-dive': THEMES.bay,
  'nt-mud-bath': THEMES.lake,
  'nt-vinwonders': THEMES.bridge,
  'nt-monkey-island': THEMES.bay,
  'nt-emperor-sunset': THEMES.bay,
  'nt-night-fish': THEMES.food,
  'nt-ba-ho': THEMES.mountain,
  'nt-seafood-grill': THEMES.food,
  'nt-beach-volley': THEMES.beach,
  'halong-cruise': THEMES.bay,
  'lan-ha': THEMES.bay,
  'cat-ba': THEMES.bay,
  'hl-kayak-karsts': THEMES.kayak,
  'hl-sup-lan-ha': THEMES.kayak,
  'temple-literature': THEMES.citadel,
  'old-quarter': THEMES.city,
  'ninh-binh': THEMES.rice,
  'mua-cave': THEMES.cave,
  'hoa-lu': THEMES.citadel,
  'ha-giang-loop': THEMES.mountain,
  'sapa-trek': THEMES.mountain,
  'hue-citadel': THEMES.citadel,
  'da-nang-beach': THEMES.beach,
  'phong-nha': THEMES.cave,
  'war-remnants': THEMES.museum,
  'cu-chi': THEMES.prison,
  'mekong-delta': THEMES.kayak,
  'phu-quoc-snorkel': THEMES.beach,
  'phu-quoc-sunset': THEMES.beach,
  'hanoi-food-tour': THEMES.food,
  'train-street': THEMES.city,
  'an-bang': THEMES.beach,
  'my-son': THEMES.temple,
  'marble-mountains': THEMES.cave,
  'ben-thanh': THEMES.market,
  'perfume-river': THEMES.lake,
  'dark-cave': THEMES.cave,
  'dong-van': THEMES.mountain,
  'fansipan': THEMES.mountain,
  'bia-hoi': THEMES.food,
  'hoan-kiem-lake': THEMES.lake,
  'hoa-lo-prison': THEMES.prison,
  'ho-chi-minh-mausoleum': THEMES.citadel,
  'west-lake': THEMES.lake,
  'ethnology-museum': THEMES.museum,
  'thang-long-citadel': THEMES.citadel,
  'dong-xuan-market': THEMES.market,
  'hanoi-opera-house': THEMES.city,
  'quan-thanh-temple': THEMES.temple,
  'long-bien-bridge': THEMES.bridge,
  'notre-dame-saigon': THEMES.city,
  'independence-palace': THEMES.museum,
  'landmark81-viewpoint': THEMES.city,
  'jade-emperor-pagoda': THEMES.temple,
  'nguyen-hue-walking': THEMES.city,
  'cho-lon': THEMES.market,
  'hoi-an-ancient-town': THEMES.lanterns,
  'cam-thanh-basket-boats': THEMES.kayak,
  'tra-que-village': THEMES.rice,
  'thanh-ha-pottery': THEMES.craft,
  'japanese-covered-bridge': THEMES.bridge,
  'tan-ky-old-house': THEMES.city,
  'phung-hung-old-house': THEMES.city,
  'duc-an-old-house': THEMES.city,
  'quan-thang-old-house': THEMES.city,
  'hoi-an-market': THEMES.market,
  'fujian-assembly-hall': THEMES.temple,
  'cantonese-assembly-hall': THEMES.temple,
  'hainan-assembly-hall': THEMES.temple,
  'teochew-assembly-hall': THEMES.temple,
  'chinese-assembly-hall': THEMES.temple,
  'quan-cong-temple': THEMES.temple,
  'phap-bao-pagoda': THEMES.temple,
  'hoi-an-central-mosque': THEMES.temple,
  'museum-trade-ceramics': THEMES.museum,
  'hoi-an-history-museum': THEMES.museum,
  'sa-huynh-museum': THEMES.museum,
  'folk-culture-museum': THEMES.museum,
  'precious-heritage-museum': THEMES.museum,
  'kim-bong-village': THEMES.craft,
  'cam-thanh-nipa-forest': THEMES.kayak,
  'cua-dai-beach': THEMES.beach,
  'cu-lao-cham': THEMES.bay,
  'thien-mu-pagoda': THEMES.temple,
  'tu-duc-tomb': THEMES.citadel,
  'minh-mang-tomb': THEMES.citadel,
  'dong-ba-market': THEMES.market,
  'dragon-bridge': THEMES.bridge,
  'son-tra': THEMES.mountain,
  'linh-ung-pagoda': THEMES.temple,
  'ba-na-hills': THEMES.mountain,
  'sung-sot-cave': THEMES.cave,
  'ti-top-island': THEMES.bay,
  'trang-an-boats': THEMES.rice,
  'tam-coc-boats': THEMES.rice,
  'van-long': THEMES.rice,
  'bai-dinh': THEMES.temple,
  'thung-nham': THEMES.rice,
  'tuyet-tinh-coc': THEMES.cave,
  'cuc-phuong': THEMES.mountain,
  'dong-thien-ha': THEMES.cave,
  'dong-tien-canh': THEMES.cave,
  'bich-dong-pagoda': THEMES.temple,
  'thai-vi-temple': THEMES.temple,
  'hang-thien-huong': THEMES.temple,
  'den-tran-hoa-lu': THEMES.temple,
  'bai-dinh-co': THEMES.temple,
  'pho-co-hoa-lu': THEMES.city,
  'dinh-le-tombs': THEMES.citadel,
  'phat-diem-cathedral': THEMES.city,
  'kim-son-sedge': THEMES.craft,
  'ninh-van-stone': THEMES.craft,
  'van-lam-embroidery': THEMES.craft,
  'bear-sanctuary-ninh-binh': THEMES.mountain,
  'co-vien-lau': THEMES.city,
  'cat-cat-village': THEMES.mountain,
  'sapa-market': THEMES.market,
  'sao-beach': THEMES.beach,
  'duong-dong-night-market': THEMES.market,
  'dinh-cau': THEMES.temple,
  'paradise-cave': THEMES.cave,
  'phong-nha-cave-boat': THEMES.cave,
  'po-nagar': THEMES.temple,
  'nha-trang-promenade': THEMES.beach,
  'xuan-huong-lake': THEMES.lake,
  'crazy-house': THEMES.city,
  'valley-of-love': THEMES.mountain,
  'tuyen-lam-lake': THEMES.lake,
  'lake-of-sighs': THEMES.lake,
  'da-lat-railway-station': THEMES.city,
  'da-lat-cathedral': THEMES.city,
  'domaine-de-marie': THEMES.city,
  'linh-phuoc-pagoda': THEMES.temple,
  'truc-lam-monastery': THEMES.temple,
  'linh-an-pagoda': THEMES.temple,
  'thien-vuong-pagoda': THEMES.temple,
  'bao-dai-palace-i': THEMES.citadel,
  'bao-dai-palace-ii': THEMES.citadel,
  'bao-dai-palace-iii': THEMES.citadel,
  'lam-vien-square': THEMES.city,
  'clay-tunnel-dalat': THEMES.craft,
  'elephant-falls': THEMES.mountain,
  'pongour-waterfall': THEMES.mountain,
  'prenn-waterfall': THEMES.mountain,
  'tiger-cave-waterfall': THEMES.cave,
  'cam-ly-waterfall': THEMES.mountain,
  'dambri-waterfall': THEMES.mountain,
  'langbiang': THEMES.mountain,
  'da-lat-flower-gardens': THEMES.rice,
  'van-thanh-flowers': THEMES.rice,
  'thai-phien-flowers': THEMES.rice,
  'cau-dat-tea': THEMES.mountain,
  'da-lat-market': THEMES.market,
  'fairytale-land-dalat': THEMES.city,
  'lumiere-light-garden': THEMES.lanterns,
  'hydrangea-trai-mat': THEMES.rice,
  'fresh-garden-dalat': THEMES.rice,
  'cu-lan-village': THEMES.mountain,
  'chicken-village-kho': THEMES.craft,
  'mongo-land-dalat': THEMES.city,
  'french-quarter-dalat': THEMES.city,
  'hundred-roofs-bar': THEMES.city,
}

const GENERIC_CITY_STEMS = new Set([
  'ho chi minh city',
  'ho chi minh city skyline',
  'saigon',
  'thanh pho ho chi minh',
  'hanoi',
  'ha noi',
  'da nang',
  'danang',
  'nha trang',
  'hue',
  'hoi an',
  'da lat',
  'dalat',
  'sapa',
  'sa pa',
  'phu quoc',
  'can tho',
  'vietnam',
  'flag of vietnam',
  'aerial view of ho chi minh city',
  'aerial view of hanoi',
])

export function photoFileStem(url: string): string {
  try {
    const path = decodeURIComponent((url.split('?')[0] ?? '').replace(/\+/g, ' '))
    const base = path.split('/').pop() ?? ''
    return base
      .replace(/^\d+px-/, '')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  } catch {
    return ''
  }
}

export function sightPhotoTokens(sight: { id?: string; name?: string }): string[] {
  const raw = `${sight.id ?? ''} ${sight.name ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
  const stop = new Set([
    'the',
    'and',
    'of',
    'in',
    'at',
    'a',
    'an',
    'de',
    'du',
    'la',
    'le',
    'old',
    'new',
    'walk',
    'loop',
    'tour',
    'day',
    'city',
  ])
  return [...new Set(raw.split(/\s+/).filter((t) => t.length >= 3 && !stop.has(t)))]
}

export function isGenericCityPhoto(
  url: string,
  sight: { id?: string; name?: string; city?: string },
): boolean {
  const stem = photoFileStem(url)
  if (!stem) return false
  const city = (sight.city ?? '').toLowerCase().replace(/[_-]+/g, ' ').trim()
  const isCityOnly =
    GENERIC_CITY_STEMS.has(stem) ||
    Boolean(city && (stem === city || stem === `${city} vietnam` || stem === `${city} skyline`))
  if (!isCityOnly) return false
  const blob = `${sight.id ?? ''} ${sight.name ?? ''}`.toLowerCase()
  if (/skyline|viewpoint|panorama|city view|promenade|overview/.test(blob)) return false
  const tokens = sightPhotoTokens(sight)
  if (tokens.some((t) => t.length >= 4 && stem.includes(t) && t !== city.split(' ')[0])) return false
  return true
}

const WEAK_LEAD =
  /\b(bridge|highway|motorway|roundabout|parking|signboard|road sign|map of|flag of|coat of arms|logo|diagram|floor plan|poster|stamp|coin|banknote|screenshot|selfie|graduation|promoting|actor|actress|film still)\b/i

export function rankPhotosForSight(
  urls: string[],
  sight: { id?: string; name?: string; city?: string },
  prefer: string[] = [],
): string[] {
  const unique = uniquePhotos(urls.filter(isDirectImageUrl))
  const tokens = sightPhotoTokens(sight)
  const preferSet = new Set(prefer.filter(isDirectImageUrl))
  const title = `${sight.id ?? ''} ${sight.name ?? ''}`.toLowerCase()
  const scored = unique.map((url, index) => {
    const stem = photoFileStem(url) || ''
    let score = 0
    for (const token of tokens) {
      if (token.length >= 3 && stem.includes(token)) score += token.length >= 5 ? 4 : 2
    }
    if (preferSet.has(url)) score += 12
    if (isGenericCityPhoto(url, sight)) score -= 18
    if (WEAK_LEAD.test(stem) && !WEAK_LEAD.test(title)) score -= 10
    if (/\b(film|movie|actor|actress|promoting)\b/i.test(stem) && !/cinema|theatre|theater|movie/i.test(title)) {
      score -= 12
    }
    if (/upload\.wikimedia\.org/.test(url) && /\/thumb\//.test(url)) score += 1
    score -= index * 0.01
    return { url, score, stem }
  })
  scored.sort((a, b) => b.score - a.score)
  const usedStems = new Set<string>()
  const ordered: string[] = []
  for (const row of scored) {
    if (isGenericCityPhoto(row.url, sight) && row.score <= 0) continue
    const key = row.stem.replace(/\d+/g, '').slice(0, 28)
    if (ordered.length < 3 && key && usedStems.has(key) && row.score < 8) continue
    if (key) usedStems.add(key)
    ordered.push(row.url)
  }
  return uniquePhotos(ordered)
}

export function isDirectImageUrl(url: string) {
  if (!url) return false
  if (url.includes('picsum.photos')) return false
  if (/placehold|placeholder|via\.placeholder/i.test(url)) return false
  if (/commons\.wikimedia\.org\/wiki\/File:/i.test(url)) return false
  return true
}

/**
 * Smaller files for catalog cards so a long sights page does not fetch 1280px originals.
 * Wikimedia only serves its standard thumbnail widths (250, 330, 500, 960, 1280, …); others return 400.
 */
export function catalogCardPhotoUrl(src: string): string {
  if (!src) return src
  return src
    .replace(/\/(\d{3,4})px-/g, (_, n: string) => (Number(n) > 500 ? '/500px-' : `/${n}px-`))
    .replace(/([?&]w=)(\d+)/g, (full, prefix: string, w: string) =>
      Number(w) > 800 ? `${prefix}640` : full,
    )
}

export function uniquePhotos(urls: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

export function themedFallbackPhotos(hint: string): string[] {
  const h = hint.toLowerCase()
  if (BY_ID[h.split(/\s+/)[0] ?? '']) return BY_ID[h.split(/\s+/)[0] ?? '']!
  for (const [id, photos] of Object.entries(BY_ID)) {
    if (h.includes(id)) return photos
  }
  if (/egg-coffee|egg coffee|ca phe|cà phê|coffee|cafe/.test(h) && !/lantern/.test(h)) {
    return THEMES.coffee
  }
  if (/lantern/.test(h)) return THEMES.lanterns
  if (/cook|cuisine|kitchen|recipe/.test(h)) return THEMES.cooking
  if (/pho|food|bun cha|street food|seafood|candy/.test(h)) return THEMES.food
  if (/kayak|paddle|sampan|sup /.test(h)) return THEMES.kayak
  if (/cruise|ha long|halong|lan ha|junk|karst bay/.test(h)) return THEMES.bay
  if (/beach|snorkel|surf|promenade|an-bang|my-khe|sao-beach/.test(h)) return THEMES.beach
  if (/cave|phong-nha|paradise|dark-cave|sung-sot/.test(h)) return THEMES.cave
  if (/sapa|fansipan|ha-giang|dong-van|terrace|trek|mountain|son-tra/.test(h)) {
    return THEMES.mountain
  }
  if (/rice|ninh-binh|tam-coc|trang-an|van-long|mua/.test(h)) return THEMES.rice
  if (/market|ben-thanh|dong-xuan|dong-ba|cho-lon/.test(h)) return THEMES.market
  if (/museum|ethnology|war-remnant|independence|palace/.test(h)) return THEMES.museum
  if (/prison|hoa-lo|cu-chi|tunnel/.test(h)) return THEMES.prison
  if (/citadel|hue|thang-long|hoa-lu|my-son|pagoda|temple|tomb|mausoleum/.test(h)) {
    return THEMES.citadel
  }
  if (/bridge|dragon-bridge|long-bien/.test(h)) return THEMES.bridge
  if (/lake|hoan-kiem|west-lake|xuan-huong/.test(h)) return THEMES.lake
  if (/dance|karaoke|music|song|folk/.test(h)) return THEMES.dance
  if (/surf|volley|football|yoga|boxing|sport/.test(h)) return THEMES.sport
  if (/pottery|weaving|batik|craft|incense/.test(h)) return THEMES.craft
  if (/temple|pagoda/.test(h)) return THEMES.temple
  return THEMES.city
}

/**
 * Place-matching Wikipedia / Wikimedia photos first.
 * Themed Unsplash is only used to fill empty cards — never in front of a real sight photo.
 */
export function withPhotoFallbacks(primary: string[], hint: string) {
  const usable = uniquePhotos(primary.filter(isDirectImageUrl))
  if (usable.length >= 3) return usable
  const themed = themedFallbackPhotos(hint)
  return uniquePhotos([...usable, ...themed])
}
