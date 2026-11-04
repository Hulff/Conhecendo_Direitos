import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import ModePlaceholder from '@/pages/ModePlaceholder'
import Stand from '@/pages/Stand'
import QuizSetup from '@/pages/QuizSetup'
import { QuizSessionProvider } from '@/context/QuizSessionContext'

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QuizSessionProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stand" element={<Stand />} />
            <Route path="/quiz" element={<QuizSetup />} />
            <Route path="/quiz/jogar" element={<ModePlaceholder title="Quiz" description="A rodada de perguntas aparecerá aqui." />} />
            <Route path="/quiz/resultado" element={<ModePlaceholder title="Resultado" description="O placar final aparecerá aqui." />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </QuizSessionProvider>
    </HashRouter>
  )
}
