import { getDishById } from './dishes'
import type { DishRecipe } from './types'

const wiki = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1400`

const RECIPES: DishRecipe[] = [
  {
    dishId: 'pho',
    servings: '4 bowls',
    time: 'About 4 hours (mostly simmering)',
    tastingDescription:
      'A bowl of phở should arrive steaming, the broth so clear you can see the rice noodles resting like silk beneath. First comes star anise and cinnamon — warm, not dusty — then the sweetness of bones and charred onion. Northern phở bò is restrained: rare beef blushing at the edges, a scatter of scallion, white pepper, a squeeze of lime. It is breakfast, hangover cure and homecoming in one spoonful, the kind of heat that makes a Hanoi morning feel possible.',
    coreIngredients:
      'The soul is a long, quiet broth: beef bones (or chicken), charred onion and ginger, star anise, cinnamon, clove and a measured splash of fish sauce. Fresh bánh phở noodles carry it. Rare steak or brisket goes in at the last second; scallion, herbs, lime and white pepper finish the bowl. Southern tables add a wider herb plate, bean sprouts, hoisin and chilli — the north keeps the garnish spare so the broth can speak.',
    howServed:
      'Phở is a morning and anytime-stool dish. You sit close, steam in your face, and eat with chopsticks in one hand and a soup spoon in the other. Slurp is expected. Lime and chilli are yours to dose. In Hanoi the best shops sell out before lunch; in Saigon you can find a bowl after midnight. Do not drown a northern cup in hoisin — taste it first.',
    images: [
      wiki('Pho-Beef-Noodles-2008-07-09.jpg'),
      wiki('Pho_bo.jpg'),
      wiki('Phở_gà.jpg'),
    ],
    ingredients: [
      { amount: '2 kg', item: 'Beef bones (knuckle and marrow)' },
      { amount: '500 g', item: 'Beef brisket, plus 300 g thinly sliced rare steak' },
      { amount: '2', item: 'Yellow onions, unpeeled, to char' },
      { amount: '80 g', item: 'Ginger, to char' },
      { amount: '5', item: 'Star anise pods' },
      { amount: '1', item: 'Cinnamon stick' },
      { amount: '4', item: 'Cloves' },
      { amount: '3', item: 'Black cardamom pods, cracked' },
      { amount: '40 ml', item: 'Fish sauce (nước mắm)' },
      { amount: '30 g', item: 'Rock sugar' },
      { amount: '400 g', item: 'Fresh bánh phở noodles' },
      { amount: '', item: 'Scallion, cilantro, lime, bird’s-eye chilli, white pepper' },
    ],
    steps: [
      'Blanch the bones in boiling water for 5 minutes, then rinse until the water runs clear — this is how the broth stays bright.',
      'Char onions and ginger over a flame or under a broiler until blackened. Rinse off loose ash.',
      'Cover bones and brisket with cold water. Add charred aromatics, toasted spices in a bag, rock sugar and a pinch of salt. Simmer uncovered 3–4 hours, skimming often. Never boil hard.',
      'Lift out brisket, chill, and slice. Season the broth with fish sauce until it tastes round and savoury, not salty.',
      'Blanch noodles. Arrange in bowls with brisket and raw steak. Ladle boiling broth over so the rare beef just sets. Finish with scallion, herbs, pepper and lime.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/t7sTPrvculo',
    videoTitle: 'How to make authentic Vietnamese phở bò',
  },
  {
    dishId: 'banh-mi',
    servings: '4 sandwiches',
    time: '45 minutes (plus pickle time)',
    tastingDescription:
      'A great bánh mì cracks when you bite it — a shattering rice-flour crust, then air. Inside: cool pâté, warm grilled pork or cold cuts, pickled carrot and daikon that snap, cucumber, cilantro, a lick of chilli and Maggi. It is French technique speaking Vietnamese: portable, bright, a little messy, and gone before you reach the next corner.',
    coreIngredients:
      'Start with a Vietnamese baguette that shatters: rice flour in the dough keeps the crumb light. Then fat and acid — liver pâté, mayonnaise, grilled pork or cold cuts, pickled carrot and daikon, cucumber, cilantro, fresh chilli, and a few drops of Maggi or soy. Nothing should sit heavy. The pickle is as important as the meat.',
    howServed:
      'Bánh mì is walk-away food. You order at a hatch or cart, the loaf is split while it is still loud, and you eat it from paper on the street. Saigon versions run richer and sweeter; Hanoi loaves are often leaner with a sharper pickle. Eat it immediately — the crust dies in a backpack. Late-afternoon queues (Huỳnh Hoa and its cousins) are a feature, not a bug.',
    images: [
      wiki('Banh_mi_thit.jpg'),
      wiki('Bánh_mì.jpg'),
      wiki('Vietnamese_Banh_Mi.jpg'),
    ],
    ingredients: [
      { amount: '4', item: 'Vietnamese baguettes (light, crackly crumb)' },
      { amount: '150 g', item: 'Liver pâté' },
      { amount: '200 g', item: 'Grilled pork, cold cuts, or grilled chicken' },
      { amount: '1', item: 'Carrot, julienned' },
      { amount: '1', item: 'Daikon, julienned' },
      { amount: '2 tbsp', item: 'Sugar + 3 tbsp rice vinegar for pickles' },
      { amount: '', item: 'Cucumber spears, cilantro, Maggi or soy, mayo, fresh chilli' },
    ],
    steps: [
      'Toss carrot and daikon with sugar, vinegar and a pinch of salt. Rest at least 30 minutes until juicy and crisp.',
      'Warm the baguettes until the crust sings. Split, leaving a hinge.',
      'Spread pâté on one side, mayo on the other. Layer meat, pickles, cucumber, cilantro and chilli.',
      'Finish with a few drops of Maggi. Eat immediately while the bread is still loud.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/yEtIwQGwyec',
    videoTitle: 'How to make bánh mì at home',
  },
  {
    dishId: 'bun-cha',
    servings: '4 plates',
    time: '1 hour 15 minutes',
    tastingDescription:
      'Bún chả is Hanoi at lunch: charcoal first, then pork. Patties and belly caramelise over smoke; you dunk them into a warm, sweet-sour nước chấm with green papaya and carrot. Cool rice vermicelli and a forest of herbs sit beside. It is smoky, bright and a little sticky-fingered — the dish Obama and Bourdain ate on plastic stools, and the one Hanoians still eat on ordinary Tuesdays.',
    coreIngredients:
      'Two porks matter: minced patties and sliced belly, both kissed with fish sauce, shallot, garlic and a little honey, then grilled over charcoal until the edges catch. The dipping broth is warm nước chấm — fish sauce, water, sugar, lime — with green papaya and carrot. Cool bún (rice vermicelli) and a heap of herbs (lettuce, perilla, mint, coriander) complete the plate. Nem rán often rides along.',
    howServed:
      'This is a lunch architecture, not a single bowl. Pork arrives on a plate; the dipping broth is shared or personal; noodles and herbs sit to the side. You dunk, wrap, bite. Charcoal should be in the air. Classic hours are late morning to early afternoon, with a second wave at dinner. Sit on a low stool, order the combo, and do not be precious about sticky fingers.',
    images: [
      wiki('Bún_chả.jpg'),
      wiki('Bun_cha.jpg'),
      wiki('Vietnamese_bun_cha.jpg'),
    ],
    ingredients: [
      { amount: '400 g', item: 'Pork belly, sliced' },
      { amount: '400 g', item: 'Minced pork shoulder' },
      { amount: '3 tbsp', item: 'Fish sauce' },
      { amount: '2 tbsp', item: 'Shallot, minced' },
      { amount: '1 tbsp', item: 'Garlic, minced' },
      { amount: '1 tbsp', item: 'Honey or sugar' },
      { amount: '80 ml', item: 'Fish sauce + 80 ml water + 40 g sugar + lime for dipping broth' },
      { amount: '400 g', item: 'Bún (rice vermicelli), cooked and cooled' },
      { amount: '', item: 'Lettuce, perilla, mint, coriander, green papaya, chilli' },
    ],
    steps: [
      'Marinate belly and seasoned mince (shallot, garlic, fish sauce, honey) for 30 minutes.',
      'Form small patties. Grill both over charcoal until edges catch and fat renders. A hot grill pan works if you must.',
      'Warm the dipping broth: fish sauce, water, sugar, lime, garlic and chilli. Add julienned papaya and carrot.',
      'Set vermicelli and herbs on the table. Dunk pork in the warm broth, then eat with noodles and greens in the same bite.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/oHzWxXqmOXE',
    videoTitle: 'How to make Hanoi bún chả',
  },
  {
    dishId: 'bun-bo-hue',
    servings: '4 bowls',
    time: '3 hours',
    tastingDescription:
      'Bún bò Huế does not whisper. Lemongrass oils the air; shrimp paste and chilli oil stain the broth a sunset orange. Thick round noodles stand up to beef shank, pork hock and a slice of congealed pig’s blood if you want it true to Huế. It is spicy, funky, floral — central Vietnam in a bowl, eaten with rau sống, lime and extra chilli paste on the side.',
    coreIngredients:
      'The broth is lemongrass, beef shank, pork hock, annatto (for colour), chilli, and a careful dose of fermented shrimp paste (mắm ruốc). Thick round rice noodles are mandatory — they should have chew. Meats vary: shank, hock, cubicle pork loaf, sometimes congealed blood. Banana blossom, mint, cilantro, lime and extra chilli paste ride on the side, not in the pot.',
    howServed:
      'Eat it like Huế does: early. The best shops are breakfast-to-lunch and the pot thins by noon. You get a deep bowl, herbs on a separate plate, and permission to add heat. Ask for less spice if you need to — the lemongrass should still come through. A plastic stool, a pile of lime wedges, and a fast turnover are signs you are in the right room.',
    images: [
      wiki('Bun_bo_Hue.jpg'),
      wiki('Bún_bò_Huế.jpg'),
      wiki('Vietnamese_Bun_Bo_Hue.jpg'),
    ],
    ingredients: [
      { amount: '1 kg', item: 'Beef shank and pork hock' },
      { amount: '4 stalks', item: 'Lemongrass, smashed' },
      { amount: '2 tbsp', item: 'Annatto oil (or paprika oil)' },
      { amount: '1–2 tsp', item: 'Fermented shrimp paste (mắm ruốc), diluted' },
      { amount: '3 tbsp', item: 'Fish sauce' },
      { amount: '', item: 'Chilli flakes, garlic, shallot' },
      { amount: '400 g', item: 'Thick round rice noodles (bún bò)' },
      { amount: '', item: 'Banana blossom, mint, cilantro, lime, chilli paste' },
    ],
    steps: [
      'Simmer shank and hock with lemongrass, onion and salt until the meat yields, about 2 hours. Skim.',
      'Sizzle shallot, garlic, chilli and annatto oil. Stir into the pot with diluted shrimp paste and fish sauce. Taste for heat and funk — it should be bold.',
      'Cook the thick noodles until springy. Slice the meats.',
      'Assemble bowls: noodles, meat, a generous ladle of crimson broth. Serve herbs, lime and extra chilli alongside.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/eOmQbJljnqE',
    videoTitle: 'How to make bún bò Huế',
  },
  {
    dishId: 'cao-lau',
    servings: '4 bowls',
    time: '1 hour 30 minutes (with ready noodles)',
    tastingDescription:
      'Cao lầu only really exists in Hội An: chewy, ash-tinted noodles that should bounce, not slurp. A splash of broth, not a soup. Char siu-style roast pork, crackling, local greens, a squeeze of chilli-lime. It tastes of the town’s wells and Chinese-Japanese-Vietnamese kitchen memory — low, savoury, a little smoky, meant to be eaten slowly under a yellow townhouse.',
    coreIngredients:
      'The noodles are the whole argument: chewy, slightly alkaline, traditionally tied to Hội An well water. They get roast pork (five-spice, garlic, honey), pork crackling or fried skins, bean sprouts, local greens, herbs, and only a splash of light pork broth. Chilli-lime is the finish. If the bowl is swimming, it is not cao lầu — it is soup with the wrong noodles.',
    howServed:
      'Order it in Hội An’s old town, usually from late morning. It arrives as a composed plate-bowl: noodles piled, pork sliced, crackling on top, greens tucked in. Eat with chopsticks; there is little broth to spoon. Sit upstairs if the street is loud. Tourist rooms still get it right if the noodle bounce is there — that bite is the test.',
    images: [
      wiki('Cao_lau.jpg'),
      wiki('Cao_lầu.jpg'),
      wiki('Hoi_An_cao_lau.jpg'),
    ],
    ingredients: [
      { amount: '400 g', item: 'Cao lầu noodles (or chewy Japanese-style wheat noodles in a pinch)' },
      { amount: '350 g', item: 'Pork shoulder, roasted with five-spice, garlic and honey' },
      { amount: '100 g', item: 'Pork crackling or fried wonton skins' },
      { amount: '200 ml', item: 'Light pork broth, just enough to moisten' },
      { amount: '', item: 'Bean sprouts, lettuce, herbs, chilli, lime' },
    ],
    steps: [
      'Roast pork until caramelised; rest and slice. Keep the drippings.',
      'Blanch noodles until chewy. If using substitutes, undercook slightly so they keep bite.',
      'Warm a ladle of broth with a spoon of roasting juices — it should glaze, not flood.',
      'Plate noodles, pork, greens and crackling. Spoon the light broth over. Finish with herbs and chilli-lime.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/9SNt3TlEY0s',
    videoTitle: 'How to make Hội An cao lầu',
  },
  {
    dishId: 'ca-phe-trung',
    servings: '2 glasses',
    time: '15 minutes',
    tastingDescription:
      'Cà phê trứng is Hanoi soft-focus: a shot of bitter robusta hiding under a cloud of whipped egg yolk and condensed milk. You eat the foam first with a spoon — tiramisu, custard, toasted sugar — then stir it down into the coffee so the last sip is thick and bittersweet. Best in a small café where the cup sits in a bowl of hot water, rain on the street outside.',
    coreIngredients:
      'Only a few things, done right: egg yolks whipped with sweetened condensed milk until they hold a ribbon, and a small, fierce Vietnamese phin of robusta. Optional cocoa on the foam. The coffee must be bitter enough to cut the custard. Weak brew makes dessert; strong brew makes Hanoi.',
    howServed:
      'The glass usually sits in a bowl of hot water so it does not seize. Spoon the foam first, then stir, then drink slowly. Upstairs rooms at Giang and its cousins are quieter than the door. Iced egg coffee exists for humid afternoons. This is a sit-down ritual, not a takeaway — give it twenty unhurried minutes.',
    images: [
      wiki('Egg_coffee.jpg'),
      wiki('Cà_phê_trứng.jpg'),
      wiki('Vietnamese_egg_coffee.jpg'),
    ],
    ingredients: [
      { amount: '2', item: 'Egg yolks' },
      { amount: '3 tbsp', item: 'Sweetened condensed milk' },
      { amount: '1 tsp', item: 'Sugar (optional)' },
      { amount: '120 ml', item: 'Strong Vietnamese phin coffee (robusta)' },
      { amount: '', item: 'Cocoa powder, to dust (optional)' },
    ],
    steps: [
      'Brew a small, intense phin coffee. Keep it hot.',
      'Whip yolks with condensed milk until pale, thick and able to hold a ribbon — 3 to 5 minutes.',
      'Pour coffee into a glass sitting in hot water. Spoon the egg cream on top so it floats.',
      'Taste the foam, then stir. Drink slowly.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/AGaJy_TKwCQ',
    videoTitle: 'How to make Hanoi egg coffee',
  },
  {
    dishId: 'goi-cuon',
    servings: '12 rolls',
    time: '40 minutes',
    tastingDescription:
      'Gỏi cuốn is cool on purpose. Rice paper turns translucent around prawn, pork, vermicelli and a fist of herbs — mint, garlic chives, lettuce. You dip into a hoisin-peanut sauce in the south, or a sharper fish-sauce nước chấm in the north. It is clean, fragrant and endlessly repeatable, the dish you order when the day is hot and you still want flavour, not weight.',
    coreIngredients:
      'Rice paper (bánh tráng), cooked rice vermicelli, poached prawn, thin pork, and a serious handful of herbs: lettuce, mint, cilantro, garlic chives. The dip decides the region — hoisin-peanut with fried shallot in the south, nước chấm (fish sauce, lime, garlic, chilli, sugar) in the north. Nothing fried belongs in a gỏi cuốn; that is a different roll.',
    howServed:
      'They arrive cool, often in even numbers, with a communal dip. Eat soon after they hit the table so the paper stays tender. Dip, do not drown. In the heat this is lunch or a shared starter; you will order another plate. Watch how locals roll extras at the table if herbs are served on the side.',
    images: [
      wiki('Gỏi_cuốn.jpg'),
      wiki('Goi_cuon.jpg'),
      wiki('Vietnamese_spring_rolls.jpg'),
    ],
    ingredients: [
      { amount: '12', item: 'Rice paper sheets (bánh tráng)' },
      { amount: '200 g', item: 'Rice vermicelli, cooked' },
      { amount: '12', item: 'Poached prawns, halved' },
      { amount: '150 g', item: 'Sliced poached pork belly' },
      { amount: '', item: 'Lettuce, mint, cilantro, garlic chives' },
      { amount: '', item: 'Hoisin, peanut butter, fried shallot and chilli for the southern dip' },
    ],
    steps: [
      'Dip one rice paper in warm water for a second; it will soften on the board.',
      'Lay lettuce and herbs, then vermicelli and pork. Roll once, add prawns facing out, then finish the roll so the pink shows through.',
      'Whisk hoisin with a spoon of peanut butter, water, fried shallot and chilli — or mix classic nước chấm.',
      'Serve immediately so the paper stays tender, not tough.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/8CaadFo3sw0',
    videoTitle: 'How to roll gỏi cuốn',
  },
  {
    dishId: 'com-tam',
    servings: '4 plates',
    time: '1 hour',
    tastingDescription:
      'Cơm tấm is Saigon’s everyday glory: fractured rice grains that drink up scallion oil, a charcoal-grilled pork chop with a caramel edge, shredded pork skin, a fried egg if you want it, pickled vegetables and a pour of sweet-salty nước mắm. It is smoky, cheap, generous — lunch on a plastic stool with iced tea sweating beside the plate.',
    coreIngredients:
      'Broken rice (cơm tấm) is the point — small fractured grains that drink scallion oil (mỡ hành). The classic plate adds a charcoal pork chop marinated in fish sauce, honey, garlic and lemongrass, plus đồ chua (pickled carrot and daikon), cucumber, and often a fried egg and shredded pork skin. Sweet-salty nước mắm pha goes over the rice at the table, not in the kitchen.',
    howServed:
      'This is Saigon lunch and late lunch: a metal plate, iced tea, grill smoke still on the chop. You spoon sauce onto the rice, cut the pork, and mix. Street shops and canteens both count. Ask for sườn if you want the chop to be the star; extras (egg, skin, shredded pork) are normal, not greedy. Eat it while the rice is hot and the pickle is cold.',
    images: [
      wiki('Cơm_tấm.jpg'),
      wiki('Com_tam.jpg'),
      wiki('Broken_rice_Vietnam.jpg'),
    ],
    ingredients: [
      { amount: '400 g', item: 'Broken rice (cơm tấm), rinsed' },
      { amount: '4', item: 'Pork chops' },
      { amount: '3 tbsp', item: 'Fish sauce + 1 tbsp honey + garlic + lemongrass for marinade' },
      { amount: '', item: 'Scallion oil (mỡ hành)' },
      { amount: '', item: 'Đồ chua (pickled carrot and daikon), cucumber, fried egg, pork skin' },
      { amount: '', item: 'Nước mắm pha (fish sauce, sugar, lime, garlic, chilli)' },
    ],
    steps: [
      'Marinate chops at least 30 minutes. Grill over charcoal until the sugar catches.',
      'Steam broken rice until fluffy. Fold through scallion oil.',
      'Plate rice, chop, pickles, cucumber and optional egg and skin.',
      'Spoon nước mắm over the rice at the table. Eat with the grill smoke still on the pork.',
    ],
    videoEmbedUrl: 'https://www.youtube.com/embed/Hlr8nD8cNW4',
    videoTitle: 'How to make Sài Gòn cơm tấm',
  },
]

export function getRecipeForDish(dishId: string): DishRecipe | undefined {
  const recipe = RECIPES.find((item) => item.dishId === dishId)
  if (!recipe) return undefined
  const dish = getDishById(dishId)
  if (!dish) return recipe
  return {
    ...recipe,
    videoEmbedUrl: dish.recipeVideoUrl,
    images: dish.images.slice(0, 3),
  }
}
