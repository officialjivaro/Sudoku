<template>
  <div class="difficulty-selector">
    <label class="difficulty-selector__label" for="difficulty">Difficulty</label>
    <div class="difficulty-selector__field">
      <select
        id="difficulty"
        class="difficulty-selector__select"
        :value="modelValue"
        @change="emit('update:modelValue', $event.target.value)"
      >
        <option v-for="option in options" :key="option.key" :value="option.key">
          {{ option.label }}
        </option>
      </select>
      <span class="difficulty-selector__seal" aria-hidden="true">級</span>
    </div>
    <p class="difficulty-selector__description">{{ selectedDescription }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DIFFICULTIES, DIFFICULTY_OPTIONS } from '../../constants/difficulties.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'easy'
  }
})

const emit = defineEmits(['update:modelValue'])
const options = DIFFICULTY_OPTIONS
const selectedDescription = computed(() => DIFFICULTIES[props.modelValue]?.description || DIFFICULTIES.easy.description)
</script>

<style scoped>
.difficulty-selector {
  display: grid;
  justify-items: start;
  gap: 0.38rem;
  inline-size: 100%;
}

.difficulty-selector__label {
  color: var(--color-sakura-700);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.difficulty-selector__field {
  position: relative;
  inline-size: min(100%, 17rem);
}

.difficulty-selector__select {
  inline-size: 100%;
  min-block-size: 2.75rem;
  padding: 0.62rem 3rem 0.62rem 0.82rem;
  border: 1px solid var(--paper-border-strong);
  border-radius: var(--radius-small);
  background:
    repeating-linear-gradient(8deg, rgba(78, 58, 67, 0.016) 0 1px, transparent 1px 5px),
    rgba(255, 253, 248, 0.92);
  color: var(--color-ink);
  font-size: 0.95rem;
  font-weight: 800;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  appearance: none;
}

.difficulty-selector__seal {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-end: 0.55rem;
  display: grid;
  place-items: center;
  inline-size: 1.7rem;
  block-size: 1.7rem;
  border-radius: 50%;
  background: var(--color-sakura-100);
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-weight: 900;
  pointer-events: none;
  transform: translateY(-50%);
}

.difficulty-selector__select:focus-visible {
  box-shadow: var(--focus-ring);
}

.difficulty-selector__description {
  max-inline-size: 23rem;
  margin: 0;
  color: var(--color-ink-muted);
  font-size: clamp(0.68rem, 1.2vmin, 0.8rem);
  font-weight: 650;
  line-height: 1.35;
}
</style>
