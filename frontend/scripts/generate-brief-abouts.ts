/**
 * Rewrite visitor guides under 500 words as a ~280-word About (four short sections).
 *   npx tsx scripts/generate-brief-abouts.ts
 *   npx tsx scripts/generate-brief-abouts.ts --city=Hanoi
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPERIENCES } from '../src/pages/PlanBuilder/data/experiences'
import { getExperienceGuide, wordCount } from '../src/pages/PlanBuilder/data/experienceGuides'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_TS = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data', 'experienceGuidesBriefAbout.ts')
const OUT_JSON = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data', 'experienceGuidesBriefAbout.json')

function loadDotEnv() {
  for (const name of ['.env.local', '.env']) {
    const fp = path.join(ROOT, name)
    if (!fs.existsSync(fp)) continue
    for (const raw of fs.readFileSync(fp, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq < 1) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!(key in process.env)) process.env[key] = value
    }
  }
}

function argValue(flag: string) {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`))
  if (hit) return hit.slice(flag.length + 1)
  const i = process.argv.indexOf(flag)
  return i === -1 ? undefined : process.argv[i + 1]
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function geminiKey() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim()
}

function writeTs(guides: Record<string, string>) {
  fs.writeFileSync(OUT_JSON, JSON.stringify(guides, null, 2) + '\n')
  const body = `/** Auto-generated brief About copy for short visitor guides. */
export const EXPERIENCE_GUIDES_BRIEF_ABOUT: Record<string, string> = ${JSON.stringify(guides, null, 2)}
`
  fs.writeFileSync(OUT_TS, body, 'utf8')
}

async function writeAbout(exp: (typeof EXPERIENCES)[number]) {
  const key = geminiKey()
  const prompt = `Write a visitor "About" for this Vietnam sight. 270 to 300 English words total.
Sight: ${exp.name}
City: ${exp.city}
Hook: ${exp.hook}
Blurb: ${exp.about}
Card: ${exp.cardSummary}

Use exactly these markdown headings, each followed by 1-2 short paragraphs:
## About
## What you'll notice
## Practical notes
## Worth knowing

Stay on THIS place. Do not describe other cities' famous monuments except one short contrast if needed. No bullet lists. Travel-guide tone, useful, specific.`

  const models = ['gemini-3.5-flash', 'gemini-3.8-flash']
  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
          }),
        },
      )
      if (res.status === 503 || res.status === 429) {
        await sleep(700 * attempt)
        continue
      }
      if (!res.ok) break
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
      const guide = text.replace(/```markdown|```/g, '').trim()
      if (!guide.includes('## About')) continue
      const n = wordCount(guide)
      if (n < 220 || n > 360) continue
      return guide
    }
  }
  return ''
}

async function main() {
  loadDotEnv()
  if (!geminiKey()) throw new Error('GEMINI_API_KEY missing')
  const city = argValue('--city')
  const existing = fs.existsSync(OUT_JSON)
    ? (JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')) as Record<string, string>)
    : {}
  let list = EXPERIENCES.filter((e) => wordCount(getExperienceGuide(e.id) || '') < 500)
  if (city) {
    const want = city.toLowerCase()
    list = list.filter((e) => e.city.toLowerCase().includes(want))
  }
  console.log(`Short guides: ${list.length}. Gemini on.`)
  let n = 0
  for (const exp of list) {
    n += 1
    if (existing[exp.id] && wordCount(existing[exp.id]) >= 220) {
      console.log(`[${n}/${list.length}] skip ${exp.id}`)
      continue
    }
    process.stdout.write(`[${n}/${list.length}] ${exp.id} … `)
    const guide = await writeAbout(exp)
    const words = wordCount(guide)
    if (guide && words >= 220) {
      existing[exp.id] = guide
      writeTs(existing)
      console.log(`${words} words`)
    } else {
      console.log('failed')
    }
    await sleep(250)
  }
  writeTs(existing)
  console.log(`Done. ${Object.keys(existing).length} briefs.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
