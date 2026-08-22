import type { LogisticsCard } from '../types'

export const LOGISTICS_CARDS: LogisticsCard[] = [
  {
    id: 'visa',
    title: 'Visa',
    icon: '🛂',
    summary: 'Many nationalities can use e-visa or visa exemption — check your passport.',
    facts: [
      { label: 'Common path', value: 'e-Visa online' },
      { label: 'Action', value: 'Apply before travel' },
      { label: 'Tip', value: 'Match entry dates exactly' },
    ],
    detail:
      'Vietnam’s e-visa covers most short tourist stays. Confirm your nationality’s requirements on the official immigration site and allow processing time. Keep a printed or offline copy of approval.',
    linkLabel: 'Official e-visa information',
    linkHref: 'https://evisa.gov.vn/',
  },
  {
    id: 'currency',
    title: 'Currency',
    icon: '💵',
    summary: 'Vietnamese Dong (VND). Cards work in cities; cash still rules street food.',
    facts: [
      { label: 'Currency', value: 'Vietnamese Dong' },
      { label: 'Rough guide', value: '~25,000 VND ≈ $1' },
      { label: 'Street food', value: 'Cash preferred' },
    ],
    detail:
      'ATMs are widespread in cities. Notify your bank, carry small bills for markets and taxis, and expect hotels/restaurants to take cards more often than sidewalk stalls.',
  },
  {
    id: 'sim',
    title: 'SIM & Connectivity',
    icon: '📱',
    summary: 'eSIM or airport/tourist SIM — cheap data, easy setup.',
    facts: [
      { label: 'Typical cost', value: '$5–$15 for data' },
      { label: 'Options', value: 'eSIM or physical SIM' },
      { label: 'Recommendation', value: 'Get data on arrival day' },
    ],
    detail:
      'Popular tourist SIMs include Viettel, Mobifone, and Vinaphone. eSIMs can be installed before you land. Maps and ride-hailing work best with a local data plan.',
  },
  {
    id: 'language',
    title: 'Language',
    icon: '🗣',
    summary: 'Vietnamese is official. English is common in tourist areas.',
    facts: [
      { label: 'Official', value: 'Vietnamese' },
      { label: 'Tourist zones', value: 'English widely usable' },
      { label: 'Useful words', value: 'Xin chào · Cảm ơn' },
    ],
    detail:
      'A translation app helps in markets and taxis. Smile, point, and learn a few greetings — locals appreciate the effort.',
  },
  {
    id: 'safety',
    title: 'Safety',
    icon: '🛡',
    summary: 'Vietnam is generally welcoming. Mind traffic and petty theft in crowds.',
    facts: [
      { label: 'Overall', value: 'Travel-friendly' },
      { label: 'Watch for', value: 'Traffic & bag snatch risk' },
      { label: 'Emergency', value: 'Local numbers in hotel info' },
    ],
    detail:
      'Use marked crossings when possible, keep bags secure on scooters and in markets, and use reputable ride apps at night. Keep digital copies of documents.',
    linkLabel: 'Travel advisory placeholder',
    linkHref: 'https://travel.state.gov/',
  },
]
