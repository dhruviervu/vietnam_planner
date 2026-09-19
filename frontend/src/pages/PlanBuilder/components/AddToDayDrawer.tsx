import { useMemo } from 'react'
import { useItineraryTripStore } from '../../../store/itineraryTripStore'
import type { PlaceId } from '../../GettingAround/data/types'
import type { PeriodId } from '../lib/yourVietnam/types'
import { rankCatalogForCity } from '../lib/yourVietnam/tripIntelligence'
import {
  dailySpendBand,
  effectiveDailyUsd,
  effectiveHolidayKind,
} from '../lib/yourVietnam/holidayKind'
import type { TripShapeInput } from '../lib/yourVietnam/tripIntelligence'
import { EXPERIENCES } from '../data/experiences'
import { CITY_ACTIVITIES, getActivityImages } from '../data/activities'
import { getExperienceImages } from '../lib/pricing'
import { itineraryItemHref, openDetailHref } from '../lib/yourVietnam/links'
import {
  PERIOD_CAP,
  catalogItemHours,
  windowHours,
  type TransferSlot,
} from '../lib/yourVietnam/dayCapacity'

export function AddToDayDrawer({
  placeId,
  period,
  packedExperienceIds = [],
  packedActivityIds = [],
  city,
  nightsHere = 1,
  usedPeriodHours = 0,
  usedWindowHours = 0,
  windowHoursTotal,
  isTransferDay = false,
  onClose,
  onAdded,
}: {
  placeId: PlaceId
  period: PeriodId
  packedExperienceIds?: string[]
  packedActivityIds?: string[]
  city?: string
  nightsHere?: number
  usedPeriodHours?: number
  usedWindowHours?: number
  windowHoursTotal?: number
  isTransferDay?: boolean
  onClose: () => void
  onAdded: (added?: {
    kind: 'experience' | 'activity' | 'restaurant'
    id: string
    period: PeriodId
  }) => void
}) {
  const useTripStore = useItineraryTripStore()
  const basics = useTripStore((s) => s.basics)
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const restaurantIds = useTripStore((s) => s.selectedRestaurantIds)
  const addExperience = useTripStore((s) => s.addExperience)
  const addActivity = useTripStore((s) => s.addActivity)
  const toggleRestaurant = useTripStore((s) => s.toggleRestaurant)
  const setItinerarySlotOverride = useTripStore((s) => s.setItinerarySlotOverride)
  const setBasics = useTripStore((s) => s.setBasics)
  const setCityNightOverride = useTripStore((s) => s.setCityNightOverride)
  const cityTransferSlot = useTripStore((s) => s.cityTransferSlot)

  const slot: TransferSlot | null = isTransferDay
    ? (cityTransferSlot[placeId] ?? 'evening')
    : null
  const cap = PERIOD_CAP[period] ?? 3.5
  const remainingPeriod = Math.max(0, cap - usedPeriodHours)
  const windowCap = windowHoursTotal ?? windowHours(slot)
  const remainingWindow = Math.max(0, windowCap - usedWindowHours)
  const cityLabel = city ?? 'this city'

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

  function extendCity() {
    setBasics({ days: basics.days + 1, durationKnown: true })
    setCityNightOverride(placeId, nightsHere + 1)
  }

  function add(kind: 'experience' | 'activity' | 'restaurant', id: string) {
    const slotPeriod = period === 'night' ? 'evening' : period
    if (kind === 'experience') {
      addExperience(id, slotPeriod)
    } else if (kind === 'activity') {
      addActivity(id)
      setItinerarySlotOverride(id, slotPeriod)
    } else toggleRestaurant(id)
    onAdded({ kind, id, period: slotPeriod })
  }

  function addAndExtend(kind: 'experience' | 'activity' | 'restaurant', id: string) {
    extendCity()
    add(kind, id)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-3 sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-paper shadow-hero">
        <div className="flex items-start justify-between gap-3 border-b border-ink/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
              Add to {period}
            </p>
            <h3 className="mt-0.5 font-serif text-[1.45rem] font-semibold text-ink">
              Add more sights in the {period}
            </h3>
            <p className="mt-2 max-w-[58ch] text-[0.88rem] leading-relaxed text-ink/80">
              Adding more sights may fill your day more and may result in trip being extended if too
              many sights are added.
            </p>
            <p className="mt-2 text-[0.8rem] text-muted">
              {remainingPeriod.toFixed(1)} hrs left in the {period} · {remainingWindow.toFixed(1)} hrs
              left in this city-day window
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cream px-3 py-1 text-[0.8rem] font-bold text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(88vh-8rem)] overflow-y-auto px-5 py-4 sm:px-6">
          {items.length === 0 ? (
            <p className="py-8 text-center text-[0.9rem] text-muted">
              Nothing left to add in this city — browse experiences from the footer.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => {
                const hours = catalogItemHours(it.kind, it.id)
                const tooLong = hours > remainingPeriod && hours > remainingWindow
                const href =
                  it.kind === 'experience' || it.kind === 'activity'
                    ? itineraryItemHref({ kind: it.kind, sourceId: it.id })
                    : undefined
                const exp = it.kind === 'experience' ? EXPERIENCES.find((e) => e.id === it.id) : undefined
                const act = it.kind === 'activity' ? CITY_ACTIVITIES.find((a) => a.id === it.id) : undefined
                const photo = exp
                  ? getExperienceImages(exp)[0]
                  : act
                    ? getActivityImages(act)[0]
                    : undefined
                const summary = exp?.cardSummary || act?.cardSummary || it.reason

                return (
                  <article
                    key={`${it.kind}-${it.id}`}
                    className="overflow-hidden rounded-[18px] bg-paper shadow-card ring-1 ring-ink/6"
                  >
                    <div
                      className="relative aspect-[5/3.2] cursor-pointer bg-cream"
                      onClick={() => href && openDetailHref(href)}
                      onKeyDown={(e) => {
                        if (href && (e.key === 'Enter' || e.key === ' ')) openDetailHref(href)
                      }}
                      role={href ? 'link' : undefined}
                      tabIndex={href ? 0 : undefined}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-cream via-terracotta/15 to-sage/25" />
                      )}
                    </div>
                    <div className="px-3.5 py-3">
                      <h4 className="font-serif text-[1.05rem] font-semibold leading-snug text-ink">
                        {it.name}
                      </h4>
                      <p className="mt-1.5 line-clamp-3 text-[0.8rem] leading-relaxed text-ink/75">
                        {summary}
                      </p>
                      <p className="mt-1 text-[0.72rem] text-muted">
                        {it.durationLabel ? `${it.durationLabel} · ` : ''}
                        {hours.toFixed(1)} hrs
                      </p>
                      {tooLong && (
                        <p className="mt-1.5 text-[0.75rem] text-terracotta">
                          This needs {hours.toFixed(1)} hrs; {period} has {remainingPeriod.toFixed(1)} left.
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        {href && (
                          <button
                            type="button"
                            onClick={() => openDetailHref(href)}
                            className="flex-1 rounded-full border border-ink/12 bg-paper px-3 py-1.5 text-[0.75rem] font-bold text-ink hover:border-ink/25"
                          >
                            See more
                          </button>
                        )}
                        {tooLong ? (
                          <button
                            type="button"
                            onClick={() => addAndExtend(it.kind, it.id)}
                            className="flex-1 rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-3 py-1.5 text-[0.75rem] font-bold text-paper"
                          >
                            Add and extend {cityLabel} by a day
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => add(it.kind, it.id)}
                            className="flex-1 rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-3 py-1.5 text-[0.75rem] font-bold text-paper"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
