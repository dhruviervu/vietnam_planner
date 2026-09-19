import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { stepPath } from '../steps'
import { getExperienceById } from '../data/experiences'
import { getActivityById, getActivityImages } from '../data/activities'
import { getExperienceImages } from '../lib/pricing'
import { onTripBagPop, registerTripBag } from '../lib/tripBagTarget'
import { TripBagItem } from './TripBagItem'

type Props = {
  mobileOpen?: boolean
  onToggleMobile?: () => void
}

type BagEntry =
  | {
      kind: 'experience'
      id: string
      name: string
      city: string
      durationLabel: string
      image: string
    }
  | {
      kind: 'activity'
      id: string
      name: string
      city: string
      durationLabel: string
      image: string
    }

export function TripBag({ mobileOpen = false, onToggleMobile }: Props) {
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const selectedActivityIds = useTripStore((s) => s.selectedActivityIds)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const [expanded, setExpanded] = useState(false)
  const [popping, setPopping] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const uniqueExperienceIds = useMemo(
    () => [...new Set(selectedIds.filter(Boolean))],
    [selectedIds],
  )
  const uniqueActivityIds = useMemo(
    () => [...new Set(selectedActivityIds.filter(Boolean))],
    [selectedActivityIds],
  )

  const bagItems = useMemo((): BagEntry[] => {
    const experiences: BagEntry[] = uniqueExperienceIds.flatMap((id) => {
      const e = getExperienceById(id)
      if (!e) return []
      return [
        {
          kind: 'experience' as const,
          id: e.id,
          name: e.name,
          city: e.city,
          durationLabel: e.durationLabel,
          image: getExperienceImages(e)[0],
        },
      ]
    })
    const activities: BagEntry[] = uniqueActivityIds.flatMap((id) => {
      const a = getActivityById(id)
      if (!a) return []
      return [
        {
          kind: 'activity' as const,
          id: a.id,
          name: a.name,
          city: a.cityName,
          durationLabel: a.durationLabel,
          image: getActivityImages(a)[0],
        },
      ]
    })
    return [...experiences, ...activities]
  }, [uniqueExperienceIds, uniqueActivityIds])

  const totalCount = uniqueExperienceIds.length + uniqueActivityIds.length
  const regionSummary = [...new Set(bagItems.map((e) => e.city))].slice(0, 4).join(' · ')

  useEffect(() => {
    registerTripBag(anchorRef.current)
    return () => registerTripBag(null)
  }, [])

  useEffect(() => {
    return onTripBagPop(() => {
      setPopping(true)
      window.setTimeout(() => setPopping(false), 380)
    })
  }, [])

  function openItem(item: BagEntry) {
    const path =
      item.kind === 'activity'
        ? `/plan/builder/activity/${item.id}`
        : `/plan/builder/experience/${item.id}`
    window.open(path, '_blank', 'noopener,noreferrer')
  }

  function removeItem(item: BagEntry) {
    if (item.kind === 'activity') removeActivity(item.id)
    else removeExperience(item.id)
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 p-3 backdrop-blur-md xl:hidden">
        <button
          type="button"
          onClick={onToggleMobile}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-2.5 text-left"
        >
          <div className="flex items-center gap-3">
            <BagGlyph count={totalCount} popping={popping} />
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-sage">
                Trip bag
              </p>
              <p className="font-serif text-[1rem] font-semibold text-ink">
                {totalCount} item{totalCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <span className="text-muted">{mobileOpen ? '▾' : '▴'}</span>
        </button>
        <div
          className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            gridTemplateRows: mobileOpen ? '1fr' : '0fr',
            opacity: mobileOpen ? 1 : 0,
          }}
        >
          <div className="max-h-[55vh] overflow-hidden">
            <div className="overflow-y-auto pt-3">
              <BagList
                items={bagItems}
                regionSummary={regionSummary}
                onRemove={removeItem}
                onOpen={openItem}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: stays pinned to the viewport so left-filter collapse never shifts it. */}
      <div className="hidden w-[4.75rem] shrink-0 xl:block" aria-hidden />
      <aside className="pointer-events-none fixed right-3 top-[88px] z-30 hidden xl:block">
        <div
          className={`pointer-events-auto overflow-hidden rounded-[22px] border border-ink/8 bg-paper/95 shadow-soft backdrop-blur-md transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            expanded ? 'w-[17.5rem]' : 'w-[4.75rem]'
          }`}
        >
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={`flex w-full items-center gap-3 px-2.5 py-2.5 text-left ${
              expanded ? 'pr-3' : 'justify-center'
            }`}
          >
            <div ref={anchorRef}>
              <BagGlyph count={totalCount} popping={popping} />
            </div>
            <span
              className={`min-w-0 flex-1 overflow-hidden transition-[opacity,max-width] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                expanded ? 'max-w-[12rem] opacity-100' : 'max-w-0 opacity-0'
              }`}
            >
              <span className="block truncate font-serif text-[1.02rem] font-semibold text-ink">
                Trip bag
              </span>
              <span className="block truncate text-[0.7rem] font-bold uppercase tracking-wide text-muted">
                {totalCount === 0 ? 'Empty' : `${totalCount} saved`}
              </span>
            </span>
          </button>

          <div
            className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              gridTemplateRows: expanded ? '1fr' : '0fr',
              opacity: expanded ? 1 : 0,
            }}
          >
            <div className="overflow-hidden">
              <div className="max-h-[min(70vh,32rem)] overflow-y-auto border-t border-ink/8 px-3 pb-3 pt-2">
                <BagList
                  items={bagItems}
                  regionSummary={regionSummary}
                  onRemove={removeItem}
                  onOpen={openItem}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function BagGlyph({ count, popping }: { count: number; popping: boolean }) {
  return (
    <span
      className={`relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cream to-terracotta/15 ring-1 ring-terracotta/20 transition-transform ${
        popping ? 'scale-110' : ''
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c45c3a" strokeWidth="1.7">
        <rect x="4" y="8" width="16" height="12" rx="2.5" />
        <path d="M8 8V6.5C8 4.57 9.57 3 11.5 3h1C14.43 3 16 4.57 16 6.5V8" />
      </svg>
      <span className="absolute -bottom-1 -right-1 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-terracotta px-1 text-[0.62rem] font-bold leading-none text-paper">
        {count}
      </span>
    </span>
  )
}

function BagList({
  items,
  regionSummary,
  onRemove,
  onOpen,
}: {
  items: BagEntry[]
  regionSummary: string
  onRemove: (item: BagEntry) => void
  onOpen: (item: BagEntry) => void
}) {
  if (items.length === 0) {
    return (
      <p className="px-1 py-2 text-[0.8rem] leading-snug text-muted">
        Add sights as you browse. They wait here until you shape the days.
      </p>
    )
  }

  return (
    <>
      {regionSummary ? (
        <p className="mb-2 truncate text-[0.72rem] text-muted">{regionSummary}</p>
      ) : null}
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <TripBagItem
              key={`${item.kind}-${item.id}`}
              item={item}
              onRemove={() => onRemove(item)}
              onOpen={() => onOpen(item)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <Link
        to={stepPath('itinerary')}
        className="mt-3 flex w-full items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-4 py-2 text-[0.8rem] font-bold text-paper"
      >
        View itinerary
      </Link>
    </>
  )
}
