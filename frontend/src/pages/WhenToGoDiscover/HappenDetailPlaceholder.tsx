import { Link, useParams } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { getHappenById, typeBadge, timeStars } from './data/monthEvents'

/** Placeholder detail route for happenings without a linked experience page yet. */
export function HappenDetailPlaceholder() {
  const { id = '' } = useParams()
  const item = getHappenById(id)

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-10 pb-20">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-sage">
          Event & seasonal detail
        </p>
        {item ? (
          <>
            <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-wide text-terracotta">
              {typeBadge(item.type)}
            </p>
            <h1 className="mt-1 font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold text-ink">
              {item.name}
            </h1>
            <p className="mt-2 text-[0.9rem] text-muted">
              {item.city} · {item.dateDisplay} · {item.duration}
            </p>
            <p className="mt-1 text-[0.85rem] text-ink">
              Time value {timeStars(item.timeValue)} · Typical cost {item.cost}
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{item.whyItMatters}</p>
            <p className="mt-6 rounded-[14px] bg-cream px-4 py-3 text-[0.82rem] text-muted">
              Full experience detail for this item is on the roadmap. This placeholder keeps a
              stable route for future implementation.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-1 font-serif text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold text-ink">
              Detail coming soon
            </h1>
            <p className="mt-3 text-muted">We couldn&apos;t find that item.</p>
          </>
        )}
        <Link
          to="/when-to-go/discover"
          className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-[0.85rem] font-bold text-paper"
        >
          ← Back to When to go
        </Link>
      </main>
    </>
  )
}
