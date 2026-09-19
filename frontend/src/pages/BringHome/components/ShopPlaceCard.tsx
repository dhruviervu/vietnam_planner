import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTripStore } from '../../../store/tripStore'
import type { ShopCity, ShoppingDestination } from '../data/types'
import { crowdDots } from '../data/destinations'
import {
  SHOP_PERIOD_OPTIONS,
  addShopToItinerary,
  removeShopFromItinerary,
  shopPeriodOpen,
  type ShopPeriodSlot,
} from '../lib/addShopToItinerary'

type Props = {
  destination: ShoppingDestination
  rank: number
  cityScope: ShopCity | 'All'
}

function PeriodMenuPortal({
  open,
  menuId,
  top,
  left,
  width,
  selected,
  shopId,
  onPick,
  onRemove,
}: {
  open: boolean
  menuId: string
  top: number
  left: number
  width: number
  selected: ShopPeriodSlot | null
  shopId: string
  onPick: (period: ShopPeriodSlot) => void
  onRemove?: () => void
}) {
  if (!open || typeof document === 'undefined') return null
  return createPortal(
    <div
      id={menuId}
      role="menu"
      className="fixed z-[80] overflow-hidden rounded-[12px] bg-paper py-1 shadow-[0_16px_40px_rgba(47,42,38,0.22)] ring-1 ring-ink/12"
      style={{ top, left, width: Math.max(width, 200) }}
    >
      {SHOP_PERIOD_OPTIONS.map((opt) => {
        const openSlot = shopPeriodOpen(shopId, opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            role="menuitem"
            disabled={!openSlot}
            onClick={() => openSlot && onPick(opt.id)}
            className={`flex w-full flex-col px-3 py-2 text-left ${
              !openSlot
                ? 'cursor-not-allowed opacity-40'
                : selected === opt.id
                  ? 'bg-terracotta/12 hover:bg-terracotta/10'
                  : 'hover:bg-terracotta/10'
            }`}
          >
            <span className="text-[0.78rem] font-bold text-ink">
              {opt.label}
              {!openSlot ? ' · closed' : ''}
            </span>
            <span className="text-[0.65rem] text-muted">
              {openSlot ? opt.hint : 'Not open in this window'}
            </span>
          </button>
        )
      })}
      {onRemove && selected ? (
        <button
          type="button"
          role="menuitem"
          onClick={onRemove}
          className="mt-0.5 w-full border-t border-ink/8 px-3 py-2 text-left text-[0.75rem] font-bold text-terracotta hover:bg-terracotta/10"
        >
          Remove from itinerary
        </button>
      ) : null}
    </div>,
    document.body,
  )
}

export function ShopPlaceCard({ destination: d, rank, cityScope }: Props) {
  const itineraryId = d.itineraryId ?? d.id
  const selected = useTripStore((s) => s.selectedShoppingIds.includes(itineraryId))
  const slot = useTripStore((s) => (s.itinerarySlotOverrides[itineraryId] as ShopPeriodSlot | undefined) ?? null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 200 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const cityLabel = d.city === 'Ho Chi Minh City' ? 'HCMC' : d.city
  const rankCity =
    cityScope === 'All' ? null : cityScope === 'Ho Chi Minh City' ? 'HCMC' : cityScope

  function placeMenu() {
    const el = btnRef.current
    if (!el) return
    const box = el.getBoundingClientRect()
    const menuH = selected ? 250 : 210
    const openUp = window.innerHeight - box.bottom < menuH && box.top > menuH
    const width = Math.max(box.width, 200)
    const left = Math.min(Math.max(8, box.right - width), window.innerWidth - width - 8)
    setMenuPos({
      top: openUp ? box.top - menuH - 6 : box.bottom + 6,
      left,
      width,
    })
  }

  useEffect(() => {
    if (!menuOpen) return
    placeMenu()
    function onDoc(e: MouseEvent) {
      const node = e.target as Node
      if (btnRef.current?.contains(node)) return
      const menu = document.getElementById(`shop-menu-${itineraryId}`)
      if (menu?.contains(node)) return
      setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    function onReposition() {
      placeMenu()
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [menuOpen, itineraryId, selected])

  const ctaLabel = selected
    ? `Added · ${slot ? slot[0].toUpperCase() + slot.slice(1) : 'Day'}`
    : 'Add to itinerary'

  return (
    <article className="group flex flex-col overflow-hidden rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/6 transition hover:-translate-y-0.5 hover:ring-terracotta/25">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={d.images[0]}
          alt={d.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,22,18,0.08) 30%, rgba(28,22,18,0.72) 100%)',
          }}
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-terracotta px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-paper shadow-soft">
          {rankCity ? `#${rank} in ${rankCity}` : `Ranked #${rank}`}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-paper/90 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-ink backdrop-blur-sm">
          {d.type}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h4 className="font-serif text-[1.12rem] font-semibold leading-tight text-paper drop-shadow">
            {d.name}
          </h4>
          <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-paper/80">
            {cityLabel} · {d.area}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-semibold text-ink">
          <span>⭐ {d.rating.toFixed(1)}</span>
          <span className="text-muted">{d.priceRange}</span>
          <span className="text-muted">{d.openingHours}</span>
        </div>

        <p className="mt-2 text-[0.68rem] font-semibold text-ink/80">
          <span className="text-[0.55rem] font-bold uppercase tracking-[0.08em] text-muted">
            Best for ·{' '}
          </span>
          {d.bestForLabels.join(' · ')}
        </p>

        <p className="mt-2.5 text-[0.8rem] font-medium leading-relaxed text-ink/85">{d.whyRecommended}</p>
        {d.valueNote && rank === 1 ? (
          <p className="mt-1 text-[0.72rem] font-semibold text-terracotta">{d.valueNote}</p>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Signal label={`${d.crowdType} crowd`} value={`${crowdDots(d.crowdLevel)} ${d.crowdLabel}`} />
          <Signal label="Value" value={d.valueLevel} />
          <Signal label="Bargaining" value={d.bargaining} />
          <Signal label="Tourist friendly" value={d.touristFriendly} />
        </div>

        {d.crowdBusyPeriod ? (
          <p className="mt-1.5 text-[0.65rem] text-muted">Busy · {d.crowdBusyPeriod}</p>
        ) : null}

        <div className="relative mt-auto flex gap-1.5 pt-3.5">
          <a
            href={d.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-sage/45 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-ink transition hover:-translate-y-0.5"
          >
            Maps →
          </a>
          <button
            ref={btnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => {
              placeMenu()
              setMenuOpen((v) => !v)
            }}
            className={`flex-1 rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold transition hover:-translate-y-0.5 ${
              selected ? 'bg-sage text-paper' : 'bg-terracotta text-paper'
            }`}
          >
            {ctaLabel}
            <span className="ml-1 text-[0.58rem]" aria-hidden>
              ▾
            </span>
          </button>
          <PeriodMenuPortal
            open={menuOpen}
            menuId={`shop-menu-${itineraryId}`}
            top={menuPos.top}
            left={menuPos.left}
            width={menuPos.width}
            selected={selected ? slot ?? 'afternoon' : null}
            shopId={itineraryId}
            onPick={(period) => {
              addShopToItinerary(itineraryId, period)
              setMenuOpen(false)
            }}
            onRemove={
              selected
                ? () => {
                    removeShopFromItinerary(itineraryId)
                    setMenuOpen(false)
                  }
                : undefined
            }
          />
        </div>
      </div>
    </article>
  )
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-cream/80 px-2 py-1.5">
      <p className="text-[0.52rem] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-0.5 text-[0.7rem] font-bold leading-snug text-ink">{value}</p>
    </div>
  )
}
