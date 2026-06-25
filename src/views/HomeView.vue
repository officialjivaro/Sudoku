<template>
  <section class="home-view app-page">
    <div class="home-dashboard">
      <WashiPanel variant="feature" class="home-feature">
        <div class="home-feature__brand">
          <p class="eyebrow">A quiet puzzle among the blossoms</p>
          <h1 class="home-feature__title display-title">SUDOKU</h1>
          <p class="home-feature__subtitle">Pause. Focus. Complete the grid.</p>
          <span class="home-feature__divider" aria-hidden="true">❀</span>
        </div>

        <div class="home-feature__selection">
          <div class="home-feature__mode">
            <span class="home-feature__mode-mark" aria-hidden="true">{{ selectedModeIcon }}</span>
            <div>
              <span>Selected mode</span>
              <strong>{{ selectedMode.label }}</strong>
            </div>
          </div>
          <p>{{ selectedMode.description }}</p>
        </div>

        <DifficultySelector v-if="showDifficulty" v-model="difficulty" />
        <WashiPanel v-else tag="div" variant="inset" class="home-feature__daily">
          <span class="eyebrow">Today’s shared puzzle</span>
          <p>{{ dailyStatusMessage }}</p>
        </WashiPanel>

        <div class="home-feature__utilities">
          <ToggleSwitch label="Music" :model-value="isPlaying" @update:model-value="handleMusicChange" />
          <span class="home-feature__mode-rule">{{ selectedModeRule }}</span>
        </div>

        <p v-if="errorMessage || online.state.startError" class="home-feature__message" role="status">
          {{ errorMessage || online.state.startError }}
        </p>

        <AppButton class="home-feature__play" size="large" :disabled="isStarting" @click="beginGame">
          {{ isStarting ? 'Preparing…' : callToAction }}
        </AppButton>
      </WashiPanel>

      <div class="home-dashboard__side">
        <WashiPanel variant="main" class="home-modes">
          <div class="home-section-heading">
            <div>
              <p class="eyebrow">Ways to play</p>
              <h2 class="section-title">Choose your rhythm</h2>
            </div>
            <span class="home-section-heading__stamp" aria-hidden="true">遊</span>
          </div>
          <GameModeSelector v-model="mode" :daily-state="dailyState" />
        </WashiPanel>

        <WashiPanel variant="inset" class="home-stats">
          <div class="home-section-heading home-section-heading--compact">
            <div>
              <p class="eyebrow">Your local record</p>
              <h2 class="section-title">Quiet progress</h2>
            </div>
          </div>
          <LocalStatsSummary :stats="stats" />
        </WashiPanel>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameModeSelector from '../components/home/GameModeSelector.vue'
import LocalStatsSummary from '../components/home/LocalStatsSummary.vue'
import DifficultySelector from '../components/home/DifficultySelector.vue'
import AppButton from '../components/ui/AppButton.vue'
import ToggleSwitch from '../components/ui/ToggleSwitch.vue'
import WashiPanel from '../components/ui/WashiPanel.vue'
import { useAudioPlayer } from '../composables/useAudioPlayer.js'
import { useOnlineAccount } from '../composables/useOnlineAccount.js'
import { useSudokuOnline } from '../composables/useSudokuOnline.js'
import { useGameSession } from '../composables/useGameSession.js'
import { usePlayerStats } from '../composables/usePlayerStats.js'
import { GAME_MODES } from '../constants/gameModes.js'
import { getUtcDateKey } from '../services/dailyChallengeService.js'
import { createId } from '../utils/createId.js'

const router = useRouter()
const mode = ref('classic')
const difficulty = ref('easy')
const isStarting = ref(false)
const { isPlaying, errorMessage, setPlaying } = useAudioPlayer()
const { game, startGame, showStoredResult, attachOnlineRun } = useGameSession()
const account = useOnlineAccount()
const online = useSudokuOnline()
const { stats, refreshStats } = usePlayerStats()

const selectedMode = computed(() => GAME_MODES[mode.value])
const showDifficulty = computed(() => !selectedMode.value.fixedDifficulty)
const dailyState = computed(() => stats.dailyCompletion ? 'completed' : stats.dailyProgress ? 'resume' : 'new')
const selectedModeIcon = computed(() => ({ classic: '井', daily: '日', sprint: '刻', zen: '○' })[mode.value])
const selectedModeRule = computed(() => ({
  classic: 'Timer · mistakes · hints',
  daily: 'Same Medium puzzle worldwide',
  sprint: '15 / 10 / 7 minute countdown',
  zen: 'No visible timer or mistakes'
})[mode.value])

const dailyStatusMessage = computed(() => {
  if (stats.dailyCompletion) return 'Today’s challenge is complete. Your result is ready to revisit.'
  if (stats.dailyProgress) return 'Your Daily Challenge is saved on this device and ready to resume.'
  return 'Everyone receives the same Medium puzzle for the current UTC date.'
})

const callToAction = computed(() => {
  if (mode.value === 'daily') {
    if (stats.dailyCompletion) return 'View Today’s Result'
    return stats.dailyProgress ? 'Resume Daily Challenge' : 'Start Daily Challenge'
  }

  return {
    classic: 'Play Classic',
    sprint: 'Start Sprint',
    zen: 'Enter Zen'
  }[mode.value]
})

onMounted(() => refreshStats())

async function handleMusicChange(value) {
  await setPlaying(value)
}

async function beginGame() {
  if (isStarting.value) return

  isStarting.value = true
  await nextTick()

  try {
    if (mode.value === 'daily' && stats.dailyCompletion) {
      showStoredResult(stats.dailyCompletion)
      await router.push({ name: 'end' })
      return
    }

    const selectedDifficulty = selectedMode.value.fixedDifficulty || difficulty.value
    const dailyDate = mode.value === 'daily' ? getUtcDateKey() : null
    const clientRunId = createId()
    online.clearResultStatus()

    const onlineRun = await online.prepareRun({
      mode: mode.value,
      difficulty: selectedDifficulty,
      dailyDate,
      clientRunId
    }, account.isAuthenticated.value)

    startGame({
      mode: mode.value,
      difficulty: selectedDifficulty,
      dateKey: dailyDate,
      clientRunId,
      onlineRun,
      generatedPuzzle: onlineRun
        ? { puzzle: onlineRun.puzzle, solution: onlineRun.solution }
        : null
    })

    if (onlineRun && !game.onlineRunToken) attachOnlineRun(onlineRun)

    if (game.status === 'completed') {
      await router.push({ name: 'end' })
      return
    }

    await router.push({
      name: 'game',
      query: {
        mode: mode.value,
        difficulty: selectedDifficulty
      }
    })
  } finally {
    isStarting.value = false
  }
}
</script>

<style scoped>
.home-view {
  padding: var(--page-gutter);
}

.home-dashboard {
  display: grid;
  grid-template-columns: minmax(17rem, 0.86fr) minmax(25rem, 1.14fr);
  gap: clamp(0.6rem, 1.4vw, 1rem);
  inline-size: min(97vw, 78rem);
  block-size: min(100%, 50rem);
  min-block-size: 0;
}

.home-feature,
.home-dashboard__side,
.home-modes,
.home-stats {
  min-block-size: 0;
}

.home-feature :deep(.washi-panel__content) {
  display: grid;
  align-content: center;
  gap: clamp(0.65rem, 1.45dvh, 1rem);
  block-size: 100%;
}

.home-feature__brand {
  display: grid;
  justify-items: start;
  gap: 0.12rem;
}

.home-feature__title {
  margin: 0;
  font-size: clamp(3.7rem, 9.3vmin, 7rem);
  line-height: 0.9;
}

.home-feature__subtitle {
  margin: 0.35rem 0 0;
  color: var(--color-ink-soft);
  font-family: var(--font-display);
  font-size: clamp(0.92rem, 1.8vmin, 1.2rem);
  font-style: italic;
}

.home-feature__divider {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  inline-size: 100%;
  margin-block-start: 0.35rem;
  color: var(--color-sakura-500);
}

.home-feature__divider::before,
.home-feature__divider::after {
  block-size: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(127, 60, 81, 0.38));
  content: '';
}

.home-feature__divider::after {
  background: linear-gradient(90deg, rgba(127, 60, 81, 0.38), transparent);
}

.home-feature__selection {
  display: grid;
  gap: 0.4rem;
  padding-block: 0.25rem;
}

.home-feature__mode {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.home-feature__mode-mark,
.home-section-heading__stamp {
  display: grid;
  place-items: center;
  inline-size: 2.55rem;
  block-size: 2.55rem;
  border: 1px solid rgba(127, 60, 81, 0.34);
  border-radius: 50%;
  background: var(--color-sakura-100);
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 900;
}

.home-feature__mode div {
  display: grid;
  gap: 0.05rem;
}

.home-feature__mode div span {
  color: var(--color-ink-muted);
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.home-feature__mode strong {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.2vmin, 1.5rem);
}

.home-feature__selection > p,
.home-feature__daily p {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: clamp(0.72rem, 1.3vmin, 0.86rem);
  line-height: 1.45;
}

.home-feature__daily :deep(.washi-panel__content) {
  display: grid;
  gap: 0.3rem;
  padding: 0.7rem;
}

.home-feature__utilities {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.home-feature__mode-rule {
  color: var(--color-ink-muted);
  font-size: 0.68rem;
  font-weight: 750;
}

.home-feature__message {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.78rem;
  font-weight: 800;
}

.home-feature__play {
  justify-self: start;
  min-inline-size: clamp(11rem, 19vw, 15rem);
}

.home-dashboard__side {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: clamp(0.6rem, 1.4vw, 1rem);
}

.home-modes :deep(.washi-panel__content) {
  display: grid;
  align-content: center;
  gap: 0.7rem;
  block-size: 100%;
}

.home-stats :deep(.washi-panel__content) {
  display: grid;
  gap: 0.55rem;
}

.home-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.home-section-heading--compact {
  align-items: end;
}

@media (max-width: 55rem) {
  .home-dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    inline-size: min(96vw, 44rem);
    overflow: hidden;
  }

  .home-feature :deep(.washi-panel__content) {
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 0.55rem 0.8rem;
  }

  .home-feature__brand,
  .home-feature__selection {
    grid-column: 1;
  }

  .home-feature :deep(.difficulty-selector),
  .home-feature__daily,
  .home-feature__utilities,
  .home-feature__message,
  .home-feature__play {
    grid-column: 2;
  }

  .home-feature__title {
    font-size: clamp(2.8rem, 9vw, 5rem);
  }
}

@media (max-width: 39rem) {
  .home-dashboard {
    grid-template-rows: auto minmax(0, 1fr);
  }

  .home-feature :deep(.washi-panel__content) {
    grid-template-columns: 1fr;
  }

  .home-feature__brand,
  .home-feature__selection,
  .home-feature :deep(.difficulty-selector),
  .home-feature__daily,
  .home-feature__utilities,
  .home-feature__message,
  .home-feature__play {
    grid-column: 1;
  }

  .home-feature__selection > p,
  .home-feature__subtitle,
  .home-feature__mode-rule {
    display: none;
  }

  .home-feature__play {
    justify-self: stretch;
  }
}

@media (max-height: 41rem) and (min-width: 55.01rem) {
  .home-dashboard {
    block-size: 100%;
  }

  .home-feature__subtitle,
  .home-feature__selection > p,
  .home-feature__mode-rule {
    display: none;
  }

  .home-feature__title {
    font-size: clamp(3.2rem, 8dvh, 4.5rem);
  }
}

@media (max-height: 37rem) {
  .home-view {
    padding-block: 0.25rem;
  }

  .home-dashboard {
    gap: 0.4rem;
  }

  .home-feature__divider,
  .home-stats {
    display: none;
  }

  .home-dashboard__side {
    grid-template-rows: 1fr;
  }
}
</style>
