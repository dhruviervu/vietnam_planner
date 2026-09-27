/**
 * Production serves one JSON file per sight (written by scripts/build-guides.ts), so the
 * site never ships every guide at once. Dev reads the source modules so edits show live.
 */
const cache = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

export function cachedGuideText(id: string): string | undefined {
  return cache.get(id)
}

async function fetchGuideText(id: string): Promise<string> {
  if (import.meta.env.DEV) {
    const mod = await import('./experienceGuides')
    return mod.getExperienceGuide(id)
  }
  const res = await fetch(`/guides/${encodeURIComponent(id)}.json`)
  if (res.status === 404) return ''
  if (!res.ok) throw new Error(`guide:${res.status}`)
  if (!(res.headers.get('Content-Type') ?? '').includes('json')) return ''
  const data = (await res.json()) as { text?: unknown }
  return typeof data.text === 'string' ? data.text : ''
}

export function loadGuideText(id: string): Promise<string> {
  const hit = cache.get(id)
  if (hit !== undefined) return Promise.resolve(hit)
  let job = pending.get(id)
  if (!job) {
    job = fetchGuideText(id)
      .then((text) => {
        cache.set(id, text)
        return text
      })
      .finally(() => pending.delete(id))
    pending.set(id, job)
  }
  return job
}
