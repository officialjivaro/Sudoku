<template>
  <div class="app-container">
    <CherryBlossomBackground />

    <Banner />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Banner from './components/Banner.vue'
import CherryBlossomBackground from './components/CherryBlossomBackground.vue'
</script>

<style scoped>
</style>
