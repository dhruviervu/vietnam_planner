import { Link, useParams } from 'react-router-dom'
import type { MonthId } from './data/months'
import { EventCatalogCard, EventCoverLink } from './components/EventCatalogCard'
import {
  eventMonthPath,
  getEventsForMonth,
  getYearRoundEvents,
  monthCoverImage,
  monthFullName,
  nextMonthId,
} from './data/seasonalEvents'
import { WhenToGoPageShell, useWhenToGoHomePath } from './WhenToGoPageShell'

function parseMonthParam(value: string): MonthId | 'year-round' | null {
  if (value === 'year-round') return 'year-round'
  const n = Number(value)
  if (n >= 1 && n <= 12) return n as MonthId
  return null
}

export function EventMonthPage() {
  const { monthKey = '' } = useParams()
  const month = parseMonthParam(monthKey)

  if (month == null) {
    return (
      <WhenToGoPageShell>
        <MonthNotFound />
      </WhenToGoPageShell>
    )
  }

  const yearRound = month === 'year-round'
  const events = yearRound ? getYearRoundEvents() : getEventsForMonth(month)
  const heading = yearRound ? 'Year Round' : monthFullName(month)
  const following = yearRound
    ? ([1, 2, 3] as MonthId[])
    : [nextMonthId(month), nextMonthId(nextMonthId(month)), nextMonthId(nextMonthId(nextMonthId(month)))]

  return (
    <WhenToGoPageShell>
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-9 pb-20">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sage">
          Event calendar
        </p>
        <h1 className="mt-2 font-serif text-[clamp(1.85rem,4vw,2.7rem)] font-semibold leading-[1.1] text-ink">
          Events in {heading}
        </h1>
        <p className="mt-2 max-w-[48ch] text-[0.95rem] text-muted">
          {yearRound
            ? 'Festivals and performances that run through the year.'
            : `A sorted catalog of festivals and events listed for ${heading}.`}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((item) => (
            <EventCatalogCard key={item.id} item={item} />
          ))}
        </div>

        {events.length === 0 ? (
          <p className="mt-6 text-[0.95rem] text-muted">No dated events are listed for this month.</p>
        ) : null}

        <section className="mt-14">
          <h2 className="font-serif text-[clamp(1.25rem,2.4vw,1.6rem)] font-semibold text-ink">
            See events in {following.map(monthFullName).join(', ')}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {following.map((m) => (
              <EventCoverLink
                key={m}
                href={eventMonthPath(m)}
                image={monthCoverImage(m)}
                title={`See events in ${monthFullName(m)}`}
                caption={monthFullName(m)}
              />
            ))}
          </div>
        </section>
      </main>
    </WhenToGoPageShell>
  )
}

function MonthNotFound() {
  const home = useWhenToGoHomePath()
  return (
    <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-10 pb-20">
      <h1 className="font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold text-ink">
        Month not found
      </h1>
      <p className="mt-3 text-muted">We couldn&apos;t find events for that month.</p>
      <Link
        to={home}
        className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.85rem] font-bold text-paper"
      >
        ← Back to When to go
      </Link>
    </main>
  )
}
