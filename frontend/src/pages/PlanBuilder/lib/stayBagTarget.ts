type PopListener = () => void

let bagEl: HTMLElement | null = null
const popListeners = new Set<PopListener>()

export function registerStayBag(el: HTMLElement | null) {
  bagEl = el
}

export function getStayBagRect(): DOMRect | null {
  return bagEl?.getBoundingClientRect() ?? null
}

export function triggerStayBagPop() {
  popListeners.forEach((listener) => listener())
}

export function onStayBagPop(listener: PopListener) {
  popListeners.add(listener)
  return () => {
    popListeners.delete(listener)
  }
}
