import type { EventGuide, EventGuideKind, EventGuideSection } from './eventGuides'

export function essay(
  id: string,
  kind: EventGuideKind,
  blocks: Array<[string, string]>,
): EventGuide {
  const sections: EventGuideSection[] = blocks.map(([title, body]) => ({
    title,
    paragraphs: [body],
  }))
  return { id, kind, sections }
}
