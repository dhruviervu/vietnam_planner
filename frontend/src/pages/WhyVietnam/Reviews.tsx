const PLACEHOLDERS = [
  { rating: 5, quote: 'Sample placeholder — real traveler reviews will replace this card.' },
  { rating: 5, quote: 'Sample placeholder — layout preview only, not an attributed testimonial.' },
  { rating: 4, quote: 'Sample placeholder — ratings UI shown for design structure.' },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="mb-3 flex gap-0.5 text-terracotta" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < count ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8L3.6 9.6l5.8-.8L12 3.5z" />
        </svg>
      ))}
    </div>
  )
}

export function Reviews() {
  return (
    <section className="relative bg-cream-deep px-[clamp(1.1rem,4vw,2.5rem)] py-[clamp(3.5rem,7vw,5rem)]">
      <p className="absolute right-[clamp(1.1rem,4vw,2.5rem)] top-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted/70">
        Sample reviews — pending real data
      </p>
      <div className="mx-auto max-w-content">
        <p className="mb-3 text-center text-[0.75rem] font-bold uppercase tracking-[0.14em] text-sage">
          Traveler notes
        </p>
        <h2 className="mb-10 text-center font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold text-ink">
          What people highlight
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLACEHOLDERS.map((card, i) => (
            <blockquote
              key={i}
              className="rounded-fact bg-paper p-6 shadow-soft"
            >
              <Stars count={card.rating} />
              <p className="text-[0.95rem] leading-relaxed text-muted">“{card.quote}”</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
