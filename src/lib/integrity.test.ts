import { describe, expect, it } from 'vitest'
import { cards } from '@/data/cards'
import { questions } from '@/data/questions'
import { countQuestionsByAreaAndLevel, validateCards, validateQuestions } from './validate'

describe('real content integrity', () => {
  it('has 60 unique valid questions, evenly split by area and level', () => {
    expect(validateQuestions(questions)).toEqual([])
    expect(questions).toHaveLength(60)
    expect(countQuestionsByAreaAndLevel(questions)).toEqual({
      consumidor: { facil: 10, medio: 10, dificil: 10 },
      trabalho: { facil: 10, medio: 10, dificil: 10 },
    })
  })

  it('has six unique valid stand cards', () => {
    expect(validateCards(cards)).toEqual([])
    expect(cards).toHaveLength(6)
  })
})
