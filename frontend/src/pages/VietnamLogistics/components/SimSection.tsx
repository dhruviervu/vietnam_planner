import { PHYSICAL_SIM_PROVIDERS } from '../data/sim'
import { formatVndWithUsd, type FxRates } from '../lib/currency'
import { SectionIntro } from './ui'

type Props = {
  fx: FxRates
}

export function SimSection({ fx }: Props) {
  return (
    <section className="space-y-5">
      <SectionIntro id="logistics-sim" n="02 · SIM" title="SIM" />

      <p className="w-full text-[0.95rem] leading-[1.75] text-ink/88">
        Every Vietnamese airport has SIM desks after immigration — that is the easiest place to buy
        a tourist SIM. Viettel, Vinaphone and Mobifone are the most popular networks. Any of these
        three brands is fine for a normal trip; pick by desk, price or data size, not by fear of
        choosing the “wrong” one. Bring your passport for registration. Typical tourist packs are
        shown on the cards below (approximate airport / tourist-desk prices, not live quotes).
      </p>

      <ul className="grid gap-3 sm:grid-cols-3">
        {PHYSICAL_SIM_PROVIDERS.map((p) => (
          <li
            key={p.id}
            className="flex flex-col overflow-hidden rounded-[3px] border border-ink/10 bg-paper"
          >
            <div className="relative h-[120px]">
              <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
              <p className="absolute bottom-2.5 left-3 font-serif text-[1.2rem] text-paper">{p.name}</p>
            </div>
            <div className="flex flex-1 flex-col px-3.5 py-3">
              <p className="text-[0.78rem] leading-snug text-muted">{p.coverage}</p>
              <p className="mt-3 font-serif text-[1.2rem] leading-snug text-ink">
                {p.priceVndApprox
                  ? formatVndWithUsd(p.priceVndApprox, fx.rates)
                  : `~$${p.priceUsdApprox}`}
              </p>
              <p className="mt-1 text-[0.82rem] text-ink/80">
                {p.dataGb} GB · {p.validityDays} days
              </p>
              {p.officialUrl ? (
                <a
                  href={p.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-[0.8rem] font-bold text-terracotta hover:underline"
                >
                  Official site →
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <p className="w-full text-[0.92rem] leading-[1.75] text-ink/85">
        If the airport pack fails to register, the data runs out, or you need a replacement SIM,
        these companies keep branded city stores. Look for Viettel Store, Vinaphone / VNPT shops,
        and Mobifone centres in malls and on main streets in Hanoi, Ho Chi Minh City, Da Nang and
        other large towns. Staff can top up or swap a SIM if you bring your passport.
      </p>
    </section>
  )
}
