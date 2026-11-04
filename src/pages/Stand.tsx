import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, CircleHelp, Link as LinkIcon } from 'lucide-react'
import { cards } from '@/data/cards'
import Brand from '@/components/Brand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { drawStandCard, emptyUsedStandCards, type UsedStandCards } from '@/lib/stand'
import WheelDrawer from '@/components/WheelDrawer'
import { buildWheelSlices, spinWheel, type WheelSpinResult } from '@/lib/wheel'
import type { Question } from '@/data/questions'

const PARTICIPANTS_KEY = 'conhecendo-direitos:participantes-atendidos'

function readParticipantCount(): number {
  try {
    const value = Number(window.localStorage.getItem(PARTICIPANTS_KEY) ?? '0')
    return Number.isSafeInteger(value) && value >= 0 ? value : 0
  } catch {
    return 0
  }
}

export default function Stand() {
  const [usedIds, setUsedIds] = useState<UsedStandCards>(emptyUsedStandCards)
  const [activeCard, setActiveCard] = useState<(typeof cards)[number] | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [participants, setParticipants] = useState(readParticipantCount)
  const [drawError, setDrawError] = useState('')
  const [wheelResult, setWheelResult] = useState<WheelSpinResult | null>(null)

  const wheelSlices = buildWheelSlices('todas')
  const remainingCards = cards.filter((card) => !usedIds.surpresa.includes(card.id))
  const wheelCards: Question[] = remainingCards.map((card, index) => ({
    id: card.id,
    area: card.area,
    level: wheelSlices.filter((slice) => slice.area === card.area)[index % 3]?.level ?? 'facil',
    text: card.situation,
    options: ['', '', ''],
    answer: 'A',
    basis: card.learn,
    points: 0,
  }))

  function spinStandWheel() {
    const result = spinWheel({ slices: wheelSlices, remaining: wheelCards })
    if (!result) {
      setDrawError('Não há cartas disponíveis para sortear.')
      return
    }
    setDrawError('')
    setWheelResult(result)
  }

  function finishStandWheel(result: WheelSpinResult) {
    const drawn = drawStandCard({ cards, selection: result.area, usedIds, seed: Math.floor(Math.random() * 2 ** 32) })
    setWheelResult(null)
    setActiveCard(drawn.card)
    setUsedIds(drawn.card ? { ...drawn.usedIds, surpresa: [...usedIds.surpresa, drawn.card.id] } : drawn.usedIds)
    setDrawError(drawn.card ? '' : 'Não há cartas disponíveis para sortear.')
    setSelectedAnswer(null)
    setRevealed(false)
  }

  function reveal(answer: boolean | null) {
    if (!activeCard || revealed) return
    setSelectedAnswer(answer)
    setRevealed(true)
    setParticipants((current) => {
      const next = current + 1
      try {
        window.localStorage.setItem(PARTICIPANTS_KEY, String(next))
      } catch {
        // O contador permanece disponível durante esta sessão.
      }
      return next
    })
  }

  function nextParticipant() {
    setActiveCard(null)
    setSelectedAnswer(null)
    setRevealed(false)
  }

  function resetParticipants() {
    setParticipants(0)
    try {
      window.localStorage.removeItem(PARTICIPANTS_KEY)
    } catch {
      // A sessão continua mesmo se o navegador bloquear o armazenamento.
    }
  }

  const isCorrect = selectedAnswer !== null && selectedAnswer === activeCard?.answer

  return (
    <section className="stand-page" aria-label="Detetive dos Direitos">
      <header className="stand-header">
        <Brand compact />
        <div className="stand-counter" aria-live="polite">
          <span>Participantes atendidos: <strong>{participants}</strong></span>
          <Button type="button" variant="ghost" size="sm" onClick={resetParticipants} disabled={participants === 0}>
            Zerar contador
          </Button>
        </div>
      </header>

      {!activeCard ? (
        <div className="stand-choose">
          <h2>Gire a roleta para sortear uma situação</h2>
          <div className="stand-area-options">
            <Button type="button" size="lg" className="stand-surprise-button" onClick={spinStandWheel}>
              Sortear situação
            </Button>
          </div>
          {drawError && <p className="stand-empty-state" role="status">{drawError}</p>}
        </div>
      ) : (
        <div className="stand-round">
          <div className="stand-card-meta">
            <Badge variant="outline">{activeCard.tag ?? (activeCard.area === 'trabalho' ? 'Direito do Trabalho' : 'Direito do Consumidor')}</Badge>
            <span className="stand-surprise-label">Sorteio aleatório</span>
          </div>
          <Card className="stand-situation-card">
            <CardHeader className="stand-situation-header">
              <CardTitle className="stand-situation-heading">Situação</CardTitle>
              <CardDescription>Direito violado?</CardDescription>
            </CardHeader>
            <CardContent className="stand-situation-content">
              <p className="stand-situation">{activeCard.situation}</p>
            </CardContent>
          </Card>
          {!revealed ? (
            <>
              <div className="stand-answer-buttons" role="group" aria-label="Sua resposta">
                <Button type="button" size="lg" onClick={() => reveal(true)}>SIM</Button>
                <Button type="button" size="lg" variant="secondary" onClick={() => reveal(false)}>NÃO</Button>
              </div>
              <Button type="button" variant="ghost" onClick={() => reveal(null)}>Revelar resposta</Button>
            </>
          ) : (
            <div className="stand-reveal" aria-live="polite">
              <div className={isCorrect ? 'stand-feedback stand-feedback-correct' : 'stand-feedback'}>
                {isCorrect ? <CircleCheck aria-hidden="true" /> : <CircleHelp aria-hidden="true" />}
                <p>{isCorrect ? 'Isso mesmo!' : 'A resposta correta é:'} <strong>{activeCard.answer ? 'SIM' : 'NÃO'}</strong></p>
              </div>
              <p className="stand-learning"><strong>Aprenda:</strong> {activeCard.learn}</p>
              <p className="stand-source">
                <strong>Fonte:</strong>{' '}
                <a href={activeCard.source.url} target="_blank" rel="noreferrer">
                  {activeCard.source.label}<LinkIcon aria-hidden="true" size={14} />
                </a>
              </p>
              <Button type="button" size="lg" onClick={nextParticipant}>Próximo participante</Button>
            </div>
          )}
        </div>
      )}

      <footer className="stand-footer">
        <Button asChild size="lg" variant="outline">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </footer>
      <WheelDrawer
        open={wheelResult !== null}
        slices={wheelSlices}
        remaining={wheelCards}
        result={wheelResult}
        onFinished={finishStandWheel}
        standMode
      />
    </section>
  )
}
