import { useParams } from 'react-router-dom'
import { EventCatalogCard } from './components/EventCatalogCard'
import { getEventsForTag, getTagBySlug } from './data/seasonalEvents'
import { WhenToGoPageShell, useEventCalendarPath } from './WhenToGoPageShell'

export function EventTagPage() {
  const { tagSlug = '' } = useParams()
  const tag = getTagBySlug(tagSlug)
  const calendarHref = useEventCalendarPath()

  if (!tag) {
    return (
      <WhenToGoPageShell>
        <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-10 pb-20">
          <h1 className="font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold text-ink">
            Tag not found
          </h1>
          <p className="mt-3 text-muted">We couldn&apos;t find events for that tag.</p>
          <a
            href={calendarHref}
            className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.85rem] font-bold text-paper"
          >
            Back to Event Calendar
          </a>
        </main>
      </WhenToGoPageShell>
    )
  }

  const events = getEventsForTag(tag)

  return (
    <WhenToGoPageShell>
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-9 pb-20">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sage">
          Event calendar
        </p>
        <h1 className="mt-2 font-serif text-[clamp(1.85rem,4vw,2.7rem)] font-semibold leading-[1.1] text-ink">
          {tag} events
        </h1>
        <p className="mt-2 max-w-[48ch] text-[0.95rem] text-muted">
          All festivals and performances tagged {tag} in the Vietnam event calendar.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((item) => (
            <EventCatalogCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href={calendarHref}
            className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-[0.88rem] font-bold text-paper shadow-soft transition hover:bg-terracotta"
          >
            Back to Event Calendar
          </a>
        </div>
      </main>
    </WhenToGoPageShell>
  )
}
