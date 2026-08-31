export function cityKey(value: string) {
  const s = value.toLowerCase()
  if (s.includes('ho chi minh') || s.includes('saigon') || s.includes('hcmc')) return 'hcmc'
  if (s.includes('hoi an')) return 'hoi-an'
  if (s.includes('da nang')) return 'da-nang'
  if (s.includes('yen tu') || s.includes('yên tử') || s.includes('yen tử')) return 'yen-tu'
  if (s.includes('ha long') || s.includes('quang ninh') || s.includes('cat ba') || s.includes('lan ha'))
    return 'ha-long'
  if (s.includes('ninh binh')) return 'ninh-binh'
  if (s.includes('cao bang') || s.includes('caobang') || s.includes('ban gioc') || s.includes('bản giốc'))
    return 'cao-bang'
  if (s.includes('ha giang') || s.includes('dong van')) return 'ha-giang'
  if (s.includes('phu quoc')) return 'phu-quoc'
  if (s.includes('con dao') || s.includes('côn đảo') || s.includes('condao')) return 'con-dao'
  if (s.includes('cat tien') || s.includes('cát tiên') || s.includes('cattien')) return 'cat-tien'
  if (s.includes('nha trang')) return 'nha-trang'
  if (s.includes('da lat') || s.includes('dalat')) return 'dalat'
  if (s.includes('phong nha')) return 'phong-nha'
  if (s.includes('can tho') || s.includes('mekong')) return 'mekong'
  if (s.includes('vinh hy') || s.includes('nui chua') || s.includes('amanoi')) return 'vinh-hy'
  if (s.includes('quy nhon') || s.includes('bai san ho') || s.includes('bãi san hô') || s.includes('phu yen'))
    return 'quy-nhon'
  if (s.includes('hanoi')) return 'hanoi'
  if (s.includes('hue')) return 'hue'
  if (s.includes('sapa')) return 'sapa'
  return s.trim()
}
