// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { AUTHOR, DEVELOPER } from '@/lib/config'

const projectionKey = 'conhecendo-direitos:modo-projecao'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  window.localStorage.clear()
  window.sessionStorage.clear()
  document.documentElement.classList.remove('projection-mode')
  window.location.hash = '#/'
})

describe('application routes and home', () => {
  it('shows the brand, two game modes, and navigates to the stand route', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Conhecendo Direitos' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Detetive dos Direitos (Stand)' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Quiz de Perguntas' })).toBeTruthy()
    const credits = screen.getByRole('contentinfo', { name: 'Créditos' })
    expect(credits.textContent).toContain(AUTHOR)
    expect(credits.textContent).toContain(DEVELOPER)
    expect(document.title).toBe('Conhecendo Direitos')
    fireEvent.click(screen.getByRole('link', { name: 'Abrir modo Stand' }))
    expect(screen.getByRole('heading', { name: 'Escolha uma área' })).toBeTruthy()
  })

  it('supports direct navigation to each quiz route', () => {
    const routes = [
      ['#/quiz', 'Configurar quiz'],
      ['#/quiz/jogar', 'Configurar quiz'],
      ['#/quiz/resultado', 'Configurar quiz'],
    ] as const

    for (const [path, title] of routes) {
      window.location.hash = path
      const view = render(<App />)
      expect(screen.getByRole('heading', { name: title })).toBeTruthy()
      view.unmount()
    }
  })

  it('completes a stand card, saves the participant count, and returns to area selection', () => {
    window.location.hash = '#/stand'
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Direito do Consumidor/ }))
    expect(screen.getByText('Direito violado?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'SIM' }))
    expect(screen.getByText(/Aprenda:/)).toBeTruthy()
    expect(screen.getByText('1', { exact: true })).toBeTruthy()
    expect(window.localStorage.getItem('conhecendo-direitos:participantes-atendidos')).toBe('1')
    fireEvent.click(screen.getByRole('button', { name: 'Próximo participante' }))
    expect(screen.getByRole('heading', { name: 'Escolha uma área' })).toBeTruthy()
  })

  it('creates a configured quiz and restores the session after remounting', () => {
    window.location.hash = '#/quiz'
    render(<App />)
    fireEvent.click(screen.getByRole('radio', { name: 'Direito do Consumidor' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Ativar pontuação por equipes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar equipe' }))
    fireEvent.change(screen.getByLabelText('Equipe 3'), { target: { value: 'Desafios' } })
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByRole('heading', { name: 'Quiz' })).toBeTruthy()
    const storedSession = window.sessionStorage.getItem('conhecendo-direitos:quiz-session')
    expect(storedSession).not.toBeNull()
    if (!storedSession) throw new Error('A sessão do quiz não foi salva.')
    const session = JSON.parse(storedSession) as { area: string; roundIds: string[]; teamNames: string[]; scoringEnabled: boolean }
    expect(session.area).toBe('consumidor')
    expect(session.roundIds.length).toBeGreaterThan(0)
    expect(session.teamNames).toEqual(['Equipe 1', 'Equipe 2', 'Desafios'])
    expect(session.scoringEnabled).toBe(true)

    cleanup()
    render(<App />)
    const restored = window.sessionStorage.getItem('conhecendo-direitos:quiz-session')
    expect(restored).not.toBeNull()
    if (!restored) throw new Error('A sessão do quiz não foi restaurada.')
    expect(JSON.parse(restored)).toEqual(session)
  })

  it('spins, draws without removing the round state, and restores the roulette question', () => {
    vi.useFakeTimers()
    window.location.hash = '#/quiz'
    const view = render(<App />)
    fireEvent.click(screen.getByRole('radio', { name: /Roleta/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }))
    expect(screen.getByText('Primeira pergunta')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Girar a roleta' }))

    const pending = window.sessionStorage.getItem('conhecendo-direitos:quiz-session')
    expect(pending).not.toBeNull()
    if (!pending) throw new Error('O resultado pendente da roleta não foi salvo.')
    expect(JSON.parse(pending)).toHaveProperty('pendingWheelResult')
    const rotor = view.container.querySelector('.wheel-rotor')
    expect(rotor).not.toBeNull()
    if (!rotor) throw new Error('A roleta não foi renderizada.')
    act(() => {
      fireEvent.transitionEnd(rotor)
      vi.advanceTimersByTime(5200)
    })

    expect(screen.getByRole('button', { name: 'OK' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    act(() => vi.advanceTimersByTime(350))

    expect(screen.getByRole('progressbar', { name: 'Progresso da rodada: 1 de 5' })).toBeTruthy()
    const saved = window.sessionStorage.getItem('conhecendo-direitos:quiz-session')
    expect(saved).not.toBeNull()
    if (!saved) throw new Error('A pergunta sorteada não foi salva.')
    const current = JSON.parse(saved) as { roundIds: string[]; remainingIds: string[]; pendingWheelResult: unknown }
    expect(current.roundIds).toHaveLength(1)
    expect(current.remainingIds).toHaveLength(59)
    expect(current.pendingWheelResult).toBeNull()

    cleanup()
    render(<App />)
    expect(screen.getByRole('progressbar', { name: 'Progresso da rodada: 1 de 5' })).toBeTruthy()
  })

  it('reveals answers, awards multiple teams, and shows the team result', () => {
    window.location.hash = '#/quiz'
    render(<App />)
    fireEvent.click(screen.getByRole('switch', { name: 'Ativar pontuação por equipes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByText('Questão 1 de 9')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Revelar resposta' }))
    expect(screen.getByText(/Gabarito:/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Equipe 1 · 0 pontos' }))
    fireEvent.click(screen.getByRole('button', { name: 'Equipe 2 · 0 pontos' }))
    expect(screen.getByRole('button', { name: /Equipe 1 · [1-3] ponto/ })).toBeTruthy()

    for (let index = 0; index < 8; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
      fireEvent.click(screen.getByRole('button', { name: 'Revelar resposta' }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(screen.getByRole('heading', { name: 'Rodada concluída' })).toBeTruthy()
    expect(screen.getByRole('contentinfo', { name: 'Créditos' }).textContent).toContain(DEVELOPER)
    expect(screen.getByText('Equipe 1')).toBeTruthy()
    expect(screen.getByText('Equipe 2')).toBeTruthy()
  })

  it('scores participant answers and restores them after remounting', () => {
    window.location.hash = '#/quiz'
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Modo participante' }))
    fireEvent.click(screen.getByRole('button', { name: /^A / }))
    expect(screen.getByText(/Fundamento legal:/)).toBeTruthy()
    expect(screen.getByText(/Você acertou|Resposta incorreta/)).toBeTruthy()

    cleanup()
    render(<App />)
    expect((screen.getByRole('switch', { name: 'Modo participante' }) as HTMLInputElement).checked).toBe(true)
    expect(screen.getByText(/Fundamento legal:/)).toBeTruthy()
    for (let index = 0; index < 8; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
      fireEvent.click(screen.getByRole('button', { name: /^A / }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(screen.getByText('Sua pontuação')).toBeTruthy()
  })

  it('toggles and persists projection mode', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: 'Modo projeção: desligado' })
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains('projection-mode')).toBe(true)
    expect(window.localStorage.getItem(projectionKey)).toBe('true')
    expect(screen.getByRole('button', { name: 'Modo projeção: ligado' })).toBeTruthy()
  })

  it('restores projection mode from local storage', () => {
    window.localStorage.setItem(projectionKey, 'true')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Modo projeção: ligado' })).toBeTruthy()
    expect(document.documentElement.classList.contains('projection-mode')).toBe(true)
  })
})
