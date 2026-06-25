<template>
  <div
    class="blossom-scene"
    :class="[
      `blossom-scene--${density}`,
      { 'blossom-scene--muted': muted, 'blossom-scene--paused': pageHidden }
    ]"
    aria-hidden="true"
  >
    <img class="blossom-scene__image" :src="store.activeBackgroundUrl.value" alt="" />
    <div class="blossom-scene__wash"></div>
    <img
      v-for="petal in visiblePetals"
      :key="petal.id"
      class="blossom-scene__petal"
      :src="petal.image"
      alt=""
      :style="petal.style"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useSudokuStore } from '../../composables/useSudokuStore.js'
import petal1 from '../../assets/images/petals/petal-1.png'
import petal2 from '../../assets/images/petals/petal-2.png'
import petal3 from '../../assets/images/petals/petal-3.png'
import petal4 from '../../assets/images/petals/petal-4.png'

const props = defineProps({
  density: {
    type: String,
    default: 'full',
    validator: value => ['full', 'medium', 'reduced', 'minimal'].includes(value)
  },
  muted: {
    type: Boolean,
    default: false
  }
})

const store = useSudokuStore()
const narrowScreen = ref(false)
const pageHidden = ref(false)
const petalImages = [petal1, petal2, petal3, petal4]
const petalCounts = Object.freeze({ full: 30, medium: 21, reduced: 14, minimal: 7 })

const petals = Array.from({ length: 30 }, (_, index) => {
  const duration = 11 + Math.random() * 12
  const delay = -(Math.random() * duration)
  const size = 17 + Math.random() * 32
  const drift = -(13 + Math.random() * 34)
  const spin = 220 + Math.random() * 620

  return {
    id: index,
    image: petalImages[Math.floor(Math.random() * petalImages.length)],
    style: {
      '--petal-left': `${Math.random() * 100}%`,
      '--petal-size': `${size}px`,
      '--petal-duration': `${duration}s`,
      '--petal-delay': `${delay}s`,
      '--petal-drift': `${drift}vw`,
      '--petal-spin': `${spin}deg`,
      '--petal-opacity': `${0.42 + Math.random() * 0.42}`
    }
  }
})

const visiblePetals = computed(() => {
  const baseCount = props.muted ? petalCounts.minimal : petalCounts[props.density]
  const responsiveCount = narrowScreen.value ? Math.max(5, Math.round(baseCount * 0.62)) : baseCount
  return petals.slice(0, responsiveCount)
})

function updateViewport() {
  narrowScreen.value = window.innerWidth < 640
}

function updateVisibility() {
  pageHidden.value = document.hidden
}

onMounted(() => {
  updateViewport()
  updateVisibility()
  window.addEventListener('resize', updateViewport, { passive: true })
  document.addEventListener('visibilitychange', updateVisibility)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
  document.removeEventListener('visibilitychange', updateVisibility)
})
</script>

<style scoped>
.blossom-scene {
  position: absolute;
  z-index: var(--z-background);
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.blossom-scene__image,
.blossom-scene__wash {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
}

.blossom-scene__image {
  object-fit: cover;
  object-position: center;
  transition: filter 300ms ease, transform 500ms ease;
}

.blossom-scene__wash {
  background:
    radial-gradient(circle at 52% 44%, rgba(255, 255, 255, 0.02), transparent 45%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.2), rgba(255, 244, 247, 0.06) 50%, rgba(255, 255, 255, 0.16));
  transition: background 250ms ease;
}

.blossom-scene--muted .blossom-scene__image {
  filter: saturate(0.72) brightness(0.8);
  transform: scale(1.015);
}

.blossom-scene--muted .blossom-scene__wash {
  background: rgba(28, 21, 25, 0.24);
}

.blossom-scene__petal {
  position: absolute;
  inset-block-start: -10vh;
  inset-inline-start: var(--petal-left);
  inline-size: var(--petal-size);
  block-size: var(--petal-size);
  opacity: 0;
  object-fit: contain;
  will-change: transform, opacity;
  animation: petal-fall var(--petal-duration) linear var(--petal-delay) infinite;
}

.blossom-scene--reduced .blossom-scene__petal,
.blossom-scene--minimal .blossom-scene__petal {
  filter: saturate(0.82);
}

.blossom-scene--paused .blossom-scene__petal {
  animation-play-state: paused;
}

@keyframes petal-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -12vh, 0) rotate(0deg);
  }

  10% {
    opacity: var(--petal-opacity);
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--petal-drift), 116vh, 0) rotate(var(--petal-spin));
  }
}

@media (prefers-reduced-motion: reduce) {
  .blossom-scene__petal {
    display: none;
  }
}
</style>

<style>
:root[data-sudoku-petal-pack='moon-petals'] .blossom-scene__petal { filter: hue-rotate(40deg) saturate(0.75); }
:root[data-sudoku-petal-pack='golden-petals'] .blossom-scene__petal { filter: sepia(1) saturate(1.8) hue-rotate(345deg) brightness(1.08); }
:root[data-sudoku-petal-pack='crimson-petals'] .blossom-scene__petal { filter: saturate(1.55) hue-rotate(330deg) brightness(0.9); }
</style>
