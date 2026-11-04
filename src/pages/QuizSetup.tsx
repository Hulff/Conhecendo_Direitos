import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { questions } from '@/data/questions'
import { useQuizSession } from '@/context/QuizSessionContext'
import { buildFullRound, buildRound, type QuizArea } from '@/lib/quiz'
import { summarizeRound, summarizeWheelRound, type QuizFormat } from '@/lib/quizSetup'

const AREAS: readonly { value: QuizArea; label: string }[] = [
  { value: 'consumidor', label: 'Direito do Consumidor' },
  { value: 'trabalho', label: 'Direito do Trabalho' },
  { value: 'todas', label: 'Todas as áreas' },
]

const LEVELS = ['facil', 'medio', 'dificil'] as const
const INITIAL_TEAMS = ['Equipe 1', 'Equipe 2']

export default function QuizSetup() {
  const navigate = useNavigate()
  const { dispatch } = useQuizSession()
  const [area, setArea] = useState<QuizArea>('todas')
  const [format, setFormat] = useState<QuizFormat>('curta')
  const [perLevel, setPerLevel] = useState(3)
  const [wheelQuestionLimit, setWheelQuestionLimit] = useState<number | null>(5)
  const [scoringEnabled, setScoringEnabled] = useState(false)
  const [teamNames, setTeamNames] = useState<string[]>(INITIAL_TEAMS)
  const [error, setError] = useState('')
  const roundSummary = summarizeRound(questions, area, format === 'completa' ? 'completa' : 'curta', perLevel)
  const wheelSummary = summarizeWheelRound(questions, area, wheelQuestionLimit)
  const questionCount = format === 'roleta' ? wheelSummary.questionCount : roundSummary.questionCount

  function changeTeam(index: number, event: ChangeEvent<HTMLInputElement>) {
    setTeamNames((current) => current.map((team, currentIndex) => currentIndex === index ? event.target.value : team))
    setError('')
  }

  function addTeam() {
    if (teamNames.length < 6) setTeamNames((current) => [...current, `Equipe ${current.length + 1}`])
  }

  function removeTeam(index: number) {
    if (teamNames.length > 2) setTeamNames((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  function startQuiz() {
    if (questionCount === 0) {
      setError('Não há perguntas disponíveis para esta seleção.')
      return
    }

    const normalizedTeamNames = teamNames.map((team) => team.trim())
    if (scoringEnabled) {
      const uniqueNames = new Set(normalizedTeamNames.map((name) => name.toLocaleLowerCase()))
      if (normalizedTeamNames.some((name) => name.length === 0)) {
        setError('Preencha o nome de todas as equipes.')
        return
      }
      if (uniqueNames.size !== normalizedTeamNames.length) {
        setError('Cada equipe precisa ter um nome diferente.')
        return
      }
    }

    if (format === 'roleta') {
      const remaining = questions.filter((question) => area === 'todas' || question.area === area)
      dispatch({
        type: 'start',
        session: {
          area,
          format,
          roundIds: [],
          remainingIds: remaining.map((question) => question.id),
          wheelQuestionLimit: wheelQuestionLimit === null ? null : wheelSummary.questionCount,
          teamNames: scoringEnabled ? normalizedTeamNames : [],
          scoringEnabled,
        },
      })
      navigate('/quiz/jogar')
      return
    }

    const round = format === 'completa'
      ? buildFullRound(area)
      : buildRound({ area, levels: LEVELS, perLevel })

    if (round.length === 0) {
      setError('Não foi possível montar uma rodada com essas opções.')
      return
    }

    dispatch({
      type: 'start',
      session: {
        area,
        format,
        roundIds: round.map((question) => question.id),
        remainingIds: [],
        wheelQuestionLimit: null,
        teamNames: scoringEnabled ? normalizedTeamNames : [],
        scoringEnabled,
      },
    })
    navigate('/quiz/jogar')
  }

  return (
    <section className="quiz-setup-page" aria-labelledby="quiz-setup-title">
      <Card className="quiz-setup-card">
        <CardHeader>
          <CardTitle as="h1" className="quiz-setup-title" id="quiz-setup-title">Configurar quiz</CardTitle>
          <CardDescription>Escolha o conteúdo e o formato da rodada.</CardDescription>
        </CardHeader>
        <CardContent className="quiz-setup-content">
          <fieldset className="quiz-fieldset">
            <legend>Área do Direito</legend>
            <div className="quiz-choice-grid">
              {AREAS.map((option) => (
                <label className="quiz-choice" key={option.value}>
                  <input
                    type="radio"
                    name="quiz-area"
                    value={option.value}
                    checked={area === option.value}
                    onChange={() => { setArea(option.value); setError('') }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="quiz-fieldset">
            <legend>Formato da rodada</legend>
            <div className="quiz-choice-grid quiz-format-grid">
              <label className="quiz-choice quiz-format-choice">
                <input type="radio" name="quiz-format" value="curta" checked={format === 'curta'} onChange={() => setFormat('curta')} />
                <span><strong>Rodada curta</strong><small>3 a 5 perguntas por nível</small></span>
              </label>
              <label className="quiz-choice quiz-format-choice">
                <input type="radio" name="quiz-format" value="completa" checked={format === 'completa'} onChange={() => setFormat('completa')} />
                <span><strong>Rodada completa</strong><small>Todas as perguntas da área</small></span>
              </label>
              <label className="quiz-choice quiz-format-choice">
                <input type="radio" name="quiz-format" value="roleta" checked={format === 'roleta'} onChange={() => setFormat('roleta')} />
                <span><strong>Roleta</strong><small>Sortear nível e área a cada pergunta</small></span>
              </label>
            </div>
            {format === 'curta' && (
              <label className="quiz-per-level" htmlFor="quiz-per-level">
                Perguntas por nível
                <select id="quiz-per-level" value={perLevel} onChange={(event) => setPerLevel(Number(event.target.value))}>
                  {[3, 4, 5].map((count) => <option key={count} value={count}>{count} perguntas</option>)}
                </select>
              </label>
            )}
            {format === 'roleta' && (
              <label className="quiz-per-level" htmlFor="quiz-wheel-count">
                Perguntas na rodada
                <select
                  id="quiz-wheel-count"
                  value={wheelQuestionLimit ?? 'all'}
                  onChange={(event) => setWheelQuestionLimit(event.target.value === 'all' ? null : Number(event.target.value))}
                >
                  {[5, 10, 15].map((count) => <option key={count} value={count}>{count} perguntas</option>)}
                  <option value="all">Até esgotar</option>
                </select>
              </label>
            )}
          </fieldset>

          <fieldset className="quiz-fieldset">
            <legend>Pontuação</legend>
            <div className="quiz-switch-row">
              <label htmlFor="quiz-team-scoring">Ativar pontuação por equipes</label>
              <Switch id="quiz-team-scoring" checked={scoringEnabled} onChange={(event) => setScoringEnabled(event.target.checked)} />
            </div>
            {scoringEnabled && (
              <div className="quiz-team-list">
                {teamNames.map((team, index) => (
                  <div className="quiz-team-row" key={index}>
                    <label htmlFor={`team-name-${index}`}>Equipe {index + 1}</label>
                    <input id={`team-name-${index}`} value={team} onChange={(event) => changeTeam(index, event)} maxLength={32} />
                    {teamNames.length > 2 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTeam(index)} aria-label={`Remover equipe ${index + 1}`}>
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
                {teamNames.length < 6 && <Button type="button" variant="outline" onClick={addTeam}>Adicionar equipe</Button>}
              </div>
            )}
          </fieldset>

          <div className="quiz-summary" aria-live="polite">
            <h2>Resumo da rodada</h2>
            <div className="quiz-summary-values">
              <Badge variant="outline">{questionCount} {questionCount === 1 ? 'pergunta' : 'perguntas'}</Badge>
              {format === 'roleta' ? (
                <Badge>Pontos possíveis: {wheelSummary.minPoints}–{wheelSummary.maxPoints}</Badge>
              ) : (
                <Badge>Pontuação máxima: {roundSummary.maxPoints} {roundSummary.maxPoints === 1 ? 'ponto' : 'pontos'}</Badge>
              )}
            </div>
          </div>
          {questionCount === 0 && (
            <p className="quiz-setup-empty" role="status">Não há perguntas disponíveis para esta seleção. Escolha outra área ou formato.</p>
          )}
          {error && <p className="quiz-setup-error" role="alert"><CircleAlert aria-hidden="true" />{error}</p>}
          <Button type="button" size="lg" className="quiz-start-button" onClick={startQuiz} disabled={questionCount === 0}>
            Começar
          </Button>
          <Button type="button" size="lg" variant="outline" onClick={() => navigate('/')}>
            Voltar ao menu
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
