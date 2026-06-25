<template>
  <StatusChip :tone="isUrgent ? 'danger' : timerType === 'countdown' ? 'gold' : 'paper'">
    <template #icon>{{ timerType === 'countdown' ? '刻' : '時' }}</template>
    {{ timerType === 'countdown' ? 'Left' : 'Time' }} {{ displayTime }}
  </StatusChip>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import StatusChip from '../ui/StatusChip.vue'
import { formatTime } from '../../utils/formatTime.js'

const props = defineProps({
  timerType: {
    type: String,
    default: 'elapsed',
    validator: value => ['elapsed', 'countdown'].includes(value)
  },
  startedAt: {
    type: Number,
    default: null
  },
  deadline: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['expired'])
const now = ref(Date.now())
let intervalId = null
let expiredEmitted = false

const displaySeconds = computed(() => {
  if (props.timerType === 'countdown') {
    return Math.max(0, Math.ceil(((props.deadline || now.value) - now.value) / 1000))
  }

  return Math.max(0, Math.floor((now.value - (props.startedAt || now.value)) / 1000))
})

const displayTime = computed(() => formatTime(displaySeconds.value))
const isUrgent = computed(() => props.timerType === 'countdown' && displaySeconds.value <= 60)

watch(
  () => [props.timerType, props.startedAt, props.deadline],
  () => {
    expiredEmitted = false
    updateClock()
  }
)

function updateClock() {
  now.value = Date.now()

  if (props.timerType === 'countdown' && displaySeconds.value <= 0 && !expiredEmitted) {
    expiredEmitted = true
    emit('expired')
  }
}

onMounted(() => {
  updateClock()
  intervalId = window.setInterval(updateClock, 250)
})

onBeforeUnmount(() => window.clearInterval(intervalId))
</script>
