import type { PlaceId } from '../../GettingAround/data/types'
import type { RouteStop } from '../lib/yourVietnam/types'
import { experienceCityForPlace } from '../lib/yourVietnam/cityPins'
import { experiencesCityUrl } from '../lib/yourVietnam/links'

export function CityNightsAdjust({
  stops,
  daysCount,
  onChange,
  bare = false,
}: {
  stops: RouteStop[]
  daysCount: number
  onChange: (placeId: string, nights: number) => void
  bare?: boolean
}) {
  if (stops.length < 2) return null
  const maxOne = Math.max(1, daysCount - (stops.length - 1))

  return (
    <div
      className={
        bare
          ? 'flex flex-wrap items-center gap-2'
          : 'mt-4 flex flex-wrap items-center gap-2 rounded-[16px] border border-ink/8 bg-paper px-3 py-2.5'
      }
    >
      <p className="mr-1 text-[0.72rem] font-bold uppercase tracking-wide text-sage">
        Nights per city
      </p>
      {stops.map((s) => {
        const id = s.placeId
        if (!id) return null
        const catalogCity = experienceCityForPlace(id as PlaceId, s.city)
        const href = experiencesCityUrl(catalogCity)
        return (
          <div key={id} className="inline-flex items-center overflow-hidden rounded-full bg-cream">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Ranked sights in ${s.city}`}
              className="pl-3 pr-1 text-[0.78rem] font-semibold text-ink underline decoration-terracotta/35 underline-offset-2 hover:text-terracotta"
            >
              {s.city}
            </a>
            <button
              type="button"
              aria-label={`Fewer nights in ${s.city}`}
              disabled={s.nights <= 1}
              onClick={() => onChange(id, s.nights - 1)}
              className="px-2 py-1 text-[0.85rem] font-bold text-muted hover:text-ink disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-[1.2rem] text-center text-[0.8rem] font-bold text-ink">
              {s.nights}
            </span>
            <button
              type="button"
              aria-label={`More nights in ${s.city}`}
              disabled={s.nights >= maxOne}
              onClick={() => onChange(id, s.nights + 1)}
              className="px-2 py-1 text-[0.85rem] font-bold text-muted hover:text-ink disabled:opacity-30"
            >
              +
            </button>
          </div>
        )
      })}
    </div>
  )
}
