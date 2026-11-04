import { Navigate, useNavigate } from 'react-router-dom'
import { useQuizSession, getSessionQuestions } from '@/context/QuizSessionContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getParticipantTotal, getTeamTotals } from '@/lib/quizScoring'

export default function QuizResult() {
  const navigate = useNavigate()
  const { session, dispatch } = useQuizSession()

  if (!session) return <Navigate to="/quiz" replace />
  const round = getSessionQuestions(session)
  if (round.length === 0) return <Navigate to="/quiz" replace />

  const answeredCount = round.filter((question) => session.answersByQuestion[question.id]?.revealed).length
  const teamTotals = getTeamTotals(round, session.teamNames, session.answersByQuestion)
  const participantTotal = getParticipantTotal(round, session.answersByQuestion)
  const sortedTeams = session.teamNames
    .map((team, order) => ({ team, points: teamTotals[team] ?? 0, order }))
    .sort((first, second) => second.points - first.points || first.order - second.order)

  function restart() {
    dispatch({ type: 'clear' })
    navigate('/quiz')
  }

  function goHome() {
    dispatch({ type: 'clear' })
    navigate('/')
  }

  return (
    <section className="quiz-result-page" aria-labelledby="quiz-result-title">
      <Card className="quiz-result-card">
        <CardHeader className="quiz-result-header">
          <CardTitle id="quiz-result-title">Rodada concluída</CardTitle>
          <CardDescription>{answeredCount} de {round.length} perguntas respondidas</CardDescription>
        </CardHeader>
        <CardContent className="quiz-result-content">
          {session.participantMode ? (
            <div className="quiz-individual-result">
              <span>Sua pontuação</span>
              <strong>{participantTotal} {participantTotal === 1 ? 'ponto' : 'pontos'}</strong>
            </div>
          ) : session.scoringEnabled ? (
            <ol className="quiz-scoreboard">
              {sortedTeams.map(({ team, points }, index) => (
                <li key={team}>
                  <span><strong>{index + 1}º.</strong> {team}</span>
                  <strong>{points} {points === 1 ? 'ponto' : 'pontos'}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="quiz-no-score">Rodada concluída. Obrigado por participar!</p>
          )}
          <div className="quiz-result-actions">
            <Button type="button" size="lg" onClick={restart}>Jogar novamente</Button>
            <Button type="button" size="lg" variant="outline" onClick={goHome}>Voltar ao início</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
