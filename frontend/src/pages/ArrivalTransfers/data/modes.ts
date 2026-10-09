import type { TransferDirection, TransportMode, TransportModeId } from './types'

const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

type ModeDef = Omit<TransportMode, 'timeMin' | 'costUsd' | 'airportArrivalBuffer'>

export const MODE_DEFINITIONS: Record<TransportModeId, ModeDef> = {
  'car-taxi': {
    id: 'car-taxi',
    symbol: '🚕',
    label: 'Car / Taxi',
    shortLabel: 'Car / Taxi',
    image: img('photo-1511527661048-7f093d1f8c0b'),
    description:
      'Metered taxis (Mai Linh, Vinasun) at official ranks, or a pre-booked car with a name board. Same door-to-door idea — not ride-hailing apps.',
    bestFor: ['Solo / couples', 'Flexible timing', 'Direct destination'],
    whyChoose: ['Immediate availability', 'Direct journey', 'No fixed route'],
    tradeoff: 'Traffic and fare variation can make the final cost less predictable.',
    priceBasis: 'per_trip',
    passengers: '1–4',
    luggageStars: 4,
    luggageLabel: 'Strong',
    accessibilityLevel: 'Partial',
    accessible: false,
    lateNightOk: true,
    groupFriendly: true,
    comfort: 4,
    reliability: 3,
    operatingWindow: 'Typically 24/7 at major airports',
    journey: [
      { icon: '✈️', label: 'Airport' },
      { icon: '🚕', label: 'Taxi / app pickup' },
      { icon: '📍', label: 'Destination' },
    ],
    journeyNote: 'Direct · typically 25–60 min',
  },
  'ride-hailing': {
    id: 'ride-hailing',
    symbol: '📱',
    label: 'Ride-hailing',
    shortLabel: 'Apps',
    image: img('photo-1556742049-0cfed4f6a45d'),
    description:
      'Grab, Xanh SM, and Be — booked in-app with upfront fares. Walk to the marked pickup bay after you request the car.',
    bestFor: ['Most tourists', 'Solo travellers', 'Transparent pricing'],
    whyChoose: ['Fixed in-app price', 'GPS tracking', 'No language/currency barrier'],
    tradeoff: 'Needs a SIM or data; pickup is a short walk from arrivals.',
    priceBasis: 'per_trip',
    passengers: '1–4',
    luggageStars: 3,
    luggageLabel: 'OK',
    accessibilityLevel: 'Partial',
    accessible: false,
    lateNightOk: true,
    groupFriendly: false,
    comfort: 4,
    reliability: 4,
    operatingWindow: 'Typically 24/7 at major airports',
    journey: [
      { icon: '✈️', label: 'Airport' },
      { icon: '📱', label: 'App pickup bay' },
      { icon: '📍', label: 'Destination' },
    ],
    journeyNote: 'App ride · typically 25–60 min',
  },
  'private-transfer': {
    id: 'private-transfer',
    symbol: '🚐',
    label: 'Private Transfer',
    shortLabel: 'Private',
    image: img('photo-1449965408869-eaa3f409d32f'),
    description:
      'A pre-arranged dedicated vehicle reserved for your group — planned pickup, no shared passengers, direct to your destination.',
    bestFor: ['Groups', 'Heavy luggage', 'Late arrivals', 'Accessibility needs'],
    whyChoose: ['Predictable pickup', 'Direct journey', 'Luggage-friendly', 'Useful after long flights'],
    tradeoff: 'Usually costs more than public transport and car/taxi options.',
    priceBasis: 'per_vehicle',
    passengers: '1–6',
    luggageStars: 5,
    luggageLabel: 'Excellent',
    accessibilityLevel: 'Wheelchair-friendly',
    accessible: true,
    lateNightOk: true,
    groupFriendly: true,
    comfort: 5,
    reliability: 5,
    operatingWindow: 'Typically 24/7 when pre-booked',
    journey: [
      { icon: '✈️', label: 'Airport' },
      { icon: '🚐', label: 'Driver waiting' },
      { icon: '📍', label: 'Destination' },
    ],
    journeyNote: 'Dedicated · typically 25–55 min',
  },
  'public-bus': {
    id: 'public-bus',
    symbol: '🚌',
    label: 'Public / Airport Bus',
    shortLabel: 'Bus',
    image: img('photo-1570125909232-eb263c188f7e'),
    description:
      'Scheduled public or airport-operated buses on fixed routes and stops — including express airport buses and local bus links.',
    bestFor: ['Low cost', 'Light luggage', 'Daytime travel', 'Fixed-stop travellers'],
    whyChoose: ['Lowest fare', 'No pre-booking', 'Works on main corridors'],
    tradeoff:
      'Slower, fixed routes, limited late hours, and you may need a final connection.',
    priceBasis: 'per_person',
    passengers: 'Any',
    luggageStars: 2,
    luggageLabel: 'Limited',
    accessibilityLevel: 'Not recommended',
    accessible: false,
    lateNightOk: false,
    groupFriendly: false,
    comfort: 2,
    reliability: 3,
    operatingWindow: 'Typically ~06:00–22:00 (estimated)',
    journey: [
      { icon: '✈️', label: 'Airport' },
      { icon: '🚌', label: 'Bus stop' },
      { icon: '🏙', label: 'City stop' },
      { icon: '🚶', label: 'Final connection' },
    ],
    journeyNote: 'Fixed route · typically 45–90 min',
  },
  'shared-transfer': {
    id: 'shared-transfer',
    symbol: '🚐',
    label: 'Shared Transfer',
    shortLabel: 'Shared',
    image: img('photo-1464219789935-c2d9d9aba644'),
    description:
      'Reservation-based shared vans carrying multiple passengers — usually more structured than a street taxi and more direct than a public bus.',
    bestFor: ['Value', 'Couples / small groups', 'Moderate luggage'],
    whyChoose: ['Lower per-person cost', 'Hotel/area oriented', 'Pre-arranged'],
    tradeoff: 'Other passengers, waiting, fixed pickup/drop patterns and possible detours.',
    priceBasis: 'per_person',
    passengers: 'Shared',
    luggageStars: 3,
    luggageLabel: 'OK',
    accessibilityLevel: 'Limited',
    accessible: false,
    lateNightOk: false,
    groupFriendly: false,
    comfort: 3,
    reliability: 3,
    operatingWindow: 'Typically daytime / evening; thins out late',
    journey: [
      { icon: '✈️', label: 'Airport' },
      { icon: '🚐', label: 'Shared pickup' },
      { icon: '🏨', label: 'Area drop-offs' },
    ],
    journeyNote: 'Shared · typically 35–75 min',
  },
  'rental-driver': {
    id: 'rental-driver',
    symbol: '🚙',
    label: 'Rental / Driver',
    shortLabel: 'Rental',
    image: img('photo-1485291571150-772bcfc10da5'),
    description:
      'A rental vehicle or hired car-with-driver when you want control beyond a simple airport-to-hotel drop. In Vietnam, car + driver is the usual choice; self-drive is limited and legally strict.',
    bestFor: ['Multi-stop trips', 'Independent itineraries', 'Continuing by road'],
    whyChoose: ['Flexible routing', 'Useful beyond one drop', 'Driver packages available'],
    tradeoff: 'More setup, higher cost, and unnecessary for a simple hotel transfer.',
    priceBasis: 'per_vehicle',
    passengers: '1–4',
    luggageStars: 5,
    luggageLabel: 'Excellent',
    accessibilityLevel: 'Requires assistance',
    accessible: true,
    lateNightOk: false,
    groupFriendly: true,
    comfort: 4,
    reliability: 3,
    operatingWindow: 'Typically rental-desk hours',
    journey: [
      { icon: '✈️', label: 'Airport' },
      { icon: '🚙', label: 'Rental / driver desk' },
      { icon: '🛣', label: 'Your route' },
    ],
    journeyNote: 'Independent · typically 20–50 min to first stop',
  },
}

export const ALL_MODE_IDS: TransportModeId[] = ['car-taxi', 'public-bus', 'rental-driver']

/** Map legacy catalog IDs → canonical modes. Shared shuttles and ride-hailing are dropped from the board. */
export function toCanonicalModeIds(legacyIds: string[]): TransportModeId[] {
  const map: Record<string, TransportModeId | null> = {
    'private-transfer': 'car-taxi',
    taxi: 'car-taxi',
    'car-taxi': 'car-taxi',
    'ride-hailing': 'car-taxi',
    'public-bus': 'public-bus',
    train: 'public-bus',
    'airport-shuttle': null,
    'shared-transfer': null,
    'rental-car': 'rental-driver',
    'rental-driver': 'rental-driver',
  }
  const set = new Set<TransportModeId>()
  for (const id of legacyIds) {
    const next = map[id]
    if (next) set.add(next)
  }
  if (legacyIds.some((id) => id === 'taxi' || id === 'car-taxi' || id === 'ride-hailing' || id === 'private-transfer')) {
    set.add('car-taxi')
  }
  return ALL_MODE_IDS.filter((id) => set.has(id))
}

const DEFAULT_COST: Record<TransportModeId, [number, number]> = {
  'car-taxi': [8, 20],
  'ride-hailing': [5, 16],
  'private-transfer': [14, 28],
  'public-bus': [1, 4],
  'shared-transfer': [4, 10],
  'rental-driver': [22, 45],
}

const DEFAULT_TIME: Record<TransportModeId, [number, number]> = {
  'car-taxi': [25, 60],
  'ride-hailing': [25, 60],
  'private-transfer': [25, 55],
  'public-bus': [45, 90],
  'shared-transfer': [35, 75],
  'rental-driver': [20, 50],
}

export function buildMode(
  id: TransportModeId,
  overrides?: Partial<Pick<TransportMode, 'timeMin' | 'costUsd'>>,
  direction: TransferDirection = 'inbound',
): TransportMode {
  const def = MODE_DEFINITIONS[id]
  const mode: TransportMode = {
    ...def,
    timeMin: overrides?.timeMin ?? DEFAULT_TIME[id],
    costUsd: overrides?.costUsd ?? DEFAULT_COST[id],
  }
  if (direction === 'outbound') {
    return {
      ...mode,
      journey: outboundJourney(id),
      journeyNote: mode.journeyNote.replace('Airport', 'City').includes('City')
        ? mode.journeyNote
        : `Return · ${mode.journeyNote}`,
      airportArrivalBuffer:
        'Allow about 2–3 hours at the airport before an international departure (general guidance).',
      description:
        id === 'private-transfer'
          ? 'A pre-arranged dedicated vehicle from the city to the airport — planned pickup and direct terminal drop with time for check-in buffer.'
          : mode.description,
    }
  }
  return mode
}

function outboundJourney(id: TransportModeId): { icon: string; label: string }[] {
  if (id === 'car-taxi') {
    return [
      { icon: '📍', label: 'City pickup' },
      { icon: '🚕', label: 'Taxi / app' },
      { icon: '✈️', label: 'Airport' },
    ]
  }
  if (id === 'ride-hailing') {
    return [
      { icon: '📍', label: 'City pickup' },
      { icon: '📱', label: 'App pickup' },
      { icon: '✈️', label: 'Airport' },
    ]
  }
  if (id === 'private-transfer') {
    return [
      { icon: '📍', label: 'City pickup' },
      { icon: '🚐', label: 'Private transfer' },
      { icon: '✈️', label: 'Airport' },
    ]
  }
  if (id === 'public-bus') {
    return [
      { icon: '📍', label: 'City stop' },
      { icon: '🚌', label: 'Airport bus' },
      { icon: '✈️', label: 'Airport' },
    ]
  }
  if (id === 'shared-transfer') {
    return [
      { icon: '📍', label: 'Shared pickup' },
      { icon: '🚐', label: 'Shared van' },
      { icon: '✈️', label: 'Airport' },
    ]
  }
  return [
    { icon: '📍', label: 'Your start' },
    { icon: '🚙', label: 'Rental / driver' },
    { icon: '✈️', label: 'Airport' },
  ]
}

export function getDefaultModes(direction: TransferDirection = 'inbound'): TransportMode[] {
  return ALL_MODE_IDS.map((id) => buildMode(id, undefined, direction))
}

/** Localize journey step endpoints for the selected airport ↔ destination. */
export function withRouteJourneyLabels(
  mode: TransportMode,
  direction: TransferDirection,
  airportLabel: string,
  destinationLabel: string,
): TransportMode {
  const replace = (label: string) => {
    if (label === 'Airport') return airportLabel
    if (label === 'Destination' || label === 'Your route' || label === 'Area drop-offs') {
      return destinationLabel
    }
    if (label === 'City pickup' || label === 'City stop' || label === 'Your start') {
      return destinationLabel
    }
    if (label === 'Shared pickup' && direction === 'outbound') return destinationLabel
    return label
  }
  return {
    ...mode,
    journey: mode.journey.map((step) => ({ ...step, label: replace(step.label) })),
  }
}
