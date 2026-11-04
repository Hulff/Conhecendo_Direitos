import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { questions, type Letter } from '@/data/questions'
import type { QuizArea } from '@/lib/quiz'

const STORAGE_KEY = 'conhecendo-direitos:quiz-session'
const validAreas: readonly QuizArea[] = ['consumidor', 'trabalho', 'todas']
const validLetters: readonly Letter[] = ['A', 'B', 'C']
const questionIds = new Set(questions.map((question) => question.id))

export interface QuizQuestionProgress {
  selectedAnswer: Letter | null
  revealed: boolean
  awardedTeams: string[]
}

export interface QuizSession {
  area: QuizArea
  roundIds: string[]
  teamNames: string[]
  scoringEnabled: boolean
  currentIndex: number
  answersByQuestion: Record<string, QuizQuestionProgress>
  participantMode: boolean
}

export type NewQuizSession = Pick<QuizSession, 'area' | 'roundIds' | 'teamNames' | 'scoringEnabled'>

interface QuizSessionState {
  session: QuizSession | null
}

export type QuizSessionAction =
  | { type: 'start'; session: NewQuizSession }
  | { type: 'clear' }
  | { type: 'set-current-index'; index: number }
  | { type: 'set-participant-mode'; enabled: boolean }
  | { type: 'select-moderator-answer'; questionId: string; answer: Letter }
  | { type: 'submit-participant-answer'; questionId: string; answer: Letter }
  | { type: 'reveal-answer'; questionId: string }
  | { type: 'toggle-team-award'; questionId: string; team: string }

interface QuizSessionContextValue {
  session: QuizSession | null
  dispatch: Dispatch<QuizSessionAction>
}

const QuizSessionContext = createContext<QuizSessionContextValue | null>(null)

function isStoredSession(value: unknown): value is NewQuizSession & Partial<QuizSession> {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<QuizSession>
  return validAreas.includes(candidate.area as QuizArea)
    && Array.isArray(candidate.roundIds)
    && candidate.roundIds.length > 0
    && new Set(candidate.roundIds).size === candidate.roundIds.length
    && candidate.roundIds.every((id) => typeof id === 'string' && questionIds.has(id))
    && Array.isArray(candidate.teamNames)
    && candidate.teamNames.every((name) => typeof name === 'string')
    && typeof candidate.scoringEnabled === 'boolean'
    && (!candidate.scoringEnabled || candidate.teamNames.length >= 2)
}

function normalizeStoredSession(value: NewQuizSession & Partial<QuizSession>): QuizSession {
  const teamNames = value.teamNames.filter((team) => typeof team === 'string')
  const savedProgress = value.answersByQuestion && typeof value.answersByQuestion === 'object'
    ? value.answersByQuestion
    : {}
  const answersByQuestion: Record<string, QuizQuestionProgress> = {}

  for (const id of value.roundIds) {
    const progress = savedProgress[id]
    if (!progress || typeof progress !== 'object') continue
    const awardedTeams = Array.isArray(progress.awardedTeams)
      ? progress.awardedTeams.filter((team) => teamNames.includes(team))
      : []
    answersByQuestion[id] = {
      selectedAnswer: validLetters.includes(progress.selectedAnswer as Letter) ? progress.selectedAnswer as Letter : null,
      revealed: progress.revealed === true,
      awardedTeams: [...new Set(awardedTeams)],
    }
  }

  const currentIndex = Number.isInteger(value.currentIndex)
    ? Math.max(0, Math.min(value.currentIndex ?? 0, value.roundIds.length - 1))
    : 0

  return {
    area: value.area,
    roundIds: [...value.roundIds],
    teamNames,
    scoringEnabled: value.scoringEnabled,
    currentIndex,
    answersByQuestion,
    participantMode: value.participantMode === true,
  }
}

function loadSession(): QuizSession | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isStoredSession(parsed) ? normalizeStoredSession(parsed) : null
  } catch {
    return null
  }
}

function getProgress(session: QuizSession, questionId: string): QuizQuestionProgress {
  return session.answersByQuestion[questionId] ?? { selectedAnswer: null, revealed: false, awardedTeams: [] }
}

function updateQuestionProgress(
  session: QuizSession,
  questionId: string,
  update: (previous: QuizQuestionProgress) => QuizQuestionProgress,
): QuizSession {
  if (!session.roundIds.includes(questionId)) return session
  return {
    ...session,
    answersByQuestion: {
      ...session.answersByQuestion,
      [questionId]: update(getProgress(session, questionId)),
    },
  }
}

function reducer(state: QuizSessionState, action: QuizSessionAction): QuizSessionState {
  switch (action.type) {
    case 'start':
      return {
        session: {
          ...action.session,
          currentIndex: 0,
          answersByQuestion: {},
          participantMode: false,
        },
      }
    case 'clear':
      return { session: null }
    case 'set-current-index': {
      if (!state.session) return state
      return { session: { ...state.session, currentIndex: Math.max(0, Math.min(action.index, state.session.roundIds.length - 1)) } }
    }
    case 'set-participant-mode':
      if (!state.session) return state
      return { session: { ...state.session, participantMode: action.enabled } }
    case 'select-moderator-answer':
      if (!state.session || state.session.participantMode) return state
      return {
        session: updateQuestionProgress(state.session, action.questionId, (previous) => previous.revealed
          ? previous
          : { ...previous, selectedAnswer: action.answer }),
      }
    case 'submit-participant-answer':
      if (!state.session || !state.session.participantMode) return state
      return {
        session: updateQuestionProgress(state.session, action.questionId, (previous) => previous.revealed ? previous : ({
          ...previous,
          selectedAnswer: action.answer,
          revealed: true,
        })),
      }
    case 'reveal-answer':
      if (!state.session) return state
      return {
        session: updateQuestionProgress(state.session, action.questionId, (previous) => ({ ...previous, revealed: true })),
      }
    case 'toggle-team-award':
      if (!state.session || !state.session.scoringEnabled || state.session.participantMode || !state.session.teamNames.includes(action.team)) return state
      return {
        session: updateQuestionProgress(state.session, action.questionId, (previous) => !previous.revealed ? previous : ({
          ...previous,
          awardedTeams: previous.awardedTeams.includes(action.team)
            ? previous.awardedTeams.filter((team) => team !== action.team)
            : [...previous.awardedTeams, action.team],
        })),
      }
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
