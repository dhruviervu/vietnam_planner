import { Link } from 'react-router-dom'
import { lastAskPath } from '../ai/chatMemory'
import { Nav } from '../components/landing/Nav'
import { AskChat } from '../components/ai/AskChat'

export function AskPage() {
  const contextPath = lastAskPath()

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Nav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-[clamp(1.1rem,4vw,2rem)] py-6">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
          Trip assistant
        </p>
        <h1 className="mt-1 font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-ink">
          Ask, then I’ll take you there
        </h1>
        <p className="mt-2 max-w-[52ch] text-[0.95rem] text-muted">
          Hours, cities, whether a sight fits a day, add to your bag, or draft a day. When a page in
          the planner would help, you get a Take me there button — nothing auto-routes.
        </p>
        <p className="mt-2 text-[0.8rem] text-muted">
          Prefer the small chat? It’s on every other page.{' '}
          <Link to="/plan/builder/experiences" className="font-bold text-terracotta hover:underline">
            Back to sights
          </Link>
        </p>
        <div className="mt-5 h-[min(70vh,44rem)] overflow-hidden rounded-[24px] border border-ink/10 bg-paper shadow-soft">
          <AskChat pathname={contextPath} variant="page" />
        </div>
      </main>
    </div>
  )
}
