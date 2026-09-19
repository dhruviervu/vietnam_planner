import { authoredUnhurriedRoutePlan } from './cityStayPlanBuild'
import type { AuthoredPlan } from './types'

const SLOW_STAYS: Record<string, string> = {
  Hanoi: 'intercontinental-westlake',
  'Ha Long': 'halong-pearl',
  'Ninh Binh': 'ninhbinh-tamcoc',
  Hue: 'la-y-riverview',
  'Hoi An': 'lasenta-boutique',
  'Da Nang': 'tms-hotel-danang-beach',
  'Nha Trang': 'nhatrang-mojzo',
  Sapa: 'sapa-topas-ecolodge',
  'Phu Quoc': 'phuquoc-sol',
  'Can Tho': 'cantho-ninh-kieu',
}

export const SLOW_PLANS: AuthoredPlan[] = [
  authoredUnhurriedRoutePlan(
    'slow-north-water',
    [
      { city: 'Hanoi', days: 2 },
      { city: 'Ha Long', days: 2 },
      { city: 'Ninh Binh', days: 3 },
    ],
    'slow',
    SLOW_STAYS,
  ),
  authoredUnhurriedRoutePlan(
    'slow-imperial-lanterns',
    [
      { city: 'Hue', days: 3 },
      { city: 'Hoi An', days: 4 },
    ],
    'slow',
    SLOW_STAYS,
  ),
  authoredUnhurriedRoutePlan(
    'slow-sand-and-lanterns',
    [
      { city: 'Hoi An', days: 4 },
      { city: 'Da Nang', days: 3 },
    ],
    'slow',
    SLOW_STAYS,
  ),
  authoredUnhurriedRoutePlan(
    'slow-two-coasts',
    [
      { city: 'Nha Trang', days: 3 },
      { city: 'Phu Quoc', days: 5 },
    ],
    'slow',
    SLOW_STAYS,
  ),
  authoredUnhurriedRoutePlan(
    'slow-valley-and-boats',
    [
      { city: 'Sapa', days: 4 },
      { city: 'Ninh Binh', days: 3 },
    ],
    'slow',
    SLOW_STAYS,
  ),
  authoredUnhurriedRoutePlan(
    'slow-mekong-island',
    [
      { city: 'Can Tho', days: 2 },
      { city: 'Phu Quoc', days: 5 },
    ],
    'slow',
    SLOW_STAYS,
  ),
]
