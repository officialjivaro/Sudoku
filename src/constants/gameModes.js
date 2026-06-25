import { normalizeDifficulty } from './difficulties.js'

export const GAME_MODES = Object.freeze({
  classic: Object.freeze({
    key: 'classic',
    label: 'Classic',
    shortLabel: 'Classic',
    description: 'Traditional Sudoku with a timer, mistakes, notes, and hints.',
    timerType: 'elapsed',
    showTimer: true,
    showMistakes: true,
    immediateErrors: true,
    fixedDifficulty: null,
    hintLimit: 3,
    persistProgress: false
  }),
  daily: Object.freeze({
    key: 'daily',
    label: 'Daily Challenge',
    shortLabel: 'Daily',
    description: 'One shared UTC puzzle each day with resumable local progress.',
    timerType: 'elapsed',
    showTimer: true,
    showMistakes: true,
    immediateErrors: true,
    fixedDifficulty: 'medium',
    hintLimit: 3,
    persistProgress: true
  }),
  sprint: Object.freeze({
    key: 'sprint',
    label: 'Timed Sprint',
    shortLabel: 'Sprint',
    description: 'Beat the countdown before the final petal falls.',
    timerType: 'countdown',
    showTimer: true,
    showMistakes: true,
    immediateErrors: true,
    fixedDifficulty: null,
    hintLimit: 3,
    persistProgress: false,
    durations: Object.freeze({
      easy: 15 * 60,
      medium: 10 * 60,
      hard: 7 * 60
    })
  }),
  zen: Object.freeze({
    key: 'zen',
    label: 'Zen Mode',
    shortLabel: 'Zen',
    description: 'No visible timer or mistake count. Solve at your own pace.',
    timerType: 'hidden',
    showTimer: false,
    showMistakes: false,
    immediateErrors: false,
    fixedDifficulty: null,
    hintLimit: 3,
    persistProgress: false
  })
})

export const GAME_MODE_OPTIONS = Object.freeze(Object.values(GAME_MODES))

export function normalizeGameMode(value) {
  return GAME_MODES[value] ? value : 'classic'
}

export function resolveModeDifficulty(mode, difficulty) {
  const normalizedMode = normalizeGameMode(mode)
  return GAME_MODES[normalizedMode].fixedDifficulty || normalizeDifficulty(difficulty)
}

export function getSprintDuration(difficulty) {
  const normalizedDifficulty = normalizeDifficulty(difficulty)
  return GAME_MODES.sprint.durations[normalizedDifficulty]
}
