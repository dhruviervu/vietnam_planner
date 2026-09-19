import { useEffect, useState, type ImgHTMLAttributes } from 'react'

/** Last-resort photo that is a real landscape (never an empty cream box). */
export const GLOBAL_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallbacks?: string[]
}

export function ContentImage({ src, fallbacks = [], alt, onError, ...rest }: Props) {
  const chain = [src, ...fallbacks, GLOBAL_IMAGE_FALLBACK].filter(
    (u, i, all): u is string => Boolean(u) && all.indexOf(u) === i,
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [src, fallbacks.join('|')])

  const current = chain[Math.min(index, chain.length - 1)]

  return (
    <img
      {...rest}
      src={current}
      alt={alt ?? ''}
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (index < chain.length - 1) setIndex((n) => n + 1)
        onError?.(e)
      }}
    />
  )
}
