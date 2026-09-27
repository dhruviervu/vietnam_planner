import type { Airport, TransferDirection, TransportModeId } from '../data/types'
import { ALL_MODE_IDS, MODE_DEFINITIONS } from '../data/modes'
import { getDestination } from '../data/catalog'
import { modeDetailHref } from '../data/bookingLinks'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'

type Guide = {
  lead: string
  shines: { travelers: string; perks: string }
  shorts: { title: string; body: string }[]
}

const GUIDES: Record<'car-taxi' | 'rental-driver' | 'public-bus', Guide> = {
  'car-taxi': {
    lead:
      'Car and taxi options—such as Grab, Xanh SM, Mai Linh, and Vinasun—offer seamless, door-to-door convenience by delivering you straight to your hotel, sparing you from hauling heavy luggage through crowded streets or waiting at hot bus stops.',
    shines: {
      travelers:
        'Couples, small groups (2–4 people), families with children, and anyone traveling with multiple suitcases.',
      perks:
        'Splitting the fare keeps it affordable, comfortable, and simple. It is also the safest, most stress-free choice during late-night arrivals, heavy downpours, or when navigating narrow city alleys (ngõ) where buses cannot go.',
    },
    shorts: [
      {
        title: 'Solo budget travelers',
        body: 'Far less cost-effective than taking express airport buses or a GrabBike.',
      },
      {
        title: 'Large groups (4+ people with heavy luggage)',
        body: 'Standard 4-seater sedans cannot fit everyone alongside their luggage, forcing you to either split across multiple cars or pre-book a dedicated 7-seater SUV or 16-seater private van.',
      },
      {
        title: 'Airport rush hours',
        body: 'Locating your driver across chaotic, crowded pickup lanes can add unexpected friction after a long flight.',
      },
    ],
  },
  'rental-driver': {
    lead:
      'Pre-arranged rental vehicles and private driver services (via platforms like Klook, KKday, or specialized agencies) offer a fully tailored, stress-free transfer experience by providing an English-speaking driver who meets you inside the terminal with a name placard and handles all logistics.',
    shines: {
      travelers:
        'Large groups (4+ people), families traveling with young children or elderly relatives, business travelers, and visitors carrying excessive luggage.',
      perks:
        'Ensures seamless flight-tracking (the driver automatically adjusts for flight delays) and guaranteed upfront pricing that covers toll fees and parking. It is also the premier choice if you are heading straight from the airport to an out-of-city region (such as Da Nang Airport directly to Hoi An, or Hanoi Airport directly to Ha Long Bay / Ninh Binh).',
    },
    shorts: [
      {
        title: 'Solo & pair travelers',
        body: 'Considerably more expensive than an express bus or an on-demand Grab car for short city-center rides.',
      },
      {
        title: 'Self-drive option',
        body: 'Renting a self-drive car is heavily discouraged and rarely offered to short-term tourists due to chaotic traffic dynamics, strict local licensing regulations (requiring a 1968 Vienna Convention IDP), and severe traffic liability risks.',
      },
      {
        title: 'Schedule rigidity',
        body: 'Pre-arranged bookings require advance coordination, offering slightly less immediate flexibility compared to hailing an app-based ride upon landing.',
      },
    ],
  },
  'public-bus': {
    lead:
      'Public and airport express buses—such as Bus 86 in Hanoi or Bus 109 & 152 in Ho Chi Minh City—offer an ultra-budget, reliable transport option for travelers heading directly between the terminal and city center tourist districts.',
    shines: {
      travelers:
        'Solo travelers, backpackers, pairs with light luggage, and strict budget-conscious visitors.',
      perks:
        'Extremely cheap fares—typically ranging from ₫15,000 to ₫45,000 (~$0.60 to $1.80 USD) per seat—with no risk of taxi scams, hidden surcharges, or peak-hour ride-hail price surges. Express routes feature dedicated luggage racks, air conditioning, and bilingual signage, dropping passengers off right near major hubs like Hanoi’s Old Quarter or Saigon’s Ben Thanh Market.',
    },
    shorts: [
      {
        title: 'Families & groups (2–4+ people)',
        body: 'Once 3 or 4 people buy individual bus tickets, the combined cost becomes almost identical to a private Grab or taxi ride, making the bus far less value-for-money.',
      },
      {
        title: 'Heavy luggage',
        body: 'Navigating bus steps and aisle space while hauling multiple large rolling suitcases can be physically demanding.',
      },
      {
        title: 'No door-to-door service',
        body: 'Buses only stop along main avenues; you must still walk, cycle, or catch a short motor-taxi to reach hotels tucked inside narrow city alleys (ngõ).',
      },
      {
        title: 'Fixed operating hours',
        body: 'Most lines stop running between 10:00 PM and 11:00 PM, making buses unsuitable for late-night or early-morning flights.',
      },
    ],
  },
}

type Props = {
  airport: Airport
  direction: TransferDirection
}

function ModeGuideCard({
  modeId,
  href,
}: {
  modeId: TransportModeId
  href: string
}) {
  const mode = MODE_DEFINITIONS[modeId]
  const guide = GUIDES[modeId as keyof typeof GUIDES]
  if (!guide) return null

  return (
    <section id={`mode-${modeId}`} className="scroll-mt-28 rounded-[28px] bg-paper p-5 shadow-soft ring-1 ring-ink/8 sm:p-8">
      <h2 className="font-serif text-[clamp(1.45rem,2.6vw,1.95rem)] font-semibold text-ink">
        {mode.symbol} {mode.label}
      </h2>
      <p className="mt-3 max-w-[70ch] text-[0.95rem] leading-relaxed text-ink/80">{guide.lead}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[20px] bg-sage/10 p-4 ring-1 ring-sage/20">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">Where it shines</p>
          <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink/45">Ideal travelers</p>
          <p className="mt-1 text-[0.88rem] leading-relaxed text-ink">{guide.shines.travelers}</p>
          <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink/45">Key perks</p>
          <p className="mt-1 text-[0.88rem] leading-relaxed text-ink">{guide.shines.perks}</p>
        </div>
        <div className="rounded-[20px] bg-terracotta/8 p-4 ring-1 ring-terracotta/20">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-terracotta">Where it falls short</p>
          <ul className="mt-3 space-y-3">
            {guide.shorts.map((item) => (
              <li key={item.title}>
                <p className="text-[0.88rem] font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[0.84rem] leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href={href}
        onClick={(e) => openDetailHref(href, e)}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-paper shadow-soft ring-2 ring-terracotta/40 transition hover:bg-ink hover:ring-ink"
      >
        Learn more / See providers
      </a>
    </section>
  )
}

export function ModeDetailSections({ airport, direction }: Props) {
  const dest = getDestination(airport.defaultDestinationId)
  if (!dest) return null

  return (
    <div className="mt-10 space-y-8">
      {ALL_MODE_IDS.map((id) => (
        <ModeGuideCard
          key={id}
          modeId={id}
          href={modeDetailHref(id, { airport, destination: dest, direction })}
        />
      ))}
    </div>
  )
}
