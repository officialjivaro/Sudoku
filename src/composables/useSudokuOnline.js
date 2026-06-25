import { computed, readonly, reactive } from 'vue'
import { isSupabaseConfigured } from '../lib/supabase.js'
import {
  completeOnlineSudokuRun,
  startOnlineSudokuRun
} from '../services/sudokuOnlineService.js'

const state = reactive({
  starting: false,
  submitting: false,
  startError: '',
  submissionError: '',
  submissionMessage: '',
  lastSubmission: null,
  submittedRunIds: []
})

async function prepareRun(payload, authenticated) {
  state.startError = ''

  if (!isSupabaseConfigured || !authenticated) {
    return null
  }

  state.starting = true

  try {
    return await startOnlineSudokuRun(payload)
  } catch (error) {
    state.startError = `${error.message || 'Online ranking is unavailable.'} This game will continue locally.`
    return null
  } finally {
    state.starting = false
  }
}

async function submitResult(result, authenticated) {
  state.submissionError = ''
  state.submissionMessage = ''

  if (!authenticated) {
    return null
  }

  if (!isSupabaseConfigured) {
    state.submissionError = 'Online scoring is not configured for this build.'
    return null
  }

  if (!result.onlineRunToken) {
    state.submissionError = 'This puzzle started without a verified online run, so it remains local only.'
    return null
  }

  if (state.submittedRunIds.includes(result.clientRunId)) {
    return state.lastSubmission
  }

  state.submitting = true

  try {
    const response = await completeOnlineSudokuRun({
      runToken: result.onlineRunToken,
      clientRunId: result.clientRunId,
      entries: result.finalEntries,
      elapsedSeconds: result.elapsedSeconds,
      mistakes: result.mistakes,
      hintsUsed: result.hintsUsed,
      completionReason: result.completionReason
    })

    state.lastSubmission = response
    state.submittedRunIds = [...state.submittedRunIds, result.clientRunId].slice(-50)
    state.submissionMessage = response.inserted === false
      ? 'This result was already processed.'
      : result.mode === 'zen'
        ? 'Verified Zen clear saved privately. Zen remains outside the rankings.'
        : response.dailyOfficial === false && result.mode === 'daily'
          ? 'Practice Daily result saved. Today’s official result already exists.'
          : 'Verified result saved to the online rankings.'
    return response
  } catch (error) {
    state.submissionError = error.message || 'The verified result could not be saved.'
    return null
  } finally {
    state.submitting = false
  }
}

function clearResultStatus() {
  state.submissionError = ''
  state.submissionMessage = ''
  state.lastSubmission = null
}

export function useSudokuOnline() {
  return {
    state: readonly(state),
    isConfigured: computed(() => isSupabaseConfigured),
    prepareRun,
    submitResult,
    clearResultStatus
  }
}
