import { createLocalStoragePlayerRepository } from './localStoragePlayerRepository.js'

function getBrowserStorage() {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined
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
