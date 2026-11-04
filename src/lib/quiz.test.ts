import { describe, expect, it } from 'vitest'
import type { Question } from '@/data/questions'
import { buildFullRound, buildRound } from './quiz'

const fixtures: Question[] = [
  { id: 'c1', area: 'consumidor', level: 'facil', points: 1, text: 'Pergunta C1', options: ['a', 'b', 'c'], answer: 'A', basis: 'Base C1' },
  { id: 'c2', area: 'consumidor', level: 'facil', points: 1, text: 'Pergunta C2', options: ['a', 'b', 'c'], answer: 'B', basis: 'Base C2' },
  { id: 't1', area: 'trabalho', level: 'medio', points: 2, text: 'Pergunta T1', options: ['a', 'b', 'c'], answer: 'C', basis: 'Base T1' },
  { id: 't2', area: 'trabalho', level: 'medio', points: 2, text: 'Pergunta T2', options: ['a', 'b', 'c'], answer: 'A', basis: 'Base T2' },
  { id: 'c3', area: 'consumidor', level: 'dificil', points: 3, text: 'Pergunta C3', options: ['a', 'b', 'c'], answer: 'B', basis: 'Base C3' },
  { id: 't3', area: 'trabalho', level: 'dificil', points: 3, text: 'Pergunta T3', options: ['a', 'b', 'c'], answer: 'C', basis: 'Base T3' },
]

describe('buildRound', () => {
  it('sorts the requested count by level without repeating questions', () => {
    const round = buildRound({ area: 'todas', levels: ['dificil', 'facil', 'medio'], perLevel: 1, seed: 42, sourceQuestions: fixtures })
    expect(round).toHaveLength(3)
    expect(round.map(({ level }) => level)).toEqual(['facil', 'medio', 'dificil'])
    expect(new Set(round.map(({ id }) => id)).size).toBe(round.length)
  })

  it('uses the same seeded order and filters by area', () => {
    const options = { area: 'consumidor' as const, levels: ['facil', 'dificil'] as const, perLevel: 1, seed: 7, sourceQuestions: fixtures }
    const first = buildRound(options)
    const second = buildRound(options)
    expect(first.map(({ id }) => id)).toEqual(second.map(({ id }) => id))
    expect(first.every(({ area }) => area === 'consumidor')).toBe(true)
  })

  it('returns every matching question in a full round', () => {
    expect(buildFullRound('trabalho', 11, fixtures).map(({ id }) => id).sort()).toEqual(['t1', 't2', 't3'])
  })

  it('rejects a non-positive or non-integer per-level count', () => {
    expect(() => buildRound({ area: 'todas', levels: ['facil'], perLevel: 0, sourceQuestions: fixtures })).toThrow(RangeError)
    expect(() => buildRound({ area: 'todas', levels: ['facil'], perLevel: 1.5, sourceQuestions: fixtures })).toThrow(RangeError)
  })
})
