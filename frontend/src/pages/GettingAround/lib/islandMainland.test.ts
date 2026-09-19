import { describe, expect, it } from 'vitest'
import { detectUrbanSeaHop, overlaySeaHopOnUrbanOptions } from './islandMainland'
import { resolveIntercityRoute } from '../data/routeIntelligence'
import { DEFAULT_URBAN, getMode } from '../data/modes'
import { resolveUrbanJourney, type UrbanModeOption, type UrbanSelection } from '../data/urbanIntelligence'
import { shouldGuideOutbound, buildOutboundGuide } from '../../../components/outbound/outboundGuide'

function pin(
  cityId: UrbanSelection['cityId'],
  label: string,
  lat: number,
  lng: number,
): UrbanSelection {
  return {
    id: `${cityId}-${label}`,
    lat,
    lng,
    cityId,
    label,
    area: label,
    districtId: null,
    districtName: null,
    nearestAreaId: null,
    nearPlace: null,
    nearWater: null,
    kind: 'freeform',
  }
}

function dummyScooter(): UrbanModeOption {
  const mode = getMode('scooter')!
  return {
    id: 'scooter-dummy',
    modeId: 'scooter',
    mode,
    status: 'typical',
    typicalDurationLabel: '40 min',
    typicalCostLabel: '$8',
    typicalMinutes: [30, 50],
    typicalCostUsd: [6, 12],
    trafficNote: 'Urban',
    why: 'Default urban ranking',
    practical: true,
    complexity: 1,
    scrollTargetId: 'mode-urban-scooter',
    score: 90,
    suitability: 'recommended',
  }
}

describe('island mainland transport', () => {
  it('detects Phu Quoc to Ho Chi Minh City as a sea hop, not an urban scooter', () => {
    const hop = detectUrbanSeaHop(
      pin('phu-quoc', 'Duong Dong', 10.227, 103.967),
      pin('phu-quoc', 'Ho Chi Minh City', 10.776, 106.701),
    )
    expect(hop).not.toBeNull()
    expect(hop?.reason).toBe('island-mainland')
    expect(hop?.fromPlace.id).toBe('phu-quoc')
    expect(hop?.toPlace.id).toBe('hcmc')
  })

  it('marks scooter impractical and prefers flight or ferry mix', () => {
    const overlay = overlaySeaHopOnUrbanOptions(
      pin('phu-quoc', 'Duong Dong', 10.227, 103.967),
      pin('phu-quoc', 'District 1', 10.776, 106.701),
      [dummyScooter()],
    )
    expect(overlay).not.toBeNull()
    const scooter = overlay!.options.find((o) => o.modeId === 'scooter')
    expect(scooter?.practical).toBe(false)
    const seaIds = overlay!.options.filter((o) => o.practical).map((o) => o.modeId)
    expect(seaIds.some((id) => id === 'flight' || id === 'ferry')).toBe(true)
    expect(overlay!.insight.toLowerCase()).toMatch(/water|ferry|flight/)
  })

  it('does not treat two Phu Quoc beaches as a mainland crossing', () => {
    const hop = detectUrbanSeaHop(
      pin('phu-quoc', 'Duong Dong', 10.227, 103.967),
      pin('phu-quoc', 'Sao Beach', 10.174, 104.005),
    )
    expect(hop).toBeNull()
  })

  it('uses real Ha Tien–HCMC ground time on the ferry mix, not a 15–40 min taxi', () => {
    const intel = resolveIntercityRoute('phu-quoc', 'hcmc')
    const ferry = intel?.journeys.find((j) => j.modeId === 'ferry' && j.status !== 'not-available')
    expect(ferry).toBeTruthy()
    const last = ferry!.legs[ferry!.legs.length - 1]
    expect(last.toLabel.toLowerCase()).toMatch(/chi minh|saigon|hcmc/)
    expect(last.typicalMinutes?.[0] ?? 0).toBeGreaterThanOrEqual(180)
    expect(ferry!.displayTitle.toLowerCase()).toMatch(/ferry/)
  })

  it('resolveUrbanJourney on Phu Quoc → HCMC does not recommend scooter', () => {
    const result = resolveUrbanJourney(
      pin('phu-quoc', 'Duong Dong', 10.227, 103.967),
      pin('phu-quoc', 'Ben Thanh', 10.772, 106.698),
      DEFAULT_URBAN,
    )
    expect(result.seaCrossing).toBe(true)
    const top = result.options.find((o) => o.id === result.recommendations[0]?.optionId)
    expect(top?.modeId).not.toBe('scooter')
    expect(result.options.find((o) => o.modeId === 'scooter')?.practical).toBe(false)
  })
})

describe('outbound redirect guide', () => {
  it('skips same-origin and map tiles, but guides 12Go', () => {
    expect(shouldGuideOutbound('https://www.openstreetmap.org/copyright')).toBe(false)
    expect(shouldGuideOutbound('/getting-around')).toBe(false)
    expect(shouldGuideOutbound('https://12go.asia/en/ferry/ha-tien/phu-quoc/')).toBe(true)
    const guide = buildOutboundGuide('https://12go.asia/en/ferry/ha-tien/phu-quoc/', 'Ha Tien ferry')
    expect(guide.tips.length).toBeGreaterThan(1)
    expect(guide.headline.toLowerCase()).toMatch(/12go|sailing|ferry/)
  })
})
