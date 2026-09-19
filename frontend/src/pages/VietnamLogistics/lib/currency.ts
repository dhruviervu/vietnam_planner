export type FxRates = {
  base: string
  rates: Record<string, number>
  timestamp: string
  source: string
}

/** Fallback mid-market approximations if the live fetch fails. */
export const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1,
  VND: 25500,
  INR: 84,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.55,
  SGD: 1.35,
  CAD: 1.38,
  JPY: 150,
}

/**
 * Fetch USD-based mid-market rates (includes VND).
 * open.er-api.com is free and CORS-friendly for browser use.
 */
export async function fetchUsdRates(): Promise<FxRates> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD')
  if (!res.ok) throw new Error('FX fetch failed')
  const data = (await res.json()) as {
    result?: string
    base_code?: string
    time_last_update_utc?: string
    rates?: Record<string, number>
  }
  if (data.result !== 'success' || !data.rates) throw new Error('FX payload invalid')
  return {
    base: data.base_code ?? 'USD',
    rates: data.rates,
    timestamp: data.time_last_update_utc ?? new Date().toISOString(),
    source: 'open.er-api.com (ExchangeRate-API)',
  }
}

/** Convert `amount` in `from` into `to` using USD-cross rates. */
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  usdRates: Record<string, number>,
): number | null {
  const fromRate = usdRates[from]
  const toRate = usdRates[to]
  if (!fromRate || !toRate || fromRate <= 0) return null
  const inUsd = amount / fromRate
  return inUsd * toRate
}

export function formatMoney(amount: number, currency: string): string {
  if (currency === 'VND') {
    return `₫${Math.round(amount).toLocaleString('en-US')}`
  }
  if (currency === 'JPY') {
    return `¥${Math.round(amount).toLocaleString('en-US')}`
  }
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'USD' || currency === 'EUR' || currency === 'GBP' ? 2 : 0,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function vndToDisplay(
  vnd: number,
  display: string,
  usdRates: Record<string, number>,
): number | null {
  return convertAmount(vnd, 'VND', display, usdRates)
}

const PREFERRED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'AUD',
  'CAD',
  'SGD',
  'JPY',
  'CNY',
  'KRW',
  'THB',
  'MYR',
  'NZD',
  'CHF',
  'HKD',
  'AED',
  'ZAR',
  'BRL',
  'MXN',
  'PHP',
  'IDR',
  'VND',
]

/** Every ISO code present in the live (or fallback) USD rate table. */
export function listedCurrencies(usdRates: Record<string, number>): string[] {
  const fromRates = Object.keys(usdRates).filter((k) => /^[A-Z]{3}$/.test(k))
  const set = new Set(fromRates)
  const rest = [...set].filter((c) => !PREFERRED_CURRENCIES.includes(c)).sort()
  return [...PREFERRED_CURRENCIES.filter((c) => set.has(c)), ...rest]
}
