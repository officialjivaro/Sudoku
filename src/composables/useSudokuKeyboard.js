import { nextTick, onBeforeUnmount, onMounted } from 'vue'

export function useSudokuKeyboard(options) {
  function isIgnoredTarget(target) {
    if (!(target instanceof HTMLElement)) {
      return false
    }

    if (['INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(target.tagName)) {
      return true
    }

    return Boolean(target.closest('button:not(.sudoku-cell)'))
  }

  async function handleMove(rowOffset, columnOffset) {
    options.onMove(rowOffset, columnOffset)
    await nextTick()
    options.onFocusSelected?.()
  }

  function handleKeydown(event) {
    if (!options.isActive() || isIgnoredTarget(event.target)) {
      return
    }

    const modifier = event.ctrlKey || event.metaKey

    if (modifier && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      event.shiftKey ? options.onRedo() : options.onUndo()
      return
    }

    if (modifier && event.key.toLowerCase() === 'y') {
      event.preventDefault()
      options.onRedo()
      return
    }

    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault()
      options.onDigit(Number(event.key))
      return
    }

    const actions = {
      ArrowUp: () => handleMove(-1, 0),
      ArrowDown: () => handleMove(1, 0),
      ArrowLeft: () => handleMove(0, -1),
      ArrowRight: () => handleMove(0, 1),
      Backspace: options.onErase,
      Delete: options.onErase,
      n: options.onToggleNotes,
      N: options.onToggleNotes,
      h: options.onHint,
      H: options.onHint
    }

    if (actions[event.key]) {
      event.preventDefault()
      actions[event.key]()
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
}
