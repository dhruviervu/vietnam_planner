import { Nav } from '../components/landing/Nav'

export function ItineraryIdeasPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-content flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-sage">
          Ready-made plans
        </p>
        <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
          Itinerary templates
        </h1>
        <p className="max-w-[42ch] text-[1.02rem] leading-relaxed text-muted">
          This tab will hold ready-made Vietnam itineraries for inspiration. The layout is next —
          you can close this tab and keep planning.
        </p>
      </main>
    </>
  )
}
