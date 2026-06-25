<template>
  <div ref="boardElement" class="sudoku-board" role="grid" aria-label="Sudoku puzzle">
    <template v-for="(row, rowIndex) in puzzle" :key="rowIndex">
      <SudokuCell
        v-for="(cell, columnIndex) in row"
        :key="`${rowIndex}-${columnIndex}`"
        :row="rowIndex"
        :column="columnIndex"
        :value="entries[rowIndex][columnIndex]"
        :expected="solution[rowIndex][columnIndex]"
        :notes="notes[rowIndex][columnIndex]"
        :fixed="cell !== 0"
        :selected="isSelected(rowIndex, columnIndex)"
        :related="isRelated(rowIndex, columnIndex)"
        :matching="isMatching(rowIndex, columnIndex)"
        :hinted="hintedCells.includes(`${rowIndex}-${columnIndex}`)"
        :show-errors="showErrors"
        :highlight-editable="highlightEditable"
        :tabbable="isTabbable(rowIndex, columnIndex)"
        @select="emit('select-cell', { row: rowIndex, column: columnIndex })"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import SudokuCell from './SudokuCell.vue'

const props = defineProps({
  puzzle: {
    type: Array,
    required: true
  },
  solution: {
    type: Array,
    required: true
  },
  entries: {
    type: Array,
    required: true
  },
  notes: {
    type: Array,
    required: true
  },
  selectedCell: {
    type: Object,
    default: null
  },
  hintedCells: {
    type: Array,
    default: () => []
  },
  showErrors: {
    type: Boolean,
    default: true
  },
  highlightEditable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-cell'])
const boardElement = ref(null)
const selectedValue = computed(() => {
  if (!props.selectedCell) return 0
  return props.entries[props.selectedCell.row]?.[props.selectedCell.column] || 0
})

function isSelected(row, column) {
  return props.selectedCell?.row === row && props.selectedCell?.column === column
}

function isRelated(row, column) {
  if (!props.selectedCell || isSelected(row, column)) return false

  const sameRow = props.selectedCell.row === row
  const sameColumn = props.selectedCell.column === column
  const sameBox = Math.floor(props.selectedCell.row / 3) === Math.floor(row / 3) &&
    Math.floor(props.selectedCell.column / 3) === Math.floor(column / 3)

  return sameRow || sameColumn || sameBox
}

function isMatching(row, column) {
  return selectedValue.value !== 0 && props.entries[row][column] === selectedValue.value
}

function isTabbable(row, column) {
  if (props.selectedCell) return isSelected(row, column)
  return row === 0 && column === 0
}

function focusSelectedCell() {
  const selected = props.selectedCell || { row: 0, column: 0 }
  boardElement.value
    ?.querySelector(`[data-cell="${selected.row}-${selected.column}"]`)
    ?.focus()
}

defineExpose({ focusSelectedCell })
</script>

<style scoped>
.sudoku-board {
  position: relative;
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  grid-template-rows: repeat(9, minmax(0, 1fr));
  inline-size: var(--board-size);
  aspect-ratio: 1;
  overflow: hidden;
  border: clamp(3px, 0.45vmin, 5px) solid var(--sudoku-grid-color);
  background: var(--sudoku-board-background);
  box-shadow: 0 0.85rem 2rem rgba(38, 30, 34, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.sudoku-board::after {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 1.1rem rgba(255, 255, 255, 0.16);
  content: '';
  pointer-events: none;
}
</style>
