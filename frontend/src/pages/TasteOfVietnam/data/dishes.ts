import { dishImages } from './foodMedia'
import type { Dish } from './types'

export const DISHES: Dish[] = [
  {
    id: 'pho',
    name: 'Phở',
    featured: true,
    region: 'Nationwide · Northern roots',
    tags: ['⭐ Must Try', '🇻🇳 Vietnam Special'],
    specialityReason: 'Vietnam Special',
    description:
      'Fragrant broth, rice noodles, fresh herbs and a depth of flavour that changes from north to south.',
    images: dishImages('pho'),
    proteins: ['Beef', 'Chicken'],
    ingredients: [
      'Rice noodles',
      'Beef or chicken',
      'Star anise',
      'Cinnamon',
      'Fresh herbs',
      'Fish sauce',
      'Charred onion & ginger',
    ],
    culturalDescription: [
      'Phở is Vietnam’s quiet signature — a clear, spice-scented broth built slowly over bones, then finished at the table with herbs and lime.',
      'Northern bowls tend to stay cleaner and more restrained. Southern bowls often run sweeter, with a wider herb and sauce spread.',
      'It is less a single recipe than a national language of comfort, morning markets and late-night stools.',
    ],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Northern Phở',
        note: 'Clearer broth, fewer garnishes, deeper spice clarity.',
      },
      {
        region: 'Central',
        label: 'Central feel',
        note: 'Often saltier, with more assertive seasoning.',
      },
      {
        region: 'Southern',
        label: 'Southern Phở',
        note: 'Sweeter broth, bean sprouts, hoisin and chilli at the table.',
      },
    ],
    recipeVideoUrl: 'https://www.youtube.com/embed/t7sTPrvculo',
  },
  {
    id: 'banh-mi',
    name: 'Bánh Mì',
    featured: true,
    region: 'Nationwide',
    tags: ['🔥 Street Food', '⭐ Must Try'],
    specialityReason: 'Must Try',
    description:
      'Crackling baguette, pâté, pickled crunch and bright herbs — a portable French–Vietnamese classic.',
    images: dishImages('banh-mi'),
    proteins: ['Pork', 'Chicken'],
    ingredients: [
      'Airy baguette',
      'Pork or chicken',
      'Pâté',
      'Pickled carrot & daikon',
      'Coriander',
      'Chilli',
      'Mayonnaise',
    ],
    culturalDescription: [
      'Bánh mì is Vietnam’s street sandwich — French bread rewritten with local fillings, pickles and heat.',
      'The best versions balance crackle, fat, acidity and herbs in every bite, without feeling heavy.',
      'It is the dish that slips between plans: breakfast, mid-journey fuel, or a late market stop.',
    ],
    regionalVariations: [
      {
        region: 'Northern',
        label: 'Hanoi style',
        note: 'Often leaner fillings with a sharper pickle bite.',
      },
      {
        region: 'Southern',
        label: 'Saigon style',
        note: 'Richer pâté, more garnish options, bolder sweetness.',
      },
    ],
    recipeVideoUrl: 'https://www.youtube.com/embed/yEtIwQGwyec',
  },
  {
    id: 'bun-cha',
    name: 'Bún Chả',
    featured: true,
    region: 'Hanoi',
    tags: ['🌿 Regional Special', '🔥 Street Food'],
    specialityReason: 'Northern Speciality',
    description:
      'Smoky grilled pork, cool vermicelli and a sweet-salty dipping broth that defines Hanoi lunches.',
    images: dishImages('bun-cha'),
    proteins: ['Pork'],
    ingredients: [
      'Grilled pork patties',
      'Pork belly',
      'Rice vermicelli',
      'Fresh herbs',
      'Fish sauce broth',
      'Pickled papaya',
      'Charcoal smoke',
    ],
    culturalDescription: [
      'Bún chả is Hanoi on a tray — charcoal-grilled pork dipped into warm nước chấm, then wrapped with noodles and herbs.',
      'The pleasure is the contrast: smoke against sweetness, hot meat against cool greens.',
      'It remains one of the clearest reasons to plan a lunch stop in the capital.',
    ],
    regionalVariations: [],
    recipeVideoUrl: 'https://www.youtube.com/embed/oHzWxXqmOXE',
  },
  {
    id: 'bun-bo-hue',
    name: 'Bún Bò Huế',
    featured: true,
    region: 'Hue · Central',
    tags: ['🌿 Regional Special', '🇻🇳 Vietnam Special'],
    specialityReason: 'Central Vietnam Speciality',
    description:
      'Lemongrass heat, rich beef broth and a bold central Vietnamese punch you will not confuse with phở.',
    images: dishImages('bun-bo-hue'),
    proteins: ['Beef'],
    ingredients: [
      'Thick rice noodles',
      'Beef shank',
      'Lemongrass',
      'Annato oil',
      'Shrimp paste',
      'Chilli',
      'Fresh herbs',
    ],
    culturalDescription: [
      'Bún bò Huế carries central Vietnam’s bold palate — lemongrass, chilli and a broth with more force than northern phở.',
      'The noodles are thicker, the aroma more fragrant and spicy, and the bowl feels ceremonial rather than quiet.',
      'In Huế, it is not just lunch; it is a regional identity on the table.',
    ],
    regionalVariations: [
      {
        region: 'Central',
        label: 'Huế original',
        note: 'Strong lemongrass, shrimp paste depth, assertive heat.',
      },
      {
        region: 'Southern',
        label: 'Southern take',
        note: 'Often milder, with more garnish flexibility.',
      },
    ],
    recipeVideoUrl: 'https://www.youtube.com/embed/eOmQbJljnqE',
  },
  {
    id: 'cao-lau',
    name: 'Cao Lầu',
    featured: true,
    region: 'Hoi An',
    tags: ['🌿 Regional Special', '🇻🇳 Vietnam Special'],
    specialityReason: 'Only Found In This Form Here',
    description:
      'Chewy turmeric noodles, roasted pork and greens — a Hoi An dish tied to local water and tradition.',
    images: dishImages('cao-lau'),
    proteins: ['Pork'],
    ingredients: [
      'Cao lầu noodles',
      'Roasted pork',
      'Crispy crackling',
      'Local greens',
      'Light broth splash',
      'Herbs',
      'Chilli lime',
    ],
    culturalDescription: [
      'Cao lầu belongs to Hoi An — noodles with a springy bite, often linked to the town’s water and ash traditions.',
      'It is less about a deep soup and more about texture: pork, crackling, herbs and a restrained sauce.',
      'You come for the dish because it does not travel well; the place is part of the flavour.',
    ],
    regionalVariations: [],
    recipeVideoUrl: 'https://www.youtube.com/embed/9SNt3TlEY0s',
  },
  {
    id: 'ca-phe-trung',
    name: 'Cà Phê Trứng',
    featured: true,
    region: 'Hanoi',
    tags: ['☕ Coffee Culture', '🇻🇳 Vietnam Special'],
    specialityReason: 'Northern Speciality',
    description:
      'Rich robusta under a whipped egg-cream cloud — dessert-like, deeply Hanoi, quietly addictive.',
    images: dishImages('ca-phe-trung'),
    proteins: ['Egg'],
    ingredients: [
      'Vietnamese robusta',
      'Egg yolk',
      'Condensed milk',
      'Sugar',
      'Optional cocoa',
      'Hot or iced base',
    ],
    culturalDescription: [
      'Egg coffee is Hanoi’s soft rebellion against ordinary café culture — strong coffee under a mousse of whipped yolk and condensed milk.',
      'It tastes closer to tiramisu than latte, yet remains unmistakably Vietnamese in roast and sweetness.',
      'Best sipped slowly in an old café courtyard while the city moves outside.',
    ],
    regionalVariations: [],
    recipeVideoUrl: 'https://www.youtube.com/embed/AGaJy_TKwCQ',
  },
  {
    id: 'goi-cuon',
    name: 'Gỏi Cuốn',
    featured: true,
    region: 'Nationwide · Southern strength',
    tags: ['🔥 Street Food', '⭐ Must Try'],
    specialityReason: 'Must Try',
    description:
      'Cool rice-paper rolls packed with herbs, prawn and pork — bright, fresh and endlessly wrapable.',
    images: dishImages('goi-cuon'),
    proteins: ['Prawn', 'Pork'],
    ingredients: [
      'Rice paper',
      'Rice vermicelli',
      'Prawn',
      'Pork',
      'Mint & herbs',
      'Lettuce',
      'Peanut dipping sauce',
    ],
    culturalDescription: [
      'Gỏi cuốn is Vietnam’s fresh counterpoint to richer bowls — translucent rice paper, herbs and a clean peanut or fish-sauce dip.',
      'It rewards balance: crunch, coolness and aromatic greens without heaviness.',
      'Southern tables especially treat it as shared rhythm — roll, dip, repeat.',
    ],
    regionalVariations: [
      {
        region: 'Southern',
        label: 'Saigon style',
        note: 'Peanut sauce more common; generous herb mix.',
      },
      {
        region: 'Northern',
        label: 'Northern dip',
        note: 'Often leaner fillings with fish-sauce based dips.',
      },
    ],
    recipeVideoUrl: 'https://www.youtube.com/embed/8CaadFo3sw0',
  },
  {
    id: 'com-tam',
    name: 'Cơm Tấm',
    featured: true,
    region: 'Ho Chi Minh City',
    tags: ['🌿 Regional Special', '🔥 Street Food'],
    specialityReason: 'Southern Speciality',
    description:
      'Broken rice under grilled pork, egg and pickled sides — Saigon’s everyday plate done right.',
    images: dishImages('com-tam'),
    proteins: ['Pork', 'Egg'],
    ingredients: [
      'Broken rice',
      'Grilled pork chop',
      'Shredded pork skin',
      'Egg',
      'Pickles',
      'Fish sauce dressing',
      'Scallion oil',
    ],
    culturalDescription: [
      'Cơm tấm began as thrifty broken rice and became Saigon’s signature everyday plate.',
      'The pleasure is contrast: smoky pork, soft rice, sharp pickles and a sweet-salty drizzle.',
      'It is the dish that teaches southern pacing — generous, practical and deeply local.',
    ],
    regionalVariations: [],
    recipeVideoUrl: 'https://www.youtube.com/embed/Hlr8nD8cNW4',
  },
]

export function getDishById(id: string): Dish | undefined {
  return DISHES.find((d) => d.id === id)
}

export function getFeaturedDishes(): Dish[] {
  return DISHES.filter((d) => d.featured)
}
