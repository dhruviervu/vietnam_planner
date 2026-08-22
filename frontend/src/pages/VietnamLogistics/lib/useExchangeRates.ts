import { useEffect, useState } from 'react'
import {
  FALLBACK_USD_RATES,
  fetchUsdRates,
  type FxRates,
} from '../lib/currency'

export function useExchangeRates() {
  const [rates, setRates] = useState<FxRates>({
    base: 'USD',
    rates: FALLBACK_USD_RATES,
    timestamp: '',
    source: 'Fallback mid-market approximation',
  })
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading')

  useEffect(() => {
    let cancelled = false
    fetchUsdRates()
      .then((fx) => {
        if (cancelled) return
        setRates(fx)
        setStatus('live')
      })
      .catch(() => {
        if (cancelled) return
        setRates({
          base: 'USD',
          rates: FALLBACK_USD_RATES,
          timestamp: new Date().toISOString(),
          source: 'Fallback mid-market approximation',
        })
        setStatus('fallback')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { rates, status }
}
