<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-shell__overlay" role="presentation" @click.self="emit('close')">
      <section
        ref="dialogElement"
        class="modal-shell"
        :class="`modal-shell--${size}`"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId || undefined"
        :aria-label="titleId ? undefined : ariaLabel"
        tabindex="-1"
      >
        <button ref="closeButton" class="modal-shell__close" type="button" :aria-label="closeLabel" @click="emit('close')">×</button>

        <header v-if="$slots.header" class="modal-shell__header">
          <slot name="header" />
        </header>

        <div class="modal-shell__body internal-scroll">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="modal-shell__footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  titleId: {
    type: String,
    default: ''
  },
  ariaLabel: {
    type: String,
    default: 'Dialog'
  },
  closeLabel: {
    type: String,
    default: 'Close dialog'
  },
  size: {
    type: String,
    default: 'standard',
    validator: value => ['compact', 'standard', 'wide', 'market'].includes(value)
  }
})

const emit = defineEmits(['close'])
const dialogElement = ref(null)
const closeButton = ref(null)
let previousFocus = null

watch(
  () => props.open,
  async open => {
    if (open) {
      previousFocus = document.activeElement
      window.addEventListener('keydown', handleKeydown)
      await nextTick()
      closeButton.value?.focus({ preventScroll: true })
      return
    }

    window.removeEventListener('keydown', handleKeydown)
    previousFocus?.focus?.({ preventScroll: true })
  }
)

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<style scoped>
.modal-shell__overlay {
  position: fixed;
  z-index: var(--z-modal);
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.45rem, 2vw, 1.4rem);
  background: rgba(24, 18, 22, 0.74);
  backdrop-filter: blur(10px) saturate(0.82);
}

.modal-shell {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  inline-size: min(100%, 52rem);
  max-block-size: min(94dvh, 56rem);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.98), transparent 28%),
    repeating-linear-gradient(8deg, rgba(78, 58, 67, 0.018) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, rgba(255, 253, 248, 0.97), rgba(246, 232, 227, 0.94));
  box-shadow: 0 1.5rem 4rem rgba(22, 15, 19, 0.42);
}

.modal-shell::after {
  position: absolute;
  inset: 0.55rem;
  border: 1px solid rgba(127, 60, 81, 0.13);
  border-radius: calc(var(--radius-xl) - 0.35rem);
  content: '';
  pointer-events: none;
}

.modal-shell--compact {
  inline-size: min(100%, 32rem);
}

.modal-shell--wide {
  inline-size: min(100%, 68rem);
}

.modal-shell--market {
  inline-size: min(100%, 78rem);
}

.modal-shell__close {
  position: absolute;
  z-index: 5;
  inset-block-start: 0.7rem;
  inset-inline-end: 0.75rem;
  display: grid;
  place-items: center;
  inline-size: 2.45rem;
  block-size: 2.45rem;
  padding: 0;
  border: 1px solid var(--paper-border-strong);
  border-radius: 50%;
  background: rgba(255, 253, 249, 0.94);
  color: var(--color-ink);
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
  transition: transform var(--motion-fast) ease, background var(--motion-fast) ease;
}

.modal-shell__close:hover {
  background: var(--color-sakura-100);
  transform: rotate(4deg);
}

.modal-shell__close:focus-visible {
  box-shadow: var(--focus-ring);
}

.modal-shell__header {
  position: relative;
  z-index: 1;
  padding: clamp(0.95rem, 2.2vw, 1.55rem) clamp(3.8rem, 5vw, 4.5rem) clamp(0.65rem, 1.3vw, 0.95rem) clamp(0.95rem, 2.2vw, 1.55rem);
  border-block-end: 1px solid rgba(127, 60, 81, 0.13);
}

.modal-shell__body {
  position: relative;
  z-index: 1;
  min-block-size: 0;
  overflow: auto;
  padding: clamp(0.8rem, 1.9vw, 1.35rem);
}

.modal-shell__footer {
  position: relative;
  z-index: 1;
  padding: clamp(0.65rem, 1.4vw, 0.95rem) clamp(0.8rem, 1.9vw, 1.35rem);
  border-block-start: 1px solid rgba(127, 60, 81, 0.13);
  background: rgba(255, 253, 249, 0.52);
}

@media (max-width: 34rem) {
  .modal-shell__overlay {
    padding: 0.35rem;
  }

  .modal-shell {
    max-block-size: 96dvh;
    border-radius: var(--radius-large);
  }

  .modal-shell__header {
    padding-block-start: 0.85rem;
  }
}
</style>
