import { haversineKm } from '../maps/project'
import type { MapClickResolution } from '../maps/cityGeography'
import { getMode } from './modes'
import { getPlace } from './places'
import type { LuggageLevel, PlaceId, TransportMode, UrbanModeId } from './types'
import { pointsForCity, type UrbanPoint } from './urbanPoints'

export type UrbanDataQuality = 'live' | 'scheduled' | 'typical' | 'estimated' | 'unknown'

export type UrbanRouteScale = 'very-short' | 'short' | 'medium' | 'long'

export type UrbanZoneKind =
  | 'historic-core'
  | 'tourist-core'
  | 'waterfront'
  | 'beachfront'
  | 'commercial'
  | 'residential'
  | 'airport-corridor'
  | 'outskirts'
  | 'general'

export type UrbanSelection = {
  id: string
  lat: number
  lng: number
  cityId: PlaceId
  label: string
  area: string
  districtId: string | null
  districtName: string | null
  nearestAreaId: string | null
  nearPlace: { id: string; label: string; km: number } | null
  nearWater: { id: string; name: string; km: number } | null
  kind: 'landmark' | 'freeform' | 'bag'
}

export type UrbanTravellerContext = {
  partySize: number
  luggage: LuggageLevel
  accessibility: boolean
  /** Trip intent when known — defaults to mixed logistics/experience */
  intent?: 'sightseeing' | 'logistics' | 'mixed'
}

export type UrbanModeOption = {
  id: string
  modeId: UrbanModeId | string
  mode: TransportMode
  status: UrbanDataQuality
  typicalDurationLabel: string
  typicalCostLabel: string
  typicalMinutes: [number, number]
  typicalCostUsd: [number, number] | null
  trafficNote: string
  why: string
  practical: boolean
  complexity: number
  scrollTargetId: string
  /** Internal score — not shown in UI */
  score?: number
  suitability?: 'recommended' | 'practical' | 'optional' | 'not-ideal'
  experienceValue?: number
  confidence?: 'verified' | 'curated' | 'estimated'
  /** City-specific local experience (e.g. cyclo) — no dedicated mode section */
  localExperience?: boolean
}

export type UrbanRecommendation = {
  id: string
  label: string
  symbol: string
  optionId: string
  note: string
}

export type UrbanJourneyResult = {
  origin: UrbanSelection
  destination: UrbanSelection
  distanceKm: number
  scale: UrbanRouteScale
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'late-night'
  timeOfDayLabel: string
  options: UrbanModeOption[]
  recommendations: UrbanRecommendation[]
  insight: string
  googleMapsUrl: string
  originZone?: UrbanZoneKind
  destinationZone?: UrbanZoneKind
  /** True when road geometry was unavailable and ranking used straight-line distance. */
  routeEstimated?: boolean
}

export type UrbanRouteMetrics = {
  roadKm?: number
  footKm?: number
  footMinutes?: number
  drivingMinutes?: number
  estimated?: boolean
}

type DistanceThresholds = {
  veryShort: number
  short: number
  medium: number
}

type CityTransportProfile = {
  cityId: PlaceId
  character: string
  thresholds: DistanceThresholds
  walkBias: number
  bicycleBias: number
  scooterBias: number
  taxiBias: number
  transitBias: number
  driverBias: number
  /** 0–1 how walkable tourist cores feel */
  walkableCore: number
  /** Scooter rental prevalence / practicality */
  scooterCulture: number
  bicycleCulture: number
  taxiCulture: number
  transitCulture: number
  traffic: 'low' | 'moderate' | 'high'
  rushHourFactor: number
  /** Prefer experience over speed for short core hops */
  experiencePriority: number
  nightTransit: 'limited' | 'reduced' | 'typical'
  notes: string
  /** Curated local experience modes — only when verified for this city */
  localModes: LocalExperienceMode[]
}

type LocalExperienceMode = {
  id: string
  label: string
  symbol: string
  /** Prefer these zone kinds at origin/destination */
  zoneAffinity: UrbanZoneKind[]
  maxKm: number
  confidence: 'verified' | 'curated' | 'estimated'
  reasonTemplate: string
}

const DEFAULT_THRESHOLDS: DistanceThresholds = {
  veryShort: 1.1,
  short: 3.2,
  medium: 7.5,
}

const CITY_TRANSPORT: Partial<Record<PlaceId, CityTransportProfile>> = {
  hanoi: {
    cityId: 'hanoi',
    character: 'Compact historic cores with dense traffic beyond them',
    thresholds: { veryShort: 1.6, short: 3.2, medium: 7.0 },
    walkBias: 1.2,
    bicycleBias: 0.75,
    scooterBias: 1.05,
    taxiBias: 1.05,
    transitBias: 1.0,
    driverBias: 1.0,
    walkableCore: 0.92,
    scooterCulture: 0.85,
    bicycleCulture: 0.45,
    taxiCulture: 0.95,
    transitCulture: 0.75,
    traffic: 'high',
    rushHourFactor: 1.4,
    experiencePriority: 0.85,
    nightTransit: 'reduced',
    notes: 'Walking shines in Old Quarter / French Quarter hops; vehicles for longer crossings.',
    localModes: [
      {
        id: 'cyclo',
        label: 'Cyclo / pedicab',
        symbol: '🛺',
        zoneAffinity: ['historic-core', 'tourist-core'],
        maxKm: 2.2,
        confidence: 'curated',
        reasonTemplate:
          'Local sightseeing option in the historic core — better as an experience than as normal city transport.',
      },
    ],
  },
  hcmc: {
    cityId: 'hcmc',
    character: 'Large, traffic-heavy metropolis — ride-hail dominates longer hops',
    thresholds: { veryShort: 0.9, short: 2.8, medium: 8.0 },
    walkBias: 0.85,
    bicycleBias: 0.55,
    scooterBias: 1.1,
    taxiBias: 1.15,
    transitBias: 0.95,
    driverBias: 1.05,
    walkableCore: 0.7,
    scooterCulture: 0.9,
    bicycleCulture: 0.35,
    taxiCulture: 1.0,
    transitCulture: 0.8,
    traffic: 'high',
    rushHourFactor: 1.45,
    experiencePriority: 0.55,
    nightTransit: 'reduced',
    notes: 'District crossings favour ride-hail; walking only for short core hops.',
    localModes: [],
  },
  'da-nang': {
    cityId: 'da-nang',
    character: 'Spacious coastal city — taxi and scooter for urban distances',
    thresholds: { veryShort: 1.2, short: 3.5, medium: 8.5 },
    walkBias: 1.0,
    bicycleBias: 0.95,
    scooterBias: 1.15,
    taxiBias: 1.1,
    transitBias: 0.7,
    driverBias: 1.0,
    walkableCore: 0.75,
    scooterCulture: 0.9,
    bicycleCulture: 0.7,
    taxiCulture: 0.95,
    transitCulture: 0.55,
    traffic: 'moderate',
    rushHourFactor: 1.2,
    experiencePriority: 0.65,
    nightTransit: 'limited',
    notes: 'Beach/centre hops: taxi or scooter; short waterfront walks remain pleasant.',
    localModes: [],
  },
  'hoi-an': {
    cityId: 'hoi-an',
    character: 'Pedestrian Old Town with bicycle/scooter for beyond-town trips',
    thresholds: { veryShort: 1.5, short: 4.0, medium: 9.0 },
    walkBias: 1.45,
    bicycleBias: 1.35,
    scooterBias: 1.2,
    taxiBias: 0.85,
    transitBias: 0.35,
    driverBias: 0.9,
    walkableCore: 0.98,
    scooterCulture: 0.95,
    bicycleCulture: 0.95,
    taxiCulture: 0.75,
    transitCulture: 0.25,
    traffic: 'low',
    rushHourFactor: 1.08,
    experiencePriority: 0.95,
    nightTransit: 'limited',
    notes: 'Old Town is walk-first; beach/countryside legs favour bike or scooter.',
    localModes: [],
  },
  hue: {
    cityId: 'hue',
    character: 'Spread citadel and riverside — walk short, vehicle for wider hops',
    thresholds: { veryShort: 1.15, short: 3.5, medium: 8.0 },
    walkBias: 1.1,
    bicycleBias: 1.1,
    scooterBias: 1.1,
    taxiBias: 1.0,
    transitBias: 0.65,
    driverBias: 1.0,
    walkableCore: 0.8,
    scooterCulture: 0.85,
    bicycleCulture: 0.8,
    taxiCulture: 0.85,
    transitCulture: 0.5,
    traffic: 'moderate',
    rushHourFactor: 1.15,
    experiencePriority: 0.75,
    nightTransit: 'limited',
    notes: 'Citadel/riverside short hops walk well; tombs and outskirts need vehicles.',
    localModes: [
      {
        id: 'cyclo',
        label: 'Cyclo / pedicab',
        symbol: '🛺',
        zoneAffinity: ['historic-core', 'tourist-core'],
        maxKm: 2.0,
        confidence: 'curated',
        reasonTemplate:
          'Local sightseeing option near the citadel / tourist core — not for longer city hops.',
      },
    ],
  },
  'ninh-binh': {
    cityId: 'ninh-binh',
    character: 'Scenic countryside hops — scooter/taxi over transit',
    thresholds: { veryShort: 1.0, short: 3.5, medium: 10.0 },
    walkBias: 0.8,
    bicycleBias: 0.9,
    scooterBias: 1.25,
    taxiBias: 1.1,
    transitBias: 0.3,
    driverBias: 1.15,
    walkableCore: 0.55,
    scooterCulture: 0.95,
    bicycleCulture: 0.7,
    taxiCulture: 0.85,
    transitCulture: 0.2,
    traffic: 'low',
    rushHourFactor: 1.05,
    experiencePriority: 0.7,
    nightTransit: 'limited',
    notes: 'Tam Coc / Trang An style distances suit scooter or private car.',
    localModes: [],
  },
  'nha-trang': {
    cityId: 'nha-trang',
    character: 'Beach promenade walks; scooter/taxi for north–south hops',
    thresholds: { veryShort: 1.2, short: 3.5, medium: 8.0 },
    walkBias: 1.1,
    bicycleBias: 0.95,
    scooterBias: 1.15,
    taxiBias: 1.0,
    transitBias: 0.6,
    driverBias: 1.0,
    walkableCore: 0.85,
    scooterCulture: 0.9,
    bicycleCulture: 0.7,
    taxiCulture: 0.9,
    transitCulture: 0.45,
    traffic: 'moderate',
    rushHourFactor: 1.15,
    experiencePriority: 0.75,
    nightTransit: 'limited',
    notes: 'Promenade is walkable; longer coastal hops favour scooter or taxi.',
    localModes: [],
  },
  dalat: {
    cityId: 'dalat',
    character: 'Hilly centre — short walks, taxi/scooter for climbs and outskirts',
    thresholds: { veryShort: 1.0, short: 3.0, medium: 7.5 },
    walkBias: 0.95,
    bicycleBias: 0.7,
    scooterBias: 1.05,
    taxiBias: 1.1,
    transitBias: 0.4,
    driverBias: 1.05,
    walkableCore: 0.75,
    scooterCulture: 0.8,
    bicycleCulture: 0.55,
    taxiCulture: 0.9,
    transitCulture: 0.3,
    traffic: 'moderate',
    rushHourFactor: 1.12,
    experiencePriority: 0.7,
    nightTransit: 'limited',
    notes: 'Hills reduce long walks; taxi is often the least-friction choice.',
    localModes: [],
  },
}

const DEFAULT_CITY: CityTransportProfile = {
  cityId: 'hanoi',
  character: 'Mixed urban transport',
  thresholds: DEFAULT_THRESHOLDS,
  walkBias: 1,
  bicycleBias: 0.9,
  scooterBias: 1.05,
  taxiBias: 1,
  transitBias: 0.8,
  driverBias: 1,
  walkableCore: 0.7,
  scooterCulture: 0.8,
  bicycleCulture: 0.6,
  taxiCulture: 0.9,
  transitCulture: 0.6,
  traffic: 'moderate',
  rushHourFactor: 1.2,
  experiencePriority: 0.65,
  nightTransit: 'reduced',
  notes: '',
  localModes: [],
}

const DEFAULT_TRAVELLER: UrbanTravellerContext = {
  partySize: 2,
  luggage: 'light',
  accessibility: false,
  intent: 'mixed',
}

function getCityProfile(cityId: PlaceId): CityTransportProfile {
  return CITY_TRANSPORT[cityId] ?? { ...DEFAULT_CITY, cityId }
}

function classifyScale(km: number, t: DistanceThresholds): UrbanRouteScale {
  if (km < t.veryShort) return 'very-short'
  if (km < t.short) return 'short'
  if (km < t.medium) return 'medium'
  return 'long'
}

function timeOfDayBucket(d = new Date()): UrbanJourneyResult['timeOfDay'] {
  const h = d.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'afternoon'
  if (h >= 17 && h < 22) return 'evening'
  return 'late-night'
}

function timeLabel(bucket: UrbanJourneyResult['timeOfDay']): string {
  if (bucket === 'morning') return 'Typical for morning'
  if (bucket === 'afternoon') return 'Typical for afternoon'
  if (bucket === 'evening') return 'Typical for evening / rush'
  return 'Typical for late night'
}

function minutesLabel(mins: [number, number]): string {
  const fmt = (m: number) => {
    if (m < 60) return `~${Math.round(m)} min`
    const h = Math.floor(m / 60)
    const r = Math.round(m % 60)
    return r ? `~${h}h ${r}m` : `~${h}h`
  }
  if (Math.abs(mins[0] - mins[1]) < 2) return fmt(mins[0])
  return `${fmt(mins[0])}–${fmt(mins[1]).replace(/^~/, '')}`
}

function costLabel(usd: [number, number] | null): string {
  if (!usd) return 'Varies'
  if (usd[1] <= 0.01) return 'Free'
  const mid = (usd[0] + usd[1]) / 2
  if (mid < 1.5)
    return `$${usd[0].toFixed(usd[0] < 1 ? 1 : 0)}–${usd[1].toFixed(usd[1] < 1 ? 1 : 0)}`
  return `$${Math.round(usd[0])}–${Math.round(usd[1])}`
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

/** Infer zone character from selection labels / nearby place metadata. */
export function inferZone(sel: UrbanSelection): UrbanZoneKind {
  const blob = `${sel.label} ${sel.districtName ?? ''} ${sel.area} ${sel.nearPlace?.label ?? ''} ${sel.nearWater?.name ?? ''}`.toLowerCase()
  // Beach / waterfront before generic city-name historic matches
  if (/beach|an bang|my khe|promenade|cua dai/.test(blob)) return 'beachfront'
  if (/west lake|river|waterfront|bitexco|perfume|xuan huong|lake|han river/.test(blob)) {
    return 'waterfront'
  }
  if (/airport|noi bai|corridor/.test(blob)) return 'airport-corridor'
  if (
    /old quarter|ancient town|old town|french quarter|citadel|historic|hoan kiem/.test(blob)
  ) {
    return 'historic-core'
  }
  if (/market|district 1|centre|center|ben thanh|hai chau/.test(blob)) return 'tourist-core'
  if (/suburb|outskirt|marble|tomb|valley|trang an|tam coc/.test(blob)) return 'outskirts'
  return 'general'
}

function bothInWalkableCore(a: UrbanZoneKind, b: UrbanZoneKind): boolean {
  const core = new Set(['historic-core', 'tourist-core', 'waterfront', 'beachfront'])
  return core.has(a) && core.has(b)
}

function experienceTrip(a: UrbanZoneKind, b: UrbanZoneKind, intent: UrbanTravellerContext['intent']) {
  if (intent === 'sightseeing') return true
  if (intent === 'logistics') return false
  return bothInWalkableCore(a, b)
}

type ScoredMode = {
  modeId: UrbanModeId
  mins: [number, number]
  cost: [number, number] | null
  trafficNote: string
  why: string
  practical: boolean
  complexity: number
  score: number
  suitability: UrbanModeOption['suitability']
  experienceValue: number
  confidence: 'curated' | 'estimated'
}

function estimateDurations(
  modeId: UrbanModeId,
  km: number,
  city: CityTransportProfile,
  tod: UrbanJourneyResult['timeOfDay'],
  extras?: { walkKm?: number; footMinutes?: number },
): { mins: [number, number]; cost: [number, number] | null; trafficNote: string } {
  const rush =
    tod === 'evening' ||
    (tod === 'morning' && (city.traffic === 'high' || city.cityId === 'hanoi' || city.cityId === 'hcmc'))
  const late = tod === 'late-night'
  const rushMul = rush ? city.rushHourFactor : 1
  const trafficTag =
    city.traffic === 'high'
      ? rush
        ? 'Traffic-sensitive · rush uncertainty'
        : 'Traffic-sensitive'
      : city.traffic === 'moderate'
        ? 'Moderately traffic-sensitive'
        : 'Usually light traffic'

  if (modeId === 'walking') {
    const foot = extras?.footMinutes
    if (foot && foot > 0) {
      return {
        mins: [clamp(foot * 0.9, 4, 240), clamp(foot * 1.2, 6, 300)],
        cost: [0, 0],
        trafficNote: 'Traffic-independent',
      }
    }
    const walkKm = extras?.walkKm ?? km
    const base = (walkKm / 4.4) * 60
    return {
      mins: [clamp(base * 0.9, 4, 240), clamp(base * 1.25, 6, 300)],
      cost: [0, 0],
      trafficNote: 'Traffic-independent',
    }
  }
  if (modeId === 'bicycle') {
    const walkKm = extras?.walkKm ?? km
    const base = (walkKm / 13) * 60
    return {
      mins: [clamp(base * 0.9, 6, 140), clamp(base * 1.3, 8, 170)],
      cost: [0, 5],
      trafficNote: 'Weather-sensitive · Typical',
    }
  }
  if (modeId === 'scooter') {
    const base = (km / 22) * 60
    const cong = rush ? 1.12 : 1
    return {
      mins: [clamp(base * 0.85 * cong, 4, 95), clamp(base * 1.3 * cong, 7, 125)],
      cost: [km < 3 ? 1 : 2, km < 6 ? 8 : 14],
      trafficNote: 'Often less affected by congestion · Typical',
    }
  }
  if (modeId === 'car-taxi') {
    const base = (km / 17) * 60 + 3
    return {
      mins: [clamp(base * 0.9 * rushMul, 5, 110), clamp(base * 1.45 * rushMul, 8, 150)],
      cost: [clamp(1.5 + km * 0.55, 2, 10), clamp(3 + km * 1.15, 4, 28)],
      trafficNote: `${trafficTag} · Typical`,
    }
  }
  if (modeId === 'public-transit') {
    const base = (km / 12) * 60 + 10
    const lateMul = late && city.nightTransit !== 'typical' ? 1.35 : 1
    return {
      mins: [clamp(base * 0.95 * lateMul, 14, 130), clamp(base * 1.55 * lateMul, 20, 170)],
      cost: [0.3, 1.4],
      trafficNote:
        late && city.nightTransit === 'limited'
          ? 'Typical · limited late-night service'
          : 'Typical corridor times',
    }
  }
  // urban-driver
  const base = (km / 17) * 60 + 6
  return {
    mins: [clamp(base * 0.95 * rushMul, 8, 120), clamp(base * 1.4 * rushMul, 12, 160)],
    cost: [clamp(10 + km * 1.3, 12, 40), clamp(18 + km * 2.2, 22, 70)],
    trafficNote: `${trafficTag} · Typical`,
  }
}

function scoreMode(
  modeId: UrbanModeId,
  ctx: {
    km: number
    scale: UrbanRouteScale
    walkKm: number
    walkScale: UrbanRouteScale
    footMinutes?: number
    city: CityTransportProfile
    tod: UrbanJourneyResult['timeOfDay']
    originZone: UrbanZoneKind
    destZone: UrbanZoneKind
    traveller: UrbanTravellerContext
    cityLabel: string
  },
): ScoredMode | null {
  const { km, scale, city, tod, originZone, destZone, traveller, cityLabel } = ctx
  const walkKm = ctx.walkKm
  const walkScale = ctx.walkScale
  const mode = getMode(modeId as never)
  if (!mode) return null

  const { mins, cost, trafficNote } = estimateDurations(modeId, km, city, tod, {
    walkKm,
    footMinutes: ctx.footMinutes,
  })
  const midMin = (mins[0] + mins[1]) / 2
  const midCost = cost ? (cost[0] + cost[1]) / 2 : 20
  const experiential = experienceTrip(originZone, destZone, traveller.intent)
  const walkablePair = bothInWalkableCore(originZone, destZone)
  const late = tod === 'late-night'
  const rush = tod === 'evening' || tod === 'morning'
  const heavyBag = traveller.luggage === 'heavy'
  const mediumBag = traveller.luggage === 'medium'
  const group = traveller.partySize >= 3
  const largeGroup = traveller.partySize >= 5
  const access = traveller.accessibility

  let score = 40
  let practical = true
  let complexity = 2
  let experienceValue = 0.3
  let suitability: UrbanModeOption['suitability'] = 'practical'
  let why = ''

  // ——— Walking ———
  if (modeId === 'walking') {
    experienceValue = 0.85 * city.walkableCore
    complexity = 1
    score += city.walkBias * 18
    score += (city.thresholds.veryShort - walkKm) * 12
    if (walkScale === 'very-short') {
      score += 28 + city.experiencePriority * 20
      if (walkablePair) score += 16
      suitability = 'recommended'
      why = experiential
        ? `Short enough to walk, and the route lets you experience this part of ${cityLabel} rather than arranging another ride.`
        : `Easy walking distance (~${walkKm.toFixed(1)} km) with no traffic dependency.`
    } else if (walkScale === 'short' && walkablePair && city.walkableCore > 0.75) {
      if (walkKm > 2.4 && city.walkableCore < 0.9) {
        score += 4
        suitability = 'optional'
        why = 'Possible on foot along pleasant corridors, but most travellers prefer a vehicle at this distance.'
      } else {
        score += 18 + city.experiencePriority * 16
        suitability = experiential ? 'recommended' : 'practical'
        why = `Still walkable for many travellers in ${cityLabel}'s more compact areas.`
      }
    } else if (walkScale === 'short') {
      score += 2
      suitability = 'optional'
      why = 'Possible on foot, but most travellers prefer a vehicle for this distance.'
    } else {
      practical = walkKm < 5 && city.walkBias > 1.1
      score -= 25
      suitability = 'not-ideal'
      why = 'Not practical for most travellers at this distance.'
      if (walkScale === 'long' || walkKm > 6) practical = false
    }
    if (heavyBag) {
      score -= 35
      suitability = 'not-ideal'
      why = 'Short distance, but luggage makes walking much less comfortable.'
    }
    if (access) {
      score -= 40
      practical = false
      suitability = 'not-ideal'
      why = 'Not suitable when accessibility needs require a vehicle.'
    }
    if (tod === 'evening' && walkablePair) score += 6
    if (late && !walkablePair) score -= 8
  }

  // ——— Bicycle ———
  else if (modeId === 'bicycle') {
    experienceValue = 0.75 * city.bicycleCulture
    score += city.bicycleBias * 16 + city.bicycleCulture * 20
    if (city.bicycleCulture < 0.5) {
      score -= 15
      suitability = 'optional'
    }
    if (walkScale === 'very-short' && walkablePair && city.walkableCore > 0.85) {
      score -= 18
      suitability = 'optional'
      why = `Walking usually beats cycling for this very short ${cityLabel} hop.`
    } else if ((walkScale === 'short' || walkScale === 'medium') && walkKm >= 1.5 && walkKm <= 8) {
      score += 18
      suitability = city.bicycleCulture > 0.75 ? 'recommended' : 'practical'
      why =
        city.cityId === 'hoi-an'
          ? 'Enjoyable distance for a slower ride between town and nearby areas.'
          : `Pleasant paced option for this distance in ${cityLabel}.`
    } else if (walkScale === 'long' || walkKm > 10) {
      practical = false
      score -= 30
      suitability = 'not-ideal'
      why = 'Too far for most travellers by bicycle.'
    } else {
      why = 'Useful when you want flexibility without an engine.'
    }
    if (heavyBag || access) {
      practical = false
      score -= 40
      suitability = 'not-ideal'
      why = 'Not suitable with heavy luggage or accessibility needs.'
    }
    if (largeGroup) score -= 10
    if (city.cityId === 'dalat') score -= 8 // hills
  }

  // ——— Scooter ———
  else if (modeId === 'scooter') {
    experienceValue = 0.55 * city.scooterCulture
    complexity = 3
    score += city.scooterBias * 14 + city.scooterCulture * 18
    if (access || heavyBag) {
      practical = !access
      score -= access ? 50 : 22
      suitability = access ? 'not-ideal' : 'optional'
      why = access
        ? 'Not suitable when accessibility is required.'
        : 'Possible, but luggage makes scooter rental less comfortable.'
    } else if (scale === 'very-short' && walkablePair && city.experiencePriority > 0.75) {
      score -= 20
      suitability = 'optional'
      why = 'Overkill for this short, walkable stretch — better as a backup than a first choice.'
    } else if (scale === 'short' || scale === 'medium') {
      score += 16
      if (city.cityId === 'hoi-an' && (destZone === 'beachfront' || originZone === 'beachfront')) {
        score += 14
        suitability = 'recommended'
        why = 'Convenient for moving between the compact Old Town and nearby beach areas.'
      } else if (city.scooterCulture > 0.85 && traveller.partySize <= 2) {
        suitability = 'recommended'
        why = 'Quick door-to-door if you are an experienced rider — often less stuck than cars.'
      } else {
        suitability = 'practical'
        why = 'Best suited to experienced riders for this kind of urban hop.'
      }
    } else if (scale === 'long') {
      score += 8
      suitability = 'practical'
      why = 'Viable for longer urban stretches if you are comfortable riding in local traffic.'
    }
    if (largeGroup) {
      score -= 25
      suitability = 'not-ideal'
      why = 'Impractical for larger groups — prefer a car.'
    }
    if (rush && city.traffic === 'high') score += 6 // relative to taxi
  }

  // ——— Taxi / ride-hail ———
  else if (modeId === 'car-taxi') {
    experienceValue = 0.25
    complexity = 2
    score += city.taxiBias * 14 + city.taxiCulture * 16
    if (access) score += 28
    if (heavyBag) score += 26
    if (mediumBag) score += 10
    if (group) score += 12
    if (largeGroup) score += 8
    if (scale === 'very-short' && walkablePair && !heavyBag && !access && city.experiencePriority > 0.7) {
      score -= 28
      suitability = 'optional'
      why = 'Available, but walking usually gives a better experience for this short hop.'
    } else if (scale === 'short' && walkablePair && !heavyBag && !access && city.experiencePriority > 0.85) {
      score -= 12
      suitability = 'optional'
      why = 'Fine for convenience, but not the most rewarding way to cover this short historic stretch.'
    } else if (scale === 'very-short' && (heavyBag || access)) {
      score += 20
      suitability = 'recommended'
      why = 'Short distance, but luggage or access needs make a direct vehicle much easier.'
    } else if (scale === 'medium' || scale === 'long') {
      score += 22
      suitability = 'recommended'
      why =
        traveller.partySize >= 2
          ? `Direct for this distance and practical with ${traveller.partySize} travellers.`
          : `Direct and practical for this ${cityLabel} crossing.`
    } else if (scale === 'short') {
      score += 10
      suitability = heavyBag || access ? 'recommended' : 'practical'
      why = heavyBag
        ? 'Door-to-door convenience when carrying bags.'
        : `Straightforward option for this ${km.toFixed(1)} km hop.`
    }
    if (late) {
      score += 10
      why = 'Reliable when transit is thinner late at night.'
    }
    if (rush && city.traffic === 'high') score -= 8
    if (city.cityId === 'hoi-an' && scale !== 'long' && !heavyBag && !access) {
      score -= 6 // scooter/bike culture
    }
  }

  // ——— Transit ———
  else if (modeId === 'public-transit') {
    experienceValue = 0.2
    complexity = 3
    score += city.transitBias * 12 + city.transitCulture * 18
    if (city.transitCulture < 0.45) {
      practical = scale !== 'very-short'
      score -= 20
      suitability = 'optional'
      why = `Limited public transit usefulness for this kind of trip in ${cityLabel}.`
      if (city.transitCulture < 0.3) practical = false
    } else if (scale === 'very-short') {
      practical = false
      score -= 30
      suitability = 'not-ideal'
      why = 'Not worth assembling transit for such a short hop.'
    } else if (scale === 'medium' || scale === 'long') {
      score += 14
      suitability = 'practical'
      why = 'Typically the lowest cash outlay when a workable corridor exists.'
    } else {
      why = 'Budget option if you are comfortable with local routing.'
    }
    if (late && city.nightTransit === 'limited') {
      score -= 18
      suitability = 'not-ideal'
      why = 'Late-night service is typically limited — less reliable than a taxi.'
    }
    if (heavyBag || access) {
      score -= 20
      suitability = 'optional'
    }
    if (largeGroup) score -= 8
  }

  // ——— Private urban driver ———
  else if (modeId === 'urban-driver') {
    experienceValue = 0.3
    complexity = 2
    score += city.driverBias * 12
    if (largeGroup || (group && heavyBag) || scale === 'long') {
      score += 24
      suitability = 'recommended'
      why = 'Strong when you want a private car for a group, luggage, or a multi-stop city day.'
    } else if (scale === 'medium') {
      score += 8
      suitability = 'practical'
      why = 'Useful for a private, door-to-door city transfer.'
    } else {
      score -= 10
      suitability = 'optional'
      why = 'Usually more than you need for a simple short hop.'
      if (scale === 'very-short' && !largeGroup) practical = false
    }
    if (access) score += 12
  } else {
    return null
  }

  // Soft time/cost adjustments (not dominant)
  score += clamp(40 - midMin * 0.35, -12, 18)
  score += clamp(12 - midCost * 0.4, -8, 10)

  // Intent
  if (traveller.intent === 'sightseeing' && (modeId === 'walking' || modeId === 'bicycle')) {
    score += 10
  }
  if (traveller.intent === 'logistics' && (modeId === 'car-taxi' || modeId === 'urban-driver')) {
    score += 10
  }

  score = clamp(score, 0, 140)

  if (!why) why = `Typical option for this trip in ${cityLabel}.`

  return {
    modeId,
    mins,
    cost,
    trafficNote,
    why,
    practical,
    complexity,
    score,
    suitability: suitability ?? 'practical',
    experienceValue,
    confidence: 'curated',
  }
}

function toOption(s: ScoredMode): UrbanModeOption | null {
  const mode = getMode(s.modeId as never)
  if (!mode) return null
  return {
    id: s.modeId,
    modeId: s.modeId,
    mode,
    status: 'typical',
    typicalDurationLabel: minutesLabel(s.mins),
    typicalCostLabel: costLabel(s.cost),
    typicalMinutes: s.mins,
    typicalCostUsd: s.cost,
    trafficNote: s.trafficNote,
    why: s.why,
    practical: s.practical,
    complexity: s.complexity,
    scrollTargetId: `mode-urban-${s.modeId}`,
    score: s.score,
    suitability: s.suitability,
    experienceValue: s.experienceValue,
    confidence: s.confidence,
  }
}

function buildLocalExperienceOption(
  local: LocalExperienceMode,
  km: number,
  originZone: UrbanZoneKind,
  destZone: UrbanZoneKind,
  traveller: UrbanTravellerContext,
): UrbanModeOption | null {
  if (local.confidence === 'estimated') return null
  if (km > local.maxKm) return null
  if (traveller.accessibility || traveller.luggage === 'heavy') return null
  if (traveller.partySize >= 4) return null

  const zoneHit =
    local.zoneAffinity.includes(originZone) || local.zoneAffinity.includes(destZone)
  if (!zoneHit) return null

  const base = (km / 6) * 60
  const mins: [number, number] = [
    clamp(base * 0.9, 8, 45),
    clamp(base * 1.35, 12, 55),
  ]
  const cost: [number, number] = [3, 12]

  const syntheticMode: TransportMode = {
    id: 'walking',
    world: 'urban',
    symbol: local.symbol,
    label: local.label,
    shortLabel: local.label.split(' / ')[0] ?? local.label,
    description: local.reasonTemplate,
    bestFor: ['Short sightseeing', 'Historic cores'],
    whyChoose: ['Local experience'],
    tradeoff: 'Not for normal long-distance city travel.',
    vehicleTimeLabel: minutesLabel(mins),
    doorToDoorLabel: minutesLabel(mins),
    costLabel: costLabel(cost),
    costUsd: cost,
    vehicleMinutes: mins,
    doorToDoorMinutes: mins,
    transfers: '0',
    luggageLabel: 'Not ideal',
    comfortLabel: 'Tourist pace',
    bookingNote: 'Street hail / hotel desk · CURATED',
    operatingWindow: 'Daytime / early evening typical',
    journey: [
      { icon: '📍', label: 'Origin' },
      { icon: local.symbol, label: local.label },
      { icon: '📍', label: 'Destination' },
    ],
    waterKind: null,
    trafficSensitivity: 'Low',
    image: '',
  }

  return {
    id: `local-${local.id}`,
    modeId: `local-${local.id}`,
    mode: syntheticMode,
    status: 'typical',
    typicalDurationLabel: minutesLabel(mins),
    typicalCostLabel: costLabel(cost),
    typicalMinutes: mins,
    typicalCostUsd: cost,
    trafficNote: 'Local experience · Typical',
    why: local.reasonTemplate,
    practical: true,
    complexity: 2,
    scrollTargetId: '',
    score: 58 + (zoneHit ? 12 : 0) + (km < 1.2 ? 8 : 0),
    suitability: 'optional',
    experienceValue: 0.9,
    confidence: local.confidence,
    localExperience: true,
  }
}

function buildRecommendations(
  options: UrbanModeOption[],
  scale: UrbanRouteScale,
  city: CityTransportProfile,
  experiential: boolean,
  traveller: UrbanTravellerContext,
): UrbanRecommendation[] {
  const usable = options.filter((o) => o.practical && (o.suitability ?? 'practical') !== 'not-ideal')
  if (!usable.length) return []

  const preferred = usable.filter((o) => (o.suitability ?? 'practical') !== 'optional')
  const costPool = preferred.length ? preferred : usable

  const byScore = [...usable].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const byTime = [...usable].sort(
    (a, b) => a.typicalMinutes[0] + a.typicalMinutes[1] - (b.typicalMinutes[0] + b.typicalMinutes[1]),
  )
  const byCost = [...costPool].sort((a, b) => {
    const ac = a.typicalCostUsd ? a.typicalCostUsd[0] + a.typicalCostUsd[1] : 99
    const bc = b.typicalCostUsd ? b.typicalCostUsd[0] + b.typicalCostUsd[1] : 99
    return ac - bc
  })

  const walk = usable.find((o) => o.modeId === 'walking')
  const taxi = usable.find((o) => o.modeId === 'car-taxi')
  const scooter = usable.find((o) => o.modeId === 'scooter')
  const bike = usable.find((o) => o.modeId === 'bicycle')
  const driver = usable.find((o) => o.modeId === 'urban-driver')

  const recs: UrbanRecommendation[] = []
  const used = new Set<string>()

  const push = (
    id: string,
    label: string,
    symbol: string,
    opt: UrbanModeOption | undefined,
    note?: string,
  ) => {
    if (!opt || used.has(opt.id) || recs.length >= 4) return
    used.add(opt.id)
    recs.push({
      id,
      label,
      symbol,
      optionId: opt.id,
      note: note ?? opt.why,
    })
  }

  // Best overall — top score, but prefer experience label on very-short walkable trips
  const top = byScore[0]
  if (
    scale === 'very-short' &&
    walk &&
    experiential &&
    city.experiencePriority > 0.7 &&
    (walk.score ?? 0) >= (top?.score ?? 0) - 8
  ) {
    push('best-experience', 'Best experience', '🌿', walk)
  } else if (top) {
    const label =
      top.modeId === 'walking' && experiential
        ? 'Best experience'
        : top.modeId === 'scooter' && city.scooterCulture > 0.85
          ? 'Best overall'
          : 'Best overall'
    const symbol = label === 'Best experience' ? '🌿' : '⭐'
    push(
      label === 'Best experience' ? 'best-experience' : 'best-overall',
      label,
      symbol,
      top,
    )
  }

  // Fastest — only if different and meaningfully vehicle/time oriented
  if (byTime[0] && !used.has(byTime[0].id)) {
    push('fastest', 'Fastest', '⚡', byTime[0], 'Shortest typical door-to-door time for this hop.')
  }

  // Experience alternative (bike in Hoi An style cities)
  if (
    bike &&
    !used.has(bike.id) &&
    city.bicycleCulture > 0.75 &&
    (scale === 'short' || scale === 'medium') &&
    experiential
  ) {
    push('best-experience-bike', 'Best experience', '🌿', bike)
  }

  // Lowest cost
  if (byCost[0] && !used.has(byCost[0].id)) {
    push('lowest-cost', 'Lowest cost', '💰', byCost[0], 'Typically the cheapest practical option.')
  }

  // Luggage / group / accessibility specific
  if (traveller.accessibility && taxi && !used.has(taxi.id)) {
    push('best-access', 'Best accessibility', '♿', taxi, taxi.why)
  } else if (
    (traveller.luggage === 'heavy' || traveller.partySize >= 3) &&
    taxi &&
    !used.has(taxi.id)
  ) {
    push(
      'best-luggage',
      traveller.partySize >= 3 ? 'Best for groups' : 'Best with luggage',
      traveller.partySize >= 3 ? '👥' : '🧳',
      taxi,
    )
  } else if (driver && traveller.partySize >= 5 && !used.has(driver.id)) {
    push('best-groups', 'Best for groups', '👥', driver)
  }

  // Scooter as experienced-rider pick when not already featured
  if (scooter && !used.has(scooter.id) && scale !== 'very-short' && city.scooterCulture > 0.8) {
    push(
      'best-riders',
      'Best for experienced riders',
      '🛵',
      scooter,
      'Best suited to experienced riders for this trip.',
    )
  }

  // Local experience (cyclo etc.) — only when already in usable options
  const localExp = usable.find((o) => o.localExperience)
  if (localExp && !used.has(localExp.id) && (scale === 'very-short' || scale === 'short')) {
    push('local-experience', 'Local experience', '🌿', localExp)
  }

  // Experience walk if not overall
  if (walk && !used.has(walk.id) && scale === 'very-short') {
    push('best-walking', 'Best experience', '🌿', walk)
  }

  return recs.slice(0, 4)
}

function buildInsight(
  scale: UrbanRouteScale,
  km: number,
  city: CityTransportProfile,
  originZone: UrbanZoneKind,
  destZone: UrbanZoneKind,
  top: UrbanModeOption | undefined,
  cityLabel: string,
): string {
  const topLabel = top ? `${top.mode.symbol} ${top.mode.shortLabel}` : 'a practical mode'
  if (scale === 'very-short' && bothInWalkableCore(originZone, destZone)) {
    return `${cityLabel}: ~${km.toFixed(1)} km in a compact area. ${top?.modeId === 'walking' ? 'Walking is usually the better experience here.' : `Most travellers still lean on ${topLabel} depending on luggage and comfort.`}`
  }
  if (scale === 'short' && city.cityId === 'hoi-an') {
    return `Hoi An makes this ~${km.toFixed(1)} km hop especially suited to walking, bicycle, or scooter — taxis are fine for convenience, not always necessary.`
  }
  if (scale === 'medium' || scale === 'long') {
    return `Around ${km.toFixed(1)} km across ${cityLabel}. ${city.notes || `Treat this as a real urban transfer — ${topLabel} leads for most travellers.`}`
  }
  return city.notes || `About ${km.toFixed(1)} km — recommendations reflect how ${cityLabel} actually moves.`
}

export function resolveUrbanJourney(
  origin: UrbanSelection,
  destination: UrbanSelection,
  availableModeIds: UrbanModeId[],
  traveller: UrbanTravellerContext = DEFAULT_TRAVELLER,
  route?: UrbanRouteMetrics,
): UrbanJourneyResult {
  const city = getCityProfile(origin.cityId)
  const cityLabel = getPlace(origin.cityId)?.label ?? origin.area
  const haversine = haversineKm(origin, destination)
  const distanceKm = route?.roadKm ?? route?.footKm ?? haversine
  const walkKm = route?.footKm ?? distanceKm
  const scale = classifyScale(distanceKm, city.thresholds)
  const walkScale = classifyScale(walkKm, city.thresholds)
  const tod = timeOfDayBucket()
  const originZone = inferZone(origin)
  const destZone = inferZone(destination)
  const experiential = experienceTrip(originZone, destZone, traveller.intent)

  const scored = availableModeIds
    .map((id) =>
      scoreMode(id, {
        km: distanceKm,
        scale,
        walkKm,
        walkScale,
        footMinutes: route?.footMinutes,
        city,
        tod,
        originZone,
        destZone,
        traveller,
        cityLabel,
      }),
    )
    .filter(Boolean) as ScoredMode[]

  const options = scored
    .map(toOption)
    .filter(Boolean) as UrbanModeOption[]

  const localOptions = city.localModes
    .map((lm) => buildLocalExperienceOption(lm, distanceKm, originZone, destZone, traveller))
    .filter(Boolean) as UrbanModeOption[]

  const allOptions = [...options, ...localOptions]

  const practical = allOptions
    .filter((o) => o.practical)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const walkNote =
    scale === 'long' || scale === 'medium'
      ? allOptions.filter((o) => o.modeId === 'walking' && !o.practical).slice(0, 1)
      : []
  // Keep standard modes first in “How you can travel”; local experience after practical vehicles
  const standard = practical.filter((o) => !o.localExperience)
  const locals = practical.filter((o) => o.localExperience)
  const ordered = [...standard, ...locals, ...walkNote]
  const recommendations = buildRecommendations(
    ordered,
    walkScale === 'very-short' ? walkScale : scale,
    city,
    experiential,
    traveller,
  )
  const top =
    ordered.find((o) => o.id === recommendations[0]?.optionId) ?? ordered[0]

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${origin.lat},${origin.lng}`,
  )}&destination=${encodeURIComponent(`${destination.lat},${destination.lng}`)}`

  return {
    origin,
    destination,
    distanceKm,
    scale,
    timeOfDay: tod,
    timeOfDayLabel: timeLabel(tod),
    options: ordered,
    recommendations,
    insight: buildInsight(scale, distanceKm, city, originZone, destZone, top, cityLabel),
    googleMapsUrl,
    originZone,
    destinationZone: destZone,
    routeEstimated: route?.estimated ?? !route?.roadKm,
  }
}

export function selectionFromResolution(
  res: Extract<MapClickResolution, { ok: true }>,
): UrbanSelection {
  return {
    id: res.landmarkId ?? `freeform-${res.lat.toFixed(5)}-${res.lng.toFixed(5)}`,
    lat: res.lat,
    lng: res.lng,
    cityId: res.cityId,
    label: res.label,
    area: res.areaLine,
    districtId: res.districtId,
    districtName: res.districtName,
    nearestAreaId: res.landmarkId ?? res.nearPlace?.id ?? null,
    nearPlace: res.nearPlace,
    nearWater: res.nearWater,
    kind: res.kind,
  }
}

/** @deprecated Prefer resolveMapClick + selectionFromResolution */
export function labelSelection(
  cityId: PlaceId,
  cityLabel: string,
  lat: number,
  lng: number,
  landmarkHitKm = 0.22,
): UrbanSelection {
  const points = pointsForCity(cityId)
  let nearest: UrbanPoint | null = null
  let bestKm = Infinity
  for (const p of points) {
    const km = haversineKm({ lat, lng }, p)
    if (km < bestKm) {
      bestKm = km
      nearest = p
    }
  }

  if (nearest && bestKm <= landmarkHitKm) {
    return {
      id: nearest.id,
      lat: nearest.lat,
      lng: nearest.lng,
      cityId,
      label: nearest.label,
      area: cityLabel,
      districtId: null,
      districtName: nearest.area ?? null,
      nearestAreaId: nearest.id,
      nearPlace: null,
      nearWater: null,
      kind: 'landmark',
    }
  }

  return {
    id: `freeform-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    lat,
    lng,
    cityId,
    label: 'Selected location',
    area: `Within supported ${cityLabel}`,
    districtId: null,
    districtName: null,
    nearestAreaId: nearest && bestKm <= 1.5 ? nearest.id : null,
    nearPlace:
      nearest && bestKm <= 1.5
        ? { id: nearest.id, label: nearest.label, km: bestKm }
        : null,
    nearWater: null,
    kind: 'freeform',
  }
}

export function selectionFromLandmark(point: UrbanPoint): UrbanSelection {
  const cityLabel = getPlace(point.cityId)?.label ?? point.area
  return {
    id: point.id,
    lat: point.lat,
    lng: point.lng,
    cityId: point.cityId,
    label: point.label,
    area: cityLabel,
    districtId: null,
    districtName: point.district ?? point.area ?? null,
    nearestAreaId: point.id,
    nearPlace: null,
    nearWater: null,
    kind: 'landmark',
  }
}

export function selectionFromBagPin(
  pin: { id: string; label: string; lat: number; lng: number },
  cityId: PlaceId,
  cityLabel: string,
): UrbanSelection {
  return {
    id: pin.id,
    lat: pin.lat,
    lng: pin.lng,
    cityId,
    label: pin.label,
    area: cityLabel,
    districtId: null,
    districtName: null,
    nearestAreaId: null,
    nearPlace: null,
    nearWater: null,
    kind: 'bag',
  }
}

export function selectionFromTypedPlace(
  label: string,
  lat: number,
  lng: number,
  cityId: PlaceId,
  cityLabel: string,
): UrbanSelection {
  return {
    id: `typed-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    lat,
    lng,
    cityId,
    label,
    area: cityLabel,
    districtId: null,
    districtName: null,
    nearestAreaId: null,
    nearPlace: null,
    nearWater: null,
    kind: 'freeform',
  }
}
