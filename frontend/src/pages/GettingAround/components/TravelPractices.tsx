import { APP_CALLOUTS } from '../data/standaloneGuide'
import { Link } from 'react-router-dom'

function StorePills({ stores }: { stores: Array<'iPhone' | 'Android'> }) {
  return (
    <p className="mt-4 flex flex-wrap gap-2">
      {stores.map((s) => (
        <span
          key={s}
          className="rounded-full bg-cream px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink/70 ring-1 ring-ink/10"
        >
          {s}
        </span>
      ))}
    </p>
  )
}

export function TravelPractices() {
  return (
    <section id="guide-practices" className="scroll-mt-28">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
        Before you move
      </p>
      <h2 className="mt-2 font-serif text-[clamp(1.7rem,3vw,2.2rem)] font-semibold text-ink">
        Apps, bunks, and weather
      </h2>
      <p className="mt-2 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink/75">
        Ride apps live on the phone, not a laptop. Install Grab, Be, Maps, and Translate on wifi at
        home. Book trains and buses on the websites that actually sell tickets. Screenshot every
        ticket. Assume the sea can refuse you even if the van cannot.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {APP_CALLOUTS.map((app) => (
          <li key={app.id} className="flex flex-col rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">{app.job}</p>
            <h3 className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">{app.name}</h3>
            <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-ink/78">{app.body}</p>
            {app.stores?.length ? <StorePills stores={app.stores} /> : null}
            {app.href ? (
              <a
                href={app.href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-[0.78rem] font-bold text-terracotta hover:underline"
              >
                Open website →
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[22px] bg-sage/10 px-5 py-6 ring-1 ring-sage/25">
          <h3 className="font-serif text-[1.3rem] font-semibold text-ink">Luggage and sleeper etiquette</h3>
          <ul className="mt-3 space-y-2.5 text-[0.92rem] leading-relaxed text-ink/80">
            <li>
              <span className="font-semibold text-ink">Soft sleeper. </span>
              Bags under the lower bunk or at your feet — not in the aisle. Shoes off in many cabins.
              A light layer beats the air-con.
            </li>
            <li>
              <span className="font-semibold text-ink">Sleeper bus. </span>
              Passport, phone, and cash on your body. The hold is not a hotel safe. Bunks run short
              if you are tall — pay for a lower berth or a flight.
            </li>
            <li>
              <span className="font-semibold text-ink">Day van. </span>
              One small bag at your feet. The rest goes in the back — photograph it going in.
            </li>
          </ul>
        </article>
        <article className="rounded-[22px] bg-terracotta/8 px-5 py-6 ring-1 ring-terracotta/20">
          <h3 className="font-serif text-[1.3rem] font-semibold text-ink">Weather that actually cancels things</h3>
          <ul className="mt-3 space-y-2.5 text-[0.92rem] leading-relaxed text-ink/80">
            <li>
              <span className="font-semibold text-ink">Hydrofoils. </span>
              Phu Quoc and Con Dao take the southwest monsoon worst in mid-to-late summer. Keep a
              hotel night in the port town if the last boat is your only plan.
            </li>
            <li>
              <span className="font-semibold text-ink">Cruises. </span>
              Ha Long and Lan Ha typhoon windows, typically June–October. The van from Hanoi still
              runs when the junk does not.
            </li>
            <li>
              <span className="font-semibold text-ink">Mountain coaches. </span>
              Hai Van and Da Lat in heavy rain: slow, sick, and sometimes closed. Do not treat a
              night bus as a guaranteed dawn arrival.
            </li>
          </ul>
        </article>
      </div>

      <p className="mt-8 text-[0.88rem] text-muted">
        Airport ↔ city is a different problem —{' '}
        <Link to="/plan/builder/airport" className="font-bold text-terracotta hover:underline">
          Airport Transfers
        </Link>
        .
      </p>
    </section>
  )
}
