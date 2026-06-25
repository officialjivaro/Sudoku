<template>
  <WashiPanel tag="aside" variant="main" class="control-panel" aria-label="Sudoku controls">
    <section class="control-section control-section--numbers">
      <header class="control-section__heading">
        <span>Number entry</span>
        <small>Keyboard 1–9</small>
      </header>
      <NumberPad
        :completed-numbers="completedNumbers"
        :disabled="disabled"
        @select="emit('digit', $event)"
      />
    </section>

    <section class="control-section">
      <header class="control-section__heading">
        <span>Tools</span>
        <small>Notes, history, help</small>
      </header>
      <GameActionBar
        :notes-mode="notesMode"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :hints-remaining="hintsRemaining"
        :disabled="disabled"
        @toggle-notes="emit('toggle-notes')"
        @erase="emit('erase')"
        @undo="emit('undo')"
        @redo="emit('redo')"
        @hint="emit('hint')"
      />
    </section>

    <section class="control-section control-section--support">
      <header class="control-section__heading">
        <span>Progress</span>
        <small>Completed digits</small>
      </header>
      <NumberTracker :completed-numbers="completedNumbers" />
    </section>

    <div class="control-panel__footer">
      <ToggleSwitch
        :model-value="highlightEditable"
        label="Highlight Empty Slots"
        :disabled="disabled"
        @update:model-value="emit('update:highlightEditable', $event)"
      />
      <AppButton size="small" variant="secondary" @click="emit('home')">Return Home</AppButton>
    </div>
  </WashiPanel>
</template>

<script setup>
import NumberTracker from './NumberTracker.vue'
import NumberPad from './NumberPad.vue'
import GameActionBar from './GameActionBar.vue'
import AppButton from '../ui/AppButton.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import WashiPanel from '../ui/WashiPanel.vue'

defineProps({
  completedNumbers: {
    type: Array,
    default: () => []
  },
  notesMode: {
    type: Boolean,
    default: false
  },
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  hintsRemaining: {
    type: Number,
    default: 0
  },
  highlightEditable: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'digit',
  'toggle-notes',
  'erase',
  'undo',
  'redo',
  'hint',
  'home',
  'update:highlightEditable'
])
</script>

<style scoped>
.control-panel {
  inline-size: 100%;
  min-inline-size: 0;
}

.control-panel :deep(.washi-panel__content) {
  display: grid;
  align-content: center;
  gap: clamp(0.5rem, 1dvh, 0.75rem);
  block-size: 100%;
  padding: clamp(0.65rem, 1.4vmin, 1rem);
}

.control-section {
  display: grid;
  gap: 0.36rem;
  padding: 0.48rem;
  border: 1px solid rgba(75, 59, 67, 0.14);
  border-radius: var(--radius-medium);
  background: rgba(255, 253, 248, 0.52);
}

.control-section__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.control-section__heading span {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 900;
}

.control-section__heading small {
  color: var(--color-ink-muted);
  font-size: 0.54rem;
  font-weight: 750;
}

.control-panel__footer {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  padding-block-start: 0.15rem;
}

@media (max-width: 54rem) {
  .control-panel :deep(.washi-panel__content) {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem;
  }

  .control-section--numbers,
  .control-section--support {
    grid-column: 1;
  }

  .control-section:not(.control-section--numbers):not(.control-section--support),
  .control-panel__footer {
    grid-column: 2;
  }

  .control-panel__footer {
    align-self: stretch;
    align-content: center;
  }
}

@media (max-width: 36rem) {
  .control-panel :deep(.washi-panel__content) {
    grid-template-columns: 1fr;
  }

  .control-section--numbers,
  .control-section--support,
  .control-section:not(.control-section--numbers):not(.control-section--support),
  .control-panel__footer {
    grid-column: 1;
  }

  .control-section__heading {
    display: none;
  }

  .control-section {
    padding: 0.32rem;
  }

  .control-panel__footer {
    grid-template-columns: 1fr auto;
    align-items: center;
    justify-items: stretch;
  }
}

@media (max-height: 38rem) and (min-width: 54.01rem) {
  .control-section__heading small {
    display: none;
  }

  .control-section {
    padding: 0.32rem;
  }
}
</style>
