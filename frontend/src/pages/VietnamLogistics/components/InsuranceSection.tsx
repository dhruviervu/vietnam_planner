import { BlockTitle, SectionIntro } from './ui'

const CORE = [
  {
    title: 'Emergency medical & evacuation (minimum $100k–$250k USD)',
    body: 'Basic clinic visits in Vietnam are cheap, but major care or air evacuation to regional hubs like Bangkok or Singapore can cost tens of thousands of dollars.',
  },
  {
    title: 'Motorbike & scooter coverage',
    body: 'Riding a moped is the #1 way travelers get injured. Crucial catch: most insurers reject scooter-accident claims unless you hold a valid motorcycle driver’s license from your home country and an International Driving Permit (IDP) recognized in Vietnam.',
  },
  {
    title: 'Adventure sports add-on',
    body: 'Standard plans often exclude active excursions like trekking in Sapa, kayaking in Ha Long Bay, or canyoning. Confirm these are included if they are on your itinerary.',
  },
  {
    title: 'Trip disruption & monsoon delays',
    body: 'Monsoon season (roughly May to October) brings typhoons, flooding, and flight or cruise cancellations. Coverage for trip delays and non-refundable bookings is highly useful.',
  },
] as const

type Insurer = {
  name: string
  href: string
  why: string
  bestFor: string
}

const GROUPS: { heading: string; companies: Insurer[] }[] = [
  {
    heading: '1. Premium & highest overall satisfaction',
    companies: [
      {
        name: 'Travelex Insurance',
        href: 'https://www.travelexinsurance.com/',
        why: 'Consistently rated near the top by Forbes Advisor and consumer groups. Excellent customer service, clear policy wording, and primary medical coverage (they pay before your home health insurance gets involved).',
        bestFor: 'Families, older travelers, and cruise goers.',
      },
      {
        name: 'Allianz Global Assistance',
        href: 'https://www.allianztravelinsurance.com/',
        why: 'The world’s largest travel insurer. Budget plans get mixed reviews; Prime and Annual / Multi-Trip plans are industry gold standards, with direct-pay arrangements at thousands of hospitals worldwide.',
        bestFor: 'Frequent travelers and general vacationers.',
      },
    ],
  },
  {
    heading: '2. Best for medical emergencies & evacuation',
    companies: [
      {
        name: 'GeoBlue (Xplorer / Trekker)',
        href: 'https://www.geobluetravelinsurance.com/',
        why: 'Backed by Blue Cross Blue Shield, GeoBlue focuses on medical coverage rather than trip cancellation. Their app lets you schedule doctor appointments abroad without paying out of pocket.',
        bestFor: 'US travelers who mainly want elite medical coverage and emergency care abroad.',
      },
      {
        name: 'Medjet',
        href: 'https://medjet.com/',
        why: 'Not a standard insurance company — an emergency air medical transport membership. Standard travel insurance evacuates you to the nearest acceptable hospital; Medjet flies you back to your home hospital regardless of medical necessity.',
        bestFor: 'High-risk travelers, seniors, and adventurous international trips.',
      },
    ],
  },
  {
    heading: '3. Best for tech-savvy & modern travelers',
    companies: [
      {
        name: 'Faye',
        href: 'https://www.withfaye.com/',
        why: 'A modern, app-first travel insurance company. They approve and pay out minor claims (delayed baggage or flight delays) directly to your phone’s digital wallet in real time.',
        bestFor: 'Younger travelers and tech-savvy tourists who hate paperwork.',
      },
    ],
  },
  {
    heading: '4. Best for backpackers & high-risk sports',
    companies: [
      {
        name: 'World Nomads',
        href: 'https://www.worldnomads.com/',
        why: 'Covers 150+ high-risk activities (scuba diving, trekking, kayaking, skiing) that standard plans explicitly exclude.',
        bestFor: 'Adventure travelers, backpackers, and gear-heavy trips.',
      },
    ],
  },
]

function SiteLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-terracotta hover:underline"
    >
      {children}
    </a>
  )
}

export function InsuranceSection() {
  return (
    <section className="space-y-6">
      <SectionIntro
        id="logistics-insurance"
        n="04 · Insurance"
        title="Travel Insurance"
        support="Not required to enter Vietnam — strongly recommended before you fly."
      />

      <p className="w-full text-[0.95rem] leading-[1.75] text-ink/88">
        While travel insurance is not legally required to enter Vietnam, carrying a policy is
        strongly recommended. Foreign health insurance policies (and government programs like
        Medicare) are rarely accepted, and private international hospitals in Vietnam demand
        upfront payment or a direct insurer guarantee before providing non-emergency treatment.
      </p>

      <div>
        <BlockTitle>Core coverage recommended for Vietnam</BlockTitle>
        <ul className="mt-4 space-y-4">
          {CORE.map((item) => (
            <li key={item.title}>
              <p className="text-[0.95rem] font-bold leading-snug text-ink">{item.title}</p>
              <p className="mt-1 w-full text-[0.95rem] leading-[1.75] text-ink/88">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6">
        <BlockTitle>Highly-rated & reputable insurance companies</BlockTitle>
        {GROUPS.map((group) => (
          <div key={group.heading}>
            <h4 className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
              {group.heading}
            </h4>
            <div className="mt-3 space-y-4">
              {group.companies.map((c) => (
                <article
                  key={c.name}
                  className="rounded-[3px] border border-ink/10 bg-paper px-4 py-4 sm:px-5"
                >
                  <p className="font-serif text-[1.2rem] font-semibold text-ink">
                    <SiteLink href={c.href}>{c.name}</SiteLink>
                  </p>
                  <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
                    <span className="font-bold text-ink">Why it’s good: </span>
                    {c.why}
                  </p>
                  <p className="mt-2 w-full text-[0.95rem] leading-[1.75] text-ink/88">
                    <span className="font-bold text-ink">Best for: </span>
                    {c.bestFor}
                  </p>
                  <p className="mt-3">
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[0.82rem] font-bold text-terracotta hover:underline"
                    >
                      Official site →
                    </a>
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
