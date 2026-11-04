import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Stand from '@/pages/Stand'
import QuizSetup from '@/pages/QuizSetup'
import QuizPlay from '@/pages/QuizPlay'
import QuizResult from '@/pages/QuizResult'
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
            <Route path="/quiz/jogar" element={<QuizPlay />} />
            <Route path="/quiz/resultado" element={<QuizResult />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </QuizSessionProvider>
    </HashRouter>
  )
}
