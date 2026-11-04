import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { questions, type Letter, type Level } from '@/data/questions'
import type { QuizArea } from '@/lib/quiz'
import type { QuizFormat } from '@/lib/quizSetup'
import { buildWheelSlices, type WheelSpinResult } from '@/lib/wheel'

const STORAGE_KEY = 'conhecendo-direitos:quiz-session'
const validAreas: readonly QuizArea[] = ['consumidor', 'trabalho', 'todas']
const validFormats: readonly QuizFormat[] = ['curta', 'completa', 'roleta']
const validLetters: readonly Letter[] = ['A', 'B', 'C']
const validLevels: readonly Level[] = ['facil', 'medio', 'dificil']
const questionIds = new Set(questions.map((question) => question.id))

export interface QuizQuestionProgress {
  selectedAnswer: Letter | null
  revealed: boolean
  awardedTeams: string[]
}

export interface QuizSession {
  area: QuizArea
  format: QuizFormat
  roundIds: string[]
  remainingIds: string[]
  wheelQuestionLimit: number | null
  pendingWheelResult: WheelSpinResult | null
  teamNames: string[]
  scoringEnabled: boolean
  currentIndex: number
  answersByQuestion: Record<string, QuizQuestionProgress>
  participantMode: boolean
}

export type NewQuizSession = Pick<QuizSession,
  'area' | 'format' | 'roundIds' | 'remainingIds' | 'wheelQuestionLimit' | 'teamNames' | 'scoringEnabled'
>

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
  | { type: 'start-wheel-spin'; result: WheelSpinResult }
  | { type: 'complete-wheel-spin'; questionId: string }
  | { type: 'cancel-wheel-spin' }

interface QuizSessionContextValue {
  session: QuizSession | null
  dispatch: Dispatch<QuizSessionAction>
}

const QuizSessionContext = createContext<QuizSessionContextValue | null>(null)

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseWheelResult(value: unknown, area: QuizArea): WheelSpinResult | null {
  if (!isRecord(value)) return null
  const { sliceIndex, level, area: sliceArea, finalRotation } = value
  if (!Number.isInteger(sliceIndex) || typeof level !== 'string' || !validLevels.includes(level as Level)) return null
  if (sliceArea !== 'trabalho' && sliceArea !== 'consumidor') return null
  if (typeof finalRotation !== 'number' || !Number.isFinite(finalRotation) || finalRotation < 0) return null
  const slice = buildWheelSlices(area)[sliceIndex as number]
  if (!slice || slice.area !== sliceArea || slice.level !== level) return null
  return { sliceIndex: sliceIndex as number, level: level as Level, area: sliceArea, finalRotation }
}

function parseStoredSession(value: unknown): QuizSession | null {
  if (!isRecord(value)) return null
  const area = value.area
  const format = value.format ?? 'completa'
  const roundIds = value.roundIds
  const rawRemainingIds = value.remainingIds ?? []
  const teamNames = value.teamNames
  const scoringEnabled = value.scoringEnabled
  const isRoulette = format === 'roleta'

  if (!validAreas.includes(area as QuizArea) || !validFormats.includes(format as QuizFormat)) return null
  if (!Array.isArray(roundIds) || !roundIds.every((id): id is string => typeof id === 'string')) return null
  if (!Array.isArray(rawRemainingIds) || !rawRemainingIds.every((id): id is string => typeof id === 'string')) return null
  if (!Array.isArray(teamNames) || !teamNames.every((team): team is string => typeof team === 'string')) return null
  if (typeof scoringEnabled !== 'boolean') return null
  if (!isRoulette && roundIds.length === 0) return null
  if (isRoulette && roundIds.length + rawRemainingIds.length === 0) return null
  if (scoringEnabled && (teamNames.length < 2 || teamNames.some((team) => team.trim().length === 0))) return null

  const allIds = [...roundIds, ...(isRoulette ? rawRemainingIds : [])]
  if (allIds.some((id) => !questionIds.has(id)) || new Set(allIds).size !== allIds.length) return null
  if (scoringEnabled && new Set(teamNames.map((team) => team.trim().toLocaleLowerCase())).size !== teamNames.length) return null

  const wheelQuestionLimitValue = value.wheelQuestionLimit
  const wheelQuestionLimit = isRoulette && (wheelQuestionLimitValue === null || wheelQuestionLimitValue === undefined)
    ? null
    : Number.isInteger(wheelQuestionLimitValue) && (wheelQuestionLimitValue as number) > 0
      ? wheelQuestionLimitValue as number
      : isRoulette ? Number.NaN : null
  if (isRoulette && Number.isNaN(wheelQuestionLimit)) return null

  const currentIndex = Number.isInteger(value.currentIndex) ? value.currentIndex as number : 0
  const boundedIndex = Math.max(0, Math.min(currentIndex, Math.max(0, roundIds.length - 1)))
  const answersByQuestion: Record<string, QuizQuestionProgress> = {}
  if (isRecord(value.answersByQuestion)) {
    for (const id of roundIds) {
      const progress = value.answersByQuestion[id]
      if (!isRecord(progress)) continue
      const selectedAnswer = validLetters.includes(progress.selectedAnswer as Letter) ? progress.selectedAnswer as Letter : null
      const awardedTeams = Array.isArray(progress.awardedTeams)
        ? [...new Set(progress.awardedTeams.filter((team): team is string => typeof team === 'string' && teamNames.includes(team)))]
        : []
      answersByQuestion[id] = { selectedAnswer, revealed: progress.revealed === true, awardedTeams }
    }
  }

  let pendingWheelResult: WheelSpinResult | null = null
  if (isRoulette && value.pendingWheelResult !== undefined && value.pendingWheelResult !== null) {
    pendingWheelResult = parseWheelResult(value.pendingWheelResult, area as QuizArea)
    const result = pendingWheelResult
    if (!result || !rawRemainingIds.some((id) => {
      const question = questions.find((candidate) => candidate.id === id)
      return question !== undefined && question.area === result.area && question.level === result.level
    })) return null
  }

  return {
    area: area as QuizArea,
    format: format as QuizFormat,
    roundIds: [...roundIds],
    remainingIds: isRoulette ? [...rawRemainingIds] : [],
    wheelQuestionLimit: isRoulette ? wheelQuestionLimit : null,
    pendingWheelResult,
    teamNames: [...teamNames],
    scoringEnabled,
    currentIndex: boundedIndex,
    answersByQuestion,
    participantMode: value.participantMode === true,
  }
}

function loadSession(): QuizSession | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    return stored ? parseStoredSession(JSON.parse(stored) as unknown) : null
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
          pendingWheelResult: null,
          currentIndex: 0,
          answersByQuestion: {},
          participantMode: false,
        },
      }
    case 'clear':
      return { session: null }
    case 'start-wheel-spin': {
      const session = state.session
      if (!session || session.format !== 'roleta' || session.pendingWheelResult || session.remainingIds.length === 0) return state
      if (session.wheelQuestionLimit !== null && session.roundIds.length >= session.wheelQuestionLimit) return state
      const currentId = session.roundIds.at(-1)
      if (currentId && !getProgress(session, currentId).revealed) return state
      const matchingSlice = buildWheelSlices(session.area)[action.result.sliceIndex]
      const hasQuestion = session.remainingIds.some((id) => {
        const question = questions.find((candidate) => candidate.id === id)
        return question?.level === action.result.level && question.area === action.result.area
      })
      if (!matchingSlice || matchingSlice.level !== action.result.level || matchingSlice.area !== action.result.area || !hasQuestion) return state
      return { session: { ...session, pendingWheelResult: action.result } }
    }
    case 'complete-wheel-spin': {
      const session = state.session
      const result = session?.pendingWheelResult
      if (!session || session.format !== 'roleta' || !result || !session.remainingIds.includes(action.questionId)) return state
      const question = questions.find((candidate) => candidate.id === action.questionId)
      if (!question || question.level !== result.level || question.area !== result.area) return state
      return {
        session: {
          ...session,
          roundIds: [...session.roundIds, question.id],
          remainingIds: session.remainingIds.filter((id) => id !== question.id),
          currentIndex: session.roundIds.length,
          pendingWheelResult: null,
        },
      }
    }
    case 'cancel-wheel-spin':
      if (!state.session?.pendingWheelResult) return state
      return { session: { ...state.session, pendingWheelResult: null } }
    case 'set-current-index': {
      if (!state.session || state.session.format === 'roleta') return state
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

// eslint-disable-next-line react-refresh/only-export-components
export function getSessionRemainingQuestions(session: QuizSession): typeof questions {
  const byId = new Map(questions.map((question) => [question.id, question]))
  return session.remainingIds.flatMap((id) => {
    const question = byId.get(id)
    return question ? [question] : []
  })
}

export { STORAGE_KEY as QUIZ_SESSION_STORAGE_KEY }
