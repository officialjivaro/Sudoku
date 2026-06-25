<template>
  <section class="result-summary" aria-label="Game result">
    <StatusChip :tone="result.status === 'expired' ? 'danger' : 'success'">
      <template #icon>{{ result.status === 'expired' ? '刻' : '完' }}</template>
      {{ result.status === 'expired' ? 'Time expired' : 'Puzzle complete' }}
    </StatusChip>

    <div class="result-summary__grid">
      <article v-for="item in resultItems" :key="item.label" class="result-summary__item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </div>

    <StatusChip v-if="result.isPersonalBest" tone="sakura">New personal best</StatusChip>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import StatusChip from '../ui/StatusChip.vue'
import { DIFFICULTIES } from '../../constants/difficulties.js'
import { GAME_MODES } from '../../constants/gameModes.js'
import { formatTime } from '../../utils/formatTime.js'

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

const modeLabel = computed(() => GAME_MODES[props.result.mode]?.label || 'Sudoku')
const difficultyLabel = computed(() => DIFFICULTIES[props.result.difficulty]?.label || 'Easy')
const formattedTime = computed(() => formatTime(props.result.elapsedSeconds || 0))
const resultItems = computed(() => {
  const items = [
    { label: 'Mode', value: modeLabel.value },
    { label: 'Difficulty', value: difficultyLabel.value }
  ]

  if (props.result.mode !== 'zen') {
    items.push(
      { label: 'Time', value: formattedTime.value },
      { label: 'Mistakes', value: props.result.mistakes }
    )
  }

  items.push({ label: 'Hints used', value: props.result.hintsUsed })

  if (props.result.dailyDate) {
    items.push({ label: 'Daily streak', value: props.result.currentDailyStreak || 0 })
  }

  return items
})
</script>

<style scoped>
.result-summary {
  display: grid;
  justify-items: start;
  gap: 0.65rem;
  inline-size: 100%;
}

.result-summary__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.42rem;
  inline-size: 100%;
}

.result-summary__item {
  position: relative;
  display: grid;
  gap: 0.12rem;
  min-inline-size: 0;
  padding: 0.6rem 0.5rem;
  border: 1px solid rgba(75, 59, 67, 0.15);
  border-radius: var(--radius-small);
  background: rgba(255, 253, 248, 0.64);
}

.result-summary__item::after {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0.5rem;
  inline-size: 1.4rem;
  block-size: 2px;
  border-radius: 999px;
  background: var(--color-sakura-300);
  content: '';
}

.result-summary__item span {
  color: var(--color-ink-muted);
  font-size: clamp(0.56rem, 1.05vmin, 0.68rem);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.result-summary__item strong {
  overflow: hidden;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(0.78rem, 1.55vmin, 0.98rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 34rem) {
  .result-summary__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
