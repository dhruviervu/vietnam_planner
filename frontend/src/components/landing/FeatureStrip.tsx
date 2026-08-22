import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export type FeatureKey =
  | 'why-vietnam'
  | 'when-to-go'
  | 'know-before-you-go'
  | 'see-and-do'
  | 'taste-of-vietnam'
  | 'getting-around'
  | 'bring-home'

const FEATURE_LINKS: {
  key: FeatureKey
  label: string
  to: string
  icon: ReactNode
}[] = [
  {
    key: 'why-vietnam',
    label: 'Why Vietnam',
    to: '/why-vietnam',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12l4.2-5.4L11 11.2 7.5 16.8 12 12z" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </Icon>
    ),
  },
  {
    key: 'when-to-go',
    label: 'When to Go',
    to: '/when-to-go',
    icon: (
      <Icon>
        <path d="M7 16.5a4.5 4.5 0 01.4-9 5.5 5.5 0 0110.4 1.6A3.8 3.8 0 0118 16.5H7z" />
        <path d="M16.5 5.2a3.2 3.2 0 00-2.8 1.6" />
        <path d="M16.6 2.8v1.4M19.4 4.4l-1 1M20.2 7.5h-1.4" />
      </Icon>
    ),
  },
  {
    key: 'know-before-you-go',
    label: 'Know Before You Go',
    to: '/know-before-you-go',
    icon: (
      <Icon>
        <path d="M12 3.2l7.5 3.2v5.2c0 4.6-3.1 7.9-7.5 9.2-4.4-1.3-7.5-4.6-7.5-9.2V6.4L12 3.2z" />
      </Icon>
    ),
  },
  {
    key: 'see-and-do',
    label: 'See & Do',
    to: '/see-and-do',
    icon: (
      <Icon>
        <path d="M2.8 12s3.4-6.2 9.2-6.2S21.2 12 21.2 12s-3.4 6.2-9.2 6.2S2.8 12 2.8 12z" />
        <circle cx="12" cy="12" r="2.4" />
      </Icon>
    ),
  },
  {
    key: 'taste-of-vietnam',
    label: 'Taste of Vietnam',
    to: '/taste-of-vietnam',
    icon: (
      <Icon>
        <path d="M5.5 12.5h13c0 3.6-2.6 6.5-6.5 6.5s-6.5-2.9-6.5-6.5z" />
        <path d="M4.5 12.5h15" />
        <path d="M9 7.2c.3.8.3 1.6 0 2.4M12 6.5c.3.9.3 1.8 0 2.7M15 7.2c.3.8.3 1.6 0 2.4" />
      </Icon>
    ),
  },
  {
    key: 'getting-around',
    label: 'Getting Around',
    to: '/getting-around',
    icon: (
      <Icon>
        <path d="M4 17c2.5 0 3.5-4 6.5-4s4 4 7 4c1.4 0 2.2-.4 2.8-.9" />
        <path d="M17.8 13.8l2.6 2.1-2.8.9" />
      </Icon>
    ),
  },
  {
    key: 'bring-home',
    label: 'Bring Home',
    to: '/bring-home',
    icon: (
      <Icon>
        <path d="M11.2 5.2l7.6 7.6-5.2 5.2-7.6-7.6V5.2h5.2z" />
        <circle cx="9.6" cy="9.6" r="1.2" />
        <path d="M9.6 5.2c-.2-1.3.6-2.4 1.8-2.6" />
      </Icon>
    ),
  },
]

type Props = {
  excludeKeys?: FeatureKey[]
  order?: FeatureKey[]
}

export function FeatureStrip({ excludeKeys = [], order }: Props) {
  const { pathname } = useLocation()
  const byKey = new Map(FEATURE_LINKS.map((link) => [link.key, link]))

  // Hide the button for the page you're already on (e.g. When to Go on /when-to-go)
  const activeKey = FEATURE_LINKS.find((link) => link.to === pathname)?.key
  const excluded = new Set<FeatureKey>([
    ...excludeKeys,
    ...(activeKey ? [activeKey] : []),
  ])

  const keys = (order ?? FEATURE_LINKS.map((link) => link.key)).filter(
    (key) => !excluded.has(key) && byKey.has(key),
  )

  const links = keys.map((key) => byKey.get(key)!)

  return (
    <nav
      aria-label="Explore topics"
      className="flex h-[60px] w-full shrink-0 bg-ink"
    >
      {links.map((link, i) => (
        <Link
          key={link.key}
          to={link.to}
          className={`flex flex-1 items-center justify-center gap-1.5 px-1 text-center font-sans text-[clamp(0.58rem,1.35vw,0.8rem)] font-bold leading-tight text-paper/90 transition-colors duration-200 hover:bg-terracotta hover:text-paper ${
            i > 0 ? 'border-l border-paper/15' : ''
          }`}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  )
}
