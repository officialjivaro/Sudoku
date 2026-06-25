import test from 'node:test'
import assert from 'node:assert/strict'
import { GAME_MODES, getSprintDuration, resolveModeDifficulty } from '../src/constants/gameModes.js'

test('all planned game modes are configured', () => {
  assert.deepEqual(Object.keys(GAME_MODES), ['classic', 'daily', 'sprint', 'zen'])
})

test('Daily Challenge always uses Medium difficulty', () => {
  assert.equal(resolveModeDifficulty('daily', 'easy'), 'medium')
  assert.equal(resolveModeDifficulty('daily', 'hard'), 'medium')
})

test('Sprint countdowns match the product rules', () => {
  assert.equal(getSprintDuration('easy'), 15 * 60)
  assert.equal(getSprintDuration('medium'), 10 * 60)
  assert.equal(getSprintDuration('hard'), 7 * 60)
})

test('Zen hides timer, mistakes, and immediate error feedback', () => {
  assert.equal(GAME_MODES.zen.showTimer, false)
  assert.equal(GAME_MODES.zen.showMistakes, false)
  assert.equal(GAME_MODES.zen.immediateErrors, false)
})
