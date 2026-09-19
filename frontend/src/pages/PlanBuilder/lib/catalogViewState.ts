import type { ExperienceFilters } from '../services/recommendationEngine'
import { DEFAULT_FILTERS } from '../services/recommendationEngine'

const KEY = 'vietnam-things-to-do-catalog-v1'

export type CatalogViewState = {
  filters: ExperienceFilters
  filtersOpen: boolean
  scrollY: number
  savedAt: number
}

let memory: CatalogViewState | null | undefined
let persistTimer = 0

function readStorage(): CatalogViewState | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as CatalogViewState
  } catch {
    return null
  }
}

function writeStorage(state: CatalogViewState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private mode */
  }
}

function schedulePersist() {
  if (typeof window === 'undefined' || persistTimer || memory == null) return
  persistTimer = window.setTimeout(() => {
    persistTimer = 0
    if (memory) writeStorage(memory)
  }, 250)
}

export function loadCatalogViewState(): CatalogViewState | null {
  if (memory !== undefined) return memory
  memory = readStorage()
  return memory
}

export function saveCatalogViewState(partial: Partial<CatalogViewState>, flush = false) {
  const prev = loadCatalogViewState()
  memory = {
    filters: partial.filters ?? prev?.filters ?? DEFAULT_FILTERS,
    filtersOpen: partial.filtersOpen ?? prev?.filtersOpen ?? false,
    scrollY: partial.scrollY ?? prev?.scrollY ?? 0,
    savedAt: Date.now(),
  }
  if (flush) {
    if (persistTimer && typeof window !== 'undefined') {
      window.clearTimeout(persistTimer)
      persistTimer = 0
    }
    writeStorage(memory)
    return
  }
  schedulePersist()
}

export function captureCatalogScroll() {
  saveCatalogViewState({ scrollY: window.scrollY }, true)
}
