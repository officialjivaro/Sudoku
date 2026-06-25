import test from 'node:test'
import assert from 'node:assert/strict'
import { createLocalStoragePlayerRepository } from '../src/repositories/localStoragePlayerRepository.js'

function createFakeStorage() {
  const values = new Map()

  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  }
}

function dailyResult(date, elapsedSeconds = 600) {
  return {
    id: `daily-${date}`,
    status: 'completed',
    completionReason: 'solved',
    mode: 'daily',
    difficulty: 'medium',
    puzzleId: `daily-${date}`,
    dailyDate: date,
    elapsedSeconds,
    mistakes: 0,
    hintsUsed: 0,
    completedAt: Date.parse(`${date}T12:00:00Z`)
  }
}

test('Daily progress can be saved, read, and cleared', () => {
  const repository = createLocalStoragePlayerRepository(createFakeStorage())
  const progress = { version: 1, dailyDate: '2026-06-24', entries: [[1]] }

  repository.saveDailyProgress('2026-06-24', progress)
  assert.deepEqual(repository.getDailyProgress('2026-06-24'), progress)

  repository.clearDailyProgress('2026-06-24')
  assert.equal(repository.getDailyProgress('2026-06-24'), null)
})

test('results update personal bests without replacing slower records', () => {
  const repository = createLocalStoragePlayerRepository(createFakeStorage())
  const base = {
    status: 'completed',
    completionReason: 'solved',
    mode: 'classic',
    difficulty: 'easy',
    mistakes: 0,
    hintsUsed: 0,
    completedAt: Date.now()
  }

  assert.equal(repository.recordResult({ ...base, id: 'one', elapsedSeconds: 300 }).isPersonalBest, true)
  assert.equal(repository.recordResult({ ...base, id: 'two', elapsedSeconds: 360 }).isPersonalBest, false)
  assert.equal(repository.recordResult({ ...base, id: 'three', elapsedSeconds: 240 }).isPersonalBest, true)
  assert.equal(repository.getStats().personalBests['classic:easy'], 240)
})

test('Daily streaks count consecutive UTC dates', () => {
  const repository = createLocalStoragePlayerRepository(createFakeStorage())

  repository.recordResult(dailyResult('2026-06-22'), new Date('2026-06-22T12:00:00Z'))
  repository.recordResult(dailyResult('2026-06-23'), new Date('2026-06-23T12:00:00Z'))
  const metadata = repository.recordResult(dailyResult('2026-06-24'), new Date('2026-06-24T12:00:00Z'))

  assert.equal(metadata.currentDailyStreak, 3)
  assert.equal(metadata.longestDailyStreak, 3)
  assert.equal(repository.getDailyCompletion('2026-06-24').dailyDate, '2026-06-24')
})

test('corrupt local data is ignored without breaking statistics', () => {
  const storage = createFakeStorage()
  storage.setItem('sudoku-player-v1', JSON.stringify({
    version: 1,
    results: [null, { status: 'completed', mode: 'classic', difficulty: 'easy', elapsedSeconds: 120 }],
    dailyProgress: [],
    dailyCompletions: { invalid: null }
  }))
  const repository = createLocalStoragePlayerRepository(storage)

  assert.equal(repository.getStats().completed, 1)
  assert.equal(repository.getDailyProgress('invalid'), null)
})

test('storage write failures fall back to in-memory progress for the session', () => {
  const storage = {
    getItem: () => null,
    setItem: () => { throw new Error('Storage is blocked') },
    removeItem: () => { throw new Error('Storage is blocked') }
  }
  const repository = createLocalStoragePlayerRepository(storage)
  const progress = { version: 1, dailyDate: '2026-06-24', entries: [[1]] }

  repository.saveDailyProgress('2026-06-24', progress)
  assert.deepEqual(repository.getDailyProgress('2026-06-24'), progress)
  repository.reset()
  assert.equal(repository.getDailyProgress('2026-06-24'), null)
})
