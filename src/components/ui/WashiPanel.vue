<template>
  <component
    :is="tag"
    class="washi-panel"
    :class="[
      `washi-panel--${variant}`,
      `washi-panel--${tone}`,
      { 'washi-panel--unpadded': !padded }
    ]"
  >
    <span class="washi-panel__accent" aria-hidden="true"></span>
    <div class="washi-panel__content">
      <slot />
    </div>
  </component>
</template>

<script setup>
defineProps({
  tag: {
    type: String,
    default: 'section'
  },
  variant: {
    type: String,
    default: 'main',
    validator: value => ['main', 'card', 'inset', 'feature'].includes(value)
  },
  tone: {
    type: String,
    default: 'paper',
    validator: value => ['paper', 'ink', 'gold'].includes(value)
  },
  padded: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.washi-panel {
  position: relative;
  isolation: isolate;
  min-inline-size: 0;
  border: 1px solid var(--paper-border);
  border-radius: var(--radius-large);
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.92), transparent 30%),
    repeating-linear-gradient(7deg, rgba(78, 58, 67, 0.018) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, rgba(255, 253, 248, 0.9), rgba(248, 239, 232, 0.78));
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(9px) saturate(0.92);
}

.washi-panel::before,
.washi-panel::after {
  position: absolute;
  z-index: -1;
  inline-size: 2.4rem;
  block-size: 2.4rem;
  border-color: rgba(127, 60, 81, 0.2);
  content: '';
  pointer-events: none;
}

.washi-panel::before {
  inset-block-start: 0.55rem;
  inset-inline-start: 0.55rem;
  border-block-start: 1px solid;
  border-inline-start: 1px solid;
}

.washi-panel::after {
  inset-block-end: 0.55rem;
  inset-inline-end: 0.55rem;
  border-block-end: 1px solid;
  border-inline-end: 1px solid;
}

.washi-panel__accent {
  position: absolute;
  z-index: 1;
  inset-block-start: -1px;
  inset-inline-start: 12%;
  inline-size: 32%;
  block-size: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--color-sakura-300), transparent);
  pointer-events: none;
}

.washi-panel__content {
  position: relative;
  z-index: 1;
  min-inline-size: 0;
  min-block-size: 0;
  padding: clamp(0.8rem, 1.8vmin, 1.35rem);
}

.washi-panel--card {
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-soft);
}

.washi-panel--card .washi-panel__content {
  padding: clamp(0.62rem, 1.25vmin, 0.95rem);
}

.washi-panel--inset {
  border-color: rgba(75, 59, 67, 0.18);
  background:
    repeating-linear-gradient(7deg, rgba(78, 58, 67, 0.014) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, rgba(250, 242, 236, 0.86), rgba(255, 252, 247, 0.74));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.48), 0 0.25rem 0.7rem rgba(49, 37, 43, 0.1);
}

.washi-panel--feature {
  border-color: rgba(127, 60, 81, 0.38);
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.95), transparent 34%),
    repeating-linear-gradient(7deg, rgba(78, 58, 67, 0.02) 0 1px, transparent 1px 5px),
    linear-gradient(150deg, rgba(255, 253, 248, 0.94), rgba(248, 228, 234, 0.84));
  box-shadow: var(--shadow-lifted);
}

.washi-panel--ink {
  border-color: rgba(255, 255, 255, 0.16);
  background:
    repeating-linear-gradient(7deg, rgba(255, 255, 255, 0.018) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, rgba(40, 34, 38, 0.94), rgba(25, 22, 24, 0.9));
  color: #fff;
}

.washi-panel--gold {
  border-color: rgba(197, 146, 54, 0.35);
  background:
    repeating-linear-gradient(7deg, rgba(91, 65, 19, 0.018) 0 1px, transparent 1px 5px),
    linear-gradient(145deg, rgba(255, 251, 232, 0.94), rgba(247, 225, 166, 0.82));
}

.washi-panel--unpadded .washi-panel__content {
  padding: 0;
}
</style>
