/**
 * Curated must-do pools for packed city stays.
 * Ordered walkable-cluster first so a 1-day cap still gets a neighbourhood,
 * not a leftover from day 5 of a longer stay.
 *
 * Length is tuned so volumeStayDays ≈ 3 (9–18 independent sights).
 */
export const THREE_DAY_CITIES = [
  'Hanoi',
  'Ho Chi Minh City',
  'Da Nang',
  'Hoi An',
  'Hue',
  'Da Lat',
  'Nha Trang',
  'Phu Quoc',
  'Sapa',
] as const

export type ThreeDayCity = (typeof THREE_DAY_CITIES)[number]

export const CITY_STAY_CORES: Record<string, string[]> = {
  Hanoi: [
    'old-quarter',
    'hoan-kiem-lake',
    'ngoc-son-temple',
    'st-joseph-cathedral',
    'egg-coffee',
    'ho-chi-minh-mausoleum',
    'one-pillar-pagoda',
    'hcm-stilt-house',
    'temple-literature',
    'hoa-lo-prison',
    'tran-quoc-pagoda',
    'west-lake',
    'ethnology-museum',
    'train-street',
  ],
  'Ho Chi Minh City': [
    'independence-palace',
    'war-remnants',
    'notre-dame-saigon',
    'saigon-central-post-office',
    'nguyen-hue-walking',
    'ben-thanh',
    'cu-chi',
    'cho-lon',
    'jade-emperor-pagoda',
    'bitexco-skydeck',
    'saigon-opera-house',
    'saigon-book-street',
    'hcmc-peoples-committee',
    'hcmc-fine-arts',
  ],
  'Da Nang': [
    'da-nang-beach',
    'dragon-bridge',
    'cham-sculpture-museum',
    'marble-mountains',
    'son-tra',
    'linh-ung-pagoda',
    'ba-na-hills',
  ],
  'Hoi An': [
    'hoi-an-ancient-town',
    'japanese-covered-bridge',
    'tan-ky-old-house',
    'fujian-assembly-hall',
    'hoi-an-market',
    'hoi-an-lanterns',
    'tra-que-village',
    'cam-thanh-basket-boats',
    'my-son',
    'hoi-an-history-museum',
  ],
  Hue: [
    'hue-citadel',
    'thien-mu-pagoda',
    'perfume-river',
    'dong-ba-market',
    'khai-dinh-tomb',
    'minh-mang-tomb',
  ],
  'Da Lat': [
    'crazy-house',
    'xuan-huong-lake',
    'da-lat-market',
    'da-lat-night-market',
    'tuyen-lam-lake',
    'truc-lam-monastery',
    'datanla-waterfall',
    'linh-phuoc-pagoda',
    'elephant-falls',
    'valley-of-love',
  ],
  'Nha Trang': [
    'po-nagar',
    'long-son-pagoda',
    'nha-trang-cathedral',
    'nha-trang-promenade',
    'skylight-nha-trang',
    'vinwonders-nha-trang',
    'hon-tre-island',
    'hon-mun-island',
    'i-resort-mud-bath',
  ],
  'Phu Quoc': [
    'sao-beach',
    'kiss-bridge',
    'hon-thom-island',
    'grand-world-pq',
    'duong-dong-night-market',
    'dinh-cau',
    'phu-quoc-sunset',
  ],
  Sapa: [
    'sapa-stone-church',
    'ham-rong-mountain',
    'cat-cat-village',
    'cat-cat-waterfall',
    'sapa-trek',
    'lao-chai-village',
    'ta-van-village',
    'muong-hoa-valley',
    'fansipan',
  ],
}

/** Sights a 3-day packed stay must still include after packing. */
export const CITY_STAY_MUST: Record<string, string[]> = {
  Hanoi: ['old-quarter', 'hoan-kiem-lake', 'ho-chi-minh-mausoleum', 'temple-literature'],
  'Ho Chi Minh City': ['independence-palace', 'war-remnants', 'cu-chi', 'ben-thanh'],
  'Da Nang': ['marble-mountains', 'linh-ung-pagoda', 'ba-na-hills', 'dragon-bridge'],
  'Hoi An': ['hoi-an-ancient-town', 'japanese-covered-bridge', 'hoi-an-lanterns', 'my-son'],
  Hue: ['hue-citadel', 'thien-mu-pagoda', 'khai-dinh-tomb'],
  'Da Lat': ['crazy-house', 'xuan-huong-lake', 'da-lat-night-market'],
  'Nha Trang': ['po-nagar', 'vinwonders-nha-trang', 'hon-mun-island'],
  'Phu Quoc': ['sao-beach', 'kiss-bridge', 'duong-dong-night-market'],
  Sapa: ['cat-cat-village', 'sapa-trek', 'fansipan'],
}

export type CityStayDayCopy = { theme: string; blurb: string }

export const CITY_STAY_NARRATIVE: Record<string, { summary: string; days: CityStayDayCopy[] }> = {
  Hanoi: {
    summary:
      'Old Quarter and Hoan Kiem, Ba Dinh morning (mausoleum closed Mon/Fri), then West Lake and Train Street — the capital’s must-dos without stuffing two museums into one taxi loop.',
    days: [
      {
        theme: 'Old Quarter and the lake',
        blurb:
          'Walk the 36 streets, Hoan Kiem and Ngọc Sơn, St Joseph, egg coffee. Night is for Train Street or another Old Quarter loop — not a second museum district.',
      },
      {
        theme: 'Ba Dinh and Literature',
        blurb:
          'Mausoleum at opening (not Monday or Friday), One Pillar, the stilt house, Temple of Literature, then Hoa Lo. Keep this morning on the west bank; do not bolt on West Lake.',
      },
      {
        theme: 'West Lake and ethnology',
        blurb:
          'Trần Quốc and West Lake, Museum of Ethnology if you want context beyond the Old Quarter. Evening food stays in the centre.',
      },
    ],
  },
  'Ho Chi Minh City': {
    summary:
      'District 1 icons, a full Củ Chi morning (not stacked with the Mekong), then Chợ Lớn, Jade Emperor, and a skydeck finish.',
    days: [
      {
        theme: 'District 1 spine',
        blurb:
          'Independence Palace, War Remnants, Notre-Dame and the post office, Nguyễn Huệ, Bến Thành. This is the walkable first-timer core.',
      },
      {
        theme: 'Củ Chi tunnels',
        blurb:
          'A half-day to full-day out-and-back. Do not pin the Mekong on the same clock — that is a different outing.',
      },
      {
        theme: 'Chợ Lớn and the skyline',
        blurb:
          'Jade Emperor, Chợ Lớn lanes, Bitexco or a rooftop. Softer than day one, still a real Saigon day.',
      },
    ],
  },
  'Da Nang': {
    summary:
      'Mỹ Khê and Dragon Bridge, Marble Mountains plus Sơn Trà / Lady Buddha, then Ba Na as its own exclusive day — not bolted onto the beach.',
    days: [
      {
        theme: 'Beach and Dragon Bridge',
        blurb: 'Mỹ Khê, Cham sculpture museum, Dragon Bridge at dusk. Stay on the city–beach axis.',
      },
      {
        theme: 'Marble Mountains and Sơn Trà',
        blurb: 'Caves and pagodas at Marble Mountains, then Lady Buddha on the peninsula. Not a Ba Na add-on.',
      },
      {
        theme: 'Ba Na Hills',
        blurb: 'Cable, Golden Bridge, and the hill town. This outing owns the day.',
      },
    ],
  },
  'Hoi An': {
    summary:
      'Ancient Town and the Japanese Covered Bridge, Trà Quế and Cẩm Thanh, then Mỹ Sơn as a daylight trip — lanterns stay on an in-town evening.',
    days: [
      {
        theme: 'Ancient Town',
        blurb:
          'Japanese Covered Bridge, merchant houses, the market, lanterns after dark. This is the UNESCO core.',
      },
      {
        theme: 'Villages and basket boats',
        blurb:
          'Trà Quế herb gardens in the morning, Cẩm Thanh basket boats after. Keep Mỹ Sơn for its own daylight trip.',
      },
      {
        theme: 'Mỹ Sơn sanctuary',
        blurb: 'Cham towers as a dedicated daylight trip. Back for a quiet Ancient Town evening if the legs hold.',
      },
    ],
  },
  Hue: {
    summary:
      'Imperial City walking axis, Thiên Mụ and the Perfume River, then the tomb road (Khải Định, Minh Mạng) — not three tombs plus the citadel on one clock.',
    days: [
      {
        theme: 'Imperial City',
        blurb: 'Ngọ Môn, palaces, flag tower. Stay inside the citadel until it is honestly done.',
      },
      {
        theme: 'Thiên Mụ and the river',
        blurb: 'Pagoda, Perfume River, Đông Ba. A gentler Hue day between the citadel and the tombs.',
      },
      {
        theme: 'Royal tombs',
        blurb: 'Khải Định and Minh Mạng (Tự Đức if the clock still fits). These are countryside outings, not a citadel add-on.',
      },
    ],
  },
  'Da Lat': {
    summary:
      'Crazy House and Xuân Hương, southern lake and Trúc Lâm, waterfalls and Linh Phước — highland packing, not a theme-park dump.',
    days: [
      {
        theme: 'Centre and Crazy House',
        blurb: 'Crazy House, Xuân Hương, the market. Night market after dark.',
      },
      {
        theme: 'Tuyền Lâm and Trúc Lâm',
        blurb: 'Southern lake, monastery, Datanla on the same road. Not another city-lake loop.',
      },
      {
        theme: 'Falls and Linh Phước',
        blurb: 'Elephant Falls or Valley of Love, Linh Phước’s dragon. A countryside Da Lat day.',
      },
    ],
  },
  'Nha Trang': {
    summary:
      'Po Nagar and the promenade with Skylight at dusk; VinWonders / Hòn Tre as one outing; Hòn Mun as another. Those two island days never share a clock.',
    days: [
      {
        theme: 'Town and Po Nagar',
        blurb: 'Po Nagar, Long Sơn, cathedral, promenade. Skylight is the evening, not a third island.',
      },
      {
        theme: 'Hòn Tre and VinWonders',
        blurb: 'The park owns the day. Do not stack Hòn Mun snorkelling on the same ticket.',
      },
      {
        theme: 'Hòn Mun or mud baths',
        blurb: 'Reef boats or I-Resort. A second water day, separate from VinWonders.',
      },
    ],
  },
  'Phu Quoc': {
    summary:
      'South-island beaches, cable and Kiss Bridge; Grand World; Dương Đông night market and Dinh Cau — Hon Thom does not share a clock with another enclosure.',
    days: [
      {
        theme: 'South beaches and Hon Thom',
        blurb: 'Bãi Sao, cable to Hon Thom, Kiss Bridge. This is the south-island day.',
      },
      {
        theme: 'Grand World and the west coast',
        blurb: 'Grand World in daylight, Dinh Cau and a west-coast sunset. Keep Hon Thom off this clock.',
      },
      {
        theme: 'Dương Đông and sunset',
        blurb: 'Dinh Cau, night market, west-coast sunset or Long Beach. Island evening, not another park.',
      },
    ],
  },
  Sapa: {
    summary:
      'Cat Cat town day, a Muong Hoa trek (Lao Chải / Tả Van), Fansipan cable as its own outing. Trek, Cat Cat, and Fansipan do not share a day.',
    days: [
      {
        theme: 'Town and Cat Cat',
        blurb: 'Stone church, Hàm Rồng, Cat Cat village and waterfall. Not a Fansipan add-on.',
      },
      {
        theme: 'Muong Hoa trek',
        blurb: 'Lao Chải, Tả Van, valley paths. This outing owns the day — no cable car.',
      },
      {
        theme: 'Fansipan',
        blurb: 'Cable to the Roof of Indochina at opening. Weather, not a guarantee. No trek afterwards.',
      },
    ],
  },
}

/** Sight ids used to attach day copy after packing (order may not match the narrative array). */
export const CITY_STAY_DAY_MATCH: Record<string, string[][]> = {
  Hanoi: [
    ['old-quarter', 'hoan-kiem-lake', 'ngoc-son-temple', 'st-joseph-cathedral', 'egg-coffee', 'train-street'],
    ['ho-chi-minh-mausoleum', 'one-pillar-pagoda', 'hcm-stilt-house', 'temple-literature', 'hoa-lo-prison'],
    ['west-lake', 'ethnology-museum', 'tran-quoc-pagoda'],
  ],
  'Ho Chi Minh City': [
    ['independence-palace', 'war-remnants', 'notre-dame-saigon', 'ben-thanh', 'nguyen-hue-walking'],
    ['cu-chi'],
    ['cho-lon', 'jade-emperor-pagoda', 'bitexco-skydeck'],
  ],
  'Da Nang': [
    ['da-nang-beach', 'dragon-bridge', 'cham-sculpture-museum'],
    ['marble-mountains', 'son-tra', 'linh-ung-pagoda'],
    ['ba-na-hills'],
  ],
  'Hoi An': [
    ['hoi-an-ancient-town', 'japanese-covered-bridge', 'hoi-an-lanterns', 'hoi-an-market'],
    ['tra-que-village', 'cam-thanh-basket-boats'],
    ['my-son'],
  ],
  Hue: [
    ['hue-citadel'],
    ['thien-mu-pagoda', 'perfume-river', 'dong-ba-market'],
    ['khai-dinh-tomb', 'minh-mang-tomb'],
  ],
  'Da Lat': [
    ['crazy-house', 'xuan-huong-lake', 'da-lat-night-market', 'da-lat-market'],
    ['tuyen-lam-lake', 'truc-lam-monastery', 'datanla-waterfall'],
    ['elephant-falls', 'linh-phuoc-pagoda', 'valley-of-love'],
  ],
  'Nha Trang': [
    ['po-nagar', 'nha-trang-promenade', 'skylight-nha-trang', 'long-son-pagoda'],
    ['vinwonders-nha-trang', 'hon-tre-island'],
    ['hon-mun-island', 'i-resort-mud-bath'],
  ],
  'Phu Quoc': [
    ['sao-beach', 'kiss-bridge', 'hon-thom-island'],
    ['grand-world-pq'],
    ['duong-dong-night-market', 'dinh-cau', 'phu-quoc-sunset'],
  ],
  Sapa: [
    ['cat-cat-village', 'cat-cat-waterfall', 'sapa-stone-church', 'ham-rong-mountain'],
    ['sapa-trek', 'lao-chai-village', 'ta-van-village', 'muong-hoa-valley'],
    ['fansipan'],
  ],
}

export const CITY_STAY_HOTELS: Record<string, string> = {
  Hanoi: 'hanoi-silk',
  'Ho Chi Minh City': 'hcmc-reverie',
  'Da Nang': 'danang-fusion',
  'Hoi An': 'hoian-allegro',
  Hue: 'hue-pilgrimage',
  'Da Lat': 'colline-dalat',
  'Nha Trang': 'nhatrang-mojzo',
  'Phu Quoc': 'phuquoc-sol',
  Sapa: 'sapa-valley',
}
