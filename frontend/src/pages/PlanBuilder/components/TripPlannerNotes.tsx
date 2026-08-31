import type { RouteStop } from '../lib/yourVietnam/types'
import { nightsShiftAdvice } from '../lib/yourVietnam/tripIntelligence'
import { CityNightsAdjust } from './CityNightsAdjust'

export function TripPlannerNotes({
  stops,
  daysCount,
  onNightChange,
}: {
  stops: RouteStop[]
  daysCount: number
  onNightChange: (placeId: string, nights: number) => void
}) {
  if (stops.length < 2) return null
  const advice = nightsShiftAdvice(stops)

  return (
    <div
      className="mt-5 space-y-2.5 rounded-[16px] border border-ink/8 bg-paper px-4 py-3 shadow-soft"
      data-yv="planner-notes"
    >
      <CityNightsAdjust
        bare
        stops={stops}
        daysCount={daysCount}
        onChange={onNightChange}
      />
      {advice && (
        <p className="text-[0.82rem] leading-relaxed text-muted">{advice.message}</p>
      )}
    </div>
  )
}
