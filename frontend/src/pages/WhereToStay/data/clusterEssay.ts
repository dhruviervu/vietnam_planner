import { getClusterDescription } from './clusterDescriptions'
import type { StayCluster } from './types'

/**
 * Structured neighbourhood essays.
 *
 * There are 35 stay clusters across 8 cities. Unique multi-paragraph
 * history / architecture / sights / practical copy for every cluster is a
 * large writing job — fill CLUSTER_ESSAY_SECTIONS over time. Clusters without
 * an entry still get a para-by-para page composed from existing cluster data.
 */
export type ClusterEssaySections = {
  history: string
  architecture: string
  sights: string
  practical: string
}

export type ClusterEssayBlock = {
  title: string
  paragraphs: string[]
}

const GENERIC_SNIPPETS = [
  'Practical notes help most visitors settle faster',
  'Weather and season change the feel of any neighbourhood',
  'Safety for tourists is generally good across Vietnam',
  'Food is one of the joys of basing yourself well',
  'Ultimately the right cluster is the one that matches',
]

/** High-quality examples only — add more cluster ids here as you write them. */
export const CLUSTER_ESSAY_SECTIONS: Partial<Record<string, ClusterEssaySections>> = {
  'hanoi-old-quarter': {
    history:
      'The Old Quarter grew as Hanoi’s merchant core: guild streets named for what they sold — silk, silver, bamboo, herbs — packed into tube houses that paid tax on street frontage. That logic still shapes the maze. Chinese, Vietnamese, and later French commercial layers sit on top of each other rather than in a museum row. Hoan Kiem Lake is the southern social edge; Dong Xuan Market still marks the northern trading gravity. You are staying inside a working bazaar that happens to be the capital’s postcard, not a reconstructed heritage park.',
    architecture:
      'Look up. Narrow tube houses run deep from a tiny façade; upper floors jostle with balconies, water tanks, and tangled wires. French-period shutters and later concrete infill sit beside timber frames. Pavements are kitchens, parking, and social space as much as sidewalks. Hotels hide behind those façades — a calm courtyard can exist five metres from a scooter flood. Request a rear or upper room if you need sleep; the architecture that makes the quarter photogenic is the same architecture that carries noise.',
    sights:
      'Hoan Kiem Lake and the Ngoc Son approach are a short walk. Guild streets (Hang Bac, Hang Ma, Hang Gai) reward unhurried wandering more than a rigid checklist. Dong Xuan is the serious market; temple courtyards appear between shopfronts when you are not hunting them. Evening energy gathers around the lake and weekend night-market lanes. Day trips to Ninh Binh or Ha Long usually pick up from hotels in or near this cluster, which is a practical reason first-timers stay here even when they complain about horns.',
    practical:
      'Walk for almost everything in the historic core; use Grab for the Temple of Literature, West Lake, or the airport. Street food is excellent if you follow busy counters. Keep valuables close in crowds. Lightweight sleepers should filter rooms carefully or sleep in the French Quarter and visit by day. Families with small children sometimes find scooter density intense. Comfortable shoes matter more than a fancy bag. For a short city break, few bases match this density of food, history, and people-watching.',
  },
  'hoian-ancient-town': {
    history:
      'Hoi An was a Cham port, then a prosperous Nguyen-era trading town linking Japan, China, and later Europe. The heritage core you walk is a UNESCO merchant town, not a theme park invented for lanterns — though lanterns are now the night’s signature. Assembly halls, family chapels, and shophouses record overseas Vietnamese and Japanese-Chinese commercial ties. Floods still mark the river streets; high-water plaques are part of the civic memory. Staying here means sleeping inside that trading history, with ticketed houses a few minutes from the hotel door.',
    architecture:
      'Yellow limewash, timber frames, tiled roofs, and Japanese-influenced bridges define the postcard. Shophouses open deep from the street, with courtyards that keep interiors cooler. Restoration quality varies: some façades are carefully held; others wear tourism more loudly. The lantern overlay after dark is real and photogenic, and it is also a modern evening economy. Boutique hotels occupy converted townhouses — beautiful, often compact, and closer to footsteps and karaoke than a garden villa would be.',
    sights:
      'Japanese Covered Bridge, Chinese assembly halls, the riverfront, and tailor-and-lantern streets are the walkable set. Morning light before tour groups arrive is the quiet gift; evenings glow and crowd. Tickets are required for many historic interiors — keep them handy. An Hoi sits across the water for night-market food; the beach at An Bang is a bicycle or short taxi, not a stroll from the lantern core.',
    practical:
      'Peak season means crowds, higher rates, and street noise after dark. If you need deep sleep during festival peaks, spend some nights in Cam Chau, Cam Nam, or An Bang and come in for lantern evenings. Bicycles beat cars in the heritage grid. Quality among tailors and lantern shops varies — compare before you commission. Pack insect repellent for dusk by the river. This cluster is for travellers who want atmosphere at the door and will trade some quiet to get it.',
  },
}

function uniqueParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !GENERIC_SNIPPETS.some((snippet) => p.includes(snippet)))
}

function splitSentences(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function getClusterEssayBlocks(cluster: StayCluster): ClusterEssayBlock[] {
  const authored = CLUSTER_ESSAY_SECTIONS[cluster.id]
  if (authored) {
    return [
      { title: 'History', paragraphs: splitSentences(authored.history) },
      { title: 'Architecture', paragraphs: splitSentences(authored.architecture) },
      { title: 'Sights', paragraphs: splitSentences(authored.sights) },
      { title: 'Practical tips', paragraphs: splitSentences(authored.practical) },
    ]
  }

  const essay = getClusterDescription(cluster.id)
  const unique = uniqueParagraphs(essay.text)
  const places = cluster.keyPlaces
    .map((p) => `${p.label} (${p.typicalMinutes} min ${p.mode})`)
    .join('; ')

  const history = unique[0] || cluster.baseYourselfIf
  const architecture =
    unique[1] ||
    `${cluster.name} is known for ${cluster.character.join(', ').toLowerCase()}. ${cluster.tradeoff}`
  const sights =
    unique[2] ||
    (places
      ? `From a stay here, typical hops include ${places}. ${cluster.transportAccess.walkabilityLabel}.`
      : cluster.transportAccess.walkabilityLabel)
  const practical = [
    cluster.tradeoff,
    cluster.living.noiseNote,
    cluster.living.safetyNote,
    cluster.living.foodNote,
    cluster.living.costOfLivingNote,
    cluster.transportAccess.taxiLabel,
  ]
    .filter(Boolean)
    .join(' ')

  return [
    { title: 'History', paragraphs: [history] },
    { title: 'Architecture', paragraphs: [architecture] },
    { title: 'Sights', paragraphs: [sights] },
    { title: 'Practical tips', paragraphs: [practical] },
  ]
}
