import type { TemplateSectionId } from './types'

export type TemplateSection = {
  id: TemplateSectionId
  label: string
  intro: string
}

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    id: 'solo',
    label: 'Solo',
    intro: 'Room to wander, eat what you like, and set the day’s pace without a committee.',
  },
  {
    id: 'couples',
    label: 'Couples',
    intro: 'Two-person itineraries built around shared mornings, long meals, and unhurried evenings.',
  },
  {
    id: 'family-young',
    label: 'Young kids',
    intro: 'Short hops, early nights, and places that work when little legs (and nap windows) lead the day.',
  },
  {
    id: 'family-older',
    label: 'Older kids',
    intro: 'Enough motion and flavour to keep teenagers interested — without turning the trip into a slog.',
  },
  {
    id: 'friends',
    label: 'Friends',
    intro: 'Group energy, late tables, and a route that still leaves space for whoever wants a slower morning.',
  },
  {
    id: 'large-groups',
    label: 'Large groups',
    intro: 'Bigger crews need simpler logistics: fewer bases, shared meals, and cities that absorb a crowd.',
  },
  {
    id: 'budget',
    label: 'Budget',
    intro: 'Street food, overnight buses, and the classic backpacker spine — Vietnam on a careful spend.',
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    intro: 'Fewer cities, longer stays, and days that are allowed to stay empty on purpose.',
  },
  {
    id: 'beaches',
    label: 'Beaches',
    intro: 'Sand, swims, and the kind of week that is organised around the water, not the checklist.',
  },
  {
    id: 'food',
    label: 'Food',
    intro: 'Built around bowls, bakeries, markets, and the cities where Vietnam’s cooking is at its loudest.',
  },
  {
    id: 'adventure',
    label: 'Adventure',
    intro: 'Highlands, rivers, and road time — Vietnam beyond the usual city loop.',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    intro: 'Boutique stays, bay cruises, and a slower, more polished reading of the same country.',
  },
  {
    id: 'first-time',
    label: 'First-time',
    intro: 'The highlights arc: enough of the famous Vietnam to feel the country, without trying to see all of it.',
  },
  {
    id: 'reset',
    label: 'Reset',
    intro: 'Quiet days, light plans, and a trip that is allowed to feel like a pause rather than a production.',
  },
  {
    id: 'max-experience',
    label: 'Maximum experience',
    intro:
      'For people who want to see everything: full days, iconic stops, and honest tradeoffs when the calendar is tight. Built to use, not to decorate.',
  },
]

export function sectionAnchor(id: TemplateSectionId | 'catalog') {
  return `tpl-${id}`
}
