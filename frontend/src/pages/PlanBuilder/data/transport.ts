import type { TransportLeg, TransportMode, TransportOption } from '../types'

const MODE_META: Record<
  TransportMode,
  { label: string; icon: string }
> = {
  train: { label: 'Train', icon: '🚆' },
  bus: { label: 'Bus / Shuttle', icon: '🚐' },
  taxi: { label: 'Taxi', icon: '🚕' },
  driver: { label: 'Private Driver', icon: '🚘' },
  rental: { label: 'Vehicle Rental', icon: '🏍' },
}

function opts(
  rows: Array<[TransportMode, number, number, number, string]>,
): TransportOption[] {
  return rows.map(([mode, costUsd, durationMinutes, convenience, status]) => ({
    mode,
    label: MODE_META[mode].label,
    icon: MODE_META[mode].icon,
    costUsd,
    durationMinutes,
    convenience,
    status,
  }))
}

/** Prototype legs between common builder regions */
export const TRANSPORT_LEGS: TransportLeg[] = [
  {
    id: 'hanoi-ninhbinh',
    from: 'Hanoi',
    to: 'Ninh Binh',
    options: opts([
      ['train', 12, 140, 4, 'Frequent'],
      ['bus', 8, 150, 3, 'Frequent'],
      ['driver', 55, 120, 5, 'On demand'],
      ['taxi', 45, 130, 4, 'On demand'],
    ]),
  },
  {
    id: 'hanoi-halong',
    from: 'Hanoi',
    to: 'Quang Ninh',
    options: opts([
      ['bus', 15, 180, 3, 'Frequent'],
      ['driver', 70, 150, 5, 'On demand'],
      ['taxi', 60, 160, 4, 'On demand'],
    ]),
  },
  {
    id: 'hanoi-sapa',
    from: 'Hanoi',
    to: 'Sapa',
    options: opts([
      ['train', 35, 480, 4, 'Overnight available'],
      ['bus', 22, 360, 3, 'Frequent'],
      ['driver', 140, 330, 5, 'On demand'],
    ]),
  },
  {
    id: 'ninhbinh-halong',
    from: 'Ninh Binh',
    to: 'Quang Ninh',
    options: opts([
      ['driver', 85, 210, 5, 'On demand'],
      ['bus', 20, 270, 2, 'Limited'],
    ]),
  },
  {
    id: 'hanoi-hoian',
    from: 'Hanoi',
    to: 'Hoi An',
    options: opts([
      ['train', 45, 960, 3, 'Via Da Nang'],
      ['bus', 30, 1080, 2, 'Overnight'],
      ['driver', 280, 720, 4, 'Long day'],
    ]),
  },
  {
    id: 'danang-hoian',
    from: 'Da Nang',
    to: 'Hoi An',
    options: opts([
      ['taxi', 12, 40, 5, 'On demand'],
      ['driver', 18, 35, 5, 'On demand'],
      ['bus', 3, 60, 3, 'Frequent'],
      ['rental', 8, 45, 4, 'Day rental'],
    ]),
  },
  {
    id: 'hoian-hue',
    from: 'Hoi An',
    to: 'Hue',
    options: opts([
      ['train', 10, 150, 4, 'From Da Nang'],
      ['bus', 8, 180, 3, 'Frequent'],
      ['driver', 55, 150, 5, 'On demand'],
    ]),
  },
  {
    id: 'hcmc-mekong',
    from: 'Ho Chi Minh City',
    to: 'Mekong',
    options: opts([
      ['bus', 12, 150, 3, 'Tour buses'],
      ['driver', 70, 120, 5, 'On demand'],
      ['taxi', 55, 130, 4, 'On demand'],
    ]),
  },
  {
    id: 'hcmc-muine',
    from: 'Ho Chi Minh City',
    to: 'Mui Ne',
    options: opts([
      ['bus', 10, 270, 3, 'Frequent'],
      ['driver', 90, 210, 5, 'On demand'],
      ['train', 14, 300, 3, 'To Phan Thiet'],
    ]),
  },
]

export function findLeg(from: string, to: string): TransportLeg | undefined {
  return (
    TRANSPORT_LEGS.find((l) => l.from === from && l.to === to) ||
    TRANSPORT_LEGS.find((l) => l.from === to && l.to === from)
  )
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
