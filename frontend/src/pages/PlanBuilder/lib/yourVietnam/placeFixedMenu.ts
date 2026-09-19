import { useCallback, useLayoutEffect, useState, type CSSProperties } from 'react'

type ElementRef = { current: HTMLElement | null }

export type MenuPrefer = 'below' | 'right'

export function placeFixedMenu(
  anchor: DOMRect,
  size: { width: number; height: number },
  prefer: MenuPrefer = 'below',
): { top: number; left: number; maxHeight?: number } {
  const pad = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(Math.max(size.width, 1), vw - pad * 2)
  const height = Math.max(size.height, 1)

  let left: number
  let top: number

  if (prefer === 'right') {
    left = anchor.right + pad
    if (left + width > vw - pad) {
      const leftSide = anchor.left - width - pad
      left = leftSide >= pad ? leftSide : pad
    }
    top = anchor.top
    if (top + height > vh - pad) {
      top = Math.max(pad, vh - pad - height)
    }
  } else {
    left = anchor.left
    if (left + width > vw - pad) left = vw - pad - width
    if (left < pad) left = pad
    top = anchor.bottom + pad
    if (top + height > vh - pad) {
      const above = anchor.top - pad - height
      top = above >= pad ? above : Math.max(pad, vh - pad - Math.min(height, vh - pad * 2))
    }
  }

  if (left + width > vw - pad) left = Math.max(pad, vw - pad - width)
  if (left < pad) left = pad
  if (top < pad) top = pad

  const space = vh - pad - top
  return {
    top,
    left,
    maxHeight: height > space ? Math.max(120, space) : undefined,
  }
}

export function useAnchoredMenuStyle(
  open: boolean,
  buttonRef: ElementRef,
  menuRef: ElementRef,
  prefer: MenuPrefer,
  /** When this changes, the menu re-measures (e.g. expanded sub-panel). */
  contentKey?: string | number | boolean,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({ top: 0, left: 0 })

  const place = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return
    const menu = menuRef.current
    const placed = placeFixedMenu(
      btn.getBoundingClientRect(),
      { width: menu?.offsetWidth ?? 220, height: menu?.scrollHeight ?? menu?.offsetHeight ?? 160 },
      prefer,
    )
    setStyle({
      top: placed.top,
      left: placed.left,
      maxHeight: placed.maxHeight,
    })
  }, [buttonRef, menuRef, prefer])

  useLayoutEffect(() => {
    if (!open) return
    place()
    const id = requestAnimationFrame(() => requestAnimationFrame(place))
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place, contentKey])

  return style
}
