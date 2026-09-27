import { scrollToAnchor } from './WorldNav'

const ITEMS = [
  { id: 'dive-train', label: 'Trains' },
  { id: 'dive-coach', label: 'Buses' },
  { id: 'dive-flight', label: 'Flights' },
  { id: 'dive-water', label: 'Water' },
  { id: 'dive-urban', label: 'In the city' },
]

export function GuideSectionNav() {
  return (
    <nav
      aria-label="On this page"
      className="mt-6 -mx-[clamp(1.1rem,4vw,2rem)] overflow-x-auto px-[clamp(1.1rem,4vw,2rem)] pb-1 lg:mx-0 lg:px-0"
    >
      <ul className="flex gap-2">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => scrollToAnchor(item.id)}
              className="shrink-0 rounded-full bg-paper px-3 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/10 hover:ring-terracotta/40"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
