<template>
  <section class="cosmetic-preview" aria-live="polite">
    <div v-if="item" class="cosmetic-preview__stage" :class="stageClasses" :style="stageStyle">
      <template v-if="item.category === 'background'">
        <div class="preview-background__paper">
          <span>数</span>
          <small>Sudoku</small>
        </div>
      </template>

      <template v-else-if="item.category === 'board'">
        <div class="preview-board" :style="boardStyle">
          <span v-for="number in 9" :key="number">{{ number }}</span>
        </div>
      </template>

      <template v-else-if="item.category === 'numbers'">
        <div class="preview-numbers" :class="`preview-numbers--${item.themeKey}`">
          <span>1</span><span>4</span><span>7</span><span>9</span>
        </div>
      </template>

      <template v-else-if="item.category === 'petals'">
        <div class="preview-petals" :class="`preview-petals--${item.themeKey}`">
          <span v-for="index in 7" :key="index" :style="{ '--preview-index': index }">❀</span>
        </div>
      </template>

      <template v-else-if="item.category === 'completion'">
        <div class="preview-completion" :class="`preview-completion--${item.themeKey}`">
          <span>完成</span>
          <small>Puzzle complete</small>
        </div>
      </template>

      <template v-else-if="item.category === 'controls'">
        <div class="preview-controls" :class="`preview-controls--${item.themeKey}`">
          <div class="preview-controls__timer">09:42</div>
          <div class="preview-controls__keys"><span>1</span><span>2</span><span>3</span></div>
          <button type="button" tabindex="-1">Notes</button>
        </div>
      </template>
    </div>

    <div v-if="item" class="cosmetic-preview__caption">
      <span>{{ categoryLabel }}</span>
      <strong>{{ item.name }}</strong>
      <p>{{ item.description }}</p>
    </div>
    <p v-else class="cosmetic-preview__empty">Select an item to preview it here.</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { BACKGROUND_ASSETS, getCategoryLabel } from '../../constants/sudokuStoreCatalog.js'

const props = defineProps({
  item: {
    type: Object,
    default: null
  }
})

const categoryLabel = computed(() => getCategoryLabel(props.item?.category))
const stageClasses = computed(() => props.item ? `cosmetic-preview__stage--${props.item.category}` : '')
const stageStyle = computed(() => {
  if (props.item?.category !== 'background') return {}
  const url = BACKGROUND_ASSETS[props.item.assetKey || props.item.id]
  return url ? { backgroundImage: `linear-gradient(rgba(20, 16, 18, 0.08), rgba(20, 16, 18, 0.16)), url("${url}")` } : {}
})

const boardStyle = computed(() => {
  const themes = {
    'paper-white': { '--preview-board': '#d5d3d4', '--preview-fixed': '#edebec', '--preview-editable': '#fff', '--preview-line': '#2d292c' },
    'rose-grid': { '--preview-board': '#d99bae', '--preview-fixed': '#edc8d3', '--preview-editable': '#fff1f5', '--preview-line': '#7d3e52' },
    'midnight-ink': { '--preview-board': '#17151d', '--preview-fixed': '#2d2936', '--preview-editable': '#3a3544', '--preview-line': '#efe4eb', '--preview-number': '#fff7fb' },
    'jade-board': { '--preview-board': '#74978d', '--preview-fixed': '#b7d2c9', '--preview-editable': '#e5f2ee', '--preview-line': '#254c43' },
    'lantern-gold': { '--preview-board': '#bd9350', '--preview-fixed': '#ead6a9', '--preview-editable': '#fff6de', '--preview-line': '#5c3c0f' }
  }

  return themes[props.item?.themeKey] || themes['paper-white']
})
</script>

<style scoped>
.cosmetic-preview {
  display: grid;
  gap: 0.65rem;
}

.cosmetic-preview__stage {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--paper-border-strong);
  border-radius: var(--radius-medium);
  background:
    repeating-linear-gradient(8deg, rgba(78, 58, 67, 0.016) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, var(--color-paper), var(--color-paper-deep));
  box-shadow: var(--shadow-panel);
}

.cosmetic-preview__stage--background {
  background-position: center;
  background-size: cover;
}

.preview-background__paper {
  display: grid;
  place-items: center;
  min-inline-size: 7rem;
  padding: 0.7rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: var(--radius-medium);
  background: rgba(255, 253, 248, 0.76);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(5px);
}

.preview-background__paper span {
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 900;
}

.preview-background__paper small {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-weight: 900;
}

.preview-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  inline-size: min(54%, 11rem);
  aspect-ratio: 1;
  padding: 0.2rem;
  border: 3px solid var(--preview-line);
  background: var(--preview-board);
  box-shadow: var(--shadow-soft);
}

.preview-board span {
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--preview-line) 48%, transparent);
  background: var(--preview-editable);
  color: var(--preview-number, #111);
  font-family: var(--font-display);
  font-weight: 900;
}

.preview-board span:nth-child(2n) {
  background: var(--preview-fixed);
}

.preview-numbers {
  display: flex;
  gap: clamp(0.4rem, 2vw, 1rem);
  color: var(--color-ink);
  font-size: clamp(2rem, 7vw, 4.6rem);
  font-weight: 900;
}

.preview-numbers--brush-script { font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
.preview-numbers--rounded-mochi { font-family: 'Trebuchet MS', sans-serif; }
.preview-numbers--mono-temple { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

.preview-petals {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: var(--color-sakura-300);
}

.preview-petals span {
  position: absolute;
  inset-block-start: calc((var(--preview-index) - 1) * 9%);
  inset-inline-start: calc(var(--preview-index) * 12%);
  font-size: calc(0.7rem + var(--preview-index) * 0.12rem);
  animation: preview-drift calc(2.8s + var(--preview-index) * 0.2s) ease-in-out infinite alternate;
}

.preview-petals--moon-petals { color: #aa91d2; }
.preview-petals--golden-petals { color: #d7a841; }
.preview-petals--crimson-petals { color: #b7475f; }

.preview-completion {
  display: grid;
  place-items: center;
  gap: 0.25rem;
  inline-size: 70%;
  padding: 1rem;
  border: 1px solid rgba(127, 60, 81, 0.28);
  border-radius: var(--radius-medium);
  background: rgba(255, 253, 248, 0.72);
  animation: preview-complete 1.8s ease-in-out infinite;
}

.preview-completion span {
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 5vw, 3.2rem);
  font-weight: 900;
}

.preview-completion small {
  color: var(--color-ink-muted);
  font-weight: 800;
}

.preview-completion--lantern-spark { box-shadow: 0 0 1.6rem rgba(240, 181, 111, 0.55); }
.preview-completion--ink-ripple { filter: grayscale(0.72); }
.preview-completion--koi-wave { border-color: rgba(237, 123, 112, 0.7); }

.preview-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45rem;
  inline-size: 72%;
  padding: 0.75rem;
  border: 1px solid var(--sudoku-control-border);
  border-radius: var(--radius-medium);
  background: var(--sudoku-control-background);
}

.preview-controls__timer {
  grid-column: 1 / -1;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 900;
  text-align: center;
}

.preview-controls__keys {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.3rem;
}

.preview-controls__keys span,
.preview-controls button {
  display: grid;
  place-items: center;
  min-block-size: 2rem;
  border: 1px solid var(--sudoku-control-border);
  border-radius: 0.3rem;
  background: var(--sudoku-control-active);
  color: var(--color-ink);
  font-weight: 900;
}

.preview-controls button {
  grid-column: 2;
}

.preview-controls--moon-controls {
  --sudoku-control-background: #4e4360;
  --sudoku-control-active: #b8a3dc;
  --sudoku-control-border: #332c42;
}

.preview-controls--jade-controls {
  --sudoku-control-background: #b0d5ca;
  --sudoku-control-active: #87b5a8;
  --sudoku-control-border: #335e54;
}

.cosmetic-preview__caption {
  display: grid;
  gap: 0.16rem;
}

.cosmetic-preview__caption > span {
  color: var(--color-sakura-700);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cosmetic-preview__caption strong {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.1rem;
}

.cosmetic-preview__caption p,
.cosmetic-preview__empty {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 0.72rem;
  line-height: 1.4;
}

@keyframes preview-drift {
  from { transform: translate(0, -0.2rem) rotate(-10deg); }
  to { transform: translate(-1rem, 1.2rem) rotate(25deg); }
}

@keyframes preview-complete {
  0%, 100% { transform: scale(0.97); opacity: 0.78; }
  50% { transform: scale(1.02); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .preview-petals span,
  .preview-completion {
    animation: none;
  }
}
</style>
