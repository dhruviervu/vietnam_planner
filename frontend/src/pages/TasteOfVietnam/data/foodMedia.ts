/** Wikimedia Commons files that actually show the named Vietnamese dish. */
export const wikiFile = (file: string, width = 1200) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`

export const DISH_PHOTO_FILES: Record<string, string[]> = {
  pho: ['Pho_bo.jpg', 'Pho.jpg', 'Chicken_pho.jpg'],
  'banh-mi': ['Bánh_mì.jpg'],
  'bun-cha': ['Bún_chả.jpg', 'Bun_cha.jpg'],
  'bun-bo-hue': ['Bún_bò_Huế.jpg'],
  'cao-lau': ['Cao_lầu.jpg', 'Cao_Lầu.jpg'],
  'ca-phe-trung': ['Cà_phê_trứng.jpg'],
  'goi-cuon': ['Gỏi_cuốn.jpg', 'Vietnamese_spring_rolls.jpg', 'Summer_roll.jpg'],
  'com-tam': ['Com-Tam-2008.jpg', 'Cơm tấm bì chả.jpg', 'Cơm Tấm Bì Sườn Chả.jpg'],
}

/** Shop-front / stall photos when Commons has a matching venue scene. */
const VENUE_PHOTO_FILES: Record<string, string[]> = {
  pho: ['Pho_bo.jpg', 'Pho.jpg'],
  'banh-mi': ['Bánh_mì.jpg'],
  'bun-cha': ['Bún_chả.jpg', 'Bun_cha.jpg'],
  'bun-bo-hue': ['Bún_bò_Huế.jpg'],
  'cao-lau': ['Cao_lầu.jpg', 'Cao_Lầu.jpg'],
  'ca-phe-trung': ['Cà_phê_trứng.jpg'],
  'goi-cuon': ['Gỏi_cuốn.jpg', 'Vietnamese_spring_rolls.jpg'],
  'com-tam': ['Broken rice restaurant in Saigon.JPG', 'Com-Tam-2008.jpg'],
}

export function dishImages(dishId: string, width = 900): string[] {
  const files = DISH_PHOTO_FILES[dishId] ?? DISH_PHOTO_FILES.pho
  const urls = files.map((file) => wikiFile(file, width))
  while (urls.length < 3) urls.push(urls[0])
  return urls
}

export function restaurantImages(dishId: string): string[] {
  const files = VENUE_PHOTO_FILES[dishId] ?? DISH_PHOTO_FILES[dishId] ?? DISH_PHOTO_FILES.pho
  return files.map((file) => wikiFile(file, 800))
}
