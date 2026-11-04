import type { Area, Level, Question } from '@/data/questions'
import type { QuizArea } from '@/lib/quiz'

export interface WheelSlice {
  level: Level
  area: Area
  startAngle: number
  endAngle: number
}

export interface WheelSpinResult {
  sliceIndex: number
  level: Level
  area: Area
  finalRotation: number
}

export interface SpinWheelOptions {
  slices: readonly WheelSlice[]
  remaining: readonly Question[]
  seed?: number
}

export interface DrawQuestionResult {
  question: Question | null
  remaining: Question[]
}

const LEVEL_ORDER: readonly Level[] = ['facil', 'medio', 'dificil']
const AREA_ORDER: readonly Area[] = ['trabalho', 'consumidor']

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function secureRandomSeed(): number {
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]
  return Math.floor(Math.random() * 2 ** 32)
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360
}

export function buildWheelSlices(area: QuizArea): WheelSlice[] {
  const areas = area === 'todas' ? AREA_ORDER : [area]
  const combinations = LEVEL_ORDER.flatMap((level) => areas.map((currentArea) => ({ level, area: currentArea })))
  const anglePerSlice = 360 / combinations.length
  return combinations.map((slice, index) => ({
    ...slice,
    startAngle: index * anglePerSlice,
    endAngle: (index + 1) * anglePerSlice,
  }))
}

export function spinWheel({ slices, remaining, seed = secureRandomSeed() }: SpinWheelOptions): WheelSpinResult | null {
  const eligible = slices.flatMap((slice, sliceIndex) => (
    remaining.some((question) => question.level === slice.level && question.area === slice.area)
      ? [{ slice, sliceIndex }]
      : []
  ))
  if (eligible.length === 0) return null

  const random = seededRandom(seed)
  const selected = eligible[Math.floor(random() * eligible.length)]
  const sliceWidth = selected.slice.endAngle - selected.slice.startAngle
  const centerAngle = (selected.slice.startAngle + selected.slice.endAngle) / 2
  const deviation = (random() - 0.5) * sliceWidth * 0.6
  const pointerAngle = normalizeAngle(centerAngle + deviation)
  const alignmentAngle = normalizeAngle(360 - pointerAngle)
  const fullTurns = 7 + Math.floor(random() * 7)

  return {
    sliceIndex: selected.sliceIndex,
    level: selected.slice.level,
    area: selected.slice.area,
    finalRotation: fullTurns * 360 + alignmentAngle,
  }
}

export function drawQuestion(
  remaining: readonly Question[],
  level: Level,
  area: Area,
  seed = 0,
): DrawQuestionResult {
  const matchingIndexes = remaining.flatMap((question, index) => (
    question.level === level && question.area === area ? [index] : []
  ))
  if (matchingIndexes.length === 0) return { question: null, remaining: [...remaining] }

  const selectedIndex = matchingIndexes[Math.floor(seededRandom(seed)() * matchingIndexes.length)]
  const question = remaining[selectedIndex]
  return {
    question,
    remaining: remaining.filter((_, index) => index !== selectedIndex),
  }
}

export function countRemainingBySlice(slices: readonly WheelSlice[], remaining: readonly Question[]): number[] {
  return slices.map((slice) => remaining.filter((question) => question.level === slice.level && question.area === slice.area).length)
}
