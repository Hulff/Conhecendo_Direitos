import { describe, expect, it } from 'vitest'
import type { Question } from '@/data/questions'
import { summarizeRound, summarizeWheelRound } from './quizSetup'

const fixtureQuestions: Question[] = [
  { id: 'c1', area: 'consumidor', level: 'facil', points: 1, text: 'Pergunta fixture 1', options: ['A', 'B', 'C'], answer: 'A', basis: 'Base fixture 1' },
  { id: 'c2', area: 'consumidor', level: 'medio', points: 2, text: 'Pergunta fixture 2', options: ['A', 'B', 'C'], answer: 'B', basis: 'Base fixture 2' },
  { id: 'c3', area: 'consumidor', level: 'dificil', points: 3, text: 'Pergunta fixture 3', options: ['A', 'B', 'C'], answer: 'C', basis: 'Base fixture 3' },
  { id: 't1', area: 'trabalho', level: 'facil', points: 1, text: 'Pergunta fixture 4', options: ['A', 'B', 'C'], answer: 'A', basis: 'Base fixture 4' },
]

describe('summarizeRound', () => {
  it('calculates a short-round count and maximum score from available levels', () => {
    expect(summarizeRound(fixtureQuestions, 'consumidor', 'curta', 3)).toEqual({ questionCount: 3, maxPoints: 6 })
  })

  it('limits each level count for short rounds', () => {
    expect(summarizeRound(fixtureQuestions, 'todas', 'curta', 1)).toEqual({ questionCount: 3, maxPoints: 6 })
  })

  it('counts every matching question and point in a full round', () => {
    expect(summarizeRound(fixtureQuestions, 'todas', 'completa', 3)).toEqual({ questionCount: 4, maxPoints: 7 })
  })

  it('reports an empty state when no questions are available', () => {
    expect(summarizeRound([], 'todas', 'curta', 3)).toEqual({ questionCount: 0, maxPoints: 0 })
  })

  it('calculates the possible score range for roulette rounds', () => {
    expect(summarizeWheelRound(fixtureQuestions, 'todas', 2)).toEqual({ questionCount: 2, minPoints: 2, maxPoints: 5 })
    expect(summarizeWheelRound(fixtureQuestions, 'todas', null)).toEqual({ questionCount: 4, minPoints: 7, maxPoints: 7 })
  })
})
