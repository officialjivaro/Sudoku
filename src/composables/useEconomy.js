import { computed, readonly, reactive } from 'vue'
import {
  getSudokuQuantaReward,
  getUtcDateKey,
  isRewardEligible,
  NON_DAILY_REWARD_CAP
} from '../constants/economy.js'
import { fetchQuantaWallet } from '../services/quantaService.js'

const GUEST_STORAGE_KEY = 'sudoku-guest-quanta-v1'

function emptyGuestData() {
  return {
    balance: 0,
    rewardedEvents: [],
    nonDailyRewards: {},
    dailyRewards: {}
  }
}

function readGuestData() {
  try {
    const raw = window.sessionStorage.getItem(GUEST_STORAGE_KEY)
    if (!raw) return emptyGuestData()
    const value = JSON.parse(raw)
    return value && typeof value === 'object' ? { ...emptyGuestData(), ...value } : emptyGuestData()
  } catch {
    return emptyGuestData()
  }
}

function writeGuestData(value) {
  try {
    window.sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(value))
  } catch {
    return
  }
}

const state = reactive({
  loading: false,
  error: '',
  userId: null,
  wallet: null,
  guest: typeof window !== 'undefined' ? readGuestData() : emptyGuestData(),
  lastReward: null
})

async function handleAccount(user) {
  state.userId = user?.id || null
  state.error = ''
  state.lastReward = null

  if (!state.userId) {
    state.wallet = null
    state.guest = readGuestData()
    return
  }

  state.loading = true

  try {
    state.wallet = await fetchQuantaWallet(state.userId)
  } catch (error) {
    state.wallet = null
    state.error = error.message || 'Unable to load the Quanta wallet.'
  } finally {
    state.loading = false
  }
}

async function refreshWallet() {
  if (!state.userId) return null
  state.wallet = await fetchQuantaWallet(state.userId)
  return state.wallet
}

function applyServerReward(result) {
  const newBalance = Math.max(0, Number(result?.newBalance ?? result?.new_balance) || 0)
  const amount = Math.max(0, Number(result?.quantaAwarded ?? result?.quanta_awarded) || 0)

  if (state.wallet) {
    state.wallet = { ...state.wallet, balance: newBalance }
  }

  state.lastReward = {
    amount,
    status: result?.rewardStatus || result?.reward_status || 'not_rewarded',
    message: result?.rewardMessage || result?.reward_message || ''
  }

  return state.lastReward
}

function awardGuestResult(result) {
  if (!isRewardEligible(result)) {
    return { amount: 0, status: 'not_cleared', message: 'Complete the puzzle to earn temporary Quanta.' }
  }

  const eventId = String(result.clientRunId || result.id || '')
  const dateKey = getUtcDateKey(new Date(result.completedAt || Date.now()))
  const guest = readGuestData()

  if (eventId && guest.rewardedEvents.includes(eventId)) {
    return { amount: 0, status: 'duplicate', message: 'This guest run was already rewarded.' }
  }

  if (result.mode === 'daily' && guest.dailyRewards[dateKey]) {
    return { amount: 0, status: 'daily_already_paid', message: 'Today’s guest Daily reward was already claimed.' }
  }

  if (result.mode !== 'daily' && Number(guest.nonDailyRewards[dateKey] || 0) >= NON_DAILY_REWARD_CAP) {
    return { amount: 0, status: 'daily_cap_reached', message: 'The guest reward limit has been reached for today.' }
  }

  const amount = getSudokuQuantaReward(result.mode, result.difficulty)

  if (amount <= 0) {
    return { amount: 0, status: 'not_rewarded', message: 'This mode does not award Quanta.' }
  }

  guest.balance += amount
  if (eventId) guest.rewardedEvents.push(eventId)

  if (result.mode === 'daily') {
    guest.dailyRewards[dateKey] = true
  } else {
    guest.nonDailyRewards[dateKey] = Number(guest.nonDailyRewards[dateKey] || 0) + 1
  }

  guest.rewardedEvents = guest.rewardedEvents.slice(-100)
  writeGuestData(guest)
  state.guest = guest
  state.lastReward = {
    amount,
    status: 'guest_rewarded',
    message: `Guest reward: +${amount} temporary Quanta for this tab.`
  }

  return state.lastReward
}

function applyPurchaseResult(result) {
  const newBalance = Math.max(0, Number(result?.newBalance ?? result?.new_balance) || 0)

  if (state.wallet) {
    state.wallet = { ...state.wallet, balance: newBalance }
  }

  return state.wallet
}

function clearLastReward() {
  state.lastReward = null
}

export function useEconomy() {
  return {
    state: readonly(state),
    balance: computed(() => state.userId ? Number(state.wallet?.balance || 0) : Number(state.guest.balance || 0)),
    walletLabel: computed(() => state.userId ? 'Quanta' : 'Guest Q'),
    isGuest: computed(() => !state.userId),
    handleAccount,
    refreshWallet,
    applyServerReward,
    awardGuestResult,
    applyPurchaseResult,
    clearLastReward
  }
}
