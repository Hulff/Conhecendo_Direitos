import { Navigate, useNavigate } from 'react-router-dom'
import { CircleCheck, CircleX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useQuizSession, getSessionQuestions } from '@/context/QuizSessionContext'
import type { Letter } from '@/data/questions'
import { getParticipantTotal, getTeamTotals, isCorrectAnswer } from '@/lib/quizScoring'

const LETTERS: readonly Letter[] = ['A', 'B', 'C']
const AREA_LABELS = { consumidor: 'Consumidor', trabalho: 'Trabalho' } as const
const LEVEL_LABELS = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' } as const

export default function QuizPlay() {
  const navigate = useNavigate()
  const { session, dispatch } = useQuizSession()

  if (!session) return <Navigate to="/quiz" replace />
  const round = getSessionQuestions(session)
  if (round.length === 0) return <Navigate to="/quiz" replace />

  const currentIndex = session.currentIndex
  const question = round[currentIndex]
  const progress = session.answersByQuestion[question.id] ?? { selectedAnswer: null, revealed: false, awardedTeams: [] }
  const questionNumber = currentIndex + 1
  const isParticipant = session.participantMode
  const answerIsCorrect = isCorrectAnswer(question, progress.selectedAnswer)
  const participantScore = getParticipantTotal(round, session.answersByQuestion)
  const teamTotals = getTeamTotals(round, session.teamNames, session.answersByQuestion)

  function chooseAnswer(letter: Letter) {
    dispatch({
      type: isParticipant ? 'submit-participant-answer' : 'select-moderator-answer',
      questionId: question.id,
      answer: letter,
    })
  }

  function nextQuestion() {
    if (currentIndex === round.length - 1) {
      navigate('/quiz/resultado')
      return
    }
    dispatch({ type: 'set-current-index', index: currentIndex + 1 })
  }

  return (
    <section className="quiz-play-page" aria-labelledby="quiz-question-title">
      <h1 className="sr-only">Quiz</h1>
      <header className="quiz-play-topbar">
        <div className="quiz-mode-switch">
          <label htmlFor="quiz-participant-mode">Modo participante</label>
          <Switch
            id="quiz-participant-mode"
            checked={isParticipant}
            onChange={(event) => dispatch({ type: 'set-participant-mode', enabled: event.target.checked })}
          />
        </div>
        {isParticipant && <Badge variant="outline">Pontuação: {participantScore}</Badge>}
      </header>

      <div className="quiz-progress-label">
        <span>Questão {questionNumber} de {round.length}</span>
        <span>{Math.round((questionNumber / round.length) * 100)}%</span>
      </div>
      <Progress value={questionNumber} max={round.length} aria-label={`Progresso: questão ${questionNumber} de ${round.length}`} />

      <div className="quiz-question-meta">
        <Badge variant="secondary">Direito {AREA_LABELS[question.area]}</Badge>
        <Badge variant="outline">{LEVEL_LABELS[question.level]} · {question.points} {question.points === 1 ? 'ponto' : 'pontos'}</Badge>
      </div>

      <Card className="quiz-question-card">
        <CardHeader className="quiz-question-header">
          <CardTitle id="quiz-question-title" className="quiz-question-text">{question.text}</CardTitle>
          <CardDescription>{isParticipant ? 'Escolha uma alternativa para ver o resultado.' : 'Leia a pergunta e as alternativas para o grupo.'}</CardDescription>
        </CardHeader>
        <CardContent className="quiz-answer-list">
          {question.options.map((option, index) => {
            const letter = LETTERS[index]
            const isCorrect = progress.revealed && letter === question.answer
            const isSelected = progress.selectedAnswer === letter
            const isIncorrectSelection = progress.revealed && isSelected && !isCorrect
            const variant = isCorrect ? 'default' : isSelected ? 'secondary' : 'outline'
            return (
              <Button
                key={letter}
                type="button"
                variant={variant}
                aria-pressed={isSelected}
                className={`quiz-answer-option${isCorrect ? ' quiz-answer-correct' : ''}${isIncorrectSelection ? ' quiz-answer-incorrect' : ''}`}
                onClick={() => { if (!progress.revealed) chooseAnswer(letter) }}
                disabled={progress.revealed}
              >
                <span className="quiz-answer-letter">{letter}</span>
                <span className="quiz-answer-text">{option}</span>
                {isCorrect && <><CircleCheck aria-hidden="true" /><span className="quiz-answer-note">Correta</span></>}
                {isIncorrectSelection && <><CircleX aria-hidden="true" /><span className="quiz-answer-note">Escolhida</span></>}
              </Button>
            )
          })}
        </CardContent>
      </Card>

      {progress.revealed ? (
        <div className="quiz-reveal" aria-live="polite">
          {isParticipant ? (
            <p className={answerIsCorrect ? 'quiz-answer-status quiz-answer-status-correct' : 'quiz-answer-status quiz-answer-status-incorrect'}>
              {answerIsCorrect ? <CircleCheck aria-hidden="true" /> : <CircleX aria-hidden="true" />}
              <span>{answerIsCorrect ? `Você acertou! +${question.points} ${question.points === 1 ? 'ponto' : 'pontos'}.` : 'Resposta incorreta. Nenhum ponto nesta questão.'}</span>
            </p>
          ) : (
            <p className="quiz-answer-status quiz-answer-status-correct">
              <CircleCheck aria-hidden="true" />
              <span>Gabarito: <strong>{question.answer}</strong></span>
            </p>
          )}
          <Card className="quiz-basis-card">
            <CardContent><p><strong>Fundamento legal:</strong> {question.basis}</p></CardContent>
          </Card>
          {session.scoringEnabled && !isParticipant && (
            <div className="quiz-team-awards" role="group" aria-labelledby="quiz-team-awards-title">
              <h2 id="quiz-team-awards-title">Quem acertou?</h2>
              <div className="quiz-team-chips">
                {session.teamNames.map((team) => {
                  const awarded = progress.awardedTeams.includes(team)
                  return (
                    <Button
                      key={team}
                      type="button"
                      size="sm"
                      variant={awarded ? 'default' : 'outline'}
                      aria-pressed={awarded}
                      onClick={() => dispatch({ type: 'toggle-team-award', questionId: question.id, team })}
                    >
                      {team} · {teamTotals[team] ?? 0} {teamTotals[team] === 1 ? 'ponto' : 'pontos'}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        !isParticipant && (
          <Button type="button" size="lg" className="quiz-reveal-button" onClick={() => dispatch({ type: 'reveal-answer', questionId: question.id })}>
            Revelar resposta
          </Button>
        )
      )}

      <nav className="quiz-navigation" aria-label="Navegação da rodada">
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch({ type: 'set-current-index', index: currentIndex - 1 })}
          disabled={currentIndex === 0}
        >
          Anterior
        </Button>
        <Button type="button" onClick={nextQuestion}>
          {currentIndex === round.length - 1 ? 'Ver resultado' : 'Próxima'}
        </Button>
      </nav>
    </section>
  )
}
