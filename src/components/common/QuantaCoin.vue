<template>
  <span class="quanta-coin" :class="`quanta-coin--${size}`" aria-hidden="true">Q</span>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'small',
    validator: value => ['small', 'medium', 'large'].includes(value)
  }
})
</script>

<style scoped>
.quanta-coin {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  aspect-ratio: 1;
  border: 2px solid #9b6517;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 26%, rgba(255, 255, 255, 0.92) 0 9%, transparent 10%),
    radial-gradient(circle at 35% 28%, #fff3aa, #f1bd45 55%, #b56e16);
  color: #513006;
  font-family: var(--font-display);
  font-weight: 950;
  line-height: 1;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.68), 0 2px 5px rgba(75, 43, 3, 0.3);
}

.quanta-coin::after {
  position: absolute;
  inset: 0.16rem;
  border: 1px solid rgba(81, 48, 6, 0.3);
  border-radius: 50%;
  content: '';
}

.quanta-coin--small {
  inline-size: 1.25rem;
  font-size: 0.68rem;
}

.quanta-coin--medium {
  inline-size: 2rem;
  font-size: 1rem;
}

.quanta-coin--large {
  inline-size: 3.2rem;
  font-size: 1.55rem;
}
</style>
