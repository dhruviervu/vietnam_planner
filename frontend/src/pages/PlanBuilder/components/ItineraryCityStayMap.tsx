import type { PlaceId } from '../../GettingAround/data/types'
import type { DayMapStop } from '../lib/yourVietnam/dayMapPins'
import { TripBagCityMap } from './TripBagCityMap'

const MAP_HEIGHT = 'h-[min(340px,48vh)] min-h-[280px] lg:h-[min(440px,56vh)]'

type Props = {
  stops: DayMapStop[]
  cityLabel: string
  placeId?: PlaceId
  activeStopId?: string | null
  onSelectStop: (id: string) => void
}

export function ItineraryCityStayMap({
  stops,
  cityLabel,
  placeId,
  activeStopId,
  onSelectStop,
}: Props) {
  return (
    <TripBagCityMap
      className={MAP_HEIGHT}
      stops={stops}
      cityLabel={cityLabel}
      placeId={placeId}
      activeStopId={activeStopId}
      onSelectStop={onSelectStop}
      numbered={false}
      bagPinsOnly
    />
  )
}
