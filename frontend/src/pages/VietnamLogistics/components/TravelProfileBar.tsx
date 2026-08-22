import { ORIGIN_COUNTRIES } from '../data/countries'
import type { TravellerType, TravelProfile, TripLength } from '../data/types'

type Props = {
  profile: TravelProfile
  onChange: (next: TravelProfile) => void
}

const TRIP: { id: TripLength; label: string }[] = [
  { id: 'short', label: 'Under 2 weeks' },
  { id: 'medium', label: '2–4 weeks' },
  { id: 'long', label: '4+ weeks' },
]

const TRAVELLER: { id: TravellerType; label: string }[] = [
  { id: 'solo', label: 'Solo' },
  { id: 'couple', label: 'Couple' },
  { id: 'family', label: 'Family' },
  { id: 'friends', label: 'Friends' },
]

const field =
  'appearance-none bg-transparent py-1 pr-5 text-[0.84rem] font-bold text-ink focus:outline-none focus-visible:underline focus-visible:decoration-terracotta'

export function TravelProfileBar({ profile, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2 border-b border-ink/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-x-0 gap-y-2">
        <span className="mr-3 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-muted">
          Your trip
        </span>

        <label className="relative inline-flex items-center">
          <select
            className={`${field} min-w-[9rem] text-terracotta`}
            value={profile.originCountryCode ?? ''}
            onChange={(e) =>
              onChange({ ...profile, originCountryCode: e.target.value || null })
            }
            aria-label="Passport country"
          >
            <option value="">Passport…</option>
            {ORIGIN_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-0 text-[0.65rem] text-muted">▼</span>
        </label>

        <span className="mx-2.5 hidden h-4 w-px bg-ink/15 sm:block" aria-hidden />

        <label className="relative inline-flex items-center">
          <select
            className={field}
            value={profile.tripLength ?? ''}
            onChange={(e) =>
              onChange({
                ...profile,
                tripLength: (e.target.value || null) as TripLength | null,
              })
            }
            aria-label="Trip length"
          >
            <option value="">Trip length</option>
            {TRIP.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-0 text-[0.65rem] text-muted">▼</span>
        </label>

        <span className="mx-2.5 hidden h-4 w-px bg-ink/15 sm:block" aria-hidden />

        <label className="relative inline-flex items-center">
          <select
            className={field}
            value={profile.travellerType ?? ''}
            onChange={(e) =>
              onChange({
                ...profile,
                travellerType: (e.target.value || null) as TravellerType | null,
              })
            }
            aria-label="Traveller type"
          >
            <option value="">Traveller</option>
            {TRAVELLER.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-0 text-[0.65rem] text-muted">▼</span>
        </label>

        <span className="mx-2.5 hidden h-4 w-px bg-ink/15 sm:block" aria-hidden />

        <input
          type="date"
          aria-label="Arrival date"
          className={`${field} min-w-[8.5rem]`}
          value={profile.arrivalDate ?? ''}
          onChange={(e) =>
            onChange({ ...profile, arrivalDate: e.target.value || null })
          }
        />
      </div>
      <p className="text-[0.65rem] text-muted">Personalises visa guidance</p>
    </div>
  )
}
