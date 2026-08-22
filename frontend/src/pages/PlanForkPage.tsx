import { Link } from 'react-router-dom'
import { Nav } from '../components/landing/Nav'

function JourneyVisual() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2" aria-hidden="true">
      <img
        src="https://picsum.photos/seed/fork-journey-a/160/160"
        alt=""
        className="h-16 w-16 rounded-2xl object-cover shadow-soft"
      />
      <img
        src="https://picsum.photos/seed/fork-journey-b/160/160"
        alt=""
        className="h-20 w-20 rounded-2xl object-cover shadow-card"
      />
      <img
        src="https://picsum.photos/seed/fork-journey-c/160/160"
        alt=""
        className="h-16 w-16 rounded-2xl object-cover shadow-soft"
      />
    </div>
  )
}

function BrowseVisual() {
  return (
    <div className="mb-6 flex items-center justify-center" aria-hidden="true">
      <div className="grid grid-cols-2 gap-2">
        <div className="h-14 w-14 rounded-xl bg-sage/25" />
        <img
          src="https://picsum.photos/seed/fork-browse-a/140/140"
          alt=""
          className="h-14 w-14 rounded-xl object-cover"
        />
        <img
          src="https://picsum.photos/seed/fork-browse-b/140/140"
          alt=""
          className="h-14 w-14 rounded-xl object-cover"
        />
        <div className="h-14 w-14 rounded-xl bg-terracotta/20" />
      </div>
    </div>
  )
}

export function PlanForkPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[calc(100vh-72px)] max-w-content px-[clamp(1.1rem,4vw,2.5rem)] pb-16 pt-10">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-sage">
            Plan your trip
          </p>
          <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
            Two ways to get there.
          </h1>
          <p className="mx-auto max-w-[40ch] text-muted">
            Two equal paths — start from a curated journey, or browse and build from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
          <article className="flex flex-col rounded-card bg-paper p-8 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <JourneyVisual />
            <h2 className="mb-2 text-center font-serif text-[1.55rem] font-semibold text-ink">
              Choose a ready-made journey
            </h2>
            <p className="mb-8 flex-1 text-center text-[0.98rem] text-muted">
              Pick a style, we’ve done the planning. Tweak anything after.
            </p>
            <Link to="/plan/templates" className="btn-solid w-full text-center">
              Browse Journeys
            </Link>
          </article>

          <article className="flex flex-col rounded-card bg-paper p-8 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <BrowseVisual />
            <h2 className="mb-2 text-center font-serif text-[1.55rem] font-semibold text-ink">
              Build it myself
            </h2>
            <p className="mb-8 flex-1 text-center text-[0.98rem] text-muted">
              Tell us a little, choose experiences, then we help with stay, food, shopping, and
              transport — into a full day-by-day itinerary.
            </p>
            <Link to="/plan/builder" className="btn-outline w-full text-center">
              Start Building
            </Link>
          </article>
        </div>
      </main>
    </>
  )
}
