<template>
  <div class="game-board">
    <Timer />
    <div class="board">
      <div
        v-for="(row, rowIndex) in puzzle"
        :key="rowIndex"
        class="row"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :class="getCellClass(rowIndex, colIndex)"
        >
          <input
            type="text"
            v-model="userGrid[rowIndex][colIndex]"
            @input="handleInput($event, rowIndex, colIndex)"
            :disabled="cell !== 0"
            :class="{ highlight: highlightEditable && cell === 0 }"
          />
        </div>
      </div>
    </div>

    <div class="tracker-row">
      <div
        v-for="n in 9"
        :key="n"
        class="tracker-box"
        @click="toggleCheck(n)"
      >
        {{ n }}
        <div v-if="checkedNumbers[n]" class="x-mark">X</div>
      </div>
    </div>

    <div class="switch-toggle">
      <span>Highlight empties</span>
      <label class="switch">
        <input type="checkbox" v-model="highlightEditable" />
        <span class="slider"></span>
      </label>
    </div>

    <button class="custom-btn return-home" @click="goHome">
      Return to Home
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Timer from './Timer.vue'
import generateSudoku from '../utils/sudokuGenerator'

const router = useRouter()
const route = useRoute()

const puzzle = ref([])
const solved = ref([])
const userGrid = ref([])
const checkedNumbers = ref({})
const highlightEditable = ref(false)

onMounted(() => {
  for (let i = 1; i <= 9; i++) {
    checkedNumbers.value[i] = false
  }
  const difficulty = route.params.difficulty || 'easy'
  const generated = generateSudoku(difficulty)
  puzzle.value = generated.puzzle
  solved.value = generated.solved
  userGrid.value = generated.puzzle.map(row =>
    row.map(cell => (cell === 0 ? '' : cell))
  )
})

function toggleCheck(n) {
  checkedNumbers.value[n] = !checkedNumbers.value[n]
}

function handleInput(event, rowIndex, colIndex) {
  const val = event.target.value.replace(/\D/g, '')
  userGrid.value[rowIndex][colIndex] = val
  checkIfComplete()
}

function checkIfComplete() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const userVal = userGrid.value[r][c]
      if (!userVal) return
      if (parseInt(userVal, 10) !== solved.value[r][c]) {
        return
      }
    }
  }
  router.push({ name: 'end' })
}

function getCellClass(rowIndex, colIndex) {
  return {
    cell: true,
    'invalid-entry': isInvalid(rowIndex, colIndex)
  }
}

function isInvalid(rowIndex, colIndex) {
  const val = userGrid.value[rowIndex][colIndex]
  if (!val) return false
  for (let c = 0; c < 9; c++) {
    if (c !== colIndex && userGrid.value[rowIndex][c] === val) return true
  }
  for (let r = 0; r < 9; r++) {
    if (r !== rowIndex && userGrid.value[r][colIndex] === val) return true
  }
  const boxRow = Math.floor(rowIndex / 3) * 3
  const boxCol = Math.floor(colIndex / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== rowIndex || c !== colIndex) && userGrid.value[r][c] === val) {
        return true
      }
    }
  }
  return false
}

function goHome() {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
  margin: auto;
  box-sizing: border-box;
  width: min(80vmin, 80vmax);
  height: min(95vmin, 95vmax);
  align-items: center;
  justify-content: center;
}

.board {
  display: flex;
  flex-direction: column;
  width: 85%;
  height: 65%;
  margin-bottom: 0.5rem;
  box-sizing: border-box;
  background-color: rgba(200, 200, 200, 0.85);
  border-radius: 0;
  padding: 0 0.8rem;
}

.row {
  display: flex;
  flex: 1;
  box-sizing: border-box;
}

.cell {
  border: 1px solid #999;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.row:nth-child(3n+1) .cell {
  border-top: 3px solid #333;
}
.row:nth-child(3n) .cell {
  border-bottom: 3px solid #333;
}
.cell:nth-child(3n+1) {
  border-left: 3px solid #333;
}
.cell:nth-child(3n) {
  border-right: 3px solid #333;
}

input {
  width: 90%;
  height: 90%;
  text-align: center;
  border: none;
  outline: none;
  font-size: 2.5vmin;
  background-color: transparent;
  color: #000;
}

.invalid-entry input {
  background-color: #fdd;
}

.highlight {
  background-color: #ffffe0;
}

.tracker-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.tracker-box {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #444;
  border-radius: 0.25rem;
  margin: 0 0.25rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tracker-box:hover {
  background-color: #eee;
}

.x-mark {
  position: absolute;
  color: red;
  font-weight: bold;
  font-size: 1.5rem;
}

.switch-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 2.5rem;
  height: 1.25rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #444;
  transition: 0.2s;
  border-radius: 1.25rem;
  border: 1px solid #222;
}

.slider:before {
  position: absolute;
  content: "";
  height: 1rem;
  width: 1rem;
  left: 0.13rem;
  bottom: 0.13rem;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: #66bb6a;
}

.switch input:checked + .slider:before {
  transform: translateX(1.2rem);
}

.return-home {
  margin-top: 0.5rem;
}
</style>
