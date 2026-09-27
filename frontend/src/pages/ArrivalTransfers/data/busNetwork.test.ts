import { describe, expect, it } from 'vitest'
import { busLineForProvider, busNetworkFor } from './busNetwork'

describe('bus network', () => {
  it('lists multiple distinct Hanoi airport corridors, not a single 86 clone', () => {
    const lines = busNetworkFor('HAN')
    const numbers = lines.map((l) => l.number)
    expect(numbers).toEqual(expect.arrayContaining(['86', '17', '07', '90', '68', '109']))
    const termini = new Set(lines.map((l) => l.terminusIn))
    expect(termini.size).toBe(lines.length)
  })

  it('lists Saigon lines that leave the airport in different directions', () => {
    const lines = busNetworkFor('SGN')
    expect(lines.map((l) => l.number)).toEqual(expect.arrayContaining(['109', '152', '119', '159', '49']))
    const mienTay = lines.find((l) => l.id === 'sgn-119')
    const park = lines.find((l) => l.id === 'sgn-109')
    expect(mienTay?.terminusIn.toLowerCase()).toContain('miền tây')
    expect(park?.terminusIn.toLowerCase()).toContain('23/9')
  })

  it('gives Đà Nẵng both city buses and the Hoi An coach', () => {
    const lines = busNetworkFor('DAD')
    expect(lines.some((l) => l.id === 'dad-06')).toBe(true)
    expect(lines.some((l) => l.id === 'dad-10')).toBe(true)
    expect(lines.some((l) => l.id === 'dad-super')).toBe(true)
  })

  it('maps catalog ids onto the focused line', () => {
    expect(busLineForProvider('han-86', 'HAN')?.number).toBe('86')
    expect(busLineForProvider('sgn-152', 'SGN')?.number).toBe('152')
    expect(busLineForProvider('dad-city', 'DAD')?.number).toBe('06')
    expect(busLineForProvider('cxr-162', 'CXR')?.number).toBe('16-2')
    expect(busLineForProvider('pqc-jw', 'PQC')?.number).toBe('N')
  })
})
