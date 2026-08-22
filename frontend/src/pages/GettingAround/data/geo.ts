/** SVG arc helpers used outside map projection (kept for tests / reuse). */
export function curvedConnection(
  a: [number, number],
  b: [number, number],
  segments = 48,
): [number, number][] {
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const midLng = (lng1 + lng2) / 2
  const midLat = (lat1 + lat2) / 2
  const dx = lng2 - lng1
  const dy = lat2 - lat1
  const dist = Math.hypot(dx, dy) || 1
  const bulge = Math.min(2.2, dist * 0.22)
  const nx = -dy / dist
  const ny = dx / dist
  const cLng = midLng + nx * bulge
  const cLat = midLat + ny * bulge

  const pts: [number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const u = 1 - t
    const lng = u * u * lng1 + 2 * u * t * cLng + t * t * lng2
    const lat = u * u * lat1 + 2 * u * t * cLat + t * t * lat2
    pts.push([lng, lat])
  }
  return pts
}
