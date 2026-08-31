import { useEffect, useMemo, useState } from 'react'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import { getClusterById } from '../../WhereToStay/data/clusters'
import type { PlaceId } from '../data/types'
import { MAP_META } from '../maps/mapMeta'
import { pointsForCity } from '../data/urbanPoints'
import { geocodeInCity, pointInCityBounds, type CityBounds } from './geocodeInCity'
import { mapLabelToPlaceId } from './tripBagPlaces'

export type TripBagUrbanPin = {
  id: string
  label: string
  lat: number
  lng: number
  source: 'experience' | 'activity' | 'stay'
}

type Candidate = {
  id: string
  label: string
  query: string
  source: TripBagUrbanPin['source']
  fallback?: { lat: number; lng: number }
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function ringCentroid(ring: [number, number][]): { lat: number; lng: number } | null {
  if (!ring.length) return null
  let lng = 0
  let lat = 0
  let n = 0
  const first = ring[0]
  const last = ring[ring.length - 1]
  const skipClose = last && first && last[0] === first[0] && last[1] === first[1]
  const end = skipClose ? ring.length - 1 : ring.length
  for (let i = 0; i < end; i++) {
    lng += ring[i][0]
    lat += ring[i][1]
    n++
  }
  if (!n) return null
  return { lat: lat / n, lng: lng / n }
}

export function matchUrbanPoint(label: string, cityId: PlaceId) {
  const n = normalize(label)
  if (n.length < 4) return null
  let best = null as ReturnType<typeof pointsForCity>[number] | null
  let bestLen = 0
  for (const p of pointsForCity(cityId)) {
    const pl = normalize(p.label)
    if (pl.length < 4) continue
    const hit = n.includes(pl) || pl.includes(n)
    if (hit && pl.length > bestLen) {
      best = p
      bestLen = pl.length
    }
  }
  return best
}

export function collectTripBagUrbanCandidates(
  cityId: PlaceId,
  cityLabel: string,
  experienceIds: string[],
  activityIds: string[],
  stayIds: string[],
  customStays: Record<string, { clusterId: string; name: string }>,
): Candidate[] {
  const out: Candidate[] = []

  for (const exp of EXPERIENCES) {
    if (!experienceIds.includes(exp.id)) continue
    const mapped = mapLabelToPlaceId(exp.city) ?? mapLabelToPlaceId(exp.region)
    if (mapped !== cityId) continue
    out.push({
      id: `bag-exp-${exp.id}`,
      label: exp.name,
      query: `${exp.name}, ${cityLabel}, Vietnam`,
      source: 'experience',
    })
  }

  for (const act of CITY_ACTIVITIES) {
    if (!activityIds.includes(act.id)) continue
    const mapped = mapLabelToPlaceId(act.cityId) ?? mapLabelToPlaceId(act.cityName)
    if (mapped !== cityId) continue
    out.push({
      id: `bag-act-${act.id}`,
      label: act.name,
      query: `${act.name}, ${cityLabel}, Vietnam`,
      source: 'activity',
    })
  }

  for (const stayId of stayIds) {
    const stay = STAY_PROPERTY_BY_ID[stayId] ?? customStays[stayId]
    if (!stay) continue
    const cluster = getClusterById(stay.clusterId)
    if (!cluster || cluster.cityId !== cityId) continue
    const centroid = ringCentroid(cluster.polygon)
    out.push({
      id: `bag-stay-${stay.id}`,
      label: stay.name,
      query: `${stay.name}, ${cityLabel}, Vietnam`,
      source: 'stay',
      fallback: centroid ?? undefined,
    })
  }

  return out
}

async function resolveCandidate(
  candidate: Candidate,
  cityId: PlaceId,
  cityLabel: string,
  bounds: CityBounds,
): Promise<TripBagUrbanPin | null> {
  const local = matchUrbanPoint(candidate.label, cityId)
  if (local && pointInCityBounds(local.lat, local.lng, bounds, 0.02)) {
    return {
      id: candidate.id,
      label: candidate.label,
      lat: local.lat,
      lng: local.lng,
      source: candidate.source,
    }
  }

  const geo = await geocodeInCity(candidate.query, cityLabel, bounds)
  if (geo.ok) {
    return {
      id: candidate.id,
      label: candidate.label,
      lat: geo.hit.lat,
      lng: geo.hit.lng,
      source: candidate.source,
    }
  }

  if (
    candidate.fallback &&
    pointInCityBounds(candidate.fallback.lat, candidate.fallback.lng, bounds, 0.02)
  ) {
    return {
      id: candidate.id,
      label: candidate.label,
      lat: candidate.fallback.lat,
      lng: candidate.fallback.lng,
      source: candidate.source,
    }
  }

  return null
}

export function useTripBagUrbanPins(cityId: PlaceId | null, cityLabel: string | null) {
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const stayIds = useTripStore((s) => s.itineraryStayPropertyIds)
  const customStays = useTripStore((s) => s.customStayProperties)

  const candidates = useMemo(() => {
    if (!cityId || !cityLabel) return []
    return collectTripBagUrbanCandidates(
      cityId,
      cityLabel,
      experienceIds,
      activityIds,
      stayIds,
      customStays,
    )
  }, [cityId, cityLabel, experienceIds, activityIds, stayIds, customStays])

  const [pins, setPins] = useState<TripBagUrbanPin[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cityId || !cityLabel || !candidates.length) {
      setPins([])
      setLoading(false)
      return
    }
    const bounds = MAP_META.cities[cityId]?.bounds
    if (!bounds) {
      setPins([])
      return
    }

    let cancelled = false
    setLoading(true)
    ;(async () => {
      const resolved: TripBagUrbanPin[] = []
      for (const candidate of candidates) {
        if (cancelled) return
        const pin = await resolveCandidate(candidate, cityId, cityLabel, bounds)
        if (pin) resolved.push(pin)
        if (!cancelled) setPins([...resolved])
      }
      if (!cancelled) {
        setPins(resolved)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [candidates, cityId, cityLabel])

  return { pins, loading, hasBagItems: candidates.length > 0 }
}
