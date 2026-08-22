import { useEffect, useMemo, useState } from 'react'
import {
  CITY_COST_INDEX,
  COST_CATEGORIES,
  COST_CITIES,
  MONTHLY_SPEND_VND,
  PURCHASING_POWER,
  scaleRange,
} from '../data/costs'
import type { CostCategoryId, CostCityId, DisplayCurrency, TravellerType } from '../data/types'
import { formatMoney, vndToDisplay } from '../lib/currency'
import type { FxRates } from '../lib/currency'
import { ChipButton, Label, SectionIntro, Segmented } from './ui'
import { CurrencyConverter } from './CurrencyConverter'

type Props = {
  fx: FxRates
  fxStatus: 'loading' | 'live' | 'fallback'
  travellerType: TravellerType | null
}

const DISPLAY: DisplayCurrency[] = ['VND', 'USD', 'INR', 'EUR', 'GBP', 'AUD']

const HERO =
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=80'

function relativeWord(value: number): { label: string; tone: string } {
  if (value <= 0.88) return { label: 'Cheaper', tone: 'text-sage' }
  if (value <= 0.97) return { label: 'A touch less', tone: 'text-ink/70' }
  if (value <= 1.05) return { label: 'Typical', tone: 'text-ink/70' }
  if (value <= 1.15) return { label: 'A touch more', tone: 'text-terracotta' }
  return { label: 'Pricier', tone: 'text-terracotta' }
}

function cityInsight(
  label: string,
  idx: { food: number; stay: number; transport: number; leisure: number },
): string {
  const avg = (idx.food + idx.stay + idx.transport + idx.leisure) / 4
  if (avg >= 1.12) {
    return `${label} runs higher overall — especially stays. Budget a little more for lodging.`
  }
  if (avg <= 0.9) {
    return `${label} is generally gentler on the wallet than big tourist hubs.`
  }
  if (idx.stay > idx.food + 0.08) {
    return `In ${label}, food stays reasonable — lodging is where costs creep up.`
  }
  return `${label} sits near a typical tourist baseline — use the category ranges below for detail.`
}

function Donut({
  parts,
}: {
  parts: { label: string; value: number; color: string }[]
}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  let angle = 0
  const slices = parts.map((p) => {
    const sweep = (p.value / total) * 360
    const start = angle
    angle += sweep
    const large = sweep > 180 ? 1 : 0
    const r = 38
    const cx = 50
    const cy = 50
    const startRad = ((start - 90) * Math.PI) / 180
    const endRad = ((start + sweep - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
    return { ...p, d, pct: Math.round((p.value / total) * 100) }
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0" aria-hidden>
        {slices.map((s) => (
          <path key={s.label} d={s.d} fill={s.color} />
        ))}
        <circle cx="50" cy="50" r="20" fill="#FAF3E8" />
      </svg>
      <ul className="space-y-1 text-[0.74rem]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-ink">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            <span className="font-medium">{s.label}</span>
            <span className="text-muted">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IndexBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.round((value / 1.3) * 100))
  const rel = relativeWord(value)
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className={`text-[0.68rem] font-bold ${rel.tone}`}>{rel.label}</span>
      </div>
      <div className="h-[4px] w-full bg-ink/10">
        <div className="h-full bg-terracotta/80" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Round converted amounts to readable chip labels */
function chipLabel(amount: number | null, currency: DisplayCurrency): string {
  if (amount == null || !Number.isFinite(amount)) return '—'
  if (currency === 'VND') {
    if (amount >= 1_000_000) return `${Math.round(amount / 100_000) / 10}M₫`
    if (amount >= 1000) return `${Math.round(amount / 1000)}k₫`
    return formatMoney(amount, 'VND')
  }
  const rounded =
    amount >= 100
      ? Math.round(amount)
      : amount >= 10
        ? Math.round(amount)
        : Math.round(amount * 10) / 10
  return formatMoney(rounded, currency)
}

export function CostsSection({ fx, fxStatus, travellerType }: Props) {
  const [display, setDisplay] = useState<DisplayCurrency>('USD')
  const [cityId, setCityId] = useState<CostCityId>('hanoi')
  const [party, setParty] = useState<TravellerType>(travellerType ?? 'solo')
  const [powerKey, setPowerKey] = useState(0)
  const [categoryId, setCategoryId] = useState<CostCategoryId>('restaurants')

  useEffect(() => {
    if (travellerType) setParty(travellerType)
  }, [travellerType])

  const city = CITY_COST_INDEX[cityId]
  const cityLabel = COST_CITIES.find((c) => c.id === cityId)?.label ?? cityId
  const power = PURCHASING_POWER[powerKey] ?? PURCHASING_POWER[0]
  const cat = COST_CATEGORIES.find((c) => c.id === categoryId) ?? COST_CATEGORIES[0]

  const factor =
    cat.id === 'restaurants' || cat.id === 'groceries'
      ? city.food
      : cat.id === 'transport'
        ? city.transport
        : cat.id === 'leisure'
          ? city.leisure
          : cat.id === 'rent'
            ? city.stay
            : 1
  const range = scaleRange(cat.range, factor)
  const lo = vndToDisplay(range.low, display, fx.rates)
  const mid = vndToDisplay(range.typical, display, fx.rates)
  const hi = vndToDisplay(range.high, display, fx.rates)

  const monthly = MONTHLY_SPEND_VND[party]
  const donutParts = [
    { label: 'Housing', value: monthly.housing * city.stay, color: '#C45C3E' },
    { label: 'Food', value: monthly.food * city.food, color: '#8B7355' },
    { label: 'Transport', value: monthly.transport * city.transport, color: '#5C7A6E' },
    { label: 'Utilities', value: monthly.utilities, color: '#A9C8D6' },
    { label: 'Leisure', value: monthly.leisure * city.leisure, color: '#D4A574' },
    { label: 'Other', value: monthly.other, color: '#3A322C' },
  ]
  const monthlyTotal = donutParts.reduce((s, p) => s + p.value, 0)
  const monthlyDisplay = vndToDisplay(monthlyTotal, display, fx.rates)
  const dailyDisplay = vndToDisplay(monthlyTotal / 30, display, fx.rates)

  const powerDisplay = vndToDisplay(power.vndApprox, display, fx.rates)

  const powerChips = useMemo(
    () =>
      PURCHASING_POWER.map((p) => ({
        ...p,
        displayAmount: vndToDisplay(p.vndApprox, display, fx.rates),
      })),
    [display, fx.rates],
  )

  const cityCompare = useMemo(
    () => COST_CITIES.map((c) => ({ ...c, ...CITY_COST_INDEX[c.id] })),
    [],
  )

  function barWidth(value: number) {
    return `${Math.min(100, Math.max(10, ((value - range.low) / (range.high - range.low || 1)) * 100))}%`
  }

  const plainRead =
    mid != null
      ? `In ${cityLabel}, a ${cat.label.toLowerCase()} cost is typically about ${formatMoney(mid, display)} (${range.unit}).`
      : `In ${cityLabel}, check the ranges below for ${cat.label.toLowerCase()}.`

  return (
    <section className="space-y-6">
      <SectionIntro
        id="logistics-costs"
        n="04 · Costs"
        title="What does Vietnam actually cost?"
        support="Pick a currency and city — then see what everyday money feels like, what categories cost, and how cities compare."
      />

      <CurrencyConverter
        fx={fx}
        fxStatus={fxStatus}
        displayCurrencies={DISPLAY}
        onApplyDisplay={(c) => {
          if (DISPLAY.includes(c as DisplayCurrency)) setDisplay(c as DisplayCurrency)
        }}
      />

      <div className="overflow-hidden rounded-[3px] border border-ink/10">
        <div className="relative h-[120px] sm:h-[140px]">
          <img src={HERO} alt="" className="h-full w-full object-cover object-[center_45%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/40 to-ink/15" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper/75">
              Cost sense, not spreadsheets
            </p>
            <p className="mt-1 max-w-[38ch] font-serif text-[1.2rem] leading-snug text-paper sm:text-[1.35rem]">
              Translate prices into what you can actually do.
            </p>
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#faf6f0_0%,#f3ebe0_100%)] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <Label>Show prices in</Label>
              <div className="mt-1.5">
                <Segmented
                  options={DISPLAY.map((c) => ({ id: c, label: c }))}
                  value={display}
                  onChange={setDisplay}
                  size="sm"
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <Label>City</Label>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {COST_CITIES.map((c) => (
                  <ChipButton
                    key={c.id}
                    active={cityId === c.id}
                    onClick={() => setCityId(c.id)}
                  >
                    {c.label}
                  </ChipButton>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-ink/80">
            {cityInsight(cityLabel, city)}
          </p>
        </div>
      </div>

      {/* Purchasing power — one currency */}
      <div className="rounded-[3px] border border-ink/10 bg-paper p-4 sm:p-5">
        <Label>What does my money get me?</Label>
        <p className="mt-1 max-w-[52ch] text-[0.78rem] text-muted">
          Every amount below is in {display}. Tap a spend level to see what it typically covers.
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {powerChips.map((p, i) => (
            <ChipButton
              key={p.id}
              active={powerKey === i}
              onClick={() => setPowerKey(i)}
              className="!px-3 !py-2"
            >
              {chipLabel(p.displayAmount, display)}
            </ChipButton>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-terracotta">
              With about
            </p>
            <p className="mt-1 font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-none tracking-[-0.02em] text-ink">
              {powerDisplay != null ? formatMoney(powerDisplay, display) : '—'}
            </p>
            <p className="mt-2 text-[0.88rem] leading-snug text-ink/80">{power.sense}</p>
            <p className="mt-2 text-[0.68rem] text-muted">
              Illustrative tourist pricing · not a live quote
            </p>
          </div>

          <ul className="grid gap-2 sm:grid-cols-3">
            {power.items.map((item) => (
              <li
                key={item.label}
                className="rounded-[3px] border border-ink/10 bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)] px-3 py-3"
              >
                <p className="text-[1.35rem] leading-none" aria-hidden>
                  {item.symbol}
                </p>
                <p className="mt-2 font-serif text-[1.02rem] text-ink">{item.label}</p>
                <p className="mt-1 text-[0.78rem] leading-snug text-ink/75">{item.approxCount}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Category explorer */}
      <div>
        <Label>Category prices</Label>
        <p className="mt-1 text-[0.78rem] text-muted">
          One category at a time — budget to high, scaled for {cityLabel}.
        </p>
        <div className="mt-2 -mx-0.5 overflow-x-auto px-0.5">
          <div className="flex min-w-max gap-0 border-b border-ink/10">
            {COST_CATEGORIES.map((c) => {
              const on = categoryId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`relative px-3 py-2.5 text-[0.74rem] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                    on ? 'text-ink' : 'text-ink/45 hover:text-ink/75'
                  }`}
                >
                  {c.symbol} {c.label}
                  <span
                    className={`absolute inset-x-2 bottom-0 h-[2px] ${
                      on ? 'bg-terracotta' : 'bg-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[3px] border border-ink/10 bg-paper p-4 sm:p-5">
          <p className="font-serif text-[1.25rem] font-semibold text-ink">
            {cat.symbol} {cat.label}
          </p>
          <p className="mt-1 text-[0.78rem] text-muted">{cat.description}</p>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-ink/85">{plainRead}</p>

          <div className="mt-4 space-y-3.5">
            {(
              [
                ['Budget', 'Keep it simple', range.low, lo],
                ['Typical', 'Most travellers land here', range.typical, mid],
                ['High', 'Comfort / tourist-premium', range.high, hi],
              ] as const
            ).map(([label, hint, raw, formatted]) => (
              <div key={label}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-[0.8rem] font-bold text-ink">{label}</span>
                    <span className="ml-2 text-[0.68rem] text-muted">{hint}</span>
                  </div>
                  <span className="shrink-0 tabular-nums text-[0.88rem] font-semibold text-ink">
                    {formatted != null ? formatMoney(formatted, display) : '—'}
                  </span>
                </div>
                <div className="h-[4px] bg-ink/10">
                  <div className="h-full bg-terracotta" style={{ width: barWidth(raw) }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[0.68rem] text-muted">
            {range.unit} · illustrative · {cityLabel} · shown in {display}
          </p>
        </div>

        <div className="rounded-[3px] border border-ink/10 bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Rough monthly picture</Label>
            <Segmented
              options={[
                { id: 'solo' as const, label: 'Solo' },
                { id: 'couple' as const, label: 'Couple' },
                { id: 'family' as const, label: 'Family' },
              ]}
              value={party === 'friends' ? 'solo' : (party as 'solo' | 'couple' | 'family')}
              onChange={setParty}
              size="sm"
              variant="secondary"
            />
          </div>
          <p className="mt-2 font-serif text-[1.5rem] font-semibold leading-none text-ink">
            {monthlyDisplay != null ? formatMoney(monthlyDisplay, display) : '—'}
            <span className="ml-1 text-[0.78rem] font-sans font-medium text-muted">/ month</span>
          </p>
          <p className="mt-2 text-[0.8rem] text-ink/75">
            About{' '}
            <span className="font-bold text-ink">
              {dailyDisplay != null ? formatMoney(dailyDisplay, display) : '—'}
            </span>{' '}
            per day in {cityLabel} — housing usually dominates.
          </p>
          <div className="mt-4">
            <Donut parts={donutParts} />
          </div>
        </div>
      </div>

      {/* City comparison — plain language */}
      <div>
        <Label>How cities compare</Label>
        <p className="mt-1 max-w-[54ch] text-[0.78rem] text-muted">
          Relative to a typical tourist baseline — not exact prices. Tap a city to focus the
          explorer above.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {cityCompare.map((c) => {
            const on = cityId === c.id
            const avg = (c.food + c.stay + c.transport + c.leisure) / 4
            const overall = relativeWord(avg)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCityId(c.id)}
                className={`rounded-[3px] border px-3.5 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                  on
                    ? 'border-terracotta/45 bg-terracotta/[0.06]'
                    : 'border-ink/10 bg-paper hover:border-ink/20'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-serif text-[1.08rem] text-ink">{c.label}</span>
                  <span className={`text-[0.68rem] font-bold ${overall.tone}`}>
                    {overall.label}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                      Food
                    </p>
                    <IndexBar value={c.food} />
                  </div>
                  <div>
                    <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                      Stay
                    </p>
                    <IndexBar value={c.stay} />
                  </div>
                  <div>
                    <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                      Transport
                    </p>
                    <IndexBar value={c.transport} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
