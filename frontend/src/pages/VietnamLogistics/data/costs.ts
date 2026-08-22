import type {
  CostCategory,
  CostCategoryId,
  CostCityId,
  PurchasingPowerExample,
  TravellerType,
} from './types'

export const COST_CITIES: { id: CostCityId; label: string }[] = [
  { id: 'hanoi', label: 'Hanoi' },
  { id: 'hcmc', label: 'Ho Chi Minh City' },
  { id: 'da-nang', label: 'Da Nang' },
  { id: 'hoi-an', label: 'Hoi An' },
  { id: 'hue', label: 'Hue' },
  { id: 'nha-trang', label: 'Nha Trang' },
  { id: 'dalat', label: 'Da Lat' },
  { id: 'phu-quoc', label: 'Phu Quoc' },
]

/** City multipliers vs a national tourist baseline (1.0 = typical big-city tourist spend). */
export const CITY_COST_INDEX: Record<
  CostCityId,
  { food: number; stay: number; transport: number; leisure: number }
> = {
  hanoi: { food: 1.0, stay: 1.05, transport: 1.0, leisure: 1.0 },
  hcmc: { food: 1.05, stay: 1.1, transport: 1.05, leisure: 1.1 },
  'da-nang': { food: 0.95, stay: 1.0, transport: 0.95, leisure: 1.0 },
  'hoi-an': { food: 0.95, stay: 1.05, transport: 0.85, leisure: 0.95 },
  hue: { food: 0.85, stay: 0.85, transport: 0.85, leisure: 0.8 },
  'nha-trang': { food: 0.95, stay: 1.0, transport: 0.9, leisure: 1.05 },
  dalat: { food: 0.9, stay: 0.9, transport: 0.9, leisure: 0.9 },
  'phu-quoc': { food: 1.1, stay: 1.25, transport: 1.15, leisure: 1.2 },
}

/**
 * Typical tourist-facing VND ranges (not resident cost-of-living CPI).
 * Sources: curated from common traveller price bands — TYPICAL, not live quotes.
 */
export const COST_CATEGORIES: CostCategory[] = [
  {
    id: 'restaurants',
    label: 'Restaurants',
    symbol: '🍜',
    description: 'Per person meal, tourist areas',
    range: { low: 40000, typical: 120000, high: 450000, unit: 'per meal' },
  },
  {
    id: 'groceries',
    label: 'Markets / Groceries',
    symbol: '🛒',
    description: 'Weekly self-catering basket for one',
    range: { low: 350000, typical: 650000, high: 1200000, unit: 'per week' },
  },
  {
    id: 'transport',
    label: 'Transportation',
    symbol: '🚕',
    description: 'Short urban hop (ride-hail / taxi)',
    range: { low: 25000, typical: 70000, high: 200000, unit: 'per short trip' },
  },
  {
    id: 'utilities',
    label: 'Utilities',
    symbol: '💡',
    description: 'Monthly basics if renting (illustrative)',
    range: { low: 800000, typical: 1500000, high: 3000000, unit: 'per month' },
  },
  {
    id: 'leisure',
    label: 'Sports & Leisure',
    symbol: '🎯',
    description: 'Attraction ticket or activity',
    range: { low: 50000, typical: 250000, high: 1500000, unit: 'per activity' },
  },
  {
    id: 'childcare',
    label: 'Childcare',
    symbol: '🧸',
    description: 'Occasional babysitting / kids activity (where available)',
    range: { low: 200000, typical: 500000, high: 1200000, unit: 'per session' },
  },
  {
    id: 'clothing',
    label: 'Clothing & Shoes',
    symbol: '👕',
    description: 'Mid-market item in a city mall / boutique',
    range: { low: 150000, typical: 450000, high: 2000000, unit: 'per item' },
  },
  {
    id: 'rent',
    label: 'Rent',
    symbol: '🏠',
    description: 'Tourist apartment / mid hotel-night equivalent monthly',
    range: { low: 8000000, typical: 18000000, high: 45000000, unit: 'per month' },
  },
]

export const MONTHLY_SPEND_VND: Record<
  TravellerType,
  { housing: number; food: number; transport: number; utilities: number; leisure: number; other: number }
> = {
  solo: {
    housing: 12000000,
    food: 4500000,
    transport: 1500000,
    utilities: 800000,
    leisure: 2500000,
    other: 1500000,
  },
  couple: {
    housing: 16000000,
    food: 7500000,
    transport: 2200000,
    utilities: 1200000,
    leisure: 4000000,
    other: 2500000,
  },
  family: {
    housing: 22000000,
    food: 11000000,
    transport: 3000000,
    utilities: 1800000,
    leisure: 5500000,
    other: 4000000,
  },
  friends: {
    housing: 14000000,
    food: 6000000,
    transport: 2000000,
    utilities: 1000000,
    leisure: 3500000,
    other: 2200000,
  },
}

/** Purchasing-power vignettes anchored in VND so every UI currency stays consistent. */
export const PURCHASING_POWER: PurchasingPowerExample[] = [
  {
    id: 'sip',
    vndApprox: 25000,
    sense: 'A small everyday moment',
    items: [
      { label: 'Iced coffee', symbol: '☕', approxCount: 'About 1 street coffee' },
      { label: 'Water', symbol: '💧', approxCount: '2–3 bottles' },
      { label: 'Snack', symbol: '🥖', approxCount: 'A simple street snack' },
    ],
  },
  {
    id: 'lunch',
    vndApprox: 125000,
    sense: 'A light local lunch outing',
    items: [
      { label: 'Local meals', symbol: '🍜', approxCount: '2–3 inexpensive meals' },
      { label: 'Coffee', symbol: '☕', approxCount: '2–3 iced coffees' },
      { label: 'Short rides', symbol: '🛵', approxCount: '1–2 short city hops' },
    ],
  },
  {
    id: 'day',
    vndApprox: 250000,
    sense: 'A comfortable half-day out',
    items: [
      { label: 'Meal', symbol: '🍜', approxCount: '1 mid-range meal for one' },
      { label: 'Ticket', symbol: '🎫', approxCount: '1 typical attraction entry' },
      { label: 'Transport', symbol: '🚕', approxCount: 'A few short local rides' },
    ],
  },
  {
    id: 'full',
    vndApprox: 600000,
    sense: 'A fuller tourist day',
    items: [
      { label: 'Food', symbol: '🍜', approxCount: 'Meals + drinks for the day' },
      { label: 'Activity', symbol: '🎯', approxCount: '1 paid experience or tour slice' },
      { label: 'Getting around', symbol: '🚌', approxCount: 'Most short urban trips covered' },
    ],
  },
  {
    id: 'treat',
    vndApprox: 1200000,
    sense: 'A treat-yourself day',
    items: [
      { label: 'Nice dinner', symbol: '🍽️', approxCount: '1 sit-down meal for one–two' },
      { label: 'Café / dessert', symbol: '☕', approxCount: 'A café stop or two' },
      { label: 'Flex', symbol: '🛍️', approxCount: 'Room for a souvenir or ride' },
    ],
  },
]

export function getCategory(id: CostCategoryId) {
  return COST_CATEGORIES.find((c) => c.id === id) ?? COST_CATEGORIES[0]
}

export function scaleRange(
  range: CostCategory['range'],
  factor: number,
): CostCategory['range'] {
  return {
    ...range,
    low: Math.round(range.low * factor),
    typical: Math.round(range.typical * factor),
    high: Math.round(range.high * factor),
  }
}
