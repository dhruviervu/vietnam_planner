export function BuilderStageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-2/5 rounded-full bg-ink/8" />
      <div className="h-4 w-3/5 rounded-full bg-ink/6" />
      <div className="grid gap-4 pt-2 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-56 rounded-[22px] bg-ink/6" />
        ))}
      </div>
    </div>
  )
}
