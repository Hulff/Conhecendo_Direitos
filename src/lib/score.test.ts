import { describe, expect, it } from 'vitest'
import { addTeamScore, scoreFor, totalsByTeam } from './score'

describe('scoreFor', () => {
  it('awards the question value only for a correct answer', () => {
    expect(scoreFor({ points: 3 }, true)).toBe(3)
    expect(scoreFor({ points: 2 }, false)).toBe(0)
  })
})

describe('team totals', () => {
  it('adds team points without mutating the previous totals', () => {
    const start = { 'Equipe 1': 2 }
    const next = addTeamScore(start, 'Equipe 1', { points: 3 }, true)
    expect(next).toEqual({ 'Equipe 1': 5 })
    expect(start).toEqual({ 'Equipe 1': 2 })
  })

  it('calculates totals from score events, including teams with zero points', () => {
    expect(totalsByTeam([
      { team: 'Equipe A', question: { points: 1 }, isCorrect: true },
      { team: 'Equipe B', question: { points: 3 }, isCorrect: false },
      { team: 'Equipe A', question: { points: 2 }, isCorrect: true },
    ])).toEqual({ 'Equipe A': 3, 'Equipe B': 0 })
  })
})
