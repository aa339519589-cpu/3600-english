import { describe, expect, it, vi } from 'vitest'
import {
  PROGRESS_STORAGE_KEY,
  createDefaultProgress,
  loadProgress,
  markGrammarCompleted,
  markReadingCompleted,
  resetProgress,
  updateVocabularyProgress,
} from './progress'

describe('progress model', () => {
  it('recovers from malformed storage', () => {
    const storage = { getItem: () => '{not-json' }
    expect(loadProgress(storage).version).toBe(1)
    expect(loadProgress(storage).grammar).toEqual({})
  })

  it('merges partial settings with defaults', () => {
    const storage = { getItem: () => JSON.stringify({ preferences: { grammarLevel: 'middle' } }) }
    const progress = loadProgress(storage)
    expect(progress.preferences.grammarLevel).toBe('middle')
    expect(progress.preferences.vocabularyLevel).toBe('basic')
  })

  it('records grammar completion without mutating prior state', () => {
    const initial = createDefaultProgress()
    const next = markGrammarCompleted(initial, 'g-basic-01', true, new Date(2026, 6, 11))
    expect(initial.grammar).toEqual({})
    expect(next.grammar['g-basic-01']).toEqual({ completed: true, attempts: 1, correct: 1 })
    expect(next.activityDates).toEqual(['2026-07-11'])
  })

  it('schedules a correct word further into the future', () => {
    const next = updateVocabularyProgress(createDefaultProgress(), 'w0001', true, {
      now: new Date(2026, 6, 11, 10),
    })
    expect(next.vocabulary.w0001.stage).toBe(1)
    expect(next.vocabulary.w0001.dueAt).toBe('2026-07-12')
  })

  it('records reading completion', () => {
    const next = markReadingCompleted(
      createDefaultProgress(),
      'r-one',
      'answer',
      ['w0001'],
      new Date(2026, 6, 11),
    )
    expect(next.reading['r-one']).toEqual({ completed: true, answer: 'answer', savedWords: ['w0001'] })
  })

  it('removes persisted progress when reset', () => {
    const removeItem = vi.fn()
    const progress = resetProgress({ removeItem })
    expect(removeItem).toHaveBeenCalledWith(PROGRESS_STORAGE_KEY)
    expect(progress).toEqual(createDefaultProgress())
  })
})
