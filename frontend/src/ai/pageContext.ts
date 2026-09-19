import { getExperienceById, SIGHT_CATALOG } from '../pages/PlanBuilder/data/experiences'
import { getActivityById } from '../pages/PlanBuilder/data/activities'
import { cityToSlug } from '../pages/PlanBuilder/services/citySlug'
import type { AskPageContext } from './types'

export function readAskPageContext(pathname: string): AskPageContext {
  const exp = pathname.match(/\/plan\/builder\/experience\/([^/]+)/)
  if (exp) {
    const item = getExperienceById(decodeURIComponent(exp[1]))
    if (item) {
      return {
        pathname,
        focus: { id: item.id, kind: 'experience', name: item.name, city: item.city },
        city: item.city,
      }
    }
  }

  const act = pathname.match(/\/plan\/builder\/activity\/([^/]+)/)
  if (act) {
    const item = getActivityById(decodeURIComponent(act[1]))
    if (item) {
      return {
        pathname,
        focus: { id: item.id, kind: 'activity', name: item.name, city: item.cityName },
        city: item.cityName,
      }
    }
  }

  const cityPage = pathname.match(/\/plan\/builder\/experiences\/city\/([^/]+)/)
  if (cityPage) {
    const slug = decodeURIComponent(cityPage[1])
    const city =
      SIGHT_CATALOG.find((e) => cityToSlug(e.city) === slug)?.city ?? null
    return { pathname, focus: null, city }
  }

  return { pathname, focus: null, city: null }
}
