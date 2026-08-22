import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { getHotelById, hotelImages } from '../data/hotels'
import {
  captureStayCompareScroll,
  saveStayCompareViewState,
} from '../lib/stayCompareViewState'

type Props = {
  /** When false, panel is hidden but comparison selection remains */
  visible: boolean
  onClose: () => void
  onOpen?: () => void
}

export function StayCompareMiniPanel({ visible, onClose, onOpen }: Props) {
  const comparisonStayIds = useTripStore((s) => s.comparisonStayIds)
  const clearComparison = useTripStore((s) => s.clearComparison)
  const removeComparisonStay = useTripStore((s) => s.removeComparisonStay)

  const thumbs = useMemo(
    () =>
      comparisonStayIds
        .map((id) => getHotelById(id))
        .filter(Boolean)
        .map((h) => ({ id: h!.id, name: h!.name, img: hotelImages(h!)[0] })),
    [comparisonStayIds],
  )

  const count = comparisonStayIds.length
  const canOpen = count >= 2

  function openComparison() {
    if (!canOpen) return
    captureStayCompareScroll()
    saveStayCompareViewState({
      compareIds: comparisonStayIds,
      scrollY: window.scrollY,
      restoreScroll: false,
    })
    onOpen?.()
    window.open(
      `/plan/builder/stay/compare?ids=${comparisonStayIds.join(',')}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="rounded-[18px] border border-ink/6 bg-paper/90 p-3.5 shadow-soft backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Compare stays{count > 0 ? ` · ${count}` : ''}
          </p>
          {count === 0 && (
            <p className="mt-1 text-[0.8rem] leading-snug text-muted">
              Add at least 2 stays to compare.
            </p>
          )}
          {count === 1 && (
            <p className="mt-1 text-[0.8rem] leading-snug text-terracotta">
              Select one more stay to open comparison.
            </p>
          )}
          {canOpen && (
            <p className="mt-1 text-[0.8rem] leading-snug text-muted">
              Active shortlist — ready to evaluate.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-0.5 text-[0.72rem] font-bold text-muted hover:bg-cream hover:text-ink"
          title="Hide panel (keeps selection)"
        >
          Close
        </button>
      </div>

      {thumbs.length > 0 && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {thumbs.map((t) => (
            <div key={t.id} className="relative shrink-0">
              <img
                src={t.img}
                alt={t.name}
                className="h-11 w-11 rounded-lg object-cover ring-1 ring-ink/8"
              />
              <button
                type="button"
                onClick={() => removeComparisonStay(t.id)}
                className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-ink text-[0.55rem] font-bold text-paper"
                aria-label={`Remove ${t.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canOpen ? (
          <button
            type="button"
            onClick={openComparison}
            className="rounded-full bg-ink px-3.5 py-2 text-[0.78rem] font-bold text-paper"
          >
            Open Comparison →
          </button>
        ) : (
          <span className="rounded-full bg-cream px-3 py-1.5 text-[0.72rem] font-bold text-muted">
            Need {Math.max(0, 2 - count)} more
          </span>
        )}
        {count > 0 && (
          <button
            type="button"
            onClick={() => clearComparison()}
            className="text-[0.75rem] font-bold text-terracotta hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function StayCompareMiniPanelSlot({
  visible,
  onClose,
  onOpen,
}: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <StayCompareMiniPanel visible={visible} onClose={onClose} onOpen={onOpen} />
      )}
    </AnimatePresence>
  )
}
