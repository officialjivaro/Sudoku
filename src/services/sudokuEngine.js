import { DIFFICULTIES, normalizeDifficulty } from '../constants/difficulties.js'

const SIZE = 9
const BOX_SIZE = 3
const EMPTY = 0
const DIGITS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9])

function shuffle(values, random = Math.random) {
  const result = [...values]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }

  return result
}

function pattern(row, column) {
  return (BOX_SIZE * (row % BOX_SIZE) + Math.floor(row / BOX_SIZE) + column) % SIZE
}

function createIndexOrder(random) {
  return shuffle([0, 1, 2], random).flatMap(group =>
    shuffle([0, 1, 2], random).map(index => group * BOX_SIZE + index)
  )
}

export function createSolvedGrid(random = Math.random) {
  const rows = createIndexOrder(random)
  const columns = createIndexOrder(random)
  const numbers = shuffle(DIGITS, random)

  return rows.map(row => columns.map(column => numbers[pattern(row, column)]))
}

export function cloneGrid(grid) {
  return grid.map(row => [...row])
}

function getCandidates(grid, row, column) {
  const used = new Set()

  for (let index = 0; index < SIZE; index += 1) {
    used.add(grid[row][index])
    used.add(grid[index][column])
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxColumn = Math.floor(column / BOX_SIZE) * BOX_SIZE

  for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < BOX_SIZE; columnOffset += 1) {
      used.add(grid[boxRow + rowOffset][boxColumn + columnOffset])
    }
  }

  return DIGITS.filter(number => !used.has(number))
}

function findBestEmptyCell(grid) {
  let bestCell = null

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      if (grid[row][column] !== EMPTY) {
        continue
      }

      const candidates = getCandidates(grid, row, column)

      if (candidates.length === 0) {
        return { row, column, candidates }
      }

      if (!bestCell || candidates.length < bestCell.candidates.length) {
        bestCell = { row, column, candidates }

        if (candidates.length === 1) {
          return bestCell
        }
      }
    }
  }

  return bestCell
}

export function countSolutions(grid, limit = 2) {
  const workingGrid = cloneGrid(grid)

  function search() {
    const cell = findBestEmptyCell(workingGrid)

    if (!cell) {
      return 1
    }

    if (cell.candidates.length === 0) {
      return 0
    }

    let solutions = 0

    for (const candidate of cell.candidates) {
      workingGrid[cell.row][cell.column] = candidate
      solutions += search()
      workingGrid[cell.row][cell.column] = EMPTY

      if (solutions >= limit) {
        return solutions
      }
    }

    return solutions
  }

  return search()
}

export function solveSudoku(grid) {
  const workingGrid = cloneGrid(grid)

  function search() {
    const cell = findBestEmptyCell(workingGrid)

    if (!cell) {
      return true
    }

    if (cell.candidates.length === 0) {
      return false
    }

    for (const candidate of cell.candidates) {
      workingGrid[cell.row][cell.column] = candidate

      if (search()) {
        return true
      }

      workingGrid[cell.row][cell.column] = EMPTY
    }

    return false
  }

  return search() ? workingGrid : null
}

function carvePuzzle(solution, targetBlanks, random) {
  const puzzle = cloneGrid(solution)
  const positions = shuffle(Array.from({ length: SIZE * SIZE }, (_, index) => index), random)
  let removed = 0

  for (const position of positions) {
    if (removed >= targetBlanks) {
      break
    }

    const row = Math.floor(position / SIZE)
    const column = position % SIZE
    const previousValue = puzzle[row][column]

    puzzle[row][column] = EMPTY

    if (countSolutions(puzzle) === 1) {
      removed += 1
    } else {
      puzzle[row][column] = previousValue
    }
  }

  return removed === targetBlanks ? puzzle : null
}

export function generateSudoku(difficulty = 'easy', options = {}) {
  const normalizedDifficulty = normalizeDifficulty(difficulty)
  const targetBlanks = DIFFICULTIES[normalizedDifficulty].blanks
  const random = typeof options.random === 'function' ? options.random : Math.random
  const maxAttempts = Number.isInteger(options.maxAttempts) ? options.maxAttempts : 30

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const solution = createSolvedGrid(random)
    const puzzle = carvePuzzle(solution, targetBlanks, random)

    if (puzzle) {
      return {
        difficulty: normalizedDifficulty,
        puzzle,
        solution,
        blanks: targetBlanks,
        clues: SIZE * SIZE - targetBlanks
      }
    }
  }

  throw new Error(`Unable to generate a ${normalizedDifficulty} Sudoku puzzle.`)
}

export function isSolvedGridValid(grid) {
  if (!Array.isArray(grid) || grid.length !== SIZE) {
    return false
  }

  const expected = DIGITS.join(',')
  const isCompleteSet = values => [...values].sort((a, b) => a - b).join(',') === expected

  for (let index = 0; index < SIZE; index += 1) {
    const row = grid[index]
    const column = grid.map(currentRow => currentRow[index])

    if (!Array.isArray(row) || row.length !== SIZE || !isCompleteSet(row) || !isCompleteSet(column)) {
      return false
    }
  }

  for (let boxRow = 0; boxRow < BOX_SIZE; boxRow += 1) {
    for (let boxColumn = 0; boxColumn < BOX_SIZE; boxColumn += 1) {
      const values = []

      for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
        for (let columnOffset = 0; columnOffset < BOX_SIZE; columnOffset += 1) {
          values.push(grid[boxRow * BOX_SIZE + rowOffset][boxColumn * BOX_SIZE + columnOffset])
        }
      }

      if (!isCompleteSet(values)) {
        return false
      }
    }
  }

  return true
}
