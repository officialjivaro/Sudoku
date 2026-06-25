<template>
  <header class="app-header">
    <a class="app-header__games" href="https://jivaro.net/games" target="_top">
      <span class="utility-icon" aria-hidden="true">↗</span>
      <span class="utility-label">Games</span>
    </a>

    <div class="app-header__brand" aria-label="Sudoku">
      <span class="app-header__brand-mark" aria-hidden="true">数</span>
      <div>
        <span class="app-header__brand-kicker">Jivaro Games</span>
        <p class="app-header__title">Sudoku</p>
      </div>
    </div>

    <nav class="app-header__actions" aria-label="Player services">
      <button type="button" class="header-action" aria-label="Open rankings" @click="openRanks">
        <span class="utility-icon" aria-hidden="true">冠</span>
        <span class="utility-label">Ranks</span>
      </button>

      <button type="button" class="header-action" aria-label="Open Sakura Market" @click="store.open">
        <span class="utility-icon" aria-hidden="true">店</span>
        <span class="utility-label">Market</span>
      </button>

      <button
        type="button"
        class="header-action header-action--wallet"
        :aria-label="`${economy.walletLabel.value}: ${economy.balance.value.toLocaleString()} Quanta. Open store.`"
        @click="store.open"
      >
        <QuantaCoin />
        <span class="utility-label">{{ economy.walletLabel.value }}</span>
        <strong>{{ economy.balance.value.toLocaleString() }}</strong>
      </button>

      <button type="button" class="header-action header-action--profile" @click="account.openModal">
        <span class="profile-initial" aria-hidden="true">{{ profileInitial }}</span>
        <span class="utility-label">{{ account.isAuthenticated.value ? account.displayName.value : 'Sign In' }}</span>
      </button>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useEconomy } from '../../composables/useEconomy.js'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import { useSudokuLeaderboard } from '../../composables/useSudokuLeaderboard.js'
import { useSudokuStore } from '../../composables/useSudokuStore.js'
import QuantaCoin from '../common/QuantaCoin.vue'

const account = useOnlineAccount()
const economy = useEconomy()
const leaderboard = useSudokuLeaderboard()
const store = useSudokuStore()

const profileInitial = computed(() => {
  if (!account.isAuthenticated.value) return '○'
  return String(account.displayName.value || 'P').trim().slice(0, 1).toUpperCase()
})

async function openRanks() {
  await leaderboard.open({ mode: 'classic', difficulty: 'easy' })
}
</script>

<style scoped>
.app-header {
  position: relative;
  z-index: var(--z-header);
  display: grid;
  grid-template-columns: minmax(7rem, 1fr) auto minmax(18rem, 1fr);
  align-items: center;
  inline-size: 100%;
  block-size: var(--app-header-size);
  padding-inline: clamp(0.45rem, 1.3vw, 1rem);
  border-block-end: 1px solid rgba(255, 255, 255, 0.12);
  background:
    repeating-linear-gradient(8deg, rgba(255, 255, 255, 0.018) 0 1px, transparent 1px 5px),
    linear-gradient(180deg, rgba(42, 35, 39, 0.97), rgba(30, 26, 28, 0.95));
  box-shadow: 0 0.45rem 1.2rem rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(9px);
}

.app-header::after {
  position: absolute;
  inset-block-end: -1px;
  inset-inline: 14%;
  block-size: 2px;
  background: linear-gradient(90deg, transparent, var(--color-sakura-300), transparent);
  content: '';
}

.app-header__games,
.header-action {
  min-block-size: 2.35rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  cursor: pointer;
  font-size: clamp(0.65rem, 1.25vmin, 0.82rem);
  font-weight: 820;
  text-decoration: none;
  transition: background var(--motion-fast) ease, border-color var(--motion-fast) ease, transform var(--motion-fast) ease;
}

.app-header__games {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding-inline: 0.75rem;
}

.app-header__brand {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  color: #fff;
}

.app-header__brand-mark {
  display: grid;
  place-items: center;
  inline-size: clamp(2rem, 4dvh, 2.65rem);
  block-size: clamp(2rem, 4dvh, 2.65rem);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  background: linear-gradient(145deg, var(--color-sakura-100), var(--color-sakura-300));
  color: #4a2230;
  box-shadow: 0 0.2rem 0 var(--color-sakura-700);
  font-family: var(--font-display);
  font-weight: 900;
}

.app-header__brand-kicker {
  display: block;
  color: rgba(255, 255, 255, 0.58);
  font-size: clamp(0.48rem, 0.9vmin, 0.6rem);
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.app-header__title {
  margin: 0;
  color: #fff;
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2.7vmin, 1.9rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 1;
  text-shadow: 0 0 0.55rem rgba(231, 157, 175, 0.48);
}

.app-header__actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: clamp(0.22rem, 0.55vw, 0.45rem);
  min-inline-size: 0;
}

.header-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.32rem;
  padding: 0.32rem clamp(0.45rem, 0.9vw, 0.68rem);
}

.app-header__games:hover,
.header-action:hover {
  border-color: rgba(242, 189, 202, 0.46);
  background: rgba(242, 189, 202, 0.15);
  transform: translateY(-0.06rem);
}

.utility-icon {
  display: inline-grid;
  place-items: center;
  min-inline-size: 1rem;
  font-family: var(--font-display);
  font-size: 0.9rem;
}

.header-action--wallet {
  border-color: rgba(248, 223, 157, 0.26);
}

.header-action--wallet strong {
  color: #ffe8a8;
  font-size: 0.9rem;
}

.profile-initial {
  display: grid;
  place-items: center;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: rgba(251, 221, 229, 0.2);
  font-size: 0.72rem;
}

.app-header__games:focus-visible,
.header-action:focus-visible {
  box-shadow: var(--focus-ring);
}

@media (max-width: 58rem) {
  .app-header {
    grid-template-columns: auto 1fr auto;
  }

  .utility-label {
    display: none;
  }

  .app-header__brand {
    justify-self: center;
  }
}

@media (max-width: 34rem) {
  .app-header__brand-kicker,
  .app-header__brand-mark {
    display: none;
  }

  .app-header__title {
    font-size: 1.15rem;
  }

  .header-action {
    padding-inline: 0.42rem;
  }

  .app-header__games {
    padding-inline: 0.55rem;
  }
}

@media (max-width: 25rem) {
  .app-header__title {
    display: none;
  }

  .app-header {
    grid-template-columns: auto 1fr;
  }

  .app-header__actions {
    grid-column: 2;
  }
}
</style>
