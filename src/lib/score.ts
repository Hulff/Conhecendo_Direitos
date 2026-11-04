import type { Question } from '@/data/questions'

export type TeamTotals = Readonly<Record<string, number>>

export interface TeamScoreEntry {
  team: string
  question: Pick<Question, 'points'>
  isCorrect: boolean
}

export function scoreFor(question: Pick<Question, 'points'>, isCorrect: boolean): number {
  return isCorrect ? question.points : 0
}

export function addTeamScore(
  totals: TeamTotals,
  team: string,
  question: Pick<Question, 'points'>,
  isCorrect: boolean,
): Record<string, number> {
  const previous = Object.hasOwn(totals, team) ? totals[team] : 0
  return { ...totals, [team]: previous + scoreFor(question, isCorrect) }
}

export function totalsByTeam(entries: readonly TeamScoreEntry[]): Record<string, number> {
  const totals = new Map<string, number>()
  for (const entry of entries) {
    totals.set(entry.team, (totals.get(entry.team) ?? 0) + scoreFor(entry.question, entry.isCorrect))
  }
  return Object.fromEntries(totals)
}
