<template>
    <div class="timer">Time: {{ time }}</div>
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
    font-size: 1.25rem;
    margin: 1rem 0;
  }
  </style>
  