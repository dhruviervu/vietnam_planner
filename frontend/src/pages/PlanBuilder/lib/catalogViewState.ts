import type { ExperienceFilters } from '../services/recommendationEngine'
import { DEFAULT_FILTERS } from '../services/recommendationEngine'

const KEY = 'vietnam-things-to-do-catalog-v1'

export type CatalogViewState = {
  filters: ExperienceFilters
  filtersOpen: boolean
  scrollY: number
  savedAt: number
}

export function saveCatalogViewState(partial: Partial<CatalogViewState>) {
  try {
    const prev = loadCatalogViewState()
    const next: CatalogViewState = {
      filters: partial.filters ?? prev?.filters ?? DEFAULT_FILTERS,
      filtersOpen: partial.filtersOpen ?? prev?.filtersOpen ?? false,
      scrollY: partial.scrollY ?? prev?.scrollY ?? 0,
      savedAt: Date.now(),
    }
    sessionStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadCatalogViewState(): CatalogViewState | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as CatalogViewState
  } catch {
    return null
  }
}

export function captureCatalogScroll() {
  saveCatalogViewState({ scrollY: window.scrollY })
}
