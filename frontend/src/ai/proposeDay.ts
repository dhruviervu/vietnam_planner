import type { AskEntity, DaySketch, DaySketchStop } from './types'
import { factForEntity, isoForAsk } from './facts'

const DAY_BUDGET = 6.5

function periodOf(pref: string): DaySketchStop['period'] {
  if (pref === 'EVENING') return 'evening'
  if (pref === 'AFTERNOON') return 'afternoon'
  return 'morning'
}

const RANK: Record<string, number> = { MORNING: 0, ANY: 1, AFTERNOON: 2, EVENING: 3 }

export function proposeAskDay(entities: AskEntity[], startDate?: string | null): DaySketch | null {
  if (entities.length === 0) return null
  const iso = isoForAsk(startDate)
  const facts = entities.map((e) => factForEntity(e, iso)).filter((f): f is NonNullable<typeof f> => f != null)
  if (facts.length === 0) return null

  const city = facts[0].city
  const sameCity = facts.filter((f) => f.city === city)
  sameCity.sort((a, b) => (RANK[a.timePreference] ?? 1) - (RANK[b.timePreference] ?? 1))

  const stops: DaySketchStop[] = []
  const skipped: DaySketchStop[] = []
  let total = 0

  for (const f of sameCity) {
    const stop: DaySketchStop = {
      id: f.id,
      kind: f.kind,
      name: f.name,
      city: f.city,
      period: periodOf(f.timePreference),
      duration: f.duration,
      hours: f.hours,
    }
    if (f.closedToday) {
      skipped.push({ ...stop, skipped: 'Closed that day' })
      continue
    }
    if (total + f.durationHours > DAY_BUDGET && stops.length > 0) {
      skipped.push({ ...stop, skipped: 'Would overflow a sane day' })
      continue
    }
    stops.push(stop)
    total += f.durationHours
  }

  if (stops.length === 0 && skipped.length === 0) return null

  return {
    city,
    dateLabel: iso,
    stops,
    skipped,
    totalHours: Math.round(total * 10) / 10,
  }
}
