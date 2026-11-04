import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, CircleHelp } from 'lucide-react'
import { cards } from '@/data/cards'
import type { Area } from '@/data/questions'
import Brand from '@/components/Brand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { drawStandCard, emptyUsedStandCards, type StandDeck, type UsedStandCards } from '@/lib/stand'

const PARTICIPANTS_KEY = 'conhecendo-direitos:participantes-atendidos'

const AREA_OPTIONS: readonly { value: Area; title: string; description: string }[] = [
  { value: 'trabalho', title: 'Direito do Trabalho', description: 'Salário, jornada, férias e registro' },
  { value: 'consumidor', title: 'Direito do Consumidor', description: 'Compras, cobranças, ofertas e produtos' },
]

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
  const [selection, setSelection] = useState<StandDeck | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [participants, setParticipants] = useState(readParticipantCount)
  const [drawError, setDrawError] = useState('')

  function chooseCard(nextSelection: StandDeck) {
    const result = drawStandCard({
      cards,
      selection: nextSelection,
      usedIds,
      seed: Math.floor(Math.random() * 2 ** 32),
    })
    setSelection(nextSelection)
    setUsedIds(result.usedIds)
    setActiveCard(result.card)
    setDrawError(result.card ? '' : 'Não há cartas disponíveis nesta área.')
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
    setSelection(null)
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
          <h2>Escolha uma área</h2>
          <div className="stand-area-options">
            {AREA_OPTIONS.map((option) => (
              <Button key={option.value} type="button" variant="secondary" className="stand-area-button" onClick={() => chooseCard(option.value)}>
                <strong>{option.title}</strong>
                <span>{option.description}</span>
              </Button>
            ))}
            <Button type="button" variant="outline" size="lg" className="stand-surprise-button" onClick={() => chooseCard('surpresa')}>
              Surpresa
            </Button>
          </div>
          {drawError && <p className="stand-empty-state" role="status">{drawError}</p>}
        </div>
      ) : (
        <div className="stand-round">
          <div className="stand-card-meta">
            <Badge variant="outline">{activeCard.tag ?? (activeCard.area === 'trabalho' ? 'Direito do Trabalho' : 'Direito do Consumidor')}</Badge>
            {selection === 'surpresa' && <span className="stand-surprise-label">Carta surpresa</span>}
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
              <Button type="button" size="lg" onClick={nextParticipant}>Próximo participante</Button>
            </div>
          )}
        </div>
      )}

      <footer className="stand-footer">
        <Link to="/" className="stand-home-link">Voltar ao início</Link>
      </footer>
    </section>
  )
}
