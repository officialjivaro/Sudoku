<template>
  <label class="toggle-switch" :for="inputId">
    <span class="toggle-switch__label">{{ label }}</span>
    <span class="toggle-switch__control">
      <input
        :id="inputId"
        class="toggle-switch__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="handleChange"
      />
      <span class="toggle-switch__track" aria-hidden="true">
        <span class="toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
</template>

<script setup>
import { useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const inputId = `toggle-${useId()}`

function handleChange(event) {
  emit('update:modelValue', event.target.checked)
}
</script>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  color: var(--color-ink);
  cursor: pointer;
  user-select: none;
}

.toggle-switch__label {
  font-size: clamp(0.82rem, 1.65vmin, 1rem);
  font-weight: 850;
}

.toggle-switch__control {
  position: relative;
  display: inline-block;
  inline-size: 3.1rem;
  block-size: 1.6rem;
  flex: 0 0 auto;
}

.toggle-switch__input {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  opacity: 0;
}

.toggle-switch__track {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(31, 27, 29, 0.72);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(58, 51, 55, 0.94), rgba(38, 34, 36, 0.96));
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.38), 0 0.16rem 0.45rem rgba(49, 37, 43, 0.16);
  transition: background var(--motion-standard) ease, border-color var(--motion-standard) ease;
}

.toggle-switch__thumb {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 0.18rem;
  inline-size: 1.14rem;
  block-size: 1.14rem;
  border: 1px solid rgba(58, 45, 51, 0.2);
  border-radius: 50%;
  background: var(--color-paper);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.32);
  transform: translateY(-50%);
  transition: transform var(--motion-standard) ease, background var(--motion-standard) ease;
}

.toggle-switch__input:checked + .toggle-switch__track {
  border-color: var(--color-sakura-700);
  background: linear-gradient(145deg, var(--color-sakura-300), var(--color-sakura-500));
}

.toggle-switch__input:checked + .toggle-switch__track .toggle-switch__thumb {
  background: #fff9fb;
  transform: translate(1.48rem, -50%);
}

.toggle-switch__input:focus-visible + .toggle-switch__track {
  box-shadow: var(--focus-ring);
}

.toggle-switch__input:disabled + .toggle-switch__track,
.toggle-switch__input:disabled ~ .toggle-switch__label {
  opacity: 0.5;
}
</style>
