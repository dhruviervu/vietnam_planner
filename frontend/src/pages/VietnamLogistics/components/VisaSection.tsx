import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getOriginCountry,
  ORIGIN_COUNTRIES,
  searchOriginCountries,
} from '../data/countries'
import { getVisaProfile, VISA_PROCESS_STEPS } from '../data/visa'
import type { TripLength, VisaProfile } from '../data/types'
import { BlockTitle, ChipButton, Label, SectionIntro } from './ui'

type Props = {
  originCountryCode: string | null
  onOriginChange: (code: string | null) => void
  tripLength?: TripLength | null
}

const POPULAR = ['IN', 'US', 'GB', 'AU', 'DE'] as const

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

function primaryType(profile: VisaProfile) {
  return (
    profile.types.find((t) => t.id === profile.primaryTypeId) ??
    profile.types.find((t) => /tourist|exemption/i.test(t.label)) ??
    profile.types[0] ??
    null
  )
}

export function VisaSection({
  originCountryCode,
  onOriginChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const country = getOriginCountry(originCountryCode)
  const profile = getVisaProfile(originCountryCode)
  const results = useMemo(() => searchOriginCountries(query), [query])
  const popular = useMemo(
    () =>
      POPULAR.map((code) => ORIGIN_COUNTRIES.find((c) => c.code === code)).filter(Boolean),
    [],
  )

  const selectedType = profile ? primaryType(profile) : null
  const visual = profile ? statusVisual(profile.status) : null

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
  }

  return (
    <section className="space-y-5">
      <SectionIntro
        id="logistics-visa"
        n="01 · Visa & Entry"
        title="Visa & Entry"
        support="Choose your passport country to see whether you need a visa for a short tourist stay."
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div ref={rootRef} className="relative">
          <Label>Choose country</Label>
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((v) => !v)}
            className="mt-2 flex h-16 w-full items-center justify-between gap-3 border border-ink/15 bg-paper px-4 text-left shadow-[0_1px_0_rgba(58,50,44,0.04)] transition hover:border-terracotta/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
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
            <span
              className={`shrink-0 text-terracotta transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden
            >
              <ChevronDown />
            </span>
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
              <ul className="max-h-72 overflow-y-auto">
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
                  {c.flag}{' '}
                  {c.name === 'United Kingdom' ? 'UK' : c.name === 'United States' ? 'United States' : c.name}
                </ChipButton>
              ) : null,
            )}
          </div>
        </div>

        {!profile || !country || !visual ? (
          <div className="flex min-h-[11rem] items-center border border-dashed border-ink/15 bg-paper px-5 py-6">
            <p className="text-[0.88rem] leading-snug text-muted">
              Select a passport country on the left to see whether a visa is required.
            </p>
          </div>
        ) : (
          <div className={`min-h-[11rem] border px-5 py-5 ${visual.band}`}>
            <Label>Your entry status</Label>
            <p className="mt-2 text-[0.72rem] font-semibold tracking-wide text-ink/55">
              {country.flag} {country.name.toUpperCase()}
            </p>
            <p
              className={`mt-2 font-serif text-[clamp(1.55rem,3vw,2.05rem)] font-semibold leading-[1.05] tracking-[-0.02em] ${visual.tone}`}
            >
              <span className="mr-2 align-middle text-[1.1rem]" aria-hidden>
                {visual.icon}
              </span>
              {visual.label}
            </p>
            <p className="mt-2 text-[0.9rem] font-bold text-ink">
              {selectedType?.label ?? profile.headline}
            </p>
            <a
              href={profile.officialSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center text-[0.88rem] font-bold text-terracotta hover:underline"
            >
              Check Official Source
            </a>
          </div>
        )}
      </div>

      {profile && country ? (
        <div>
          <BlockTitle>Application flow</BlockTitle>
          <div className="mt-3 flex flex-wrap items-stretch gap-1">
            {VISA_PROCESS_STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1">
                <div
                  className={`min-w-[6.5rem] px-2.5 py-2 text-left ${
                    s.n === 5 ? 'bg-ink text-paper' : 'bg-ink/[0.04] text-ink'
                  }`}
                >
                  <span className="block text-[0.58rem] font-bold tracking-[0.12em] opacity-70">
                    {String(s.n).padStart(2, '0')}
                  </span>
                  <span className="mt-0.5 block text-[0.7rem] font-bold uppercase leading-tight tracking-wide">
                    {s.label}
                  </span>
                </div>
                {i < VISA_PROCESS_STEPS.length - 1 ? (
                  <span className="px-0.5 text-ink/25" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-3 w-full border border-ink/10 bg-ink/[0.03] px-3.5 py-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-terracotta">
              Required Documents
            </p>
            <ul className="mt-2 space-y-1 text-[0.84rem] leading-snug text-ink">
              {(profile.requirements.filter((r) => r.state === 'required').length
                ? profile.requirements.filter((r) => r.state === 'required')
                : [
                    { id: 'passport', label: 'Valid passport' },
                    { id: 'photo', label: 'Passport-style photograph' },
                    { id: 'bio-page', label: 'Passport bio-page scan' },
                    { id: 'payment', label: 'Fee payment on the official portal' },
                  ]
              ).map((r) => (
                <li key={r.id}>· {r.label}</li>
              ))}
            </ul>
            <p className="mt-2.5 text-[0.84rem] leading-snug text-ink/85">
              A decision usually takes about 3 working days. In busy periods it can take up to about
              5 working days.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ChevronDown() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 9.2 12 16l7-6.8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
