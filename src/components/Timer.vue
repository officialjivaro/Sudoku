<template>
  <div class="timer">
    Time: {{ time }}
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const time = ref('00:00')
let startTime, intervalId

onMounted(() => {
  startTime = Date.now()
  intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
    const seconds = String(elapsed % 60).padStart(2, '0')
    time.value = `${minutes}:${seconds}`
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.timer {
  font-size: 3vmin;
  margin: 1rem 0;
  color: #f66;
  text-shadow: 1px 1px 2px rgb(0, 0, 0);
  border: 1px solid rgb(0, 0, 0);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(44, 44, 44, 0.3);
}
</style>
