import type {
  ProviderOption,
  TransferDirection,
  TransportModeId,
} from './types'

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const IMAGES: Record<TransportModeId, string[]> = {
  'car-taxi': [
    img('photo-1511527661048-7f093d1f8c0b'),
    img('photo-1449965408869-eaa3f409d32f'),
    img('photo-1502877338535-766e1452684a'),
    img('photo-1494976388531-d1058494cdd8'),
    img('photo-1558618666-fcd25c85f82e'),
    img('photo-1469854523086-cc02fe5d8800'),
  ],
  'ride-hailing': [
    img('photo-1556742049-0cfed4f6a45d'),
    img('photo-1511527661048-7f093d1f8c0b'),
    img('photo-1449965408869-eaa3f409d32f'),
    img('photo-1502877338535-766e1452684a'),
    img('photo-1494976388531-d1058494cdd8'),
    img('photo-1558618666-fcd25c85f82e'),
  ],
  'private-transfer': [
    img('photo-1449965408869-eaa3f409d32f'),
    img('photo-1549317661-bd32c8ce0db2'),
    img('photo-1485291571150-772bcfc10da5'),
    img('photo-1511919884225-912b1b2dd5ad'),
    img('photo-1492144534655-ae79c964c9d7'),
    img('photo-1503376780353-7e6692767b70'),
  ],
  'public-bus': [
    img('photo-1570125909232-eb263c188f7e'),
    img('photo-1544620341-11cb2f96f2ca'),
    img('photo-1464219789935-c2d9d9aba644'),
    img('photo-1557223562-6c77ef16210f'),
    img('photo-1570125909232-eb263c188f7e'),
    img('photo-1544620341-11cb2f96f2ca'),
  ],
  'shared-transfer': [
    img('photo-1544620341-11cb2f96f2ca'),
    img('photo-1570125909232-eb263c188f7e'),
    img('photo-1464219789935-c2d9d9aba644'),
    img('photo-1544620341-11cb2f96f2ca'),
    img('photo-1570125909232-eb263c188f7e'),
    img('photo-1464219789935-c2d9d9aba644'),
  ],
  'rental-driver': [
    img('photo-1485291571150-772bcfc10da5'),
    img('photo-1492144534655-ae79c964c9d7'),
    img('photo-1503376780353-7e6692767b70'),
    img('photo-1549317661-bd32c8ce0db2'),
    img('photo-1511919884225-912b1b2dd5ad'),
    img('photo-1494976388531-d1058494cdd8'),
  ],
}

type Bank = { names: string[]; prices: string[]; priceFrom: number[]; vehicles: string[] }

const BANK: Record<TransportModeId, Bank> = {
  'car-taxi': {
    names: [
      'Airport Taxi Rank',
      'Mai Linh',
      'Vinasun',
      'Fixed-Fare Taxi Desk',
      'Klook transfer',
      'Official Airport Taxi',
    ],
    prices: [
      'Typically $10–18 / trip',
      'Typically $8–16 / trip',
      'Typically $8–16 / trip',
      'Typically $12–20 / trip',
      'Typically $12–22 / trip',
      'Typically $10–18 / trip',
    ],
    priceFrom: [10, 8, 8, 12, 12, 10],
    vehicles: ['Sedan', 'Sedan', 'Sedan', 'Sedan', 'Sedan', 'Sedan'],
  },
  'ride-hailing': {
    names: ['Grab Car', 'Xanh SM', 'Be Car', 'Grab Car', 'Xanh SM', 'Be Car'],
    prices: [
      'Typically $6–12 / trip',
      'Typically $7–13 / trip',
      'Typically $6–11 / trip',
      'Typically $6–12 / trip',
      'Typically $7–13 / trip',
      'Typically $6–11 / trip',
    ],
    priceFrom: [6, 7, 6, 6, 7, 6],
    vehicles: ['Sedan', 'Sedan', 'Sedan', 'Sedan', 'Sedan', 'Sedan'],
  },
  'private-transfer': {
    names: [
      'Meet & Greet Transfer',
      'Door-to-Door Car',
      'Family Van Transfer',
      'Calm Arrival Ride',
      'Premium Airport Car',
      'Fixed-Fare Private',
    ],
    prices: [
      'From $14 / vehicle',
      'From $16 / vehicle',
      'From $20 / vehicle',
      'From $18 / vehicle',
      'From $28 / vehicle',
      'From $15 / vehicle',
    ],
    priceFrom: [14, 16, 20, 18, 28, 15],
    vehicles: ['Sedan', 'Sedan', 'MPV', 'Sedan', 'Sedan', 'Sedan'],
  },
  'public-bus': {
    names: [
      'Airport Express Bus',
      'Airport City Bus',
      'Local Bus Link',
      'Terminal Bus',
      'Daytime City Service',
      'Budget Airport Line',
    ],
    prices: [
      '$2–4 / person',
      '$1–3 / person',
      '$1–2 / person',
      '$1–3 / person',
      '$2–3 / person',
      '$1–3 / person',
    ],
    priceFrom: [2, 1, 1, 1, 2, 1],
    vehicles: ['Express bus', 'City bus', 'Local bus', 'City bus', 'City bus', 'City bus'],
  },
  'shared-transfer': {
    names: [
      'Shared Hotel Shuttle',
      'Airport Minivan Share',
      'Corridor Shuttle',
      'Budget Shared Van',
      'Resort Shuttle Desk',
      'Group Drop Shuttle',
    ],
    prices: [
      'From $5 / person',
      'From $6 / person',
      'From $7 / person',
      'From $4 / person',
      'From $8 / person',
      'From $6 / person',
    ],
    priceFrom: [5, 6, 7, 4, 8, 6],
    vehicles: ['Shared van', 'Shared van', 'Minivan', 'Shared van', 'Shared van', 'Shared van'],
  },
  'rental-driver': {
    names: [
      'Car with Driver',
      'Airport Rent-a-Car',
      'Compact Hire',
      'SUV Hire',
      'Driver Package',
      'Island Self-Drive',
    ],
    prices: [
      'From $35 / vehicle/day',
      'From $25 / vehicle/day',
      'From $22 / vehicle/day',
      'From $40 / vehicle/day',
      'From $45 / vehicle/day',
      'From $30 / vehicle/day',
    ],
    priceFrom: [35, 25, 22, 40, 45, 30],
    vehicles: ['Sedan + driver', 'Compact', 'Compact', 'SUV', 'Sedan + driver', 'Compact'],
  },
}

export function getProvidersForMode(
  routeId: string,
  modeId: TransportModeId,
  direction: TransferDirection,
  timeLabel: string,
): ProviderOption[] {
  const bank = BANK[modeId]
  const images = IMAGES[modeId]
  return bank.names.map((name, i) => ({
    id: `${routeId}-${direction}-${modeId}-${i}`,
    modeId,
    routeId,
    direction,
    name: direction === 'outbound' && i < 3 ? `Return · ${name}` : name,
    rating: Math.round((4.4 + (i % 5) * 0.1) * 10) / 10,
    priceLabel: bank.prices[i],
    priceFrom: bank.priceFrom[i],
    vehicle: bank.vehicles[i],
    capacity: modeId === 'public-bus' || modeId === 'shared-transfer' ? 'Shared' : i % 2 ? '1–6' : '1–3',
    luggage: modeId === 'public-bus' ? 'Cabin-friendly' : '2–4 bags',
    pickupStyle:
      modeId === 'car-taxi'
        ? i === 1 || i === 2 || i === 4
          ? 'App zone'
          : 'Taxi rank'
        : modeId === 'private-transfer'
          ? 'Meet & greet'
          : modeId === 'public-bus'
            ? 'Bus stop'
            : modeId === 'shared-transfer'
              ? 'Shuttle desk'
              : 'Rental desk',
    accessibility:
      modeId === 'private-transfer'
        ? i === 0
          ? 'Wheelchair-friendly'
          : 'Requires assistance'
        : modeId === 'car-taxi'
          ? 'Partial'
          : modeId === 'public-bus'
            ? 'Not recommended'
            : modeId === 'shared-transfer'
              ? 'Limited'
              : 'Check availability',
    image: images[i % images.length],
    timeLabel,
    cancellationPolicy:
      modeId === 'private-transfer'
        ? i % 2 === 0
          ? 'Free cancellation 24h'
          : 'Limited cancellation'
        : modeId === 'public-bus'
          ? 'Non-refundable ticket'
          : 'Check provider policy',
    flightDelayPolicy:
      modeId === 'private-transfer'
        ? i === 1
          ? 'Flight tracking included'
          : 'Contact provider if delayed'
        : modeId === 'car-taxi'
          ? 'Book after landing — no pre-book delay risk'
          : 'Policy not confirmed',
    waitingTimePolicy:
      modeId === 'private-transfer' ? 'About 45–60 min included (typical)' : 'Starts when ride begins',
    featured: i < 3,
  }))
}

export function rankOptionsForProfile(
  options: ProviderOption[],
  opts: { passengers: number; luggage: 'light' | 'medium' | 'heavy'; budget: boolean },
): ProviderOption[] {
  return [...options].sort((a, b) => {
    let sa = a.rating * 10 - a.priceFrom
    let sb = b.rating * 10 - b.priceFrom
    if (opts.budget) {
      sa -= a.priceFrom * 0.8
      sb -= b.priceFrom * 0.8
    }
    if (opts.passengers >= 4) {
      if (a.capacity.includes('6')) sa += 8
      if (b.capacity.includes('6')) sb += 8
    }
    if (opts.luggage === 'heavy') {
      if (a.vehicle.includes('MPV') || a.vehicle.includes('SUV')) sa += 6
      if (b.vehicle.includes('MPV') || b.vehicle.includes('SUV')) sb += 6
    }
    if (a.featured) sa += 3
    if (b.featured) sb += 3
    return sb - sa
  })
}

export function bookingUrlForOption(option: ProviderOption): string {
  const name = option.name.toLowerCase()
  if (/grab/.test(name)) return 'https://www.grab.com/vn/'
  if (/xanh/.test(name)) return 'https://www.xanhsm.com/'
  if (/\bbe\b/.test(name)) return 'https://be.com.vn/'
  if (option.modeId === 'car-taxi') return 'https://www.grab.com/vn/'
  if (option.modeId === 'public-bus') return 'https://12go.asia/'
  if (option.modeId === 'rental-driver') {
    return /driver/.test(name)
      ? 'https://www.klook.com/'
      : 'https://www.rentalcars.com/'
  }
  return 'https://www.klook.com/'
}
