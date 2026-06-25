import { reactive, readonly } from 'vue'
import { playerRepository } from '../repositories/playerRepository.js'
import { getUtcDateKey } from '../services/dailyChallengeService.js'

const state = reactive({
  attempts: 0,
  completed: 0,
  byMode: {},
  personalBests: {},
  currentDailyStreak: 0,
  longestDailyStreak: 0,
  dailyCompletion: null,
  dailyProgress: null
})

function refreshStats(date = new Date()) {
  const dateKey = getUtcDateKey(date)
  const stats = playerRepository.getStats(date)

  state.attempts = stats.attempts
  state.completed = stats.completed
  state.byMode = { ...stats.byMode }
  state.personalBests = { ...stats.personalBests }
  state.currentDailyStreak = stats.currentDailyStreak
  state.longestDailyStreak = stats.longestDailyStreak
  state.dailyCompletion = playerRepository.getDailyCompletion(dateKey)
  state.dailyProgress = playerRepository.getDailyProgress(dateKey)

  return readonly(state)
}

export function usePlayerStats() {
  return {
    stats: readonly(state),
    refreshStats
  }
}
