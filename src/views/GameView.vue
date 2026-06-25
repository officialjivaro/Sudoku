<template>
  <section class="game-view app-page">
    <div v-if="game.status === 'active'" class="game-stage">
      <WashiPanel tag="div" variant="card" class="game-stage__status-panel">
        <GameStatusBar
          :mode-label="modeConfig.label"
          :difficulty-label="difficultyLabel"
          :timer-type="modeConfig.timerType"
          :show-timer="modeConfig.showTimer"
          :show-mistakes="modeConfig.showMistakes"
          :started-at="game.startedAt"
          :deadline="game.deadline"
          :mistakes="game.mistakes"
          :hints-remaining="game.hintsRemaining"
          @expired="handleExpired"
        />
      </WashiPanel>

      <WashiPanel tag="div" variant="main" :padded="false" class="game-stage__board-panel">
        <div class="game-stage__board-heading">
          <div>
            <p class="eyebrow">Focus on one cell at a time</p>
            <h1 class="section-title">{{ modeConfig.label }} · {{ difficultyLabel }}</h1>
          </div>
          <span aria-hidden="true">静</span>
        </div>
        <div class="game-stage__board">
          <SudokuBoard
            ref="boardRef"
            :puzzle="game.puzzle"
            :solution="game.solution"
            :entries="game.entries"
            :notes="game.notes"
            :selected-cell="game.selectedCell"
            :hinted-cells="game.hintedCells"
            :show-errors="modeConfig.immediateErrors"
            :highlight-editable="highlightEditable"
            @select-cell="handleCellSelection"
          />
        </div>
      </WashiPanel>

      <GameControlPanel
        class="game-stage__controls"
        :completed-numbers="completedNumbers"
        :notes-mode="game.notesMode"
        :can-undo="game.history.length > 0"
        :can-redo="game.future.length > 0"
        :hints-remaining="game.hintsRemaining"
        :highlight-editable="highlightEditable"
        @digit="handleDigit"
        @toggle-notes="handleToggleNotes"
        @erase="handleErase"
        @undo="handleUndo"
        @redo="handleRedo"
        @hint="handleHint"
        @home="returnHome"
        @update:highlight-editable="highlightEditable = $event"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameControlPanel from '../components/game/GameControlPanel.vue'
import GameStatusBar from '../components/game/GameStatusBar.vue'
import SudokuBoard from '../components/game/SudokuBoard.vue'
import WashiPanel from '../components/ui/WashiPanel.vue'
import { useGameSession } from '../composables/useGameSession.js'
import { useSudokuKeyboard } from '../composables/useSudokuKeyboard.js'
import { DIFFICULTIES, normalizeDifficulty } from '../constants/difficulties.js'
import { GAME_MODES, normalizeGameMode, resolveModeDifficulty } from '../constants/gameModes.js'

const route = useRoute()
const router = useRouter()
const boardRef = ref(null)
const highlightEditable = ref(false)
const {
  game,
  startGame,
  selectCell,
  moveSelection,
  enterDigit,
  eraseSelected,
  toggleNotesMode,
  undo,
  redo,
  useHint,
  expireGame,
  abandonGame
} = useGameSession()

const modeConfig = computed(() => GAME_MODES[game.mode] || GAME_MODES.classic)
const difficultyLabel = computed(() => DIFFICULTIES[game.difficulty]?.label || DIFFICULTIES.easy.label)
const completedNumbers = computed(() => {
  const completed = []

  for (let digit = 1; digit <= 9; digit += 1) {
    let correctCount = 0

    for (let row = 0; row < 9; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        if (game.entries[row][column] === digit && game.solution[row][column] === digit) correctCount += 1
      }
    }

    if (correctCount === 9) completed.push(digit)
  }

  return completed
})

onBeforeMount(async () => {
  const requestedMode = normalizeGameMode(route.query.mode)
  const requestedDifficulty = resolveModeDifficulty(requestedMode, normalizeDifficulty(route.query.difficulty))
  const sessionMatchesRoute = game.status === 'active' &&
    game.mode === requestedMode &&
    game.difficulty === requestedDifficulty

  if (!sessionMatchesRoute) startGame({ mode: requestedMode, difficulty: requestedDifficulty })

  if (game.status !== 'active') {
    await router.replace({ name: 'end' })
    return
  }

  if (!game.selectedCell) {
    const firstEditable = findFirstEditableCell()
    selectCell(firstEditable.row, firstEditable.column)
  }

  await focusSelectedCell()
})

function findFirstEditableCell() {
  for (let row = 0; row < 9; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      if (game.puzzle[row][column] === 0) return { row, column }
    }
  }

  return { row: 0, column: 0 }
}

async function focusSelectedCell() {
  await nextTick()
  boardRef.value?.focusSelectedCell()
}

function handleCellSelection(cell) {
  selectCell(cell.row, cell.column)
}

async function routeIfFinished() {
  if (game.status === 'completed' || game.status === 'expired') await router.replace({ name: 'end' })
}

async function handleDigit(digit) {
  enterDigit(digit)
  await focusSelectedCell()
  await routeIfFinished()
}

async function handleToggleNotes() {
  toggleNotesMode()
  await focusSelectedCell()
}

async function handleErase() {
  eraseSelected()
  await focusSelectedCell()
}

async function handleUndo() {
  undo()
  await focusSelectedCell()
}

async function handleRedo() {
  redo()
  await focusSelectedCell()
}

async function handleHint() {
  useHint()
  await focusSelectedCell()
  await routeIfFinished()
}

async function handleExpired() {
  if (game.status !== 'active') return
  expireGame()
  await router.replace({ name: 'end' })
}

async function returnHome() {
  abandonGame({ preserveDaily: true })
  await router.push({ name: 'home' })
}

useSudokuKeyboard({
  isActive: () => game.status === 'active',
  onDigit: handleDigit,
  onMove: moveSelection,
  onErase: eraseSelected,
  onToggleNotes: toggleNotesMode,
  onUndo: undo,
  onRedo: redo,
  onHint: handleHint,
  onFocusSelected: focusSelectedCell
})
</script>

<style scoped>
.game-view {
  padding: clamp(0.28rem, 0.75vmin, 0.62rem);
}

.game-stage {
  --board-size: min(64dvh, 55vw, 42rem);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 23rem);
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(0.42rem, 1vmin, 0.78rem);
  inline-size: min(98vw, 82rem);
  block-size: 100%;
  min-block-size: 0;
}

.game-stage__status-panel {
  grid-column: 1 / -1;
  align-self: start;
}

.game-stage__status-panel :deep(.washi-panel__content) {
  padding: 0.38rem 0.55rem;
}

.game-stage__board-panel {
  min-inline-size: 0;
  min-block-size: 0;
  overflow: hidden;
}

.game-stage__board-panel :deep(.washi-panel__content) {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  block-size: 100%;
}

.game-stage__board-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.58rem 0.75rem;
  border-block-end: 1px solid rgba(75, 59, 67, 0.14);
  background: rgba(255, 253, 248, 0.52);
}

.game-stage__board-heading span {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: 50%;
  background: var(--color-sakura-100);
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-weight: 900;
}

.game-stage__board {
  display: grid;
  place-items: center;
  min-inline-size: 0;
  min-block-size: 0;
  padding: clamp(0.35rem, 0.9vmin, 0.75rem);
}

.game-stage__controls {
  align-self: center;
  max-block-size: 100%;
}

@media (max-width: 54rem) {
  .game-stage {
    --board-size: min(88vw, 51dvh, 35rem);
    grid-template-columns: 1fr;
    grid-template-rows: auto auto minmax(0, 1fr);
    align-content: center;
    inline-size: min(100%, 46rem);
    gap: 0.35rem;
  }

  .game-stage__status-panel {
    grid-column: 1;
  }

  .game-stage__board-heading {
    display: none;
  }

  .game-stage__board-panel :deep(.washi-panel__content) {
    grid-template-rows: minmax(0, 1fr);
  }
}

@media (max-height: 39rem) and (min-width: 54.01rem) {
  .game-stage {
    --board-size: min(69dvh, 48vw, 30rem);
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 20rem);
  }

  .game-stage__board-heading {
    display: none;
  }

  .game-stage__board-panel :deep(.washi-panel__content) {
    grid-template-rows: minmax(0, 1fr);
  }
}

@media (max-height: 43rem) and (max-width: 54rem) {
  .game-stage {
    --board-size: min(78vw, 44dvh, 27rem);
  }
}

@media (max-width: 28rem) {
  .game-stage {
    --board-size: min(94vw, 48dvh, 26rem);
  }
}
</style>
