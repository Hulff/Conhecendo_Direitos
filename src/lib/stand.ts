import type { Area } from '@/data/questions'
import type { Card } from '@/data/cards'

export type StandDeck = Area | 'surpresa'
export type UsedStandCards = Record<StandDeck, readonly string[]>

export interface DrawStandCardOptions {
  cards: readonly Card[]
  selection: StandDeck
  usedIds: UsedStandCards
  seed: number
}

export interface DrawStandCardResult {
  card: Card | null
  deck: StandDeck
  usedIds: UsedStandCards
  reshuffled: boolean
}

export const emptyUsedStandCards = (): UsedStandCards => ({
  consumidor: [],
  trabalho: [],
  surpresa: [],
})

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

export function drawStandCard({ cards, selection, usedIds, seed }: DrawStandCardOptions): DrawStandCardResult {
  const candidates = cards.filter((card) => selection === 'surpresa' || card.area === selection)
  if (candidates.length === 0) {
    return { card: null, deck: selection, usedIds, reshuffled: false }
  }

  const remaining = candidates.filter((card) => !usedIds[selection].includes(card.id))
  const reshuffled = remaining.length === 0
  const pool = reshuffled ? candidates : remaining
  const random = seededRandom(seed)
  const card = pool[Math.floor(random() * pool.length)]
  const previousIds = reshuffled ? [] : usedIds[selection]

  return {
    card,
    deck: selection,
    usedIds: {
      ...usedIds,
      [selection]: [...previousIds, card.id],
    },
    reshuffled,
  }
}
