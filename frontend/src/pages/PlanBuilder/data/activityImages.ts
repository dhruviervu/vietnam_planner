/**
 * Activity-accurate photos via Wikimedia Commons FilePath.
 * One strong image is enough when a real gallery does not exist —
 * do not pad with unrelated city shots.
 */
const w = (file: string, width = 1200) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`

export const ACTIVITY_IMAGES: Record<string, string[]> = {
  'hn-cooking-home': [w('Bún_chả.jpg'), w('Vietnamese_cuisine.jpg'), w('Pho_bo.jpg')],
  'hn-tai-chi-lake': [
    w('Hoan Kiem Lake in the morning, September 2014.jpeg'),
    w('Hoan_Kiem_Lake.jpg'),
    w('Turtle_Tower.jpg'),
  ],
  'hn-karaoke-bia-hoi': [w('Karaoke in Nha Trang.jpg'), w('Bia_hơi.jpg')],
  'hn-street-food-moto': [w('Vietnamese_street_food.jpg'), w('Bún_chả.jpg'), w('Pho_bo.jpg')],
  'hn-egg-coffee-lab': [w('Cà_phê_trứng.jpg'), w('Egg_coffee.jpg'), w('Vietnamese_coffee.jpg')],

  'nb-paddle-van-long': [w('Van_Long_Nature_Reserve.jpg'), w('Boat_in_Tam_Coc.jpg')],
  'nb-rice-homestay': [w('Tam_Coc,_Ninh_Binh.jpg'), w('Ninh_Binh.jpg')],
  'nb-countryside-cook': [w('Vietnamese_cuisine.jpg'), w('Tam_Coc,_Ninh_Binh.jpg')],
  'nb-bike-picnic': [w('Hang_Mua.jpg'), w('Tam_Coc,_Ninh_Binh.jpg'), w('Ninh_Binh.jpg')],

  'hl-kayak-karsts': [
    w('Kayaking in Ha Long Bay 1.jpg'),
    w('Kayaks in Ha Long Bay.jpg'),
    w('Lan_Ha_Bay.jpg'),
  ],
  'hl-beach-volley': [w('Cat_Ba_Island.jpg')],
  'hl-squid-night': [w('Junk_boat_in_Halong_Bay.jpg')],
  'hl-sup-lan-ha': [w('Lan_Ha_Bay.jpg'), w('Kayaking in Ha Long Bay 2.jpg')],

  'hg-homestay-dance': [w('Dong_Van.jpg'), w('Ha_Giang.jpg')],
  'hg-weaving': [w('Hmong women at Coc Ly market, Sapa, Vietnam.jpg')],
  'hg-market-day': [w('Hmong women at Coc Ly market, Sapa, Vietnam.jpg'), w('Dong_Van.jpg')],
  'hg-easy-ride-buddy': [w('Ma_Pi_Leng_Pass.jpg'), w('Ha_Giang_mountains.jpg')],

  'sp-indigo-batik': [
    w('Hmong women at Coc Ly market, Sapa, Vietnam.jpg'),
    w('Cat_Cat_Village.jpg'),
  ],
  'sp-homestay-cook': [w('Cat_Cat_Village.jpg'), w('Sapa_Vietnam.jpg')],
  'sp-terrace-walk-games': [w('Rice_terraces_in_Sa_Pa.jpg'), w('Sa_Pa_rice_terraces.jpg')],
  'sp-evening-song': [w('Sapa_Vietnam.jpg')],

  'hue-royal-cook': [w('Dong_Ba_Market.jpg'), w('Vietnamese_cuisine.jpg')],
  'hue-ca-hue-boat': [w('Perfume_River.jpg'), w('Hương_River.jpg')],
  'hue-ao-dai-cycle': [w('Perfume_River.jpg'), w('Thiên_Mụ_Pagoda.jpg')],
  'hue-incense-craft': [
    w('Incense village (1346180875).jpg'),
    w('Incense village (1346181231).jpg'),
  ],

  'ha-lantern-make': [w('Lanterns_Hoi_An.jpg'), w('Hội_An_at_night.jpg')],
  'ha-tra-que-cook': [w('Tra_Que_Vegetable_Village.jpg'), w('Hoi_An_countryside.jpg')],
  'ha-an-bang-play': [w('An_Bang_Beach.jpg'), w('Hoi_An_beach.jpg')],
  'ha-basket-boat': [w('Basket_boat_Vietnam.jpg'), w('Hoi_An_coconut_boat.jpg')],
  'ha-folk-dance': [w('VIETNAM FOLK DANCE.jpg')],
  'ha-thanh-ha-pottery': [w('Thanh_Ha_Pottery_Village.jpg'), w('Hoi_An_pottery.jpg')],

  'dn-surf-my-khe': [w('My_Khe_Beach.jpg'), w('Da_Nang_Beach.jpg'), w('China_Beach.jpg')],
  'dn-beach-football': [w('My_Khe_Beach.jpg'), w('Da_Nang_Beach.jpg')],
  'dn-sunset-yoga': [w('Yoga in the beach (Unsplash).jpg'), w('My_Khe_Beach.jpg')],
  'dn-han-kayak': [w('Dragon_Bridge_(Da_Nang).jpg'), w('Dragon_Bridge_Da_Nang.jpg')],

  'pn-dark-cave-play': [w('Dark_Cave.jpg'), w('Phong_Nha-Ke_Bang.jpg')],
  'pn-farmstay-cook': [w('Phong_Nha-Ke_Bang.jpg')],
  'pn-son-kayak': [w('Phong_Nha_Cave.jpg'), w('Phong_Nha-Ke_Bang.jpg')],

  'hcmc-cook-class': [w('Ben_Thanh_Market.jpg'), w('Vietnamese_cuisine.jpg'), w('Pho_bo.jpg')],
  'hcmc-dance-class': [w('Nguyen_Hue_Boulevard.jpg')],
  'hcmc-karaoke': [w('Karaoke in Nha Trang.jpg')],
  'hcmc-moto-food': [w('Vietnamese_street_food.jpg'), w('Ben_Thanh_Market.jpg')],
  'hcmc-boxing': [w('Vovinam demonstration Master de fleuret 2014 t223129.jpg')],

  'mk-coconut-candy': [
    w('Ben Tre Cocoa-coconut candy (1).jpg'),
    w('Ben Tre Cocoa-coconut candy (2).jpg'),
  ],
  'mk-homestay-fish': [w('Mekong_Delta.jpg')],
  'mk-sampan-paddle': [w('Mekong_Delta.jpg'), w('Cái_Răng_floating_market.jpg')],
  'mk-don-ca-tai-tu': [w('VIETNAM FOLK DANCE.jpg')],

  'pq-beach-volley': [w('Long_Beach_Phu_Quoc.jpg'), w('Phu_Quoc.jpg')],
  'pq-seafood-cook': [w('Duong_Dong_night_market.jpg'), w('Phu_Quoc.jpg')],
  'pq-sup-sunset': [w('Long_Beach_Phu_Quoc.jpg'), w('Phú_Quốc_Island.jpg')],
  'pq-snorkel-guide': [w('Sao_Beach.jpg'), w('Phú_Quốc_Island.jpg')],
  'pq-beach-drum': [w('Long_Beach_Phu_Quoc.jpg')],
}
