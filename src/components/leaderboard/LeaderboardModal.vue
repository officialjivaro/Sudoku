<template>
  <AppModalShell
    :open="leaderboard.state.open"
    size="wide"
    title-id="leaderboard-title"
    close-label="Close rankings"
    @close="close"
  >
    <template #header>
      <div class="leaderboard-heading">
        <p class="eyebrow">Verified online rankings</p>
        <h2 id="leaderboard-title" class="leaderboard-heading__title">Sudoku Champions</h2>
        <p class="section-copy">Each board lists verified signed-in results. Zen Mode remains unranked.</p>
      </div>
    </template>

    <div class="leaderboard-content">
      <div class="leaderboard-controls">
        <div class="tab-row" role="tablist" aria-label="Ranked game mode">
          <button
            v-for="mode in modes"
            :key="mode.id"
            type="button"
            role="tab"
            :aria-selected="leaderboard.state.mode === mode.id"
            :class="['tab-button', { 'tab-button--active': leaderboard.state.mode === mode.id }]"
            @click="selectMode(mode.id)"
          >
            {{ mode.label }}
          </button>
        </div>

        <div v-if="leaderboard.state.mode !== 'daily'" class="tab-row" role="tablist" aria-label="Difficulty">
          <button
            v-for="difficulty in difficulties"
            :key="difficulty.key"
            type="button"
            role="tab"
            :aria-selected="leaderboard.state.difficulty === difficulty.key"
            :class="['tab-button', { 'tab-button--active': leaderboard.state.difficulty === difficulty.key }]"
            @click="selectDifficulty(difficulty.key)"
          >
            {{ difficulty.label }}
          </button>
        </div>

        <StatusChip v-else tone="sakura">UTC challenge · {{ leaderboard.state.dailyDate }}</StatusChip>
      </div>

      <div v-if="!online.isConfigured.value" class="leaderboard-state">
        Online rankings are unavailable until the shared Supabase project is configured.
      </div>
      <div v-else-if="leaderboard.state.loading" class="leaderboard-state">Loading rankings…</div>
      <div v-else-if="leaderboard.state.error" class="leaderboard-state leaderboard-state--error" role="alert">
        <span>{{ leaderboard.state.error }}</span>
        <AppButton size="small" @click="reload">Try Again</AppButton>
      </div>
      <div v-else-if="!leaderboard.state.entries.length" class="leaderboard-state">
        No verified scores yet. The first row is feeling very available.
      </div>

      <template v-else>
        <LeaderboardPodium :entries="podiumEntries" />
        <div class="leaderboard-table-wrap internal-scroll">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Player</th>
                <th scope="col">{{ scoreHeading }}</th>
                <th scope="col">Mistakes</th>
                <th scope="col">Hints</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in leaderboard.state.entries"
                :key="`${entry.leaderboard_rank}-${entry.display_name}-${entry.created_at}`"
                :class="{ 'leaderboard-row--current': entry.is_current_user }"
              >
                <td class="rank-cell">#{{ entry.leaderboard_rank }}</td>
                <td>{{ entry.display_name }}</td>
                <td class="score-cell">{{ formatScore(entry) }}</td>
                <td>{{ entry.mistakes }}</td>
                <td>{{ entry.hints_used }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </AppModalShell>
</template>

<script setup>
import { computed } from 'vue'
import { DIFFICULTY_OPTIONS } from '../../constants/difficulties.js'
import { useSudokuLeaderboard } from '../../composables/useSudokuLeaderboard.js'
import { useSudokuOnline } from '../../composables/useSudokuOnline.js'
import { formatTime } from '../../utils/formatTime.js'
import AppButton from '../ui/AppButton.vue'
import AppModalShell from '../ui/AppModalShell.vue'
import StatusChip from '../ui/StatusChip.vue'
import LeaderboardPodium from './LeaderboardPodium.vue'

const leaderboard = useSudokuLeaderboard()
const online = useSudokuOnline()
const difficulties = DIFFICULTY_OPTIONS
const modes = Object.freeze([
  { id: 'classic', label: 'Classic' },
  { id: 'daily', label: 'Daily' },
  { id: 'sprint', label: 'Sprint' }
])

const scoreHeading = computed(() => leaderboard.state.mode === 'sprint' ? 'Time Left' : 'Time')
const podiumEntries = computed(() => leaderboard.state.entries.slice(0, 3).map(entry => ({
  rank: Number(entry.leaderboard_rank),
  displayName: entry.display_name,
  score: formatScore(entry),
  current: Boolean(entry.is_current_user)
})))

function close() {
  leaderboard.close()
}

async function selectMode(mode) {
  await leaderboard.load({ mode, difficulty: mode === 'daily' ? 'medium' : leaderboard.state.difficulty })
}

async function selectDifficulty(difficulty) {
  await leaderboard.load({ difficulty })
}

async function reload() {
  await leaderboard.load()
}

function formatScore(entry) {
  const seconds = leaderboard.state.mode === 'sprint'
    ? Number(entry.time_remaining_seconds || 0)
    : Number(entry.elapsed_seconds || 0)
  return formatTime(seconds)
}
</script>

<style scoped>
.leaderboard-heading {
  display: grid;
  gap: 0.25rem;
}

.leaderboard-heading__title {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.leaderboard-content {
  display: grid;
  gap: 0.75rem;
  min-block-size: 0;
}

.leaderboard-controls {
  display: grid;
  justify-items: center;
  gap: 0.4rem;
}

.tab-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.32rem;
}

.tab-button {
  min-block-size: 2.25rem;
  padding: 0.38rem 0.78rem;
  border: 1px solid rgba(75, 59, 67, 0.18);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.7);
  color: var(--color-ink-muted);
  font-size: 0.75rem;
  font-weight: 850;
  cursor: pointer;
}

.tab-button--active {
  border-color: var(--color-sakura-500);
  background: linear-gradient(145deg, var(--color-sakura-100), var(--color-sakura-300));
  color: #542334;
  box-shadow: 0 0.18rem 0 var(--color-sakura-700);
}

.tab-button:focus-visible {
  box-shadow: var(--focus-ring);
}

.leaderboard-state {
  min-block-size: 12rem;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.65rem;
  padding: 1rem;
  color: var(--color-ink-muted);
  text-align: center;
}

.leaderboard-state--error {
  color: var(--color-danger);
}

.leaderboard-table-wrap {
  min-block-size: 0;
  max-block-size: min(42dvh, 24rem);
  overflow: auto;
  border: 1px solid rgba(75, 59, 67, 0.18);
  border-radius: var(--radius-medium);
  background: rgba(255, 253, 248, 0.68);
}

.leaderboard-table {
  inline-size: 100%;
  border-collapse: collapse;
  font-size: clamp(0.68rem, 1.4vw, 0.9rem);
}

.leaderboard-table th,
.leaderboard-table td {
  padding: 0.55rem 0.62rem;
  border-block-end: 1px solid rgba(127, 60, 81, 0.12);
  text-align: start;
  white-space: nowrap;
}

.leaderboard-table th {
  position: sticky;
  z-index: 1;
  inset-block-start: 0;
  background: rgba(250, 236, 239, 0.98);
  color: var(--color-sakura-700);
  font-size: 0.68em;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.leaderboard-row--current {
  background: rgba(251, 221, 229, 0.72);
  font-weight: 850;
}

.rank-cell,
.score-cell {
  color: var(--color-sakura-700);
  font-family: var(--font-display);
  font-weight: 900;
}

@media (max-height: 42rem) {
  .leaderboard-table-wrap {
    max-block-size: 30dvh;
  }
}
</style>
