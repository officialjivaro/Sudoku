<template>
  <div class="app-container">
    <Banner />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Banner from './components/Banner.vue'
</script>

<style scoped>
</style>
