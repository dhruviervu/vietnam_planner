export type GuidesModule = typeof import('./experienceGuides')

let guidesModule: GuidesModule | null = null
let guidesPromise: Promise<GuidesModule> | null = null

/** The guide text is several MB, so it ships as its own chunk. */
export function loadedExperienceGuides(): GuidesModule | null {
  return guidesModule
}

export function preloadExperienceGuides(): Promise<GuidesModule> {
  if (guidesModule) return Promise.resolve(guidesModule)
  guidesPromise ??= import('./experienceGuides').then(
    (mod) => (guidesModule = mod),
    (err) => {
      guidesPromise = null
      throw err
    },
  )
  return guidesPromise
}
