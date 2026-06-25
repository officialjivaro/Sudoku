<template>
  <div class="action-bar" aria-label="Game actions">
    <button
      v-for="action in actions"
      :key="action.id"
      class="action-bar__button"
      :class="{ 'action-bar__button--active': action.id === 'notes' && notesMode }"
      type="button"
      :aria-pressed="action.id === 'notes' ? notesMode : undefined"
      :disabled="disabled || action.disabled"
      data-game-control
      @click="emit(action.event)"
    >
      <span class="action-bar__icon" aria-hidden="true">{{ action.icon }}</span>
      <span class="action-bar__label">{{ action.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notesMode: {
    type: Boolean,
    default: false
  },
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  hintsRemaining: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-notes', 'erase', 'undo', 'redo', 'hint'])
const actions = computed(() => [
  { id: 'notes', label: props.notesMode ? 'Notes on' : 'Notes', icon: '✎', event: 'toggle-notes', disabled: false },
  { id: 'erase', label: 'Erase', icon: '⌫', event: 'erase', disabled: false },
  { id: 'undo', label: 'Undo', icon: '↶', event: 'undo', disabled: !props.canUndo },
  { id: 'redo', label: 'Redo', icon: '↷', event: 'redo', disabled: !props.canRedo },
  { id: 'hint', label: `Hint ${props.hintsRemaining}`, icon: '✦', event: 'hint', disabled: props.hintsRemaining <= 0 }
])
</script>

<style scoped>
.action-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.35rem;
  inline-size: 100%;
}

.action-bar__button {
  display: grid;
  justify-items: center;
  gap: 0.16rem;
  min-inline-size: 0;
  min-block-size: 3.3rem;
  padding: 0.42rem 0.2rem;
  border: 1px solid var(--sudoku-control-border);
  border-radius: var(--radius-small);
  background: var(--sudoku-control-background);
  color: var(--color-ink);
  cursor: pointer;
  transition: background var(--motion-fast) ease, transform var(--motion-fast) ease, box-shadow var(--motion-fast) ease;
}

.action-bar__icon {
  display: grid;
  place-items: center;
  min-block-size: 1.1rem;
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 1.8vmin, 1.15rem);
  font-weight: 900;
}

.action-bar__label {
  font-size: clamp(0.58rem, 1.1vmin, 0.7rem);
  font-weight: 850;
  white-space: nowrap;
}

.action-bar__button:hover:not(:disabled) {
  background: var(--sudoku-control-active);
  transform: translateY(-0.06rem);
}

.action-bar__button--active {
  border-color: var(--color-sakura-500);
  background: var(--sudoku-control-active);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.62), 0 0 0.7rem rgba(185, 101, 124, 0.2);
}

.action-bar__button:focus-visible {
  box-shadow: var(--focus-ring);
}

.action-bar__button:disabled {
  cursor: default;
  opacity: 0.4;
}

@media (max-width: 26rem) {
  .action-bar__label {
    font-size: 0.52rem;
  }
}
</style>
