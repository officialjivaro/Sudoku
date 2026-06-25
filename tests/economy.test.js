import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getSudokuQuantaReward,
  isRewardEligible,
  NON_DAILY_REWARD_CAP
} from '../src/constants/economy.js'

test('Sudoku Quanta rewards follow mode and difficulty rules', () => {
  assert.equal(getSudokuQuantaReward('classic', 'easy'), 1)
  assert.equal(getSudokuQuantaReward('classic', 'medium'), 2)
  assert.equal(getSudokuQuantaReward('classic', 'hard'), 3)
  assert.equal(getSudokuQuantaReward('daily', 'medium'), 4)
  assert.equal(getSudokuQuantaReward('sprint', 'easy'), 2)
  assert.equal(getSudokuQuantaReward('sprint', 'medium'), 3)
  assert.equal(getSudokuQuantaReward('sprint', 'hard'), 4)
  assert.equal(getSudokuQuantaReward('zen', 'hard'), 1)
  assert.equal(NON_DAILY_REWARD_CAP, 10)
})

test('only solved completed results qualify for rewards', () => {
  assert.equal(isRewardEligible({ status: 'completed', completionReason: 'solved' }), true)
  assert.equal(isRewardEligible({ status: 'expired', completionReason: 'expired' }), false)
  assert.equal(isRewardEligible({ status: 'completed', completionReason: 'abandoned' }), false)
})
