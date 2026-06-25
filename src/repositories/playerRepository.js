import { createLocalStoragePlayerRepository } from './localStoragePlayerRepository.js'

function getBrowserStorage() {
  if (typeof window === 'undefined') return undefined

  try {
    return window.localStorage || undefined
  } catch {
    return undefined
  }
}

let activeRepository = createLocalStoragePlayerRepository(getBrowserStorage())

export function configurePlayerRepository(repository) {
  activeRepository = repository
}

export const playerRepository = {
  getResults: (...args) => activeRepository.getResults(...args),
  getStats: (...args) => activeRepository.getStats(...args),
  getDailyProgress: (...args) => activeRepository.getDailyProgress(...args),
  saveDailyProgress: (...args) => activeRepository.saveDailyProgress(...args),
  clearDailyProgress: (...args) => activeRepository.clearDailyProgress(...args),
  getDailyCompletion: (...args) => activeRepository.getDailyCompletion(...args),
  getDailyCompletions: (...args) => activeRepository.getDailyCompletions(...args),
  recordResult: (...args) => activeRepository.recordResult(...args)
}
