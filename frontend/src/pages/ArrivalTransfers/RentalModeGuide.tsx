import type { ReactNode } from 'react'
import { PROVIDER_LINKS } from './data/providerCatalog'

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

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[0.68rem] font-semibold text-ink/70">
      {children}
    </span>
  )
}

function ProviderCard({
  name,
  href,
  coverage,
  best,
}: {
  name: string
  href: string
  coverage: string
  best: string
}) {
  return (
    <article className="rounded-[20px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
      <h4 className="font-serif text-[1.15rem] font-semibold text-ink">
        <NamedLink href={href}>{name}</NamedLink>
      </h4>
      <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink/45">{coverage}</p>
      <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/80">{best}</p>
    </article>
  )
}

function RateCard({ title, fare, note }: { title: string; fare: string; note: string }) {
  return (
    <article className="rounded-[20px] bg-cream/50 p-5 ring-1 ring-ink/8">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-ink/50">{title}</p>
      <p className="mt-2 font-serif text-[1.25rem] font-semibold leading-snug text-ink">{fare}</p>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/70">{note}</p>
    </article>
  )
}

export function RentalModeGuide() {
  const L = PROVIDER_LINKS
  return (
    <div className="space-y-14">
      <section>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">How Vietnam actually works</p>
        <h2 className="mt-1 font-serif text-[clamp(1.5rem,2.8vw,1.9rem)] font-semibold text-ink">
          Self-drive vs car with driver
        </h2>
        <p className="mt-3 max-w-[68ch] text-[0.95rem] leading-relaxed text-ink/80">
          Unlike Western destinations where self-drive dominates, over 80% of car rentals here are booked as a car with
          a private driver. Traffic, parking, and licence rules are why.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[24px] bg-ink p-6 text-paper shadow-hero">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">Top recommended</p>
            <h3 className="mt-2 font-serif text-2xl font-semibold">Car + private driver</h3>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-paper/80">
              Dense, aggressive traffic. A driver removes liability, parking, navigation stress, and most legal
              complications. This is the default for day trips, families, and airport-plus-road days.
            </p>
            <ul className="mt-4 space-y-1.5 text-[0.85rem] text-paper/75">
              <li>English-speaking drivers are widely available.</li>
              <li>Fuel and tolls are often bundled on a full-day rate.</li>
              <li>You keep the itinerary; they keep the licence risk.</li>
            </ul>
          </article>
          <article className="rounded-[24px] bg-cream/50 p-6 ring-1 ring-ink/8">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink/45">Limited supply</p>
            <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">Self-drive car</h3>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/80">
              Very few international brands rent to short-term tourists. Licensing is strict and insurance risk is
              high. Treat this as a specialist option, not the airport default.
            </p>
            <ul className="mt-4 space-y-1.5 text-[0.85rem] text-ink/70">
              <li>You need a 1968 Vienna Convention IDP — see legal notes below.</li>
              <li>Expect a credit-card deposit at Avis-style desks.</li>
              <li>Hanoi and Saigon traffic plus jet lag is a poor first-night plan.</li>
            </ul>
          </article>
        </div>
      </section>

      <section>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">Before you take the keys</p>
        <h2 className="mt-1 font-serif text-[clamp(1.5rem,2.8vw,1.9rem)] font-semibold text-ink">
          Legal requirements &amp; road rules
        </h2>
        <p className="mt-3 max-w-[68ch] text-[0.92rem] leading-relaxed text-ink/80">
          Applies if you self-drive a car or ride a motorbike above 50cc.
        </p>

        <aside className="mt-5 rounded-[22px] bg-terracotta/10 p-5 ring-1 ring-terracotta/25">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-terracotta">Crucial warning</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink">
            Vietnam only accepts International Driving Permits issued under the <strong>1968 Vienna Convention</strong>.
            It does <strong>not</strong> legally accept 1949 Geneva Convention IDPs — the version issued in the US,
            Canada, and Australia. A non-1968 IDP can mean a heavy fine and a voided travel/medical policy after an
            accident.
          </p>
        </aside>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-[20px] bg-paper p-5 ring-1 ring-ink/8">
            <h3 className="font-serif text-lg font-semibold text-ink">What you must carry</h3>
            <ul className="mt-3 space-y-2 text-[0.9rem] leading-relaxed text-ink/80">
              <li>Passport and original home driver’s licence — both valid.</li>
              <li>1968 Vienna Convention IDP, not a 1949 permit.</li>
              <li>
                Under 50cc / electric scooters: no licence required under local law — helmets still are.
              </li>
            </ul>
          </article>
          <article className="rounded-[20px] bg-paper p-5 ring-1 ring-ink/8">
            <h3 className="font-serif text-lg font-semibold text-ink">On the road</h3>
            <ul className="mt-3 space-y-2 text-[0.9rem] leading-relaxed text-ink/80">
              <li>
                Drive on the <strong>right</strong>.
              </li>
              <li>
                <strong>0.00% BAC</strong> — zero alcohol. Fine plus immediate impoundment.
              </li>
              <li>Helmets mandatory for rider and passenger on any two-wheeler.</li>
            </ul>
          </article>
        </div>
      </section>

      <section>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">Who to book</p>
        <h2 className="mt-1 font-serif text-[clamp(1.5rem,2.8vw,1.9rem)] font-semibold text-ink">
          Top vehicle rental providers
        </h2>

        <div className="mt-8 space-y-10">
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">A · Car + private driver</h3>
            <p className="mt-1 text-[0.85rem] text-muted">The option most visitors should book.</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <article className="rounded-[20px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                <h4 className="font-serif text-[1.15rem] font-semibold text-ink">
                  <NamedLink href={L.klookDriver}>Klook</NamedLink>
                  {' / '}
                  <NamedLink href={L.kkdayDriver}>KKday</NamedLink>
                </h4>
                <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink/45">
                  Hanoi, Saigon, Da Nang, Nha Trang
                </p>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/80">
                  Standard day-trips, city tours, and fixed point-to-point intercity journeys.
                </p>
              </article>
              <ProviderCard
                name="Vietnam Private Car"
                href={L.vietnamPrivateCar}
                coverage="Central & Southern Vietnam"
                best="Multi-day custom road trips with English-speaking drivers."
              />
              <article className="rounded-[20px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
                <h4 className="font-serif text-[1.15rem] font-semibold text-ink">
                  <NamedLink href={L.hanoiJourney}>Hanoi Journey</NamedLink>
                  {' / '}
                  <NamedLink href={L.saigonPrivateCar}>Saigon private car</NamedLink>
                </h4>
                <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-ink/45">Regional hubs</p>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/80">
                  Private SUV/van hires for families or small groups carrying heavy luggage.
                </p>
              </article>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">B · Self-drive cars</h3>
            <p className="mt-1 text-[0.85rem] text-muted">Thin supply. 1968 IDP required.</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <ProviderCard
                name="Avis Vietnam"
                href={L.avis}
                coverage="Sedans & SUVs at major international airports"
                best="Requires 1968 IDP and a credit-card deposit. Confirm desk hours before a late landing."
              />
              <ProviderCard
                name="Mioto"
                href={L.mioto}
                coverage="Peer-to-peer app (Vietnam’s Turo)"
                best="Mostly locals. Some owners rent to foreigners with a verified 1968 IDP — read the listing, don’t assume."
              />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">C · Motorbikes &amp; scooters</h3>
            <p className="mt-1 text-[0.85rem] text-muted">
              The most popular tourist vehicle. Same 1968 IDP rule above 50cc. Helmet on, always.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <ProviderCard
                name="Tigit Motorbikes"
                href={L.tigit}
                coverage="Ho Chi Minh City, Da Nang, Hanoi"
                best="Long-distance coast-to-coast rides and Ha Giang Loop routes. Strong maintenance reputation."
              />
              <ProviderCard
                name="Style Motorbikes"
                href={L.styleMotorbikes}
                coverage="Hanoi, Hoi An, HCMC"
                best="Manual bikes, semi-automatics, and automatic scooters. One-way drops between shops."
              />
              <ProviderCard
                name="Rentabike Vietnam"
                href={L.rentabike}
                coverage="Hanoi / Northern Vietnam (also Da Nang & HCMC)"
                best="Urban scooters and off-road trail touring. Established northern specialist."
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">Budget the day</p>
        <h2 className="mt-1 font-serif text-[clamp(1.5rem,2.8vw,1.9rem)] font-semibold text-ink">
          Typical rental rates
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <RateCard
            title="Automatic scooter · 110–125cc"
            fare="₫120,000 – ₫200,000 / day"
            note="About $5–$8 USD. City hops, not a Ha Giang plan."
          />
          <RateCard
            title="Touring motorcycle · 150cc+"
            fare="₫350,000 – ₫700,000 / day"
            note="About $15–$30 USD. Coast runs and loop days."
          />
          <RateCard
            title="Car + driver · full day / 8 hours"
            fare="₫1,200,000 – ₫2,500,000 / day"
            note="About $50–$100 USD, often including fuel and tolls."
          />
          <RateCard
            title="Self-drive car"
            fare="₫800,000 – ₫1,800,000 / day"
            note="About $35–$75 USD, excluding deposit and fuel."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>Driver = less legal risk</Pill>
          <Pill>Right-hand traffic</Pill>
          <Pill>Zero alcohol</Pill>
          <Pill>Helmets on two wheels</Pill>
        </div>
      </section>
    </div>
  )
}
