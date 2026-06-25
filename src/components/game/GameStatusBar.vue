<template>
  <div class="status-bar" aria-label="Game status">
    <StatusChip tone="sakura">
      <template #icon>遊</template>
      {{ modeLabel }}
    </StatusChip>
    <StatusChip>
      <template #icon>級</template>
      {{ difficultyLabel }}
    </StatusChip>
    <GameTimer
      v-if="showTimer"
      :timer-type="timerType"
      :started-at="startedAt"
      :deadline="deadline"
      @expired="emit('expired')"
    />
    <StatusChip v-if="showMistakes" :tone="mistakes > 0 ? 'danger' : 'paper'">
      <template #icon>誤</template>
      Mistakes {{ mistakes }}
    </StatusChip>
    <StatusChip :tone="hintsRemaining <= 1 ? 'gold' : 'paper'">
      <template #icon>光</template>
      Hints {{ hintsRemaining }}
    </StatusChip>
  </div>
</template>

<script setup>
import GameTimer from './GameTimer.vue'
import StatusChip from '../ui/StatusChip.vue'

defineProps({
  modeLabel: {
    type: String,
    required: true
  },
  difficultyLabel: {
    type: String,
    required: true
  },
  timerType: {
    type: String,
    default: 'elapsed'
  },
  showTimer: {
    type: Boolean,
    default: true
  },
  showMistakes: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Number,
    default: null
  },
  deadline: {
    type: Number,
    default: null
  },
  mistakes: {
    type: Number,
    default: 0
  },
  hintsRemaining: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['expired'])
</script>

<style scoped>
.status-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.36rem;
  inline-size: 100%;
  padding: 0.28rem;
}
</style>
