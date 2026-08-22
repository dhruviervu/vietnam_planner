import type { SimProvider } from './types'

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`

/**
 * Tourist SIM packages — approximate retail / tourist-desk pricing.
 * Labelled UPDATED, not live inventory.
 */
export const SIM_PROVIDERS: SimProvider[] = [
  {
    id: 'viettel',
    name: 'Viettel',
    image: img('photo-1556656793-08538906a9f8'),
    network: 'Viettel',
    coverage: 'Broad nationwide coverage — often strongest outside major cities',
    typicalPackage: 'Tourist data pack',
    dataGb: 15,
    validityDays: 30,
    priceUsdApprox: 12,
    priceVndApprox: 300000,
    has5g: true,
    esim: true,
    airport: true,
    cityStores: true,
    requirements: ['Passport for registration', 'Compatible unlocked phone'],
    badges: ['best-coverage', 'best-overall'],
    source: 'Curated tourist retail snapshot',
    lastUpdated: '2026-03-01',
    freshness: 'updated',
  },
  {
    id: 'vinaphone',
    name: 'Vinaphone',
    image: img('photo-1511707171634-5f897ff02aa9'),
    network: 'Vinaphone',
    coverage: 'Strong in cities and tourist corridors',
    typicalPackage: 'Tourist data pack',
    dataGb: 12,
    validityDays: 30,
    priceUsdApprox: 10,
    priceVndApprox: 250000,
    has5g: true,
    esim: true,
    airport: true,
    cityStores: true,
    requirements: ['Passport for registration', 'Compatible unlocked phone'],
    badges: ['best-value'],
    source: 'Curated tourist retail snapshot',
    lastUpdated: '2026-03-01',
    freshness: 'updated',
  },
  {
    id: 'mobifone',
    name: 'Mobifone',
    image: img('photo-1580910051074-3eb694886505'),
    network: 'Mobifone',
    coverage: 'Good urban coverage; check remote-area needs',
    typicalPackage: 'Tourist data pack',
    dataGb: 10,
    validityDays: 15,
    priceUsdApprox: 8,
    priceVndApprox: 200000,
    has5g: true,
    esim: true,
    airport: true,
    cityStores: true,
    requirements: ['Passport for registration'],
    badges: ['easiest-arrival'],
    source: 'Curated tourist retail snapshot',
    lastUpdated: '2026-03-01',
    freshness: 'updated',
  },
  {
    id: 'travel-esim',
    name: 'Travel eSIM (pre-arrival)',
    image: img('photo-1512941937669-90a1b58e7e9c'),
    network: 'Varies by reseller (often Viettel / Vinaphone)',
    coverage: 'Depends on underlying local network',
    typicalPackage: 'Install before landing',
    dataGb: 10,
    validityDays: 30,
    priceUsdApprox: 15,
    priceVndApprox: null,
    has5g: true,
    esim: true,
    airport: false,
    cityStores: false,
    requirements: ['eSIM-capable phone', 'QR / activation email before travel'],
    badges: ['best-esim'],
    source: 'Typical international eSIM marketplace pricing',
    lastUpdated: '2026-03-01',
    freshness: 'estimated',
  },
]

export const BUY_PATHS = [
  {
    id: 'airport',
    symbol: '✈️',
    title: 'Airport',
    tone: 'quick',
    summary: 'Quickest way to get connected after landing.',
    notes: ['Official desks or authorised kiosks', 'Passport usually required', 'Compare package size vs price'],
  },
  {
    id: 'store',
    symbol: '🏪',
    title: 'Official store',
    tone: 'choice',
    summary: 'Better plan choice and staff support in city centres.',
    notes: ['More package options', 'Helpful for registration issues', 'Slightly slower than airport grab-and-go'],
  },
  {
    id: 'esim',
    symbol: '📱',
    title: 'Online eSIM',
    tone: 'ready',
    summary: 'Ready before arrival if your phone supports eSIM.',
    notes: ['Install on Wi‑Fi before departure', 'Keep QR / order email offline', 'Confirm coverage network'],
  },
] as const

export function filterSimProviders(
  preference: 'physical' | 'esim' | 'airport' | null,
): SimProvider[] {
  if (!preference) return SIM_PROVIDERS
  if (preference === 'esim') return SIM_PROVIDERS.filter((p) => p.esim)
  if (preference === 'airport') return SIM_PROVIDERS.filter((p) => p.airport)
  return SIM_PROVIDERS.filter((p) => p.id !== 'travel-esim' || p.airport)
}
