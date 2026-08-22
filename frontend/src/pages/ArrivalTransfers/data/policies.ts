export type PolicyTopic = {
  id: string
  title: string
  summary: string
  body: string
}

export const BOOKING_POLICIES: PolicyTopic[] = [
  {
    id: 'cancellation',
    title: 'Cancellation',
    summary: 'Free / limited / non-refundable — check before you leave this site.',
    body: 'Cancellation rules belong to the provider. Prefer free-cancellation options when your arrival time is uncertain. If policy data is missing, assume you must confirm on the provider site.',
  },
  {
    id: 'flight-delay',
    title: 'Flight delays',
    summary: 'Do not assume every transfer automatically adjusts for delays.',
    body: 'Some private transfers include flight tracking; others need a message or may charge waiting time. Ride-hailing and taxis are usually booked after landing. Always read the provider’s delay wording.',
  },
  {
    id: 'waiting',
    title: 'Waiting time',
    summary: 'Included waiting windows vary — extras may apply.',
    body: 'Many private transfers include about 45–60 minutes after landing. Additional waiting can be chargeable. Taxis and ride-hailing typically start when you request the ride.',
  },
  {
    id: 'no-show',
    title: 'No-show',
    summary: 'Missing a pre-booked pickup can forfeit the fare.',
    body: 'If you cannot find the driver, use the provider’s contact channel before leaving the meeting point. No-show rules are provider-controlled.',
  },
  {
    id: 'luggage',
    title: 'Luggage',
    summary: 'Confirm capacity for large or bulky bags before booking.',
    body: 'Sedans suit light–medium bags; MPVs handle family luggage better. Oversize items may need a larger vehicle or an extra fee — check the listing.',
  },
  {
    id: 'pickup',
    title: 'Pickup',
    summary: 'Meet & greet, ranks and app zones work differently.',
    body: 'Private transfers often use name-board meet & greet. Taxis use ranks. Ride-hailing uses designated airport zones that can involve a short walk.',
  },
  {
    id: 'payment',
    title: 'Payment',
    summary: 'Card, cash and in-app payment vary by provider.',
    body: 'App rides usually settle in-app. Taxis may prefer cash. Pre-booked transfers often charge card online. Confirm payment method before you commit.',
  },
  {
    id: 'changes',
    title: 'Changes',
    summary: 'Flight or address changes may need provider confirmation.',
    body: 'Update your provider as soon as plans change. Change fees and cut-offs are set by the provider, not Vietnam, Curated.',
  },
]
