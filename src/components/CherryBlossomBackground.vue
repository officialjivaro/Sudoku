<template>
  <div class="cherry-blossom-bg">
    <div class="cherry-background"></div>
    <div
      class="petal"
      v-for="(petalImage, i) in petalsArray"
      :key="i"
      :style="getPetalStyle(i, petalImage)"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import background from '../assets/background.png'
import petal1 from '../assets/petal-1.png'
import petal2 from '../assets/petal-2.png'
import petal3 from '../assets/petal-3.png'
import petal4 from '../assets/petal-4.png'

const petalsArray = ref([])

onBeforeMount(() => {
  const styleEl = document.createElement('style')
  styleEl.type = 'text/css'
  let keyframesCSS = ''
  for (let i = 0; i < 50; i++) {
    keyframesCSS += `
    @keyframes fall-${i} {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(110vh) translateX(-40vw) rotate(360deg);
        opacity: 0;
      }
    }`
  }
  styleEl.innerHTML = keyframesCSS
  document.head.appendChild(styleEl)
})

onMounted(() => {
  const totalPetals = 25
  const images = [petal1, petal2, petal3, petal4]
  const temp = []
  for (let i = 0; i < totalPetals; i++) {
    const randomImage = images[Math.floor(Math.random() * images.length)]
    temp.push(randomImage)
  }
  petalsArray.value = temp
})

function getPetalStyle(index, petalImage) {
  // random left between 0% and 100%
  const startLeft = Math.random() * 100
  // random fall duration between 3 - 9s
  const fallDuration = Math.random() * 3 + 6
  // random scale 1 - 3
  const size = Math.random() * 2 + 1

  return {
    position: 'absolute',
    top: '-10%',
    left: `${startLeft}%`,
    width: `${20 * size}px`,
    height: `${20 * size}px`,
    background: `url(${petalImage}) no-repeat center/contain`,
    animation: `fall-${index} ${fallDuration}s linear infinite`,
    pointerEvents: 'none'
  }
}
</script>

<style scoped>
.cherry-blossom-bg {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.cherry-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("../assets/background.png") no-repeat center center;
  background-size: cover;
}

.petal {
  animation-iteration-count: infinite;
}
</style>
