import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getOriginCountry,
  ORIGIN_COUNTRIES,
  searchOriginCountries,
} from '../data/countries'
import { getVisaProfile, VISA_PROCESS_STEPS } from '../data/visa'
import type { TripLength, VisaProfile, VisaTypeOption } from '../data/types'
import { ChipButton, Label, SectionIntro, SoftBand } from './ui'

type Props = {
  originCountryCode: string | null
  onOriginChange: (code: string | null) => void
  tripLength?: TripLength | null
}

type Purpose = 'tourist' | 'business' | 'transit' | 'other'

const POPULAR = ['IN', 'US', 'GB', 'AU', 'DE'] as const

const STEP_DETAIL: Record<number, string> = {
  1: 'Confirm your passport is eligible and the stay purpose matches the route you will use.',
  2: 'Prepare a passport scan, compliant photo and accurate travel dates before starting the form.',
  3: 'Submit only through the official portal unless you knowingly choose a paid agency.',
  4: 'Pay the stated government fee online. Fees are typically non-refundable if refused.',
  5: 'Download or print the approval and keep an offline copy for travel day.',
}

function statusVisual(status: VisaProfile['status']) {
  if (status === 'exempt') {
    return {
      icon: '🟢',
      label: 'VISA EXEMPT',
      tone: 'text-sage',
      band: 'border-sage/30 bg-sage/10',
    }
  }
  if (status === 'conditional') {
    return {
      icon: '🟡',
      label: 'CONDITIONAL',
      tone: 'text-ink',
      band: 'border-ink/15 bg-ink/[0.04]',
    }
  }
  if (status === 'unknown') {
    return {
      icon: '🟡',
      label: 'CHECK OFFICIAL SOURCE',
      tone: 'text-ink',
      band: 'border-ink/15 bg-ink/[0.04]',
    }
  }
  return {
    icon: '🟠',
    label: 'VISA REQUIRED',
    tone: 'text-terracotta',
    band: 'border-terracotta/25 bg-terracotta/[0.06]',
  }
}

function tripLengthDays(tripLength: TripLength | null | undefined): number | null {
  if (tripLength === 'short') return 10
  if (tripLength === 'medium') return 21
  if (tripLength === 'long') return 35
  return null
}

function pickType(
  profile: VisaProfile,
  purpose: Purpose,
): { type: VisaTypeOption | null; purposeNote: string | null } {
  if (purpose === 'tourist') {
    const type =
      profile.types.find((t) => t.id === profile.primaryTypeId) ??
      profile.types.find((t) => /tourist|exemption/i.test(t.label)) ??
      profile.types[0] ??
      null
    return { type, purposeNote: null }
  }
  return {
    type: null,
    purposeNote:
      'This curated snapshot focuses on short tourist stays. For business, transit or other purposes, verify the correct route on the official portal.',
  }
}

export function VisaSection({
  originCountryCode,
  onOriginChange,
  tripLength = null,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [purpose, setPurpose] = useState<Purpose>('tourist')
  const [openReq, setOpenReq] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(1)
  const rootRef = useRef<HTMLDivElement>(null)

  const country = getOriginCountry(originCountryCode)
  const profile = getVisaProfile(originCountryCode)
  const results = useMemo(() => searchOriginCountries(query).slice(0, 10), [query])
  const popular = useMemo(
    () =>
      POPULAR.map((code) => ORIGIN_COUNTRIES.find((c) => c.code === code)).filter(Boolean),
    [],
  )

  const { type: selectedType, purposeNote } = profile
    ? pickType(profile, purpose)
    : { type: null, purposeNote: null }

  const effectiveStatus =
    purpose !== 'tourist' && profile?.status !== 'unknown'
      ? ('conditional' as const)
      : profile?.status ?? null

  const visual = effectiveStatus ? statusVisual(effectiveStatus) : null
  const plannedDays = tripLengthDays(tripLength)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function selectCountry(code: string) {
    onOriginChange(code)
    setQuery('')
    setOpen(false)
    setPurpose('tourist')
    setOpenReq(null)
    setActiveStep(1)
  }

  const tripMeaning = (() => {
    if (!profile) return null
    if (purpose !== 'tourist') {
      return purposeNote
    }
    if (profile.status === 'exempt' && selectedType?.stayDays) {
      if (plannedDays && plannedDays <= selectedType.stayDays) {
        return `Your planned stay is comfortably within the stated visa-free duration of about ${selectedType.stayDays} days — still confirm current exemption rules.`
      }
      return `Short tourist visits may enter without a visa under the applicable exemption (up to about ${selectedType.stayDays} days). Confirm the exact duration before travel.`
    }
    if (selectedType?.stayDays) {
      if (plannedDays && plannedDays <= selectedType.stayDays) {
        return `Your planned stay fits within the typical ${selectedType.stayDays}-day tourist e-visa route.`
      }
      return 'Short tourist trips generally use the tourist e-visa route. Apply before departure and carry the approval.'
    }
    return profile.summary
  })()

  const beforeApplication = profile?.requirements.filter((r) =>
    ['passport', 'photo', 'bio-page', 'application', 'payment'].includes(r.id),
  )
  const atEntry = [
    { id: 'passport-entry', label: 'Valid passport', state: 'required' as const, note: profile?.passportValidityMonths ? `Typically ${profile.passportValidityMonths}+ months remaining — confirm officially.` : undefined },
    { id: 'approval', label: profile?.status === 'exempt' ? 'Eligible purpose / stay' : 'Visa / e-visa approval', state: 'required' as const, note: profile?.status === 'exempt' ? 'Exemption only covers eligible purposes and stay lengths.' : 'Carry a printed or offline copy of the approval.' },
    { id: 'port', label: 'Approved entry point', state: 'required' as const, note: 'Enter only through ports listed for your approval or exemption rules.' },
    ...(profile?.requirements.filter((r) => r.id === 'onward') ?? []),
  ]

  const watchOuts =
    profile?.status === 'exempt'
      ? [
          'Confirm passport validity before travel',
          'Confirm maximum stay and eligible purpose',
          'Do not assume exemption covers every activity',
        ]
      : [
          'Check passport validity before applying',
          'Apply through the official portal',
          'Confirm entry-port eligibility on your approval',
          'Visa approval does not replace border inspection',
        ]

  return (
    <section className="space-y-5">
      <SectionIntro
        id="logistics-visa"
        n="01 · Visa & Entry"
        title="Visa & Entry"
        support="Select your passport country and we'll show the entry route, stay rules, requirements and next steps."
      />

      {/* Primary control */}
      <div ref={rootRef} className="relative max-w-xl">
        <Label>Passport country</Label>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 flex h-14 w-full items-center justify-between gap-3 border border-ink/15 bg-paper px-4 text-left shadow-[0_1px_0_rgba(58,50,44,0.04)] transition hover:border-terracotta/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="text-[1.35rem] leading-none">{country?.flag ?? '🛂'}</span>
            <span className="min-w-0">
              <span className="block truncate text-[1rem] font-bold text-ink">
                {country ? country.name : 'Search / select country…'}
              </span>
              {country ? (
                <span className="text-[0.68rem] font-semibold tracking-wide text-muted">
                  {country.code}
                </span>
              ) : null}
            </span>
          </span>
          <span className="text-[0.7rem] text-muted">▾</span>
        </button>

        {open ? (
          <div
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-hidden border border-ink/12 bg-paper shadow-[0_12px_40px_rgba(28,22,18,0.12)]"
          >
            <div className="border-b border-ink/10 px-3 py-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country…"
                className="h-10 w-full bg-transparent text-[0.88rem] font-semibold text-ink placeholder:text-ink/35 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results[0]) selectCountry(results[0].code)
                  if (e.key === 'Escape') setOpen(false)
                }}
              />
            </div>
            <ul className="max-h-56 overflow-y-auto">
              {results.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === originCountryCode}
                    onClick={() => selectCountry(c.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-terracotta/[0.07] ${
                      c.code === originCountryCode ? 'bg-terracotta/[0.08]' : ''
                    }`}
                  >
                    <span className="text-[1.1rem]">{c.flag}</span>
                    <span className="flex-1 text-[0.88rem] font-bold text-ink">{c.name}</span>
                    <span className="text-[0.68rem] font-semibold text-muted">{c.code}</span>
                  </button>
                </li>
              ))}
              {!results.length ? (
                <li className="px-4 py-3 text-[0.78rem] text-muted">No countries match.</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <div className="mt-2.5 flex flex-wrap gap-1">
          {popular.map((c) =>
            c ? (
              <ChipButton
                key={c.code}
                active={c.code === originCountryCode}
                onClick={() => selectCountry(c.code)}
              >
                {c.flag} {c.name === 'United Kingdom' ? 'UK' : c.name === 'United States' ? 'United States' : c.name}
              </ChipButton>
            ) : null,
          )}
        </div>
      </div>

      {!profile || !country || !visual ? (
        <p className="text-[0.82rem] text-muted">Select a passport country to see your entry result.</p>
      ) : (
        <div className="space-y-5">
          {/* Purpose */}
          <div>
            <Label>What are you travelling for?</Label>
            <div className="mt-2 flex flex-wrap gap-1">
              {(
                [
                  ['tourist', 'Tourist'],
                  ['business', 'Business'],
                  ['transit', 'Transit'],
                  ['other', 'Other'],
                ] as const
              ).map(([id, label]) => (
                <ChipButton
                  key={id}
                  active={purpose === id}
                  onClick={() => setPurpose(id)}
                  className="!px-3.5 !py-2"
                >
                  {label}
                </ChipButton>
              ))}
            </div>
          </div>

          {/* Main workspace */}
          <div className={`border ${visual.band}`}>
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-ink/10 px-4 py-4 sm:px-5 sm:py-5 lg:border-b-0 lg:border-r lg:border-ink/10">
                <Label>Your entry status</Label>
                <p className="mt-2 text-[0.72rem] font-semibold tracking-wide text-ink/55">
                  {country.flag} {country.name.toUpperCase()}
                </p>
                <p className={`mt-2 font-serif text-[clamp(1.55rem,3vw,2.05rem)] font-semibold leading-[1.05] tracking-[-0.02em] ${visual.tone}`}>
                  <span className="mr-2 text-[1.1rem] align-middle" aria-hidden>
                    {visual.icon}
                  </span>
                  {visual.label}
                </p>
                <p className="mt-2 text-[0.9rem] font-bold text-ink">
                  {purpose !== 'tourist'
                    ? 'Verify purpose-specific route'
                    : selectedType?.label ?? profile.headline}
                </p>
                {purpose === 'tourist' && selectedType ? (
                  <p className="mt-1 text-[0.75rem] text-muted">
                    {selectedType.entries}
                    {selectedType.stayDays ? ` · up to ${selectedType.stayDays} days` : ''}
                    {selectedType.feeUsd
                      ? selectedType.feeUsd[0] === 0
                        ? ' · no visa fee'
                        : ` · $${selectedType.feeUsd[0]}`
                      : ''}
                    {selectedType.processingDays
                      ? ` · ${selectedType.processingDays[0]}–${selectedType.processingDays[1]} working days`
                      : ''}
                  </p>
                ) : null}
                <p className="mt-3 max-w-[42ch] text-[0.8rem] leading-snug text-ink/80">
                  {purpose !== 'tourist'
                    ? purposeNote
                    : profile.status === 'exempt'
                      ? profile.summary
                      : 'Most short tourist visits can use the e-visa route. Apply before travelling.'}
                </p>
              </div>

              <div className="px-4 py-4 sm:px-5 sm:py-5">
                <Label>What this means</Label>
                <ul className="mt-3 space-y-2">
                  {(profile.status === 'exempt' && purpose === 'tourist'
                    ? [
                        'No visa application for a qualifying short stay',
                        'Confirm maximum stay and eligible purpose',
                        'Carry a passport meeting validity rules',
                        'Still respect entry conditions at the border',
                      ]
                    : purpose !== 'tourist'
                      ? [
                          'Tourist e-visa data may not apply',
                          'Confirm the correct visa category officially',
                          'Do not travel on assumptions for this purpose',
                          'Use the official source before booking',
                        ]
                      : [
                          'Apply before travel',
                          'Use the official application route',
                          'Enter only through approved entry points',
                          'Carry the required passport and documents',
                        ]
                  ).map((line) => (
                    <li key={line} className="flex gap-2 text-[0.82rem] text-ink">
                      <span className="font-bold text-terracotta">✓</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/10 pt-3">
                  <a
                    href={profile.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[0.82rem] font-bold text-terracotta hover:underline"
                  >
                    Official source →
                  </a>
                  {profile.lastVerified ? (
                    <span className="text-[0.68rem] text-muted">
                      Last verified · {profile.lastVerified}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Snapshot strip */}
          <div className="grid grid-cols-2 gap-0 border-y border-ink/10 sm:grid-cols-4">
            {(
              [
                [
                  'Stay',
                  purpose === 'tourist' && selectedType?.stayDays
                    ? `${selectedType.stayDays} days`
                    : 'See official',
                ],
                [
                  'Fee',
                  purpose === 'tourist' && selectedType?.feeUsd
                    ? selectedType.feeUsd[0] === 0
                      ? 'None'
                      : `$${selectedType.feeUsd[0]}`
                    : 'See official',
                ],
                [
                  'Processing',
                  purpose === 'tourist' && selectedType?.processingDays
                    ? `${selectedType.processingDays[0]}–${selectedType.processingDays[1]} days`
                    : profile.status === 'exempt' && purpose === 'tourist'
                      ? 'Not required'
                      : 'See official',
                ],
                ['Entry', 'Approved ports'],
              ] as const
            ).map(([k, v], i) => (
              <div
                key={k}
                className={`px-3 py-3 ${i > 0 ? 'border-l border-ink/10' : ''}`}
              >
                <Label>{k}</Label>
                <p className="mt-1 text-[0.92rem] font-bold text-ink">{v}</p>
              </div>
            ))}
          </div>

          {/* Next step */}
          <SoftBand>
            <Label>Your next step</Label>
            <p className="mt-1.5 text-[1rem] font-bold leading-snug text-ink">
              {profile.status === 'exempt' && purpose === 'tourist'
                ? 'Confirm your stay fits the exemption, then travel with a valid passport.'
                : purpose !== 'tourist'
                  ? 'Verify the correct visa category on the official portal before applying.'
                  : 'Apply for the tourist e-visa before departure.'}
            </p>
            <a
              href={profile.officialSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center bg-terracotta px-4 py-2.5 text-[0.82rem] font-bold text-paper transition hover:bg-terracotta-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              Check official application →
            </a>
            <p className="mt-2 text-[0.68rem] text-muted">
              Vietnam, Curated does not process visas. Verify final requirements with the official
              authority.
            </p>
          </SoftBand>

          {/* Application flow — hide for exempt tourist */}
          {!(profile.status === 'exempt' && purpose === 'tourist') ? (
            <div>
              <Label>Application flow</Label>
              <div className="mt-2 flex flex-wrap items-stretch gap-1">
                {VISA_PROCESS_STEPS.map((s, i) => (
                  <div key={s.n} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveStep(s.n)}
                      className={`min-w-[6.5rem] px-2.5 py-2 text-left transition ${
                        activeStep === s.n
                          ? 'bg-ink text-paper'
                          : 'bg-ink/[0.04] text-ink hover:bg-ink/[0.07]'
                      }`}
                    >
                      <span className="block text-[0.58rem] font-bold tracking-[0.12em] opacity-70">
                        {String(s.n).padStart(2, '0')}
                      </span>
                      <span className="mt-0.5 block text-[0.7rem] font-bold uppercase leading-tight tracking-wide">
                        {s.label}
                      </span>
                    </button>
                    {i < VISA_PROCESS_STEPS.length - 1 ? (
                      <span className="px-0.5 text-ink/25" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-2 max-w-[58ch] text-[0.78rem] leading-snug text-ink/80">
                {STEP_DETAIL[activeStep]}
              </p>
            </div>
          ) : null}

          {/* Ready check */}
          <div>
            <Label>What you need · ready check</Label>
            <div className="mt-2 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2">
              {(beforeApplication ?? profile.requirements).map((r) => {
                const openItem = openReq === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setOpenReq(openItem ? null : r.id)}
                    className="bg-paper px-3.5 py-3 text-left transition hover:bg-cream/80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[0.84rem] font-bold text-ink">
                        <span className="mr-1.5 text-terracotta">
                          {r.state === 'required' ? '✓' : r.state === 'conditional' ? '○' : '—'}
                        </span>
                        {r.label}
                      </p>
                      <span className="shrink-0 text-[0.58rem] font-bold uppercase tracking-wide text-muted">
                        {r.state === 'required'
                          ? 'Required'
                          : r.state === 'conditional'
                            ? 'Conditional'
                            : 'N/A'}
                      </span>
                    </div>
                    {openItem ? (
                      <p className="mt-1.5 text-[0.7rem] leading-snug text-muted">
                        {r.note ?? 'Confirm details on the official portal before you apply.'}
                      </p>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          {/* At entry vs application */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <Label>At entry</Label>
              <ul className="mt-2 divide-y divide-ink/8">
                {atEntry.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-2 py-2 text-[0.78rem]">
                    <span className="text-ink">
                      <span className="mr-1.5 font-bold text-terracotta">
                        {r.state === 'required' ? '✓' : '○'}
                      </span>
                      {r.label}
                      {'note' in r && r.note ? (
                        <span className="mt-0.5 block pl-4 text-[0.65rem] text-muted">{r.note}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-[0.55rem] font-bold uppercase tracking-wide text-muted">
                      {r.state === 'required' ? 'Required' : 'Conditional'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Label>Where can you enter?</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {(
                  [
                    ['Air', 'Eligible'],
                    ['Land', 'Conditional'],
                    ['Sea', 'Conditional'],
                  ] as const
                ).map(([mode, state]) => (
                  <div key={mode} className="border border-ink/10 px-2 py-2.5">
                    <p className="text-[0.78rem] font-bold text-ink">{mode}</p>
                    <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-muted">
                      {state}
                    </p>
                  </div>
                ))}
              </div>
              <a
                href={profile.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-[0.75rem] font-bold text-terracotta hover:underline"
              >
                Approved entry points →
              </a>
            </div>
          </div>

          {/* Personalized meaning */}
          {tripMeaning ? (
            <div>
              <Label>What this means for your trip</Label>
              <p className="mt-1.5 max-w-[64ch] text-[0.88rem] leading-snug text-ink">
                {tripMeaning}
              </p>
            </div>
          ) : null}

          {/* Watch out */}
          <div>
            <Label>Watch out</Label>
            <ul className="mt-2 space-y-1.5">
              {watchOuts.map((w) => (
                <li key={w} className="flex gap-2 text-[0.78rem] text-ink/85">
                  <span className="font-bold text-terracotta">⚠</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
