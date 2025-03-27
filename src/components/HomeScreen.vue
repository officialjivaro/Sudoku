<template>
  <div class="home-screen">
    <div class="home-container">
      <img :src="heroImage" alt="Hero" />
      <DifficultySelector @difficulty-changed="setDifficulty" />
      <button class="custom-btn" style="margin-top: 1rem" @click="startGame">
        Play
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import heroImage from '../assets/hero.png'
import DifficultySelector from './DifficultySelector.vue'

const router = useRouter()
const difficulty = ref('easy')

function setDifficulty(newDiff) {
  difficulty.value = newDiff
}

function startGame() {
  router.push({ name: 'game', params: { difficulty: difficulty.value } })
}
</script>

<style scoped>
.home-screen {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.home-container {
  width: 75vmin;
  height: 75vmin;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

img {
  max-width: 80%;
  margin-bottom: 2rem;
}
</style>
