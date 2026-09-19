import { useMemo, type ReactNode } from 'react'
import { useItineraryTripStore } from '../../../store/itineraryTripStore'
import { ItinerarySettingsControl } from './ItinerarySettingsControl'
import { effectiveDailyUsd, effectiveHolidayKind } from '../lib/yourVietnam/holidayKind'
import { optimizeItinerary } from '../lib/yourVietnam/itineraryOptimize'
import { SightsPerCitySection } from './SightsPerCitySection'
import { TripVariablesBar } from './TripVariablesBar'
import type { RouteStop } from '../lib/yourVietnam/types'

function ItineraryPlanBar() {
  const useTripStore = useItineraryTripStore()
  const plans = useTripStore((s) => s.itineraryPlans)
  const activeId = useTripStore((s) => s.activeItineraryPlanId)
  const switchPlan = useTripStore((s) => s.switchItineraryPlan)
  const createBlank = useTripStore((s) => s.createBlankItineraryPlan)
  const deletePlan = useTripStore((s) => s.deleteItineraryPlan)
  const userStartTime = useTripStore((s) => s.userStartTime)
  const userLastSightEndTime = useTripStore((s) => s.userLastSightEndTime)
  const setUserStartTime = useTripStore((s) => s.setUserStartTime)
  const setUserLastSightEndTime = useTripStore((s) => s.setUserLastSightEndTime)
  const hopTransportRule = useTripStore((s) => s.hopTransportRule)
  const setHopTransportRule = useTripStore((s) => s.setHopTransportRule)
  const startDate = useTripStore((s) => s.basics.startDate)
  const endDate = useTripStore((s) => s.basics.endDate)
  const days = useTripStore((s) => s.basics.days)
  const setBasics = useTripStore((s) => s.setBasics)

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {plans.map((plan) => {
        const on = plan.id === activeId
        const canDelete = plan.source !== 'bag' && plan.id !== 'plan-1'
        return (
          <span
            key={plan.id}
            className={`inline-flex items-center rounded-full ${
              on ? 'bg-ink text-paper' : 'border border-ink/12 bg-paper text-ink'
            }`}
          >
            <button
              type="button"
              onClick={() => switchPlan(plan.id)}
              className="rounded-full px-3.5 py-1.5 text-[0.78rem] font-bold"
            >
              {plan.name}
            </button>
            {canDelete ? (
              <button
                type="button"
                aria-label={`Delete ${plan.name}`}
                onClick={() => deletePlan(plan.id)}
                className={`mr-0.5 grid h-6 w-6 place-items-center rounded-full text-[0.95rem] font-bold leading-none ${
                  on ? 'text-paper/80 hover:bg-paper/15' : 'text-ink/45 hover:bg-ink hover:text-paper'
                }`}
              >
                −
              </button>
            ) : null}
          </span>
        )
      })}
      <button
        type="button"
        onClick={() => createBlank()}
        className="rounded-full border border-dashed border-ink/20 bg-cream px-3.5 py-1.5 text-[0.78rem] font-bold text-ink hover:border-terracotta hover:text-terracotta"
      >
        Make another itinerary
      </button>
      <ItinerarySettingsControl
        morningTime={userStartTime}
        lastSightEndTime={userLastSightEndTime}
        onMorningChange={setUserStartTime}
        onLastSightEndChange={setUserLastSightEndTime}
        onClearLastSightEnd={() => setUserLastSightEndTime(null)}
        startDate={startDate}
        endDate={endDate}
        days={days}
        onTripDatesChange={(nextStart, nextEnd) =>
          setBasics({
            startDate: nextStart,
            endDate: nextEnd,
            dateMode: nextStart ? 'exact' : 'unknown',
          })
        }
        hopTransportRule={hopTransportRule}
        onHopTransportRuleChange={setHopTransportRule}
      />
    </div>
  )
}

type Props = {
  route: RouteStop[]
  crafted: ReactNode
  mapOpen?: boolean
  onToggleMap?: () => void
  daysCount?: number
}

export function ItineraryCraftShell({
  route,
  crafted,
  mapOpen = false,
  onToggleMap,
  daysCount,
}: Props) {
  const useTripStore = useItineraryTripStore()
  const basics = useTripStore((s) => s.basics)
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const plans = useTripStore((s) => s.itineraryPlans)
  const activePlanId = useTripStore((s) => s.activeItineraryPlanId)
  const isBlankPlan = plans.find((p) => p.id === activePlanId)?.source === 'blank'
  const pinnedIds = useTripStore((s) => s.itineraryUserPinnedIds)
  const sightOrder = useTripStore((s) => s.itinerarySightOrder)
  const blankSightIds = useMemo(
    () => [...new Set([...pinnedIds, ...Object.values(sightOrder).flat()])],
    [pinnedIds, sightOrder],
  )

  const known =
    basics.groupSizeKnown &&
    basics.holidayKindKnown &&
    (basics.budgetKnown || basics.budgetAllocationKnown)

  const holidayKind = effectiveHolidayKind({
    holidayKindKnown: basics.holidayKindKnown,
    holidayKind: basics.holidayKind,
    paceKnown: basics.paceKnown,
    travelStyle: basics.travelStyle,
  })
  const dailyUsd = effectiveDailyUsd({
    budgetAllocationKnown: basics.budgetAllocationKnown,
    budgetDailyUsd: basics.budgetDailyUsd,
    budgetKnown: basics.budgetKnown,
    budgetTarget: basics.budgetTarget,
    budgetMode: basics.budgetMode,
    days: basics.days,
    groupSize: basics.groupSize,
  })

  const result = useMemo(
    () =>
      optimizeItinerary({
        experienceIds: isBlankPlan ? blankSightIds : experienceIds,
        activityIds: isBlankPlan ? [] : activityIds,
        holidayKind,
        days: Math.max(1, basics.days),
        dailyUsd,
        budgetTarget: basics.budgetTarget,
        budgetKnown: basics.budgetKnown || basics.budgetAllocationKnown,
        groupSize: basics.groupSize,
        route,
      }),
    [
      isBlankPlan,
      blankSightIds,
      experienceIds,
      activityIds,
      holidayKind,
      basics.days,
      dailyUsd,
      basics.budgetTarget,
      basics.budgetKnown,
      basics.budgetAllocationKnown,
      basics.groupSize,
      route,
    ],
  )

  return (
    <>
      <SightsPerCitySection groups={result.groups} />

      {!known ? (
        <div className="mt-5">
          <TripVariablesBar />
        </div>
      ) : null}

      <section className="mt-8 border-t border-ink/10 pt-6" data-yv="crafted-itinerary">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-[clamp(1.85rem,3.6vw,2.55rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
            Your Itinerary
          </h2>
          {onToggleMap ? (
            <button
              type="button"
              onClick={onToggleMap}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-paper px-3 py-1.5 text-[0.72rem] font-bold text-ink shadow-sm hover:border-terracotta/50 hover:bg-terracotta/8"
            >
              {mapOpen ? 'Hide map' : 'Show map'}
            </button>
          ) : null}
        </div>
        {daysCount && !(isBlankPlan && blankSightIds.length === 0) ? (
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-muted">
            Here is a {daysCount} day{daysCount === 1 ? '' : 's'} itinerary based on the sights you
            have selected.
          </p>
        ) : null}
        {isBlankPlan && blankSightIds.length === 0 ? (
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-muted">
            A blank day — add sights here, or see templates for a ready-made plan.
          </p>
        ) : null}
        <ItineraryPlanBar />
        <div className="mt-4">{crafted}</div>
      </section>
    </>
  )
}
