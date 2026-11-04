import { useEffect, useRef, useState } from 'react'
import { Drawer, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import type { Area, Level, Question } from '@/data/questions'
import type { WheelSlice, WheelSpinResult } from '@/lib/wheel'

interface WheelDrawerProps {
  open: boolean
  slices: readonly WheelSlice[]
  remaining: readonly Question[]
  result: WheelSpinResult | null
  onFinished: (result: WheelSpinResult) => void
  standMode?: boolean
}

type DrawerPhase = 'spinning' | 'result' | 'closing'

const LEVEL_LABELS: Record<Level, string> = { facil: 'FÁCIL', medio: 'MÉDIO', dificil: 'DIFÍCIL' }
const AREA_LABELS: Record<Area, string> = { trabalho: 'Direito do Trabalho', consumidor: 'Direito do Consumidor' }
const LEVEL_COLORS: Record<Level, { fill: string; text: string }> = {
  facil: { fill: '#16733B', text: '#FFFFFF' },
  medio: { fill: '#FEB800', text: '#310303' },
  dificil: { fill: '#9E241B', text: '#FFFFFF' },
}
const DISABLED_FILL = '#6B625D'
const DISABLED_TEXT = '#FFFFFF'
const CENTER = 200
const CENTER_Y = 210
const RADIUS = 180
const EXIT_DURATION_MS = 350

function pointAt(angle: number, radius: number): { x: number; y: number } {
  const radians = ((angle - 90) * Math.PI) / 180
  return { x: CENTER + Math.cos(radians) * radius, y: CENTER_Y + Math.sin(radians) * radius }
}

function slicePath(slice: WheelSlice): string {
  const start = pointAt(slice.startAngle, RADIUS)
  const end = pointAt(slice.endAngle, RADIUS)
  const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER_Y} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

function sliceLabelPosition(slice: WheelSlice): { x: number; y: number } {
  return pointAt((slice.startAngle + slice.endAngle) / 2, 116)
}

export default function WheelDrawer({ open, slices, remaining, result, onFinished, standMode = false }: WheelDrawerProps) {
  const wheelRef = useRef<SVGGElement>(null)
  const onFinishedRef = useRef(onFinished)
  const exitTimerRef = useRef(0)
  const [rotation, setRotation] = useState('0deg')
  const [phase, setPhase] = useState<DrawerPhase>('spinning')

  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])

  useEffect(() => {
    if (!open || !result) {
      setRotation('0deg')
      setPhase('spinning')
      return
    }

    let resultShown = false
    let spinFallback = 0
    const wheel = wheelRef.current
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const showResult = () => {
      if (resultShown) return
      resultShown = true
      window.clearTimeout(spinFallback)
      setPhase('result')
    }

    const handleWheelTransition = (event: Event) => {
      if (event.target === wheel) showResult()
    }
    wheel?.addEventListener('transitionend', handleWheelTransition)

    if (reducedMotion) {
      setRotation('0deg')
      showResult()
    } else {
      setPhase('spinning')
      setRotation(`${result.finalRotation}deg`)
      spinFallback = window.setTimeout(showResult, 3800)
    }

    return () => {
      window.clearTimeout(exitTimerRef.current)
      window.clearTimeout(spinFallback)
      wheel?.removeEventListener('transitionend', handleWheelTransition)
    }
  }, [open, result])

  function confirmResult() {
    if (!result || phase !== 'result') return
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPhase('closing')
    if (reducedMotion) onFinishedRef.current(result)
    else exitTimerRef.current = window.setTimeout(() => onFinishedRef.current(result), EXIT_DURATION_MS)
  }

  const counts = slices.map((slice) => remaining.filter((question) => question.level === slice.level && question.area === slice.area).length)
  const selected = result && phase !== 'spinning' ? result.sliceIndex : -1
  const resultLabel = result && phase !== 'spinning'
    ? standMode ? `Área sorteada · ${AREA_LABELS[result.area]}` : `Nível ${LEVEL_LABELS[result.level]} · ${AREA_LABELS[result.area]}`
    : 'A roleta está girando.'

  return (
    <Drawer
      open={open}
      dismissible={false}
      onOpenChange={() => undefined}
      aria-labelledby="wheel-drawer-title"
      aria-describedby="wheel-drawer-description"
      className={phase === 'closing' ? 'wheel-drawer wheel-drawer-closing' : 'wheel-drawer'}
    >
      <div className="wheel-drawer-content">
        <div className="wheel-drawer-handle" aria-hidden="true" />
        <header className="wheel-drawer-header">
          <DrawerTitle id="wheel-drawer-title">Roleta de sorteio</DrawerTitle>
          <DrawerDescription id="wheel-drawer-description">{standMode ? 'Gire para sortear entre Trabalho e Consumidor.' : 'Gire para sortear o nível e a área da próxima pergunta.'}</DrawerDescription>
        </header>
        <div className="wheel-live-result" role="status" aria-live="polite">{resultLabel}</div>
        <svg
          viewBox="0 0 400 420"
          role="img"
          aria-label="Roleta com fatias de níveis e áreas do Direito"
          className={`wheel-svg${phase === 'spinning' ? ' wheel-svg-spinning' : ''}`}
        >
          <g
            ref={wheelRef}
            className="wheel-rotor"
            style={{ transform: `rotate(${rotation})` }}
          >
            {slices.map((slice, index) => {
              const disabled = counts[index] === 0
              const color = disabled ? { fill: DISABLED_FILL, text: DISABLED_TEXT } : LEVEL_COLORS[slice.level]
              const label = sliceLabelPosition(slice)
              const highlighted = selected === index
              return (
                <g key={`${slice.area}-${slice.level}`}>
                  <path
                    d={slicePath(slice)}
                    fill={color.fill}
                    stroke={highlighted ? '#FFFFFF' : '#310303'}
                    strokeWidth={highlighted ? 6 : 2}
                    opacity={disabled ? 0.62 : 1}
                  />
                  <text x={label.x} y={label.y - 7} fill={color.text} textAnchor="middle" className="wheel-label-area">
                    {slice.area === 'trabalho' ? 'Trabalho' : 'Consumidor'}
                  </text>
                  <text x={label.x} y={label.y + 16} fill={color.text} textAnchor="middle" className="wheel-label-level">
                    {standMode ? 'ALEATÓRIO' : LEVEL_LABELS[slice.level]}
                  </text>
                </g>
              )
            })}
            <circle cx={CENTER} cy={CENTER_Y} r={RADIUS} fill="none" stroke="#FEB800" strokeWidth="5" />
            <circle cx={CENTER} cy={CENTER_Y} r="42" fill="#310303" stroke="#FEB800" strokeWidth="5" />
            <text x={CENTER} y={CENTER_Y - 4} textAnchor="middle" fill="#FEB800" className="wheel-hub-brand">CONHECENDO</text>
            <text x={CENTER} y={CENTER_Y + 12} textAnchor="middle" fill="#FFFFFF" className="wheel-hub-brand wheel-hub-brand-bottom">DIREITOS</text>
          </g>
          <path d="M200 32 182 5h36Z" fill="#FEB800" stroke="#310303" strokeWidth="3" />
        </svg>
        {phase === 'result' && <Button type="button" size="lg" onClick={confirmResult}>OK</Button>}
      </div>
    </Drawer>
  )
}
