<template>
  <section class="end-view app-page">
    <div v-if="result" class="end-ceremony">
      <WashiPanel variant="feature" class="end-outcome">
        <p class="eyebrow">{{ result.status === 'expired' ? 'The final petal fell' : 'The grid is complete' }}</p>
        <h1 class="end-outcome__title display-title">{{ result.status === 'expired' ? 'Time’s up.' : 'Well done.' }}</h1>
        <p class="end-outcome__subtitle">
          {{ result.status === 'expired' ? 'The puzzle remains for another attempt.' : 'A calm mind found every number.' }}
        </p>
        <ResultSummary :result="result" />
        <OnlineResultStatus
          v-if="result.status === 'completed'"
          :submitting="online.state.submitting"
          :message="onlineResultMessage"
          :error="online.state.submissionError"
        />
      </WashiPanel>

      <WashiPanel variant="main" class="end-fact">
        <div class="end-fact__heading">
          <span aria-hidden="true">知</span>
          <div>
            <p class="eyebrow">A small reward for curiosity</p>
            <h2 class="section-title">Did you know?</h2>
          </div>
        </div>
        <p class="end-fact__copy">
          <span v-for="(line, index) in factLines" :key="`${line}-${index}`">{{ line }}</span>
        </p>
      </WashiPanel>

      <WashiPanel variant="inset" class="end-actions-panel">
        <ResultActions
          :can-retry="result.mode !== 'daily'"
          :copy-label="copyLabel"
          @retry="retryGame"
          @copy="copyResult"
          @home="returnHome"
        />
      </WashiPanel>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import facts from '../assets/data/facts.json'
import OnlineResultStatus from '../components/end/OnlineResultStatus.vue'
import ResultActions from '../components/end/ResultActions.vue'
import ResultSummary from '../components/end/ResultSummary.vue'
import WashiPanel from '../components/ui/WashiPanel.vue'
import { useEconomy } from '../composables/useEconomy.js'
import { useGameSession } from '../composables/useGameSession.js'
import { useOnlineAccount } from '../composables/useOnlineAccount.js'
import { useSudokuOnline } from '../composables/useSudokuOnline.js'
import { pickRandomFact, splitFactIntoLines } from '../utils/factLines.js'
import { buildResultSummary } from '../utils/resultSummary.js'
import { createId } from '../utils/createId.js'

const router = useRouter()
const { game, startGame, abandonGame } = useGameSession()
const account = useOnlineAccount()
const economy = useEconomy()
const online = useSudokuOnline()
const copyLabel = ref('Copy Result')
const selectedFact = pickRandomFact(facts)
const factLines = splitFactIntoLines(selectedFact)
const result = computed(() => game.lastResult)
const onlineResultMessage = computed(() => [
  online.state.submissionMessage,
  economy.state.lastReward?.message
].filter(Boolean).join(' '))

onBeforeMount(() => {
  if (!game.lastResult) router.replace({ name: 'home' })
})

onMounted(async () => {
  if (!result.value || result.value.status !== 'completed') return

  economy.clearLastReward()

  if (!account.isAuthenticated.value) {
    economy.awardGuestResult(result.value)
    return
  }

  const response = await online.submitResult(result.value, true)
  if (response) economy.applyServerReward(response)
})

async function retryGame() {
  const mode = result.value.mode
  const difficulty = result.value.difficulty
  const clientRunId = createId()
  online.clearResultStatus()
  const onlineRun = await online.prepareRun({ mode, difficulty, clientRunId }, account.isAuthenticated.value)

  startGame({
    mode,
    difficulty,
    forceNew: true,
    clientRunId,
    onlineRun,
    generatedPuzzle: onlineRun
      ? { puzzle: onlineRun.puzzle, solution: onlineRun.solution }
      : null
  })
  await router.replace({ name: 'game', query: { mode, difficulty } })
}

async function copyResult() {
  const text = buildResultSummary(result.value)

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
    }

    copyLabel.value = 'Copied'
  } catch {
    copyLabel.value = 'Copy failed'
  }

  window.setTimeout(() => {
    copyLabel.value = 'Copy Result'
  }, 1600)
}

async function returnHome() {
  abandonGame({ preserveDaily: false })
  await router.push({ name: 'home' })
}
</script>

<style scoped>
.end-view {
  padding: var(--page-gutter);
}

.end-ceremony {
  display: grid;
  grid-template-columns: minmax(0, 1.22fr) minmax(17rem, 0.78fr);
  grid-template-rows: minmax(0, 1fr) auto;
  gap: clamp(0.6rem, 1.35vw, 0.95rem);
  inline-size: min(96vw, 72rem);
  block-size: min(100%, 48rem);
  min-block-size: 0;
}

.end-outcome,
.end-fact {
  min-block-size: 0;
}

.end-outcome :deep(.washi-panel__content) {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: clamp(0.55rem, 1.2dvh, 0.85rem);
  block-size: 100%;
}

.end-outcome__title {
  margin: 0;
  font-size: clamp(3rem, 8vmin, 6rem);
  line-height: 0.92;
}

.end-outcome__subtitle {
  margin: 0;
  color: var(--color-ink-soft);
  font-family: var(--font-display);
  font-size: clamp(0.82rem, 1.65vmin, 1.08rem);
  font-style: italic;
}

.end-fact :deep(.washi-panel__content) {
  display: grid;
  align-content: center;
  gap: 1rem;
  block-size: 100%;
}

.end-fact__heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.end-fact__heading > span {
  display: grid;
  place-items: center;
  inline-size: 2.7rem;
  block-size: 2.7rem;
  border: 1px solid rgba(127, 60, 81, 0.3);
  border-radius: 50%;
  background: var(--color-sakura-100);
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 900;
}

.end-fact__copy {
  display: grid;
  gap: 0.12rem;
  margin: 0;
  padding: 0.85rem;
  border-inline-start: 3px solid var(--color-sakura-300);
  background: rgba(255, 253, 248, 0.46);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(0.9rem, 1.8vmin, 1.18rem);
  line-height: 1.45;
}

.end-fact__copy span {
  display: block;
}

.end-actions-panel {
  grid-column: 1 / -1;
}

.end-actions-panel :deep(.washi-panel__content) {
  padding: 0.62rem;
}

@media (max-width: 50rem) {
  .end-ceremony {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto auto;
    inline-size: min(96vw, 42rem);
  }

  .end-actions-panel {
    grid-column: 1;
  }

  .end-fact :deep(.washi-panel__content) {
    grid-template-columns: auto 1fr;
    align-items: center;
  }

  .end-fact__copy {
    font-size: 0.82rem;
  }
}

@media (max-width: 33rem) {
  .end-outcome__title {
    font-size: clamp(2.5rem, 13vw, 4rem);
  }

  .end-outcome__subtitle {
    display: none;
  }

  .end-fact__heading > span {
    display: none;
  }

  .end-fact :deep(.washi-panel__content) {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 38rem) {
  .end-ceremony {
    block-size: 100%;
    gap: 0.4rem;
  }

  .end-fact__copy {
    max-block-size: 7rem;
    overflow: hidden;
    font-size: 0.72rem;
  }
}
</style>
