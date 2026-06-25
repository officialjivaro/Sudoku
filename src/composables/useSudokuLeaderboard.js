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

let loadRevision = 0

async function load(options = {}) {
  const revision = ++loadRevision
  const mode = options.mode || state.mode
  const difficulty = options.difficulty || state.difficulty
  const dailyDate = options.dailyDate || getUtcDateKey()
  state.mode = mode
  state.difficulty = difficulty
  state.dailyDate = dailyDate
  state.loading = true
  state.error = ''

  try {
    const entries = await fetchSudokuLeaderboard({
      mode,
      difficulty,
      dailyDate,
      limit: 25
    })

    if (revision !== loadRevision) return
    state.entries = entries
  } catch (error) {
    if (revision !== loadRevision) return
    state.entries = []
    state.error = error.message || 'The online rankings could not be loaded.'
  } finally {
    if (revision === loadRevision) {
      state.loading = false
    }
  }
}

async function open(options = {}) {
  state.open = true
  await load(options)
}

function close() {
  loadRevision += 1
  state.open = false
  state.loading = false
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
