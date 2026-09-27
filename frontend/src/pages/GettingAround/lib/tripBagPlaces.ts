import { useMemo } from 'react'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import { getClusterById } from '../../WhereToStay/data/clusters'
import type { PlaceId } from '../data/types'
import { isKnownPlaceId, mapLabelToPlaceId } from './placeLabels'

export { mapLabelToPlaceId }

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
    if (cluster && isKnownPlaceId(cluster.cityId)) {
      ids.add(cluster.cityId)
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
