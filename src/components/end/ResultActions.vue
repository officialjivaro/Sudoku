<template>
  <div class="result-actions">
    <AppButton v-if="canRetry" size="large" @click="emit('retry')">Play Again</AppButton>
    <AppButton variant="secondary" @click="emit('copy')">{{ copyLabel }}</AppButton>
    <AppButton variant="quiet" @click="emit('home')">Return Home</AppButton>
  </div>
</template>

<script setup>
import AppButton from '../ui/AppButton.vue'

defineProps({
  canRetry: {
    type: Boolean,
    default: true
  },
  copyLabel: {
    type: String,
    default: 'Copy Result'
  }
})

const emit = defineEmits(['retry', 'copy', 'home'])
</script>

<style scoped>
.result-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 32rem) {
  .result-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    inline-size: 100%;
  }

  .result-actions :deep(.app-button:first-child) {
    grid-column: 1 / -1;
  }
}
</style>
