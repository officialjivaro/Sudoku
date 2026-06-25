<template>
  <section v-if="entries.length" class="podium" aria-label="Top three players">
    <article
      v-for="entry in arrangedEntries"
      :key="`${entry.rank}-${entry.displayName}`"
      class="podium__place"
      :class="[`podium__place--${entry.rank}`, { 'podium__place--current': entry.current }]"
    >
      <span class="podium__medal" aria-hidden="true">{{ medalFor(entry.rank) }}</span>
      <span class="podium__rank">#{{ entry.rank }}</span>
      <strong>{{ entry.displayName }}</strong>
      <small>{{ entry.score }}</small>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  }
})

const arrangedEntries = computed(() => {
  const map = new Map(props.entries.map(entry => [Number(entry.rank), entry]))
  return [map.get(2), map.get(1), map.get(3)].filter(Boolean)
})

function medalFor(rank) {
  return ({ 1: '金', 2: '銀', 3: '銅' })[rank] || '位'
}
</script>

<style scoped>
.podium {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 0.5rem;
  inline-size: 100%;
}

.podium__place {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.12rem;
  min-inline-size: 0;
  padding: 0.65rem 0.45rem;
  border: 1px solid rgba(75, 59, 67, 0.16);
  border-radius: var(--radius-medium) var(--radius-medium) 0.35rem 0.35rem;
  background:
    repeating-linear-gradient(8deg, rgba(78, 58, 67, 0.015) 0 1px, transparent 1px 5px),
    rgba(255, 253, 248, 0.76);
  box-shadow: var(--shadow-soft);
}

.podium__place--1 {
  min-block-size: 6.8rem;
  border-color: rgba(197, 146, 54, 0.38);
  background: linear-gradient(145deg, rgba(255, 252, 232, 0.96), rgba(248, 223, 157, 0.82));
}

.podium__place--2 {
  min-block-size: 5.8rem;
}

.podium__place--3 {
  min-block-size: 5.3rem;
  background: linear-gradient(145deg, rgba(255, 246, 239, 0.9), rgba(230, 196, 173, 0.74));
}

.podium__place--current {
  box-shadow: inset 0 0 0 2px var(--color-sakura-300), var(--shadow-panel);
}

.podium__medal {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border: 1px solid rgba(75, 59, 67, 0.24);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.58);
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 900;
}

.podium__rank {
  color: var(--color-ink-muted);
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.podium__place strong {
  max-inline-size: 100%;
  overflow: hidden;
  color: var(--color-ink);
  font-size: clamp(0.68rem, 1.35vmin, 0.82rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium__place small {
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-size: clamp(0.72rem, 1.45vmin, 0.9rem);
  font-weight: 900;
}

@media (max-width: 30rem) {
  .podium {
    gap: 0.28rem;
  }

  .podium__place {
    padding-inline: 0.25rem;
  }
}
</style>
