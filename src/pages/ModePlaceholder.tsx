import { Link } from 'react-router-dom'
import Brand from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ModePlaceholderProps {
  title: string
  description: string
}

export default function ModePlaceholder({ title, description }: ModePlaceholderProps) {
  return (
    <section className="mode-placeholder">
      <Brand compact />
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
