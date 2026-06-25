import { DIFFICULTIES } from '../constants/difficulties.js'
import { GAME_MODES } from '../constants/gameModes.js'
import { formatTime } from './formatTime.js'

export function buildResultSummary(result) {
  if (!result) {
    return ''
  }

  const mode = GAME_MODES[result.mode]?.label || 'Sudoku'
  const difficulty = DIFFICULTIES[result.difficulty]?.label || 'Easy'
  const lines = ['Sudoku among the blossoms', `${mode} · ${difficulty}`]

  if (result.status === 'expired') {
    lines.push('Time expired')
  } else if (result.mode !== 'zen') {
    lines.push(`Time ${formatTime(result.elapsedSeconds)}`)
  }

  if (result.mode !== 'zen') {
    lines.push(`Mistakes ${result.mistakes}`)
  }

  lines.push(`Hints ${result.hintsUsed}/3`)

  if (result.dailyDate) {
    lines.push(`Daily ${result.dailyDate}`)
  }

  return lines.join('\n')
}
