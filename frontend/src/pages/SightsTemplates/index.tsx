import { Link } from 'react-router-dom'
import { TEMPLATES } from './data'

export function SightsTemplatesIndex() {
  return (
    <div className="min-h-screen bg-cream px-[clamp(1.2rem,5vw,3.5rem)] py-10">
      <Link to="/" className="font-serif text-[1.05rem] text-terracotta-deep">
        Vietnam, Curated
      </Link>
      <p className="mt-14 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted">
        Sights · five studies
      </p>
      <h1 className="mt-2 max-w-[22rem] font-serif text-[clamp(1.9rem,4vw,2.7rem)] font-semibold leading-[1.12] text-ink">
        Simpler pages for choosing a place.
      </h1>
      <p className="mt-4 max-w-[32rem] text-[0.95rem] leading-[1.75] text-ink/75">
        Dummy sights only. Each card keeps a short description, a review, and a cost — nothing else.
      </p>

      <ol className="mt-14 max-w-[36rem] divide-y divide-ink/10">
        {TEMPLATES.map((t, i) => (
          <li key={t.id}>
            <Link to={t.path} className="group flex items-baseline gap-6 py-6">
              <span className="w-8 shrink-0 text-[0.72rem] font-bold tabular-nums text-muted">
                0{i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-[1.35rem] font-semibold text-ink group-hover:text-terracotta">
                  {t.name}
                </span>
                <span className="mt-1 block text-[0.88rem] text-muted">{t.line}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
