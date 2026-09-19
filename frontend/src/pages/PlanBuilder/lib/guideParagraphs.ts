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

type ParsedBlock = { title?: string; body: string; explicit: boolean }

/** Split on blank lines, joining a lone `## Title` with the next block. */
export function parseGuideBlocks(guide: string): ParsedBlock[] {
  const raw = guide
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const out: ParsedBlock[] = []
  for (let i = 0; i < raw.length; i++) {
    const block = raw[i]!
    const headed = block.match(/^##\s+(.+?)(?:\n+([\s\S]+))?$/)
    if (headed) {
      const title = headed[1]!.trim()
      let body = (headed[2] ?? '').trim()
      if (!body && raw[i + 1] && !raw[i + 1]!.startsWith('##')) {
        body = raw[++i]!
      }
      if (body) out.push({ title, body, explicit: true })
      continue
    }
    out.push({ body: block, explicit: false })
  }
  return out
}

export function titleGuideParagraphs(guide: string, subject?: string): TitledParagraph[] {
  const blocks = parseGuideBlocks(guide)
  const used = new Set<string>()

  return blocks.map((block, index) => {
    let title = ''
    if (block.explicit && block.title) {
      title = block.title
    } else if (index === 0) {
      title = subject?.trim() || 'The setting'
    } else {
      const match = TITLE_RULES.find((rule) => rule.test.test(block.body))
      title = match?.title ?? titleFromFirstSentence(block.body)
    }

    const last = index === blocks.length - 1
    if (last && !block.explicit && !TITLE_RULES.some((rule) => rule.test.test(block.body))) {
      title = 'A last thought'
    }
    if (used.has(title)) title = titleFromFirstSentence(block.body)
    if (used.has(title)) title = `${title} (${index + 1})`
    used.add(title)
    return { title, body: block.body }
  })
}
