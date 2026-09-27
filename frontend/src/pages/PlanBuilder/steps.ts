import type { BuilderStepId } from './types'

export type BuilderStep = {
  id: BuilderStepId
  path: string
  label: string
  short: string
  continueLabel: string
  nextId: BuilderStepId | null
  /** Soft-optional steps (e.g. airport) can be skipped without guilt */
  optional?: boolean
}

/**
 * Final TripBuilder planning pipeline.
 * Build itinerary walks the user through these stages in order.
 */
export const BUILDER_STEPS: BuilderStep[] = [
  {
    id: 'when-to-go',
    path: 'when-to-go',
    label: 'When to go',
    short: 'Timing',
    continueLabel: 'Continue to Attractions',
    nextId: 'experiences',
  },
  {
    id: 'experiences',
    path: 'experiences',
    label: 'Attractions',
    short: 'Attractions',
    continueLabel: 'Continue to Activities',
    nextId: 'activities',
  },
  {
    id: 'activities',
    path: 'activities',
    label: 'Activities',
    short: 'Activities',
    continueLabel: 'Continue to Where to Stay',
    nextId: 'stay',
  },
  {
    id: 'stay',
    path: 'stay',
    label: 'Where to Stay',
    short: 'Stay',
    continueLabel: 'Continue to Getting Around',
    nextId: 'transport',
  },
  {
    id: 'transport',
    path: 'transport',
    label: 'Getting Around',
    short: 'Transport',
    continueLabel: 'Continue to Food',
    nextId: 'eat',
  },
  {
    id: 'eat',
    path: 'eat',
    label: 'Where to Eat',
    short: 'Eat',
    continueLabel: 'Continue to Shopping',
    nextId: 'shopping',
  },
  {
    id: 'shopping',
    path: 'shopping',
    label: 'Shopping in Vietnam',
    short: 'Shop',
    continueLabel: 'Continue to Airport Transfers',
    nextId: 'airport',
  },
  {
    id: 'airport',
    path: 'airport',
    label: 'Airport Transfer',
    short: 'Airport',
    continueLabel: 'Continue to Know before you go',
    nextId: 'logistics',
    optional: true,
  },
  {
    id: 'logistics',
    path: 'logistics',
    label: 'Know before you go',
    short: 'Prep',
    continueLabel: 'Review My Trip',
    nextId: 'itinerary',
  },
  {
    id: 'itinerary',
    path: 'itinerary',
    label: 'Your itinerary',
    short: 'Itinerary',
    continueLabel: 'Done',
    nextId: null,
  },
]

export function stepPath(id: BuilderStepId) {
  const step = BUILDER_STEPS.find((s) => s.id === id)
  return `/plan/builder/${step?.path ?? 'when-to-go'}`
}

export type PipelineNavItem = { to: string; label: string; step: BuilderStepId }

export type PipelineNavGroup = {
  title: string
  items: PipelineNavItem[]
}

/** Same grouping as the home browse rail. */
export const PIPELINE_NAV_GROUPS: PipelineNavGroup[] = [
  {
    title: 'Basics',
    items: [
      { to: stepPath('when-to-go'), label: 'When to Go', step: 'when-to-go' },
      { to: stepPath('logistics'), label: 'Know before you go', step: 'logistics' },
    ],
  },
  {
    title: 'Logistics',
    items: [
      { to: stepPath('stay'), label: 'Where to stay', step: 'stay' },
      { to: stepPath('transport'), label: 'Getting Around', step: 'transport' },
      { to: stepPath('airport'), label: 'Airport Transfer', step: 'airport' },
    ],
  },
  {
    title: 'Itinerary',
    items: [
      { to: stepPath('experiences'), label: 'Attractions', step: 'experiences' },
      { to: stepPath('activities'), label: 'Activities', step: 'activities' },
      { to: stepPath('eat'), label: 'Where to Eat', step: 'eat' },
      { to: stepPath('shopping'), label: 'Shopping in Vietnam', step: 'shopping' },
    ],
  },
]

export function stepIndex(id: BuilderStepId) {
  // Legacy aliases from the previous builder order
  const normalized: BuilderStepId =
    id === 'basics' ? 'when-to-go' : id === 'know-before' ? 'logistics' : id
  return BUILDER_STEPS.findIndex((s) => s.id === normalized)
}

/** First step of the Build Itinerary pipeline */
export const PIPELINE_START = stepPath('when-to-go')
