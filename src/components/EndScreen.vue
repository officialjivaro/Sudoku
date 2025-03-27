<template>
  <div class="end-screen">
    <div class="end-content">
      <img :src="endImage" alt="End" class="end-image" />
      <h2 v-html="randomFactHtml"></h2>
      <button class="custom-btn" @click="goHome">
        Return to Home
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import facts from '../assets/facts.json'
import endImage from '../assets/endImage.png'

const router = useRouter()
const randomFactHtml = ref('')

onMounted(() => {
  const index = Math.floor(Math.random() * facts.length)
  const fact = facts[index]
  const words = fact.split(' ')
  let i = 0
  let lines = []
  while (i < words.length) {
    const chunkSize = Math.floor(Math.random() * 3) + 3
    const chunk = words.slice(i, i + chunkSize)
    i += chunkSize
    lines.push(chunk.join(' '))
  }
  randomFactHtml.value = lines.join('<br>')
})

function goHome() {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.end-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.end-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3vh;
}

.end-image {
  width: 60vw;
  height: auto;
  max-width: 1000px;
  margin-bottom: 2rem;
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
}
</style>
