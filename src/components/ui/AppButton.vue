<template>
  <button
    class="app-button"
    :class="[`app-button--${size}`, `app-button--${variant}`]"
    :type="type"
    :disabled="disabled"
  >
    <span class="app-button__content"><slot /></span>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'quiet'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.app-button {
  position: relative;
  display: inline-grid;
  place-items: center;
  min-inline-size: 8.5rem;
  overflow: hidden;
  border: 1px solid var(--paper-border-strong);
  border-radius: var(--radius-medium);
  cursor: pointer;
  font-family: inherit;
  font-weight: 900;
  line-height: 1;
  transition: transform var(--motion-fast) ease, box-shadow var(--motion-fast) ease, filter var(--motion-fast) ease, background var(--motion-fast) ease;
}

.app-button::before {
  position: absolute;
  inset: 1px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: calc(var(--radius-medium) - 2px);
  content: '';
  pointer-events: none;
}

.app-button__content {
  position: relative;
  z-index: 1;
}

.app-button--primary {
  border-color: rgba(127, 60, 81, 0.62);
  background: linear-gradient(145deg, var(--color-sakura-100), var(--color-sakura-300));
  color: #4c2130;
  box-shadow: 0 0.28rem 0 var(--color-sakura-700), var(--shadow-soft);
}

.app-button--secondary {
  background:
    repeating-linear-gradient(8deg, rgba(78, 58, 67, 0.018) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, rgba(255, 253, 248, 0.97), rgba(238, 224, 214, 0.94));
  color: var(--color-ink);
  box-shadow: 0 0.24rem 0 #947b83, var(--shadow-soft);
}

.app-button--quiet {
  border-color: rgba(255, 255, 255, 0.14);
  background: linear-gradient(145deg, rgba(54, 46, 51, 0.94), rgba(34, 30, 32, 0.94));
  color: #fff;
  box-shadow: 0 0.22rem 0 rgba(18, 15, 17, 0.84), var(--shadow-soft);
}

.app-button--small {
  min-inline-size: 7rem;
  padding: 0.62rem 0.95rem;
  font-size: 0.9rem;
}

.app-button--medium {
  padding: 0.82rem 1.4rem;
  font-size: 1.05rem;
}

.app-button--large {
  min-inline-size: 10rem;
  padding: 0.98rem 1.7rem;
  font-size: 1.3rem;
}

.app-button:hover:not(:disabled) {
  filter: brightness(1.03);
  transform: translateY(-0.13rem);
}

.app-button--primary:hover:not(:disabled) {
  box-shadow: 0 0.43rem 0 var(--color-sakura-700), var(--shadow-panel);
}

.app-button--secondary:hover:not(:disabled) {
  box-shadow: 0 0.38rem 0 #947b83, var(--shadow-panel);
}

.app-button--quiet:hover:not(:disabled) {
  background: linear-gradient(145deg, rgba(42, 36, 39, 0.98), rgba(25, 22, 24, 0.98));
  box-shadow: 0 0.35rem 0 rgba(18, 15, 17, 0.86), var(--shadow-panel);
}

.app-button:active:not(:disabled) {
  transform: translateY(0.14rem);
  box-shadow: 0 0.08rem 0 var(--color-sakura-700), var(--shadow-soft);
}

.app-button:focus-visible {
  box-shadow: var(--focus-ring);
}

.app-button:disabled {
  cursor: not-allowed;
  filter: grayscale(0.38);
  opacity: 0.58;
}
</style>
