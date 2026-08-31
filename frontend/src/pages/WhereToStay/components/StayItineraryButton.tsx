type Props = {
  selected: boolean
  onToggle: () => void
}

/** Stay catalog CTA: green + thumbs-up when set; hover reveals Unselect. */
export function StayItineraryButton({ selected, onToggle }: Props) {
  if (!selected) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center rounded-[3px] bg-terracotta px-2.5 py-1.5 text-[0.72rem] font-bold text-paper transition hover:brightness-105"
        data-testid="stay-itinerary-cta"
        aria-label="Select stay"
      >
        Select
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="group relative inline-flex min-w-[11.5rem] items-center justify-center overflow-visible rounded-[3px] bg-[#3d8b4f] px-2.5 py-1.5 text-[0.72rem] font-bold text-paper shadow-[0_6px_14px_rgba(61,139,79,0.28)] transition hover:brightness-105"
      data-testid="stay-itinerary-cta"
      aria-label="Set for your itinerary"
    >
      <span
        className="pointer-events-none absolute -right-1.5 -top-1.5 text-[0.9rem] leading-none drop-shadow"
        aria-hidden
      >
        👍
      </span>
      <span className="transition duration-200 group-hover:opacity-0">Set for your itinerary</span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[3px] bg-ink/90 text-paper opacity-0 transition duration-200 group-hover:opacity-100">
        Unselect
      </span>
    </button>
  )
}
