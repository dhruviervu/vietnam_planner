import { wikiFile } from '../data/foodMedia'

const SECTIONS = [
  {
    heading: 'Regional food culture · the North',
    emoji: '🍜',
    image: wikiFile('Pho_bo.jpg'),
    alt: 'A bowl of northern Vietnamese beef phở',
    body:
      'Northern cooking is restrained on purpose. Broths stay clear, garnishes stay few, and the test of a kitchen is whether the stock tastes of bones and spice rather than sugar. Hanoi breakfast is phở, bún chả is a proper lunch, and egg coffee is an afternoon sit. Expect smaller herb plates, more white pepper and lime, and shops that sell out before the heat of the day. If a bowl is drowned in hoisin, you are eating a southern habit in the wrong city — taste first.',
  },
  {
    heading: 'Regional food culture · the Centre',
    emoji: '🌶️',
    image: wikiFile('Bún_bò_Huế.jpg'),
    alt: 'A bowl of spicy Huế bún bò',
    body:
      'Central Vietnam cooks louder: lemongrass, chilli, shrimp paste, and a royal-court memory that still shows up in Huế. Bún bò Huế should smell of lemongrass before it burns; Hội An’s cao lầu is chewy noodles with only a splash of broth. Portions can look modest and still be intense. Heat is not a dare — ask for less spice if you need to, and keep lime and herbs on the side. Eat early here; the best pots are breakfast pots.',
  },
  {
    heading: 'Regional food culture · the South',
    emoji: '🍚',
    image: wikiFile('Bánh_mì.jpg'),
    alt: 'A Vietnamese bánh mì sandwich',
    body:
      'The South is generous and a little sweeter. Herb plates are wide, hoisin and chilli live on the table, and cơm tấm — broken rice, grilled pork, scallion oil — is everyday glory rather than a special occasion. Saigon eats late: bánh mì queues after lunch, phở after midnight, iced coffee through the heat. Expect more garnish, more sauce, and shops that stay open when the North has already washed the pots. It is not worse; it is a different dialect of the same language.',
  },
] as const

const ETIQUETTE = [
  {
    heading: 'Eat early',
    emoji: '🌅',
    image: wikiFile('Pho.jpg'),
    alt: 'A steaming morning bowl of Vietnamese phở',
    body:
      'The best street kitchens are timed to a neighbourhood, not a tourist clock. Phở, bún bò and many breakfast shops are strongest from dawn until early afternoon; when the broth thins, they close. If a famous stall is empty at 2pm, it may simply be finished — come back at 7am. Lunch grills (bún chả, cơm tấm) peak when offices empty. Ask what they are known for today, not what the menu lists for dinner.',
  },
  {
    heading: 'Look for crowds',
    emoji: '🛵',
    image: wikiFile('Bún_chả.jpg'),
    alt: 'Hanoi bún chả with grilled pork and herbs',
    body:
      'A queue of locals is a better review than a translation. Watch the pot, the grill, and how fast stools turn over. A busy room with one dish is usually safer than a quiet room with twenty. If people are waiting with motorbikes still running, you are in the right place. Sit where you are pointed; sharing a table with strangers is normal, not a mistake.',
  },
  {
    heading: 'Cash, small notes, simple manners',
    emoji: '💵',
    image: wikiFile('Gỏi_cuốn.jpg'),
    alt: 'Fresh Vietnamese gỏi cuốn summer rolls',
    body:
      'Most stools still prefer dong in small notes. Order by pointing if language fails; smile and wait your turn. Do not rearrange the herb plate into a photoshoot while others are eating. Watch how neighbours use chopsticks and spoon, then copy. Take extra chilli only after you have tasted. Leave when you are done — these rooms make money on turnover, and lingering with an empty bowl blocks the next bowl.',
  },
] as const

function CultureCard({
  heading,
  emoji,
  image,
  alt,
  body,
  headingLevel,
  cream,
}: {
  heading: string
  emoji: string
  image: string
  alt: string
  body: string
  headingLevel: 'h3' | 'h4'
  cream?: boolean
}) {
  const Title = headingLevel
  return (
    <article
      className={`overflow-hidden rounded-[18px] shadow-soft ring-1 ring-ink/6 sm:grid sm:grid-cols-[minmax(11rem,0.34fr)_minmax(0,1fr)] ${
        cream ? 'bg-cream/45' : 'bg-paper'
      }`}
    >
      <img src={image} alt={alt} className="aspect-[5/4] h-full w-full object-cover sm:min-h-[11rem]" />
      <div className="px-5 py-5 sm:px-6">
        <Title className="font-serif text-[1.2rem] font-semibold text-ink">
          <span aria-hidden className="mr-1.5">
            {emoji}
          </span>
          {heading}
        </Title>
        <p className="mt-2 max-w-[68ch] text-[0.92rem] leading-relaxed text-ink/85">{body}</p>
      </div>
    </article>
  )
}

export function FoodCultureSection() {
  return (
    <section className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        How Vietnam eats
      </h2>
      <p className="mt-1 max-w-[54ch] text-[0.88rem] text-muted">
        A short briefing before you pick a stool — regions first, then street manners that actually
        help.
      </p>

      <div className="mt-5 space-y-4">
        {SECTIONS.map((item) => (
          <CultureCard key={item.heading} headingLevel="h3" {...item} />
        ))}
      </div>

      <h3 className="mt-8 font-serif text-[clamp(1.2rem,2.4vw,1.45rem)] font-semibold text-ink">
        <span aria-hidden className="mr-1.5">
          🥢
        </span>
        Basic street food etiquette
      </h3>
      <div className="mt-4 space-y-4">
        {ETIQUETTE.map((item) => (
          <CultureCard key={item.heading} headingLevel="h4" cream {...item} />
        ))}
      </div>
    </section>
  )
}
