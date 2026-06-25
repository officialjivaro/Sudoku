<template>
  <div class="number-tracker" aria-label="Completed numbers">
    <span
      v-for="number in 9"
      :key="number"
      class="number-tracker__item"
      :class="{ 'number-tracker__item--complete': completedNumbers.includes(number) }"
      :aria-label="`Number ${number}${completedNumbers.includes(number) ? ', complete' : ''}`"
    >
      {{ number }}
      <span v-if="completedNumbers.includes(number)" class="number-tracker__mark" aria-hidden="true"></span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  completedNumbers: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.number-tracker {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 0.18rem;
  inline-size: 100%;
  padding: 0.3rem;
  border: 1px solid rgba(75, 59, 67, 0.14);
  border-radius: var(--radius-small);
  background: rgba(255, 253, 248, 0.5);
}

.number-tracker__item {
  position: relative;
  display: grid;
  place-items: center;
  min-inline-size: 0;
  block-size: 1.45rem;
  color: var(--color-ink-muted);
  font-family: var(--font-display);
  font-size: clamp(0.6rem, 1.2vmin, 0.74rem);
  font-weight: 850;
}

.number-tracker__item--complete {
  color: rgba(81, 72, 77, 0.38);
}

.number-tracker__mark {
  position: absolute;
  inline-size: 1.05rem;
  block-size: 1px;
  background: var(--color-sakura-500);
  transform: rotate(-22deg);
}
</style>
