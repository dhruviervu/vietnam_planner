type PopListener = () => void

let bagEl: HTMLElement | null = null
const popListeners = new Set<PopListener>()

export function registerTripBag(el: HTMLElement | null) {
  bagEl = el
}

export function getTripBagRect(): DOMRect | null {
  return bagEl?.getBoundingClientRect() ?? null
}

export function triggerTripBagPop() {
  popListeners.forEach((listener) => listener())
}

export function onTripBagPop(listener: PopListener) {
  popListeners.add(listener)
  return () => {
    popListeners.delete(listener)
  }
}
