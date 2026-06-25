import test from 'node:test'
import assert from 'node:assert/strict'
import { buildResultSummary } from '../src/utils/resultSummary.js'

test('completed result summaries include mode, difficulty, time, mistakes, and hints', () => {
  const text = buildResultSummary({
    status: 'completed',
    mode: 'classic',
    difficulty: 'hard',
    elapsedSeconds: 125,
    mistakes: 2,
    hintsUsed: 1
  })

  assert.match(text, /Classic/)
  assert.match(text, /Hard/)
  assert.match(text, /02:05/)
  assert.match(text, /Mistakes 2/)
  assert.match(text, /Hints 1\/3/)
  assert.doesNotMatch(text, /solution/i)
})

test('Zen summaries hide time and mistakes', () => {
  const text = buildResultSummary({
    status: 'completed',
    mode: 'zen',
    difficulty: 'medium',
    elapsedSeconds: 900,
    mistakes: 5,
    hintsUsed: 0
  })

  assert.doesNotMatch(text, /Time/)
  assert.doesNotMatch(text, /Mistakes/)
})

test('expired Sprint summaries report timeout', () => {
  const text = buildResultSummary({
    status: 'expired',
    mode: 'sprint',
    difficulty: 'easy',
    elapsedSeconds: 900,
    mistakes: 0,
    hintsUsed: 0
  })

  assert.match(text, /Time expired/)
})
