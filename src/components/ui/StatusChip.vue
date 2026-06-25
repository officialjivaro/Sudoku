<template>
  <span class="status-chip" :class="`status-chip--${tone}`">
    <span v-if="$slots.icon" class="status-chip__icon" aria-hidden="true"><slot name="icon" /></span>
    <span class="status-chip__content"><slot /></span>
  </span>
</template>

<script setup>
defineProps({
  tone: {
    type: String,
    default: 'paper',
    validator: value => ['paper', 'sakura', 'ink', 'gold', 'success', 'danger', 'muted'].includes(value)
  }
})
</script>

<style scoped>
.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-block-size: 2rem;
  padding: 0.35rem 0.68rem;
  border: 1px solid var(--paper-border);
  border-radius: 999px;
  background: rgba(255, 253, 249, 0.86);
  color: var(--color-ink);
  box-shadow: 0 0.18rem 0.55rem rgba(44, 33, 38, 0.11);
  font-size: clamp(0.66rem, 1.4vmin, 0.84rem);
  font-weight: 850;
  white-space: nowrap;
}

.status-chip__icon {
  display: inline-grid;
  place-items: center;
  inline-size: 1rem;
  block-size: 1rem;
}

.status-chip--sakura {
  border-color: rgba(185, 101, 124, 0.44);
  background: linear-gradient(145deg, rgba(251, 221, 229, 0.96), rgba(242, 189, 202, 0.9));
  color: #602a3d;
}

.status-chip--ink {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(40, 34, 38, 0.92);
  color: #fff;
}

.status-chip--gold {
  border-color: rgba(197, 146, 54, 0.42);
  background: rgba(255, 246, 207, 0.94);
  color: #65430d;
}

.status-chip--success {
  border-color: rgba(55, 109, 82, 0.38);
  background: rgba(222, 241, 231, 0.94);
  color: var(--color-success);
}

.status-chip--danger {
  border-color: rgba(154, 52, 81, 0.42);
  background: rgba(255, 222, 230, 0.96);
  color: var(--color-danger);
}

.status-chip--muted {
  opacity: 0.68;
}
</style>
