import { questions, type Area, type Level, type Question } from '@/data/questions'

export type QuizArea = Area | 'todas'

interface BuildRoundOptions {
  area: QuizArea
  levels: readonly Level[]
  perLevel: number
  seed?: number
  sourceQuestions?: readonly Question[]
}

const LEVEL_ORDER: readonly Level[] = ['facil', 'medio', 'dificil']

function createRandom(seed: number | undefined): () => number {
  if (seed === undefined) return Math.random
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function filterArea(qs: readonly Question[], area: QuizArea): Question[] {
  return qs.filter((question) => area === 'todas' || question.area === area)
}

export function buildRound({ area, levels, perLevel, seed, sourceQuestions = questions }: BuildRoundOptions): Question[] {
  if (!Number.isInteger(perLevel) || perLevel < 1) {
    throw new RangeError('perLevel deve ser um número inteiro maior que zero.')
  }

  const requestedLevels = new Set(levels)
  const random = createRandom(seed)
  const candidates = filterArea(sourceQuestions, area)
  const selectedIds = new Set<string>()
  const round: Question[] = []

  for (const level of LEVEL_ORDER) {
    if (!requestedLevels.has(level)) continue
    const available = candidates.filter((question) => question.level === level && !selectedIds.has(question.id))
    const chosen = shuffled(available, random).slice(0, perLevel)
    for (const question of chosen) {
      selectedIds.add(question.id)
      round.push(question)
    }
  }

  return round
}

export function buildFullRound(
  area: QuizArea = 'todas',
  seed?: number,
  sourceQuestions: readonly Question[] = questions,
): Question[] {
  const selected = filterArea(sourceQuestions, area)
  return buildRound({ area, levels: LEVEL_ORDER, perLevel: Math.max(1, selected.length), seed, sourceQuestions })
}
