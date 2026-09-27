import type { PlaceId } from '../data/types'
import { PLACES } from '../data/places'

const PLACE_IDS = new Set(PLACES.map((p) => p.id))

export function isKnownPlaceId(id: string): id is PlaceId {
  return PLACE_IDS.has(id as PlaceId)
}

/** Map experience / activity / stay labels onto Getting Around place ids. */
export function mapLabelToPlaceId(raw: string): PlaceId | null {
  const s = raw
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (!s) return null
  if (
    s.includes('hanoi') ||
    s.includes('old quarter') ||
    s.includes('hoan kiem') ||
    s.includes('west lake') ||
    s.includes('train street')
  ) {
    return 'hanoi'
  }
  if (s.includes('ho chi minh') || s.includes('hcmc') || s.includes('saigon')) {
    return 'hcmc'
  }
  if (s.includes('da nang') || s === 'da-nang') return 'da-nang'
  if (s.includes('hoi an')) return 'hoi-an'
  if (
    s.includes('ninh binh') ||
    s.includes('ninh-binh') ||
    s.includes('tam coc') ||
    s.includes('trang an') ||
    s.includes('hoa lu') ||
    s.includes('hoa-lu')
  ) {
    return 'ninh-binh'
  }
  if (s.includes('ha long') || s.includes('halong') || s.includes('cat ba') || s.includes('lan ha') || s.includes('quang ninh')) {
    return 'ha-long'
  }
  if (s.includes('ha giang') || s.includes('dong van') || s.includes('meo vac')) return 'ha-giang'
  if (s.includes('sapa') || s.includes('sa pa') || s.includes('sa-pa')) return 'sapa'
  if (s.includes('phong nha') || s.includes('phong-nha')) return 'phong-nha'
  if (/\bhue\b/.test(s) || s === 'hue') return 'hue'
  if (s.includes('nha trang')) return 'nha-trang'
  if (s.includes('da lat') || s.includes('dalat')) return 'dalat'
  if (s.includes('phu quoc')) return 'phu-quoc'
  if (s.includes('can tho') || s.includes('can-tho')) return 'can-tho'
  if (s.includes('mekong') || s.includes('ben tre')) return 'mekong'
  if (s.includes('con dao')) return 'con-dao'
  if (isKnownPlaceId(s)) return s
  return null
}
