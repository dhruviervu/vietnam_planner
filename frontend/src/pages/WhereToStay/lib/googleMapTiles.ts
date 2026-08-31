/** Google Maps roadmap tiles (Leaflet). */
export const GOOGLE_ROADMAP_TILES = {
  url: 'https://{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] as string[],
  attribution: '&copy; <a href="https://maps.google.com/">Google</a>',
  maxZoom: 20,
}

/** Hybrid satellite + labels — closest to the Your Vietnam trip-bag map. */
export const GOOGLE_HYBRID_TILES = {
  url: 'https://{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] as string[],
  attribution: '&copy; <a href="https://maps.google.com/">Google</a>',
  maxZoom: 20,
}
