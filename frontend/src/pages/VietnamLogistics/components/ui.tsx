import type { ReactNode, ButtonHTMLAttributes } from 'react'

/** Primary = filled accent when selected */
export function ctlPrimary(active: boolean) {
  return active
    ? 'bg-terracotta text-paper'
    : 'bg-transparent text-ink/80 hover:text-ink hover:bg-ink/[0.04]'
}

/** Secondary = quiet outline / soft fill */
export function ctlSecondary(active: boolean) {
  return active
    ? 'bg-ink text-paper'
    : 'text-ink/75 hover:text-ink hover:bg-ink/[0.04]'
}

type SegProps<T extends string> = {
  options: { id: T; label: ReactNode }[]
  value: T | null
  onChange: (id: T) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'primary',
}: SegProps<T>) {
  const pad =
    size === 'lg'
      ? 'px-3.5 py-2 text-[0.8rem]'
      : size === 'sm'
        ? 'px-2.5 py-1.5 text-[0.68rem]'
        : 'px-3 py-1.5 text-[0.74rem]'

  return (
    <div
      role="tablist"
      className="inline-flex flex-wrap gap-0.5 rounded-[4px] bg-ink/[0.04] p-0.5"
    >
      {options.map((opt) => {
        const active = value === opt.id
        const style = variant === 'primary' ? ctlPrimary(active) : ctlSecondary(active)
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`${pad} rounded-[3px] font-bold tracking-[-0.01em] transition-colors ${style}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function ChipButton({
  active,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-[3px] px-2.5 py-1.5 text-[0.72rem] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${ctlPrimary(!!active)} ${className}`}
    />
  )
}

export function SectionIntro({
  id,
  n,
  title,
  support,
}: {
  id: string
  n: string
  title: string
  support?: string
}) {
  return (
    <header id={id} className="scroll-mt-28">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-terracotta">
        {n}
      </p>
      <h2 className="mt-1 font-serif text-[1.35rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.5rem]">
        {title}
      </h2>
      {support ? (
        <p className="mt-1 max-w-[58ch] text-[0.78rem] leading-snug text-muted">{support}</p>
      ) : null}
    </header>
  )
}

export function Rule() {
  return <div className="h-px w-full bg-ink/10" aria-hidden />
}

export function SoftBand({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`bg-ink/[0.03] px-3.5 py-3 sm:px-4 ${className}`}>{children}</div>
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted">{children}</p>
  )
}

export function BlockTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-serif text-[1.45rem] font-bold tracking-[-0.03em] text-ink sm:text-[1.7rem]">
      {children}
    </h3>
  )
}
