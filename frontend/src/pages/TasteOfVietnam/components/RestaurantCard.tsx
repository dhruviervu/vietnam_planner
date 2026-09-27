import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTripStore } from '../../../store/tripStore'
import { priceSymbols } from '../data/restaurants'
import type { Restaurant } from '../data/types'
import {
  RESTAURANT_MEAL_OPTIONS,
  addRestaurantToItinerary,
  removeRestaurantFromItinerary,
  restaurantMealOpen,
  type RestaurantMealSlot,
} from '../lib/addRestaurantToItinerary'

function distanceLabel(km: number | null, hasTripContext: boolean) {
  if (!hasTripContext || km == null) return null
  if (km <= 1.4) return `${Math.max(8, Math.round(km * 12))} min walk`
  if (km <= 5.2) return `Short cab · ${km.toFixed(1)} km`
  return `${km.toFixed(1)} km away`
}

type Props = {
  restaurant: Restaurant
  dishName: string
  isTop?: boolean
  hasTripContext?: boolean
  eatHref?: string
  showListingLink?: boolean
}

function MealMenuPortal({
  open,
  menuId,
  top,
  left,
  width,
  selected,
  restaurantId,
  onPick,
  onRemove,
}: {
  open: boolean
  menuId: string
  top: number
  left: number
  width: number
  selected: RestaurantMealSlot | null
  restaurantId: string
  onPick: (meal: RestaurantMealSlot) => void
  onRemove?: () => void
}) {
  if (!open || typeof document === 'undefined') return null
  return createPortal(
    <div
      id={menuId}
      role="menu"
      className="fixed z-[80] overflow-hidden rounded-[12px] bg-paper py-1 shadow-[0_16px_40px_rgba(47,42,38,0.22)] ring-1 ring-ink/12"
      style={{ top, left, width: Math.max(width, 188) }}
    >
      {RESTAURANT_MEAL_OPTIONS.map((opt) => {
        const openSlot = restaurantMealOpen(restaurantId, opt.id)
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
              {openSlot ? opt.hint : 'Kitchen is closed at this sitting'}
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

export function RestaurantCard({
  restaurant: r,
  dishName,
  isTop = false,
  hasTripContext = false,
  eatHref,
  showListingLink = true,
}: Props) {
  const walk = distanceLabel(r.distanceKm, hasTripContext)
  const cityLabel = r.city === 'Ho Chi Minh City' ? 'HCMC' : r.city
  const selected = useTripStore((s) => s.selectedRestaurantIds.includes(r.id))
  const mealSlot = useTripStore((s) => s.restaurantMealSlots[r.id] ?? null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 188 })
  const btnRef = useRef<HTMLButtonElement>(null)

  function placeMenu() {
    const el = btnRef.current
    if (!el) return
    const box = el.getBoundingClientRect()
    const menuH = selected ? 196 : 156
    const openUp = window.innerHeight - box.bottom < menuH && box.top > menuH
    const width = Math.max(box.width, 188)
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
      const menu = document.getElementById(`meal-menu-${r.id}`)
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
  }, [menuOpen, r.id, selected])

  function pickMeal(meal: RestaurantMealSlot) {
    addRestaurantToItinerary(r.id, meal)
    setMenuOpen(false)
  }

  const mapsHref = r.mapUrl || r.listingUrl
  const ctaLabel = selected
    ? `Added · ${mealSlot ? mealSlot[0].toUpperCase() + mealSlot.slice(1) : 'Lunch'}`
    : 'Add to itinerary'

  return (
    <article className="relative flex flex-col overflow-visible rounded-[16px] bg-cream/50 ring-1 ring-ink/6">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[16px]">
        <img src={r.images[0]} alt={`${r.name} — ${dishName}`} className="h-full w-full object-cover" loading="lazy" />
        {isTop ? (
          <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper">
            Most reviewed
          </span>
        ) : (
          <span className="absolute left-2 top-2 rounded-full bg-ink/55 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper backdrop-blur-sm">
            {r.kind === 'local-table' ? 'Local table' : 'Traveller classic'}
          </span>
        )}
        <span className="absolute bottom-2 left-2 rounded-full bg-ink/55 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper backdrop-blur-sm">
          {dishName}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h4 className="font-serif text-[1.05rem] font-semibold leading-tight text-ink">{r.name}</h4>
        <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-terracotta">
          {cityLabel} · {r.neighborhood}
        </p>
        <p className="mt-1 text-[0.7rem] leading-snug text-muted">{r.address}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-semibold text-ink">
          <span>⭐ {r.rating.toFixed(1)}</span>
          <span className="text-muted">{r.reviewCount.toLocaleString()} reviews</span>
          <span className="text-muted">{priceSymbols(r.priceLevel)}</span>
          <span className="text-muted">{r.openingHours}</span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {r.servesAlcohol ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              Alcohol
            </span>
          ) : null}
          {r.allowsSmoking ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              Smoking
            </span>
          ) : null}
          {walk ? (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              {walk}
            </span>
          ) : (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[0.58rem] font-bold text-ink/70">
              {r.region} Vietnam
            </span>
          )}
        </div>

        <p className="mt-2.5 text-[0.78rem] font-medium leading-snug text-ink/85">{r.menuOrReviews}</p>

        <div className="relative mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          {showListingLink ? (
            eatHref ? (
              <Link
                to={eatHref}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-terracotta/90 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
              >
                Show restaurants →
              </Link>
            ) : (
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-terracotta/90 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
              >
                See on Google Maps
              </a>
            )
          ) : (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-terracotta/90 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
            >
              See on Google Maps
            </a>
          )}
          <button
            ref={btnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => {
              placeMenu()
              setMenuOpen((v) => !v)
            }}
            className={`inline-flex shrink-0 items-center rounded-[3px] px-2.5 py-1.5 text-[0.72rem] font-bold transition ${
              selected
                ? 'bg-[#3d8b4f] text-paper shadow-[0_6px_14px_rgba(61,139,79,0.28)]'
                : 'bg-terracotta text-paper hover:brightness-105'
            }`}
          >
            {ctaLabel}
            <span className="ml-1 text-[0.58rem]" aria-hidden>
              ▾
            </span>
          </button>
          <MealMenuPortal
            open={menuOpen}
            menuId={`meal-menu-${r.id}`}
            top={menuPos.top}
            left={menuPos.left}
            width={menuPos.width}
            selected={selected ? mealSlot ?? 'lunch' : null}
            restaurantId={r.id}
            onPick={pickMeal}
            onRemove={
              selected
                ? () => {
                    removeRestaurantFromItinerary(r.id)
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
