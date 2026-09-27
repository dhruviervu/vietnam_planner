import { lazy, type ComponentType } from 'react'

const RELOAD_FLAG = 'vc:chunk-reload'

/** After a deploy, open tabs still point at old hashed chunks; reload once to pick up the new build. */
export function reloadOnceForStaleChunk(): boolean {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
  } catch {
    return false
  }
  window.location.reload()
  return true
}

export function clearStaleChunkFlag() {
  try {
    sessionStorage.removeItem(RELOAD_FLAG)
  } catch {
    /* storage unavailable */
  }
}

type Loader<M> = () => Promise<M>

export type PreloadablePage = ComponentType<Record<string, unknown>> & { preload: () => Promise<unknown> }

/** Route-level code split with a stale-chunk reload and a `preload()` for idle prefetch. */
export function lazyPage<M, K extends keyof M>(loader: Loader<M>, exportName: K) {
  let pending: Promise<M> | null = null
  const load = () => {
    pending ??= loader().catch((err: unknown) => {
      pending = null
      if (reloadOnceForStaleChunk()) return new Promise<M>(() => {})
      throw err
    })
    return pending
  }
  const Page = lazy(async () => {
    const mod = await load()
    return { default: mod[exportName] as unknown as ComponentType<Record<string, unknown>> }
  }) as unknown as PreloadablePage
  Page.preload = load
  return Page as M[K] & { preload: () => Promise<unknown> }
}
