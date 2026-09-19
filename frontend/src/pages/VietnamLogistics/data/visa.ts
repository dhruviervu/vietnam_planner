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
 * Ordinary-passport tourist exemptions (stay days).
 * Everyone else uses the 90-day e-visa — we resolve that here, not by sending the user away.
 */
const EXEMPT_DAYS: Record<string, number> = {
  // ASEAN
  BN: 14,
  KH: 30,
  ID: 30,
  LA: 30,
  MY: 30,
  MM: 30,
  PH: 21,
  SG: 30,
  TH: 30,
  // 45-day tourism stimulus (Resolutions 44 & 229 / NQ-CP)
  BY: 45,
  BE: 45,
  BG: 45,
  HR: 45,
  CZ: 45,
  DK: 45,
  FI: 45,
  FR: 45,
  DE: 45,
  HU: 45,
  IT: 45,
  JP: 45,
  KR: 45,
  LU: 45,
  NL: 45,
  NO: 45,
  PL: 45,
  RO: 45,
  RU: 45,
  SK: 45,
  SI: 45,
  ES: 45,
  SE: 45,
  CH: 45,
  GB: 45,
  // Bilateral / other ordinary-passport exemptions
  CL: 90,
  PA: 90,
  KZ: 30,
  KG: 30,
  MN: 30,
}

function citizenProfile(): VisaProfile {
  return {
    countryCode: 'VN',
    status: 'exempt',
    headline: 'Vietnamese citizen',
    summary:
      'A Vietnamese passport is for entering as a citizen — no tourist visa or e-visa is needed.',
    primaryTypeId: null,
    types: [
      {
        id: 'citizen',
        label: 'Citizen entry',
        stayDays: null,
        feeUsd: [0, 0],
        processingDays: null,
        entries: 'Not a tourist visa',
      },
    ],
    requirements: [
      {
        id: 'passport',
        label: 'Valid Vietnamese passport',
        state: 'required',
      },
    ],
    conditions: [],
    passportValidityMonths: null,
    officialSourceUrl: OFFICIAL,
    officialSourceLabel: OFFICIAL_LABEL,
    lastVerified: VERIFIED,
    confidence: 'updated',
  }
}

const PROFILES: Record<string, VisaProfile> = {
  VN: citizenProfile(),
  ...Object.fromEntries(
    Object.entries(EXEMPT_DAYS).map(([code, days]) => [
      code,
      exemptProfile(code, days, [
        `Visa-free for about ${days} days on a qualifying short tourist stay.`,
      ]),
    ]),
  ),
}

export function getVisaProfile(countryCode: string | null): VisaProfile | null {
  if (!countryCode) return null
  if (countryCode === 'VN') return PROFILES.VN
  return PROFILES[countryCode] ?? evisaProfile(countryCode)
}

export const VISA_PROCESS_STEPS = [
  { n: 1, label: 'Check eligibility' },
  { n: 2, label: 'Prepare documents' },
  { n: 3, label: 'Apply online' },
  { n: 4, label: 'Pay fee' },
  { n: 5, label: 'Receive decision' },
] as const
