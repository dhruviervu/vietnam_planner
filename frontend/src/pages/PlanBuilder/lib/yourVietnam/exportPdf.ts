import { jsPDF } from 'jspdf'
import type { ItineraryItem, YourVietnamDay, YourVietnamTrip } from './types'

const PAGE = { w: 210, h: 297 }
const MARGIN = 16
const CONTENT_W = PAGE.w - MARGIN * 2
const BOTTOM = PAGE.h - 16

const INK = '#3a322c'
const MUTED = '#6e635a'
const TERRACOTTA = '#c45c3a'
const SAGE = '#7a8f72'
const CREAM = '#faf3e8'

function selectionLabel(state: string) {
  if (state === 'selected') return 'Selected'
  if (state === 'recommended') return 'Recommended'
  if (state === 'system') return 'Included'
  if (state === 'optional') return 'Optional · if time'
  return state
}

/**
 * Build a day-by-day A4 PDF and download it directly (no popup / print preview).
 */
export function exportYourVietnamPdf(trip: YourVietnamTrip) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const fileName = `Your-Vietnam-${trip.daysCount}-Day-Itinerary.pdf`

  drawCover(doc, trip)

  if (trip.days.length === 0) {
    doc.addPage()
    setFont(doc, 'normal', 11)
    doc.setTextColor(MUTED)
    doc.text('No days to export yet — add plans to your trip bag.', MARGIN, MARGIN + 20)
  } else {
    for (const day of trip.days) {
      doc.addPage()
      drawDay(doc, day)
    }
  }

  doc.addPage()
  drawSummary(doc, trip)

  doc.save(fileName)
}

function setFont(doc: jsPDF, style: 'normal' | 'bold' | 'italic', size: number) {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
}

function ensureSpace(doc: jsPDF, y: number, need: number): number {
  if (y + need <= BOTTOM) return y
  doc.addPage()
  return MARGIN + 8
}

function wrap(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text || '', maxWidth) as string[]
}

function drawCover(doc: jsPDF, trip: YourVietnamTrip) {
  // soft cream band
  doc.setFillColor(CREAM)
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F')

  let y = 42
  setFont(doc, 'bold', 9)
  doc.setTextColor(SAGE)
  doc.text('VIETNAM, CURATED', MARGIN, y)

  y += 14
  setFont(doc, 'bold', 28)
  doc.setTextColor(INK)
  doc.text('Your Vietnam', MARGIN, y)

  y += 10
  setFont(doc, 'normal', 11)
  doc.setTextColor(MUTED)
  const lede = wrap(
    doc,
    'A day-by-day itinerary of the places, experiences and logistics you selected — arranged morning to night.',
    CONTENT_W,
  )
  doc.text(lede, MARGIN, y)
  y += lede.length * 5.5 + 6

  setFont(doc, 'normal', 10)
  doc.setTextColor(INK)
  doc.text(`${trip.dateRangeLabel}  ·  ${trip.travellersLabel}`, MARGIN, y)
  y += 12

  const cards: [string, string][] = [
    [String(trip.daysCount), 'Days'],
    [String(trip.cityCount), 'Cities'],
    [String(trip.experienceCount + trip.activityCount), 'Experiences'],
    [String(trip.foodCount), 'Food stops'],
    [String(trip.transferCount), 'City transfers'],
    [`$${trip.cost.low}–$${trip.cost.high}`, 'Est. spend'],
  ]

  const cardW = (CONTENT_W - 8) / 3
  const cardH = 22
  cards.forEach(([value, label], i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = MARGIN + col * (cardW + 4)
    const cy = y + row * (cardH + 4)
    doc.setFillColor(255, 250, 242)
    doc.setDrawColor(58, 50, 44)
    doc.setLineWidth(0.2)
    doc.roundedRect(x, cy, cardW, cardH, 2, 2, 'FD')
    setFont(doc, 'bold', 14)
    doc.setTextColor(INK)
    doc.text(value, x + 4, cy + 9)
    setFont(doc, 'normal', 7)
    doc.setTextColor(MUTED)
    doc.text(label.toUpperCase(), x + 4, cy + 16)
  })
  y += 2 * (cardH + 4) + 10

  setFont(doc, 'bold', 9)
  doc.setTextColor(SAGE)
  doc.text('TRIP ROUTE', MARGIN, y)
  y += 7

  setFont(doc, 'normal', 10)
  doc.setTextColor(INK)
  if (trip.route.length === 0) {
    doc.setTextColor(MUTED)
    doc.text('Add experiences to shape your route.', MARGIN, y)
  } else {
    trip.route.forEach((r, i) => {
      const line = `${r.city} — ${r.nights} night${r.nights === 1 ? '' : 's'}, ${r.experiences} planned${
        i < trip.route.length - 1 ? '  →' : ''
      }`
      doc.text(line, MARGIN, y)
      y += 6
    })
  }

  y += 10
  setFont(doc, 'normal', 8)
  doc.setTextColor(MUTED)
  const note = wrap(
    doc,
    `Generated ${new Date(trip.generatedAt).toLocaleString()}. Timing is a planning rhythm, not a fixed timetable. Confirm live hours, bookings and prices before travel.`,
    CONTENT_W,
  )
  doc.text(note, MARGIN, y)
}

function drawDay(doc: jsPDF, day: YourVietnamDay) {
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F')

  let y = MARGIN

  setFont(doc, 'bold', 9)
  doc.setTextColor(TERRACOTTA)
  doc.text(`DAY ${day.day}`, MARGIN, y)

  y += 9
  setFont(doc, 'bold', 22)
  doc.setTextColor(INK)
  doc.text(day.city, MARGIN, y)

  y += 7
  setFont(doc, 'normal', 9)
  doc.setTextColor(MUTED)
  const meta = `${day.dateLabel}${day.theme ? `  ·  ${day.theme}` : ''}`
  const metaLines = wrap(doc, meta, CONTENT_W)
  doc.text(metaLines, MARGIN, y)
  y += metaLines.length * 4.5 + 2

  if (day.blurb) {
    setFont(doc, 'italic', 9)
    doc.setTextColor(MUTED)
    const blurb = wrap(doc, day.blurb, CONTENT_W)
    doc.text(blurb, MARGIN, y)
    y += blurb.length * 4.5 + 2
  }

  if (day.hotelName) {
    setFont(doc, 'bold', 9)
    doc.setTextColor(INK)
    doc.text(`Stay · ${day.hotelName}`, MARGIN, y)
    y += 5
  } else if (day.stayGap) {
    setFont(doc, 'bold', 9)
    doc.setTextColor(TERRACOTTA)
    doc.text('Stay not set', MARGIN, y)
    y += 5
  }

  setFont(doc, 'normal', 8)
  doc.setTextColor(MUTED)
  doc.text(
    `${day.experienceCount} plan${day.experienceCount === 1 ? '' : 's'} · ${day.foodCount} food · est. $${day.costs.total}`,
    MARGIN,
    y,
  )
  y += 4

  doc.setDrawColor(58, 50, 44)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
  y += 8

  for (const period of day.periods) {
    y = ensureSpace(doc, y, 16)
    setFont(doc, 'bold', 9)
    doc.setTextColor(SAGE)
    doc.text(period.label.toUpperCase(), MARGIN, y)
    setFont(doc, 'normal', 7)
    doc.setTextColor(MUTED)
    doc.text(period.windowLabel, MARGIN + CONTENT_W, y, { align: 'right' })
    y += 2
    doc.setDrawColor(58, 50, 44)
    doc.setLineWidth(0.15)
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
    y += 5

    if (period.items.length === 0) {
      y = ensureSpace(doc, y, 8)
      setFont(doc, 'italic', 9)
      doc.setTextColor(MUTED)
      doc.text(period.openNote ?? 'See experiences', MARGIN, y)
      y += 7
      continue
    }

    for (const item of period.items) {
      y = drawItem(doc, item, y)
    }
    y += 2
  }

  if (day.cityTransferOut) {
    y = ensureSpace(doc, y, 28)
    const unset = Boolean(day.cityTransferOut.unset)
    if (unset) doc.setFillColor(248, 232, 234)
    else doc.setFillColor(247, 239, 227)
    doc.roundedRect(MARGIN, y, CONTENT_W, 26, 2, 2, 'F')
    setFont(doc, 'bold', 7)
    doc.setTextColor(unset ? '#b84a58' : '#b87333')
    doc.text(unset ? 'CITY TRANSFER NOT SET' : 'CITY TRANSFER', MARGIN + 4, y + 6)
    setFont(doc, 'bold', 11)
    doc.setTextColor(INK)
    doc.text(`${day.city} → ${day.cityTransferOut.toCity}`, MARGIN + 4, y + 12)
    setFont(doc, 'normal', 8)
    doc.setTextColor(MUTED)
    doc.text(
      `${day.cityTransferOut.icon} ${day.cityTransferOut.modeLabel} · ${day.cityTransferOut.durationLabel}`,
      MARGIN + 4,
      y + 18,
    )
    const reason = wrap(doc, day.cityTransferOut.reason, CONTENT_W - 8)
    doc.text(reason[0] ?? '', MARGIN + 4, y + 23)
    y += 30
  }

  y = ensureSpace(doc, y, 10)
  doc.setDrawColor(58, 50, 44)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
  y += 5
  setFont(doc, 'bold', 9)
  doc.setTextColor(INK)
  doc.text(`Day ${day.day} cost ≈ $${day.costs.total}`, MARGIN, y)
  setFont(doc, 'normal', 8)
  doc.setTextColor(MUTED)
  doc.text('Rough estimate', MARGIN + CONTENT_W, y, { align: 'right' })
}

function drawItem(doc: jsPDF, item: ItineraryItem, y: number): number {
  const nameLines = wrap(doc, item.name, CONTENT_W - 8)
  const descLines = item.description ? wrap(doc, item.description, CONTENT_W - 8) : []
  const reasonLines = item.reason ? wrap(doc, item.reason, CONTENT_W - 8) : []
  const need =
    5 +
    nameLines.length * 4.5 +
    4 +
    descLines.length * 4 +
    reasonLines.length * 4 +
    8 +
    (item.transferAfter ? 8 : 0)

  y = ensureSpace(doc, y, Math.min(need, 40))

  setFont(doc, 'bold', 7)
  doc.setTextColor(
    item.selectionState === 'optional' || item.selectionState === 'recommended'
      ? SAGE
      : TERRACOTTA,
  )
  doc.text(selectionLabel(item.selectionState).toUpperCase(), MARGIN + 6, y)

  y += 4.5
  setFont(doc, 'bold', 11)
  doc.setTextColor(INK)
  doc.text(nameLines, MARGIN + 6, y)
  y += nameLines.length * 4.5

  setFont(doc, 'normal', 8)
  doc.setTextColor(MUTED)
  const meta = [
    item.timeLabel,
    item.durationLabel,
    item.locationLabel,
  ]
    .filter(Boolean)
    .join(' · ')
  if (meta) {
    doc.text(meta, MARGIN + 6, y)
    y += 4
  }

  if (descLines.length) {
    setFont(doc, 'normal', 8)
    doc.setTextColor(INK)
    // keep PDF readable — first 3 lines of description
    const clipped = descLines.slice(0, 3)
    doc.text(clipped, MARGIN + 6, y)
    y += clipped.length * 4
    if (descLines.length > 3) {
      setFont(doc, 'italic', 7)
      doc.setTextColor(MUTED)
      doc.text('…', MARGIN + 6, y)
      y += 3.5
    }
  }

  if (reasonLines.length) {
    setFont(doc, 'italic', 8)
    doc.setTextColor(SAGE)
    const clipped = reasonLines.slice(0, 2)
    doc.text(clipped, MARGIN + 6, y)
    y += clipped.length * 4
  }

  setFont(doc, 'normal', 8)
  doc.setTextColor(MUTED)
  const cost =
    (item.costUsd > 0 ? `≈ $${item.costUsd}` : 'Included / free') +
    (item.costBand ? ` · ${item.costBand}` : '')
  doc.text(cost, MARGIN + 6, y)
  y += 5

  if (item.transferAfter) {
    y = ensureSpace(doc, y, 8)
    doc.setDrawColor(122, 143, 114)
    doc.setLineWidth(0.6)
    doc.line(MARGIN + 6, y - 2, MARGIN + 6, y + 4)
    setFont(doc, 'normal', 7)
    doc.setTextColor(MUTED)
    doc.text(
      `${item.transferAfter.icon} ${item.transferAfter.mode} · ${item.transferAfter.durationLabel}`,
      MARGIN + 9,
      y + 2,
    )
    y += 7
  }

  doc.setDrawColor(58, 50, 44)
  doc.setLineWidth(0.1)
  doc.setLineDashPattern([0.8, 0.8], 0)
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
  doc.setLineDashPattern([], 0)
  y += 4
  return y
}

function drawSummary(doc: jsPDF, trip: YourVietnamTrip) {
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE.w, PAGE.h, 'F')

  let y = MARGIN + 4
  setFont(doc, 'bold', 16)
  doc.setTextColor(INK)
  doc.text('Trip cost summary', MARGIN, y)
  y += 12

  const rows: [string, string][] = [
    ['Accommodation', `$${trip.cost.categories.accommodation}`],
    ['Food', `$${trip.cost.categories.food}`],
    ['Transport', `$${trip.cost.categories.transport}`],
    ['Experiences', `$${trip.cost.categories.experiences}`],
    ['Shopping', `$${trip.cost.categories.shopping}`],
  ]

  for (const [label, value] of rows) {
    setFont(doc, 'normal', 10)
    doc.setTextColor(MUTED)
    doc.text(label, MARGIN, y)
    doc.setTextColor(INK)
    doc.text(value, MARGIN + CONTENT_W, y, { align: 'right' })
    y += 2
    doc.setDrawColor(58, 50, 44)
    doc.setLineWidth(0.1)
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
    y += 7
  }

  setFont(doc, 'bold', 12)
  doc.setTextColor(TERRACOTTA)
  doc.text('Rough total', MARGIN, y)
  doc.text(`$${trip.cost.low}–$${trip.cost.high}`, MARGIN + CONTENT_W, y, { align: 'right' })
  y += 8
  setFont(doc, 'normal', 8)
  doc.setTextColor(MUTED)
  doc.text('Rough planning estimate — not a booking quote.', MARGIN, y)
  y += 14

  if (trip.issues.length > 0) {
    setFont(doc, 'bold', 9)
    doc.setTextColor(SAGE)
    doc.text('TRIP CHECK', MARGIN, y)
    y += 7
    for (const iss of trip.issues.slice(0, 8)) {
      y = ensureSpace(doc, y, 12)
      setFont(doc, 'bold', 9)
      doc.setTextColor(INK)
      doc.text(iss.title, MARGIN, y)
      y += 4.5
      setFont(doc, 'normal', 8)
      doc.setTextColor(MUTED)
      const detail = wrap(doc, iss.detail, CONTENT_W)
      doc.text(detail.slice(0, 3), MARGIN, y)
      y += Math.min(detail.length, 3) * 4 + 4
    }
  }

  y = Math.max(y + 10, BOTTOM - 20)
  setFont(doc, 'normal', 7)
  doc.setTextColor(MUTED)
  doc.text('Vietnam, Curated · Your Vietnam day-by-day itinerary', MARGIN, y)
  doc.text(
    'Confirm availability, opening hours, provider terms and final prices before travel.',
    MARGIN,
    y + 4,
  )
}
