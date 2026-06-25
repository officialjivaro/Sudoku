<template>
  <section class="online-result" aria-label="Online result and Quanta reward">
    <div class="online-result__wallet">
      <QuantaCoin size="medium" />
      <div>
        <span>{{ economy.walletLabel.value }}</span>
        <strong>{{ economy.balance.value.toLocaleString() }}</strong>
      </div>
    </div>

    <div class="online-result__copy">
      <StatusChip :tone="statusTone">{{ statusLabel }}</StatusChip>
      <p v-if="submitting">Verifying the result and checking Quanta rewards…</p>
      <p v-else-if="error" class="online-result__error">{{ error }}</p>
      <p v-else-if="message">{{ message }}</p>
      <p v-else-if="!authenticated">Guest results stay local. Sign in before the next game to join rankings.</p>
      <p v-else>Online verification is ready for the next ranked result.</p>
      <strong v-if="rewardAmount > 0" class="online-result__reward">+{{ rewardAmount }} Quanta</strong>
    </div>

    <AppButton v-if="!authenticated" size="small" @click="account.openModal">Sign In</AppButton>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useEconomy } from '../../composables/useEconomy.js'
import { useOnlineAccount } from '../../composables/useOnlineAccount.js'
import AppButton from '../ui/AppButton.vue'
import StatusChip from '../ui/StatusChip.vue'
import QuantaCoin from '../common/QuantaCoin.vue'

const props = defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  }
})

const account = useOnlineAccount()
const economy = useEconomy()
const authenticated = computed(() => account.isAuthenticated.value)
const rewardAmount = computed(() => Number(economy.state.lastReward?.amount || 0))
const statusTone = computed(() => props.error ? 'danger' : props.submitting ? 'gold' : rewardAmount.value > 0 ? 'success' : 'paper')
const statusLabel = computed(() => props.error ? 'Save failed' : props.submitting ? 'Verifying' : rewardAmount.value > 0 ? 'Reward granted' : authenticated.value ? 'Online result' : 'Guest result')
</script>

<style scoped>
.online-result {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  inline-size: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(197, 146, 54, 0.25);
  border-radius: var(--radius-medium);
  background:
    repeating-linear-gradient(8deg, rgba(91, 65, 19, 0.014) 0 1px, transparent 1px 5px),
    rgba(255, 249, 226, 0.72);
}

.online-result__wallet {
  display: flex;
  align-items: center;
  gap: 0.48rem;
}

.online-result__wallet span,
.online-result__wallet strong {
  display: block;
}

.online-result__wallet span {
  color: #805416;
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.online-result__wallet strong {
  color: #5f3b07;
  font-family: var(--font-display);
  font-size: 1.08rem;
}

.online-result__copy {
  display: grid;
  justify-items: start;
  gap: 0.28rem;
  min-inline-size: 0;
}

.online-result__copy p {
  margin: 0;
  color: rgba(75, 52, 22, 0.82);
  font-size: 0.72rem;
  font-weight: 720;
  line-height: 1.35;
}

.online-result__error {
  color: var(--color-danger) !important;
}

.online-result__reward {
  color: #916016;
  font-family: var(--font-display);
  font-size: 0.9rem;
}

@media (max-width: 36rem) {
  .online-result {
    grid-template-columns: auto 1fr;
  }

  .online-result > :last-child {
    grid-column: 1 / -1;
    justify-self: center;
  }
}
</style>
