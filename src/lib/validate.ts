import { POINTS, type Area, type Level, type Question } from '@/data/questions'
import type { Card } from '@/data/cards'

const AREAS: readonly Area[] = ['consumidor', 'trabalho']
const LEVELS: readonly Level[] = ['facil', 'medio', 'dificil']
const LETTERS = ['A', 'B', 'C'] as const

export type QuestionCountsByArea = Record<Area, number>
export type QuestionCountsByLevel = Record<Level, number>
export type QuestionCountsByAreaAndLevel = Record<Area, QuestionCountsByLevel>

export function countQuestionsByArea(qs: readonly Question[]): QuestionCountsByArea {
  const counts: QuestionCountsByArea = { consumidor: 0, trabalho: 0 }
  for (const question of qs) {
    if (AREAS.includes(question.area)) counts[question.area] += 1
  }
  return counts
}

export function countQuestionsByLevel(qs: readonly Question[]): QuestionCountsByLevel {
  const counts: QuestionCountsByLevel = { facil: 0, medio: 0, dificil: 0 }
  for (const question of qs) {
    if (LEVELS.includes(question.level)) counts[question.level] += 1
  }
  return counts
}

export function countQuestionsByAreaAndLevel(qs: readonly Question[]): QuestionCountsByAreaAndLevel {
  const counts: QuestionCountsByAreaAndLevel = {
    consumidor: { facil: 0, medio: 0, dificil: 0 },
    trabalho: { facil: 0, medio: 0, dificil: 0 },
  }
  for (const question of qs) {
    if (AREAS.includes(question.area) && LEVELS.includes(question.level)) {
      counts[question.area][question.level] += 1
    }
  }
  return counts
}

export function validateQuestions(qs: readonly Question[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()

  qs.forEach((question, index) => {
    const location = `Pergunta ${index + 1}`
    if (!question.id.trim()) errors.push(`${location}: id vazio.`)
    else if (ids.has(question.id)) errors.push(`${location}: id duplicado "${question.id}".`)
    ids.add(question.id)

    if (!AREAS.includes(question.area)) errors.push(`${location}: área inválida.`)
    if (!LEVELS.includes(question.level)) errors.push(`${location}: nível inválido.`)
    if (!Array.isArray(question.options) || question.options.length !== 3) {
      errors.push(`${location}: deve ter exatamente 3 alternativas.`)
    }
    if (!LETTERS.includes(question.answer)) errors.push(`${location}: resposta deve ser A, B ou C.`)
    if (LEVELS.includes(question.level) && question.points !== POINTS[question.level]) {
      errors.push(`${location}: pontuação incompatível com o nível "${question.level}".`)
    }
    if (!question.text.trim()) errors.push(`${location}: enunciado vazio.`)
    if (!question.basis.trim()) errors.push(`${location}: fundamento vazio.`)
  })

  return errors
}

export function validateCards(cs: readonly Card[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()

  cs.forEach((card, index) => {
    const location = `Carta ${index + 1}`
    if (!card.id.trim()) errors.push(`${location}: id vazio.`)
    else if (ids.has(card.id)) errors.push(`${location}: id duplicado "${card.id}".`)
    ids.add(card.id)

    if (!AREAS.includes(card.area)) errors.push(`${location}: área inválida.`)
    if (typeof card.answer !== 'boolean') errors.push(`${location}: resposta deve ser SIM ou NÃO.`)
    if (!card.situation.trim()) errors.push(`${location}: situação vazia.`)
    if (!card.learn.trim()) errors.push(`${location}: explicação vazia.`)
  })

  return errors
}
