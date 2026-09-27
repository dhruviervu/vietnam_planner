import { useMemo, useState } from 'react'
import { convertAmount, formatMoney, formatVndWithUsd, listedCurrencies } from '../lib/currency'
import type { FxRates } from '../lib/currency'
import { mapsSearchUrl } from '../../PlanBuilder/lib/yourVietnam/links'
import { BlockTitle, Label, SectionIntro } from './ui'

type Props = {
  fx: FxRates
  fxStatus: 'loading' | 'live' | 'fallback'
}

function mapsLink(label: string, query: string) {
  return (
    <a
      href={mapsSearchUrl(query)}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-terracotta hover:underline"
    >
      {label}
    </a>
  )
}

export function MoneySection({ fx, fxStatus }: Props) {
  const [from, setFrom] = useState('USD')
  const [amount, setAmount] = useState(100)

  const currencies = useMemo(() => listedCurrencies(fx.rates), [fx.rates])
  const vnd = useMemo(
    () => convertAmount(amount, from, 'VND', fx.rates),
    [amount, from, fx.rates],
  )

  return (
    <section className="space-y-6">
      <SectionIntro
        id="logistics-money"
        n="03 · Money"
        title="Money & Currency"
        support="Convert your money, then read how cash, cards and ATMs actually work on the ground."
      />

      <div className="rounded-[3px] border border-ink/10 bg-[linear-gradient(180deg,#faf6f0_0%,#f3ebe0_100%)] px-4 py-4 sm:px-5 sm:py-5">
          <Label>Convert to Vietnamese đồng</Label>
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
              <p className="font-serif text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold leading-none tracking-[-0.02em] text-ink">
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
        </div>

      <div className="space-y-6">
        <div>
          <BlockTitle>Cash and ATMs</BlockTitle>
          <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            Vietnam remains a cash-dominated country for day-to-day spending, though card usage is
            common at hotels, modern restaurants, supermarkets, and tour operators in main cities
            like Hanoi, Da Nang, and Ho Chi Minh City.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-[1.2rem] font-semibold text-ink">
            1. Cash vs. Card: Where You Need What
          </h3>
          <div className="mt-3 space-y-3 text-[0.95rem] leading-[1.75] text-ink/88">
            <p>
              <span className="font-bold text-ink">Always cash. </span>
              Street food stalls, local markets, small cafes, family guesthouses, taxis (unless
              booked via Grab), and any travel outside main cities.
            </p>
            <p>
              <span className="font-bold text-ink">Cards accepted. </span>
              Hotels, large restaurants, malls, convenience chains (for example Circle K and
              WinMart), and major tour agencies.
            </p>
            <p>
              <span className="font-bold text-ink">Card surcharges. </span>
              Many small-to-medium merchants pass on a 2% to 3% fee for processing card payments.
              Ask before paying with a card.
            </p>
            <p>
              <span className="font-bold text-ink">Card types. </span>
              Visa and Mastercard are universally preferred. American Express (Amex) is rarely
              accepted outside luxury international hotels.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-[1.2rem] font-semibold text-ink">
            2. Using ATMs in Vietnam
          </h3>
          <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            ATMs are widespread across all major cities and tourist areas.
          </p>

          <h4 className="mt-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            A. Fees and limits
          </h4>
          <div className="mt-2 space-y-3 text-[0.95rem] leading-[1.75] text-ink/88">
            <p>
              Withdrawal fees are split into two parts: local Vietnamese bank fees and your home
              bank’s international fees.
            </p>
            <p>
              <span className="font-bold text-ink">Local ATM fees. </span>
              Most banks charge a local terminal fee between{' '}
              {formatVndWithUsd(22000, fx.rates)} and {formatVndWithUsd(66000, fx.rates)} per
              transaction.
            </p>
            <p>
              <span className="font-bold text-ink">Fee-free / low-fee ATMs. </span>
              VPBank is widely recommended because many of its ATMs charge 0 local fees and allow
              high single-withdrawal limits (up to {formatVndWithUsd(10_000_000, fx.rates)}).
              Eximbank often has low or zero local machine fees.
            </p>
            <p>
              <span className="font-bold text-ink">Higher-fee ATMs. </span>
              Vietcombank, Agribank, and BIDV charge local fees and cap single-transaction limits
              lower (usually {formatVndWithUsd(2_000_000, fx.rates)} to{' '}
              {formatVndWithUsd(3_000_000, fx.rates)}), which forces more frequent withdrawals.
            </p>
          </div>

          <h4 className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            B. The golden rule at the ATM (DCC warning)
          </h4>
          <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            When withdrawing cash, IF the ATM screen asks:
          </p>
          <blockquote className="mt-3 border-l-4 border-terracotta bg-terracotta/[0.08] px-4 py-3">
            <p className="font-serif text-[1.12rem] font-semibold leading-snug text-ink">
              Do you want to be charged in your home currency or in local currency (VND)?
            </p>
            <p className="mt-3 font-serif text-[1.12rem] font-semibold leading-snug text-terracotta">
              Always choose to be charged in local currency (VND).
            </p>
          </blockquote>
          <p className="mt-3 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            If you select your home currency, the machine uses Dynamic Currency Conversion (DCC),
            adding an inflated exchange rate that costs an extra 3% to 8% in hidden fees.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <BlockTitle>Exchange</BlockTitle>
          <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            The best options for exchanging foreign currency in Vietnam, along with rate comparisons
            and top local spots, are detailed below.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-[1.2rem] font-semibold text-ink">
            Best locations ranked by exchange rates
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-[0.88rem] leading-snug">
              <thead>
                <tr className="border-b border-ink/15 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
                  <th className="py-2 pr-3 font-bold">Location type</th>
                  <th className="py-2 pr-3 font-bold">Exchange rate quality</th>
                  <th className="py-2 pr-3 font-bold">Pros</th>
                  <th className="py-2 font-bold">Cons</th>
                </tr>
              </thead>
              <tbody className="text-ink/88">
                {[
                  [
                    'Gold & jewelry shops',
                    'Best (closest to market mid-rate)',
                    'Zero fees, fast service, open late',
                    'Strictly cash-only; check bills carefully',
                  ],
                  [
                    'Commercial banks',
                    'Fair (official bank rates)',
                    '100% legal, clear paper receipts',
                    'Requires a physical passport; longer wait times',
                  ],
                  [
                    'Authorized exchange counters',
                    'Moderate',
                    'Convenient locations in tourist areas',
                    'Rates slightly worse than gold shops',
                  ],
                  [
                    'Airport exchange booths',
                    'Worst',
                    'Immediate cash upon arrival',
                    'Markup / fees up to 5%–10% worse',
                  ],
                ].map(([type, quality, pros, cons]) => (
                  <tr key={type} className="border-b border-ink/10 align-top">
                    <td className="py-3 pr-3 font-bold text-ink">{type}</td>
                    <td className="py-3 pr-3">{quality}</td>
                    <td className="py-3 pr-3">{pros}</td>
                    <td className="py-3">{cons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-[1.2rem] font-semibold text-ink">
            Top recommended local money changers
          </h3>
          <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            If you are carrying hard cash (USD, EUR, AUD, GBP, SGD, JPY, and similar), these spots
            offer consistently strong rates. Open Google Maps from the names below.
          </p>

          <h4 className="mt-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Hanoi (Old Quarter)
          </h4>
          <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            {mapsLink('Ha Trung Street', 'Ha Trung Street Hoan Kiem Hanoi Vietnam')} is the gold
            street. Start at{' '}
            {mapsLink(
              'Quoc Trinh Gold Shop, 27 Ha Trung',
              'Quoc Trinh Gold Shop 27 Ha Trung Hoan Kiem Hanoi',
            )}{' '}
            — the most famous money changer in Hanoi, with high volume and competitive rates. Nearby
            are{' '}
            {mapsLink(
              'Thinh Quang Gold, 33 Ha Trung',
              'Thinh Quang Gold 33 Ha Trung Hoan Kiem Hanoi',
            )}{' '}
            and{' '}
            {mapsLink(
              'Nhat Quang, 57 Ha Trung',
              'Nhat Quang Gold 57 Ha Trung Hoan Kiem Hanoi',
            )}
            . On{' '}
            {mapsLink('Hang Bac Street', 'Hang Bac Street Hoan Kiem Lake Hanoi')} around Hoan Kiem
            Lake, several gold shops also offer competitive, quick cash exchanges.
          </p>

          <h4 className="mt-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Ho Chi Minh City / Saigon (District 1)
          </h4>
          <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
            Around {mapsLink('Ben Thanh Market', 'Ben Thanh Market District 1 Ho Chi Minh City')},
            start with{' '}
            {mapsLink(
              'Ha Tam Jewelry, 2 Nguyen An Ninh',
              'Ha Tam Jewelry 2 Nguyen An Ninh Ben Thanh District 1 Ho Chi Minh City',
            )}{' '}
            — opposite the west side of the market, known for strong rates. Nearby are{' '}
            {mapsLink(
              'Mai Van, 1 Nguyen An Ninh',
              'Mai Van Jewelry 1 Nguyen An Ninh District 1 Ho Chi Minh City',
            )}{' '}
            and{' '}
            {mapsLink(
              'Thien Xuan, 38 Phan Boi Chau',
              'Thien Xuan 38 Phan Boi Chau District 1 Ho Chi Minh City',
            )}
            . Toward Dong Khoi / Mac Thi Buoi, use{' '}
            {mapsLink(
              'Eximbank Currency Exchange Counter 59, 135 Dong Khoi',
              'Eximbank 135 Dong Khoi District 1 Ho Chi Minh City',
            )}{' '}
            and{' '}
            {mapsLink(
              'Hung Long Money Exchange, 86 Mac Thi Buoi',
              'Hung Long Money Exchange 86 Mac Thi Buoi District 1 Ho Chi Minh City',
            )}
            .
          </p>
        </div>
      </div>
    </section>
  )
}
