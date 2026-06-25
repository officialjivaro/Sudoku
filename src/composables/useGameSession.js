import { reactive, readonly } from 'vue'
import { DIFFICULTIES, normalizeDifficulty } from '../constants/difficulties.js'
import {
  GAME_MODES,
  getSprintDuration,
  normalizeGameMode,
  resolveModeDifficulty
} from '../constants/gameModes.js'
import { playerRepository } from '../repositories/playerRepository.js'
import {
  createDailyRandom,
  getDailyPuzzleId,
  getUtcDateKey
} from '../services/dailyChallengeService.js'
import { cloneGrid, generateSudoku } from '../services/sudokuEngine.js'
import { createId } from '../utils/createId.js'

const GRID_SIZE = 9
const HISTORY_LIMIT = 100

// State Helpers | Create and validate serializable game data.
function createNotesGrid() {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => [])
  )
}

function cloneNotes(notes) {
  return notes.map(row => row.map(cell => [...cell]))
}

function createInitialState() {
  return {
    status: 'idle',
    mode: 'classic',
    difficulty: 'easy',
    puzzleId: null,
    dailyDate: null,
    clientRunId: null,
    onlineRunId: null,
    onlineRunToken: null,
    onlineVerified: false,
    puzzle: [],
    solution: [],
    entries: [],
    notes: [],
    selectedCell: null,
    notesMode: false,
    mistakes: 0,
    hintsRemaining: 3,
    hintsUsed: 0,
    hintedCells: [],
    history: [],
    future: [],
    startedAt: null,
    deadline: null,
    completedAt: null,
    elapsedSeconds: 0,
    completionReason: null,
    lastResult: null
  }
}

function isGrid(value) {
  return Array.isArray(value) &&
    value.length === GRID_SIZE &&
    value.every(row => Array.isArray(row) && row.length === GRID_SIZE)
}

function isNotesGrid(value) {
  return isGrid(value) && value.every(row => row.every(cell => Array.isArray(cell)))
}

function normalizeStartOptions(value) {
  if (typeof value === 'string') {
    if (GAME_MODES[value]) {
      return { mode: value }
    }

    if (DIFFICULTIES[value]) {
      return { mode: 'classic', difficulty: value }
    }
  }

  return value && typeof value === 'object' ? value : {}
}

function cellKey(row, column) {
  return `${row}-${column}`
}

export function createGameSession(options = {}) {
  const repository = options.repository || playerRepository
  const now = options.now || (() => Date.now())
  const generatePuzzle = options.generatePuzzle || generateSudoku
  const getDateKey = options.getDateKey || getUtcDateKey
  const state = reactive(createInitialState())

  function resetState() {
    Object.assign(state, createInitialState())
  }

  function getElapsedSeconds() {
    if (!state.startedAt) {
      return 0
    }

    if (state.status === 'completed' || state.status === 'expired') {
      return state.elapsedSeconds
    }

    return Math.max(0, Math.floor((now() - state.startedAt) / 1000))
  }

  function createHistorySnapshot() {
    return {
      entries: cloneGrid(state.entries),
      notes: cloneNotes(state.notes),
      selectedCell: state.selectedCell ? { ...state.selectedCell } : null
    }
  }

  function restoreHistorySnapshot(snapshot) {
    state.entries = cloneGrid(snapshot.entries)
    state.notes = cloneNotes(snapshot.notes)
    state.selectedCell = snapshot.selectedCell ? { ...snapshot.selectedCell } : null
  }

  function pushHistory() {
    state.history.push(createHistorySnapshot())

    if (state.history.length > HISTORY_LIMIT) {
      state.history.shift()
    }

    state.future = []
  }

  function createDailyProgress() {
    return {
      version: 1,
      mode: state.mode,
      difficulty: state.difficulty,
      puzzleId: state.puzzleId,
      dailyDate: state.dailyDate,
      clientRunId: state.clientRunId,
      onlineRunId: state.onlineRunId,
      onlineRunToken: state.onlineRunToken,
      onlineVerified: state.onlineVerified,
      puzzle: cloneGrid(state.puzzle),
      solution: cloneGrid(state.solution),
      entries: cloneGrid(state.entries),
      notes: cloneNotes(state.notes),
      selectedCell: state.selectedCell ? { ...state.selectedCell } : null,
      notesMode: state.notesMode,
      mistakes: state.mistakes,
      hintsRemaining: state.hintsRemaining,
      hintsUsed: state.hintsUsed,
      hintedCells: [...state.hintedCells],
      elapsedSeconds: getElapsedSeconds()
    }
  }

  function persistDailyProgress() {
    if (state.mode !== 'daily' || state.status !== 'active' || !state.dailyDate) {
      return
    }

    repository.saveDailyProgress(state.dailyDate, createDailyProgress())
  }

  function isValidDailyProgress(progress, dateKey) {
    return Boolean(
      progress &&
      progress.version === 1 &&
      progress.dailyDate === dateKey &&
      isGrid(progress.puzzle) &&
      isGrid(progress.solution) &&
      isGrid(progress.entries) &&
      isNotesGrid(progress.notes)
    )
  }

  function restoreDailyProgress(progress) {
    const resumedAt = now()

    state.status = 'active'
    state.mode = 'daily'
    state.difficulty = 'medium'
    state.puzzleId = progress.puzzleId
    state.dailyDate = progress.dailyDate
    state.clientRunId = progress.clientRunId || createId()
    state.onlineRunId = progress.onlineRunId || null
    state.onlineRunToken = progress.onlineRunToken || null
    state.onlineVerified = Boolean(progress.onlineVerified && progress.onlineRunToken)
    state.puzzle = cloneGrid(progress.puzzle)
    state.solution = cloneGrid(progress.solution)
    state.entries = cloneGrid(progress.entries)
    state.notes = cloneNotes(progress.notes)
    state.selectedCell = progress.selectedCell ? { ...progress.selectedCell } : null
    state.notesMode = Boolean(progress.notesMode)
    state.mistakes = Number.isInteger(progress.mistakes) ? progress.mistakes : 0
    state.hintsRemaining = Number.isInteger(progress.hintsRemaining) ? progress.hintsRemaining : 3
    state.hintsUsed = Number.isInteger(progress.hintsUsed) ? progress.hintsUsed : 0
    state.hintedCells = Array.isArray(progress.hintedCells) ? [...progress.hintedCells] : []
    state.history = []
    state.future = []
    state.startedAt = resumedAt - Math.max(0, progress.elapsedSeconds || 0) * 1000
    state.deadline = null
    state.completedAt = null
    state.elapsedSeconds = 0
    state.completionReason = null
    state.lastResult = null
  }

  function showStoredResult(result) {
    resetState()
    state.status = result.status || 'completed'
    state.mode = normalizeGameMode(result.mode)
    state.difficulty = normalizeDifficulty(result.difficulty)
    state.dailyDate = result.dailyDate || null
    state.puzzleId = result.puzzleId || null
    state.clientRunId = result.clientRunId || null
    state.onlineRunId = result.onlineRunId || null
    state.onlineRunToken = null
    state.onlineVerified = Boolean(result.onlineVerified)
    state.elapsedSeconds = Math.max(0, result.elapsedSeconds || 0)
    state.mistakes = Math.max(0, result.mistakes || 0)
    state.hintsUsed = Math.max(0, result.hintsUsed || 0)
    state.hintsRemaining = Math.max(0, 3 - state.hintsUsed)
    state.completionReason = result.completionReason || (state.status === 'expired' ? 'expired' : 'solved')
    state.completedAt = result.completedAt || now()
    state.lastResult = { ...result }
  }

  // Session Lifecycle | Start, resume, finish, and abandon puzzles.
  function startGame(value = {}) {
    const startOptions = normalizeStartOptions(value)
    const mode = normalizeGameMode(startOptions.mode)
    const difficulty = resolveModeDifficulty(mode, startOptions.difficulty)
    const modeConfig = GAME_MODES[mode]
    const dailyDate = mode === 'daily' ? (startOptions.dateKey || getDateKey(new Date(now()))) : null

    if (mode === 'daily' && !startOptions.forceNew) {
      const completedResult = repository.getDailyCompletion(dailyDate)

      if (completedResult) {
        showStoredResult(completedResult)
        return { completedResult }
      }

      const savedProgress = repository.getDailyProgress(dailyDate)

      if (isValidDailyProgress(savedProgress, dailyDate)) {
        restoreDailyProgress(savedProgress)
        return { resumed: true }
      }
    }

    const random = mode === 'daily' ? createDailyRandom(dailyDate) : Math.random
    const preparedPuzzle = startOptions.generatedPuzzle
    const generated = preparedPuzzle && isGrid(preparedPuzzle.puzzle) && isGrid(preparedPuzzle.solution)
      ? {
          difficulty,
          puzzle: cloneGrid(preparedPuzzle.puzzle),
          solution: cloneGrid(preparedPuzzle.solution)
        }
      : generatePuzzle(difficulty, { random })
    const serverStartedAt = Date.parse(startOptions.onlineRun?.startedAt || '')
    const startedAt = Number.isFinite(serverStartedAt) ? serverStartedAt : now()

    resetState()
    state.status = 'active'
    state.mode = mode
    state.difficulty = generated.difficulty
    state.puzzleId = startOptions.onlineRun?.puzzleId || (mode === 'daily'
      ? getDailyPuzzleId(dailyDate)
      : `${mode}-${startedAt}-${Math.floor(Math.random() * 1000000)}`)
    state.dailyDate = dailyDate
    state.clientRunId = startOptions.clientRunId || startOptions.onlineRun?.clientRunId || createId()
    state.onlineRunId = startOptions.onlineRun?.runId || null
    state.onlineRunToken = startOptions.onlineRun?.runToken || null
    state.onlineVerified = Boolean(state.onlineRunToken)
    state.puzzle = cloneGrid(generated.puzzle)
    state.solution = cloneGrid(generated.solution)
    state.entries = cloneGrid(generated.puzzle)
    state.notes = createNotesGrid()
    state.hintsRemaining = modeConfig.hintLimit
    state.startedAt = startedAt
    const serverDeadline = Date.parse(startOptions.onlineRun?.deadline || '')
    state.deadline = mode === 'sprint'
      ? (Number.isFinite(serverDeadline) ? serverDeadline : startedAt + getSprintDuration(difficulty) * 1000)
      : null

    persistDailyProgress()
    return generated
  }

  // Selection and Input | Keep all board mutations in one place.
  function selectCell(row, column) {
    if (state.status !== 'active') {
      return false
    }

    if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || row >= GRID_SIZE || column < 0 || column >= GRID_SIZE) {
      return false
    }

    state.selectedCell = { row, column }
    persistDailyProgress()
    return true
  }

  function moveSelection(rowOffset, columnOffset) {
    if (state.status !== 'active') {
      return null
    }

    const current = state.selectedCell || { row: 0, column: 0 }
    const row = (current.row + rowOffset + GRID_SIZE) % GRID_SIZE
    const column = (current.column + columnOffset + GRID_SIZE) % GRID_SIZE
    selectCell(row, column)
    return { row, column }
  }

  function isSelectedCellEditable() {
    const selected = state.selectedCell
    return Boolean(selected && state.puzzle[selected.row]?.[selected.column] === 0)
  }

  function clearPeerNotes(row, column, digit) {
    for (let index = 0; index < GRID_SIZE; index += 1) {
      state.notes[row][index] = state.notes[row][index].filter(value => value !== digit)
      state.notes[index][column] = state.notes[index][column].filter(value => value !== digit)
    }

    const boxRow = Math.floor(row / 3) * 3
    const boxColumn = Math.floor(column / 3) * 3

    for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
      for (let columnOffset = 0; columnOffset < 3; columnOffset += 1) {
        const peerRow = boxRow + rowOffset
        const peerColumn = boxColumn + columnOffset
        state.notes[peerRow][peerColumn] = state.notes[peerRow][peerColumn].filter(value => value !== digit)
      }
    }
  }

  function isPuzzleSolved() {
    if (!isGrid(state.entries) || !isGrid(state.solution)) {
      return false
    }

    return state.entries.every((row, rowIndex) =>
      row.every((value, columnIndex) => value === state.solution[rowIndex][columnIndex])
    )
  }

  function finalizeGame(reason = 'solved') {
    if (state.status !== 'active') {
      return state.lastResult
    }

    const finishedAt = now()
    const resultStatus = reason === 'expired' ? 'expired' : 'completed'
    const elapsedSeconds = Math.max(0, Math.floor((finishedAt - state.startedAt) / 1000))
    const result = {
      id: `${state.puzzleId}-${finishedAt}`,
      status: resultStatus,
      completionReason: reason,
      mode: state.mode,
      difficulty: state.difficulty,
      puzzleId: state.puzzleId,
      dailyDate: state.dailyDate,
      clientRunId: state.clientRunId,
      onlineRunId: state.onlineRunId,
      onlineRunToken: state.onlineRunToken,
      onlineVerified: state.onlineVerified,
      startedAt: state.startedAt,
      completedAt: finishedAt,
      elapsedSeconds,
      timeRemainingSeconds: state.mode === 'sprint' && state.deadline
        ? Math.max(0, Math.floor((state.deadline - finishedAt) / 1000))
        : 0,
      mistakes: state.mistakes,
      hintsUsed: state.hintsUsed,
      finalEntries: cloneGrid(state.entries)
    }
    const localResult = { ...result }
    delete localResult.onlineRunToken
    delete localResult.finalEntries
    const metadata = repository.recordResult(localResult, new Date(finishedAt))

    state.status = resultStatus
    state.completedAt = finishedAt
    state.elapsedSeconds = elapsedSeconds
    state.completionReason = reason
    state.lastResult = { ...result, ...metadata }

    if (state.mode === 'daily' && state.dailyDate) {
      repository.clearDailyProgress(state.dailyDate)
    }

    return state.lastResult
  }

  function enterDigit(digit) {
    if (state.status !== 'active' || !Number.isInteger(digit) || digit < 1 || digit > 9 || !isSelectedCellEditable()) {
      return { changed: false, isSolved: false }
    }

    const { row, column } = state.selectedCell

    if (state.notesMode) {
      if (state.entries[row][column] !== 0) {
        return { changed: false, isSolved: false }
      }

      pushHistory()
      const notes = state.notes[row][column]
      state.notes[row][column] = notes.includes(digit)
        ? notes.filter(value => value !== digit)
        : [...notes, digit].sort((a, b) => a - b)
      persistDailyProgress()
      return { changed: true, isSolved: false }
    }

    if (state.entries[row][column] === digit) {
      return { changed: false, isSolved: false }
    }

    pushHistory()
    state.entries[row][column] = digit
    state.notes[row][column] = []

    const isCorrect = digit === state.solution[row][column]

    if (!isCorrect && GAME_MODES[state.mode].showMistakes) {
      state.mistakes += 1
    }

    if (isCorrect) {
      clearPeerNotes(row, column, digit)
    }

    const isSolved = isCorrect && isPuzzleSolved()

    if (isSolved) {
      finalizeGame('solved')
    } else {
      persistDailyProgress()
    }

    return { changed: true, isCorrect, isSolved }
  }

  function eraseSelected() {
    if (state.status !== 'active' || !isSelectedCellEditable()) {
      return false
    }

    const { row, column } = state.selectedCell
    const hasValue = state.entries[row][column] !== 0
    const hasNotes = state.notes[row][column].length > 0

    if (!hasValue && !hasNotes) {
      return false
    }

    pushHistory()
    state.entries[row][column] = 0
    state.notes[row][column] = []
    persistDailyProgress()
    return true
  }

  function setNotesMode(value) {
    state.notesMode = Boolean(value)
    persistDailyProgress()
  }

  function toggleNotesMode() {
    setNotesMode(!state.notesMode)
  }

  // History and Hints | Restore player actions without refunding mistakes or hints.
  function undo() {
    if (state.status !== 'active' || state.history.length === 0) {
      return false
    }

    const previous = state.history.pop()
    state.future.push(createHistorySnapshot())
    restoreHistorySnapshot(previous)
    persistDailyProgress()
    return true
  }

  function redo() {
    if (state.status !== 'active' || state.future.length === 0) {
      return false
    }

    const next = state.future.pop()
    state.history.push(createHistorySnapshot())
    restoreHistorySnapshot(next)
    persistDailyProgress()
    return true
  }

  function findHintCell() {
    if (isSelectedCellEditable()) {
      const { row, column } = state.selectedCell

      if (state.entries[row][column] !== state.solution[row][column]) {
        return { row, column }
      }
    }

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let column = 0; column < GRID_SIZE; column += 1) {
        if (state.puzzle[row][column] === 0 && state.entries[row][column] !== state.solution[row][column]) {
          return { row, column }
        }
      }
    }

    return null
  }

  function useHint() {
    if (state.status !== 'active' || state.hintsRemaining <= 0) {
      return false
    }

    const target = findHintCell()

    if (!target) {
      return false
    }

    const digit = state.solution[target.row][target.column]
    state.selectedCell = target
    state.entries[target.row][target.column] = digit
    state.notes[target.row][target.column] = []
    state.hintsRemaining -= 1
    state.hintsUsed += 1
    state.history = []
    state.future = []

    const key = cellKey(target.row, target.column)

    if (!state.hintedCells.includes(key)) {
      state.hintedCells.push(key)
    }

    clearPeerNotes(target.row, target.column, digit)

    if (isPuzzleSolved()) {
      finalizeGame('solved')
    } else {
      persistDailyProgress()
    }

    return true
  }

  function attachOnlineRun(onlineRun) {
    if (state.status !== 'active' || !onlineRun?.runToken) {
      return false
    }

    if (onlineRun.puzzleId && state.puzzleId && onlineRun.puzzleId !== state.puzzleId) {
      return false
    }

    state.clientRunId = onlineRun.clientRunId || state.clientRunId || createId()
    state.onlineRunId = onlineRun.runId || null
    state.onlineRunToken = onlineRun.runToken
    state.onlineVerified = true
    persistDailyProgress()
    return true
  }

  function expireGame() {
    return finalizeGame('expired')
  }

  function abandonGame(options = {}) {
    if (options.preserveDaily !== false) {
      persistDailyProgress()
    }

    resetState()
  }

  return {
    game: readonly(state),
    startGame,
    showStoredResult,
    attachOnlineRun,
    selectCell,
    moveSelection,
    enterDigit,
    eraseSelected,
    setNotesMode,
    toggleNotesMode,
    undo,
    redo,
    useHint,
    expireGame,
    abandonGame,
    isPuzzleSolved,
    getElapsedSeconds
  }
}

const defaultSession = createGameSession()

export function useGameSession() {
  return defaultSession
}
