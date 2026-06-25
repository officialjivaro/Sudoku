<template>
  <div class="number-pad" aria-label="Number pad">
    <button
      v-for="number in 9"
      :key="number"
      class="number-pad__button"
      :class="{ 'number-pad__button--complete': completedNumbers.includes(number) }"
      type="button"
      :aria-label="`Enter number ${number}`"
      :disabled="disabled"
      data-game-control
      @click="emit('select', number)"
    >
      <span>{{ number }}</span>
      <small v-if="completedNumbers.includes(number)">done</small>
    </button>
  </div>
</template>

<script setup>
defineProps({
  completedNumbers: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.number-pad {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: clamp(0.18rem, 0.5vmin, 0.36rem);
  inline-size: 100%;
}

.number-pad__button {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  min-inline-size: 0;
  padding: 0;
  border: 1px solid var(--sudoku-control-border);
  border-radius: clamp(0.28rem, 0.7vmin, 0.48rem);
  background:
    repeating-linear-gradient(8deg, rgba(78, 58, 67, 0.014) 0 1px, transparent 1px 5px),
    var(--sudoku-control-background);
  color: var(--color-ink);
  box-shadow: 0 0.19rem 0 var(--sudoku-control-shadow);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.35vmin, 1.45rem);
  font-weight: 900;
  transition: transform var(--motion-fast) ease, background var(--motion-fast) ease, opacity var(--motion-fast) ease;
}

.number-pad__button small {
  position: absolute;
  inset-block-end: 0.12rem;
  color: var(--color-ink-muted);
  font-family: inherit;
  font-size: clamp(0.34rem, 0.68vmin, 0.44rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.number-pad__button:hover:not(:disabled) {
  background: var(--sudoku-control-active);
  transform: translateY(-0.08rem);
}

.number-pad__button:active:not(:disabled) {
  transform: translateY(0.08rem);
}

.number-pad__button:focus-visible {
  box-shadow: var(--focus-ring);
}

.number-pad__button--complete {
  opacity: 0.38;
}

.number-pad__button--complete span {
  text-decoration: line-through;
}

.number-pad__button:disabled {
  cursor: default;
  opacity: 0.48;
}
</style>
