import type {
  ClusterLiving,
  ClusterMapColor,
  CrowdLevel,
  ProximityLevel,
  SafetyFeel,
  StayCluster,
} from './types'

const PALETTE: ClusterMapColor[] = [
  {
    fill: 'rgba(196,92,58,0.22)',
    fillSelected: 'rgba(196,92,58,0.42)',
    stroke: '#C45C3E',
    label: 'Terracotta',
  },
  {
    fill: 'rgba(92,122,110,0.28)',
    fillSelected: 'rgba(92,122,110,0.48)',
    stroke: '#5C7A6E',
    label: 'Sage',
  },
  {
    fill: 'rgba(74,122,168,0.26)',
    fillSelected: 'rgba(74,122,168,0.46)',
    stroke: '#4A7AA8',
    label: 'Blue',
  },
  {
    fill: 'rgba(168,122,74,0.28)',
    fillSelected: 'rgba(168,122,74,0.48)',
    stroke: '#A87A4A',
    label: 'Amber',
  },
  {
    fill: 'rgba(122,92,148,0.26)',
    fillSelected: 'rgba(122,92,148,0.46)',
    stroke: '#7A5C94',
    label: 'Plum',
  },
  {
    fill: 'rgba(58,120,130,0.28)',
    fillSelected: 'rgba(58,120,130,0.48)',
    stroke: '#3A7882',
    label: 'Teal',
  },
]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/** Hoi An stay-zone colours matched to the curated neighbourhood map reference. */
const HOI_AN_COLORS: Record<string, ClusterMapColor> = {
  'hoian-an-bang': {
    fill: 'rgba(30,77,140,0.35)',
    fillSelected: 'rgba(30,77,140,0.52)',
    stroke: '#1E4D8C',
    label: 'An Bang / Cua Dai',
  },
  'hoian-cam-chau': {
    fill: 'rgba(61,158,204,0.35)',
    fillSelected: 'rgba(61,158,204,0.52)',
    stroke: '#3D9ECC',
    label: 'Cam Chau',
  },
  'hoian-cam-thanh': {
    fill: 'rgba(31,92,79,0.38)',
    fillSelected: 'rgba(31,92,79,0.55)',
    stroke: '#1F5C4F',
    label: 'Cam Thanh',
  },
  'hoian-cam-pho': {
    fill: 'rgba(198,58,58,0.35)',
    fillSelected: 'rgba(198,58,58,0.52)',
    stroke: '#C63A3A',
    label: 'Cam Pho',
  },
  'hoian-ancient-town': {
    fill: 'rgba(139,46,74,0.38)',
    fillSelected: 'rgba(139,46,74,0.55)',
    stroke: '#8B2E4A',
    label: 'Old Town',
  },
  'hoian-an-hoi': {
    fill: 'rgba(168,184,58,0.40)',
    fillSelected: 'rgba(168,184,58,0.58)',
    stroke: '#8BA83A',
    label: 'An Hoi',
  },
  'hoian-cam-nam': {
    fill: 'rgba(92,64,40,0.38)',
    fillSelected: 'rgba(92,64,40,0.55)',
    stroke: '#5C4028',
    label: 'Cam Nam',
  },
}

export function colorForCluster(clusterId: string, indexInCity: number): ClusterMapColor {
  if (HOI_AN_COLORS[clusterId]) return HOI_AN_COLORS[clusterId]
  return PALETTE[(indexInCity + hashId(clusterId)) % PALETTE.length]
}

function crowdFromMetrics(c: StayCluster['metrics']): CrowdLevel {
  if (c.nightlife >= 5 || (c.locationScore >= 5 && c.quietness <= 1)) return 'busy'
  if (c.nightlife >= 4 || c.quietness <= 2) return 'lively'
  if (c.quietness >= 4) return 'calm'
  return 'moderate'
}

function safetyFromMetrics(c: StayCluster['metrics']): SafetyFeel {
  if (c.familySuitability >= 4 && c.locationScore >= 3) return 'very-comfortable'
  if (c.nightlife >= 5 && c.quietness <= 1) return 'take-care'
  return 'comfortable'
}

function proximity(
  places: StayCluster['keyPlaces'],
  keywords: string[],
): { level: ProximityLevel; note: string } {
  const hit = places.find((p) =>
    keywords.some((k) => p.label.toLowerCase().includes(k)),
  )
  if (hit) {
    if (hit.mode === 'walk' && hit.typicalMinutes <= 12) {
      return { level: 'on-foot', note: `${hit.label} · about ${hit.typicalMinutes} min walk` }
    }
    if (hit.typicalMinutes <= 15) {
      return { level: 'short-hop', note: `${hit.label} · about ${hit.typicalMinutes} min ${hit.mode}` }
    }
    return { level: 'taxi-needed', note: `${hit.label} · about ${hit.typicalMinutes} min ${hit.mode}` }
  }
  return { level: 'short-hop', note: 'Local shops usually within a short hop' }
}

export type StayClusterSeed = Omit<StayCluster, 'living' | 'mapColor'>

export function buildLiving(cluster: StayClusterSeed): ClusterLiving {
  const crowd = crowdFromMetrics(cluster.metrics)
  const touristSafety = safetyFromMetrics(cluster.metrics)
  const market = proximity(cluster.keyPlaces, ['market'])
  const food = proximity(cluster.keyPlaces, ['food', 'café', 'cafe', 'dining', 'restaurant'])
  const foodFallback =
    food.note.includes('Local shops') && cluster.bestFor.includes('food')
      ? {
          level: 'on-foot' as ProximityLevel,
          note: 'Strong street-food and café density nearby',
        }
      : food

  const safetyNote =
    touristSafety === 'very-comfortable'
      ? 'Popular with visitors; normal city awareness is enough.'
      : touristSafety === 'take-care'
        ? 'Very busy at night — use well-lit streets and hotel taxis after late outings.'
        : 'Generally fine for tourists; keep valuables secure in crowded spots.'

  const noiseNote =
    cluster.metrics.quietness <= 2
      ? 'Expect street noise — ask for a rear or upper room.'
      : cluster.metrics.quietness >= 4
        ? 'Usually calmer evenings than the tourist core.'
        : 'Mixed — some lively pockets, quieter side streets.'

  const costOfLivingNote =
    cluster.typicalNightlyRange != null
      ? `Rough stay estimate ~$${cluster.typicalNightlyRange[0]}–$${cluster.typicalNightlyRange[1]} / night · ${cluster.priceWhy}`
      : cluster.priceWhy

  const whoItSuits = [
    ...cluster.character.slice(0, 2),
    cluster.metrics.familySuitability >= 4 ? 'Family-friendly rhythm' : null,
    cluster.metrics.nightlife >= 4 ? 'Night-out energy' : null,
    cluster.metrics.quietness >= 4 ? 'Quieter nights' : null,
  ].filter(Boolean) as string[]

  return {
    crowdLevel: crowd,
    touristSafety,
    safetyNote,
    marketAccess: market.level,
    marketNote: market.note,
    foodAccess: foodFallback.level,
    foodNote: foodFallback.note,
    nightlifeFeel:
      cluster.metrics.nightlife >= 4
        ? 'Bars and late energy are part of the neighbourhood'
        : cluster.metrics.nightlife <= 2
          ? 'Quiet after dark — head elsewhere for nightlife'
          : 'A few evening spots without all-night chaos',
    noiseNote,
    costOfLivingNote,
    whoItSuits: whoItSuits.slice(0, 4),
  }
}

export function enrichCluster(cluster: StayClusterSeed, indexInCity: number): StayCluster {
  return {
    ...cluster,
    living: buildLiving(cluster),
    mapColor: colorForCluster(cluster.id, indexInCity),
  }
}
