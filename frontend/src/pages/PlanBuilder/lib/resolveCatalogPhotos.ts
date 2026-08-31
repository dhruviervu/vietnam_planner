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
  'cooking-class': THEMES.cooking,
  'hn-cooking-home': THEMES.cooking,
  'hcmc-cook-class': THEMES.cooking,
  'hue-royal-cook': THEMES.cooking,
  'ha-tra-que-cook': THEMES.cooking,
  'pn-farmstay-cook': THEMES.cooking,
  'sp-homestay-cook': THEMES.cooking,
  'nb-countryside-cook': THEMES.cooking,
  'pq-seafood-cook': THEMES.cooking,
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
}

export function isDirectImageUrl(url: string) {
  if (!url) return false
  if (url.includes('picsum.photos')) return false
  if (/placehold|placeholder|via\.placeholder/i.test(url)) return false
  if (/commons\.wikimedia\.org\/wiki\/File:/i.test(url)) return false
  return true
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

/** Known-good Unsplash first so cards never flash empty; specific sources follow. */
export function withPhotoFallbacks(primary: string[], hint: string) {
  const usable = uniquePhotos(primary.filter(isDirectImageUrl))
  const themed = themedFallbackPhotos(hint)
  return uniquePhotos([...themed, ...usable])
}
