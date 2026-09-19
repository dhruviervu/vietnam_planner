import { useMemo, useState } from 'react'
import {
  ATM_FIND_OFFLINE,
  ATM_FIND_ONLINE,
  ATM_GUIDANCE,
  ATM_LOCATIONS,
  ATM_NETWORKS,
  ATM_SCREEN_MOVES,
  EXCHANGE_CHECKLIST,
  EXCHANGE_PRICE_PLAYS,
  PAYMENT_METHODS,
} from '../data/money'
import { mapsUrlForSpot, spotsForCities } from '../data/exchangeSpots'
import { convertAmount, formatMoney, listedCurrencies } from '../lib/currency'
import type { FxRates } from '../lib/currency'
import { getTripSightCities } from '../lib/tripSightCities'
import { useTripStore } from '../../../store/tripStore'
import { BlockTitle, Label, SectionIntro } from './ui'

type Props = {
  fx: FxRates
  fxStatus: 'loading' | 'live' | 'fallback'
}

type MoneyTab = 'cash' | 'exchange' | 'payments'
type FindMode = 'online' | 'offline'

const HERO =
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80'

const SNAPSHOT = [
  { id: 'avail', label: 'Availability', value: ATM_GUIDANCE.availability },
  { id: 'limit', label: 'Typical withdrawal', value: ATM_GUIDANCE.typicalLimit },
  { id: 'atm', label: 'ATM fee', value: ATM_GUIDANCE.atmFee },
  { id: 'issuer', label: 'Issuer fee', value: ATM_GUIDANCE.foreignFee },
  { id: 'dcc', label: 'DCC trap', value: ATM_GUIDANCE.dcc },
] as const

export function MoneySection({ fx, fxStatus }: Props) {
  const [from, setFrom] = useState('USD')
  const [amount, setAmount] = useState(100)
  const [tab, setTab] = useState<MoneyTab>('cash')
  const [atmId, setAtmId] = useState<(typeof ATM_LOCATIONS)[number]['id']>('bank')
  const [findMode, setFindMode] = useState<FindMode>('online')
  const [payId, setPayId] = useState<(typeof PAYMENT_METHODS)[number]['id']>('cash')
  const [checkDone, setCheckDone] = useState<Record<string, boolean>>({})
  const [spotsExpanded, setSpotsExpanded] = useState(false)

  const currencies = useMemo(() => listedCurrencies(fx.rates), [fx.rates])
  const selectedExperienceIds = useTripStore((s) => s.selectedExperienceIds)
  const sightCities = useMemo(
    () => getTripSightCities(),
    [selectedExperienceIds],
  )
  const tripSpots = useMemo(() => spotsForCities(sightCities), [sightCities])
  const visibleSpots = spotsExpanded ? tripSpots : tripSpots.slice(0, 3)
  const extraSpotCount = Math.max(0, tripSpots.length - 3)

  const vnd = useMemo(
    () => convertAmount(amount, from, 'VND', fx.rates),
    [amount, from, fx.rates],
  )

  const activeAtm = ATM_LOCATIONS.find((a) => a.id === atmId) ?? ATM_LOCATIONS[0]
  const activePay = PAYMENT_METHODS.find((m) => m.id === payId) ?? PAYMENT_METHODS[0]
  const findItems = findMode === 'online' ? ATM_FIND_ONLINE : ATM_FIND_OFFLINE

  return (
    <section className="space-y-6">
      <SectionIntro
        id="logistics-money"
        n="03 · Money"
        title="Money & Currency"
        support="Convert your money, then learn cash, ATMs, exchange and how you’ll actually pay day to day."
      />

      {/* Hero + converter */}
      <div className="overflow-hidden rounded-[3px] border border-ink/10">
        <div className="relative h-[128px] sm:h-[148px]">
          <img src={HERO} alt="" className="h-full w-full object-cover object-[center_40%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/40 to-ink/15" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper/75">
              Feel the rate
            </p>
            <p className="mt-1 max-w-[34ch] font-serif text-[1.2rem] leading-snug text-paper sm:text-[1.35rem]">
              See what your money becomes in đồng — then spend smarter.
            </p>
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#faf6f0_0%,#f3ebe0_100%)] px-4 py-4 sm:px-5 sm:py-5">
          <Label>What does your money feel like in Vietnam?</Label>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label>
              <span className="sr-only">From currency</span>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-12 border-b border-ink/25 bg-transparent pr-6 text-[1rem] font-bold text-ink focus:border-terracotta focus:outline-none"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="h-12 w-[7.5rem] border-b border-ink/25 bg-transparent font-serif text-[1.75rem] font-semibold text-ink focus:border-terracotta focus:outline-none"
            />
            <span className="pb-2 text-ink/35">→</span>
            <div>
              <p className="font-serif text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold leading-none tracking-[-0.02em] text-ink">
                {vnd != null ? formatMoney(vnd, 'VND') : '—'}
              </p>
              <p className="mt-1.5 text-[0.62rem] text-muted">
                {fxStatus === 'live'
                  ? 'Live mid-market'
                  : fxStatus === 'loading'
                    ? 'Loading…'
                    : 'Approx'}
                {fx.timestamp ? ` · ${new Date(fx.timestamp).toLocaleDateString()}` : ''}
              </p>
            </div>
          </div>

          <p className="mt-3 flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold text-ink/65">
            <span>Market rate</span>
            <span className="text-ink/25">→</span>
            <span>Provider rate</span>
            <span className="text-ink/25">→</span>
            <span>Fees</span>
            <span className="text-ink/25">→</span>
            <span className="text-terracotta">Amount received</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="grid grid-cols-3 gap-1 rounded-[3px] bg-ink/[0.04] p-1"
        role="tablist"
        aria-label="Money topics"
      >
        {(
          [
            { id: 'cash' as const, label: 'Cash & ATMs' },
            { id: 'exchange' as const, label: 'Exchange' },
            { id: 'payments' as const, label: 'Payments' },
          ] as const
        ).map((t) => {
          const on = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={`rounded-[2px] px-2 py-2.5 text-[0.78rem] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta sm:text-[0.84rem] ${
                on ? 'bg-ink text-paper shadow-sm' : 'text-ink/70 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* CASH & ATMS */}
      {tab === 'cash' ? (
        <div className="space-y-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {SNAPSHOT.map((s) => (
              <div
                key={s.id}
                className="rounded-[3px] border border-ink/10 bg-paper px-3 py-3"
              >
                <Label>{s.label}</Label>
                <p className="mt-1.5 text-[0.74rem] leading-snug text-ink">{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <BlockTitle>Best places to Find an atm</BlockTitle>
            <p className="mt-1 max-w-[54ch] text-[0.78rem] text-muted">
              Tap a location — bank machines in busy, lit spots are usually your safest bet.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ATM_LOCATIONS.map((loc) => {
                const on = atmId === loc.id
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setAtmId(loc.id)}
                    className={`overflow-hidden rounded-[3px] border text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      on
                        ? 'border-terracotta/45 bg-paper'
                        : 'border-ink/10 bg-paper hover:border-ink/20'
                    }`}
                  >
                    <div className="relative h-[112px]">
                      <img
                        src={loc.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-paper/80">
                          {loc.tag}
                        </p>
                        <p className="font-serif text-[1.12rem] text-paper">{loc.title}</p>
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      {loc.id === 'bank' ? (
                        <ul className="space-y-1.5">
                          {ATM_NETWORKS.map((n) => (
                            <li key={n.name} className="text-[0.78rem] leading-snug text-ink/80">
                              <span className="font-serif text-[1.02rem] font-bold text-ink">
                                {n.name}
                              </span>
                              <span className="mt-0.5 block">{n.availability}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[0.76rem] leading-snug text-ink/80">{loc.summary}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {activeAtm ? (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-ink/10 pt-3 text-[0.78rem] text-ink/80">
                {activeAtm.tips.map((t) => (
                  <span key={t} className="inline-flex gap-1.5">
                    <span className="text-terracotta">✓</span>
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Find with / without internet */}
          <div className="overflow-hidden rounded-[3px] border border-ink/10 bg-paper">
            <div className="border-b border-ink/10 px-4 py-3 sm:px-5">
              <Label>How do I find an ATM?</Label>
              <p className="mt-1 text-[0.78rem] text-muted">
                You may not have data yet — pick the path that matches your situation.
              </p>
              <div
                className="mt-3 grid grid-cols-2 gap-1 rounded-[3px] bg-ink/[0.04] p-1"
                role="radiogroup"
                aria-label="ATM find mode"
              >
                {(
                  [
                    { id: 'online' as const, label: 'With internet / maps' },
                    { id: 'offline' as const, label: 'No internet' },
                  ] as const
                ).map((m) => {
                  const on = findMode === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setFindMode(m.id)}
                      className={`rounded-[2px] px-3 py-2.5 text-[0.78rem] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                        on ? 'bg-terracotta text-paper' : 'text-ink/75 hover:text-ink'
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <ol className="grid gap-0 sm:grid-cols-3">
              {findItems.map((item, i) => (
                <li
                  key={item.id}
                  className={`px-4 py-4 sm:px-5 ${i < findItems.length - 1 ? 'border-b border-ink/8 sm:border-b-0 sm:border-r' : ''}`}
                >
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
                    Step {i + 1}
                  </p>
                  <p className="mt-1 font-serif text-[1.05rem] text-ink">{item.title}</p>
                  <p className="mt-1.5 text-[0.78rem] leading-snug text-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Screen moves */}
          <div>
            <Label>At the machine</Label>
            <p className="mt-1 text-[0.78rem] text-muted">
              Four moves that protect your money in the 20 seconds that matter.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {ATM_SCREEN_MOVES.map((move, i) => (
                <div
                  key={move.id}
                  className="rounded-[3px] border border-ink/10 bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)] px-3.5 py-3"
                >
                  <p className="text-[0.58rem] font-bold tracking-[0.14em] text-terracotta">
                    0{i + 1}
                  </p>
                  <p className="mt-1 font-serif text-[1.02rem] text-ink">{move.title}</p>
                  <p className="mt-1 text-[0.74rem] leading-snug text-muted">{move.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-[3px] bg-ink/[0.03] px-3.5 py-3 text-[0.82rem] font-semibold leading-snug text-ink">
              {ATM_GUIDANCE.bestPractice}
            </p>
          </div>
        </div>
      ) : null}

      {/* EXCHANGE */}
      {tab === 'exchange' ? (
        <div className="space-y-6">
          <div>
            <BlockTitle>How to get a better deal</BlockTitle>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {EXCHANGE_PRICE_PLAYS.map((play) => (
                <div
                  key={play.id}
                  className="flex gap-3 rounded-[3px] border border-ink/10 bg-paper px-3.5 py-3"
                >
                  <span className="font-serif text-[1.35rem] leading-none text-terracotta/80">
                    {play.symbol}
                  </span>
                  <div>
                    <p className="font-serif text-[1.05rem] text-ink">{play.title}</p>
                    <p className="mt-1 text-[0.76rem] leading-snug text-muted">{play.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <BlockTitle>Best exchange spots on your trip</BlockTitle>
            <p className="mt-1 max-w-[58ch] text-[0.78rem] text-muted">
              Bank desks in cities where you have sights — not airport boards or gold shops.
            </p>
            {tripSpots.length ? (
              <>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleSpots.map((spot) => (
                    <article
                      key={spot.id}
                      className="overflow-hidden rounded-[18px] bg-paper shadow-card"
                    >
                      <div className="relative aspect-[5/3.2] overflow-hidden bg-cream">
                        <img
                          src={spot.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/40 to-transparent" />
                        <span className="absolute left-3 top-3 rounded-full bg-terracotta/95 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-paper">
                          {spot.city}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-serif text-[1.15rem] font-semibold leading-tight text-ink">
                          {spot.name}
                        </h4>
                        <p className="mt-1 text-[0.72rem] font-bold uppercase tracking-wide text-terracotta">
                          {spot.bank} · {spot.area}
                        </p>
                        <p className="mt-2 text-[0.8rem] leading-relaxed text-ink/80">{spot.note}</p>
                        <a
                          href={mapsUrlForSpot(spot)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center rounded-[3px] bg-terracotta px-3.5 py-2 text-[0.78rem] font-bold text-paper transition hover:bg-terracotta-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                        >
                          Open in Google Maps ↗
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
                {extraSpotCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSpotsExpanded((open) => !open)}
                    className="mt-3 text-[0.84rem] font-bold text-terracotta hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                  >
                    {spotsExpanded
                      ? 'Show fewer desks'
                      : `Show ${extraSpotCount} more desk${extraSpotCount === 1 ? '' : 's'}`}
                  </button>
                ) : null}
              </>
            ) : (
              <p className="mt-3 max-w-[54ch] text-[0.84rem] text-ink/80">
                Add sights to your trip bag to see the best bank exchange desks in those cities.
              </p>
            )}
          </div>

          <div className="rounded-[3px] border border-ink/10 bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)] p-4 sm:p-5">
            <BlockTitle>Before you exchange</BlockTitle>
            <p className="mt-1 text-[0.76rem] text-muted">
              Tap each check as you confirm it at the desk.
            </p>
            <ul className="mt-3 space-y-2">
              {EXCHANGE_CHECKLIST.map((c, i) => {
                const done = !!checkDone[c.id]
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setCheckDone((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                      }
                      className={`flex w-full items-start gap-3 rounded-[3px] border px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                        done
                          ? 'border-sage/35 bg-sage/10'
                          : 'border-ink/10 bg-paper hover:border-ink/20'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-bold ${
                          done ? 'bg-sage text-paper' : 'bg-ink/10 text-ink/70'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <span>
                        <span className="block text-[0.82rem] font-bold text-ink">
                          {c.label}
                        </span>
                        <span className="mt-0.5 block text-[0.72rem] text-muted">{c.tip}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}

      {/* PAYMENTS */}
      {tab === 'payments' ? (
        <div className="space-y-4">
          <div>
            <Label>How will you pay?</Label>
            <p className="mt-1 max-w-[54ch] text-[0.78rem] text-muted">
              Cash still wins for street life. Cards shine in hotels and malls — tap a method.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => {
              const on = payId === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayId(m.id)}
                  className={`overflow-hidden rounded-[3px] border text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                    on
                      ? 'border-terracotta/45 bg-paper'
                      : 'border-ink/10 bg-paper hover:border-ink/20'
                  }`}
                >
                  <div className="relative h-[108px]">
                    <img
                      src={m.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-paper/80">
                        {m.availability}
                      </p>
                      <p className="font-serif text-[1.15rem] text-paper">{m.label}</p>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[0.74rem] text-ink/80">
                      <span className="font-bold text-ink">Best for — </span>
                      {m.bestFor}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {activePay ? (
            <div className="grid gap-4 rounded-[3px] border border-ink/10 bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)] p-4 sm:grid-cols-[1fr_1fr]">
              <div>
                <Label>Selected</Label>
                <p className="mt-1 font-serif text-[1.35rem] text-ink">{activePay.label}</p>
                <p className="mt-1 text-[0.8rem] text-terracotta font-semibold">
                  {activePay.availability}
                </p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/85">
                  {activePay.bestFor}
                </p>
              </div>
              <div>
                <Label>Watch-outs</Label>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/85">{activePay.limits}</p>
                <p className="mt-3 text-[0.72rem] text-muted">
                  Carry a cash buffer even if you prefer cards — many everyday moments still need
                  đồng.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
