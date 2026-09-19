import type { TitledParagraph } from './guideParagraphs'

/** Chrome silently fails on very long utterances — speak in short units. */
export type SpeechUnit = {
  text: string
  paraIndex: number
}

/** Keep chunks short so faster playback still hits word boundaries. */
export const SPEECH_CHUNK_MAX = 180

/**
 * Prepare visitor-guide prose for English system voices.
 * Strips Vietnamese diacritics, expands ranges and common units, and
 * avoids leading-zero clock times that engines read as "zero seven".
 */
export function foldForSpeech(text: string): string {
  let s = text.replace(/Đ/g, 'D').replace(/đ/g, 'd')
  s = s.normalize('NFD').replace(/\p{M}/gu, '')
  s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  s = s.replace(/(\d)\s*[–—−-]\s*(\d)/g, '$1 to $2')
  s = s.replace(/\b0(\d):(\d{2})\b/g, '$1:$2')
  s = s.replace(/\bVND\b/gi, 'dong')
  s = s.replace(/\bUSD\b/g, 'U.S. dollars')
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*km\b/gi, '$1 kilometres')
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*m²\b/gi, '$1 square metres')
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*m2\b/gi, '$1 square metres')
  s = s.replace(/\b(\d+(?:\.\d+)?)\s*m\b/g, '$1 metres')
  s = s.replace(/&/g, ' and ')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function splitOversized(sentence: string, maxLen: number): string[] {
  if (sentence.length <= maxLen) return [sentence]
  const parts: string[] = []
  const clauses = sentence.split(/(?<=[,;:])\s+/)
  let buf = ''
  const flush = () => {
    if (buf) {
      parts.push(buf)
      buf = ''
    }
  }
  for (const clause of clauses) {
    if (!clause) continue
    if ((buf + ' ' + clause).trim().length <= maxLen) {
      buf = (buf + ' ' + clause).trim()
      continue
    }
    flush()
    if (clause.length <= maxLen) {
      buf = clause
      continue
    }
    const words = clause.split(/\s+/)
    for (const word of words) {
      if ((buf + ' ' + word).trim().length <= maxLen) {
        buf = (buf + ' ' + word).trim()
      } else {
        flush()
        buf = word
      }
    }
  }
  flush()
  return parts
}

export function unitsForSections(
  sections: TitledParagraph[],
  maxLen = SPEECH_CHUNK_MAX,
): SpeechUnit[] {
  const units: SpeechUnit[] = []
  sections.forEach((section, paraIndex) => {
    const para = foldForSpeech(`${section.title}. ${section.body}`)
    const sentences = para.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [para]
    let buf = ''
    const flush = () => {
      if (buf) {
        units.push({ text: buf, paraIndex })
        buf = ''
      }
    }
    for (const raw of sentences) {
      const s = raw.trim()
      if (!s) continue
      if ((buf + ' ' + s).trim().length <= maxLen) {
        buf = (buf + ' ' + s).trim()
        continue
      }
      flush()
      for (const piece of splitOversized(s, maxLen)) {
        if ((buf + ' ' + piece).trim().length <= maxLen) {
          buf = (buf + ' ' + piece).trim()
        } else {
          flush()
          buf = piece
        }
      }
    }
    flush()
  })
  return units
}
