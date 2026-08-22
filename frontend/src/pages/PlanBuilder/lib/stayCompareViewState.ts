const KEY = 'vietnam-stay-compare-v1'

export type StayCompareViewState = {
  compareIds: string[]
  scrollY: number
  restoreScroll: boolean
  savedAt: number
}

export function saveStayCompareViewState(partial: Partial<StayCompareViewState>) {
  try {
    const prev = loadStayCompareViewState()
    const next: StayCompareViewState = {
      compareIds: partial.compareIds ?? prev?.compareIds ?? [],
      scrollY: partial.scrollY ?? prev?.scrollY ?? 0,
      restoreScroll: partial.restoreScroll ?? prev?.restoreScroll ?? false,
      savedAt: Date.now(),
    }
    sessionStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function loadStayCompareViewState(): StayCompareViewState | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as StayCompareViewState
  } catch {
    return null
  }
}

export function captureStayCompareScroll() {
  saveStayCompareViewState({ scrollY: window.scrollY, restoreScroll: false })
}

export function markStayCompareRestore() {
  saveStayCompareViewState({ restoreScroll: true, scrollY: loadStayCompareViewState()?.scrollY ?? window.scrollY })
}

export function clearStayCompareRestoreFlag() {
  const prev = loadStayCompareViewState()
  if (!prev) return
  saveStayCompareViewState({ ...prev, restoreScroll: false })
}
