import type { PlaceId } from '../data/types'

export type MapLocationMeta = {
  id: string
  type: string
  hint: string
  priority?: number
}

/** Display metadata for Vietnam map hubs — coordinates live in places.ts */
export const VIETNAM_LOCATION_META: Partial<Record<PlaceId, MapLocationMeta>> = {
  hanoi: { id: 'hanoi', type: 'Major city', hint: 'Rail · air · north hub', priority: 1 },
  'da-nang': { id: 'da-nang', type: 'Major city', hint: 'Central coast · air · rail', priority: 1 },
  hcmc: { id: 'hcmc', type: 'Major city', hint: 'South hub · air · rail', priority: 1 },
  'hoi-an': { id: 'hoi-an', type: 'Town', hint: 'Near Da Nang · short hop', priority: 2 },
  hue: { id: 'hue', type: 'City', hint: 'Imperial city · rail corridor', priority: 2 },
  'nha-trang': { id: 'nha-trang', type: 'Coastal city', hint: 'South-central · air', priority: 2 },
  dalat: { id: 'dalat', type: 'Highlands city', hint: 'Coach / flight from HCMC', priority: 2 },
  'ninh-binh': { id: 'ninh-binh', type: 'Day-trip hub', hint: 'Near Hanoi · ground links', priority: 2 },
  'ha-long': { id: 'ha-long', type: 'Bay destination', hint: 'Cruise / transfer from Hanoi', priority: 2 },
  sapa: { id: 'sapa', type: 'Mountain town', hint: 'Overnight ground from Hanoi', priority: 3 },
  'ha-giang': { id: 'ha-giang', type: 'Mountain town', hint: 'Loop starting point', priority: 3 },
  'phong-nha': { id: 'phong-nha', type: 'Cave region', hint: 'Central corridor stop', priority: 3 },
  mekong: { id: 'mekong', type: 'Delta region', hint: 'River boats · south', priority: 2 },
  'phu-quoc': { id: 'phu-quoc', type: 'Island', hint: 'Flight / ferry links', priority: 1 },
  'con-dao': { id: 'con-dao', type: 'Island', hint: 'Flight · boat from ports', priority: 2 },
}

export const URBAN_POINT_META: Record<string, { type: string; hint: string }> = {
  'han-old-quarter': { type: 'Neighbourhood', hint: 'Walkable · taxi · scooter' },
  'han-west-lake': { type: 'District', hint: 'West Lake area' },
  'han-french': { type: 'Neighbourhood', hint: 'French Quarter' },
  'han-ba-dinh': { type: 'District', hint: 'Ba Dinh' },
  'han-train': { type: 'Transport hub', hint: 'Hanoi Station' },
  'han-airport-link': { type: 'Corridor', hint: 'Airport approach corridor' },
  'dad-centre': { type: 'City centre', hint: 'Hai Chau' },
  'dad-my-khe': { type: 'Beach', hint: 'My Khe' },
  'dad-dragon': { type: 'Landmark', hint: 'Dragon Bridge' },
  'dad-marble': { type: 'Landmark', hint: 'Marble Mountains' },
  'sgn-d1': { type: 'District', hint: 'District 1' },
  'sgn-bitexco': { type: 'Riverfront', hint: 'Bitexco area' },
  'sgn-landmark': { type: 'Landmark', hint: 'Landmark 81' },
  'sgn-d3': { type: 'District', hint: 'District 3' },
  'sgn-ben-thanh': { type: 'Market', hint: 'Ben Thanh area' },
  'hai-ancient': { type: 'Old town', hint: 'Ancient Town' },
  'hai-an-bang': { type: 'Beach', hint: 'An Bang' },
  'hai-market': { type: 'Market', hint: 'Central Market' },
  'hue-citadel': { type: 'Landmark', hint: 'Citadel' },
  'hue-perfume': { type: 'River', hint: 'Perfume River' },
  'hue-tomb': { type: 'Area', hint: 'Tu Duc area' },
  'nb-tam-coc': { type: 'Scenic', hint: 'Tam Coc' },
  'nb-trang-an': { type: 'Scenic', hint: 'Trang An' },
  'nb-town': { type: 'Town centre', hint: 'Ninh Binh town' },
  'nt-beach': { type: 'Promenade', hint: 'Beach front' },
  'nt-centre': { type: 'City centre', hint: 'Nha Trang centre' },
  'nt-po': { type: 'Area', hint: 'Po Nagar' },
  'dl-centre': { type: 'Centre', hint: 'Market / centre' },
  'dl-lake': { type: 'Lake', hint: 'Xuan Huong Lake' },
  'dl-valley': { type: 'Scenic', hint: 'Valley of Love' },
}
