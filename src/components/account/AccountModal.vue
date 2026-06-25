<template>
  <AppModalShell
    :open="account.state.modalOpen"
    size="compact"
    title-id="account-title"
    close-label="Close account panel"
    @close="close"
  >
    <template #header>
      <div class="account-heading">
        <p class="eyebrow">Shared Jivaro Account</p>
        <h2 id="account-title" class="account-heading__title">
          {{ account.isAuthenticated.value ? 'Player Profile' : 'Save Scores & Quanta' }}
        </h2>
        <p v-if="!account.isAuthenticated.value" class="section-copy">
          Sign in with a one-time email code. The same account is used across participating Jivaro games.
        </p>
      </div>
    </template>

    <div class="account-content">
      <WashiPanel v-if="!account.state.configured" tag="div" variant="inset" class="account-notice" role="status">
        <strong>Supabase is not configured.</strong>
        <span>Add the shared Jivaro Games project URL and publishable key to <code>.env.local</code>.</span>
      </WashiPanel>

      <template v-else-if="account.isAuthenticated.value">
        <WashiPanel tag="div" variant="inset" class="account-details">
          <span>Signed in as</span>
          <strong>{{ account.email.value }}</strong>
        </WashiPanel>

        <WashiPanel tag="div" variant="card" class="account-form-panel">
          <form class="account-form" @submit.prevent="saveDisplayName">
            <label for="display-name">Leaderboard display name</label>
            <input
              id="display-name"
              v-model.trim="displayNameInput"
              type="text"
              minlength="3"
              maxlength="24"
              autocomplete="nickname"
              required
            />
            <small>3–24 characters. Your email is never shown publicly.</small>
            <AppButton type="submit" :disabled="account.state.loading">
              {{ account.state.loading ? 'Saving…' : 'Save Display Name' }}
            </AppButton>
          </form>
        </WashiPanel>

        <AppButton variant="quiet" :disabled="account.state.loading" @click="signOut">Sign Out</AppButton>
      </template>

      <template v-else>
        <WashiPanel tag="div" variant="card" class="account-form-panel">
          <form v-if="step === 'email'" class="account-form" @submit.prevent="sendCode">
            <label for="account-email">Email address</label>
            <input
              id="account-email"
              v-model.trim="emailInput"
              type="email"
              autocomplete="email"
              placeholder="player@example.com"
              required
            />
            <small>New email addresses automatically create a shared Jivaro account.</small>
            <AppButton type="submit" :disabled="account.state.loading">
              {{ account.state.loading ? 'Sending…' : 'Email Me a Code' }}
            </AppButton>
          </form>

          <form v-else class="account-form" @submit.prevent="verifyCode">
            <div class="code-sent">
              <span>Code sent to</span>
              <strong>{{ emailInput }}</strong>
            </div>
            <label for="account-code">Sign-in code</label>
            <input
              id="account-code"
              v-model="tokenInput"
              class="otp-input"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              placeholder="Enter the code"
              required
            />
            <AppButton type="submit" :disabled="account.state.loading">
              {{ account.state.loading ? 'Checking…' : 'Sign In' }}
            </AppButton>
            <button class="text-button" type="button" :disabled="account.state.loading" @click="step = 'email'">
              Use a different email
            </button>
          </form>
        </WashiPanel>
      </template>

      <p v-if="account.state.error" class="account-message account-message--error" role="alert">{{ account.state.error }}</p>
      <p v-if="account.state.message" class="account-message account-message--success" role="status">{{ account.state.message }}</p>
    </div>
  </AppModalShell>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import AppButton from '../ui/AppButton.vue'
import AppModalShell from '../ui/AppModalShell.vue'
import WashiPanel from '../ui/WashiPanel.vue'

const account = useOnlineAccount()
const step = ref('email')
const emailInput = ref('')
const tokenInput = ref('')
const displayNameInput = ref('')

watch(
  () => account.state.modalOpen,
  open => {
    if (!open) return
    step.value = account.isAuthenticated.value ? 'account' : 'email'
    tokenInput.value = ''
    displayNameInput.value = account.state.profile?.display_name || ''
  }
)

watch(
  () => account.state.profile?.display_name,
  value => {
    if (value) displayNameInput.value = value
  },
  { immediate: true }
)

function close() {
  account.closeModal()
}

async function sendCode() {
  if (await account.requestOtp(emailInput.value)) step.value = 'code'
}

async function verifyCode() {
  if (await account.verifyOtp(emailInput.value, tokenInput.value)) step.value = 'account'
}

async function saveDisplayName() {
  await account.saveDisplayName(displayNameInput.value)
}

async function signOut() {
  await account.signOut()
  step.value = 'email'
}
</script>

<style scoped>
.account-heading {
  display: grid;
  gap: 0.28rem;
}

.account-heading__title {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 5vw, 2.3rem);
}

.account-content {
  display: grid;
  gap: 0.8rem;
}

.account-notice :deep(.washi-panel__content),
.account-details :deep(.washi-panel__content) {
  display: grid;
  gap: 0.22rem;
  padding: 0.75rem;
}

.account-notice strong,
.account-details span,
.account-form label,
.code-sent span {
  color: var(--color-sakura-700);
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.account-notice span,
.account-form small {
  color: var(--color-ink-muted);
  font-size: 0.76rem;
  line-height: 1.4;
}

.account-details strong {
  overflow-wrap: anywhere;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1rem;
}

.account-form-panel :deep(.washi-panel__content) {
  padding: 0.85rem;
}

.account-form {
  display: grid;
  gap: 0.55rem;
}

.account-form input {
  inline-size: 100%;
  min-block-size: 2.85rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--paper-border-strong);
  border-radius: var(--radius-small);
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-ink);
  box-shadow: inset 0 1px 3px rgba(49, 37, 43, 0.08);
}

.account-form input:focus-visible {
  box-shadow: var(--focus-ring);
}

.otp-input {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-align: center;
}

.code-sent {
  display: grid;
  gap: 0.15rem;
  padding: 0.55rem;
  border-inline-start: 3px solid var(--color-sakura-300);
  background: rgba(255, 253, 248, 0.6);
}

.text-button {
  border: 0;
  background: transparent;
  color: var(--color-sakura-700);
  font-weight: 800;
  cursor: pointer;
}

.account-message {
  margin: 0;
  padding: 0.55rem;
  border-radius: var(--radius-small);
  font-size: 0.78rem;
  font-weight: 800;
  text-align: center;
}

.account-message--error {
  background: rgba(255, 222, 230, 0.76);
  color: var(--color-danger);
}

.account-message--success {
  background: rgba(222, 241, 231, 0.76);
  color: var(--color-success);
}
</style>
