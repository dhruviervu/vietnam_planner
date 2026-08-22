/**
 * Place-accurate experience imagery via Wikimedia Commons FilePath.
 * Filenames are destination-specific; width param keeps loads reasonable.
 */
const w = (file: string, width = 1200) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`

export const EXPERIENCE_IMAGES: Record<string, string[]> = {
  'halong-cruise': [
    w('Ha_Long_Bay.jpg'),
    w('HALONG_BAY_.jpg'),
    w('Ha_Long_Bay_in_2023.jpg'),
    w('Junk_boat_in_Halong_Bay.jpg'),
  ],
  'temple-literature': [
    w('Temple_of_Literature,_Hanoi.jpg'),
    w('Van_Mieu_gate.jpg'),
    w('Temple_of_Literature_Hanoi.jpg'),
  ],
  'old-quarter': [
    w('Hanoi_Old_Quarter.jpg'),
    w('Hang_Ma_Street.jpg'),
    w('Old_Quarter_Hanoi_street.jpg'),
  ],
  'ninh-binh': [
    w('Trang_An_Landscape_Complex.jpg'),
    w('Tam_Coc,_Ninh_Binh.jpg'),
    w('Ninh_Binh.jpg'),
    w('Boat_in_Tam_Coc.jpg'),
  ],
  'mua-cave': [
    w('Hang_Mua.jpg'),
    w('Mua_Cave_Ninh_Binh.jpg'),
    w('Ninh_Binh.jpg'),
  ],
  'hoa-lu': [
    w('Hoa_Lu.jpg'),
    w('Dinh_Tien_Hoang_Temple.jpg'),
    w('Ninh_Binh.jpg'),
  ],
  'hoi-an-lanterns': [
    w('Hoi_An_Ancient_Town.jpg'),
    w('Hội_An_at_night.jpg'),
    w('Lanterns_Hoi_An.jpg'),
    w('Hoi_An_riverfront.jpg'),
  ],
  'cooking-class': [
    w('Pho_bo.jpg'),
    w('Vietnamese_cuisine.jpg'),
    w('Banh_mi.jpg'),
  ],
  'ha-giang-loop': [
    w('Ma_Pi_Leng_Pass.jpg'),
    w('Ha_Giang.jpg'),
    w('Dong_Van_Karst_Plateau_Geopark.jpg'),
    w('Ha_Giang_mountains.jpg'),
  ],
  'sapa-trek': [
    w('Rice_terraces_in_Sa_Pa.jpg'),
    w('Sa_Pa_rice_terraces.jpg'),
    w('Sapa_Vietnam.jpg'),
  ],
  'hue-citadel': [
    w('Imperial_City,_Huế.jpg'),
    w('Meridian_Gate_(Hue).jpg'),
    w('Huế_Citadel.jpg'),
  ],
  'da-nang-beach': [
    w('My_Khe_Beach.jpg'),
    w('Da_Nang_Beach.jpg'),
    w('China_Beach.jpg'),
  ],
  'phong-nha': [
    w('Paradise_Cave.jpg'),
    w('Phong_Nha_Cave.jpg'),
    w('Phong_Nha-Ke_Bang.jpg'),
  ],
  'war-remnants': [
    w('War_Remnants_Museum.jpg'),
    w('Independence_Palace.jpg'),
    w('Ho_Chi_Minh_City.jpg'),
  ],
  'cu-chi': [
    w('Cu_Chi_tunnels.jpg'),
    w('Củ_Chi_tunnels.jpg'),
    w('Cu_Chi_Tunnels_Vietnam.jpg'),
  ],
  'mekong-delta': [
    w('Cái_Răng_floating_market.jpg'),
    w('Mekong_Delta.jpg'),
    w('Floating_market_Vietnam.jpg'),
  ],
  'phu-quoc-snorkel': [
    w('Phu_Quoc.jpg'),
    w('Sao_Beach.jpg'),
    w('Phú_Quốc_Island.jpg'),
  ],
  'phu-quoc-sunset': [
    w('Phu_Quoc.jpg'),
    w('Phú_Quốc_Island.jpg'),
    w('Long_Beach_Phu_Quoc.jpg'),
  ],
  'egg-coffee': [
    w('Cà_phê_trứng.jpg'),
    w('Egg_coffee.jpg'),
    w('Vietnamese_coffee.jpg'),
  ],
  'hanoi-food-tour': [
    w('Bún_chả.jpg'),
    w('Pho_bo.jpg'),
    w('Vietnamese_street_food.jpg'),
  ],
  'train-street': [
    w('Train_Street_Hanoi.jpg'),
    w('Hanoi_train_street.jpg'),
    w('Hanoi_Old_Quarter.jpg'),
  ],
  'an-bang': [
    w('An_Bang_Beach.jpg'),
    w('Hoi_An_beach.jpg'),
    w('My_Khe_Beach.jpg'),
  ],
  'my-son': [
    w('My_Son.jpg'),
    w('Mỹ_Sơn.jpg'),
    w('My_Son_Sanctuary.jpg'),
  ],
  'marble-mountains': [
    w('Marble_Mountains.jpg'),
    w('Ngu_Hanh_Son.jpg'),
    w('Da_Nang_Marble_Mountains.jpg'),
  ],
  'cat-ba': [
    w('Cat_Ba_Island.jpg'),
    w('Lan_Ha_Bay.jpg'),
    w('Ha_Long_Bay.jpg'),
  ],
  'lan-ha': [
    w('Lan_Ha_Bay.jpg'),
    w('Cat_Ba_Island.jpg'),
    w('Ha_Long_Bay.jpg'),
  ],
  'ben-thanh': [
    w('Ben_Thanh_Market.jpg'),
    w('Bến_Thành_Market.jpg'),
    w('Ho_Chi_Minh_City.jpg'),
  ],
  'perfume-river': [
    w('Perfume_River.jpg'),
    w('Hương_River.jpg'),
    w('Huế.jpg'),
  ],
  'dark-cave': [
    w('Dark_Cave.jpg'),
    w('Phong_Nha-Ke_Bang.jpg'),
    w('Paradise_Cave.jpg'),
  ],
  'dong-van': [
    w('Dong_Van_Karst_Plateau_Geopark.jpg'),
    w('Dong_Van.jpg'),
    w('Ha_Giang.jpg'),
  ],
  'fansipan': [
    w('Fansipan.jpg'),
    w('Fansipan_Mountain.jpg'),
    w('Sa_Pa_rice_terraces.jpg'),
  ],
  'bia-hoi': [
    w('Bia_hơi.jpg'),
    w('Hanoi_Old_Quarter.jpg'),
    w('Vietnamese_beer.jpg'),
  ],
  'hoan-kiem-lake': [
    w('Hoan_Kiem_Lake.jpg'),
    w('Turtle_Tower.jpg'),
    w('Hoàn_Kiếm_Lake.jpg'),
  ],
  'hoa-lo-prison': [
    w('Hỏa_Lò_Prison.jpg'),
    w('Hoa_Lo_Prison.jpg'),
    w('Hanoi.jpg'),
  ],
  'ho-chi-minh-mausoleum': [
    w('Ho_Chi_Minh_Mausoleum.jpg'),
    w('Ho_Chi_Minh_Mausoleum_Hanoi.jpg'),
    w('Ba_Dinh_Square.jpg'),
  ],
  'west-lake': [
    w('West_Lake_(Hanoi).jpg'),
    w('Trấn_Quốc_Pagoda.jpg'),
    w('West_Lake_Hanoi.jpg'),
  ],
  'ethnology-museum': [
    w('Vietnam_Museum_of_Ethnology.jpg'),
    w('Museum_of_Ethnology_Hanoi.jpg'),
    w('Hanoi.jpg'),
  ],
  'thang-long-citadel': [
    w('Imperial_Citadel_of_Thang_Long.jpg'),
    w('Thăng_Long_Imperial_Citadel.jpg'),
    w('Flag_Tower_of_Hanoi.jpg'),
  ],
  'dong-xuan-market': [
    w('Dong_Xuan_Market.jpg'),
    w('Đồng_Xuân_Market.jpg'),
    w('Hanoi_Old_Quarter.jpg'),
  ],
  'hanoi-opera-house': [
    w('Hanoi_Opera_House.jpg'),
    w('Hanoi_Opera_House_night.jpg'),
    w('Hanoi.jpg'),
  ],
  'quan-thanh-temple': [
    w('Quán_Thánh_Temple.jpg'),
    w('Quan_Thanh_Temple.jpg'),
    w('West_Lake_(Hanoi).jpg'),
  ],
  'long-bien-bridge': [
    w('Long_Biên_Bridge.jpg'),
    w('Long_Bien_Bridge.jpg'),
    w('Hanoi.jpg'),
  ],
  'notre-dame-saigon': [
    w('Notre-Dame_Cathedral_Basilica_of_Saigon.jpg'),
    w('Saigon_Notre-Dame_Basilica.jpg'),
    w('Ho_Chi_Minh_City.jpg'),
  ],
  'independence-palace': [
    w('Independence_Palace.jpg'),
    w('Reunification_Palace.jpg'),
    w('Ho_Chi_Minh_City.jpg'),
  ],
  'landmark81-viewpoint': [
    w('Landmark_81.jpg'),
    w('Landmark_81_Ho_Chi_Minh_City.jpg'),
    w('Ho_Chi_Minh_City_skyline.jpg'),
  ],
  'jade-emperor-pagoda': [
    w('Jade_Emperor_Pagoda.jpg'),
    w('Chùa_Ngọc_Hoàng.jpg'),
    w('Ho_Chi_Minh_City.jpg'),
  ],
  'nguyen-hue-walking': [
    w('Nguyen_Hue_Boulevard.jpg'),
    w('Nguyễn_Huệ_Boulevard.jpg'),
    w('Ho_Chi_Minh_City.jpg'),
  ],
  'cho-lon': [
    w('Chợ_Lớn.jpg'),
    w('Thien_Hau_Temple,_Ho_Chi_Minh_City.jpg'),
    w('Binh_Tay_Market.jpg'),
  ],
  'apartment-cafes': [
    w('Vietnamese_coffee.jpg'),
    w('Ho_Chi_Minh_City.jpg'),
    w('Cafe_apartment_Vietnam.jpg'),
  ],
  'hoi-an-ancient-town': [
    w('Hoi_An_Ancient_Town.jpg'),
    w('Japanese_Covered_Bridge.jpg'),
    w('Hội_An.jpg'),
  ],
  'cam-thanh-basket-boats': [
    w('Basket_boat_Vietnam.jpg'),
    w('Hoi_An_coconut_boat.jpg'),
    w('Hội_An.jpg'),
  ],
  'tra-que-village': [
    w('Tra_Que_Vegetable_Village.jpg'),
    w('Hoi_An_countryside.jpg'),
    w('Hội_An.jpg'),
  ],
  'thanh-ha-pottery': [
    w('Thanh_Ha_Pottery_Village.jpg'),
    w('Hoi_An_pottery.jpg'),
    w('Hội_An.jpg'),
  ],
  'thien-mu-pagoda': [
    w('Thiên_Mụ_Pagoda.jpg'),
    w('Thien_Mu_Pagoda.jpg'),
    w('Huế.jpg'),
  ],
  'tu-duc-tomb': [
    w('Tomb_of_Tự_Đức.jpg'),
    w('Tu_Duc_Tomb.jpg'),
    w('Huế.jpg'),
  ],
  'minh-mang-tomb': [
    w('Tomb_of_Minh_Mạng.jpg'),
    w('Minh_Mang_Tomb.jpg'),
    w('Huế.jpg'),
  ],
  'dong-ba-market': [
    w('Dong_Ba_Market.jpg'),
    w('Đông_Ba_Market.jpg'),
    w('Huế.jpg'),
  ],
  'dragon-bridge': [
    w('Dragon_Bridge_(Da_Nang).jpg'),
    w('Dragon_Bridge_Da_Nang.jpg'),
    w('Da_Nang.jpg'),
  ],
  'son-tra': [
    w('Son_Tra_Peninsula.jpg'),
    w('Monkey_Mountain_Da_Nang.jpg'),
    w('Da_Nang.jpg'),
  ],
  'linh-ung-pagoda': [
    w('Linh_Ung_Pagoda.jpg'),
    w('Lady_Buddha_Da_Nang.jpg'),
    w('Son_Tra_Peninsula.jpg'),
  ],
  'ba-na-hills': [
    w('Golden_Bridge_(Vietnam).jpg'),
    w('Ba_Na_Hills.jpg'),
    w('Golden_Bridge_Da_Nang.jpg'),
  ],
  'sung-sot-cave': [
    w('Sung_Sot_Cave.jpg'),
    w('Surprise_Cave.jpg'),
    w('Ha_Long_Bay.jpg'),
  ],
  'ti-top-island': [
    w('Titov_Island.jpg'),
    w('Ti_Top_Island.jpg'),
    w('Ha_Long_Bay.jpg'),
  ],
  'trang-an-boats': [
    w('Trang_An_Landscape_Complex.jpg'),
    w('Trang_An.jpg'),
    w('Ninh_Binh.jpg'),
  ],
  'tam-coc-boats': [
    w('Tam_Coc,_Ninh_Binh.jpg'),
    w('Boat_in_Tam_Coc.jpg'),
    w('Ninh_Binh.jpg'),
  ],
  'van-long': [
    w('Van_Long_Nature_Reserve.jpg'),
    w('Vân_Long.jpg'),
    w('Ninh_Binh.jpg'),
  ],
  'bai-dinh': [
    w('Bai_Dinh_Pagoda.jpg'),
    w('Bái_Đính_Temple.jpg'),
    w('Ninh_Binh.jpg'),
  ],
  'cat-cat-village': [
    w('Cat_Cat_Village.jpg'),
    w('Cat_Cat_Sapa.jpg'),
    w('Sa_Pa_rice_terraces.jpg'),
  ],
  'sapa-market': [
    w('Sa_Pa_market.jpg'),
    w('Sapa_Vietnam.jpg'),
    w('Sa_Pa.jpg'),
  ],
  'sao-beach': [
    w('Sao_Beach.jpg'),
    w('Bai_Sao.jpg'),
    w('Phu_Quoc.jpg'),
  ],
  'duong-dong-night-market': [
    w('Duong_Dong_night_market.jpg'),
    w('Phu_Quoc.jpg'),
    w('Phú_Quốc_Island.jpg'),
  ],
  'dinh-cau': [
    w('Dinh_Cau.jpg'),
    w('Dinh_Cau_Temple.jpg'),
    w('Phu_Quoc.jpg'),
  ],
  'paradise-cave': [
    w('Paradise_Cave.jpg'),
    w('Thiên_Đường_Cave.jpg'),
    w('Phong_Nha-Ke_Bang.jpg'),
  ],
  'phong-nha-cave-boat': [
    w('Phong_Nha_Cave.jpg'),
    w('Phong_Nha-Ke_Bang.jpg'),
    w('Paradise_Cave.jpg'),
  ],
  'po-nagar': [
    w('Po_Nagar.jpg'),
    w('Po_Nagar_Cham_Towers.jpg'),
    w('Nha_Trang.jpg'),
  ],
  'nha-trang-promenade': [
    w('Nha_Trang_Beach.jpg'),
    w('Nha_Trang.jpg'),
    w('Nha_Trang_promenade.jpg'),
  ],
  'xuan-huong-lake': [
    w('Xuan_Huong_Lake.jpg'),
    w('Xuân_Hương_Lake.jpg'),
    w('Da_Lat.jpg'),
  ],
  'crazy-house': [
    w('Crazy_House.jpg'),
    w('Hang_Nga_guesthouse.jpg'),
    w('Da_Lat.jpg'),
  ],
  'valley-of-love': [
    w('Valley_of_Love.jpg'),
    w('Thung_lũng_Tình_Yêu.jpg'),
    w('Da_Lat.jpg'),
  ],
}

export function imagesFor(id: string, seeds: string[]): string[] {
  const curated = EXPERIENCE_IMAGES[id]
  if (curated?.length) return curated
  return seeds.map((seed) => `https://picsum.photos/seed/${seed}/880/560`)
}

export function experienceImageSrc(experience: { id: string; images?: string[]; seeds: string[] }, index = 0) {
  const list = experience.images?.length ? experience.images : imagesFor(experience.id, experience.seeds)
  return list[index] ?? list[0]
}
