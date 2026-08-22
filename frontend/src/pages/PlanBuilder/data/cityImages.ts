/**
 * Destination imagery for the city-first Things To Do test page.
 * Wikimedia Commons FilePath — city-accurate scenes.
 */
const w = (file: string, width = 1400) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`

export const CITY_IMAGES: Record<string, string[]> = {
  hanoi: [
    w('Hanoi_Old_Quarter.jpg'),
    w('Hang_Ma_Street.jpg'),
    w('Temple_of_Literature,_Hanoi.jpg'),
    w('Bún_chả.jpg'),
    w('Train_Street_Hanoi.jpg'),
    w('Cà_phê_trứng.jpg'),
  ],
  'ninh-binh': [
    w('Trang_An_Landscape_Complex.jpg'),
    w('Tam_Coc,_Ninh_Binh.jpg'),
    w('Boat_in_Tam_Coc.jpg'),
    w('Hang_Mua.jpg'),
    w('Ninh_Binh.jpg'),
  ],
  'ha-long': [
    w('Ha_Long_Bay.jpg'),
    w('Junk_boat_in_Halong_Bay.jpg'),
    w('Ha_Long_Bay_in_2023.jpg'),
    w('HALONG_BAY_.jpg'),
    w('Lan_Ha_Bay.jpg'),
  ],
  'ha-giang': [
    w('Ma_Pi_Leng_Pass.jpg'),
    w('Dong_Van_Karst_Plateau_Geopark.jpg'),
    w('Ha_Giang_mountains.jpg'),
    w('Ha_Giang.jpg'),
    w('Dong_Van.jpg'),
  ],
  sapa: [
    w('Rice_terraces_in_Sa_Pa.jpg'),
    w('Sa_Pa_rice_terraces.jpg'),
    w('Sapa_Vietnam.jpg'),
    w('Fansipan.jpg'),
    w('Fansipan_Mountain.jpg'),
  ],
  hue: [
    w('Imperial_City,_Huế.jpg'),
    w('Meridian_Gate_(Hue).jpg'),
    w('Huế_Citadel.jpg'),
    w('Perfume_River.jpg'),
    w('Huế.jpg'),
  ],
  'hoi-an': [
    w('Hoi_An_Ancient_Town.jpg'),
    w('Hội_An_at_night.jpg'),
    w('Lanterns_Hoi_An.jpg'),
    w('Hoi_An_riverfront.jpg'),
    w('An_Bang_Beach.jpg'),
  ],
  'da-nang': [
    w('My_Khe_Beach.jpg'),
    w('Da_Nang_Beach.jpg'),
    w('Marble_Mountains.jpg'),
    w('China_Beach.jpg'),
    w('Ngu_Hanh_Son.jpg'),
  ],
  'phong-nha': [
    w('Paradise_Cave.jpg'),
    w('Phong_Nha_Cave.jpg'),
    w('Phong_Nha-Ke_Bang.jpg'),
    w('Dark_Cave.jpg'),
  ],
  hcmc: [
    w('Ho_Chi_Minh_City.jpg'),
    w('Ben_Thanh_Market.jpg'),
    w('Independence_Palace.jpg'),
    w('War_Remnants_Museum.jpg'),
    w('Bến_Thành_Market.jpg'),
  ],
  mekong: [
    w('Cái_Răng_floating_market.jpg'),
    w('Mekong_Delta.jpg'),
    w('Floating_market_Vietnam.jpg'),
  ],
  'phu-quoc': [
    w('Phu_Quoc.jpg'),
    w('Sao_Beach.jpg'),
    w('Phú_Quốc_Island.jpg'),
    w('Long_Beach_Phu_Quoc.jpg'),
  ],
}

export function cityImages(cityId: string): string[] {
  return CITY_IMAGES[cityId] ?? []
}
