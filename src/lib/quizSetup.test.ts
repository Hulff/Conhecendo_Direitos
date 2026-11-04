import { describe, expect, it } from 'vitest'
import type { Question } from '@/data/questions'
import { summarizeRound } from './quizSetup'

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
})
