import type { ReactNode } from 'react'

function JusticeScale() {
  return (
    <svg viewBox="0 0 220 240" fill="none" aria-hidden="true" className="justice-scale">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
        <path d="M110 23v172M70 58h80M110 24l-40 34m40-34 40 34M110 58 45 118m65-60 65 60" />
        <path d="M45 118c0 22 17 38 39 38s39-16 39-38H45Zm91 0c0 22 17 38 39 38s39-16 39-38h-78ZM77 195h66m-87 22h108" />
      </g>
    </svg>
  )
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <JusticeScale />
      <main className="app-content">{children}</main>
    </div>
  )
}
