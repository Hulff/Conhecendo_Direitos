import { describe, expect, it } from 'vitest'
import type { Card } from '@/data/cards'
import { drawStandCard, emptyUsedStandCards } from './stand'

const fixtureCards: Card[] = [
  { id: 'c1', area: 'consumidor', situation: 'Situação C1', answer: true, learn: 'Explicação C1' },
  { id: 'c2', area: 'consumidor', situation: 'Situação C2', answer: false, learn: 'Explicação C2' },
  { id: 't1', area: 'trabalho', situation: 'Situação T1', answer: true, learn: 'Explicação T1' },
]

describe('drawStandCard', () => {
  it('draws only from the selected area and returns updated deck usage', () => {
    const result = drawStandCard({ cards: fixtureCards, selection: 'trabalho', usedIds: emptyUsedStandCards(), seed: 1 })
    expect(result.card?.area).toBe('trabalho')
    expect(result.usedIds.trabalho).toEqual(['t1'])
    expect(result.reshuffled).toBe(false)
  })

  it('does not repeat cards before the selected deck is exhausted, then reshuffles', () => {
    const first = drawStandCard({ cards: fixtureCards, selection: 'consumidor', usedIds: emptyUsedStandCards(), seed: 1 })
    const second = drawStandCard({ cards: fixtureCards, selection: 'consumidor', usedIds: first.usedIds, seed: 1 })
    const third = drawStandCard({ cards: fixtureCards, selection: 'consumidor', usedIds: second.usedIds, seed: 1 })

    expect(first.card?.id).not.toBe(second.card?.id)
    expect(new Set([first.card?.id, second.card?.id]).size).toBe(2)
    expect(third.reshuffled).toBe(true)
    expect(['c1', 'c2']).toContain(third.card?.id)
  })

  it('draws from all areas for surprise and is deterministic for a seed', () => {
    const options = { cards: fixtureCards, selection: 'surpresa' as const, usedIds: emptyUsedStandCards(), seed: 29 }
    expect(drawStandCard(options).card?.id).toBe(drawStandCard(options).card?.id)
  })

  it('returns an empty result when the selected area has no cards', () => {
    const result = drawStandCard({ cards: fixtureCards, selection: 'trabalho', usedIds: emptyUsedStandCards(), seed: 3 })
    const empty = drawStandCard({ cards: fixtureCards.filter(({ area }) => area !== 'trabalho'), selection: 'trabalho', usedIds: result.usedIds, seed: 3 })
    expect(empty.card).toBeNull()
  })
})
