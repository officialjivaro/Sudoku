import { readonly, reactive } from 'vue'
import { getUtcDateKey } from '../services/dailyChallengeService.js'
import { fetchSudokuLeaderboard } from '../services/sudokuOnlineService.js'

const state = reactive({
  open: false,
  mode: 'classic',
  difficulty: 'easy',
  dailyDate: getUtcDateKey(),
  entries: [],
  loading: false,
  error: ''
})

async function load(options = {}) {
  state.mode = options.mode || state.mode
  state.difficulty = options.difficulty || state.difficulty
  state.dailyDate = options.dailyDate || getUtcDateKey()
  state.loading = true
  state.error = ''

  try {
    state.entries = await fetchSudokuLeaderboard({
      mode: state.mode,
      difficulty: state.difficulty,
      dailyDate: state.dailyDate,
      limit: 25
    })
  } catch (error) {
    state.entries = []
    state.error = error.message || 'The online rankings could not be loaded.'
  } finally {
    state.loading = false
  }
}

async function open(options = {}) {
  state.open = true
  await load(options)
}

function close() {
  state.open = false
  state.error = ''
}

export function useSudokuLeaderboard() {
  return {
    state: readonly(state),
    open,
    close,
    load
  }
}
