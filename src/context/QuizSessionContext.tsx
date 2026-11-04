import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { questions } from '@/data/questions'
import type { QuizArea } from '@/lib/quiz'

const STORAGE_KEY = 'conhecendo-direitos:quiz-session'
const validAreas: readonly QuizArea[] = ['consumidor', 'trabalho', 'todas']
const questionIds = new Set(questions.map((question) => question.id))

export interface QuizSession {
  area: QuizArea
  roundIds: string[]
  teamNames: string[]
  scoringEnabled: boolean
}

interface QuizSessionState {
  session: QuizSession | null
}

type QuizSessionAction =
  | { type: 'start'; session: QuizSession }
  | { type: 'clear' }

interface QuizSessionContextValue {
  session: QuizSession | null
  dispatch: Dispatch<QuizSessionAction>
}

const QuizSessionContext = createContext<QuizSessionContextValue | null>(null)

function isStoredSession(value: unknown): value is QuizSession {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<QuizSession>
  return validAreas.includes(candidate.area as QuizArea)
    && Array.isArray(candidate.roundIds)
    && candidate.roundIds.length > 0
    && candidate.roundIds.every((id) => typeof id === 'string' && questionIds.has(id))
    && Array.isArray(candidate.teamNames)
    && candidate.teamNames.every((name) => typeof name === 'string')
    && typeof candidate.scoringEnabled === 'boolean'
    && (!candidate.scoringEnabled || candidate.teamNames.length >= 2)
}

function loadSession(): QuizSession | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isStoredSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

function reducer(_state: QuizSessionState, action: QuizSessionAction): QuizSessionState {
  switch (action.type) {
    case 'start':
      return { session: action.session }
    case 'clear':
      return { session: null }
  }
}

interface QuizSessionProviderProps {
  children: ReactNode
}

export function QuizSessionProvider({ children }: QuizSessionProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ session: loadSession() }))

  useEffect(() => {
    try {
      if (state.session) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.session))
      else window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // A sessão atual permanece utilizável se o navegador bloquear sessionStorage.
    }
  }, [state.session])

  return (
    <QuizSessionContext.Provider value={{ session: state.session, dispatch }}>
      {children}
    </QuizSessionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuizSession(): QuizSessionContextValue {
  const context = useContext(QuizSessionContext)
  if (!context) throw new Error('useQuizSession deve ser usado dentro de QuizSessionProvider.')
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export function getSessionQuestions(session: QuizSession): typeof questions {
  const byId = new Map(questions.map((question) => [question.id, question]))
  return session.roundIds.flatMap((id) => {
    const question = byId.get(id)
    return question ? [question] : []
  })
}

export { STORAGE_KEY as QUIZ_SESSION_STORAGE_KEY }
