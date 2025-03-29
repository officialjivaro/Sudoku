<template>
  <div class="home-screen">
    <div class="home-container">
      <img :src="heroImage" alt="Hero" />
      <DifficultySelector @difficulty-changed="setDifficulty" />

      <div class="switch-toggle music-toggle">
        <span>Music</span>
        <label class="switch">
          <input type="checkbox" v-model="musicOn" />
          <span class="slider"></span>
        </label>
      </div>

      <button class="custom-btn" style="margin-top: 1rem" @click="startGame">
        Play
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import heroImage from '../assets/hero.png'
import DifficultySelector from './DifficultySelector.vue'
import song from '../assets/song.mp3'

const router = useRouter()
const difficulty = ref('easy')

const musicOn = ref(false)

onMounted(() => {
  if (!window._bgAudio) {
    const audio = new Audio(song)
    audio.loop = true
    window._bgAudio = audio
  }

  musicOn.value = !window._bgAudio.paused
})

watch(musicOn, (newVal) => {
  if (window._bgAudio) {
    if (newVal) {
      window._bgAudio.play()
    } else {
      window._bgAudio.pause()
    }
  }
})

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

.switch-toggle.music-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 2.5rem;
  height: 1.25rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #444;
  transition: 0.2s;
  border-radius: 1.25rem;
  border: 1px solid #222;
}

.slider:before {
  position: absolute;
  content: "";
  height: 1rem;
  width: 1rem;
  left: 0.13rem;
  bottom: 0.13rem;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: #66bb6a;
}

.switch input:checked + .slider:before {
  transform: translateX(1.2rem);
}
</style>
