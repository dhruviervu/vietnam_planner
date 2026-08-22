export type OriginCountry = {
  code: string
  name: string
  flag: string
  currency: string
  popular?: boolean
}

/** Common traveller origins — searchable subset, not every ISO country. */
export const ORIGIN_COUNTRIES: OriginCountry[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', popular: true },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', popular: true },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', popular: true },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', popular: true },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', popular: true },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', popular: true },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', popular: true },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', popular: true },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', popular: true },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB', popular: true },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', popular: true },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', popular: true },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', currency: 'TWD' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', currency: 'KHR' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', currency: 'LAK' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', currency: 'EUR' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', currency: 'EUR' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', currency: 'ILS' },
]

export function getOriginCountry(code: string | null) {
  if (!code) return null
  return ORIGIN_COUNTRIES.find((c) => c.code === code) ?? null
}

export function searchOriginCountries(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return ORIGIN_COUNTRIES.filter((c) => c.popular).concat(
    ORIGIN_COUNTRIES.filter((c) => !c.popular),
  )
  return ORIGIN_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q),
  )
}
