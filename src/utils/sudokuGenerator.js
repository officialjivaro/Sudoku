export default function generateSudoku(difficulty = 'easy') {
  const solved = createSolvedGrid()
  const puzzle = structuredClone(solved)

  const removeCount = getRemoveCount(difficulty)
  removeCells(puzzle, removeCount)

  return { puzzle, solved }
}

function createSolvedGrid() {
  const baseGrid = [
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
  return baseGrid
}

function getRemoveCount(difficulty) {
  switch (difficulty) {
    case 'easy':
      return 25 
    case 'medium':
      return 40
    case 'hard':
      return 55 
    default:
      return 40
  }
}

function removeCells(grid, count) {
  let removed = 0
  while (removed < count) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (grid[row][col] !== 0) {
      grid[row][col] = 0
      removed++
    }
  }
}
