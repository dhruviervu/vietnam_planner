import type { VisaProfile, VisaRequirement, VisaTypeOption } from './types'

const OFFICIAL = 'https://evisa.gov.vn/'
const OFFICIAL_LABEL = 'Official Vietnam e-visa portal'
/** Curated check date — rules change; always verify officially. */
const VERIFIED = '2026-04-15'

const EVISA_TYPES: VisaTypeOption[] = [
  {
    id: 'tourist-evisa-single',
    label: 'Tourist e-visa (single entry)',
    stayDays: 90,
    feeUsd: [25, 25],
    processingDays: [3, 5],
    entries: 'Single entry',
    note: 'Official government fee via evisa.gov.vn — third-party agents may charge more.',
  },
  {
    id: 'tourist-evisa-multi',
    label: 'Tourist e-visa (multiple entry)',
    stayDays: 90,
    feeUsd: [50, 50],
    processingDays: [3, 5],
    entries: 'Multiple entry within validity',
    note: 'Useful if you exit and re-enter Vietnam within the e-visa window.',
  },
]

const BASE_REQS: VisaRequirement[] = [
  {
    id: 'passport',
    label: 'Valid passport',
    state: 'required',
    note: 'Typically at least 6 months validity from entry — confirm on the official portal.',
  },
  {
    id: 'photo',
    label: 'Passport-style photograph',
    state: 'required',
    note: 'Digital photo meeting e-visa specifications.',
  },
  {
    id: 'bio-page',
    label: 'Passport bio-page scan',
    state: 'required',
  },
  {
    id: 'application',
    label: 'Online application',
    state: 'required',
  },
  {
    id: 'payment',
    label: 'Fee payment',
    state: 'required',
    note: 'Paid on the official portal; non-refundable if refused.',
  },
  {
    id: 'onward',
    label: 'Onward / return plan',
    state: 'conditional',
    note: 'Airlines or border officers may ask — keep evidence of onward travel.',
  },
]

function evisaProfile(
  countryCode: string,
  extraConditions: string[] = [],
): VisaProfile {
  return {
    countryCode,
    status: 'required',
    headline: 'Visa required',
    summary:
      'Most short tourist visits use the official e-visa. Apply before travel and carry a printed or offline copy.',
    primaryTypeId: 'tourist-evisa-single',
    types: EVISA_TYPES,
    requirements: BASE_REQS,
    conditions: [
      'Apply only via the official government portal unless you knowingly choose a paid agency.',
      'Entry is only at approved ports listed on the e-visa approval.',
      ...extraConditions,
    ],
    passportValidityMonths: 6,
    officialSourceUrl: OFFICIAL,
    officialSourceLabel: OFFICIAL_LABEL,
    lastVerified: VERIFIED,
    confidence: 'updated',
  }
}

function exemptProfile(
  countryCode: string,
  stayDays: number,
  conditions: string[],
): VisaProfile {
  return {
    countryCode,
    status: 'exempt',
    headline: 'Visa exempt',
    summary: `Eligible stays of up to ${stayDays} days may enter without a visa under the applicable exemption — confirm duration and conditions before travel.`,
    primaryTypeId: null,
    types: [
      {
        id: 'exemption',
        label: 'Visa exemption (tourism / short stay)',
        stayDays,
        feeUsd: [0, 0],
        processingDays: null,
        entries: 'Per applicable exemption rules',
        note: 'Exemption rules can change. Verify stay length and purpose before travel.',
      },
      ...EVISA_TYPES.map((t) => ({
        ...t,
        note: 'Available if you need a longer or multiple-entry stay beyond exemption.',
      })),
    ],
    requirements: [
      {
        id: 'passport',
        label: 'Valid passport',
        state: 'required',
        note: 'Confirm remaining validity requirements with official sources.',
      },
      {
        id: 'purpose',
        label: 'Eligible travel purpose',
        state: 'required',
        note: 'Exemption usually covers tourism / short visits — not all activities.',
      },
      {
        id: 'onward',
        label: 'Onward / return plan',
        state: 'conditional',
      },
      {
        id: 'application',
        label: 'e-visa application',
        state: 'not-required',
        note: 'Not needed for a qualifying exempt stay — still useful for longer trips.',
      },
    ],
    conditions,
    passportValidityMonths: 6,
    officialSourceUrl: OFFICIAL,
    officialSourceLabel: OFFICIAL_LABEL,
    lastVerified: VERIFIED,
    confidence: 'updated',
  }
}

/**
 * Curated entry snapshots for common passports.
 * Always verify on evisa.gov.vn — exemptions and fees change.
 */
const PROFILES: Record<string, VisaProfile> = {
  IN: evisaProfile('IN'),
  US: evisaProfile('US'),
  GB: evisaProfile('GB'),
  AU: evisaProfile('AU'),
  CA: evisaProfile('CA'),
  DE: evisaProfile('DE'),
  FR: evisaProfile('FR'),
  JP: evisaProfile('JP'),
  KR: evisaProfile('KR'),
  CN: evisaProfile('CN'),
  TW: evisaProfile('TW'),
  HK: evisaProfile('HK'),
  NZ: evisaProfile('NZ'),
  IE: evisaProfile('IE'),
  NL: evisaProfile('NL'),
  IT: evisaProfile('IT'),
  ES: evisaProfile('ES'),
  SE: evisaProfile('SE'),
  NO: evisaProfile('NO'),
  CH: evisaProfile('CH'),
  AE: evisaProfile('AE'),
  SA: evisaProfile('SA'),
  ZA: evisaProfile('ZA'),
  BR: evisaProfile('BR'),
  MX: evisaProfile('MX'),
  RU: evisaProfile('RU'),
  PL: evisaProfile('PL'),
  PT: evisaProfile('PT'),
  BE: evisaProfile('BE'),
  AT: evisaProfile('AT'),
  DK: evisaProfile('DK'),
  FI: evisaProfile('FI'),
  IL: evisaProfile('IL'),
  // ASEAN — often visa-exempt for short tourism stays; duration varies by nationality.
  SG: exemptProfile('SG', 30, [
    'Singapore passport holders commonly qualify for short visa-free stays — confirm current length.',
  ]),
  MY: exemptProfile('MY', 30, [
    'Malaysian passport holders commonly qualify for short visa-free stays — confirm current length.',
  ]),
  TH: exemptProfile('TH', 30, [
    'Thai passport holders commonly qualify for short visa-free stays — confirm current length.',
  ]),
  ID: exemptProfile('ID', 30, [
    'Indonesian passport holders commonly qualify for short visa-free stays — confirm current length.',
  ]),
  PH: exemptProfile('PH', 21, [
    'Philippine passport holders may have a shorter exemption window than some ASEAN neighbours — verify exactly.',
  ]),
  KH: exemptProfile('KH', 30, [
    'Cambodian passport holders commonly qualify for short visa-free stays — confirm current length.',
  ]),
  LA: exemptProfile('LA', 30, [
    'Lao passport holders commonly qualify for short visa-free stays — confirm current length.',
  ]),
}

const FALLBACK: VisaProfile = {
  countryCode: 'XX',
  status: 'unknown',
  headline: 'Check official source',
  summary:
    'We do not have a curated entry snapshot for this passport yet. Use the official e-visa portal to confirm eligibility, stay length and fees.',
  primaryTypeId: 'tourist-evisa-single',
  types: EVISA_TYPES,
  requirements: BASE_REQS,
  conditions: ['Do not rely on third-party summaries alone.'],
  passportValidityMonths: 6,
  officialSourceUrl: OFFICIAL,
  officialSourceLabel: OFFICIAL_LABEL,
  lastVerified: null,
  confidence: 'unknown',
}

export function getVisaProfile(countryCode: string | null): VisaProfile | null {
  if (!countryCode) return null
  return PROFILES[countryCode] ?? { ...FALLBACK, countryCode }
}

export const VISA_PROCESS_STEPS = [
  { n: 1, label: 'Check eligibility' },
  { n: 2, label: 'Prepare documents' },
  { n: 3, label: 'Apply online' },
  { n: 4, label: 'Pay fee' },
  { n: 5, label: 'Receive decision' },
] as const
