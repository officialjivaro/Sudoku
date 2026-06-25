export const QUANTA_CURRENCY = Object.freeze({
  name: 'Quanta',
  symbol: 'Q'
})

export const NON_DAILY_REWARD_CAP = 10

export const SUDOKU_QUANTA_REWARDS = Object.freeze({
  classic: Object.freeze({ easy: 1, medium: 2, hard: 3 }),
  daily: Object.freeze({ easy: 4, medium: 4, hard: 4 }),
  sprint: Object.freeze({ easy: 2, medium: 3, hard: 4 }),
  zen: Object.freeze({ easy: 1, medium: 1, hard: 1 })
})

export function getSudokuQuantaReward(mode, difficulty) {
  return Number(SUDOKU_QUANTA_REWARDS[mode]?.[difficulty] || 0)
}

export function isRewardEligible(result) {
  return Boolean(result && result.status === 'completed' && result.completionReason === 'solved')
}

export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}
