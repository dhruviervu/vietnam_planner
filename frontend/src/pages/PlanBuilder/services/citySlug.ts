/** URL slugs for cities — keep this file free of the sight catalog. */

export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function cityAnchorId(city: string): string {
  return `city-${cityToSlug(city)}`
}

export function experiencesCityPath(city: string): string {
  return `/plan/builder/experiences/city/${cityToSlug(city)}`
}
