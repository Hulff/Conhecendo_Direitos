import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CircleCheck, CircleX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import WheelDrawer from '@/components/WheelDrawer'
import { getSessionQuestions, getSessionRemainingQuestions, useQuizSession } from '@/context/QuizSessionContext'
import type { Letter } from '@/data/questions'
import type { WheelSpinResult } from '@/lib/wheel'
import { getParticipantTotal, getTeamTotals, isCorrectAnswer } from '@/lib/quizScoring'
import { buildWheelSlices, drawQuestion, spinWheel } from '@/lib/wheel'

const LETTERS: readonly Letter[] = ['A', 'B', 'C']
const AREA_LABELS = { consumidor: 'Consumidor', trabalho: 'Trabalho' } as const
const LEVEL_LABELS = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' } as const

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32)
}

export default function QuizPlay() {
  const navigate = useNavigate()
  const { session, dispatch } = useQuizSession()
  const [wheelError, setWheelError] = useState('')

  if (!session) return <Navigate to="/quiz" replace />
  const round = getSessionQuestions(session)
  const isRoulette = session.format === 'roleta'
  if (!isRoulette && round.length === 0) return <Navigate to="/quiz" replace />

  const remainingQuestions = isRoulette ? getSessionRemainingQuestions(session) : []
  const question = round[session.currentIndex] ?? null
  const progress = question
    ? session.answersByQuestion[question.id] ?? { selectedAnswer: null, revealed: false, awardedTeams: [] }
    : { selectedAnswer: null, revealed: false, awardedTeams: [] }
  const currentIndex = session.currentIndex
  const questionNumber = isRoulette ? round.length : currentIndex + 1
  const progressMax = isRoulette
    ? session.wheelQuestionLimit ?? round.length + remainingQuestions.length
    : round.length
  const isParticipant = session.participantMode
  const answerIsCorrect = question ? isCorrectAnswer(question, progress.selectedAnswer) : false
  const participantScore = getParticipantTotal(round, session.answersByQuestion)
  const teamTotals = getTeamTotals(round, session.teamNames, session.answersByQuestion)
  const wheelSlices = isRoulette ? buildWheelSlices(session.area) : []
  const rouletteComplete = isRoulette && (
    session.wheelQuestionLimit !== null
      ? round.length >= session.wheelQuestionLimit
      : remainingQuestions.length === 0
  )
  const canSpin = isRoulette && !rouletteComplete && !session.pendingWheelResult && (!question || progress.revealed)

  function chooseAnswer(letter: Letter) {
    if (!question) return
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

  function spinNextQuestion() {
    if (rouletteComplete) {
      navigate('/quiz/resultado')
      return
    }
    if (!canSpin) return
    const result = spinWheel({ slices: wheelSlices, remaining: remainingQuestions, seed: randomSeed() })
    if (!result) {
      setWheelError('Não há perguntas restantes para sortear.')
      return
    }
    setWheelError('')
    dispatch({ type: 'start-wheel-spin', result })
  }

  function finishWheelSpin(result: WheelSpinResult) {
    const draw = drawQuestion(remainingQuestions, result.level, result.area, randomSeed())
    if (!draw.question) {
      dispatch({ type: 'cancel-wheel-spin' })
      setWheelError('As perguntas desta fatia acabaram. Gire novamente para sortear entre as demais.')
      return
    }
    dispatch({ type: 'complete-wheel-spin', questionId: draw.question.id })
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
        <span>{isRoulette ? `${questionNumber} de ${progressMax} perguntas sorteadas` : `Questão ${questionNumber} de ${round.length}`}</span>
        <span>{progressMax > 0 ? Math.round((questionNumber / progressMax) * 100) : 0}%</span>
      </div>
      <Progress value={questionNumber} max={Math.max(progressMax, 1)} aria-label={`Progresso da rodada: ${questionNumber} de ${progressMax}`} />

      {question ? (
        <>
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
        </>
      ) : (
        <Card className="wheel-initial-card">
          <CardHeader>
            <CardTitle>Primeira pergunta</CardTitle>
            <CardDescription>Gire a roleta para sortear o nível e a área da rodada.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {isRoulette ? (
        <div className="wheel-control-area">
          {wheelError && <p className="quiz-setup-error" role="alert">{wheelError}</p>}
          <Button
            type="button"
            size="lg"
            className="wheel-spin-button"
            aria-disabled={!canSpin && !rouletteComplete}
            onClick={spinNextQuestion}
          >
            {rouletteComplete ? 'Ver resultado' : 'Girar a roleta'}
          </Button>
          {question && !progress.revealed && !isParticipant && <p className="wheel-hint">Revele a resposta antes de sortear a próxima pergunta.</p>}
        </div>
      ) : (
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
      )}

      {isRoulette && (
        <WheelDrawer
          open={session.pendingWheelResult !== null}
          slices={wheelSlices}
          remaining={remainingQuestions}
          result={session.pendingWheelResult}
          onFinished={finishWheelSpin}
        />
      )}
    </section>
  )
}
