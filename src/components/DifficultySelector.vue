<template>
  <div class="difficulty-selector">
    <label for="difficulty">Select Difficulty:</label>
    <select
      name="difficulty"
      id="difficulty"
      v-model="selectedDifficulty"
      @change="emitDifficulty"
    >
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const selectedDifficulty = ref('easy')
const emit = defineEmits(['difficulty-changed'])

function emitDifficulty() {
  emit('difficulty-changed', selectedDifficulty.value)
}
</script>

<style scoped>
.difficulty-selector {
  margin-bottom: 1rem;
}
label {
  margin-right: 0.5rem;
  font-weight: bold;
}
select {
  padding: 0.25rem 0.5rem;
}
</style>
