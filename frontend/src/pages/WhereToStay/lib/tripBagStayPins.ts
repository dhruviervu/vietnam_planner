import { useEffect, useState } from 'react'
import { geocodeInCity } from '../../GettingAround/lib/geocodeInCity'
import { getClustersForCity } from '../data/clusters'
import type { StayCity } from '../data/types'
import type { TripBagStayItem } from '../services/tripBagStayIntelligence'

export type StayBagPin = {
  id: string
  name: string
  lat: number
  lng: number
}

function normalize(value: string) {
  return value
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
  const skipClose = Boolean(last && first && last[0] === first[0] && last[1] === first[1])
  const end = skipClose ? ring.length - 1 : ring.length
  for (let i = 0; i < end; i++) {
    lng += ring[i][0]
    lat += ring[i][1]
    n++
  }
  if (!n) return null
  return { lat: lat / n, lng: lng / n }
}

function fallbackFromClusters(name: string, city: StayCity): { lat: number; lng: number } | null {
  const clusters = getClustersForCity(city.id)
  const n = normalize(name)
  if (!n) return null

  let best: { lat: number; lng: number } | null = null
  let bestLen = 0
  for (const cluster of clusters) {
    for (const place of cluster.keyPlaces) {
      const pl = normalize(place.label)
      if (pl.length < 3) continue
      if (!(n.includes(pl) || pl.includes(n))) continue
      if (pl.length <= bestLen) continue
      const centroid = ringCentroid(cluster.polygon)
      if (!centroid) continue
      best = centroid
      bestLen = pl.length
    }
    const cn = normalize(cluster.name.split('/')[0] ?? cluster.name)
    if (cn.length >= 4 && (n.includes(cn) || cn.includes(n)) && cn.length > bestLen) {
      const centroid = ringCentroid(cluster.polygon)
      if (centroid) {
        best = centroid
        bestLen = cn.length
      }
    }
  }
  if (best) return best
  const fallback = clusters.find((cluster) => cluster.id === city.defaultClusterId) ?? clusters[0]
  return fallback ? ringCentroid(fallback.polygon) : null
}

export function useTripBagStayPins(city: StayCity, items: TripBagStayItem[]) {
  const signature = items
    .filter((item) => item.stayCityId === city.id)
    .map((item) => item.id)
    .join('|')

  const [pins, setPins] = useState<StayBagPin[]>([])

  useEffect(() => {
    const cityItems = items.filter((item) => item.stayCityId === city.id)
    if (!cityItems.length) {
      setPins([])
      return
    }

    let cancelled = false
    const resolved: StayBagPin[] = []

    ;(async () => {
      for (const item of cityItems) {
        if (cancelled) return
        const geo = await geocodeInCity(item.name, city.label, city.bounds)
        const latlng = geo.ok
          ? { lat: geo.hit.lat, lng: geo.hit.lng }
          : fallbackFromClusters(item.name, city)
        if (!latlng) continue
        resolved.push({ id: item.id, name: item.name, lat: latlng.lat, lng: latlng.lng })
        if (!cancelled) setPins([...resolved])
      }
      if (!cancelled) setPins([...resolved])
    })()

    return () => {
      cancelled = true
    }
  }, [city, items, signature])

  return pins
}
