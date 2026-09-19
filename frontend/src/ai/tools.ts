import { useTripStore } from '../store/tripStore'
import { pinNewSightToItinerary } from '../pages/PlanBuilder/lib/yourVietnam/itineraryAddTarget'
import { proposeAskDay } from './proposeDay'
import { entityById } from './catalogIndex'
import { collectAskOffers } from './pipelineOffers'
import type { AskEntity, AskTicket, AskToolResult } from './types'

function bagEntities(): AskEntity[] {
  const s = useTripStore.getState()
  const out: AskEntity[] = []
  for (const id of s.selectedExperienceIds) {
    const e = entityById(id, 'experience')
    if (e) out.push(e)
  }
  for (const id of s.selectedActivityIds) {
    const e = entityById(id, 'activity')
    if (e) out.push(e)
  }
  return out
}

export function runAskTools(ticket: AskTicket, pagePath: string, raw: string): AskToolResult {
  const did: string[] = []
  const store = useTripStore.getState()
  const iso = store.basics.startDate

  if (ticket.intent === 'add') {
    for (const e of ticket.entities) {
      if (e.kind === 'experience') {
        store.addExperience(e.id)
        pinNewSightToItinerary(e.id)
        did.push(`Added ${e.name} to your trip`)
      } else {
        store.addActivity(e.id)
        pinNewSightToItinerary(e.id)
        did.push(`Added ${e.name} to your trip`)
      }
    }
  }

  if (ticket.intent === 'remove') {
    for (const e of ticket.entities) {
      if (e.kind === 'experience') store.removeExperience(e.id)
      else store.removeActivity(e.id)
      did.push(`Removed ${e.name}`)
    }
  }

  let daySketch = null
  if (ticket.intent === 'build_day') {
    const source = ticket.entities.length > 0 ? ticket.entities : bagEntities()
    daySketch = proposeAskDay(source, iso)
    if (daySketch?.stops.length) {
      did.push(`Drafted a ${daySketch.city} day with ${daySketch.stops.length} stops`)
    }
  }

  return { did, daySketch, offers: collectAskOffers(ticket, pagePath, raw) }
}

export function applyAskDay(ids: string[]) {
  const store = useTripStore.getState()
  for (const id of ids) {
    const asExp = entityById(id, 'experience')
    const asAct = entityById(id, 'activity')
    if (asExp) {
      store.addExperience(id)
      pinNewSightToItinerary(id)
    } else if (asAct) {
      store.addActivity(id)
      pinNewSightToItinerary(id)
    }
  }
}
