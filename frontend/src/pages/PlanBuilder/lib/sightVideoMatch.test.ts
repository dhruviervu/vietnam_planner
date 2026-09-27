import { expect, it } from 'vitest'
import { videoTitleMatchesSight, type SightVideoRef } from './sightVideoMatch'

const catalog: SightVideoRef[] = [
  { id: 'ninh-binh', name: 'Trang An Landscape Complex', city: 'Ninh Binh' },
  { id: 'mua-cave', name: 'Mua Cave', city: 'Ninh Binh' },
  { id: 'tam-coc', name: 'Tam Coc', city: 'Ninh Binh' },
  { id: 'old-quarter', name: 'Hanoi Old Quarter', city: 'Hanoi' },
  { id: 'hoan-kiem', name: 'Hoan Kiem Lake', city: 'Hanoi' },
  { id: 'temple-literature', name: 'Temple of Literature', city: 'Hanoi' },
]

it('keeps a title that is only about that sight', () => {
  expect(
    videoTitleMatchesSight(
      'Temple of Literature Hanoi walking tour — Van Mieu courtyards',
      catalog.find((s) => s.id === 'temple-literature')!,
      catalog,
    ),
  ).toBe(true)
})

it('keeps a Trang An boat video for the Ninh Binh landscape sight', () => {
  expect(
    videoTitleMatchesSight(
      'Ninh Binh on a Budget: Trang An Boat Tour Complete Guide',
      catalog.find((s) => s.id === 'ninh-binh')!,
      catalog,
    ),
  ).toBe(true)
})

it('rejects combo day tours and vs videos', () => {
  const tam = catalog.find((s) => s.id === 'tam-coc')!
  expect(
    videoTitleMatchesSight(
      'Ninh Binh day tour | Mua Cave | Tam Coc Boating review',
      tam,
      catalog,
    ),
  ).toBe(false)
  expect(
    videoTitleMatchesSight('Trang An vs Tam Coc – Which boat ride is better?', tam, catalog),
  ).toBe(false)
})

it('rejects city listicles that mention the sight', () => {
  expect(
    videoTitleMatchesSight(
      'Hoan Kiem Lake | Hanoi Old Quarter | Best Places to Visit in Hanoi',
      catalog.find((s) => s.id === 'old-quarter')!,
      catalog,
    ),
  ).toBe(false)
})
