import type { SignalLevel, SignalTone, TripSignal } from '../types'

export type MonthSignals = {
  month: number
  name: string
  tempLabel: string
  weather: SignalLevel
  crowds: SignalLevel
  cost: SignalLevel
  sightseeing: SignalLevel
  note: string
}

/** Country-level planning signals by month — replaceable with regional APIs later */
export const MONTH_SIGNALS: MonthSignals[] = [
  { month: 1, name: 'January', tempLabel: '18–26°C', weather: 4, crowds: 4, cost: 4, sightseeing: 5, note: 'Cooler north, dry south' },
  { month: 2, name: 'February', tempLabel: '19–28°C', weather: 4, crowds: 5, cost: 5, sightseeing: 5, note: 'Peak + Tết periods vary' },
  { month: 3, name: 'March', tempLabel: '22–30°C', weather: 5, crowds: 3, cost: 3, sightseeing: 5, note: 'Strong overall window' },
  { month: 4, name: 'April', tempLabel: '24–32°C', weather: 4, crowds: 3, cost: 3, sightseeing: 4, note: 'Warming; still inviting' },
  { month: 5, name: 'May', tempLabel: '26–33°C', weather: 3, crowds: 2, cost: 2, sightseeing: 4, note: 'Shoulder / hotter' },
  { month: 6, name: 'June', tempLabel: '26–33°C', weather: 3, crowds: 2, cost: 2, sightseeing: 3, note: 'Rainier in many areas' },
  { month: 7, name: 'July', tempLabel: '26–33°C', weather: 2, crowds: 3, cost: 3, sightseeing: 3, note: 'Variable by coast' },
  { month: 8, name: 'August', tempLabel: '26–33°C', weather: 2, crowds: 3, cost: 3, sightseeing: 3, note: 'Storm risk in places' },
  { month: 9, name: 'September', tempLabel: '25–32°C', weather: 3, crowds: 2, cost: 2, sightseeing: 4, note: 'Improving shoulder' },
  { month: 10, name: 'October', tempLabel: '24–30°C', weather: 4, crowds: 3, cost: 3, sightseeing: 5, note: 'Often excellent overall' },
  { month: 11, name: 'November', tempLabel: '22–29°C', weather: 5, crowds: 4, cost: 4, sightseeing: 5, note: 'Prime planning window' },
  { month: 12, name: 'December', tempLabel: '20–28°C', weather: 4, crowds: 5, cost: 5, sightseeing: 5, note: 'Festive & busier' },
]

export const SEASONS = [
  { id: 'spring', label: 'Spring', months: [3, 4, 5] },
  { id: 'summer', label: 'Summer', months: [6, 7, 8] },
  { id: 'autumn', label: 'Autumn', months: [9, 10, 11] },
  { id: 'winter', label: 'Winter', months: [12, 1, 2] },
] as const

export const DURATION_PRESETS = [5, 7, 10, 14, 21] as const

export const TRIP_SHAPES: Record<number, { regions: number; routes: string[][] }> = {
  5: {
    regions: 2,
    routes: [
      ['Hanoi', 'Ninh Binh'],
      ['Da Nang', 'Hoi An'],
    ],
  },
  7: {
    regions: 3,
    routes: [
      ['Hanoi', 'Ninh Binh', 'Ha Long Bay'],
      ['Da Nang', 'Hoi An', 'Hue'],
    ],
  },
  10: {
    regions: 3,
    routes: [
      ['Hanoi', 'Ha Long', 'Hoi An'],
      ['Saigon', 'Mekong', 'Mui Ne'],
    ],
  },
  14: {
    regions: 4,
    routes: [
      ['Hanoi', 'Ninh Binh', 'Hoi An', 'Da Nang'],
      ['Hanoi', 'Hue', 'Hoi An', 'Saigon'],
    ],
  },
  21: {
    regions: 5,
    routes: [
      ['Hanoi', 'Sapa', 'Ninh Binh', 'Hoi An', 'Saigon'],
      ['Hanoi', 'Hue', 'Hoi An', 'Nha Trang', 'Saigon'],
    ],
  },
}

export const BUDGET_UNLOCKS = {
  comfortable: {
    tier: 'Comfortable',
    items: [
      { icon: '🏨', label: 'Comfortable hotels' },
      { icon: '🍜', label: 'Local + mid-range food' },
      { icon: '🚆', label: 'Standard transport' },
      { icon: '🎟', label: 'Major experiences' },
    ],
  },
  premium: {
    tier: 'Premium',
    items: [
      { icon: '🏨', label: 'Upscale stays' },
      { icon: '🍽', label: 'More dining flexibility' },
      { icon: '🚘', label: 'More private transport' },
      { icon: '🛥', label: 'Premium experiences' },
    ],
  },
  luxury: {
    tier: 'Luxury',
    items: [
      { icon: '🏨', label: 'Luxury stays' },
      { icon: '🍷', label: 'Fine dining' },
      { icon: '🚘', label: 'Private transfers' },
      { icon: '🛥', label: 'Premium experiences' },
    ],
  },
} as const

export function budgetTier(amount: number) {
  if (amount >= 2500) return 'luxury' as const
  if (amount >= 1500) return 'premium' as const
  return 'comfortable' as const
}

export function levelTone(level: SignalLevel, kind: 'cost' | 'default' = 'default'): SignalTone {
  if (kind === 'cost') {
    if (level <= 2) return 'favorable'
    if (level === 3) return 'moderate'
    return 'elevated'
  }
  if (level >= 4) return 'favorable'
  if (level === 3) return 'moderate'
  if (level === 2) return 'elevated'
  return 'challenging'
}

export function levelWords(level: SignalLevel, kind: 'cost' | 'default' = 'default') {
  if (kind === 'cost') {
    return ['', 'Lower', 'Lower–mid', 'Moderate', 'Higher', 'Peak'][level]
  }
  return ['', 'Challenging', 'Variable', 'Moderate', 'Favorable', 'Excellent'][level]
}

export function monthFromDate(iso: string) {
  if (!iso) return null
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  return d.getMonth() + 1
}

export function buildClimateSignals(month: number | null): TripSignal[] {
  const data = month
    ? MONTH_SIGNALS.find((m) => m.month === month) ?? MONTH_SIGNALS[9]
    : null

  if (!data) {
    return [
      {
        id: 'climate',
        icon: '🌡',
        label: 'Climate',
        level: 3,
        tone: 'moderate',
        valueLabel: 'Varies',
        detail: 'Pick dates for seasonal signals',
      },
      {
        id: 'weather',
        icon: '☀️',
        label: 'Weather',
        level: 3,
        tone: 'moderate',
        valueLabel: 'Flexible',
      },
      {
        id: 'crowds',
        icon: '👥',
        label: 'Crowds',
        level: 3,
        tone: 'moderate',
        valueLabel: 'Typical',
      },
      {
        id: 'cost',
        icon: '💰',
        label: 'Typical cost',
        level: 3,
        tone: 'moderate',
        valueLabel: 'Moderate',
      },
      {
        id: 'sightseeing',
        icon: '📸',
        label: 'Sightseeing',
        level: 4,
        tone: 'favorable',
        valueLabel: 'Strong year-round',
      },
    ]
  }

  return [
    {
      id: 'climate',
      icon: '🌡',
      label: 'Temperature',
      level: data.weather,
      tone: levelTone(data.weather),
      valueLabel: data.tempLabel,
      detail: data.note,
    },
    {
      id: 'weather',
      icon: '☀️',
      label: 'Weather',
      level: data.weather,
      tone: levelTone(data.weather),
      valueLabel: levelWords(data.weather),
    },
    {
      id: 'crowds',
      icon: '👥',
      label: 'Crowds',
      level: data.crowds,
      tone: levelTone(data.crowds),
      valueLabel: levelWords(data.crowds),
    },
    {
      id: 'cost',
      icon: '💰',
      label: 'Typical cost',
      level: data.cost,
      tone: levelTone(data.cost, 'cost'),
      valueLabel: levelWords(data.cost, 'cost'),
    },
    {
      id: 'sightseeing',
      icon: '📸',
      label: 'Sightseeing',
      level: data.sightseeing,
      tone: levelTone(data.sightseeing),
      valueLabel: levelWords(data.sightseeing),
    },
  ]
}

export function compareMonths(a: number, b: number) {
  const ma = MONTH_SIGNALS.find((m) => m.month === a)!
  const mb = MONTH_SIGNALS.find((m) => m.month === b)!
  const delta = (x: number, y: number) => {
    const d = x - y
    if (d > 0) return `+${d}`
    if (d < 0) return `${d}`
    return 'Similar'
  }
  return {
    label: `${ma.name.slice(0, 3)} vs ${mb.name.slice(0, 3)}`,
    weather: delta(ma.weather, mb.weather),
    crowds: delta(ma.crowds, mb.crowds),
    cost: delta(ma.cost, mb.cost) === 'Similar' ? 'Similar' : delta(ma.cost, mb.cost),
  }
}

export function tripShapeForDays(days: number) {
  if (days <= 5) return TRIP_SHAPES[5]
  if (days <= 7) return TRIP_SHAPES[7]
  if (days <= 10) return TRIP_SHAPES[10]
  if (days <= 14) return TRIP_SHAPES[14]
  return TRIP_SHAPES[21]
}

/** Adjust trip-fit framing when budget is known — budget shapes how ambitious the route can feel. */
export function tripFitForBudget(
  days: number,
  budgetKnown: boolean,
  budgetTarget: number,
) {
  const base = tripShapeForDays(days)
  if (!budgetKnown) {
    return {
      ...base,
      regionsLabel: `${base.regions}–${base.regions + 1}`,
      fitNote: null as string | null,
    }
  }

  const tier = budgetTier(budgetTarget)
  if (tier === 'luxury') {
    const regions = Math.max(1, base.regions - 1)
    return {
      regions,
      routes: base.routes.map((r) => r.slice(0, Math.max(2, regions))),
      regionsLabel: `${regions}–${regions + 1}`,
      fitNote: 'Your budget favors fewer stops with richer stays and smoother transfers.',
    }
  }
  if (tier === 'premium') {
    return {
      ...base,
      regionsLabel: `${base.regions}–${base.regions + 1}`,
      fitNote: 'Your budget supports comfortable hops between regions without rushing.',
    }
  }
  return {
    ...base,
    regionsLabel: `${base.regions}–${base.regions + 1}`,
    fitNote: 'Your budget favors efficient routes and high-value stops.',
  }
}

export function paceDensity(style: 'relaxed' | 'balanced' | 'packed'): SignalLevel {
  if (style === 'relaxed') return 3
  if (style === 'balanced') return 4
  return 5
}
