export type DataFreshness =
  | 'live'
  | 'current'
  | 'updated'
  | 'typical'
  | 'estimated'
  | 'unknown'

export type TravellerType = 'solo' | 'couple' | 'family' | 'friends'

export type TripLength = 'short' | 'medium' | 'long' // ~<2w, 2–4w, 4w+

export type TravelProfile = {
  originCountryCode: string | null
  tripLength: TripLength | null
  travellerType: TravellerType | null
  arrivalDate: string | null
}

export type VisaStatus = 'exempt' | 'required' | 'conditional' | 'unknown'

export type VisaRequirementState = 'required' | 'conditional' | 'not-required'

export type VisaRequirement = {
  id: string
  label: string
  state: VisaRequirementState
  note?: string
}

export type VisaTypeOption = {
  id: string
  label: string
  stayDays: number | null
  feeUsd: [number, number] | null
  processingDays: [number, number] | null
  entries: string
  note?: string
}

export type VisaProfile = {
  countryCode: string
  status: VisaStatus
  headline: string
  summary: string
  primaryTypeId: string | null
  types: VisaTypeOption[]
  requirements: VisaRequirement[]
  conditions: string[]
  passportValidityMonths: number | null
  officialSourceUrl: string
  officialSourceLabel: string
  lastVerified: string | null
  confidence: DataFreshness
}

export type SimPreference = 'physical' | 'esim' | 'airport' | null

export type SimProvider = {
  id: string
  name: string
  image: string
  network: string
  coverage: string
  typicalPackage: string
  dataGb: number
  validityDays: number
  priceUsdApprox: number
  priceVndApprox: number | null
  has5g: boolean
  esim: boolean
  airport: boolean
  cityStores: boolean
  requirements: string[]
  badges: Array<'best-overall' | 'best-value' | 'best-esim' | 'easiest-arrival' | 'best-coverage'>
  source: string
  lastUpdated: string
  freshness: DataFreshness
}

export type CostCityId =
  | 'hanoi'
  | 'hcmc'
  | 'da-nang'
  | 'hoi-an'
  | 'hue'
  | 'nha-trang'
  | 'dalat'
  | 'phu-quoc'

export type CostCategoryId =
  | 'restaurants'
  | 'groceries'
  | 'transport'
  | 'utilities'
  | 'leisure'
  | 'childcare'
  | 'clothing'
  | 'rent'

export type CostRangeVnd = {
  low: number
  typical: number
  high: number
  unit: string
}

export type CostCategory = {
  id: CostCategoryId
  label: string
  symbol: string
  description: string
  range: CostRangeVnd
}

export type PurchasingPowerExample = {
  id: string
  /** Anchor spend in VND — UI converts to the selected display currency */
  vndApprox: number
  /** Short plain-language frame for this spend level */
  sense: string
  items: { label: string; symbol: string; approxCount: string }[]
}

export type InsuranceImportance = 'essential' | 'useful' | 'depends'

export type InsuranceCoverageItem = {
  id: string
  label: string
  importance: InsuranceImportance
  description: string
  /** How this usually shows up on price */
  costLabel: string
  /** Typical premium impact in USD for a short tourist trip — illustrative */
  costUsd: [number, number] | null
  /** Plain “what this protects” line */
  protects: string
}

export type InsurancePlanTierId = 'essential' | 'standard' | 'complete'

export type InsurancePlanTier = {
  id: InsurancePlanTierId
  label: string
  tagline: string
  bestFor: string
  /** Approx total premium USD for a ~2-week Vietnam trip */
  priceUsd: [number, number]
  includes: string[]
  note: string
}

export type InsuranceExploreLink = {
  id: string
  label: string
  href: string
  blurb: string
}

export type InsuranceRisk = {
  id: string
  symbol: string
  label: string
  note: string
}

export type InsuranceActivityId =
  | 'scooter'
  | 'water'
  | 'adventure'
  | 'multi-city'
  | 'equipment'
  | 'families'

export type DisplayCurrency = 'VND' | 'USD' | 'INR' | 'EUR' | 'GBP' | 'AUD'
