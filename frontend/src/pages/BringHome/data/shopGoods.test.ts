import { describe, expect, it } from 'vitest'
import { DESTINATIONS, getDestinationsForItem } from './destinations'

describe('shop goods filters', () => {
  it('does not mark coffee or tea counters as electronics or footwear', () => {
    for (const id of ['hanoi-coffee-roaster', 'trung-nguyen', 'hcmc-tea-house']) {
      const d = DESTINATIONS.find((x) => x.id === id)
      expect(d, id).toBeTruthy()
      expect(d!.goodsCategories ?? []).not.toContain('electronics')
      expect(d!.goodsCategories ?? []).not.toContain('footwear')
    }
  })

  it('does not treat ceramic or lantern workshops as apparel', () => {
    for (const id of ['bat-trang', 'thanh-ha-pottery', 'hoian-lantern', 'non-nuoc-stone']) {
      const d = DESTINATIONS.find((x) => x.id === id)
      expect(d, id).toBeTruthy()
      expect(d!.goodsCategories ?? []).not.toContain('apparel')
      expect(d!.goodsCategories ?? []).not.toContain('electronics')
    }
  })

  it('electronics results are real electronics desks, not night-market snacks', () => {
    const ids = getDestinationsForItem('All', 'All', 'best-overall', { goods: 'electronics' }).map(
      (d) => d.id,
    )
    expect(ids).toContain('pico-hanoi')
    expect(ids).toContain('phong-vu-hcmc')
    expect(ids).toContain('lotte-center-hanoi')
    expect(ids).not.toContain('dalat-night-market')
    expect(ids).not.toContain('cai-rang-floating-market')
    expect(ids).not.toContain('saigon-square')
  })

  it('apparel includes silk streets and tailors, not coffee shops', () => {
    const ids = getDestinationsForItem('All', 'All', 'best-overall', { goods: 'apparel' }).map(
      (d) => d.id,
    )
    expect(ids).toContain('hang-gai-silk')
    expect(ids).toContain('hoian-tailor')
    expect(ids).toContain('saigon-square')
    expect(ids).not.toContain('hanoi-coffee-roaster')
    expect(ids).not.toContain('pico-hanoi')
  })

  it('bags includes leather workshops and square, not pottery village', () => {
    const ids = getDestinationsForItem('All', 'All', 'best-overall', { goods: 'bags' }).map(
      (d) => d.id,
    )
    expect(ids).toContain('hoian-leather')
    expect(ids).toContain('saigon-square')
    expect(ids).not.toContain('bat-trang')
  })
})
