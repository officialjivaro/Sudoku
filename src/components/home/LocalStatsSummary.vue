<template>
  <section class="stats-summary" aria-label="Local player statistics">
    <article v-for="item in summaryItems" :key="item.label" class="stats-summary__item">
      <span class="stats-summary__value">{{ item.value }}</span>
      <span class="stats-summary__label">{{ item.label }}</span>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { formatTime } from '../../utils/formatTime.js'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const bestTime = computed(() => {
  const values = Object.values(props.stats.personalBests || {})
  return values.length > 0 ? formatTime(Math.min(...values)) : '—'
})

const dailyStatus = computed(() => {
  if (props.stats.dailyCompletion) return 'Done'
  if (props.stats.dailyProgress) return 'Saved'
  return 'Open'
})

const summaryItems = computed(() => [
  { label: 'Completed', value: props.stats.completed },
  { label: 'Daily streak', value: props.stats.currentDailyStreak },
  { label: 'Best streak', value: props.stats.longestDailyStreak },
  { label: 'Best time', value: bestTime.value },
  { label: 'Today', value: dailyStatus.value }
])
</script>

<style scoped>
.stats-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(0.3rem, 0.75vw, 0.5rem);
  inline-size: 100%;
}

.stats-summary__item {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.08rem;
  min-inline-size: 0;
  padding: 0.55rem 0.3rem;
  border: 1px solid rgba(75, 59, 67, 0.16);
  border-radius: var(--radius-small);
  background: rgba(255, 253, 248, 0.68);
}

.stats-summary__item::before {
  inline-size: 1.2rem;
  block-size: 2px;
  margin-block-end: 0.16rem;
  border-radius: 999px;
  background: var(--color-sakura-300);
  content: '';
}

.stats-summary__value {
  max-inline-size: 100%;
  overflow: hidden;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(0.82rem, 1.65vmin, 1.05rem);
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-summary__label {
  max-inline-size: 100%;
  overflow: hidden;
  color: var(--color-ink-muted);
  font-size: clamp(0.55rem, 1.05vmin, 0.68rem);
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 35rem) {
  .stats-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .stats-summary__item:nth-child(4),
  .stats-summary__item:nth-child(5) {
    grid-column: span 1;
  }
}

@media (max-height: 38rem) {
  .stats-summary__item {
    padding-block: 0.35rem;
  }

  .stats-summary__item::before {
    display: none;
  }
}
</style>
