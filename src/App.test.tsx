// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the brand and provisional content', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Conhecendo Direitos' })).toBeTruthy()
    expect(screen.getByText(/aprender e conversar/i)).toBeTruthy()
  })
})
