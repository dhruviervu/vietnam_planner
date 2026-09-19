import { Link, useParams } from 'react-router-dom'
import { experiencesCityPath } from '../PlanBuilder/services/citySlug'
import { EventCatalogCard, EventCoverLink } from './components/EventCatalogCard'
import {
  cityCoverImage,
  eventCityPath,
  getCityBySlug,
  getEventCities,
  getEventsForCity,
} from './data/seasonalEvents'
import { WhenToGoPageShell, useWhenToGoHomePath } from './WhenToGoPageShell'

export function EventCityPage() {
  const { citySlug: slug = '' } = useParams()
  const city = getCityBySlug(slug)

  if (!city) {
    return (
      <WhenToGoPageShell>
        <CityNotFound />
      </WhenToGoPageShell>
    )
  }

  const events = getEventsForCity(city)
  const otherCities = getEventCities().filter((c) => c !== city)
  const sparse = events.length <= 2

  return (
    <WhenToGoPageShell>
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-9 pb-20">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sage">
          Event calendar
        </p>
        <h1 className="mt-2 font-serif text-[clamp(1.85rem,4vw,2.7rem)] font-semibold leading-[1.1] text-ink">
          Events in {city}
        </h1>
        <p className="mt-2 max-w-[48ch] text-[0.95rem] text-muted">
          Festivals and performances listed for this city in Vietnam’s event calendar.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((item) => (
            <EventCatalogCard key={item.id} item={item} />
          ))}
        </div>

        {sparse ? (
          <div className="mt-8 rounded-[22px] bg-cream px-5 py-6 ring-1 ring-ink/[0.06] sm:px-8">
            <p className="max-w-[52ch] text-[1.02rem] leading-[1.7] text-ink/88">
              {city} doesn&apos;t have many events, but to make up your mind fully look at sights in
              this city…
            </p>
            <a
              href={experiencesCityPath(city)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-[0.82rem] font-bold text-paper shadow-soft transition hover:bg-terracotta"
            >
              See sights in {city}
            </a>
          </div>
        ) : null}

        {otherCities.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-serif text-[clamp(1.25rem,2.4vw,1.6rem)] font-semibold text-ink">
              See events in other cities
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherCities.map((other) => (
                <EventCoverLink
                  key={other}
                  href={eventCityPath(other)}
                  image={cityCoverImage(other)}
                  title={`See Events in ${other}`}
                  caption={other}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </WhenToGoPageShell>
  )
}

function CityNotFound() {
  const home = useWhenToGoHomePath()
  return (
    <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-10 pb-20">
      <h1 className="font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold text-ink">
        City not found
      </h1>
      <p className="mt-3 text-muted">We couldn&apos;t find events for that city.</p>
      <Link
        to={home}
        className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.85rem] font-bold text-paper"
      >
        ← Back to When to go
      </Link>
    </main>
  )
}
