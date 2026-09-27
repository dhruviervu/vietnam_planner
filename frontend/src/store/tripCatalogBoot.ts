import { buildItinerary, selectedRegionsFromExperiences } from '../pages/PlanBuilder/lib/buildItinerary'
import { EXPERIENCES } from '../pages/PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../pages/PlanBuilder/data/activities'
import { SHOPPING_ITEMS } from '../pages/PlanBuilder/data/shopping'
import { registerTripCatalog } from './tripCatalog'

registerTripCatalog({
  experiences: EXPERIENCES,
  activities: CITY_ACTIVITIES,
  shopping: SHOPPING_ITEMS,
  buildItinerary,
  selectedRegionsFromExperiences,
})
