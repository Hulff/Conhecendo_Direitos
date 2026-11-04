import type { Letter, Question } from '@/data/questions'
import type { QuizQuestionProgress } from '@/context/QuizSessionContext'
import { addTeamScore, scoreFor } from './score'

export function getTeamTotals(
  round: readonly Question[],
  teamNames: readonly string[],
  answersByQuestion: Readonly<Record<string, QuizQuestionProgress>>,
): Record<string, number> {
  let totals = Object.fromEntries(teamNames.map((team) => [team, 0]))
  for (const question of round) {
    const progress = answersByQuestion[question.id]
    if (!progress?.revealed) continue
    for (const team of progress?.awardedTeams ?? []) {
      totals = addTeamScore(totals, team, question, true)
    }
  }
  return totals
}

export function getParticipantTotal(
  round: readonly Question[],
  answersByQuestion: Readonly<Record<string, QuizQuestionProgress>>,
): number {
  return round.reduce((total, question) => {
    const progress = answersByQuestion[question.id]
    const selected = progress?.selectedAnswer
    const isCorrect = progress?.revealed === true && selected !== undefined && selected !== null && selected === question.answer
    return total + scoreFor(question, isCorrect)
  }, 0)
}

export function isCorrectAnswer(question: Question, answer: Letter | null): boolean {
  return answer !== null && answer === question.answer
}
