import { useMemo, useState } from 'react'
import { convertAmount, formatMoney, type FxRates } from '../lib/currency'
import { Label } from './ui'

type Props = {
  fx: FxRates
  fxStatus: 'loading' | 'live' | 'fallback'
  /** Optional: sync cost-display currency when converting into a supported one */
  onApplyDisplay?: (currency: string) => void
  displayCurrencies?: string[]
}

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'VND', 'SGD', 'CAD'] as const

const PRESETS = [
  { amount: 50, currency: 'USD' },
  { amount: 100, currency: 'USD' },
  { amount: 5000, currency: 'INR' },
  { amount: 100, currency: 'EUR' },
  { amount: 1_000_000, currency: 'VND' },
] as const

const FX_IMG =
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'

function formatRate(n: number, currency: string): string {
  if (currency === 'VND') return Math.round(n).toLocaleString('en-US')
  if (n >= 100) return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (n >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: 4 })
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

function statusMeta(status: Props['fxStatus']) {
  if (status === 'live') {
    return {
      label: 'Live mid-market',
      detail: 'Based on the latest available conversion rates',
      dot: 'bg-sage',
    }
  }
  if (status === 'loading') {
    return {
      label: 'Updating rates…',
      detail: 'Fetching the latest mid-market conversion rates',
      dot: 'bg-ink/30',
    }
  }
  return {
    label: 'Approximate rates',
    detail: 'Live feed unavailable — showing fallback mid-market estimates',
    dot: 'bg-terracotta',
  }
}

export function CurrencyConverter({
  fx,
  fxStatus,
  onApplyDisplay,
  displayCurrencies = [],
}: Props) {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('VND')
  const [amount, setAmount] = useState(100)

  const converted = useMemo(
    () => convertAmount(amount, from, to, fx.rates),
    [amount, from, to, fx.rates],
  )

  const unitRate = useMemo(
    () => convertAmount(1, from, to, fx.rates),
    [from, to, fx.rates],
  )

  const inverseRate = useMemo(
    () => convertAmount(1, to, from, fx.rates),
    [from, to, fx.rates],
  )

  const meta = statusMeta(fxStatus)
  const updatedLabel = fx.timestamp
    ? new Date(fx.timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  const canApply = !!onApplyDisplay && displayCurrencies.includes(to)

  function swap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="overflow-hidden rounded-[3px] border border-ink/10">
      <div className="relative h-[100px] sm:h-[112px]">
        <img src={FX_IMG} alt="" className="h-full w-full object-cover object-[center_40%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/50 to-ink/20" />
        <div className="absolute inset-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper/75">
              Currency converter
            </p>
            <p className="mt-1 font-serif text-[1.2rem] leading-snug text-paper sm:text-[1.3rem]">
              Convert before you budget
            </p>
          </div>
          <div className="hidden shrink-0 rounded-[2px] bg-paper/15 px-2.5 py-1.5 backdrop-blur-sm sm:block">
            <p className="flex items-center gap-1.5 text-[0.68rem] font-bold text-paper">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[linear-gradient(180deg,#faf6f0_0%,#f3ebe0_100%)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center gap-2 sm:hidden">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          <span className="text-[0.72rem] font-bold text-ink">{meta.label}</span>
        </div>
        <p className="mt-1 text-[0.78rem] text-muted sm:mt-0">{meta.detail}</p>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="rounded-[3px] border border-ink/10 bg-paper px-3.5 py-3">
            <Label>You have</Label>
            <div className="mt-2 flex items-end gap-3">
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="h-12 min-w-0 flex-1 border-b border-ink/20 bg-transparent font-serif text-[1.75rem] font-semibold text-ink focus:border-terracotta focus:outline-none"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-12 border-b border-ink/20 bg-transparent pr-5 text-[0.95rem] font-bold text-ink focus:border-terracotta focus:outline-none"
                aria-label="From currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center lg:pb-2">
            <button
              type="button"
              onClick={swap}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-paper text-ink transition hover:border-terracotta/40 hover:text-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              aria-label="Swap currencies"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M7 7h11M15 4l3 3-3 3M17 17H6M9 14l-3 3 3 3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="rounded-[3px] border border-terracotta/25 bg-paper px-3.5 py-3">
            <Label>You get</Label>
            <div className="mt-2 flex items-end gap-3">
              <p className="min-w-0 flex-1 font-serif text-[clamp(1.5rem,3vw,1.85rem)] font-semibold leading-none tracking-[-0.02em] text-ink">
                {converted != null ? formatMoney(converted, to) : '—'}
              </p>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-12 border-b border-ink/20 bg-transparent pr-5 text-[0.95rem] font-bold text-ink focus:border-terracotta focus:outline-none"
                aria-label="To currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const on = from === p.currency && amount === p.amount
            return (
              <button
                key={`${p.currency}-${p.amount}`}
                type="button"
                onClick={() => {
                  setFrom(p.currency)
                  setAmount(p.amount)
                  if (p.currency === 'VND') setTo('USD')
                  else setTo('VND')
                }}
                className={`rounded-[3px] px-2.5 py-1.5 text-[0.72rem] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                  on
                    ? 'bg-terracotta text-paper'
                    : 'bg-ink/[0.04] text-ink/75 hover:bg-ink/[0.07]'
                }`}
              >
                {formatMoney(p.amount, p.currency)}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid gap-3 border-t border-ink/10 pt-4 sm:grid-cols-3">
          <div>
            <Label>Exchange rate</Label>
            <p className="mt-1.5 text-[0.88rem] font-semibold text-ink">
              {unitRate != null
                ? `1 ${from} = ${formatRate(unitRate, to)} ${to}`
                : '—'}
            </p>
            <p className="mt-0.5 text-[0.7rem] text-muted">
              {inverseRate != null
                ? `1 ${to} = ${formatRate(inverseRate, from)} ${from}`
                : ''}
            </p>
          </div>
          <div>
            <Label>Rate freshness</Label>
            <p className="mt-1.5 text-[0.88rem] font-semibold text-ink">
              {updatedLabel ?? (fxStatus === 'loading' ? 'Checking…' : 'Not timestamped')}
            </p>
            <p className="mt-0.5 text-[0.7rem] text-muted">Mid-market · not a bank cash rate</p>
          </div>
          <div>
            <Label>Source</Label>
            <p className="mt-1.5 text-[0.82rem] leading-snug text-ink/85">{fx.source}</p>
            <p className="mt-0.5 text-[0.7rem] text-muted">
              Cards and desks add their own fees
            </p>
          </div>
        </div>

        {canApply && onApplyDisplay ? (
          <button
            type="button"
            onClick={() => onApplyDisplay(to)}
            className="mt-4 inline-flex items-center rounded-[3px] bg-terracotta px-4 py-2.5 text-[0.8rem] font-bold text-paper transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            Use {to} for cost prices below →
          </button>
        ) : null}
      </div>
    </div>
  )
}
