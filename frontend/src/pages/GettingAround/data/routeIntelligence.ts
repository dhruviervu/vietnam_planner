import { getPlace } from './places'
import { getMode } from './modes'
import { haversineKm } from '../maps/project'
import type { LongModeId, PlaceId, TransportMode, TransportModeId } from './types'
import {
  findGroundLink,
  findHubConnection,
  getHub,
  getTopology,
  type GroundLink,
  type NetworkMode,
  type TransportHub,
  type VerificationStatus,
} from './transportNetwork'

export type RouteScale =
  | 'local'
  | 'regional'
  | 'inter-city'
  | 'long-distance'
  | 'island-water'

export type JourneyConnectionStatus =
  | 'direct'
  | 'one-connection'
  | 'multi-leg'
  | 'not-available'
  | 'not-applicable'
  | 'unknown'

export type JourneyLeg = {
  fromLabel: string
  toLabel: string
  mode: NetworkMode
  hubId?: string
  placeId?: PlaceId
  typicalMinutes?: [number, number]
}

export type FeasibleJourney = {
  id: string
  /** Primary mode for scrolling to detailed sections */
  modeId: TransportModeId
  mode: TransportMode
  /** UI title, e.g. "Flight" or "Ground + Ferry" */
  displayTitle: string
  status: JourneyConnectionStatus
  direct: boolean
  legs: JourneyLeg[]
  pathLabel: string
  summary: string
  why: string
  typicalDurationLabel: string
  typicalCostLabel: string
  typicalMinutes: [number, number] | null
  typicalCostUsd: [number, number] | null
  complexity: number
  verificationStatus: VerificationStatus
  /** Hubs to emphasize on the map for this journey */
  contextHubIds: string[]
  scrollTargetId: string
}

export type JourneyRecommendation = {
  id: string
  label: string
  symbol: string
  journeyId: string
  /** Journey-level name, not just mode */
  journeyTitle: string
  note: string
}

export type RouteIntelligenceResult = {
  originId: PlaceId
  destinationId: PlaceId
  originLabel: string
  destinationLabel: string
  scale: RouteScale
  geographicKm: number
  headline: string
  whatThisMeans: string[]
  journeys: FeasibleJourney[]
  recommendations: JourneyRecommendation[]
  /** Hubs relevant to the currently preferred / active view */
  contextHubIds: string[]
}

function minutesLabel(mins: [number, number] | null): string {
  if (!mins) return 'Typical time varies'
  const fmt = (m: number) => {
    if (m < 60) return `${Math.round(m)}m`
    const h = Math.floor(m / 60)
    const r = Math.round(m % 60)
    return r ? `~${h}h ${r}m` : `~${h}h`
  }
  if (mins[0] === mins[1]) return fmt(mins[0])
  return `${fmt(mins[0])}–${fmt(mins[1]).replace(/^~/, '')}`
}

function costLabel(usd: [number, number] | null): string {
  if (!usd) return 'Cost varies'
  const mid = (usd[0] + usd[1]) / 2
  if (mid < 25) return '$'
  if (mid < 60) return '$–$$'
  if (mid < 120) return '$$–$$$'
  return '$$$'
}

function addMinutes(
  a: [number, number] | null | undefined,
  b: [number, number] | null | undefined,
): [number, number] | null {
  if (!a && !b) return null
  return [(a?.[0] ?? 0) + (b?.[0] ?? 0), (a?.[1] ?? 0) + (b?.[1] ?? 0)]
}

function addCost(
  a: [number, number] | null | undefined,
  b: [number, number] | null | undefined,
): [number, number] | null {
  if (!a && !b) return null
  return [(a?.[0] ?? 0) + (b?.[0] ?? 0), (a?.[1] ?? 0) + (b?.[1] ?? 0)]
}

function classifyScale(
  km: number,
  originIsland: boolean,
  destIsland: boolean,
): RouteScale {
  if (originIsland || destIsland) return 'island-water'
  if (km < 25) return 'local'
  if (km < 120) return 'regional'
  if (km < 700) return 'inter-city'
  return 'long-distance'
}

function statusFromJourney(direct: boolean, legs: JourneyLeg[]): JourneyConnectionStatus {
  // "Direct" = board the primary mode without first traveling to another city/hub.
  if (direct) return 'direct'
  // Typical pattern: ground → hub mode → local arrival (3 legs) = one connection.
  if (legs.length <= 3) return 'one-connection'
  return 'multi-leg'
}

function connectionBadge(status: JourneyConnectionStatus): string {
  if (status === 'direct') return '🟢 Direct'
  if (status === 'one-connection') return '🟡 1 connection'
  if (status === 'multi-leg') return '🟠 Multi-leg'
  if (status === 'not-available') return '⚪ Not available'
  if (status === 'not-applicable') return '⚪ Not applicable'
  return '⚪ Unknown'
}

export { connectionBadge }

function makeUnavailable(
  modeId: TransportModeId,
  why: string,
  summary: string,
  verificationStatus: VerificationStatus = 'curated',
): FeasibleJourney | null {
  const mode = getMode(modeId as never)
  if (!mode) return null
  return {
    id: `${modeId}-unavailable`,
    modeId,
    mode,
    displayTitle: mode.shortLabel,
    status: modeId === 'train' || modeId === 'private-driver' ? 'not-applicable' : 'not-available',
    direct: false,
    legs: [],
    pathLabel: '',
    summary,
    why,
    typicalDurationLabel: '—',
    typicalCostLabel: '—',
    typicalMinutes: null,
    typicalCostUsd: null,
    complexity: 99,
    verificationStatus,
    contextHubIds: [],
    scrollTargetId:
      mode.world === 'water' ? `mode-water-${modeId}` : `mode-long-${modeId}`,
  }
}

function buildJourney(opts: {
  modeId: TransportModeId
  displayTitle?: string
  legs: JourneyLeg[]
  direct: boolean
  summary: string
  why: string
  typicalMinutes: [number, number] | null
  typicalCostUsd: [number, number] | null
  verificationStatus: VerificationStatus
  contextHubIds: string[]
  complexityBump?: number
}): FeasibleJourney | null {
  const mode = getMode(opts.modeId as never)
  if (!mode) return null
  const status = statusFromJourney(opts.direct, opts.legs)
  const pathLabel = [...opts.legs.map((l) => l.fromLabel), opts.legs.at(-1)?.toLabel]
    .filter(Boolean)
    .join(' → ')
  return {
    id: `${opts.modeId}-${status}`,
    modeId: opts.modeId,
    mode,
    displayTitle: opts.displayTitle ?? mode.shortLabel,
    status,
    direct: opts.direct,
    legs: opts.legs,
    pathLabel,
    summary: opts.summary,
    why: opts.why,
    typicalDurationLabel: minutesLabel(opts.typicalMinutes),
    typicalCostLabel: costLabel(opts.typicalCostUsd),
    typicalMinutes: opts.typicalMinutes,
    typicalCostUsd: opts.typicalCostUsd,
    complexity: opts.legs.length + (opts.complexityBump ?? 0),
    verificationStatus: opts.verificationStatus,
    contextHubIds: opts.contextHubIds,
    scrollTargetId:
      mode.world === 'water' ? `mode-water-${opts.modeId}` : `mode-long-${opts.modeId}`,
  }
}

function resolveAir(
  originId: PlaceId,
  destId: PlaceId,
): FeasibleJourney | null {
  const oTopo = getTopology(originId)
  const dTopo = getTopology(destId)
  const origin = getPlace(originId)
  const dest = getPlace(destId)
  if (!oTopo || !dTopo || !origin || !dest) return null

  const originAirportId = oTopo.primaryAirportHubId
  const destAirportId = dTopo.primaryAirportHubId
  if (!originAirportId || !destAirportId) {
    return makeUnavailable(
      'flight',
      'No practical commercial airport hub is mapped for this pair yet.',
      'Flight availability needs checking for this connection.',
      'unknown',
    )
  }

  const originAirport = getHub(originAirportId)
  const destAirport = getHub(destAirportId)
  if (!originAirport || !destAirport) return null

  const air = findHubConnection(originAirportId, destAirportId, 'flight')
  if (!air) {
    return makeUnavailable(
      'flight',
      'No curated direct air service between the relevant airports for this pair.',
      'Flight is not listed as available on this corridor in our curated network data.',
      'curated',
    )
  }

  const legs: JourneyLeg[] = []
  const hubs: string[] = []
  let mins: [number, number] | null = air.typicalMinutes
  let cost: [number, number] | null = air.typicalCostUsd
  let verification: VerificationStatus = air.verificationStatus

  const originLocal = oTopo.hasFlightAccess && oTopo.primaryAirportHubId === originAirportId
  const destLocal = dTopo.hasFlightAccess && dTopo.primaryAirportHubId === destAirportId

  if (!originLocal) {
    const ground = findGroundLink(originId, originAirportId)
    if (!ground) {
      return makeUnavailable(
        'flight',
        `No commercial airport serves ${origin.label} directly, and no curated ground link to ${originAirport.name} is recorded.`,
        `No direct flight from ${origin.label}.`,
        'unknown',
      )
    }
    legs.push({
      fromLabel: origin.label,
      toLabel: originAirport.name,
      mode: ground.mode,
      hubId: originAirportId,
      placeId: originId,
      typicalMinutes: ground.typicalMinutes,
    })
    hubs.push(originAirportId)
    mins = addMinutes(mins, ground.typicalMinutes)
    cost = addCost(cost, ground.typicalCostUsd)
    if (ground.verificationStatus === 'estimated') verification = 'estimated'
  }

  legs.push({
    fromLabel: originAirport.name,
    toLabel: destAirport.name,
    mode: 'flight',
    hubId: destAirportId,
    typicalMinutes: air.typicalMinutes ?? undefined,
  })
  hubs.push(originAirportId, destAirportId)

  if (!destLocal) {
    const ground = findGroundLink(destId, destAirportId)
    // Arrival city is the airport city — no extra ground dataset required
    if (destAirport.placeId === destId) {
      legs.push({
        fromLabel: destAirport.name,
        toLabel: dest.label,
        mode: 'ground',
        placeId: destId,
        typicalMinutes: [30, 60],
      })
      mins = addMinutes(mins, [30, 60])
      cost = addCost(cost, [5, 25])
    } else if (ground) {
      legs.push({
        fromLabel: destAirport.name,
        toLabel: dest.label,
        mode: ground.mode,
        hubId: destAirportId,
        placeId: destId,
        typicalMinutes: ground.typicalMinutes,
      })
      mins = addMinutes(mins, ground.typicalMinutes)
      cost = addCost(cost, ground.typicalCostUsd)
    } else {
      legs.push({
        fromLabel: destAirport.name,
        toLabel: dest.label,
        mode: 'ground',
        placeId: destId,
        typicalMinutes: [40, 90],
      })
      mins = addMinutes(mins, [40, 90])
    }
  } else {
    legs.push({
      fromLabel: destAirport.name,
      toLabel: dest.label,
      mode: 'ground',
      placeId: destId,
      typicalMinutes: [25, 55],
    })
    mins = addMinutes(mins, [25, 55])
  }

  const boardingDirect = originLocal
  const direct = boardingDirect && destLocal
  const why = boardingDirect
    ? `${origin.label} has commercial air access; this uses the curated ${originAirport.name} ↔ ${destAirport.name} service.`
    : `No commercial airport serves ${origin.label} directly. Connect through ${originAirport.name}.`

  const summary = boardingDirect
    ? `Flight via ${originAirport.name} → ${destAirport.name}`
    : `No direct flight from ${origin.label}`

  return buildJourney({
    modeId: 'flight',
    legs,
    direct,
    summary,
    why,
    typicalMinutes: mins,
    typicalCostUsd: cost,
    verificationStatus: verification,
    contextHubIds: [...new Set(hubs)],
    complexityBump: boardingDirect ? 0 : 1,
  })
}

function resolveRail(originId: PlaceId, destId: PlaceId): FeasibleJourney | null {
  const oTopo = getTopology(originId)
  const dTopo = getTopology(destId)
  const origin = getPlace(originId)
  const dest = getPlace(destId)
  if (!oTopo || !dTopo || !origin || !dest) return null

  if (oTopo.isIsland || dTopo.isIsland) {
    return makeUnavailable(
      'train',
      'Rail does not serve this island destination directly.',
      'Train is not applicable for the water-constrained leg.',
      'curated',
    )
  }

  const originRailId = oTopo.primaryRailHubId
  const destRailId = dTopo.primaryRailHubId
  if (!originRailId || !destRailId) {
    return makeUnavailable(
      'train',
      'No curated rail hub is mapped for one side of this pair.',
      'Train requires another mainland connection first.',
      oTopo.hasRailAccess || dTopo.hasRailAccess ? 'curated' : 'curated',
    )
  }

  const originRail = getHub(originRailId)
  const destRail = getHub(destRailId)
  if (!originRail || !destRail) return null

  const rail = findHubConnection(originRailId, destRailId, 'train')
  if (!rail) {
    return makeUnavailable(
      'train',
      'No curated direct rail service between the relevant stations.',
      'Train is not listed as available on this corridor in our curated network data.',
      'curated',
    )
  }

  const legs: JourneyLeg[] = []
  const hubs = [originRailId, destRailId]
  let mins = rail.typicalMinutes
  let cost = rail.typicalCostUsd
  let boardingLocal = oTopo.hasRailAccess && oTopo.primaryRailHubId === originRailId

  if (!boardingLocal) {
    const ground = findGroundLink(originId, originRailId)
    if (!ground) {
      return makeUnavailable(
        'train',
        `No direct rail service begins at ${origin.label}. Use the nearest rail hub first.`,
        `No direct train from ${origin.label}.`,
        'curated',
      )
    }
    legs.push({
      fromLabel: origin.label,
      toLabel: originRail.name,
      mode: ground.mode,
      hubId: originRailId,
      typicalMinutes: ground.typicalMinutes,
    })
    mins = addMinutes(mins, ground.typicalMinutes)
    cost = addCost(cost, ground.typicalCostUsd)
  }

  legs.push({
    fromLabel: originRail.name,
    toLabel: destRail.name,
    mode: 'train',
    typicalMinutes: rail.typicalMinutes ?? undefined,
  })

  if (!(dTopo.hasRailAccess && dTopo.primaryRailHubId === destRailId)) {
    const ground = findGroundLink(destId, destRailId)
    if (ground) {
      legs.push({
        fromLabel: destRail.name,
        toLabel: dest.label,
        mode: ground.mode,
        hubId: destRailId,
        typicalMinutes: ground.typicalMinutes,
      })
      mins = addMinutes(mins, ground.typicalMinutes)
      cost = addCost(cost, ground.typicalCostUsd)
    } else if (destRail.placeId !== destId) {
      legs.push({
        fromLabel: destRail.name,
        toLabel: dest.label,
        mode: 'ground',
        typicalMinutes: [30, 60],
      })
      mins = addMinutes(mins, [30, 60])
    }
  }

  return buildJourney({
    modeId: 'train',
    legs,
    direct: boardingLocal && dTopo.hasRailAccess,
    summary: boardingLocal
      ? `${origin.label} → ${dest.label} by rail`
      : `Rail via ${originRail.name}`,
    why: boardingLocal
      ? 'Curated spine / corridor rail service between relevant stations.'
      : `No direct rail service begins at ${origin.label}. Use ${originRail.name} first.`,
    typicalMinutes: mins,
    typicalCostUsd: cost,
    verificationStatus: rail.verificationStatus,
    contextHubIds: hubs,
  })
}

function resolveCoach(originId: PlaceId, destId: PlaceId): FeasibleJourney | null {
  const oTopo = getTopology(originId)
  const dTopo = getTopology(destId)
  const origin = getPlace(originId)
  const dest = getPlace(destId)
  if (!oTopo || !dTopo || !origin || !dest) return null

  if ((oTopo.isIsland && !oTopo.hasBridgeAccess) || (dTopo.isIsland && !dTopo.hasBridgeAccess)) {
    return makeUnavailable(
      'coach',
      'Coach cannot complete an island crossing without a road/bridge connection.',
      'Coach is not a direct option for this water-constrained destination.',
      'curated',
    )
  }

  if (!oTopo.hasRoadAccess || !dTopo.hasRoadAccess) {
    return makeUnavailable(
      'coach',
      'Road access is missing on one side of this pair.',
      'Coach is not applicable.',
      'curated',
    )
  }

  const km = haversineKm(origin, dest)
  // Curated typical coach door-to-door bands by scale (not straight-line speed claims)
  let mins: [number, number]
  let cost: [number, number]
  if (km < 120) {
    mins = [90, 210]
    cost = [5, 25]
  } else if (km < 500) {
    mins = [360, 600]
    cost = [12, 40]
  } else if (km < 1000) {
    mins = [720, 1080]
    cost = [18, 50]
  } else {
    mins = [1080, 1500]
    cost = [25, 60]
  }

  return buildJourney({
    modeId: 'coach',
    legs: [
      {
        fromLabel: origin.label,
        toLabel: dest.label,
        mode: 'coach',
        typicalMinutes: mins,
      },
    ],
    direct: true,
    summary: `${origin.label} → ${dest.label} by coach`,
    why: 'Road-accessible mainland corridor — coach/sleeper buses are a curated typical option.',
    typicalMinutes: mins,
    typicalCostUsd: cost,
    verificationStatus: 'curated',
    contextHubIds: [],
  })
}

function resolveDriver(originId: PlaceId, destId: PlaceId): FeasibleJourney | null {
  const oTopo = getTopology(originId)
  const dTopo = getTopology(destId)
  const origin = getPlace(originId)
  const dest = getPlace(destId)
  if (!oTopo || !dTopo || !origin || !dest) return null

  if ((dTopo.isIsland && !dTopo.hasBridgeAccess) || (oTopo.isIsland && !oTopo.hasBridgeAccess)) {
    return makeUnavailable(
      'private-driver',
      'The destination is separated from continuous road access by water — a car cannot complete the journey alone.',
      'Private driver is not a direct end-to-end option for this island.',
      'curated',
    )
  }

  if (!oTopo.hasRoadAccess || !dTopo.hasRoadAccess) {
    return makeUnavailable(
      'private-driver',
      'Road access is missing on one side of this pair.',
      'Private driver is not applicable.',
      'curated',
    )
  }

  const km = haversineKm(origin, dest)
  let mins: [number, number]
  let cost: [number, number]
  if (km < 120) {
    mins = [90, 180]
    cost = [40, 120]
  } else if (km < 500) {
    mins = [300, 540]
    cost = [80, 220]
  } else if (km < 1000) {
    mins = [600, 960]
    cost = [150, 350]
  } else {
    mins = [900, 1320]
    cost = [220, 500]
  }

  return buildJourney({
    modeId: 'private-driver',
    legs: [
      {
        fromLabel: origin.label,
        toLabel: dest.label,
        mode: 'private-driver',
        typicalMinutes: mins,
      },
    ],
    direct: true,
    summary: `${origin.label} → ${dest.label} by private car`,
    why: 'Continuous road access makes a private driver a realistic door-to-door option.',
    typicalMinutes: mins,
    typicalCostUsd: cost,
    verificationStatus: 'curated',
    contextHubIds: [],
  })
}

function resolveWater(originId: PlaceId, destId: PlaceId): FeasibleJourney | null {
  const oTopo = getTopology(originId)
  const dTopo = getTopology(destId)
  const origin = getPlace(originId)
  const dest = getPlace(destId)
  if (!oTopo || !dTopo || !origin || !dest) return null

  const island = oTopo.isIsland || dTopo.isIsland
  if (!island) return null

  const originPortId = oTopo.primaryFerryPortId
  const destPortId = dTopo.primaryFerryPortId

  type Candidate = {
    fromPort: string
    toPort: string
    groundFrom: GroundLink | null
    originIsPortCity: boolean
  }
  const candidates: Candidate[] = []

  // Direct port ↔ port only when both places are the port cities (or have local ports)
  if (originPortId && destPortId) {
    const fromPort = getHub(originPortId)
    const toPort = getHub(destPortId)
    if (fromPort && toPort) {
      candidates.push({
        fromPort: originPortId,
        toPort: destPortId,
        groundFrom: null,
        originIsPortCity: fromPort.placeId === originId,
      })
    }
  }

  // Mainland → island: only via a curated ground link to a relevant ferry port
  if (!originPortId && destPortId) {
    if (destId === 'phu-quoc') {
      const g = findGroundLink(originId, 'hub-ha-tien-port')
      if (g) {
        candidates.push({
          fromPort: 'hub-ha-tien-port',
          toPort: destPortId,
          groundFrom: g,
          originIsPortCity: false,
        })
      }
    }
    if (destId === 'con-dao') {
      const g = findGroundLink(originId, 'hub-vung-tau-port')
      if (g) {
        candidates.push({
          fromPort: 'hub-vung-tau-port',
          toPort: destPortId,
          groundFrom: g,
          originIsPortCity: false,
        })
      }
    }
  }

  // Island → mainland port
  if (originPortId && !destPortId && originId === 'phu-quoc') {
    const g = findGroundLink(destId, 'hub-ha-tien-port')
    if (g || destId === 'ha-tien') {
      candidates.push({
        fromPort: originPortId,
        toPort: 'hub-ha-tien-port',
        groundFrom: null,
        originIsPortCity: true,
      })
    }
  }

  for (const c of candidates) {
    const ferry = findHubConnection(c.fromPort, c.toPort, 'ferry')
    if (!ferry) continue
    const fromPort = getHub(c.fromPort)
    const toPort = getHub(c.toPort)
    if (!fromPort || !toPort) continue

    // Never invent a ferry from a distant city without a curated ground link
    if (!c.originIsPortCity && !c.groundFrom) continue
    if (c.originIsPortCity && fromPort.placeId !== originId && !c.groundFrom) continue

    const legs: JourneyLeg[] = []
    let mins = ferry.typicalMinutes
    let cost = ferry.typicalCostUsd
    const hubs = [c.fromPort, c.toPort]

    if (c.groundFrom) {
      legs.push({
        fromLabel: origin.label,
        toLabel: fromPort.name,
        mode: c.groundFrom.mode,
        hubId: c.fromPort,
        typicalMinutes: c.groundFrom.typicalMinutes,
      })
      mins = addMinutes(mins, c.groundFrom.typicalMinutes)
      cost = addCost(cost, c.groundFrom.typicalCostUsd)
    }

    legs.push({
      fromLabel: fromPort.name,
      toLabel: toPort.name,
      mode: 'ferry',
      typicalMinutes: ferry.typicalMinutes ?? undefined,
    })

    if (toPort.placeId !== destId) {
      legs.push({
        fromLabel: toPort.name,
        toLabel: dest.label,
        mode: 'ground',
        typicalMinutes: [15, 40],
      })
      mins = addMinutes(mins, [15, 40])
    }

    const multi = Boolean(c.groundFrom) || legs.length > 1
    return buildJourney({
      modeId: 'ferry',
      displayTitle: multi ? 'Ground + Ferry' : 'Ferry',
      legs,
      direct: !multi && c.originIsPortCity,
      summary: multi
        ? 'Water travel requires a mainland transfer before the ferry'
        : `${origin.label} → ${dest.label} by ferry`,
      why: multi
        ? `There is no direct ferry from ${origin.label}. Reach ${fromPort.name}, then cross by ferry.`
        : 'The destination is separated from the mainland by water.',
      typicalMinutes: mins,
      typicalCostUsd: cost,
      verificationStatus: ferry.verificationStatus,
      contextHubIds: hubs,
      complexityBump: multi ? 2 : 0,
    })
  }

  // Distant mainland → island with flight available: omit ferry noise entirely
  const hasAir =
    oTopo.hasFlightAccess ||
    dTopo.hasFlightAccess ||
    Boolean(oTopo.primaryAirportHubId && dTopo.primaryAirportHubId)
  if (hasAir && !originPortId) {
    return null
  }

  return makeUnavailable(
    'ferry',
    `No curated ferry corridor from ${origin.label}. A mainland port transfer would be required first.`,
    'Ferry is not a practical direct option from this origin.',
    'curated',
  )
}

function rankRecommendations(journeys: FeasibleJourney[]): JourneyRecommendation[] {
  const usable = journeys.filter(
    (j) =>
      j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg',
  )
  if (!usable.length) return []

  const byTime = [...usable].sort(
    (a, b) =>
      (a.typicalMinutes?.[0] ?? 99999) +
      (a.typicalMinutes?.[1] ?? 99999) -
      ((b.typicalMinutes?.[0] ?? 99999) + (b.typicalMinutes?.[1] ?? 99999)),
  )
  const byCost = [...usable].sort(
    (a, b) =>
      (a.typicalCostUsd?.[0] ?? 9999) +
      (a.typicalCostUsd?.[1] ?? 9999) -
      ((b.typicalCostUsd?.[0] ?? 9999) + (b.typicalCostUsd?.[1] ?? 9999)),
  )
  const bySimple = [...usable].sort((a, b) => a.complexity - b.complexity)

  const titleOf = (j: FeasibleJourney) => {
    if (j.direct) return j.displayTitle
    if (j.modeId === 'flight' && j.legs[0]?.toLabel) {
      const hubLeg = j.legs.find((l) => l.mode === 'flight')
      const via = hubLeg?.fromLabel?.replace(/\s+Airport.*/i, ' Airport') ?? 'hub'
      return `Flight via ${via}`
    }
    if (j.displayTitle === 'Ground + Ferry') return 'Mainland transfer + ferry'
    return `${j.displayTitle} · connection`
  }

  const recs: JourneyRecommendation[] = []
  const fastest = byTime[0]
  const simplest = bySimple[0]
  const value = byCost[0]

  const overall =
    simplest && fastest && simplest.complexity + 1 < fastest.complexity
      ? simplest
      : fastest ?? simplest

  if (overall) {
    recs.push({
      id: 'best-overall',
      label: 'Best overall',
      symbol: '⭐',
      journeyId: overall.id,
      journeyTitle: titleOf(overall),
      note: overall.direct
        ? `${overall.displayTitle} is direct and balances time, cost and transfers.`
        : `${titleOf(overall)} wins on total journey practicality despite the connection.`,
    })
  }
  if (fastest) {
    recs.push({
      id: 'fastest',
      label: 'Fastest',
      symbol: '⚡',
      journeyId: fastest.id,
      journeyTitle: titleOf(fastest),
      note: fastest.direct
        ? 'Shortest typical door-to-door time.'
        : 'Fastest overall once hub transfer time is included.',
    })
  }
  if (simplest && simplest.id !== fastest?.id) {
    recs.push({
      id: 'least-complex',
      label: 'Least complex',
      symbol: '😌',
      journeyId: simplest.id,
      journeyTitle: titleOf(simplest),
      note: 'Fewest transfer decisions among feasible journeys.',
    })
  }
  if (value && value.id !== fastest?.id && value.id !== simplest?.id && value.id !== overall?.id) {
    recs.push({
      id: 'value',
      label: 'Best value',
      symbol: '💰',
      journeyId: value.id,
      journeyTitle: titleOf(value),
      note: 'Typically lower spend among feasible journeys.',
    })
  }

  const seen = new Set<string>()
  return recs.filter((r) => {
    const key = `${r.id}-${r.journeyId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 3)
}

function whatThisMeans(
  journeys: FeasibleJourney[],
  scale: RouteScale,
  originLabel: string,
  destLabel: string,
): string[] {
  const flight = journeys.find(
    (j) =>
      j.modeId === 'flight' &&
      (j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg'),
  )
  const ferry = journeys.find(
    (j) =>
      j.modeId === 'ferry' &&
      (j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg'),
  )
  const train = journeys.find(
    (j) =>
      j.modeId === 'train' &&
      (j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg'),
  )

  if (scale === 'local') {
    return ['This is effectively a local hop — use Urban transport instead.']
  }

  if (scale === 'island-water') {
    if (flight?.direct && !ferry) {
      return [
        `${destLabel} is water-constrained, so overland travel cannot finish the trip. Flying is the practical link from ${originLabel}; a ferry would need a curated mainland port transfer first.`,
      ]
    }
    if (flight && ferry) {
      return [
        `${destLabel} cannot be reached by road alone. Flying is usually simplest; ferry options require a mainland transfer first.`,
      ]
    }
    if (ferry && !ferry.direct) {
      return [
        `Water travel is possible, but requires a mainland transfer before the ferry — there is no direct ferry from ${originLabel}.`,
      ]
    }
    return [`${destLabel} is water-constrained — treat this as a hub connection, not a simple road trip.`]
  }

  if (flight && !flight.direct && train?.direct) {
    return [
      'Flying can still be fastest, but needs an airport transfer. Train is slower with fewer transfer decisions.',
    ]
  }
  if (flight && !flight.direct) {
    return ['Flying is available with a hub connection — airport transfer time matters.']
  }
  return []
}

/**
 * Single route-intelligence entry point for inter-city map pairs.
 * UI must not invent availability — call this.
 */
export function resolveIntercityRoute(
  originId: PlaceId | null,
  destinationId: PlaceId | null,
): RouteIntelligenceResult | null {
  if (!originId || !destinationId || originId === destinationId) return null
  const origin = getPlace(originId)
  const dest = getPlace(destinationId)
  const oTopo = getTopology(originId)
  const dTopo = getTopology(destinationId)
  if (!origin || !dest || !oTopo || !dTopo) return null

  const geographicKm = haversineKm(origin, dest)
  const scale = classifyScale(geographicKm, oTopo.isIsland, dTopo.isIsland)

  if (scale === 'local') {
    return {
      originId,
      destinationId,
      originLabel: origin.label,
      destinationLabel: dest.label,
      scale,
      geographicKm,
      headline: 'This looks like a short local hop — use Urban transport instead.',
      whatThisMeans: [
        'Long-distance flight/train/coach are usually not meaningful for this distance.',
      ],
      journeys: [],
      recommendations: [],
      contextHubIds: [],
    }
  }

  const journeys = [
    resolveAir(originId, destinationId),
    resolveRail(originId, destinationId),
    resolveCoach(originId, destinationId),
    resolveDriver(originId, destinationId),
    resolveWater(originId, destinationId),
  ].filter(Boolean) as FeasibleJourney[]

  // Prefer showing feasible first; add at most one teachable unavailable row
  const feasible = journeys.filter(
    (j) => j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg',
  )
  const teachable = journeys
    .filter(
      (j) =>
        (j.status === 'not-available' ||
          j.status === 'not-applicable' ||
          j.status === 'unknown') &&
        ['train', 'private-driver'].includes(j.modeId) &&
        scale === 'island-water',
    )
    .slice(0, 1)

  const ordered = [...feasible, ...teachable]
  const recommendations = rankRecommendations(feasible)
  const contextHubIds = [
    ...new Set(feasible.flatMap((j) => j.contextHubIds).slice(0, 4)),
  ]

  let headline = `Here's how you can make this journey.`
  if (!feasible.length) {
    headline = 'Transport information for this connection needs checking.'
  } else if (feasible.every((j) => !j.direct)) {
    headline = "Direct service isn't available for every mode — connections may be required."
  }

  return {
    originId,
    destinationId,
    originLabel: origin.label,
    destinationLabel: dest.label,
    scale,
    geographicKm,
    headline,
    whatThisMeans: whatThisMeans(ordered, scale, origin.label, dest.label),
    journeys: ordered,
    recommendations,
    contextHubIds,
  }
}

/** Adapter for older callers that expect mode lists. */
export function feasibleLongModeIds(originId: PlaceId | null, destinationId: PlaceId | null): LongModeId[] {
  const result = resolveIntercityRoute(originId, destinationId)
  if (!result) return []
  return result.journeys
    .filter((j) => j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg')
    .map((j) => j.modeId)
    .filter((id): id is LongModeId =>
      ['flight', 'train', 'coach', 'private-driver', 'shared-transfer'].includes(id),
    )
}

export function getHubMarkers(hubIds: string[]): TransportHub[] {
  return hubIds.map((id) => getHub(id)).filter(Boolean) as TransportHub[]
}
