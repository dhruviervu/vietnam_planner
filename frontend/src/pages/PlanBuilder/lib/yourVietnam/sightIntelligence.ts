/**
 * Visit intelligence for every catalog sight. Used when packing days and
 * sorting a day's tour: a cruise / ticketed enclosure / park is one outing,
 * and listed inner stops are landings on that outing — not extra taxi hops.
 *
 * Containment and typical clocks follow published Google itineraries
 * (Ha Long Route 1/2 day boats, Hue Imperial City walking axis, Hoi An
 * heritage coupons, Ba Dinh complex, Lan Ha / Cat Ba day boats, Fansipan
 * Sun World, Sun World Ha Long, Ninh Binh countryside loops).
 */

export type SightAccess = 'walk' | 'boat' | 'trek' | 'day-trip' | 'cable'

export type SightComplexKind =
  | 'contains'
  | 'same-ticket'
  | 'same-park'
  | 'same-day'
  | 'pick-one'

export type ComplexMember = {
  id: string
  seq: number
  /** Clock on the parent outing when this is an included landing. */
  clock?: string
  /** Pier / town card — only joins the outing when the parent is also selected. */
  soft?: boolean
}

export type SightComplex = {
  id: string
  parentId: string
  kind: SightComplexKind
  exclusive?: boolean
  access?: SightAccess
  members: ComplexMember[]
  /** Same-role stops — do not treat as two separate outings. */
  alternatives?: string[]
}

function m(id: string, seq: number, clock?: string, soft?: boolean): ComplexMember {
  return {
    id,
    seq,
    ...(clock ? { clock } : {}),
    ...(soft ? { soft: true } : {}),
  }
}

function cx(
  id: string,
  parentId: string,
  kind: SightComplexKind,
  members: ComplexMember[],
  extra: Partial<Pick<SightComplex, 'exclusive' | 'access' | 'alternatives'>> = {},
): SightComplex {
  return { id, parentId, kind, members, ...extra }
}

/** Same place listed under two city catalogs, or an activity that is the sight. */
export const SIGHT_ALIASES: Record<string, string> = {
  'lan-ha': 'lan-ha-bay',
  'dong-van-old-quarter': 'dong-van-ancient-town',
  'vuong-palace-dong-van': 'vuong-palace',
  'ma-pi-leng-dong-van': 'ma-pi-leng-pass',
  'tu-san-dong-van': 'tu-san-canyon',
  'nho-que-dong-van': 'nho-que-river',
  'lung-cu-dong-van': 'lung-cu-flag-tower',
  'lo-lo-chai-dong-van': 'lo-lo-chai-village',
  'lao-sa-dong-van': 'lao-xa-village',
  'sung-la-dong-van': 'sung-la-valley',
  'pao-house-dong-van': 'pao-house',
  'tham-ma-dong-van': 'tham-ma-pass',
  'chin-khoanh-dong-van': 'chin-khoanh-pass',
  'ma-le-dong-van': 'ma-le-village',
  'sunday-market-dong-van': 'dong-van-sunday-market',
}

const CANONICAL_MEMO = new Map<string, string>()

export function canonicalSightId(id: string): string {
  const hit = CANONICAL_MEMO.get(id)
  if (hit !== undefined) return hit
  let cur = id
  const seen = new Set<string>()
  while (SIGHT_ALIASES[cur] && !seen.has(cur)) {
    seen.add(cur)
    cur = SIGHT_ALIASES[cur]
  }
  CANONICAL_MEMO.set(id, cur)
  return cur
}

/**
 * Atomic outings. Members stay on the same day, in `seq` order. When the
 * parent card is also selected, non-parent members are included landings.
 */
export const SIGHT_COMPLEXES: SightComplex[] = [
  // —— Ha Long: published day-cruise Route 2 (Sung Sot → Luon → Ti Top)
  // and shorter Route 1 (Thien Cung + Dau Go on the same islet near the piers).
  cx(
    'halong-day-cruise',
    'halong-cruise',
    'contains',
    [
      m('halong-cruise', 0),
      m('tuan-chau-island', 5, '12:00–12:30', true),
      m('hon-con-coc', 10, '12:35–12:45'),
      m('hon-dinh-huong', 15, '12:45–12:55'),
      m('hon-trong-mai', 20, '12:55–13:05'),
      m('hon-cho-da', 22, '12:50–13:00'),
      m('thien-cung-cave', 30, '13:10–13:50'),
      m('dau-go-cave', 35, '13:50–14:20'),
      m('sung-sot-cave', 50, '14:00–15:00'),
      m('luon-cave', 60, '15:00–15:45'),
      m('ti-top-island', 70, '15:50–16:50'),
      m('soi-sim-island', 75, '15:50–16:40'),
      m('me-cung-cave', 80, '14:20–14:50'),
      m('trinh-nu-cave', 85, '14:20–14:55'),
      m('trong-cave', 90, '15:00–15:30'),
      m('dong-tien-cave', 95, '15:00–15:30'),
    ],
    { exclusive: true, access: 'boat' },
  ),
  cx(
    'bai-tu-long-cruise',
    'bai-tu-long-bay',
    'contains',
    [
      m('bai-tu-long-bay', 0),
      m('quan-lan-island', 20),
      m('ngoc-vung-island', 30),
      m('vung-vieng-village', 40),
    ],
    { exclusive: true, access: 'boat' },
  ),
  cx(
    'halong-floating-villages',
    'cua-van-village',
    'contains',
    [m('cua-van-village', 0), m('cua-van-via-cat-ba', 5), m('ba-hang-village', 20)],
    { exclusive: true, access: 'boat' },
  ),
  cx(
    'sun-world-halong',
    'sun-world-halong',
    'same-park',
    [
      m('sun-world-halong', 0),
      m('queen-cable-halong', 10),
      m('sun-wheel-halong', 20),
      m('dragon-park-halong', 30),
      m('typhoon-water-park', 40),
    ],
    { exclusive: true, access: 'cable' },
  ),

  // —— Cat Ba / Lan Ha (not the Tuan Chau Route 2 boat)
  cx(
    'lan-ha-day',
    'cat-ba',
    'contains',
    [
      m('cat-ba', 0),
      m('lan-ha-bay', 10),
      m('cai-beo-village', 20, '08:20–09:00'),
      m('cat-dua-island', 40, '09:30–10:30'),
      m('viet-hai-village', 60, '14:00–15:00'),
      m('viet-hai-fishing-village', 65, '14:00–15:00'),
    ],
    { exclusive: true, access: 'boat' },
  ),
  cx(
    'cat-ba-national-park',
    'cat-ba-national-park',
    'contains',
    [
      m('cat-ba-national-park', 0),
      m('trung-trang-cave', 10),
      m('kim-giao-forest', 20),
      m('nho-khoi-mountain', 30),
      m('ngu-lam-peak', 40),
      m('hoi-lake', 50),
    ],
    { exclusive: true, access: 'trek' },
  ),
  cx(
    'cat-co-beaches',
    'cat-co-1',
    'same-day',
    [m('cat-co-1', 0), m('cat-co-2', 10), m('cat-co-3', 20), m('tung-thu-beach', 30)],
    { access: 'walk' },
  ),

  // —— Ninh Binh: one countryside day; Tam Coc and Trang An are the boat choice
  cx(
    'ninh-binh-day',
    'ninh-binh',
    'same-day',
    [
      m('ninh-binh', 0),
      m('hoa-lu', 10),
      m('den-tran-hoa-lu', 12),
      m('pho-co-hoa-lu', 14),
      m('dinh-le-tombs', 16),
      m('tuyet-tinh-coc', 18),
      m('trang-an-boats', 40),
      m('tam-coc-boats', 42),
      m('bich-dong-pagoda', 50),
      m('thai-vi-temple', 52),
      m('hang-thien-huong', 54),
      m('dong-tien-canh', 56),
      m('mua-cave', 70),
      m('thung-nham', 80),
    ],
    {
      exclusive: true,
      access: 'day-trip',
      alternatives: ['tam-coc-boats', 'trang-an-boats'],
    },
  ),
  cx(
    'bai-dinh-complex',
    'bai-dinh',
    'same-ticket',
    [m('bai-dinh', 0), m('bai-dinh-co', 10)],
    { access: 'walk' },
  ),

  // —— Hue Imperial City: one ticket, south-to-north axis (Ngo Mon → Thai Hoa → Purple City)
  cx(
    'hue-imperial-city',
    'hue-citadel',
    'same-ticket',
    [
      m('hue-citadel', 0),
      m('hue-flag-tower', 5, undefined, true),
      m('ngo-mon-gate', 10),
      m('thai-hoa-palace', 20),
      m('can-chanh-palace', 30),
      m('forbidden-purple-city', 40),
      m('duyet-thi-duong', 50),
      m('phung-tien-palace', 55),
      m('the-mieu', 60),
      m('nine-dynastic-urns', 65),
      m('hung-mieu', 70),
      m('hue-royal-antiquities', 80),
    ],
    { access: 'walk' },
  ),
  cx(
    'hue-thien-mu-boat',
    'perfume-river',
    'contains',
    [m('perfume-river', 0), m('thien-mu-pagoda', 20), m('hon-chen-temple', 40)],
    { access: 'boat' },
  ),

  // —— Hoi An Ancient Town: streets are free; listed halls/houses share the coupon ticket
  cx(
    'hoi-an-ancient-town',
    'hoi-an-ancient-town',
    'same-ticket',
    [
      m('hoi-an-ancient-town', 0),
      m('hoi-an-lanterns', 90, undefined, true),
      m('japanese-covered-bridge', 10),
      m('phung-hung-old-house', 15),
      m('cantonese-assembly-hall', 20),
      m('quan-thang-old-house', 25),
      m('duc-an-old-house', 30),
      m('fujian-assembly-hall', 35),
      m('quan-cong-temple', 40),
      m('chinese-assembly-hall', 42),
      m('hainan-assembly-hall', 44),
      m('teochew-assembly-hall', 46),
      m('tan-ky-old-house', 50),
      m('hoi-an-market', 55),
      m('museum-trade-ceramics', 60),
      m('sa-huynh-museum', 62),
      m('hoi-an-history-museum', 64),
      m('folk-culture-museum', 66),
      m('precious-heritage-museum', 68),
      m('phap-bao-pagoda', 70),
      m('hoi-an-central-mosque', 72),
    ],
    { access: 'walk' },
  ),
  cx(
    'cam-thanh-boats',
    'cam-thanh-basket-boats',
    'contains',
    [m('cam-thanh-basket-boats', 0), m('cam-thanh-nipa-forest', 10)],
    { access: 'boat' },
  ),

  // —— Hanoi Ba Dinh: mausoleum → stilt house → One Pillar → museum
  cx(
    'hanoi-ba-dinh',
    'ho-chi-minh-mausoleum',
    'contains',
    [
      m('ho-chi-minh-mausoleum', 0),
      m('hcm-stilt-house', 20),
      m('one-pillar-pagoda', 30),
      m('ho-chi-minh-museum-hanoi', 40),
    ],
    { access: 'walk' },
  ),
  cx(
    'hoan-kiem',
    'hoan-kiem-lake',
    'contains',
    [m('hoan-kiem-lake', 0), m('ngoc-son-temple', 10)],
    { access: 'walk' },
  ),
  cx(
    'hanoi-old-quarter',
    'old-quarter',
    'same-day',
    [
      m('old-quarter', 0),
      m('egg-coffee', 10),
      m('train-street', 20),
      m('st-joseph-cathedral', 30),
      m('dong-xuan-market', 40),
      m('hanoi-food-tour', 50),
      m('bia-hoi', 80),
    ],
    { access: 'walk' },
  ),

  // —— HCMC District 1 axis: Notre-Dame and the Post Office share a block
  cx(
    'hcmc-d1-core',
    'notre-dame-saigon',
    'same-day',
    [
      m('notre-dame-saigon', 0),
      m('saigon-central-post-office', 5),
      m('nguyen-hue-walking', 20),
      m('hcmc-peoples-committee', 25),
      m('saigon-opera-house', 30),
      m('saigon-book-street', 35),
    ],
    { access: 'walk' },
  ),
  cx(
    'hcmc-cho-lon',
    'cho-lon',
    'same-day',
    [m('cho-lon', 0), m('binh-tay-market', 10), m('cha-tam-church', 20)],
    { access: 'walk' },
  ),

  // —— Da Nang
  cx(
    'son-tra-peninsula',
    'son-tra',
    'contains',
    [m('son-tra', 0), m('linh-ung-pagoda', 20)],
    { access: 'day-trip' },
  ),
  cx(
    'marble-mountains',
    'marble-mountains',
    'contains',
    [
      m('marble-mountains', 0),
      m('linh-ung-marble-mountains', 10),
      m('non-nuoc-stone-village', 20),
    ],
    { access: 'walk' },
  ),
  cx(
    'da-nang-riverfront',
    'dragon-bridge',
    'same-day',
    [
      m('dragon-bridge', 0),
      m('han-river-bridge', 10),
      m('love-lock-bridge', 20),
      m('thuan-phuoc-bridge', 30),
    ],
    { access: 'walk' },
  ),

  // —— Sapa / Fansipan Sun World
  cx(
    'fansipan-legend',
    'fansipan',
    'contains',
    [
      m('fansipan', 0),
      m('sun-plaza-sapa', 5, undefined, true),
      m('bich-van-thien-tu', 20),
      m('fansipan-buddha', 30),
      m('kim-son-bao-thang', 40),
    ],
    { exclusive: true, access: 'cable' },
  ),
  cx(
    'sapa-trek',
    'sapa-trek',
    'contains',
    [
      m('sapa-trek', 0),
      m('y-linh-ho-village', 20, '09:30–10:15'),
      m('lao-chai-village', 30, '10:30–11:30'),
      m('muong-hoa-valley', 50, '09:00–15:00'),
      m('ta-van-village', 40, '12:30–14:00'),
      m('hau-thao-village', 60, '14:00–15:00'),
      m('sa-pa-village', 70, '15:00–15:30'),
    ],
    { exclusive: true, access: 'trek' },
  ),
  cx(
    'cat-cat-village',
    'cat-cat-village',
    'contains',
    [m('cat-cat-village', 0), m('cat-cat-waterfall', 20, '10:30–11:15')],
    { access: 'walk' },
  ),
  cx(
    'o-quy-ho-waterfalls',
    'o-quy-ho-pass',
    'same-day',
    [
      m('o-quy-ho-pass', 0),
      m('rong-may-skywalk', 10),
      m('silver-waterfall', 20),
      m('love-waterfall', 30),
    ],
    { access: 'day-trip' },
  ),

  // —— Phong Nha
  cx(
    'phong-nha-river-cave',
    'phong-nha',
    'contains',
    [m('phong-nha', 0), m('phong-nha-cave-boat', 20)],
    { access: 'boat' },
  ),
  cx(
    'tu-lan-caves',
    'tu-lan-caves',
    'contains',
    [
      m('tu-lan-caves', 0),
      m('nuoc-nut-cave', 10),
      m('hang-tien', 20),
      m('tra-ang-cave', 30),
      m('hang-over', 40),
      m('hang-pygmy', 50),
    ],
    { exclusive: true, access: 'trek' },
  ),
  cx(
    'bong-lai-valley',
    'bong-lai-valley',
    'contains',
    [m('bong-lai-valley', 0), m('duck-stop', 10), m('pub-cold-beer', 20)],
    { access: 'day-trip' },
  ),
  cx('son-doong', 'son-doong-cave', 'contains', [m('son-doong-cave', 0)], {
    exclusive: true,
    access: 'trek',
  }),
  cx(
    'hang-en-trek',
    'hang-en',
    'contains',
    [m('hang-en', 0), m('hang-va', 10)],
    { exclusive: true, access: 'trek' },
  ),

  cx('ha-giang-loop', 'ha-giang-loop', 'contains', [m('ha-giang-loop', 0)], {
    exclusive: true,
    access: 'trek',
  }),
  cx(
    'quan-ba',
    'quan-ba-heaven-gate',
    'contains',
    [m('quan-ba-heaven-gate', 0), m('quan-ba-twin-mountains', 10)],
    { access: 'day-trip' },
  ),
  cx(
    'dong-van-town',
    'dong-van',
    'contains',
    [
      m('dong-van', 0),
      m('dong-van-geopark', 5),
      m('dong-van-ancient-town', 10),
      m('vuong-palace', 20),
      m('lung-cu-flag-tower', 40),
    ],
    { access: 'day-trip' },
  ),
  cx(
    'ma-pi-leng-pass',
    'ma-pi-leng-pass',
    'contains',
    [m('ma-pi-leng-pass', 0), m('tu-san-canyon', 10), m('nho-que-river', 20), m('meo-vac-town', 30)],
    { access: 'day-trip' },
  ),
  cx(
    'sung-la-pao',
    'sung-la-valley',
    'contains',
    [m('sung-la-valley', 0), m('pao-house', 10)],
    { access: 'walk' },
  ),

  // —— Phu Quoc
  cx(
    'phu-quoc-south-islands',
    'phu-quoc-snorkel',
    'contains',
    [
      m('phu-quoc-snorkel', 0),
      m('an-thoi-archipelago', 10),
      m('hon-may-rut', 20),
      m('hon-mong-tay', 30),
      m('hon-gam-ghi', 40),
    ],
    { exclusive: true, access: 'boat' },
  ),
  cx(
    'hon-thom-cable',
    'hon-thom-island',
    'contains',
    [
      m('hon-thom-island', 0),
      m('hon-thom-cable', 10),
      m('sunset-town-pq', 20),
      m('kiss-bridge', 30),
      m('vinwonders-pq', 40),
      m('aquatopia-pq', 50),
    ],
    { exclusive: true, access: 'cable' },
  ),
  cx(
    'vinpearl-safari',
    'vinpearl-safari-pq',
    'contains',
    [m('vinpearl-safari-pq', 0)],
    { exclusive: true, access: 'day-trip' },
  ),

  // —— Nha Trang island hopping
  cx(
    'nha-trang-islands',
    'hon-mun-islands',
    'contains',
    [
      m('hon-mun-islands', 0),
      m('hon-mun-island', 10),
      m('hon-mot-island', 20),
      m('hon-tam-island', 30),
      m('hon-mieu-island', 40),
      m('tri-nguyen-aquarium', 45),
    ],
    { exclusive: true, access: 'boat' },
  ),
  cx(
    'vinpearl-nha-trang',
    'hon-tre-island',
    'contains',
    [m('hon-tre-island', 0), m('vinpearl-harbor', 10), m('vinwonders-nha-trang', 20)],
    { exclusive: true, access: 'boat' },
  ),
  cx(
    'nha-trang-beachfront',
    'nha-trang-beach',
    'same-day',
    [m('nha-trang-beach', 0), m('nha-trang-promenade', 10), m('tram-huong-tower', 20)],
    { access: 'walk' },
  ),

  // —— Da Lat
  cx(
    'xuan-huong-centre',
    'xuan-huong-lake',
    'same-day',
    [
      m('xuan-huong-lake', 0),
      m('lam-vien-square', 10),
      m('da-lat-market', 20),
      m('da-lat-night-market', 80),
    ],
    { access: 'walk' },
  ),
  cx(
    'tuyen-lam',
    'tuyen-lam-lake',
    'contains',
    [m('tuyen-lam-lake', 0), m('truc-lam-monastery', 20)],
    { access: 'walk' },
  ),
  cx(
    'bao-dai-palaces',
    'bao-dai-palace-i',
    'same-day',
    [m('bao-dai-palace-i', 0), m('bao-dai-palace-ii', 10), m('bao-dai-palace-iii', 20)],
    { access: 'walk' },
  ),

  // —— Can Tho
  cx(
    'cai-rang-morning',
    'cai-rang-floating-market',
    'contains',
    [m('cai-rang-floating-market', 0)],
    {
      exclusive: true,
      access: 'boat',
      alternatives: ['phong-dien-floating-market'],
    },
  ),
  cx(
    'phong-dien-market',
    'phong-dien-floating-market',
    'contains',
    [m('phong-dien-floating-market', 0)],
    {
      exclusive: true,
      access: 'boat',
      alternatives: ['cai-rang-floating-market'],
    },
  ),

  // —— Exclusive singles that own a day
  cx('cu-chi-day', 'cu-chi', 'contains', [m('cu-chi', 0)], { exclusive: true, access: 'day-trip' }),
  cx('mekong-day', 'mekong-delta', 'contains', [m('mekong-delta', 0)], {
    exclusive: true,
    access: 'day-trip',
  }),
  cx('ba-na-hills', 'ba-na-hills', 'contains', [m('ba-na-hills', 0)], {
    exclusive: true,
    access: 'cable',
  }),
  cx('my-son-day', 'my-son', 'contains', [m('my-son', 0)], { exclusive: true, access: 'day-trip' }),
  cx('cu-lao-cham', 'cu-lao-cham', 'contains', [m('cu-lao-cham', 0)], {
    exclusive: true,
    access: 'boat',
  }),
  cx('perfume-pagoda', 'perfume-pagoda', 'contains', [m('perfume-pagoda', 0)], {
    exclusive: true,
    access: 'day-trip',
  }),
  cx('cuc-phuong', 'cuc-phuong', 'contains', [m('cuc-phuong', 0)], {
    exclusive: true,
    access: 'day-trip',
  }),
  cx('cooking-class', 'cooking-class', 'contains', [m('cooking-class', 0)], { access: 'walk' }),
]

/** Soft walking neighbourhoods — sort together, but days may split them. */
export const WALK_CLUSTERS: Record<string, string[]> = {
  'hanoi-west-lake': ['west-lake', 'tran-quoc-pagoda', 'quan-thanh-temple'],
  'hanoi-citadel-museums': [
    'thang-long-citadel',
    'vietnam-military-history-museum',
    'temple-literature',
    'vietnam-fine-arts-hanoi',
  ],
  'hanoi-french-quarter': ['hanoi-opera-house', 'hoa-lo-prison', 'vietnamese-womens-museum'],
  'hanoi-long-bien': ['long-bien-bridge'],
  'hanoi-outskirts': ['ethnology-museum', 'bat-trang-pottery'],
  'hcmc-war-axis': [
    'independence-palace',
    'war-remnants',
    'ben-thanh',
    'tao-dan-park',
    'hcmc-city-museum',
    'hcmc-fine-arts',
  ],
  'hcmc-pagodas': [
    'jade-emperor-pagoda',
    'mariamman-temple',
    'vinh-nghiem-pagoda',
    'xa-loi-pagoda',
    'giac-lam-pagoda',
  ],
  'hcmc-museums': [
    'museum-vietnamese-history-hcmc',
    'nho-rong-museum',
    'southern-womens-museum',
    'fitom-museum',
  ],
  'hcmc-nightlife': ['bui-vien-street', 'apartment-cafes'],
  'hcmc-towers': ['bitexco-skydeck', 'landmark81-viewpoint'],
  'hcmc-green': ['thao-cam-vien', 'binh-quoi-village', 'suoi-tien-theme-park', 'tan-dinh-church'],
  'hue-tombs-south': ['tu-duc-tomb', 'khai-dinh-tomb', 'dong-khanh-tomb', 'thieu-tri-tomb', 'duc-duc-tomb'],
  'hue-tombs-west': ['minh-mang-tomb', 'gia-long-tomb'],
  'hue-pagodas': ['tu-dam-pagoda', 'tu-hieu-pagoda', 'bao-quoc-pagoda', 'dieu-de-pagoda', 'huyen-tran-temple'],
  'hue-city': [
    'dong-ba-market',
    'truong-tien-bridge',
    'an-dinh-palace',
    'thua-thien-hue-history-museum',
    'ho-chi-minh-museum-hue',
    'le-ba-dang-art',
    'tay-loc-market',
    'ben-ngu-market',
    'da-vien-island',
  ],
  'hue-lagoon-coast': [
    'tam-giang-lagoon',
    'lap-an-lagoon',
    'thuan-an-beach',
    'canh-duong-beach',
    'lang-co-bay',
    'vong-canh-hill',
    'ngu-binh-mountain',
    'bach-ma-national-park',
    'truc-lam-bach-ma',
  ],
  'hue-craft': [
    'thanh-toan-bridge',
    'thuy-xuan-village',
    'phuoc-tich-village',
    'phuong-duc-village',
    'bao-la-village',
    'voi-re-temple',
    'dinh-cat-church',
    'phu-cam-cathedral',
    'ho-quyen',
    'ho-thuy-tien',
    'nguon-dai-river',
  ],
  'hoi-an-villages': ['tra-que-village', 'thanh-ha-pottery', 'kim-bong-village'],
  'hoi-an-beach': ['an-bang', 'cua-dai-beach'],
  'danang-beach': ['da-nang-beach', 'non-nuoc-beach'],
  'danang-city': [
    'da-nang-cathedral',
    'cham-sculpture-museum',
    'da-nang-museum',
    'fifth-military-zone-museum',
    'han-market',
    'con-market',
    'quan-the-am-pagoda',
    'nam-son-pagoda',
    'hai-van-pass',
    'asia-park-danang',
  ],
  'halong-shore': [
    'tuan-chau-island',
    'bai-chay-beach',
    'bai-chay-bridge',
    'bai-tho-mountain',
    'quang-ninh-museum',
    'ha-long-market',
    'bai-chay-night-market',
    'ha-long-flower-park',
    'funny-art-museum-halong',
    'loi-am-pagoda',
    'long-tien-pagoda',
    'cua-ong-temple',
    'tran-quoc-nghien-temple',
    'bao-bien-road',
  ],
  'halong-outer-islands': ['co-to-island', 'mat-rong-island'],
  'cat-ba-town': [
    'cannon-fort-cat-ba',
    'hospital-cave-cat-ba',
    'cat-ba-market',
    'cat-ba-night-market',
    'cat-ba-square',
    'cat-ba-cable-car',
    'phu-long-mangrove',
    'hoa-cuong-cave',
    'thien-long-cave-cat-ba',
    'nguon-giong-cave',
  ],
  'ninh-binh-far': [
    'van-long',
    'phat-diem-cathedral',
    'kim-son-sedge',
    'ninh-van-stone',
    'van-lam-embroidery',
    'bear-sanctuary-ninh-binh',
    'co-vien-lau',
    'dong-thien-ha',
  ],
  'sapa-town': [
    'sun-plaza-sapa',
    'ham-rong-mountain',
    'sapa-market',
    'sapa-stone-church',
    'sapa-center-square',
    'sapa-lake',
    'sapa-museum',
    'cau-may',
    'seng-my-ty-reservoir',
  ],
  'sapa-cat-cat': ['cat-cat-village', 'cat-cat-waterfall'],
  'sapa-caves': ['coc-san-cave', 'fairy-cave-sapa'],
  'sapa-villages': ['ta-phin-village', 'sin-chai-village', 'ban-ho-village', 'nam-sai-village'],
  'sapa-markets': ['bac-ha-market', 'coc-ly-market', 'can-cau-market', 'muong-hum-market', 'cao-son-market'],
  'sapa-park': ['hoang-lien-national-park', 'sapa-ancient-stone-field'],
  'phong-nha-caves': [
    'paradise-cave',
    'dark-cave',
    'hang-vom',
    'hang-dai-a',
    'son-nu-cave',
    'ruc-mon-cave',
    'e-cave',
    'eight-ladies-cave',
  ],
  'phong-nha-nature': [
    'mooc-spring',
    'chay-river',
    'hava-valley',
    'ozo-treetop',
    'phong-nha-botanical',
    'east-hill-phong-nha',
    'thac-gio',
    'vang-macaque',
  ],
  'phong-nha-history': [
    'highway-20-memorial',
    'ben-tien-ferry',
    'tram-tran',
    'phong-nha-park-hq',
    'khe-gat-airfield',
    'phong-nha-market',
  ],
  'ha-giang-passes': [
    'tham-ma-pass',
    'chin-khoanh-pass',
    'bac-sum-pass',
    'yen-minh-pine-forest',
    'yen-minh-town',
  ],
  'ha-giang-nature': [
    'du-gia-waterfall',
    'hoang-su-phi-terraces',
    'chieu-lau-thi',
    'tay-con-linh',
    'lung-khuy-cave',
    'ha-giang-km0',
  ],
  'ha-giang-villages': [
    'lao-xa-village',
    'lung-tam-weaving',
    'du-gia-village',
    'nam-dam-village',
    'lo-lo-chai-village',
    'seo-lung-village',
    'ma-le-village',
    'lung-pu-village',
  ],
  'ha-giang-markets': [
    'khau-vai-love-market',
    'dong-van-sunday-market',
    'meo-vac-market',
    'quan-ba-market',
    'hoang-su-phi-market',
  ],
  'dong-van-extra': [
    'dong-van-old-market',
    'cuc-bac-milestone',
    'ma-le-market',
    'don-cao-fortress',
    'thien-huong-village',
    'lung-ngoc-ho-cave',
    'pho-cao-village',
    'pho-bang-ancient-town',
    'lung-cam-village',
  ],
  'phu-quoc-beaches': [
    'sao-beach',
    'long-beach-pq',
    'khem-beach',
    'ong-lang-beach',
    'ganh-dau-beach',
    'vung-bau-beach',
    'cua-can-beach',
    'thom-beach',
    'phu-quoc-sunset',
  ],
  'phu-quoc-north': [
    'starfish-beach',
    'phu-quoc-national-park',
    'suoi-tranh',
    'suoi-da-ban',
    'ganh-dau-cape',
    'ho-quoc-pagoda',
    'sung-hung-pagoda',
    'su-muon-pagoda',
    'cao-dai-phu-quoc',
  ],
  'phu-quoc-town': [
    'duong-dong-night-market',
    'dinh-cau',
    'phu-quoc-prison',
    'coi-nguon-museum',
    'ham-ninh-village',
    'cua-can-village',
    'grand-world-pq',
    'khu-cuong-pepper',
    'duc-phat-pepper',
    'khai-hoan-fish-sauce',
    'phung-hung-fish-sauce',
    'sim-wine-farm',
    'ngoc-hien-pearl',
  ],
  'nha-trang-temples': [
    'po-nagar',
    'long-son-pagoda',
    'nha-trang-cathedral',
    'hai-duc-pagoda',
    'tong-lam-lo-son',
    'chua-tu-ton',
    'kim-son-temple',
    'nguyen-trung-truc-temple',
  ],
  'nha-trang-city': [
    'oceanographic-museum-nt',
    'yersin-museum',
    'khanh-hoa-museum',
    'do-theatre',
    'truong-xuan-gallery',
    'hon-chong',
    'hon-do-rocks',
    'dam-market',
    'xom-moi-market',
    'nha-trang-night-market',
    'skylight-nha-trang',
  ],
  'nha-trang-nature': [
    'ba-ho-waterfalls',
    'yang-bay',
    'ta-gu-waterfall',
    'suoi-thach-lam',
    'hon-ba-nature-reserve',
    'thap-ba-hot-springs',
    'i-resort-mud-bath',
    'hundred-egg-mud-bath',
    'suoi-mo',
  ],
  'nha-trang-coast': [
    'bai-duong-beach',
    'doc-let-beach',
    'bai-dai-beach',
    'ninh-van-bay',
    'van-phong-bay',
    'hon-lao-island',
    'hoa-lan-island',
    'diep-son-island',
  ],
  'dalat-sacred': [
    'da-lat-cathedral',
    'domaine-de-marie',
    'linh-phuoc-pagoda',
    'linh-an-pagoda',
    'thien-vuong-pagoda',
  ],
  'dalat-waterfalls': [
    'datanla-waterfall',
    'elephant-falls',
    'pongour-waterfall',
    'prenn-waterfall',
    'tiger-cave-waterfall',
    'cam-ly-waterfall',
    'dambri-waterfall',
  ],
  'dalat-sights': [
    'crazy-house',
    'valley-of-love',
    'da-lat-railway-station',
    'lake-of-sighs',
    'clay-tunnel-dalat',
    'langbiang',
    'da-lat-flower-gardens',
    'van-thanh-flowers',
    'thai-phien-flowers',
    'cau-dat-tea',
    'fairytale-land-dalat',
    'lumiere-light-garden',
    'hydrangea-trai-mat',
    'fresh-garden-dalat',
    'cu-lan-village',
    'chicken-village-kho',
    'mongo-land-dalat',
    'french-quarter-dalat',
    'hundred-roofs-bar',
  ],
  'cantho-city': [
    'chua-ong-can-tho',
    'nam-nha-pagoda',
    'phuoc-hau-pagoda',
    'pothi-somron',
    'munir-ansay',
    'quang-duc-pagoda',
    'truc-lam-phuong-nam',
    'can-tho-cathedral',
    'binh-thuy-ancient-house',
    'can-tho-grand-prison',
    'can-tho-museum',
    'military-zone-9-museum',
    'hcm-museum-can-tho',
    'can-tho-old-market',
    'can-tho-night-market',
    'tay-do-market',
    'luu-huu-phuoc-park',
    'song-hau-park',
    'can-tho-bridge',
    'moi-canal',
    'ninh-kieu-wharf',
    'ninh-kieu-love-bridge',
  ],
  'cantho-orchards': [
    'bang-lang-stork',
    'con-son',
    'con-au',
    'con-khuong',
    'my-khanh-village',
    'giot-dang-orchard',
    'ba-lang-gardens',
    'lung-ngoc-hoang',
  ],
}

type MemberIndex = {
  complex: SightComplex
  member: ComplexMember
}

const MEMBER_INDEX = new Map<string, MemberIndex>()
const CLUSTER_OF = new Map<string, string>()

for (const complex of SIGHT_COMPLEXES) {
  for (const member of complex.members) {
    if (!MEMBER_INDEX.has(member.id)) MEMBER_INDEX.set(member.id, { complex, member })
  }
}
for (const [clusterId, ids] of Object.entries(WALK_CLUSTERS)) {
  for (const id of ids) {
    if (!CLUSTER_OF.has(id)) CLUSTER_OF.set(id, clusterId)
  }
}

export function complexFor(id: string): SightComplex | null {
  return MEMBER_INDEX.get(canonicalSightId(id))?.complex ?? null
}

export function memberFor(id: string): ComplexMember | null {
  return MEMBER_INDEX.get(canonicalSightId(id))?.member ?? null
}

export function atomicBundleId(id: string): string | null {
  return complexFor(id)?.id ?? null
}

export function walkClusterId(id: string): string | null {
  return CLUSTER_OF.get(canonicalSightId(id)) ?? null
}

export function parentTourIdOf(id: string): string | null {
  const complex = complexFor(id)
  if (!complex) return null
  const canon = canonicalSightId(id)
  if (canon === complex.parentId) return null
  if (memberFor(canon)?.soft) return complex.parentId
  if (complex.kind === 'contains' || complex.kind === 'same-ticket' || complex.kind === 'same-park') {
    return complex.parentId
  }
  return null
}

export function sequenceOf(id: string): number {
  return memberFor(id)?.seq ?? 50
}

export function includedClockOf(id: string): string | undefined {
  return memberFor(id)?.clock
}

/** Minutes after the parent outing start. `m(id, 20)` is +20 minutes, not an absolute 10:40. */
export function landingOffsetHours(id: string): number {
  const seq = sequenceOf(id)
  return seq > 0 ? seq / 60 : 20 / 60
}

/** Clock a landing on the parent outing. Catalog clocks like 10:40 are ignored when the parent starts later. */
export function landingStartHour(id: string, parentStart: number): number {
  const start = parentStart + landingOffsetHours(id)
  const label = includedClockOf(id)
  if (!label) return start
  const startStr = label.split('–')[0] ?? ''
  const parts = /^(\d{1,2}):(\d{2})$/.exec(startStr.trim())
  if (!parts) return start
  const clockStart = Number(parts[1]) + Number(parts[2]) / 60
  if (clockStart >= parentStart - 0.05) return clockStart
  return start
}

export function sightAccess(id: string): SightAccess {
  return complexFor(id)?.access ?? 'walk'
}

const COUNTRYSIDE_WALK =
  /(villages|markets|caves|cat-cat|-far|outer-islands|sapa-park|hoi-an-villages|hoi-an-beach|nha-trang-nature|nha-trang-coast|phu-quoc-north|phu-quoc-beaches|dalat-waterfalls|phong-nha-nature)/

/** Cable / trek / pass / village — one outing, not leftover hours on another clock. */
export function hardOutingId(id: string): string | null {
  const c = complexFor(id)
  if (
    c &&
    (c.exclusive ||
      c.access === 'cable' ||
      c.access === 'trek' ||
      c.access === 'day-trip' ||
      c.access === 'boat')
  ) {
    return `c:${c.id}`
  }
  const walk = walkClusterId(id)
  if (walk && COUNTRYSIDE_WALK.test(walk)) return `w:${walk}`
  return null
}

export function isAtomicExclusive(id: string): boolean {
  const row = MEMBER_INDEX.get(canonicalSightId(id))
  if (!row || row.member.soft) return false
  const { complex } = row
  const canon = canonicalSightId(id)
  // Only the outing itself owns a day — a pagoda that happens to sit on a
  // published boat loop must still pack with the rest of the city walk.
  if (canon !== complex.parentId) return false
  return Boolean(
    complex.exclusive ||
      complex.access === 'boat' ||
      complex.access === 'trek' ||
      complex.access === 'cable' ||
      complex.access === 'day-trip',
  )
}

export function alternativesOf(id: string): string[] {
  const complex = complexFor(id)
  const canon = canonicalSightId(id)
  if (!complex?.alternatives?.includes(canon)) return []
  return complex.alternatives.filter((other) => other !== canon)
}

export function bundleMembersOf(bundleId: string): string[] {
  const complex = SIGHT_COMPLEXES.find((row) => row.id === bundleId)
  return complex ? complex.members.map((row) => row.id) : []
}

export function sortByVisitSequence(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const bundleA = atomicBundleId(a)
    const bundleB = atomicBundleId(b)
    if (bundleA && bundleA === bundleB) return sequenceOf(a) - sequenceOf(b)
    const clusterA = walkClusterId(a)
    const clusterB = walkClusterId(b)
    if (clusterA && clusterA === clusterB) return sequenceOf(a) - sequenceOf(b) || a.localeCompare(b)
    return sequenceOf(a) - sequenceOf(b) || a.localeCompare(b)
  })
}

/**
 * One packing / routing unit: an atomic complex, else a walking cluster, else a singleton.
 * Parent (if selected) is always the head so inner stops sort after the outing that contains them.
 */
export function intelligenceUnit(id: string, selected: Set<string>): string[] {
  const canon = canonicalSightId(id)
  const complex = complexFor(canon)
  const parentSelected = complex
    ? [...selected].some((sid) => canonicalSightId(sid) === complex.parentId)
    : false
  const member = memberFor(canon)
  if (member?.soft && !parentSelected) {
    const cluster = walkClusterId(canon)
    if (cluster) {
      const mates = [...selected].filter((sid) => {
        const other = memberFor(sid)
        return walkClusterId(sid) === cluster && (!atomicBundleId(sid) || Boolean(other?.soft))
      })
      return sortByVisitSequence(mates.length ? mates : [id])
    }
    return [id]
  }
  if (complex) {
    const mates = complex.members.map((row) => row.id)
    const resolved = [...selected].filter((sid) => {
      const c = canonicalSightId(sid)
      if (!mates.includes(c)) return false
      const other = memberFor(c)
      if (other?.soft && !parentSelected) return false
      return true
    })
    const ordered = sortByVisitSequence(resolved)
    if (ordered.includes(complex.parentId)) {
      return [complex.parentId, ...ordered.filter((row) => row !== complex.parentId)]
    }
    return ordered.length ? ordered : [id]
  }
  const cluster = walkClusterId(canon)
  if (cluster) {
    const mates = [...selected].filter((sid) => walkClusterId(sid) === cluster && !atomicBundleId(sid))
    return sortByVisitSequence(mates.length ? mates : [id])
  }
  return [id]
}

export function intelligenceUnits(ids: string[]): string[][] {
  const selected = new Set(ids.filter(Boolean))
  const used = new Set<string>()
  const units: string[][] = []
  for (const id of ids) {
    if (!id || used.has(id)) continue
    const unit = intelligenceUnit(id, selected)
    for (const member of unit) used.add(member)
    units.push(unit)
  }
  return units
}
