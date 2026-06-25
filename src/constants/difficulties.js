export const DIFFICULTIES = Object.freeze({
  easy: Object.freeze({
    key: 'easy',
    label: 'Easy',
    blanks: 25,
    description: 'A relaxed grid with plenty of clues.'
  }),
  medium: Object.freeze({
    key: 'medium',
    label: 'Medium',
    blanks: 40,
    description: 'Fewer clues and more room to reason.'
  }),
  hard: Object.freeze({
    key: 'hard',
    label: 'Hard',
    blanks: 50,
    description: 'A sparse grid built for patient solvers.'
  })
})

export const DIFFICULTY_OPTIONS = Object.freeze(Object.values(DIFFICULTIES))

export function normalizeDifficulty(value) {
  return DIFFICULTIES[value] ? value : 'easy'
}
