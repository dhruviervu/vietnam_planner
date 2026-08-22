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
 * Final Vietnam, Curated planning pipeline.
 * Build itinerary walks the user through these stages in order.
 */
export const BUILDER_STEPS: BuilderStep[] = [
  {
    id: 'when-to-go',
    path: 'when-to-go',
    label: 'When to go',
    short: 'Timing',
    continueLabel: 'Continue to Experiences',
    nextId: 'experiences',
  },
  {
    id: 'experiences',
    path: 'experiences',
    label: 'Experiences',
    short: 'Experiences',
    continueLabel: 'Continue to Things to Do',
    nextId: 'activities',
  },
  {
    id: 'activities',
    path: 'activities',
    label: 'Things to Do',
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
    label: 'Taste of Vietnam',
    short: 'Food',
    continueLabel: 'Continue to Shopping',
    nextId: 'shopping',
  },
  {
    id: 'shopping',
    path: 'shopping',
    label: 'Shopping',
    short: 'Shop',
    continueLabel: 'Continue to Airport Transfers',
    nextId: 'airport',
  },
  {
    id: 'airport',
    path: 'airport',
    label: 'Airport Transfers',
    short: 'Airport',
    continueLabel: 'Continue to Logistics',
    nextId: 'logistics',
    optional: true,
  },
  {
    id: 'logistics',
    path: 'logistics',
    label: 'Logistics',
    short: 'Logistics',
    continueLabel: 'Review My Trip',
    nextId: 'itinerary',
  },
  {
    id: 'itinerary',
    path: 'itinerary',
    label: 'Your Vietnam',
    short: 'Itinerary',
    continueLabel: 'Done',
    nextId: null,
  },
]

export function stepPath(id: BuilderStepId) {
  const step = BUILDER_STEPS.find((s) => s.id === id)
  return `/plan/builder/${step?.path ?? 'when-to-go'}`
}

export function stepIndex(id: BuilderStepId) {
  // Legacy aliases from the previous builder order
  const normalized: BuilderStepId =
    id === 'basics' ? 'when-to-go' : id === 'know-before' ? 'logistics' : id
  return BUILDER_STEPS.findIndex((s) => s.id === normalized)
}

/** First step of the Build Itinerary pipeline */
export const PIPELINE_START = stepPath('when-to-go')
