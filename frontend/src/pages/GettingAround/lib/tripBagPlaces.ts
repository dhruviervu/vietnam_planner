import { useMemo } from 'react'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import { getClusterById } from '../../WhereToStay/data/clusters'
import type { PlaceId } from '../data/types'
import { PLACES } from '../data/places'

const PLACE_IDS = new Set(PLACES.map((p) => p.id))

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
  if (PLACE_IDS.has(s as PlaceId)) return s as PlaceId
  return null
}

export function collectTripBagPlaceIds(
  experienceIds: string[],
  activityIds: string[],
  stayIds: string[],
  customStays: Record<string, { clusterId: string }>,
): PlaceId[] {
  const ids = new Set<PlaceId>()

  for (const exp of EXPERIENCES) {
    if (!experienceIds.includes(exp.id)) continue
    const mapped = mapLabelToPlaceId(exp.city) ?? mapLabelToPlaceId(exp.region)
    if (mapped) ids.add(mapped)
  }

  for (const act of CITY_ACTIVITIES) {
    if (!activityIds.includes(act.id)) continue
    const mapped = mapLabelToPlaceId(act.cityId) ?? mapLabelToPlaceId(act.cityName)
    if (mapped) ids.add(mapped)
  }

  for (const stayId of stayIds) {
    const stay = STAY_PROPERTY_BY_ID[stayId] ?? customStays[stayId]
    if (!stay) continue
    const cluster = getClusterById(stay.clusterId)
    if (cluster && PLACE_IDS.has(cluster.cityId as PlaceId)) {
      ids.add(cluster.cityId as PlaceId)
    }
  }

  return [...ids]
}

export function useTripBagPlaceIds(): Set<PlaceId> {
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const stayIds = useTripStore((s) => s.itineraryStayPropertyIds)
  const customStays = useTripStore((s) => s.customStayProperties)

  return useMemo(
    () => new Set(collectTripBagPlaceIds(experienceIds, activityIds, stayIds, customStays)),
    [experienceIds, activityIds, stayIds, customStays],
  )
}
