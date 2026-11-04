import type { Question } from '@/data/questions'
import type { QuizArea } from '@/lib/quiz'

export type QuizFormat = 'curta' | 'completa'

export interface RoundSummary {
  questionCount: number
  maxPoints: number
}

const LEVELS = ['facil', 'medio', 'dificil'] as const

export function summarizeRound(
  sourceQuestions: readonly Question[],
  area: QuizArea,
  format: QuizFormat,
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
