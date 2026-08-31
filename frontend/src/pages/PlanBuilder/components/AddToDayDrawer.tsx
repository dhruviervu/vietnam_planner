import { useMemo } from 'react'
import { useTripStore } from '../../../store/tripStore'
import type { PlaceId } from '../../GettingAround/data/types'
import type { PeriodId } from '../lib/yourVietnam/types'
import { rankCatalogForCity } from '../lib/yourVietnam/tripIntelligence'
import {
  dailySpendBand,
  effectiveDailyUsd,
  effectiveHolidayKind,
} from '../lib/yourVietnam/holidayKind'
import type { TripShapeInput } from '../lib/yourVietnam/tripIntelligence'

export function AddToDayDrawer({
  placeId,
  period,
  packedExperienceIds = [],
  packedActivityIds = [],
  onClose,
  onAdded,
}: {
  placeId: PlaceId
  period: PeriodId
  packedExperienceIds?: string[]
  packedActivityIds?: string[]
  onClose: () => void
  onAdded: () => void
}) {
  const basics = useTripStore((s) => s.basics)
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const restaurantIds = useTripStore((s) => s.selectedRestaurantIds)
  const addExperience = useTripStore((s) => s.addExperience)
  const addActivity = useTripStore((s) => s.addActivity)
  const toggleRestaurant = useTripStore((s) => s.toggleRestaurant)

  const shape: TripShapeInput = useMemo(() => {
    const holidayKind = effectiveHolidayKind(basics)
    const dailyUsd = effectiveDailyUsd(basics)
    return {
      holidayKind,
      groupSize: basics.groupSize,
      dailyUsd,
      band: dailySpendBand(dailyUsd),
    }
  }, [basics])

  const items = useMemo(
    () =>
      rankCatalogForCity(
        placeId,
        new Set([...experienceIds, ...packedExperienceIds]),
        new Set([...activityIds, ...packedActivityIds]),
        new Set(restaurantIds),
        shape,
        period,
      ),
    [
      placeId,
      experienceIds,
      activityIds,
      restaurantIds,
      packedExperienceIds,
      packedActivityIds,
      shape,
      period,
    ],
  )

  function add(kind: 'experience' | 'activity' | 'restaurant', id: string) {
    if (kind === 'experience') {
      const slot = period === 'night' ? 'evening' : period
      addExperience(id, slot)
    } else if (kind === 'activity') addActivity(id)
    else toggleRestaurant(id)
    onAdded()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-3 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-[24px] bg-paper shadow-hero">
        <div className="flex items-start justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
              Add to {period}
            </p>
            <h3 className="font-serif text-[1.35rem] font-semibold text-ink">Fill this part of the day</h3>
            <p className="mt-1 text-[0.8rem] text-muted">Ranked for your holiday kind and daily budget.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cream px-3 py-1 text-[0.8rem] font-bold text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
        <ul className="max-h-[58vh] space-y-2 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <li className="px-2 py-6 text-center text-[0.9rem] text-muted">
              Nothing left to add in this city — browse experiences from the footer.
            </li>
          ) : (
            items.map((it) => (
              <li
                key={`${it.kind}-${it.id}`}
                className="flex items-start justify-between gap-3 rounded-[16px] border border-ink/8 bg-cream/50 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-sage">
                    {it.kind} · {it.tag}
                  </p>
                  <p className="font-serif text-[1.05rem] font-semibold text-ink">{it.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[0.78rem] text-muted">{it.reason}</p>
                  <p className="mt-1 text-[0.72rem] text-muted">
                    {it.costLabel}
                    {it.durationLabel ? ` · ${it.durationLabel}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => add(it.kind, it.id)}
                  className="shrink-0 rounded-full bg-terracotta px-3 py-1.5 text-[0.75rem] font-bold text-paper"
                >
                  Add
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
