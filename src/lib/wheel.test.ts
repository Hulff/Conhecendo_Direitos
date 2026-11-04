import { describe, expect, it } from 'vitest'
import type { Question } from '@/data/questions'
import { buildWheelSlices, countRemainingBySlice, drawQuestion, spinWheel } from './wheel'

const fixtures: Question[] = [
  { id: 't-e1', area: 'trabalho', level: 'facil', points: 1, text: 'Fixture um', options: ['A', 'B', 'C'], answer: 'A', basis: 'Base um' },
  { id: 't-e2', area: 'trabalho', level: 'facil', points: 1, text: 'Fixture dois', options: ['A', 'B', 'C'], answer: 'B', basis: 'Base dois' },
  { id: 'c-m1', area: 'consumidor', level: 'medio', points: 2, text: 'Fixture três', options: ['A', 'B', 'C'], answer: 'C', basis: 'Base três' },
  { id: 't-d1', area: 'trabalho', level: 'dificil', points: 3, text: 'Fixture quatro', options: ['A', 'B', 'C'], answer: 'A', basis: 'Base quatro' },
]

describe('buildWheelSlices', () => {
  it('builds six equal slices for all areas and three for a single area', () => {
    const all = buildWheelSlices('todas')
    expect(all).toHaveLength(6)
    expect(all[0].startAngle).toBe(0)
    expect(all.at(-1)?.endAngle).toBe(360)
    expect(buildWheelSlices('trabalho')).toHaveLength(3)
    expect(buildWheelSlices('consumidor').every((slice) => slice.area === 'consumidor')).toBe(true)
  })
})

describe('spinWheel', () => {
  it('selects only a slice with remaining questions and aligns the result within it', () => {
    const slices = buildWheelSlices('todas')
    const result = spinWheel({ slices, remaining: fixtures, seed: 90210 })
    expect(result).not.toBeNull()
    if (!result) throw new Error('Expected a wheel result.')
    expect(fixtures.some((question) => question.level === result.level && question.area === result.area)).toBe(true)
    const slice = slices[result.sliceIndex]
    const pointerAngle = ((360 - (result.finalRotation % 360)) % 360)
    expect(pointerAngle).toBeGreaterThanOrEqual(slice.startAngle)
    expect(pointerAngle).toBeLessThanOrEqual(slice.endAngle)
    expect(Math.floor(result.finalRotation / 360)).toBeGreaterThanOrEqual(5)
    expect(Math.floor(result.finalRotation / 360)).toBeLessThanOrEqual(8)
  })

  it('returns null when every slice is exhausted', () => {
    expect(spinWheel({ slices: buildWheelSlices('todas'), remaining: [], seed: 1 })).toBeNull()
  })

  it('marks exhausted slices with zero remaining questions', () => {
    expect(countRemainingBySlice(buildWheelSlices('todas'), fixtures)).toEqual([2, 0, 0, 1, 1, 0])
  })
})

describe('drawQuestion', () => {
  it('removes one selected question and never returns it from the new remaining set', () => {
    const first = drawQuestion(fixtures, 'facil', 'trabalho', 12)
    expect(first.question?.area).toBe('trabalho')
    expect(first.question?.level).toBe('facil')
    expect(first.remaining).toHaveLength(fixtures.length - 1)
    expect(first.remaining.some(({ id }) => id === first.question?.id)).toBe(false)
    const second = drawQuestion(first.remaining, 'facil', 'trabalho', 12)
    expect(second.question?.id).not.toBe(first.question?.id)
    expect(second.remaining).toHaveLength(fixtures.length - 2)
    expect(drawQuestion(second.remaining, 'facil', 'trabalho', 12).question).toBeNull()
  })
})
