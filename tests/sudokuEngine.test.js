import test from 'node:test'
import assert from 'node:assert/strict'
import { DIFFICULTIES } from '../src/constants/difficulties.js'
import {
  countSolutions,
  generateSudoku,
  isSolvedGridValid,
  solveSudoku
} from '../src/services/sudokuEngine.js'

for (const difficulty of Object.keys(DIFFICULTIES)) {
  test(`${difficulty} puzzles are valid and uniquely solvable`, () => {
    const generated = generateSudoku(difficulty)
    const blanks = generated.puzzle.flat().filter(value => value === 0).length

    assert.equal(generated.difficulty, difficulty)
    assert.equal(blanks, DIFFICULTIES[difficulty].blanks)
    assert.equal(countSolutions(generated.puzzle), 1)
    assert.equal(isSolvedGridValid(generated.solution), true)
  })
}

test('the solver reconstructs the unique generated solution', () => {
  const generated = generateSudoku('hard')
  assert.deepEqual(solveSudoku(generated.puzzle), generated.solution)
})

test('difficulty levels remove progressively more cells', () => {
  assert.ok(DIFFICULTIES.easy.blanks < DIFFICULTIES.medium.blanks)
  assert.ok(DIFFICULTIES.medium.blanks < DIFFICULTIES.hard.blanks)
})


test('seeded generation is deterministic', async () => {
  const { createSeededRandom } = await import('../src/utils/seededRandom.js')
  const first = generateSudoku('medium', { random: createSeededRandom('repeatable') })
  const second = generateSudoku('medium', { random: createSeededRandom('repeatable') })

  assert.deepEqual(first.puzzle, second.puzzle)
  assert.deepEqual(first.solution, second.solution)
})
