import { PIPELINE_START } from '../pages/PlanBuilder/steps'
import { cityCatalogPath, factForEntity, isoForAsk } from './facts'
import { useTripStore } from '../store/tripStore'
import type { AskTicket, NavigateOffer } from './types'

const STAY_RE = /\b(stay|staying|hotel|hotels|sleep|neighbourhood|neighborhood|where (should|do) i (stay|sleep)|accommodation)\b/i
const FOOD_RE = /\b(eat|food|pho|restaurant|restaurants|cuisine|taste)\b/i
const MOVE_RE = /\b(train|bus|flight|flights|grab|taxi|scooter|getting around|transport|transfer between)\b/i
const SHOP_RE = /\b(shop|shopping|souvenir|market to buy|bring home)\b/i
const AIR_RE = /\b(airport|arrival transfer|from the airport)\b/i
const LOG_RE = /\b(visa|sim|esim|logistics|know before)\b/i
const WHEN_RE = /\b(when to go|which month|weather|season|rainy|typhoon)\b/i
const ACT_RE = /\b(things to do|activit|class|workshop|cooking class)\b/i
const ITIN_RE = /\b(itinerary|my trip|the board|day plan)\b/i

function addOffer(out: NavigateOffer[], offer: NavigateOffer, pagePath: string) {
  if (!offer.path || offer.path === pagePath) return
  if (out.some((o) => o.path === offer.path && (o.hash ?? '') === (offer.hash ?? ''))) return
  out.push(offer)
}

export function collectAskOffers(ticket: AskTicket, pagePath: string, raw: string): NavigateOffer[] {
  const out: NavigateOffer[] = []
  const first = ticket.entities[0]
  const city = ticket.cityHint || first?.city || null
  const iso = isoForAsk(useTripStore.getState().basics.startDate)

  if (city) {
    addOffer(
      out,
      { label: `Take me to ${city}`, path: cityCatalogPath(city), confirm: true },
      pagePath,
    )
  }

  if (first) {
    const fact = factForEntity(first, iso)
    if (fact) {
      addOffer(
        out,
        {
          label: `Open ${fact.name}`,
          path: fact.path,
          confirm: !city,
        },
        pagePath,
      )
    }
  }

  if (STAY_RE.test(raw) || ticket.intent === 'about' && /\bstay\b/i.test(raw)) {
    addOffer(out, { label: 'Where to stay', path: '/plan/builder/stay' }, pagePath)
  }
  if (FOOD_RE.test(raw)) {
    addOffer(out, { label: 'Taste of Vietnam', path: '/plan/builder/eat' }, pagePath)
  }
  if (MOVE_RE.test(raw)) {
    addOffer(out, { label: 'Getting around', path: '/plan/builder/transport' }, pagePath)
  }
  if (SHOP_RE.test(raw)) {
    addOffer(out, { label: 'Shopping', path: '/plan/builder/shopping' }, pagePath)
  }
  if (AIR_RE.test(raw)) {
    addOffer(out, { label: 'Airport transfers', path: '/plan/builder/airport' }, pagePath)
  }
  if (LOG_RE.test(raw)) {
    addOffer(out, { label: 'Logistics', path: '/plan/builder/logistics' }, pagePath)
  }
  if (WHEN_RE.test(raw)) {
    addOffer(out, { label: 'When to go', path: '/plan/builder/when-to-go' }, pagePath)
  }
  if (ACT_RE.test(raw)) {
    addOffer(out, { label: 'Things to do', path: '/plan/builder/activities' }, pagePath)
  }
  if (ITIN_RE.test(raw) || ticket.intent === 'build_day' || ticket.intent === 'add') {
    addOffer(out, { label: 'Your itinerary', path: '/plan/builder/itinerary' }, pagePath)
  }

  if (ticket.intent === 'help' || (!city && !first && ticket.verdict !== 'refuse')) {
    addOffer(out, { label: 'Start my itinerary', path: PIPELINE_START, confirm: true }, pagePath)
    addOffer(out, { label: 'Browse sights', path: '/plan/builder/experiences' }, pagePath)
  }

  if (ticket.verdict === 'refuse') {
    addOffer(out, { label: 'Browse sights', path: '/plan/builder/experiences' }, pagePath)
    addOffer(out, { label: 'Start my itinerary', path: PIPELINE_START, confirm: true }, pagePath)
  }

  const confirmed = out.find((o) => o.confirm)
  if (!confirmed && out[0]) out[0].confirm = true

  return out.slice(0, 4)
}
