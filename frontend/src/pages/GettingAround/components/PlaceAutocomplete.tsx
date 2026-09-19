import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  matchLocalPlaces,
  mergeSuggestions,
  searchPlaceSuggestions,
  type AutocompleteLocalPlace,
  type PlaceSuggestion,
} from '../lib/placeSuggestions'

type Props = {
  title: string
  value: string
  placeholder: string
  bias: { lat: number; lng: number; cityLabel: string }
  localPlaces: AutocompleteLocalPlace[]
  error?: string | null
  onChange: (value: string) => void
  onSelect: (hit: PlaceSuggestion) => void
  onClear: () => void
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <span className="font-extrabold text-ink">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  )
}

function sourceGlyph(hit: PlaceSuggestion) {
  if (hit.source === 'bag') return '★'
  if (hit.source === 'landmark') return '📍'
  return '⌕'
}

export function PlaceAutocomplete({
  title,
  value,
  placeholder,
  bias,
  localPlaces,
  error,
  onChange,
  onSelect,
  onClear,
}: Props) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [remote, setRemote] = useState<PlaceSuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuBox, setMenuBox] = useState<{
    top: number
    left: number
    width: number
    maxHeight: number
  } | null>(null)

  const localHits = useMemo(
    () => matchLocalPlaces(value, localPlaces, value.trim() ? 6 : 8),
    [value, localPlaces],
  )

  const suggestions = useMemo(
    () => mergeSuggestions(localHits, remote, value, 8),
    [localHits, remote, value],
  )

  function updateMenuBox() {
    const el = inputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - 12
    const spaceAbove = rect.top - 12
    const maxHeight = Math.min(320, Math.max(160, spaceBelow >= 180 ? spaceBelow : spaceAbove))
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow
    setMenuBox({
      top: openUp ? Math.max(8, rect.top - maxHeight - 6) : rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 260),
      maxHeight,
    })
  }

  useEffect(() => {
    if (!open) return
    updateMenuBox()
    const onWin = () => updateMenuBox()
    window.addEventListener('resize', onWin)
    window.addEventListener('scroll', onWin, true)
    return () => {
      window.removeEventListener('resize', onWin)
      window.removeEventListener('scroll', onWin, true)
    }
  }, [open, suggestions.length, loading])

  useEffect(() => {
    if (!open) return
    const q = value.trim()
    if (q.length < 2) {
      setRemote([])
      setLoading(false)
      setFailed(false)
      return
    }
    const ac = new AbortController()
    setLoading(true)
    setFailed(false)
    const timer = window.setTimeout(() => {
      searchPlaceSuggestions(q, bias, ac.signal)
        .then((hits) => {
          if (ac.signal.aborted) return
          setRemote(hits)
          setFailed(false)
        })
        .catch(() => {
          if (ac.signal.aborted) return
          setRemote([])
          setFailed(true)
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false)
        })
    }, 280)
    return () => {
      ac.abort()
      window.clearTimeout(timer)
    }
  }, [value, open, bias.lat, bias.lng, bias.cityLabel])

  useEffect(() => {
    setActiveIndex(0)
  }, [suggestions.map((s) => s.id).join('|')])

  function pick(hit: PlaceSuggestion) {
    onSelect(hit)
    setOpen(false)
    setRemote([])
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setActiveIndex((i) => (suggestions.length ? (i + 1) % suggestions.length : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return
      setActiveIndex((i) =>
        suggestions.length ? (i - 1 + suggestions.length) % suggestions.length : 0,
      )
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (open && suggestions[activeIndex]) pick(suggestions[activeIndex])
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  const showMenu = open && Boolean(menuBox)
  const emptyQuery = !value.trim()
  const noHits = !loading && suggestions.length === 0 && !emptyQuery

  return (
    <label className="block">
      <span className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted">{title}</span>
      <div className="relative mt-0.5">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showMenu}
          aria-controls={listId}
          aria-activedescendant={
            showMenu && suggestions[activeIndex] ? `${listId}-${suggestions[activeIndex].id}` : undefined
          }
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            const next = e.target.value
            onChange(next)
            setOpen(true)
            if (!next.trim()) onClear()
          }}
          onFocus={() => {
            setOpen(true)
            updateMenuBox()
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 140)
          }}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-[10px] border-0 bg-cream/80 py-1.5 pl-2 pr-8 text-[0.78rem] font-semibold text-ink ring-1 ${
            error ? 'ring-terracotta/50' : 'ring-ink/10 focus:ring-terracotta/40'
          }`}
        />
        {value ? (
          <button
            type="button"
            aria-label={`Clear ${title}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('')
              onClear()
              setRemote([])
              inputRef.current?.focus()
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-1.5 text-[0.85rem] font-bold text-muted hover:text-ink"
          >
            ×
          </button>
        ) : null}
      </div>

      {showMenu && menuBox && typeof document !== 'undefined'
        ? createPortal(
            <div
              id={listId}
              role="listbox"
              className="fixed z-[5000] flex flex-col overflow-hidden rounded-[14px] bg-paper shadow-[0_18px_40px_rgba(47,42,38,0.22)] ring-1 ring-ink/12"
              style={{
                top: menuBox.top,
                left: menuBox.left,
                width: menuBox.width,
                maxHeight: menuBox.maxHeight,
              }}
            >
              <ul className="min-h-0 flex-1 overflow-y-auto py-1">
                {suggestions.map((hit, index) => {
                  const active = index === activeIndex
                  return (
                    <li key={hit.id} role="presentation">
                      <button
                        type="button"
                        id={`${listId}-${hit.id}`}
                        role="option"
                        aria-selected={active}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(hit)}
                        className={`flex w-full items-start gap-2.5 px-3 py-2 text-left ${
                          active ? 'bg-terracotta/10' : 'hover:bg-cream/80'
                        }`}
                      >
                        <span className="mt-0.5 w-4 shrink-0 text-center text-[0.85rem] text-terracotta">
                          {sourceGlyph(hit)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.8rem] font-semibold text-ink">
                            <Highlight text={hit.title} query={value} />
                          </span>
                          {hit.subtitle ? (
                            <span className="mt-0.5 block truncate text-[0.68rem] text-muted">
                              {hit.subtitle}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 shrink-0 text-[0.58rem] font-bold uppercase tracking-wide text-muted">
                          {hit.kind}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {loading ? (
                <p className="border-t border-ink/8 px-3 py-2 text-[0.68rem] text-muted">
                  Searching places…
                </p>
              ) : failed && suggestions.length === 0 ? (
                <p className="border-t border-ink/8 px-3 py-2 text-[0.68rem] text-muted">
                  Place search is unavailable. Try a landmark from the list below.
                </p>
              ) : noHits ? (
                <p className="px-3 py-2.5 text-[0.72rem] text-muted">
                  No places found. Try a street, hotel, or landmark.
                </p>
              ) : emptyQuery && suggestions.length === 0 ? (
                <p className="px-3 py-2.5 text-[0.72rem] text-muted">
                  Type any place — streets, hotels, and sights are all fair game.
                </p>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </label>
  )
}
