export type OriginCountry = {
  code: string
  name: string
  flag: string
  currency: string
  popular?: boolean
}

const POPULAR_CODES = new Set([
  'IN',
  'US',
  'GB',
  'AU',
  'CA',
  'DE',
  'FR',
  'SG',
  'MY',
  'TH',
  'JP',
  'KR',
])

/** ISO 3166-1 alpha-2 — every listed country / territory, not a traveller subset. */
const ISO_ALPHA2 = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
] as const

function flagFromCode(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return '🏳️'
  const base = 0x1f1e6
  return String.fromCodePoint(...[...code].map((c) => base + c.charCodeAt(0) - 65))
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export const ORIGIN_COUNTRIES: OriginCountry[] = ISO_ALPHA2.map((code) => ({
  code,
  name: regionNames.of(code) ?? code,
  flag: flagFromCode(code),
  currency: 'USD',
  popular: POPULAR_CODES.has(code) || undefined,
})).sort((a, b) => a.name.localeCompare(b.name))

export function getOriginCountry(code: string | null) {
  if (!code) return null
  return ORIGIN_COUNTRIES.find((c) => c.code === code) ?? null
}

export function searchOriginCountries(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return ORIGIN_COUNTRIES.filter((c) => c.popular).concat(
      ORIGIN_COUNTRIES.filter((c) => !c.popular),
    )
  }
  return ORIGIN_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q),
  )
}
