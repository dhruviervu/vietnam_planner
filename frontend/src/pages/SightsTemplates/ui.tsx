import { Link, useLocation } from 'react-router-dom'
import { formatCost, formatReviews, TEMPLATES, type SampleSight } from './data'

export function SightMeta({ sight }: { sight: SampleSight }) {
  return (
    <p className="text-[0.78rem] tracking-wide text-muted">
      <span className="font-semibold text-ink">{sight.rating.toFixed(1)}</span>
      <span className="mx-1.5 text-ink/20">·</span>
      {formatReviews(sight.reviews)} reviews
      <span className="mx-1.5 text-ink/20">·</span>
      {formatCost(sight.cost)}
    </p>
  )
}

export function SightsShell({
  title,
  kicker,
  children,
}: {
  title: string
  kicker: string
  children: React.ReactNode
}) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-cream">
      <header className="px-[clamp(1.2rem,5vw,3.5rem)] py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <Link to="/sights-templates" className="font-serif text-[1.05rem] text-terracotta-deep">
            TripBuilder
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {TEMPLATES.map((t) => {
              const on = pathname === t.path
              return (
                <Link
                  key={t.id}
                  to={t.path}
                  className={
                    on
                      ? 'text-ink underline decoration-terracotta/50 underline-offset-[6px]'
                      : 'hover:text-ink'
                  }
                >
                  {t.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <p className="mt-10 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted">{kicker}</p>
        <h1 className="mt-2 max-w-[22rem] font-serif text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.15] text-ink">
          {title}
        </h1>
      </header>
      <main className="px-[clamp(1.2rem,5vw,3.5rem)] pb-24">{children}</main>
    </div>
  )
}
