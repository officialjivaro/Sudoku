import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createDailyRandom,
  getDailyPuzzleId,
  getDailySeed,
  getUtcDateKey
} from '../src/services/dailyChallengeService.js'
import { generateSudoku } from '../src/services/sudokuEngine.js'

test('UTC date keys are stable', () => {
  assert.equal(getUtcDateKey(new Date('2026-06-24T23:59:59Z')), '2026-06-24')
  assert.equal(getUtcDateKey(new Date('2026-06-25T00:00:00Z')), '2026-06-25')
})

test('the same date creates the same seed and puzzle identity', () => {
  assert.equal(getDailySeed('2026-06-24'), getDailySeed('2026-06-24'))
  assert.equal(getDailyPuzzleId('2026-06-24'), getDailyPuzzleId('2026-06-24'))
  assert.notEqual(getDailySeed('2026-06-24'), getDailySeed('2026-06-25'))
})

test('the same Daily date generates the same Sudoku puzzle', () => {
  const first = generateSudoku('medium', { random: createDailyRandom('2026-06-24') })
  const second = generateSudoku('medium', { random: createDailyRandom('2026-06-24') })

  assert.deepEqual(first.puzzle, second.puzzle)
  assert.deepEqual(first.solution, second.solution)
})

test('different Daily dates generate different puzzles', () => {
  const first = generateSudoku('medium', { random: createDailyRandom('2026-06-24') })
  const second = generateSudoku('medium', { random: createDailyRandom('2026-06-25') })

  assert.notDeepEqual(first.puzzle, second.puzzle)
})
