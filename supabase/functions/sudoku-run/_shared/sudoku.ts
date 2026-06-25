const SIZE = 9
const BOX_SIZE = 3
const EMPTY = 0
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const BLANKS: Record<string, number> = {
  easy: 25,
  medium: 40,
  hard: 50
}

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function createSeededRandom(seed: string) {
  let state = hashString(seed) || 1

  return function seededRandom() {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(values: T[], random: () => number) {
  const copy = [...values]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

function pattern(row: number, column: number) {
  return (BOX_SIZE * (row % BOX_SIZE) + Math.floor(row / BOX_SIZE) + column) % SIZE
}

function createIndexOrder(random: () => number) {
  return shuffle([0, 1, 2], random).flatMap(group =>
    shuffle([0, 1, 2], random).map(index => group * BOX_SIZE + index)
  )
}

function createSolvedGrid(random: () => number) {
  const rows = createIndexOrder(random)
  const columns = createIndexOrder(random)
  const numbers = shuffle(DIGITS, random)
  return rows.map(row => columns.map(column => numbers[pattern(row, column)]))
}

function cloneGrid(grid: number[][]) {
  return grid.map(row => [...row])
}

function getCandidates(grid: number[][], row: number, column: number) {
  const used = new Set<number>()

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

function findBestEmptyCell(grid: number[][]) {
  let bestCell: { row: number; column: number; candidates: number[] } | null = null

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      if (grid[row][column] !== EMPTY) continue
      const candidates = getCandidates(grid, row, column)

      if (candidates.length === 0) return { row, column, candidates }
      if (!bestCell || candidates.length < bestCell.candidates.length) {
        bestCell = { row, column, candidates }
        if (candidates.length === 1) return bestCell
      }
    }
  }

  return bestCell
}

function countSolutions(grid: number[][], limit = 2) {
  const workingGrid = cloneGrid(grid)

  function search(): number {
    const cell = findBestEmptyCell(workingGrid)
    if (!cell) return 1
    if (cell.candidates.length === 0) return 0

    let solutions = 0

    for (const candidate of cell.candidates) {
      workingGrid[cell.row][cell.column] = candidate
      solutions += search()
      workingGrid[cell.row][cell.column] = EMPTY
      if (solutions >= limit) return solutions
    }

    return solutions
  }

  return search()
}

function carvePuzzle(solution: number[][], targetBlanks: number, random: () => number) {
  const puzzle = cloneGrid(solution)
  const positions = shuffle(Array.from({ length: SIZE * SIZE }, (_, index) => index), random)
  let removed = 0

  for (const position of positions) {
    if (removed >= targetBlanks) break
    const row = Math.floor(position / SIZE)
    const column = position % SIZE
    const previousValue = puzzle[row][column]
    puzzle[row][column] = EMPTY

    if (countSolutions(puzzle) === 1) removed += 1
    else puzzle[row][column] = previousValue
  }

  return removed === targetBlanks ? puzzle : null
}

export function generateSudoku(difficulty: string, random: () => number = Math.random) {
  const normalizedDifficulty = BLANKS[difficulty] ? difficulty : 'easy'
  const targetBlanks = BLANKS[normalizedDifficulty]

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const solution = createSolvedGrid(random)
    const puzzle = carvePuzzle(solution, targetBlanks, random)

    if (puzzle) {
      return { difficulty: normalizedDifficulty, puzzle, solution }
    }
  }

  throw new Error(`Unable to generate a ${normalizedDifficulty} Sudoku puzzle.`)
}

export function isCompleteSolution(entries: unknown, solution: unknown) {
  if (!Array.isArray(entries) || !Array.isArray(solution) || entries.length !== SIZE || solution.length !== SIZE) {
    return false
  }

  for (let row = 0; row < SIZE; row += 1) {
    if (!Array.isArray(entries[row]) || !Array.isArray(solution[row]) || entries[row].length !== SIZE || solution[row].length !== SIZE) {
      return false
    }

    for (let column = 0; column < SIZE; column += 1) {
      if (Number(entries[row][column]) !== Number(solution[row][column])) return false
    }
  }

  return true
}
