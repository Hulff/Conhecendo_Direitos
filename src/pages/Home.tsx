import { Link } from 'react-router-dom'
import Brand from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectionMode } from '@/hooks/useProjectionMode'

export default function Home() {
  const projection = useProjectionMode()

  return (
    <section className="home-page" aria-label="Escolha um modo de jogo">
      <header className="home-header">
        <Brand />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-pressed={projection.enabled}
          onClick={projection.toggle}
        >
          Modo projeção: {projection.enabled ? 'ligado' : 'desligado'}
        </Button>
      </header>
      <div className="mode-grid">
        <Card className="mode-card">
          <CardHeader>
            <CardTitle>Detetive dos Direitos (Stand)</CardTitle>
            <CardDescription>Uma dinâmica rápida para conversar sobre situações do dia a dia.</CardDescription>
          </CardHeader>
          <CardContent className="mode-card-content">
            <p>Escolha uma carta, avalie a situação e descubra qual direito está em jogo.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg">
              <Link to="/stand">Abrir modo Stand</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="mode-card">
          <CardHeader>
            <CardTitle>Quiz de Perguntas</CardTitle>
            <CardDescription>Uma rodada de perguntas sobre Direito do Consumidor e do Trabalho.</CardDescription>
          </CardHeader>
          <CardContent className="mode-card-content">
            <p>Convide o grupo a responder e revele o gabarito com o fundamento legal.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg">
              <Link to="/quiz">Configurar quiz</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
