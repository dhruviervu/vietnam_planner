type PopListener = () => void

let badgeEl: HTMLElement | null = null
const popListeners = new Set<PopListener>()

export function registerCartBadge(el: HTMLElement | null) {
  badgeEl = el
}

export function getCartBadgeRect(): DOMRect | null {
  return badgeEl?.getBoundingClientRect() ?? null
}

export function triggerCartBadgePop() {
  popListeners.forEach((listener) => listener())
}

export function onCartBadgePop(listener: PopListener) {
  popListeners.add(listener)
  return () => {
    popListeners.delete(listener)
  }
}
