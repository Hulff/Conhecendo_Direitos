// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

const projectionKey = 'conhecendo-direitos:modo-projecao'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  document.documentElement.classList.remove('projection-mode')
  window.location.hash = '#/'
})

describe('application routes and home', () => {
  it('shows the brand, two game modes, and navigates to the stand route', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Conhecendo Direitos' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Detetive dos Direitos (Stand)' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Quiz de Perguntas' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Abrir modo Stand' }))
    expect(screen.getByRole('heading', { name: 'Modo Stand' })).toBeTruthy()
  })

  it('supports direct navigation to each quiz route', () => {
    const routes = [
      ['#/quiz', 'Configurar quiz'],
      ['#/quiz/jogar', 'Quiz'],
      ['#/quiz/resultado', 'Resultado'],
    ] as const

    for (const [path, title] of routes) {
      window.location.hash = path
      const view = render(<App />)
      expect(screen.getByRole('heading', { name: title })).toBeTruthy()
      view.unmount()
    }
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
