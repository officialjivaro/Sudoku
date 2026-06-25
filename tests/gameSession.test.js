import test from 'node:test'
import assert from 'node:assert/strict'
import { createGameSession } from '../src/composables/useGameSession.js'
import { createLocalStoragePlayerRepository } from '../src/repositories/localStoragePlayerRepository.js'

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
]

function clone(grid) {
  return grid.map(row => [...row])
}

function createGenerator(blankCells = [[0, 0], [0, 1]]) {
  return difficulty => {
    const puzzle = clone(solution)

    for (const [row, column] of blankCells) {
      puzzle[row][column] = 0
    }

    return { difficulty, puzzle, solution: clone(solution) }
  }
}

function createFakeStorage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  }
}

function createSession(options = {}) {
  let currentTime = options.currentTime ?? 1_000_000
  const repository = options.repository || createLocalStoragePlayerRepository(createFakeStorage())
  const session = createGameSession({
    repository,
    now: () => currentTime,
    getDateKey: () => '2026-06-24',
    generatePuzzle: options.generatePuzzle || createGenerator()
  })

  return {
    ...session,
    repository,
    advance(milliseconds) {
      currentTime += milliseconds
    }
  }
}

test('selection, notes, erase, undo, and redo work together', () => {
  const session = createSession()
  session.startGame({ mode: 'classic', difficulty: 'easy' })
  session.selectCell(0, 0)
  session.toggleNotesMode()
  session.enterDigit(2)

  assert.deepEqual(session.game.notes[0][0], [2])
  assert.equal(session.game.entries[0][0], 0)

  session.undo()
  assert.deepEqual(session.game.notes[0][0], [])

  session.redo()
  assert.deepEqual(session.game.notes[0][0], [2])

  session.eraseSelected()
  assert.deepEqual(session.game.notes[0][0], [])
})

test('wrong entries count mistakes and undo does not refund them', () => {
  const session = createSession()
  session.startGame({ mode: 'classic', difficulty: 'easy' })
  session.selectCell(0, 0)
  session.enterDigit(2)

  assert.equal(session.game.mistakes, 1)
  session.undo()
  assert.equal(session.game.entries[0][0], 0)
  assert.equal(session.game.mistakes, 1)
})

test('Zen Mode hides mistake tracking behavior', () => {
  const session = createSession()
  session.startGame({ mode: 'zen', difficulty: 'easy' })
  session.selectCell(0, 0)
  session.enterDigit(2)

  assert.equal(session.game.mistakes, 0)
})

test('hints reveal cells, consume the allowance, and can finish a puzzle', () => {
  const session = createSession({ generatePuzzle: createGenerator([[0, 0]]) })
  session.startGame({ mode: 'classic', difficulty: 'easy' })
  session.selectCell(0, 0)

  assert.equal(session.useHint(), true)
  assert.equal(session.game.entries[0][0], 5)
  assert.equal(session.game.hintsRemaining, 2)
  assert.equal(session.game.hintsUsed, 1)
  assert.equal(session.game.status, 'completed')
})

test('Sprint expiry freezes the session and records an expired result', () => {
  const session = createSession()
  session.startGame({ mode: 'sprint', difficulty: 'hard' })
  session.advance(7 * 60 * 1000)
  session.expireGame()

  assert.equal(session.game.status, 'expired')
  assert.equal(session.game.lastResult.completionReason, 'expired')
})

test('Daily progress resumes from local storage', () => {
  const repository = createLocalStoragePlayerRepository(createFakeStorage())
  const first = createSession({ repository })

  first.startGame({ mode: 'daily', dateKey: '2026-06-24' })
  first.selectCell(0, 0)
  first.enterDigit(2)
  first.abandonGame({ preserveDaily: true })

  const second = createSession({ repository })
  second.startGame({ mode: 'daily', dateKey: '2026-06-24' })

  assert.equal(second.game.entries[0][0], 2)
  assert.equal(second.game.mistakes, 1)
})

test('verified online run metadata survives through completion', () => {
  const session = createSession({ generatePuzzle: createGenerator([[0, 0]]) })
  const clientRunId = '11111111-1111-4111-8111-111111111111'
  const runToken = '22222222-2222-4222-8222-222222222222'

  session.startGame({
    mode: 'classic',
    difficulty: 'easy',
    clientRunId,
    onlineRun: {
      runId: '33333333-3333-4333-8333-333333333333',
      runToken,
      clientRunId,
      puzzleId: 'classic-online-test'
    }
  })

  session.selectCell(0, 0)
  session.enterDigit(session.game.solution[0][0])

  assert.equal(session.game.status, 'completed')
  assert.equal(session.game.lastResult.clientRunId, clientRunId)
  assert.equal(session.game.lastResult.onlineRunToken, runToken)
  assert.equal(session.game.lastResult.onlineVerified, true)
  assert.deepEqual(session.game.lastResult.finalEntries, session.game.solution)
})
