import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import ModePlaceholder from '@/pages/ModePlaceholder'

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stand" element={<ModePlaceholder title="Modo Stand" description="Detetive dos Direitos" />} />
          <Route path="/quiz" element={<ModePlaceholder title="Configurar quiz" description="Escolha a rodada de perguntas." />} />
          <Route path="/quiz/jogar" element={<ModePlaceholder title="Quiz" description="A rodada de perguntas aparecerá aqui." />} />
          <Route path="/quiz/resultado" element={<ModePlaceholder title="Resultado" description="O placar final aparecerá aqui." />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
