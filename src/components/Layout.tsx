import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { SVGProps } from 'react'
import Credits from '@/components/Credits'
import { APP_NAME } from '@/lib/config'

function JusticeScale({ color = "#782D05", ...props }: SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="20 6 420 436"
      fill={color}
      stroke="none"
      className="justice-scale"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M230 12 C238 24 242 36 230 52 C218 36 222 24 230 12 Z" />
      <rect x="219" y="52" width="24" height="8" rx="1" />
      <rect x="227" y="60" width="8" height="16" />
      <path d="M90 85 C150 80 190 74 230 74 C270 74 320 77 366 76 L368 83 C320 86 270 98 230 98 C190 98 150 92 94 94 Z" />
      <circle cx="92" cy="89" r="5.5" />
      <circle cx="367" cy="80" r="5.5" />
      <rect x="227" y="96" width="8" height="16" />
      <rect x="216" y="111" width="30" height="14" rx="1" />
      <path d="M223 126 L243 126 L247 352 L215 352 Z" />
      <path d="M203 382 Q231 356 259 382 Z" />
      <rect x="190" y="384" width="82" height="8" />
      <rect x="165" y="402" width="132" height="14" />
      <rect x="145" y="422" width="172" height="12" />
      <g fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M92 92 L33 253" />
        <path d="M92 92 L153 253" />
        <path d="M92 92 L92 255" />
        <path d="M367 84 L305 249" />
        <path d="M367 84 L428 249" />
        <path d="M367 84 L367 250" />
      </g>
      <path d="M30 254 L156 254 C151 279 121 293 93 293 C65 293 35 279 30 254 Z" />
      <path d="M302 249 L430 249 C425 274 395 287 366 287 C337 287 307 274 302 249 Z" />
    </svg>
  )
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const showCredits = pathname === '/' || pathname === '/quiz/resultado'

  useEffect(() => {
    document.title = APP_NAME
  }, [])

  return (
    <div className="app-shell">
      <JusticeScale />
      <main className="app-content">
        {children}
        {showCredits && <Credits />}
      </main>
    </div>
  )
}
