import type { Question } from '@/data/questions'
import type { QuizArea } from '@/lib/quiz'

export type QuizFormat = 'curta' | 'completa' | 'roleta'

export interface RoundSummary {
  questionCount: number
  maxPoints: number
}

export interface WheelRoundSummary {
  questionCount: number
  minPoints: number
  maxPoints: number
}

const LEVELS = ['facil', 'medio', 'dificil'] as const

export function summarizeRound(
  sourceQuestions: readonly Question[],
  area: QuizArea,
  format: Exclude<QuizFormat, 'roleta'>,
  perLevel: number,
): RoundSummary {
  const candidates = sourceQuestions.filter((question) => area === 'todas' || question.area === area)
  if (format === 'completa') {
    return {
      questionCount: candidates.length,
      maxPoints: candidates.reduce((total, question) => total + question.points, 0),
    }
  }

  return LEVELS.reduce<RoundSummary>((summary, level) => {
    const count = Math.min(perLevel, candidates.filter((question) => question.level === level).length)
    return {
      questionCount: summary.questionCount + count,
      maxPoints: summary.maxPoints + count * (level === 'facil' ? 1 : level === 'medio' ? 2 : 3),
    }
  }, { questionCount: 0, maxPoints: 0 })
}

export function summarizeWheelRound(
  sourceQuestions: readonly Question[],
  area: QuizArea,
  limit: number | null,
): WheelRoundSummary {
  const candidates = sourceQuestions.filter((question) => area === 'todas' || question.area === area)
  const targetCount = Math.min(limit ?? candidates.length, candidates.length)
  const counts = {
    facil: candidates.filter((question) => question.level === 'facil').length,
    medio: candidates.filter((question) => question.level === 'medio').length,
    dificil: candidates.filter((question) => question.level === 'dificil').length,
  }

  function pointsForOrder(levels: readonly (keyof typeof counts)[]): number {
    let left = targetCount
    let points = 0
    for (const level of levels) {
      const selected = Math.min(left, counts[level])
      points += selected * (level === 'facil' ? 1 : level === 'medio' ? 2 : 3)
      left -= selected
      if (left === 0) break
    }
    return points
  }

  return {
    questionCount: targetCount,
    minPoints: pointsForOrder(['facil', 'medio', 'dificil']),
    maxPoints: pointsForOrder(['dificil', 'medio', 'facil']),
  }
}
