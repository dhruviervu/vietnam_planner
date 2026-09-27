import type { Experience } from '../types'
import { EXPERIENCES, getExperienceById } from './experiences'
import { isDeepHeritageSight } from './heritageDeepSights'
import { getExperiencePracticalInfo } from '../services/experiencePracticalInfo'
import wikiBriefs from './sightWikiBriefs.json'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

type WikiBrief = { title?: string; extract?: string }

const WIKI = wikiBriefs as Record<string, WikiBrief>

function shortName(e: Experience): string {
  return e.name.replace(/\s*\([^)]*\)\s*$/, '').trim() || e.name
}

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function sentences(text: string): string[] {
  return (text || '')
    .replace(/\r/g, '')
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z“"‘0-9])/))
    .map((s) => s.replace(/^##\s+/, '').trim())
    .filter((s) => {
      if (s.split(/\s+/).length < 7) return false
      if (/^(see also|references|external links|bibliography|notes)\b/i.test(s)) return false
      return true
    })
}

function take(pool: string[], used: Set<string>, n: number): string[] {
  const out: string[] = []
  for (const s of pool) {
    const key = fold(s).slice(0, 56)
    if (!key || used.has(key)) continue
    used.add(key)
    out.push(s.replace(/\s+/g, ' ').trim())
    if (out.join(' ').split(/\s+/).length >= n * 40 && out.length >= n) break
    if (out.length >= n) break
  }
  return out
}

function para(parts: string[]): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function monthNames(months: number[]): string {
  return months.map((m) => MONTHS[m - 1]).filter(Boolean).join(', ')
}

function conductFor(e: Experience, short: string): string {
  const tags = `${e.category} ${e.tags.join(' ')} ${e.dna.join(' ')} ${e.id}`.toLowerCase()
  const bits: string[] = []
  if (/temple|pagoda|tomb|citadel|church|mosque|wat|sanctuary|mausoleum|literature/.test(tags)) {
    bits.push(
      `${short} is an active or formerly sacred place, not a costume set. Cover shoulders and knees, remove hats in halls, step over thresholds rather than on them, and keep voices low around altars and incense.`,
    )
  }
  if (/cave|karst|grotto/.test(tags)) {
    bits.push(
      `Inside ${short}, keep hands off formations, stay on the marked path, and use the lighting that is already there. Helmets and life jackets exist for a reason on boat-cave routes.`,
    )
  }
  if (/beach|island|bay|snorkel|dive|kayak|boat|cruise/.test(tags)) {
    bits.push(
      `On water around ${short}, follow the crew or posted swim line, pack every wrapper out, and skip reef walking. Sun and spray fatigue sneak up faster than the postcard suggests.`,
    )
  }
  if (/market|street|quarter|village|homestay/.test(tags)) {
    bits.push(
      `${short} is someone’s workplace and home street. Ask before close portraits, agree prices before you sit, and do not block stalls for a photograph.`,
    )
  }
  if (/park|trek|hike|pass|mountain|forest|waterfall/.test(tags)) {
    bits.push(
      `On the ${short} trail or stair, stay on the path, do not cut switchbacks, and turn around in lightning or unreadable cloud rather than inventing a summit.`,
    )
  }
  if (!bits.length) {
    bits.push(
      `Treat ${short} as a real stop in ${e.city}: keep rubbish with you, ask before portraits, and follow posted photography and drone rules.`,
    )
  }
  bits.push(`Do not take offerings, coral, stalactites, bricks, or altar objects from ${short}.`)
  return bits.join(' ')
}

function slotExplain(e: Experience, short: string): string {
  const { morning, afternoon, evening } = e.slotQuality
  const best =
    morning >= afternoon && morning >= evening
      ? 'morning'
      : afternoon >= evening
        ? 'afternoon'
        : 'evening'
  return `For ${short} the published window is ${e.bestTime}. On this place’s crowd-and-light model, morning scores ${morning}/5, afternoon ${afternoon}/5, and evening ${evening}/5, so ${best} is usually the kindest start. ${e.durationLabel} (${e.durationHours} hours on the model) is the on-site block — add ${e.city} traffic and a buffer rather than stacking another equal-length headline immediately after.`
}

function moneyExplain(e: Experience, short: string, bookAhead: string): string {
  if (e.priceType === 'free' || e.price === 0) {
    return `${short} is listed free or donation-based (${e.costLabel}). Transport, boats, chairs, and snacks around ${e.city} still cost. The budget band on this stop is ${e.budgetBand}. Booking ahead is ${bookAhead.replace('-', ' ')}.`
  }
  return `The listed from-price for ${short} is ${e.costLabel} (about $${e.costUsd} in our notes, ${e.priceType.replace('_', ' ')}). Treat that as a starting figure, not a locked invoice — booths, boat desks, and holiday weekends move. Band: ${e.budgetBand}. Booking ahead is ${bookAhead.replace('-', ' ')}. Keep small cash for extras in ${e.city}.`
}

function seasonExplain(e: Experience, short: string): string {
  const ideal = e.monthsIdeal.length
    ? `Months that tend to fit ${short}: ${monthNames(e.monthsIdeal)}.`
    : ''
  if (!e.seasonalNotes.length) {
    return `${ideal} ${e.bestTime} remains the kindest daily window. ${e.city} heat, rain, mist, and holiday calendars change ${short} more than a new café recommendation will. Pack for the highland, delta, or coast you are actually standing on.`
  }
  const notes = e.seasonalNotes
    .slice(0, 4)
    .map((n) => {
      const span = monthNames(n.months) || 'seasonal'
      return `${n.label} (${span}): ${n.weather} Crowds ${n.crowds.toLowerCase()}. ${n.note}`
    })
    .join(' ')
  return `${ideal} ${notes}`
}

function wikiTitleMatchesSight(title: string, e: Experience): boolean {
  const t = fold(title)
  if (!t) return false
  if (t === fold(e.city) || t === fold(e.region) || t === 'vietnam' || t === 'viet nam') return false
  if (/^(list of|tourism in|geography of|history of vietnam|vietnam)\b/.test(t)) return false
  const nameAll = fold(e.name)
    .replace(/[()]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2)
  if (!nameAll.length) return false
  const hits = nameAll.filter((w) => t.includes(w)).length
  return hits >= Math.min(2, nameAll.length)
}

function clipWiki(extract: string): string {
  const cut = extract.split(/\n(?=See also|References|External links|Bibliography|Notes\b)/i)[0] || extract
  const words = cut.trim().split(/\s+/).filter(Boolean)
  if (words.length > 1200) return words.slice(0, 1200).join(' ')
  return cut.trim()
}

function wikiFor(e: Experience): { title: string; extract: string } {
  const w = WIKI[e.id]
  if (!w?.title || !w.extract) return { title: '', extract: '' }
  if (!wikiTitleMatchesSight(w.title, e)) return { title: '', extract: '' }
  return { title: w.title, extract: clipWiki(w.extract) }
}

function relatedExplain(e: Experience, short: string): string {
  const others = e.relatedIds
    .map((id) => getExperienceById(id))
    .filter((x): x is Experience => x != null && x.id !== e.id && x.city === e.city)
    .slice(0, 5)
  if (!others.length) {
    return `Do not invent a second copy of ${short} on the same morning. One honest visit in ${e.city} is the stop.`
  }
  const names = others.map((o) => o.name).join(', ')
  return `Near ${short} in ${e.city}, nearby pins include ${names}. Each is a different ticket and a different visit — do not spend this guide reading another monument’s history.`
}

function accessExplain(e: Experience, short: string, bring: string, effort: string): string {
  return `Walking at ${short} is ${e.accessibilityDetail.walking}; wheelchair access is ${e.accessibilityDetail.wheelchair.toLowerCase()}; steps are ${e.accessibilityDetail.steps.toLowerCase()}. ${e.accessibility} Bring ${bring}. Effort on the ground: ${effort}. Pace affinity listed for this stop: ${e.paceAffinity.join(', ') || 'open'}. If mobility is limited, ask at the meeting point for the gentlest line rather than assuming a hidden lift.`
}

function wikiChunks(extract: string, used: Set<string>): string[][] {
  const sents = sentences(extract)
  const chunks: string[][] = []
  while (true) {
    const batch = take(sents, used, 4)
    if (!batch.length) break
    chunks.push(batch)
    if (chunks.length >= 8) break
  }
  return chunks
}

function wc(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function formatBlocks(blocks: Array<[string, string]>): string {
  return blocks
    .filter(([, body]) => body.split(/\s+/).filter(Boolean).length >= 18)
    .map(([title, body]) => `## ${title}\n\n${body.trim()}`)
    .join('\n\n')
}

/**
 * Visitor guide for one sight: curated notes + Wikipedia extract (when it
 * actually matches Vietnam / this city) + this card’s hours, money, access,
 * seasons, and named neighbours. No generic “postcard” padding.
 */
export function composeExperienceGuide(e: Experience, curated = ''): string {
  const short = shortName(e)
  const place = e.city
  const region = e.city !== e.region ? `${e.city}, ${e.region}` : e.city
  const practical = getExperiencePracticalInfo(e)
  const bring = practical.whatToBring.join(', ')
  const effort = `${practical.physicalEffort.walkingLabel} walking (${practical.physicalEffort.walkingIntensity}/5)${
    practical.physicalEffort.stairs ? `, stairs (${practical.physicalEffort.stepsDetail})` : ''
  }${practical.physicalEffort.unevenTerrain ? ', uneven ground' : ''}`
  const used = new Set<string>()
  const aboutSents = sentences(`${e.about} ${e.whyGo} ${e.hook} ${e.cardSummary}`)
  const wiki = wikiFor(e)
  const wikiExtract = wiki.extract
  const wikiTitle = wiki.title

  const open = take(aboutSents, used, 6)
  const chunks = wikiChunks(wikiExtract, used)
  const siblings = EXPERIENCES.filter(
    (x) => x.city === e.city && x.id !== e.id && x.sightSection && x.sightSection === e.sightSection,
  )
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, 4)

  const blocks: Array<[string, string]> = [
    [
      `What ${short} is`,
      para([
        `${e.name} is a ${e.category.toLowerCase()} stop in ${region}.`,
        ...open,
        e.popularity,
      ]),
    ],
  ]

  const curatedParas = curated
    .split(/\n\n+/)
    .map((p) => p.replace(/^##\s+.+\n+/, '').trim())
    .filter((p) => p.split(/\s+/).length >= 12)
  curatedParas.forEach((p, i) => {
    const first = (p.split(/[.!?]/)[0] || p).trim().split(/\s+/).slice(0, 8).join(' ')
    blocks.push([`${short} — ${first}`.slice(0, 70) + (i ? ` (${i + 1})` : ''), p])
  })

  if (chunks[0]?.length) {
    blocks.push([
      `Background of ${short}`,
      para([
        wikiTitle && wikiTitle.toLowerCase() !== e.name.toLowerCase()
          ? `Public reference material filed under “${wikiTitle}” is the source for the history and setting below — checked against ${place}, Vietnam, not a same-named site elsewhere.`
          : `The setting of ${short} in ${place} is documented in public reference sources; the visit still has to match the hours and duration on this stop.`,
        ...chunks[0],
      ]),
    ])
  }

  if (chunks[1]?.length) {
    blocks.push([`How ${short} is laid out`, para(chunks[1])])
  }
  if (chunks[2]?.length) {
    blocks.push([`What a visit to ${short} involves`, para(chunks[2])])
  }
  if (chunks[3]?.length) {
    blocks.push([`History and landscape around ${short}`, para(chunks[3])])
  }
  if (chunks[4]?.length) {
    blocks.push([`Further context for ${short}`, para(chunks[4])])
  }
  if (chunks[5]?.length) {
    blocks.push([`Place names and administration around ${short}`, para(chunks[5])])
  }
  if (chunks[6]?.length) {
    blocks.push([`Conservation and later history of ${short}`, para(chunks[6])])
  }
  if (chunks[7]?.length) {
    blocks.push([`More on ${short} from public sources`, para(chunks[7])])
  }

  if (siblings.length) {
    blocks.push([
      `${short} is not the rest of ${place}`,
      para([
        `${short} is its own pin. Other stops in the same ${place} grouping${e.sightSection ? ` (“${e.sightSection}”)` : ''} — ${siblings.map((s) => s.name).join(', ')} — are different tickets and hours.`,
        `Keep ${e.durationLabel.toLowerCase()} for ${short} instead of paying twice for the same ridge under another title.`,
      ]),
    ])
  }

  blocks.push([`Hours and pacing at ${short}`, slotExplain(e, short)])
  blocks.push([`Money and tickets at ${short}`, moneyExplain(e, short, practical.bookAhead)])
  blocks.push([`Access and what to bring to ${short}`, accessExplain(e, short, bring, effort)])
  blocks.push([`Seasons at ${short}`, seasonExplain(e, short)])
  blocks.push([`Crowds and character of ${short}`, para([
    `${e.name} carries popularity rank ${e.popularityRank} (${e.popularityTag}) in ${place}.`,
    e.featured ? 'It is featured on the city list.' : '',
    e.hiddenGem ? 'It is tagged as a quieter pick, which does not mean empty at weekends.' : '',
    e.vietnamBest ? 'It is marked among the stronger Vietnam-wide picks in this catalog.' : '',
    e.sightSection ? `On the city page it sits under “${e.sightSection}.”` : '',
    e.signalLabel ? `${e.signalLabel}: ${e.signalBlurb}` : '',
    e.reviews[0]
      ? `${e.reviews[0].author} wrote, at ${e.reviews[0].rating}/5: “${e.reviews[0].text}” Treat that as one voice among ${e.reviewCount.toLocaleString()} reviews at ${e.rating}.`
      : `${e.reviewCount.toLocaleString()} reviews sit at ${e.rating}; popularity is not a promise that your hour will match a peak-season photograph.`,
  ])])
  blocks.push([`Conduct at ${short}`, conductFor(e, short)])
  blocks.push([`What not to double-book with ${short}`, relatedExplain(e, short)])
  blocks.push([
    `Getting to ${short}`,
    para([
      `${short} happens in ${place}${e.city !== e.region ? `, ${e.region}` : ''}.`,
      `Published hours are ${e.hours}; confirm at the gate the morning you go.`,
      `Save a pickup pin in Vietnamese and a charged phone.`,
      `After ${e.durationLabel.toLowerCase()} on site, do not lock a same-hour flight from a far airport.`,
      `Tags that describe this outing — not a scavenger list for the whole province — include ${e.tags.slice(0, 8).join(', ') || e.category}.`,
      `DNA on this stop: ${e.dna.join(', ') || e.category}.`,
    ]),
  ])
  blocks.push([
    `A last thought on ${short}`,
    para([
      `You came for ${e.name}, not for a composite of ${place}.`,
      e.hook,
      `Leave when ${e.durationLabel.toLowerCase()} has been honest, keep rubbish with you, and let the next pin wait.`,
    ]),
  ])

  let out = formatBlocks(blocks)
  if (wc(out) < 1000 && e.reviews.length > 1) {
    blocks.push([
      `Visitor voices on ${short}`,
      para(e.reviews.slice(0, 4).map((r) => `${r.author} (${r.rating}/5): “${r.text}”`)),
    ])
    out = formatBlocks(blocks)
  }
  if (wc(out) < 1000) {
    const named = new Set([e.id, ...e.relatedIds, ...siblings.map((s) => s.id)])
    const extra = EXPERIENCES.filter(
      (x) => isDeepHeritageSight(x) && x.city === e.city && x.id !== e.id && !named.has(x.id),
    )
      .sort((a, b) => a.popularityRank - b.popularityRank)
      .slice(0, 4)
    if (extra.length) {
      blocks.push([
        `Other heritage stops near ${short}`,
        para([
          `If hours remain after ${e.durationLabel.toLowerCase()} at ${short}, these are separate historic or sacred pins in ${place} — not a second ticket for the same courtyard: ${extra.map((x) => x.name).join(', ')}.`,
        ]),
      ])
      out = formatBlocks(blocks)
    }
  }
  return out
}

export function curatedWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
