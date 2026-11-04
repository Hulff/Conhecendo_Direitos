import Brand from '@/components/Brand'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/card'

export default function App() {
  return (
    <Layout>
      <section className="home-intro" aria-label="Conhecendo Direitos">
        <Brand />
        <Card className="intro-card">
          <CardContent className="intro-card-content">
            <p>Uma dinâmica para aprender e conversar sobre seus direitos.</p>
          </CardContent>
        </Card>
      </section>
    </Layout>
  )
}
