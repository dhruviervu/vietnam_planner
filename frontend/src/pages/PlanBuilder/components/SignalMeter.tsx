import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'
import type { SignalLevel, SignalTone, TripSignal } from '../types'

const TONE_DOT: Record<SignalTone, string> = {
  favorable: 'bg-sage',
  moderate: 'bg-[#d4a84b]',
  elevated: 'bg-terracotta',
  challenging: 'bg-[#b54a3c]',
}

const TONE_TEXT: Record<SignalTone, string> = {
  favorable: 'text-sage',
  moderate: 'text-[#b8892f]',
  elevated: 'text-terracotta',
  challenging: 'text-[#b54a3c]',
}

export function SignalDots({
  level,
  tone,
  max = 5,
}: {
  level: SignalLevel
  tone: SignalTone
  max?: number
}) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <motion.span
          key={i}
          layout
          className={`h-2 w-2 rounded-full ${
            i < level ? TONE_DOT[tone] : 'bg-ink/12'
          }`}
          initial={false}
          animate={{ scale: i < level ? 1 : 0.85, opacity: i < level ? 1 : 0.45 }}
          transition={{ duration: 0.25, delay: i * 0.03 }}
        />
      ))}
    </div>
  )
}

type RowProps = {
  signal: TripSignal
  onSelect?: () => void
  active?: boolean
}

export function SignalRow({ signal, onSelect, active }: RowProps) {
  const className = `flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
    active ? 'bg-cream-deep' : onSelect ? 'hover:bg-cream' : 'bg-transparent'
  }`

  const body = (
    <>
      <span className="text-lg leading-none" aria-hidden="true">
        {signal.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.78rem] font-bold uppercase tracking-wide text-muted">
            {signal.label}
          </p>
          <SignalDots level={signal.level} tone={signal.tone} />
        </div>
        <p className={`mt-1 text-[0.95rem] font-semibold ${TONE_TEXT[signal.tone]}`}>
          {signal.valueLabel}
        </p>
        {signal.detail && (
          <p className="mt-0.5 text-[0.75rem] text-muted">{signal.detail}</p>
        )}
      </div>
    </>
  )

  if (onSelect) {
    const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
      type: 'button',
      onClick: onSelect,
      className,
    }
    return <button {...buttonProps}>{body}</button>
  }

  return <div className={className}>{body}</div>
}
