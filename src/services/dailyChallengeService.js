import { createSeededRandom } from '../utils/seededRandom.js'

const DAILY_VERSION = 1

export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function getDailySeed(dateKey = getUtcDateKey()) {
  return `sudoku-daily-v${DAILY_VERSION}-${dateKey}`
}

export function getDailyPuzzleId(dateKey = getUtcDateKey()) {
  return `daily-${dateKey}-v${DAILY_VERSION}`
}

export function createDailyRandom(dateKey = getUtcDateKey()) {
  return createSeededRandom(getDailySeed(dateKey))
}
