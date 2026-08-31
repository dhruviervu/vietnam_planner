export type TitledParagraph = {
  title: string
  body: string
}

const TITLE_RULES: { test: RegExp; title: string }[] = [
  { test: /before you go|short checklist/i, title: 'Before you go' },
  { test: /leave space for the unscripted|finest .*experience|a last thought/i, title: 'A last thought' },
  { test: /environmental care|litter|wildlife|single-use plastic|stalactites|caring for the place/i, title: 'Caring for the place' },
  { test: /getting there|disembark|ride-hailing|motorbike rental|after a full outing/i, title: 'Getting there and away' },
  { test: /photograph|drones are restricted|tripods/i, title: 'Photography' },
  { test: /crowds are part|weekend|school holidays|around tet|crowds and timing/i, title: 'Crowds and timing' },
  { test: /food and drink|food is inseparable|busy stalls|eating nearby/i, title: 'Eating nearby' },
  { test: /etiquette aboard|dress with the respect|shoulders and knees|voices should be lowered/i, title: 'Etiquette' },
  { test: /distinct seasons|weather|pack a light|november through march|seasons and packing/i, title: 'Seasons and packing' },
  { test: /begin with orientation|street names begin|not a sealed|finding your way/i, title: 'Finding your way' },
  { test: /choosing the right|before booking|confirm the exact/i, title: 'How to choose' },
  { test: /cabins range|ticket arrangements|price|cash is useful|budget roughly|practical details/i, title: 'Practical details' },
  { test: /unesco|founded|legend|dynasty|heritage|examination|confucius|history and setting/i, title: 'History and setting' },
  { test: /the experience\.|cruise is less|visitor route|what makes .* memorable|itinerary/i, title: 'The experience' },
  { test: /how long to allow|set aside at least|practical pacing|hours and ticket/i, title: 'How long to allow' },
  { test: /living environment|communities around|working piece of the capital/i, title: 'A living place' },
]

function titleFromFirstSentence(para: string): string {
  const first = (para.split(/[.!?]/)[0] ?? para).trim()
  const words = first.replace(/[“”"']/g, '').split(/\s+/).filter(Boolean)
  const slice = words.slice(0, Math.min(7, Math.max(4, words.length)))
  let title = slice.join(' ')
  if (words.length > slice.length) title += '…'
  return title.replace(/[,;:–-]+$/, '').trim()
}

export function titleGuideParagraphs(guide: string, subject?: string): TitledParagraph[] {
  const paras = guide
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const used = new Set<string>()
  return paras.map((body, index) => {
    let title = ''
    if (index === 0) title = subject?.trim() || 'The setting'
    else {
      const match = TITLE_RULES.find((rule) => rule.test.test(body))
      title = match?.title ?? titleFromFirstSentence(body)
    }
    if (index === paras.length - 1 && !TITLE_RULES.some((rule) => rule.test.test(body))) {
      title = 'A last thought'
    }
    if (used.has(title)) title = titleFromFirstSentence(body)
    if (used.has(title)) title = `${title} (${index + 1})`
    used.add(title)
    return { title, body }
  })
}
