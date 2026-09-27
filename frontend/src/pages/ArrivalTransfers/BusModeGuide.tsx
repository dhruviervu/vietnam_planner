import type { ReactNode } from 'react'
import { PROVIDER_LINKS } from './data/providerCatalog'
import { MAP_PLACES, mapsDirUrl, mapsPinUrl, type TransferCoord } from './data/transferGeo'

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta"
    >
      {children}
    </a>
  )
}

function VisitSite({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="ml-1.5 inline-flex items-center rounded-full bg-terracotta/10 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-terracotta ring-1 ring-terracotta/25 hover:bg-terracotta hover:text-paper"
    >
      Visit site
    </a>
  )
}

function NamedLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <span className="inline-flex flex-wrap items-center">
      <Ext href={href}>{children}</Ext>
      <VisitSite href={href} />
    </span>
  )
}

function MapsLink({
  from,
  to,
  pin,
}: {
  from?: TransferCoord
  to?: TransferCoord
  pin?: TransferCoord
}) {
  const href = pin ? mapsPinUrl(pin) : mapsDirUrl(from!, to!, 'driving')
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sage/15 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-sage ring-1 ring-sage/30 hover:bg-sage hover:text-paper"
    >
      <span aria-hidden>🗺️</span>
      {pin ? 'Open map' : 'Check route'}
    </a>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[0.68rem] font-semibold text-ink/70">
      {children}
    </span>
  )
}

function RuleCard({ title, body }: { title: string; body: ReactNode }) {
  return (
    <article className="rounded-[20px] bg-cream/55 p-5 ring-1 ring-ink/8">
      <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{title}</h3>
      <div className="mt-2 text-[0.9rem] leading-relaxed text-ink/80">{body}</div>
    </article>
  )
}

function StepCard({ n, title, body }: { n: string; title: string; body?: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[0.78rem] font-bold text-paper">
        {n}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {body ? <div className="mt-1 text-[0.88rem] leading-relaxed text-ink/80">{body}</div> : null}
      </div>
    </li>
  )
}

function RouteCard({
  kicker,
  title,
  fare,
  hours,
  why,
  from,
  to,
  extra,
}: {
  kicker: string
  title: string
  fare: string
  hours?: string
  why: string
  from: TransferCoord
  to: TransferCoord
  extra?: ReactNode
}) {
  return (
    <article className="rounded-[20px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-terracotta">{kicker}</p>
          <h4 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">{title}</h4>
        </div>
        <MapsLink from={from} to={to} />
      </div>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-ink/80">{why}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill>{fare}</Pill>
        {hours ? <Pill>{hours}</Pill> : null}
      </div>
      {extra ? <div className="mt-3 text-[0.85rem] text-ink/75">{extra}</div> : null}
    </article>
  )
}

export function BusModeGuide() {
  const L = PROVIDER_LINKS
  const P = MAP_PLACES

  return (
    <div className="space-y-14">
      <section>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">Before you board</p>
        <h2 className="mt-1 font-serif text-[clamp(1.5rem,2.8vw,1.9rem)] font-semibold text-ink">
          Everything you need to know
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <RuleCard
            title="Payment & tickets"
            body={
              <>
                Buses generally run on a cash-on-board system. Pay the ticket collector inside; they hand you a paper
                receipt. Exact change in Vietnamese đồng is strongly recommended — keep ₫10,000, ₫20,000 and ₫50,000
                notes handy.
              </>
            }
          />
          <RuleCard
            title="Operating hours"
            body="Most routes run from early morning (~5:00) to late evening (22:00–01:00 depending on the city). Buses are not 24/7. Late-night or red-eye arrivals need a taxi or a pre-booked car."
          />
          <RuleCard
            title="Luggage"
            body="Express airport buses (Bus 86 in Hanoi, Bus 109 in Saigon) have luggage racks and welcome standard suitcases. Local city buses (Bus 152 in Saigon) may charge an extra ticket if a large bag takes a seat."
          />
          <RuleCard
            title="Direction of travel"
            body="Airport → city is easy: buses wait outside arrivals. City → airport for an early or tight flight: leave 3.5–4 hours before departure. City traffic is the variable, not the bus itself."
          />
        </div>
      </section>

      <section>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">How you actually ride</p>
        <h2 className="mt-1 font-serif text-[clamp(1.5rem,2.8vw,1.9rem)] font-semibold text-ink">
          Three ways to take a bus
        </h2>

        <div className="mt-6 space-y-6">
          <article className="rounded-[24px] bg-cream/40 p-6 ring-1 ring-ink/8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-xl font-semibold text-ink">Public & express airport buses</h3>
              <Pill>No advance booking</Pill>
            </div>
            <p className="mt-2 text-[0.88rem] text-ink/70">
              Bus 86 (Hanoi), Bus 109 &amp; 152 (Saigon) — walk up, pay cash, sit down.
            </p>
            <ol className="mt-5 space-y-4">
              <StepCard
                n="1"
                title="Locate the stop"
                body={
                  <>
                    Walk out of arrivals. The bus is outside, not in the hall.
                    <ul className="mt-2 space-y-2">
                      <li className="flex flex-wrap items-center gap-2">
                        <span>
                          <strong>Hanoi (HAN):</strong> orange/yellow signs for Bus 86.
                        </span>
                        <MapsLink pin={P.bus86T2} />
                      </li>
                      <li className="flex flex-wrap items-center gap-2">
                        <span>
                          <strong>Saigon (SGN):</strong> Pillar 12 (international) or Pillar A18 (domestic) for Bus 109.
                        </span>
                        <MapsLink pin={P.bus109Pillar} />
                      </li>
                    </ul>
                  </>
                }
              />
              <StepCard
                n="2"
                title="Board"
                body="Open seating, first-come first-served. Hop on with your luggage."
              />
              <StepCard
                n="3"
                title="Pay in cash onboard"
                body="VND only. When the bus moves, a conductor walks the aisle. Hand ₫20,000–₫50,000 notes. They issue a paper ticket."
              />
            </ol>
          </article>

          <article className="rounded-[24px] bg-cream/40 p-6 ring-1 ring-ink/8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-xl font-semibold text-ink">Airline shuttle vans</h3>
              <Pill>Pay on arrival / kiosk</Pill>
            </div>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/70">
              Dedicated minivans from{' '}
              <NamedLink href={L.vietnamAirlines}>Vietnam Airlines</NamedLink> and{' '}
              <NamedLink href={L.vietjet}>VietJet Air</NamedLink> in Hanoi.
            </p>
            <ul className="mt-4 space-y-2 text-[0.9rem] leading-relaxed text-ink/80">
              <li>
                <strong>At the airport:</strong> walk to the shuttle queue near domestic arrival lanes. Pay the driver
                or the airline kiosk before you sit.
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <span>
                  <strong>City → airport:</strong> Vietnam Airlines pickup at 1 Quang Trung St, near the Old Quarter.
                </span>
                <MapsLink pin={P.quangTrung1} />
              </li>
            </ul>
          </article>

          <article className="rounded-[24px] bg-cream/40 p-6 ring-1 ring-ink/8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-xl font-semibold text-ink">Intercity express shuttles</h3>
              <Pill>Pre-book online</Pill>
            </div>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/70">
              Da Nang Airport → Hoi An, Cam Ranh → Nha Trang. Book on{' '}
              <NamedLink href={L.klook.DAD}>Klook</NamedLink>, <NamedLink href={L.kkday}>KKday</NamedLink>, or{' '}
              <NamedLink href={L.go12}>12Go.asia</NamedLink>.
            </p>
            <ol className="mt-5 space-y-4">
              <StepCard n="1" title="Pick the route and a pickup time that matches your landing." />
              <StepCard n="2" title="Pay with an international card online." />
              <StepCard
                n="3"
                title="Show the e-voucher"
                body="The operator meets you at a named airport counter or bay — not a lobby tout."
              />
            </ol>
          </article>
        </div>
      </section>

      <section>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">By city</p>
        <h2 className="mt-1 font-serif text-[clamp(1.5rem,2.8vw,1.9rem)] font-semibold text-ink">
          Top bus providers
        </h2>

        <div className="mt-8 space-y-10">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">A · Express / tourist airport buses</h3>
            <p className="mt-1 text-[0.85rem] text-muted">
              Modern, air-conditioned, bilingual signs, luggage racks, tourist-area drops.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <RouteCard
                kicker="Hanoi · HAN"
                title="Express Bus 86"
                fare="~₫45,000 (~$1.80)"
                hours="Every 30–45 min · ~5:00–22:30"
                why="T1 & T2 ↔ Long Bien ↔ Old Quarter ↔ Hanoi Railway Station. The bus tourists actually mean."
                from={P.han}
                to={P.hanoiStation}
                extra={
                  <>
                    Operator:{' '}
                    <NamedLink href={L.transerco}>Hanoibus / Transerco</NamedLink>
                  </>
                }
              />
              <RouteCard
                kicker="Ho Chi Minh City · SGN"
                title="Express Bus 109"
                fare="₫20,000–₫30,000 (~$0.80–$1.20)"
                hours="Every 20–30 min · ~5:30–01:00"
                why="Airport ↔ District 1 / Saigon Bus Station near Ben Thanh and Bui Vien. Built for luggage."
                from={P.sgn}
                to={P.benThanh}
              />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">B · Domestic airline shuttles</h3>
            <p className="mt-1 text-[0.85rem] text-muted">Minivans from arrival lanes to downtown airline offices.</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <RouteCard
                kicker="Hanoi · HAN"
                title="Vietnam Airlines shuttle"
                fare="₫40,000–₫50,000 (~$2)"
                why="Drops at 1 Quang Trung Street, near the Old Quarter."
                from={P.han}
                to={P.quangTrung1}
                extra={
                  <>
                    <NamedLink href={L.vietnamAirlines}>vietnamairlines.com</NamedLink>
                  </>
                }
              />
              <RouteCard
                kicker="Hanoi · HAN"
                title="VietJet Air shuttle"
                fare="~₫50,000 (~$2)"
                why="To Tran Nhan Tong Street, near Hoan Kiem. Book at check-in or pay at the counter."
                from={P.han}
                to={P.tranNhanTong}
                extra={
                  <>
                    <NamedLink href={L.vietjet}>vietjetair.com</NamedLink>
                  </>
                }
              />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">C · Local city buses</h3>
            <p className="mt-1 text-[0.85rem] text-muted">
              Cheapest, more stops, can fill at commute hours. Fine with light bags.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <RouteCard
                kicker="Ho Chi Minh City · SGN"
                title="Bus 152"
                fare="₫5,000–₫10,000 (~$0.20–$0.40) + bag fee"
                why="Airport ↔ Ben Thanh Market ↔ District 8. Green/white commuter bus."
                from={P.sgn}
                to={P.benThanh}
              />
              <RouteCard
                kicker="Hanoi · HAN"
                title="Bus 07 / Bus 90"
                fare="₫8,000–₫9,000 (~$0.35)"
                why="07 runs to Cau Giay. 90 runs to Cat Linh Metro — useful if you continue on the train."
                from={P.han}
                to={P.catLinh}
                extra={
                  <span className="flex flex-wrap gap-2">
                    <MapsLink from={P.han} to={P.cauGiay} />
                    <span className="text-[0.75rem] text-ink/50">07 → Cau Giay</span>
                  </span>
                }
              />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">D · Regional airport minivans</h3>
            <p className="mt-1 text-[0.85rem] text-muted">Pre-book. These are not city buses.</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <RouteCard
                kicker="Da Nang · DAD"
                title="Hoi An shuttle vans"
                fare="₫110,000–₫150,000 (~$4.50–$6) / seat"
                why="Shared vans from the DAD terminal into Hoi An hotel districts (Barri / Hoi An Express and similar)."
                from={P.dad}
                to={P.hoiAnAncient}
                extra={
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    Book: <NamedLink href={L.klookHoiAn}>Klook</NamedLink>
                    <NamedLink href={L.kkday}>KKday</NamedLink>
                    <NamedLink href={L.go12}>12Go</NamedLink>
                  </span>
                }
              />
              <RouteCard
                kicker="Cam Ranh · CXR"
                title="Dat Moi / Airport Bus 18"
                fare="~₫60,000 (~$2.50)"
                why="Dedicated shuttle from Cam Ranh Airport into Nha Trang centre along the coast."
                from={P.cxr}
                to={P.nhaTrangCentre}
                extra={
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    Book: <NamedLink href={L.klookNhaTrang}>Klook</NamedLink>
                    <NamedLink href={L.go12}>12Go</NamedLink>
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
