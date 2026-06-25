import { requireSupabase } from '../lib/supabase.js'
import { solveSudoku } from './sudokuEngine.js'

async function readFunctionError(error) {
  try {
    const payload = await error?.context?.json?.()
    return payload?.error || payload?.message || error.message
  } catch {
    return error?.message || 'The online Sudoku service could not complete the request.'
  }
}

export async function startOnlineSudokuRun(payload) {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('sudoku-run', {
    body: {
      action: 'start',
      clientRunId: payload.clientRunId,
      mode: payload.mode,
      difficulty: payload.difficulty,
      dailyDate: payload.dailyDate || null
    }
  })

  if (error) {
    throw new Error(await readFunctionError(error))
  }

  if (!data?.runToken || !Array.isArray(data?.puzzle)) {
    throw new Error('The online run service returned an incomplete puzzle.')
  }

  const solution = solveSudoku(data.puzzle)

  if (!solution) {
    throw new Error('The verified online puzzle could not be solved locally.')
  }

  return { ...data, solution }
}

export async function completeOnlineSudokuRun(payload) {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('sudoku-run', {
    body: {
      action: 'complete',
      runToken: payload.runToken,
      clientRunId: payload.clientRunId,
      entries: payload.entries,
      elapsedSeconds: payload.elapsedSeconds,
      mistakes: payload.mistakes,
      hintsUsed: payload.hintsUsed,
      completionReason: payload.completionReason
    }
  })

  if (error) {
    throw new Error(await readFunctionError(error))
  }

  return data || {}
}

export async function fetchSudokuLeaderboard({
  mode = 'classic',
  difficulty = 'easy',
  dailyDate = null,
  limit = 25
} = {}) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('sudoku_get_leaderboard', {
    p_mode: mode,
    p_difficulty: difficulty,
    p_daily_date: mode === 'daily' ? dailyDate : null,
    p_limit: limit
  })

  if (error) throw error
  return Array.isArray(data) ? data : []
}
