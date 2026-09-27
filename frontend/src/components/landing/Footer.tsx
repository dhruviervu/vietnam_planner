import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-ink px-[clamp(1.1rem,4vw,2.5rem)] py-12 text-paper/75">
      <div className="mx-auto grid max-w-content gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="mb-2 font-serif text-[1.15rem] font-semibold text-paper">
            TripBuilder
          </p>
          <p className="max-w-[28ch] text-[0.9rem]">
            Let us craft your Vietnam experience, together.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-paper">
            Plan
          </h3>
          <ul className="space-y-2 text-[0.9rem]">
            <li><Link to="/when-to-go/discover" className="hover:text-paper">When to go</Link></li>
            <li><Link to="/plan/builder/experiences" className="hover:text-paper">Sights</Link></li>
            <li><Link to="/ask" className="hover:text-paper">Ask</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-paper">
            Build
          </h3>
          <ul className="space-y-2 text-[0.9rem]">
            <li><Link to="/plan/templates" className="hover:text-paper">Itinerary Templates</Link></li>
            <li><Link to="/see-and-do" className="hover:text-paper">Discover & Add</Link></li>
            <li><Link to="/know-before-you-go" className="hover:text-paper">Know Before You Go</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-paper">
            Company
          </h3>
          <ul className="space-y-2 text-[0.9rem]">
            <li><span>About</span></li>
            <li><span>Journal</span></li>
            <li><span>Contact</span></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-content text-[0.78rem] text-paper/50">
        © 2026 TripBuilder.
      </p>
    </footer>
  )
}
