import { describe, expect, it } from 'vitest'
import type { Card } from '@/data/cards'
import type { Question } from '@/data/questions'
import { countQuestionsByArea, countQuestionsByAreaAndLevel, countQuestionsByLevel, validateCards, validateQuestions } from './validate'

const question: Question = {
  id: 'q1', area: 'consumidor', level: 'facil', points: 1,
  text: 'Enunciado fixture', options: ['A1', 'B1', 'C1'], answer: 'A', basis: 'Fundamento fixture',
}
const card: Card = {
  id: 'card1', area: 'trabalho', situation: 'Situação fixture', answer: true, learn: 'Explicação fixture',
  source: { label: 'Fixture', url: 'https://example.com' },
}

describe('content validation and counts', () => {
  it('accepts valid fixture questions and cards', () => {
    expect(validateQuestions([question])).toEqual([])
    expect(validateCards([card])).toEqual([])
  })

  it('reports duplicate ids and invalid question content', () => {
    const invalid = {
      ...question, options: ['uma', 'duas'], answer: 'D', points: 3, text: '  ', basis: '  ',
    } as unknown as Question
    const errors = validateQuestions([question, invalid])
    expect(errors).toContain('Pergunta 2: id duplicado "q1".')
    expect(errors).toContain('Pergunta 2: deve ter exatamente 3 alternativas.')
    expect(errors).toContain('Pergunta 2: resposta deve ser A, B ou C.')
    expect(errors).toContain('Pergunta 2: pontuação incompatível com o nível "facil".')
    expect(errors).toContain('Pergunta 2: enunciado vazio.')
    expect(errors).toContain('Pergunta 2: fundamento vazio.')
  })

  it('reports duplicate ids and empty card content', () => {
    const invalid = { ...card, situation: '', learn: '' }
    const errors = validateCards([card, invalid])
    expect(errors).toContain('Carta 2: id duplicado "card1".')
    expect(errors).toContain('Carta 2: situação vazia.')
    expect(errors).toContain('Carta 2: explicação vazia.')
  })

  it('counts fixtures by area and level', () => {
    const questions: Question[] = [
      question,
      { ...question, id: 'q2', level: 'medio', points: 2 },
      { ...question, id: 'q3', area: 'trabalho', level: 'dificil', points: 3 },
    ]
    expect(countQuestionsByArea(questions)).toEqual({ consumidor: 2, trabalho: 1 })
    expect(countQuestionsByLevel(questions)).toEqual({ facil: 1, medio: 1, dificil: 1 })
    expect(countQuestionsByAreaAndLevel(questions).consumidor).toEqual({ facil: 1, medio: 1, dificil: 0 })
  })
})
