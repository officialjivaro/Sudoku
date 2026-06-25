<template>
  <button
    class="sudoku-cell"
    :class="cellClasses"
    type="button"
    role="gridcell"
    :data-cell="`${row}-${column}`"
    :tabindex="tabbable ? 0 : -1"
    :aria-label="ariaLabel"
    :aria-selected="selected"
    :aria-readonly="fixed"
    @click="emit('select')"
    @focus="emit('select')"
  >
    <span v-if="value" class="sudoku-cell__value">{{ value }}</span>
    <span v-else-if="notes.length" class="sudoku-cell__notes" aria-hidden="true">
      <span v-for="number in 9" :key="number">{{ notes.includes(number) ? number : '' }}</span>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  row: {
    type: Number,
    required: true
  },
  column: {
    type: Number,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  expected: {
    type: Number,
    required: true
  },
  notes: {
    type: Array,
    default: () => []
  },
  fixed: {
    type: Boolean,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  related: {
    type: Boolean,
    default: false
  },
  matching: {
    type: Boolean,
    default: false
  },
  hinted: {
    type: Boolean,
    default: false
  },
  showErrors: {
    type: Boolean,
    default: true
  },
  highlightEditable: {
    type: Boolean,
    default: false
  },
  tabbable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])
const isWrong = computed(() => props.showErrors && !props.fixed && props.value !== 0 && props.value !== props.expected)

const cellClasses = computed(() => ({
  'sudoku-cell--fixed': props.fixed,
  'sudoku-cell--editable': !props.fixed,
  'sudoku-cell--highlighted': !props.fixed && props.highlightEditable,
  'sudoku-cell--selected': props.selected,
  'sudoku-cell--related': props.related,
  'sudoku-cell--matching': props.matching,
  'sudoku-cell--wrong': isWrong.value,
  'sudoku-cell--hinted': props.hinted,
  'sudoku-cell--box-right': props.column === 2 || props.column === 5,
  'sudoku-cell--box-bottom': props.row === 2 || props.row === 5
}))

const ariaLabel = computed(() => {
  const position = `Row ${props.row + 1}, column ${props.column + 1}`
  const content = props.value
    ? `${props.fixed ? 'given' : 'entered'} ${props.value}`
    : props.notes.length
      ? `notes ${props.notes.join(', ')}`
      : 'empty'

  return `${position}, ${content}${props.fixed ? ', read only' : ', editable'}`
})
</script>

<style scoped>
.sudoku-cell {
  position: relative;
  display: grid;
  place-items: center;
  min-inline-size: 0;
  min-block-size: 0;
  padding: 0;
  border: 0;
  border-inline-end: 1px solid color-mix(in srgb, var(--sudoku-grid-color) 48%, transparent);
  border-block-end: 1px solid color-mix(in srgb, var(--sudoku-grid-color) 48%, transparent);
  border-radius: 0;
  background: var(--sudoku-cell-fixed);
  color: var(--sudoku-number-color);
  cursor: pointer;
  font-family: var(--sudoku-number-font);
  text-shadow: none;
  transition: background var(--motion-fast) ease, box-shadow var(--motion-fast) ease, color var(--motion-fast) ease;
}

.sudoku-cell:nth-child(9n) {
  border-inline-end: 0;
}

.sudoku-cell:nth-last-child(-n + 9) {
  border-block-end: 0;
}

.sudoku-cell--box-right {
  border-inline-end: 3px solid var(--sudoku-grid-color);
}

.sudoku-cell--box-bottom {
  border-block-end: 3px solid var(--sudoku-grid-color);
}

.sudoku-cell--editable {
  background: var(--sudoku-cell-editable);
}

.sudoku-cell--highlighted {
  background: var(--sudoku-cell-highlighted);
}

.sudoku-cell--related {
  background: var(--sudoku-cell-related);
}

.sudoku-cell--matching {
  background: var(--sudoku-cell-matching);
}

.sudoku-cell--wrong {
  background: rgba(255, 215, 225, 0.99);
  color: var(--color-danger);
  box-shadow: inset 0 0 0 2px rgba(154, 52, 81, 0.46);
}

.sudoku-cell--hinted::after {
  position: absolute;
  inset-block-start: 0.12rem;
  inset-inline-end: 0.15rem;
  color: var(--color-sakura-700);
  content: '✦';
  font-size: clamp(0.34rem, calc(var(--board-size) / 82), 0.68rem);
  pointer-events: none;
}

.sudoku-cell--selected {
  z-index: 2;
  box-shadow: inset 0 0 0 3px var(--color-sakura-700), inset 0 0 0 5px rgba(255, 255, 255, 0.45);
}

.sudoku-cell:focus-visible {
  z-index: 3;
  outline: 3px solid rgba(255, 255, 255, 0.98);
  outline-offset: -4px;
}

.sudoku-cell__value {
  font-size: clamp(1rem, calc(var(--board-size) / 24), 2rem);
  font-weight: 780;
}

.sudoku-cell--fixed .sudoku-cell__value {
  font-weight: 950;
}

.sudoku-cell--editable .sudoku-cell__value {
  color: color-mix(in srgb, var(--sudoku-number-color) 82%, var(--color-sakura-700));
}

.sudoku-cell__notes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  inline-size: 100%;
  block-size: 100%;
  padding: 0.08rem;
}

.sudoku-cell__notes span {
  display: grid;
  place-items: center;
  color: color-mix(in srgb, var(--sudoku-number-color) 62%, transparent);
  font-size: clamp(0.34rem, calc(var(--board-size) / 70), 0.68rem);
  font-weight: 750;
  line-height: 1;
}
</style>
