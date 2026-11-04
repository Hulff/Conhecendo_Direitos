import { describe, expect, it } from 'vitest'
import type { Question } from '@/data/questions'
import type { QuizQuestionProgress } from '@/context/QuizSessionContext'
import { getParticipantTotal, getTeamTotals, isCorrectAnswer } from './quizScoring'

const fixtureRound: Question[] = [
  { id: 'q1', area: 'consumidor', level: 'facil', points: 1, text: 'Fixture um', options: ['A', 'B', 'C'], answer: 'A', basis: 'Base um' },
  { id: 'q2', area: 'trabalho', level: 'dificil', points: 3, text: 'Fixture dois', options: ['A', 'B', 'C'], answer: 'C', basis: 'Base dois' },
]
const progress: Record<string, QuizQuestionProgress> = {
  q1: { selectedAnswer: 'A', revealed: true, awardedTeams: ['Equipe A', 'Equipe B'] },
  q2: { selectedAnswer: 'A', revealed: true, awardedTeams: ['Equipe B'] },
}

describe('quiz scoring', () => {
  it('totals points for all selected teams and keeps zero-score teams', () => {
    expect(getTeamTotals(fixtureRound, ['Equipe A', 'Equipe B', 'Equipe C'], progress)).toEqual({
      'Equipe A': 1,
      'Equipe B': 4,
      'Equipe C': 0,
    })
  })

  it('totals correct participant answers by level points', () => {
    expect(getParticipantTotal(fixtureRound, progress)).toBe(1)
  })

  it('does not count a selected answer before it is revealed', () => {
    expect(getParticipantTotal(fixtureRound, { q1: { ...progress.q1, revealed: false } })).toBe(0)
  })

  it('checks an answer without relying on its display color', () => {
    expect(isCorrectAnswer(fixtureRound[0], 'A')).toBe(true)
    expect(isCorrectAnswer(fixtureRound[0], 'B')).toBe(false)
  })
})
