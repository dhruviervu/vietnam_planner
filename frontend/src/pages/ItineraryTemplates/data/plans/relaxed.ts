import { authoredUnhurriedRoutePlan } from './cityStayPlanBuild'
import type { AuthoredPlan } from './types'

export const RELAXED_PLANS: AuthoredPlan[] = [
  authoredUnhurriedRoutePlan(
    'take-it-slow-in-vietnam',
    [
      { city: 'Hanoi', days: 2 },
      { city: 'Hue', days: 1 },
      { city: 'Hoi An', days: 2 },
      { city: 'Da Nang', days: 1 },
      { city: 'Ho Chi Minh City', days: 1 },
    ],
    'relaxed',
    {
      Hanoi: 'sofitel-legend-metropole',
      Hue: 'la-y-riverview',
      'Hoi An': 'lasenta-boutique',
      'Da Nang': 'tms-hotel-danang-beach',
      'Ho Chi Minh City': 'mia-saigon',
    },
  ),
  authoredUnhurriedRoutePlan(
    'vietnam-at-your-own-pace',
    [
      { city: 'Sapa', days: 2 },
      { city: 'Ninh Binh', days: 2 },
      { city: 'Hanoi', days: 2 },
    ],
    'relaxed',
    {
      Sapa: 'sapa-topas-ecolodge',
      'Ninh Binh': 'ninhbinh-tamcoc',
      Hanoi: 'intercontinental-westlake',
    },
  ),
  authoredUnhurriedRoutePlan(
    'slow-days-sunny-places',
    [
      { city: 'Da Nang', days: 2 },
      { city: 'Hoi An', days: 3 },
    ],
    'relaxed',
    {
      'Da Nang': 'radisson-hotel-danang',
      'Hoi An': 'the-watermark-beachside',
    },
  ),
]
