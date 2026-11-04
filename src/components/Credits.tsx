import { AUTHOR, DEVELOPER } from '@/lib/config'

export default function Credits() {
  return (
    <footer className="app-credits text-white/60" aria-label="Créditos">
      <p>Idealizado por <span>{AUTHOR}</span></p>
      <p>Desenvolvido por <span>{DEVELOPER}</span></p>
    </footer>
  )
}
