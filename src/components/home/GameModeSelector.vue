<template>
  <fieldset class="mode-selector">
    <legend class="mode-selector__legend visually-hidden">Choose a mode</legend>
    <div class="mode-selector__grid">
      <label
        v-for="mode in modes"
        :key="mode.key"
        class="mode-card"
        :class="{ 'mode-card--selected': modelValue === mode.key }"
      >
        <input
          class="mode-card__input"
          type="radio"
          name="game-mode"
          :value="mode.key"
          :checked="modelValue === mode.key"
          @change="emit('update:modelValue', mode.key)"
        />
        <span class="mode-card__topline">
          <span class="mode-card__emblem" aria-hidden="true">{{ modeIcons[mode.key] }}</span>
          <span v-if="mode.key === 'daily'" class="mode-card__state">{{ dailyStateLabel }}</span>
          <span v-else class="mode-card__state">{{ modeRules[mode.key] }}</span>
        </span>
        <span class="mode-card__title">{{ mode.label }}</span>
        <span class="mode-card__description">{{ mode.description }}</span>
      </label>
    </div>
  </fieldset>
</template>

<script setup>
import { computed } from 'vue'
import { GAME_MODE_OPTIONS } from '../../constants/gameModes.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'classic'
  },
  dailyState: {
    type: String,
    default: 'new',
    validator: value => ['new', 'resume', 'completed'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])
const modes = GAME_MODE_OPTIONS
const modeIcons = Object.freeze({ classic: '井', daily: '日', sprint: '刻', zen: '○' })
const modeRules = Object.freeze({ classic: 'Flexible', sprint: 'Countdown', zen: 'Untimed' })
const dailyStateLabel = computed(() => ({ new: 'New', resume: 'Resume', completed: 'Completed' })[props.dailyState])
</script>

<style scoped>
.mode-selector {
  inline-size: 100%;
  margin: 0;
  padding: 0;
  border: 0;
}

.mode-selector__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.45rem, 1vw, 0.7rem);
}

.mode-card {
  position: relative;
  display: grid;
  align-content: start;
  gap: 0.25rem;
  min-block-size: 8rem;
  padding: clamp(0.62rem, 1.25vw, 0.88rem);
  overflow: hidden;
  border: 1px solid rgba(75, 59, 67, 0.2);
  border-radius: var(--radius-medium);
  background:
    repeating-linear-gradient(8deg, rgba(78, 58, 67, 0.015) 0 1px, transparent 1px 5px),
    rgba(255, 253, 248, 0.75);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: transform var(--motion-fast) ease, border-color var(--motion-fast) ease, background var(--motion-fast) ease, box-shadow var(--motion-fast) ease;
}

.mode-card::after {
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: 0;
  inline-size: 0;
  block-size: 3px;
  background: linear-gradient(90deg, var(--color-sakura-500), var(--color-sakura-200));
  content: '';
  transition: inline-size var(--motion-standard) ease;
}

.mode-card:hover {
  border-color: rgba(185, 101, 124, 0.48);
  background: rgba(255, 247, 249, 0.92);
  transform: translateY(-0.12rem);
}

.mode-card--selected {
  border-color: var(--color-sakura-500);
  background:
    radial-gradient(circle at 90% 10%, rgba(231, 157, 175, 0.2), transparent 34%),
    linear-gradient(145deg, rgba(255, 253, 248, 0.97), rgba(251, 221, 229, 0.9));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7), var(--shadow-panel);
  transform: translateY(-0.12rem);
}

.mode-card--selected::after {
  inline-size: 100%;
}

.mode-card__input {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
}

.mode-card__input:focus-visible ~ .mode-card__title {
  outline: 3px solid var(--color-sakura-500);
  outline-offset: 4px;
}

.mode-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mode-card__emblem {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border: 1px solid rgba(127, 60, 81, 0.28);
  border-radius: 50%;
  background: rgba(251, 221, 229, 0.64);
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 900;
}

.mode-card__state {
  padding: 0.24rem 0.45rem;
  border: 1px solid rgba(75, 59, 67, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: var(--color-ink-muted);
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mode-card__title {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(0.92rem, 1.7vmin, 1.12rem);
  font-weight: 900;
}

.mode-card__description {
  color: var(--color-ink-muted);
  font-size: clamp(0.64rem, 1.2vmin, 0.77rem);
  font-weight: 650;
  line-height: 1.35;
}

@media (max-width: 42rem) {
  .mode-card {
    min-block-size: 6.7rem;
  }
}

@media (max-width: 25rem) {
  .mode-selector__grid {
    gap: 0.35rem;
  }

  .mode-card {
    min-block-size: 5.6rem;
    padding: 0.48rem;
  }

  .mode-card__description {
    display: none;
  }
}

@media (max-height: 39rem) {
  .mode-card {
    min-block-size: 4.7rem;
    padding-block: 0.4rem;
  }

  .mode-card__description {
    display: none;
  }

  .mode-card__emblem {
    inline-size: 1.6rem;
    block-size: 1.6rem;
    font-size: 0.84rem;
  }
}
</style>
