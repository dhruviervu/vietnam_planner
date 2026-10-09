import { ALL_MODE_IDS, buildMode } from './modes'
import { AIRPORTS, getDestination, getDestinationsForAirport } from './catalog'
import { AIRPORT_COORDS, destinationCoord, haversineKm, type TransferCoord } from './transferGeo'
import type { Airport, AirportId, ArrivalRoute, Destination, TransferDirection, TransportMode } from './types'

export type ChosenPlace = {
  label: string
  coord: TransferCoord
  destination: Destination
}

export function defaultPlaceForAirport(airportId: AirportId): ChosenPlace | null {
  const airport = AIRPORTS.find((a) => a.id === airportId)
  if (!airport) return null
  const dest =
    getDestination(airport.defaultDestinationId) ?? getDestinationsForAirport(airportId)[0]
  if (!dest) return null
  const coord = destinationCoord(dest.id)
  if (!coord) return null
  return { label: dest.label, coord, destination: dest }
}

export function customPlace(
  airport: Airport,
  label: string,
  coord: TransferCoord,
): ChosenPlace {
  const km = Math.max(1, Math.round(haversineKm(AIRPORT_COORDS[airport.id], coord)))
  const mins = Math.max(8, Math.round(km * 1.6 + 8))
  const destination: Destination = {
    id: `custom-${airport.id}`,
    airportId: airport.id,
    city: airport.city,
    area: 'Custom',
    label,
    mapsQuery: label,
    image: airport.image,
    distanceKm: km,
    typicalTimeMin: [mins, mins + Math.max(8, Math.round(mins * 0.35))],
    popularBase: false,
    eveningAppeal: false,
    recommendedTransfer: 'Taxi / Grab',
  }
  return { label, coord, destination }
}

export function syntheticRoute(
  airport: Airport,
  dest: Destination,
  coord: TransferCoord,
): ArrivalRoute {
  const km = dest.distanceKm || Math.round(haversineKm(AIRPORT_COORDS[airport.id], coord))
  return {
    id: `${airport.id}-${dest.id}`,
    airportId: airport.id,
    destinationId: dest.id,
    distanceKm: km,
    typicalTimeMin: dest.typicalTimeMin,
    typicalCostUsd: [Math.max(1, Math.round(km * 0.25)), Math.max(6, Math.round(km * 0.9))],
    trafficSensitivity: km > 40 ? 'High' : km > 18 ? 'Medium' : 'Low',
    modeIds: ALL_MODE_IDS,
    goodToKnow: [],
    goodToKnowOutbound: [],
    mapsUrl: `https://www.google.com/maps/dir/${AIRPORT_COORDS[airport.id].lat},${AIRPORT_COORDS[airport.id].lng}/${coord.lat},${coord.lng}`,
    dataState: 'typical',
    updatedAt: '2026-10-01',
  }
}

export function scaleModesForRoute(
  km: number,
  minutes: number,
  direction: TransferDirection,
): TransportMode[] {
  const t = Math.max(8, Math.round(minutes))
  const spread = Math.max(6, Math.round(t * 0.28))
  const time: [number, number] = [t, t + spread]
  const d = Math.max(1, km)
  return ALL_MODE_IDS.map((id) => {
    const cost: [number, number] =
      id === 'public-bus'
        ? [1, Math.max(2, Math.round(d * 0.08))]
        : id === 'car-taxi'
          ? [Math.max(5, Math.round(d * 0.35)), Math.max(10, Math.round(d * 0.7))]
          : [Math.max(18, Math.round(d * 0.7)), Math.max(28, Math.round(d * 1.3))]
    const modeTime: [number, number] = id === 'public-bus' ? [time[0] + 12, time[1] + 22] : time
    return buildMode(id, { timeMin: modeTime, costUsd: cost }, direction)
  })
}
