import type { DataFreshness } from './types'

export type TrustItem = {
  id: string
  label: string
  status: string
  freshness: DataFreshness
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    id: 'visa',
    label: 'Visa',
    status: 'Official portal · curated snapshot — always re-check',
    freshness: 'updated',
  },
  {
    id: 'currency',
    label: 'Currency',
    status: 'Live market mid-rate when connected',
    freshness: 'live',
  },
  {
    id: 'sim',
    label: 'SIM',
    status: 'Typical tourist packages · updated recently',
    freshness: 'updated',
  },
  {
    id: 'cost',
    label: 'Cost',
    status: 'Typical traveller ranges · not live quotes',
    freshness: 'typical',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    status: 'General guidance · not product advice',
    freshness: 'typical',
  },
]

export function freshnessLabel(f: DataFreshness): string {
  if (f === 'live') return 'LIVE'
  if (f === 'current') return 'CURRENT'
  if (f === 'updated') return 'UPDATED'
  if (f === 'typical') return 'TYPICAL'
  if (f === 'estimated') return 'ESTIMATED'
  return 'UNKNOWN'
}
